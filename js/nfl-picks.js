// NFL picks: fetch, ESPN live-score matching, and render. Moved out of
// index.html/predictions.html (Sept 2026) after the two pages' inline
// copies of this code drifted -- predictions.html got a crash fix
// (fetchNFLScoreboard asking ESPN for the right week, null-safe render)
// that never made it into index.html's duplicate, so the bare root
// domain (served by index.html) kept crashing after the fix had already
// shipped. One file now, included by both pages, so that can't recur.
//
// MLB's equivalents (fetchMLBScoreboard, buildLiveInfo, renderTodayPicks,
// loadToday) were deliberately NOT moved here or touched -- they still
// live inline in both HTML files, unchanged. This file calls a handful of
// globals that remain defined inline in whichever page loads it, because
// they're shared with MLB and moving them would mean touching MLB's setup
// too: coverageSortOrder, fmtOdds, fmtGameTime, logPick,
// generatedAtBySport, updateLastUpdatedLabel, activeSport. That's safe
// only because this script tag loads before the inline <script> block
// that defines them and calls loadTodayNFL() -- see the <script src>
// placement note in both HTML files.

// ── NFL ───────────────────────────────────────────────────────
// Kept fully separate from the MLB functions above rather than
// generalizing them with a sport parameter -- MLB's picks.json shape
// (moneyline "line", probable-pitcher/ERA cards) is genuinely
// different enough from NFL's (spread "line" + separate spread
// number, no pitcher concept) that a shared function would need
// several sport branches anyway, and this repo's MLB integration is
// live in production -- not worth the regression risk to touch it.
const NFL_PREDICTIONS_URL = '/data/nfl/predictions.json';

// home_team/away_team/pick in NFL-Model's predictions.json are
// nflverse's own team abbreviations. ESPN's NFL logo path uses ESPN's
// own (mostly identical) abbreviations -- confirmed mismatches:
// Washington (nflverse "WAS" vs ESPN "wsh") and the Rams (nflverse
// sometimes "LA" vs ESPN "lar"), the same two mismatches the NFL
// model's own Novig client had to handle.
const TEAM_ESPN_NFL = {
  ARI:'ari', ATL:'atl', BAL:'bal', BUF:'buf', CAR:'car', CHI:'chi', CIN:'cin', CLE:'cle',
  DAL:'dal', DEN:'den', DET:'det', GB:'gb', HOU:'hou', IND:'ind', JAX:'jax', KC:'kc',
  LA:'lar', LAR:'lar', LAC:'lac', LV:'lv', MIA:'mia', MIN:'min', NE:'ne', NO:'no',
  NYG:'nyg', NYJ:'nyj', PHI:'phi', PIT:'pit', SEA:'sea', SF:'sf', TB:'tb', TEN:'ten',
  WAS:'wsh', WSH:'wsh'
};
const NFL_MODEL_TO_ESPN = { WAS: 'WSH', LA: 'LAR' };
const toEspnAbbrNFL = a => (NFL_MODEL_TO_ESPN[a] || a || '').toUpperCase();

function teamLogoURLNFL(abbr) {
  const espn = TEAM_ESPN_NFL[abbr];
  return espn ? `https://a.espncdn.com/i/teamlogos/nfl/500/${espn}.png` : null;
}

function teamLogoHTMLNFL(abbr, size = 56) {
  const url = teamLogoURLNFL(abbr);
  if (!url) return `<div class="pick-team-logo-fallback" style="width:${size}px;height:${size}px">${abbr}</div>`;
  return `<img class="pick-team-logo" src="${url}" alt="${abbr}" style="width:${size}px;height:${size}px"
    onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <div class="pick-team-logo-fallback" style="width:${size}px;height:${size}px;display:none">${abbr}</div>`;
}

// NFL-Model's predictions.json doesn't carry a "week" field on each
// pick -- parse it from game_id (e.g. "2026_01_CHI_CAR" -> 1). Prefer
// an explicit pick.week if one's ever added upstream.
function nflWeekFromGameId(gameId) {
  const week = parseInt((gameId || '').split('_')[1], 10);
  return Number.isFinite(week) ? week : null;
}

