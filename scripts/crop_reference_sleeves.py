#!/usr/bin/env python3
"""Extract the two shirt sleeves from the approved scene reference.

The source RGB pixels are preserved exactly.  The tool only creates an alpha
channel, trims transparent margins, and writes separate left/right PNG files.
"""

from __future__ import annotations

import argparse
import base64
from collections import deque
from pathlib import Path
import re

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


REFERENCE_SIZE = (1335, 1178)
REFERENCE_BOXES = {
    "left": (0, 680, 310, 1178),
    "right": (1030, 680, 1335, 1178),
}


def scaled_box(name: str, size: tuple[int, int]) -> tuple[int, int, int, int]:
    width, height = size
    sx = width / REFERENCE_SIZE[0]
    sy = height / REFERENCE_SIZE[1]
    x0, y0, x1, y1 = REFERENCE_BOXES[name]
    return (
        round(x0 * sx),
        round(y0 * sy),
        round(x1 * sx),
        round(y1 * sy),
    )


def largest_component(mask: np.ndarray) -> np.ndarray:
    """Return the largest 8-connected component in a boolean mask."""
    height, width = mask.shape
    seen = np.zeros_like(mask, dtype=bool)
    best: list[tuple[int, int]] = []

    for y in range(height):
        for x in range(width):
            if not mask[y, x] or seen[y, x]:
                continue
            queue = deque([(x, y)])
            seen[y, x] = True
            component: list[tuple[int, int]] = []
            while queue:
                cx, cy = queue.popleft()
                component.append((cx, cy))
                for ny in range(max(0, cy - 1), min(height, cy + 2)):
                    for nx in range(max(0, cx - 1), min(width, cx + 2)):
                        if mask[ny, nx] and not seen[ny, nx]:
                            seen[ny, nx] = True
                            queue.append((nx, ny))
            if len(component) > len(best):
                best = component

    result = np.zeros_like(mask, dtype=np.uint8)
    for x, y in best:
        result[y, x] = 255
    return result


def extract_sleeve(source: Image.Image, name: str) -> Image.Image:
    crop = source.crop(scaled_box(name, source.size)).convert("RGBA")
    rgb = np.asarray(crop, dtype=np.int16)[..., :3]

    channel_max = rgb.max(axis=2)
    channel_min = rgb.min(axis=2)
    chroma = channel_max - channel_min
    luminance = (
        rgb[..., 0] * 0.2126 + rgb[..., 1] * 0.7152 + rgb[..., 2] * 0.0722
    )

    # White fabric is bright and close to neutral. The orange desk and peach
    # skin have substantially higher chroma, so they are excluded without
    # changing the retained sleeve colours.
    core = (luminance >= 174) & (chroma <= 43) & (channel_min >= 150)
    component = largest_component(core)

    # Keep the original anti-aliased edge pixels immediately around the core.
    expanded = Image.fromarray(component, mode="L").filter(ImageFilter.MaxFilter(7))
    expanded_array = np.asarray(expanded, dtype=np.float32) / 255.0
    # A strict chroma ramp removes the orange desk fringe from the source's
    # anti-aliased boundary while leaving neutral white/grey cloth untouched.
    colour_alpha = np.clip((44.0 - chroma) / 24.0, 0.0, 1.0)
    light_alpha = np.clip((luminance - 132.0) / 48.0, 0.0, 1.0)
    alpha = np.rint(255.0 * expanded_array * colour_alpha * light_alpha).astype(np.uint8)

    # Close tiny holes within the continuous cloth while retaining a soft edge.
    alpha_image = Image.fromarray(alpha, mode="L")
    alpha_image = alpha_image.filter(ImageFilter.MaxFilter(3))
    alpha_image = alpha_image.filter(ImageFilter.GaussianBlur(0.45))

    result = crop.copy()
    result.putalpha(alpha_image)
    bounds = alpha_image.getbbox()
    if bounds is None:
        raise RuntimeError(f"No {name} sleeve pixels were detected")

    padding = 4
    x0, y0, x1, y1 = bounds
    x0 = max(0, x0 - padding)
    y0 = max(0, y0 - padding)
    x1 = min(result.width, x1 + padding)
    y1 = min(result.height, y1 + padding)
    return result.crop((x0, y0, x1, y1))


