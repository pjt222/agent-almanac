// pi-durable-guide.test.js: the pi-durable guide carries its example verbatim, and the
// example's dependencies stay its own (#1009).
//
// guides/almanac-skills-in-pi-durable.md shows a pi-durable extension and host whose code
// lives in scripts/test/_pi-durable-example/. That directory is a package of its own: pi-ai
// pulls in about ninety packages, two of them with install scripts, and none of the
// repository's own installs should carry them. Its example.test.mjs runs the example, in the
// pi-durable-example workflow. This file needs none of those packages and runs in the
// required suite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as yamlLib from 'js-yaml';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXAMPLE_DIR = join(REPO_ROOT, 'scripts', 'test', '_pi-durable-example');
const GUIDE = join(REPO_ROOT, 'guides', 'almanac-skills-in-pi-durable.md');
const PI_PACKAGES = ['@earendil-works/chord', '@earendil-works/pi-ai', '@earendil-works/pi-durable'];

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

test('the guide carries both example files byte for byte', () => {
  const guide = readFileSync(GUIDE, 'utf8');
  const fences = [...guide.matchAll(/```(?:js|javascript)\n([\s\S]*?)```/g)].map((match) => match[1]);
  for (const file of ['almanac-skills.mjs', 'host.mjs']) {
    const source = readFileSync(join(EXAMPLE_DIR, file), 'utf8');
    const shown = fences.find((fence) => fence.startsWith(`// ${file}:`));
    assert.ok(shown !== undefined, `the guide has no js fence starting with "// ${file}:"`);
    assert.equal(shown, source, `the guide's copy of ${file} differs from scripts/test/_pi-durable-example/${file}`);
  }
});

test('the example pins the three pi packages at one exact version, and the guide names it', () => {
  const { dependencies = {} } = readJson(join(EXAMPLE_DIR, 'package.json'));
  const versions = PI_PACKAGES.map((name) => dependencies[name]);
  assert.ok(versions.every((version) => /^\d+\.\d+\.\d+$/.test(version ?? '')), `not every pi package is pinned exactly: ${JSON.stringify(versions)}`);
  assert.equal(new Set(versions).size, 1, `the pi packages are pinned at different versions: ${JSON.stringify(versions)}`);
  assert.ok(dependencies['js-yaml'], 'almanac-skills.mjs imports js-yaml, so the example must declare it');
  const lock = readJson(join(EXAMPLE_DIR, 'package-lock.json'));
  for (const name of PI_PACKAGES) {
    assert.equal(lock.packages[`node_modules/${name}`]?.version, versions[0], `the example's lockfile does not hold ${name}@${versions[0]}`);
  }
  // One copy of each. pi-durable pins every other @earendil-works package exactly, so with equal
  // pins here, one nested under another means npm installed a second copy, as it would if
  // pi-durable's own pins moved on without the example's (#1022).
  const nested = Object.keys(lock.packages).filter((path) => /node_modules\/.+\/node_modules\/@earendil-works\//.test(path));
  assert.deepEqual(nested, [], `the example's lockfile holds a second copy of an @earendil-works package (pi-durable pins all of them exactly): ${nested.join(', ')}`);
  const guide = readFileSync(GUIDE, 'utf8');
  assert.ok(guide.includes(`all at \`${versions[0]}\``), `the guide does not name the tested version ${versions[0]}`);
});

test('no pi package is a dependency of the repository itself', () => {
  const manifest = readJson(join(REPO_ROOT, 'package.json'));
  const lock = readJson(join(REPO_ROOT, 'package-lock.json'));
  for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    const found = Object.keys(manifest[field] ?? {}).filter((name) => name.startsWith('@earendil-works/'));
    assert.deepEqual(found, [], `package.json ${field} names ${found.join(', ')}; they belong to scripts/test/_pi-durable-example/`);
  }
  const locked = Object.keys(lock.packages).filter((path) => path.includes('node_modules/@earendil-works/'));
  assert.deepEqual(locked, [], `the root lockfile installs ${locked.join(', ')}`);
});

test('a Dependabot group moves the three pi packages together', () => {
  const config = yamlLib.load(readFileSync(join(REPO_ROOT, '.github', 'dependabot.yml'), 'utf8'));
  const entry = config.updates.find((update) => update['package-ecosystem'] === 'npm' && update.directory === '/scripts/test/_pi-durable-example');
  assert.ok(entry, 'dependabot.yml has no npm entry for /scripts/test/_pi-durable-example');
  // Dependabot patterns are globs where `*` matches any run of characters, compared
  // case-insensitively (dependabot-core's WildcardMatcher). A list key may hold a single string,
  // and a key written with no value holds nothing.
  const matches = (pattern, name) => new RegExp(`^${pattern.toLowerCase().split('*').map((part) => part.replace(/[.+?^${}()|[\]\\/]/g, '\\$&')).join('.*')}$`).test(name.toLowerCase());
  const list = (value) => (value === undefined ? undefined : [].concat(value ?? []));
  // Which group takes a dependency is documented as the first group it matches
  // (dependabot-options-reference, "groups") and implemented as the group with the most specific
  // matching pattern (dependabot-core's PatternSpecificityCalculator). The test relies on neither
  // rule: it requires exactly one version-update group that can hold any of the three, so both
  // rules give all three to that group. A group holds a dependency when `applies-to` is version
  // updates (the default), a pattern matches it (a group with no `patterns` key matches every
  // name), no exclude-pattern matches it, and `dependency-type` admits it: the example declares
  // the three under `dependencies`, so a `development` group does not hold them. That one group
  // must hold all three, take every update type, and not set `group-by`, which opens one pull
  // request per dependency (#1022).
  // Refused on purpose, though Dependabot can keep the three together there: a second group that
  // could hold any of them (a catch-all `*` beside the pi group, another group with no patterns,
  // complementary update-types groups). Not modelled, so the lookup above fails loudly: an entry
  // moved to `directories:` or into a multi-ecosystem group.
  const holds = (group, name) => (group['applies-to'] ?? 'version-updates') === 'version-updates'
    && (list(group.patterns)?.some((pattern) => matches(pattern, name)) ?? true)
    && !(list(group['exclude-patterns']) ?? []).some((pattern) => matches(pattern, name))
    && (group['dependency-type'] ?? 'production') === 'production';
  const holders = Object.entries(entry.groups ?? {}).filter(([, group]) => PI_PACKAGES.some((name) => holds(group, name)));
  assert.equal(holders.length, 1,
    `exactly one version-update group may hold the pi packages, found ${JSON.stringify(holders.map(([id]) => id))} among ${JSON.stringify(entry.groups ?? {})}`);
  const [id, group] = holders[0];
  assert.ok(PI_PACKAGES.every((name) => holds(group, name)),
    `group ${id} does not hold all three: ${JSON.stringify(Object.fromEntries(PI_PACKAGES.map((name) => [name, holds(group, name)])))}`);
  const types = list(group['update-types']);
  assert.ok(types === undefined || ['major', 'minor', 'patch'].every((type) => types.includes(type)),
    `group ${id} does not take every update type: ${JSON.stringify(types)}`);
  assert.equal(group['group-by'], undefined, `group ${id} sets group-by, which opens one pull request per dependency`);
});
