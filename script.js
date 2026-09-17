window.addEventListener("load", () => {
  setTimeout(() => document.body.classList.add("loaded"), 350);
});

const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.style.background = window.scrollY > 70 ? "rgba(20,32,24,.92)" : "transparent";
  nav.style.backdropFilter = window.scrollY > 70 ? "blur(14px)" : "none";
}, {passive:true});

document.querySelector(".menu-toggle").addEventListener("click", () => {
  document.querySelector(".desktop-menu").classList.toggle("mobile-open");
});
