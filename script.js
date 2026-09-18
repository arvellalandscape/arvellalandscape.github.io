document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".desktop-menu");

  // Mobile menu
  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
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

// Momentary press feedback; independent of the one-time reveal.
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#services .service-card").forEach((card) => {
    let pointerId = null;
    let key = null;
    const paint = () => card.classList.toggle("is-pressed", pointerId !== null || key !== null);
    const release = () => {
      pointerId = null;
      key = null;
      paint();
    };
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", card.querySelector("h2").innerText.replace(/\s+/g, " ").trim());

    card.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      pointerId = event.pointerId;
      paint();
      // Receive the release even when the pointer moves outside the card.
      try { card.setPointerCapture(event.pointerId); } catch (error) {}
    });
    const releasePointer = (event) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      paint();
    };
    window.addEventListener("pointerup", releasePointer);
    window.addEventListener("pointercancel", releasePointer);
    card.addEventListener("lostpointercapture", releasePointer);
    card.addEventListener("keydown", (event) => {
      if (event.key !== " " && event.key !== "Enter") return;
      event.preventDefault();
      key = event.key;
      paint();
    });
    card.addEventListener("keyup", (event) => {
      if (event.key !== key) return;
      event.preventDefault();
      key = null;
      paint();
    });
    card.addEventListener("blur", release);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) release();
    });
    card.addEventListener("contextmenu", (event) => {
      if (pointerId !== null) event.preventDefault();
    });
  });
});
