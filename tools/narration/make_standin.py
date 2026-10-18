"""Stand-in narration for lines that have no clip yet, with Kokoro-82M (a small open voice model that runs on a
normal processor). It voices tools/narration/bio_lines.json in a British narrator voice (bm_george) so the guide
talks straight away. The clips are not in manifest.json, so the next run of generate_narration.py (the one-click
update) replaces every one of them with the chosen narrator's voice.

Needs: pip install kokoro soundfile (and torch), plus ffmpeg.
Run: python tools/narration/make_standin.py [--force]
"""
import json, re, subprocess, sys, tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / "assets" / "narration"
VOICE, SPEED = "bm_george", 0.95
MEAN_DB, PEAK = -19.8, 0.86  # the same level as the narrator's clips (mean about -19.8 dB, peaks about -1.3 dB)

# Letters read one by one, and a few words the model reads oddly.
SAY = [(r"\bpH\b", "P H"), (r"\bADH\b", "A D H"), (r"\bDNA\b", "D N A"), (r"\bRNA\b", "R N A"), (r"\bABO\b", "A B O"),
       (r"\bAB\b", "A B"), (r"\bSA\b", "S A"), (r"\bAV\b", "A V"), (r"\bBSE\b", "B S E"), (r"\bCJD\b", "C J D"),
       (r"\bAIDS\b", "Aids"), (r"\bCOVID-19\b", "Covid nineteen")]
WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve",
         "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"]


def spoken(text):
    for pat, rep in SAY:
        text = re.sub(pat, rep, text)
    text = re.sub(r"\b(\d{1,2})\b", lambda m: WORDS[int(m.group(1))] if int(m.group(1)) <= 20 else m.group(1), text)
    return text[:1].upper() + text[1:]


def main():
    from kokoro import KPipeline
    force = "--force" in sys.argv
    lines = json.loads((HERE / "bio_lines.json").read_text(encoding="utf-8"))
    todo = [l for l in lines if force or not (OUT / f"{l['id']}.mp3").exists()]
    print(f"{len(todo)} of {len(lines)} lines to voice")
    pipe = KPipeline(lang_code="b")
    for n, line in enumerate(todo, 1):
        parts = [a.numpy() if hasattr(a, "numpy") else np.asarray(a) for _, _, a in pipe(spoken(line.get("say") or line["text"]), voice=VOICE, speed=SPEED)]
        audio = np.concatenate(parts).astype(np.float32)
        rms = float(np.sqrt(np.mean(audio ** 2))) or 1e-6
        audio = audio * (10 ** (MEAN_DB / 20) / rms)
        with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
            sf.write(tmp.name, audio, 24000)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp.name, "-af", f"alimiter=limit={PEAK}:level=disabled",
                            "-ar", "48000", "-ac", "1", "-b:a", "128k", str(OUT / f"{line['id']}.mp3")], check=True)
        if n % 25 == 0 or n == len(todo):
            print(f"  {n}/{len(todo)}", flush=True)


if __name__ == "__main__":
    main()
