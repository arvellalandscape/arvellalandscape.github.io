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

  // Service cards one-time reveal
  const serviceCards = document.querySelectorAll(".service-card");

  if (serviceCards.length) {
    const serviceObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold:0.15
      }
    );

    serviceCards.forEach((card) => {
      serviceObserver.observe(card);
    });
  }
});
