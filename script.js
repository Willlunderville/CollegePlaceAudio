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
const spotifyArtworkCache = new Map();
let activeDiscoveryFilter = 'needs-approval';

// One accessible logo list; its visual copy makes the reel wrap seamlessly.
const brandReel = document.querySelector('.brand-reel');
if (brandReel) {
  const viewport = brandReel.querySelector('.brand-reel__viewport');
  const group = brandReel.querySelector('.brand-reel__group');
  const duplicate = group.cloneNode(true);
  duplicate.setAttribute('aria-hidden', 'true');
  duplicate.querySelectorAll('img').forEach((img) => { img.alt = ''; });
  group.after(duplicate);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let previousTime = 0;
  let position = 0;
  const animate = (time) => {
    const elapsed = Math.min(time - previousTime, 64);
    previousTime = time;
    if (!reducedMotion.matches && !document.hidden &&
        brandReel.closest('.page-panel').classList.contains('is-active')) {
      const width = group.getBoundingClientRect().width;
      position = (position + elapsed * 0.025) % width;
      viewport.scrollLeft = position;
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

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
  artists: [
    { name: 'Solex', spotify: 'https://open.spotify.com/artist/7uV7uQgiUQ3Ipxs5cHZsGL', soundcloud: '', source: 'https://shop.matadorrecords.com/format/1985172-low-kick-and-hard-bop?lang=ca', listeners: 4097, label: 'Matador (catalogue/reissue)', checkedOn: '2026-09-24', addedBy: 'Brett', willVote: 'Reject', brettVote: 'Approve', isaiahVote: 'Reject', inCrm: 'no', contact: 'dieter@toutpartout.be', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Lisa Cooke', spotify: 'https://open.spotify.com/artist/2JB8p3I0Lr7HbJQb0ty45g', soundcloud: 'https://soundcloud.com/lisalisacooke', source: 'https://freshonthenet.co.uk/2026/09/faves619/', listeners: 85, label: 'Lisa Cooke (release credit)', checkedOn: '2026-09-24', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'yes', contact: '', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'The Skints', spotify: 'https://open.spotify.com/artist/39k4UDTgsWe6NCi6hgnfc1', soundcloud: 'https://soundcloud.com/the_skints', source: 'https://easystar.com/artists/the-skints/', listeners: 69159, label: 'Easy Star Records', checkedOn: '2026-09-24', addedBy: 'Brett', willVote: 'Pending', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'yes', contact: 'david.strunk@unitedtalent.com', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Angela Autumn', spotify: 'https://open.spotify.com/artist/2gyodrfLfK8xF0sSaxBZXQ', soundcloud: 'https://soundcloud.com/angelaautumn', source: 'https://garholerecords.com/collections/angela-autumn', listeners: 210304, label: 'Gar Hole Records', checkedOn: '2026-09-24', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'yes', contact: 'ash@findtheriver.org', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Actress', spotify: 'https://open.spotify.com/artist/3bg5rmICvmA8dmYVAdKGYH', soundcloud: 'https://soundcloud.com/actress1', source: 'https://ninjatune.net/release/actress/radical-frame', listeners: 135720, label: 'Ninja Tune', checkedOn: '2026-09-24', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Pending', inCrm: 'yes', contact: 'hello@giantartistmanagement.com', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Someday, Sky', spotify: 'https://open.spotify.com/artist/5ujFVxheeMQ27y7NjX0Sv1', soundcloud: 'https://soundcloud.com/somedaysky-music', source: 'https://someday-sky.com/', listeners: 115, label: 'someday, sky (release credit)', checkedOn: '2026-09-24', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'yes', contact: 'somedaysky.music@gmail.com', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Dr. J', spotify: 'https://open.spotify.com/artist/1FWgFANxAOtSjhc6zXyJ2W', soundcloud: 'https://soundcloud.com/drjpresents', source: 'https://drjpresents.music/', listeners: 43, label: 'gottahavesoul Recordings', checkedOn: '2026-09-24', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Discuss', inCrm: 'yes', contact: 'hello@drjpresents.music', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Adam Dodson', spotify: 'https://open.spotify.com/artist/0me95qZRAj797NaS72KUCZ', soundcloud: '', source: 'https://www.adamdodsonmusic.com/', listeners: 830000, label: 'None', checkedOn: '2026-09-24', addedBy: 'Isaiah', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'yes', contact: 'https://www.adamdodsonmusic.com/contact', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Carter Ace', spotify: 'https://open.spotify.com/artist/0bhck1r45kgsoMNBVqIziz', soundcloud: '', source: 'https://www.youtube.com/watch?v=POghbGn2XzY', listeners: 112000, label: 'None', checkedOn: '2026-09-27', addedBy: 'Isaiah', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'yes', contact: '', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'pest.', spotify: 'https://open.spotify.com/artist/2CRPyONFKCPNTWkAQ4jskq?si=tU51l4Z5R9a5-6FZIygX0A', soundcloud: '', source: 'http://pestpestpest.com/', listeners: 18880, label: 'none', checkedOn: '2026-09-30', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Pending', inCrm: 'yes', contact: 'pest.pest.music@gmail.com', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Miami Nights 1984', spotify: 'https://open.spotify.com/artist/18iQQOuyGlHunPVzmoLY20?si=XGpgMfTuR6qk9ZiybGhVJw', soundcloud: '', source: 'https://miaminights1984.bandcamp.com/music', listeners: 189000, label: '', checkedOn: '2026-09-30', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Pending', inCrm: 'yes', contact: 'contact@rossocorsarecords.com', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Gilla Band', spotify: 'https://open.spotify.com/artist/7IdPmzvB3PugXieZE9vS4S?si=VkZ7jh3VSG-Et1fEHSS0mQ', soundcloud: '', source: 'https://gillaband.bandcamp.com/album/pugnello', listeners: 99608, label: '', checkedOn: '2026-09-30', addedBy: 'Brett', willVote: 'Reject', brettVote: 'Discuss', isaiahVote: 'Reject', inCrm: 'no', contact: 'NA', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Protomartyr', spotify: 'https://open.spotify.com/album/1VFSC60Y9e1DxIvSvZdane?si=T11pCArxRbutmviUD8Drjg', soundcloud: '', source: 'https://protomartyr.bandcamp.com/album/hotel-usona', listeners: 209000, label: '', checkedOn: '2026-09-30', addedBy: 'Brett', willVote: 'Discuss', brettVote: 'Approve', isaiahVote: 'Reject', inCrm: 'no', contact: '', willNotes: "What are the stand out tracks? Worried they're already too established", brettNotes: '', isaiahNotes: '' },
    { name: 'Seth Celdran', spotify: 'https://open.spotify.com/track/20jnXYuqpgVPVZoq2BEFeH?si=opFHo2ohSsKTlwRTWvjtLw&utm_source=whatsapp', soundcloud: '', source: '', listeners: 475, label: '"Yard Sale Records" aka self released', checkedOn: '2026-10-01', addedBy: 'Will', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Pending', inCrm: 'yes', contact: '', willNotes: 'Do It Again, and Undercover Lover', brettNotes: '', isaiahNotes: '' },
    { name: 'James Marley', spotify: 'https://open.spotify.com/artist/0shZgxgMxIX2SbMCcJhfeI?si=yX-LsJN_RbSggWaCJJlkNA', soundcloud: '', source: '', listeners: 345778, label: 'Marvibe Records (self owned)', checkedOn: '2026-10-02', addedBy: 'Brett', willVote: 'Approve', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'no', contact: '', willNotes: '', brettNotes: 'Looks like most of his catalogue is all rights reserved under previous labels', isaiahNotes: '' },
    { name: 'Kirti Pandey', spotify: 'https://open.spotify.com/artist/1qh5TpfWs8ntoCkbr1sYkb', soundcloud: 'https://soundcloud.com/kirtipandey', source: '', listeners: 19000, label: '', checkedOn: '', addedBy: 'Isaiah', willVote: 'Discuss', brettVote: 'Approve', isaiahVote: 'Approve', inCrm: 'no', contact: '', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'Cordelia Fox', spotify: 'https://open.spotify.com/album/06ceAxgkvN3WvLsJEPcSn2?si=5QC27fQpR8Wa0qgqbDRYdw&utm_source=whatsapp', soundcloud: '', source: '', listeners: 933, label: 'Self Released', checkedOn: '', addedBy: 'Will', willVote: 'Approve', brettVote: 'Pending', isaiahVote: 'Approve', inCrm: 'no', contact: '', willNotes: '', brettNotes: '', isaiahNotes: '' },
    { name: 'EARTHANGEL', spotify: 'https://open.spotify.com/track/0gQ8VtgwZLLGlBTbjPhEIu?si=VX4vCX0jS5aHz_ae6e5NVg&utm_source=whatsapp', soundcloud: '', source: '', listeners: 147, label: 'Self Released', checkedOn: '', addedBy: 'Will', willVote: 'Approve', brettVote: 'Pending', isaiahVote: 'Approve', inCrm: 'no', contact: '', willNotes: '', brettNotes: '', isaiahNotes: '' },
  ],
  sources: [
    { name: 'SoundCloud', url: 'https://soundcloud.com/', description: 'Explore small artists, reposts, collaborators and related tracks.' },
    { name: 'Bandcamp Discover', url: 'https://bandcamp.com/discover', description: 'Browse by genre and location, then explore fan collections and label pages.' },
    { name: 'Indie Music Feedback', url: 'https://indiemusicfeedback.com/', description: 'Find independent artists sharing original music for feedback.' },
    { name: 'Fresh On The Net', url: 'https://freshonthenet.co.uk/', description: 'Check Listening Posts and picks from independent submissions.' },
    { name: 'triple j Unearthed', url: 'https://www.abc.net.au/triplejunearthed', description: 'Discover unsigned and independent Australian artists.' },
    { name: '!earshot', url: 'https://www.earshot-online.com/', description: 'Explore Canadian campus and community radio charts.' },
    { name: 'Bandcamp Daily', url: 'https://daily.bandcamp.com/', description: 'Follow editorial picks, scene reports and genre features.' },
    { name: 'KEXP', url: 'https://www.kexp.org/shows/', description: 'Explore DJ shows and playlists featuring emerging artists.' },
    { name: 'NTS Radio', url: 'https://www.nts.live/explore', description: 'Browse human-curated shows and archives by sound or scene.' },
    { name: 'Spotify discovery playlists', url: 'https://artists.spotify.com/en/blog/how-to-use-playlists-to-reach-more-listeners', description: 'Try Discover Weekly, Release Radar and Fresh Finds.' },
    { name: 'Tune Find', url: 'https://www.tunefind.com/', description: 'Find out if artists or songs have already been synced elsewhere.' },
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
  primaryNav.querySelectorAll('a').forEach((link) => {
    if (link.getAttribute('href') === `#${id}`) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
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

    ['notes', 'docs', 'links', 'artists', 'sources'].forEach((type) => {
      if (!Array.isArray(data[type])) {
        data[type] = JSON.parse(JSON.stringify(defaultPortalData[type] || []));
        repairedData = true;
      }

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

function safeExternalHref(value) {
  try {
    const url = new URL(String(value || '').trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

function safeSpotifyHref(value) {
  const href = safeExternalHref(value);
  if (!href) return '';

  const url = new URL(href);
  return ['open.spotify.com', 'spotify.link'].includes(url.hostname) ? url.href : '';
}

function artistInitials(name) {
  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return initials || 'CPA';
}

function spotifyEmbedDetails(value) {
  const href = safeSpotifyHref(value);
  if (!href) return null;

  const url = new URL(href);
  const [, type, id] = url.pathname.match(/^\/(artist|album|track)\/([^/]+)/) || [];
  if (!type || !id) return null;

  return {
    src: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
    height: 152,
  };
}

function getSpotifyArtwork(spotifyUrl) {
  if (spotifyArtworkCache.has(spotifyUrl)) return spotifyArtworkCache.get(spotifyUrl);

  const artworkRequest = fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyUrl)}`)
    .then((response) => {
      if (!response.ok) throw new Error(`Spotify artwork request failed: ${response.status}`);
      return response.json();
    })
    .then((metadata) => safeExternalHref(metadata.thumbnail_url))
    .catch(() => '');

  spotifyArtworkCache.set(spotifyUrl, artworkRequest);
  return artworkRequest;
}

async function hydrateSpotifyArtwork() {
  const artworkSlots = Array.from(document.querySelectorAll('[data-spotify-artwork]'));
  await Promise.allSettled(artworkSlots.map(async (slot) => {
    const spotifyUrl = slot.dataset.spotifyArtwork;
    const imageUrl = await getSpotifyArtwork(spotifyUrl);
    if (!imageUrl || !slot.isConnected || slot.dataset.spotifyArtwork !== spotifyUrl) return;

    const image = new Image();
    image.src = imageUrl;
    image.alt = `${slot.dataset.artistName || 'Artist'} artwork from Spotify`;
    image.loading = 'lazy';
    image.decoding = 'async';
    slot.replaceChildren(image);
    slot.classList.add('is-loaded');
  }));
}

function overallApproval(artist) {
  const votes = [artist.willVote, artist.brettVote, artist.isaiahVote];
  if (votes.filter((vote) => vote === 'Reject').length >= 2) return 'Rejected';
  if (votes.includes('Discuss')) return 'Needs discussion';
  if (votes.filter((vote) => vote === 'Approve').length >= 2) return 'Approved';
  return 'Pending';
}

function matchesDiscoveryFilter(artist, filter) {
  const status = overallApproval(artist);
  if (filter === 'needs-approval') return status === 'Pending';
  if (filter === 'approved') return status === 'Approved';
  if (filter === 'discuss') return status === 'Needs discussion';
  if (filter === 'rejected') return status === 'Rejected';
  return true;
}

function voteOptions(selected) {
  return ['Pending', 'Approve', 'Discuss', 'Reject']
    .map((vote) => `<option${vote === selected ? ' selected' : ''}>${vote}</option>`)
    .join('');
}

function renderArtistLinkField(field, value) {
  const href = safeExternalHref(value);
  const linkDetails = {
    spotify: {
      label: 'Listen on Spotify',
      helper: 'Full artist profile',
      icon: '<svg viewBox="0 0 24 24" role="img" aria-label="Spotify"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    },
    soundcloud: {
      label: 'Listen on SoundCloud',
      helper: 'Full artist profile',
      icon: '<svg viewBox="0 0 24 24" role="img" aria-label="SoundCloud"><path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z"/></svg>',
    },
    source: { label: 'Discovery source', helper: href ? new URL(href).hostname.replace(/^www\./, '') : 'Where this artist was found', icon: '↗' },
  }[field];
  const linkCopy = `
    <strong>${linkDetails.label}${href ? ' ↗' : ''}</strong>
    <small>${escapeHtml(linkDetails.helper)}</small>
  `;
  return `
    <div class="discovery-field discovery-field--link discovery-field--${field}">
      <span class="discovery-link-icon">${linkDetails.icon}</span>
      <span class="discovery-link-copy">
        ${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer" aria-label="Open ${linkDetails.label}">${linkCopy}</a>` : linkCopy}
      </span>
      <details class="discovery-link-editor">
        <summary aria-label="Edit ${linkDetails.label} link">Edit</summary>
        <input data-field="${field}" type="url" value="${escapeHtml(value || '')}" placeholder="https://" aria-label="${linkDetails.label} URL" />
      </details>
    </div>
  `;
}

function renderArtistCard(artist) {
  const status = overallApproval(artist);
  const statusClass = status.toLowerCase().replaceAll(' ', '-');
  const spotifyHref = safeSpotifyHref(artist.spotify);
  const spotifyEmbed = spotifyEmbedDetails(artist.spotify);
  const isEmailed = artist.emailed === 'yes';
  return `
    <article class="discovery-card" data-artist-card data-id="${escapeHtml(artist.id)}">
      <details class="discovery-card__menu">
        <summary aria-label="Artist actions">⋮</summary>
        <button type="button" data-delete-artist>Delete artist</button>
      </details>
      <div class="discovery-card__hero">
        ${spotifyHref
          ? `<a class="discovery-artwork" href="${escapeHtml(spotifyHref)}" target="_blank" rel="noreferrer" data-spotify-artwork="${escapeHtml(spotifyHref)}" data-artist-name="${escapeHtml(artist.name || 'Artist')}" aria-label="Open ${escapeHtml(artist.name || 'artist')} on Spotify"><span>${escapeHtml(artistInitials(artist.name))}</span></a>`
          : `<div class="discovery-artwork discovery-artwork--empty" aria-hidden="true"><span>${escapeHtml(artistInitials(artist.name))}</span></div>`}
        <div class="discovery-card__hero-copy">
          <div class="discovery-card__kicker">
            <span class="discovery-card__type">Artist</span>
            <span class="discovery-statuses">
              <span class="discovery-status discovery-status--${statusClass}" data-approval-status>${escapeHtml(status)}</span>
              ${status === 'Approved' ? `<span class="discovery-email-badge${isEmailed ? ' is-emailed' : ''}">${isEmailed ? 'Emailed' : 'Needs email'}</span>` : ''}
            </span>
          </div>
          <div class="discovery-card__top">
            <input class="discovery-card__name" data-field="name" value="${escapeHtml(artist.name || '')}" aria-label="Artist name" placeholder="Artist name" />
          </div>
          <div class="discovery-fields discovery-fields--identity">
            <label class="discovery-field">
              <span>Monthly listeners</span>
              <input data-field="listeners" type="number" min="0" step="1" value="${escapeHtml(artist.listeners ?? '')}" />
            </label>
            <label class="discovery-field">
              <span>Label association</span>
              <input data-field="label" value="${escapeHtml(artist.label || '')}" placeholder="Independent, label name, or unknown" />
            </label>
            <label class="discovery-field">
              <span>Listeners checked</span>
              <input data-field="checkedOn" type="date" value="${escapeHtml(artist.checkedOn || '')}" />
            </label>
            <label class="discovery-field">
              <span>Added by</span>
              <input data-field="addedBy" value="${escapeHtml(artist.addedBy || '')}" />
            </label>
          </div>
        </div>
      </div>

      ${spotifyEmbed ? `
        <div class="discovery-spotify-player">
          <iframe
            src="${escapeHtml(spotifyEmbed.src)}"
            title="${escapeHtml(artist.name || 'Artist')} Spotify player"
            width="100%"
            height="${spotifyEmbed.height}"
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      ` : ''}

      <div class="discovery-links">
        ${renderArtistLinkField('spotify', artist.spotify)}
        ${renderArtistLinkField('soundcloud', artist.soundcloud)}
        ${renderArtistLinkField('source', artist.source)}
      </div>

      <section class="discovery-panel" aria-labelledby="reviewer-decisions-${escapeHtml(artist.id)}">
        <div class="discovery-panel__header">
          <h4 id="reviewer-decisions-${escapeHtml(artist.id)}">Reviewer decisions</h4>
          <span>Select each reviewer's decision</span>
        </div>
        <div class="discovery-votes" aria-label="Team votes">
          <label class="discovery-vote discovery-vote--${artist.willVote.toLowerCase()}"><span>Will</span><select data-field="willVote">${voteOptions(artist.willVote)}</select></label>
          <label class="discovery-vote discovery-vote--${artist.brettVote.toLowerCase()}"><span>Brett</span><select data-field="brettVote">${voteOptions(artist.brettVote)}</select></label>
          <label class="discovery-vote discovery-vote--${artist.isaiahVote.toLowerCase()}"><span>Isaiah</span><select data-field="isaiahVote">${voteOptions(artist.isaiahVote)}</select></label>
        </div>
      </section>

      <section class="discovery-panel" aria-labelledby="outreach-${escapeHtml(artist.id)}">
        <div class="discovery-panel__header">
          <h4 id="outreach-${escapeHtml(artist.id)}">Outreach &amp; CRM</h4>
          <span>Manage outreach status and contact</span>
        </div>
        <div class="discovery-fields discovery-fields--contact${status === 'Approved' ? ' discovery-fields--approved-contact' : ''}">
          <label class="discovery-field">
            <span>In CRM</span>
            <select data-field="inCrm">
              <option value="no"${artist.inCrm === 'no' ? ' selected' : ''}>No</option>
              <option value="yes"${artist.inCrm === 'yes' ? ' selected' : ''}>Yes</option>
            </select>
          </label>
          <label class="discovery-field discovery-field--wide">
            <span>Contact email or link</span>
            <input data-field="contact" value="${escapeHtml(artist.contact || '')}" placeholder="Enter email address or link…" />
          </label>
          ${status === 'Approved' ? `
            <label class="discovery-field discovery-field--email ${isEmailed ? 'is-emailed' : 'needs-email'}">
              <span>Email outreach</span>
              <select data-field="emailed">
                <option value="no"${!isEmailed ? ' selected' : ''}>Needs email</option>
                <option value="yes"${isEmailed ? ' selected' : ''}>Emailed</option>
              </select>
            </label>
          ` : ''}
        </div>
      </section>

      <details class="discovery-notes"${[artist.willNotes, artist.brettNotes, artist.isaiahNotes].some(Boolean) ? ' open' : ''}>
        <summary>Reviewer notes</summary>
        <div>
          <label><span>Will</span><textarea data-field="willNotes">${escapeHtml(artist.willNotes || '')}</textarea></label>
          <label><span>Brett</span><textarea data-field="brettNotes">${escapeHtml(artist.brettNotes || '')}</textarea></label>
          <label><span>Isaiah</span><textarea data-field="isaiahNotes">${escapeHtml(artist.isaiahNotes || '')}</textarea></label>
        </div>
      </details>

    </article>
  `;
}

function renderDiscoverySource(source) {
  const href = safeExternalHref(source.url);
  return `
    <article class="discovery-source" data-source-card data-id="${escapeHtml(source.id)}">
      <input data-field="name" value="${escapeHtml(source.name || '')}" aria-label="Source name" placeholder="Source name" />
      <div class="discovery-link-row">
        <input data-field="url" type="url" value="${escapeHtml(source.url || '')}" aria-label="Source URL" placeholder="https://" />
        ${href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">Open</a>` : ''}
      </div>
      <textarea data-field="description" aria-label="Why this source is useful">${escapeHtml(source.description || '')}</textarea>
      <button type="button" data-delete-source>Delete</button>
    </article>
  `;
}

function renderDiscovery() {
  const artistList = document.querySelector('[data-artists-list]');
  const sourceList = document.querySelector('[data-sources-list]');
  if (!artistList || !sourceList) return;

  const data = getPortalData();
  const searchTerm = portalSearchInput?.value.trim().toLowerCase() || '';
  const artists = data.artists.filter((artist) => {
    if (!matchesDiscoveryFilter(artist, activeDiscoveryFilter)) return false;
    if (!searchTerm) return true;
    return Object.values(artist).some((value) => String(value || '').toLowerCase().includes(searchTerm));
  });
  if (activeDiscoveryFilter === 'approved') {
    artists.sort((artistA, artistB) => Number(artistA.emailed === 'yes') - Number(artistB.emailed === 'yes'));
  }
  const sources = data.sources.filter((source) => {
    if (!searchTerm) return true;
    return Object.values(source).some((value) => String(value || '').toLowerCase().includes(searchTerm));
  });

  const counts = data.artists.reduce((totals, artist) => {
    const status = overallApproval(artist);
    totals[status] = (totals[status] || 0) + 1;
    return totals;
  }, {});
  const filterCounts = {
    'needs-approval': counts.Pending || 0,
    discuss: counts['Needs discussion'] || 0,
    approved: counts.Approved || 0,
    rejected: counts.Rejected || 0,
    all: data.artists.length,
  };
  const approvedNeedsEmail = data.artists.filter(
    (artist) => overallApproval(artist) === 'Approved' && artist.emailed !== 'yes',
  ).length;

  document.querySelectorAll('[data-discovery-filter]').forEach((button) => {
    const isActive = button.dataset.discoveryFilter === activeDiscoveryFilter;
    const count = filterCounts[button.dataset.discoveryFilter] || 0;
    const label = button.querySelector('span')?.textContent.trim() || 'Artists';
    const countElement = button.querySelector('[data-filter-count]');
    if (countElement) countElement.textContent = count;
    const emailAlert = button.querySelector('[data-approved-email-alert]');
    if (emailAlert) {
      emailAlert.hidden = approvedNeedsEmail === 0;
      emailAlert.textContent = approvedNeedsEmail;
      emailAlert.setAttribute(
        'aria-label',
        `${approvedNeedsEmail} ${approvedNeedsEmail === 1 ? 'artist needs' : 'artists need'} email`,
      );
    }
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    const actionLabel = button.dataset.discoveryFilter === 'approved' && approvedNeedsEmail
      ? `; ${approvedNeedsEmail} ${approvedNeedsEmail === 1 ? 'artist needs' : 'artists need'} email`
      : '';
    button.setAttribute('aria-label', `${label}: ${count} ${count === 1 ? 'artist' : 'artists'}${actionLabel}`);
  });

  const emailNotice = activeDiscoveryFilter === 'approved'
    ? `<div class="discovery-email-notice${approvedNeedsEmail ? '' : ' is-complete'}"><button type="button" data-discovery-back aria-label="Back to all artists">‹</button><strong>${approvedNeedsEmail}</strong><span>${approvedNeedsEmail === 1 ? 'approved artist needs an email' : approvedNeedsEmail ? 'approved artists need an email' : 'All approved artists have been emailed'}</span><i aria-hidden="true">⋮</i></div>`
    : '';

  artistList.innerHTML = artists.length
    ? `${emailNotice}${artists.map(renderArtistCard).join('')}`
    : `<p class="portal-empty">${searchTerm ? 'No artists match this search and filter.' : 'No artists in this view.'}</p>`;
  hydrateSpotifyArtwork();
  sourceList.innerHTML = sources.length
    ? sources.map(renderDiscoverySource).join('')
    : '<p class="portal-empty">No discovery sources match this search.</p>';
}

function renderPortal() {
  renderPortalList('notes', '[data-notes-list]');
  renderPortalList('docs', '[data-docs-list]');
  renderDiscovery();
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

function addArtist() {
  const data = getPortalData();
  data.artists.unshift({
    id: crypto.randomUUID(),
    name: 'Untitled artist',
    spotify: '',
    soundcloud: '',
    source: '',
    listeners: '',
    label: '',
    checkedOn: new Date().toISOString().slice(0, 10),
    addedBy: '',
    willVote: 'Pending',
    brettVote: 'Pending',
    isaiahVote: 'Pending',
    inCrm: 'no',
    emailed: 'no',
    contact: '',
    willNotes: '',
    brettNotes: '',
    isaiahNotes: '',
  });
  savePortalData(data);
  renderDiscovery();
  document.querySelector('[data-artist-card] .discovery-card__name')?.focus();
}

function addDiscoverySource() {
  const data = getPortalData();
  data.sources.unshift({
    id: crypto.randomUUID(),
    name: 'Untitled source',
    url: '',
    description: '',
  });
  savePortalData(data);
  renderDiscovery();
  document.querySelector('[data-source-card] input')?.focus();
}

function updateDiscoveryEntry(element, collection) {
  const card = element.closest(collection === 'artists' ? '[data-artist-card]' : '[data-source-card]');
  if (!card) return;
  const data = getPortalData();
  const entry = data[collection].find((item) => item.id === card.dataset.id);
  if (!entry) return;

  const field = element.dataset.field;
  entry[field] = field === 'listeners' && element.value !== ''
    ? Math.max(0, Number(element.value))
    : element.value;
  savePortalData(data);

  if (collection === 'artists' && ['willVote', 'brettVote', 'isaiahVote', 'emailed'].includes(field)) {
    renderDiscovery();
  }
}

function deleteDiscoveryEntry(card, collection) {
  const data = getPortalData();
  const index = data[collection].findIndex((item) => item.id === card.dataset.id);
  if (index === -1) return;
  data[collection].splice(index, 1);
  savePortalData(data);
  renderDiscovery();
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

document.querySelectorAll('[data-discovery-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    activeDiscoveryFilter = button.dataset.discoveryFilter;
    renderDiscovery();
  });
});

document.querySelector('[data-add-artist]')?.addEventListener('click', addArtist);
document.querySelector('[data-add-source]')?.addEventListener('click', addDiscoverySource);

document.addEventListener('input', (event) => {
  const itemElement = event.target.closest?.('[data-portal-item]');
  if (itemElement) updatePortalItem(itemElement);

  if (event.target.matches?.('[data-artist-card] [data-field]')) {
    updateDiscoveryEntry(event.target, 'artists');
  }

  if (event.target.matches?.('[data-source-card] [data-field]')) {
    updateDiscoveryEntry(event.target, 'sources');
  }
});

document.addEventListener('change', (event) => {
  if (event.target.matches?.('[data-artist-card] select[data-field]')) {
    updateDiscoveryEntry(event.target, 'artists');
  }
});

document.addEventListener('click', (event) => {
  if (event.target.matches('[data-discovery-back]')) {
    activeDiscoveryFilter = 'all';
    renderDiscovery();
  }

  if (event.target.matches('[data-delete-item]')) {
    deletePortalItem(event.target.closest('[data-portal-item]'));
  }

  if (event.target.matches('[data-delete-artist]')) {
    deleteDiscoveryEntry(event.target.closest('[data-artist-card]'), 'artists');
  }

  if (event.target.matches('[data-delete-source]')) {
    deleteDiscoveryEntry(event.target.closest('[data-source-card]'), 'sources');
  }
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
