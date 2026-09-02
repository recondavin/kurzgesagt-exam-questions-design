(function () {
  var steps = [
    {
      id: 'question-3c', target: 'question-3c', kicker: '1 · Decode the task', title: 'This essay has two jobs',
      summary: 'The marking scheme expects prediction and reduction, not a general earthquake essay.',
      points: ['Underline <strong>predicted</strong> and <strong>effects reduced</strong>.', 'Make one clear reference to each side before developing your explanation.', 'Keep every point tied to earthquakes.']
    },
    {
      id: 'question-3c-plan', target: 'question-3c', kicker: '2 · Plan the marks', title: 'Balance the two halves',
      summary: 'After the two reference marks, the explanation is credited through 13 SRPs.',
      points: ['Aim for roughly <strong>six or seven SRPs per half</strong>.', 'Use short paragraphs: one idea, then its effect or reason.', 'Answering only one half caps the developed SRPs at seven.']
    },
    {
      id: 'question-3c-srp', target: 'question-3c', kicker: '3 · Build an SRP', title: 'Make each point earn its place',
      summary: 'An SRP is a specific, relevant point that directly advances the answer.',
      points: ['Use <strong>point → how or why → earthquake link</strong>.', 'Do not stop after naming a method; explain what it detects or changes.', 'One precise sentence, or a tight sentence pair, is usually enough.']
    },
    {
      id: 'question-3c-hints', target: 'question-3c', kicker: '4 · Small prompts', title: 'Ask yourself, then supply the detail',
      summary: 'These prompts point you toward ideas without writing the essay for you.',
      points: ['What changes might instruments notice <strong>before</strong> strong shaking?', 'How could <strong>where and how people build</strong> alter the damage?', 'What can communities prepare before an event that helps during and after it?']
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
    var stableFitScale = scene ? Math.min(window.innerWidth / scene.offsetWidth, window.innerHeight / scene.offsetHeight) : 1;
    var stableSceneWidth = scene ? scene.offsetWidth * stableFitScale : window.innerWidth;
    var stableSceneHeight = scene ? scene.offsetHeight * stableFitScale : window.innerHeight;
    var sceneLeft = Math.max(0, (window.innerWidth - stableSceneWidth) / 2);
    var sceneRight = Math.min(window.innerWidth, sceneLeft + stableSceneWidth);
    var sceneTop = Math.max(0, (window.innerHeight - stableSceneHeight) / 2);
    var sceneBottom = Math.min(window.innerHeight, sceneTop + stableSceneHeight);
    var sceneWidth = Math.max(0, sceneRight - sceneLeft);
    var preferredGuideWidth = activeId && activeId.indexOf('question-') === 0 ? 620 : 760;
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
    var preferredGuideColumn = isQuestion ? 620 : 760;
    var guideColumn = isImageOnly ? 0 : Math.min(preferredGuideColumn, Math.max(400, window.innerWidth * .48));
    var fitScale = Math.min(window.innerWidth / scene.offsetWidth, window.innerHeight / scene.offsetHeight);
    var fittedSceneWidth = scene.offsetWidth * fitScale;
    var fittedSceneLeft = (window.innerWidth - fittedSceneWidth) / 2;
    var availableWidth = Math.max(500, fittedSceneWidth - guideColumn - (isImageOnly ? 48 : 76));
    var desiredScale = isQuestion ? 1.55 : cameraScale;
    if (activeId === 'image') desiredScale = 1.60;
    // Let a focused question extend slightly beneath the edge of the advice
    // column. This makes its prompt visually match the advice heading without
    // changing the advice card itself or cropping the question's leading text.
    var questionWidthAllowance = 0;
    var widthScale = (availableWidth + questionWidthAllowance) / Math.max(1, localWidth);
    var heightScale = (window.innerHeight - 90) / Math.max(1, localHeight);
    var minScale = isQuestion ? .44 : .72;
    var nextScale = Math.max(minScale, Math.min(desiredScale, widthScale, heightScale));
    var focusX = isImageOnly ? window.innerWidth / 2 : fittedSceneLeft + 24 + (availableWidth + questionWidthAllowance) / 2;
    var focusY = window.innerHeight * 0.50;
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

  function startTour() {
    if (activeId) exit();
    document.body.classList.remove('hf-arrows-active');
    savedScrollX = window.scrollX || 0;
    savedScrollY = window.scrollY || 0;
    window.scrollTo(0, 0);
    focus('question-3c');
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
    if (activeId === 'image') startFigureVideo(false);
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
