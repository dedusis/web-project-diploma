const userButton = document.getElementById("userButton");
const userDropdown = document.getElementById("userDropdown");
const topicsList = document.getElementById("topicsList");
const createForm = document.getElementById("createTopic");
const createMsg = document.getElementById("createMsg");
const assignForm = document.getElementById("assignForm");

// Διαχείριση dropdown χρήστη
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
//φορτωση θεματων προς αναθεση
async function loadTopics() {
  if (!topicsList) return;
  try {
    const response = await fetch('http://localhost:3000/theses/available', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const theses = await response.json();
      topicsList.innerHTML = ''; // Καθαρισμός της λίστας

      theses.forEach((thesis) => {
        const topicBox = document.createElement('div');
        topicBox.classList.add('topic-box');
        topicBox.innerHTML = `
          <h3>${thesis.title}</h3>
          <p>${thesis.description || ''}</p>
          <div class="actions">
            <span class="badge">${thesis.status}</span>
            <button class="buttons">Επεξεργασία</button>
          </div>
        `;
        topicsList.appendChild(topicBox);
      });
    } else {
      console.error('Failed to fetch theses:', response.statusText);
    }
  } catch (err) {
    console.error('Error fetching theses:', err);
  }
}


// Δημιουργία νέου θέματος
if (createForm) {
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Αποφυγή ανανέωσης της σελίδας

    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    const pdfFile = document.getElementById('pdfFile').files[0];
    if (pdfFile) {
      formData.append('pdfFile', pdfFile);
    }

    try {
      const response = await fetch('http://localhost:3000/theses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // JWT token
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        createMsg.textContent = 'Θέμα δημιουργήθηκε επιτυχώς!';
        createMsg.style.color = 'green';
        console.log('Created Thesis:', data);

        // Επαναφόρτωση της λίστας θεμάτων
        loadTopics();
        createForm.reset(); // Καθαρισμός της φόρμας
      } else {
        const error = await response.json();
        createMsg.textContent = error.error || 'Σφάλμα κατά τη δημιουργία.';
        createMsg.style.color = 'red';
      }
    } catch (err) {
      console.error('Error:', err);
      createMsg.textContent = 'Σφάλμα κατά τη σύνδεση με τον διακομιστή.';
      createMsg.style.color = 'red';
    }
  });
}

// Φόρτωση δεδομένων χρήστη
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

// Αποσύνδεση χρήστη
const logoutButton = document.getElementById("logoutBtn");
if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../index.html"; // Ανακατεύθυνση στη σελίδα σύνδεσης
  });
}
async function loadThesesDropdown() {
  try {
    const response = await fetch('http://localhost:3000/theses/available', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const theses = await response.json();
      const thesisSelect = document.getElementById('thesisSelect');
      thesisSelect.innerHTML = '<option value="">Επιλέξτε Θέμα</option>'; // Καθαρισμός και προσθήκη προεπιλεγμένης επιλογής

      theses.forEach((thesis) => {
        const option = document.createElement('option');
        option.value = thesis._id;
        option.textContent = thesis.title;
        thesisSelect.appendChild(option);
      });
    } else {
      console.error('Failed to fetch theses for dropdown:', response.statusText);
    }
  } catch (err) {
    console.error('Error fetching theses for dropdown:', err);
  }
}      
async function assignStudent(thesisId){
    const studentNumber=document.getElementById("studentNumber").value;
    try {
      const response = await fetch(`http://localhost:3000/theses/${thesisId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ student_number: studentNumber }),
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('Θέμα ανατέθηκε επιτυχώς!');
        loadTopics(); // Επαναφόρτωση της λίστας θεμάτων
        loadThesesDropdown();
      } else {
        const error = await response.json();
        alert(error.error || 'Σφάλμα κατά την ανάθεση.');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Σφάλμα κατά τη σύνδεση με τον διακομιστή.');
    }   
}

if(assignForm){
  assignForm.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const thesisId=document.getElementById("thesisSelect").value;
    if(thesisId){
      await assignStudent(thesisId);
      assignForm.reset();
    }else{
      alert('Παρακαλώ επιλέξτε ένα θέμα.');
    }
  });
} 

function exportTheses(format){
  fetch(`http://localhost:3000/theses/export?format=${format}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "csv" ? "theses.csv" : "theses.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((err) => {
      console.error("Export error:", err);
      alert("Σφάλμα κατά την εξαγωγή.");
    });
}

