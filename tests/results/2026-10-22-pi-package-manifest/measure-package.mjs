// measure-package.mjs -- which skills pi loads from the packages its user settings declare, and
// how large pi's skills section of the system prompt is (no model, no network).
//
// Usage:
//   HOME=<sandbox-home> PI_OFFLINE=1 node measure-package.mjs <pi-package-dir> <cwd> <agent-dir>
//
// <agent-dir>/settings.json declares the package (`{"packages": ["<dir>"]}`, written by hand or by
// `pi install <dir>`). The project is trusted; a package declared in user settings does not depend
// on project trust. The size is pi's own `formatSkillsForPrompt()` over the loaded skills, in
// characters and as pi's chars/4 token estimate; it includes each skill's absolute path, so it
// varies with where the package is.
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

const [piPackageDir, cwd, agentDir] = process.argv.slice(2);
if (!piPackageDir || !cwd || !agentDir) {
  console.error('usage: node measure-package.mjs <pi-package-dir> <cwd> <agent-dir>');
  process.exit(2);
}

const pi = await import(pathToFileURL(join(piPackageDir, 'dist', 'index.js')).href);
const settingsManager = pi.SettingsManager.create(cwd, agentDir, { projectTrusted: true });
const loader = new pi.DefaultResourceLoader({ cwd, agentDir, settingsManager });
await loader.reload();
const { skills, diagnostics } = loader.getSkills();
const block = pi.formatSkillsForPrompt(skills);

console.log(JSON.stringify({
  piVersion: pi.VERSION,
  node: process.version,
  agentDir,
  skillCount: skills.length,
  promptChars: block.length,
  promptTokensCharsOver4: Math.ceil(block.length / 4),
  skills: skills.map((skill) => ({ name: skill.name, filePath: skill.filePath })).sort((a, b) => a.name.localeCompare(b.name)),
  diagnostics: diagnostics.map((diagnostic) => ({ type: diagnostic.type, message: diagnostic.message, path: diagnostic.path })),
}, null, 1));
