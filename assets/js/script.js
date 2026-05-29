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
