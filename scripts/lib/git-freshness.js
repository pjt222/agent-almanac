/**
 * git-freshness.js
 *
 * Shared batched git helpers for the translation freshness tooling (#305).
 *
 * The naive approach — one `git log -1 -- <file>` plus one
 * `git merge-base --is-ancestor` per translated file — spawns thousands of
 * git processes across ~3,600 translations and takes 10+ minutes on
 * NTFS/WSL. These helpers answer the same questions with a handful of
 * spawns:
 *
 *  - isStale(sourceCommit, relPath): "has relPath changed since
 *    sourceCommit?" via ONE `git log --name-only <commit>..HEAD` per
 *    DISTINCT source_commit (scaffold batches share commits, so distinct
 *    values number in the dozens, not thousands).
 *  - buildLatestCommitMap(): path -> latest short hash for every file under
 *    the given pathspecs, from ONE streaming `git log --name-only` pass.
 *
 * Semantics match the old per-file logic for the normal case (source_commit
 * is an ancestor of HEAD). Differences, both deliberate:
 *  - a full-length source_commit pointing at the newest commit of a file no
 *    longer misreports as stale (the old short-hash equality shortcut missed
 *    it and `merge-base --is-ancestor S S` succeeded);
 *  - an unresolvable source_commit still counts as not-stale, matching the
 *    old catch-to-false behaviour.
 */

import { execFileSync } from 'child_process';

const GIT_BUFFER = 256 * 1024 * 1024;

/**
 * Refuse to compute staleness in a shallow clone. Per-file `git log` and
 * `merge-base --is-ancestor` both misreport there, so every translation
 * would silently read as fresh (stale: 0) — see #279/#362. Call this before
 * any staleness use; it exits the process loudly instead of lying.
 * Deliberately loud even for --warn callers: a "warn-only" run on a shallow
 * clone would not warn less, it would lie — hard-exit is the honest mode.
 */
export function assertNotShallow(root) {
  const isShallow = execFileSync('git', ['rev-parse', '--is-shallow-repository'], {
    cwd: root, encoding: 'utf8'
  }).trim();
  if (isShallow === 'true') {
    console.error('ERROR: shallow clone detected — staleness would be silently wrong.');
    console.error('Fetch full history first (actions/checkout fetch-depth: 0, or git fetch --unshallow).');
    process.exit(1);
  }
}

/**
 * Create a staleness checker rooted at a git work tree.
 * `pathspecs` bounds every git walk to the content trees that matter.
 */
export function createFreshnessChecker(root, pathspecs = ['skills', 'agents', 'teams', 'guides']) {
  // source_commit -> Set(relative paths changed since it) | null (unresolvable)
  const changedSince = new Map();

  function commitResolves(commit) {
    try {
      execFileSync('git', ['rev-parse', '--quiet', '--verify', `${commit}^{commit}`],
        { cwd: root, stdio: ['ignore', 'ignore', 'ignore'] });
      return true;
    } catch {
      return false;
    }
  }

  function pathsChangedSince(commit) {
    if (changedSince.has(commit)) return changedSince.get(commit);
    let result = null;
    if (/^[a-f0-9]{4,40}$/i.test(commit) && commitResolves(commit)) {
      const out = execFileSync('git',
        ['log', '--name-only', '--format=', `${commit}..HEAD`, '--', ...pathspecs],
        { cwd: root, encoding: 'utf8', maxBuffer: GIT_BUFFER });
      result = new Set(out.split('\n').filter(Boolean));
    }
    changedSince.set(commit, result);
    return result;
  }

  /**
   * True when relPath (repo-relative, forward slashes) was touched by any
   * commit after sourceCommit on the path to HEAD.
   */
  function isStale(sourceCommit, relPath) {
    if (!sourceCommit || !relPath) return false;
    const changed = pathsChangedSince(sourceCommit);
    if (!changed) return false;
    return changed.has(relPath);
  }

  /** Number of distinct source commits resolved so far (progress metric). */
  function distinctCommits() {
    return changedSince.size;
  }

  return { isStale, distinctCommits };
}

/**
 * One streaming pass over history: repo-relative path -> latest short hash.
 * First occurrence in `git log` order (newest first) wins.
 */
export function buildLatestCommitMap(root, pathspecs = ['skills', 'agents', 'teams', 'guides']) {
  const out = execFileSync('git',
    ['log', '--name-only', '--format=%x00%h', '--', ...pathspecs],
    { cwd: root, encoding: 'utf8', maxBuffer: GIT_BUFFER });
  const map = new Map();
  let current = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('\x00')) {
      current = line.slice(1).trim();
      continue;
    }
    if (line && current && !map.has(line)) {
      map.set(line, current);
    }
  }
  return map;
}
