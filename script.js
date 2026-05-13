// Förhindra att webbläsaren återställer gammal scroll-position vid refresh/back-forward.
// Sidan ska alltid börja högst upp om URL:en inte har en hash, t.ex. #kontakt.
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
  if (!window.location.hash) {
    window.scrollTo(0, 0);
  }
});

// =============================
// Lokomotiv Städ - JavaScript
// =============================

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");
const contactForm = document.getElementById("contactForm");
const phoneInput = document.getElementById("phone");
const serviceDropdownBtn = document.getElementById("serviceDropdownBtn");
const serviceOptions = document.getElementById("serviceOptions");
const customSelect = document.querySelector(".custom-select");
const scrollTopBtn = document.getElementById("scrollTopBtn");
const header = document.querySelector("header");

const themeToggle = document.getElementById("themeToggle");
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function getPreferredTheme() {
  const savedTheme = localStorage.getItem("theme");
  return savedTheme || (systemThemeQuery.matches ? "dark" : "light");
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("theme--dark", isDark);

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Byt till ljust läge" : "Byt till mörkt läge"
    );

    const icon = themeToggle.querySelector(".dark-mode-toggle__icon");

    if (icon) {
      icon.classList.toggle("dark-mode-toggle__icon--moon", isDark);
    }
  }
}

applyTheme(getPreferredTheme());

if (themeToggle) {
  themeToggle.addEventListener("click", event => {
    event.stopPropagation();

    const isDark = document.body.classList.contains("theme--dark");
    const nextTheme = isDark ? "light" : "dark";

    localStorage.setItem("theme", nextTheme);
    applyTheme(nextTheme);
  });
}

systemThemeQuery.addEventListener("change", () => {
  if (!localStorage.getItem("theme")) {
    applyTheme(getPreferredTheme());
  }
});

// Telefonformattering
if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    let numbers = phoneInput.value.replace(/\D/g, "").slice(0, 10);

    if (numbers.length > 6) {
      phoneInput.value = `${numbers.slice(0, 3)}-${numbers.slice(3, 6)} ${numbers.slice(6)}`;
    } else if (numbers.length > 3) {
      phoneInput.value = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      phoneInput.value = numbers;
    }
  });
}

// Tjänste-dropdown
if (serviceDropdownBtn && serviceOptions && customSelect) {
  serviceDropdownBtn.addEventListener("click", () => {
    customSelect.classList.toggle("open");
  });

  serviceOptions.addEventListener("change", () => {
    const selectedServices = document.querySelectorAll(".service-checkbox:checked");

    serviceDropdownBtn.textContent =
      selectedServices.length === 0
        ? "Välj tjänster"
        : `${selectedServices.length} valda tjänster`;

    document.querySelectorAll(".service-extra").forEach(extraBox => {
      extraBox.classList.remove("active");
    });

    selectedServices.forEach(checkbox => {
      const matchingBox = document.querySelector(
        `.service-extra[data-service="${checkbox.value}"]`
      );

      if (matchingBox) {
  matchingBox.classList.add("active", "open");
}
    });
  });

  document.addEventListener("click", event => {
    if (!customSelect.contains(event.target)) {
      customSelect.classList.remove("open");
    }
  });
}

