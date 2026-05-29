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
}

loadNavbarPartial();
