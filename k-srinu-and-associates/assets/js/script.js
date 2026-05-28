// Mobile menu toggle
const menuButton = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

if (menuButton && mobileMenu) {
  menuButton.addEventListener("click", () => {
    const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isExpanded));
    mobileMenu.classList.toggle("hidden");
  });

  document.querySelectorAll("#mobile-menu a").forEach((item) => {
    item.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Sticky header state
const siteHeader = document.getElementById("site-header");
const onScrollHeader = () => {
  if (!siteHeader) return;
  siteHeader.classList.toggle("scrolled", window.scrollY > 10);
};
window.addEventListener("scroll", onScrollHeader);
onScrollHeader();

// Intersection reveal animation
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("visible"));
}

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// FAQ accordion
document.querySelectorAll(".faq-toggle").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq-item");
    const group = item?.parentElement;
    if (!item || !group) return;

    group.querySelectorAll(".faq-item").forEach((el) => {
      if (el !== item) {
        el.classList.remove("active");
        const icon = el.querySelector("[data-faq-icon]");
        if (icon) icon.textContent = "+";
      }
    });

    item.classList.toggle("active");
    const icon = item.querySelector("[data-faq-icon]");
    if (icon) icon.textContent = item.classList.contains("active") ? "−" : "+";
  });
});

// Compliance Calendar (Home Page)
const complianceCalendarItems = [
  { date: "10th of Every Month", title: "GST Return Filing", note: "Monthly GST return due date for applicable taxpayers." },
  { date: "7th of Every Month", title: "TDS Payment Due Date", note: "Deposit TDS within the statutory due date." },
  { date: "15 Jun / 15 Sep / 15 Dec / 15 Mar", title: "Advance Tax Due Date", note: "Quarterly advance tax installments for eligible taxpayers." },
  { date: "31 July / 31 Oct", title: "Income Tax Return Filing", note: "Due dates vary by taxpayer category and audit applicability." },
  { date: "As per MCA Schedule", title: "ROC Annual Compliance", note: "Annual forms and filings as applicable to company/LLP type." },
  { date: "State-wise Due Date", title: "Professional Tax Filing", note: "Professional tax return/payment due date based on state rules." }
];

const complianceCalendarGrid = document.getElementById("compliance-calendar-grid");
if (complianceCalendarGrid) {
  complianceCalendarGrid.innerHTML = complianceCalendarItems
    .map(
      (item) => `
      <article class="calendar-card lift reveal">
        <span class="calendar-date">${item.date}</span>
        <h3 class="mt-3 font-bold text-navy">${item.title}</h3>
        <p class="subtitle text-sm mt-2">${item.note}</p>
      </article>
    `
    )
    .join("");

  // Re-observe newly injected reveal elements
  const newReveals = complianceCalendarGrid.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    newReveals.forEach((el) => observer.observe(el));
  } else {
    newReveals.forEach((el) => el.classList.add("visible"));
  }
}