// Kontaktformulär
if (contactForm) {
  contactForm.addEventListener("submit", async event => {
  event.preventDefault();

  console.log("Formuläret försöker skickas");

const selectedServices = document.querySelectorAll(".service-checkbox:checked");
const messageBox = document.getElementById("formMessage");
const hiddenInput = document.getElementById("selectedServicesInput");
const submitBtn = document.getElementById("submitFormBtn");    const privacyConsent = document.getElementById("privacyConsent");
    const honeypot = document.getElementById("website");
    const cleanPhone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";

    if (!messageBox || !hiddenInput || !submitBtn) {
  console.error("Saknar formMessage, selectedServicesInput eller submit-knapp");
  return;
}

    messageBox.className = "form-message";
    messageBox.style.display = "none";
    messageBox.textContent = "";

    if (honeypot && honeypot.value.trim() !== "") return;

    if (privacyConsent && !privacyConsent.checked) {
      showFormMessage(messageBox, "error", "Du behöver godkänna integritetspolicyn innan du skickar formuläret.");
      return;
    }

    if (cleanPhone.length < 7) {
      showFormMessage(messageBox, "error", "Fyll i ett giltigt telefonnummer.");
      return;
    }

    //if (selectedServices.length === 0) {
      //showFormMessage(messageBox, "error", "Välj minst en tjänst.");
      //return;
    //}

    const selectedServiceNames = Array.from(selectedServices).map(service => service.value);
    hiddenInput.value = selectedServiceNames.join(", ");

    const summaryInput = document.getElementById("mailSummary");

    if (summaryInput) {
  const formData = new FormData(contactForm);

  let summary = `Ny offertförfrågan från hemsidan
================================

KUNDUPPGIFTER
--------------------------------
Namn: ${formData.get("Namn") || "-"}
E-post: ${formData.get("E-post") || "-"}
Telefon: ${formData.get("Telefonnummer") || "-"}

VALDA TJÄNSTER
--------------------------------
${selectedServiceNames.length > 0 ? selectedServiceNames.join(", ") : "Ingen specifik tjänst vald"}

TJÄNSTEDETALJER
--------------------------------
`;

  selectedServiceNames.forEach(serviceName => {
    summary += `\n${serviceName}\n`;

    contactForm
      .querySelectorAll(
        `.service-extra[data-service="${serviceName}"] input,
         .service-extra[data-service="${serviceName}"] textarea,
         .service-extra[data-service="${serviceName}"] select`
      )
      .forEach(field => {
        if (field.type === "file") {
  if (field.files.length > 0) {
    summary += `[[BILDER_${field.name}]]\n`;
  }
} else if (field.value.trim() !== "") {
          const label = field.dataset.mailLabel || field.name || "Fält";
          summary += `• ${label}: ${field.value.trim()}\n`;
        }
      });
  });

  summary += `
MEDDELANDE
--------------------------------
${formData.get("Övrigt tillägg") || "Inget"}

SAMTYCKE
--------------------------------
${formData.get("Samtycke") || "-"}

================================
Skickat från lokomotivstad.se
`;

  summaryInput.value = summary;
}

    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitBtn.textContent = "Skickar...";

    const fileInputs = contactForm.querySelectorAll('input[type="file"]');

let totalSize = 0;
let totalFiles = 0;

fileInputs.forEach(input => {
  Array.from(input.files).forEach(file => {
    totalSize += file.size;
    totalFiles++;
  });
});

const maxSizeMB = 10;
const totalSizeMB = totalSize / (1024 * 1024);

if (totalSizeMB > maxSizeMB) {
  showFormMessage(
    messageBox,
    "error",
    `Bilderna är för stora (${totalSizeMB.toFixed(1)} MB). Max ${maxSizeMB} MB totalt.`
  );

  submitBtn.disabled = false;
  submitBtn.classList.remove("loading");
  submitBtn.textContent = "Skicka förfrågan";

  return;
}

if (totalFiles > 10) {
  showFormMessage(
    messageBox,
    "error",
    "Max 10 bilder kan laddas upp samtidigt."
  );

  submitBtn.disabled = false;
  submitBtn.classList.remove("loading");
  submitBtn.textContent = "Skicka förfrågan";

  return;
}
    try {
document.querySelectorAll(".service-extra").forEach(extraBox => {
  const isActive = extraBox.classList.contains("active");

  extraBox.querySelectorAll("input, textarea, select").forEach(field => {
    field.disabled = !isActive;
  });
});
const controller = new AbortController();

const timeout = setTimeout(() => {
  controller.abort();
}, 90000);

const response = await fetch("https://lokomotiv-backend.onrender.com/send-email", {
  method: "POST",
  body: new FormData(contactForm),
  signal: controller.signal
});

clearTimeout(timeout);

  if (response.ok) {

    showFormMessage(
      messageBox,
      "success",
      "✓ Tack! Din förfrågan har skickats. Vi återkommer så fort vi kan med en offert! Ha en trevlig dag :)"
    );

    contactForm.reset();

    if (serviceDropdownBtn) {
      serviceDropdownBtn.textContent = "Välj tjänster";
    }

    document.querySelectorAll(".service-extra").forEach(extraBox => {
      extraBox.classList.remove("active", "open");

      extraBox.querySelectorAll("input, textarea, select").forEach(field => {
        field.disabled = false;
        field.value = "";
      });
    });

    contactForm.classList.add("submitted");

contactForm.scrollIntoView({
  behavior: "smooth",
  block: "start"
});

  } else {

    showFormMessage(
      messageBox,
      "error",
      "Något gick fel. Försök igen."
    );

  }

} catch (error) {
  console.error("Fetch error:", error);

  showFormMessage(
    messageBox,
    "error",
    "Nätverksfel. Kontrollera din uppkoppling."
  );

} finally {

  submitBtn.disabled = false;
  submitBtn.classList.remove("loading");
  submitBtn.textContent = "Skicka förfrågan";

}
  });
}

