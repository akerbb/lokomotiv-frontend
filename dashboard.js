const API = "https://lokomotiv-backend.onrender.com";

const messagesEl = document.getElementById("messages");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const logoutBtn = document.getElementById("logoutBtn");

let messages = [];

function formatTime(date = new Date()) {
  return date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

function renderMessages() {
  if (!messages.length) {
    messagesEl.innerHTML = '<div class="empty-state">Inga meddelanden ännu.</div>';
    return;
  }

  messagesEl.innerHTML = messages.map((message) => `
    <article class="message-item ${message.own ? "own" : ""}">
      <div class="message-meta">
        <span>${message.sender}</span>
        <time>${message.time}</time>
      </div>
      <p>${message.text}</p>
    </article>
  `).join("");

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = messageInput.value.trim();
  if (!text) return;

  messages.push({
    sender: "Du",
    text: escapeHtml(text),
    time: formatTime(),
    own: true
  });

  messageInput.value = "";
  renderMessages();
});

logoutBtn.addEventListener("click", async () => {
  try {
    await fetch(`${API}/logout`, {
      method: "POST",
      credentials: "include"
    });
  } catch (error) {
    console.warn("Logout kunde inte nå backend", error);
  } finally {
    window.location.href = "personal.html";
  }
});

renderMessages();
