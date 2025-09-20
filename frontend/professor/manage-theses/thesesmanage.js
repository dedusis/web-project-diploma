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
let currentUserId= null;
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
      currentUserId=user._id;
      document.getElementById('name').textContent = user.name || '—';
      document.getElementById('username').textContent = user.username || '—';
      document.getElementById('email').textContent = user.email || '—';
      document.getElementById('department').textContent = user.department || '—';
      loadGradingSection();
      checkSupervisor();
    } else {
      console.error('Failed to fetch user data:', response.statusText);
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
  }
}
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../../../index.html"; // Ανακατεύθυνση στη σελίδα σύνδεσης
  });
}

//1ο Ζητούμενο Ανάθεσης
async function loadCommittee() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get('thesisId');
  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/committee`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });

    if (!res.ok) throw new Error("Σφάλμα φόρτωσης επιτροπής");
    const data = await res.json();

    const container = document.getElementById("committeeList");
    if (!data.committee || data.committee.length === 0) {
      container.innerHTML = "<p>Δεν έχουν σταλεί προσκλήσεις.</p>";
      return;
    }
    console.log("Supervisor ID:", data.supervisor?.id);
    console.log("Current user ID:", window.currentUserId);
    console.log("Equal?", data.supervisor?.id === window.currentUserId);
    if (data.supervisor?.id === currentUserId) {
      document.getElementById("cancelBtn").style.display = "block";
    } else {
      document.getElementById("cancelBtn").style.display = "none";
    }
    container.innerHTML = data.committee.map(c => `
      <div class="committee-member">
        <p><b>Όνομα:</b> ${c.professor.name} ${c.professor.surname}</p>
        <p><b>Email:</b> ${c.professor.email}</p>
        <p><b>Κατάσταση:</b> ${c.status}</p>
        <p><b>Ημερομηνία πρόσκλησης:</b> ${new Date(c.invitedAt).toLocaleDateString("el-GR")}</p>
        <p><b>Ημερομηνία αποδοχής:</b> ${c.acceptedAt ? new Date(c.acceptedAt).toLocaleDateString("el-GR") : "—"}</p>
        <p><b>Ημερομηνία απόρριψης:</b> ${c.rejectedAt ? new Date(c.rejectedAt).toLocaleDateString("el-GR") : "—"}</p>
      </div>
    `).join("");
  } catch (err) {
    console.error(err);
    document.getElementById("committeeList").innerHTML = "<p>Σφάλμα φόρτωσης.</p>";
  }
}

 export async function unassignThesis() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get('thesisId');

  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/unassign`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || "Η ανάθεση ακυρώθηκε με επιτυχία.");
      location.reload(); // refresh για να δεις την αλλαγή
    } else {
      alert(data.error || "Σφάλμα κατά την ακύρωση.");
    }
  } catch (err) {
    console.error("Σφάλμα:", err);
    alert("Αποτυχία σύνδεσης με τον διακομιστή.");
  }
}

export async function addNote(e) {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");
  const noteText = document.getElementById("noteText").value.trim();

  if (!noteText) {
    msg.textContent = "Η σημείωση δεν μπορεί να είναι κενή!";
    msg.style.color = "red";
    return;
  }


  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: noteText })
    });

    const data = await res.json();
    const msg = document.getElementById("noteMsg");
    msg.textContent = "";
    if (res.ok) {
      msg.textContent = "Η σημείωση καταχωρήθηκε!";
      msg.style.color = "green";
      loadNotes(); 
    } else {
      msg.textContent = data.error || "Σφάλμα καταχώρησης σημείωσης.";
      msg.style.color = "red";
    }
  } catch (err) {
    console.error("Σφάλμα:", err);
    alert("Σφάλμα σύνδεσης με τον διακομιστή.");
  }
}
function checkSupervisor() {
  if (window.thesisData?.supervisor?.id === window.currentUserId) {
    // Ο χρήστης είναι επιβλέπων
    document.getElementById("openGradingBtn").style.display = "block";
    document.getElementById("cancelBox").style.display = "block";
    document.getElementById("statusBox").style.display = "block";
  } else {
    // Μη επιβλέπων
    document.getElementById("openGradingBtn").style.display = "none";
    document.getElementById("cancelBox").style.display = "none";
    document.getElementById("statusBox").style.display = "none";
  }
}

