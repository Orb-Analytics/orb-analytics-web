# Orb Analytics Web

The official Orb Analytics platform — live scores, bet tracking, ML predictions, and content.

**Live site:** https://orb-analytics.github.io/orb-analytics-web/

## Pages

| Page | File | Status |
|------|------|--------|
| Home | `index.html` | ✅ Live (landing intro over the predictions home) |
| Scoreboard | `scoreboard.html` | ✅ Live (ESPN API) |
| Bet Tracker | `tracker.html` | ✅ Live (Firebase, sign-in required) |
| Predictions | `predictions.html` | ✅ Live (reads model repos) |
| Settings | `settings.html` | 🚧 Stub |

## Landing page

`index.html` is the predictions home with a full-viewport landing layer fixed on top of it. The predictions layout is sized to the viewport (`100vh` minus the nav), so the intro is an overlay on the same URL rather than a document section above that layout. Enter site slides the layer up and the existing nav, sidebar, and predictions UI are already underneath. `predictions.html` is the same predictions UI without the intro.

The layer uses the site's light brand (DM Sans, Inter, purple `#9A29E9`, the same logo particles tinted to that palette). It shows the hero animation, the Anti Lock Culture tagline, the FAQ, a short legal line, and Enter site. The site's own nav and disclaimer take over after you enter.

Landing files:

- `css/landing.css` (scoped to `.landing-layer`)
- `js/landing/` (`app.js`, `hero.js`, `solid.js`)
- `assets/landing/` (logo particle data, solid textures, vendored three.js)
- `scripts/landing/` regenerates the logo and solid textures

There is no build step. From the repo root:

```
python3 -m http.server 5173
```

Then open http://localhost:5173.

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

## Dev Environment

Changes ship through a `dev` environment before reaching prod:

1. Branch off `dev` for your feature work and open a PR **into `dev`**.
2. Once merged, `.github/workflows/firebase-hosting-dev.yml` deploys `dev`'s code to
   the `orb-analytics-dev` Firebase Hosting site (`orb-analytics-dev.web.app`), with
   `main`'s current `data/` directory always overlaid on top at deploy time — dev
   never carries its own committed data, so there's nothing to merge-conflict with
   `main` later.
3. Test on the dev URL. Every page there carries a visible "DEV SITE" banner and a
   `noindex` header, injected at deploy time only (not present in the repo source),
   and talks to a stubbed-out Firebase SDK — sign-in/bet-saving are intentionally
   disabled there so dev never writes to the production Firestore/Auth project.
4. When it's ready, open a PR **from `dev` into `main`**. Merging that is what
   actually ships to production (`firebase-hosting-merge.yml`, unchanged by any of
   this) and to GitHub Pages.

## Tech Stack

- Vanilla HTML/CSS/JS — no build step, deploys instantly to GitHub Pages
- ESPN public API for live scores (no key required)
- Chart.js for bet tracker visualizations
- localStorage for bet data (no backend needed for prototype)
- Google Fonts: Syne (display) + Inter (body) + JetBrains Mono (data)
