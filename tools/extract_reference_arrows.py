from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
REFERENCE = Path(r"C:\Users\Davin\AppData\Local\Temp\codex-clipboard-5239b397-74d5-48e8-95e2-4d5918b2519b.png")
BASE = ROOT / "assets" / "rower-full.png"
OUT_TOP = ROOT / "assets" / "rower-arrow-forward-reference.png"
OUT_BOTTOM = ROOT / "assets" / "rower-arrow-resistance-reference.png"


def polygon_mask(size, points):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).polygon(points, fill=255)
    return np.asarray(mask, dtype=np.uint8) > 0


def extract_arrow(reference, base, polygon, exclusions, output):
    ref = np.asarray(reference, dtype=np.int16)
    bg = np.asarray(base, dtype=np.int16)
    delta = np.abs(ref - bg)

    region = polygon_mask(reference.size, polygon)
    for exclusion in exclusions:
        region &= ~polygon_mask(reference.size, exclusion)

    # The reference differs from the locked artwork only where the arrow was
    # painted. Retaining those changed pixels copies the arrow's exact face,
    # edge shading and grey underside rather than redrawing it.
    changed = delta.max(axis=2) > 18
    low_chroma = (ref.max(axis=2) - ref.min(axis=2)) < 112
    bright = ref.mean(axis=2) > 108
    alpha = region & changed & low_chroma & bright

    # Preserve antialiased edge pixels while preventing any rectangular crop.
    matte = Image.fromarray((alpha.astype(np.uint8) * 255), "L")
    matte = matte.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(0.7))
    matte_arr = np.asarray(matte, dtype=np.uint8)
    matte_arr = np.where(region, matte_arr, 0).astype(np.uint8)

    rgba = np.dstack((ref.astype(np.uint8), matte_arr))
    Image.fromarray(rgba, "RGBA").save(output)


def main():
    reference = Image.open(REFERENCE).convert("RGB")
    base = Image.open(BASE).convert("RGB")
    reference = reference.resize(base.size, Image.Resampling.LANCZOS)

    # Coordinates are in the locked 791 x 527 artwork coordinate space.
    extract_arrow(
        reference,
        base,
        [(292, 183), (357, 141), (566, 68), (664, 42), (650, 97), (591, 119), (360, 267)],
        [
            [(388, 116), (489, 124), (509, 229), (388, 243)],
            [(316, 179), (395, 179), (395, 194), (316, 194)],
            [(326, 192), (341, 192), (348, 246), (331, 246)],
            [(340, 185), (354, 180), (402, 224), (389, 236)],
        ],
        OUT_TOP,
    )
    extract_arrow(
        reference,
        base,
        [(218, 425), (250, 391), (455, 322), (521, 348), (477, 385), (391, 444), (250, 487)],
        [],
        OUT_BOTTOM,
    )

    for path in (OUT_TOP, OUT_BOTTOM):
        image = Image.open(path)
        alpha = np.asarray(image.getchannel("A"))
        ys, xs = np.where(alpha > 10)
        print(f"{path.name}: {int((alpha > 10).sum())} pixels, bbox=({xs.min()},{ys.min()})-({xs.max()},{ys.max()})")


if __name__ == "__main__":
    main()
