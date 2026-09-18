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

    observer = new IntersectionObserver((entries) => {
      if (revealed || !entries.some((entry) => entry.isIntersecting)) return;
      revealed = true;
      // Release hidden state even if a stagger callback fails.
      window.setTimeout(finish, (cards.length - 1) * 180 + 1400);
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