export async function loadNotes() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");

  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/notes`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    const data = await res.json();
    const container = document.getElementById("notesList");

    if (res.ok) {
      if (!data || data.length === 0) {
        container.innerHTML = "<p>Δεν υπάρχουν σημειώσεις.</p>";
        return;
      }

      container.innerHTML = data.map(n => `
        <div class="note">
          <p>${n.text}</p>
          <small>${new Date(n.date).toLocaleString("el-GR")}</small>
        </div>
      `).join("");

         if(window.thesisData?.supervisor?.id === window.currentUserId) {
        document.getElementById("cancelBox").style.display = "block";
        document.getElementById("statusBox").style.display = "block";
      } else {
        document.getElementById("cancelBox").style.display = "none";
        document.getElementById("statusBox").style.display = "none";
      }

    } else {
      container.innerHTML = `<p>Σφάλμα: ${data.error}</p>`;
    }
  } catch (err) {
    console.error(err);
    document.getElementById("notesList").innerHTML = "<p>Σφάλμα σύνδεσης.</p>";
  }
}



export async function cancelThesisByProfessor(e) {
  e.preventDefault();

  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");

  const apNumber = document.getElementById("apNumber").value.trim();
  const apYear = document.getElementById("apYear").value.trim();
  const msg = document.getElementById("cancelMsg");

  if (!apNumber || !apYear) {
    msg.textContent = "Συμπλήρωσε αριθμό και έτος πράξης!";
    msg.style.color = "red";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/cancel-by-professor`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ apNumber, apYear })
    });

    const data = await res.json();

    if (res.ok) {
      msg.textContent = data.message || "Η διπλωματική ακυρώθηκε με επιτυχία.";
      msg.style.color = "green";
      document.getElementById("cancelForm").reset();
    } else {
      msg.textContent = data.error || "Σφάλμα κατά την ακύρωση.";
      msg.style.color = "red";
    }
  } catch (err) {
    console.error("Σφάλμα:", err);
    msg.textContent = "Αποτυχία σύνδεσης με τον διακομιστή.";
    msg.style.color = "red";
  }
}
export async function changeToUnderReview() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");

  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/under-review`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    const msgBox = document.getElementById("statusMsg");
    if (res.ok) {
      msgBox.innerHTML = `<p style="color:green;">${data.message || "Η κατάσταση άλλαξε σε 'Υπό Εξέταση'."}</p>`;
    } else {
      msgBox.innerHTML = `<p style="color:red;">${data.error || "Σφάλμα κατά την αλλαγή κατάστασης."}</p>`;
    }
  } catch (err) {
    console.error("Σφάλμα:", err);
    document.getElementById("statusMsg").innerHTML =
      "<p style='color:red;'>Αποτυχία σύνδεσης με τον διακομιστή.</p>";
  }
}

export async function loadDraft() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");

  try {
    const response = await fetch(`http://localhost:3000/theses/professor/${thesisId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Σφάλμα: ${response.status}`);

    const thesis = await response.json();
    const container = document.getElementById("draftBox");

    let draftHtml = thesis.draftFile
      ? `<p><a href="${thesis.draftFile}" target="_blank">Λήψη Πρόχειρου</a></p>`
      : `<p>Ο φοιτητής δεν έχει ανεβάσει πρόχειρο κείμενο.</p>`;

    let extraLinksHtml = "";
    if (thesis.extraLinks && thesis.extraLinks.length > 0) {
      extraLinksHtml = `
        <h4>Επιπλέον Σύνδεσμοι</h4>
        <ul>
          ${thesis.extraLinks
            .map((link) => `<li><a href="${link}" target="_blank">${link}</a></li>`)
            .join("")}
        </ul>
      `;
    }

    container.innerHTML = `
      <h3>Πρόχειρο Κείμενο Διπλωματικής</h3>
      ${draftHtml}
      ${extraLinksHtml}
    `;
  } catch (err) {
    console.error("Σφάλμα:", err);
    document.getElementById("draftBox").innerHTML =
      "<p>Σφάλμα φόρτωσης πρόχειρου.</p>";
  }
}
export async function openGrading() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");

  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/open-grading`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });

    const data = await res.json();
    if (res.ok) {
      alert("Η καταχώρηση βαθμών άνοιξε!");
      window.location.reload();
    } else {
      alert(data.error || "Σφάλμα κατά το άνοιγμα βαθμολόγησης.");
    }
  } catch (err) {
    console.error(err);
    alert("Σφάλμα σύνδεσης με τον διακομιστή.");
  }
}
export async function submitGrade() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");

  // Παίρνουμε τις τιμές από τη φόρμα
  const originality = Number(document.getElementById("originality").value);
  const methodology = Number(document.getElementById("methodology").value);
  const presentation = Number(document.getElementById("presentation").value);
  const knowledge = Number(document.getElementById("knowledge").value);

  // Validation πριν στείλουμε
  if (
    isNaN(originality) || isNaN(methodology) ||
    isNaN(presentation) || isNaN(knowledge)
  ) {
    alert("Συμπλήρωσε όλους τους βαθμούς (0–10).");
    return;
  }

  const gradeData = {
    criteria: {
      originality,
      methodology,
      presentation,
      knowledge,
    },
  };

  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/grade`, {
      method: "PATCH", 
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gradeData),
    });
    const msgBox = document.getElementById("gradeMessage");
    const data = await res.json();

    if (res.ok) {
      msgBox.style.color = "green";
      msgBox.innerText = "Η βαθμολογία καταχωρήθηκε με επιτυχία!";
      loadGrades();
      document.getElementById("gradeForm").reset();
    } else {
      msgBox.style.color = "red";
      msgBox.innerText = data.error || "Σφάλμα κατά την καταχώρηση βαθμού.";
    }
  } catch (err) {
    msgBox.style.color = "red";
    msgBox.innerText = "Αποτυχία σύνδεσης με τον διακομιστή.";
  }
}

