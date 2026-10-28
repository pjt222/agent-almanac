// measure.mjs -- which skills pi discovers, as pi's own SDK lists them (no model, no network).
//
// Usage:
//   HOME=<sandbox-home> PI_OFFLINE=1 node measure.mjs <pi-package-dir> <cwd> <agent-dir> <true|false>
//
// <pi-package-dir> is an installed @earendil-works/pi-coding-agent (the directory holding its
// package.json), e.g. from `npm install --ignore-scripts @earendil-works/pi-coding-agent@1.4.0` in a
// temporary directory. <cwd> is the project pi would run in, <agent-dir> pi's agent directory, and
// the last argument the project-trust decision handed to pi.
//
// Trust is passed explicitly through `SettingsManager.create(cwd, agentDir, { projectTrusted })`.
// Built the way examples/sdk/04-skills.ts builds it, with no settingsManager, the loader defaults to
// trusted, so an "untrusted" row would measure the trusted case twice. The script prints what the
// loader's settings manager reports (`isProjectTrusted()`), not the requested value, so a row whose
// trust did not reach the loader shows it. It passes the agent directory by hand, so pi's own
// PI_CODING_AGENT_DIR resolution (`getAgentDir()`) is NOT exercised here.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const [piPackageDir, cwd, agentDir, trustedArgument] = process.argv.slice(2);
if (!piPackageDir || !cwd || !agentDir || !['true', 'false'].includes(trustedArgument)) {
  console.error('usage: node measure.mjs <pi-package-dir> <cwd> <agent-dir> <true|false>');
  process.exit(2);
}

const pi = await import(pathToFileURL(join(piPackageDir, 'dist', 'index.js')).href);
const settingsManager = pi.SettingsManager.create(cwd, agentDir, { projectTrusted: trustedArgument === 'true' });
const loader = new pi.DefaultResourceLoader({ cwd, agentDir, settingsManager });
await loader.reload();
const { skills, diagnostics } = loader.getSkills();

console.log(JSON.stringify({
  piVersion: pi.VERSION,
  node: process.version,
  home: process.env.HOME,
  cwd,
  agentDir,
  requestedTrust: trustedArgument === 'true',
  isProjectTrusted: settingsManager.isProjectTrusted(),
  skills: skills.map((skill) => ({ name: skill.name, filePath: skill.filePath })),
  diagnostics: diagnostics.map((diagnostic) => ({ type: diagnostic.type, message: diagnostic.message, path: diagnostic.path })),
}, null, 1));
