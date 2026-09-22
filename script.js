document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".desktop-menu");

  // Hamburger menu
  if (menuToggle) {
    const menuPanel = document.querySelector(".menu-panel");
    const menuClose = document.querySelector(".menu-close");
    const brand = document.querySelector(".nav .brand");
    let closeFallbackTimer = null;
    let closeFinalized = false;

    menuToggle.setAttribute("aria-expanded", "false");

    const replayNavReturn = () => {
      const body = document.body;

      body.classList.add("nav-return-pending");
      if (brand) brand.classList.remove("brand-returning");
      menuToggle.classList.remove("menu-toggle-returning");

      void menuToggle.offsetWidth;

      window.requestAnimationFrame(() => {
        if (brand) brand.classList.add("brand-returning");
        menuToggle.classList.add("menu-toggle-returning");
        body.classList.remove("nav-return-pending");

        if (brand) {
          brand.addEventListener(
            "animationend",
            () => brand.classList.remove("brand-returning"),
            { once: true }
          );
        }

        menuToggle.addEventListener(
          "animationend",
          () => menuToggle.classList.remove("menu-toggle-returning"),
          { once: true }
        );
      });
    };

    const finalizeDesktopClose = () => {
      if (closeFinalized) return;
      closeFinalized = true;
      window.clearTimeout(closeFallbackTimer);

      const body = document.body;
      body.classList.add("nav-return-pending");
      body.classList.remove("menu-open", "menu-closing");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", document.documentElement.lang === "id" ? "Buka menu" : "Open menu");
      if (menuPanel) menuPanel.setAttribute("aria-hidden", "true");

      replayNavReturn();
    };

    const closeDesktopMenu = () => {
      const body = document.body;
      if (!body.classList.contains("menu-open") || body.classList.contains("menu-closing")) return;

      closeFinalized = false;
      body.classList.add("menu-closing");
      menuToggle.setAttribute("aria-expanded", "false");

      closeFallbackTimer = window.setTimeout(finalizeDesktopClose, 700);
    };

    if (menuPanel) {
      menuPanel.addEventListener("transitionend", (event) => {
        if (
          event.target === menuPanel &&
          event.propertyName === "height" &&
          document.body.classList.contains("menu-closing")
        ) {
          finalizeDesktopClose();
        }
      });
    }

    menuToggle.addEventListener("click", () => {
      const body = document.body;
      if (body.classList.contains("menu-open") || body.classList.contains("menu-closing")) return;

      window.clearTimeout(closeFallbackTimer);
      closeFinalized = false;
      body.classList.remove("nav-return-pending");
      if (brand) brand.classList.remove("brand-returning");
      menuToggle.classList.remove("menu-toggle-returning");

      body.classList.add("menu-open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", document.documentElement.lang === "id" ? "Tutup menu" : "Close menu");
      if (menuPanel) menuPanel.setAttribute("aria-hidden", "false");
    });

    if (menuClose) {
      menuClose.addEventListener("click", closeDesktopMenu);
    }
  }

  // Philosophy one-time reveal
  const philosophyText = document.querySelector(".intro-main .display-text");

  if (philosophyText) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            philosophyText.classList.add("is-visible");
            obs.unobserve(philosophyText);
          }
        });
      },
      {
        threshold:0.15
      }
    );

    observer.observe(philosophyText);
  }
});

// Separate setup keeps an error in another component from hiding the services.
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#services");
  if (!section) return;
  const cards = Array.from(section.querySelectorAll(".service-card"));
  if (!cards.length) return;

  let observer;
  let revealed = false;
  const finish = () => {
    section.classList.remove("services-reveal-ready");
    cards.forEach((card) => {
      if (!card.classList.contains("is-visible")) card.classList.add("is-visible");
    });
  };

  try {
    if (
      typeof window.IntersectionObserver !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finish();
      return;
    }

    // Match the CSS single-column breakpoint: reveal each mobile card in view.
    if (window.matchMedia("(max-width: 800px)").matches) {
      const seen = new Set();
      observer = new IntersectionObserver((entries) => {
        try {
          entries.forEach((entry) => {
            if (!entry.isIntersecting || seen.has(entry.target)) return;
            seen.add(entry.target);
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          });
          if (seen.size === cards.length) {
            observer.disconnect();
            // Preserve the last card's full 2.2-second transition.
            window.setTimeout(finish, 2400);
          }
        } catch (error) {
          finish();
          observer.disconnect();
        }
      }, { threshold: 0.15 });

      cards.forEach((card) => observer.observe(card));
      section.classList.add("services-reveal-ready");
      section.getBoundingClientRect();
      return;
    }

    observer = new IntersectionObserver((entries) => {
      if (revealed || !entries.some((entry) => entry.isIntersecting)) return;
      revealed = true;
      // Release hidden state even if a stagger callback fails.
      window.setTimeout(finish, (cards.length - 1) * 180 + 2400);
      try {
        observer.disconnect();
        cards.forEach((card, index) => {
          window.setTimeout(() => {
            try {
              card.classList.add("is-visible");
            } catch (error) {
              finish();
            }
          }, index * 180);
        });
      } catch (error) {
        finish();
      }
    }, { threshold: 0 });

    observer.observe(section);
    section.classList.add("services-reveal-ready");
    // Commit the hidden start position before a possible initial intersection.
    section.getBoundingClientRect();
  } catch (error) {
    finish();
    if (observer) observer.disconnect();
  }
});

