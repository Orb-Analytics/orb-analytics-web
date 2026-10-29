#!/usr/bin/env python3
"""Dev-only deploy-time HTML transform.

Run by .github/workflows/firebase-hosting-dev.yml, against the assembled
.deploy/dev/public/ bundle only -- AFTER the data/ overlay and the js/firebase.js
stub swap, and BEFORE the Firebase deploy step. Never commits anything back to
any branch, and never touches the real repo-root HTML files.

Usage: apply_dev_overlay.py [TARGET_DIR]  (default: current directory)

For every *.html file directly in TARGET_DIR, this:
  1. Removes the GTM <head> loader script and the GTM <body> noscript fallback, so
     the dev site never pings the production GTM container.
  2. Inserts a noindex/nofollow robots meta tag right after <head>.
  3. Inserts the "DEV SITE" banner right after <body>.
Before that, it replaces data/nba/ in the bundle with the NBA dev feed (see overlay_nba_feed).

It fails loudly (non-zero exit, so the workflow stops before deploying) rather than
silently skipping a page, if:
  - zero HTML files are found at all,
  - any expected block/tag isn't found exactly once in a given file (meaning the
    page's structure drifted from what this script expects), or
  - the independent re-verification pass at the end finds the banner marker missing,
    duplicated, or any leftover GTM/Analytics string in any processed file.
"""
import glob
import json
import os
import sys
import urllib.request

GTM_HEAD_BLOCK = """  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-TQ5X32C3');</script>
  <!-- End Google Tag Manager -->"""

GTM_BODY_BLOCK = """  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TQ5X32C3"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->"""

ROBOTS_META = '  <meta name="robots" content="noindex, nofollow">'

BANNER = (
    '  <div class="orb-dev-banner" data-orb-env="dev-banner" role="banner" '
    'style="width:100%;box-sizing:border-box;background:#f59e0b;color:#1a1200;'
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,"
    'sans-serif;font-weight:700;font-size:14px;line-height:1.4;text-align:center;'
    'padding:10px 16px;border-bottom:3px solid #b45309;">'
    'DEV SITE — INTERNAL USE ONLY. Not the live site.</div>\n'
    '  <style>@media (max-width:480px){.orb-dev-banner'
    "{font-size:12px;padding:8px 10px;}}</style>"
)

MARKER = 'data-orb-env="dev-banner"'
FORBIDDEN_STRINGS = ["GTM-TQ5X32C3", "googletagmanager.com", "G-FHRKJ4YP4K", "measurementId"]


# NBA dev feed: the NBA model pushes its picks + full graded record (shadow-mode picks included) to this public
# branch of the web repo. Nothing on `main` reads it, and no workflow triggers on pushes to it, so prod never sees
# it. It replaces ONLY data/nba/ in the assembled dev bundle; if it is unreachable or invalid, the bundle keeps
# main's data/nba/ and the deploy goes on.
NBA_FEED_BASE = os.environ.get(
    "NBA_DEV_FEED_BASE", "https://raw.githubusercontent.com/Orb-Analytics/orb-analytics-web/nba-dev-feed")
NBA_FEED_FILES = ("predictions.json", "predictions_history.json")


def overlay_nba_feed(target_dir):
    fetched = {}
    for name in NBA_FEED_FILES:
        try:
            with urllib.request.urlopen(f"{NBA_FEED_BASE}/{name}", timeout=30) as resp:
                body = json.loads(resp.read().decode("utf-8"))
            if body.get("model") != "NBA" or not isinstance(body.get("picks"), list):
                raise ValueError("not an NBA feed")
            fetched[name] = body
        except Exception as exc:
            print(f"::warning::NBA dev feed {name} unavailable ({exc}); keeping main's data/nba/")
            return False
    out = os.path.join(target_dir, "data", "nba")
    os.makedirs(out, exist_ok=True)
    for name, body in fetched.items():
        with open(os.path.join(out, name), "w", encoding="utf-8") as fh:
            json.dump(body, fh, indent=2)
            fh.write("\n")
    print(f"NBA dev feed applied: {len(fetched['predictions.json']['picks'])} games today, "
          f"{len(fetched['predictions_history.json']['picks'])} history picks")
    return True


def fail(msg):
    print(f"::error::{msg}")
    sys.exit(1)


def main():
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    overlay_nba_feed(target_dir)
    files = sorted(glob.glob(os.path.join(target_dir, "*.html")))
    if not files:
        fail(f"apply_dev_overlay.py matched zero HTML files in {target_dir!r} -- refusing to deploy.")

    for path in files:
        with open(path, "r", encoding="utf-8") as fh:
            content = fh.read()

        head_block_count = content.count(GTM_HEAD_BLOCK)
        if head_block_count != 1:
            fail(f"{path}: expected exactly 1 GTM head block, found {head_block_count}")
        content = content.replace(GTM_HEAD_BLOCK, "", 1)

        body_block_count = content.count(GTM_BODY_BLOCK)
        if body_block_count != 1:
            fail(f"{path}: expected exactly 1 GTM body noscript block, found {body_block_count}")
        content = content.replace(GTM_BODY_BLOCK, "", 1)

        head_tag_count = content.count("<head>")
        if head_tag_count != 1:
            fail(f"{path}: expected exactly 1 <head> tag, found {head_tag_count}")
        content = content.replace("<head>", "<head>\n" + ROBOTS_META, 1)

        body_tag_count = content.count("<body>")
        if body_tag_count != 1:
            fail(f"{path}: expected exactly 1 <body> tag, found {body_tag_count}")
        content = content.replace("<body>", "<body>\n" + BANNER, 1)

        with open(path, "w", encoding="utf-8") as fh:
            fh.write(content)

    # Independent re-verification pass -- re-read from disk, don't trust the counters above.
    verified = 0
    for path in files:
        with open(path, "r", encoding="utf-8") as fh:
            content = fh.read()

        marker_count = content.count(MARKER)
        if marker_count != 1:
            fail(f"{path}: dev banner marker missing or duplicated after injection (found {marker_count})")

        for forbidden in FORBIDDEN_STRINGS:
            if forbidden in content:
                fail(f"{path}: forbidden string '{forbidden}' still present after GTM strip")

        verified += 1

    if verified != len(files):
        fail(f"verified {verified} files but expected {len(files)} -- refusing to deploy")

    print(f"apply_dev_overlay.py: transformed and verified {verified} HTML file(s): {', '.join(files)}")


if __name__ == "__main__":
    main()
