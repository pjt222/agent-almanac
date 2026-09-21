/**
 * _git-fixture.js — turn a temp directory into a throwaway git repository, safely.
 *
 * Three suites need one now that `lib/git-files.js` refuses to enumerate outside a checkout
 * (#874 review, S2): before that, `skills-inventory.test.js` and `tools-registry.test.js` built
 * bare `mkdtemp` trees and silently exercised a disk fallback that production never took — nine
 * fixtures asserting the behaviour of a branch no consumer reached.
 *
 * `cleanEnv` is the load-bearing half and it is not optional. Neither `cwd` nor `-C` is
 * isolation: git honours an absolute `GIT_DIR` over both, and `GIT_DIR` is exported into every
 * hook, so a suite that runs `git init` under an inherited one writes its fixture into the
 * CALLER's repository — silently, at exit 0. Every `GIT_*` key is dropped rather than the ones
 * anyone thought of; a denylist has already missed `GIT_CONFIG_PARAMETERS` and
 * `GIT_TEMPLATE_DIR` in this repository before. `HOME` and `XDG_CONFIG_HOME` move too, because
 * `$XDG_CONFIG_HOME/git/ignore` is read through no variable at all and `GIT_CONFIG_GLOBAL` does
 * not reach it.
 *
 * Named with a leading underscore by the convention `_tmp.js` set: what keeps it out of the run
 * is the absent `.test.js` suffix, which is also what keeps it out of `tmp-helper.test.js`'s
 * guard.
 */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

/** An environment git cannot escape. `extra` is merged last, for a test that needs one key back. */
export function cleanEnv(home, extra = {}) {
  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('GIT_')) env[key] = value;
  }
  env.HOME = home;
  env.XDG_CONFIG_HOME = join(home, '.config');
  env.GIT_CONFIG_NOSYSTEM = '1';
  return { ...env, ...extra };
}

/**
 * Make `dir` a git repository and return a `git(...args)` runner bound to it.
 *
 * The runner asserts exit 0 and returns stdout, so a fixture cannot be built on a failed `git
 * init` and then assert something about the enumerator that is really about an absent
 * repository. `commit: false` leaves the tree untracked — which is a state the enumerator must
 * still handle, since an untracked-but-not-ignored file is deliberately in scope.
 */
export function initRepo(dir, { commit = true, message = 'fixture' } = {}) {
  const git = (...args) => {
    const result = spawnSync('git', ['-C', dir, ...args], { encoding: 'utf8', env: cleanEnv(dir) });
    if (result.status !== 0) {
      throw new Error(`git ${args.join(' ')} failed in ${dir} (exit ${result.status}): ${result.stderr}`);
    }
    return result.stdout;
  };
  git('init', '-q', '-b', 'main', '.');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Fixture');
  if (commit) {
    git('add', '-A');
    // An empty tree has nothing to commit and `git commit` exits 1 on it; the repository is
    // still a repository, which is all the enumerator needs.
    const result = spawnSync('git', ['-C', dir, 'commit', '-qm', message], { encoding: 'utf8', env: cleanEnv(dir) });
    if (result.status !== 0 && !/nothing to commit/.test(result.stdout + result.stderr)) {
      throw new Error(`git commit failed in ${dir} (exit ${result.status}): ${result.stderr}`);
    }
  }
  return git;
}
