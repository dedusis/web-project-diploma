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
  container.innerHTML = '<h2 class="section-title">Διπλωματικές</h2>'; // τίτλος εκτός «κάρτας»

  theses.forEach(t => {
    const div = document.createElement("div");
    div.classList.add("thesis-card");
    div.innerHTML = `
      <h3>${t.title}</h3>
      <p><b>Περιγραφή:</b> ${t.description ?? "—"}</p>
      <p><b>Κατάσταση:</b> ${t.status}</p>
      <p><b>Φοιτητής:</b> ${t.student?.name ?? "—"} ${t.student?.surname ?? ""}</p>
      <p><b>Ημέρες από ανάθεση:</b> ${t.daysSinceAssignment ?? "—"}</p>
      <button class="buttons" onclick="location.href='viewThesisDetails.html?id=${t._id}'">Λεπτομέρειες</button>
    `;
    container.appendChild(div);
  });
}


document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadActiveTheses();
});