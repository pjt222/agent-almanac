/**
 * sandbox-env.js — the home variables a CLI spawn in the tests gets, as one list (#1071, #1075).
 *
 * A spawn of `cli/index.js` that sees the caller's home detects the caller's Hermes and
 * OpenClaw, and pi's global directory follows `$PI_CODING_AGENT_DIR` wherever the CLI runs, so a
 * project-scope install or gather in a test could link items into the real `~/.hermes`,
 * `~/.openclaw` or pi directory (#1071, #1075). The sandbox pins every variable the CLI reads a
 * home from to a home of the test's own:
 *
 *   HOME, USERPROFILE   the home itself; `os.homedir()` reads USERPROFILE on win32
 *   HERMES_HOME         `<home>/.hermes`; `resolveHermesHome()` reads it before the home
 *   LOCALAPPDATA        removed: Hermes's win32 default (`%LOCALAPPDATA%\hermes`)
 *   PI_CODING_AGENT_DIR removed: without it pi's directory is `<home>/.pi/agent`
 *
 * This list has a second half. `tools/sandbox-env.sh` applies the same list in a shell, for a
 * probe that runs the CLI by hand, and `cli/test/sandbox-env.test.js` holds the two equal in
 * both directions: it parses the fragment's `export` and `unset` lines against the two exports
 * below, and it sources the fragment in bash (and zsh, where installed) and compares the
 * environment a child process then receives with `sandboxEnv()`'s. Add a key here and that
 * suite fails naming the fragment; add one there and it fails naming this file.
 *
 * One key per line, so that deleting a line deletes a key and still parses.
 */
import { resolve } from 'node:path';

/**
 * Variables pinned to a path under the sandbox home, as `name: path relative to the home`.
 * The empty string is the home itself.
 */
export const SANDBOX_SET = Object.freeze({
  HOME: '',
  USERPROFILE: '',
  HERMES_HOME: '.hermes',
});

/** Variables removed, so the caller's value cannot reach a spawn. */
export const SANDBOX_UNSET = Object.freeze([
  'LOCALAPPDATA',
  'PI_CODING_AGENT_DIR',
]);

/** Every variable the sandbox touches, pinned or removed: the set a test saves and restores. */
export const SANDBOX_KEYS = Object.freeze([...Object.keys(SANDBOX_SET), ...SANDBOX_UNSET]);

/**
 * A copy of `base` with every variable in SANDBOX_SET pinned under `home` and every variable in
 * SANDBOX_UNSET removed. `base` is read when this is called, not when the module loads, so a
 * test that changes `process.env` in a `before()` is seen.
 *
 * @param {string} home an absolute path; HOME and USERPROFILE get it exactly as given
 * @param {Record<string, string | undefined>} [base]
 * @returns {Record<string, string | undefined>}
 */
export function sandboxEnv(home, base = process.env) {
  const env = { ...base };
  for (const [key, relative] of Object.entries(SANDBOX_SET)) env[key] = relative ? resolve(home, relative) : home;
  for (const key of SANDBOX_UNSET) delete env[key];
  return env;
}
