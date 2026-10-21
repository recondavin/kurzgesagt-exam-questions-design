# Builds the game's sounds into orals/audio: Kenney CC0 sounds trimmed, levelled and made mono, plus three made
# here from scratch (the sea, the shop bell, a harp flourish), and the music re-encoded smaller. Sources and
# licences are listed in orals/CREDITS.md.
#
#   python3 tools/orals/make_audio.py <downloads> orals/audio
#
# <downloads> holds the unzipped Kenney packs (kenney_impact-sounds, kenney_rpg-audio, kenney_interface-sounds) and
# music/Thatched Villagers.mp3 from incompetech.com. Needs numpy and ffmpeg.
import subprocess, sys, os, numpy as np
DL, OUT = sys.argv[1], sys.argv[2]
SR = 44100
os.makedirs(OUT, exist_ok=True)

def pcm(f):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, np.float32).astype(np.float64)

def write(name, x, kbps=64, ch=1):
    x = np.clip(x, -1, 1).astype(np.float32)
    p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', str(ch), '-i', '-', '-c:a', 'libmp3lame', '-b:a', f'{kbps}k', os.path.join(OUT, name + '.mp3')], input=x.tobytes())
    assert p.returncode == 0, name

def trim(x, lead_db=-50, tail_db=-55):
    a = np.abs(x)
    on = np.where(a > 10 ** (lead_db / 20))[0]
    end = np.where(a > 10 ** (tail_db / 20))[0]
    if not len(on): return x
    x = x[max(0, on[0] - 40): end[-1] + 1]
    f = min(len(x), int(0.012 * SR))
    x[-f:] *= np.linspace(1, 0, f)
    return x

def level(x, peak_db):
    return x / (np.abs(x).max() + 1e-9) * 10 ** (peak_db / 20)

def lowpass(x, hz):
    a = np.exp(-2 * np.pi * hz / SR); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y

I = DL + '/kenney_impact-sounds/Audio/'
# Footsteps on four ground types, levelled to match so grass isn't quieter than wood. Snow crunch stands in for sand.
for out, src, db in [('grass', 'footstep_grass', -7), ('wood', 'footstep_wood', -8), ('stone', 'footstep_concrete', -9), ('sand', 'footstep_snow', -9)]:
    for k in range(4):
        x = trim(pcm(f'{I}{src}_00{k}.ogg'), -40, -46)[: int(0.32 * SR)]
        f = int(0.03 * SR); x[-f:] *= np.linspace(1, 0, f)
        write(f'step-{out}-{k}', level(x, db))

R = DL + '/kenney_rpg-audio/Audio/'
write('door-open', level(trim(pcm(R + 'doorOpen_1.ogg')), -5))
write('door-close', level(trim(pcm(R + 'doorClose_4.ogg')), -5))
write('coins', level(trim(pcm(R + 'handleCoins.ogg')), -4))

U = DL + '/kenney_interface-sounds/Audio/'
# Interface sounds, softened a little (a gentle low-pass) so they sit under the voices of the scene.
for out, src, db, lp in [('tap', 'select_002', -10, 6000), ('untap', 'drop_002', -10, 5000), ('next', 'click_002', -14, 6000),
                         ('talk', 'bong_001', -8, 4000), ('right', 'confirmation_004', -7, 7000), ('nearly', 'question_004', -8, 5000),
                         ('other', 'question_002', -9, 5000)]:
    write(out, level(lowpass(trim(pcm(U + src + '.ogg')), lp), db))

# ---------------------------------------------------------------- made here
rng = np.random.default_rng(7)
# The sea: soft brown noise rising into a wave every few seconds and hissing back out. 16 s that loop seamlessly.
L, X = 16.0, 2.0
n = int((L + X) * SR); t = np.arange(n) / SR
white = rng.standard_normal(n)
brown = np.cumsum(white); brown -= np.convolve(brown, np.ones(4001) / 4001, mode='same'); brown /= np.abs(brown).max()
waves = [(0.0, 4.3), (4.3, 3.7), (8.0, 4.4), (12.0, 4.0), (16.0, 4.3)]
env = np.full(n, 0.18); bright = np.full(n, 0.0)
for st, ln in waves:
    u = (t - st) / ln; m = (u >= 0) & (u < 1)
    rise = np.where(u < 0.55, (u / 0.55) ** 2, np.exp(-(u - 0.55) * 5))
    env[m] += 0.8 * rise[m]; bright[m] += rise[m]
cut = 300 + 1500 * bright
y = np.zeros(n); s = 0.0
for i in range(n):
    a = np.exp(-2 * np.pi * cut[i] / SR); s = (1 - a) * white[i] * 0.6 + a * s; y[i] = s
sea = (y * 6 + brown * 0.35) * env
k = int(X * SR); body = sea[:int(L * SR)].copy()
body[:k] = body[:k] * np.linspace(0, 1, k) + sea[int(L * SR):] * np.linspace(1, 0, k)
write('sea', level(body, -6), kbps=56)

# The shop bell: a little brass bell on a spring over the door, struck a few times as the door swings.
def bell(f0, dur):
    tt = np.arange(int(dur * SR)) / SR
    out = np.zeros_like(tt)
    for r, a, d in [(1, 1, 0.9), (2.32, 0.55, 0.45), (4.25, 0.3, 0.25), (6.63, 0.16, 0.15)]:
        out += a * np.sin(2 * np.pi * f0 * r * tt) * np.exp(-tt / d)
    return out * np.minimum(1, tt / 0.002)
b = np.zeros(int(1.8 * SR))
for when, amp, df in [(0, 1, 0), (0.12, 0.7, 6), (0.21, 0.5, -4), (0.33, 0.36, 3), (0.47, 0.22, -2), (0.66, 0.12, 1)]:
    s0 = int(when * SR); x = bell(2150 + df, 1.8 - when)
    b[s0:s0 + len(x)] += amp * x
write('bell', level(b, -7))

# A harp flourish for the end of a day: a plucked-string (Karplus-Strong) arpeggio up through D major.
def pluck(f, dur, amp):
    N = int(SR / f); buf = rng.uniform(-1, 1, N); out = np.zeros(int(dur * SR))
    for i in range(len(out)):
        out[i] = buf[i % N]
        buf[i % N] = 0.4985 * (buf[i % N] + buf[(i + 1) % N])
    return amp * out
notes = [293.66, 440.0, 587.33, 739.99, 880.0, 1174.66]
h = np.zeros(int(2.6 * SR))
for i, f in enumerate(notes):
    s0 = int(i * 0.085 * SR); x = pluck(f, 2.6 - i * 0.085, 1 - i * 0.07)
    h[s0:s0 + len(x)] += x
for f in [293.66, 587.33, 739.99]:
    s0 = int(0.75 * SR); x = pluck(f, 1.85, 0.5); h[s0:s0 + len(x)] += x
h = lowpass(h, 5000)
f = int(0.4 * SR); h[-f:] *= np.linspace(1, 0, f)
write('harp', level(h, -6))

# The music: levelled to sit under the game and re-encoded at 96 kbps (about 3 MB instead of 10).
song = os.path.join(DL, 'music', 'Thatched Villagers.mp3')
if os.path.exists(song):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', song, '-af', 'loudnorm=I=-19:TP=-2:LRA=11', '-ar', str(SR), '-ac', '2',
                    '-c:a', 'libmp3lame', '-b:a', '96k', '-map_metadata', '-1', os.path.join(OUT, 'music-thatched-villagers.mp3')], check=True)
print('ok')
