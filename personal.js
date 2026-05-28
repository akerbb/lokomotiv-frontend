const API = "https://lokomotiv-backend.onrender.com";

const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  message.textContent = "Loggar in...";

  try {
    const response = await fetch(`${API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || "Fel login";
      return;
    }

    if (data.mustChangePassword) {
      window.location.href = "change-password.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (error) {
    console.error(error);
    message.textContent = "Kunde inte ansluta till backend";
  }
});
