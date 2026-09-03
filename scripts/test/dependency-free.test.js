/**
 * The dependency-free constraint, tested against node's own resolver (#568).
 *
 * `scripts/check-readme-translation-parity.js` is invoked by integrity check B13, and
 * `.github/workflows/validate-integrity.yml` runs with `setup-node` but deliberately NO
 * `npm ci` — the constraint A8 documents. So that file's TRANSITIVE import closure must stay
 * inside node builtins.
 *
 * Nothing else in the repo can see a violation. Locally `node_modules` exists, so the checker
 * runs and every gate stays green; the failure appears only in CI, as `ERR_MODULE_NOT_FOUND`,
 * in a job whose other checks are unrelated.
 *
 * ## Why this is a probe and not a parser
 *
 * The first version walked the import graph with regexes, and it was the wrong instrument
 * twice over. Anchored patterns missed `import 'pkg';` appended mid-line (caught by
 * mutation-check), and then missed its sibling `import X from 'pkg';` in the same position
 * (caught by review). Both are valid JavaScript that node resolves and the regex did not see.
 * A third patch would have been a third guess.
 *
 * The rule this repo already writes down is: guard by the CONSUMER'S OWN accept-rule, not by
 * a proxy for it. The consumer here is node's module resolver, so the test asks node. It
 * copies `scripts/` somewhere with no `node_modules` ancestry and imports the entry point
 * there — exactly the resolution CI performs. No static form can escape it, including syntax
 * that does not exist yet.
 *
 * `ci-scripts.yml` DOES run `npm ci`, so the test itself has full tooling freedom; it is only
 * the checker's runtime closure that must stay bare.
 *
 * Residual, stated rather than hidden: a resolver probe sees only what is actually imported
 * when the module is evaluated. A dynamic `import()` behind a branch that does not run is
 * invisible to it — and to any static regex that cannot read a computed specifier. The last
 * test covers that gap the only way it can be covered: by refusing to accept a non-literal
 * dynamic import in the closure at all.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, rmSync, readFileSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const SCRIPTS = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Import `entry` from a copy of `scripts/` that has no `node_modules` above it.
 *
 * `--input-type=module -e` with a dynamic import of an absolute path leaves `process.argv[1]`
 * undefined, so the checker's own `argv[1] === this file` guard keeps `main()` from running:
 * module RESOLUTION is exercised, execution is not. That matters because the entry would
 * otherwise fail for want of a README to read, which is not what is being tested.
 *
 * @returns {{status: number, stderr: string}}
 */