function showFormMessage(element, type, message) {
  element.style.display = "block";
  element.classList.add(type, "show");
  element.textContent = message;
}

// Reveal on scroll
const revealElements = document.querySelectorAll(
  ".content-section, .about, .hero-card, .service-card, .historia-image, .contact-box, .contact-details, .social-box, .privacy-card, .privacy-hero, .service-cta, .before-after-section, .window-premium-section"
);

revealElements.forEach(element => {
  element.classList.add("reveal");
});

function revealOnScroll() {
  revealElements.forEach(element => {
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < window.innerHeight - 90) {
      element.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

// Header active link
const navLinks = document.querySelectorAll("nav > a, .nav-dropdown-toggle");

function getSections() {
  return document.querySelectorAll("main section[id]");
}

function setActiveMenuLink(sectionId) {
  navLinks.forEach(link => {
    const href = link.getAttribute("href") || "";

    link.classList.toggle(
      "active",
      href === `#${sectionId}` || href === `index.html#${sectionId}`
    );
  });
}

function updateActiveMenuLink() {
  const sections = Array.from(getSections());

  if (sections.length === 0) return;

  const headerHeight = header ? header.offsetHeight : 0;

  // Punkt i viewporten där vi avgör aktiv sektion
  const checkpoint = headerHeight + window.innerHeight * 0.28;

  let currentSection = sections[0].id;

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= checkpoint) {
      currentSection = section.id;
    }
  });

  setActiveMenuLink(currentSection);
}

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    const href = link.getAttribute("href") || "";

    if (!href.startsWith("#")) return;

    const targetId = href.replace("#", "");
    setActiveMenuLink(targetId);
  });
});

window.addEventListener("scroll", updateActiveMenuLink, {
  passive: true
});

window.addEventListener("load", updateActiveMenuLink);
window.addEventListener("resize", updateActiveMenuLink);

// Om användaren avbryter smooth-scroll manuellt
["wheel", "touchstart", "keydown"].forEach(eventName => {
  window.addEventListener(eventName, () => {
    if (!isHeaderScrolling) return;

    isHeaderScrolling = false;
    headerScrollTarget = "";
    clearTimeout(headerScrollTimeout);
    updateActiveMenuLink();
  }, { passive: true });
});

window.addEventListener("scroll", updateActiveMenuLink);
window.addEventListener("load", updateActiveMenuLink);

// Pil upp
function toggleScrollTopButton() {
  if (!scrollTopBtn) return;

  if (window.scrollY > 500 || document.body.classList.contains("privacy-body")) {
    scrollTopBtn.classList.add("show");
  } else {
    scrollTopBtn.classList.remove("show");
  }
}

