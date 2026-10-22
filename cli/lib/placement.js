/**
 * placement.js — What sits at an install path, and how the CLI puts content
 * there or takes it away, decided without following a link.
 *
 * Nine adapters place content at twelve sites between them: universal,
 * claude-code, opencode, openclaw, hermes, vibe, gemini, cursor and copilot.
 * By default each site holds a link into the content root. With
 * `--from-package copy` it holds a copy instead, marked so that the CLI can
 * tell its own copy from anything else (#606 part 2). The adapters keep their
 * own path arithmetic and call these at each site.
 *
 * Every path is tested with lstat. existsSync follows a link, so a link whose
 * target is gone used to count as absent: uninstall left it (#993 §2) and
 * install failed with EEXIST when symlinkSync met it (S3-B2 P5).
 *
 * The CLI removes or replaces a link, whoever made it (unlinking one loses no
 * data: ownership()), and otherwise only what it made: a copy whose marker
 * names it and whose files are all as copied, OS and editor junk aside
 * (isJunkPath), with any directory in it that holds no other file or link.
 * Anything else is kept and reported with a note. The
 * check and the removal are not one atomic step: removeEntry() and
 * placeCopy() state the window. Before this, the sites unlinked whatever regular
 * file they found (S3-B2 P2a, P2d), and a user's directory survived only
 * because unlinkSync cannot remove one. Copy mode needs a remover that can,
 * so the ownership verdict is the one thing between "remove our copy" and
 * "remove the user's directory". removeEntry(), clearForInstall() and
 * placeCopy() all reach it through one guard line, refuseUnlessOwned().
 *
 * Each of those three takes the directory and the name, not a path, and
 * builds the path with childPath(), which refuses a name that would leave the
 * directory (critique F1). The id rule in cli/lib/item-id.js refuses such
 * names earlier, in installAll and uninstallAll; this holds when an adapter
 * or this module is called directly.
 */

import { createHash } from 'crypto';
import {
  constants as fsConstants,
  copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync,
  readlinkSync, renameSync, rmdirSync, rmSync, symlinkSync, unlinkSync, writeFileSync,
} from 'fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'path';
import { childPath } from '../adapters/base.js';

/** Printed after the path of an entry the CLI keeps because it did not make it. */
export const FOREIGN_NOTE = 'not installed by agent-almanac; left in place';

/** The marker inside a copied directory; a copied file's marker is its sidecar (sidecarPath). */
export const COPY_MARKER = '.agent-almanac-copy.json';

/** Prefix of the directory a copy is staged in, beside its install path. */
export const STAGING_PREFIX = '.agent-almanac-staging-';

/** The marker's schema version, which is also its discriminator. */
export const MARKER_SCHEMA = 1;

const SHA256_RE = /^sha256:[0-9a-f]{64}$/;

/**
 * Names an operating system or an editor drops into a directory. One that the
 * marker does not record does not make a copy "edited" (the maintainer's
 * decision D1, 2026-10-21, amended 2026-10-22 after review round 1); a
 * recorded file of such a name is compared like any other.
 *
 * Matched against an entry's own name only, never against the directories
 * above it: a user's directory named like one of these (`#drafts#/`,
 * `.#work/`, `.plans.swp/`) hides nothing, and the files in it count as
 * added. Python's bytecode is the one case decided by a directory: a `.pyc`
 * or `.pyo` file under a `__pycache__` directory (PYCACHE_DIR,
 * BYTECODE_PATTERN), at any depth; any other file there counts as added.
 */
export const JUNK_NAMES = Object.freeze(['.DS_Store', 'Thumbs.db', 'desktop.ini']);

/**
 * Editor files, by name pattern. Same rule as JUNK_NAMES. A `~` backup is not
 * one: it can hold the only copy of a user's edit (D1 names swap files, not
 * backups).
 */
export const JUNK_PATTERNS = Object.freeze([
  /^\..+\.sw[a-p]$/, // vim swap files: .SKILL.md.swp, .SKILL.md.swo, … down to .swa
  /^\.#/, //            emacs lock files: .#SKILL.md
  /^#.+#$/, //          emacs auto-save files: #SKILL.md#
]);

