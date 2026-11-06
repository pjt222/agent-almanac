// measure-overlap.mjs -- which skills pi lists, and which diagnostics it reports, for a trusted
// project whose skill sits in both .pi/skills/ and .agents/skills/ (#1006).
//
// Usage: HOME=<sandbox-home> PI_OFFLINE=1 node measure-overlap.mjs <pi-package-dir> <cwd>
//
// The project is marked trusted, because pi reads a project's .pi/skills/ and .agents/skills/
// only after its trust decision. The agent directory is pi's own getAgentDir() under the
// sandbox home, which holds no skills.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const [piPackageDir, cwd] = process.argv.slice(2);
const pi = await import(pathToFileURL(join(piPackageDir, 'dist', 'index.js')).href);
const agentDir = pi.getAgentDir();
const settingsManager = pi.SettingsManager.create(cwd, agentDir, { projectTrusted: true });
const loader = new pi.DefaultResourceLoader({ cwd, agentDir, settingsManager });
await loader.reload();
const { skills, diagnostics } = loader.getSkills();
console.log(JSON.stringify({
  piVersion: pi.VERSION, node: process.version,
  skills: skills.map((skill) => ({ name: skill.name, filePath: skill.filePath })),
  diagnostics: diagnostics.map((d) => ({ type: d.type, message: d.message, path: d.path })),
}, null, 1));
