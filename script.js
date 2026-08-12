const menuToggle = document.querySelector('.menu-toggle');
const landing = document.querySelector('.landing');
const primaryNav = document.querySelector('.primary-nav');
const brandHome = document.querySelector('.brand__home');
const pagePanels = Array.from(document.querySelectorAll('.page-panel'));
const panelIds = pagePanels.map((panel) => panel.id);
const portalLogin = document.querySelector('[data-portal-login]');
const portalApp = document.querySelector('[data-portal-app]');
const portalForm = document.querySelector('[data-portal-form]');
const portalError = document.querySelector('[data-portal-error]');
const portalLogout = document.querySelector('[data-portal-logout]');
const portalViewButtons = Array.from(document.querySelectorAll('[data-portal-view]'));
const portalSections = Array.from(document.querySelectorAll('[data-portal-section]'));
const docUploadInput = document.querySelector('[data-doc-upload]');
const portalSearchInput = document.querySelector('[data-portal-search]');
const portalStorageKey = 'college-place-audio-portal';
const portalSessionKey = 'college-place-audio-portal-unlocked';
const portalPasscode = 'cpaudio';
const maxPortalFileSize = 3 * 1024 * 1024;

const defaultPortalData = {
  notes: [
    {
      title: 'Weekly founders sync',
      body: 'Agenda, decisions, next steps, and open questions.',
      updated: 'Draft',
    },
  ],
  docs: [
    {
      title: 'Operating docs',
      body: 'Paste Google Drive, Dropbox, contract, invoice, or catalogue links here.',
      updated: 'Draft',
    },
  ],
  links: [
    {
      title: 'Shared listening links',
      body: 'Keep private playlists, briefs, and reference links here.',
      updated: 'Draft',
    },
  ],
};

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

function closeActivePanel() {
  history.pushState('', document.title, window.location.pathname);
  setActivePanel('');
}

function getPortalData() {
  try {
    const data = JSON.parse(localStorage.getItem(portalStorageKey)) || defaultPortalData;
    let repairedData = false;

    ['notes', 'docs', 'links'].forEach((type) => {
      data[type] = (data[type] || []).map((item) => {
        if (item.id) return item;

        repairedData = true;
        return {
          ...item,
          id: crypto.randomUUID(),
        };
      });
    });

    if (repairedData) savePortalData(data);

    return data;
  } catch {
    return JSON.parse(JSON.stringify(defaultPortalData));
  }
}

