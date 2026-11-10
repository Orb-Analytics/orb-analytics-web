// NBA picks (spread model): fetch, ESPN live-score matching, and render today's cards into #picks-container-nba.
// Same card structure as js/nfl-picks.js (header badges, live score + cover badge, probability boxes, edge/odds/side
// chips, odds source, edge bar, click-through to the game page); kept as its own file like nfl-picks.js.
// Calls globals defined in the page or loaded before this file: fmtOdds, fmtGameTime, coverageSortOrder, logPick,
// goToGame, generatedAtBySport, updateLastUpdatedLabel, activeSport, todayModelLoadState,
// updateAllPredictionsEmptyState, updateNBANotice (inline), gradeSpreadPick (js/nfl-picks.js) and oddsSourceHTML
// (js/odds-source.js). Loaded before the inline script that calls loadTodayNBA().
//
// predictions.json fields used: date, generated_at, picks[] with has_pick, pick, home_team, away_team, spread (picked
// side), line (American price of the picked side), confidence (cover probability, regressed to the market), edge
// (decimal: 0.033 = 3.3%; confidence - implied), odds_source (optional).

const NBA_PREDICTIONS_URL = '/data/nba/predictions.json';

// ESPN's NBA abbreviations (logo paths and scoreboard) differ from the model's for these teams.
const NBA_MODEL_TO_ESPN = { GSW: 'GS', NOP: 'NO', NYK: 'NY', SAS: 'SA', UTA: 'UTAH', WAS: 'WSH' };
const toEspnAbbrNBA = a => (NBA_MODEL_TO_ESPN[a] || a || '').toUpperCase();
const nbaLogoURL = a => a ? `https://a.espncdn.com/i/teamlogos/nba/500/${toEspnAbbrNBA(a).toLowerCase()}.png` : null;

function nbaLogoHTML(abbr, size = 56) {
  const url = nbaLogoURL(abbr);
  if (!url) return `<div class="pick-team-logo-fallback" style="width:${size}px;height:${size}px">${abbr}</div>`;
  return `<img class="pick-team-logo" src="${url}" alt="${abbr}" style="width:${size}px;height:${size}px"
    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="pick-team-logo-fallback" style="width:${size}px;height:${size}px;display:none">${abbr}</div>`;
}

// Edge as a percentage number (2.3 for 0.023), for the chip, the bar and its width.
const nbaEdgePct = pick => pick.edge == null ? null : pick.edge * 100;
const fmtEdgeNBA = pct => pct == null ? '—' : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;

// The feed's slate date (US-Eastern, "2026-11-10") as ESPN's dates=YYYYMMDD; falls back to today's scoreboard.
async function fetchNBAScoreboard(slateDate) {
  try {
    let url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
    if (/^\d{4}-\d{2}-\d{2}$/.test(slateDate || '')) url += `?dates=${slateDate.replaceAll('-', '')}`;
    const data = await fetch(url).then(r => r.json());
    return data.events || [];
  } catch { return []; }
}

function matchEspnEventNBA(events, pick) {
  const wantAway = toEspnAbbrNBA(pick.away_team);
  const wantHome = toEspnAbbrNBA(pick.home_team);
  return events.find(ev => {
    const comp = ev.competitions?.[0];
    const away = comp?.competitors?.find(c => c.homeAway === 'away');
    const home = comp?.competitors?.find(c => c.homeAway === 'home');
    return away?.team?.abbreviation?.toUpperCase() === wantAway && home?.team?.abbreviation?.toUpperCase() === wantHome;
  }) || null;
}