/** The directory Python writes bytecode into; only BYTECODE_PATTERN files under it are junk. */
export const PYCACHE_DIR = '__pycache__';

/** Python bytecode, junk only under a PYCACHE_DIR. */
export const BYTECODE_PATTERN = /\.py[co]$/;

/** @param {string} name - An entry's own name */
export function isJunkName(name) {
  return JUNK_NAMES.includes(name) || JUNK_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Whether an entry inside a copy that its marker does not record is junk:
 * by its own name (isJunkName), or as bytecode under a PYCACHE_DIR.
 * @param {string} rel - The entry's relative POSIX path inside the copy
 */
export function isJunkPath(rel) {
  const segments = rel.split('/');
  const name = segments.at(-1);
  return isJunkName(name) || (segments.slice(0, -1).includes(PYCACHE_DIR) && BYTECODE_PATTERN.test(name));
}

/**
 * The sidecar marker of a copied file: `<dir>/.<name>.agent-almanac-copy.json`.
 * A dotfile ending in `.json`, so a loader globbing `*.md` skips it.
 * @param {string} filePath
 */
export function sidecarPath(filePath) {
  return join(dirname(filePath), `.${basename(filePath)}${COPY_MARKER}`);
}

/**
 * A name in an install directory that is the CLI's own bookkeeping, not an
 * installed item: a staging directory or a sidecar marker. Listings skip it.
 * Never used inside a copy's own tree, where such a name is the user's.
 * @param {string} name
 */
export function isInternalName(name) {
  return name.startsWith(STAGING_PREFIX) || name.endsWith(COPY_MARKER);
}

const isNonEmptyString = (value) => typeof value === 'string' && value.length > 0;

/**
 * The package name and version a copy records, read from a content root's
 * package.json. null when either is missing or not a non-empty string.
 * @param {string} root
 * @returns {{ name: string, version: string } | null}
 */
export function readPackageIdentity(root) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
  if (!manifest || !isNonEmptyString(manifest.name) || !isNonEmptyString(manifest.version)) return null;
  return { name: manifest.name, version: manifest.version };
}

const markerPathOf = (entryPath, isDir) => (isDir ? join(entryPath, COPY_MARKER) : sidecarPath(entryPath));

/** A key of a marker's `files`: a relative POSIX path with no empty, `.` or `..` segment. */
function isRecordedPath(key) {
  if (key.includes('\\') || key.includes('\0') || key.startsWith('/')) return false;
  return key.split('/').every((segment) => segment !== '' && segment !== '.' && segment !== '..');
}

/**
 * Whether a parsed marker is one this CLI wrote for this entry. One clause per
 * line, so a mutant can drop exactly one.
 */
function isOwnedMarker(marker, entryPath, isDir) {
  if (marker === null || typeof marker !== 'object' || Array.isArray(marker)) return false;
  if (marker.agentAlmanacCopy !== MARKER_SCHEMA) return false;
  if (marker.entry !== basename(entryPath)) return false;
  const pkg = marker.package;
  if (pkg === null || typeof pkg !== 'object' || !isNonEmptyString(pkg.name) || !isNonEmptyString(pkg.version)) return false;
  const files = marker.files;
  if (files === null || typeof files !== 'object' || Array.isArray(files)) return false;
  const keys = Object.keys(files);
  if (!keys.every((key) => isRecordedPath(key) && typeof files[key] === 'string' && SHA256_RE.test(files[key]))) return false;
  // A copied file records exactly itself.
  if (!isDir && !(keys.length === 1 && keys[0] === basename(entryPath))) return false;
  return true;
}

/**
 * Read an entry's marker. `unreadable` is true when something is at the
 * marker's path but it is not a marker this CLI wrote for this entry: a
 * symlink or other non-file, text that is not JSON, or JSON that fails
 * isOwnedMarker(). audit reports those.
 */
