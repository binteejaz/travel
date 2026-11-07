const dropdown = document.querySelector(".nav-dropdown");
const toggle = document.querySelector(".nav-dropdown-toggle");
const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector("#nav-links");

function closeDropdown() {
  if (!dropdown || !toggle) return;
  dropdown.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
}

function closeMenu() {
  if (!menuBtn || !navLinks) return;
  navLinks.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.textContent = "☰";
}

if (dropdown && toggle) {
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) closeDropdown();
  });
}

if (menuBtn && navLinks) {
  menuBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.textContent = isOpen ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDropdown();
    closeMenu();
  }
});