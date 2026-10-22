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
