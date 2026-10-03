"""Generate the focus-guide narration in the British narrator's voice with Qwen3-TTS.

Runs locally. It clones the voice from reference.wav (the existing
first-qwen-voice-88hz.mp3 take) and writes one MP3 per line in lines.json to
assets/narration/<id>.mp3, which the page plays as each line types.

Usage (from the repository root):
    python tools/narration/generate_narration.py            # only lines without an MP3 yet
    python tools/narration/generate_narration.py --force    # regenerate everything
    python tools/narration/generate_narration.py --only question-3b-1
"""
import argparse
import hashlib
import json
import os
import re
import sys
from pathlib import Path

# The model is public: never send a saved Hugging Face login (an expired one makes the download fail with 401).
os.environ.setdefault("HF_HUB_DISABLE_IMPLICIT_TOKEN", "1")

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
OUT = ROOT / "assets" / "narration"
MODEL_ID = "Qwen/Qwen3-TTS-12Hz-1.7B-Base"
DESIGN_MODEL_ID = "Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign"

# Voice: first described with the VoiceDesign model (one reference clip), then that clip is
# cloned with the Base model for every line, so all lines share one consistent voice.
VOICE_DESCRIPTION = (
    "A softly spoken middle-aged British man with a gentle Received Pronunciation accent, "
    "like a calm nature documentary narrator. He speaks quietly and warmly at an unhurried pace, "
    "sounding genuinely curious and quietly fascinated, with a light rise of wonder in his voice.")
DESIGNED_WAV = HERE / "designed_reference.wav"
DESIGNED_KEY = HERE / "designed_reference.key"
# Records which voice + words each MP3 was made from, so only changed lines are regenerated
# (and the page uses it to avoid playing a stale cached clip).
MANIFEST = OUT / "manifest.json"
DESIGNED_TEXT = ("Have you ever wondered how a mountain is made? Let's find out together, "
                 "one layer at a time, and see what the rocks can tell us.")

# Custom voice: a clean clip of the chosen narrator (used with the speaker's permission) and its
# exact transcript. When present it is the default voice.
CUSTOM_WAV = HERE / "custom_reference.wav"
CUSTOM_TEXT_FILE = HERE / "custom_reference.txt"

# The original take (first-qwen-voice-88hz.mp3), still available with --voice original.
REFERENCE_WAV = HERE / "reference.wav"
# Transcript of reference.wav; voice cloning is most faithful with the exact words.
REFERENCE_TEXT = ("Welcome. Today, we shall explore how the human heart moves blood around the body, "
                  "step by step, with clarity, patience, and scientific precision.")


def spoken(text):
    """Small wording changes so abbreviations are read naturally."""
    # Say small numbers as words: a line starting with digits ("15 explained points") came out silent.
    words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven",
             "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"]
    text = re.sub(r"\b(\d{1,2})\b", lambda m: words[int(m.group(1))] if int(m.group(1)) <= 20 else m.group(1), text)
    text = text[:1].upper() + text[1:]
    text = re.sub(r"\bCo\. ", "County ", text)
    text = re.sub(r"\bSRPs?\b", lambda m: "S.R.P." + ("s" if m.group(0).endswith("s") else ""), text)
    return text


def pick_device(torch):
    if torch.cuda.is_available():
        return "cuda:0", torch.bfloat16
    if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        return "mps", torch.float32
    return "cpu", torch.float32


def write_mp3(path, samples, sample_rate):
    import lameenc
    import numpy as np
    pcm = np.clip(np.asarray(samples, dtype=np.float32), -1.0, 1.0)
    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(int(sample_rate))
    encoder.set_channels(1)
    encoder.set_quality(2)
    data = encoder.encode((pcm * 32767).astype(np.int16).tobytes()) + encoder.flush()
    path.write_bytes(data)


def short_hash(*parts):
    return hashlib.sha1("\n".join(parts).encode("utf-8")).hexdigest()[:10]


def designed_voice_key():
    return short_hash(DESIGN_MODEL_ID, VOICE_DESCRIPTION, DESIGNED_TEXT)


