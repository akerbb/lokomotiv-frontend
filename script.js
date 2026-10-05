// =============================
// Lokomotiv Städ - optimerad JavaScript
// =============================

(() => {
  "use strict";

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const BACKEND_URL = "https://lokomotiv-backend.onrender.com/api/contact";

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

function showFormMessage(element, type, message, shouldScroll = false) {
  if (!element) return;

  // Viktigt: tidigare submit kan ha lämnat en inline display:none.
  // Inline-stilen vinner över CSS-klassen .show, så ta bort den här.
  element.style.removeProperty("display");

  element.className = `form-message ${type} show`;
  element.setAttribute("role", type === "error" ? "alert" : "status");
  element.setAttribute("aria-live", type === "error" ? "assertive" : "polite");

  element.innerHTML = `
    <span class="form-message__icon" aria-hidden="true">
      ${type === "success" ? "✓" : "!"}
    </span>

    <span class="form-message__text">
      ${escapeMessage(message)}
    </span>
  `;

  if (shouldScroll) {
    element.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "center"
    });
  }
}

function clearFieldErrors(form) {
  if (!form) return;

  $$(".field-error-message", form).forEach(element => {
    element.remove();
  });

  $$(".field-error", form).forEach(element => {
    element.classList.remove("field-error");
    element.removeAttribute("aria-invalid");
  });
}

function showFieldError(field, message, options = {}) {
  if (!field) return;

  const {
    container = null,
    focus = true
  } = options;

  const target = container || field;

  field.classList.add("field-error");
  field.setAttribute("aria-invalid", "true");

  const error = document.createElement("div");

  error.className = "field-error-message";
  error.setAttribute("role", "alert");

  error.innerHTML = `
    <span class="field-error-message__icon" aria-hidden="true">!</span>
    <span>${escapeMessage(message)}</span>
  `;

  target.insertAdjacentElement("afterend", error);

  target.scrollIntoView({
    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    block: "center"
  });

  if (focus) {
    window.setTimeout(() => {
      field.focus({ preventScroll: true });
    }, prefersReducedMotion.matches ? 0 : 350);
  }
}

function escapeMessage(value) {
  const div = document.createElement("div");
  div.textContent = String(value);
  return div.innerHTML;
}

function isValidEmail(value) {
  const email = String(value || "").trim();

  // Praktisk webbvalidering: lokal del + domän + TLD på minst 2 bokstäver.
  // Exempel: namn@gmail.com = giltig, asd@g.c = ogiltig.
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,63}$/.test(email);
}

function clearSingleFieldError(field) {
  if (!field) return;

  field.classList.remove("field-error");
  field.removeAttribute("aria-invalid");

  const next = field.nextElementSibling;
  if (next && next.classList.contains("field-error-message")) {
    next.remove();
  }
}

function hideFormMessage(element) {
  if (!element) return;

  element.className = "form-message";
  element.innerHTML = "";
  element.style.removeProperty("display");
  element.setAttribute("role", "status");
  element.setAttribute("aria-live", "polite");
}

