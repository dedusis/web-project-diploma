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

    const manageBtn = document.getElementById("manageBtn");
    manageBtn.style.display = "inline-block";
        switch (thesis.status) {
            case "pending":
                manageBtn.onclick = () => location.href = "pending.html?id=" + thesis._id;
                break;
            case "under_review":
                manageBtn.onclick = () => location.href = "review.html?id=" + thesis._id;
                break;
            case "completed":
                manageBtn.onclick = () => location.href = "completed.html?id=" + thesis._id;
                break;
            default:
                 manageBtn.style.display = "none";
                
        }
  }catch (err) {
         console.error("Αποτυχία φόρτωσης διπλωματικής:", err);
        document.getElementById("thesisDetails").innerHTML =
        `<p>Σφάλμα: ${err.message}</p>`;
    }

}
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadThesisDetails();
    loadProfile();
});