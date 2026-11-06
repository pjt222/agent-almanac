// example.test.mjs: the pi-durable example from guides/almanac-skills-in-pi-durable.md runs
// (#1009).
//
// It runs the example against pi-ai's faux provider and pi-durable's MemoryStorage, so no
// network, no API key and no disk storage are involved. pi-durable is experimental upstream
// and pinned exactly in this directory's package.json; a bump that changes its API fails here
// instead of in a reader's copy of the guide.
//
// These packages are this directory's own, so the repository's other installs never carry
// them. The pi-durable-example workflow runs this file after `npm ci --ignore-scripts` here;
// to run it locally, do the same in this directory, then `npm test`. That the guide carries
// the example byte for byte is checked by scripts/test/pi-durable-guide.test.js, which needs
// none of these packages and runs in the required suite.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { findPackageJSON } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createModels } from '@earendil-works/pi-ai/models';
import { fauxAssistantMessage, fauxProvider, fauxText, fauxToolCall } from '@earendil-works/pi-ai/providers/faux';
import { MemoryStorage, ToolResultEntry } from '@earendil-works/pi-durable';
import { rmTree } from '../_tmp.js';
import { openAlmanacHost } from './host.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const SKILLS_DIR = join(REPO_ROOT, 'skills');

// Each chosen skill with the opening words of its description, pinned literally rather than
// re-parsed here, so a frontmatter parser that broke would not be mirrored by the test.
const CHOSEN = {
  'commit-changes': 'Stage, commit, and amend changes with conventional commit messages.',
  'review-pull-request': 'Review a pull request end-to-end using GitHub CLI.',
};
const NOT_CHOSEN = 'create-skill';
const RELATIVE_PATHS = 'A path inside a skill, such as references/EXAMPLES.md, is relative to the directory that holds its SKILL.md.';

/** The text of a tool result entry's message. */
const resultText = (entry) => entry.model[0].content.map((part) => (part.type === 'text' ? part.text : '')).join('');

test('the host offers the chosen skills in the system prompt, with the read tool alone, and read returns a SKILL.md', async (t) => {
  // The tools run in a directory that holds no skills, so only the absolute paths in the
  // listing can make the read succeed.
  const cwd = mkdtempSync(join(tmpdir(), 'pi-durable-example-'));
  t.after(() => rmTree(cwd));
  const skillPath = join(SKILLS_DIR, 'commit-changes', 'SKILL.md');

  const faux = fauxProvider();
  const models = createModels();
  models.setProvider(faux.provider);

  // The scripted model does what the listing tells a model to do: it reads the path listed for
  // commit-changes, not one this test builds.
  let systemMessage;
  faux.setResponses([
    (context) => {
      systemMessage = context.messages.find((message) => message.role === 'system');
      const listed = systemMessage?.sections?.available_skills?.match(/^- commit-changes \((.+)\): /m)?.[1] ?? 'commit-changes is not listed';
      return fauxAssistantMessage([fauxToolCall('read', { path: listed }, { id: 'read-1' })], { stopReason: 'toolUse' });
    },
    fauxAssistantMessage([fauxText('Read it.')]),
  ]);

  const { harness, root, context } = await openAlmanacHost({
    models,
    storage: new MemoryStorage(),
    skillsDir: SKILLS_DIR,
    ids: Object.keys(CHOSEN),
    model: { provider: 'faux', modelId: faux.getModel().id },
    cwd,
  });
  try {
    const settled = await (await root.submit({ type: 'input', content: 'Commit my changes.' }, context)).wait(context);
    assert.equal(settled.status, 'done', `the run did not finish: ${JSON.stringify(settled)}`);

    // The section the model saw: inside its tag, the relative-path rule, and every chosen skill
    // with its absolute path and description, and no other.
    const listing = systemMessage?.sections?.available_skills;
    assert.equal(typeof listing, 'string', `no available_skills section reached the model: ${JSON.stringify(systemMessage)}`);
    assert.ok(listing.startsWith('<available_skills>\n') && listing.endsWith('\n</available_skills>'),
      `the section is not inside an <available_skills> tag:\n${listing}`);
    assert.ok(listing.includes(RELATIVE_PATHS), `the section does not say how a skill's own paths resolve:\n${listing}`);
    for (const [id, opening] of Object.entries(CHOSEN)) {
      const line = `- ${id} (${join(SKILLS_DIR, id, 'SKILL.md')}): ${opening}`;
      assert.ok(listing.includes(line), `${id} is not listed with its absolute path and description:\n${listing}`);
    }
    assert.ok(!listing.includes(NOT_CHOSEN), `${NOT_CHOSEN} was not chosen but is listed:\n${listing}`);

    // The model was offered read and nothing else: no write, edit or bash.
    assert.deepEqual(systemMessage.toolsAdded.map((tool) => tool.name), ['read']);

    // The read call ran in the host's environment and returned the skill's SKILL.md, whole.
    const entries = await root.entries({}, 50, undefined, context);
    const toolResult = [...entries.items].find((entry) => ToolResultEntry.is(entry));
    assert.ok(toolResult, 'no tool result was recorded');
    assert.equal(resultText(toolResult), readFileSync(skillPath, 'utf8'), 'the read result is not commit-changes/SKILL.md');
  } finally {
    await harness.close(context);
  }
});

test('pi-ai and chord are installed once, so pi-durable and the host share them', () => {
  // pi-durable pins pi-ai and chord at its own exact version. A host pinning another version
  // gets a second copy, whose model registry and provider classes are not pi-durable's.
  const fromPiDurable = import.meta.resolve('@earendil-works/pi-durable');
  for (const name of ['@earendil-works/pi-ai', '@earendil-works/chord']) {
    const here = findPackageJSON(name, import.meta.url);
    const there = findPackageJSON(name, fromPiDurable);
    assert.ok(here, `${name} does not resolve from the example`);
    assert.equal(there, here, `pi-durable resolves ${name} to ${there}, the example to ${here}`);
  }
});
