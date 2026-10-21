// Sound: footsteps for the ground underfoot, doors, the shop bell, chimes for answers, the sea and music.
// Browsers (iPhones above all) only allow sound after a tap or a key, so nothing plays until the first one.
// Short sounds are decoded into memory; the music streams from an <audio> element through the same mixer so it
// can be turned down while someone talks. Two switches in the menu (music, sounds) are kept on this device.
// The files are in orals/audio; where they come from and their licences are in orals/CREDITS.md.
const BASE = new URL('../audio/', import.meta.url).href;
const STEPS = { grass: 4, wood: 4, stone: 4, sand: 4 };
const FILES = ['door-open', 'door-close', 'bell', 'coins', 'tap', 'untap', 'next', 'talk', 'right', 'nearly', 'other', 'harp', 'sea'];
for (const [k, n] of Object.entries(STEPS)) for (let i = 0; i < n; i++) FILES.push(`step-${k}-${i}`);

// How loud each part is (0 to 1).
const LEVEL = { sfx: 0.9, step: 0.5, musicOut: 0.34, musicIn: 0.24, musicTalk: 0.1, musicVoice: 0.035, sea: 0.55 };

export function createSound(opts = {}) {
  const key = (opts.key || 'oral') + '-sound';
  let prefs = { music: true, sfx: true };
  try { Object.assign(prefs, JSON.parse(localStorage.getItem(key) || '{}')); } catch (e) { /* private mode */ }
  const savePrefs = () => { try { localStorage.setItem(key, JSON.stringify(prefs)); } catch (e) { /* private mode */ } };

  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, out = null, sfxBus = null, musicGain = null, seaGain = null, seaFilter = null, music = null;
  const buffers = {}, stats = { played: 0, steps: 0, last: '' };
  const scene = { indoors: false, talking: false, sea: 99 };
  let lastStep = -1;

  function load(name) {
    return fetch(BASE + name + '.mp3').then(r => r.arrayBuffer())
      .then(b => new Promise((ok, bad) => ctx.decodeAudioData(b, ok, bad)))
      .then(buf => { buffers[name] = buf; if (name === 'sea') startSea(); })
      .catch(() => { /* a missing sound is left out */ });
  }

  // The first tap or key: make the mixer, start the music (it has to start inside the tap on an iPhone), then fetch
  // the short sounds. Every tap tries again until the sound is really running (an iPhone doesn't count every kind
  // of tap event).
  function unlock() {
    if (!AC) return;
    if (ctx) {
      if (ctx.state !== 'running') { ctx.resume(); blip(); }
      if (music && prefs.music && music.paused && !document.hidden) playMusic();
      return;
    }
    ctx = new AC();
    out = ctx.createGain();
    out.connect(ctx.destination);
    sfxBus = ctx.createGain();
    sfxBus.gain.value = prefs.sfx ? LEVEL.sfx : 0;
    sfxBus.connect(out);
    blip();
    if (opts.music) {
      music = new Audio(new URL(opts.music, document.baseURI).href);
      music.loop = true;
      music.preload = 'auto';
      musicGain = ctx.createGain();
      musicGain.gain.value = 0;
      try { ctx.createMediaElementSource(music).connect(musicGain); musicGain.connect(out); } catch (e) { music.volume = 0.3; }
      if (prefs.music) playMusic();
    }
    // The sea comes through a filter that muffles it indoors.
    seaFilter = ctx.createBiquadFilter();
    seaFilter.type = 'lowpass';
    seaFilter.frequency.value = 20000;
    seaGain = ctx.createGain();
    seaGain.gain.value = 0;
    seaFilter.connect(seaGain);
    seaGain.connect(sfxBus);
    if (ctx.state === 'suspended') ctx.resume();
    FILES.forEach(load);
  }
  ['pointerup', 'touchend', 'keydown', 'click'].forEach(t => window.addEventListener(t, unlock, true));

  // A silent blip unlocks output on older iPhones.
  function blip() {
    const b = ctx.createBufferSource();
    b.buffer = ctx.createBuffer(1, 1, 22050);
    b.connect(out);
    b.start(0);
  }
  function playMusic() { if (music) { const p = music.play(); p && p.catch(() => {}); } }
  function startSea() {
    const src = ctx.createBufferSource();
    src.buffer = buffers.sea;
    src.loop = true;
    src.connect(seaFilter);
    src.start(0);
  }

  // Pausing in the background, carrying on when the page comes back.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) { ctx.suspend(); music && music.pause(); }
    else { ctx.resume(); if (prefs.music) playMusic(); }
  });

  // name: a file in orals/audio. o: { vol, rate, vary (a random change of pitch, 0.06 is ±6%) }.
  function play(name, o = {}) {
    const buf = buffers[name];
    if (!ctx || !buf || !prefs.sfx) return;
    const src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buf;
    src.playbackRate.value = (o.rate || 1) * (1 + (Math.random() * 2 - 1) * (o.vary || 0));
    g.gain.value = o.vol == null ? 1 : o.vol;
    src.connect(g);
    g.connect(sfxBus);
    src.start(ctx.currentTime + (o.delay || 0));
    stats.played++;
    stats.last = name;
  }

  // A footstep on the given ground (grass, wood, stone, sand), never the same one twice running.
  function step(ground) {
    const n = STEPS[ground] || STEPS.grass;
    let i = Math.floor(Math.random() * n);
    if (i === lastStep) i = (i + 1) % n;
    lastStep = i;
    stats.steps++;
    play(`step-${STEPS[ground] ? ground : 'grass'}-${i}`, { vol: LEVEL.step, vary: 0.07 });
  }

  // Each frame: the music turns down indoors and further while someone talks; the sea is louder near the water and
  // muffled indoors.
  function update(dt) {
    if (!ctx) return;
    const k = Math.min(1, dt * 2.5);
    if (musicGain) {
      const want = prefs.music ? (scene.voice ? LEVEL.musicVoice : scene.talking ? LEVEL.musicTalk : scene.indoors ? LEVEL.musicIn : LEVEL.musicOut) : 0;
      musicGain.gain.value += (want - musicGain.gain.value) * k;
    }
    if (seaGain) {
      const near = Math.max(0, 1 - scene.sea / 16);
      const want = LEVEL.sea * (0.08 + 0.92 * near * near) * (scene.indoors ? 0.35 : 1);
      seaGain.gain.value += (want - seaGain.gain.value) * k;
      seaFilter.frequency.value += ((scene.indoors ? 500 : 12000) - seaFilter.frequency.value) * k;
    }
  }

  return {
    play, step, update, stats,
    get levels() { return { music: musicGain?.gain.value || 0, voice: !!scene.voice }; },
    // { indoors, talking, sea (metres to the water) }: any of them.
    scene(s) { Object.assign(scene, s); },
    get prefs() { return Object.assign({}, prefs); },
    setMusic(on) {
      prefs.music = !!on;
      savePrefs();
      if (!music) return;
      if (on) playMusic();
      else setTimeout(() => { if (!prefs.music) music.pause(); }, 600);
    },
    setSfx(on) {
      prefs.sfx = !!on;
      savePrefs();
      if (sfxBus) sfxBus.gain.value = on ? LEVEL.sfx : 0;
    },
    get running() { return !!ctx && ctx.state === 'running'; },
    get musicPlaying() { return !!music && !music.paused; },
  };
}