function readMarker(entryPath, isDir) {
  const markerPath = markerPathOf(entryPath, isDir);
  let stat;
  try {
    stat = lstatSync(markerPath);
  } catch {
    return { marker: null, unreadable: false };
  }
  // A marker that is a link is not ours, whatever it points at.
  if (!stat.isFile()) return { marker: null, unreadable: true };
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(markerPath, 'utf8'));
  } catch {
    return { marker: null, unreadable: true };
  }
  if (!isOwnedMarker(parsed, entryPath, isDir)) return { marker: null, unreadable: true };
  return { marker: parsed, unreadable: false };
}

/**
 * The marker check: the marker this CLI wrote for the real file or directory
 * at entryPath, or null.
 * @param {string} entryPath
 * @returns {object|null}
 */
export function readOwnedMarker(entryPath) {
  const entry = classify(entryPath);
  return entry.kind === 'copy' ? entry.marker : null;
}

/**
 * What is at a path, by lstat.
 *
 * - `absent`: nothing.
 * - `link`: a symbolic link, `broken` when its target is gone.
 * - `copy`: a real file or directory carrying a marker this CLI wrote for it.
 * - `foreign`: anything else. `markerUnreadable` says a marker-like file was
 *   there but is not one.
 *
 * @param {string} entryPath
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
  const isDir = stat.isDirectory();
  if (!isDir && !stat.isFile()) return { kind: 'foreign', isDir: false, markerUnreadable: false };
  const { marker, unreadable } = readMarker(entryPath, isDir);
  if (marker) return { kind: 'copy', isDir, marker };
  return { kind: 'foreign', isDir, markerUnreadable: unreadable };
}

const sha256 = (bytes) => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;

/**
 * Whether a file still holds what was copied. A file whose only change is LF
 * turned into CRLF counts as unchanged (D1): a project that commits its copies
 * and is checked out with core.autocrlf=true sees exactly that. Only that
 * direction is tolerated, because the content shipped is LF: this repository
 * refuses CRLF in committed blobs (validate-line-endings.yml).
 */
function sameContent(filePath, recordedHash) {
  const bytes = readFileSync(filePath);
  if (sha256(bytes) === recordedHash) return true;
  if (!bytes.includes(13)) return false;
  return sha256(Buffer.from(bytes.toString('latin1').replace(/\r\n/g, '\n'), 'latin1')) === recordedHash;
}

/** Visit every entry under `root`, depth first, as (relative POSIX path, absolute path, lstat). */
function walk(root, visit, relDir = '') {
  const absDir = relDir === '' ? root : join(root, ...relDir.split('/'));
  for (const name of readdirSync(absDir).sort()) {
    const rel = relDir === '' ? name : `${relDir}/${name}`;
    const abs = join(absDir, name);
    const stat = lstatSync(abs);
    visit(rel, abs, stat);
    if (stat.isDirectory()) walk(root, visit, rel);
  }
}

/**
 * Compare a copy with its marker.
 *
 * - `modified`: a recorded file whose content differs (CRLF-only aside), or
 *   that is no longer a regular file.
 * - `added`: a file, link or other entry the marker does not record, except
 *   junk (isJunkPath, which reads the entry's own name). Directories are not
 *   recorded, so an empty one is not reported; the files in a new one are.
 * - `missing`: a recorded file that is gone. Missing alone does not make a
 *   copy edited: removing the rest loses nothing of the user's, unless the
 *   file was renamed to a junk name (a vim swap or emacs auto-save name) and
 *   edited there, which is the cost D1 accepts for those names.
 *
 * The marker inside a directory copy is written, not copied, so it is not
 * recorded and is skipped: at the root of the copy only (critique F7). A
 * file of that name deeper down is the user's and counts as added.
 *
 * @param {string} entryPath
 * @param {object} marker - From readOwnedMarker()
 * @returns {{ modified: string[], added: string[], missing: string[] }}
 */
