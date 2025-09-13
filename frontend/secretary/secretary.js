const userButton = document.getElementById("userButton");
const userDropdown = document.getElementById("userDropdown");
const topicsList = document.getElementById("topicsList");
const createForm = document.getElementById("createTopic");
const createMsg = document.getElementById("createMsg");
const assignForm = document.getElementById("assignForm");

if (userButton && userDropdown) {
  userButton.addEventListener("click", () => {
    userDropdown.classList.toggle("hidden");
  });

  // Κλείσιμο dropdown όταν κάνεις κλικ έξω
  document.addEventListener("click", (event) => {
    if (!userButton.contains(event.target) && !userDropdown.contains(event.target)) {
      userDropdown.classList.add("hidden");
    }
  });
}
async function loadUserData() {
  try {
    const response = await fetch('http://localhost:3000/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`, // JWT token
      },
    });

    if (response.ok) {
      const data = await response.json();
      const user = data.user;
      document.getElementById('name').textContent = user.name || '—';
      document.getElementById('username').textContent = user.username || '—';
      document.getElementById('email').textContent = user.email || '—';
      document.getElementById('department').textContent = user.department || '—';
    } else {
      console.error('Failed to fetch user data:', response.statusText);
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
  }
}
document.addEventListener('DOMContentLoaded', () => {
 loadUserData();
});

// Αποσύνδεση χρήστη
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../index.html"; // Ανακατεύθυνση στη σελίδα σύνδεσης
  });
}

async function loadActiveTheses() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3000/theses", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.error("Failed:", res.statusText);
    return;
  }

  const theses = await res.json();
  const container = document.getElementById("thesis-list");
  container.innerHTML = "<h2>Διπλωματικές</h2>";

  theses.forEach(t => {
    const div = document.createElement("div");
    div.classList.add("thesis-card");
    let managePage = "";
    let manageButton = "";

    if (t.status === "active") {
     managePage = `manage-active.html?id=${t._id}`;
     manageButton = `<button class="buttons" onclick="location.href='${managePage}'">Διαχείριση</button>`;
    } else if (t.status === "under_review") {
      managePage = `manage-under_review.html?id=${t._id}`;
      manageButton =`<button class="buttons" onclick="completeThesis('${t._id}')">Ολοκλήρωση</button>`;
    }

    div.innerHTML = `
      <h3>${t.title}</h3>
      <p><b>Περιγραφή:</b> ${t.description ?? "—"}</p>
      <p><b>Κατάσταση:</b> ${t.status}</p>
      <p><b>Φοιτητής:</b> ${t.student?.name ?? "—"} ${t.student?.surname ?? ""}</p>
      <p><b>Ημέρες από ανάθεση:</b> ${t.daysSinceAssignment ?? "—"}</p>
      ${manageButton}
      <button class="buttons" onclick="location.href='details.html?id=${t._id}'">Λεπτομέρειες</button>
    `;
    container.appendChild(div);
  });
}
function uploadJSON() {
  const form = document.getElementById("uploadForm");
  const fileInput = document.getElementById("jsonFile");
  console.log("form:", document.getElementById("uploadform"));



  if (!form || !fileInput) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const file = fileInput.files[0];
    if (!file) {
      alert("Διάλεξε ένα αρχείο JSON!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch("http://localhost:3000/import/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Αποτυχία εισαγωγής JSON");
      }

      const data = await res.json();
      alert("Επιτυχία: " + data.message);

      // ανανέωση λίστας διπλωματικών αν υπάρχει συνάρτηση
      if (typeof loadActiveTheses === "function") {
        loadActiveTheses();
      }
    } catch (err) {
      alert("Σφάλμα: " + err.message);
    }
  });
}

function fieldRow(label, value) {
  return `<div class="field-row"><b>${label}:</b> <span>${value ?? "—"}</span></div>`;
}

