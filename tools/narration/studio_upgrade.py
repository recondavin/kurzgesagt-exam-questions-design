"""Make narration sound like it was recorded on a high-quality studio microphone.

The voice model only produces 24 kHz audio, which has nothing above 12 kHz, so it sounds dull
next to a real studio mic. This rebuilds the missing top end with ClearerVoice speech
super-resolution (MossFormer2_SR_48K), then applies a microphone-style finish: warmth,
natural high-frequency balance, a de-esser and steady loudness. Output is 48 kHz MP3.

Only clips still at 24 kHz (fresh from generate_narration.py) are processed, so it is safe
to run after every narration update:
    python tools/narration/studio_upgrade.py
Needs: pip install clearvoice scipy soundfile, and ffmpeg on PATH.
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import lfilter

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "assets" / "narration"
RATE = 48000
# Voice tone: about one semitone deeper (timbre kept), plus the warmth EQ in mic_finish.
PITCH = 0.9439
PITCH_FILTER = f"rubberband=pitch={PITCH}:formant=preserved:pitchq=quality"


def sample_rate(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=sample_rate", "-of", "csv=p=0",
                          str(path)], capture_output=True, text=True, check=True).stdout.strip()
    return int(out or 0)


def biquad(kind, freq, gain_db=0.0, q=0.707, sr=RATE):
    a_gain = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * freq / sr
    alpha = np.sin(w0) / (2 * q)
    cos = np.cos(w0)
    if kind == "highpass":
        b = [(1 + cos) / 2, -(1 + cos), (1 + cos) / 2]
        a = [1 + alpha, -2 * cos, 1 - alpha]
    elif kind == "bandpass":
        b = [alpha, 0, -alpha]
        a = [1 + alpha, -2 * cos, 1 - alpha]
    elif kind == "shelf":  # high shelf
        sq = 2 * np.sqrt(a_gain) * alpha
        b = [a_gain * ((a_gain + 1) + (a_gain - 1) * cos + sq), -2 * a_gain * ((a_gain - 1) + (a_gain + 1) * cos),
             a_gain * ((a_gain + 1) + (a_gain - 1) * cos - sq)]
        a = [(a_gain + 1) - (a_gain - 1) * cos + sq, 2 * ((a_gain - 1) - (a_gain + 1) * cos),
             (a_gain + 1) - (a_gain - 1) * cos - sq]
    else:  # peak
        b = [1 + alpha * a_gain, -2 * cos, 1 - alpha * a_gain]
        a = [1 + alpha / a_gain, -2 * cos, 1 - alpha / a_gain]
    return np.array(b) / a[0], np.array(a) / a[0]


def envelope(x, attack, release, sr=RATE):
    att, rel = np.exp(-1 / (attack * sr)), np.exp(-1 / (release * sr))
    env = np.empty_like(x)
    prev = 0.0
    for i, v in enumerate(np.abs(x)):
        coef = att if v > prev else rel
        prev = coef * prev + (1 - coef) * v
        env[i] = prev
    return env


WARMTH = [("peak", 220, 2.0, 0.9),        # fuller, richer chest tone
          ("shelf", 7000, -1.5, 0.707)]     # slightly softer highs


def warm(audio):
    for kind, freq, gain, q in WARMTH:
        b, a = biquad(kind, freq, gain, q)
        audio = lfilter(b, a, audio).astype(np.float32)
    return audio


def mic_finish(audio):
    """Studio-mic character: clean low end with a touch of proximity warmth, natural highs, de-essed."""
    for kind, freq, gain, q in [("highpass", 70, 0, 0.707),   # rumble and handling noise
                                ("peak", 150, 1.5, 0.8),       # proximity warmth of a close mic
                                ("peak", 9500, -7.0, 0.9)]:    # tame the over-bright band super-resolution adds
        b, a = biquad(kind, freq, gain, q)
        audio = lfilter(b, a, audio).astype(np.float32)
    audio = warm(audio)
    # De-esser: when the 5-9 kHz sibilance band jumps above the voice, turn just that band down.
    b, a = biquad("bandpass", 6500, q=0.9)
    sib = lfilter(b, a, audio).astype(np.float32)
    ratio_db = 20 * np.log10(np.maximum(envelope(sib, 0.002, 0.06), 1e-6) /
                             np.maximum(envelope(audio, 0.005, 0.12), 1e-6))
    cut = np.clip(ratio_db - (-9.0), 0.0, 8.0)                 # reduce sibilance above -9 dB relative, at most 8 dB
    audio = audio - sib * (1 - 10 ** (-cut / 20))
    # Steady level like a produced voice-over, with 1 dB of headroom.
    rms = float(np.sqrt(np.mean(audio[np.abs(audio) > 1e-3] ** 2)))
    audio = audio * (10 ** (-18 / 20) / rms)
    peak = float(np.max(np.abs(audio)))
    if peak > 0.89:
        audio = audio * (0.89 / peak)
    return audio.astype(np.float32)


def main():
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is needed on PATH")
    todo = [p for p in sorted(OUT.glob("*.mp3")) if sample_rate(p) < RATE]
    if not todo:
        print("Every clip is already studio quality.")
        return
    from clearvoice import ClearVoice
    model = ClearVoice(task="speech_super_resolution", model_names=["MossFormer2_SR_48K"])
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        for n, mp3 in enumerate(todo, 1):
            print(f"[{n}/{len(todo)}] {mp3.name}")
            wav_in, wav_out = tmp / "in.wav", tmp / "out.wav"
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(mp3), "-ac", "1", "-ar", str(RATE),
                            str(wav_in)], check=True)
            model.write(model(input_path=str(wav_in), online_write=False), output_path=str(wav_out))
            wav_deep = tmp / "deep.wav"
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav_out), "-af", PITCH_FILTER,
                            "-ar", str(RATE), str(wav_deep)], check=True)
            audio, sr = sf.read(str(wav_deep), dtype="float32", always_2d=False)
            if audio.ndim > 1:
                audio = audio.mean(axis=1)
            sf.write(str(wav_out), mic_finish(audio), RATE)
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav_out), "-ac", "1", "-ar", str(RATE),
                            "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)], check=True)
    print(f"Done. {len(todo)} clip(s) upgraded to 48 kHz studio sound.")


if __name__ == "__main__":
    main()
