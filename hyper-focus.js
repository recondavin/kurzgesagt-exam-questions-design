(function () {
  var steps = [
    {
      id: 'question-3c', target: 'question-3c', kicker: '1 · Plan the marks', title: '15 explained points',
      summary: 'Split your answer across both parts.',
      visual: '<div class="hf-split"><div class="hf-topic hf-topic--predict"><span class="hf-topic__label">Predict earthquakes</span><strong>7</strong><span>points</span></div><div class="hf-topic hf-topic--reduce"><span class="hf-topic__label">Reduce the effects</span><strong>8</strong><span>points</span></div></div>',
      prose: 'Share them across both parts: predicting earthquakes and reducing their effects. Aim for about seven or eight on each side, with one idea in each short paragraph.',
      points: []
    },
    {
      id: 'question-3c-srp', target: 'question-3c', kicker: '2 · Build an SRP', title: 'Make every SRP count',
      summary: 'An SRP is one explained point.',
      visual: '<div class="hf-srp-builder" aria-label="An SRP being assembled"><div class="hf-srp-piece"><span>POINT</span><strong>Base isolation</strong></div><i>+</i><div class="hf-srp-piece"><span>EXPLAIN</span><strong>absorbs movement</strong></div><i>+</i><div class="hf-srp-piece"><span>LINK</span><strong>less damage</strong></div></div><p class="hf-srp-result"><span>FULL SRP</span><strong>Base isolation absorbs ground movement, reducing structural damage.</strong></p>',
      prose: 'State the idea, show how or why it matters, then link it back to earthquakes. Naming a method on its own is not enough.',
      points: []
    },
    {
      id: 'question-3c-hints', target: 'question-3c', kicker: '3 · Small prompts', title: 'Find your own examples',
      summary: 'Use the question to spark ideas.',
      visual: '<div class="hf-idea-deck"><button type="button" class="hf-idea is-active" data-idea="monitor"><svg viewBox="0 0 72 50" aria-hidden="true"><path class="hf-mini-trace" d="M3 27H17L23 20L29 34L35 8L42 43L48 19L54 27H69" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" pathLength="100"/></svg><span>MONITOR</span><strong>Seismometers and GPS</strong></button><button type="button" class="hf-idea" data-idea="build"><svg viewBox="0 0 72 50" aria-hidden="true"><path d="M18 39V11H54V39M25 18H31M41 18H47M25 27H31M41 27H47M12 40H60" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg><span>BUILD SAFELY</span><strong>Flexible, reinforced structures</strong></button><button type="button" class="hf-idea" data-idea="prepare"><svg viewBox="0 0 72 50" aria-hidden="true"><path d="M22 15H50V43H22ZM28 9H44M30 23H42M30 31H42" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M16 19L11 24L16 29M56 19L61 24L56 29" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg><span>PREPARE</span><strong>Drills and emergency plans</strong></button></div><p class="hf-idea-answer"><strong data-idea-title>Monitor changing ground movement.</strong></p>',
      prose: 'Think about warning signs before the shaking, safer buildings and planning, and what communities can prepare for during and after an earthquake.',
      points: []
    },
    {
      id: 'question-3b', target: 'question-3b', kicker: '1 · Plan the marks', title: '15 explained points',
      summary: 'Tell the formation story in order.',
      visual: '<div class="hf-rock-cycle"><div><svg viewBox="0 0 90 64" aria-hidden="true"><circle cx="22" cy="18" r="7"/><circle cx="45" cy="13" r="6"/><circle cx="68" cy="20" r="8"/><path d="M8 38Q22 31 36 38T64 38T84 38V57H8Z"/></svg><strong>1 · Sediment</strong></div><i>→</i><div><svg viewBox="0 0 90 64" aria-hidden="true"><path d="M9 17H81M9 30H81M9 43H81M9 56H81"/><path class="hf-compress-arrow" d="M45 5V15M40 11L45 16L50 11"/></svg><strong>2 · Compact</strong></div><i>→</i><div><svg viewBox="0 0 90 64" aria-hidden="true"><rect x="9" y="12" width="72" height="44" rx="4"/><path d="M9 26H81M9 41H81M29 12V26M58 26V41M37 41V56"/></svg><strong>3 · Rock</strong></div></div>',
      prose: '', points: []
    },
    {
      id: 'question-3b-srp', target: 'question-3b', kicker: '2 · Build an SRP', title: 'Turn a stage into marks',
      summary: 'Add the process and its result.',
      visual: '<div class="hf-srp-builder hf-rock-builder" aria-label="A sedimentary rock SRP being assembled"><div class="hf-srp-piece"><span>STAGE</span><strong>Sediment builds up</strong></div><i>+</i><div class="hf-srp-piece"><span>PROCESS</span><strong>layers compact</strong></div><i>+</i><div class="hf-srp-piece"><span>RESULT</span><strong>grains cement</strong></div></div><p class="hf-srp-result"><span>FULL SRP</span><strong>As layers build up, pressure compacts the sediment and minerals cement the grains into rock.</strong></p>',
      prose: '', points: []
    },
    {
      id: 'question-3b-explore', target: 'question-3b', kicker: '3 · Explore examples', title: 'Choose a rock example',
      summary: 'Connect formation to a real Irish landscape.',
      visual: '<div class="hf-idea-deck hf-rock-deck"><button type="button" class="hf-idea is-active" data-rock="limestone"><svg viewBox="0 0 72 50" aria-hidden="true"><path d="M8 38L20 17L29 27L40 10L63 38Z"/><path d="M15 38H57M23 29H49"/></svg><span>LIMESTONE</span><strong>The Burren</strong></button><button type="button" class="hf-idea" data-rock="sandstone"><svg viewBox="0 0 72 50" aria-hidden="true"><path d="M8 13H64V39H8Z M8 22H64M8 31H64M25 13V22M48 22V31M31 31V39"/></svg><span>SANDSTONE</span><strong>MacGillycuddy’s Reeks</strong></button><button type="button" class="hf-idea" data-rock="shale"><svg viewBox="0 0 72 50" aria-hidden="true"><path d="M9 15H63M14 23H58M9 31H63M16 39H56"/></svg><span>SHALE</span><strong>County Clare</strong></button></div><p class="hf-idea-answer"><strong data-rock-title>Limestone forms from calcium-rich remains.</strong></p>',
      prose: '', points: []
    }
  ];
  var activeId = null;
  var imageTimer = null;
  var diagramTimer = null;
  var cameraTimer = null;
  var layoutFrame = 0;
  var trackingFrame = 0;
  var typeTimers = [];
  var ui = null;
  var installed = false;
  var cameraScale = 1.88;
  var savedScrollX = 0;
  var savedScrollY = 0;
  var DIAGRAM_START_MS = 5600;
  var IMAGE_SEQUENCE_MS = 17500;

  function stepFor(id) { return steps.find(function (step) { return step.id === id; }); }
  function targetFor(id) {
    var step = stepFor(id);
    var targetId = step && step.target ? step.target : id;
    return document.querySelector('[data-hf-target="' + targetId + '"]');
  }
  function tourSteps(step) { return steps.filter(function (item) { return item.target === step.target; }); }
  function stepIndex(id) { return steps.findIndex(function (step) { return step.id === id; }); }

  function buildUI() {
    if (ui && document.body.contains(ui.guide)) return ui;
    var panels = ['top', 'right', 'bottom', 'left'].map(function (side) {
      var panel = document.createElement('div');
      panel.className = 'hf-veil hf-veil--' + side;
      panel.setAttribute('data-hf-exit', '');
      panel.setAttribute('aria-hidden', 'true');
      document.body.appendChild(panel);
      return panel;
    });
    var eye = document.createElement('div');
    eye.className = 'hf-eye-frame';
    eye.setAttribute('aria-hidden', 'true');
    document.body.appendChild(eye);
    var guide = document.createElement('aside');
    guide.className = 'hf-guide';
    guide.setAttribute('aria-live', 'polite');
    guide.innerHTML = '<div class="hf-guide__top"><div class="hf-guide__copy"><h3 class="hf-guide__title" data-hf-title></h3></div><button type="button" class="hf-guide__close" data-hf-exit aria-label="Exit hyper focus">×</button></div><p class="hf-guide__summary" data-hf-summary></p><p class="hf-guide__prose" data-hf-prose hidden></p><ul class="hf-guide__points" data-hf-points></ul><div class="hf-guide__controls"><button type="button" class="hf-guide__button hf-guide__button--ghost" data-hf-prev>Back</button><button type="button" class="hf-guide__button" data-hf-next>Next</button><span class="hf-guide__step" data-hf-count></span></div>';
    var content = document.createElement('div');
    content.className = 'hf-guide__content';
    content.tabIndex = 0;
    content.setAttribute('aria-label', 'Study guidance');
    ['summary', 'prose', 'points'].forEach(function (name) {
      content.appendChild(guide.querySelector('.hf-guide__' + name));
    });
    guide.insertBefore(content, guide.querySelector('.hf-guide__controls'));
    document.body.appendChild(guide);
    ui = { panels: panels, eye: eye, guide: guide };
    return ui;
  }

  function updateGuide(step) {
    var group = tourSteps(step);
    var index = group.findIndex(function (item) { return item.id === step.id; });
    var guide = buildUI().guide;
    clearTyping();
    guide.querySelector('.hf-guide__content').scrollTop = 0;
    guide.setAttribute('aria-live', 'off');
    var title = guide.querySelector('[data-hf-title]');
    var summary = guide.querySelector('[data-hf-summary]');
    var prose = guide.querySelector('[data-hf-prose]');
    var points = guide.querySelector('[data-hf-points]');
    var hasProse = Boolean(step.prose);
    title.textContent = '';
    summary.textContent = '';
    prose.textContent = '';
    prose.hidden = !hasProse;
    points.hidden = hasProse;
    points.innerHTML = step.points.map(function () { return '<li></li>'; }).join('');
    guide.querySelector('[data-hf-count]').textContent = (index + 1) + ' / ' + group.length;
    guide.querySelector('[data-hf-prev]').disabled = index === 0;
    guide.querySelector('[data-hf-prev]').style.opacity = index === 0 ? '.38' : '1';
    var nextButton = guide.querySelector('[data-hf-next]');
    nextButton.textContent = index === group.length - 1 ? 'Finish' : 'Next';
    nextButton.disabled = false;
    nextButton.style.opacity = '1';
    nextButton.style.cursor = 'pointer';

    var visual = guide.querySelector('.hf-guide__visual');
    if (!visual) {
      visual = document.createElement('div');
      visual.className = 'hf-guide__visual';
      guide.querySelector('.hf-guide__content').appendChild(visual);
    }
    visual.hidden = !step.visual;
    if (step.visual) {
      title.textContent = step.title;
      summary.textContent = step.summary;
      prose.hidden = true;
      points.hidden = true;
      visual.innerHTML = step.visual;
      if (step.id === 'question-3c') {
        var illustrations = [
          '<svg viewBox="0 0 160 90" role="img" aria-label="Seismometer recording ground vibrations"><rect x="8" y="8" width="144" height="66" rx="10" fill="#20354B"/><path d="M18 28H142M18 44H142M18 60H142M42 18V66M80 18V66M118 18V66" stroke="#3B5065" stroke-width="1"/><path class="hf-seismic-trace" d="M18 44H36L42 39L48 50L54 44H62L68 26L75 62L82 18L89 65L96 34L103 48L110 44H142" fill="none" stroke="#72E2CA" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" pathLength="100"/><rect x="58" y="76" width="44" height="5" rx="2" fill="#64758A"/></svg>',
          '<svg viewBox="0 0 160 90" role="img" aria-label="Building on flexible bearings: ground moves more than the building"><g class="hf-isolated-building"><rect x="49" y="8" width="62" height="53" rx="4" fill="#E6B85D"/><path d="M61 20H69M81 20H89M99 20H103M61 33H69M81 33H89M99 33H103M61 46H69M81 46H89M99 46H103" stroke="#5B452D" stroke-width="5"/><path d="M42 63H118" stroke="#39495E" stroke-width="5" stroke-linecap="round"/></g><path d="M55 67V75M80 67V75M105 67V75" stroke="#528E87" stroke-width="7" stroke-linecap="round"/><g class="hf-moving-ground"><rect x="17" y="78" width="126" height="8" rx="3" fill="#B78C63"/><path d="M29 82H42M118 82H131" stroke="#765231" stroke-width="2"/></g></svg>'
        ];
        visual.querySelectorAll('.hf-topic').forEach(function (topic, i) {
          topic.classList.add('hf-topic--illustrated');
          var art = document.createElement('div');
          art.className = 'hf-topic-art';
          art.innerHTML = illustrations[i];
          topic.querySelector('strong').before(art);
        });
      } else if (step.id === 'question-3c-srp' || step.id === 'question-3b-srp') {
        var builder = visual.querySelector('.hf-srp-builder');
        builder.onclick = function () {
          builder.classList.remove('is-playing');
          void builder.offsetWidth;
          builder.classList.add('is-playing');
        };
      } else if (step.id === 'question-3c-hints') {
        var ideaCopy = {
          monitor: ['Monitor changing ground movement.', 'Seismometers and GPS help estimate risk, but cannot give an exact date.'],
          build: ['Design structures to move safely.', 'Reinforcement and base isolation reduce collapse and damage.'],
          prepare: ['Practise before an emergency.', 'Drills, secured furniture and response plans reduce injuries.']
        };
        visual.querySelectorAll('.hf-idea').forEach(function (button) {
          button.onclick = function () {
            visual.querySelectorAll('.hf-idea').forEach(function (item) { item.classList.remove('is-active'); });
            button.classList.add('is-active');
            visual.querySelector('[data-idea-title]').textContent = ideaCopy[button.dataset.idea][0];
          };
        });
      } else if (step.id === 'question-3b-explore') {
        var rockCopy = {
          limestone: ['Limestone forms from calcium-rich remains.', 'The Burren, County Clare, is a named Irish limestone landscape.'],
          sandstone: ['Sandstone forms when sand is compacted and cemented.', 'Old Red Sandstone forms MacGillycuddy’s Reeks in County Kerry.'],
          shale: ['Shale forms from compressed mud and clay.', 'Shale occurs in the sedimentary rocks of County Clare.']
        };
        visual.querySelectorAll('[data-rock]').forEach(function (button) {
          button.onclick = function () {
            visual.querySelectorAll('[data-rock]').forEach(function (item) { item.classList.remove('is-active'); });
            button.classList.add('is-active');
            visual.querySelector('[data-rock-title]').textContent = rockCopy[button.dataset.rock][0];
          };
        });
      }
      revealInOrder(summary, visual);
      guide.setAttribute('aria-live', 'polite');
      return;
    }

    var pointEls = Array.prototype.slice.call(points.querySelectorAll('li'));
    typeText(title, step.title, 12, function () {
      typeText(summary, step.summary, 7, function () {
        if (hasProse) {
          typeText(prose, step.prose, 4, function () { guide.setAttribute('aria-live', 'polite'); });
        } else {
          typePoint(0);
        }
      });
    });

    function typePoint(pointIndex) {
      if (pointIndex >= step.points.length) {
        guide.setAttribute('aria-live', 'polite');
        return;
      }
      var plain = plainText(step.points[pointIndex]);
      typeText(pointEls[pointIndex], plain, 5, function () {
        pointEls[pointIndex].innerHTML = step.points[pointIndex];
        typePoint(pointIndex + 1);
      });
    }
  }

  function setNextEnabled(enabled) {
    var button = buildUI().guide.querySelector('[data-hf-next]');
    button.disabled = !enabled;
    button.style.opacity = enabled ? '1' : '.48';
    button.style.cursor = enabled ? 'pointer' : 'wait';
  }

  function hideNonFocusSections(hidden) {
    var scene = document.querySelector('[data-hf-scene]');
    var primarySection = scene && scene.closest('section');
    if (!primarySection) return;
    document.querySelectorAll('section').forEach(function (section) {
      var belongsToPrimaryScene = section === primarySection || primarySection.contains(section) || section.contains(primarySection);
      section.classList.toggle('hf-focus-hidden-section', hidden && !belongsToPrimaryScene);
    });
  }

  function plainText(html) {
    var temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || '';
  }

  // Fade the card in piece by piece: the instruction first, then each box in reading order.
  var GROUPS = '.hf-split, .hf-srp-builder, .hf-rock-cycle, .hf-idea-deck';
  function revealInOrder(summary, visual) {
    var items = [summary];
    Array.prototype.forEach.call(visual.children, function (child) {
      if (child.matches(GROUPS)) items.push.apply(items, child.children);
      else items.push(child);
    });
    items.forEach(function (item, i) {
      item.classList.remove('hf-reveal');
      void item.offsetWidth;
      item.style.animationDelay = (i * 0.32) + 's';
      item.classList.add('hf-reveal');
    });
  }

  function clearTyping() {
    typeTimers.forEach(function (timer) { clearTimeout(timer); });
    typeTimers = [];
  }

  function typeText(element, text, speed, done) {
    var position = 0;
    element.textContent = '';
    function tick() {
      position = Math.min(text.length, position + 2);
      element.textContent = text.slice(0, position);
      if (position < text.length) {
        typeTimers.push(setTimeout(tick, speed));
      } else if (done) {
        done();
      }
    }
    tick();
  }

  function setBox(el, left, top, width, height) {
    el.style.left = Math.max(0, left) + 'px';
    el.style.top = Math.max(0, top) + 'px';
    el.style.width = Math.max(0, width) + 'px';
    el.style.height = Math.max(0, height) + 'px';
  }

  function layout() {
    layoutFrame = 0;
    if (!activeId || !ui) return;
    var target = targetFor(activeId);
    if (!target) return;
    var rect = target.getBoundingClientRect();
    var pad = 12;
    var left = Math.max(0, rect.left - pad);
    var top = Math.max(0, rect.top - pad);
    var right = Math.min(window.innerWidth, rect.right + pad);
    var bottom = Math.min(window.innerHeight, rect.bottom + pad);
    setBox(ui.panels[0], 0, 0, window.innerWidth, top);
    setBox(ui.panels[1], right, top, window.innerWidth - right, bottom - top);
    setBox(ui.panels[2], 0, bottom, window.innerWidth, window.innerHeight - bottom);
    setBox(ui.panels[3], 0, top, left, bottom - top);
    setBox(ui.eye, left, top, right - left, bottom - top);
    // Anchor the guide to the 16:9 desk scene, not to the browser viewport.
    // On a wide Chrome window the viewport continues into a grey gutter, while
    // the artwork ends much earlier. Viewport-relative `right: 20px` therefore
    // placed the guide outside the picture.
    var scene = document.querySelector('[data-hf-scene]');
    var stableFitScale = scene ? Math.min(window.innerWidth / scene.offsetWidth, window.innerHeight / scene.offsetHeight) : 1;
    var stableSceneWidth = scene ? scene.offsetWidth * stableFitScale : window.innerWidth;
    var stableSceneHeight = scene ? scene.offsetHeight * stableFitScale : window.innerHeight;
    var sceneLeft = Math.max(0, (window.innerWidth - stableSceneWidth) / 2);
    var sceneRight = Math.min(window.innerWidth, sceneLeft + stableSceneWidth);
    var sceneTop = Math.max(0, (window.innerHeight - stableSceneHeight) / 2);
    var sceneBottom = Math.min(window.innerHeight, sceneTop + stableSceneHeight);
    var sceneWidth = Math.max(0, sceneRight - sceneLeft);
    var compact = window.innerWidth < 820;
    var guideWidth = Math.min(380, window.innerWidth - 24);
    ui.guide.style.width = guideWidth + 'px';
    ui.guide.style.maxHeight = Math.max(120, compact ? Math.min(Math.max(280, window.innerHeight * .64), window.innerHeight - 24) : window.innerHeight - 40) + 'px';
    if (compact) {
      ui.guide.style.left = (window.innerWidth - guideWidth) / 2 + 'px';
      ui.guide.style.right = 'auto';
      ui.guide.style.top = 'auto';
      ui.guide.style.bottom = '12px';
      return;
    }
    var guideHeight = ui.guide.getBoundingClientRect().height || 300;
    var gap = 18;
    var minGuideLeft = 20;
    var maxGuideLeft = activeId && activeId.indexOf('question-') === 0
      ? window.innerWidth - guideWidth - 20
      : sceneRight - guideWidth - 20;
    var rightCandidate = right + gap;
    var leftCandidate = left - guideWidth - gap;
    var guideLeft;

    // Prefer the space immediately beside the active question. This makes the
    // instruction card feel connected to what the student is reading while
    // still keeping it completely inside the desk artwork.
    if (rightCandidate <= maxGuideLeft) guideLeft = rightCandidate;
    else if (leftCandidate >= minGuideLeft) guideLeft = leftCandidate;
    else if (activeId && activeId.indexOf('question-') === 0) guideLeft = maxGuideLeft;
    else guideLeft = (left + right) / 2 < (sceneLeft + sceneRight) / 2 ? maxGuideLeft : minGuideLeft;

    var minGuideTop = 20;
    var maxGuideTop = window.innerHeight - guideHeight - 20;
    var guideTop = Math.max(minGuideTop, Math.min(maxGuideTop, (top + bottom - guideHeight) / 2));

    ui.guide.style.left = guideLeft + 'px';
    ui.guide.style.right = 'auto';
    ui.guide.style.top = guideTop + 'px';
    ui.guide.style.bottom = 'auto';

    if (sceneWidth < guideWidth + 60) {
      ui.guide.style.left = minGuideLeft + 'px';
      ui.guide.style.top = Math.max(minGuideTop, Math.min(maxGuideTop, bottom + gap)) + 'px';
    }
  }

  function scheduleLayout() {
    if (layoutFrame) return;
    layoutFrame = requestAnimationFrame(layout);
  }

  function trackLayoutFor(duration) {
    cancelAnimationFrame(trackingFrame);
    var startedAt = performance.now();
    function follow(now) {
      layout();
      if (now - startedAt < duration) trackingFrame = requestAnimationFrame(follow);
      else trackingFrame = 0;
    }
    trackingFrame = requestAnimationFrame(follow);
  }

  function fitSceneToViewport() {
    var scene = document.querySelector('[data-hf-scene]');
    if (!scene) return;
    var sceneWidth = scene.offsetWidth || 3177;
    var sceneHeight = scene.offsetHeight || 1788;
    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;
    var fitScale = Math.min(viewportWidth / sceneWidth, viewportHeight / sceneHeight);
    var tx = (viewportWidth - sceneWidth * fitScale) / 2;
    var ty = (viewportHeight - sceneHeight * fitScale) / 2;
    scene.style.transition = 'none';
    scene.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + fitScale + ')';
    scene.setAttribute('data-hf-fit-scale', fitScale.toFixed(6));
    void scene.offsetWidth;
    scene.style.transition = '';
    window.scrollTo(0, 0);
  }

  function moveCameraTo(target) {
    var scene = document.querySelector('[data-hf-scene]');
    if (!scene || !target) return;
    var sceneRect = scene.getBoundingClientRect();
    var targetRect = target.getBoundingClientRect();
    var currentScale = scene.offsetWidth ? sceneRect.width / scene.offsetWidth : 1;
    if (!isFinite(currentScale) || currentScale <= 0) currentScale = 1;

    // Convert the visible target centre back into scene-local coordinates so
    // every camera move is calculated from the same immutable paper artwork.
    var localWidth = targetRect.width / currentScale;
    var localHeight = targetRect.height / currentScale;
    var localX = (targetRect.left - sceneRect.left + targetRect.width / 2) / currentScale;
    var localY = (targetRect.top - sceneRect.top + targetRect.height / 2) / currentScale;

    // Reserve a real column for the advice card before choosing the camera
    // scale. Wide question boxes therefore remain readable on the left rather
    // than filling the viewport and forcing the guide over their centre.
    var isQuestion = activeId && activeId.indexOf('question-') === 0;
    var isImageOnly = activeId === 'image';
    var compact = window.innerWidth < 820;
    var guideColumn = isImageOnly || compact ? 0 : 400;
    var fitScale = Math.min(window.innerWidth / scene.offsetWidth, window.innerHeight / scene.offsetHeight);
    var fittedSceneWidth = scene.offsetWidth * fitScale;
    var fittedSceneLeft = (window.innerWidth - fittedSceneWidth) / 2;
    var availableWidth = Math.max(1, window.innerWidth - guideColumn - 48);
    var desiredScale = isQuestion ? 1.55 : cameraScale;
    if (activeId === 'image') desiredScale = 1.60;
    // Let a focused question extend slightly beneath the edge of the advice
    // column. This makes its prompt visually match the advice heading without
    // changing the advice card itself or cropping the question's leading text.
    var questionWidthAllowance = 0;
    var widthScale = (availableWidth + questionWidthAllowance) / Math.max(1, localWidth);
    var heightScale = (window.innerHeight - 90) / Math.max(1, localHeight);
    var minScale = isQuestion ? .25 : .72;
    var nextScale = Math.max(minScale, Math.min(desiredScale, widthScale, heightScale));
    var focusX = isImageOnly ? window.innerWidth / 2 : 24 + availableWidth / 2;
    var focusY = window.innerHeight * (compact && !isImageOnly ? .25 : .50);
    var tx = focusX - localX * nextScale;
    var ty = focusY - localY * nextScale;
    scene.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + nextScale + ')';
    document.body.classList.add('hf-camera-active');
    trackLayoutFor(950);
  }

  function resetCamera() {
    document.body.classList.remove('hf-camera-active');
    fitSceneToViewport();
  }

  function figureVideo() {
    return document.querySelector('[data-hf-image-video]');
  }

  function startFigureVideo(reset) {
    var video = figureVideo();
    if (!video) return;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    if (reset) {
      try { video.currentTime = 0; } catch (_) {}
    }
    if (video.paused) {
      var playback = video.play();
      if (playback && typeof playback.catch === 'function') playback.catch(function () {});
    }
  }

  function stopFigureVideo() {
    var video = figureVideo();
    if (!video) return;
    video.pause();
    try { video.currentTime = 0; } catch (_) {}
  }

  function replayFigure() {
    clearTimeout(diagramTimer);
    document.body.classList.add('hf-arrows-active');
    var arrowButton = document.querySelector('[data-hf-arrow-replay]');
    if (arrowButton) arrowButton.click();
    // Acceleration reveals first. After it finishes, hold for one second,
    // reveal resistance, hold for one more second, then begin the diagram.
    diagramTimer = setTimeout(function () {
      if (activeId !== 'image') return;
      var diagramButton = document.querySelector('[data-hf-diagram-replay]');
      if (diagramButton) diagramButton.click();
    }, DIAGRAM_START_MS);
  }

  function enter(id) {
    var step = steps.find(function (item) { return item.id === id; });
    var target = targetFor(id);
    if (!step || !target) return;
    buildUI();
    activeId = id;
    ui.eye.classList.toggle('hf-eye-frame--spotlight', /^question-3[bc]$/.test(step.target));
    document.body.classList.add('hf-active');
    hideNonFocusSections(true);
    document.body.classList.toggle('hf-image-focus', id === 'image');
    document.querySelectorAll('[data-hf-target].hf-current').forEach(function (el) { el.classList.remove('hf-current'); });
    target.classList.add('hf-current');
    updateGuide(step);
    clearTimeout(cameraTimer);
    document.body.classList.add('hf-camera-moving');
    moveCameraTo(target);
    cameraTimer = setTimeout(function () {
      if (activeId !== id) return;
      document.body.classList.remove('hf-camera-moving');
      layout();
    }, 820);
    if (id === 'image') {
      // Start both Figure 7.1 overlays immediately on image focus. Resetting
      // the class first guarantees the arrow reveal restarts cleanly.
      document.body.classList.remove('hf-arrows-active');
      clearTimeout(imageTimer);
      clearTimeout(diagramTimer);
      void document.body.offsetWidth;
      replayFigure();
      startFigureVideo(true);
      setNextEnabled(false);
      imageTimer = setTimeout(function () {
        if (activeId === 'image') setNextEnabled(true);
      }, IMAGE_SEQUENCE_MS);
    } else {
      stopFigureVideo();
    }
  }

  function exit() {
    clearTimeout(imageTimer);
    clearTimeout(diagramTimer);
    clearTimeout(cameraTimer);
    clearTyping();
    cancelAnimationFrame(trackingFrame);
    trackingFrame = 0;
    stopFigureVideo();
    activeId = null;
    document.querySelectorAll('[data-hf-target].hf-current').forEach(function (el) { el.classList.remove('hf-current'); });
    document.body.classList.remove('hf-active');
    document.body.classList.remove('hf-image-focus');
    document.body.classList.remove('hf-camera-moving');
    hideNonFocusSections(false);
    resetCamera();
  }

  function focus(id) {
    if (!targetFor(id) || activeId === id) return;
    if (!activeId) { enter(id); return; }
    if (activeId === 'image' && id !== 'image') stopFigureVideo();
    clearTimeout(imageTimer);
    clearTimeout(diagramTimer);
    clearTimeout(cameraTimer);
    // Keep the veil and guide active between steps. Only the highlighted target
    // changes, so the student's view glides across the paper without zooming
    // out and back in at every handoff.
    enter(id);
  }

  function startTour(firstId) {
    if (activeId) exit();
    document.body.classList.remove('hf-arrows-active');
    savedScrollX = window.scrollX || 0;
    savedScrollY = window.scrollY || 0;
    window.scrollTo(0, 0);
    focus(firstId || 'question-3c');
  }

  function move(delta) {
    var current = stepFor(activeId);
    var group = current ? tourSteps(current) : [];
    var index = group.findIndex(function (item) { return item.id === activeId; });
    if (index < 0) return;
    var next = index + delta;
    if (next < 0) return;
    if (next >= group.length) { exit(); return; }
    focus(group[next].id);
  }

  function sync() {
    if (!activeId) return;
    var target = targetFor(activeId);
    if (target && !target.classList.contains('hf-current')) target.classList.add('hf-current');
    if (activeId === 'image') startFigureVideo(false);
    scheduleLayout();
  }

  function installEvents() {
    if (installed) return;
    installed = true;
    document.addEventListener('click', function (event) {
      var start = event.target.closest('[data-hf-start]');
      if (start) { event.preventDefault(); startTour(start.getAttribute('data-hf-start') || 'question-3c'); return; }
      if (event.target.closest('[data-hf-exit]')) { event.preventDefault(); exit(); return; }
      if (event.target.closest('[data-hf-next]')) { event.preventDefault(); move(1); return; }
      if (event.target.closest('[data-hf-prev]')) { event.preventDefault(); move(-1); return; }
      var target = event.target.closest('[data-hf-target]');
      if (target && target.getAttribute('data-hf-target') !== activeId) focus(target.getAttribute('data-hf-target'));
      var submit = event.target.closest('[data-hf-submit]');
      if (submit && activeId && activeId.indexOf('question-') === 0) {
        var before = (document.querySelector('[data-hf-progress]') || {}).textContent || '';
        setTimeout(function () {
          var after = (document.querySelector('[data-hf-progress]') || {}).textContent || '';
          if (after === before) return;
          if (/complete/i.test(after)) exit(); else move(1);
        }, 1150);
      }
    }, true);
    document.addEventListener('keydown', function (event) {
      if (!activeId) {
        if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-hf-target]')) { event.preventDefault(); focus(event.target.getAttribute('data-hf-target')); }
        return;
      }
      if (event.key === 'Escape') exit();
      if (!/INPUT|TEXTAREA/.test(event.target.tagName) && event.key === 'ArrowRight') move(1);
      if (!/INPUT|TEXTAREA/.test(event.target.tagName) && event.key === 'ArrowLeft') move(-1);
    });
    window.addEventListener('resize', function () {
      if (activeId) moveCameraTo(targetFor(activeId));
      else fitSceneToViewport();
      scheduleLayout();
    });
    window.addEventListener('scroll', scheduleLayout, true);
    new MutationObserver(sync).observe(document.querySelector('x-dc') || document.body, { childList: true, subtree: true });
  }

  window.ExamHyperFocusSetup = function () {
    installEvents();
    buildUI();
    fitSceneToViewport();
    window.ExamHyperFocus = { start: startTour, focus: focus, next: function () { move(1); }, previous: function () { move(-1); }, exit: exit };
  };
})();
