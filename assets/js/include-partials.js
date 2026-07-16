async function loadNavbarPartial() {
  const mount = document.getElementById('site-navbar');
  if (!mount) return;

  try {
    const res = await fetch('partials/navbar.html', { cache: 'no-cache' });
    if (!res.ok) return;
    mount.innerHTML = await res.text();
  } catch {
    return;
  }

  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  let activeKey = 'home';
  if (page === 'about.html') activeKey = 'about';
  else if (page === 'industries.html') activeKey = 'industries';
  else if (page === 'contact.html') activeKey = 'contact';
  else if (page === 'team.html') activeKey = 'team';
  else if (page === 'compliance-calendar.html') activeKey = 'calendar';
  else if (page === 'careers.html') activeKey = 'career';
  else if (page === 'news.html') activeKey = 'news';
  else if (page === 'services.html' || page.startsWith('service-')) activeKey = 'services';

  document.querySelectorAll('#site-navbar [data-nav]').forEach((el) => {
    if (el.dataset.nav === activeKey) el.classList.add('active');
    else el.classList.remove('active');
  });

  const menuBtn = document.querySelector('#site-navbar #menu-btn');
  const mobileMenu = document.querySelector('#site-navbar #mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!isExpanded));
      mobileMenu.classList.toggle('hidden');
    });
  }

  const mobileServicesToggle = document.querySelector('#site-navbar [data-mobile-services-toggle]');
  const mobileServicesMenu = document.querySelector('#site-navbar [data-mobile-services-menu]');
  if (mobileServicesToggle && mobileServicesMenu) {
    mobileServicesToggle.addEventListener('click', () => mobileServicesMenu.classList.toggle('hidden'));
  }

  const mobileMoreToggle = document.querySelector('#site-navbar [data-mobile-more-toggle]');
  const mobileMoreMenu = document.querySelector('#site-navbar [data-mobile-more-menu]');
  if (mobileMoreToggle && mobileMoreMenu) {
    mobileMoreToggle.addEventListener('click', () => mobileMoreMenu.classList.toggle('hidden'));
  }

  const servicesDropdowns = document.querySelectorAll('#site-navbar .services-dropdown');
  servicesDropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector('[data-services-dropdown-toggle]');
    const menu = dropdown.querySelector('.services-dropdown-menu');
    if (!toggle || !menu) return;

    const closeDropdown = () => {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    };

    const openDropdown = () => {
      dropdown.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
    };

    toggle.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      if (isOpen) closeDropdown();
      else openDropdown();
    });

    dropdown.addEventListener('mouseleave', closeDropdown);

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeDropdown);
    });

    document.addEventListener('click', (event) => {
      if (!dropdown.contains(event.target)) closeDropdown();
    });
  });
}

async function loadFooterPartial() {
  const mount = document.getElementById('site-footer');
  if (!mount) return;

  try {
    const res = await fetch('partials/footer.html', { cache: 'no-cache' });
    if (!res.ok) return;
    mount.innerHTML = await res.text();
  } catch {
    return;
  }
}

async function loadFloatingButtonsPartial() {
  const mount = document.getElementById('floating-buttons');
  if (!mount) return;

  try {
    const res = await fetch('partials/floating-buttons.html', { cache: 'no-cache' });
    if (!res.ok) return;
    mount.innerHTML = await res.text();
  } catch {
    return;
  }

  const scrollBtn = document.querySelector('#floating-buttons #scroll-to-top');
  if (scrollBtn) {
    const toggleScrollBtn = () => {
      if (window.scrollY > 280) {
        scrollBtn.classList.remove('hidden');
        scrollBtn.classList.add('flex');
      } else {
        scrollBtn.classList.add('hidden');
        scrollBtn.classList.remove('flex');
      }
    };
    window.addEventListener('scroll', toggleScrollBtn, { passive: true });
    toggleScrollBtn();
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

async function initPartials() {
  await Promise.all([
    loadNavbarPartial(),
    loadFooterPartial(),
    loadFloatingButtonsPartial(),
  ]);

  if (!document.querySelector('script[data-notification-center]')) {
    const script = document.createElement('script');
    script.src = 'assets/js/notifications.js?v=20260717-ticker-fixes';
    script.defer = true;
    script.dataset.notificationCenter = 'true';
    document.head.appendChild(script);
  } else if (window.NotificationCenter) {
    window.NotificationCenter.init();
  }
  window.dispatchEvent(new Event("partialsLoaded"));
}

initPartials();
