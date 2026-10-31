// Odds source line for pick cards ("Odds via DraftKings"). Shared by the
// MLB cards (inline in predictions.html) and the NFL cards
// (js/nfl-picks.js), so the vendor names and markup live in one place.
//
// Reads a pick's optional odds_source field: either a bare vendor id
// ("novig") or "<provider>:<vendor>" ("bdl:draftkings" = DraftKings lines
// fetched through Ball Don't Lie). The provider prefix is dropped -- the
// card credits the sportsbook, not the API it came through. A pick with
// no odds_source renders nothing: never guess a source the feed didn't
// state. An unrecognized vendor id is shown as-is rather than hidden.

const ODDS_VENDOR_NAMES = {
  novig: 'Novig',
  draftkings: 'DraftKings',
  fanduel: 'FanDuel',
  betmgm: 'BetMGM',
  caesars: 'Caesars',
  espnbet: 'ESPN BET',
  bet365: 'bet365',
  betrivers: 'BetRivers',
  fanatics: 'Fanatics',
  hardrock: 'Hard Rock Bet',
  ballybet: 'Bally Bet',
  pinnacle: 'Pinnacle',
  polymarket: 'Polymarket',
  kalshi: 'Kalshi',
};

function oddsSourceName(oddsSource) {
  if (typeof oddsSource !== 'string') return null;
  const vendor = oddsSource.trim().split(':').pop().trim();
  if (!vendor) return null;
  return ODDS_VENDOR_NAMES[vendor.toLowerCase()] || vendor;
}

function oddsSourceHTML(pick) {
  const name = oddsSourceName(pick && pick.odds_source);
  if (!name) return '';
  const safe = name.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return `<div class="odds-source">Odds via ${safe}</div>`;
}

if (typeof module !== 'undefined') module.exports = { oddsSourceName, oddsSourceHTML };
