const API = "https://lokomotiv-backend.onrender.com";

let events = [];
let selectedDate = null;

const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const modal = document.getElementById("modal");
const modalDateTitle = document.getElementById("modalDateTitle");

async function auth() {
  const res = await fetch(`${API}/me`, {
    credentials: "include"
  });

  if (!res.ok) {
    location.href = "personal.html";
    return;
  }

  const data = await res.json();

  if (data.mustChangePassword) {
    location.href = "change-password.html";
  }
}

auth();

async function loadEvents() {
  const res = await fetch(`${API}/api/events`, {
    credentials: "include"
  });

  events = await res.json();
  renderCalendar();
}

function renderCalendar() {
  calendar.innerHTML = "";

  const now = new Date();

  monthTitle.textContent = now.toLocaleString("sv-SE", {
    month: "long",
    year: "numeric"
  });

  const year = now.getFullYear();
  const month = now.getMonth();
  const days = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= days; i++) {
    const div = document.createElement("div");
    div.className = "calendar-day";
    div.textContent = i;

    div.onclick = () => {
      selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      modal.classList.remove("hidden");
      modalDateTitle.textContent = selectedDate;
      renderDayEvents();
    };

    calendar.appendChild(div);
  }
}

function renderDayEvents() {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = "";

  events
    .filter(event => event.date === selectedDate)
    .forEach(event => {
      const article = document.createElement("article");
      article.className = "event-item";

      article.innerHTML = `
        <h4>${event.title}</h4>
        <p><strong>Tid:</strong> ${event.time || "Ingen tid angiven"}</p>
        <p>${event.description || ""}</p>
      `;

      container.appendChild(article);
    });
}

document.getElementById("eventForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  await fetch(`${API}/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      title: document.getElementById("eventTitle").value,
      date: selectedDate,
      time: document.getElementById("eventTime").value,
      description: document.getElementById("eventDescription").value
    })
  });

  document.getElementById("eventForm").reset();

  await loadEvents();
  renderDayEvents();
});

document.getElementById("closeModal").onclick = () => {
  modal.classList.add("hidden");
};

async function loadMessages() {
  const res = await fetch(`${API}/api/messages`, {
    credentials: "include"
  });

  const messages = await res.json();
  const container = document.getElementById("messages");

  container.innerHTML = "";

  messages.forEach(message => {
    const article = document.createElement("article");
    article.className = "message-item";

    article.innerHTML = `
      <div class="message-meta">
        <strong>${message.sender}</strong>
        <span>${message.createdAt}</span>
      </div>
      <p>${message.text}</p>
    `;

    container.appendChild(article);
  });
}

document.getElementById("messageForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const messageInput = document.getElementById("messageInput");

  await fetch(`${API}/api/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      text: messageInput.value
    })
  });

  messageInput.value = "";
  loadMessages();
});

document.getElementById("logoutBtn").onclick = async () => {
  await fetch(`${API}/logout`, {
    method: "POST",
    credentials: "include"
  });

  location.href = "personal.html";
};

loadEvents();
loadMessages();

setInterval(loadMessages, 3000);