// Two-press feedback; the second press can happen anytime within 2.5 seconds.
document.addEventListener("DOMContentLoaded", () => {
  const DOUBLE_PRESS_WINDOW = 2500;

  document.querySelectorAll("#services .service-card").forEach((card) => {
    let popTimer = null;
    let doublePressTimer = null;
    let lastPressTime = 0;

    const resetPop = () => {
      window.clearTimeout(popTimer);
      popTimer = null;
      card.classList.remove("is-pressed");
    };

    const resetDoublePress = () => {
      window.clearTimeout(doublePressTimer);
      doublePressTimer = null;
      lastPressTime = 0;
    };

    const pop = () => {
      resetPop();
      card.classList.add("is-pressed");
      // Keep the card raised for one second, independent of finger/mouse release.
      popTimer = window.setTimeout(resetPop, 1000);
    };

    const registerPress = () => {
      const now = Date.now();

      if (lastPressTime && now - lastPressTime <= DOUBLE_PRESS_WINDOW) {
        resetDoublePress();
        pop();
        return;
      }

      lastPressTime = now;
      window.clearTimeout(doublePressTimer);
      doublePressTimer = window.setTimeout(resetDoublePress, DOUBLE_PRESS_WINDOW);
    };

    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute(
      "aria-label",
      card.querySelector("h2").innerText.replace(/\s+/g, " ").trim()
    );

    card.addEventListener("pointerup", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      registerPress();
    });

    card.addEventListener("pointercancel", resetDoublePress);

    card.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      if (!event.repeat) registerPress();
    });

    card.addEventListener("keyup", (event) => {
      if (event.key === " " || event.key === "Enter") event.preventDefault();
    });

    window.addEventListener("blur", () => {
      resetDoublePress();
      resetPop();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        resetDoublePress();
        resetPop();
      }
    });

    card.addEventListener("contextmenu", (event) => {
      if (event.pointerType === "touch" || popTimer !== null) {
        event.preventDefault();
      }
    });
  });
});