function resetTurnstile() {
  if (!window.turnstile) return;

  try {
    window.turnstile.reset();
  } catch (error) {
    console.warn("Turnstile kunde inte återställas:", error);
  }
}

  function resetSubmitButton(button) {
    if (!button) return;

    button.disabled = false;
    button.classList.remove("loading");
    button.textContent = "Skicka förfrågan";
  }

  onReady(() => {
    const menuBtn = $("#menuBtn");
    const navMenu = $("#navMenu");
    const contactForm = $("#contactForm");
    const nameInput = $("#name");
    const emailInput = $("#email");
    const phoneInput = $("#phone");
    const serviceDropdownBtn = $("#serviceDropdownBtn");
    const serviceOptions = $("#serviceOptions");
    const customSelect = $(".custom-select");
    const scrollTopBtn = $("#scrollTopBtn");
    const header = $("header");
    const floatingCall = $(".floating-call");
    const navDropdown = $(".nav-dropdown");
    const navDropdownToggle = $(".nav-dropdown-toggle");
    const sections = $$("main section[id]");
    const navLinks = $$("nav a[href*='#']");

    let ticking = false;
    let activeSectionId = "";

    if (!window.location.hash) {
      window.addEventListener("pageshow", () => window.scrollTo(0, 0), { once: true });
    }
    if (phoneInput) {
      phoneInput.addEventListener("input", () => {
        const numbers = phoneInput.value.replace(/\D/g, "").slice(0, 10);

        if (numbers.length > 6) {
          phoneInput.value = `${numbers.slice(0, 3)}-${numbers.slice(3, 6)} ${numbers.slice(6)}`;
        } else if (numbers.length > 3) {
          phoneInput.value = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
          phoneInput.value = numbers;
        }
      });
    }

    [nameInput, emailInput, phoneInput].forEach(field => {
      if (!field) return;

      field.addEventListener("input", () => {
        clearSingleFieldError(field);
      });
    });

    function updateServiceSelection() {
      if (!serviceDropdownBtn || !contactForm) return;

      const selectedServices = $$(".service-checkbox:checked", contactForm);

      serviceDropdownBtn.textContent =
        selectedServices.length === 0 ? "Välj tjänster" : `${selectedServices.length} valda tjänster`;

      $$(".service-extra", contactForm).forEach(extraBox => {
        extraBox.classList.remove("active", "open");
      });

      selectedServices.forEach(checkbox => {
        const matchingBox = $(`.service-extra[data-service="${CSS.escape(checkbox.value)}"]`, contactForm);
        if (matchingBox) {
          matchingBox.classList.add("active", "open");
        }
      });
    }

    if (serviceDropdownBtn && serviceOptions && customSelect) {
      serviceDropdownBtn.addEventListener("click", event => {
        event.stopPropagation();
        customSelect.classList.toggle("open");
      });

      serviceOptions.addEventListener("change", updateServiceSelection);

      document.addEventListener("click", event => {
        if (!customSelect.contains(event.target)) {
          customSelect.classList.remove("open");
        }
      });
    }

    $$(".service-extra-toggle").forEach(button => {
      button.addEventListener("click", () => {
        const extraBox = button.closest(".service-extra");
        if (extraBox) extraBox.classList.toggle("open");
      });
    });

    if (contactForm) {
      contactForm.addEventListener("submit", async event => {
  event.preventDefault();

  clearFieldErrors(contactForm);

        const selectedServices = $$(".service-checkbox:checked", contactForm);
        const selectedServiceNames = selectedServices.map(service => service.value);
        const messageBox = $("#formMessage");
        const hiddenInput = $("#selectedServicesInput");
        const summaryInput = $("#mailSummary");
        const submitBtn = $("#submitFormBtn");
        const privacyConsent = $("#privacyConsent");
        const honeypot = $("#website");
        const nameValue = nameInput ? nameInput.value.trim() : "";
        const emailValue = emailInput ? emailInput.value.trim() : "";
        const cleanPhone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";

        if (!messageBox || !hiddenInput || !submitBtn) return;

        hideFormMessage(messageBox);

        if (honeypot && honeypot.value.trim() !== "") return;

        if (!nameValue) {
          showFieldError(
            nameInput,
            "Fyll i ditt namn."
          );
          return;
        }

        if (!isValidEmail(emailValue)) {
          showFieldError(
            emailInput,
            "Fyll i en giltig e-postadress, till exempel namn@gmail.com."
          );
          return;
        }

        if (cleanPhone.length < 7) {
          showFieldError(
            phoneInput,
            "Fyll i ett giltigt telefonnummer."
          );
          return;
        }

        if (privacyConsent && !privacyConsent.checked) {
          const privacyBox = privacyConsent.closest(".privacy-consent");

          showFieldError(
            privacyConsent,
            "Godkänn integritetspolicyn innan du skickar.",
            {
              container: privacyBox,
              focus: true
            }
          );

          return;
        }

        hiddenInput.value = selectedServiceNames.join(", ");

        if (summaryInput) {
          const formData = new FormData(contactForm);

          let summary =
            `Ny offertförfrågan från hemsidan\n` +
            `================================\n\n` +
            `KUNDUPPGIFTER\n` +
            `--------------------------------\n` +
            `Namn: ${formData.get("Namn") || "-"}\n` +
            `E-post: ${formData.get("E-post") || "-"}\n` +
            `Telefon: ${formData.get("Telefonnummer") || "-"}\n\n` +
            `VALDA TJÄNSTER\n` +
            `--------------------------------\n` +
            `${selectedServiceNames.length > 0 ? selectedServiceNames.join(", ") : "Ingen specifik tjänst vald"}\n\n` +
            `TJÄNSTEDETALJER\n` +
            `--------------------------------\n`;

          selectedServiceNames.forEach(serviceName => {
            summary += `\n${serviceName}\n`;

            $$(
              `.service-extra[data-service="${CSS.escape(serviceName)}"] input, ` +
              `.service-extra[data-service="${CSS.escape(serviceName)}"] textarea, ` +
              `.service-extra[data-service="${CSS.escape(serviceName)}"] select`,
              contactForm
            ).forEach(field => {
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

          summary +=
            `\nMEDDELANDE\n` +
            `--------------------------------\n` +
            `${formData.get("Övrigt tillägg") || "Inget"}\n\n` +
            `SAMTYCKE\n` +
            `--------------------------------\n` +
            `${formData.get("Samtycke") || "-"}\n\n` +
            `================================\n` +
            `Skickat från lokomotivstad.se\n`;

          summaryInput.value = summary;
        }

        const fileInputs = $$("input[type='file']", contactForm);
        let totalSize = 0;
        let totalFiles = 0;

        fileInputs.forEach(input => {
          Array.from(input.files).forEach(file => {
            totalSize += file.size;
            totalFiles += 1;
          });
        });

        const totalSizeMB = totalSize / (1024 * 1024);

        if (totalSizeMB > 10) {
  const uploadArea = $("#serviceExtraFields");

  showFieldError(
    fileInputs.find(input => input.files.length > 0),
    `Bilderna är totalt ${totalSizeMB.toFixed(1)} MB. Max tillåtet är 10 MB.`,
    {
      container: uploadArea,
      focus: false
    }
  );

  return;
}

if (totalFiles > 10) {
  const uploadArea = $("#serviceExtraFields");

  showFieldError(
    fileInputs.find(input => input.files.length > 0),
    "Du kan ladda upp högst 10 bilder totalt.",
    {
      container: uploadArea,
      focus: false
    }
  );

  return;
}

        submitBtn.disabled = true;
        submitBtn.classList.add("loading");
        submitBtn.textContent = "Skickar...";

        $$(".service-extra", contactForm).forEach(extraBox => {
          const isActive = extraBox.classList.contains("active");
          $$("input, textarea, select", extraBox).forEach(field => {
            field.disabled = !isActive;
          });
        });

        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 30000);

        try {
          const response = await fetch(BACKEND_URL, {
            method: "POST",
            mode: "cors",
            body: new FormData(contactForm),
            signal: controller.signal
          });

          let rawText = "";
          let result = null;

          try {
            rawText = await response.text();
            result = rawText ? JSON.parse(rawText) : null;
          } catch {
            result = null;
          }

          if (!response.ok) {
            console.error("Backend error:", {
              status: response.status,
              body: result || rawText
            });

            const serverMessage =
              result?.error?.message ||
              result?.error ||
              result?.message ||
              rawText ||
              `Serverfel ${response.status}`;

              if (response.status === 403) {
  resetTurnstile();

  showFormMessage(
    messageBox,
    "error",
    serverMessage || "Säkerhetskontrollen misslyckades. Försök igen.",
    true
  );

  return;
}

            if (
              response.status === 400 &&
              /e-?post|email|reply[_ -]?to/i.test(String(serverMessage))
            ) {
              showFieldError(
                emailInput,
                "Fyll i en giltig e-postadress, till exempel namn@gmail.com."
              );
              return;
            }
resetTurnstile();
            showFormMessage(
              messageBox,
              "error",
              "Något gick fel när förfrågan skickades. Försök igen om en stund eller kontakta oss via telefon eller e-post.",
              true
            );

            return;
          }

          // Backend har bekräftat att meddelandet skickades.
          // Visa en separat tack-sida i stället för ett successmeddelande i formuläret.
sessionStorage.setItem(
  "lokomotivContactSubmittedAt",
  String(Date.now())
);

window.location.assign("/thanks.html");          return;

        } catch (error) {
  console.error("Fetch failed:", error);

  resetTurnstile();

          const message = error.name === "AbortError"
  ? "Det tog för lång tid att skicka förfrågan. Kontrollera din anslutning och försök igen."
  : "Vi kunde inte skicka förfrågan just nu. Kontrollera din internetanslutning och försök igen.";

showFormMessage(
  messageBox,
  "error",
  message,
  true
);

        } finally {
          window.clearTimeout(timeoutId);
          resetSubmitButton(submitBtn);

          $$(".service-extra input, .service-extra textarea, .service-extra select", contactForm).forEach(field => {
            field.disabled = false;
          });
        }
      });
    }

    const revealElements = $$([
      ".content-section",
      ".about",
      ".hero-card",
      ".service-card",
      ".historia-image",
      ".contact-box",
      ".contact-details",
      ".social-box",
      ".privacy-card",
      ".privacy-hero",
      ".service-cta",
      ".before-after-section",
      ".window-premium-section"
    ].join(", "));

    revealElements.forEach(element => element.classList.add("reveal"));

    if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

      revealElements.forEach(element => revealObserver.observe(element));
    } else {
      revealElements.forEach(element => element.classList.add("show"));
    }

    function setActiveNav(sectionId) {
      if (!sectionId || sectionId === activeSectionId) return;

      activeSectionId = sectionId;

      navLinks.forEach(link => {
        let linkHash = "";
        try {
          linkHash = new URL(link.getAttribute("href"), window.location.href).hash;
        } catch {
          linkHash = "";
        }

        link.classList.toggle("active", linkHash === `#${sectionId}`);
      });

      if (navDropdownToggle) {
        navDropdownToggle.classList.toggle("active", sectionId === "tjanster");
      }
    }

    function updateActiveNav() {
      if (sections.length === 0) return;

      const checkLine = window.innerHeight * 0.38;
      let currentSection = sections[0].id;
      const pageBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const isAtPageBottom = pageBottom >= documentHeight - 4;

      if (isAtPageBottom) {
        currentSection = sections[sections.length - 1].id;
      } else {
        sections.forEach(section => {
          const rect = section.getBoundingClientRect();
          if (rect.top <= checkLine && rect.bottom > checkLine) {
            currentSection = section.id;
          }
        });
      }

      setActiveNav(currentSection);
    }

    function updateScrollUI() {
      const scrolledY = window.scrollY;

      if (header) header.classList.toggle("scrolled", scrolledY > 40);
      if (scrollTopBtn) scrollTopBtn.classList.toggle("show", scrolledY > 500 || document.body.classList.contains("privacy-body"));
      if (floatingCall) floatingCall.classList.toggle("show", scrolledY > 10);

      updateActiveNav();
      ticking = false;
    }

    function requestScrollUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateScrollUI);
    }

    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("resize", requestScrollUpdate, { passive: true });
    window.addEventListener("load", requestScrollUpdate, { once: true });
    requestScrollUpdate();

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener("click", event => {
        if (scrollTopBtn.getAttribute("href") === "#" || scrollTopBtn.getAttribute("href") === "#hem") {
          event.preventDefault();
          window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion.matches ? "auto" : "smooth"
          });
        }
      });
    }

    function isMobileHeader() {
      return window.matchMedia("(max-width: 1200px), (hover: none), (pointer: coarse)").matches;
    }

    function closeMobileMenu() {
      if (navMenu) navMenu.classList.remove("active");

      if (menuBtn) {
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.setAttribute("aria-label", "Öppna meny");
      }

      document.body.classList.remove("mobile-menu-open");

      if (navDropdown) navDropdown.classList.remove("open");
      if (navDropdownToggle) navDropdownToggle.setAttribute("aria-expanded", "false");
    }

    if (menuBtn && navMenu) {
      menuBtn.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        const isOpen = navMenu.classList.toggle("active");

        menuBtn.setAttribute("aria-expanded", String(isOpen));
        menuBtn.setAttribute("aria-label", isOpen ? "Stäng meny" : "Öppna meny");
        document.body.classList.toggle("mobile-menu-open", isOpen);

        if (!isOpen && navDropdown && navDropdownToggle) {
          navDropdown.classList.remove("open");
          navDropdownToggle.setAttribute("aria-expanded", "false");
        }
      });

      $$("a", navMenu).forEach(link => {
        link.addEventListener("click", event => {
          if (!isMobileHeader()) return;

          const isDropdownToggle = link.classList.contains("nav-dropdown-toggle");
          const isDropdownItem = Boolean(link.closest(".nav-dropdown-menu"));

          if (isDropdownToggle && navDropdown && navDropdownToggle) {
            const dropdownIsOpen = navDropdown.classList.contains("open");

            if (!dropdownIsOpen) {
              event.preventDefault();
              event.stopPropagation();
              navDropdown.classList.add("open");
              navDropdownToggle.setAttribute("aria-expanded", "true");
              return;
            }

            // Andra trycket på Tjänster går till tjänstesektionen och stänger menyn.
            closeMobileMenu();
            return;
          }

          if (!isDropdownToggle || isDropdownItem) {
            closeMobileMenu();
          }
        });
      });

      document.addEventListener("click", event => {
        if (!event.target.closest("header")) closeMobileMenu();
      });
    }



    /* =========================================
       Navigering mellan undersidor och startsidans sektioner
       ========================================= */
    const homeSectionIds = new Set([
      "hem",
      "tjanster",
      "historia",
      "kvalitet",
      "sociala-medier",
      "kontakt"
    ]);

    document.addEventListener("click", event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const rawHref = link.getAttribute("href");
      if (!rawHref || rawHref === "#") return;

      const targetId = decodeURIComponent(rawHref.slice(1));
      if (!homeSectionIds.has(targetId)) return;

      // Om sektionen inte finns på aktuell sida ligger den på index.html.
      if (!document.getElementById(targetId)) {
        event.preventDefault();
        closeMobileMenu();
        window.location.href = `index.html#${encodeURIComponent(targetId)}`;
      }
    });

    function alignCurrentHashTarget() {
      if (!window.location.hash) return;

      const targetId = decodeURIComponent(window.location.hash.slice(1));
      const target = document.getElementById(targetId);
      if (!target) return;

      // scroll-padding-top i CSS tar hänsyn till den fasta headern.
      target.scrollIntoView({
        behavior: "auto",
        block: "start"
      });
    }

    window.addEventListener("load", () => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(alignCurrentHashTarget);
      });
    }, { once: true });

    $$(".before-after-slider").forEach(slider => {
      const input = $(".slider-input", slider);
      const after = $(".after-wrapper", slider);
      const line = $(".slider-line", slider);

      if (!input || !after || !line) return;

      let sliderTicking = false;

      function updateSlider() {
        const value = Number(input.value) || 50;
        after.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        line.style.left = `${value}%`;
        sliderTicking = false;
      }

      function requestSliderUpdate() {
        if (sliderTicking) return;
        sliderTicking = true;
        window.requestAnimationFrame(updateSlider);
      }

      input.addEventListener("input", requestSliderUpdate, { passive: true });
      input.addEventListener("change", requestSliderUpdate);
      updateSlider();
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    });

    document.addEventListener("touchend", event => {
      const touchedElement = event.target.closest("a, button");
      if (!touchedElement) return;

      window.setTimeout(() => {
        touchedElement.blur();
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }
      }, 80);
    }, { passive: true });
  });
})();

