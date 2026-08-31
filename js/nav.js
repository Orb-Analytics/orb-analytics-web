// ─── Orb Analytics Shared Nav ─────────────────────────────────────

const SIDEBAR_LINKS = [
  { href: 'predictions.html', label: 'Predictions', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="14 7 21 7 21 14"/></svg>` },
  { href: 'scoreboard.html',  label: 'Scoreboard',  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
  { href: 'snapshot.html',    label: 'Snapshot Analysis', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="4" x2="4" y2="20"/><line x1="4" y1="20" x2="20" y2="20"/><circle cx="8.5" cy="15.5" r="1.6"/><circle cx="13" cy="9" r="1.6"/><circle cx="18" cy="6" r="1.6"/><circle cx="10.5" cy="17.5" r="1.6"/></svg>` },
  { href: 'tracker.html',     label: 'Bet Tracker', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>` },
  { href: 'about.html',       label: 'About Us',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>` },
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

// ── Auth modal ────────────────────────────────────────────────────
function injectAuthModal() {
  if (document.getElementById('auth-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'auth-modal';
  modal.style.cssText = `
    display:none;position:fixed;inset:0;z-index:1000;
    background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);
    align-items:center;justify-content:center;padding:1rem;
  `;
  modal.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;
                padding:2rem;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.15);
                position:relative;">
      <button onclick="closeAuthModal()" style="position:absolute;top:1rem;right:1rem;
              background:none;border:none;font-size:1.2rem;cursor:pointer;color:var(--gray-500)">✕</button>

      <!-- Tabs -->
      <div style="display:flex;gap:0;margin-bottom:1.5rem;border-bottom:2px solid var(--border)">
        <button id="auth-tab-signin" onclick="switchAuthTab('signin')"
          style="flex:1;padding:0.6rem;border:none;background:none;font-family:var(--font-body);
                 font-size:0.9rem;font-weight:600;cursor:pointer;color:var(--purple-600);
                 border-bottom:2px solid var(--purple-600);margin-bottom:-2px;transition:all 0.2s">
          Sign In
        </button>
        <button id="auth-tab-signup" onclick="switchAuthTab('signup')"
          style="flex:1;padding:0.6rem;border:none;background:none;font-family:var(--font-body);
                 font-size:0.9rem;font-weight:600;cursor:pointer;color:var(--gray-500);
                 border-bottom:2px solid transparent;margin-bottom:-2px;transition:all 0.2s">
          Create Account
        </button>
      </div>

      <!-- Sign In Form -->
      <div id="auth-form-signin">
        <div style="margin-bottom:1rem">
          <label style="font-size:0.78rem;font-weight:600;color:var(--gray-600);
                        text-transform:uppercase;letter-spacing:0.04em;display:block;margin-bottom:0.35rem">Email</label>
          <input id="signin-email" type="email" placeholder="you@example.com"
            style="width:100%;padding:0.65rem 0.9rem;border:1px solid var(--border);border-radius:8px;
                   font-family:var(--font-body);font-size:0.9rem;background:var(--gray-50);
                   color:var(--text);outline:none;transition:border-color 0.2s"
            onfocus="this.style.borderColor='var(--purple-500)'"
            onblur="this.style.borderColor='var(--border)'" />
        </div>
        <div style="margin-bottom:1.25rem">
          <label style="font-size:0.78rem;font-weight:600;color:var(--gray-600);
                        text-transform:uppercase;letter-spacing:0.04em;display:block;margin-bottom:0.35rem">Password</label>
          <input id="signin-password" type="password" placeholder="••••••••"
            style="width:100%;padding:0.65rem 0.9rem;border:1px solid var(--border);border-radius:8px;
                   font-family:var(--font-body);font-size:0.9rem;background:var(--gray-50);
                   color:var(--text);outline:none;transition:border-color 0.2s"
            onfocus="this.style.borderColor='var(--purple-500)'"
            onblur="this.style.borderColor='var(--border)'"
            onkeydown="if(event.key==='Enter')handleSignIn()" />
        </div>
        <div id="signin-error" style="color:var(--red);font-size:0.82rem;margin-bottom:0.75rem;display:none"></div>
        <button onclick="handleSignIn()"
          style="width:100%;padding:0.7rem;background:var(--purple-600);color:white;border:none;
                 border-radius:8px;font-family:var(--font-body);font-size:0.9rem;font-weight:600;
                 cursor:pointer;transition:background 0.2s"
          onmouseover="this.style.background='var(--purple-500)'"
          onmouseout="this.style.background='var(--purple-600)'">
          Sign In
        </button>
      </div>

      <!-- Sign Up Form -->
      <div id="auth-form-signup" style="display:none">
        <div style="margin-bottom:1rem">
          <label style="font-size:0.78rem;font-weight:600;color:var(--gray-600);
                        text-transform:uppercase;letter-spacing:0.04em;display:block;margin-bottom:0.35rem">Email</label>
          <input id="signup-email" type="email" placeholder="you@example.com"
            style="width:100%;padding:0.65rem 0.9rem;border:1px solid var(--border);border-radius:8px;
                   font-family:var(--font-body);font-size:0.9rem;background:var(--gray-50);
                   color:var(--text);outline:none;transition:border-color 0.2s"
            onfocus="this.style.borderColor='var(--purple-500)'"
            onblur="this.style.borderColor='var(--border)'" />
        </div>
        <div style="margin-bottom:1rem">
          <label style="font-size:0.78rem;font-weight:600;color:var(--gray-600);
                        text-transform:uppercase;letter-spacing:0.04em;display:block;margin-bottom:0.35rem">Password</label>
          <input id="signup-password" type="password" placeholder="Min. 6 characters"
            style="width:100%;padding:0.65rem 0.9rem;border:1px solid var(--border);border-radius:8px;
                   font-family:var(--font-body);font-size:0.9rem;background:var(--gray-50);
                   color:var(--text);outline:none;transition:border-color 0.2s"
            onfocus="this.style.borderColor='var(--purple-500)'"
            onblur="this.style.borderColor='var(--border)'" />
        </div>
        <div style="margin-bottom:1.25rem">
          <label style="font-size:0.78rem;font-weight:600;color:var(--gray-600);
                        text-transform:uppercase;letter-spacing:0.04em;display:block;margin-bottom:0.35rem">Confirm Password</label>
          <input id="signup-confirm" type="password" placeholder="••••••••"
            style="width:100%;padding:0.65rem 0.9rem;border:1px solid var(--border);border-radius:8px;
                   font-family:var(--font-body);font-size:0.9rem;background:var(--gray-50);
                   color:var(--text);outline:none;transition:border-color 0.2s"
            onfocus="this.style.borderColor='var(--purple-500)'"
            onblur="this.style.borderColor='var(--border)'"
            onkeydown="if(event.key==='Enter')handleSignUp()" />
        </div>
        <div id="signup-error" style="color:var(--red);font-size:0.82rem;margin-bottom:0.75rem;display:none"></div>
        <button onclick="handleSignUp()"
          style="width:100%;padding:0.7rem;background:var(--purple-600);color:white;border:none;
                 border-radius:8px;font-family:var(--font-body);font-size:0.9rem;font-weight:600;
                 cursor:pointer;transition:background 0.2s"
          onmouseover="this.style.background='var(--purple-500)'"
          onmouseout="this.style.background='var(--purple-600)'">
          Create Account
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.addEventListener('click', e => { if (e.target === modal) closeAuthModal(); });
}

function switchAuthTab(tab) {
  const isSignin = tab === 'signin';
  document.getElementById('auth-form-signin').style.display = isSignin ? 'block' : 'none';
  document.getElementById('auth-form-signup').style.display = isSignin ? 'none' : 'block';
  document.getElementById('auth-tab-signin').style.color = isSignin ? 'var(--purple-600)' : 'var(--gray-500)';
  document.getElementById('auth-tab-signup').style.color = isSignin ? 'var(--gray-500)' : 'var(--purple-600)';
  document.getElementById('auth-tab-signin').style.borderBottomColor = isSignin ? 'var(--purple-600)' : 'transparent';
  document.getElementById('auth-tab-signup').style.borderBottomColor = isSignin ? 'transparent' : 'var(--purple-600)';
}

window.openAuthModal  = function(tab = 'signin') { injectAuthModal(); switchAuthTab(tab); document.getElementById('auth-modal').style.display = 'flex'; };
window.closeAuthModal = function() { document.getElementById('auth-modal').style.display = 'none'; };
window.switchAuthTab  = switchAuthTab;

window.handleSignIn = async function() {
  const email    = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  const errEl    = document.getElementById('signin-error');
  errEl.style.display = 'none';
  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return; }
  try {
    await window.orbSignIn(email, password);
    closeAuthModal();
  } catch(e) {
    errEl.textContent = friendlyError(e.code);
    errEl.style.display = 'block';
  }
};

window.handleSignUp = async function() {
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm  = document.getElementById('signup-confirm').value;
  const errEl    = document.getElementById('signup-error');
  errEl.style.display = 'none';
  if (!email || !password) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return; }
  if (password !== confirm) { errEl.textContent = 'Passwords do not match.'; errEl.style.display = 'block'; return; }
  if (password.length < 6)  { errEl.textContent = 'Password must be at least 6 characters.'; errEl.style.display = 'block'; return; }
  try {
    await window.orbSignUp(email, password);
    closeAuthModal();
  } catch(e) {
    errEl.textContent = friendlyError(e.code);
    errEl.style.display = 'block';
  }
};

