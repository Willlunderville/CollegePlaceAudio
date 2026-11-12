/* Rotate the catalogue through four slots, excluding artists already visible. */
(() => {
  const grid = document.querySelector('.artist-grid');
  if (!grid) return;
  const collections = [
    ['Portrait against a charcoal backdrop', ['portrait-charcoal.jpg']],
    ['Portrait in a hat under magenta light', ['portrait-magenta.jpg']],
    ['Portrait with sunglasses against a golden backdrop', ['portrait-gold.jpg']],
    ['Handwritten music and a photograph on turquoise paper', ['songwriting-collage-clean.jpg']],
    ['Seated portrait in a denim shirt', ['portrait-denim.jpg']],
    ['A figure walking along a sandy coastal path', ['coastal-path.jpg']],
    ['Black-and-white portrait in a knit cap', ['portrait-knit-cap.jpg']],
  ];
  const slots = [...grid.querySelectorAll('.artist-grid__tile')].map((tile, artistIndex) => ({tile, artistIndex}));
  // Only label photos that have been matched to an artist.
  const photoArtists = {
    'portrait-charcoal.jpg': 'Sebastião Serrador',
    'portrait-magenta.jpg': 'Clay Orange',
    'portrait-gold.jpg': 'Carter Ace',
    'portrait-denim.jpg': 'Kev Olden',
    'songwriting-collage-clean.jpg': 'Birthday Boy',
    'coastal-path.jpg': 'Brita Eyrie',
    'portrait-knit-cap.jpg': 'Jmaroon',
  };
  const rosterLinks = new Map([
    ['Birthday Boy', 'https://s.disco.ac/ajvrfervhkel'],
    ['Brita Eyrie', 'https://s.disco.ac/fdeomwqrhydx'],
    ['Carter Ace', 'https://s.disco.ac/aqchjhvzeyhr'],
    ['Clay Orange', 'https://s.disco.ac/vmbtbuonisdm'],
    ['Jmaroon', 'https://s.disco.ac/xnfhvgkvjmtt'],
    ['Kev Olden', 'https://s.disco.ac/oigebytthzcs'],
    ['Sebastião Serrador', 'https://s.disco.ac/cnpljvbuvdfp'],
  ]);
  function clearRetiredRoute() {
    if (location.hash === '#artists') history.replaceState(history.state, '', location.pathname + location.search);
  }
  clearRetiredRoute();
  window.addEventListener('hashchange', clearRetiredRoute);
  const measure = document.createElement('canvas').getContext('2d');
  const displayFont = '700 100px "Archivo Narrow"';
  const fontReady = document.fonts.load(displayFont).catch(() => {});
  function updateArtistLink(tile, file) {
    tile.querySelector('.artist-grid__link')?.remove();
    const name = photoArtists[file];
    if (!rosterLinks.has(name)) return;
    const link = document.createElement('a');
    link.className = 'artist-grid__link';
    link.href = rosterLinks.get(name);
    link.setAttribute('aria-label', 'Listen to ' + name + ' on DISCO');
    const label = document.createElement('span');
    const lines = name.split(/\s+(.+)/).filter(Boolean);
    label.textContent = lines.join('\n');
    fontReady.then(() => {
      if (!measure) return;
      measure.font = displayFont;
      const width = Math.max(...lines.map(line => measure.measureText(line.toUpperCase()).width));
      if (width) label.style.setProperty('--name-size', (8400 / width) + 'cqi');
    });
    link.append(label);
    tile.append(link);
  }
  slots.forEach(({tile, artistIndex}) => updateArtistLink(tile, collections[artistIndex][1][0]));
  const artworkIndexes = collections.map(() => 0);
  let nextSlot = 0;
  let nextArtist = slots.length;
  let initialTicks = 2;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let busy = false;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(grid);
  setInterval(async () => {
    if (busy || motion.matches || document.hidden || !visible || location.hash) return;
    // Hold the opening collage for two extra intervals before the first change.
    if (initialTicks > 0) { initialTicks--; return; }
    if (slots[nextSlot].tile.matches(':hover, :focus-within')) return;
    busy = true;
    const slot = slots[nextSlot];
    const visibleArtists = new Set(slots.map(item => item.artistIndex));
    let artistIndex = nextArtist % collections.length;
    while (visibleArtists.has(artistIndex)) artistIndex = (artistIndex + 1) % collections.length;
    const replacements = [slot].map(slot => {
      const [artist, files] = collections[artistIndex];
      const incoming = new Image();
      incoming.src = `assets/artists/${files[artworkIndexes[artistIndex] % files.length]}`;
      incoming.alt = artist;
      incoming.className = 'artist-grid__incoming';
      return {slot, artistIndex, incoming, current: slot.tile.querySelector(':scope > img')};
    });
    try {
      await Promise.all(replacements.map(item => item.incoming.decode()));
      if (motion.matches || document.hidden || !visible || location.hash) return;
      await Promise.all(replacements.map(({slot, incoming, current}) => {
        slot.tile.insertBefore(incoming, current);
        return incoming.animate([{opacity: 0}, {opacity: 1}], {duration: 650, easing: 'ease-out'}).finished;
      }));
      replacements.forEach(({slot, incoming, current, artistIndex}) => {
        if (slot.tile.matches(':hover, :focus-within')) {
          incoming.remove();
          return;
        }
        current.remove();
        incoming.className = '';
        slot.artistIndex = artistIndex;
        updateArtistLink(slot.tile, collections[artistIndex][1][0]);
        artworkIndexes[artistIndex]++;
      });
      nextSlot = (nextSlot + 1) % slots.length;
      nextArtist = (artistIndex + 1) % collections.length;
    } catch {
      replacements.forEach(({incoming}) => incoming.remove());
    } finally { busy = false; }
  }, 4000);
})();