export async function loadGrades() {
  const params = new URLSearchParams(window.location.search);
  const thesisId = params.get("thesisId");

  try {
    const res = await fetch(`http://localhost:3000/theses/${thesisId}/grades`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    const container = document.getElementById("gradesList");

    if (!res.ok) {
      container.innerHTML = `<p style="color:red;">${data.error || "Σφάλμα φόρτωσης βαθμών."}</p>`;
      return;
    }

    if (!data.grades || data.grades.length === 0) {
      container.innerHTML = "<p>Δεν έχουν καταχωρηθεί ακόμα βαθμοί.</p>";
      return;
    }

    // Φτιάχνουμε HTML για κάθε βαθμό
    container.innerHTML = `
      <h4>Καταχωρημένοι Βαθμοί</h4>
      <ul>
        ${data.grades.map(g => `
          <li style="margin-bottom:10px;">
            <b>${g.professor?.name || "Άγνωστος"} ${g.professor?.surname || ""}</b> 
            - Σύνολο: <b>${g.total}</b><br>
            🔹 Πρωτοτυπία: ${g.criteria.originality}<br>
            🔹 Μεθοδολογία: ${g.criteria.methodology}<br>
            🔹 Παρουσίαση: ${g.criteria.presentation}<br>
            🔹 Γνώση: ${g.criteria.knowledge}
          </li>
        `).join("")}
      </ul>
      <h4>Τελικός Μέσος Όρος: ${data.finalGrade ?? "—"}</h4>
    `;
  } catch (err) {
    console.error("Σφάλμα:", err);
    document.getElementById("gradesList").innerHTML =
      "<p style='color:red;'>Αποτυχία σύνδεσης με τον διακομιστή.</p>";
  }
}
export async function createAnnouncement() {
  try {
    const thesisId = new URLSearchParams(window.location.search).get("thesisId"); // παίρνει το thesisId από το query string
    const customText = document.getElementById("customAnnText").value.trim();
    const token = localStorage.getItem("token");

    if (!thesisId) {
      alert("Δεν βρέθηκε ID διπλωματικής.");
      return;
    }

    const res = await fetch("http://localhost:3000/announcements", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
       },
      body: JSON.stringify({
        thesisId,
        text: customText || null
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Σφάλμα δημιουργίας ανακοίνωσης");
    }

    document.getElementById("announcementBox").innerHTML = `
      <p style="white-space:pre-line;">${data.text}</p>
      <p><i>Δημιουργήθηκε στις: ${new Date(data.createdAt).toLocaleString("el-GR")}</i></p>
    `;
  } catch (err) {
    console.error(err);
    document.getElementById("announcementBox").innerText = "Σφάλμα: " + err.message;
  }
}


async function loadAnnouncements() {
  try {
    const res = await fetch("http://localhost:3000/announcements/feed?format=json");
    if (!res.ok) throw new Error("Αποτυχία φόρτωσης");
    const data = await res.json();

    const container = document.getElementById("announcements");
    container.innerHTML = data.length
      ? data.map(a => `
        <div class="announcement">
          <h3>${a.thesis?.title || "Διπλωματική"}</h3>
          <p>${a.text}</p>
          <p class="date">📅 Εξέταση: ${
            a.thesis?.examDate
              ? new Date(a.thesis.examDate).toLocaleString("el-GR")
              : "—"
          }</p>
          <p>📍 ${a.thesis?.examLocation || "—"} (${
            a.thesis?.examMode === "online" ? "💻 Online" : "🏫 Δια ζώσης"
          })</p>
          <p>👨‍🏫 ${a.professor?.name || ""} ${a.professor?.surname || ""}</p>
        </div>
      `).join("")
      : "<p>Δεν υπάρχουν ανακοινώσεις.</p>";
  } catch (err) {
    document.getElementById("announcements").innerText =
      "Σφάλμα: " + err.message;
  }
}




document.addEventListener("DOMContentLoaded", () => {
  loadUserData();
  loadCommittee();
  loadNotes();
  loadDraft();
  loadGrades();
  loadAnnouncements();
  const gradeForm = document.getElementById("gradeForm");
  if (gradeForm) {
    gradeForm.addEventListener("submit", (e) => {
      e.preventDefault(); 
      submitGrade();
    });
  }
});


window.unassignThesis=unassignThesis;
window.addNote=addNote;
window.cancelThesisByProfessor = cancelThesisByProfessor;
window.changeToUnderReview = changeToUnderReview;
window.openGrading = openGrading;
window.submitGrade = submitGrade;
window.createAnnouncement = createAnnouncement;