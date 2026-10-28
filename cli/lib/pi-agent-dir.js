/**
 * pi-agent-dir.js — Resolve pi's agent directory the way pi itself does (#1006).
 *
 * pi (pi.dev, `@earendil-works/pi-coding-agent`) keeps its user configuration
 * and user skills in its "agent directory", `<agent-dir>/skills/` for skills.
 * pi 1.4.0 resolves it in `getAgentDir()` (dist/config.js):
 *
 *   1. `$PI_CODING_AGENT_DIR` when it is set to a non-empty string, passed
 *      through `normalizePath()` (dist/utils/paths.js):
 *        - on win32, a Git Bash, MSYS, Cygwin or WSL drive path (`/c/x`,
 *          `/mnt/c/x`, `/cygdrive/c/x`) becomes `C:\x`;
 *        - `~` becomes the home directory, and `~/x` (on win32 also `~\x`)
 *          becomes `<home>/x`;
 *        - a `file://` URL becomes its path.
 *      Anything else is returned as given, and pi resolves a relative value
 *      against its working directory when it uses it.
 *   2. Otherwise `<home>/.pi/agent`.
 *
 * This module reproduces that rule, so that `--framework pi -g` installs where
 * pi reads. Two choices follow from matching pi rather than from taste:
 *
 *   - A whitespace-only value is a PATH, as it is for pi, which tests only for
 *     a non-empty string. resolveHermesHome() treats a blank $HERMES_HOME as
 *     unset; this does not, because a resolver that disagrees with pi would
 *     install skills where pi never looks.
 *   - The result is resolved to an absolute path here, against this process's
 *     working directory. pi resolves the same relative value against its own,
 *     so the two agree when both run from the same directory, which is the
 *     only case a relative $PI_CODING_AGENT_DIR can promise.
 *
 * `homedir()` is os.homedir(), which reads $HOME on POSIX and USERPROFILE on
 * win32, as pi's does. Not followed: pi's `normalizePath` options that
 * `getAgentDir()` does not pass (trimming, Unicode space folding, an `@`
 * prefix).
 */
import { existsSync, realpathSync } from 'fs';
import { homedir } from 'os';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

/**
 * pi's conversion of a shell-style drive path to a Windows one
 * (`normalizeWindowsShellPath` in pi 1.4.0's dist/utils/paths.js), applied by
 * pi on win32 only.
 * @param {string} filePath
 * @returns {string}
 */
export function normalizeWindowsShellPath(filePath) {
  if (!filePath.startsWith('/') || filePath.startsWith('//') || filePath.includes('\\')) return filePath;
  const match = filePath.match(/^\/(?:mnt\/|cygdrive\/)?([a-z])(?:\/(.*))?$/i);
  if (!match) return filePath;
  const suffix = match[2]?.replaceAll('/', '\\');
  return `${match[1].toUpperCase()}:\\${suffix ?? ''}`;
}

/**
 * @returns {string} pi's agent directory, absolute.
 */
export function resolvePiAgentDir() {
  const home = homedir();
  const fromEnv = process.env.PI_CODING_AGENT_DIR;
  if (fromEnv) {
    let value = fromEnv;
    if (process.platform === 'win32') value = normalizeWindowsShellPath(value);
    if (value === '~') return resolve(home);
    if (value.startsWith('~/') || (process.platform === 'win32' && value.startsWith('~\\'))) {
      return resolve(join(home, value.slice(2)));
    }
    if (/^file:\/\//.test(value)) return resolve(fileURLToPath(value));
    return resolve(value);
  }
  return join(home, '.pi', 'agent');
}

/**
 * Whether a directory is the user's home directory, compared by real path
 * where both resolve, so a symlinked home still matches.
 * @param {string} dir
 * @returns {boolean}
 */
export function isHomeDirectory(dir) {
  const canonical = (path) => {
    try { return realpathSync(path); } catch { return resolve(path); }
  };
  return canonical(dir) === canonical(homedir());
}

/**
 * Whether `projectDir` is a pi project: it holds a `.pi` directory and is not
 * the home directory. At the home directory `~/.pi` is where pi keeps its own
 * agent directory by default, so its presence says nothing about a project.
 * @param {string} projectDir
 * @returns {boolean}
 */
export function isPiProject(projectDir) {
  return existsSync(resolve(projectDir, '.pi')) && !isHomeDirectory(projectDir);
}
