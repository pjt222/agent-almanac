// pi-durable-guide.test.js: the guide's pi-durable example runs, and the guide carries it
// verbatim (#1009).
//
// guides/almanac-skills-in-pi-durable.md shows a pi-durable extension that lists chosen
// agent-almanac skills in the system prompt, and a host that lets the model read a skill's
// SKILL.md with the `read` tool. Its code lives in scripts/test/_pi-durable-example/, and this
// file runs it against pi-ai's faux provider and pi-durable's MemoryStorage, so no network, no
// API key and no disk storage are involved. pi-durable is experimental upstream and pinned
// exactly in devDependencies; a bump that changes its API fails here instead of in a reader's
// copy of the guide.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createModels } from '@earendil-works/pi-ai/models';
import { fauxAssistantMessage, fauxProvider, fauxText, fauxToolCall } from '@earendil-works/pi-ai/providers/faux';
import { MemoryStorage, ToolResultEntry } from '@earendil-works/pi-durable';
import { openAlmanacHost } from './_pi-durable-example/host.mjs';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SKILLS_DIR = join(REPO_ROOT, 'skills');
const EXAMPLE_DIR = join(REPO_ROOT, 'scripts', 'test', '_pi-durable-example');
const GUIDE = join(REPO_ROOT, 'guides', 'almanac-skills-in-pi-durable.md');

// Each chosen skill with the opening words of its description, pinned literally rather than
// re-parsed here, so a frontmatter parser that broke would not be mirrored by the test.
const CHOSEN = {
  'commit-changes': 'Stage, commit, and amend changes with conventional commit messages.',
  'review-pull-request': 'Review a pull request end-to-end using GitHub CLI.',
};
const NOT_CHOSEN = 'create-skill';

/** The text of a tool result entry's message. */
const resultText = (entry) => entry.model[0].content.map((part) => (part.type === 'text' ? part.text : '')).join('');

test('the host offers the chosen skills in the system prompt, and the read tool returns a SKILL.md', async () => {
  const faux = fauxProvider();
  const models = createModels();
  models.setProvider(faux.provider);

  let systemMessage;
  faux.setResponses([
    (context) => {
      systemMessage = context.messages.find((message) => message.role === 'system');
      return fauxAssistantMessage([fauxToolCall('read', { path: 'commit-changes/SKILL.md' }, { id: 'read-1' })], { stopReason: 'toolUse' });
    },
    fauxAssistantMessage([fauxText('Read it.')]),
  ]);

  const { harness, root, context } = await openAlmanacHost({
    models,
    storage: new MemoryStorage(),
    skillsDir: SKILLS_DIR,
    ids: Object.keys(CHOSEN),
    model: { provider: 'faux', modelId: faux.getModel().id },
  });
  try {
    const settled = await (await root.submit({ type: 'input', content: 'Commit my changes.' }, context)).wait(context);
    assert.equal(settled.status, 'done', `the run did not finish: ${JSON.stringify(settled)}`);

    // The section the model saw: every chosen skill, with its path and description, and no other.
    const listing = systemMessage?.sections?.available_skills;
    assert.equal(typeof listing, 'string', `no available_skills section reached the model: ${JSON.stringify(systemMessage)}`);
    for (const [id, opening] of Object.entries(CHOSEN)) {
      assert.ok(listing.includes(`- ${id} (${id}/SKILL.md): ${opening}`), `${id} is not listed with its path and description:\n${listing}`);
    }
    assert.ok(!listing.includes(NOT_CHOSEN), `${NOT_CHOSEN} was not chosen but is listed:\n${listing}`);

    // The read tool ran in the environment rooted at the skills directory.
    const entries = await root.entries({}, 50, undefined, context);
    const toolResult = [...entries.items].find((entry) => ToolResultEntry.is(entry));
    assert.ok(toolResult, 'no tool result was recorded');
    const body = readFileSync(join(SKILLS_DIR, 'commit-changes', 'SKILL.md'), 'utf8');
    const heading = body.match(/^# .+$/m)[0];
    assert.ok(resultText(toolResult).includes(heading), `the read result does not carry commit-changes/SKILL.md:\n${resultText(toolResult).slice(0, 400)}`);
  } finally {
    await harness.close(context);
  }
});

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
