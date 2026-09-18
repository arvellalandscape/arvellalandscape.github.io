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
const serviceGrid = document.querySelector(".service-grid");
const serviceCards = document.querySelectorAll(".service-card");

if (serviceGrid && serviceCards.length) {
  const serviceObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {

          setTimeout(() => {
            serviceCards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add("is-visible");
              }, index * 180);
            });
          }, 400);

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold:0.15
    }
  );

  serviceObserver.observe(serviceGrid);
}
  
