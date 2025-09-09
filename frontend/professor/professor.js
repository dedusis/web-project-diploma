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

// Προβολή δεδομένων χρήστη
const userNameSpan = document.getElementById("userName");
const userEmailSpan = document.getElementById("userEmail");

if (userNameSpan && userEmailSpan) {
  const token = localStorage.getItem("token");
  if (token) {
    fetch("http://localhost:3000/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        userNameSpan.textContent = data.name || "—";
        userEmailSpan.textContent = data.email || "—";
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      });
  } else {
    userNameSpan.textContent = "—";
    userEmailSpan.textContent = "—";
  }
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


// Φόρτωση θεμάτων κατά την εκκίνηση
document.addEventListener('DOMContentLoaded', () => {
  loadTopics();
  loadUserData();
  loadThesesDropdown();
  loadThesesHistory();
  document.getElementById("statusFilter").addEventListener("change", loadThesesHistory);
  document.getElementById("roleFilter").addEventListener("change", loadThesesHistory);
  document.getElementById("exportCsv").addEventListener("click", () => exportTheses("csv"));
  document.getElementById("exportJson").addEventListener("click", () => exportTheses("json"));

});