async function loadThesesHistory() {
  try {
    // Παίρνουμε τα φίλτρα
    const status = document.getElementById("statusFilter").value;
    const role = document.getElementById("roleFilter").value;

    // Φτιάχνουμε query string
    const query = new URLSearchParams();
    if (status) query.append("status", status);
    if (role) query.append("role", role);

    const response = await fetch(`http://localhost:3000/theses/professor/me?${query.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (response.ok) {
      const theses = await response.json();

      const container = document.querySelector("main");
      // Καθαρίζουμε παλιές κάρτες (κρατάμε το header/filters)
      const oldCards = container.querySelectorAll(".thesis-card");
      oldCards.forEach(c => c.remove());

      theses.forEach((thesis) => {
        const thesisbox = document.createElement("div");
        thesisbox.classList.add("thesis-card");
        thesisbox.innerHTML = `
          <h3>${thesis.title}</h3>
          <p class="thesis-meta"><b>Φοιτητής:</b> ${thesis.student ? thesis.student.name + " " + thesis.student.surname : "—"}</p>
          <p class="thesis-meta"><b>Κατάσταση:</b> ${thesis.status}</p>
          <p class="thesis-meta"><b>Ρόλος:</b> ${thesis.role === "supervisor" ? "Επιβλέπων" : "Μέλος τριμελούς"}</p>
          <button class="buttons" onclick="location.href='details.html?id=${thesis._id}'">Επιλογή</button>
          <button class="buttons" onclick="location.href='manage.html?thesisId=${thesis._id}'">Διαχείρηση</button>
          `;
        container.appendChild(thesisbox);
      });
    } else {
      console.error("Failed to fetch theses history:", response.statusText);
    }
  } catch (err) {
    console.error("Error fetching theses history:", err);
  }
}



async function loadInvitations(){
  try{
    const response=await fetch('http://localhost:3000/theses/professor/invitations',{
      method:'GET',
      headers:{
        Authorization:`Bearer ${localStorage.getItem('token')}`,
  },
    });
    if(response.ok){
      const invitations=await response.json();    
      const invitationsList=document.getElementById("invitationsList");
      invitationsList.innerHTML='';
      invitations.forEach((invitation)=>{
        const listItem=document.createElement("li");
        listItem.classList.add("invitation-item");
        listItem.innerHTML=`
          <p><b>Θέμα:</b>${invitation.title}</p>
          <p><b>Περιγραφή:</b>${invitation.description || '—'}</p>
          <p><b>Πρόταση από:</b>${invitation.studentName} ${invitation.studentSurname}</p>
          <p><b>Όνομα Επιβλέποντα:</b> ${invitation.supervisorname} ${invitation.supervisorSurname}</p>
          <div class="actions">
            <button class="buttons" onclick="respondToInvitation('${invitation.thesisId}','accepted')">Αποδοχή</button>
            <button class="buttons" onclick="respondToInvitation('${invitation.thesisId}','rejected')">Απόρριψη</button>
          </div>
        `;
        invitationsList.appendChild(listItem);
      });
    }else{
      console.error("Failed to fetch invitations:", response.statusText);
    }  
 }catch(err){
    console.error("Error fetching invitations:", err);
  }
} 



async function respondToInvitation(id, responseType) {
  try {
    const resp = await fetch(`http://localhost:3000/theses/${id}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ response: responseType }), 
    });
    if (!resp.ok) throw new Error(await resp.text());
    window.location.reload(); 
   
  } catch (e) {
    console.error('respondInvitation error:', e);
  }
}

async function loadProfessorStats() {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch('http://localhost:3000/theses/professor/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      console.error('Failed to fetch stats:', await res.text());
      return;
    }

    const theses = await res.json();

    const groups = { supervisor: [], committee: [] };
    theses.forEach(t => {
      const role = t.role === 'supervisor' ? 'supervisor' : 'committee';
      groups[role].push(t);
    });

    const daysBetween = (a, b) => {
      const d1 = new Date(a), d2 = new Date(b);
      return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    };
    const avg = arr => arr.length ? (arr.reduce((s, x) => s + x, 0) / arr.length) : 0;

    
    const avgDays = ['supervisor','committee'].map(role => {
      const completed = groups[role].filter(t => t.status === 'completed' && t.assignedDate && t.completedDate);
      const days = completed.map(t => daysBetween(t.assignedDate, t.completedDate));
      return Number(avg(days).toFixed(1));

    });

   
    const avgGrades = ['supervisor','committee'].map(role => {
      const graded = groups[role].filter(t => t.status === 'completed' && typeof t.finalGrade === 'number');
      const grades = graded.map(t => t.finalGrade);
      return Number(avg(grades).toFixed(2));
    });

    
    const counts = ['supervisor','committee'].map(role => groups[role].length);

    
    renderBar('timeChart', ['Επιβλέπων','Μέλος τριμελούς'], avgDays, 'Μ. Όρος Ημερών Περάτωσης');
    renderBar('gradeChart', ['Επιβλέπων','Μέλος τριμελούς'], avgGrades, 'Μ. Όρος Τελικού Βαθμού');
    renderDoughnut('countChart', ['Επιβλέπων','Μέλος τριμελούς'], counts, 'Πλήθος Διπλωματικών');
  } catch (err) {
    console.error('Error loading professor stats:', err);
  }
}

