#!/usr/bin/env node
/**
 * check-publishable-tree.js — refuse a pack whose contents would differ from the release (#876).
 *
 * ## The defect
 *
 * With a `files` array and no `.npmignore`, **npm packs the working tree**. It does not honour
 * `.gitignore`. Measured during the #874 review, in a clone carrying the #872 artefact plus an
 * untracked sibling:
 *
 *     packed files: 621
 *     pycache in pack: [".../__pycache__/evil.py", ".../__pycache__/repro.pyc"]
 *     fresh-untracked in pack: [".../fresh-untracked.py"]
 *
 * So a maintainer who has imported a Python asset — which writes a `__pycache__/` beside it — and
 * then runs `npm publish` from that tree ships the bytecode. The RELEASE is unaffected, because
 * `release.yml` packs from an `actions/checkout` of a commit, where the working tree IS the
 * tracked set. This is the local-publish path only, and it is silent: nothing in `npm publish`
 * prints what it decided not to exclude.
 *
 * ## Why not a `files` negation
 *
 * A `files` negation matching `__pycache__` at any depth is the obvious repair. It is spelled
 * here in words rather than as a glob, because a double-star followed by a slash closes this
 * comment block — the same trap that makes `skills/<id>/SKILL.md` unwritable in one.
 * `scripts/lib/skills-inventory.js`'s `assertInterpretable` REFUSES such a pattern, correctly: that module models npm's negations as "trailing
 * slash means prefix, otherwise exact path", npm expands the glob, and the two would disagree in
 * silence — publishing a file count that is wrong in the quiet direction. Teaching the module the
 * pattern is a separate change with its own measurement against `npm pack --dry-run`.
 *
 * ## What this refuses
 *
 * Two classes, named separately because they have different fixes:
 *
 *   IGNORED    a path git ignores, under a shipped directory. `rm` it, or publish from a clean
 *              clone. This is #876's case.
 *   UNTRACKED  a path git does not know about, under a shipped directory. Commit it or remove
 *              it. Same mechanism — npm packs the disk — and the same divergence from the
 *              release, so refusing one without the other would leave half the hole open.
 *
 * `-uall` is the load-bearing flag, and `--ignored=matching` is a precision choice. Measured on
 * git 2.43 over the three shapes this check meets (an ignored file in a tracked directory, a
 * wholly-ignored directory, an untracked file in an untracked one):
 *
 *     with -uall      matching and traditional agree on the VERDICT; they differ only in
 *                     whether a wholly-ignored directory prints as `__pycache__/` or as the
 *                     `.pyc` inside it. Both name something real, so either would refuse.
 *     without -uall   an untracked file collapses to its DIRECTORY (`skills/fresh/`), and
 *                     traditional prints `skills/real/references/` — a path that is not itself
 *                     ignored — for the `__pycache__` case. Still refuses; names the wrong
 *                     thing to delete.
 *
 * So the fixture pins the reported PATH, not just the refusal: an operator who is told a
 * directory when a single file is the problem goes looking in the wrong place. An earlier
 * version of this comment claimed `matching` was what listed a nested ignored file
 * individually; a surviving mutant showed no test could tell the two apart, and the measurement
 * showed the claim was false with `-uall` set.
 *
 * ## Where it runs
 *
 * `prepack`, so it fires on `npm publish` and `npm pack` and NOT in a consumer's tree —
 * `prepack` is not one of `skills-inventory.js`'s `INSTALL_HOOKS` (`preinstall`, `install`,
 * `postinstall`, `prepare`), and SECURITY.md's claim that nothing here executes on install stays
 * true. `--check` is the same thing without the hook, for CI and for a human.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** The `files` entries that are INCLUSIONS, with negations dropped — what npm would pack from. */
export function shippedPaths(root = ROOT) {
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  return (pkg.files ?? []).filter((entry) => !entry.startsWith('!'));
}

/**
 * Paths under `shipped` that git ignores or does not know about.
 *
 * Returns `{ ignored, untracked }`, both sorted. A git failure THROWS rather than returning
 * empty: an empty answer here reads as "the tree is clean", which is the publish this check
 * exists to refuse.
 */
export function divergentPaths(root = ROOT, shipped = shippedPaths(root)) {
  if (shipped.length === 0) return { ignored: [], untracked: [] };
  let out;
  try {
    out = execFileSync(
      'git',
      ['status', '--porcelain', '--ignored=matching', '-uall', '--', ...shipped],
      { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] },
    );
  } catch (error) {
    const stderr = String(error?.stderr ?? '').trim();
    throw new Error(
      `git status failed in ${root}${stderr ? `: ${stderr}` : `: ${error.message}`}. Refusing to `
      + 'report a clean tree, which is exactly the publish this check exists to refuse.',
    );
  }

  const ignored = [];
  const untracked = [];
  for (const line of out.split('\n')) {
    if (!line) continue;
    const code = line.slice(0, 2);
    const path = line.slice(3);
    if (code === '!!') ignored.push(path);
    else if (code === '??') untracked.push(path);
  }
  return { ignored: ignored.sort(), untracked: untracked.sort() };
}

/** The report, as printable lines. Pure, so a test can assert the wording without a fixture. */
export function report({ ignored, untracked }) {
  if (ignored.length === 0 && untracked.length === 0) {
    return ['OK: nothing under the shipped paths is ignored or untracked; a pack here matches the commit.'];
  }
  const lines = [];
  if (ignored.length) {
    lines.push(`REFUSED: ${ignored.length} IGNORED path(s) under a shipped directory would be packed:`);
    for (const path of ignored.slice(0, 20)) lines.push(`  !! ${path}`);
    if (ignored.length > 20) lines.push(`  … and ${ignored.length - 20} more`);
  }
  if (untracked.length) {
    lines.push(`REFUSED: ${untracked.length} UNTRACKED path(s) under a shipped directory would be packed:`);
    for (const path of untracked.slice(0, 20)) lines.push(`  ?? ${path}`);
    if (untracked.length > 20) lines.push(`  … and ${untracked.length - 20} more`);
  }
  lines.push('');
  lines.push('npm packs the WORKING TREE under a `files` array — it does not honour .gitignore —');
  lines.push('so this pack would differ from what CI publishes, which packs a commit. Remove the');
  lines.push('paths above, commit them, or publish from a clean clone.');
  return lines;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const lines = report(divergentPaths());
  const refused = lines.some((line) => line.startsWith('REFUSED:'));
  for (const line of lines) (refused ? console.error : console.log)(line);
  process.exitCode = refused ? 1 : 0;
}