function friendlyError(code) {
  const map = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}

// ── Build nav ─────────────────────────────────────────────────────
function buildNav(activePage = '') {
  if (localStorage.getItem('orb-theme') === 'dark') {
    document.body.classList.add('dark');
  }

  const topNav = document.getElementById('main-nav');
  if (topNav) {
    topNav.innerHTML = `
      <a class="nav-logo-link" href="predictions.html" aria-label="Orb Analytics Home">
        <img src="assets/logo.png" alt="Orb Analytics" class="orb-logo-img" />
      </a>
      <a class="nav-logo-center" href="predictions.html" aria-label="Orb Analytics Home">
        <span class="nav-logo-text">orbanalytics<span class="nav-logo-accent">.limited</span></span>
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
          <!-- Auth section -->
          <div id="sidebar-auth" style="margin-bottom:0.75rem">
            <div id="sidebar-signed-out" style="display:none"></div>
            <div id="sidebar-signed-in" style="display:none">
              <div id="sidebar-user-email"
                style="font-size:0.75rem;color:var(--gray-600);margin-bottom:0.5rem;
                       white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:var(--font-mono)"></div>
              <button onclick="handleSignOut()"
                style="width:100%;padding:0.5rem;background:transparent;color:var(--gray-600);
                       border:1px solid var(--border);border-radius:8px;font-family:var(--font-body);
                       font-size:0.8rem;cursor:pointer;transition:all 0.2s"
                onmouseover="this.style.borderColor='var(--red)';this.style.color='var(--red)'"
                onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--gray-600)'">Sign Out</button>
            </div>
          </div>
          <button class="theme-toggle" id="theme-toggle" onclick="toggleTheme()" title="Toggle theme"
            style="width:100%;justify-content:center;gap:0.5rem;font-size:0.85rem;font-family:var(--font-body)">
            ${document.body.classList.contains('dark') ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>
    `;
  }

  buildDisclaimer();

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

// ── Build site-wide disclaimer ──────────────────────────────────────
function buildDisclaimer() {
  const el = document.getElementById('site-disclaimer');
  if (!el) return;
  el.innerHTML = `
    <div class="disclaimer-block">
      <div class="disclaimer-label">Disclaimer</div>
      <div class="disclaimer-text">
        <p>The information provided on this website is for informational purposes only. It is not intended to be gambling or financial advice, and should not be relied upon as such. We are not responsible for any actions or decisions taken by readers based on the information provided on this website.</p>
        <p>The picks and predictions provided on this website are based on our own research and analysis, and are intended to be used for entertainment and informational purposes only. We do not guarantee the accuracy or completeness of the information provided, and we are not responsible for any losses or damages incurred as a result of using this information for gambling or other purposes.</p>
        <p>By accessing and using this website, you acknowledge and agree to the terms of this disclaimer, and you assume all risks and liabilities associated with your use of the information provided on this website.</p>
      </div>
    </div>
  `;
}

window.buildNav = buildNav;

// ── Update sidebar auth state ─────────────────────────────────────
window.updateAuthUI = function(user) {
  const signedOut = document.getElementById('sidebar-signed-out');
  const signedIn  = document.getElementById('sidebar-signed-in');
  const emailEl   = document.getElementById('sidebar-user-email');
  if (!signedOut || !signedIn) return;
  if (user) {
    signedOut.style.display = 'none';
    signedIn.style.display  = 'block';
    if (emailEl) emailEl.textContent = user.email;
  } else {
    signedOut.style.display = 'block';
    signedIn.style.display  = 'none';
  }
};

window.handleSignOut = async function() {
  // Inject confirmation modal if not already there
  if (!document.getElementById('signout-modal')) {
    const m = document.createElement('div');
    m.id = 'signout-modal';
    m.style.cssText = `
      display:none;position:fixed;inset:0;z-index:1001;
      background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);
      align-items:center;justify-content:center;padding:1rem;
    `;
    m.innerHTML = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;
                  padding:2rem;width:100%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.15);text-align:center">
        <div style="font-size:2rem;margin-bottom:0.75rem">👋</div>
        <div style="font-family:var(--font-display);font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:0.5rem">Sign out?</div>
        <div style="font-size:0.875rem;color:var(--gray-600);margin-bottom:1.5rem">Your bets are saved and will be here when you come back.</div>
        <div style="display:flex;gap:0.75rem">
          <button onclick="document.getElementById('signout-modal').style.display='none'"
            style="flex:1;padding:0.65rem;background:transparent;color:var(--text);
                   border:1px solid var(--border);border-radius:8px;font-family:var(--font-body);
                   font-size:0.875rem;font-weight:600;cursor:pointer;transition:all 0.2s"
            onmouseover="this.style.background='var(--gray-100)'"
            onmouseout="this.style.background='transparent'">Cancel</button>
          <button onclick="confirmSignOut()"
            style="flex:1;padding:0.65rem;background:var(--red);color:white;
                   border:none;border-radius:8px;font-family:var(--font-body);
                   font-size:0.875rem;font-weight:600;cursor:pointer;transition:opacity 0.2s"
            onmouseover="this.style.opacity='0.85'"
            onmouseout="this.style.opacity='1'">Sign Out</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);
    m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
  }
  document.getElementById('signout-modal').style.display = 'flex';
};

window.confirmSignOut = async function() {
  document.getElementById('signout-modal').style.display = 'none';
  await window.orbSignOut();
};

// ── Gate game clickthroughs behind sign-up ─────────────────────────
window.goToGame = function(url) {
  if (window.currentUser) {
    location.href = url;
  } else {
    window.openAuthModal('signup');
  }
};

// ── Theme ─────────────────────────────────────────────────────────
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('orb-theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  const mBtn = document.getElementById('theme-toggle-mobile');
  if (mBtn) mBtn.textContent = isDark ? '☀️' : '🌙';
}

window.toggleTheme = toggleTheme;