const serviceCards = document.querySelectorAll(".service-card");

const serviceCardObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        serviceCardObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

serviceCards.forEach(card => {
  serviceCardObserver.observe(card);
});

// Tillgängliga, beroendefria innehållssliders.
(() => {
  "use strict";

  function initSlider(slider) {
    const slides = Array.from(slider.querySelectorAll(".blog-slider__item"));
    const pagination = slider.querySelector(".blog-slider__pagination");
    if (slides.length < 2 || !pagination) return;

    let activeIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains("is-active")));
    let touchStartX = 0;

    const bullets = slides.map((slide, index) => {
      const bullet = document.createElement("button");
      bullet.type = "button";
      bullet.className = "blog-slider__bullet";
      bullet.setAttribute("aria-label", `Visa sida ${index + 1} av ${slides.length}`);
      bullet.addEventListener("click", () => showSlide(index));
      pagination.appendChild(bullet);
      return bullet;
    });

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));

        slide.querySelectorAll("a, button").forEach(control => {
          control.tabIndex = isActive ? 0 : -1;
        });
      });

      bullets.forEach((bullet, bulletIndex) => {
        const isActive = bulletIndex === activeIndex;
        bullet.classList.toggle("is-active", isActive);
        bullet.setAttribute("aria-current", isActive ? "true" : "false");
      });
    }

    slider.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      showSlide(activeIndex + direction);
      bullets[activeIndex].focus();
    });

    slider.addEventListener("touchstart", event => {
      touchStartX = event.changedTouches[0].clientX;
    }, { passive: true });

    slider.addEventListener("touchend", event => {
      const distance = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(distance) >= 50) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    }, { passive: true });

    showSlide(activeIndex);
  }

  function initSliders() {
    document.querySelectorAll(".blog-slider").forEach(initSlider);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSliders, { once: true });
  } else {
    initSliders();
  }
})();

