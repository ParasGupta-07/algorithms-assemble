// Reveal sections as they enter the screen.
const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15
    });

    revealItems.forEach((item) => revealObserver.observe(item));

} else {
    // Older browsers still show all content if they do not support reveals.
    revealItems.forEach((item) => item.classList.add("is-visible"));
}

// Bring each section's content up from below as it scrolls into view.
const slideSections = document.querySelectorAll("[data-slide-reveal]");
const reducePageMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (slideSections.length && !reducePageMotion && "IntersectionObserver" in window) {
    const slideObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-slide-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -16% 0px"
    });

    slideSections.forEach((section) => slideObserver.observe(section));
} else {
    slideSections.forEach((section) => section.classList.add("is-slide-visible"));
}

// Each quarter-turn brings the next hero to the front as the visitor scrolls.
const missionThemes = {
    "mission-tony": ["#65358a", "#9870b8"],       // Iron Man: deep and bright purple
    "mission-strange": ["#854cc7", "#65358a"],    // Doctor Strange: layered purples
    "mission-peter": ["#65358a", "#2867c7"],      // Spider-Man: purple and blue
    "mission-thor": ["#75c9ef", "#f2f5fa"]        // Thor: icy blue and white
};

const wheelScroll = document.querySelector(".wheel-scroll");
const wheelCylinder = document.querySelector(".wheel-cylinder");
const wheelPanels = Array.from(document.querySelectorAll(".wheel-panel"));
const colorStops = wheelPanels.map((panel) => missionThemes[panel.id].map((hex) => [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16)
]));

const wheelCounter = document.querySelector(".wheel-counter");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let previousVisiblePanelIndex = -1;

function blendColor(from, to, amount) {
    const channels = from.map((value, index) => Math.round(value + (to[index] - value) * amount));
    return `rgb(${channels[0]} ${channels[1]} ${channels[2]})`;
}

function updateBackgroundColor() {
    const track = wheelScroll.getBoundingClientRect();
    const scrollRange = Math.max(1, wheelScroll.offsetHeight - window.innerHeight);
    const scrollProgress = Math.max(0, Math.min(1, -track.top / scrollRange));
    const wheelPosition = scrollProgress * (wheelPanels.length - 1);
    const leftIndex = Math.floor(wheelPosition);
    const rightIndex = Math.min(leftIndex + 1, wheelPanels.length - 1);
    const amount = wheelPosition - leftIndex;
    const rotation = scrollProgress * 270;
    const visiblePanelIndex = Math.min(wheelPanels.length - 1, Math.round(wheelPosition));

    wheelCylinder.style.setProperty("--wheel-rotation", `${rotation}deg`);

    if (visiblePanelIndex !== previousVisiblePanelIndex) {
        wheelPanels.forEach((panel, index) => {
            const isActive = index === visiblePanelIndex;
            panel.classList.toggle("is-active", isActive);
            panel.inert = !isActive;
            panel.setAttribute("aria-hidden", String(!isActive));
        });

        if (wheelCounter) {
            wheelCounter.innerHTML = `${String(visiblePanelIndex + 1).padStart(2, "0")} <span>/ 04</span>`;
        }

        previousVisiblePanelIndex = visiblePanelIndex;
    }

    const root = document.documentElement;

    [0, 1].forEach((colorIndex) => {
        const color = blendColor(
            colorStops[leftIndex][colorIndex],
            colorStops[rightIndex][colorIndex],
            amount
        );
        root.style.setProperty(colorIndex === 0 ? "--ambient-primary" : "--ambient-secondary", color);
    });
}

let colorFramePending = false;
function requestBackgroundColorUpdate() {
    if (colorFramePending) return;
    colorFramePending = true;
    requestAnimationFrame(() => {
        updateBackgroundColor();
        colorFramePending = false;
    });
}

if (!prefersReducedMotion) {
    window.addEventListener("scroll", requestBackgroundColorUpdate, { passive: true });
    window.addEventListener("resize", requestBackgroundColorUpdate);
    requestBackgroundColorUpdate();
} else {
    wheelPanels.forEach((panel) => panel.classList.add("is-active"));
}

// Bend each registration link around a vertical cylinder as its scroll position changes.
const registrationPicker = document.querySelector(".registration-picker");
const registrationOptions = Array.from(document.querySelectorAll(".registration-option"));

