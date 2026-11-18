// measure-agent.mjs -- what pi's subagent extension finds in an agent directory, and which tools a pi
// session activates for an agent's `tools` list (no model call, no network).
//
// Usage:
//   HOME=<sandbox-home> PI_CODING_AGENT_DIR=<agent-dir> PI_OFFLINE=1 \
//     node measure-agent.mjs <pi-package-dir> <sandbox-dir> <cwd> <agent-id> [<tool,tool,...> ...]
//
// <pi-package-dir> is an installed @earendil-works/pi-coding-agent. Its example extension's discovery
// code, examples/extensions/subagent/agents.ts, is copied into <sandbox-dir> beside a node_modules link
// to the package's own node_modules, because Node does not strip TypeScript types under node_modules.
// discoverAgents(cwd, "user") is the call the extension makes by default; it reads
// <agent-dir>/agents/ through pi's getAgentDir(), so PI_CODING_AGENT_DIR reaches pi's own resolver.
//
// For each tool list given (comma-separated, as the extension passes it to `pi --tools`), the script
// opens an in-memory session with createAgentSession({ tools }) and prints session.getActiveToolNames().
// The first list is taken from the discovered agent itself when it is the literal word `agent`.
import { copyFileSync, existsSync, mkdirSync, symlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [piPackageDir, sandboxDir, cwd, agentId, ...toolLists] = process.argv.slice(2);
if (!piPackageDir || !sandboxDir || !cwd || !agentId) {
  console.error('usage: node measure-agent.mjs <pi-package-dir> <sandbox-dir> <cwd> <agent-id> [<tool,tool,...> ...]');
  process.exit(2);
}

mkdirSync(sandboxDir, { recursive: true });
const nodeModules = join(sandboxDir, 'node_modules');
if (!existsSync(nodeModules)) symlinkSync(dirname(dirname(piPackageDir)), nodeModules);
const agentsTs = join(sandboxDir, 'agents.ts');
copyFileSync(join(piPackageDir, 'examples', 'extensions', 'subagent', 'agents.ts'), agentsTs);

const pi = await import(pathToFileURL(join(piPackageDir, 'dist', 'index.js')).href);
const { discoverAgents } = await import(pathToFileURL(agentsTs).href);

const { agents } = discoverAgents(cwd, 'user');
const agent = agents.find((candidate) => candidate.name === agentId) ?? null;

const sessions = [];
for (const list of toolLists) {
  const tools = list === 'agent' ? (agent?.tools ?? []) : list.split(',').map((name) => name.trim()).filter(Boolean);
  let activeTools = null;
  let error = null;
  try {
    const { session } = await pi.createAgentSession({
      cwd,
      agentDir: pi.getAgentDir(),
      tools,
      sessionManager: pi.SessionManager.inMemory(),
    });
    activeTools = session.getActiveToolNames();
    session.dispose();
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }
  sessions.push({ requested: tools, activeTools, error });
}

console.log(JSON.stringify({
  piVersion: pi.VERSION,
  node: process.version,
  agentDir: pi.getAgentDir(),
  discovered: agents.map((candidate) => ({ name: candidate.name, source: candidate.source, tools: candidate.tools ?? null, model: candidate.model ?? null })),
  agent,
  sessions,
}, null, 1));
