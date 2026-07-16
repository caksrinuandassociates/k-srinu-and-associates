// Consistent outline icons used across service and trust cards.
const SITE_ICON_PATHS = {
  professionals: '<circle cx="9" cy="8" r="3"></circle><path d="M3.5 19c.8-3.2 2.7-5 5.5-5s4.7 1.8 5.5 5"></path><path d="m16 11 2 2 3.5-4"></path>',
  compliance: '<rect x="5" y="4" width="14" height="17" rx="2"></rect><path d="M9 4.5V3h6v1.5"></path><path d="m9 13 2 2 4-5"></path>',
  rupee: '<path d="M7 5h10"></path><path d="M7 9h10"></path><path d="M7 5c4.5 0 6.5 1.2 6.5 4S11.5 13 7 13l7 7"></path>',
  advisory: '<path d="M4 19V9"></path><path d="M10 19V5"></path><path d="M16 19v-7"></path><path d="M3 19h18"></path><path d="m4 8 5-4 6 5 5-6"></path>',
  audit: '<path d="M12 3 4.5 6v5c0 4.8 2.8 8 7.5 10 4.7-2 7.5-5.2 7.5-10V6L12 3Z"></path><path d="m8.5 12 2.2 2.2 4.8-5"></path>',
  gst: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"></path><path d="M9 8h6"></path><path d="M9 12h6"></path><path d="M9 16h3"></path>',
  company: '<path d="M4 21h16"></path><path d="M6 21V8l6-4 6 4v13"></path><path d="M9 10h2"></path><path d="M13 10h2"></path><path d="M9 14h2"></path><path d="M13 14h2"></path><path d="M10 21v-3h4v3"></path>',
  payroll: '<rect x="3" y="6" width="18" height="14" rx="2"></rect><path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z"></path><path d="M7 6V4h10v2"></path>',
  business: '<path d="M4 19V9"></path><path d="M10 19v-5"></path><path d="M16 19V6"></path><path d="m3 8 6-4 5 4 6-5"></path><path d="M17 3h3v3"></path>',
  startup: '<path d="M14 4c3-1.5 5-1 6-1-0 1 0 3-1 6l-6 6-4-4 4-7Z"></path><path d="m10 8-4 1-3 3 5 1"></path><path d="m16 14-1 4-3 3-1-5"></path><circle cx="16" cy="7" r="1.5"></circle><path d="m6 17-2 3 3-1"></path>',
  cfo: '<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M9 7V4h6v3"></path><path d="M3 12h18"></path><path d="M10 12v2h4v-2"></path>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.4 1.8.6 2.8.7a2 2 0 0 1 1.7 2.1Z"></path>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>',
  location: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
  clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path>',
  healthcare: '<path d="M12 21S4 16.5 4 10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 3.5C20 16.5 12 21 12 21Z"></path><path d="M9 12h6"></path><path d="M12 9v6"></path>',
  manufacturing: '<path d="M3 21V9l6 3V8l6 4V5h6v16H3Z"></path><path d="M7 17h2"></path><path d="M12 17h2"></path><path d="M17 17h2"></path>',
  retail: '<path d="M5 8h14l-1 12H6L5 8Z"></path><path d="M9 10V7a3 3 0 0 1 6 0v3"></path>',
  technology: '<rect x="3" y="4" width="18" height="14" rx="2"></rect><path d="M8 21h8"></path><path d="M12 18v3"></path><path d="m8 10 2-2-2-2"></path><path d="m16 6-2 2 2 2"></path>',
  education: '<path d="m3 10 9-5 9 5-9 5-9-5Z"></path><path d="M7 13v4c3 2 7 2 10 0v-4"></path><path d="M21 10v6"></path>',
  professional: '<rect x="3" y="7" width="18" height="13" rx="2"></rect><path d="M9 7V4h6v3"></path><path d="M3 12h18"></path>',
  globe: '<circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3c3 3 3 15 0 18"></path><path d="M12 3c-3 3-3 15 0 18"></path>',
  approach: '<circle cx="12" cy="12" r="9"></circle><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"></path>',
  mission: '<circle cx="12" cy="12" r="9"></circle><circle cx="12" cy="12" r="5"></circle><circle cx="12" cy="12" r="1.5"></circle><path d="m15 9 5-5"></path>',
  vision: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="3"></circle>',
  values: '<path d="m12 21-8-9 3-6h10l3 6-8 9Z"></path><path d="M4 12h16"></path><path d="m8 6 4 15 4-15"></path>',
  bookkeeping: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z"></path><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z"></path><path d="M6.5 8H9"></path><path d="M15 8h2.5"></path>',
  rera: '<path d="M4 21h16"></path><path d="M6 21V8l6-4 6 4v13"></path><path d="M9 11h2"></path><path d="M13 11h2"></path><path d="m9 16 2 2 4-4"></path>',
};

