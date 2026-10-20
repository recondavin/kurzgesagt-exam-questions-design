// Writes assets/examiner/teacher-head.svg: the examiner's head (ExamTeacher.head() from examiner-art.js) as a file
// with his styles inside it, facing right, for an <img> (the logo on the desk, the tab icon).
// Run: node tools/examiner/build_head_svg.mjs
import { readFileSync, writeFileSync } from 'fs';
const R = p => new URL('../../' + p, import.meta.url).pathname;
const src = readFileSync(R('examiner-art.js'), 'utf8');
const HEAD = JSON.parse('"' + /var HEAD = '(.*?)';\n/.exec(src)[1].replace(/\\'/g, "'").replace(/"/g, '\\"') + '"');
const CSS = JSON.parse('"' + /var CSS = '(.*?)';\n/.exec(src)[1].replace(/\\'/g, "'").replace(/"/g, '\\"') + '"');
const box = /viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/.exec(HEAD).slice(1).map(Number);
// Facing right: mirrored about the middle of the view box (the page's CSS flip doesn't reach inside an <img>).
const mid = box[0] * 2 + box[2];
const svg = HEAD
  .replace(/<svg ([^>]*)>/, (m, a) => '<svg ' + a.replace(/ aria-hidden="true" focusable="false"/, '') + ' width="' + box[2] + '" height="' + box[3] + '"><style>' + CSS + '</style><g transform="translate(' + mid + ' 0) scale(-1 1)">')
  .replace(/<\/svg>$/, '</g></svg>');
writeFileSync(R('assets/examiner/teacher-head.svg'), svg + '\n');
console.log('wrote assets/examiner/teacher-head.svg', svg.length, 'bytes', box);
