#!/usr/bin/env python3
"""Render context text through the original exam PDF's embedded Calibri."""

from pathlib import Path
import re
import shutil
import subprocess
import tempfile

from PIL import Image, ImageFont
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ArrayObject, DecodedStreamObject, NameObject


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/source/leaving-cert-pe-2023-rowing.pdf"
FONT_FILE = ROOT / "assets/fonts/exam-calibri-regular.ttf"
OUTPUT = ROOT / "assets/exam-context-pdf.png"
TMP_ROOT = ROOT / "tmp/pdfs"

FONT_KEY = "/TT2"
FONT_SIZE = 15.0
LEADING = 18.25
PARAGRAPH_GAP = 4.0
BOX_X, BOX_Y, BOX_W, BOX_H = 20.0, 20.0, 225.0, 132.0
LEFT = BOX_X + 2.0
FIRST_BASELINE = BOX_Y + BOX_H - 13.75

LINES = [
    "Cian races in a single scull.",
    "He pulls the blades through",
    "the water, and the boat",
    "surges forward.",
    "Each stroke applies force",
    "against the water. The diagram",
    "shows where the forces act.",
]


def reverse_cmap(page) -> dict[str, str]:
    font = page["/Resources"]["/Font"][FONT_KEY].get_object()
    cmap = font["/ToUnicode"].get_object().get_data().decode("latin1")
    mapping: dict[str, str] = {}
    for line in cmap.splitlines():
        pair = re.fullmatch(r"\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*", line)
        if pair:
            source, target = pair.groups()
            try:
                character = bytes.fromhex(target).decode("utf-16-be")
            except UnicodeDecodeError:
                continue
            if len(character) == 1:
                mapping[character] = source.upper()
            continue
        span = re.fullmatch(
            r"\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*", line
        )
        if span:
            start, end, target = span.groups()
            start_code, end_code = int(start, 16), int(end, 16)
            target_code = int(target, 16)
            for offset, code in enumerate(range(start_code, end_code + 1)):
                mapping[chr(target_code + offset)] = f"{code:0{len(start)}X}"
    return mapping


def encode(text: str, mapping: dict[str, str]) -> str:
    missing = sorted(set(text) - set(mapping))
    if missing:
        raise ValueError(f"Embedded font lacks characters: {missing}")
    return "".join(mapping[character] for character in text)


def main() -> None:
    reader = PdfReader(SOURCE)
    source_page = reader.pages[8]
    mapping = reverse_cmap(source_page)

    operations = [
        "q 1 1 1 rg",
        f"{BOX_X} {BOX_Y} {BOX_W} {BOX_H} re f Q",
        "0 0 0 rg",
    ]
    baseline = FIRST_BASELINE
    for index, line in enumerate(LINES):
        if index == 4:
            baseline -= PARAGRAPH_GAP
        operations.append(
            f"BT {FONT_KEY} {FONT_SIZE} Tf 1 0 0 1 {LEFT:.2f} {baseline:.2f} Tm <{encode(line, mapping)}> Tj ET"
        )
        baseline -= LEADING

    writer = PdfWriter()
    writer.clone_document_from_reader(reader)
    page = writer.pages[8]
    stream = DecodedStreamObject()
    stream.set_data(("\n".join(operations) + "\n").encode("ascii"))
    stream_ref = writer._add_object(stream)
    contents = page.get("/Contents")
    if isinstance(contents, ArrayObject):
        contents.append(stream_ref)
    else:
        page[NameObject("/Contents")] = ArrayObject([contents, stream_ref])

    TMP_ROOT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="exam-context-", dir=TMP_ROOT) as tmp:
        tmp_dir = Path(tmp)
        pdf_path = tmp_dir / "context.pdf"
        with pdf_path.open("wb") as handle:
            writer.write(handle)

        renderer = shutil.which("pdftoppm")
        if not renderer:
            raise RuntimeError("pdftoppm is required on PATH")
        prefix = tmp_dir / "page"
        subprocess.run(
            [renderer, "-f", "9", "-l", "9", "-r", "200", "-png", "-singlefile", str(pdf_path), str(prefix)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        page_image = Image.open(prefix.with_suffix(".png")).convert("RGB")
        scale = 200 / 72
        page_height = float(page.mediabox.height)
        crop = (
            round(BOX_X * scale),
            round((page_height - BOX_Y - BOX_H) * scale),
            round((BOX_X + BOX_W) * scale),
            round((page_height - BOX_Y) * scale),
        )
        rendered = page_image.crop(crop)
        rgba = Image.new("RGBA", rendered.size)
        source_pixels = rendered.load()
        target_pixels = rgba.load()
        for y in range(rendered.height):
            for x in range(rendered.width):
                r, g, b = source_pixels[x, y]
                alpha = 255 - round((r + g + b) / 3)
                target_pixels[x, y] = (0, 0, 0, alpha)
        rgba.save(OUTPUT)

    measure = ImageFont.truetype(FONT_FILE, 1000)
    width = lambda value: measure.getlength(value) / 1000 * FONT_SIZE
    print(f"rendered={OUTPUT.name} size={rgba.width}x{rgba.height} single_x={2 + width('Cian races in a '):.2f}")


if __name__ == "__main__":
    main()
