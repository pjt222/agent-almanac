/**
 * plugin-manifest.test.js — `.claude-plugin/plugin.json` is a generated output (#749).
 *
 * The manifest a Claude Code marketplace user reads was hand-written, and was found stale on all
 * five values it states at once: `version` 1.0.0 against a `package.json` of 1.9.1, and four
 * content totals each behind its registry. It had been hand-corrected before (`git log --
 * .claude-plugin/plugin.json`), which is the argument for generating it rather than correcting it
 * a third time: four of the five values are counts the registries own, and the fifth is the
 * version `npm version` already moves everywhere else.
 *
 * So `generate-readmes.js` writes it through the fully generated path (JSON carries no AUTO
 * markers), and this suite drives that writer against a FIXTURE tree, the way
 * `security-surface.test.js` does for SECURITY.md: every number it asserts is one the fixture
 * chose, so a writer that read this repository's registries instead would publish the wrong one.
 *
 * Each arm imports the generator inside its own body. A missing export is then that arm's own
 * failure message, rather than a module-link error that takes every arm down with one line.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as yaml from 'js-yaml';
import { rmTree } from './_tmp.js';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const GENERATOR = join(REPO_ROOT, 'scripts', 'generate-readmes.js');
const MANIFEST_PATH = '.claude-plugin/plugin.json';

/** The writer, or a failure that names what is missing. */
async function manifestWriter() {
  const mod = await import(pathToFileURL(GENERATOR).href);
  assert.equal(
    typeof mod.generatePluginManifest,
    'function',
    'scripts/generate-readmes.js exports no generatePluginManifest, so nothing generates .claude-plugin/plugin.json (#749)',
  );
  return mod.generatePluginManifest;
}

function write(dir, files) {
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, rel)), { recursive: true });
    writeFileSync(join(dir, rel), content, 'utf8');
  }
}

// Five distinct numbers, so a writer that swaps two counts, or reads a field from the wrong
// registry, publishes a value no other field carries.
const FIXTURE_VERSION = '3.4.5';
const FIXTURE_SKILLS = 7;
const FIXTURE_DOMAINS = 2;
const FIXTURE_AGENTS = 4;
const FIXTURE_TEAMS = 3;

/** `replace` overwrites whole files after the defaults are written, so an arm can break one input. */
function fixture(t, { pkg = { name: 'fixture-almanac', version: FIXTURE_VERSION }, replace = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'plugin-manifest-'));
  t.after(() => rmTree(dir));
  write(dir, {
    'package.json': `${JSON.stringify(pkg, null, 2)}\n`,
    'skills/_registry.yml': [
      `total_skills: ${FIXTURE_SKILLS}`,
      'domains:',
      '  alpha:',
      '    description: First',
      '    skills: [{ id: a1 }, { id: a2 }, { id: a3 }, { id: a4 }]',
      '  beta:',
      '    description: Second',
      '    skills: [{ id: b1 }, { id: b2 }, { id: b3 }]',
      '',
    ].join('\n'),
    'agents/_registry.yml': `total_agents: ${FIXTURE_AGENTS}\nagents: []\n`,
    'teams/_registry.yml': `total_teams: ${FIXTURE_TEAMS}\nteams: []\n`,
  });
  write(dir, replace);
  return dir;
}

// The hand-written fields, exactly as the hand-written file carried them at 25a165bca. They moved
// into the generator; this pins that they moved unchanged, and that none was dropped on the way.
// `homepage` is NOT package.json's: the plugin has pointed at the standard it follows since
// d6f47a688, and generating the file is not a licence to change what it says.
const HAND_WRITTEN = {
  name: 'agent-almanac',
  author: {
    name: 'Philipp Thoss',
    email: 'ph.thoss@gmx.de',
    url: 'https://github.com/pjt222',
  },
  repository: 'https://github.com/pjt222/agent-almanac',
  homepage: 'https://agentskills.io',
  license: 'MIT',
  keywords: [
    'skills',
    'agents',
    'teams',
    'agentic',
    'agentskills',
    'devops',
    'compliance',
    'mlops',
    'r-packages',
    'esoteric',
  ],
};

test('MANAGED lists .claude-plugin/plugin.json, so check-readmes compares it and the healer commits it', () => {
  const result = spawnSync(process.execPath, [GENERATOR, '--list-outputs'], { encoding: 'utf8', cwd: REPO_ROOT });
  assert.equal(result.status, 0, `--list-outputs exited ${result.status}\n${result.stderr}`);
  const outputs = result.stdout.trim().split('\n');
  assert.ok(outputs.includes('SECURITY.md'), `control: the list must carry a known output, got:\n${result.stdout}`);
  assert.ok(
    outputs.includes(MANIFEST_PATH),
    `MANAGED does not list ${MANIFEST_PATH}, so nothing regenerates or checks it (#749). Outputs:\n${result.stdout}`,
  );
});