export function diffCopy(entryPath, marker) {
  const recorded = marker.files;
  const modified = [];
  const added = [];
  const seen = new Set();
  const compare = (rel, abs, stat) => {
    if (!Object.hasOwn(recorded, rel)) {
      if (!isJunkPath(rel)) added.push(rel);
      return;
    }
    seen.add(rel);
    if (!stat.isFile() || !sameContent(abs, recorded[rel])) modified.push(rel);
  };
  const stat = lstatSync(entryPath);
  if (stat.isDirectory()) {
    walk(entryPath, (rel, abs, entryStat) => {
      if (rel === COPY_MARKER) return;
      if (entryStat.isDirectory()) return;
      compare(rel, abs, entryStat);
    });
  } else {
    compare(basename(entryPath), entryPath, stat);
  }
  const missing = Object.keys(recorded).filter((rel) => !seen.has(rel));
  return { modified: modified.sort(), added: added.sort(), missing: missing.sort() };
}

/**
 * The diff of the copy at entryPath, or null when it is not a copy this CLI
 * made. For audit, which reports edited copies.
 * @param {string} entryPath
 */
export function copyDiff(entryPath) {
  const entry = classify(entryPath);
  return entry.kind === 'copy' ? diffCopy(entryPath, entry.marker) : null;
}

/** The note for a copy that was edited, naming the files. `purpose`: 'remove' | 'replace'. */
function editedNote(diff, purpose) {
  const parts = [];
  if (diff.modified.length > 0) parts.push(`modified: ${diff.modified.join(', ')}`);
  if (diff.added.length > 0) parts.push(`added: ${diff.added.join(', ')}`);
  return `edited since it was copied (${parts.join('; ')}); kept, delete it by hand to ${purpose} it`;
}

/**
 * The ownership verdict: may the CLI remove or replace this entry?
 *
 * A link is the CLI's to remove, because unlinking one loses no data even
 * when a user made it. A copy is, while every file in it is as copied and
 * no file or link was added, junk aside; diffCopy() does not record
 * directories, so one holding nothing else goes with the copy. Anything
 * else, and an edited copy, is kept (D1).
 *
 * @param {string} entryPath
 * @param {ReturnType<typeof classify>} entry - Not 'absent'.
 * @param {'remove'|'replace'} purpose - Words the note for an edited copy.
 * @returns {{ removable: true } | { removable: false, reason: 'foreign'|'edited', note: string }}
 */
export function ownership(entryPath, entry, purpose) {
  if (entry.kind === 'link') return { removable: true };
  if (entry.kind !== 'copy') return { removable: false, reason: 'foreign', note: FOREIGN_NOTE };
  const diff = diffCopy(entryPath, entry.marker);
  if (diff.modified.length === 0 && diff.added.length === 0) return { removable: true };
  return { removable: false, reason: 'edited', note: editedNote(diff, purpose) };
}

/** The result for an entry the CLI keeps: skipped, with the reason and a printed note. */
function keep(entryPath, verdict) {
  return { action: 'skipped', path: entryPath, reason: verdict.reason, note: verdict.note };
}

/**
 * The uninstall guard. null when the CLI may remove or replace what is at
 * entryPath; otherwise the result that keeps it. removeEntry(),
 * clearForInstall() and placeCopy() all go through this one line, so a
 * mutant of it is seen on all three paths (critique F8).
 */
function refuseUnlessOwned(entryPath, entry, purpose) {
  const verdict = ownership(entryPath, entry, purpose);
  if (!verdict.removable) return keep(entryPath, verdict);
  return null;
}

/**
 * Remove a real file or directory the guard has passed. A directory is first
 * renamed into a staging directory beside it, so it leaves its install path in
 * one step. A file's sidecar goes after it; `force`, because the file may be
 * one that never had a sidecar.
 *
 * Listings skip a staging directory (isInternalName), so a removal that
 * leaves one must say so (review round 1: AD-3, DL-4, F2). If the rename fails,
 * nothing has moved: the empty staging directory is removed and the rename's
 * error is thrown. If the rename succeeded and deleting the staging directory
 * fails, the entry has already left its install path, where no later list,
 * audit or uninstall can see it; the error thrown says so and names the
 * directory to delete by hand. It throws rather than returning a note because
 * clearForInstall() does not pass a note on, so `install --force` would leave
 * the directory in silence. The error reaches the user wherever a failed
 * result is printed: `uninstall`, `sync`, `install --force` and
 * `scatter --quiet`. `scatter`'s ceremony and `--json` print none, so there
 * the directory is left unnamed (#999).
 */
