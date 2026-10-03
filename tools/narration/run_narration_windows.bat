@echo off
rem Generate the focus-guide narration locally with Qwen3-TTS (Windows).
rem Double-click this file, or run it from a terminal. Extra arguments are passed on,
rem e.g.  run_narration_windows.bat --force
cd /d "%~dp0\..\.."
if not exist .venv-narration (
  py -3.12 -m venv .venv-narration 2>nul || python -m venv .venv-narration || goto :error
  call .venv-narration\Scripts\activate.bat || goto :error
  python -m pip install --upgrade pip
  rem CUDA build of PyTorch: uses an NVIDIA graphics card when present, otherwise the CPU.
  pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124 || goto :error
  pip install -U qwen-tts lameenc || goto :error
) else (
  call .venv-narration\Scripts\activate.bat || goto :error
)
python tools\narration\generate_narration.py %* || goto :error
echo.
echo Narration finished. The MP3s are in assets\narration
pause
exit /b 0
:error
echo.
echo Something went wrong - copy the messages above and send them over.
pause
exit /b 1
