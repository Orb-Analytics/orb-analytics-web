// NBA picks (spread model): fetch and render today's cards into #picks-container-nba.
// Kept separate from the MLB/NFL loaders, like nfl-picks.js. No ESPN live-score matching yet: cards show the
// pick, spread, price, cover probability and model edge (in points); results are recorded in Model History.
// Calls globals defined inline in the page: fmtOdds, logPick, generatedAtBySport, updateLastUpdatedLabel,
// activeSport, updateNBANotice. Loaded before the inline script that calls loadTodayNBA().
//
// predictions.json fields used: picks[] with has_pick, pick, home_team, away_team, spread (picked side),
// line (American price of the picked side), confidence (cover probability), edge (points), notes.

const NBA_PREDICTIONS_URL = '/data/nba/predictions.json';

// ESPN's NBA logo paths differ from the model's abbreviations for these teams.
const NBA_ESPN_LOGO = { GSW: 'gs', NOP: 'no', NYK: 'ny', SAS: 'sa', UTA: 'utah', WAS: 'wsh', PHX: 'phx' };
const nbaLogoURL = a => a ? `https://a.espncdn.com/i/teamlogos/nba/500/${NBA_ESPN_LOGO[a] || a.toLowerCase()}.png` : null;

function nbaLogoHTML(abbr, size = 56) {
  const url = nbaLogoURL(abbr);
  if (!url) return `<div class="pick-team-logo-fallback" style="width:${size}px;height:${size}px">${abbr}</div>`;
  return `<img class="pick-team-logo" src="${url}" alt="${abbr}" style="width:${size}px;height:${size}px"
    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="pick-team-logo-fallback" style="width:${size}px;height:${size}px;display:none">${abbr}</div>`;
}

async function loadTodayNBA() {
  const container = document.getElementById('picks-container-nba');
  if (!container) return;
  try {
    const data = await fetch(NBA_PREDICTIONS_URL).then(r => r.json());
    if (data.generated_at) {
      generatedAtBySport.nba = data.generated_at;
      if (activeSport === 'nba') updateLastUpdatedLabel();
    }
    renderTodayPicksNBA((data.picks || []).filter(p => p.has_pick === true));
  } catch (e) {
    container.innerHTML = '';   // leave the "coming soon" notice if the feed is unavailable
  }
  updateNBANotice();
}

function renderTodayPicksNBA(picks) {
  const container = document.getElementById('picks-container-nba');
  container.innerHTML = picks.map(pick => {
    const conf = pick.confidence || 0.5;
    const price = pick.line ?? 0;
    const side = pick.pick === pick.home_team ? 'Home' : 'Away';
    const edge = Math.abs(pick.edge ?? 0).toFixed(1);
    return `<div class="pick-card">
      <div class="pick-card-header">
        <div class="pick-card-status"><span class="badge badge-final">SPREAD</span></div>
        <button class="log-pick-btn" onclick="event.stopPropagation(); logPick('${pick.pick}','NBA',${price})">＋ Log Pick</button>
      </div>
      <div class="pick-matchup">${pick.away_team} <span class="vs">@</span> ${pick.home_team}</div>
      <div class="pick-team-hero">
        <div style="display:flex;align-items:center;gap:0.85rem">
          ${nbaLogoHTML(pick.pick, 56)}
          <div class="pick-team-info">
            <div style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;color:var(--text)">${pick.pick} <span style="font-weight:600">${fmtOdds(pick.spread)}</span></div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.45rem">
        <div class="pick-main" style="padding:0.6rem 0.8rem">
          <div class="pick-label">Cover Probability</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--gray-600)">${(conf * 100).toFixed(1)}%</div>
        </div>
        <div class="pick-main" style="padding:0.6rem 0.8rem">
          <div class="pick-label">Model Edge</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--gray-600)">${edge} pts</div>
        </div>
      </div>
      <div style="margin-top:auto">
        <div class="pick-meta-row">
          <div class="meta-chip">Odds: <span>${fmtOdds(price)}</span></div>
          <div class="meta-chip">${side}</div>
        </div>
      </div>
    </div>`;
  }).join('');
}
