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
  const prefs = Object.assign({ english: false }, JSON.parse(store.get(prefsKey) || '{}'));
  const savePrefs = () => store.set(prefsKey, JSON.stringify(prefs));

  root.insertAdjacentHTML('beforeend', `
    <header class="og-top">
      <a class="og-back" href="${esc(opts.back || 'index.html')}" aria-label="Leave the game">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </a>
      <div class="og-bar" role="progressbar" aria-label="Questions answered" aria-valuemin="0"><span></span></div>
      <button class="og-menu-btn" type="button" aria-label="Menu" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2.2"/><circle cx="12" cy="12" r="2.2"/><circle cx="19" cy="12" r="2.2"/></svg>
      </button>
    </header>
    <div class="og-place" aria-live="polite"></div>
    <div class="og-mark" aria-hidden="true"><span></span><span></span><span></span><b>E</b></div>
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
    sheet.hidden = false;
    root.classList.add('has-sheet');
    sheet.innerHTML = (opts.onLeave ? LEAVE : '') + html;
    const leave = sheet.querySelector('.og-leave');
    leave && leave.addEventListener('click', e => { e.stopPropagation(); opts.onLeave(); });
    sheet.scrollTop = 0;
    requestAnimationFrame(insets);
  }
  function hideSheet() { sheet.hidden = true; sheet.innerHTML = ''; root.classList.remove('has-sheet'); insets(); }

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
      scope.querySelectorAll('.og-say .og-en').forEach(p => { p.hidden = !on; });
      requestAnimationFrame(insets);
    });
  }
  const voiceBtn = text => opts.voice ? `<button class="og-hear" type="button" data-say="${esc(text)}" aria-label="Hear it"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 010 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>` : '';
  function wireVoice(scope) { if (opts.voice) scope.querySelectorAll('.og-hear').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); opts.voice(b.dataset.say); })); }

  // ---------------------------------------------------------------- a line of dialogue
  function say(line) {
    return new Promise(done => {
      pending = done;
      showSheet(`${who(line)}${lineHtml(line.ga, line.en, line.player ? 'og-say--me' : '')}
        <div class="og-row">${enToggle(line.en)}<button class="og-btn og-btn--go" type="button">Continue</button></div>`);
      wireEnglish(sheet);
      const go = () => { sheet.removeEventListener('click', tap); done(); };
      const tap = e => { if (!e.target.closest('.og-en-btn')) go(); };
      sheet.addEventListener('click', tap);
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
        <div class="og-row">${enToggle(options.some(o => o.en) || (line && line.en))}</div>`);
      const b = $('.og-en-btn', sheet);
      b && b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on);
        sheet.querySelectorAll('.og-en').forEach(p => { p.hidden = !on; });
        requestAnimationFrame(insets);
      });
      sheet.querySelectorAll('.og-choice').forEach(c => c.addEventListener('click', () => done(+c.dataset.i)));
    });
  }

  // ---------------------------------------------------------------- a question to answer
  // q: { id, en, model: {ga, en}, more?: {ga, en}, tiles? }. mode: 'tiles' | 'type'. marker.mark(id, text).
  function ask(line, q, mode, marker) {
    return new Promise(done => {
      pending = done;
      let tries = 0, firstRight = null;
      const useTiles = mode === 'tiles' && q.tiles && q.tiles.length;
      showSheet(`${who(line)}${lineHtml(line.ga, line.en || q.en)}
        <div class="og-answer">${useTiles ? `
          <div class="og-built" aria-label="Your answer"></div>
          <div class="og-bank" aria-label="Words"></div>` : `
          <textarea class="og-type" lang="ga" rows="2" autocomplete="off" autocorrect="off" autocapitalize="sentences" spellcheck="false" placeholder="Type your answer in Irish" aria-label="Your answer"></textarea>
          <div class="og-fadas" aria-label="Letters with a fada">${['á', 'é', 'í', 'ó', 'ú'].map(c => `<button type="button" data-c="${c}" tabindex="-1">${c}</button>`).join('')}</div>`}
        </div>
        <div class="og-row">${enToggle(line.en || q.en)}<button class="og-btn og-btn--check" type="button" disabled>Check</button></div>
        <div class="og-result" hidden></div>`);
      wireEnglish(sheet);
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
            if (t.parentNode === built) { t._slot.appendChild(t); }
            else built.appendChild(t);
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

      function finish(right) { done({ right, firstTry: firstRight === true, tries, text: text() }); }

      check.addEventListener('click', () => {
        const said = text();
        const r = marker.mark(q.id, said);
        if (r.verdict === 'empty') return;
        tries++;
        if (r.verdict === 'right' && firstRight === null) firstRight = tries === 1;
        showResult(r, said);
      });

      function model(label, m) {
        if (!m) return '';
        return `<div class="og-model"><p class="og-model-label">${esc(label)}</p><p class="og-model-ga" lang="ga">${esc(m.ga)}${voiceBtn(m.ga)}</p><p class="og-model-en">${esc(m.en)}</p></div>`;
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
          buttons = '<button class="og-btn og-btn--go" type="button" data-act="next">Continue</button>';
        } else if (r.verdict === 'mistake') {
          kind = 'wrong'; title = 'Nearly';
          body = r.mistakes.map(m => `<p class="og-why">${esc(m.why)}</p>`).join('') +
            (r.fixed ? fixedHtml(r.fixed) + (tries >= 2 ? model('An answer that works', q.model) : '') : model('Like this', q.model));
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else if (r.verdict === 'other') {
          kind = 'other'; title = 'That answers another question';
          body = `<p class="og-why">${esc(marker.questions[r.other].q.en)} Máirín asked: ${esc(q.en)}</p>` + (tries >= 2 ? model('An answer that works', q.model) : '');
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else if (r.verdict === 'english') {
          kind = 'other'; title = 'Answer in Irish';
          body = model('An answer that works', q.model);
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else if (r.verdict === 'digits') {
          kind = 'other'; title = 'Write the numbers in words';
          body = '<p class="og-why">In the oral you\'ll say them, so practise the words.</p>';
          buttons = '<button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        } else {
          kind = 'unsure'; title = 'I can\'t check that one';
          body = '<p class="og-why">It may well be right: I only know the answers I\'ve been taught. Here\'s one I\'m sure of.</p>' + model('An answer that works', q.model);
          buttons = '<button class="og-btn og-btn--ghost" type="button" data-act="mine">Mine was right</button><button class="og-btn og-btn--retry" type="button" data-act="retry">Try again</button>';
        }
        sheet.classList.add('is-marked');
        answer.classList.add('is-locked');
        check.parentNode.hidden = true;
        result.className = 'og-result og-result--' + kind;
        result.innerHTML = `<p class="og-result-title"><i aria-hidden="true"></i>${esc(title)}</p>${body}<div class="og-row og-row--end">${buttons}</div>`;
        result.hidden = false;
        wireVoice(result);
        requestAnimationFrame(() => { insets(); result.scrollIntoView({ block: 'end', behavior: 'smooth' }); });
        opts.onMarked && opts.onMarked(kind);
        result.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
          const act = b.dataset.act;
          if (act === 'next') finish(true);
          else if (act === 'mine') { if (firstRight === null) firstRight = false; opts.onMine && opts.onMine(q.id, said); finish(true); }
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

  // The first screen: your name and county (used in the word tiles), then go.
  function setup(s) {
    return new Promise(done => {
      const p = s.profile || {};
      showCard(`<p class="og-kicker">${esc(s.kicker || '')}</p><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>
        <label class="og-field"><span>Your first name</span><input class="og-name" type="text" autocomplete="given-name" maxlength="24" value="${esc(p.name || '')}"></label>
        <label class="og-field"><span>Your county</span><select class="og-county"><option value="">Choose your county</option>${s.counties.map(c => `<option value="${esc(c.id)}"${c.id === p.county ? ' selected' : ''}>${esc(c.en)}</option>`).join('')}</select></label>
        <button class="og-btn og-btn--go og-btn--wide" type="button">${esc(s.button || 'Start')}</button>`, 'og-card--setup');
      const name = $('.og-name', card), county = $('.og-county', card), go = $('.og-btn', card);
      const ok = () => { go.disabled = !name.value.trim() || !county.value; };
      name.addEventListener('input', ok);
      county.addEventListener('change', ok);
      ok();
      go.addEventListener('click', () => {
        const v = name.value.trim().replace(/\s+/g, ' ');
        hideCard();
        done({ name: v.charAt(0).toUpperCase() + v.slice(1), county: county.value });
      });
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
  const menuBtn = $('.og-menu-btn', root);
  function openMenu(items) {
    menu.innerHTML = `<div class="og-menu-box" role="menu">
      <label class="og-switch"><input type="checkbox" ${prefs.english ? 'checked' : ''}><span>Always show English</span></label>
      ${items.map((it, i) => `<button type="button" role="menuitem" data-i="${i}">${esc(it.label)}</button>`).join('')}
    </div>`;
    menu.hidden = false;
    menuBtn.setAttribute('aria-expanded', 'true');
    $('input', menu).addEventListener('change', e => { prefs.english = e.target.checked; savePrefs(); sheet.querySelectorAll('.og-en').forEach(p => { p.hidden = !prefs.english; }); });
    menu.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => { closeMenu(); items[+b.dataset.i].run(); }));
  }
  function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', e => { if (e.target === menu) closeMenu(); });

  window.addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden && opts.onLeave) opts.onLeave(); });

  return {
    say, choose, ask, note, setup, summary, hideSheet,
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
    marker(pos, key) {
      if (!pos) { mark.hidden = true; return; }
      mark.hidden = false;
      mark.classList.toggle('og-mark--key', !!key);
      mark.style.transform = `translate(${Math.round(pos.x)}px, ${Math.round(pos.y)}px)`;
    },
    onMenu(items) { menuBtn.addEventListener('click', () => (menu.hidden ? openMenu(items()) : closeMenu())); },
    insets,
  };
}
