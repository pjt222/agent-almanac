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
 *
 * They also used unlinkSync on whatever they found, so uninstall deleted a
 * user's own regular file at an install path and install --force replaced it
 * with a link (S3-B2 P2a, P2d). A user's directory survived only because
 * unlinkSync cannot remove one. The CLI makes only links at these paths, so
 * ownership() keeps anything else, and removeEntry() and clearForInstall()
 * both go through it.
 */

import { existsSync, lstatSync, unlinkSync } from 'fs';

/** Printed after the path of an entry the CLI keeps because it did not make it. */
export const FOREIGN_NOTE = 'not installed by agent-almanac; left in place';

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
 * The ownership verdict: may the CLI remove or replace this entry?
 *
 * A link is the CLI's to remove, because it is the only thing the CLI makes
 * here, and removing one loses no data even when a user made it. Anything else
 * is a file or directory someone else put there, and is kept. This is the one
 * decision removeEntry() and clearForInstall() share.
 *
 * @param {ReturnType<typeof classify>} entry - Not 'absent'.
 * @returns {{ removable: true } | { removable: false, reason: 'foreign', note: string }}
 */
export function ownership(entry) {
  if (entry.kind === 'link') return { removable: true };
  return { removable: false, reason: 'foreign', note: FOREIGN_NOTE };
}

/** The result for an entry ownership() keeps: skipped, with the reason and a printed note. */
function keep(entryPath, verdict) {
  return { action: 'skipped', path: entryPath, reason: verdict.reason, note: verdict.note };
}

/**
 * Remove what an uninstall finds at a link site, or keep it and say why. A
 * dangling link is removed like any other. A dry run returns what the real run
 * would, so it predicts a kept entry as kept.
 *
 * @param {string} entryPath
 * @param {{ dryRun?: boolean }} [options]
 * @returns {import('../adapters/base.js').InstallResult}
 */
export function removeEntry(entryPath, { dryRun = false } = {}) {
  const entry = classify(entryPath);
  if (entry.kind === 'absent') {
    return { action: 'skipped', path: entryPath, details: 'not installed' };
  }
  const verdict = ownership(entry);
  if (!verdict.removable) return keep(entryPath, verdict);
  if (dryRun) return { action: 'removed', path: entryPath, details: 'dry-run' };
  unlinkSync(entryPath);
  return { action: 'removed', path: entryPath };
}

/**
 * Make an install path free for a new link, or say why the install stops.
 *
 * Without --force anything at the path, a dangling link included, is reported
 * as already there and kept. With --force a link is unlinked first, and
 * anything else is kept and reported the way removeEntry() reports it.
 *
 * @param {string} entryPath
 * @param {{ force?: boolean, existsDetails?: string }} [options]
 * @returns {import('../adapters/base.js').InstallResult|null} null when the
 *   path is free to link; otherwise the result the adapter returns as it is.
 */
export function clearForInstall(entryPath, { force = false, existsDetails = 'already exists' } = {}) {
  const entry = classify(entryPath);
  if (entry.kind === 'absent') return null;
  if (!force) return { action: 'skipped', path: entryPath, details: existsDetails };
  const verdict = ownership(entry);
  if (!verdict.removable) return keep(entryPath, verdict);
  unlinkSync(entryPath);
  return null;
}
