#!/usr/bin/env node
/**
 * Assert that the publish gate is wired such that it cannot silently resolve to nothing.
 *
 * Wired as npm's `pretest:cli` hook, so the check runs before the CLI suite on every
 * `npm run test:cli` — and therefore also inside `prepublishOnly`, which delegates to
 * that script. That puts it on the operator's machine immediately before the
 * `npm publish` PUT, which is the moment it exists for.
 *
 * The rule itself lives in `scripts/lib/publish-gate.js`, shared with
 * `scripts/test/publish-gate.test.js`. Writing it twice would reintroduce exactly the
 * duplicate-spelling defect (#697) this is here to prevent.
 *
 * ## `--root`, and why a checker takes one
 *
 * Without it, this file's FAILURE branch is unreachable by any test: on a green
 * repository `problems` is always empty, so `process.exit(1)` never runs — not in the
 * suite, not in `npm test`, not in CI. Deleting that line, or softening it to a
 * `process.exitCode` inside a swallowed branch, would survive every gate while the
 * operator-machine leg of the check failed open and reported to a console nobody reads.
 * This repo has a name for that shape: a dry run that reports green over a dead token
 * answers nothing (#681).
 *
 * So the root is a parameter, and `scripts/test/publish-gate.test.js` spawns this script
 * against a deliberately broken fixture to prove the red path is real. The flag widens
 * nothing: it points the SAME rule at a different tree, and the binding check — the one
 * that decides whether this repository is wired correctly — is the live test in CI,
 * which passes no root at all.
 */
import { inspectPublishGate, repoRootFromHere } from './lib/publish-gate.js';

const rootFlag = process.argv.slice(2).find((arg) => arg.startsWith('--root='));
const repoRoot = rootFlag ? rootFlag.slice('--root='.length) : repoRootFromHere(import.meta.url);

const { problems, naming, named } = inspectPublishGate(repoRoot);

if (problems.length > 0) {
  console.error('ERROR: the publish gate is not wired safely.\n');
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    '\nThis runs as `pretest:cli`, so it also guards `prepublishOnly` — the last check ' +
    'before an npm publish PUT.',
  );
  process.exit(1);
}

console.log(
  `publish gate: ${named.length} CLI suite file(s) named once, by "${naming[0]}"; ` +
  'prepublishOnly delegates.',
);
