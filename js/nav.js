// ─── Shared Nav Builder ───────────────────────────────────────────
const NAV_LINKS = [
  { href: 'index.html',       label: 'Home' },
  { href: 'scoreboard.html',  label: 'Scoreboard' },
  { href: 'tracker.html',     label: 'Bet Tracker' },
  { href: 'predictions.html', label: 'Predictions' },
  { href: 'feed.html',        label: 'Feed' },
];

const SOCIAL_LINKS = [
  {
    href: 'https://x.com/OrbAnalytics',
    label: 'X / Twitter',
    svg: `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
  },
  {
    href: 'https://instagram.com/orbanalytics',
    label: 'Instagram',
    svg: `<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`
  },
  {
    href: 'https://tiktok.com/@orbanalytics',
    label: 'TikTok',
    svg: `<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>`
  },
  {
    href: 'https://youtube.com/@orbanalytics',
    label: 'YouTube',
    svg: `<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
  },
  {
    href: 'https://substack.com/@orbanalytics',
    label: 'Substack',
    svg: `<svg viewBox="0 0 24 24"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>`
  },
];

function buildNav(activePage) {
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  const active = activePage || currentFile;

  const nav = document.getElementById('main-nav');
  if (!nav) return;

  const linksHTML = NAV_LINKS.map(link => {
    const isActive = link.href === active ? 'active' : '';
    const isStub = ['feed.html', 'settings.html'].includes(link.href);
    return `<li><a href="${link.href}" class="${isActive}" ${isStub ? 'style="opacity:0.45"' : ''}>${link.label}</a></li>`;
  }).join('');

  const socialHTML = SOCIAL_LINKS.map(s =>
    `<a href="${s.href}" target="_blank" rel="noopener" title="${s.label}">${s.svg}</a>`
  ).join('');

  nav.innerHTML = `
    <a href="index.html" class="nav-logo">
      <img src="assets/logo.png" alt="Orb Analytics" style="width:28px;height:28px;object-fit:contain;">
      Orb Analytics
    </a>
    <ul class="nav-links">${linksHTML}</ul>
    <div class="nav-social">${socialHTML}</div>
  `;
}
