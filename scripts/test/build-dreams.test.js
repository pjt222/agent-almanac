/**
 * Behavioural tests for `scripts/build-dreams.js`.
 *
 * Two properties are under test, and they pull in opposite directions:
 *
 * 1. The **gnomon rule** — adding a dream is adding one markdown file, and the generator
 *    does not change. Asserted by building a fixture, adding a file, and rebuilding.
 * 2. **Nothing author-written reaches the page as markup.** The generator interpolates
 *    frontmatter into both HTML and an inlined `<script>` data block, which are different
 *    sinks with different escapes.
 *
 * `--check` is the gate that keeps the committed `atlas.html` honest, so it is tested in
 * both directions: red when the corpus moved, green when it did not. A staleness check
 * only ever exercised on a fresh build is the vacuous shape this repo keeps finding.
 *
 * Each test builds a throwaway tree holding the script and its own `dreams/`, so nothing
 * touches the working repository (#453).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, cpSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { rmTree } from './_tmp.js';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = 'scripts/build-dreams.js';

function dream(fields, body = 'Body text here.') {
  const fm = Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n');
  return `---\n${fm}\n---\n\n${body}\n`;
}

const VALID = {
  title: 'A Dream',
  date: '2026-01-01',
  motifs: '[geometry, growth]',
  recovered: 'full',
};

/** A throwaway tree: the script, a node_modules link for js-yaml, and a dreams/ dir. */
function fixture(files = { 'a.md': dream(VALID) }) {
  const dir = mkdtempSync(join(tmpdir(), 'build-dreams-'));
  mkdirSync(join(dir, 'scripts'), { recursive: true });
  mkdirSync(join(dir, 'dreams'), { recursive: true });
  cpSync(join(REPO, SCRIPT), join(dir, SCRIPT));
  symlinkSync(join(REPO, 'node_modules'), join(dir, 'node_modules'), 'dir');
  for (const [name, content] of Object.entries(files)) {
    writeFileSync(join(dir, 'dreams', name), content);
  }
  return dir;
}

function run(dir, args = []) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: 'utf8' });
}

const atlas = (dir) => readFileSync(join(dir, 'dreams', 'atlas.html'), 'utf8');

function withFixture(files, fn) {
  const dir = fixture(files);
  try {
    fn(dir);
  } finally {
    rmTree(dir);
  }
}

// --- the gnomon rule ------------------------------------------------------------------

test('adding a dream file changes the atlas with no change to the generator', () => {
  withFixture(undefined, (dir) => {
    assert.equal(run(dir).status, 0);
    const one = atlas(dir);
    assert.match(one, /1 dream/);

    writeFileSync(
      join(dir, 'dreams', 'b.md'),
      dream({ ...VALID, title: 'Second Dream', date: '2026-02-02' }),
    );
    const r = run(dir);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /2 dreams/);
    assert.notEqual(atlas(dir), one, 'the atlas did not grow');
    assert.match(atlas(dir), /Second Dream/);
  });
});

// --- the staleness gate, in both directions -------------------------------------------

test('--check is green on a fresh build and red once the corpus moves', () => {
  withFixture(undefined, (dir) => {
    run(dir);
    assert.equal(run(dir, ['--check']).status, 0, '--check was red on a fresh build');

    writeFileSync(join(dir, 'dreams', 'b.md'), dream({ ...VALID, title: 'Later', date: '2026-03-03' }));
    const stale = run(dir, ['--check']);
    assert.equal(stale.status, 1, '--check stayed green after a dream was added');
    assert.match(stale.stderr, /stale/);
  });
});

test('--check is red when a body edit changes the word count', () => {
  withFixture(undefined, (dir) => {
    run(dir);
    writeFileSync(join(dir, 'dreams', 'a.md'), dream(VALID, 'Body text here. Plus several more words.'));
    assert.equal(run(dir, ['--check']).status, 1);
  });
});

// --- nothing author-written reaches the page as markup --------------------------------

test('a hostile title escapes into neither the markup nor the script data block', () => {
  const hostile = 'Why </script><img src=x onerror=alert(1)> & "quotes" & \'apostrophes\' matter';
  withFixture({ 'a.md': dream({ ...VALID, title: JSON.stringify(hostile) }) }, (dir) => {
    const r = run(dir);
    assert.equal(r.status, 0, r.stderr);
    const html = atlas(dir);

    // The data block must not be closable by the title.
    const scriptBlock = html.slice(html.indexOf('window.__ATLAS__'));
    assert.ok(!scriptBlock.includes('</script><img'), 'the title broke out of the data block');
    assert.ok(scriptBlock.includes('\\u003c/script'), 'the < was not escaped in the data block');

    // And it must not be parsed as markup in the strata heading.
    assert.ok(!html.includes('<img src=x'), 'the title was emitted as a live img tag');
    assert.ok(html.includes('&lt;/script&gt;'), 'the heading did not escape the title');
    assert.ok(html.includes('&#39;apostrophes&#39;'), 'the apostrophe was not escaped');
  });
});

// --- default-deny on the frontmatter vocabulary ---------------------------------------

test('an unrecognised recovered: value is refused, not silently drawn as damaged', () => {
  withFixture({ 'a.md': dream({ ...VALID, recovered: 'Full' }) }, (dir) => {
    const r = run(dir);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /a\.md/, 'the error did not name the file');
    assert.match(r.stderr, /must be one of full, partial, summary, none/);
  });
});

test('malformed frontmatter is refused with the file named', () => {
  const cases = [
    [{ ...VALID, motifs: 'geometry' }, /must be a list/],
    [{ ...VALID, motifs: '[]' }, /at least one mode/],
    [{ ...VALID, date: '08/11/2026' }, /must be YYYY-MM-DD/],
    [{ ...VALID, movements: 'two' }, /must be a whole number/],
    [{ ...VALID, glows: 'a single string' }, /'glows' must be a list/],
  ];
  for (const [fields, expected] of cases) {
    withFixture({ 'a.md': dream(fields) }, (dir) => {
      const r = run(dir);
      assert.notEqual(r.status, 0, `accepted ${JSON.stringify(fields)}`);
      assert.match(r.stderr, /a\.md/);
      assert.match(r.stderr, expected);
    });
  }
});

// --- losses are drawn, not omitted ----------------------------------------------------

test('a damaged entry renders a break and an intact one does not', () => {
  withFixture({ 'a.md': dream({ ...VALID, recovered: 'none' }) }, (dir) => {
    run(dir);
    assert.match(atlas(dir), /class="break"/);
    assert.match(atlas(dir), /never emitted/);
    assert.match(atlas(dir), /0 intact/);
  });
  withFixture(undefined, (dir) => {
    run(dir);
    assert.ok(!atlas(dir).includes('class="break"'), 'an intact entry drew a break');
    assert.match(atlas(dir), /1 intact/);
  });
});