if (scrollTopBtn) {
  scrollTopBtn.addEventListener("click", event => {
    if (scrollTopBtn.getAttribute("href") === "#") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

window.addEventListener("scroll", toggleScrollTopButton);
window.addEventListener("load", toggleScrollTopButton);

// Header-effekt
function updateHeaderOnScroll() {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateHeaderOnScroll);
window.addEventListener("load", updateHeaderOnScroll);

// Floating call button
const floatingCall = document.querySelector(".floating-call");

function toggleFloatingCall() {
  if (!floatingCall) return;

  if (window.scrollY > 10) {
    floatingCall.classList.add("show");
  } else {
    floatingCall.classList.remove("show");
  }
}

window.addEventListener("scroll", toggleFloatingCall);
window.addEventListener("load", toggleFloatingCall);

// Mobilmeny + Header tjänster-dropdown
const navDropdown = document.querySelector(".nav-dropdown");
const navDropdownToggle = document.querySelector(".nav-dropdown-toggle");

function isMobileHeader() {
  return window.matchMedia("(max-width: 1200px)").matches;
}

if (menuBtn && navMenu) {
  menuBtn.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    const isOpen = navMenu.classList.toggle("active");
    menuBtn.setAttribute("aria-expanded", String(isOpen));

    if (!isOpen && navDropdown && navDropdownToggle) {
      navDropdown.classList.remove("open");
      navDropdownToggle.setAttribute("aria-expanded", "false");
    }
  });

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", event => {
      const isDropdownToggle = link.classList.contains("nav-dropdown-toggle");
      const isDropdownItem = link.closest(".nav-dropdown-menu");

      if (!isMobileHeader()) return;

      if (isDropdownToggle) {
        if (!navDropdown || !navDropdownToggle) return;

        const dropdownIsOpen = navDropdown.classList.contains("open");

        if (!dropdownIsOpen) {
          event.preventDefault();
          event.stopPropagation();

          navDropdown.classList.add("open");
          navDropdownToggle.setAttribute("aria-expanded", "true");
          return;
        }

        // Andra klicket på Tjänster:
        // låt href="#tjanster" fungera, men stäng mobilmenyn efter klicket
        navMenu.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
        navDropdown.classList.remove("open");
        navDropdownToggle.setAttribute("aria-expanded", "false");
        return;
      }

      if (isDropdownItem) {
        navMenu.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");

        if (navDropdown && navDropdownToggle) {
          navDropdown.classList.remove("open");
          navDropdownToggle.setAttribute("aria-expanded", "false");
        }

        return;
      }

      navMenu.classList.remove("active");
      menuBtn.setAttribute("aria-expanded", "false");

      if (navDropdown && navDropdownToggle) {
        navDropdown.classList.remove("open");
        navDropdownToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  document.addEventListener("click", event => {
    if (event.target.closest("header")) return;

    navMenu.classList.remove("active");
    menuBtn.setAttribute("aria-expanded", "false");

    if (navDropdown && navDropdownToggle) {
      navDropdown.classList.remove("open");
      navDropdownToggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll(".before-after-slider").forEach(slider => {
  const input = slider.querySelector(".slider-input");
  const after = slider.querySelector(".after-wrapper");
  const line = slider.querySelector(".slider-line");

  if (!input || !after || !line) return;

  function update() {
    const value = input.value;
    after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
    line.style.left = `${value}%`;
  }

  input.addEventListener("input", update);
  input.addEventListener("change", update);

  update();
});

// Mouse glow background
const mouseGlow = document.querySelector(".mouse-glow");

if (mouseGlow) {
  let currentX = window.innerWidth / 2;
  let currentY = window.innerHeight / 2;

  let targetX = currentX;
  let targetY = currentY;

  window.addEventListener("mousemove", event => {
    targetX = event.clientX;
    targetY = event.clientY;

    mouseGlow.style.opacity = "1";
  });

  function animateGlow() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    mouseGlow.style.transform =
      `translate(${currentX - 325}px, ${currentY - 325}px)`;

    requestAnimationFrame(animateGlow);
  }

  animateGlow();
}

// Öppna/stäng detaljer för valda tjänster
document.querySelectorAll(".service-extra-toggle").forEach(button => {
  button.addEventListener("click", () => {
    const extraBox = button.closest(".service-extra");

    if (!extraBox) return;

    extraBox.classList.toggle("open");
  });
});

// FAQ bot
const faqBot = document.getElementById("faqBot");

const faqBotToggle = document.getElementById("faqBotToggle");
const faqBotClose = document.getElementById("faqBotClose");
const faqAnswer = document.getElementById("faqAnswer");
const faqTyping = document.getElementById("faqTyping");
const faqQuestions = document.querySelectorAll(".faq-question");
let faqTypingTimeout;

function setFaqBotOpen(isOpen) {
  if (!faqBot) return;

  faqBot.classList.toggle("open", isOpen);

  if (faqBotToggle) {
    faqBotToggle.setAttribute("aria-expanded", String(isOpen));
  }
}

if (faqBot && faqBotToggle) {
  faqBotToggle.addEventListener("click", () => {
    setFaqBotOpen(!faqBot.classList.contains("open"));
  });
}

if (faqBotClose && faqBot) {
  faqBotClose.addEventListener("click", () => {
    setFaqBotOpen(false);
  });
}

faqQuestions.forEach(button => {
  button.addEventListener("click", () => {
    if (!faqAnswer) return;

    clearTimeout(faqTypingTimeout);

    faqQuestions.forEach(question => question.classList.remove("active"));
    button.classList.add("active");

    faqAnswer.innerHTML = "";

    if (faqTyping) {
      faqTyping.classList.add("show");
    }

    faqTypingTimeout = setTimeout(() => {
      if (faqTyping) {
        faqTyping.classList.remove("show");
      }

      faqAnswer.innerHTML = button.dataset.answer || "";
    }, 420);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    setFaqBotOpen(false);
  }
});

document.addEventListener("click", event => {
  if (!faqBot || !faqBot.classList.contains("open")) return;
  if (event.target.closest("#faqBot")) return;

  setFaqBotOpen(false);
});
