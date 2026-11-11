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
    // Let the initial images settle, then change one tile every three seconds.
    if (initialTicks > 0) { initialTicks--; return; }
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
        current.remove();
        incoming.className = '';
        slot.artistIndex = artistIndex;
        artworkIndexes[artistIndex]++;
      });
      nextSlot = (nextSlot + 1) % slots.length;
      nextArtist = (artistIndex + 1) % collections.length;
    } catch {
      replacements.forEach(({incoming}) => incoming.remove());
    } finally { busy = false; }
  }, 3000);
})();
