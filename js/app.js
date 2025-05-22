const navButtons = document.querySelectorAll(".nav button");
const views = document.querySelectorAll(".view");
const notesList = document.getElementById("notesList");
const favoritesList = document.getElementById("favoritesList");
const newNoteText = document.getElementById("newNoteText");
const addNoteBtn = document.getElementById("addNoteBtn");
const offlineIndicator = document.getElementById("offlineIndicator");

const getQuoteBtn = document.getElementById("getQuoteBtn");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");

const STORAGE_KEY = "notesPWA";

let notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderDashboard() {
  notesList.innerHTML = "";
  notes.forEach((note, i) => {
    const li = document.createElement("li");
    li.textContent = note.text;
    li.innerHTML += `<div class="note-actions">
      <button onclick="toggleFavorite(${i})">${
      note.favorite ? "★" : "☆"
    }</button>
      <button onclick="deleteNote(${i})">🗑️</button>
    </div>`;
    notesList.append(li);
  });
}

function renderFavorites() {
  favoritesList.innerHTML = "";
  notes
    .filter((n) => n.favorite)
    .forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n.text;
      favoritesList.append(li);
    });
}

addNoteBtn.addEventListener("click", () => {
  const text = newNoteText.value.trim();
  if (!text) return;
  notes.push({
    id: Date.now().toString(),
    text,
    favorite: false,
  });
  saveNotes();
  newNoteText.value = "";
  switchTo("dashboard");
});

window.deleteNote = (index) => {
  notes.splice(index, 1);
  saveNotes();
  renderDashboard();
};

window.toggleFavorite = (index) => {
  notes[index].favorite = !notes[index].favorite;
  saveNotes();
  renderDashboard();
};

async function fetchQuote() {
  if (!navigator.onLine) {
    quoteText.textContent = "Brak połączenia z internetem.";
    quoteAuthor.textContent = "";
    return;
  }

  quoteText.textContent = "Ładowanie…";
  quoteAuthor.textContent = "";

  try {
    const res = await fetch("https://api.quotable.io/random", {
      mode: "cors",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    quoteText.textContent = `“${data.content}”`;
    quoteAuthor.textContent = `— ${data.author}`;
  } catch (e) {
    console.error("Fetch error:", e);
    quoteText.textContent = "Błąd przy pobieraniu cytatu.";
    quoteAuthor.textContent = "";
  }
}

getQuoteBtn.addEventListener("click", fetchQuote);

navButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    switchTo(btn.dataset.view);
    navButtons.forEach((b) => b.classList.toggle("active", b === btn));
    if (btn.dataset.view === "quote") fetchQuote();
  })
);

function switchTo(viewId) {
  views.forEach((v) =>
    v.id === viewId ? v.classList.remove("hidden") : v.classList.add("hidden")
  );
  if (viewId === "dashboard") renderDashboard();
  if (viewId === "favorites") renderFavorites();
}

function updateOnlineStatus() {
  const offline = !navigator.onLine;
  offlineIndicator.classList.toggle("hidden", !offline);
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
updateOnlineStatus();

switchTo("dashboard");
