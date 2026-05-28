const API = "https://lokomotiv-backend.onrender.com";

const form = document.getElementById("changePasswordForm");
const message = document.getElementById("message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const oldPassword = document.getElementById("oldPassword").value;
  const newPassword = document.getElementById("newPassword").value;

  message.textContent = "Sparar...";

  try {
    const response = await fetch(`${API}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify({
        oldPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || "Kunde inte byta lösenord";
      return;
    }

    message.textContent = "Lösenordet är ändrat. Skickar dig vidare...";
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error(error);
    message.textContent = "Kunde inte ansluta till backend";
  }
});
