#!/usr/bin/env node
/**
 * check-line-endings.js — fail if any tracked text file's committed/staged blob
 * contains a CR byte (a Windows CRLF line ending). .gitattributes declares all text
 * as eol=lf, so none should. Binary assets are skipped (`git grep -I`).
 *
 * Mirrors the CI gate (.github/workflows/validate-line-endings.yml). Reads the index
 * (`--cached`), so it is non-mutating and unaffected by unstaged working-tree edits.
 *
 *   node scripts/check-line-endings.js     # exit 0 = clean, exit 1 = CRLF found
 *
 * Repair:  git add --renormalize . && git commit -m "chore: normalize line endings to LF"
 * (If a new file type is flagged, also declare it in .gitattributes as `text eol=lf`.)
 */
import { spawnSync } from 'node:child_process';

// -e '\r' matches a literal CR byte (no PCRE dependency); --cached reads committed blobs.
// `-- :/` anchors the search at the repo root, so the check is the same run from any subdir.
const res = spawnSync('git', ['grep', '--cached', '-I', '-l', '-e', '\r', '--', ':/'], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

// git grep exit codes: 0 = matches found, 1 = none, >1 = error
if (res.error || res.status > 1) {
  console.error(`git grep failed (status ${res.status}): ${res.stderr || res.error}`);
  process.exit(2);
}

const files = (res.stdout || '').trim();
if (!files) {
  console.log('OK: no committed CRLF in tracked text files.');
  process.exit(0);
}

console.error('FAIL: CRLF (Windows) line endings found in committed text files:\n');
console.error(files.split('\n').map((f) => `  ${f}`).join('\n'));
console.error('\nRepair, then commit:');
console.error('    git add --renormalize .');
console.error('    git commit -m "chore: normalize line endings to LF"');
console.error('If a new file type is flagged, also declare it in .gitattributes as `text eol=lf`.');
process.exit(1);
