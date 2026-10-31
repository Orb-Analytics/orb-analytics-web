"""Make a transparent logo, favicon and particle targets from assets/landing/logo-original.png.
Usage: python3 scripts/landing/prep_logo.py   (needs pillow, numpy, scipy)"""
import json, os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ASSETS = os.path.join(ROOT, "assets", "landing")
im = Image.open(os.path.join(ASSETS, "logo-original.png")).convert("RGBA")
a = np.asarray(im).astype(np.float32)
rgb, alpha = a[..., :3], a[..., 3]
# white (and already transparent) pixels -> transparent, soft edge by distance from white
dist = 255 - rgb.min(2)                      # 0 = white
cov = np.clip(dist / 90.0, 0, 1) * (alpha / 255.0)
out = np.dstack([rgb, cov * 255]).astype(np.uint8)
logo = Image.fromarray(out, "RGBA")
bbox = logo.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
logo = logo.crop(bbox)
side = max(logo.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0)); sq.paste(logo, ((side-logo.width)//2, (side-logo.height)//2))
sq.resize((1024, 1024), Image.LANCZOS).save(os.path.join(ASSETS, "logo.png"), optimize=True)
sq.resize((96, 96), Image.LANCZOS).save(os.path.join(ASSETS, "favicon.png"), optimize=True)
# particle targets: even jittered-grid sampling inside the mask
m = np.asarray(sq.resize((1024, 1024), Image.LANCZOS))
mask = m[..., 3] > 128
col = m[..., :3]
N = 9000
area = mask.sum()
cell = (area / N) ** 0.5
rng = np.random.default_rng(3)
pts = []
ys, xs = np.mgrid[0:1024:cell, 0:1024:cell]
for gy, gx in zip(ys.ravel(), xs.ravel()):
    x = gx + rng.random() * cell; y = gy + rng.random() * cell
    xi, yi = int(x), int(y)
    if xi < 1024 and yi < 1024 and mask[yi, xi]:
        pts.append((x, y))
pts = np.array(pts)
while len(pts) < N:
    yy, xx = np.nonzero(mask); k = rng.integers(len(yy), size=N-len(pts))
    pts = np.vstack([pts, np.stack([xx[k]+rng.random(len(k)), yy[k]+rng.random(len(k))], 1)])
pts = pts[rng.permutation(len(pts))[:N]]
flat = []
for x, y in pts:
    flat += [round((x-512)/512, 4), round((y-512)/512, 4), round(y/1024, 3)]
open(os.path.join(ASSETS, "logo.js"), "w").write("window.ORB_LOGO=" + json.dumps({"pts": flat}, separators=(",", ":")) + ";\n")
print("points", len(pts), "mask frac", mask.mean())
