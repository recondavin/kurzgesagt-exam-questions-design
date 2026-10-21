// Shared by the static game and Azure's offline asset generator. No key reaches the browser.
export const VOICES = { female: 'ga-IE-OrlaNeural', male: 'ga-IE-ColmNeural' };
export function voiceHash(voice, text) {
  const str = voice + '|' + text;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return String(4294967296 * (2097151 & h2) + (h1 >>> 0));
}
export const sentences = text => String(text || '').match(/[^.!?]+[.!?]?/g)?.map(s => s.trim()).filter(Boolean) || [];
export function createVoice(base = 'orals/ga/voice/', activity = () => {}) {
  let manifest = {}, current = null, generation = 0;
  const ready = fetch(base + 'index.json').then(r => r.ok ? r.json() : {}).then(m => { manifest = m; }).catch(() => {});
  const has = (text, voice = VOICES.female) => sentences(text).every(s => manifest[voiceHash(voice, s)]) && sentences(text).length > 0;
  function stop() { generation++; if (current) { current.pause(); current.dispatchEvent(new Event('ended')); current = null; } activity(false); }
  async function play(text, voice = VOICES.female) {
    stop(); const g = generation; await ready;
    for (const sentence of sentences(text)) {
      if (g !== generation) return;
      const file = manifest[voiceHash(voice, sentence)]; if (!file) continue;
      current = new Audio(base + file); activity(true);
      await new Promise(resolve => { current.onended = resolve; current.onerror = resolve; current.play().catch(resolve); });
    }
    if (g === generation) { current = null; activity(false); }
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  return { ready, has, play, stop };
}
