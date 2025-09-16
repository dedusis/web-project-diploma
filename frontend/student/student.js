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
//αυτη ειναι για το user dropdown
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

async function loadProfile() {
  const res = await fetch("http://localhost:3000/auth/me", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  if (!res.ok) {
    console.error("Σφάλμα φόρτωσης προφίλ");
    return;
  }

  const { user } = await res.json();

  document.getElementById("street").value = user.street || "";
  document.getElementById("form-email").value = user.email || "";
  document.getElementById("form-phonenumber").value = user.mobile_telephone || "";
  document.getElementById("form-landline").value = user.landline_telephone || "";
}

document.addEventListener("DOMContentLoaded", loadProfile);


async function updateProfile() {
  const body = {
    street: document.getElementById("street").value,
    email: document.getElementById("form-email").value,
    mobile_telephone: document.getElementById("form-phonenumber").value,
    landline_telephone: document.getElementById("form-landline").value,
    // αν έχεις και password αλλαγή, βάλε και αυτό εδώ
  };

  try {
    const res = await fetch("http://localhost:3000/student/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(body)
    });

    

    if (!res.ok) {
       let errorMsg = "Σφάλμα ενημέρωσης";
      try {
        const errData = await res.json();
        errorMsg = errData.error || errorMsg;
      } catch {}
      alert("❌ " + errorMsg);
      return;
    }

    const data = await res.json();
    alert("✅ " + (data.message || "Το προφίλ ενημερώθηκε"));
    console.log("Updated profile:", data.student);
    location.reload();
  } catch (err) {
    console.error("Σφάλμα API:", err);
    alert("❌ Πρόβλημα με τον server");
  }
}
window.updateProfile = updateProfile

// Αποσύνδεση χρήστη
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../index.html"; // Ανακατεύθυνση στη σελίδα σύνδεσης
  });
}