function savePortalData(data) {
  localStorage.setItem(portalStorageKey, JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function portalTimestamp() {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date());
}

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setPortalUnlocked(unlocked) {
  if (!portalLogin || !portalApp) return;

  portalLogin.hidden = unlocked;
  portalApp.hidden = !unlocked;

  if (unlocked) {
    sessionStorage.setItem(portalSessionKey, 'true');
    renderPortal();
  } else {
    sessionStorage.removeItem(portalSessionKey);
  }
}

function renderPortalFile(item) {
  if (!item.fileData) return '';

  return `
    <a
      class="portal-file"
      href="${escapeHtml(item.fileData)}"
      download="${escapeHtml(item.fileName || item.title)}"
    >
      <span>${escapeHtml(item.fileName || 'Download file')}</span>
      <span>${escapeHtml(formatFileSize(item.fileSize))}</span>
    </a>
  `;
}

function renderPortalList(type, selector) {
  const list = document.querySelector(selector);
  if (!list) return;

  const data = getPortalData();
  const searchTerm = portalSearchInput?.value.trim().toLowerCase() || '';
  const items = (data[type] || []).filter((item) => {
    if (!searchTerm) return true;

    return [item.title, item.body, item.fileName]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchTerm));
  });

  if (!items.length) {
    list.innerHTML = searchTerm
      ? '<p class="portal-empty">No matches yet.</p>'
      : '<p class="portal-empty">Nothing here yet. Add the first item.</p>';
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
        <article class="portal-item" data-portal-item="${type}" data-id="${escapeHtml(item.id)}">
          <input value="${escapeHtml(item.title)}" aria-label="${type} title" />
          <textarea aria-label="${type} body">${escapeHtml(item.body)}</textarea>
          ${type === 'docs' ? renderPortalFile(item) : ''}
          <div class="portal-item__meta">
            <span>Updated ${escapeHtml(item.updated)}</span>
            <button type="button" data-delete-item>Delete</button>
          </div>
        </article>
      `,
    )
    .join('');
}

function renderPortal() {
  renderPortalList('notes', '[data-notes-list]');
  renderPortalList('docs', '[data-docs-list]');
  renderPortalList('links', '[data-links-list]');
}

function addPortalItem(type) {
  const data = getPortalData();
  data[type] = data[type] || [];
  data[type].unshift({
    id: crypto.randomUUID(),
    title: type === 'notes' ? 'Untitled meeting note' : 'Untitled item',
    body: '',
    updated: portalTimestamp(),
  });
  savePortalData(data);
  renderPortal();
}

function uploadPortalDocs(files) {
  const data = getPortalData();
  data.docs = data.docs || [];

  Array.from(files).forEach((file) => {
    if (file.size > maxPortalFileSize) {
      window.alert(`${file.name} is too large for this prototype. Try a file under 3 MB.`);
      return;
    }

    const reader = new FileReader();

    reader.addEventListener('load', () => {
      const latestData = getPortalData();
      latestData.docs = latestData.docs || [];
      latestData.docs.unshift({
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, '') || file.name,
        body: 'Uploaded from computer.',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileData: reader.result,
        updated: portalTimestamp(),
      });
      savePortalData(latestData);
      renderPortal();
    });

    reader.readAsDataURL(file);
  });
}

function updatePortalItem(itemElement) {
  const type = itemElement.dataset.portalItem;
  const id = itemElement.dataset.id;
  const [titleInput, bodyInput] = itemElement.querySelectorAll('input, textarea');
  const data = getPortalData();
  const index = data[type].findIndex((item) => item.id === id);

  if (index === -1) return;

  data[type][index] = {
    ...data[type][index],
    title: titleInput.value,
    body: bodyInput.value,
    updated: portalTimestamp(),
  };

  savePortalData(data);
  itemElement.querySelector('.portal-item__meta span').textContent =
    `Updated ${data[type][index].updated}`;
}

function deletePortalItem(itemElement) {
  const type = itemElement.dataset.portalItem;
  const id = itemElement.dataset.id;
  const data = getPortalData();
  const index = data[type].findIndex((item) => item.id === id);

  if (index === -1) return;

  data[type].splice(index, 1);
  savePortalData(data);
  renderPortal();
}

menuToggle.addEventListener('click', () => {
  setNavigation(menuToggle.getAttribute('aria-expanded') !== 'true');
});

brandHome.addEventListener('click', (event) => {
  event.preventDefault();
  closeActivePanel();
});

landing.addEventListener('click', (event) => {
  if (!document.body.classList.contains('has-active-panel')) return;
  if (event.target.closest('a, button')) return;

  closeActivePanel();
});

window.addEventListener('hashchange', updatePanelFromHash);

portalForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(portalForm);
  const passcode = String(formData.get('passcode') || '').trim();

  if (passcode === portalPasscode) {
    portalError.textContent = '';
    portalForm.reset();
    setPortalUnlocked(true);
    return;
  }

  portalError.textContent = 'Incorrect passcode.';
});

portalLogout?.addEventListener('click', () => {
  setPortalUnlocked(false);
});

portalViewButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const view = button.dataset.portalView;

    portalViewButtons.forEach((viewButton) => {
      viewButton.classList.toggle('is-active', viewButton === button);
    });

    portalSections.forEach((section) => {
      section.classList.toggle('is-active', section.dataset.portalSection === view);
    });
  });
});

document.querySelector('[data-add-note]')?.addEventListener('click', () => {
  addPortalItem('notes');
});

document.querySelector('[data-add-doc]')?.addEventListener('click', () => {
  docUploadInput?.click();
});

docUploadInput?.addEventListener('change', () => {
  uploadPortalDocs(docUploadInput.files);
  docUploadInput.value = '';
});

portalSearchInput?.addEventListener('input', renderPortal);

document.querySelector('[data-add-link]')?.addEventListener('click', () => {
  addPortalItem('links');
});

document.addEventListener('input', (event) => {
  const itemElement = event.target.closest?.('[data-portal-item]');
  if (itemElement) updatePortalItem(itemElement);
});

document.addEventListener('click', (event) => {
  if (!event.target.matches('[data-delete-item]')) return;
  deletePortalItem(event.target.closest('[data-portal-item]'));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && primaryNav.classList.contains('is-open')) {
    setNavigation(false);
    menuToggle.focus();
    return;
  }

  if (event.key === 'Escape' && document.body.classList.contains('has-active-panel')) {
    closeActivePanel();
  }
});

updatePanelFromHash();
setPortalUnlocked(sessionStorage.getItem(portalSessionKey) === 'true');
