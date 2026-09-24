// Measure the enumerator's cost against the readdirSync it replaced, on the real corpus,
// with the real call pattern generate-readmes.js now makes.
//
// Run from the repository root:  node <this file>
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { topLevelEntries } from '../../../scripts/lib/git-files.js';

// Derived, never hardcoded: an absolute path measures whatever branch the author happens to have
// checked out, not the revision this script was committed at — and the first version of this
// file could not run at its own sha at all, because it imported a function the same PR deleted.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
// From `_config.yml`, as the generator does — NOT from the directories under `i18n/`. Those
// differ: the directory scan picks up `glossaries`, which is not a locale, so the probe was
// measuring 11 locales where the generator iterates 10. The four extra sites are absent
// directories that spawn no git process, so the timings stood while the site COUNT did not
// (#874 review, N3).
const LOCALES = readFileSync(resolve(ROOT, 'i18n/_config.yml'), 'utf8')
  .split('\n')
  .map((line) => /^\s+-\s+code:\s*"?([\w-]+)"?/.exec(line))
  .filter(Boolean)
  .map((m) => m[1]);
const TYPES = ['skills', 'agents', 'teams', 'guides'];

// Exactly what the generator asks for now: two top-level counts plus one per locale per type.
const SITES = ['scripts', 'workflows',
  ...LOCALES.flatMap((l) => TYPES.map((t) => `i18n/${l}/${t}`))];

function timed(label, fn) {
  const t0 = process.hrtime.bigint();
  const n = fn();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  console.log(`${label.padEnd(28)} ${ms.toFixed(0).padStart(7)} ms   (${n} entries seen)`);
  return ms;
}

const gitMs = timed('git-backed (topLevelEntries)', () => {
  let n = 0;
  for (const site of SITES) {
    const { files, dirs } = topLevelEntries(ROOT, site);
    n += files.length + dirs.length;
  }
  return n;
});

const diskMs = timed('readdirSync (what it replaced)', () => {
  let n = 0;
  for (const site of SITES) {
    try {
      n += readdirSync(resolve(ROOT, site)).length;
    } catch { /* absent site: the generator guarded these too */ }
  }
  return n;
});

console.log(`\nsites measured: ${SITES.length} (2 top-level + ${LOCALES.length} locales x ${TYPES.length} types)`);
console.log(`delta: ${(gitMs - diskMs).toFixed(0)} ms over the whole generator run`);
