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

The two code blocks below are the files `scripts/test/_pi-durable-example/almanac-skills.mjs` and `host.mjs`, byte for byte. `scripts/test/pi-durable-guide.test.js` runs them on every pull request and fails if this page and those files diverge.

## When to Use This Guide

- You are building an agent on pi-durable and want it to follow agent-almanac skills.
- You want the skills offered progressively: names and descriptions up front, a full `SKILL.md` only when the model asks for it.
- You want to test such a host without a model, a network or an API key.

## Prerequisites

- Node.js 26 or newer, the `engines` floor of this repository. pi-durable itself requires `>=22.19.0`.
- `@earendil-works/pi-durable`, `@earendil-works/pi-ai` and `@earendil-works/chord`, all at `1.4.0`, the version this guide is tested against. pi-durable is marked experimental upstream, so pin exact versions.
- `js-yaml`, to read a skill's frontmatter. It is already a dependency of agent-almanac.
- A directory of skills laid out as `<id>/SKILL.md`. Either:
  - one that `agent-almanac install <ids> --framework universal` wrote, such as `.agents/skills/`;
  - or the `skills/` folder of the installed `agent-almanac` package.

## Workflow Overview

1. **Choose the skills.** Every listed skill's name, description and path is in every request, so offer the ones the agent needs, not the whole library.
2. **Install the extension** below next to pi-durable's `CodingTools`, whose `read` tool loads a `SKILL.md`.
3. **Root the tool environment at the skills directory**, so the listed relative paths resolve.
4. **Test it with pi-ai's faux provider and `MemoryStorage`**, then swap in a real provider and a durable storage.

## The Extension

`almanacSkills()` reads each chosen skill's frontmatter once, when the extension is created. It returns an extension whose single section, `available_skills`, lists the skills. pi-durable renders a section inside a tag named after it, so the model sees `<available_skills>...</available_skills>`.

```js
// almanac-skills.mjs: agent-almanac skills in a pi-durable host.
//
// A pi-durable extension whose system-prompt section lists chosen skills by id,
// path and description. The model reads a skill's full SKILL.md with the `read`
// tool when a task calls for it, so only the listing costs context up front.
// Paths are relative to `skillsDir`; the host makes that directory the working
// directory of the environment its tools run in.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import { defineExtension, section } from '@earendil-works/pi-durable';

/** A skill's id, its SKILL.md path relative to `skillsDir`, and its description. */
function readSkill(skillsDir, id) {
  const path = `${id}/SKILL.md`;
  const text = readFileSync(join(skillsDir, path), 'utf8');
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
    ...skills.map((skill) => `- ${skill.id} (${skill.path}): ${skill.description}`),
  ].join('\n');
  return defineExtension({
    name: 'almanac-skills',
    sections: [section('available_skills', () => listing)],
  });
}
```

## The Host

The host installs `CodingTools` and the extension. Its environment roots every tool call at the skills directory, because `CodingTools` reaches files only through the call's environment, and without one the `read` tool fails with an error result. `models` is a pi-ai model registry with a provider set on it, and `storage` is any pi-durable storage.

```js
// host.mjs: a pi-durable host that offers agent-almanac skills.
//
// `models` is a pi-ai model registry with a provider set on it. `storage` is any
// pi-durable storage: MemoryStorage here, a SQLite or JSONL storage to survive
// restarts. The environment roots every tool call at `skillsDir`, which is where
// the `read` tool finds a skill's SKILL.md.
import { BACKGROUND_CONTEXT } from '@earendil-works/chord/context';
import { createRegistry, Harness } from '@earendil-works/pi-durable';
import { NodeExecutionEnv } from '@earendil-works/pi-durable/env/node';
import { CodingTools } from '@earendil-works/pi-durable/tools';
import { almanacSkills } from './almanac-skills.mjs';

export async function openAlmanacHost({ models, storage, skillsDir, ids, model }) {
  const context = BACKGROUND_CONTEXT;
  const registry = createRegistry();
  registry.install(CodingTools);
  registry.install(almanacSkills({ skillsDir, ids }));
  const harness = await Harness.open(
    storage,
    { models, registry, env: () => new NodeExecutionEnv({ cwd: skillsDir }) },
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
  context => (capture context.messages' system message; return a fauxToolCall('read', { path: '<id>/SKILL.md' })),
  fauxAssistantMessage([fauxText('...')]),
])
openAlmanacHost({ models, storage: new MemoryStorage(), skillsDir, ids, model: { provider: 'faux', modelId: faux.getModel().id } })
```

`scripts/test/pi-durable-guide.test.js` does exactly this. It asserts three things:
- the `available_skills` section reaches the model with each chosen skill's id, path and description;
- a skill that was not chosen is absent;
- the `read` call returns the chosen skill's `SKILL.md`.

For a real model, set a configured provider on `models` instead of the faux one (pi-durable's README, "Quick Start"). For a restart-safe host, open a SQLite or JSONL storage instead of `MemoryStorage` (its "Storage" section).

## What This Does Not Cover

- **Agents and teams.** An almanac agent's body could become a conversation's `instructions`, and a team could become a subagent tool; whether and how agent-almanac ships that is a design question of its own (issue #1010).
- **A packaged extension.** This guide's extension is an example to copy. A version shipped as its own package is issue #1010.
- **pi, the coding agent.** pi reads skill folders itself; `agent-almanac install --framework universal` reaches it (see `cli/README.md`).

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| The model reads a skill and gets an error result | The tool environment is not rooted at the skills directory, or the host passed no `env` | Pass `env: () => new NodeExecutionEnv({ cwd: skillsDir })` to `Harness.open` |
| A skill is listed with an empty description | Its `SKILL.md` has no frontmatter `description` | Check the file starts with `---`, a YAML block with `description:`, and `---` |
| `readFileSync` throws `ENOENT` when the extension is created | An id in `ids` has no `<id>/SKILL.md` under `skillsDir` | Install the skill there first, or fix the id |
| `ERR_MODULE_NOT_FOUND` for an `@earendil-works/...` import | The three pi packages are not installed | Install pi-durable, pi-ai and chord at one exact version |

## Related Resources

- [Install Almanac Content](../skills/install-almanac-content/SKILL.md) -- putting skills where a tool reads them
- [Setting Up Your Environment](setting-up-your-environment.md) -- Node.js and the rest of the toolchain
