const API = "https://lokomotiv-backend.onrender.com";

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  return { message: await response.text() };
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  if (!username || !password) {
    message.textContent = "Fyll i både användarnamn och lösenord.";
    return;
  }

  loginBtn.disabled = true;
  message.textContent = "Loggar in...";

  try {
    const response = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      message.textContent = data.message || "Fel användarnamn eller lösenord.";
      return;
    }

    if (data.mustChangePassword) {
      window.location.href = "change-password.html";
      return;
    }

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    message.textContent = "Kunde inte ansluta till backend. Kontrollera CORS och att servern är igång.";
  } finally {
    loginBtn.disabled = false;
  }
});
