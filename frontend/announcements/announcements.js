async function loadAnnouncements() {
  try {
    const res = await fetch("http://localhost:3000/announcements?format=json");
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
  loadAnnouncements();
});
