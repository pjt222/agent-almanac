// measure-tilde.mjs -- which skills pi lists from the agent directory IT resolves, with
// PI_CODING_AGENT_DIR as the environment gives it (for example a literal `~/<dir>`).
//
// Usage: HOME=<sandbox-home> PI_CODING_AGENT_DIR='~/<dir>' PI_OFFLINE=1 node measure-tilde.mjs <pi-package-dir> <cwd>
//
// Unlike #1005's measure.mjs, the agent directory is not passed in: it is pi's own getAgentDir(),
// so pi's tilde expansion is what is exercised.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const [piPackageDir, cwd] = process.argv.slice(2);
const pi = await import(pathToFileURL(join(piPackageDir, 'dist', 'index.js')).href);
const agentDir = pi.getAgentDir();
const settingsManager = pi.SettingsManager.create(cwd, agentDir, { projectTrusted: false });
const loader = new pi.DefaultResourceLoader({ cwd, agentDir, settingsManager });
await loader.reload();
const { skills, diagnostics } = loader.getSkills();
console.log(JSON.stringify({
  piVersion: pi.VERSION, node: process.version, home: process.env.HOME,
  envValue: process.env.PI_CODING_AGENT_DIR, agentDirFromPi: agentDir,
  skills: skills.map((skill) => ({ name: skill.name, filePath: skill.filePath })),
  diagnostics: diagnostics.map((d) => ({ type: d.type, message: d.message, path: d.path })),
}, null, 1));
