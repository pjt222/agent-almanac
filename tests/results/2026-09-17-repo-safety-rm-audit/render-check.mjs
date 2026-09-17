import { readFileSync, writeFileSync } from 'node:fs';
import { wrapWorkflow } from '/mnt/d/dev/p/agent-almanac/scripts/lib/mutation-parse.js';

const path = '/mnt/d/dev/p/agent-almanac/workflows/_template.mjs';
const src = readFileSync(path, 'utf8');
writeFileSync(
  '/tmp/claude-1000/-mnt-d-dev-p-agent-almanac/e8650963-1791-4d25-a255-fdc31a0d70dd/scratchpad/wrapped.mjs',
  wrapWorkflow(src)
);

// Scan forward tracking backslash escapes. A non-greedy /`[\s\S]*?`/ terminates at the first
// ESCAPED backtick that happens to end a line, which silently extracts a truncated literal and
// then dies in eval with "Unexpected end of input" — a probe bug that reads exactly like a
// content bug. Found the hard way.
const startMarker = 'const REPO_SAFETY = `';
const start = src.indexOf(startMarker);
if (start === -1) {
  console.error('REFUSED: could not locate the REPO_SAFETY template literal');
  process.exit(2);
}
let i = start + startMarker.length;
for (; i < src.length; i++) {
  if (src[i] === '\\') {
    i++;
    continue;
  }
  if (src[i] === '`') break;
}
if (i >= src.length) {
  console.error('REFUSED: the template literal is unterminated');
  process.exit(2);
}
const literal = src.slice(start + startMarker.length - 1, i + 1);
const rendered = eval(literal);
const escapedBackticks = (rendered.match(/\\`/g) || []).length;
const dollarBraces = (rendered.match(/\$\{/g) || []).length;

console.log(`rendered: ${rendered.length} chars`);
console.log(`residual escaped backticks: ${escapedBackticks}  (0 expected)`);
console.log(`\${ occurrences: ${dollarBraces}  (each must be an intended :? guard)`);
console.log('--- every line mentioning DIR ---');
for (const line of rendered.split('\n')) {
  if (line.includes('DIR')) console.log('  ' + line);
}
const unbraced = rendered
  .split('\n')
  .filter((l) => /"\$DIR"/.test(l) && !/never|not\b/.test(l));
console.log(`--- lines teaching an UNBRACED "$DIR": ${unbraced.length} ---`);
for (const l of unbraced) console.log('  ' + l);
if (escapedBackticks !== 0) process.exit(1);