function discard(entryPath, isDir) {
  if (!isDir) {
    unlinkSync(entryPath);
    rmSync(sidecarPath(entryPath), { force: true });
    return;
  }
  const staging = mkdtempSync(join(dirname(entryPath), STAGING_PREFIX));
  try {
    renameSync(entryPath, join(staging, 'removed'));
  } catch (err) {
    // rmdirSync refuses a directory that is not empty; its own failure must not hide the rename's.
    try { rmdirSync(staging); } catch { /* the rename's error is the one to report */ }
    throw err;
  }
  try {
    rmSync(staging, { recursive: true, force: true });
  } catch (err) {
    throw new Error(`${err.message}; ${entryPath} has left its install path, and what is left of it is in ${staging}: delete that by hand`);
  }
}

/**
 * Remove what an uninstall finds at `<base>/<name>`, or keep it and say why.
 * A link is removed, dangling or not; a copy while unedited. A dry run returns
 * what the real run would.
 *
 * Not atomic against another writer (review round 1, DL-3): the verdict
 * reads every file of a copy, and the removal follows it. A change written to
 * a file after the CLI read it, a file added to a directory after the walk
 * listed that directory, or a save that replaces a copied file, is not seen,
 * and is removed with the copy if it lands before the rename (a directory) or
 * the unlink (a file).
 *
 * @param {string} base - The directory the entry is in
 * @param {string} name - The entry's name in it
 * @param {{ dryRun?: boolean }} [options]
 * @returns {import('../adapters/base.js').InstallResult}
 */
export function removeEntry(base, name, { dryRun = false } = {}) {
  const entryPath = childPath(base, name);
  const entry = classify(entryPath);
  if (entry.kind === 'absent') {
    return { action: 'skipped', path: entryPath, details: 'not installed' };
  }
  const kept = refuseUnlessOwned(entryPath, entry, 'remove');
  if (kept) return kept;
  if (dryRun) return { action: 'removed', path: entryPath, details: 'dry-run' };
  if (entry.kind === 'link') {
    unlinkSync(entryPath);
    return { action: 'removed', path: entryPath };
  }
  discard(entryPath, entry.isDir);
  return { action: 'removed', path: entryPath, details: 'copy' };
}

/**
 * Make `<base>/<name>` free for a new link, or say why the install stops.
 *
 * Without --force anything there, a dangling link included, is reported as
 * already there and kept. With --force a link or an unedited copy is removed
 * first, and anything else is kept and reported the way removeEntry() reports
 * it, with the same window between the check and the removal.
 *
 * @param {string} base
 * @param {string} name
 * @param {{ force?: boolean, existsDetails?: string }} [options]
 * @returns {import('../adapters/base.js').InstallResult|null} null when the
 *   path is free to link; otherwise the result the adapter returns as it is.
 */
export function clearForInstall(base, name, { force = false, existsDetails = 'already exists' } = {}) {
  const entryPath = childPath(base, name);
  const entry = classify(entryPath);
  if (entry.kind === 'absent') return null;
  if (!force) return { action: 'skipped', path: entryPath, details: existsDetails };
  const kept = refuseUnlessOwned(entryPath, entry, 'replace');
  if (kept) return kept;
  if (entry.kind === 'link') unlinkSync(entryPath);
  else discard(entryPath, entry.isDir);
  return null;
}

/** A source path as the marker records it: relative to the content root, POSIX. Throws outside the root. */
function contentPath(almanacRoot, source) {
  const rel = relative(resolve(almanacRoot), resolve(source));
  if (rel === '' || rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) {
    throw new Error(`copy refused: ${source} is outside the content root ${almanacRoot}`);
  }
  return rel.split(sep).join('/');
}

