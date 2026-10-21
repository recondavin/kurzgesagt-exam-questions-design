// AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are build-machine environment variables only.
// node tools/orals/make_voice.mjs [--dry-run] [--limit=N]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { voiceHash, sentences, VOICES } from '../../orals/engine/voice.js';
import { QUESTIONS, SHOP_QUESTIONS, COUNTIES } from '../../orals/ga/questions.js';
import { EXTRA_QUESTIONS, TOPICS } from '../../orals/ga/topics.js';
import { DEFAULTS, OPTIONS, prepareQuestions } from '../../orals/ga/personal.js';
import { DRILLS } from '../../orals/ga/drills.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const target = resolve(root, 'orals/ga/voice'); mkdirSync(target, { recursive: true });
const indexPath = resolve(target, 'index.json');
let index = {}; try { index = JSON.parse(readFileSync(indexPath, 'utf8')); } catch { /* first build */ }
const texts = new Set();
function add(text) { for (const s of sentences(text)) texts.add(s); }
const base = QUESTIONS.concat(EXTRA_QUESTIONS, SHOP_QUESTIONS);
// Each generator field is independent. Jobs are separate sentences, so this enumerates their full
// cross product without synthesising the same sentence for every possible pair of parents' jobs.
const profiles = [DEFAULTS];
for (const [key, values] of Object.entries(OPTIONS)) for (const value of values) profiles.push({ ...DEFAULTS, [key]: value });
for (const c of COUNTIES) profiles.push({ ...DEFAULTS, county: c.id });
for (const p of profiles) for (const q of prepareQuestions(base, p)) {
  q.ask.forEach(add);
  // Arbitrary names and birthdays intentionally have no prerecorded computer audio.
  if (!['ainm', 'breith'].includes(q.id)) { add(q.model.ga); if (q.more) add(q.more.ga); }
}
Object.values(TOPICS).forEach(([ga]) => add(ga));
for (const t of ['Maith thú!', 'Tá sé agat anois.', 'Déanaimis cleachtadh beag.', 'Scríobh an leagan ceart.']) add(t);
for (const bank of Object.values(DRILLS)) for (const item of bank.items) { add(item.right); add(item.wrong); }
const ink = readFileSync(resolve(root, 'orals/ga/story.ink'), 'utf8');
for (const line of ink.split(/\r?\n/)) {
  const dialogue = /^\s*(?:-\s*)?[\w-]+:\s*([^#]+)/.exec(line);
  const choice = /^\s*[*+]\s*\[([^\]]+)\]/.exec(line);
  if (dialogue && !line.includes('#prompt')) add(dialogue[1].trim());
  if (choice) add(choice[1]);
}
const dry = process.argv.includes('--dry-run');
const limit = Number(process.argv.find(a => a.startsWith('--limit='))?.slice(8) || Infinity);
const key = process.env.AZURE_SPEECH_KEY, region = process.env.AZURE_SPEECH_REGION;
if (!dry && (!key || !region)) { console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION locally, then rerun. Never commit the key.'); process.exit(1); }
if (region && !/^[a-z0-9-]+$/.test(region)) throw new Error('Invalid Azure Speech region');
const xml = s => s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));
let generated = 0, pending = 0;
for (const voice of Object.values(VOICES)) for (const text of texts) {
  const hash = voiceHash(voice, text), file = hash + '.mp3';
  if (index[hash] && existsSync(resolve(target, file))) continue;
  pending++;
  if (dry || generated >= limit) continue;
  const response = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'LeavingCertIrishVoiceBuild' },
    body: `<speak version="1.0" xml:lang="ga-IE"><voice name="${voice}">${xml(text)}</voice></speak>`,
    signal: AbortSignal.timeout(60000),
  });
  if (!response.ok) throw new Error(`Azure Speech HTTP ${response.status}; manifest preserves completed files. Retry later.`);
  writeFileSync(resolve(target, file), Buffer.from(await response.arrayBuffer()));
  index[hash] = file;
  writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n'); generated++;
}
console.log(`${texts.size} unique sentences; ${pending} voice files pending; ${generated} generated${dry ? ' (dry run)' : ''}.`);
