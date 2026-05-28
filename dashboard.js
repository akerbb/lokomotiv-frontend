const API = "https://lokomotiv-backend.onrender.com";

let events = [];
let messages = [];
let selectedDate = null;
let visibleDate = new Date();
let activeChatId = "general";

const fallbackChats = [
  { id: "general", name: "Allmänt", members: ["Ledning", "Personal", "Kök", "Service"] },
  { id: "service", name: "Service", members: ["Servitörer", "Bar", "Hovmästare"] },
  { id: "kitchen", name: "Kök", members: ["Kockar", "Disk", "Inköp"] }
];

let chats = [...fallbackChats];

const calendar = document.getElementById("calendar");
const monthTitle = document.getElementById("monthTitle");
const modal = document.getElementById("modal");
const modalDateTitle = document.getElementById("modalDateTitle");
const messagesContainer = document.getElementById("messages");
const chatList = document.getElementById("chatList");
const memberList = document.getElementById("memberList");

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateLong = (dateString) => new Date(`${dateString}T12:00:00`).toLocaleDateString("sv-SE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("sv-SE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

async function auth() {
  const res = await fetch(`${API}/me`, { credentials: "include" });

  if (!res.ok) {
    location.href = "personal.html";
    return;
  }

  const data = await res.json();

  if (data.mustChangePassword) {
    location.href = "change-password.html";
  }
}

async function loadEvents() {
  try {
    const res = await fetch(`${API}/api/events`, { credentials: "include" });
    events = res.ok ? await res.json() : [];
  } catch {
    events = [];
  }

  renderCalendar();
  renderUpcomingEvents();
  updateStats();
}

function renderCalendar() {
  calendar.innerHTML = "";

  const year = visibleDate.getFullYear();
  const month = visibleDate.getMonth();
  const today = formatDate(new Date());

  monthTitle.textContent = visibleDate.toLocaleString("sv-SE", {
    month: "long",
    year: "numeric"
  });

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  for (let cell = 0; cell < totalCells; cell++) {
    const dayNumber = cell - startOffset + 1;
    const day = createElement("button", "calendar-day");
    day.type = "button";

    if (dayNumber < 1 || dayNumber > daysInMonth) {
      day.classList.add("outside-month");
      day.disabled = true;
      calendar.appendChild(day);
      continue;
    }

    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
    const dayEvents = events.filter((event) => event.date === dateString);

    if (dateString === today) day.classList.add("today");

    day.appendChild(createElement("span", "day-number", dayNumber));

    if (dayEvents.length > 0) {
      day.appendChild(createElement("span", "day-summary", `${dayEvents.length} event`));
      const dots = createElement("div", "event-dots");
      dayEvents.slice(0, 4).forEach(() => dots.appendChild(createElement("span", "event-dot")));
      day.appendChild(dots);
    }

    day.addEventListener("click", () => openDayModal(dateString));
    calendar.appendChild(day);
  }
}

function openDayModal(dateString) {
  selectedDate = dateString;
  modal.classList.remove("hidden");
  modalDateTitle.textContent = formatDateLong(selectedDate);
  renderDayEvents();
}

function renderDayEvents() {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = "";

  const dayEvents = events
    .filter((event) => event.date === selectedDate)
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  if (dayEvents.length === 0) {
    container.appendChild(createElement("p", "empty-state", "Inga event på detta datum ännu."));
    return;
  }

  dayEvents.forEach((event) => {
    const article = createElement("article", "event-item");
    article.appendChild(createElement("span", "event-tag", translateEventType(event.type)));
    article.appendChild(createElement("h4", "", event.title));
    article.appendChild(createElement("p", "", `Tid: ${event.time || "Ingen tid angiven"}`));
    if (event.description) article.appendChild(createElement("p", "", event.description));
    container.appendChild(article);
  });
}

function translateEventType(type) {
  const types = { meeting: "Möte", shift: "Pass", delivery: "Leverans", other: "Övrigt" };
  return types[type] || "Event";
}

function renderUpcomingEvents() {
  const container = document.getElementById("upcomingEvents");
  container.innerHTML = "";

  const today = formatDate(new Date());
  const upcoming = events
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date} ${a.time || "99:99"}`.localeCompare(`${b.date} ${b.time || "99:99"}`))
    .slice(0, 6);

  if (upcoming.length === 0) {
    container.appendChild(createElement("p", "empty-state", "Inga kommande event registrerade."));
    return;
  }

  upcoming.forEach((event) => {
    const article = createElement("article", "upcoming-item");
    article.appendChild(createElement("strong", "", event.title));
    article.appendChild(createElement("time", "", `${formatDateLong(event.date)}${event.time ? ` kl. ${event.time}` : ""}`));
    if (event.description) article.appendChild(createElement("p", "", event.description));
    container.appendChild(article);
  });
}

function renderChats() {
  chatList.innerHTML = "";

  chats.forEach((chat) => {
    const button = createElement("button", "chat-button");
    button.type = "button";
    if (chat.id === activeChatId) button.classList.add("active");
    button.appendChild(createElement("strong", "", chat.name));
    button.appendChild(createElement("span", "", `${chat.members.length} medlemmar`));
    button.addEventListener("click", () => {
      activeChatId = chat.id;
      renderChats();
      renderMembers();
      renderMessages();
      loadMessages();
    });
    chatList.appendChild(button);
  });

  updateStats();
}

function renderMembers() {
  const activeChat = chats.find((chat) => chat.id === activeChatId) || chats[0];
  memberList.innerHTML = "";
  document.getElementById("activeChatTitle").textContent = activeChat.name;
  document.getElementById("activeChatMeta").textContent = `${activeChat.members.length} medlemmar`;
  document.getElementById("activeChatDescription").textContent = `Medlemmar i ${activeChat.name}.`;

  activeChat.members.forEach((member) => {
    const row = createElement("div", "member-pill");
    row.appendChild(createElement("span", "member-avatar", member.slice(0, 2).toUpperCase()));
    row.appendChild(createElement("strong", "", member));
    memberList.appendChild(row);
  });
}

async function loadMessages() {
  try {
    const res = await fetch(`${API}/api/messages?chatId=${encodeURIComponent(activeChatId)}`, {
      credentials: "include"
    });
    messages = res.ok ? await res.json() : [];
  } catch {
    messages = [];
  }

  renderMessages();
}

function renderMessages() {
  messagesContainer.innerHTML = "";

  if (messages.length === 0) {
    messagesContainer.appendChild(createElement("p", "empty-state", "Inga meddelanden i den här chatten ännu."));
    return;
  }

  messages.forEach((message) => {
    const article = createElement("article", "message-item");
    const meta = createElement("div", "message-meta");
    meta.appendChild(createElement("strong", "", message.sender || "Okänd"));
    meta.appendChild(createElement("span", "", formatDateTime(message.createdAt)));
    article.appendChild(meta);
    article.appendChild(createElement("p", "", message.text || ""));
    messagesContainer.appendChild(article);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function updateStats() {
  const today = formatDate(new Date());
  document.getElementById("todayText").textContent = new Date().toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
  document.getElementById("eventCount").textContent = events.filter((event) => event.date >= today).length;
  document.getElementById("chatCount").textContent = chats.length;
}

document.getElementById("eventForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    title: document.getElementById("eventTitle").value.trim(),
    date: selectedDate,
    time: document.getElementById("eventTime").value,
    type: document.getElementById("eventType").value,
    description: document.getElementById("eventDescription").value.trim()
  };

  if (!payload.title || !payload.date) return;

  await fetch(`${API}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  document.getElementById("eventForm").reset();
  await loadEvents();
  renderDayEvents();
});

