const menuToggle = document.querySelector('.menu-toggle');
const primaryNav = document.querySelector('.primary-nav');
const brandHome = document.querySelector('.brand__home');
const pagePanels = Array.from(document.querySelectorAll('.page-panel'));
const panelIds = pagePanels.map((panel) => panel.id);

function setNavigation(open) {
  primaryNav.classList.toggle('is-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

function setActivePanel(id) {
  const hasActivePanel = panelIds.includes(id);

  pagePanels.forEach((panel) => {
    const isActive = panel.id === id;
    panel.classList.toggle('is-active', isActive);
    panel.setAttribute('aria-hidden', String(!isActive));
  });

  document.body.classList.toggle('has-active-panel', hasActivePanel);
}

function updatePanelFromHash() {
  setActivePanel(window.location.hash.replace('#', ''));
}

menuToggle.addEventListener('click', () => {
  setNavigation(menuToggle.getAttribute('aria-expanded') !== 'true');
});

brandHome.addEventListener('click', (event) => {
  event.preventDefault();
  history.pushState('', document.title, window.location.pathname);
  setActivePanel('');
});

window.addEventListener('hashchange', updatePanelFromHash);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
    setNavigation(false);
    menuToggle.focus();
    return;
  }

  if (event.key === 'Escape' && document.body.classList.contains('has-active-panel')) {
    history.pushState('', document.title, window.location.pathname);
    setActivePanel('');
  }
});

updatePanelFromHash();