// No-params scoreboard defaults to "today's games" -- useless for a
// week's slate published days before it airs (predictions.json comes
// out Tuesday, games run Thu-Mon). Ask ESPN for the specific week
// instead, derived from the first pick's game_id (e.g.
// "2026_02_SEA_ARI" -> season 2026, week 2). ESPN's own dates=range
// param (confirmed by direct request) 400s on this endpoint, so a
// year/seasontype/week query is the only working way to ask for
// anything other than "today". nflverse numbers weeks 1-18 as the
// regular season (ESPN seasontype 2) and continues 19+ for the
// postseason (ESPN seasontype 3, which restarts its own week at 1)
// rather than resetting, so that's translated here too. Falls back to
// the bare (today-only) endpoint if no pick has a parseable game_id.
async function fetchNFLScoreboard(picks) {
  try {
    const firstId = (picks || []).map(p => p.game_id).find(Boolean) || '';
    const [seasonStr, weekStr] = firstId.split('_');
    const season  = parseInt(seasonStr, 10);
    const rawWeek = parseInt(weekStr, 10);
    let url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
    if (Number.isFinite(season) && Number.isFinite(rawWeek)) {
      const seasontype = rawWeek > 18 ? 3 : 2;
      const week       = rawWeek > 18 ? rawWeek - 18 : rawWeek;
      url += `?year=${season}&seasontype=${seasontype}&week=${week}`;
    }
    const r = await fetch(url);
    const data = await r.json();
    return data.events || [];
  } catch { return []; }
}

function matchEspnEventNFL(events, pick) {
  const wantAway = toEspnAbbrNFL(pick.away_team);
  const wantHome = toEspnAbbrNFL(pick.home_team);
  return events.find(ev => {
    const comp = ev.competitions?.[0];
    const away = comp?.competitors?.find(c => c.homeAway === 'away');
    const home = comp?.competitors?.find(c => c.homeAway === 'home');
    return away?.team?.abbreviation?.toUpperCase() === wantAway && home?.team?.abbreviation?.toUpperCase() === wantHome;
  }) || null;
}

