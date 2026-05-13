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
  const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  }

  function showFormMessage(element, type, message) {
    if (!element) return;

    element.style.display = "block";
    element.className = `form-message ${type} show`;
    element.textContent = message;
  }

  function resetSubmitButton(button) {
    if (!button) return;

    button.disabled = false;
    button.classList.remove("loading");
    button.textContent = "Skicka förfrågan";
  }

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || (systemThemeQuery.matches ? "dark" : "light");
  }

  function applyTheme(theme, themeToggle) {
    const isDark = theme === "dark";

    document.documentElement.dataset.theme = theme;
    document.body.classList.toggle("theme--dark", isDark);

    if (!themeToggle) return;

    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Byt till ljust läge" : "Byt till mörkt läge");

    const icon = $(".dark-mode-toggle__icon", themeToggle);
    if (icon) {
      icon.classList.toggle("dark-mode-toggle__icon--moon", isDark);
    }
  }

  onReady(() => {
    const menuBtn = $("#menuBtn");
    const navMenu = $("#navMenu");
    const contactForm = $("#contactForm");
    const phoneInput = $("#phone");
    const serviceDropdownBtn = $("#serviceDropdownBtn");
    const serviceOptions = $("#serviceOptions");
    const customSelect = $(".custom-select");
    const scrollTopBtn = $("#scrollTopBtn");
    const header = $("header");
    const floatingCall = $(".floating-call");
    const themeToggle = $("#themeToggle");
    const faqBot = $("#faqBot");
    const faqBotToggle = $("#faqBotToggle");
    const faqBotClose = $("#faqBotClose");
    const faqAnswer = $("#faqAnswer");
    const faqTyping = $("#faqTyping");
    const faqQuestions = $$(".faq-question");
    const navDropdown = $(".nav-dropdown");
    const navDropdownToggle = $(".nav-dropdown-toggle");
    const sections = $$("main section[id]");
    const navLinks = $$("nav a[href^='#']");

    let faqTypingTimeout = null;
    let ticking = false;
    let activeSectionId = "";

    if (!window.location.hash) {
      window.addEventListener("pageshow", () => window.scrollTo(0, 0), { once: true });
    }

    applyTheme(getPreferredTheme(), themeToggle);

    if (themeToggle) {
      themeToggle.addEventListener("click", event => {
        event.stopPropagation();

        const isDark = document.body.classList.contains("theme--dark");
        const nextTheme = isDark ? "light" : "dark";

        localStorage.setItem("theme", nextTheme);
        applyTheme(nextTheme, themeToggle);
      });
    }

    systemThemeQuery.addEventListener("change", () => {
      if (!localStorage.getItem("theme")) {
        applyTheme(getPreferredTheme(), themeToggle);
      }
    });

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

        const selectedServices = $$(".service-checkbox:checked", contactForm);
        const selectedServiceNames = selectedServices.map(service => service.value);
        const messageBox = $("#formMessage");
        const hiddenInput = $("#selectedServicesInput");
        const summaryInput = $("#mailSummary");
        const submitBtn = $("#submitFormBtn");
        const privacyConsent = $("#privacyConsent");
        const honeypot = $("#website");
        const cleanPhone = phoneInput ? phoneInput.value.replace(/\D/g, "") : "";

        if (!messageBox || !hiddenInput || !submitBtn) return;

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

        hiddenInput.value = selectedServiceNames.join(", ");

        if (summaryInput) {
          const formData = new FormData(contactForm);
          let summary = `Ny offertförfrågan från hemsidan\n================================\n\nKUNDUPPGIFTER\n--------------------------------\nNamn: ${formData.get("Namn") || "-"}\nE-post: ${formData.get("E-post") || "-"}\nTelefon: ${formData.get("Telefonnummer") || "-"}\n\nVALDA TJÄNSTER\n--------------------------------\n${selectedServiceNames.length > 0 ? selectedServiceNames.join(", ") : "Ingen specifik tjänst vald"}\n\nTJÄNSTEDETALJER\n--------------------------------\n`;

          selectedServiceNames.forEach(serviceName => {
            summary += `\n${serviceName}\n`;

            $$(`.service-extra[data-service="${CSS.escape(serviceName)}"] input, .service-extra[data-service="${CSS.escape(serviceName)}"] textarea, .service-extra[data-service="${CSS.escape(serviceName)}"] select`, contactForm)
              .forEach(field => {
                if (field.type === "file") {
                  if (field.files.length > 0) summary += `[[BILDER_${field.name}]]\n`;
                } else if (field.value.trim() !== "") {
                  const label = field.dataset.mailLabel || field.name || "Fält";
                  summary += `• ${label}: ${field.value.trim()}\n`;
                }
              });
          });

          summary += `\nMEDDELANDE\n--------------------------------\n${formData.get("Övrigt tillägg") || "Inget"}\n\nSAMTYCKE\n--------------------------------\n${formData.get("Samtycke") || "-"}\n\n================================\nSkickat från lokomotivstad.se\n`;
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
          showFormMessage(messageBox, "error", `Bilderna är för stora (${totalSizeMB.toFixed(1)} MB). Max 10 MB totalt.`);
          return;
        }

        if (totalFiles > 10) {
          showFormMessage(messageBox, "error", "Max 10 bilder kan laddas upp samtidigt.");
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
        const timeoutId = window.setTimeout(() => controller.abort(), 90000);

        try {
          const response = await fetch("https://lokomotiv-backend.onrender.com/send-email", {
            method: "POST",
            body: new FormData(contactForm),
            signal: controller.signal
          });

          if (!response.ok) {
            throw new Error(`Server svarade med status ${response.status}`);
          }

          showFormMessage(
            messageBox,
            "success",
            "✓ Tack! Din förfrågan har skickats. Vi återkommer så fort vi kan med en offert! Ha en trevlig dag :)"
          );

          contactForm.reset();
          updateServiceSelection();

          $$(".service-extra", contactForm).forEach(extraBox => {
            extraBox.classList.remove("active", "open");
            $$("input, textarea, select", extraBox).forEach(field => {
              field.disabled = false;
              if (field.type !== "file") field.value = "";
            });
          });

          contactForm.classList.add("submitted");
          contactForm.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: "start" });
        } catch (error) {
          const message = error.name === "AbortError"
            ? "Det tog för lång tid att skicka. Försök igen."
            : "Nätverksfel. Kontrollera din uppkoppling.";

          showFormMessage(messageBox, "error", message);
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
        link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
      });

      if (navDropdownToggle) {
        navDropdownToggle.classList.toggle("active", sectionId === "tjanster");
      }
    }

    function updateActiveNav() {
      if (sections.length === 0) return;

      const checkLine = window.innerHeight * 0.38;
      let currentSection = sections[0].id;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= checkLine && rect.bottom > checkLine) {
          currentSection = section.id;
        }
      });

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
          window.scrollTo({ top: 0, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
        }
      });
    }

    function isMobileHeader() {
      return window.matchMedia("(max-width: 1200px), (hover: none), (pointer: coarse)").matches;
    }

    function closeMobileMenu() {
      if (navMenu) navMenu.classList.remove("active");
      if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      if (navDropdown) navDropdown.classList.remove("open");
      if (navDropdownToggle) navDropdownToggle.setAttribute("aria-expanded", "false");
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
          }

          if (!isDropdownToggle || isDropdownItem || link.getAttribute("href")?.startsWith("#")) {
            closeMobileMenu();
          }
        });
      });

      document.addEventListener("click", event => {
        if (!event.target.closest("header")) closeMobileMenu();
      });
    }

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

    if (faqBot && faqBotClose) {
      faqBotClose.addEventListener("click", () => setFaqBotOpen(false));
    }

    faqQuestions.forEach(button => {
      button.addEventListener("click", () => {
        if (!faqAnswer) return;

        window.clearTimeout(faqTypingTimeout);

        faqQuestions.forEach(question => question.classList.remove("active"));
        button.classList.add("active");
        faqAnswer.innerHTML = "";

        if (faqTyping) faqTyping.classList.add("show");

        faqTypingTimeout = window.setTimeout(() => {
          if (faqTyping) faqTyping.classList.remove("show");
          faqAnswer.innerHTML = button.dataset.answer || "";
        }, 280);
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        setFaqBotOpen(false);
        closeMobileMenu();
      }
    });

    document.addEventListener("click", event => {
      if (!faqBot || !faqBot.classList.contains("open")) return;
      if (event.target.closest("#faqBot")) return;
      setFaqBotOpen(false);
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
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate-in");
        serviceCardObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

serviceCards.forEach((card) => {
  serviceCardObserver.observe(card);
});