function renderBar(canvasId, labels, data, title) {
  const ctx = document.getElementById(canvasId);
  if (ctx._chart) ctx._chart.destroy();

  
  if (data.every(v => v === 0)) {
    ctx.style.display = "none"; 
    const msg = document.createElement("p");
    msg.textContent = "Δεν υπάρχουν δεδομένα για " + title;
    msg.style.textAlign = "center";
    msg.style.fontStyle = "italic";
    ctx.parentNode.insertBefore(msg, ctx.nextSibling);
    return;
  } else {
    ctx.style.display = "block"; 
  }

  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: title,
        data,
        borderWidth: 1,
        backgroundColor: ['#6366f1','#a855f7']
      }]
    },
    options: {
    responsive: true,
    scales: {
      y: { beginAtZero: true, ticks: { font: { size: 14 } } },
      x: { ticks: { font: { size: 14 } } }
    },
    plugins: { 
     legend: { display: false }, 
      title: { display: true, text: title, font: { size: 20, weight: "bold" } }
  }
}
  });
}



function renderDoughnut(canvasId, labels, data, title) {
  const ctx = document.getElementById(canvasId);
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#6366f1','#a855f7']
      }]
    },
    options: {
      responsive: true,
      plugins: { title: { display: true, text: title,font:{size:30,weight:'bold'} } },
      
      cutout: '35%' 
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
    const response = await fetch(`http://localhost:3000/theses/professor/me/${thesisId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) throw new Error(`Σφάλμα: ${response.status}`);

    const thesis = await response.json();
    const container = document.getElementById("thesisDetails");

    container.innerHTML = `
      <h2>${thesis.title}</h2>
      ${fieldRow("Περιγραφή", thesis.description)}
      ${fieldRow("Κατάσταση", thesis.status)}

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

      <h3>Χρονολόγιο Καταστάσεων</h3>
      ${thesis.statusHistory.length > 0
        ? thesis.statusHistory.map(h => `
            ${fieldRow("Κατάσταση", h.status)} 
            ${fieldRow("Ημερομηνία", new Date(h.date).toLocaleString("el-GR"))}
          `).join("")
        : fieldRow("Καταστάσεις", null)}

      <h3>Λοιπές Πληροφορίες</h3>
      ${fieldRow("Τελικός Βαθμός", thesis.finalGrade)}
      ${fieldRow("Αποθετήριο", thesis.nimertis_link ? `<a href="${thesis.nimertis_link}" target="_blank">${thesis.nimertis_link}</a>` : null)}
      ${fieldRow("Τελικό Αρχείο", thesis.attachment ? `<a href="${thesis.attachment}" target="_blank">Λήψη</a>` : null)}
      ${fieldRow("Προσχέδιο", thesis.draftFile ? `<a href="${thesis.draftFile}" target="_blank">Λήψη</a>` : null)}
      ${fieldRow("Ημερομηνία Εξέτασης", thesis.examDate ? new Date(thesis.examDate).toLocaleString("el-GR") : null)}
      ${fieldRow("Τρόπος Εξέτασης", thesis.examMode)}
      ${fieldRow("Τοποθεσία Εξέτασης", thesis.examLocation)}
    `;
  } catch (err) {
    console.error("Αποτυχία φόρτωσης διπλωματικής:", err);
    document.getElementById("thesisDetails").innerHTML = "<p>Σφάλμα κατά τη φόρτωση λεπτομερειών.</p>";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("thesisDetails")) {
    loadThesisDetails();
  }
});







// Φόρτωση θεμάτων κατά την εκκίνηση
document.addEventListener('DOMContentLoaded', () => {
  loadTopics();
  loadUserData();
  loadThesesDropdown();
  loadThesesHistory();
  loadInvitations();
  loadProfessorStats();
  loadThesisDetails();
  document.getElementById("statusFilter").addEventListener("change", loadThesesHistory);
  document.getElementById("roleFilter").addEventListener("change", loadThesesHistory);
  document.getElementById("exportCsv").addEventListener("click", () => exportTheses("csv"));
  document.getElementById("exportJson").addEventListener("click", () => exportTheses("json"));

});

window.respondToInvitation = respondToInvitation;
