@echo off
rem One click: get the latest changes, regenerate any narration that changed, and upload it.
rem Double-click this file after Claude changes the voice or the guide wording.
cd /d "%~dp0\..\.."
set HF_HUB_DISABLE_IMPLICIT_TOKEN=1

echo [1/4] Getting the latest changes...
rem Generated audio is rebuilt below, so local copies never block the update.
git clean -fdq -- assets/narration
git checkout -- assets/narration 2>nul
git checkout -- tools/narration/designed_reference.wav tools/narration/designed_reference.key 2>nul
git pull || goto :error

echo [2/4] Checking the voice tools...
if not exist .venv-narration (
  py -3.12 -m venv .venv-narration 2>nul || python -m venv .venv-narration || goto :error
  call .venv-narration\Scripts\activate.bat || goto :error
  python -m pip install --upgrade pip
  pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu124 || goto :error
  pip install -U qwen-tts lameenc || goto :error
  pip uninstall -y scikit-learn
) else (
  call .venv-narration\Scripts\activate.bat || goto :error
)

echo [3/4] Making the narration (only lines that changed)...
python tools\narration\generate_narration.py || goto :error

echo [4/4] Uploading the new audio...
git config user.name >nul 2>&1 || git config user.name "Davin"
git config user.email >nul 2>&1 || git config user.email "davin.luc.hanley@gmail.com"
git add assets/narration
if exist tools\narration\designed_reference.wav git add tools/narration/designed_reference.wav
if exist tools\narration\designed_reference.key git add tools/narration/designed_reference.key
git diff --cached --quiet && (
  echo Nothing new to upload - the voice is already up to date.
) || (
  git commit -m "Update narration audio" && git push || goto :error
  echo Uploaded. The site updates in about a minute.
)
echo.
echo All done.
pause
exit /b 0

:error
echo.
echo Something went wrong - take a screenshot of the messages above and send it over.
pause
exit /b 1
