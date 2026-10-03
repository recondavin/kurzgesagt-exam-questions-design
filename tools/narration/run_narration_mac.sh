#!/usr/bin/env bash
# Generate the focus-guide narration locally with Qwen3-TTS (macOS / Linux).
# Run:  bash tools/narration/run_narration_mac.sh   (extra arguments are passed on, e.g. --force)
set -euo pipefail
cd "$(dirname "$0")/../.."
if [ ! -d .venv-narration ]; then
  python3 -m venv .venv-narration
  . .venv-narration/bin/activate
  python -m pip install --upgrade pip
  pip install torch torchaudio
  pip install -U qwen-tts lameenc
else
  . .venv-narration/bin/activate
fi
python tools/narration/generate_narration.py "$@"
echo "Narration finished. The MP3s are in assets/narration"