/* Historia – markera passerade steg när loket faktiskt passerar dem */
(() => {
  const history = document.querySelector("#historia .cp-history__inner");
  if (!history) return;

  const steps = [...history.querySelectorAll(".cp-history__step")];
  const radios = [...history.querySelectorAll('input[type="radio"]')];

  const train = [...history.children].find(
    el => el.classList.contains("cp-history__status")
  );

  if (!train || !steps.length) return;

  let frame = null;
  let syncing = false;

  function syncPassedSteps() {
    const trainRect = train.getBoundingClientRect();
    const trainX = trainRect.left + trainRect.width / 2;

    const activeIndex = radios.findIndex(radio => radio.checked);

    steps.forEach((step, index) => {
      const rect = step.getBoundingClientRect();
      const stepX = rect.left + rect.width / 2;

      /* Passerad först när lokets mitt faktiskt gått förbi cirkeln */
      const passed = trainX > stepX + 2 && index !== activeIndex;

      step.classList.toggle("is-passed", passed);
    });
  }

  function tick() {
    syncPassedSteps();

    if (syncing) {
      frame = requestAnimationFrame(tick);
    }
  }

  function startSync() {
    syncing = true;

    if (frame) cancelAnimationFrame(frame);
    tick();

    /* Bara säkerhetsstopp – påverkar inte när cirklarna markeras */
    setTimeout(() => {
      syncing = false;
      syncPassedSteps();
    }, 1200);
  }

  radios.forEach(radio => {
    radio.addEventListener("change", startSync);
  });

  train.addEventListener("transitionend", event => {
    if (event.propertyName !== "left") return;

    syncing = false;

    if (frame) cancelAnimationFrame(frame);

    syncPassedSteps();
  });

  syncPassedSteps();
})();