if (registrationPicker && registrationOptions.length) {
    let pickerFramePending = false;

    function updateRegistrationWheel() {
        const pickerBounds = registrationPicker.getBoundingClientRect();
        const center = registrationPicker.scrollTop + registrationPicker.clientHeight / 2;
        const radius = Math.max(150, registrationPicker.clientHeight * 0.62);
        let selectedIndex = 0;
        let nearestDistance = Infinity;

        registrationOptions.forEach((option, index) => {
            const optionBounds = option.getBoundingClientRect();
            const optionCenter = optionBounds.top - pickerBounds.top + registrationPicker.scrollTop + optionBounds.height / 2;
            const distanceFromCenter = optionCenter - center;
            const distance = Math.abs(distanceFromCenter);
            const angle = Math.max(-1.05, Math.min(1.05, distanceFromCenter / radius));
            const depth = radius * (Math.cos(angle) - 1);
            const rotation = angle * (180 / Math.PI);
            const scale = Math.max(0.8, 1 - distance / 1300);
            const opacity = Math.max(0.06, 1 - distance / (registrationPicker.clientHeight * 0.66));
            const blur = Math.min(3, distance / 150);

            option.style.transform = `rotateX(${rotation}deg) translateZ(${depth}px) scale(${scale})`;
            option.style.opacity = opacity;
            option.style.filter = `blur(${blur}px)`;
            option.style.zIndex = String(1000 - Math.round(distance));

            if (distance < nearestDistance) {
                nearestDistance = distance;
                selectedIndex = index;
            }
        });

        registrationOptions.forEach((option, index) => {
            const isSelected = index === selectedIndex;
            option.classList.toggle("is-selected", isSelected);
            if (isSelected) option.setAttribute("aria-current", "true");
            else option.removeAttribute("aria-current");
        });
    }

    function requestRegistrationWheelUpdate() {
        if (pickerFramePending) return;
        pickerFramePending = true;
        requestAnimationFrame(() => {
            updateRegistrationWheel();
            pickerFramePending = false;
        });
    }

    if (prefersReducedMotion) {
        registrationOptions[0].classList.add("is-selected");
        registrationOptions[0].setAttribute("aria-current", "true");
    } else {
        registrationPicker.addEventListener("scroll", requestRegistrationWheelUpdate, { passive: true });
        window.addEventListener("resize", requestRegistrationWheelUpdate);
        requestRegistrationWheelUpdate();
    }
}

// On a mouse or trackpad, add a soft light and a short-lived binary trail.
const cursorAura = document.querySelector(".cursor-aura");
const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (cursorAura && hasFinePointer && !prefersReducedMotion) {
    let lastTrailTime = 0;

    window.addEventListener("pointermove", (event) => {
        if (event.pointerType === "touch") return;

        cursorAura.style.setProperty("--cursor-x", `${event.clientX}px`);
        cursorAura.style.setProperty("--cursor-y", `${event.clientY}px`);
        cursorAura.classList.add("is-visible");

        const now = performance.now();
        if (now - lastTrailTime < 55) return;
        lastTrailTime = now;

        const trail = document.createElement("span");
        trail.className = "code-trail";
        trail.setAttribute("aria-hidden", "true");
        trail.textContent = Math.random() < 0.5 ? "0" : "1";
        trail.style.left = `${event.clientX + (Math.random() * 8 - 4)}px`;
        trail.style.top = `${event.clientY + (Math.random() * 8 - 4)}px`;
        document.body.appendChild(trail);
        window.setTimeout(() => trail.remove(), 2000);
    }, { passive: true });

    document.addEventListener("pointerleave", () => cursorAura.classList.remove("is-visible"));
}

// Hide only a missing image; the designed artwork placeholder remains visible.
document.querySelectorAll(".mission-art img").forEach((image) => {
    image.addEventListener("error", () => {
        image.hidden = true;
    });
});

// Keep the creator credit tucked away until its footer button is pressed.
const creatorCreditToggle = document.querySelector("#creator-credit-toggle");
const creatorCreditDetails = document.querySelector("#creator-credit-details");

if (creatorCreditToggle && creatorCreditDetails) {
    creatorCreditToggle.addEventListener("click", () => {
        const expanded = creatorCreditToggle.getAttribute("aria-expanded") !== "true";
        creatorCreditToggle.setAttribute("aria-expanded", String(expanded));
        creatorCreditToggle.setAttribute("aria-label", expanded ? "Hide creator details" : "Show creator details");
        creatorCreditDetails.hidden = !expanded;
    });
}
