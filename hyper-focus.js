(function () {
  var steps = [
    {
      id: 'context', kicker: '1 · Read the context', title: 'Strip the stem down to evidence',
      summary: 'Keep only the clues that determine the answer.',
      points: ['<strong>Single scull:</strong> one athlete creates the motion.', '<strong>Boat surges forward:</strong> this is acceleration.', '<strong>Force against the water:</strong> look for an action–reaction pair.']
    },
    {
      id: 'image', kicker: '2 · Read Figure 7.1', title: 'Turn the picture into a force map',
      summary: 'Read the arrows as a simple force map.',
      points: ['<strong>Acceleration:</strong> the boat is pushed forward.', '<strong>Resistance:</strong> the opposing force acts backward.', 'Follow each force’s starting point and direction.']
    },
    {
      id: 'question-a', kicker: '3 · Decode part (a)', title: 'Calculate acceleration: choose the matching law',
      summary: 'Choose the law that calculates acceleration.',
      points: ['Name <strong>Newton’s second law</strong> or F = ma.', 'Link the <strong>overall forward push</strong> to acceleration.', 'Mention <strong>mass</strong>. One precise sentence can earn all 3 marks.']
    },
    {
      id: 'question-b', kicker: '4 · Decode part (b)', title: 'Name it, define it, then apply it',
      summary: 'Give the law, its definition, and the rowing example.',
      points: ['Name <strong>Newton’s third law</strong>.', 'Define equal and opposite action–reaction forces.', 'Apply it: blade pushes water back; water pushes boat forward.']
    },
    {
      id: 'question-c', kicker: '5 · Decode part (c)', title: 'Build the H1 explanation chain',
      summary: 'Build a short cause → coaching → benefit chain.',
      points: ['<strong>Cause:</strong> forces explain movement.', '<strong>Use:</strong> a coach corrects technique.', '<strong>Benefit:</strong> speed, efficiency, or safety.']
    }
  ];
  var activeId = null;
  var imageTimer = null;
  var autoStartTimer = null;
  var cameraTimer = null;
  var autoStarted = false;
  var layoutFrame = 0;
  var trackingFrame = 0;
  var typeTimers = [];
  var ui = null;
  var installed = false;
  var cameraScale = 1.88;
  var savedScrollX = 0;
  var savedScrollY = 0;
  var IMAGE_SEQUENCE_MS = 11900;

  function targetFor(id) { return document.querySelector('[data-hf-target="' + id + '"]'); }
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
    guide.innerHTML = '<div class="hf-guide__top"><div class="hf-guide__copy"><div class="hf-guide__meta"><span class="hf-guide__kicker" data-hf-kicker></span></div><h3 class="hf-guide__title" data-hf-title></h3></div><button type="button" class="hf-guide__close" data-hf-exit aria-label="Exit hyper focus">×</button></div><p class="hf-guide__summary" data-hf-summary></p><ul class="hf-guide__points" data-hf-points></ul><div class="hf-guide__controls"><button type="button" class="hf-guide__button hf-guide__button--ghost" data-hf-prev>Back</button><button type="button" class="hf-guide__button" data-hf-next>Next</button><span class="hf-guide__step" data-hf-count></span></div>';
    document.body.appendChild(guide);
    ui = { panels: panels, eye: eye, guide: guide };
    return ui;
  }

  function updateGuide(step) {
    var index = stepIndex(step.id);
    var guide = buildUI().guide;
    clearTyping();
    guide.setAttribute('aria-live', 'off');
    guide.querySelector('[data-hf-kicker]').textContent = step.kicker;
    var title = guide.querySelector('[data-hf-title]');
    var summary = guide.querySelector('[data-hf-summary]');
    var points = guide.querySelector('[data-hf-points]');
    title.textContent = '';
    summary.textContent = '';
    points.innerHTML = step.points.map(function () { return '<li></li>'; }).join('');
    guide.querySelector('[data-hf-count]').textContent = (index + 1) + ' / ' + steps.length;
    guide.querySelector('[data-hf-prev]').disabled = index === 0;
    guide.querySelector('[data-hf-prev]').style.opacity = index === 0 ? '.38' : '1';
    var nextButton = guide.querySelector('[data-hf-next]');
    nextButton.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
    nextButton.disabled = false;
    nextButton.style.opacity = '1';
    nextButton.style.cursor = 'pointer';

    var pointEls = Array.prototype.slice.call(points.querySelectorAll('li'));
    typeText(title, step.title, 12, function () {
      typeText(summary, step.summary, 7, function () {
        typePoint(0);
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
    var sceneRect = scene ? scene.getBoundingClientRect() : { left: 0, right: window.innerWidth, top: 0, bottom: window.innerHeight };
    var sceneLeft = Math.max(0, sceneRect.left);
    var sceneRight = Math.min(window.innerWidth, sceneRect.right);
    var sceneTop = Math.max(0, sceneRect.top);
    var sceneBottom = Math.min(window.innerHeight, sceneRect.bottom);
    var sceneWidth = Math.max(0, sceneRight - sceneLeft);
    var preferredGuideWidth = activeId && activeId.indexOf('question-') === 0 ? 700 : 760;
    var guideWidth = Math.max(400, Math.min(preferredGuideWidth, sceneWidth - 40));
    ui.guide.style.width = guideWidth + 'px';
    var guideHeight = ui.guide.getBoundingClientRect().height || 300;
    var gap = 18;
    var minGuideLeft = sceneLeft + 20;
    var maxGuideLeft = sceneRight - guideWidth - 20;
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

    var minGuideTop = Math.max(20, sceneTop + 20);
    var maxGuideTop = Math.min(window.innerHeight - guideHeight - 20, sceneBottom - guideHeight - 20);
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
    var preferredGuideColumn = isQuestion ? 700 : 760;
    var guideColumn = Math.min(preferredGuideColumn, Math.max(400, window.innerWidth * .40));
    var availableWidth = Math.max(520, window.innerWidth - guideColumn - 76);
    var desiredScale = isQuestion ? 1.55 : cameraScale;
    if (activeId === 'image') desiredScale = 1.60;
    // Let a focused question extend slightly beneath the edge of the advice
    // column. This makes its prompt visually match the advice heading without
    // changing the advice card itself or cropping the question's leading text.
    var questionWidthAllowance = isQuestion ? 185 : 0;
    var widthScale = (availableWidth + questionWidthAllowance) / Math.max(1, localWidth);
    var heightScale = (window.innerHeight - 90) / Math.max(1, localHeight);
    var nextScale = Math.max(.72, Math.min(desiredScale, widthScale, heightScale));
    var focusX = 24 + (availableWidth + questionWidthAllowance) / 2;
    var focusY = window.innerHeight * 0.50;
    var tx = focusX - localX * nextScale;
    var ty = focusY - localY * nextScale;
    scene.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + nextScale + ')';
    document.body.classList.add('hf-camera-active');
    trackLayoutFor(950);
  }

  function resetCamera() {
    var scene = document.querySelector('[data-hf-scene]');
    if (scene) scene.style.transform = 'translate(0px,0px) scale(1)';
    document.body.classList.remove('hf-camera-active');
    window.scrollTo(savedScrollX, savedScrollY);
  }

  function replayFigure() {
    clearTimeout(imageTimer);
    document.body.classList.add('hf-arrows-active');
    var arrowButton = document.querySelector('[data-hf-arrow-replay]');
    if (arrowButton) arrowButton.click();
    // The force arrows and the annotation diagram both begin together. The
    // manual Next button is enabled only after this sequence has completed.
    var diagramButton = document.querySelector('[data-hf-diagram-replay]');
    if (diagramButton) diagramButton.click();
  }

  function enter(id) {
    var step = steps.find(function (item) { return item.id === id; });
    var target = targetFor(id);
    if (!step || !target) return;
    buildUI();
    activeId = id;
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
      void document.body.offsetWidth;
      replayFigure();
      setNextEnabled(false);
      imageTimer = setTimeout(function () {
        if (activeId === 'image') setNextEnabled(true);
      }, IMAGE_SEQUENCE_MS);
    }
  }

  function exit() {
    clearTimeout(imageTimer);
    clearTimeout(autoStartTimer);
    clearTimeout(cameraTimer);
    clearTyping();
    cancelAnimationFrame(trackingFrame);
    trackingFrame = 0;
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
    clearTimeout(imageTimer);
    clearTimeout(cameraTimer);
    // Keep the veil and guide active between steps. Only the highlighted target
    // changes, so the student's view glides across the paper without zooming
    // out and back in at every handoff.
    enter(id);
  }

  function startTour() {
    clearTimeout(autoStartTimer);
    if (activeId) exit();
    document.body.classList.remove('hf-arrows-active');
    savedScrollX = window.scrollX || 0;
    savedScrollY = window.scrollY || 0;
    window.scrollTo(0, 0);
    focus('context');
  }

  function move(delta) {
    var index = stepIndex(activeId);
    if (index < 0) return;
    var next = index + delta;
    if (next < 0) return;
    if (next >= steps.length) { exit(); return; }
    focus(steps[next].id);
  }

  function sync() {
    if (!activeId) return;
    var target = targetFor(activeId);
    if (target && !target.classList.contains('hf-current')) target.classList.add('hf-current');
    scheduleLayout();
  }

  function installEvents() {
    if (installed) return;
    installed = true;
    document.addEventListener('click', function (event) {
      var start = event.target.closest('[data-hf-start]');
      if (start) { event.preventDefault(); startTour(); return; }
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
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('scroll', scheduleLayout, true);
    new MutationObserver(sync).observe(document.querySelector('x-dc') || document.body, { childList: true, subtree: true });
  }

  window.ExamHyperFocusSetup = function () {
    installEvents();
    buildUI();
    window.ExamHyperFocus = { start: startTour, focus: focus, next: function () { move(1); }, previous: function () { move(-1); }, exit: exit };
    if (!autoStarted) {
      autoStarted = true;
      autoStartTimer = setTimeout(function () {
        if (!activeId) focus('context');
      }, 700);
    }
  };
})();