document.querySelectorAll("[data-site-icon]").forEach((element) => {
  const paths = SITE_ICON_PATHS[element.dataset.siteIcon];
  if (!paths) return;
  element.setAttribute("aria-hidden", "true");
  element.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" focusable="false">${paths}</svg>`;
});

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

// Desktop navbar declutter: More dropdown (xl to <2xl)
(() => {
  const nav = document.querySelector('#site-header nav[aria-label="Main Navigation"]');
  if (!nav) return;

  const desktopList = nav.querySelector('ul');
  if (!desktopList) return;

  const links = Array.from(desktopList.querySelectorAll(':scope > li > a.nav-link'));
  if (!links.length) return;

  const byHref = (h) => links.find((a) => a.getAttribute('href') === h);
  const team = byHref('team.html');
  const cal = byHref('compliance-calendar.html');
  const career = byHref('careers.html');
  if (!team || !cal || !career) return;

  const createMore = () => {
    if (desktopList.querySelector('.more-dropdown')) return;
    const li = document.createElement('li');
    li.className = 'more-dropdown relative';
    li.innerHTML = `
      <button type="button" class="nav-link whitespace-nowrap inline-flex items-center gap-1">More <span class="text-[10px]">▾</span></button>
      <div class="more-dropdown-menu absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
        <a class="mobile-link !py-2" href="team.html">Team</a>
        <a class="mobile-link !py-2" href="compliance-calendar.html">Compliance Calendar</a>
        <a class="mobile-link !py-2" href="careers.html">Career</a>
      </div>`;
    desktopList.appendChild(li);
  };

  const ensureCta = () => {
    if (nav.querySelector('.nav-schedule-cta')) return;
    const cta = document.createElement('a');
    cta.href = 'contact.html';
    cta.className = 'nav-schedule-cta hidden xl:inline-flex rounded-md border border-[#f6c65b]/70 px-3 py-1 font-semibold text-[#b8860b]';
    cta.textContent = 'Schedule Consultation';
    nav.insertBefore(cta, nav.querySelector('#menu-btn') || null);
  };

  desktopList.classList.add('text-[14px]', 'gap-4', '2xl:gap-6', 'hidden');

  const applyMode = () => {
    const wide = window.matchMedia('(min-width: 1536px)').matches;
    if (wide) {
      desktopList.classList.remove('xl:flex');
      desktopList.classList.add('2xl:flex');
      team.parentElement.style.display = '';
      cal.parentElement.style.display = '';
      career.parentElement.style.display = '';
      const more = desktopList.querySelector('.more-dropdown');
      if (more) more.style.display = 'none';
    } else {
      desktopList.classList.remove('2xl:flex');
      desktopList.classList.add('xl:flex');
      team.parentElement.style.display = 'none';
      cal.parentElement.style.display = 'none';
      career.parentElement.style.display = 'none';
      createMore();
      const more = desktopList.querySelector('.more-dropdown');
      if (more) more.style.display = '';
    }
  };

  ensureCta();
  applyMode();
  window.addEventListener('resize', applyMode);
})();

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