async function loadThesisDetails() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("id");

  if (!thesisId) {
    document.getElementById("thesisDetails").innerHTML = "<p>Δεν βρέθηκαν δεδομένα.</p>";
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/theses/professor/${thesisId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Σφάλμα: ${response.status}`);

    const thesis = await response.json();
    const container = document.getElementById("thesisDetails");

    let daysSinceAssignment = null;
    if (thesis.assignmentDate) {
      const diff = Date.now() - new Date(thesis.assignmentDate).getTime();
      daysSinceAssignment = Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    container.innerHTML = `
      <h2>Tίτλος:  ${thesis.title}</h2>
      ${fieldRow("Περιγραφή", thesis.description)}
      ${fieldRow("Κατάσταση", thesis.status)}
      ${fieldRow("Ημέρες από την Ανάθεση", thesis.daysSinceAssignment !== null ? `${thesis.daysSinceAssignment} ημέρες` : null)}


      <h3>Φοιτητής</h3>
      ${fieldRow("Όνομα", thesis.student?.name)}
      ${fieldRow("Επώνυμο", thesis.student?.surname)}
      ${fieldRow("ΑΜ", thesis.student?.student_number)}
      ${fieldRow("Email", thesis.student?.email)}

      <h3>Επιβλέπων</h3>
      ${fieldRow("Όνομα", thesis.supervisor?.name)}
      ${fieldRow("Επώνυμο", thesis.supervisor?.surname)}
      ${fieldRow("Email", thesis.supervisor?.email)}

      <h3>Τριμελής Επιτροπή</h3>
      ${thesis.committee.length > 0
        ? thesis.committee.map(c => `
            <div class="committee-member">
              ${fieldRow("Όνομα", c.name)}
              ${fieldRow("Επώνυμο", c.surname)}
              ${fieldRow("Email", c.email)}
              ${fieldRow("Κατάσταση", c.status)}
            </div>
          `).join("")
        : fieldRow("Επιτροπή", null)}

      <h3>Αποφάσεις ΓΣ</h6>  
      <div class="committee-member">  
      <h4>Αποφάση Έγκρισης Θέματος από ΓΣ</h4>
      ${fieldRow("Αριθμός Πράξης", thesis.ap_number)}
      ${fieldRow("Έτος Πράξης", thesis.ap_year)}
      </div>

      <div class="committee-member">
      <h4>Απόφαση Ακύρωσης απο ΓΣ</h4>
      ${fieldRow("Αιτία Ακύρωσης", thesis.cancel_reason)}
      ${fieldRow("Αριθμός Πράξης Ακύρωσης", thesis.cancel_ap_number)}
      ${fieldRow("Έτος Πράξης Ακύρωσης", thesis.cancel_year)}
      </div>
      
       
      
    `;
  } catch (err) {
    console.error("Αποτυχία φόρτωσης διπλωματικής:", err);
    document.getElementById("thesisDetails").innerHTML = "<p>Σφάλμα κατά τη φόρτωση λεπτομερειών.</p>";
  }
}

async function activateThesis() {
  const urlParams = new URLSearchParams(window.location.search);
  const thesisId = urlParams.get("id");
  if (!thesisId) return;

  const form = document.getElementById("apForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const ap_number = document.getElementById("gsNumber").value.trim();
    const ap_year = document.getElementById("gsYear").value.trim();

    if (!ap_number || !ap_year) {
      alert("Συμπλήρωσε όλα τα πεδία!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Δεν υπάρχει token. Κάνε login ξανά.");

      const res = await fetch(`http://localhost:3000/theses/${thesisId}/activate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ ap_number, ap_year })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Σφάλμα ενεργοποίησης");

      alert("✅ Διπλωματική ενεργοποιήθηκε!");
    } catch (err) {
      alert(`❌ Σφάλμα: ${err.message}`);
    }
  });
}

async function cancelThesis() {
  const urlParams = new URLSearchParams(window.location.search);
  const thesisId = urlParams.get("id");
  if (!thesisId) return;

  const form = document.getElementById("cancelForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cancel_ap_number = Number(document.getElementById("cancelNumber").value.trim());
    const cancel_year = Number(document.getElementById("cancelYear").value.trim());

    if (!cancel_ap_number || !cancel_year) {
      alert("Συμπλήρωσε όλα τα πεδία!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Δεν υπάρχει token. Κάνε login ξανά.");

      const res = await fetch(`http://localhost:3000/theses/${thesisId}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ cancel_ap_number, cancel_year })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Σφάλμα ακύρωσης");

      alert(" Διπλωματική ακυρώθηκε!");
    } catch (err) {
      alert(` Σφάλμα: ${err.message}`);
    }
  });
}
 window.completeThesis=async function (id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:3000/theses/${id}/complete`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      let errorMessage = "Αποτυχία ολοκλήρωσης";
      try {
        const data = await res.json();
        errorMessage = data.error || data.message || JSON.stringify(data);
      } catch {
        errorMessage = await res.text();
      }
      throw new Error(errorMessage);
    }

    alert("Η διπλωματική ολοκληρώθηκε!");
    loadActiveTheses(); // ανανέωση λίστας
  } catch (err) {
    console.error("Σφάλμα API:", err);
    alert("" + err.message);
  }
}
// τρέχει όταν φορτώσει η σελίδα
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadActiveTheses();
    uploadJSON();
    loadThesisDetails();
    cancelThesis();
    activateThesis();
});