async function loadThesisDetails() {
    const fieldRow = (label, value) => `
    <div class="field-row">
      <span class="field-label">${label}:</span>
      <span class="field-value">${value !== null && value !== undefined ? value : '—'}</span>
    </div>
  `;
  try {
    const response = await fetch(`http://localhost:3000/theses/student/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });

   if (!response.ok) {
    let message = "Σφάλμα API";
    try {
     const data = await response.json();
     message = data.error || data.message || "Άγνωστο σφάλμα";
    } catch {
        // fallback αν δεν είναι JSON
        message = await response.text();
    }
    throw new Error(message);
}
    const thesis = await response.json();
    const container = document.getElementById("thesisDetails");
    const manageBtn = document.getElementById("manageBtn");
    const statusPages = {
      pending: "pending.html",
      under_review: "under-review.html",
      completed: "completed.html"
    };

    
    container.innerHTML = `
      <h2>Tίτλος:  ${thesis.title}</h2>
      ${fieldRow("Περιγραφή", thesis.description)}
      ${fieldRow("Κατάσταση", thesis.status)}
      ${fieldRow("Συνημμένο Αρχείο",thesis.attachment ?`<a href="${thesis.attachment}" download target="_blank">Λήψη αρχείου</a>` 
    : "Δεν υπάρχει")}
      ${fieldRow("Ημέρες από την Ανάθεση", thesis.daysSinceAssignment !== null ? `${thesis.daysSinceAssignment} ημέρες` : null)}


      <h3>Φοιτητής</h3>
      ${fieldRow("Όνομα", thesis.student?.name)}
      ${fieldRow("Επώνυμο", thesis.student?.surname)}
      ${fieldRow("ΑΜ", thesis.student?.student_number)}
      ${fieldRow("Email", thesis.student?.email)}

      <h3>Επιβλέπων</h3>
      ${fieldRow("Όνομα", thesis.professor?.name)}
      ${fieldRow("Επώνυμο", thesis.professor?.surname)}
      ${fieldRow("Email", thesis.professor?.email)}

      <h3>Τριμελής Επιτροπή</h3>
      ${thesis.committee.length > 0
        ? thesis.committee.map(c => `
            <div class="committee-member">
              ${fieldRow("Όνομα", c.professor?.name)}
              ${fieldRow("Επώνυμο", c.professor.surname)}
              ${fieldRow("Email", c.professor.email)}
              ${fieldRow("Κατάσταση", c.status)}
            </div>
          `).join("")
        : fieldRow("Επιτροπή", null)}
    `;
     if (statusPages[thesis.status]) {
      const btn = document.createElement("button");
      btn.textContent = "Διαχείριση Διπλωματικής";
      btn.className = "manage-button";
      btn.onclick = () =>
        location.href = `${statusPages[thesis.status]}?id=${thesis._id}`;

      container.appendChild(btn);
    }
    
  }catch (err) {
         console.error("Αποτυχία φόρτωσης διπλωματικής:", err);
        document.getElementById("thesisDetails").innerHTML =
        `<p>Σφάλμα: ${err.message}</p>`;
    }

}

export async function inviteProfessors() {
  const input = document.getElementById("emailsInput").value;
  const emails = input.split(",").map(e => e.trim()).filter(Boolean);

  if (emails.length === 0) {
    document.getElementById("inviteMessage").textContent = "Δώσε τουλάχιστον ένα email.";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/theses/me/invite", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ emails })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Σφάλμα αποστολής προσκλήσεων");
    }

    const data = await response.json();
    document.getElementById("inviteMessage").textContent = data.message;
  } catch (err) {
    document.getElementById("inviteMessage").textContent = "Σφάλμα: " + err.message;
  }
}
window.inviteProfessors = inviteProfessors;

export async function uploadDraft() {
  const fileInput = document.getElementById("draftUpload");
  const extraLinks = document.getElementById("extraLinks").value;

  const formData = new FormData();
  if (fileInput.files[0]) {
    formData.append("draftFile", fileInput.files[0]); 
  }
  if (extraLinks) {
    formData.append("extraLinks", extraLinks);
  }

  try {
    const response = await fetch("http://localhost:3000/theses/me/draft", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Σφάλμα αποστολής πρόχειρου");
    }

    const data = await response.json();
    document.getElementById("draftMessage").textContent = data.message;
    console.log("Updated thesis:", data.thesis);
  } catch (err) {
    document.getElementById("draftMessage").textContent = "Σφάλμα: " + err.message;
  }
}
window.uploadDraft = uploadDraft;

export  async function saveExamInfo() {
  const examDate = document.getElementById("examDate").value;
  const examMode = document.getElementById("examMode").value;
  const examInfo = document.getElementById("examInfo").value;
  const msg = document.getElementById("examMessage");

  // καθάρισμα μηνύματος
  msg.textContent = "";

  if (!examDate || !examMode || !examInfo) {
    msg.textContent = "⚠️ Συμπλήρωσε όλα τα πεδία.";
    msg.style.color = "red";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/theses/me/exam", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        examDate,
        examMode,
        examLocation: examInfo
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Αποτυχία καταχώρησης");
    }

    msg.textContent = data.message || "✅ Στοιχεία εξέτασης αποθηκεύτηκαν!";
    msg.style.color = "green";
  } catch (err) {
    msg.textContent = "❌ Σφάλμα: " + err.message;
    msg.style.color = "red";
  }
}

window.saveExamInfo = saveExamInfo;

async function loadPraktiko() {
  try {
    const res = await fetch("http://localhost:3000/theses/me/praktiko", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    if (!res.ok) {
      throw new Error("Αποτυχία φόρτωσης πρακτικού");
    }

    const html = await res.text();
    document.getElementById("praktikoFrame").innerHTML = html; // ✅ div.innerHTML
  } catch (err) {
    document.getElementById("praktikoFrame").innerHTML =
      `<p style="color:red; padding:20px;">❌ ${err.message}</p>`;
  }
}
loadPraktiko();

async function saveNimertis() {
  const link = document.getElementById("nimertisInput").value;
  const msg = document.getElementById("nimertisMsg");

  try {
    const res = await fetch("http://localhost:3000/theses/me/nimertis", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ nimertis_link: link })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Αποτυχία καταχώρησης");

    msg.textContent = "✅ Ο σύνδεσμος καταχωρήθηκε!";
  } catch (err) {
    msg.textContent = "❌ " + err.message;
  }
}

window.saveNimertis = saveNimertis;

async function loadCompletedThesis() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  try {
    const res = await fetch(`http://localhost:3000/theses/${id}/completed`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Σφάλμα φόρτωσης");

    // Πληροφορίες Διπλωματικής
    document.getElementById("thesisDetails1").innerHTML = `
      <p><b>Τίτλος:</b> ${data.title}</p>
      <p><b>Φοιτητής:</b> ${data.student?.name} ${data.student?.surname}</p>
      <p><b>Επιβλέπων:</b> ${data.professor?.name} ${data.professor?.surname}</p>
      ${data.nimertis_link ? `<p><b>Νημερτής:</b> <a href="${data.nimertis_link}" target="_blank">${data.nimertis_link}</a></p>` : ""}
    `;

    // Αλλαγές κατάστασης
    document.getElementById("statusHistory").innerHTML = data.statusHistory.length
      ? data.statusHistory.map(
          s => `<li>${s.status} - ${new Date(s.date).toLocaleString()}</li>`
        ).join("")
      : "<li>Δεν υπάρχουν διαθέσιμες αλλαγές</li>";

  } catch (err) {
    document.getElementById("thesisDetails1").innerHTML =
      `<p style="color:red;">❌ ${err.message}</p>`;
  }
}

loadCompletedThesis();



document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadThesisDetails();
    loadProfile();
    
});