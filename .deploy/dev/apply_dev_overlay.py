#!/usr/bin/env python3
"""Dev-only deploy-time HTML transform.

Run by .github/workflows/firebase-hosting-dev.yml, against the ephemeral dev-deploy
working tree only -- AFTER the data/ overlay and the js/firebase.js stub swap, and
BEFORE the Firebase deploy step. Never commits anything back to any branch.

For every *.html file at the repo root, this:
  1. Removes the GTM <head> loader script and the GTM <body> noscript fallback, so
     the dev site never pings the production GTM container.
  2. Inserts a noindex/nofollow robots meta tag right after <head>.
  3. Inserts the "DEV SITE" banner right after <body>.

It fails loudly (non-zero exit, so the workflow stops before deploying) rather than
silently skipping a page, if:
  - zero HTML files are found at all,
  - any expected block/tag isn't found exactly once in a given file (meaning the
    page's structure drifted from what this script expects), or
  - the independent re-verification pass at the end finds the banner marker missing,
    duplicated, or any leftover GTM/Analytics string in any processed file.
"""
import glob
import sys

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


def fail(msg):
    print(f"::error::{msg}")
    sys.exit(1)


def main():
    files = sorted(glob.glob("*.html"))
    if not files:
        fail("apply_dev_overlay.py matched zero HTML files at repo root -- refusing to deploy.")

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
