// Novig promo rotation for the sponsor slot ([data-novig-promo] <picture>).
//
// To add or remove a promo, edit this list (names are the PNGs in
// assets/novig_promos/ without ".png"). New PNGs need their web-sized copies
// built first: see scripts/optimize-novig-promos.mjs.
const NOVIG_PROMOS = [
  'novig-BASEBALL-FANS-1x1-ORB',
  'novig-BASKETBALL-FANS-1x1-ORB',
  'novig-FAIRWAY-WALK-1x1-ORB',
  'novig-GOLF-PUTT-1x1-ORB',
  'novig-SOCCER-RETRO-BLACKWHITE-1x1-ORB',
  'novig-TENNIS-SERVE-1x1-ORB',
];

// Each page load shows a random promo, never the one this visitor saw last
// (remembered in localStorage; if storage is blocked it's simply random).
// Every slot on a page shows the same pick. This script is included right
// after the slot markup so the image is chosen before the slot paints; the
// <img> has no src until then and stays invisible until the chosen image
// has loaded, so the old/default image can never flash.
(function () {
  const DIR = 'assets/novig_promos/optimized/';
  const WIDTHS = [360, 720, 1080];
  const LAST_KEY = 'orb-novig-last-promo';
  let pick = null;

  function choosePromo() {
    let last = null;
    try { last = localStorage.getItem(LAST_KEY); } catch {}
    const options = NOVIG_PROMOS.length > 1 ? NOVIG_PROMOS.filter(n => n !== last) : NOVIG_PROMOS;
    const name = options[Math.floor(Math.random() * options.length)];
    try { localStorage.setItem(LAST_KEY, name); } catch {}
    return name;
  }

  function fillNovigPromos() {
    const slots = document.querySelectorAll('picture[data-novig-promo]:not([data-filled])');
    if (!slots.length) return;
    pick ||= choosePromo();
    const srcset = ext => WIDTHS.map(w => `${DIR}${pick}-${w}.${ext} ${w}w`).join(', ');
    slots.forEach(pic => {
      pic.dataset.filled = pick;
      const source = pic.querySelector('source[type="image/webp"]');
      if (source) source.srcset = srcset('webp');
      const img = pic.querySelector('img');
      const show = () => img.classList.add('is-loaded');
      img.addEventListener('load', show, { once: true });
      img.srcset = srcset('jpg');
      img.src = `${DIR}${pick}-720.jpg`;
      if (img.complete && img.naturalWidth) show();
    });
  }

  fillNovigPromos();
  // Picks up any slot that appears later in the page.
  document.addEventListener('DOMContentLoaded', fillNovigPromos);
})();