// Translate existing text nodes so reveal animations and interactive elements survive.
document.addEventListener("DOMContentLoaded", () => {
  const group = document.querySelector(".menu-language");
  const panel = document.querySelector(".menu-panel");
  if (!group || !panel) return;
  const trigger = group.querySelector(".menu-globe");
  const options = group.querySelector(".language-options");
  const translations = {
    "Arvella Landscape — Crafted Landscapes": "Arvella Landscape — Taman yang Dirancang Sepenuh Hati",
    "About": "Tentang kami",
    "Services": "Layanan",
    "Selected Work": "Karya Pilihan",
    "Work": "Karya",
    "Contact": "Kontak",
    "Start a project": "Mulai proyek",
    "GOAL & MISSION": "TUJUAN & MISI",
    "SERVICE AREA": "AREA LAYANAN",
    "PORTFOLIO": "PORTOFOLIO",
    "Languages": "Bahasa",
    "Indonesian": "Indonesia",
    "English": "Inggris",
    "LANDSCAPE DESIGN": "DESAIN",
    "BUILD": "PEMBUATAN",
    "CARE": "PERAWATAN TAMAN",
    "Spaces": "Ruang",
    "that feel": "yang terasa",
    "alive.": "hidup.",
    "Thoughtful landscapes shaped around the way you live, work, and breathe.": "Taman yang dirancang selaras dengan cara Anda hidup, bekerja, dan menikmati keseharian.",
    "Explore our work": "Jelajahi karya kami",
    "Based in Bekasi": "Berbasis di Bekasi",
    "Since 2020": "Sejak 2020",
    "01 / PHILOSOPHY": "01 / FILOSOFI",
    "We create": "Kami menciptakan",
    "quietly distinctive": "taman berkarakter",
    "landscapes where architecture and nature belong to the same conversation.": "yang menyatukan arsitektur dan alam dalam harmoni.",
    "From intimate courtyards to expansive estates, every detail is considered for beauty, function, and longevity.": "Dari halaman mungil hingga lahan luas, setiap detail dirancang untuk keindahan, fungsi, dan ketahanan.",
    "Discover our approach": "Kenali pendekatan kami",
    "02 / WHAT WE DO": "02 / LAYANAN KAMI",
    "Landscape": "Taman",
    "Design": "Desain",
    "Build": "Pembuatan",
    "Garden": "Taman",
    "Care": "Perawatan",
    "From concept to planting palette, we translate your space into a landscape with a clear visual identity.": "Dari konsep hingga pemilihan tanaman, kami mewujudkan taman dengan identitas visual yang kuat.",
    "Precise execution, carefully selected materials, and a process built around quality.": "Pengerjaan presisi, material pilihan, dan proses yang mengutamakan kualitas.",
    "Long-term maintenance that keeps the landscape healthy, composed, and looking intentional.": "Perawatan berkelanjutan agar taman tetap sehat, tertata, dan terjaga keindahannya.",
    "03 / SELECTED WORK": "03 / KARYA PILIHAN",
    "Selected environments, designed to become part of everyday life.": "Ruang pilihan yang dirancang menjadi bagian dari keseharian.",
    "PRIVATE GARDEN": "TAMAN PRIBADI",
    "Private Residence": "Hunian Pribadi",
    "TROPICAL GARDEN": "TAMAN TROPIS",
    "Tropical Residence": "Hunian Tropis",
    "MODERN GARDEN": "TAMAN MODERN",
    "Modern Residence": "Hunian Modern",
    "THE ARVELLA STANDARD": "STANDAR ARVELLA",
    "Good": "Taman",
    "landscapes": "berkualitas",
    "don't just": "tak sekadar",
    "look good.": "indah.",
    "They endure.": "Tetap lestari.",
    "04 / START A PROJECT": "04 / MULAI PROYEK",
    "Let's make": "Mari Ciptakan",
    "something living.": "Ruang hidup",
    "Tell us about your space, your idea, or simply what isn't working yet.": "Ceritakan ruang Anda, ide Anda, atau hal yang ingin Anda perbaiki."
  };
  const textNodes = [];
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.closest("script, style")) continue;
    const english = node.nodeValue.trim();
    if (Object.prototype.hasOwnProperty.call(translations, english)) {
      textNodes.push({ node, original: node.nodeValue, english });
    }
  }
  // Keep Indonesian service titles in the natural order: Desain/Pembuatan/Perawatan Taman.
  const serviceTitles = ["Desain", "Pembuatan", "Perawatan"];
  document.querySelectorAll(".service-card h2").forEach((title, index) => {
    textNodes.forEach((entry) => {
      if (title.contains(entry.node)) {
        entry.indonesian = entry.node.parentElement === title ? serviceTitles[index] : "Taman";
      }
    });
  });
  const description = document.querySelector('meta[name="description"]');
  const englishDescription = description ? description.content : "";
  const applyLanguage = (language) => {
    if (language !== "id" && language !== "en") return;
    textNodes.forEach(({ node, original, english, indonesian }) => {
      node.nodeValue = language === "en" ? original : original.replace(english, indonesian || translations[english]);
    });
    document.documentElement.lang = language;
    if (description) description.content = language === "id"
      ? "Arvella Landscape — desain, pembuatan, dan perawatan taman."
      : englishDescription;
    options.querySelectorAll("[data-language]").forEach((option) => {
      option.lang = language;
      option.setAttribute("aria-pressed", String(option.dataset.language === language));
    });
    document.querySelectorAll(".service-card").forEach((card) => {
      // Titles use a line break; join the two lines for a natural spoken label.
      const title = card.querySelector("h2");
      if (title) card.setAttribute("aria-label", title.innerText.replace(/\s+/g, " ").trim());
    });
    const toggle = document.querySelector(".menu-toggle");
    if (toggle) {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-label", language === "id"
        ? (open ? "Tutup menu" : "Buka menu") : (open ? "Close menu" : "Open menu"));
    }
    const closeButton = panel.querySelector(".menu-close");
    if (closeButton) closeButton.setAttribute("aria-label", language === "id" ? "Tutup menu" : "Close menu");
    try { localStorage.setItem("arvella-language", language); } catch (_) {
      // Translation still works when browser storage is unavailable.
    }
  };
  let initialLanguage = "en";
  try {
    const saved = localStorage.getItem("arvella-language");
    if (saved === "id" || saved === "en") initialLanguage = saved;
  } catch (_) {}
  applyLanguage(initialLanguage);
  const setOpen = (open) => {
    group.classList.toggle("is-open", open);
    panel.classList.toggle("languages-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    options.setAttribute("aria-hidden", String(!open));
    options.inert = !open;
  };
  trigger.addEventListener("click", () => {
    setOpen(trigger.getAttribute("aria-expanded") !== "true");
  });
  group.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      trigger.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!group.contains(event.target)) setOpen(false);
  });
  options.querySelectorAll("button").forEach((option) => {
    option.addEventListener("click", () => {
      applyLanguage(option.dataset.language);
      setOpen(false);
      trigger.focus({ preventScroll: true });
    });
  });
  const close = panel.querySelector(".menu-close");
  if (close) close.addEventListener("click", () => setOpen(false));
});