// Spread grading is gradeSpreadPick() from js/nfl-picks.js: pick.spread is the PICKED team's own spread.
async function buildLiveInfoNBA(picks, events) {
  return Promise.all(picks.map(async pick => {
    const ev = matchEspnEventNBA(events, pick);
    if (!ev) return null;
    const comp    = ev.competitions?.[0];
    const status  = ev.status;
    const isLive  = status?.type?.state === 'in';
    const isFinal = status?.type?.state === 'post';
    if (!isLive && !isFinal) return { isLive: false, isFinal: false, startTime: ev.date || null };

    const isPickHome = pick.pick === pick.home_team;
    const home = comp?.competitors?.find(c => c.homeAway === 'home');
    const away = comp?.competitors?.find(c => c.homeAway === 'away');
    const awayScore = parseInt(away?.score ?? 0);
    const homeScore = parseInt(home?.score ?? 0);
    const result = gradeSpreadPick(pick.pick, pick.home_team, homeScore, awayScore, pick.spread);
    const isPush = result === 'Push';

    const info = {
      isLive, isFinal, awayScore, homeScore,
      isCorrect: isPush ? null : result === 'Win',
      isPush,
      statusText: status?.type?.detail || status?.type?.shortDetail || (isFinal ? 'Final' : ''),
      winPct: null,
      startTime: ev.date || null,
    };

    if (isLive) {
      try {
        const data = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=${ev.id}`).then(r => r.json());
        const wp   = data.winprobability || [];
        if (wp.length) {
          const homePct = (wp[wp.length - 1].homeWinPercentage ?? 0.5) * 100;
          info.winPct = isPickHome ? homePct : (100 - homePct);
        }
      } catch {}
    }
    return info;
  }));
}

let nbaTodayRefreshTimer = null;

async function loadTodayNBA() {
  if (nbaTodayRefreshTimer) { clearTimeout(nbaTodayRefreshTimer); nbaTodayRefreshTimer = null; }
  const container = document.getElementById('picks-container-nba');
  if (!container) return;
  try {
    const data = await fetch(NBA_PREDICTIONS_URL).then(r => r.json());
    if (data.generated_at) {
      generatedAtBySport.nba = data.generated_at;
      if (activeSport === 'nba') updateLastUpdatedLabel();
    }
    const games = data.picks || [];
    const picks = games.filter(p => p.has_pick === true);
    const liveInfo = picks.length ? await buildLiveInfoNBA(picks, await fetchNBAScoreboard(data.date)) : [];
    renderTodayPicksNBA(picks, games.length, liveInfo);
    if (liveInfo.some(info => info?.isLive)) nbaTodayRefreshTimer = setTimeout(loadTodayNBA, 30000);
  } catch (e) {
    container.innerHTML = '';   // feed unavailable: the NBA tab shows its notice; All shows no NBA section
  }
  // An unavailable NBA feed counts as "no NBA picks", so All's combined empty state can still show.
  todayModelLoadState.nba = 'loaded';
  updateNBANotice();
  updateAllPredictionsEmptyState();
}

// totalGames: games on today's slate. With games but no picks, say so where the cards would be (NBA tab only; All
// hides the NBA section without cards); with no games at all render nothing and leave the page's NBA notice.
function renderTodayPicksNBA(picks, totalGames = 0, liveInfoAll = []) {
  const container = document.getElementById('picks-container-nba');
  if (!picks.length) {
    container.innerHTML = totalGames > 0 ? `<div class="empty-state nba-no-picks" style="grid-column:1/-1">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
      <p>No NBA picks today</p>
      <p style="font-size:0.85rem;opacity:0.8">None of today's ${totalGames} games met our model's edge threshold (1.0 point).</p></div>` : '';
    return;
  }

  const order = coverageSortOrder(liveInfoAll, picks.length);
  picks = order.map(i => picks[i]);
  liveInfoAll = order.map(i => liveInfoAll[i]);

  container.innerHTML = picks.map((pick, i) => {
    const conf     = pick.confidence || 0.5;
    const side     = pick.pick === pick.home_team ? 'Home' : 'Away';
    const oddsLine = pick.line ?? 0;
    const spread   = pick.spread;
    const edgePct  = nbaEdgePct(pick);

    let impliedPct = 50;
    if (oddsLine < 0) impliedPct = ((Math.abs(oddsLine) / (Math.abs(oddsLine) + 100)) * 100).toFixed(1);
    else if (oddsLine > 0) impliedPct = ((100 / (oddsLine + 100)) * 100).toFixed(1);

    // li is null when the pick isn't matched to an ESPN event yet (normal before ESPN posts it); isCorrect is null
    // for a push, which gets its own badge.
    const li = liveInfoAll[i];
    const coverBadgeHTML = !li ? '' : li.isPush
      ? `<span class="badge badge-push">Push</span>`
      : (li.isCorrect === null ? '' : `<span class="badge ${li.isCorrect ? 'badge-win' : 'badge-loss'}">${li.isFinal ? (li.isCorrect ? '✓ Won' : '✗ Lost') : (li.isCorrect ? 'Covering' : 'Not Covering')}</span>`);
    const liveBarHTML = (li && (li.isLive || li.isFinal)) ? `
      <div class="live-status-bar">
        <div class="live-status-row">
          <span class="live-score">${pick.away_team} ${li.awayScore} – ${pick.home_team} ${li.homeScore}</span>
          ${coverBadgeHTML}
        </div>
        ${li.isLive && li.winPct != null ? `
        <div class="live-winprob-row">
          <span class="live-winprob-label">${pick.pick} <b>${li.winPct.toFixed(0)}%</b></span>
          <div class="live-winprob-bar"><div class="live-winprob-fill" style="width:${li.winPct.toFixed(0)}%"></div></div>
        </div>` : ''}
      </div>` : '';

    return `<div class="pick-card${li?.isLive ? ' is-live' : ''}" onclick="goToGame('game.html?away=${encodeURIComponent(toEspnAbbrNBA(pick.away_team))}&home=${encodeURIComponent(toEspnAbbrNBA(pick.home_team))}&sport=basketball&slug=nba&league=nba')" style="cursor:pointer">
      <div class="pick-card-header">
        <div class="pick-card-status">
          <span class="badge badge-final">SPREAD</span>
          ${li && (li.isLive || li.isFinal) ? `<span class="badge ${li.isLive ? 'badge-live' : 'badge-final'}">${li.isLive ? '<span class="live-dot"></span>' : ''}${li.statusText}</span>` : ''}
        </div>
        <div class="pick-card-start-time">${(!li || (!li.isLive && !li.isFinal)) && li?.startTime ? `<span class="badge badge-final">${fmtGameTime(li.startTime)}</span>` : ''}</div>
        <button class="log-pick-btn" onclick="event.stopPropagation(); logPick('${pick.pick}','NBA',${oddsLine})">＋ Log Pick</button>
      </div>
      <div class="pick-matchup">${pick.away_team} <span class="vs">@</span> ${pick.home_team}</div>
      <div class="pick-team-hero">
        <div style="display:flex;align-items:center;gap:0.85rem">
          ${nbaLogoHTML(pick.pick, 56)}
          <div class="pick-team-info">
            <div style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;color:var(--text)">${pick.pick} <span style="font-weight:600">${fmtOdds(spread != null ? spread : oddsLine)}</span></div>
          </div>
        </div>
      </div>
      ${liveBarHTML}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.45rem">
        <div class="pick-main" style="padding:0.6rem 0.8rem">
          <div class="pick-label">Cover Probability</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--gray-600)">${(conf * 100).toFixed(1)}%</div>
        </div>
        <div class="pick-main" style="padding:0.6rem 0.8rem">
          <div class="pick-label">Market Implied</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--gray-600)">${impliedPct}%</div>
        </div>
      </div>
      <div style="margin-top:auto;display:flex;flex-direction:column;gap:0.6rem">
        <div class="pick-meta-row">
          <div class="meta-chip">Edge: <span>${fmtEdgeNBA(edgePct)}</span></div>
          <div class="meta-chip">Odds: <span>${fmtOdds(oddsLine)}</span></div>
          <div class="meta-chip">${side}</div>
        </div>
        ${oddsSourceHTML(pick)}
        <div class="confidence-row">
          <div class="confidence-header">
            <span class="confidence-label">Model vs Market Edge</span>
            <span class="confidence-pct" style="color:var(--purple-600)">${fmtEdgeNBA(edgePct)}</span>
          </div>
          <div class="bar-bg"><div class="bar-fill" style="width:${Math.min(Math.abs(edgePct ?? 0) * 10, 100)}%;background:var(--purple-600)"></div></div>
        </div>
      </div>
    </div>`;
  }).join('');
}
