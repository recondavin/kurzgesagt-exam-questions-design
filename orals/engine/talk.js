// The conversation panel: a sheet at the bottom of the screen for lines, replies, questions and their results,
// plus the top bar, the "tap to talk" marker and small cards (the start, notes between scenes, a day's summary).
// It knows nothing about the story or the language: the game gives it lines and a marker.
const $ = (sel, el = document) => el.querySelector(sel);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: nothing is kept */ } },
};

export function createTalk(root, opts = {}) {
  const prefsKey = (opts.key || 'oral') + '-prefs';
  let savedPrefs = {};
  try { savedPrefs = JSON.parse(store.get(prefsKey) || '{}'); } catch { /* old/corrupt settings */ }
  const prefs = Object.assign({ english: false }, savedPrefs);
  let level = 'OL', cleanup = () => {}, setupLevel = null;
  const savePrefs = () => store.set(prefsKey, JSON.stringify(prefs));
  // A short sound for a tap (tap, untap, next), if the game has sound.
  const sfx = name => opts.sfx && opts.sfx(name);

  root.insertAdjacentHTML('beforeend', `
    <header class="og-top">
      <a class="og-back" href="${esc(opts.back || 'index.html')}" aria-label="Leave the game">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <div class="og-bar" role="progressbar" aria-label="Questions answered" aria-valuemin="0"><span></span></div>
      <button class="og-level" type="button" aria-label="Switch Ordinary or Higher Level">OL</button>
      <button class="og-menu-btn" type="button" aria-label="Menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>
      </button>
    </header>
    <div class="og-place" aria-live="polite"></div>
    <div class="og-mark" aria-hidden="true"><span></span><span></span><span></span><b>E</b><i></i></div>
    <p class="og-hint" role="status"></p>
    <section class="og-sheet" aria-live="polite" hidden></section>
    <div class="og-card-wrap" hidden><section class="og-card" role="dialog" aria-modal="true"></section></div>
    <div class="og-menu" hidden></div>`);
  const top = $('.og-top', root), sheet = $('.og-sheet', root), hint = $('.og-hint', root), mark = $('.og-mark', root);
  const cardWrap = $('.og-card-wrap', root), card = $('.og-card', root), menu = $('.og-menu', root), place = $('.og-place', root);
  const bar = $('.og-bar span', root);

  // The world frames itself in the space the top bar and the sheet leave free.
  function insets() {
    const t = top.getBoundingClientRect().bottom;
    const b = sheet.hidden ? (hint.hidden ? 0 : window.innerHeight - hint.getBoundingClientRect().top) : window.innerHeight - sheet.getBoundingClientRect().top;
    opts.onInsets && opts.onInsets(t + 8, Math.max(0, b) + 8);
  }
  if (window.ResizeObserver) new ResizeObserver(insets).observe(sheet);
  window.addEventListener('resize', insets);
  // On a phone the keyboard covers the bottom of the screen: lift the sheet above it.
  if (window.visualViewport) {
    const vv = window.visualViewport, lift = () => {
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty('--kb', kb + 'px');
    };
    vv.addEventListener('resize', lift);
    vv.addEventListener('scroll', lift);
  }

  // A conversation can be left at any time (the ✕ or Esc): whatever is waiting for an answer is let go.
  let pending = null;
  const LEAVE = '<button class="og-leave" type="button" aria-label="Walk away"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg></button>';
  function showSheet(html) {
    cleanup(); cleanup = () => {};
    opts.stopVoice && opts.stopVoice();
    sheet.hidden = false;
    root.classList.add('has-sheet');
    sheet.innerHTML = (opts.onLeave ? LEAVE : '') + html;
    const leave = sheet.querySelector('.og-leave');
    leave && leave.addEventListener('click', e => { e.stopPropagation(); opts.onLeave(); });
    sheet.scrollTop = 0;
    requestAnimationFrame(insets);
  }
  function hideSheet() { cleanup(); cleanup = () => {}; opts.stopVoice && opts.stopVoice(); sheet.hidden = true; sheet.innerHTML = ''; root.classList.remove('has-sheet'); insets(); }

  function who(line) {
    if (!line.name) return '';
    return `<p class="og-who"><b>${esc(line.name)}</b>${line.role ? `<span>${esc(line.role)}</span>` : ''}</p>`;
  }
  function lineHtml(ga, en, cls = '') {
    return `<div class="og-say ${cls}"><p class="og-ga" lang="ga">${esc(ga)}</p>` +
      (en ? `<p class="og-en"${prefs.english ? '' : ' hidden'}>${esc(en)}</p>` : '') + '</div>';
  }
  function enToggle(en) {
    return en ? `<button class="og-link og-en-btn" type="button" aria-pressed="${prefs.english}">English</button>` : '';
  }
  function wireEnglish(scope) {
    const b = $('.og-en-btn', scope);
    if (!b) return;
    b.addEventListener('click', e => {
      e.stopPropagation();
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', on);
      scope.querySelectorAll('.og-en, .og-model-en').forEach(p => { p.hidden = !on; });
      requestAnimationFrame(insets);
    });
  }
  const voiceBtn = (text, model = false) => opts.voice ? `<button class="og-hear" type="button" data-say="${esc(text)}"${model ? ' data-model="true"' : ''} aria-label="Hear it"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 010 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>` : '';
  function wireVoice(scope) { if (opts.voice) scope.querySelectorAll('.og-hear').forEach(b => {
    if (opts.hasVoice && !opts.hasVoice(b.dataset.say, !!b.dataset.model)) b.title = 'Computer audio awaits the Azure voice build';
    b.addEventListener('click', e => { e.stopPropagation(); (b.dataset.model ? opts.modelVoice : opts.voice)?.(b.dataset.say); });
  }); }

  // ---------------------------------------------------------------- a line of dialogue
  function say(line) {
    return new Promise(done => {
      pending = done;
      showSheet(`${who(line)}${lineHtml(line.ga, line.en, line.player ? 'og-say--me' : '')}
        <div class="og-row">${voiceBtn(line.ga)}${enToggle(line.en)}<button class="og-btn og-btn--go" type="button">Continue</button></div>`);
      wireEnglish(sheet);
      wireVoice(sheet); opts.voice && !line.prompt && opts.voice(line.ga);
      const go = () => { sheet.removeEventListener('click', tap); sfx('next'); done(); };
      const tap = e => { if (!e.target.closest('.og-en-btn, .og-hear, .og-leave')) go(); };
      // Listen once the tap that brought this line up has finished: it would otherwise reach the sheet too and
      // skip the line straight away.
      setTimeout(() => sheet.addEventListener('click', tap), 0);
      $('.og-btn--go', sheet).focus({ preventScroll: true });
    });
  }

  // ---------------------------------------------------------------- replies to choose from
  function choose(line, options) {
    return new Promise(done => {
      pending = done;
      showSheet(`${line && line.ga ? who(line) + lineHtml(line.ga, line.en) : ''}
        <p class="og-ask-label">Your reply</p>
        <div class="og-choices">${options.map((o, i) => `<button class="og-choice" type="button" data-i="${i}"><span lang="ga">${esc(o.ga)}</span>${o.en ? `<small class="og-en"${prefs.english ? '' : ' hidden'}>${esc(o.en)}</small>` : ''}</button>`).join('')}</div>
        <div class="og-row">${line?.ga ? voiceBtn(line.ga) : ''}${enToggle(options.some(o => o.en) || (line && line.en))}</div>`);
      wireVoice(sheet);
      const b = $('.og-en-btn', sheet);
      b && b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on);
        sheet.querySelectorAll('.og-en').forEach(p => { p.hidden = !on; });
        requestAnimationFrame(insets);
      });
      sheet.querySelectorAll('.og-choice').forEach(c => c.addEventListener('click', async e => { e.stopPropagation(); sfx('tap'); sheet.querySelectorAll('.og-choice').forEach(b => { b.disabled = true; }); if (opts.voice) await opts.voice(options[+c.dataset.i].ga); done(+c.dataset.i); }));
    });
  }

  // ---------------------------------------------------------------- a question to answer
  // q: { id, en, model: {ga, en}, more?: {ga, en}, tiles? }. mode: 'tiles' | 'type'. marker.mark(id, text).
  function ask(line, q, mode, marker) {
    if (mode === 'say') return sayAnswer(line, q);
    return new Promise(done => {
      pending = done;
      let tries = 0, firstRight = null;
      const useTiles = mode === 'tiles' && q.tiles && q.tiles.length;
      // A task for the student ("Ask how much it is.") shows as an instruction; otherwise the question as it was said.
      const said = line.prompt ? `<p class="og-task">${esc(line.ga)}</p>` : who(line) + lineHtml(line.ga, line.en || q.en);
      showSheet(`${said}
        <div class="og-row">${voiceBtn(line.ga)}${mode === 'wording' && level === 'OL' ? '<small>Try the new wording.</small>' : ''}</div>
        <div class="og-answer">${useTiles ? `
          <div class="og-built" aria-label="Your answer"></div>
          <div class="og-bank" aria-label="Words"></div>` : `
          <textarea class="og-type" lang="ga" rows="2" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="Type your answer in Irish" aria-label="Your answer"></textarea>
          <div class="og-fadas" aria-label="Letters with a fada">${['á', 'é', 'í', 'ó', 'ú'].map(c => `<button type="button" data-c="${c}" tabindex="-1">${c}</button>`).join('')}</div>`}
        </div>
        ${mode === 'letters' ? `<p class="og-letter-hint">${esc(q.model.ga.split(/\s+/).map(w => w[0] + '…').join(' '))}</p>` : ''}
        <div class="og-row">${line.prompt ? '' : enToggle(line.en || q.en)}<button class="og-btn og-btn--check" type="button" disabled>Check</button></div>
        <div class="og-result" hidden></div>`);
      wireEnglish(sheet);
      wireVoice(sheet);
      opts.voice && !line.prompt && opts.voice(line.ga);
      if (level === 'HL' && ['type', 'wording'].includes(mode) && opts.hasVoice?.(line.ga)) {
        const question = $('.og-say', sheet); question.hidden = true;
        const reveal = el('button', 'og-link', 'Show the question'); reveal.type = 'button';
        question.after(reveal); reveal.onclick = () => { question.hidden = false; reveal.remove(); insets(); };
      }
      const check = $('.og-btn--check', sheet), result = $('.og-result', sheet), answer = $('.og-answer', sheet);
      let text = () => '';

      if (useTiles) {
        const built = $('.og-built', sheet), bank = $('.og-bank', sheet);
        const tiles = shuffle(q.tiles).map((w, i) => {
          const t = el('button', 'og-tile', esc(w));
          t.type = 'button';
          t.lang = 'ga';
          t.dataset.i = i;
          t._word = w;
          const slot = el('span', 'og-slot');
          slot.appendChild(t);
          bank.appendChild(slot);
          t._slot = slot;
          t.addEventListener('click', () => {
            if (!result.hidden) return;
            if (t.parentNode === built) { t._slot.appendChild(t); sfx('untap'); }
            else { built.appendChild(t); sfx('tap'); }
            check.disabled = !built.children.length;
            requestAnimationFrame(insets);
          });
          return t;
        });
        text = () => [...built.children].map(t => t._word).join(' ');
        // Each word keeps its place in the bank as a grey gap while it is in the answer.
        requestAnimationFrame(() => tiles.forEach(t => {
          const r = t.getBoundingClientRect();
          t._slot.style.width = r.width + 'px';
          t._slot.style.height = r.height + 'px';
        }));
      } else {
        const ta = $('.og-type', sheet);
        ta.addEventListener('input', () => { check.disabled = !ta.value.trim(); });
        ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!check.disabled) check.click(); } });
        sheet.querySelectorAll('.og-fadas button').forEach(b => {
          b.addEventListener('pointerdown', e => e.preventDefault());
          b.addEventListener('click', () => {
            const s = ta.selectionStart, e2 = ta.selectionEnd;
            ta.value = ta.value.slice(0, s) + b.dataset.c + ta.value.slice(e2);
            ta.selectionStart = ta.selectionEnd = s + 1;
            ta.focus();
            check.disabled = !ta.value.trim();
          });
        });
        text = () => ta.value;
        setTimeout(() => ta.focus({ preventScroll: true }), 300);
      }

      let uncertain = false;
      function finish(right) { done({ right, firstTry: firstRight === true && !uncertain, uncertain, tries, text: text() }); }

      check.addEventListener('click', () => {
        const said = text();
        const r = marker.mark(q.id, said);
        if (r.verdict === 'empty') return;
        tries++;
        if (['unsure', 'tense'].includes(r.verdict)) uncertain = true;
        if (r.verdict === 'mistake') opts.onMistakes?.(r.mistakes);
        if (r.verdict === 'right' && firstRight === null) firstRight = tries === 1;
        showResult(r, said);
      });

      function model(label, m) {
        if (!m) return '';
        return `<div class="og-model"><p class="og-model-label">${esc(label)}</p><p class="og-model-ga" lang="ga">${esc(m.ga)}${voiceBtn(m.ga, true)}</p><p class="og-model-en"${prefs.english ? '' : ' hidden'}>${esc(m.en)}</p></div>`;
      }
      // The student's answer with the corrected words marked.
      function fixedHtml(parts) {
        const text = parts.map(p => p.w).join(' ');
        return `<div class="og-model"><p class="og-model-label">Fixed</p><p class="og-model-ga" lang="ga"><span>${parts.map(p => (p.changed ? `<mark class="og-fix">${esc(p.w)}</mark>` : esc(p.w))).join(' ')}</span>${voiceBtn(text)}</p></div>`;
      }
      function tipsHtml(tips) {
        if (!tips || !tips.length) return '';
        const words = [...new Set(tips.map(t => t.word))];
        return `<p class="og-tip">Spelling: <b lang="ga">${words.map(esc).join(', ')}</b></p>`;
      }
      const same = (a, b) => a.toLowerCase().replace(/[.!?\s]+$/g, '') === b.toLowerCase().replace(/[.!?\s]+$/g, '');

      function showResult(r, said) {
        let kind, title, body = '', buttons;
        if (r.verdict === 'right') {
          kind = 'right'; title = tries === 1 ? 'Right!' : 'Right this time!';
          body = (r.note ? `<p class="og-why">${esc(r.note)}</p>` : '') + tipsHtml(r.tips) + (same(said, q.model.ga) ? model('Meaning', { ga: q.model.ga, en: q.model.en }) : model('Another way to say it', q.model)) + model('Say more (Higher Level)', q.more);
          buttons = (!useTiles && !q.noKeep ? '<button class="og-btn og-btn--ghost" type="button" data-act="keep">Keep this as my answer</button>' : '') + '<button class="og-btn og-btn--go" type="button" data-act="next">Continue</button>';
        } else if (r.verdict === 'mistake') {
          kind = 'wrong'; title = 'Nearly';
          body = r.mistakes.map(m => `<p class="og-why">${esc(m.why)}</p>`).join('') +
            (r.fixed ? fixedHtml(r.fixed) + (tries >= 2 ? model('An answer that works', q.model) : '') : model('Like this', q.model));
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else if (r.verdict === 'other') {
          kind = 'other'; title = 'That answers another question';
          body = `<p class="og-why">${esc(marker.questions[r.other].q.en)} ${line.prompt ? 'The task was' : esc(line.name || 'They') + ' asked'}: ${esc(q.en)}</p>` + (tries >= 2 ? model('An answer that works', q.model) : '');
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else if (r.verdict === 'english') {
          kind = 'other'; title = 'Answer in Irish';
          body = model('An answer that works', q.model);
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else if (r.verdict === 'digits') {
          kind = 'other'; title = 'Write the numbers in words';
          body = '<p class="og-why">In the oral you\'ll say them, so practise the words.</p>';
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else if (r.verdict === 'tense') {
          kind = 'unsure'; title = 'Check the tense';
          body = `<p class="og-why">This question asks about the ${esc(r.tense)}. Your answer may be valid; try that tense.</p>` + model('An answer that works', q.model);
          buttons = '<button class="og-btn og-btn--ghost" type="button" data-act="mine">Mine was right</button><button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else {
          kind = 'unsure'; title = 'I can\'t check that one';
          body = '<p class="og-why">It may well be right: I only know the answers I\'ve been taught. Here\'s one I\'m sure of.</p>' + model('An answer that works', q.model);
          buttons = '<button class="og-btn og-btn--ghost" type="button" data-act="mine">Mine was right</button><button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        }
        sheet.classList.add('is-marked');
        answer.classList.add('is-locked');
        check.parentNode.hidden = true;
        result.className = 'og-result og-result--' + kind;
        result.innerHTML = `<p class="og-result-title"><i aria-hidden="true"></i>${esc(title)}</p>${body}<div class="og-row og-row--end">${enToggle(q.model?.en)}${buttons}</div>`;
        result.hidden = false;
        wireVoice(result);
        wireEnglish(result);
        if (r.verdict === 'right') opts.modelVoice?.(q.model.ga);
        requestAnimationFrame(() => { insets(); result.scrollIntoView({ block: 'end', behavior: 'smooth' }); });
        opts.onMarked && opts.onMarked(kind);
        result.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', e => {
          e.stopPropagation();
          const act = b.dataset.act;
          sfx('next');
          if (act === 'keep') { opts.onKeep?.(q.id, said); b.textContent = 'Saved'; b.disabled = true; return; }
          if (act === 'next') finish(true);
          else if (act === 'mine') { uncertain = true; if (firstRight === null) firstRight = false; opts.onMine && opts.onMine(q.id, said); finish(true); }
          else {
            result.hidden = true;
            sheet.classList.remove('is-marked');
            answer.classList.remove('is-locked');
            check.parentNode.hidden = false;
            const ta = $('.og-type', sheet);
            if (ta) ta.focus();
            requestAnimationFrame(insets);
          }
        }));
        const first = result.querySelector('[data-act]');
        first && first.focus({ preventScroll: true });
      }
    });
  }

  // A recording never leaves this device. Dispose tracks and object URLs on every exit path.
  function sayAnswer(line, q) {
    return new Promise(done => {
      pending = done;
      showSheet(`${who(line)}${lineHtml(line.ga, line.en || q.en)}<div class="og-row">${voiceBtn(line.ga)}${enToggle(line.en || q.en)}</div>
        <p>Say your answer out loud${level === 'HL' ? ', adding a second sentence' : ''}.</p>
        <button type="button" class="og-btn og-record">Record my answer</button>
        <button type="button" class="og-link og-reveal">Say it without a microphone, then reveal the answer</button>
        <div class="og-recording"></div><div class="og-spoken-model" hidden></div>`);
      wireEnglish(sheet); wireVoice(sheet); opts.voice?.(line.ga);
      if (level === 'HL' && opts.hasVoice?.(line.ga)) {
        const question = $('.og-say', sheet); question.hidden = true;
        const reveal = el('button', 'og-link', 'Show the question'); question.after(reveal);
        reveal.onclick = () => { question.hidden = false; reveal.remove(); insets(); };
      }
      let stream, recorder, url, disposed = false;
      const record = $('.og-record', sheet), panel = $('.og-spoken-model', sheet), playback = $('.og-recording', sheet);
      const stopTracks = () => { stream?.getTracks().forEach(t => t.stop()); };
      cleanup = () => { disposed = true; if (recorder?.state === 'recording') recorder.stop(); stopTracks(); playback.querySelector('audio')?.pause(); opts.onPlayback?.(false); if (url) URL.revokeObjectURL(url); };
      function reveal() {
        panel.hidden = false;
        panel.innerHTML = `<p lang="ga">${esc(q.model.ga)}${voiceBtn(q.model.ga, true)}</p><p class="og-en"${prefs.english ? '' : ' hidden'}>${esc(q.model.en)}</p>
          <div class="og-row"><button type="button" class="og-btn" data-self="yes">I said it right</button><button type="button" class="og-btn og-btn--ghost" data-self="no">Not yet</button><button type="button" class="og-link" data-self="unsure">Can't check</button></div>`;
        wireVoice(panel); opts.modelVoice?.(q.model.ga);
        panel.querySelectorAll('[data-self]').forEach(b => b.onclick = () => { cleanup(); cleanup = () => {}; done({ right: b.dataset.self === 'yes', firstTry: b.dataset.self === 'yes', uncertain: b.dataset.self === 'unsure', text: '', tries: 1 }); });
        insets();
      }
      $('.og-reveal', sheet).onclick = () => { if (recorder?.state === 'recording') recorder.stop(); stopTracks(); reveal(); };
      record.onclick = async () => {
        if (recorder?.state === 'recording') { recorder.stop(); stopTracks(); record.disabled = true; return; }
        record.disabled = true;
        try {
          if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) throw new Error('No microphone');
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (disposed) { stopTracks(); return; }
          opts.stopVoice?.();
          recorder = new MediaRecorder(stream); const chunks = [];
          recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
          recorder.onstop = () => {
            stopTracks(); if (disposed) return;
            if (url) URL.revokeObjectURL(url);
            url = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType }));
            const audio = document.createElement('audio'); audio.controls = true; audio.src = url; audio.setAttribute('aria-label', 'Your recording');
            audio.onplay = () => opts.onPlayback?.(true); audio.onpause = audio.onended = () => opts.onPlayback?.(false);
            playback.replaceChildren(audio); reveal();
          };
          recorder.start(); record.textContent = 'Stop recording'; record.disabled = false;
        } catch {
          stopTracks(); if (disposed) return;
          record.textContent = 'Microphone unavailable — say it out loud'; reveal();
        }
      };
    });
  }

  async function drill(bank) {
    for (let i = 0; i < bank.items.length; i++) {
      const item = bank.items[i];
      const order = shuffle([item.right, item.wrong]);
      const chosen = await choose({ name: 'Máirín', ga: 'Déanaimis cleachtadh beag.', en: `Choose the correct form (${i + 1}/4).` }, order.map(ga => ({ ga })));
      if (chosen === null) return false;
      const result = await say({ name: 'Máirín', ga: item.right, en: `${order[chosen] === item.right ? 'Right. ' : 'Use this form. '}${item.reason}` });
      if (result === null) return false;
    }
    const normalize = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/[.!?]/g, '').toLowerCase().trim();
    const result = await ask({ name: 'Máirín', ga: 'Scríobh an leagan ceart.', en: `Type the correct form: ${bank.items[0].wrong}` },
      { id: 'drill', noKeep: true, en: bank.reason, model: { ga: bank.typed, en: bank.reason } }, 'type',
      { mark: (_id, text) => ({ verdict: normalize(text) === normalize(bank.typed) ? 'right' : 'unsure' }) });
    return !!result && !result.uncertain;
  }

  // ---------------------------------------------------------------- cards
  function showCard(html, cls = '') {
    card.className = 'og-card ' + cls;
    card.innerHTML = html;
    cardWrap.hidden = false;
  }
  function hideCard() { cardWrap.hidden = true; card.innerHTML = ''; }

  function note(n) {
    return new Promise(done => {
      showCard(`${n.kicker ? `<p class="og-kicker">${esc(n.kicker)}</p>` : ''}<h2>${esc(n.title)}</h2>${n.text ? `<p>${esc(n.text)}</p>` : ''}
        <button class="og-btn og-btn--go og-btn--wide" type="button">${esc(n.button || 'Continue')}</button>`);
      const b = $('.og-btn', card);
      b.focus({ preventScroll: true });
      b.addEventListener('click', () => { hideCard(); done(); });
    });
  }

  // Multi-page personal profile. Skip applies defaults to every unanswered field.
  function setup(s) {
    return new Promise(done => {
      const values = { ...s.defaults, ...(s.profile || {}) };
      setupLevel = value => { values.level = value; const select = $('select[name=level]', card); if (select) select.value = value; };
      const pages = s.pages || [];
      let page = 0;
      function show() {
        const fields = pages[page] || [];
        showCard(`<p class="og-kicker">About you · ${page + 1}/${pages.length}</p><h2>${esc(s.title)}</h2>
          <form class="og-profile-form">${fields.map(f => `<label class="og-field"><span>${esc(f.label)}</span>${f.options
            ? `<select name="${esc(f.key)}">${f.options.map(o => `<option value="${esc(o.value ?? o)}"${String(o.value ?? o) === String(values[f.key]) ? ' selected' : ''}>${esc(o.label ?? o)}</option>`).join('')}</select>`
            : `<input name="${esc(f.key)}" type="${f.type || 'text'}" maxlength="40" value="${esc(f.type === 'date' ? '2000-' + values[f.key] : values[f.key] || '')}">`}</label>`).join('')}
          <div class="og-row">${page ? '<button class="og-btn og-btn--ghost" type="button" data-back>Back</button>' : ''}<button class="og-btn" type="submit">${page === pages.length - 1 ? 'Start' : 'Next'}</button></div>
          <button class="og-link" type="button" data-skip>Skip — use defaults</button></form>`, 'og-card--setup');
        const form = $('form', card);
        const collect = () => { for (const f of fields) { const v = form.elements.namedItem(f.key).value; if (v) values[f.key] = f.type === 'date' ? v.slice(5) : v; } };
        form.onsubmit = e => { e.preventDefault(); sfx('next'); collect(); if (++page >= pages.length) { setupLevel = null; hideCard(); done(values); } else show(); };
        $('[data-skip]', card).onclick = () => { sfx('next'); collect(); setupLevel = null; hideCard(); done(values); };
        const back = $('[data-back]', card); if (back) back.onclick = () => { sfx('tap'); collect(); page--; show(); };
      }
      show();
    });
  }

  function summary(s) {
    return new Promise(done => {
      showCard(`<p class="og-kicker">${esc(s.kicker || '')}</p><h2>${esc(s.title)}</h2>
        <p class="og-score"><b>${s.first}</b> of ${s.total} right first time</p>
        <ul class="og-list">${s.items.map(i => `<li class="${i.first ? 'is-first' : 'is-retry'}"><i aria-hidden="true"></i><span lang="ga">${esc(i.ga)}</span><small>${esc(i.en)}</small></li>`).join('')}</ul>
        <button class="og-btn og-btn--go og-btn--wide" type="button">${esc(s.button || 'Continue')}</button>`, 'og-card--summary');
      $('.og-btn', card).addEventListener('click', () => { hideCard(); done(); });
    });
  }

  // ---------------------------------------------------------------- menu
  // Items: { label, run } a button, { toggle, on, set(on) } a switch, { small, href? } a line of small print.
  const menuBtn = $('.og-menu-btn', root);
  const levelBtn = $('.og-level', root);
  levelBtn.addEventListener('click', () => { sfx('tap'); opts.onLevel?.(level === 'OL' ? 'HL' : 'OL'); });
  function openMenu(items) {
    items = [{ toggle: 'Always show English', on: prefs.english, set: on => { prefs.english = on; savePrefs(); sheet.querySelectorAll('.og-en, .og-model-en').forEach(p => { p.hidden = !on; }); } }].concat(items);
    menu.innerHTML = `<div class="og-menu-box" role="menu">${items.map((it, i) =>
      it.toggle ? `<label class="og-switch"><input type="checkbox" data-t="${i}" ${it.on ? 'checked' : ''}><span>${esc(it.toggle)}</span></label>` :
      it.small ? `<p class="og-menu-small">${it.href ? `<a href="${esc(it.href)}" target="_blank" rel="noopener">${esc(it.small)}</a>` : esc(it.small)}</p>` :
      `<button type="button" role="menuitem" data-i="${i}">${esc(it.label)}</button>`).join('')}
    </div>`;
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    menu.querySelectorAll('[data-t]').forEach(b => b.addEventListener('change', e => items[+b.dataset.t].set(e.target.checked)));
    menu.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { closeMenu(); items[+b.dataset.i].run(); }));
  }
  function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', e => { if (e.target === menu) closeMenu(); });

  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden && opts.onLeave) opts.onLeave(); });

  return {
    say, choose, ask, note, setup, summary, hideSheet, drill,
    get settingUp() { return !!setupLevel; },
    setLevel(value) { level = value; setupLevel?.(value); levelBtn.textContent = value; prefs.english = value === 'OL'; sheet.querySelectorAll('.og-en, .og-model-en').forEach(p => { p.hidden = !prefs.english; }); },
    // Lets go of the line, reply or question on screen (its promise resolves with null) and hides the sheet.
    cancel() { const p = pending; pending = null; hideSheet(); p && p(null); },
    // A hint, with an optional second line for the keyboard.
    hint(text, keys) {
      hint.innerHTML = text ? esc(text) + (keys ? `<small>${esc(keys)}</small>` : '') : '';
      hint.hidden = !text;
      insets();
    },
    place(text) { place.textContent = text || ''; place.hidden = !text; },
    progress(done, total) { bar.style.width = (total ? Math.round(done / total * 100) : 0) + '%'; bar.parentNode.setAttribute('aria-valuenow', done); bar.parentNode.setAttribute('aria-valuemax', total); },
    // The bouncing dots over the person you can talk to (x, y in CSS pixels, or null to hide).
    // edge: an angle, when the person is off screen and the marker waits at the edge pointing their way.
    marker(pos, key, edge) {
      if (!pos) { mark.hidden = true; return; }
      mark.hidden = false;
      mark.classList.toggle('og-mark--key', !!key);
      mark.classList.toggle('og-mark--edge', edge !== undefined);
      if (edge !== undefined) mark.style.setProperty('--a', edge + 'rad');
      mark.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)`;
    },
    onMenu(items) { menuBtn.addEventListener('click', () => (menu.hidden ? openMenu(items()) : closeMenu())); },
    insets,
  };
}
