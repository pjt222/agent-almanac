/**
 * placement.js — What sits at an install path, decided without following a link.
 *
 * Nine adapters make a link into the content root: universal, claude-code,
 * opencode, openclaw, hermes, vibe, gemini, cursor and copilot, at twelve sites
 * between them. Each tested its install path with existsSync, which follows a
 * link, so a link whose target is gone counted as absent. uninstall reported
 * it "not installed" and left it (#993 §2), and install, with or without
 * --force, skipped it and then failed with EEXIST when symlinkSync met it
 * (S3-B2 P5). That is the state `npm uninstall` leaves links into the package
 * in, and the state an `npm update` that drops an item leaves one link in.
 *
 * lstat sees the link itself. The adapters keep their own path arithmetic and
 * call these at each link site.
 */

import { existsSync, lstatSync, unlinkSync } from 'fs';

/**
 * What is at a path, by lstat.
 *
 * `foreign` is anything that is not a link: a real file or directory. The CLI
 * makes only links at these paths.
 *
 * @param {string} entryPath
 * @returns {{ kind: 'absent' } | { kind: 'link', broken: boolean } | { kind: 'foreign' }}
 */
export function classify(entryPath) {
  let stat;
  try {
    stat = lstatSync(entryPath);
  } catch (err) {
    // ENOTDIR: a parent is a file, so nothing can be at the path. existsSync
    // answered false there too.
    if (err.code === 'ENOENT' || err.code === 'ENOTDIR') return { kind: 'absent' };
    throw err;
  }
  if (stat.isSymbolicLink()) return { kind: 'link', broken: !existsSync(entryPath) };
  return { kind: 'foreign' };
}

/**
 * Remove what an uninstall finds at a link site. A dangling link is removed
 * like any other.
 *
 * @param {string} entryPath
 * @returns {import('../adapters/base.js').InstallResult}
 */
export function removeEntry(entryPath) {
  if (classify(entryPath).kind === 'absent') {
    return { action: 'skipped', path: entryPath, details: 'not installed' };
  }
  unlinkSync(entryPath);
  return { action: 'removed', path: entryPath };
}

/**
 * Make an install path free for a new link, or say why the install stops.
 *
 * Without --force anything at the path, a dangling link included, is reported
 * as already there and kept. With --force it is unlinked first.
 *
 * @param {string} entryPath
 * @param {{ force?: boolean, existsDetails?: string }} [options]
 * @returns {import('../adapters/base.js').InstallResult|null} null when the
 *   path is free to link; otherwise the result the adapter returns as it is.
 */
export function clearForInstall(entryPath, { force = false, existsDetails = 'already exists' } = {}) {
  if (classify(entryPath).kind === 'absent') return null;
  if (!force) return { action: 'skipped', path: entryPath, details: existsDetails };
  // A directory cannot be unlinked; symlinkSync then fails with EEXIST, as before.
  try { unlinkSync(entryPath); } catch { /* not a link or a file */ }
  return null;
}
