(function () {
  var steps = [
    {
      id: 'question-3c', target: 'question-3c', kicker: '1 · Plan the marks', title: '15 explained points',
      summary: 'Split your answer across both parts.',
      visual: '<ul class="hf-bullets"><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 160 90" role="img"><title>Seismograph drum recording ground vibrations</title><rect width="160" height="90" fill="#E3F5FC"/><rect y="72" width="160" height="4" fill="#83C468"/><rect y="75" width="160" height="15" fill="#6B2D3A"/><path d="M0 83H160" stroke="#D63A12" stroke-width="2" stroke-dasharray="6 6"><animate attributeName="stroke-dashoffset" values="0;-24" dur="1.2s" begin="0s" repeatCount="indefinite"/></path><rect x="22" y="62" width="116" height="10" rx="3" fill="#5B3172"/><clipPath id="hf-seis-clip"><rect x="37" y="23" width="86" height="34" rx="4"/></clipPath><rect x="34" y="20" width="92" height="40" rx="6" fill="#FDF7E8" stroke="#3E2154" stroke-width="3"/><path d="M37 32H123M37 48H123" stroke="#A8E4F5" stroke-width="1"/><g clip-path="url(#hf-seis-clip)"><path d="M37 40H47L51 34L55 46L59 40H77L81 28L85 52L89 31L93 47L97 40H117H127L131 34L135 46L139 40H157L161 28L165 52L169 31L173 47L177 40H197H207L211 34L215 46L219 40H237L241 28L245 52L249 31L253 47L257 40H277" fill="none" stroke="#E8551F" stroke-width="2.4" stroke-linejoin="round"><animateTransform attributeName="transform" type="translate" values="0 0;-80 0" dur="4s" begin="0s" repeatCount="indefinite"/></path></g><rect x="142" y="24" width="8" height="40" rx="2" fill="#5B3172"/><g><animateTransform attributeName="transform" type="rotate" values="0 146 30;-5 146 30;4 146 30;-2 146 30;0 146 30" dur=".8s" begin="0s" repeatCount="indefinite"/><path d="M146 30L120 40" stroke="#241428" stroke-width="3" stroke-linecap="round"/><circle cx="120" cy="40" r="2.6" fill="#E8551F"/></g><circle cx="146" cy="30" r="4" fill="#FFC42E"/></svg></span><span><b>Predict earthquakes:</b> about 7 points.</span></li><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 160 90" role="img"><title>Base-isolated building: the ground shakes but rubber bearings keep the building steady</title><rect width="160" height="90" fill="#E3F5FC"/><g><animateTransform attributeName="transform" type="translate" values="-5 0;5 0;-5 0" dur="1.4s" begin="0s" repeatCount="indefinite"/><rect x="-8" y="68" width="176" height="4" fill="#83C468"/><rect x="-8" y="71" width="176" height="19" fill="#6B2D3A"/><rect x="42" y="63" width="76" height="6" fill="#5B3A5E"/></g><path d="M51 58H61L56 64H46Z" fill="#241428"><animate attributeName="d" values="M51 58H61L56 64H46Z;M51 58H61L66 64H56Z;M51 58H61L56 64H46Z" dur="1.4s" repeatCount="indefinite"/></path><path d="M75 58H85L80 64H70Z" fill="#241428"><animate attributeName="d" values="M75 58H85L80 64H70Z;M75 58H85L90 64H80Z;M75 58H85L80 64H70Z" dur="1.4s" repeatCount="indefinite"/></path><path d="M99 58H109L104 64H94Z" fill="#241428"><animate attributeName="d" values="M99 58H109L104 64H94Z;M99 58H109L114 64H104Z;M99 58H109L104 64H94Z" dur="1.4s" repeatCount="indefinite"/></path><g><animateTransform attributeName="transform" type="translate" values="-.6 0;.6 0;-.6 0" dur="1.4s" begin="0s" repeatCount="indefinite"/><rect x="50" y="18" width="60" height="38" rx="2" fill="#FFC42E"/><rect x="46" y="13" width="68" height="6" rx="1.5" fill="#E8551F"/><rect x="58" y="25" width="8" height="7" rx="1" fill="#3E2154"/><rect x="76" y="25" width="8" height="7" rx="1" fill="#3E2154"/><rect x="94" y="25" width="8" height="7" rx="1" fill="#3E2154"/><rect x="58" y="40" width="8" height="7" rx="1" fill="#3E2154"/><rect x="76" y="40" width="8" height="7" rx="1" fill="#3E2154"/><rect x="94" y="40" width="8" height="7" rx="1" fill="#3E2154"/><rect x="44" y="55" width="72" height="4" fill="#5B3A5E"/></g><path d="M18 60l-6 4M18 68l-6 2M142 60l6 4M142 68l6 2" stroke="#D63A12" stroke-width="2" stroke-linecap="round"><animate attributeName="opacity" values="1;.2;1" dur=".7s" begin="0s" repeatCount="indefinite"/></path></svg></span><span><b>Reduce the effects:</b> about 8 points.</span></li></ul>',
      prose: 'Share them across both parts: predicting earthquakes and reducing their effects. Aim for about seven or eight on each side, with one idea in each short paragraph.',
      points: []
    },
    {
      id: 'question-3c-srp', target: 'question-3c', kicker: '2 · Build an SRP', title: 'Make every SRP count',
      summary: 'An SRP is one explained point.',
      visual: '<ul class="hf-bullets hf-bullets--steps"><li><span class="hf-bullet-dot"></span><span><b>Point:</b> base isolation.</span></li><li><span class="hf-bullet-dot"></span><span><b>Explain:</b> it absorbs ground movement.</span></li><li><span class="hf-bullet-dot"></span><span><b>Link:</b> so there is less damage.</span></li><li class="hf-bullet-result"><span class="hf-bullet-dot"></span><span><b>Full SRP:</b> Base isolation absorbs ground movement, reducing structural damage.</span></li></ul>',
      prose: 'State the idea, show how or why it matters, then link it back to earthquakes. Naming a method on its own is not enough.',
      points: []
    },
    {
      id: 'question-3c-hints', target: 'question-3c', kicker: '3 · Small prompts', title: 'Find your own examples',
      summary: 'Use the question to spark ideas.',
      visual: '<ul class="hf-bullets"><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 72 50" role="img"><title>Seismometer trace and a GPS satellite monitoring ground movement</title><rect width="72" height="50" fill="#E3F5FC"/><rect y="40" width="72" height="10" fill="#6B2D3A"/><rect y="38" width="72" height="3" fill="#83C468"/><g transform="translate(57 10)"><circle r="4" fill="none" stroke="#45C4EE" stroke-width="1.5"><animate attributeName="r" values="4;13" dur="2.4s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0" dur="2.4s" begin="0s" repeatCount="indefinite"/></circle><rect x="-3" y="-3" width="6" height="6" rx="1" fill="#5B3172"/><rect x="-11" y="-1.5" width="7" height="3" fill="#45C4EE"/><rect x="4" y="-1.5" width="7" height="3" fill="#45C4EE"/></g><path class="hf-mini-trace" pathLength="100" d="M3 27H14L19 21L24 32L29 13L35 37L40 19L45 29L50 25H60" fill="none" stroke="#E8551F" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span><b>Monitor:</b> seismometers and GPS track ground movement.</span></li><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 72 50" role="img"><title>Cross-braced building swaying safely as the ground shakes</title><rect width="72" height="50" fill="#E3F5FC"/><rect y="40" width="72" height="10" fill="#6B2D3A"/><rect y="38" width="72" height="3" fill="#83C468"/><g><animateTransform attributeName="transform" type="rotate" values="-3 36 39;3 36 39;-3 36 39" dur="2.6s" begin="0s" repeatCount="indefinite"/><rect x="24" y="8" width="24" height="30" rx="2" fill="#FFC42E"/><path d="M24 18H48M24 28H48M24 8L48 18M48 8L24 18M24 18L48 28M48 18L24 28M24 28L48 38M48 28L24 38" stroke="#6B2D3A" stroke-width="1.6"/><rect x="21" y="36" width="30" height="3" rx="1" fill="#5B3A5E"/></g></svg></span><span><b>Build safely:</b> flexible, reinforced buildings.</span></li><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 72 50" role="img"><title>A person sheltering under a sturdy table as debris falls</title><rect width="72" height="50" fill="#E3F5FC"/><rect y="44" width="72" height="6" fill="#5B3A5E"/><circle cx="22" cy="0" r="2" fill="#F5A03C"><animate attributeName="cy" values="0;16;16" keyTimes="0;.55;1" dur="1.8s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.55;1" dur="1.8s" begin="0s" repeatCount="indefinite"/></circle><circle cx="50" cy="0" r="2" fill="#F5A03C"><animate attributeName="cy" values="0;16;16" keyTimes="0;.55;1" dur="1.8s" begin=".9s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.55;1" dur="1.8s" begin=".9s" repeatCount="indefinite"/></circle><rect x="12" y="18" width="48" height="5" rx="1.5" fill="#6B2D3A"/><rect x="15" y="23" width="4" height="21" fill="#6B2D3A"/><rect x="53" y="23" width="4" height="21" fill="#6B2D3A"/><path d="M25 44Q26 34 34 33Q42 34 44 44Z" fill="#45C4EE"/><circle cx="31" cy="30" r="4" fill="#E8A27A"/><path d="M27 29Q31 24 37 28" fill="none" stroke="#2E8B57" stroke-width="3" stroke-linecap="round"/></svg></span><span><b>Prepare:</b> drills and emergency plans.</span></li></ul>',
      prose: 'Think about warning signs before the shaking, safer buildings and planning, and what communities can prepare for during and after an earthquake.',
      points: []
    },
    {
      id: 'question-3b', target: 'question-3b', kicker: '1 · Plan the marks', title: '15 explained points',
      summary: 'Tell the formation story in order.',
      visual: '<ul class="hf-bullets"><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 90 64" role="img"><title>Sediment grains sinking through water and settling in layers on the sea bed</title><rect width="90" height="64" fill="#4FC3E8"/><path d="M0 8Q11 4 22 8T45 8T67 8T90 8" fill="none" stroke="#A8E4F5" stroke-width="2"/><circle cx="18" cy="12" r="2.6" fill="#6B2D3A"><animate attributeName="cy" values="12;44" dur="3.2s" begin="0s" repeatCount="indefinite"/><animate attributeName="cx" values="18;22" dur="3.2s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="3.2s" begin="0s" repeatCount="indefinite"/></circle><circle cx="38" cy="12" r="2.6" fill="#D63A12"><animate attributeName="cy" values="12;44" dur="3.2s" begin=".8s" repeatCount="indefinite"/><animate attributeName="cx" values="38;35" dur="3.2s" begin=".8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="3.2s" begin=".8s" repeatCount="indefinite"/></circle><circle cx="58" cy="12" r="2.6" fill="#FDF7E8"><animate attributeName="cy" values="12;44" dur="3.2s" begin="1.6s" repeatCount="indefinite"/><animate attributeName="cx" values="58;61" dur="3.2s" begin="1.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="3.2s" begin="1.6s" repeatCount="indefinite"/></circle><circle cx="74" cy="12" r="2.6" fill="#6B2D3A"><animate attributeName="cy" values="12;44" dur="3.2s" begin="2.4s" repeatCount="indefinite"/><animate attributeName="cx" values="74;70" dur="3.2s" begin="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="3.2s" begin="2.4s" repeatCount="indefinite"/></circle><rect y="46" width="90" height="9" fill="#F5A03C"/><rect y="55" width="90" height="9" fill="#E8551F"/><path d="M6 50h4M24 49h5M44 51h4M64 49h5M80 51h4M14 59h5M36 58h4M56 60h5M74 58h4" stroke="#FDF7E8" stroke-width="1.6" stroke-linecap="round" opacity=".8"/></svg></span><span><b>Sediment:</b> layers build up on a sea or lake bed.</span></li><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 90 64" role="img"><title>Layers of sediment squeezed by the weight of new layers above</title><rect width="90" height="64" fill="#A8E4F5"/><g class="hf-compress-arrow"><path d="M30 3V13M25 9L30 14L35 9M60 3V13M55 9L60 14L65 9" fill="none" stroke="#3E2154" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></g><g class="hf-squash"><rect y="20" width="90" height="11" fill="#F5A03C"/><rect y="31" width="90" height="11" fill="#E8551F"/><rect y="42" width="90" height="11" fill="#F5A03C"/><rect y="53" width="90" height="11" fill="#D63A12"/><path d="M8 25h4M30 26h5M52 24h4M74 26h5M16 36h5M40 37h4M64 35h5M8 47h4M30 48h5M54 46h4M76 48h4M18 58h5M44 59h4M68 57h5" stroke="#FDF7E8" stroke-width="1.6" stroke-linecap="round" opacity=".75"/></g></svg></span><span><b>Compaction:</b> the weight above squeezes the layers.</span></li><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 90 64" role="img"><title>Sedimentary rock: layers of grains cemented together by minerals</title><rect width="90" height="64" fill="#7FD8F2"/><path d="M0 14H90V64H0Z" fill="#E8551F"/><rect y="14" width="90" height="4" fill="#4FA83F"/><rect y="26" width="90" height="9" fill="#F5A03C"/><rect y="44" width="90" height="9" fill="#D63A12"/><path d="M30 18V26M62 26V35M20 35V44M50 44V53M72 53V64M36 53V64" stroke="#6B2D3A" stroke-width="2"/><path d="M8 22h3M44 21h3M76 23h3M14 31h3M38 30h3M80 31h3M8 40h3M34 39h3M60 40h3M26 49h3M66 48h3M10 58h3M52 59h3" stroke="#FDF7E8" stroke-width="1.6" stroke-linecap="round" opacity=".7"/><path d="M24 27L25 30L24 33L23 30Z M21 30L24 29L27 30L24 31Z" fill="#FFFFFF" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.2;.4;1" dur="2.4s" begin="0s" repeatCount="indefinite"/></path><path d="M66 37L67 40L66 43L65 40Z M63 40L66 39L69 40L66 41Z" fill="#FFFFFF" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.2;.4;1" dur="2.4s" begin=".8s" repeatCount="indefinite"/></path><path d="M44 54L45 57L44 60L43 57Z M41 57L44 56L47 57L44 58Z" fill="#FFFFFF" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;.2;.4;1" dur="2.4s" begin="1.6s" repeatCount="indefinite"/></path></svg></span><span><b>Cementation:</b> minerals glue the grains into rock.</span></li></ul>',
      prose: '', points: []
    },
    {
      id: 'question-3b-srp', target: 'question-3b', kicker: '2 · Build an SRP', title: 'Turn a stage into marks',
      summary: 'Add the process and its result.',
      visual: '<ul class="hf-bullets hf-bullets--steps"><li><span class="hf-bullet-dot"></span><span><b>Stage:</b> sediment builds up.</span></li><li><span class="hf-bullet-dot"></span><span><b>Process:</b> the layers compact.</span></li><li><span class="hf-bullet-dot"></span><span><b>Result:</b> the grains cement.</span></li><li class="hf-bullet-result"><span class="hf-bullet-dot"></span><span><b>Full SRP:</b> As layers build up, pressure compacts the sediment and minerals cement the grains into rock.</span></li></ul>',
      prose: '', points: []
    },
    {
      id: 'question-3b-explore', target: 'question-3b', kicker: '3 · Explore examples', title: 'Choose a rock example',
      summary: 'Connect formation to a real Irish landscape.',
      visual: '<ul class="hf-bullets"><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 72 50" role="img"><title>Limestone pavement of the Burren: clints and grikes widened by rain</title><rect width="72" height="50" fill="#7FD8F2"/><path d="M19.5 3v5" stroke="#1E78B4" stroke-width="1.8" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="0 0;0 22" dur="1.6s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.85;1" dur="1.6s" begin="0s" repeatCount="indefinite"/></path><path d="M41.5 3v5" stroke="#1E78B4" stroke-width="1.8" stroke-linecap="round"><animateTransform attributeName="transform" type="translate" values="0 0;0 22" dur="1.6s" begin=".8s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.85;1" dur="1.6s" begin=".8s" repeatCount="indefinite"/></path><path d="M0 30L72 26V50H0Z" fill="#9EA4AE"/><path d="M0 30L18 29V33L0 34Z M21 29L40 28V32L21 33Z M43 28L60 27V31L43 32Z M63 27L72 26.5V30.5L63 31Z" fill="#D5D8DE"/><path d="M19.5 29V50M41.5 28V50M61.5 27V50" stroke="#3E2154" stroke-width="2.4"/><path d="M0 41H72" stroke="#868C96" stroke-width="1.2"/><path d="M30 28V22" stroke="#2E8B57" stroke-width="1.6"/><circle cx="30" cy="21" r="2.4" fill="#45C4EE"/></svg></span><span><b>Limestone:</b> the Burren, Co. Clare.</span></li><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 72 50" role="img"><title>Old Red Sandstone mountains of MacGillycuddy’s Reeks</title><rect width="72" height="50" fill="#7FD8F2"/><g><animateTransform attributeName="transform" type="translate" values="0 0;9 0;0 0" dur="9s" begin="0s" repeatCount="indefinite"/><ellipse cx="16" cy="11" rx="8" ry="3.4" fill="#FDF7E8"/><ellipse cx="21" cy="9" rx="5" ry="3.4" fill="#FDF7E8"/></g><path d="M0 50L16 26L24 33L38 12L52 30L60 24L72 38V50Z" fill="#D63A12"/><path d="M38 12L45 21L40 25Z M16 26L20 31L17 33Z" fill="#E8551F"/><path d="M7 40L68 40M3 45H71M14 33L30 33M45 33L56 33" stroke="#F5A03C" stroke-width="1.6" opacity=".75"/></svg></span><span><b>Sandstone:</b> MacGillycuddy’s Reeks, Co. Kerry.</span></li><li><span class="hf-bullet-art"><svg class="hf-art" viewBox="0 0 72 50" role="img"><title>Thin dark layers of shale in sea cliffs in County Clare</title><rect width="72" height="50" fill="#7FD8F2"/><rect y="38" width="72" height="12" fill="#4FC3E8"/><path d="M0 11H40L44 50H0Z" fill="#3E2154"/><rect y="8" width="40" height="3.5" fill="#6BB553"/><path d="M0 16H40.5M0 21H41M0 26H41.5M0 31H42M0 36H42.6M0 42H43.2" stroke="#5B3172" stroke-width="2"/><path d="M0 23.5H41.2M0 33.5H42.3" stroke="#E8551F" stroke-width="1.4"/><path d="M44 42Q50 40 56 42T68 42T80 42" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-dasharray="4 4"><animate attributeName="stroke-dashoffset" values="0;-16" dur="2.4s" begin="0s" repeatCount="indefinite"/></path><circle cx="45" cy="40" r="2" fill="#FFFFFF"><animate attributeName="r" values="1;3.5;1" dur="2.4s" begin="0s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;.2;.9" dur="2.4s" begin="0s" repeatCount="indefinite"/></circle></svg></span><span><b>Shale:</b> cliffs in Co. Clare.</span></li></ul>',
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
    guide.innerHTML = '<div class="hf-guide__top"><div class="hf-guide__copy"><h3 class="hf-guide__title" data-hf-title></h3></div><button type="button" class="hf-guide__voice" data-hf-voice aria-pressed="true" aria-label="Narrator voice"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path class="hf-voice-waves" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="hf-voice-mute" d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><button type="button" class="hf-guide__close" data-hf-exit aria-label="Exit hyper focus">×</button></div><p class="hf-guide__summary" data-hf-summary></p><p class="hf-guide__prose" data-hf-prose hidden></p><ul class="hf-guide__points" data-hf-points></ul><div class="hf-guide__controls"><button type="button" class="hf-guide__button hf-guide__button--ghost" data-hf-prev>Back</button><button type="button" class="hf-guide__button" data-hf-next>Next</button><span class="hf-guide__step" data-hf-count></span></div>';
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
      revealInOrder(summary, visual, step);
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        visual.querySelectorAll('svg').forEach(function (svgEl) { if (svgEl.pauseAnimations) svgEl.pauseAnimations(); });
      }
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
  var GROUPS = '.hf-bullets';
  var CHAR_MS = 22;

  // Wrap every letter in its own span (words kept together so lines never break mid-word).
  // The full text keeps its layout from the start; letters simply appear in turn.
  function splitChars(host) {
    var chars = [];
    var walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement('span');
        word.className = 'hf-word';
        Array.prototype.forEach.call(part, function (letter) {
          var ch = document.createElement('span');
          ch.className = 'hf-ch';
          ch.textContent = letter;
          word.appendChild(ch);
          chars.push(ch);
        });
        frag.appendChild(word);
      });
      node.parentNode.replaceChild(frag, node);
    });
    return chars;
  }

  // Narration: one MP3 per line (assets/narration/<step>-title|summary|n.mp3, made by
  // tools/narration/generate_narration.py). Missing files are skipped silently.
  var NARRATION_VERSION = '4'; // bump when clips are re-processed without new words (e.g. the studio upgrade)
  var NARRATION_VOLUME = 0.55; // a soft voice under the reading
  var narration = { on: true, audio: null, finish: null, token: 0, versions: {} };
  // manifest.json maps each line to a hash of its voice + words, used to bust stale cached clips.
  try {
    fetch('assets/narration/manifest.json', { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : {}; })
      .then(function (versions) { narration.versions = versions || {}; })
      .catch(function () {});
  } catch (err) {}
  try { narration.on = window.localStorage.getItem('hf-narration') !== 'off'; } catch (err) {}

  function stopNarration() {
    narration.token += 1;
    if (narration.audio) { narration.audio.pause(); narration.audio = null; }
    if (narration.finish) { var finish = narration.finish; narration.finish = null; finish(); }
  }

  function playLine(id, done) {
    if (!narration.on || !id) { done(); return; }
    var audio = new Audio('assets/narration/' + id + '.mp3?v=' + (narration.versions[id] || '') + '.' + NARRATION_VERSION);
    audio.volume = NARRATION_VOLUME;
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      if (narration.audio === audio) { narration.audio = null; narration.finish = null; }
      done();
    }
    narration.audio = audio;
    narration.finish = finish;
    audio.addEventListener('ended', finish);
    audio.addEventListener('error', finish);
    var playing = audio.play();
    if (playing && playing.catch) playing.catch(finish);
  }

  function updateVoiceButton() {
    var button = ui && ui.guide.querySelector('[data-hf-voice]');
    if (!button) return;
    button.setAttribute('aria-pressed', narration.on ? 'true' : 'false');
    button.setAttribute('aria-label', narration.on ? 'Narrator voice on' : 'Narrator voice off');
  }

  function toggleNarration() {
    narration.on = !narration.on;
    try { window.localStorage.setItem('hf-narration', narration.on ? 'on' : 'off'); } catch (err) {}
    if (!narration.on && narration.finish) {
      if (narration.audio) narration.audio.pause();
      var finish = narration.finish; narration.finish = null; narration.audio = null; finish();
    }
    updateVoiceButton();
  }

  // Type the card out line by line: title, lead line, then each bullet (its picture fades in first).
  // Each line types while its narration plays; the next line starts once both have finished.
  function revealInOrder(summary, visual, step) {
    var title = ui.guide.querySelector('[data-hf-title]');
    var items = [title, summary];
    var ids = [step.id + '-title', step.id + '-summary'];
    Array.prototype.forEach.call(visual.children, function (child) {
      var parts = child.matches(GROUPS) ? Array.prototype.slice.call(child.children) : [child];
      parts.forEach(function (part, k) {
        items.push(part);
        ids.push(child.matches('.hf-bullets') ? step.id + '-' + (k + 1) : null);
      });
    });
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var token = narration.token;
    var plans = items.map(function (item) {
      item.classList.remove('hf-reveal');
      if (reduce) return { chars: [], host: item };
      item.classList.add('hf-pending');
      var host = item.matches('li') ? item.querySelector(':scope > span:last-child') : item;
      return { chars: splitChars(host), host: host };
    });
    updateVoiceButton();

    function run(n) {
      if (token !== narration.token || n >= items.length) return;
      var item = items[n];
      var plan = plans[n];
      item.classList.remove('hf-pending');
      item.style.setProperty('--d', '0s');
      void item.offsetWidth;
      item.classList.add('hf-reveal');
      var lead = item.querySelector && item.querySelector('.hf-bullet-art') ? 260 : 0;
      plan.chars.forEach(function (ch, k) {
        typeTimers.push(setTimeout(function () { ch.classList.add('on'); }, lead + k * CHAR_MS));
      });
      // Sweep each key word's underline in just after that word finishes typing.
      Array.prototype.forEach.call(plan.host.querySelectorAll('b'), function (b) {
        var own = b.querySelectorAll('.hf-ch');
        var last = own.length ? plan.chars.indexOf(own[own.length - 1]) : 0;
        b.style.animationDelay = ((lead + last * CHAR_MS + 60) / 1000) + 's';
      });
      var typed = false;
      var spoken = false;
      function next() { if (typed && spoken) run(n + 1); }
      typeTimers.push(setTimeout(function () { typed = true; next(); }, plan.chars.length ? lead + plan.chars.length * CHAR_MS + 160 : 0));
      playLine(ids[n], function () { if (token !== narration.token) return; spoken = true; next(); });
    }
    // When the camera is still travelling, wait for it so typing starts once the guide is visible.
    typeTimers.push(setTimeout(function () { run(0); }, document.body.classList.contains('hf-camera-moving') ? 500 : 0));
  }

  function clearTyping() {
    stopNarration();
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

  // Questions get a wide guide column (about a third of the screen) so the bullets can be large.
  function questionGuideWidth() {
    return Math.round(Math.max(440, Math.min(800, window.innerWidth * 0.42)));
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
    var questionGuide = !compact && activeId && activeId.indexOf('question-') === 0;
    var guideWidth = questionGuide ? questionGuideWidth() : Math.min(380, window.innerWidth - 24);
    ui.guide.style.width = guideWidth + 'px';
    ui.guide.style.setProperty('--hf-s', questionGuide ? Math.min(1.55, guideWidth / 440).toFixed(3) : '1');
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
    var guideColumn = isImageOnly || compact ? 0 : isQuestion ? questionGuideWidth() + 28 : 400;
    var fitScale = Math.min(window.innerWidth / scene.offsetWidth, window.innerHeight / scene.offsetHeight);
    var fittedSceneWidth = scene.offsetWidth * fitScale;
    var fittedSceneLeft = (window.innerWidth - fittedSceneWidth) / 2;
    var availableWidth = Math.max(1, window.innerWidth - guideColumn - (isQuestion ? 24 : 48));
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
    // Questions hug the left edge so the guide column gets as much room as possible.
    var focusX = isImageOnly ? window.innerWidth / 2 : isQuestion ? 12 + Math.min(availableWidth, localWidth * nextScale) / 2 : 24 + availableWidth / 2;
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
    // Only hide the card while the camera actually travels to a new target, not on Back/Next within one question.
    var travelling = !target.classList.contains('hf-current');
    document.querySelectorAll('[data-hf-target].hf-current').forEach(function (el) { el.classList.remove('hf-current'); });
    target.classList.add('hf-current');
    clearTimeout(cameraTimer);
    document.body.classList.toggle('hf-camera-moving', travelling);
    updateGuide(step);
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
      if (event.target.closest('[data-hf-voice]')) { event.preventDefault(); toggleNarration(); return; }
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