// Deliberately NOT shared with buildLiveInfo (MLB): MLB is moneyline,
// where "isCorrect" is just "did the picked team win" -- comparing raw
// scores is correct there. NFL is a spread sport: pick.spread is the
// PICKED team's own posted spread (e.g. +6.5 for an underdog, -6.5 for
// a favorite -- see 26_write_predictions_json.py), and a pick is graded
// against pickScore + spread vs oppScore, not raw score vs raw score.
// Comparing raw scores here (the MLB check, copy-pasted) graded picks as
// if they were moneyline bets: an underdog getting points (e.g. NO
// +6.5, losing 30-31) was marked Lost/"Not Covering" even though the
// spread-adjusted score (30 + 6.5 = 36.5 > 31) covers. Confirmed with
// NO@DET week 1 2026 (final, wrongly graded Lost) and WAS@PHI week 1
// 2026 (live, wrongly badged "Not Covering").
async function buildLiveInfoNFL(picks, events) {
  return Promise.all(picks.map(async pick => {
    const ev = matchEspnEventNFL(events, pick);
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
    const pickScore = isPickHome ? homeScore : awayScore;
    const oppScore  = isPickHome ? awayScore : homeScore;
    // pick.spread is already the PICKED side's own spread (not the home
    // team's), so no home/away branching is needed here -- just add it
    // to that side's own score before comparing.
    const spread         = pick.spread ?? 0;
    const adjustedScore  = pickScore + spread;
    const isPush          = adjustedScore === oppScore;

    const info = {
      isLive, isFinal, awayScore, homeScore,
      isCorrect: isPush ? null : adjustedScore > oppScore,
      isPush,
      statusText: status?.type?.detail || status?.type?.shortDetail || (isFinal ? 'Final' : ''),
      winPct: null,
    };

    if (isLive) {
      try {
        const r    = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${ev.id}`);
        const data = await r.json();
        const wp   = data.winprobability || [];
        if (wp.length) {
          const last    = wp[wp.length - 1];
          const homePct = (last.homeWinPercentage ?? 0.5) * 100;
          info.winPct = isPickHome ? homePct : (100 - homePct);
        }
      } catch {}
    }
    return info;
  }));
}

let nflTodayRefreshTimer = null;

async function loadTodayNFL() {
  if (nflTodayRefreshTimer) { clearTimeout(nflTodayRefreshTimer); nflTodayRefreshTimer = null; }
  const container = document.getElementById('picks-container-nfl');
  try {
    // fetchNFLScoreboard needs a pick's game_id to know which week to
    // ask ESPN for (it can't run in parallel with the predictions
    // fetch the way it used to -- there's nothing to derive the week
    // from until picksData resolves).
    const picksData = await fetch(NFL_PREDICTIONS_URL).then(r => r.json());

    if (picksData.generated_at) {
      generatedAtBySport.nfl = picksData.generated_at;
      if (activeSport === 'nfl') updateLastUpdatedLabel();
    }

    // NFL-Model's predictions.json (unlike the documented schema)
    // writes every scored game with has_pick flagging which ones
    // actually cleared the selection rule -- same contract MLB-Model
    // uses in practice. Only render the real picks.
    // The model only ever surfaces a pick when it has a positive edge over
    // the market -- edge is a magnitude, never a signed value -- but take
    // the absolute value defensively in case upstream ever sends a
    // negative number for the recommended side.
    const picks = (picksData.picks || [])
      .filter(p => p.has_pick === true)
      .map(p => p.edge != null ? { ...p, edge: Math.abs(p.edge) } : p);
    const scoreboardEvents = await fetchNFLScoreboard(picks);
    const liveInfo = await buildLiveInfoNFL(picks, scoreboardEvents);
    renderTodayPicksNFL(picks, liveInfo);

    if (liveInfo.some(info => info?.isLive)) {
      nflTodayRefreshTimer = setTimeout(loadTodayNFL, 30000);
    }
  } catch (e) {
    container.innerHTML =
      `<div class="empty-state" style="grid-column:1/-1"><p>Could not load predictions. Try again later.</p></div>`;
  }
}

function renderTodayPicksNFL(picks, liveInfoAll = []) {
  const container = document.getElementById('picks-container-nfl');

  if (!picks.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
      <p>No picks for this week yet — check back after lines are posted.</p></div>`;
    return;
  }

  const order = coverageSortOrder(liveInfoAll, picks.length);
  picks = order.map(i => picks[i]);
  liveInfoAll = order.map(i => liveInfoAll[i]);

  container.innerHTML = picks.map((pick, i) => {
    const conf    = pick.confidence || 0.5;
    const confPct = Math.round(conf * 100);
    const isHome  = pick.pick === pick.home_team;
    const side    = isHome ? 'Home' : 'Away';
    // NFL carries two related-but-different numbers per pick: the
    // spread itself (e.g. -3.5, what a bettor actually cares about)
    // and that side's American odds at that spread (e.g. -110, what
    // determines implied probability). MLB's single "line" field does
    // both jobs at once because a moneyline number IS both the
    // display value and the odds -- spread sports don't have that
    // luxury, hence the extra field.
    const oddsLine = pick.line ?? 0;
    const spread   = pick.spread;
    const week     = pick.week ?? nflWeekFromGameId(pick.game_id);

    let impliedPct = 50;
    if (oddsLine < 0) impliedPct = ((Math.abs(oddsLine) / (Math.abs(oddsLine) + 100)) * 100).toFixed(1);
    else if (oddsLine > 0) impliedPct = ((100 / (oddsLine + 100)) * 100).toFixed(1);

    const li = liveInfoAll[i];
    // li is null whenever buildLiveInfoNFL couldn't match this pick to
    // an ESPN event yet -- a normal, expected state (ESPN hasn't
    // posted the event, an abbreviation didn't match, or the
    // scoreboard API hiccuped), not an error. isCorrect is null for
    // BOTH "no result yet" (shouldn't reach here, isLive/isFinal gates
    // that) and a genuine spread push -- badge it explicitly as Push
    // rather than rendering nothing, since a push is a real, non-rare
    // outcome for a spread pick (unlike MLB moneyline).
    const coverBadgeHTML = !li ? '' : li.isPush
      ? `<span class="badge badge-push">Push</span>`
      : (li.isCorrect === null ? '' : `<span class="badge ${li.isCorrect ? 'badge-win' : 'badge-loss'}">${li.isCorrect ? '✓' : '✗'} ${li.isFinal ? (li.isCorrect ? 'Won' : 'Lost') : (li.isCorrect ? 'Covering' : 'Not Covering')}</span>`);
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

    return `<div class="pick-card${li?.isLive ? ' is-live' : ''}" onclick="goToGame('game.html?away=${encodeURIComponent(pick.away_team)}&home=${encodeURIComponent(pick.home_team)}&sport=football&slug=nfl&league=nfl')" style="cursor:pointer">
      <div class="pick-card-header">
        <div style="display:flex;align-items:center;gap:0.45rem">
          ${week != null ? `<span class="badge badge-final">WEEK ${week}</span>` : ''}
          ${li && (li.isLive || li.isFinal) ? `<span class="badge ${li.isLive ? 'badge-live' : 'badge-final'}">${li.isLive ? '<span class="live-dot"></span>' : ''}${li.statusText}</span>` : ''}
          ${(!li || (!li.isLive && !li.isFinal)) && li?.startTime ? `<span class="badge badge-final">${fmtGameTime(li.startTime)}</span>` : ''}
          ${confPct >= 63 ? `<span style="font-size:0.6rem;font-weight:700;color:#065F46;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:4px;padding:0.1rem 0.4rem;letter-spacing:0.04em;text-transform:uppercase;white-space:nowrap">HIGH CONF</span>` : ''}
        </div>
        <button class="log-pick-btn" onclick="event.stopPropagation(); logPick('${pick.pick}','NFL',${oddsLine})">＋ Log Pick</button>
      </div>
      <div class="pick-matchup">${pick.away_team} <span class="vs">@</span> ${pick.home_team}</div>
      <div class="pick-team-hero">
        <div style="display:flex;align-items:center;gap:0.85rem">
          ${teamLogoHTMLNFL(pick.pick, 56)}
          <div class="pick-team-info">
            <div style="font-family:var(--font-display);font-size:1.75rem;font-weight:800;color:var(--text)">${pick.pick} <span style="font-weight:600">${fmtOdds(spread != null ? spread : oddsLine)}</span></div>
          </div>
        </div>
      </div>
      ${liveBarHTML}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.45rem">
        <div class="pick-main" style="padding:0.6rem 0.8rem">
          <div class="pick-label">Win Probability</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--gray-600)">${(conf*100).toFixed(1)}%</div>
        </div>
        <div class="pick-main" style="padding:0.6rem 0.8rem">
          <div class="pick-label">Market Implied</div>
          <div style="font-family:var(--font-display);font-size:1.2rem;font-weight:800;color:var(--gray-600)">${impliedPct}%</div>
        </div>
      </div>
      <div style="margin-top:auto;display:flex;flex-direction:column;gap:0.6rem">
        <div class="pick-meta-row">
          <div class="meta-chip">Edge: <span>${pick.edge>=0?'+':''}${pick.edge}%</span></div>
          <div class="meta-chip">Odds: <span>${fmtOdds(oddsLine)}</span></div>
          <div class="meta-chip">${side}</div>
        </div>
        <div class="confidence-row">
          <div class="confidence-header">
            <span class="confidence-label">Model vs Market Edge</span>
            <span class="confidence-pct" style="color:var(--purple-600)">${pick.edge>=0?'+':''}${pick.edge}%</span>
          </div>
          <div class="bar-bg"><div class="bar-fill" style="width:${Math.min(Math.abs(pick.edge)*10,100)}%;background:var(--purple-600)"></div></div>
        </div>
      </div>
    </div>`;
  }).join('');
}
