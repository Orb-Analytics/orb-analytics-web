// ─── Orb Analytics Shared Nav ─────────────────────────────────────

const SIDEBAR_LINKS = [
  { href: 'predictions.html', label: 'Predictions', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>` },
  { href: 'scoreboard.html',  label: 'Scoreboard',  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>` },
  { href: 'feed.html',        label: 'Feed',         icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>`, soon: true },
  { href: 'settings.html',    label: 'Settings',     icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`, soon: true },
];

const SOCIAL_LINKS = [
  { href: 'https://orbanalytics.substack.com/', label: 'Substack', svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>` },
  { href: 'https://www.tiktok.com/@orb.analytics', label: 'TikTok', svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.79a4.85 4.85 0 01-1.02-.1z"/></svg>` },
  { href: 'https://www.instagram.com/orb.analytics/', label: 'Instagram', svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.75A4 4 0 0 0 3.75 7.75v8.5a4 4 0 0 0 4 4h8.5a4 4 0 0 0 4-4v-8.5a4 4 0 0 0-4-4h-8.5Zm9.62 1.31a1.07 1.07 0 1 1 0 2.14 1.07 1.07 0 0 1 0-2.14ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z"/></svg>` },
  { href: 'https://www.youtube.com/@OrbAnalyticsLimited', label: 'YouTube', svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 7.2a3.05 3.05 0 0 0-2.15-2.16C19.46 4.5 12 4.5 12 4.5s-7.46 0-9.35.54A3.05 3.05 0 0 0 .5 7.2C0 9.12 0 12 0 12s0 2.88.5 4.8a3.05 3.05 0 0 0 2.15 2.16C4.54 19.5 12 19.5 12 19.5s7.46 0 9.35-.54a3.05 3.05 0 0 0 2.15-2.16C24 14.88 24 12 24 12s0-2.88-.5-4.8ZM9.75 15.5v-7L16 12l-6.25 3.5Z"/></svg>` },
  { href: 'https://x.com/OrbPicks', label: 'X', svg: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>` },
];

function buildNav(activePage = '') {
  // Apply saved theme
  if (localStorage.getItem('orb-theme') === 'dark') {
    document.body.classList.add('dark');
  }

  // ── Top nav (logo + social only) ──────────────────────────────
  const topNav = document.getElementById('main-nav');
  if (topNav) {
    topNav.innerHTML = `
      <a class="nav-logo-link" href="predictions.html" aria-label="Orb Analytics Home">
        <img src="assets/logo.png" alt="Orb Analytics" class="orb-logo-img" />
        <span class="nav-logo-text">Orb Analytics Ltd.</span>
      </a>
      <div style="display:flex;align-items:center;gap:0.5rem;margin-left:auto">
        <div class="nav-social">
          ${SOCIAL_LINKS.map(s => `
            <a href="${s.href}" target="_blank" rel="noopener noreferrer" aria-label="${s.label}" title="${s.label}">${s.svg}</a>
          `).join('')}
        </div>
        <button class="theme-toggle nav-theme-toggle" id="theme-toggle-mobile" onclick="toggleTheme()" title="Toggle theme">
          ${document.body.classList.contains('dark') ? '☀️' : '🌙'}
        </button>
      </div>
    `;
  }

  // ── Left sidebar ───────────────────────────────────────────────
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-inner">
        <nav class="sidebar-nav">
          ${SIDEBAR_LINKS.map(item => `
            <a href="${item.soon ? '#' : item.href}"
               class="sidebar-link${activePage === item.href ? ' active' : ''}${item.soon ? ' soon' : ''}"
               title="${item.label}">
              <span class="sidebar-icon">${item.icon}</span>
              <span class="sidebar-label">${item.label}${item.soon ? '<span class="sidebar-soon">Soon</span>' : ''}</span>
            </a>
          `).join('')}
        </nav>
        <div class="sidebar-footer">
          <button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()" title="Toggle theme" style="width:100%;justify-content:center;gap:0.5rem;font-size:0.85rem;font-family:var(--font-body)">
            ${document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    `;
  }

  // ── Mobile sidebar toggle ──────────────────────────────────────
  const toggle = document.getElementById('sidebar-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebar-overlay').classList.toggle('open');
    });
  }
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

window.buildNav = buildNav;

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('orb-theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  const mBtn = document.getElementById('theme-toggle-mobile');
  if (mBtn) mBtn.textContent = isDark ? '☀️' : '🌙';
}