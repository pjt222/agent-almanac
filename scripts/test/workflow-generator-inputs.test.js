/**
 * Unit tests for `scripts/check-workflow-generator-inputs.js` (#618).
 *
 * The envelope proves the check goes red against the real repo. These cover the parsing
 * decisions underneath, on synthetic trees, because each is a way the check could report
 * `0 unlisted` while having read almost nothing — and on a gate, a wrong all-clear is worse
 * than no gate.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rmTree } from './_tmp.js';

const CHECK = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'check-workflow-generator-inputs.js');

const WORKFLOW = (paths, steps) => `name: Update READMEs
on:
  push:
    branches: [main]
    paths:
${paths.map((p) => `      - '${p}'`).join('\n')}
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
${steps.map((s) => `      - run: ${s}`).join('\n')}
      # The real update-readmes.yml commits its output, and the declared-skip path in
      # assertHealersDeclared is only load-bearing because of it. A fixture without this
      # line lets that guard be deleted with every test still green (found by mutation).
      - uses: stefanzweifel/git-auto-commit-action@v6
`;

/** Build a throwaway tree and run the check over it. */
function run({ paths, steps, files, scripts = {}, warn = false, extraWorkflows = {}, omitExternalPublisher = false }) {
  const dir = mkdtempSync(join(tmpdir(), 'gen-inputs-'));
  try {
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    // The checker declares `publish-hermes-profile.yml` an external publisher and refuses when
    // it is missing, so every fixture carries a valid one unless a test says otherwise. Written
    // BEFORE extraWorkflows so a test's own copy under that name wins.
    if (!omitExternalPublisher) {
      writeFileSync(join(dir, '.github/workflows/publish-hermes-profile.yml'), externalPublisher(READ_ONLY));
    }
    for (const [name, body] of Object.entries(extraWorkflows)) {
      writeFileSync(join(dir, '.github/workflows', name), body);
    }
    mkdirSync(join(dir, 'scripts/lib'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/update-readmes.yml'), WORKFLOW(paths, steps));
    writeFileSync(join(dir, 'package.json'), JSON.stringify({ scripts }, null, 2));
    for (const [name, body] of Object.entries(files)) {
      // mkdir the parent of every fixture, not just `scripts/lib` — a fixture that needs a nested
      // directory should express that in its own path rather than in the helper.
      mkdirSync(dirname(join(dir, name)), { recursive: true });
      writeFileSync(join(dir, name), body);
    }
    let output;
    let status = 0;
    try {
      const argv = warn ? [CHECK, '--root', dir, '--warn'] : [CHECK, '--root', dir];
      output = execFileSync('node', argv, { cwd: dir, encoding: 'utf8' });
    } catch (error) {
      output = `${error.stdout || ''}${error.stderr || ''}`;
      status = error.status;
    }
    return { output, status };
  } finally {
    rmTree(dir);
  }
}

const BASE = {
  paths: ['scripts/generate-readmes.js', 'scripts/lib/a.js'],
  steps: ['node scripts/generate-readmes.js'],
  files: {
    'scripts/generate-readmes.js': "import { a } from './lib/a.js';\nconsole.log(a);\n",
    'scripts/lib/a.js': 'export const a = 1;\n',
  },
};

test('a fully listed graph passes', () => {
  const { output, status } = run(BASE);
  assert.equal(status, 0);
  assert.match(output, /; 0 unlisted$/m);
});

test('an exported function whose body quotes a dotted string is not read as an import', () => {
  // Found by #672. The specifier class spans newlines on purpose, so that multi-line
  // `import {\n a,\n} from './x.js'` is covered without an `s` flag. Unanchored, it ran from
  // the `export` keyword straight into the function BODY and took the first quoted string:
  //
  //     export function isExcludedId(id) {
  //       const stem = id.endsWith('.md') ? …
  //
  // was read as an import of `./lib/.md`, which does not exist, so the check hard-refused --
  // exit 1 even under `--warn`, in a REQUIRED context. Nothing in the repo had exported such a
  // function before, so the bug shipped latent and fired on an unrelated PR.
  const { output, status } = run({
    ...BASE,
    files: {
      ...BASE.files,
      'scripts/lib/a.js':
        "export function a(id) {\n  const stem = id.endsWith('.md') ? id : id;\n  return stem;\n}\n",
    },
  });
  assert.equal(status, 0, output);
  assert.match(output, /; 0 unlisted$/m);
  assert.doesNotMatch(output, /\.md/, 'a quoted literal in a function body reached the graph');
});

test('the word `from` inside a COMMENT is not read as an import specifier', () => {
  // The residual class after the first fix, found by an adversarial reviewer who named the
  // experiment rather than asserting it. Anchoring the specifier on `from` narrowed the class
  // but did not close it: the span before `from` was still `[^'"]*?`, so any line-start
  // `export`/`import` whose text contained the word `from` before a dotted quoted string
  // matched. The planted line reproduced the SAME hard refusal as the original bug.
  //
  // Closed by constraining that span to what an import CLAUSE can contain.
  const { output, status } = run({
    ...BASE,
    files: {
      ...BASE.files,
      'scripts/lib/a.js':
        "export const a = 1; // adapted from './nowhere.js'\nexport const b = a;\n",
    },
  });
  assert.equal(status, 0, output);
  assert.match(output, /; 0 unlisted$/m);
  assert.doesNotMatch(output, /nowhere/, 'a comment reached the import graph');
});

test('a statement with `from` in it is not an import either', () => {
  // Same class, without a comment: the span must exclude `=` and `;`, not merely sit before a
  // `from`. Kept separate so a fix that special-cases comments cannot pass this one.
  const { output, status } = run({
    ...BASE,
    files: {
      ...BASE.files,
      'scripts/lib/a.js':
        "export const a = pickFrom('./nowhere.js');\nexport const b = a;\n"
        + "function pickFrom(x) { return x; }\n",
    },
  });
  assert.equal(status, 0, output);
  assert.doesNotMatch(output, /nowhere/, 'a call expression reached the import graph');
});

test('the import forms the tightened class must still admit', () => {
  // The narrowing direction, checked on the shapes a real module uses. Each target is
  // UNLISTED, so a regex that missed it would report `0 unlisted` and pass — the false PASS
  // this gate's header calls worse than having no gate.
  for (const [label, source] of [
    ['aliased re-export', "export { a as b } from './lib/x.js';\n"],
    ['default plus named', "import d, { a } from './lib/x.js';\nconsole.log(d, a);\n"],
    ['namespace', "import * as ns from './lib/x.js';\nconsole.log(ns);\n"],
    ['star re-export', "export * from './lib/x.js';\n"],
  ]) {
    const { output, status } = run({
      ...BASE,
      // `scripts/lib/a.js` stays listed; `x.js` is the UNLISTED target, so the check must
      // REPORT it. That is what proves the specifier was found: a regex that missed it would
      // report `0 unlisted` and pass.
      paths: ['scripts/generate-readmes.js', 'scripts/lib/a.js'],
      files: {
        ...BASE.files,
        'scripts/generate-readmes.js': source,
        'scripts/lib/x.js': 'export const a = 1;\nexport default a;\n',
      },
    });
    assert.equal(status, 1, `${label}: ${output}`);
    assert.match(output, /scripts\/lib\/x\.js is imported by this workflow/, label);
  }
});

test('a MULTI-LINE import is still followed after that fix', () => {
  // The narrowing direction, and the reason the fix anchors on `from` rather than forbidding
  // the newline. A smaller reachable set means fewer required trigger paths -- a FALSE PASS on
  // a gate whose header calls a wrong all-clear worse than no gate.
  //
  // The target must be UNLISTED. A first version imported a module `BASE.paths` already
  // listed, so dropping the specifier changed no output and the naive `[^'"\n]*` narrowing
  // SURVIVED this test. Measured, not assumed.
  const { output, status } = run({
    ...BASE,
    files: {
      ...BASE.files,
      'scripts/generate-readmes.js':
        "import {\n  m,\n} from './lib/multi.js';\nconsole.log(m);\n",
      'scripts/lib/multi.js': 'export const m = 1;\n',
    },
  });
  assert.equal(status, 1, output);
  assert.match(output, /scripts\/lib\/multi\.js is imported by this workflow/);
});

test('a BARE side-effect import, which has no `from`, is still followed', () => {
  // The reason the `from` group is optional rather than required. Same unlisted-target rule.
  const { output, status } = run({
    ...BASE,
    files: {
      ...BASE.files,
      'scripts/generate-readmes.js': "import './lib/side.js';\nconsole.log(1);\n",
      'scripts/lib/side.js': 'export const s = 1;\n',
    },
  });
  assert.equal(status, 1, output);
  assert.match(output, /scripts\/lib\/side\.js is imported by this workflow/);
});

test('a transitive import that nobody listed is reported', () => {
  // The #618 shape exactly: both endpoints listed, the middle skipped.
  const { output, status } = run({
    ...BASE,
    files: {
      ...BASE.files,
      'scripts/lib/a.js': "import { b } from './b.js';\nexport const a = b;\n",
      'scripts/lib/b.js': 'export const b = 2;\n',
    },
  });
  assert.equal(status, 1);
  assert.match(output, /scripts\/lib\/b\.js is imported by this workflow/);
});

test('an unparseable paths: filter fails instead of reporting nothing missing', () => {
  // The vacuous pass. The reachable set is still computed and non-empty, so a naive
  // implementation reports `0 unlisted` over a filter it never read.
  const dir = mkdtempSync(join(tmpdir(), 'gen-inputs-'));
  try {
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    mkdirSync(join(dir, 'scripts/lib'), { recursive: true });
    writeFileSync(
      join(dir, '.github/workflows/update-readmes.yml'),
      WORKFLOW(BASE.paths, BASE.steps).replace('    paths:', '    pathz:')
    );
    writeFileSync(join(dir, 'package.json'), '{"scripts":{}}');
    for (const [name, body] of Object.entries(BASE.files)) writeFileSync(join(dir, name), body);
    let status = 0;
    let output = '';
    try {
      output = execFileSync('node', [CHECK, '--root', dir], { cwd: dir, encoding: 'utf8' });
    } catch (error) {
      output = `${error.stdout || ''}${error.stderr || ''}`;
      status = error.status;
    }
    assert.equal(status, 1);
    assert.match(output, /no push paths: entries parsed/);
  } finally {
    rmTree(dir);
  }
});

test('a `bash <script>` step must resolve rather than shrinking the graph', () => {
  // The silent-shrink direction. With the step skipped, everything still reachable is listed,
  // so the summary would read `0 unlisted` over a fraction of the job.
  const { output, status } = run({ ...BASE, steps: [...BASE.steps, 'bash scripts/other.sh'] });
  assert.equal(status, 1);
  assert.match(output, /could not be resolved to a script or recognised as a non-entry/);
});

test('`npm ci` is a recognised non-entry and does not fail', () => {
  const { status } = run({ ...BASE, steps: ['npm ci', ...BASE.steps] });
  assert.equal(status, 0);
});

test('`npm run <name>` resolves through package.json', () => {
  const { output, status } = run({
    paths: ['scripts/gen.js'],
    steps: ['npm run gen'],
    scripts: { gen: 'node scripts/gen.js' },
    files: { 'scripts/gen.js': 'console.log(1);\n' },
  });
  assert.equal(status, 0);
  assert.match(output, /\b1 entry point\(s\)/);
});

test('`npm run <name>` naming an undefined script fails', () => {
  const { output, status } = run({ ...BASE, steps: ['npm run nope'] });
  assert.equal(status, 1);
  assert.match(output, /undefined package script/);
});

test('a `**` glob entry covers files beneath it', () => {
  const { status } = run({ ...BASE, paths: ['scripts/**'] });
  assert.equal(status, 0);
});

test('a negation entry never counts as coverage', () => {
  // `- '!scripts/lib/a.js'` is an EXCLUSION in GitHub's filter syntax. Treating it as a match
  // would report a deliberately-excluded input as covered — the inverse of the truth.
  const { output, status } = run({
    ...BASE,
    paths: ['scripts/generate-readmes.js', '!scripts/lib/a.js'],
  });
  assert.equal(status, 1);
  assert.match(output, /scripts\/lib\/a\.js is imported by this workflow/);
});

test('a bare package specifier is not walked', () => {
  // Packages are covered by the package.json / package-lock.json entries the filter already
  // carries; trying to resolve them would throw on the first `node:` builtin.
  const { status } = run({
    ...BASE,
    files: {
      ...BASE.files,
      'scripts/generate-readmes.js':
        "import { readFileSync } from 'node:fs';\nimport * as yaml from 'js-yaml';\nimport { a } from './lib/a.js';\nconsole.log(readFileSync, yaml, a);\n",
    },
  });
  assert.equal(status, 0);
});

test('a `run: |` block scalar is expanded line by line', () => {
  // Five workflows in this repo use block scalars. Without the block branch the `|` is captured
  // as the command and null-drops through the not-a-launcher pass, so the body goes unscanned and
  // the run fails with `no node entry point resolved` — red, but for a reason that reads as the
  // CHECK being broken rather than as the step being unlisted. (The first version of this comment
  // claimed the naive mutant throws "could not be resolved"; traced, it does not.)
  const dir = mkdtempSync(join(tmpdir(), 'gen-inputs-'));
  try {
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    mkdirSync(join(dir, 'scripts/lib'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/publish-hermes-profile.yml'), externalPublisher(READ_ONLY));
    writeFileSync(join(dir, '.github/workflows/update-readmes.yml'), `name: Update READMEs
on:
  push:
    branches: [main]
    paths:
      - 'scripts/gen.js'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: |
          npm ci
          node scripts/gen.js
`);
    writeFileSync(join(dir, 'package.json'), '{"scripts":{}}');
    writeFileSync(join(dir, 'scripts/gen.js'), 'console.log(1);\n');
    const output = execFileSync('node', [CHECK, '--root', dir], { cwd: dir, encoding: 'utf8' });
    assert.match(output, /\b1 entry point\(s\)/);
    assert.match(output, /; 0 unlisted$/m);
  } finally {
    rmTree(dir);
  }
});

test('shell control flow inside a block is not mistaken for an entry point', () => {
  // Expanding validate-skills.yml's blocks yields 67 lines, most of them `failed=0`, `fi`,
  // `for dir in skills/*/; do`. Treating each as an unresolvable entry point would bury the one
  // real finding under sixty errors, which is how a check gets switched off.
  const dir = mkdtempSync(join(tmpdir(), 'gen-inputs-'));
  try {
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/publish-hermes-profile.yml'), externalPublisher(READ_ONLY));
    writeFileSync(join(dir, '.github/workflows/update-readmes.yml'), `name: Update READMEs
on:
  push:
    branches: [main]
    paths:
      - 'scripts/gen.js'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - run: |
          failed=0
          for dir in scripts/*/; do
            [ -d "$dir" ] || continue
          done
          node scripts/gen.js
          exit $failed
`);
    writeFileSync(join(dir, 'package.json'), '{"scripts":{}}');
    writeFileSync(join(dir, 'scripts/gen.js'), 'console.log(1);\n');
    const output = execFileSync('node', [CHECK, '--root', dir], { cwd: dir, encoding: 'utf8' });
    assert.match(output, /\b1 entry point\(s\)/);
  } finally {
    rmTree(dir);
  }
});

test('`bash <script>` is an invoker and must resolve — a shell script can run node', () => {
  const { output, status } = run({ ...BASE, steps: [...BASE.steps, 'bash scripts/helper.sh'] });
  assert.equal(status, 1);
  assert.match(output, /could not be resolved/);
});

test('an `npm run` naming a non-node script still fails — the invoker pass is workflow-level only', () => {
  // The regression this pins: adding the "not a launcher" pass made `npm run x` -> `echo skipped`
  // resolve to null instead of throwing, silently dropping an entry point. A step that names a
  // package script has declared intent to run it; only the workflow's own shell fragments get
  // the pass.
  const { output, status } = run({
    ...BASE,
    steps: ['npm run gen'],
    scripts: { gen: 'echo skipped' },
  });
  assert.equal(status, 1);
  assert.match(output, /could not be resolved/);
});

// ── holes an adversarial review found, each now closed and pinned ───────────

test('a `**` in the MIDDLE respects the suffix after it', () => {
  // `i18n/**/*.md` is a live entry. The first version reduced any `**` entry to the prefix
  // before it, so it read as "anything under i18n/" and would have called a future
  // `i18n/x.js` covered when GitHub's `*.md` suffix would not trigger on it. FALSE PASS.
  const out = run({
    paths: ['scripts/gen.js', 'lib/**/*.md'],
    steps: ['node scripts/gen.js'],
    files: {
      'scripts/gen.js': "import { a } from '../lib/deep/a.js';\nconsole.log(a);\n",
      'lib/deep/a.js': 'export const a = 1;\n',
    },
  });
  assert.equal(out.status, 1);
  assert.match(out.output, /lib\/deep\/a\.js is imported by this workflow/);
});

test('a single `*` does not cross a directory separator', () => {
  const shallow = run({
    paths: ['scripts/*.js'],
    steps: ['node scripts/gen.js'],
    files: { 'scripts/gen.js': 'console.log(1);\n' },
  });
  assert.equal(shallow.status, 0);
});

test('a negation REVOKES an earlier glob grant', () => {
  // GitHub applies the filter in order. Returning false for every negation is the right half —
  // a negation never grants — and dropping the other half meant `['scripts/**', '!scripts/lib/a.js']`
  // granted `a.js` via the glob while GitHub excludes it. FALSE PASS.
  const out = run({
    paths: ['scripts/**', '!scripts/lib/a.js'],
    steps: ['node scripts/generate-readmes.js'],
    files: BASE.files,
  });
  assert.equal(out.status, 1);
  assert.match(out.output, /scripts\/lib\/a\.js is imported by this workflow/);
});

test('a compound `&&` command resolves EVERY segment, not just the head', () => {
  // `node a.js && node b.js` resolved to `a.js` alone, with no error — a half-recognised command
  // is a silent partial skip, which is what this file's doctrine says must never happen. The live
  // shape exists in package.json's own `test` script.
  const out = run({
    paths: ['scripts/a.js'],
    steps: ['node scripts/a.js && node scripts/b.js'],
    files: { 'scripts/a.js': 'console.log(1);\n', 'scripts/b.js': 'console.log(2);\n' },
  });
  assert.equal(out.status, 1);
  assert.match(out.output, /scripts\/b\.js is imported by this workflow/);
});

test('a non-npm launcher is not silently skipped', () => {
  // `yarn`, `pnpm`, `python`, `make` fell through the not-a-launcher pass and vanished from the
  // graph with no error unless they were the only entry.
  const out = run({ ...BASE, steps: [...BASE.steps, 'python scripts/gen.py'] });
  assert.equal(out.status, 1);
  assert.match(out.output, /could not be resolved/);
});

test('`export … from` is an edge like `import`', () => {
  // A re-exporting barrel module is in the graph and its own changes move generated output.
  const out = run({
    paths: ['scripts/generate-readmes.js'],
    steps: ['node scripts/generate-readmes.js'],
    files: {
      'scripts/generate-readmes.js': "export { a } from './lib/a.js';\n",
      'scripts/lib/a.js': 'export const a = 1;\n',
    },
  });
  assert.equal(out.status, 1);
  assert.match(out.output, /scripts\/lib\/a\.js is imported by this workflow/);
});

test('a `run: |2` block header is still recognised as a block', () => {
  // An explicit indentation indicator is legal YAML. Without it the INLINE regex captured `|2`
  // as the command, which null-dropped, and the whole block body went unscanned — silently, so
  // long as the job had one other resolving entry.
  const dir = mkdtempSync(join(tmpdir(), 'gen-inputs-'));
  try {
    mkdirSync(join(dir, '.github/workflows'), { recursive: true });
    mkdirSync(join(dir, 'scripts'), { recursive: true });
    writeFileSync(join(dir, '.github/workflows/publish-hermes-profile.yml'), externalPublisher(READ_ONLY));
    writeFileSync(join(dir, '.github/workflows/update-readmes.yml'), `name: Update READMEs
on:
  push:
    branches: [main]
    paths:
      - 'scripts/listed.js'
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - run: node scripts/listed.js
      - run: |2
          node scripts/hidden.js
`);
    writeFileSync(join(dir, 'package.json'), '{"scripts":{}}');
    writeFileSync(join(dir, 'scripts/listed.js'), 'console.log(1);\n');
    writeFileSync(join(dir, 'scripts/hidden.js'), 'console.log(2);\n');
    let status = 0;
    let output = '';
    try {
      output = execFileSync('node', [CHECK, '--root', dir], { cwd: dir, encoding: 'utf8' });
    } catch (error) {
      output = `${error.stdout || ''}${error.stderr || ''}`;
      status = error.status;
    }
    assert.equal(status, 1);
    assert.match(output, /scripts\/hidden\.js is imported by this workflow/);
  } finally {
    rmTree(dir);
  }
});

test('`--warn` downgrades findings but NEVER a structural refusal', () => {
  // Same rule as `assertNotShallow`: a warn-only run over a filter the check could not read
  // would not warn less, it would lie.
  const finding = run({
    ...BASE,
    paths: ['scripts/generate-readmes.js'],
    warn: true,
  });
  assert.equal(finding.status, 0, 'an unlisted module is a finding, downgradable by --warn');

  const refusal = run({ ...BASE, steps: ['npm run nope'], warn: true });
  assert.equal(refusal.status, 1, 'an unresolvable step is a refusal and must stay non-zero');
  assert.match(refusal.output, /structural refusal/);
});

test('a bare `--root` with no value exits 2 rather than crashing', () => {
  let status = 0;
  let output = '';
  try {
    output = execFileSync('node', [CHECK, '--root'], { encoding: 'utf8' });
  } catch (error) {
    output = `${error.stdout || ''}${error.stderr || ''}`;
    status = error.status;
  }
  assert.equal(status, 2);
  assert.match(output, /--root needs a value/);
});

// ── the healer DECLARATION is itself checked (#663) ─────────────────────────
//
// Without these, `assertHealersDeclared` shipped with an envelope run by hand and nothing
// re-proving it afterwards. This repo has a name for that: a manual break-and-check proves
// the feature, not the coverage — #458 verified an exit code end to end by hand, wrote it
// into the commit, and deleting the fix line still left all 101 tests green.

/** A workflow that commits, in the form workflows actually use. */
const BLOCK_SCALAR_COMMITTER = `name: Commits Things
on:
  push:
    branches: [main]
jobs:
  go:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: |
          git config user.name bot
          git add -A && git commit -m update
          git push
`;

const ACTION_COMMITTER = `name: Commits Things
on:
  push:
    branches: [main]
jobs:
  go:
    runs-on: ubuntu-latest
    steps:
      - uses: stefanzweifel/git-auto-commit-action@v6
`;

test('an undeclared healer using a BLOCK-SCALAR git push is refused', () => {
  // The form that matters, and the one the first version of this signal could not see: the
  // `run:` line carries no `git push` and the `git push` line carries no `run:`, so a
  // same-line pattern matched neither. Routed through `runSteps`, which expands block scalars.
  const { status, output } = run({
    paths: ['skills/**', 'scripts/generate-readmes.js'],
    steps: ['node scripts/generate-readmes.js'],
    files: { 'scripts/generate-readmes.js': 'export const x = 1;\n' },
    extraWorkflows: { 'commits.yml': BLOCK_SCALAR_COMMITTER },
  });

  assert.equal(status, 1, output);
  assert.match(output, /commits\.yml uses a bare `git push` but is not in HEALER_WORKFLOWS/);
});

test('an undeclared healer using a commit ACTION is refused', () => {
  const { status, output } = run({
    paths: ['skills/**', 'scripts/generate-readmes.js'],
    steps: ['node scripts/generate-readmes.js'],
    files: { 'scripts/generate-readmes.js': 'export const x = 1;\n' },
    extraWorkflows: { 'commits.yml': ACTION_COMMITTER },
  });

  assert.equal(status, 1, output);
  assert.match(output, /commits\.yml uses git-auto-commit-action but is not in HEALER_WORKFLOWS/);
});

test('a workflow that commits nothing is not accused', () => {
  // The accept side. Without it, "refuse everything" would satisfy both tests above — and
  // this fixture carries the exact shape that would false-positive a naive scan: a full-line
  // comment naming the action, which is how `update-readmes.yml` records its SHA pin.
  const innocent = `name: Just Checks
on:
  pull_request:
jobs:
  go:
    runs-on: ubuntu-latest
    steps:
      # SHA-pinned: https://github.com/stefanzweifel/git-auto-commit-action/releases
      - run: |
          echo "Repair locally, then commit:"
          echo "    git add --renormalize ."
          npm test
`;
  const { status, output } = run({
    paths: ['skills/**', 'scripts/generate-readmes.js'],
    steps: ['node scripts/generate-readmes.js'],
    files: { 'scripts/generate-readmes.js': 'export const x = 1;\n' },
    extraWorkflows: { 'innocent.yml': innocent },
  });

  assert.equal(status, 0, output);
  assert.ok(!/HEALER_WORKFLOWS/.test(output), output);
});

test('the DECLARED healer is skipped, or the check would accuse itself', () => {
  // `update-readmes.yml` commits, so it carries the very signal this detector hunts. If the
  // declared-skip path broke, every run would fail on the one workflow the check exists to
  // serve — which makes this the load-bearing test of the pair.
  //
  // The first version passed `update-readmes.yml` through `extraWorkflows`, where the harness
  // promptly OVERWROTE it with the standard fixture — a fixture that committed nothing, so
  // the skip was never exercised and deleting it left the suite green. Found by mutation; the
  // repair is in the fixture, which now commits like the real file does.
  //
  // Read the resulting kill count correctly. Deleting the skip now dies to EIGHT tests, and
  // that is coupling through a shared fixture, not eight independent assertions — every test
  // using the standard workflow inherits the accusation. Bigger is not stronger here, which
  // is the inversion this repo's mutation doctrine warns about; the one that means something
  // is this test, and it would die alone if it had a fixture of its own.
  const { status, output } = run({
    paths: ['skills/**', 'scripts/generate-readmes.js'],
    steps: ['node scripts/generate-readmes.js'],
    files: { 'scripts/generate-readmes.js': 'export const x = 1;\n' },
  });

  assert.equal(status, 0, output);
  assert.ok(!/HEALER_WORKFLOWS/.test(output), output);
});

// ── EXTERNAL_PUBLISHERS: a push to another repository is not a healer (#78) ─────
//
// The fixture file is named `publish-hermes-profile.yml` because the declaration is a constant
// in the checker; a differently named copy of the same workflow must still be accused, which
// is what makes the LIST the gate rather than the permission block.

/** A workflow that pushes to another repository, with the token permission it must carry. */
const externalPublisher = (permissions) => `name: Publish Elsewhere
on:
  push:
    tags: ['v*.*.*']
${permissions}jobs:
  go:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: |
          git clone git@github.com:someone/elsewhere.git "$RUNNER_TEMP/dist"
          cd "$RUNNER_TEMP/dist" && git add -A && git commit -m build
          git push origin HEAD:main
`;
const READ_ONLY = 'permissions:\n  contents: read\n';
const EXTERNAL_BASE = {
  paths: ['skills/**', 'scripts/generate-readmes.js'],
  steps: ['node scripts/generate-readmes.js'],
  files: { 'scripts/generate-readmes.js': 'export const x = 1;\n' },
};

test('a declared external publisher with a read-only token is not accused', () => {
  const { status, output } = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': externalPublisher(READ_ONLY) } });
  assert.equal(status, 0, output);
  assert.ok(!/HEALER_WORKFLOWS|external publisher/.test(output), output);
});

test('the same workflow under an undeclared name is still accused — the list is the gate', () => {
  const { status, output } = run({ ...EXTERNAL_BASE, extraWorkflows: { 'other-publisher.yml': externalPublisher(READ_ONLY) } });
  assert.equal(status, 1, output);
  assert.match(output, /other-publisher\.yml uses a bare `git push` but is not in HEALER_WORKFLOWS/);
  assert.match(output, /EXTERNAL_PUBLISHERS/, 'the accusation names the other list');
});

test('a declared external publisher whose token can write here is refused, even under --warn', () => {
  for (const warn of [false, true]) {
    const { status, output } = run({ ...EXTERNAL_BASE, warn, extraWorkflows: { 'publish-hermes-profile.yml': externalPublisher('permissions:\n  contents: write\n') } });
    assert.equal(status, 1, output);
    assert.match(output, /publish-hermes-profile\.yml is declared an external publisher but a permissions block grants contents: write/);
  }
});

test('a declared external publisher with an unstated token permission is refused', () => {
  const { status, output } = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': externalPublisher('') } });
  assert.equal(status, 1, output);
  assert.match(output, /token permission is unstated/);
});

test('a job-level write grant beside a workflow-level read is refused — every permissions block counts', () => {
  const body = externalPublisher(READ_ONLY).replace('    runs-on: ubuntu-latest\n', '    runs-on: ubuntu-latest\n    permissions:\n      contents: write\n');
  const { status, output } = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': body } });
  assert.equal(status, 1, output);
  assert.match(output, /a permissions block grants contents: write/);
});

test('the permissions are read structurally: write-all, a flow mapping, and a contents: line inside a run block', () => {
  // `permissions: write-all` at job level beside a workflow-level read — a line grep for
  // `contents:` sees only the read.
  let body = externalPublisher(READ_ONLY).replace('    runs-on: ubuntu-latest\n', '    runs-on: ubuntu-latest\n    permissions: write-all\n');
  let r = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': body } });
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /the scalar or flow form 'permissions: write-all', which this check does not parse/);

  // A flow mapping is refused rather than parsed.
  body = externalPublisher(READ_ONLY).replace('    runs-on: ubuntu-latest\n', '    runs-on: ubuntu-latest\n    permissions: { contents: write }\n');
  r = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': body } });
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /the scalar or flow form 'permissions: \{ contents: write \}'/);

  // A `contents: read` line inside a run block, with no permissions key anywhere, is unstated.
  body = externalPublisher('').replace('          git push origin HEAD:main\n', '          echo "contents: read"\n          git push origin HEAD:main\n');
  r = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': body } });
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /token permission is unstated/);

  // A block that names other scopes but not contents is refused too.
  body = externalPublisher('permissions:\n  actions: read\n');
  r = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': body } });
  assert.equal(r.status, 1, r.output);
  assert.match(r.output, /a permissions block states no contents: grant/);

  // The accept side of the indent boundary: a read-only block, then a `contents: write` line
  // that sits inside a later run block (a shell line, not YAML) must NOT be read as a grant.
  // Without the boundary the parser would walk on past the block and take it.
  body = externalPublisher(READ_ONLY).replace('          git push origin HEAD:main\n', '          contents: write\n          git push origin HEAD:main\n');
  r = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': body } });
  assert.equal(r.status, 0, r.output);
});

test('a declared external publisher that no longer pushes is a stale declaration and is refused', () => {
  const body = externalPublisher(READ_ONLY).replace('          git push origin HEAD:main\n', '          echo "nothing pushed"\n');
  const { status, output } = run({ ...EXTERNAL_BASE, extraWorkflows: { 'publish-hermes-profile.yml': body } });
  assert.equal(status, 1, output);
  assert.match(output, /declared an external publisher but carries no commit signal/);
});

test('a missing declared external publisher is a refusal, not a pass', () => {
  const { status, output } = run({ ...EXTERNAL_BASE, omitExternalPublisher: true });
  assert.equal(status, 1, output);
  assert.match(output, /external publisher workflow not found: \.github\/workflows\/publish-hermes-profile\.yml/);
});
