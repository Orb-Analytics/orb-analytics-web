// ─── Shared Nav Builder ───────────────────────────────────────────
const NAV_LINKS = [
  { href: 'index.html', label: 'Home' },
  { href: 'scoreboard.html', label: 'Scoreboard' },
  { href: 'predictions.html', label: 'Predictions' },
  { href: 'tracker.html', label: 'Bankroll' },
];

const SOCIAL_LINKS = [
  { href: 'https://orbanalytics.substack.com/', label: 'Substack' },
  { href: 'https://www.tiktok.com/@orb.analytics', label: 'TikTok' },
  { href: 'https://www.instagram.com/orb.analytics/', label: 'Instagram' },
  { href: 'https://www.youtube.com/@OrbAnalyticsLimited', label: 'YouTube' },
  { href: 'https://x.com/OrbPicks', label: 'X' },
];

(function () {
  function link(href, label, activePage) {
    const active = activePage === href ? 'active' : '';
    return `<a class="${active}" href="${href}">${label}</a>`;
  }

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
        ${NAV_LINKS.map((item) => link(item.href, item.label, activePage)).join('')}
      </div>

      <div class="nav-social">
        ${SOCIAL_LINKS.map((s) =>
          `<a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}" title="${s.label}">${s.label}</a>`
        ).join('')}
      </div>
    `;
  }

  window.buildNav = buildNav;
})();