def checkerboard(size: tuple[int, int], cell: int = 18) -> Image.Image:
    board = Image.new("RGB", size, "#d9dde4")
    draw = ImageDraw.Draw(board)
    for y in range(0, size[1], cell):
        for x in range(0, size[0], cell):
            if (x // cell + y // cell) % 2:
                draw.rectangle((x, y, x + cell - 1, y + cell - 1), fill="#b8bec8")
    return board


def make_qa_sheet(sleeves: dict[str, Image.Image], output: Path) -> None:
    panel_size = (520, 620)
    sheet = Image.new("RGB", (panel_size[0] * 2, panel_size[1]), "#eef1f5")
    draw = ImageDraw.Draw(sheet)
    for index, name in enumerate(("left", "right")):
        panel = checkerboard((panel_size[0] - 32, panel_size[1] - 72))
        sleeve = sleeves[name].copy()
        sleeve.thumbnail((panel.width - 30, panel.height - 30), Image.Resampling.LANCZOS)
        px = (panel.width - sleeve.width) // 2
        py = (panel.height - sleeve.height) // 2
        panel.paste(sleeve, (px, py), sleeve)
        x = index * panel_size[0] + 16
        sheet.paste(panel, (x, 54))
        draw.text((x, 18), f"{name.upper()} — source pixels, transparent crop", fill="#182033")
    sheet.save(output, optimize=True)


def install_into_hand_svg(
    svg_path: Path,
    side: str,
    sleeve_path: Path,
) -> None:
    """Embed a crop in both sleeve slots so nested SVG loading stays reliable."""
    encoded = base64.b64encode(sleeve_path.read_bytes()).decode("ascii")
    href = f"data:image/png;base64,{encoded}"
    if side == "left":
        x, y, width, height = -150, 833, 948, 1611
    else:
        x, y, width, height = 527, 813, 850, 1550

    text = svg_path.read_text()
    for group_id in (f"{side}-forearm-extension", f"{side}-shirt-sleeve"):
        text = re.sub(
            rf'(<g id="{re.escape(group_id)}") transform="[^"]*"',
            r'\1',
            text,
            count=1,
        )
    image_tag = (
        f'<image href="{href}" x="{x}" y="{y}" width="{width}" '
        f'height="{height}" preserveAspectRatio="none" />'
    )
    artwork_tag = (
        f'<image id="{side}-shirt-sleeve-artwork" href="{href}" x="{x}" y="{y}" '
        f'width="{width}" height="{height}" preserveAspectRatio="none" />'
    )

    extension_pattern = re.compile(
        rf'(<g id="{side}-forearm-extension"[^>]*>\s*)<image\b[^>]*\s*/>',
        re.DOTALL,
    )
    hidden_pattern = re.compile(
        rf'(<g id="{side}-shirt-sleeve"[^>]*>\s*)<image\b[^>]*\s*/>',
        re.DOTALL,
    )
    text, extension_count = extension_pattern.subn(rf'\1{image_tag}', text, count=1)
    text, hidden_count = hidden_pattern.subn(rf'\1{artwork_tag}', text, count=1)
    if extension_count != 1 or hidden_count != 1:
        raise RuntimeError(f"Could not find both {side} sleeve slots in {svg_path}")
    svg_path.write_text(text)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_dir", type=Path)
    parser.add_argument(
        "--install-project",
        type=Path,
        help="Also embed the crops into this project's existing hand SVGs",
    )
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGBA")
    args.output_dir.mkdir(parents=True, exist_ok=True)

    sleeves = {name: extract_sleeve(source, name) for name in ("left", "right")}
    for name, sleeve in sleeves.items():
        sleeve.save(args.output_dir / f"reference-{name}-shirt-sleeve.png", optimize=True)
    make_qa_sheet(sleeves, args.output_dir / "reference-sleeves-qa.png")

    if args.install_project:
        hand_dir = args.install_project / "assets" / "hands"
        install_into_hand_svg(
            hand_dir / "left-resting-layered.svg",
            "left",
            args.output_dir / "reference-left-shirt-sleeve.png",
        )
        install_into_hand_svg(
            hand_dir / "right-writing-gentle-rig.svg",
            "right",
            args.output_dir / "reference-right-shirt-sleeve.png",
        )

    for name, sleeve in sleeves.items():
        print(f"{name}: {sleeve.width}x{sleeve.height}")


if __name__ == "__main__":
    main()