/** What lstat says an entry is, for a refusal. */
function kindWord(stat) {
  if (stat.isSymbolicLink()) return 'symlink';
  if (stat.isFIFO()) return 'FIFO';
  if (stat.isSocket()) return 'socket';
  return 'device';
}

const hashFile = (filePath) => sha256(readFileSync(filePath));

/**
 * Copy `source` to `dest`, which must not exist: directories and regular
 * files only, each file hashed as written. A symlink at or below `source`,
 * `source` itself included, is refused rather than followed or recreated; a
 * symlinked directory above it is not seen (placeCopy()). fs.cpSync is not
 * used: its `dereference` leaves a link into the source on some of the Node
 * versions this package supports (S3-B2 design § 2.3), which in copy mode
 * would be a link into node_modules.
 *
 * @returns {{ isDir: boolean, files: Record<string, string> }}
 */
function copyTree(source, dest) {
  const files = {};
  const rootStat = lstatSync(source);
  if (rootStat.isFile()) {
    copyFileSync(source, dest, fsConstants.COPYFILE_EXCL);
    files[basename(dest)] = hashFile(dest);
    return { isDir: false, files };
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`copy refused: ${basename(source)} is a ${kindWord(rootStat)} (copy mode copies regular files only)`);
  }
  mkdirSync(dest);
  walk(source, (rel, src, stat) => {
    const dst = join(dest, ...rel.split('/'));
    if (stat.isDirectory()) {
      mkdirSync(dst);
    } else if (stat.isFile()) {
      copyFileSync(src, dst, fsConstants.COPYFILE_EXCL);
      files[rel] = hashFile(dst);
    } else {
      throw new Error(`copy refused: ${rel} is a ${kindWord(stat)} (copy mode copies regular files only)`);
    }
  });
  return { isDir: true, files };
}

/**
 * The marker, as written: keys in a fixed order, `files` sorted, two-space
 * indent, a trailing newline, and no absolute path, so a project that commits
 * its copies gets stable diffs (D8).
 */
function serializeMarker({ entry, item, copyFrom, sourceRel, files }) {
  const marker = {
    agentAlmanacCopy: MARKER_SCHEMA,
    entry,
    type: item.type,
    id: item.id,
    package: { name: copyFrom.name, version: copyFrom.version },
    source: sourceRel,
    copiedAt: new Date().toISOString(),
    files: Object.fromEntries(Object.keys(files).sort().map((rel) => [rel, files[rel]])),
  };
  return `${JSON.stringify(marker, null, 2)}\n`;
}

const installCommand = '`install --force --from-package copy`';

/**
 * What placeCopy() decides about what is already at the path. Returns the
 * result that stops the install, or null to go ahead.
 */
function decide(entryPath, entry, force, copyFrom) {
  if (entry.kind === 'absent') return null;
  if (!force) {
    if (entry.kind === 'link') {
      return {
        action: 'skipped', path: entryPath, reason: 'link-kept',
        note: `a link is here (-> ${readlinkSync(entryPath)}); ${installCommand} replaces it with a copy`,
      };
    }
    if (entry.kind === 'copy') {
      const { name, version } = entry.marker.package;
      if (name === copyFrom.name && version === copyFrom.version) {
        return { action: 'skipped', path: entryPath, reason: 'already-copied', note: `already a copy of ${name} ${version}` };
      }
      // Without --force nothing is hashed, so the note cannot know whether the
      // copy was edited; --force keeps an edited one (D1), and the note says so
      // (review round 1, F3).
      return {
        action: 'skipped', path: entryPath, reason: 'other-version',
        note: `already a copy of ${name} ${version}; ${installCommand} replaces it with ${copyFrom.name} ${copyFrom.version} if it is unedited`,
      };
    }
    return keep(entryPath, { reason: 'foreign', note: FOREIGN_NOTE });
  }
  return refuseUnlessOwned(entryPath, entry, 'replace');
}

