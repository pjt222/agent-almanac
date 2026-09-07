/**
 * provenance.js — the two provenance fields a translation carries, and why there are two (#552).
 *
 * ## The field that meant two things
 *
 * `source_commit` was asked to answer two questions that a mechanical repair pulls apart:
 *
 *   1. **Which English revision did a human translate against?** This is what staleness means
 *      (`check-translation-freshness.js`), and it must NOT move when a tool edits the file —
 *      bumping it asserts a translation event that never happened, which is the lie #405
 *      recorded `evolve-skill` telling.
 *   2. **Which English revision do this file's frozen fences mirror?** This is what fence parity
 *      is about (`check-i18n-fence-parity.js`), and it MUST move when the normalizer propagates
 *      new English bytes into a mirror, or the frontmatter contradicts the body.
 *
 * With one field the two are irreconcilable: bump it and (1) is false, leave it and (2) is
 * false. So there are two fields, and neither is a rename of the other.
 *
 * ## `fence_basis_commit`
 *
 * The English revision this file's frozen fence bodies were last verified or propagated
 * against. Written by the scaffolder (a fresh scaffold is a byte copy, so its fences trivially
 * mirror the revision it copied) and by `normalize-i18n-fences.js` after a repair.
 *
 * **Presence is a claim, and absence is not a defect.** Present means "these bytes were checked
 * against that revision". Absent means "unverified" — the honest state for the ~40 files whose
 * fences match no English revision, and for every file predating this field. Stamping a commit
 * on an unverified file would write a false claim into the corpus to be corrected later, which
 * is the disagreement-between-files failure this whole schema change exists to end.
 *
 * **It never gates a comparison.** `check-i18n-fence-parity.js` compares fence bytes
 * unconditionally and always will. This field is read for reporting, and to catch the one thing
 * bytes alone cannot say: a file claiming a verified basis whose fences diverge anyway. A field
 * that could suppress a byte comparison would be decorative at best and a bypass at worst.
 *
 * ## Why the name avoids the substring `source_commit`
 *
 * `generate-translation-status.js` reads the old field with an UNANCHORED regex
 * (`/source_commit:\s*["']?([a-f0-9]+)["']?/m` — no `^`), so any new field whose name contains
 * `source_commit` would be captured by it wherever it appeared, including from inside a body
 * fence. `fence_basis_commit` cannot collide. Keep it that way if the field is ever renamed.
 */

/**
 * The revision a human translated against. Staleness reads this; tools must not move it.
 *
 * The one documented exception is an untranslated stub — `translator: "(untranslated stub)"` —
 * where no translation event exists to falsify: the field can only mean "the English this copy
 * is a copy of", and `tools/refresh-untranslated-stubs.mjs --stamp` moves it there, and only
 * there, after re-reading that `translator` value at the moment it writes (#789).
 */
export const SOURCE_COMMIT_FIELD = 'source_commit';

/** The revision this file's frozen fences were last verified against. Absent = unverified. */
export const FENCE_BASIS_FIELD = 'fence_basis_commit';

const FRONTMATTER = /^---\n([\s\S]*?)\n---(\n|$)/;

/**
 * Read `field` out of `text`'s frontmatter, or null.
 *
 * Anchored to the frontmatter block, unlike two of the three hand-rolled readers this replaces:
 * an unanchored match reads a `source_commit:` written inside a body fence as though it were
 * metadata. Tolerates leading indentation because translations carry genuine shape variance —
 * `check-i18n-frontmatter-parity.js` records that the nesting differs per FILE, not per locale,
 * so indent tolerance is the only thing that survives the corpus.
 *
 * @param {string} text whole file contents
 * @param {string} field field name
 * @returns {string|null}
 */
export function readFrontmatterField(text, field) {
  const fm = text.replace(/\r\n/g, '\n').match(FRONTMATTER);
  if (!fm) return null;
  const m = new RegExp(`^\\s*${field}:\\s*(\\S.*)$`, 'm').exec(fm[1]);
  if (!m) return null;
  // A few values carry a trailing YAML comment.
  return m[1].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, '');
}