function importFromBareTree(entry) {
  // mkdtemp under the OS temp dir, which has no node_modules ancestry. Copying `scripts/`
  // alone is enough — resolution of a bare specifier walks parent directories looking for
  // `node_modules`, and there is none to find.
  const dir = mkdtempSync(join(tmpdir(), 'aa-depfree-'));
  try {
    cpSync(SCRIPTS, join(dir, 'scripts'), { recursive: true });
    const target = join(dir, 'scripts', entry).replace(/\\/g, '/');
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', `await import(${JSON.stringify(`file://${target}`)});`],
      { encoding: 'utf8', cwd: dir },
    );
    return { status: result.status, stderr: result.stderr || '' };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const RESOLUTION_FAILURE = /ERR_MODULE_NOT_FOUND|Cannot find package|Cannot find module/;

test('the parity checker resolves with no node_modules anywhere above it', () => {
  const { stderr } = importFromBareTree('check-readme-translation-parity.js');
  assert.ok(
    !RESOLUTION_FAILURE.test(stderr),
    `B13 would die at module resolution in CI:\n${stderr.split('\n').slice(0, 6).join('\n')}`,
  );
});

test('the A7b and A7c checkers resolve with no node_modules anywhere above them (#773)', () => {
  // Both are invoked by validate-integrity.sh under the same no-`npm ci` constraint as B13.
  // Their `--input-type=module -e` import leaves argv[1] undefined, so their own entry guard
  // keeps main() from running: resolution is exercised, the corpus is not read.
  for (const entry of ['check-workflow-contract.js', 'check-skill-path-refs.js']) {
    const { stderr } = importFromBareTree(entry);
    assert.ok(
      !RESOLUTION_FAILURE.test(stderr),
      `${entry} would die at module resolution in CI:\n${stderr.split('\n').slice(0, 6).join('\n')}`,
    );
  }
});

test('readme-sections.js keeps the zero-import property it claims', () => {
  // Its header asserts "zero imports, a property to preserve, not an accident" — and nothing
  // enforced it. `generate-readmes.js` runs under `npm ci` in every job that invokes it, so
  // adding `import * as yaml from 'js-yaml'` there would leave every gate green. This repo
  // names that shape: a docstring guarantee is an untested assertion.
  const { stderr } = importFromBareTree('lib/readme-sections.js');
  assert.ok(
    !RESOLUTION_FAILURE.test(stderr),
    `readme-sections.js acquired a package dependency:\n${stderr.split('\n').slice(0, 6).join('\n')}`,
  );
});

test('a package import anywhere in that closure is detected (non-vacuity control)', () => {
  // Without this, the test above proves nothing: a probe that silently failed to run the
  // import at all would also produce no resolution error. `generate-readmes.js` imports
  // js-yaml directly, so the bare tree MUST reject it.
  const { stderr } = importFromBareTree('generate-readmes.js');
  assert.ok(
    RESOLUTION_FAILURE.test(stderr),
    `expected the bare tree to reject a js-yaml consumer, got:\n${stderr.slice(0, 400)}`,
  );
  assert.ok(/js-yaml/.test(stderr), 'and it should name the package');
});

test('the audit-skill-sections closure resolves with no node_modules above it', () => {
  // A SECOND pre-`npm ci` closure, and the one #559 grew. `.github/workflows/validate-skills.yml`
  // runs `node scripts/audit-skill-sections.js --missing` at step 57, with `npm ci` not until
  // step 123 — so everything that entry can reach must resolve against the bare tree.
  //
  // #559 extended that closure without extending this probe: audit-skill-sections imports
  // `toLines` from `lib/fences.js`, which now pulls in `lib/english-history.js` and
  // `lib/content-paths.js`. Both headers assert they take no package imports, and until this
  // test that assertion was exactly the untested docstring guarantee the walker's own header
  // warns about ("a walker is exactly the kind of module someone would later reach for a YAML
  // parser inside"). The failure would be CI-only and would land on an unrelated PR.
  const { stderr } = importFromBareTree('audit-skill-sections.js');
  assert.ok(
    !RESOLUTION_FAILURE.test(stderr),
    `validate-skills.yml step 1 would die at module resolution:\n${stderr.split('\n').slice(0, 6).join('\n')}`,
  );
});

test('the walker and its path module resolve standalone, not only via their consumer', () => {
  // Entry-point-only probing hides a dependency that a *different* consumer would hit first.
  // Probe each new module directly as well.
  for (const entry of ['lib/english-history.js', 'lib/content-paths.js']) {
    const { stderr } = importFromBareTree(entry);
    assert.ok(
      !RESOLUTION_FAILURE.test(stderr),
      `${entry} acquired a package dependency:\n${stderr.split('\n').slice(0, 6).join('\n')}`,
    );
  }
});

test('the control also proves TRANSITIVE detection, not just direct imports', () => {
  // `generate-translation-status.js` reaches js-yaml both directly and through relative
  // modules; the point here is that a package reached along a relative edge is caught too,
  // which is the case a single-file scan would miss.
  const { stderr } = importFromBareTree('generate-translation-status.js');
  assert.ok(RESOLUTION_FAILURE.test(stderr));
});

test('no module in the checker closure uses a non-literal dynamic import or require', () => {
  // The one gap a resolver probe cannot close: an `import()` behind a branch that did not run
  // is invisible to it, and a computed specifier is invisible to any static reader. So the
  // closure is required not to contain one at all. Narrow by design — it scans only the files
  // the checker can reach, so unrelated scripts stay free to do as they like.
  const closure = ['check-readme-translation-parity.js', 'lib/content-types.js'];

  // Guard the guard: if the closure list ever drifts from reality, this scans the wrong files
  // and reports clean. Anchor it to something that fails when the closure grows.
  const entry = readFileSync(join(SCRIPTS, 'check-readme-translation-parity.js'), 'utf8');
  const relativeImports = [...entry.matchAll(/from\s*['"](\.[^'"]+)['"]/g)].map((m) => m[1]);
  assert.deepEqual(relativeImports, ['./lib/content-types.js'],
    'the checker\'s relative imports changed — update the closure list above');

  for (const file of closure) {
    const source = readFileSync(join(SCRIPTS, file), 'utf8');
    // A literal specifier is fine; anything else cannot be reasoned about statically.
    const suspicious = [...source.matchAll(/\b(?:import|require)\s*\(\s*([^'")\s])/g)];
    assert.deepEqual(suspicious.map((m) => m[0]), [],
      `${file} contains a dynamic import/require with a non-literal specifier`);
  }
});

test('the scripts directory copy used by the probe is real', () => {
  // A cpSync that silently copied nothing would make every probe above pass by not looking.
  const dir = mkdtempSync(join(tmpdir(), 'aa-depfree-sanity-'));
  try {
    cpSync(SCRIPTS, join(dir, 'scripts'), { recursive: true });
    const copied = readdirSync(join(dir, 'scripts'));
    assert.ok(copied.includes('check-readme-translation-parity.js'));
    assert.ok(copied.includes('lib'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
