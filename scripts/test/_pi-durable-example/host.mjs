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
