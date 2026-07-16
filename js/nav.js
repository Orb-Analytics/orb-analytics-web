// ─── Shared Nav Builder ───────────────────────────────────────────
const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'scoreboard.html', label: 'Scoreboard' },
  { href: 'predictions.html', label: 'Predictions' },
  { href: 'tracker.html', label: 'Bankroll' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://orbanalytics.substack.com/',
    label: 'Substack',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>`
  },
  {
    href: 'https://www.tiktok.com/@orb.analytics',
    label: 'TikTok',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>`
  },
  {
    href: 'https://www.instagram.com/orb.analytics/',
    label: 'Instagram',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5"></rect>
      <circle cx="12" cy="12" r="4"></circle>
      <circle cx="17.5" cy="6.5" r="1"></circle>
    </svg>`
  },
  {
    href: 'https://www.youtube.com/@OrbAnalyticsLimited',
    label: 'YouTube',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2.5" y="6" width="19" height="12" rx="3.5"></rect>
      <path d="M10 9.25L15.5 12L10 14.75Z" fill="currentColor" stroke="none"></path>
    </svg>`
  },
  {
    href: 'https://x.com/OrbPicks',
    label: 'X',
    svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  }
];

function buildNav(activePage = '') {
  const root = document.getElementById('main-nav');
  if (!root) return;

  root.innerHTML = `
    <div class="nav-logo">
      <a class="nav-logo-link" href="index.html" aria-label="Orb Analytics Home">
        <img src="assets/logo.png" alt="Orb Analytics" class="orb-logo-img" />
        <span class="nav-logo-text">Orb Analytics</span>
      </a>
    </div>
    <div class="nav-links">
      ${NAV_LINKS.map(item => link(item.href, item.label, activePage)).join('')}
    </div>
    <div class="nav-social">
      ${SOCIAL_LINKS.map(s => `
        <a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}" title="${s.label}">
          ${s.svg}
        </a>
      `).join('')}
    </div>
  `;
}

window.buildNav = buildNav;

// add this helper if missing
function link(href, label, activePage) {
  const active = activePage === href ? 'active' : '';
  return `<a class="${active}" href="${href}">${label}</a>`;
}
