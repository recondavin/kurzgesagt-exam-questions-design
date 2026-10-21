// Runs a content pack: the world, the talk panel, the marker and the Ink story that drives them.
// Story lines are written "who: text" (who is a person's id; no prefix is narration) with Ink tags:
//   #en:...   the English meaning (else the pack's glossary has it)      #ask:id   a question to answer
// Lines that start with @ are stage directions for the engine:
//   @place text                 the place name under the top bar
//   @roam id ^ hint             free walking (tap the floor, or W A S D) until the player taps that person or
//                               presses E beside them; the player then walks up beside them
//   @do id walk x z, id sit seat, id stand or id face other     (join several with & to do them together)
//   @focus id id, @focus room   what the camera frames
//   @mode tiles, @mode type     how questions are answered
//   @round name                 starts counting answers for a summary;  @summary kicker ^ title
//   @note kicker ^ title ^ text ^ button                             @end kicker ^ title ^ text
// Progress (the Ink state and where everyone is) is saved after each question and at each @roam.
import { createWorld } from './world.js';
import { createTalk } from './talk.js';
import { createMarker } from './marker.js';

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } },
};

export function startGame(pack) {
  const root = document.querySelector('.og');
  const world = createWorld(root.querySelector('.og-world'), pack);
  const talk = createTalk(root, {
    key: pack.key, back: pack.back, voice: pack.voice || null,
    onInsets: (t, b) => world.setInsets(t, b),
    // "Mine was right": kept on this device so the accepted answers can be widened later.
    onMine: (id, text) => { const l = store.get(pack.key + '-mine') || []; l.push({ id, text, at: Date.now() }); store.set(pack.key + '-mine', l.slice(-200)); },
  });
  const marker = createMarker(pack.lang, pack.questions);
  const qById = Object.fromEntries(pack.questions.map(q => [q.id, q]));
  const story = new window.inkjs.Story(pack.story);
  const saveKey = pack.key + '-save', profileKey = pack.key + '-profile';
  let profile = store.get(profileKey);
  let mode = 'tiles', round = null, roamId = null, lastLine = null, focusIds = [], total = pack.questions.length;
  const progress = { done: new Set() };

  // The dots over the person to talk to follow them on screen.
  // With the keyboard, the dots become an E key once the player is close enough to talk.
  world.onFrame = () => {
    if (!roamId) return talk.marker(null);
    const p = world.people[roamId];
    talk.marker(world.screenOf(p, 1.5 * p.k), world.usingKeys && world.nearest() === p);
  };
  // Computers get the keys in the hint (and so does anyone who presses one).
  const fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let hintText = '';
  const KEY_HINT = 'W A S D or the arrow keys to walk · E to talk';
  const showHint = text => { hintText = text || ''; talk.hint(hintText, hintText && (fine || world.usingKeys) ? KEY_HINT : ''); };
  world.on('keys', () => { if (hintText) showHint(hintText); });

  // ---------------------------------------------------------------- save and load
  function snapshot() {
    return Object.fromEntries(Object.entries(world.people).map(([id, p]) => [id, { x: p.root.position.x, z: p.root.position.z, yaw: p.yaw, seat: p.state === 'sit' ? p.seatId : null }]));
  }
  function save(ink) {
    store.set(saveKey, { ink: ink || story.state.ToJson(), people: snapshot(), mode, round, focus: focusIds, place: placeText, done: [...progress.done] });
  }
  function load() {
    const s = store.get(saveKey);
    if (!s) return false;
    try { story.state.LoadJson(s.ink); } catch (e) { store.del(saveKey); return false; }
    for (const [id, v] of Object.entries(s.people || {})) world.place(id, v);
    mode = s.mode || 'tiles';
    round = s.round || null;
    (s.done || []).forEach(d => progress.done.add(d));
    if (s.place) setPlace(s.place);
    setFocus(s.focus || []);
    return true;
  }
  function setFocus(ids) { focusIds = ids; world.focus(ids.map(i => world.people[i]).filter(Boolean)); }
  let placeText = '';
  function setPlace(t) { placeText = t; talk.place(t); }

  // ---------------------------------------------------------------- lines
  function parse(text, tags) {
    const m = /^([a-z0-9_-]+):\s*(.*)$/i.exec(text);
    const id = m && world.people[m[1]] ? m[1] : null;
    const ga = id ? m[2] : text;
    const t = {};
    for (const raw of tags || []) {
      const i = raw.indexOf(':');
      const k = (i < 0 ? raw : raw.slice(0, i)).trim(), v = i < 0 ? true : raw.slice(i + 1).trim();
      t[k] = v;
    }
    const person = id && pack.people[id];
    const en = t.en || (pack.english && pack.english[ga]) || '';
    return { id, ga, en, tags: t, name: person ? (id === 'player' ? (profile && profile.name) || person.name : person.name) : '', role: person && person.role, player: id === 'player' };
  }

  function speaking(id, on) {
    for (const p of Object.values(world.people)) p.talking = false;
    if (id && on) world.people[id].talking = true;
  }

  // Fills a question's word tiles with the student's own details.
  function tilesFor(q) {
    if (!q.tiles) return null;
    const fill = pack.fillTiles || (t => t);
    return [].concat(...q.tiles.map(w => fill(w, profile || {})));
  }

  async function askLine(line) {
    const q = qById[line.tags.ask];
    if (!q) { console.warn('No question', line.tags.ask); return; }
    speaking(line.id, true);
    setTimeout(() => speaking(line.id, false), 1600);
    // The model answers can name the student ({name}, {county}...): the pack fills them in.
    const fill = pack.fill ? t => pack.fill(t, profile || {}) : t => t;
    const filled = m => m && { ga: fill(m.ga), en: fill(m.en) };
    const qq = Object.assign({}, q, { tiles: tilesFor(q), model: filled(q.model), more: filled(q.more) });
    const r = await talk.ask(line, qq, mode, marker);
    speaking(null);
    story.variablesState['first_try'] = r.firstTry;
    progress.done.add(mode + ':' + q.id);
    if (round) round.items.push({ id: q.id, first: r.firstTry });
    talk.progress(round ? round.items.length : 0, round ? round.size : total);
    save();
  }

  // ---------------------------------------------------------------- stage directions
  function act(cmd) {
    const [id, verb, ...a] = cmd.trim().split(/\s+/);
    const p = world.people[id];
    if (!p) return Promise.resolve();
    return new Promise(done => {
      if (verb === 'walk') world.walkTo(p, +a[0], +a[1], done);
      else if (verb === 'sit') world.sit(p, a[0], done);
      else if (verb === 'stand') { world.standUp(p); done(); }
      else if (verb === 'face') { const o = world.people[a[0]]; o && world.face(p, o.root.position.x, o.root.position.z); world.later(0.3, done); }
      else done();
    });
  }

  // Saved with the story as it was before this line, so a reload walks round again.
  function roam(id, hint, before) {
    return new Promise(done => {
      roamId = id;
      world.setRoam(true);
      setFocus([]);
      talk.hideSheet();
      showHint(hint);
      save(before);
      world.on('talk', who => {
        if (who !== id) return;
        world.setRoam(false);
        world.on('talk', null);
        roamId = null;
        showHint('');
        world.approach(world.player, world.people[id], done);
      });
    });
  }

  async function direction(text, before) {
    const sp = text.indexOf(' ');
    const cmd = sp < 0 ? text.slice(1) : text.slice(1, sp), arg = sp < 0 ? '' : text.slice(sp + 1).trim();
    const parts = arg.split('^').map(s => s.trim());
    if (cmd === 'place') setPlace(arg);
    else if (cmd === 'mode') mode = arg === 'type' ? 'type' : 'tiles';
    else if (cmd === 'do') await Promise.all(arg.split('&').map(act));
    else if (cmd === 'focus') setFocus(arg === 'room' ? [] : arg.split(/\s+/));
    else if (cmd === 'roam') await roam(parts[0], parts[1], before);
    else if (cmd === 'round') { round = { name: arg, items: [], size: total }; talk.progress(0, total); }
    else if (cmd === 'note') { talk.hideSheet(); await talk.note({ kicker: parts[0], title: parts[1], text: parts[2], button: parts[3] }); }
    else if (cmd === 'summary' && round) {
      talk.hideSheet();
      const items = round.items.map(i => ({ first: i.first, ga: qById[i.id].ask[0], en: qById[i.id].en }));
      await talk.summary({ kicker: parts[0], title: parts[1], first: items.filter(i => i.first).length, total: items.length, items });
      round = null;
    } else if (cmd === 'end') {
      talk.hideSheet();
      store.del(saveKey);
      await talk.note({ kicker: parts[0], title: parts[1], text: parts[2], button: 'Play again' });
      location.reload();
    }
  }

  // ---------------------------------------------------------------- the story loop
  async function run() {
    for (;;) {
      if (story.canContinue) {
        const before = story.state.ToJson();
        const text = story.Continue().trim();
        if (!text) continue;
        if (text[0] === '@') { await direction(text, before); continue; }
        const line = parse(text, story.currentTags);
        lastLine = line;
        if (line.tags.ask) { await askLine(line); continue; }
        speaking(line.id, true);
        await talk.say(line);
        speaking(null);
      } else if (story.currentChoices.length) {
        const choices = story.currentChoices.map(c => {
          const tag = (c.tags || []).find(t => t.startsWith('en:'));
          return { ga: c.text, en: tag ? tag.slice(3).trim() : (pack.english && pack.english[c.text]) || '' };
        });
        const i = await talk.choose(lastLine, choices);
        story.ChooseChoiceIndex(i);
        speaking('player', true);
        world.later(1.2, () => speaking(null));
      } else break;
    }
  }

  talk.onMenu(() => [
    { label: 'Change my name or county', run: async () => { profile = await talk.setup(setupText()); store.set(profileKey, profile); } },
    { label: 'Start again', run: () => { store.del(saveKey); location.reload(); } },
  ]);
  function setupText() { return Object.assign({ profile, counties: pack.counties }, pack.setup); }

  (async () => {
    if (!profile) { profile = await talk.setup(setupText()); store.set(profileKey, profile); }
    if (!load()) story.ChoosePathString(pack.start || 'start');
    talk.progress(round ? round.items.length : 0, total);
    run();
  })();

  return { world, talk, marker, story };
}