test('validate-readmes.yml triggers on package.json in BOTH events, because two outputs read it', () => {
  // `package.json` is the one INPUT that validate-readmes.yml lists, against its own "outputs,
  // not inputs" rule. Two writers read it: `generatePluginManifest` (its `version`) and
  // `generateSecuritySurface` (`version`, `name`, `files`, the install and pack hooks). Listing
  // it is what makes a version bump that skipped `npm run update-readmes` red on its own PR
  // instead of at the tag's `npm test`.
  //
  // Integrity check A8c compares the two `paths:` blocks with each other and with MANAGED, so
  // deleting the line from ONE block reddens it. Deleting it from BOTH leaves A8c green,
  // because neither comparison knows about inputs (#970 review N1). This arm covers both cases.
  const workflow = yaml.load(readFileSync(join(REPO_ROOT, '.github', 'workflows', 'validate-readmes.yml'), 'utf8'));
  for (const event of ['push', 'pull_request']) {
    const paths = workflow?.on?.[event]?.paths;
    // The control. A parse that reached the wrong key fails here and names the parse, instead of
    // reporting a missing package.json it never looked for.
    assert.ok(
      Array.isArray(paths) && paths.includes('SECURITY.md'),
      `could not read on.${event}.paths of validate-readmes.yml as a list carrying SECURITY.md, got ${JSON.stringify(paths)}`,
    );
    assert.ok(
      paths.includes('package.json'),
      `validate-readmes.yml on.${event}.paths does not list package.json, so a version bump that skipped \`npm run update-readmes\` is not checked there (#749, #970 review N1)`,
    );
  }
});

test('the version is package.json\'s and the four totals are the registries\', read from the given root', async (t) => {
  const generatePluginManifest = await manifestWriter();
  const dir = fixture(t);
  const manifest = JSON.parse(generatePluginManifest({ root: dir }));

  assert.equal(manifest.version, FIXTURE_VERSION, 'the version must come from package.json at the given root');
  assert.equal(
    manifest.description,
    `${FIXTURE_SKILLS} agentic skills across ${FIXTURE_DOMAINS} domains, ${FIXTURE_AGENTS} agent personas, `
      + `and ${FIXTURE_TEAMS} team compositions following the agentskills.io open standard`,
  );
});

test('every hand-written field survives, in the original key order', async (t) => {
  const generatePluginManifest = await manifestWriter();
  const manifest = JSON.parse(generatePluginManifest({ root: fixture(t) }));

  assert.deepEqual(
    Object.keys(manifest),
    ['name', 'description', 'version', 'author', 'repository', 'homepage', 'license', 'keywords'],
    'a field was added, dropped or reordered — the file a marketplace user reads changed shape',
  );
  for (const [field, value] of Object.entries(HAND_WRITTEN)) {
    assert.deepEqual(manifest[field], value, `hand-written field '${field}' changed on its way into the generator`);
  }
});

test('the output is two-space JSON with one trailing newline, the shape the committed file has', async (t) => {
  const generatePluginManifest = await manifestWriter();
  const text = generatePluginManifest({ root: fixture(t) });
  assert.equal(text, `${JSON.stringify(JSON.parse(text), null, 2)}\n`);
});

test('a package.json with no version is refused, not published as a manifest without one', async (t) => {
  // JSON.stringify drops an `undefined` value silently, so without the refusal the manifest would
  // lose its `version` key and every gate would stay green over the omission.
  const generatePluginManifest = await manifestWriter();
  const dir = fixture(t, { pkg: { name: 'fixture-almanac' } });
  assert.throws(() => generatePluginManifest({ root: dir }), /package\.json declares no version/);
});

test('a registry with no integer total is refused, not published as "undefined agent personas"', async (t) => {
  // The version's reason again. A template literal renders an absent total as `undefined` without
  // a word, and check-readmes would go red only at the next regeneration, naming no cause. The
  // refusal survived its mutant in the #970 review (N3), because no arm reached it.
  const generatePluginManifest = await manifestWriter();
  const dir = fixture(t, { replace: { 'agents/_registry.yml': 'agents: []\n' } });
  assert.throws(
    () => generatePluginManifest({ root: dir }),
    /agents\/_registry\.yml carries no integer `total_agents`/,
  );
});

test('a skills registry with no domains map is refused by name, not by a TypeError', async (t) => {
  // Without the refusal, `Object.keys(undefined)` throws "Cannot convert undefined or null to
  // object", which names neither the file nor the field. The domains guard runs before the
  // `total_skills` read, so this registry, which keeps its total, reaches it.
  const generatePluginManifest = await manifestWriter();
  const dir = fixture(t, { replace: { 'skills/_registry.yml': `total_skills: ${FIXTURE_SKILLS}\n` } });
  assert.throws(
    () => generatePluginManifest({ root: dir }),
    /skills\/_registry\.yml carries no `domains` map/,
  );
});

test('LIVE: the default root is this repository', async () => {
  // The fixture arms could agree with each other and with a writer that ignores `root` only for
  // the default call. This one asks the no-argument call — the shape MANAGED makes — and compares
  // with values read independently here, so it holds on every commit rather than pinning numbers.
  const generatePluginManifest = await manifestWriter();
  const manifest = JSON.parse(generatePluginManifest());
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'));
  const skills = yaml.load(readFileSync(join(REPO_ROOT, 'skills', '_registry.yml'), 'utf8'));
  const agents = yaml.load(readFileSync(join(REPO_ROOT, 'agents', '_registry.yml'), 'utf8'));
  const teams = yaml.load(readFileSync(join(REPO_ROOT, 'teams', '_registry.yml'), 'utf8'));

  assert.equal(manifest.version, pkg.version);
  assert.ok(
    manifest.description.startsWith(
      `${skills.total_skills} agentic skills across ${Object.keys(skills.domains).length} domains, `
        + `${agents.total_agents} agent personas, and ${teams.total_teams} team compositions`,
    ),
    `the default root must be the repository, got: ${manifest.description}`,
  );
});