def design_reference(torch, device, dtype):
    """Create designed_reference.wav from VOICE_DESCRIPTION with the VoiceDesign model."""
    import soundfile as sf
    from qwen_tts import Qwen3TTSModel
    print(f"Designing the narrator voice with {DESIGN_MODEL_ID} (first run downloads about 4 GB)...")
    torch.manual_seed(7)
    model = Qwen3TTSModel.from_pretrained(DESIGN_MODEL_ID, device_map=device, dtype=dtype)
    wavs, sample_rate = model.generate_voice_design(
        text=DESIGNED_TEXT, instruct=VOICE_DESCRIPTION, language="English")
    sf.write(str(DESIGNED_WAV), wavs[0], sample_rate)
    DESIGNED_KEY.write_text(designed_voice_key(), encoding="utf-8")
    print(f"Saved {DESIGNED_WAV.name}; listen to it, and use --redesign for a different take.")
    del model
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="regenerate lines that already have an MP3")
    parser.add_argument("--only", nargs="*", help="line ids to generate")
    parser.add_argument("--voice", choices=["custom", "designed", "original"],
                        default="custom" if CUSTOM_WAV.exists() else "designed",
                        help="custom: custom_reference.wav (default when present); designed: the described "
                             "British narrator; original: first-qwen-voice-88hz")
    parser.add_argument("--redesign", action="store_true", help="make a new designed reference voice first")
    args = parser.parse_args()

    lines = json.loads((HERE / "lines.json").read_text(encoding="utf-8"))
    if args.only:
        lines = [line for line in lines if line["id"] in set(args.only)]
    OUT.mkdir(parents=True, exist_ok=True)
    stored_key = DESIGNED_KEY.read_text(encoding="utf-8").strip() if DESIGNED_KEY.exists() else ""
    redesign = args.voice == "designed" and (args.redesign or not DESIGNED_WAV.exists() or stored_key != designed_voice_key())
    if args.voice == "custom":
        custom_text = CUSTOM_TEXT_FILE.read_text(encoding="utf-8").strip()
        voice_key = short_hash("custom", hashlib.sha1(CUSTOM_WAV.read_bytes()).hexdigest(), custom_text)
    else:
        voice_key = "redesign" if redesign else (designed_voice_key() if args.voice == "designed" else "original")
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8")) if MANIFEST.exists() else {}
    wanted = {line["id"]: short_hash(MODEL_ID, voice_key, spoken(line["text"])) for line in lines}
    todo = [line for line in lines
            if args.force or redesign or manifest.get(line["id"]) != wanted[line["id"]]
            or not (OUT / f"{line['id']}.mp3").exists()]
    if not todo:
        print("Every line is already up to date. Use --force to regenerate anyway.")
        return

    import torch
    from qwen_tts import Qwen3TTSModel

    device, dtype = pick_device(torch)
    if args.voice == "designed":
        if redesign:
            design_reference(torch, device, dtype)
            voice_key = designed_voice_key()
            wanted = {line["id"]: short_hash(MODEL_ID, voice_key, spoken(line["text"])) for line in lines}
        ref_wav, ref_text = DESIGNED_WAV, DESIGNED_TEXT
    elif args.voice == "custom":
        ref_wav, ref_text = CUSTOM_WAV, custom_text
    else:
        ref_wav, ref_text = REFERENCE_WAV, REFERENCE_TEXT

    print(f"Loading {MODEL_ID} on {device} (first run downloads about 4 GB)...")
    torch.manual_seed(7)
    model = Qwen3TTSModel.from_pretrained(MODEL_ID, device_map=device, dtype=dtype)
    voice = model.create_voice_clone_prompt(ref_audio=str(ref_wav), ref_text=ref_text, x_vector_only_mode=False)

    for n, line in enumerate(todo, 1):
        text = spoken(line["text"])
        print(f"[{n}/{len(todo)}] {line['id']}: {text}")
        wavs, sample_rate = model.generate_voice_clone(
            text=text, language="English", voice_clone_prompt=voice)
        write_mp3(OUT / f"{line['id']}.mp3", wavs[0], sample_rate)
        manifest[line["id"]] = wanted[line["id"]]
        MANIFEST.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")

    print(f"Done. {len(todo)} file(s) written to {OUT}")


if __name__ == "__main__":
    sys.exit(main())
