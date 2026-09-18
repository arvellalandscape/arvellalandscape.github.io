document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".desktop-menu");

  // Hamburger menu
  if (menuToggle && menu) {
    const menuPanel = document.querySelector(".menu-panel");
    const CLOSE_DURATION = 450;
    let closeTimer = null;

    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      if (window.matchMedia("(min-width: 801px)").matches) {
        const body = document.body;
        const isOpen = body.classList.contains("menu-open");
        const isClosing = body.classList.contains("menu-closing");

        if (isClosing) return;

        if (!isOpen) {
          window.clearTimeout(closeTimer);
          body.classList.remove("menu-closing");
          body.classList.add("menu-open");
          menuToggle.setAttribute("aria-expanded", "true");
          menuToggle.setAttribute("aria-label", "Close menu");
          if (menuPanel) menuPanel.setAttribute("aria-hidden", "false");
          return;
        }

        body.classList.add("menu-closing");
        menuToggle.setAttribute("aria-expanded", "false");
        if (menuPanel) menuPanel.setAttribute("aria-hidden", "true");

        closeTimer = window.setTimeout(() => {
          body.classList.remove("menu-open", "menu-closing");
          menuToggle.setAttribute("aria-label", "Open menu");
        }, CLOSE_DURATION);

        return;
      }

      menu.classList.toggle("mobile-open");
    });
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
