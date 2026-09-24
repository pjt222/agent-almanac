/**
 * git-batch.js — one `git cat-file --batch` positional parse (#587).
 *
 * #559 unified this parse across the two blob-pool walkers and said `GIT_BUFFER` was "now
 * declared once". True of the walkers, false of the repo. There were FOUR copies:
 * `normalize-i18n-fences.js` carried one with the older 512 MiB buffer, its own
 * `process.exit(1)` policy and no `batch.error` branch; `backfill-fence-basis.js` carried
 * another — correct policy, old buffer, and DROPPING absences rather than recording them.
 *
 * The fourth was found while writing this file, by grepping for the buffer rather than trusting
 * the count in the issue. The first draft of this header said "three".
 *
 * ## Why the fragment and not the callers
 *
 * The two callers do genuinely different jobs. `walkEnglishHistory` DISCOVERS its specs from
 * `git log`; the normalizer's `readBlobs` already knows the `<commit>:<path>` it wants and is
 * resolving a restore basis. Merging those means one of them grows a mode, which is a design
 * question rather than a rename.
 *
 * The shared part is the parse, and that is exactly where #559's argument lives.
 *
 * ## The line this exists to protect
 *
 * A missing or ambiguous object emits a header and NO body. Failing to advance the index past it
 * shifts every later blob onto the wrong key — a silent, total corruption of the pool. Measured
 * in #559: deleting that skip from one copy changed no test.
 *
 * It is reached whenever history contains a DELETION, which is ordinary: `git log --name-only`
 * lists the deleted path under the commit that removed it, and `<that commit>:<that path>` does
 * not resolve.
 *
 * For the normalizer the consequence is worse than a wrong count. A shifted blob becomes the
 * RESTORE BASIS, so the tool would rewrite a frozen fence to another file's content — and it
 * writes with `--write`. That copy had neither of the tests pinning the walker's.
 */

import { spawnSync } from 'node:child_process';

/**
 * Max stdout from one `git cat-file --batch`.
 *
 * 2 GiB, matching the walker. The normalizer's copy sat at 512 MiB, which #559 had already
 * identified as the older of two values that disagreed "for no reason either could state" — so
 * this is not a considered split being flattened, it is the split being finished. Raising a
 * caller's ceiling cannot break it: `maxBuffer` bounds what the parent will accept, and the
 * failure it prevents is a truncated pool.
 *
 * TWO OTHER `GIT_BUFFER` DECLARATIONS REMAIN, and they are not copies of this one:
 * `lib/git-freshness.js` at 256 MiB for its `git log`, and `check-placeholder-drift.js` at
 * 512 MiB for plain `git` calls. Whether those should also be one number is a separate question
 * about a separate call, and answering it by extension here would be raising ceilings with no
 * reason stated — the thing #559 found had already happened once. Named rather than left to be
 * rediscovered, because an inventory that stops at the copies it happened to notice is the
 * failure this file exists to end.
 */
export const GIT_BUFFER = 2048 * 1024 * 1024;

/**
 * Run `git cat-file --batch` over `specs` and hand each result to `onEntry`.
 *
 * `onEntry(spec, text)` receives `null` for a missing or ambiguous object, so a caller that
 * needs to record the absence can, and one that only wants blobs can skip it. That is the one
 * place the two callers differ: the walker ignores absences, the normalizer records them.
 *
 * THROWS rather than exiting. A library that kills the process denies its caller any chance to
 * add context, and one of these callers is a CLI that wants to print its own message first.
 *
 * @param {string} root - cwd for git
 * @param {string[]} specs - `<commit>:<path>` entries
 * @param {(spec: string, text: string|null) => void} onEntry
 */
export function catFileBatch(root, specs, onEntry) {
  if (!specs.length) return;

  const batch = spawnSync('git', ['cat-file', '--batch'], {
    cwd: root,
    input: Buffer.from(`${specs.join('\n')}\n`, 'utf8'),
    maxBuffer: GIT_BUFFER,
  });

  // Surfaced by name rather than left to the status check. A maxBuffer overflow SIGTERMs the
  // child and leaves `status` null, which `!== 0` happens to catch — but the message would then
  // blame git for failing rather than naming the truncation, and a truncated pool is the one
  // failure here that silently reclassifies files instead of stopping.
  if (batch.error) {
    throw new Error(`git cat-file --batch did not complete (${batch.error.code ?? batch.error.message}). `
      + `If this is ENOBUFS, GIT_BUFFER (${GIT_BUFFER}) is too small for this history.`);
  }
  if (batch.status !== 0) {
    throw new Error(`git cat-file --batch failed: ${batch.stderr?.toString().slice(0, 500)}`);
  }

  const buf = batch.stdout;
  let offset = 0;
  let index = 0;
  while (offset < buf.length && index < specs.length) {
    const newline = buf.indexOf(0x0a, offset);
    if (newline < 0) break;
    const header = buf.slice(offset, newline).toString('utf8');
    offset = newline + 1;
    // THE LINE. See the module header: without the `index += 1` every later blob lands on the
    // wrong key, silently.
    if (/ (missing|ambiguous)$/.test(header)) {
      onEntry(specs[index], null);
      index += 1;
      continue;
    }
    const size = Number.parseInt(header.split(' ')[2], 10);
    if (!Number.isFinite(size)) break;
    onEntry(specs[index], buf.slice(offset, offset + size).toString('utf8'));
    offset += size + 1;
    index += 1;
  }
}