/**
 * Write `field: value` into `text`'s frontmatter, replacing any existing occurrence.
 *
 * Anchored on the `source_commit` line and copying its exact indentation, rather than inserting
 * at a fixed depth or before the closing `---`. That is deliberate: the corpus nests these
 * fields differently from file to file, so a fixed depth produces valid-looking YAML in the
 * wrong block. Anchoring on the sibling that already exists is the only placement that cannot
 * disagree with the file it is editing.
 *
 * Refuses rather than guesses when there is no anchor, because the alternative — appending at
 * top level — is exactly the `sed '/^  tags:/a\\'` bug that broke a batch of scaffolds by
 * inserting a field between a key and its list items.
 *
 * @param {string} text whole file contents
 * @param {string} field field name
 * @param {string} value value to write
 * @returns {string|null} updated text, or null if there is no frontmatter or no anchor field
 */
export function stampFrontmatterField(text, field, value) {
  const normalized = text.replace(/\r\n/g, '\n');
  const fm = normalized.match(FRONTMATTER);
  if (!fm) return null;

  const block = fm[1];
  const existing = new RegExp(`^([ \\t]*)${field}:.*$`, 'm');
  if (existing.test(block)) {
    const updated = block.replace(existing, (_, indent) => `${indent}${field}: ${value}`);
    return replaceBlock(normalized, block, updated);
  }

  const anchor = new RegExp(`^([ \\t]*)${SOURCE_COMMIT_FIELD}:.*$`, 'm').exec(block);
  if (!anchor) return null;
  const updated = block.replace(anchor[0], () => `${anchor[0]}\n${anchor[1]}${field}: ${value}`);
  return replaceBlock(normalized, block, updated);
}

/**
 * Splice `updated` in place of `block` inside `text`, with NO `$`-pattern interpretation.
 *
 * `String.prototype.replace` expands `$$`, `$&`, `` $` `` and `$'` in the replacement even when
 * the search argument is a plain string, and every replacement here is derived from the file's
 * own frontmatter. A `description:` containing `$'` — ordinary shell documentation in this
 * corpus — spliced the entire remainder of the file back in and duplicated the body, silently,
 * inside the frontmatter where the fence gate cannot see it. Measured over `i18n/**` at the
 * time of writing: zero files carry such a value in frontmatter, so nothing is corrupt today.
 * This is the write path the backfill runs across ~3,644 files, so "zero today" is not a reason
 * to leave a loaded gun in it.
 *
 * A function replacement is the fix: its return value is used verbatim.
 */
function replaceBlock(text, block, updated) {
  return text.replace(block, () => updated);
}

/**
 * Remove `field` from `text`'s frontmatter if present.
 *
 * The normalizer needs this: a partially-repaired file that still carries divergent fences must
 * not keep a `fence_basis_commit` from an earlier, then-complete verification. Leaving a stale
 * claim behind is worse than never having written one — it reads as verified.
 *
 * @param {string} text whole file contents
 * @param {string} field field name
 * @returns {string} updated text (unchanged when the field is absent)
 */
export function clearFrontmatterField(text, field) {
  const normalized = text.replace(/\r\n/g, '\n');
  const fm = normalized.match(FRONTMATTER);
  if (!fm) return normalized;
  const block = fm[1];
  // Filter lines rather than regex-replace the line plus a `\n?`. The regex form is correct
  // everywhere except the position the stamper actually produces — last line of the block —
  // where there is no trailing newline to consume and it leaves the PRECEDING one behind as a
  // blank line inside the frontmatter. Caught by the nested round-trip test.
  const match = new RegExp(`^[ \\t]*${field}:`);
  const lines = block.split('\n');
  const kept = lines.filter((line) => !match.test(line));
  if (kept.length === lines.length) return normalized;
  return replaceBlock(normalized, block, kept.join('\n'));
}