/**
 * Install a copy of `source` at `<base>/<name>` (`--from-package copy`).
 *
 * | What is there        | without --force                         | with --force          |
 * |----------------------|-----------------------------------------|-----------------------|
 * | nothing              | copy                                    | copy                  |
 * | a link, even dangling| skipped, note names the link            | replaced by the copy  |
 * | our unedited copy    | skipped, note names its version         | replaced              |
 * | our edited copy      | skipped, note names its version         | kept, note names files|
 * | anything else        | kept, FOREIGN_NOTE                      | kept, FOREIGN_NOTE    |
 *
 * The copy is staged in a fresh directory beside the path, on the same
 * filesystem, with its marker, and renamed into place. A copied directory
 * appears with its marker in one rename. A copied file's sidecar goes first,
 * so a crash between the two leaves a stray sidecar and no file, never a file
 * the CLI cannot recognise. What is there is checked again right before the
 * swap, and a copy being replaced is moved aside, sidecar with it, and put
 * back if the swap fails. The staging directory is removed afterwards, unless
 * putting the old copy back failed too: then it holds that copy, and the
 * error names it (critique F11).
 *
 * If removing the staging directory fails (for example a read-only
 * directory inside the copy being replaced), the copy is still in place, so
 * the result stays `created`, with a note naming the directory to delete by
 * hand (review round 1, DL-4); a result the re-check returned gets the same
 * note. If the install was already failing, its own error is reported and
 * the leftover directory is not named. Only the `created` case is exercised
 * by a test; the other two need the cleanup to fail after a re-check that
 * stopped the install or after a copy that failed, which no test arranges.
 *
 * Not atomic against another writer: an entry that appears at the path
 * between that last check and the rename is replaced if it is a file or an
 * empty directory (rename(2) semantics), and makes the rename fail if it is a
 * non-empty directory (critique F12; the window is the length of two lstat
 * calls). A copy being replaced has a longer window (review round 1, DL-3):
 * the re-check reads every file of it, so a change written to a file after
 * the re-check read it, or a save over it, before the copy is moved aside is
 * replaced with it. That window is the rest of the re-check's hash walk, not
 * two lstat calls.
 *
 * Containment is lexical (review round 1, E5). contentPath() checks that
 * `source` is inside `almanacRoot`, and childPath() that the target is inside
 * `base`, by path text alone: a symlinked ancestor inside the content root is
 * not resolved, so a source below one is copied from wherever it points. The
 * walker refuses a symlink at or below `source`, not above it.
 *
 * @param {object} args
 * @param {string} args.base - The directory the entry goes in
 * @param {string} args.name - The entry's name there
 * @param {string} args.source - The file or directory to copy
 * @param {string} args.almanacRoot - The content root; `source` must be inside it
 * @param {{ name: string, version: string }} args.copyFrom - The package it is copied from
 * @param {{ type: string, id: string }} args.item - The registry item, recorded in the marker
 * @param {boolean} [args.force]
 * @returns {import('../adapters/base.js').InstallResult}
 */
