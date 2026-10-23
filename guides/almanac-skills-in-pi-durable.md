---
title: "Almanac Skills in a pi-durable Host"
description: "Offer agent-almanac skills to an agent built on pi-durable: a system-prompt section that lists them and the read tool that loads one"
category: infrastructure
agents: []
teams: []
skills: [install-almanac-content]
---

# Almanac Skills in a pi-durable Host

[pi-durable](https://github.com/earendil-works/pi/tree/main/packages/durable) (`@earendil-works/pi-durable`) is a library for building agents whose conversations, model turns and tool calls survive a restart. It has no command line and no skills folder of its own: a host application builds the system prompt from the *sections* of the extensions it installs. This guide shows a small extension that lists chosen agent-almanac skills in that prompt, and a host in which the model reads a skill's `SKILL.md` with the `read` tool when a task calls for it.

The two `js` code blocks below are the files `almanac-skills.mjs` and `host.mjs` in `scripts/test/_pi-durable-example/`, byte for byte. `scripts/test/pi-durable-guide.test.js` fails on any pull request where this page and those files diverge. `example.test.mjs`, beside the two files, runs them in the `pi-durable-example` workflow.

## When to Use This Guide

- You are building an agent on pi-durable and want it to follow agent-almanac skills.
- You want the skills offered progressively: names and descriptions up front, a full `SKILL.md` only when the model asks for it.
- You want to test such a host without a model, a network or an API key.

## Prerequisites

- Node.js: pi-durable requires `>=22.19.0`. This repository, and so the example's test, requires the `engines` floor in its `package.json`, Node 26 or newer.
- `@earendil-works/pi-durable`, `@earendil-works/pi-ai` and `@earendil-works/chord`, all at `1.4.0`, the version this guide is tested against. pi-durable is marked experimental upstream, so pin exact versions. pi-durable depends on pi-ai and chord at exactly its own version, so move the three together: a host that pins pi-ai at another version gets a second copy of it.
- `js-yaml`, which the extension imports to read a skill's frontmatter. Install it in your host. agent-almanac depends on it, but that does not make it importable from your code.
- A directory of skills laid out as `<id>/SKILL.md`. Either:
  - one that `agent-almanac install <ids> --framework universal` wrote, such as `.agents/skills/`;
  - or the `skills/` folder of the installed `agent-almanac` package.

`scripts/test/_pi-durable-example/package.json` lists exactly these four packages, so it can serve as a starting point for a host's own.

## Workflow Overview

1. **Choose the skills.** Every listed skill's name, description and path is in every request, so offer the ones the agent needs, not the whole library.
2. **Install the extension** below, beside a `read` tool. pi-durable's `createReadTool()` is enough. Its `CodingTools` would also give the model `write`, `edit` and `bash`.
3. **Give the tools a working directory**, usually the user's project. The listing carries absolute paths, so a skill is found whatever that directory is.
4. **Test it with pi-ai's faux provider and `MemoryStorage`**, then swap in a real provider and a durable storage.

## The Extension

`almanacSkills()` reads each chosen skill's frontmatter once, when the extension is created. It returns an extension whose single section, `available_skills`, lists the skills. pi-durable wraps a section in a tag named after it unless the section is declared with `tag: false`, so the model sees `<available_skills>...</available_skills>`.

A skill may point to files of its own, such as `references/EXAMPLES.md`. The section's second line tells the model that such a path is relative to the directory holding the `SKILL.md`, and since the listed path is absolute, the model can build the full path to read.

```js
// almanac-skills.mjs: agent-almanac skills in a pi-durable host.
//
// A pi-durable extension whose system-prompt section lists chosen skills by id,
// SKILL.md path and description. The model reads a skill's full SKILL.md with
// the `read` tool when a task calls for it, so only the listing costs context up
// front. The paths are absolute, so they resolve whatever working directory the
// host gives its tools.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as yaml from 'js-yaml';
import { defineExtension, section } from '@earendil-works/pi-durable';

/** A skill's id, the absolute path of its SKILL.md, and its description. */
function readSkill(skillsDir, id) {
  const path = resolve(skillsDir, id, 'SKILL.md');
  const text = readFileSync(path, 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fields = frontmatter ? yaml.load(frontmatter[1]) : {};
  return { id, path, description: String(fields?.description ?? '').trim() };
}

/**
 * @param {{ skillsDir: string, ids: string[] }} options
 *   `skillsDir`: a directory holding `<id>/SKILL.md`, such as an `.agents/skills/`
 *   that `agent-almanac install` wrote, or the agent-almanac package's `skills/`.
 *   `ids`: the skills to offer.
 */
export function almanacSkills({ skillsDir, ids }) {
  const skills = ids.map((id) => readSkill(skillsDir, id));
  const listing = [
    'These skills are available. When a task matches one, read its SKILL.md with the read tool and follow it.',
    'A path inside a skill, such as references/EXAMPLES.md, is relative to the directory that holds its SKILL.md.',
    ...skills.map((skill) => `- ${skill.id} (${skill.path}): ${skill.description}`),
  ].join('\n');
  return defineExtension({
    name: 'almanac-skills',
    sections: [section('available_skills', () => listing)],
  });
}
```

## The Host

The host installs one tool, `read`, and the extension. `Harness.open` takes an `env` factory, the environment every tool call runs in: without one, the `read` tool has nowhere to run and the model gets an error result. `models` is a pi-ai model registry with a provider set on it, and `storage` is any pi-durable storage.

Two limits are worth stating plainly:
- **`read` alone is least privilege for this job, not a sandbox.** It reads any file the host process can read, by absolute path, wherever `cwd` points.
- **`cwd` is a starting point, not a boundary.** It resolves relative paths. To confine what the model can read, confine the process: a container, or a user account with narrow file permissions.

```js
// host.mjs: a pi-durable host that offers agent-almanac skills.
//
// `models` is a pi-ai model registry with a provider set on it. `storage` is any
// pi-durable storage: MemoryStorage here, a SQLite or JSONL storage to survive
// restarts. The only tool is `read`, because offering skills needs nothing else;
// pi-durable's CodingTools would also give the model write, edit and bash.
// `cwd` is where the tools run, usually the user's project. It resolves
// relative paths and is not a sandbox: `read` reaches any file this process can.
import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { createRegistry, defineExtension, Harness } from '@earendil-works/pi-durable';
import { NodeExecutionEnv } from '@earendil-works/pi-durable/env/node';
import { createReadTool } from '@earendil-works/pi-durable/tools';
import { almanacSkills } from './almanac-skills.mjs';

export async function openAlmanacHost({ models, storage, skillsDir, ids, model, cwd = process.cwd() }) {
  const context = BACKGROUND_CONTEXT;
  const registry = createRegistry();
  registry.install(defineExtension({ name: 'read-only', tools: [createReadTool()] }));
  registry.install(almanacSkills({ skillsDir, ids }));
  const harness = await Harness.open(
    storage,
    { models, registry, env: () => new NodeExecutionEnv({ cwd }) },
    context,
  );
  const root = await harness.root(context, { agent: { model } });
  return { harness, root, context };
}
```

## Testing It Without a Model

pi-ai's faux provider plays the model: each scripted response is either an assistant message or a function of the context the model would have received. That lets a test see the system message pi-durable sends, and drive a `read` call:

```text
faux = fauxProvider()                 from @earendil-works/pi-ai/providers/faux
models = createModels()               from @earendil-works/pi-ai/models
models.setProvider(faux.provider)
faux.setResponses([
  context => (capture context.messages' system message;
              return fauxAssistantMessage([fauxToolCall('read', { path: '<absolute path to a SKILL.md>' })],
                                          { stopReason: 'toolUse' })),
  fauxAssistantMessage([fauxText('...')]),
])
openAlmanacHost({ models, storage: new MemoryStorage(), skillsDir, ids, model: { provider: 'faux', modelId: faux.getModel().id }, cwd })
```

The `stopReason: 'toolUse'` matters. Without it, the run still finishes, but the harness never executes the scripted call and records no tool result.

`scripts/test/_pi-durable-example/example.test.mjs` does exactly this, with `cwd` set to an empty temporary directory, so only the absolute paths can make the read succeed. It asserts that:
- the `available_skills` section reaches the model inside its tag, with the rule for a skill's own paths and each chosen skill's id, absolute path and description;
- a skill that was not chosen is absent;
- `read` is the only tool offered;
- the `read` call returns the chosen skill's `SKILL.md`;
- pi-ai and chord resolve to one installed copy, from the example and from pi-durable alike.

Those packages are the example's own, so none of the repository's other installs carries them. To run the example, run `npm ci --ignore-scripts` and then `npm test` in that directory. The example does not need the install scripts two of pi-ai's dependencies carry.

For a real model, set a configured provider on `models` instead of the faux one (pi-durable's README, "Quick Start"). For a restart-safe host, open a SQLite or JSONL storage instead of `MemoryStorage` (its "Storage" section).

## What This Does Not Cover

- **Agents and teams.** An almanac agent's body could become a conversation's `instructions`, and a team could become a subagent tool; whether and how agent-almanac ships that is a design question of its own (issue #1010).
- **A packaged extension.** This guide's extension is an example to copy. A version shipped as its own package is issue #1010.
- **pi, the coding agent.** pi reads skill folders itself; `agent-almanac install --framework universal` reaches it (see `cli/README.md`).

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| The model reads a skill and gets an error result | The host passed no `env` to `Harness.open` | Pass `env: () => new NodeExecutionEnv({ cwd })` |
| A skill is listed with an empty description | Its `SKILL.md` has no frontmatter `description` | Check the file starts with `---`, a YAML block with `description:`, and `---` |
| `readFileSync` throws `ENOENT` when the extension is created | An id in `ids` has no `<id>/SKILL.md` under `skillsDir` | Install the skill there first, or fix the id |
| `ERR_MODULE_NOT_FOUND` for an `@earendil-works/...` import or `js-yaml` | The package is not installed in the host | Install pi-durable, pi-ai and chord at one exact version, and `js-yaml` |
| `npm ls @earendil-works/pi-ai` shows two versions | The host pins pi-ai or chord at a version other than pi-durable's | Install all three at one version |

## Related Resources

- [Install Almanac Content](../skills/install-almanac-content/SKILL.md) -- putting skills where a tool reads them
- [Setting Up Your Environment](setting-up-your-environment.md) -- Node.js and the rest of the toolchain