document.getElementById("messageForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const messageInput = document.getElementById("messageInput");
  const text = messageInput.value.trim();
  if (!text) return;

  await fetch(`${API}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text, chatId: activeChatId })
  });

  messageInput.value = "";
  await loadMessages();
});

document.getElementById("chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("chatNameInput");
  const name = input.value.trim();
  if (!name) return;

  const id = name.toLowerCase().replace(/[^a-z0-9åäö]+/gi, "-").replace(/^-|-$/g, "") || crypto.randomUUID();
  chats.push({ id, name, members: ["Personal"] });
  activeChatId = id;
  input.value = "";
  renderChats();
  renderMembers();
  renderMessages();
});

document.getElementById("prevMonthBtn").addEventListener("click", () => {
  visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1);
  renderCalendar();
});

document.getElementById("nextMonthBtn").addEventListener("click", () => {
  visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1);
  renderCalendar();
});

document.getElementById("todayBtn").addEventListener("click", () => {
  visibleDate = new Date();
  renderCalendar();
});

document.getElementById("refreshMessagesBtn").addEventListener("click", loadMessages);

document.getElementById("closeModal").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.classList.add("hidden");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") modal.classList.add("hidden");
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
  location.href = "personal.html";
});

async function init() {
  await auth();
  renderChats();
  renderMembers();
  await loadEvents();
  await loadMessages();
  setInterval(loadMessages, 5000);
}

init();