export function placeCopy({ base, name, source, almanacRoot, copyFrom, item, force = false }) {
  const entryPath = childPath(base, name);
  if (!copyFrom || !isNonEmptyString(copyFrom.name) || !isNonEmptyString(copyFrom.version)) {
    throw new Error('copy refused: no package name and version to record');
  }
  const sourceRel = contentPath(almanacRoot, source);

  const stop = decide(entryPath, classify(entryPath), force, copyFrom);
  if (stop) return stop;

  mkdirSync(base, { recursive: true });
  const staging = mkdtempSync(join(base, STAGING_PREFIX));
  let keepStaging = false;
  // Set once the copy is in place, or once the re-check stops the install.
  // While it is null in `finally`, an error is on its way out.
  let result = null;
  try {
    const staged = join(staging, name);
    const { isDir, files } = copyTree(source, staged);
    writeFileSync(markerPathOf(staged, isDir), serializeMarker({ entry: name, item, copyFrom, sourceRel, files }), { flag: 'wx' });

    const current = classify(entryPath);
    result = decide(entryPath, current, force, copyFrom);
    if (result === null) {
      let linkText = null;
      const replaced = join(staging, 'replaced');
      const replacedMarker = join(staging, 'replaced-marker');
      if (current.kind === 'link') {
        linkText = readlinkSync(entryPath);
        unlinkSync(entryPath);
      } else if (current.kind === 'copy') {
        renameSync(entryPath, replaced);
        if (!current.isDir) renameSync(sidecarPath(entryPath), replacedMarker);
      }

      try {
        if (!isDir) renameSync(sidecarPath(staged), sidecarPath(entryPath));
        renameSync(staged, entryPath);
      } catch (err) {
        try {
          if (!isDir) rmSync(sidecarPath(entryPath), { force: true });
          if (current.kind === 'link') symlinkSync(linkText, entryPath);
          if (current.kind === 'copy') {
            renameSync(replaced, entryPath);
            if (!current.isDir) renameSync(replacedMarker, sidecarPath(entryPath));
          }
        } catch {
          keepStaging = true;
          throw new Error(`${err.message}; what was at ${entryPath} could not be put back and is kept in ${staging}`);
        }
        throw err;
      }
      result = { action: 'created', path: entryPath, details: 'copy' };
    }
  } finally {
    if (!keepStaging) {
      try {
        rmSync(staging, { recursive: true, force: true });
      } catch (err) {
        // A leftover staging directory does not undo a copy that is in place:
        // the result stands, with a note naming what to delete by hand. With
        // no result, the error on its way out is the one reported.
        if (result !== null) {
          const leftover = `could not delete ${staging} (${err.code ?? err.message}); delete it by hand`;
          result = { ...result, note: result.note ? `${result.note}; ${leftover}` : leftover };
        }
      }
    }
  }
  return result;
}

/**
 * The fields a listing adds for one entry: `broken` (a link whose target is
 * gone), `copy` ({ name, version }) for a copy this CLI made, and
 * `markerUnreadable` only when true. Listings add nothing else, so a listing
 * of links is what it was before copies existed. `kind` is returned beside
 * the fields, for the adapter's own filtering.
 *
 * @param {string} entryPath
 * @returns {{ kind: string, fields: { broken: boolean, copy?: { name: string, version: string }, markerUnreadable?: true } }}
 */
export function describeEntry(entryPath) {
  const entry = classify(entryPath);
  const fields = { broken: entry.kind === 'link' && entry.broken };
  if (entry.kind === 'copy') fields.copy = { name: entry.marker.package.name, version: entry.marker.package.version };
  if (entry.markerUnreadable) fields.markerUnreadable = true;
  return { kind: entry.kind, fields };
}

/**
 * Install at `<base>/<name>` the way the options say: a copy when
 * `options.placement` is 'copy', a link otherwise. A link is relative to
 * `base` when `relativeLink`, absolute otherwise. Each adapter computes its
 * paths and returns its own dry-run result; this does the rest.
 *
 * @param {object} args
 * @param {string} args.base
 * @param {string} args.name
 * @param {string} args.source
 * @param {object} args.item
 * @param {object} args.options - The install options: force, placement, copyFrom, almanacRoot
 * @param {boolean} args.relativeLink
 * @param {string} [args.existsDetails] - `details` when a link is already there
 * @param {string} [args.createdDetails] - `details` when a link was made
 * @returns {import('../adapters/base.js').InstallResult}
 */
export function installAt({ base, name, source, item, options, relativeLink, existsDetails, createdDetails }) {
  if (options.placement === 'copy') {
    return placeCopy({
      base, name, source, item, force: options.force, copyFrom: options.copyFrom, almanacRoot: options.almanacRoot,
    });
  }
  const blocked = clearForInstall(base, name, { force: options.force, existsDetails });
  if (blocked) return blocked;
  const entryPath = childPath(base, name);
  mkdirSync(base, { recursive: true });
  symlinkSync(relativeLink ? relative(base, source) : source, entryPath);
  return createdDetails === undefined
    ? { action: 'created', path: entryPath }
    : { action: 'created', path: entryPath, details: createdDetails };
}
