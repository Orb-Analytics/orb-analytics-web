# Orb Analytics Web

The official Orb Analytics platform — live scores, bet tracking, ML predictions, and content.

**Live site:** https://orb-analytics.github.io/orb-analytics-web/

## Pages

| Page | File | Status |
|------|------|--------|
| Home | `index.html` | ✅ Live |
| Scoreboard | `scoreboard.html` | ✅ Live (ESPN API) |
| Bet Tracker | `tracker.html` | ✅ Live (localStorage) |
| Predictions | `predictions.html` | ✅ Live (reads model repos) |
| Settings | `settings.html` | 🚧 Stub |

## Predictions Integration

The predictions page reads `predictions.json` from each model repo:

- **MLB** → `Orb-Analytics/MLB-Model/main/predictions.json`
- **NFL** → `Orb-Analytics/NFL-Model/main/predictions.json`
- **NBA** → `Orb-Analytics/NBA-Model/main/predictions.json`

### predictions.json Schema

```json
{
  "model": "MLB",
  "generated_at": "2026-07-15T08:00:00Z",
  "version": "v2.1",
  "picks": [
    {
      "game_id": "401672345",
      "home_team": "Los Angeles Dodgers",
      "away_team": "San Francisco Giants",
      "pick": "Dodgers ML",
      "confidence": 0.67,
      "line": -155,
      "notes": "Optional analyst note"
    }
  ]
}
```

Commit a file matching this schema to the model repo's `main` branch and it will auto-appear on the predictions page.

## Tech Stack

- Vanilla HTML/CSS/JS — no build step, deploys instantly to GitHub Pages
- ESPN public API for live scores (no key required)
- Chart.js for bet tracker visualizations
- localStorage for bet data (no backend needed for prototype)
- Google Fonts: Syne (display) + Inter (body) + JetBrains Mono (data)
