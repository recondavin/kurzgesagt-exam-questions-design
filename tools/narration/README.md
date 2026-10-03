# Focus-guide narration

The guide reads each line aloud in the British narrator's voice
(`first-qwen-voice-88hz.mp3` from `recondavin/british-narrator-running-character`)
as the text types. The audio is generated locally with
[Qwen3-TTS](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base) voice cloning.

## The voice

If `custom_reference.wav` exists it is the voice: a clean ~15 s clip of the chosen
narrator, used with the speaker's permission, with its exact words in
`custom_reference.txt` (music removed with Demucs, loudness-normalised, 24 kHz mono).
Replacing either file makes the next update regenerate every line.

Otherwise the voice is *designed*: the VoiceDesign model first makes
`designed_reference.wav` from the description in `generate_narration.py`
(a soft, curious British documentary narrator), then the Base model clones that
clip for every line so they all match. `--redesign` makes a new take of the voice;
`--voice original` uses the first-qwen-voice-88hz take instead.

## Update the voice (one click)

**Windows:** double-click `tools\narration\update_voice_windows.bat`. It pulls the latest
changes, regenerates only the lines whose words or voice changed (tracked in
`assets/narration/manifest.json`), then commits and pushes the new audio so the site updates.

## Generate the audio manually

- **Windows:** double-click `tools\narration\run_narration_windows.bat`.
- **Mac:** `bash tools/narration/run_narration_mac.sh`.

The first run sets up `.venv-narration` and downloads the model (about 4 GB).
An NVIDIA graphics card makes it fast; it also works on the CPU, more slowly.
It writes one MP3 per line to `assets/narration/`, then commit and push those files.

Re-running only makes lines that are missing. Use `--force` to redo everything,
or `--only question-3b-1` for single lines.

## Windows Smart App Control

If Windows reports *"An Application Control policy has blocked this file"* for a
scikit-learn DLL, remove that package (narration does not use it):
`.venv-narration\Scripts\pip.exe uninstall -y scikit-learn`. The Windows launcher
does this automatically.

## Studio sound

`studio_upgrade.py` makes the clips sound like a high-quality studio microphone: ClearerVoice
speech super-resolution rebuilds the top end the 24 kHz voice model leaves out (48 kHz output),
then a mic-style finish adds warmth, balances the highs, de-esses and levels each clip.
It only touches clips still at 24 kHz, so run it after each narration update
(`pip install clearvoice scipy soundfile`, plus ffmpeg).

## Files

- `lines.json` — every line the guide shows, by id (`<step>-title`, `<step>-summary`, `<step>-1`…).
  Update it when the guide wording in `hyper-focus.js` changes.
- `reference.wav` — the narrator clip the voice is cloned from (24 kHz mono).
- `generate_narration.py` — the generator; the reference transcript is inside it.

The page skips any line whose MP3 is missing, and the speaker button beside the
close button turns the voice on or off.
