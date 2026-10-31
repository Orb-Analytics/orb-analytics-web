"""Build the seamless texture maps for the Solid tab (assets/landing/solid-*.png) from assets/landing/logo-original.png.

The logo is a set of concentric rings (pearl channels at logo radii 0-.15, .27-.39, .51-.63, .75-.85, dark body between)
cut by angular gaps (the diagonal bridges). The maps are baked in POLE coordinates: texture row = geodesic angle theta
from the +Z pole (the axis facing the camera head-on), texture column = angle alpha around that axis. solid.js rotates the
sphere geometry so its UV poles sit on +Z, so:
  * no seam at u=0/1 (the pattern is periodic in alpha),
  * no pinching: both poles are the clean centre disc of the logo,
  * rings continue past the equator: the logo radius runs 0 -> RHO_E over the front hemisphere and back to 0 over the
    back hemisphere (mirror about the equator, which lies in the middle of the outermost channel, so the channel and its
    bridge gaps run straight across; no break line).
Each texel is sampled from the logo mask at (rho(theta), alpha), so ring radii and gap angles are read from the logo itself.
Usage: python3 scripts/landing/prep_solid.py   (needs pillow, numpy, scipy)"""
import os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ASSETS = os.path.join(ROOT, "assets", "landing")
W, H, SS = 4096, 2048, 2          # colour / height map size, supersampling for antialiasing
RHO_E = 0.80                      # logo radius at the equator: the middle of the outermost channel (.75-.85)
WRAP = 0.15                       # 0 = true orthographic head-on projection, 1 = equal-arc spacing; matches solid.js intent

im = Image.open(os.path.join(ASSETS, "logo-original.png")).convert("RGBA")
a = np.asarray(im).astype(np.float32)
cov = np.clip((255 - a[..., :3].min(2)) / 90.0, 0, 1) * (a[..., 3] / 255.0)     # 1 = body, 0 = channel / outside
ys, xs = np.where(cov > 0.08)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
cov = cov[y0:y1 + 1, x0:x1 + 1]
n = max(cov.shape); pad = np.zeros((n, n), np.float32)
pad[(n - cov.shape[0]) // 2:(n - cov.shape[0]) // 2 + cov.shape[0], (n - cov.shape[1]) // 2:(n - cov.shape[1]) // 2 + cov.shape[1]] = cov
c = (n - 1) / 2.0                                                              # logo centre; logo radius 1 = c px
chan0 = 1.0 - pad                                                              # 1 inside a channel (only rho < .85 is used)
k = n / 2048.0                                                                 # blur sigmas, in units of the old 2048 px logo
src_c = ndi.gaussian_filter(chan0, 0.9 * k)                                    # colour / material edge
src_h = ndi.gaussian_filter(chan0, 3.5 * k)                                    # soft bevel for height
src_g = ndi.gaussian_filter(chan0, 14 * k) * src_c                             # brighter next to the walls

def rho_of(theta):                                                             # logo radius at geodesic angle theta (mirrored past the equator)
    t = np.minimum(theta, np.pi - theta)
    return RHO_E * ((1 - WRAP) * np.sin(t) + WRAP * t / (np.pi / 2))

def bake(src, w, h):
    """Sample src at the polar position of every texel centre of a w x h map (rows = theta 0..pi, columns = alpha)."""
    out = np.empty((h, w), np.float32)
    alpha = 2 * np.pi * (np.arange(w) + 0.5) / w + np.pi                       # alpha = 2*pi*u + pi (SphereGeometry azimuth, after the pole rotation)
    ca, sa = np.cos(alpha), np.sin(alpha)
    for j0 in range(0, h, 128):
        j = np.arange(j0, min(h, j0 + 128))
        rho = rho_of(np.pi * (j + 0.5) / h)
        X = c + (rho * c)[:, None] * ca[None, :]
        Y = c - (rho * c)[:, None] * sa[None, :]
        out[j0:j0 + len(j)] = ndi.map_coordinates(src, [Y, X], order=1, mode="nearest")
    return out

def down(arr, f):
    h, w = arr.shape
    return arr.reshape(h // f, f, w // f, f).mean((1, 3))

chan = down(bake(src_c, W * SS, H * SS), SS); print("chan")
height = 1 - down(bake(src_h, W * SS, H * SS), SS); print("height")
glow = down(bake(src_g, W // 2 * SS, H // 2 * SS), SS)                         # 2048 x 1024 is plenty for a blurred map
glow = glow / max(glow.max(), 1e-6)
chan_half = down(chan, 2)

def save(arr, name, mode="L"):
    Image.fromarray((np.clip(arr, 0, 1) * 255 + 0.5).astype(np.uint8), mode).save(os.path.join(ASSETS, name), optimize=True)

# colour: body = dark purple gradient (bright at the top, as in the logo), channels = pale lavender pearl.
# The gradient follows the object's Y axis (up), so it is continuous over the whole sphere.
theta = np.pi * (np.arange(H) + 0.5) / H
alpha = 2 * np.pi * (np.arange(W) + 0.5) / W + np.pi
dy = np.sin(theta)[:, None] * np.sin(alpha)[None, :]
t = np.clip((1 - dy) / 2, 0, 1)[..., None]
top, mid, bot = np.array([0.50, 0.12, 0.86]), np.array([0.24, 0.04, 0.46]), np.array([0.035, 0.0, 0.07])
w1 = np.clip(t / 0.55, 0, 1); w2 = np.clip((t - 0.55) / 0.45, 0, 1)
grad = np.where(t < 0.55, top * (1 - w1) + mid * w1, mid * (1 - w2) + bot * w2)
pearl = np.array([0.93, 0.89, 1.0]) * (1 - 0.25 * t)
col = grad * (1 - chan[..., None]) + pearl * chan[..., None]
save(col, "solid-color.png", "RGB")
save(height, "solid-height.png")
save(glow * 0.9 + down(chan, 2) * 0.1, "solid-glow.png")
# material map (2048 x 1024): G = roughness, B = metalness (anodized body, glossy pearl inlay)
orm = np.dstack([np.zeros_like(chan_half), 0.30 * (1 - chan_half) + 0.22 * chan_half, 0.85 * (1 - chan_half)])
save(orm, "solid-orm.png", "RGB")
print("ok", W, H)
