
const filters = document.querySelectorAll(".filter");
const cards = document.querySelectorAll(".card");
const resultsCount = document.querySelector("#resultsCount");
const dropdown = document.querySelector(".nav-dropdown");
const toggle = document.querySelector(".nav-dropdown-toggle");

if (dropdown && toggle) {
  toggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
}
function updateResults() {
    const visibleCards = [...cards].filter(card => {
        return card.style.display !== "none";
    });

    resultsCount.textContent =
        `${visibleCards.length} destination${visibleCards.length === 1 ? "" : "s"} found`;
}

filters.forEach(filter => {
    filter.addEventListener("click", () => {
        filters.forEach(button => button.classList.remove("active"));
        filter.classList.add("active");

        const selectedFilter = filter.dataset.filter;

        cards.forEach(card => {
            const category = card.dataset.category;

            if (selectedFilter === "all" || selectedFilter === category) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        updateResults();
    });
});

document.querySelectorAll(".save").forEach(button => {
    button.addEventListener("click", () => {
        const isSaved = button.classList.toggle("saved");
        button.textContent = isSaved ? "♥" : "♡";
        button.setAttribute("aria-pressed", isSaved);
    });
});

const slides = [
    {
        location: "Dolomites, Italy",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=85"
    },
    {
        location: "Zanzibar, Tanzania",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=85"
    },
    {
        location: "Rajasthan, India",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=2200&q=85"
    }
];

const heroImage = document.querySelector(".hero-image");
const locationText = document.querySelector(".location");
const slideButtons = document.querySelectorAll(".slide-btn");

slideButtons.forEach(button => {
    button.addEventListener("click", () => {
        const index = button.dataset.slide;
        const slide = slides[index];

        heroImage.style.backgroundImage = `url("${slide.image}")`;
        locationText.innerHTML = `
 ${slide.location}
 <small>Featured destination · ${Number(index) + 1}</small>
 `;

        slideButtons.forEach(item => item.classList.remove("active"));
        button.classList.add("active");
    });
});

const dialog = document.querySelector("#guideDialog");
const dialogTitle = document.querySelector("#dialogTitle");
const dialogText = document.querySelector("#dialogText");

const guideText = {
    Dolomites: "A dramatic mountain escape filled with alpine villages, scenic hikes, quiet lakes, and unforgettable sunsets.",
    Zanzibar: "A tropical island known for white-sand beaches, spice farms, historic Stone Town, and turquoise water.",
    Rajasthan: "A colorful journey through palaces, desert landscapes, historic forts, and rich local traditions."
};

document.querySelectorAll(".card-meta span:last-child").forEach(button => {
    button.addEventListener("click", event => {
        const card = event.target.closest(".card");
        const title = card.querySelector("h3").textContent;

        dialogTitle.textContent = title;
        dialogText.textContent = guideText[title];
        dialog.showModal();
    });
});

document.querySelector(".close-dialog").addEventListener("click", () => {
    dialog.close();
});

updateResults();