/**
 * readme-sections.js — the pure parts of README generation (#566).
 *
 * `scripts/generate-readmes.js` writes nine committed files and had NO unit test, because it
 * is not merely untested — it is *unimportable*. It reads the registries at module scope and
 * runs its MANAGED loop at module scope, so importing it from a test reads the real registries
 * and WRITES ALL NINE FILES (`CHECK_MODE` is false unless `--check` is in `process.argv`,
 * which a test runner's argv lacks). The seam therefore has to be extract-to-lib, never
 * import-the-script.
 *
 * Confirmed cost of that gap: deleting the core line of #560's fix left the entire suite green
 * (`MUTANT SURVIVED`). Only CI-time artifact comparison caught it.
 *
 * `MANAGED` deliberately stays in `generate-readmes.js`, at column 0 and unexported: integrity
 * check A8 static-parses that block by literal path with sed, and it reports "could not derive
 * generated files" — failing closed, but without distinguishing "moved" from "reformatted".
 *
 * Zero imports, so this module is safe to reach from anywhere including the no-`npm ci`
 * integrity job. That is a property to preserve, not an accident. (Note the constraint binds
 * what `validate-integrity.yml` INVOKES; `ci-scripts.yml` does run `npm ci`, so the tests of
 * this module may use dependencies freely.)
 */

/** Marker suffix a translations cell carries when the generator fell back to file counting. */
export const FALLBACK_MARK = '*';

/** Rendered where a number was not measured. Never `0`, which reads as "none". */
export const UNMEASURED = '-';

/**
 * Replace the body between a section's AUTO markers.
 *
 * Returns `matched: false` rather than throwing or warning, so the caller decides the policy.
 * That distinction is load-bearing: this used to `console.warn` and return the content
 * unchanged, which made `--check` compute "no change" and exit 0 on a warning nobody reads in
 * a green job. Deleting a marker pair was permanent silent drift — the section stopped being
 * generated for good, and the auto-commit healer took the same path, so nothing could repair
 * it either.
 *
 * @param {string} content    full file text
 * @param {string} sectionName the AUTO marker name
 * @param {string} newInner   replacement body, without surrounding newlines
 * @returns {{content: string, matched: boolean}}
 */
export function replaceSection(content, sectionName, newInner) {
  const startTag = `<!-- AUTO:START:${sectionName} -->`;
  const endTag = `<!-- AUTO:END:${sectionName} -->`;
  const startIdx = content.indexOf(startTag);
  const endIdx = content.indexOf(endTag);
  // `endIdx < startIdx` is an END tag sitting ABOVE its START — malformed, and it used to
  // report success while corrupting the file: the slices overlap, so the output duplicated
  // essentially the whole document, and grew again on every subsequent run. A miss is the
  // honest answer, and it routes to the same fatal path as a deleted marker.
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    return { content, matched: false };
  }
  const before = content.slice(0, startIdx + startTag.length);
  const after = content.slice(endIdx);
  return { content: `${before}\n${newInner}\n${after}`, matched: true };
}

/**
 * Apply every section in `sections` to `content`, collecting the misses.
 *
 * The POLICY, not just the mechanism, and it lives here for one reason: after `replaceSection`
 * moved to this lib, the "a miss is fatal" wiring sat in `generate-readmes.js` — the file this
 * whole extraction exists because nobody can import. Deleting the single line
 * `if (!result.matched) missingMarkers.push(name)` left every gate in the repo green, which is
 * the permanent-silent-drift defect recreated one level up.
 *
 * The old `replaceSection` applied the miss policy internally, so every caller inherited it.
 * Making callers opt in via `matched` was a regression in the API's DEFAULT safety even though
 * it was not a regression in behaviour. This function restores the safe default and puts it
 * where a test can reach it.
 *
 * @param {string} content
 * @param {Record<string, () => string>} sections marker name -> body generator
 * @returns {{content: string, missing: string[]}} `missing` names every section whose markers
 *   were absent or inverted, in the order encountered
 */
export function applySections(content, sections) {
  let next = content;
  const missing = [];
  for (const [name, generate] of Object.entries(sections)) {
    const result = replaceSection(next, name, generate());
    if (!result.matched) missing.push(name);
    next = result.content;
  }
  return { content: next, missing };
}

/**
 * Render the locale table for `i18n/README.md`.
 *
 * Deliberately a DIFFERENT table from the root README's, not a second copy of it (#569). This
 * one answers a translator's question — which locales exist, which trees they cover, how fresh
 * they are — while the root README answers a reader's: overall coverage, stubs, unjudged. Two
 * generated views of one source cannot drift; two hand-maintained ones are how #560 happened,
 * and this table was the proof, listing 4 of 10 locales with every count wrong.
 *
 * `stale` is included because it is the number a translator can act on, and because its
 * meaning is counterintuitive enough that `i18n/README.md` already explains it two sections
 * below: it is measured only over `translated`, so recognising a scaffold LOWERS it with
 * nothing translated.
 *
 * @param {Array<{code: string, name: string, coverage: object|null}>} locales
 * @param {string[]} contentTypes
 * @returns {string}
 */
export function renderLocaleTable(locales, contentTypes) {
  // Header and rows both DERIVED from contentTypes. The first version gated on
  // `contentTypes.every(...)` but rendered four hardcoded columns, so adding a fifth content
  // type would have widened the gate while leaving the table four wide — the new type
  // silently missing from a table whose whole purpose is completeness. Deriving both means a
  // fifth type either appears or nothing renders; it cannot half-appear.
  const title = (ct) => ct.charAt(0).toUpperCase() + ct.slice(1);
  const rows = [
    `| Code | Language | ${contentTypes.map(title).join(' | ')} | Translated | Stale |`,
    `|---|---|${contentTypes.map(() => '---|').join('')}---|---|`,
  ];

  for (const locale of locales) {
    const { coverage } = locale;
    if (!coverage || !contentTypes.every((ct) => coverage[ct]) || !coverage.total) {
      // No measurement rather than a zero: a locale configured but never scanned has not been
      // measured at 0%, and printing 0 would say it had.
      const blanks = contentTypes.map(() => UNMEASURED).join(' | ');
      rows.push(`| ${locale.code} | ${locale.name} | ${blanks} | ${UNMEASURED} | ${UNMEASURED} |`);
      continue;
    }
    const cells = contentTypes.map((ct) => `${coverage[ct].translated}/${coverage[ct].total}`);
    const t = coverage.total;
    rows.push(
      `| ${locale.code} | ${locale.name} | ${cells.join(' | ')} | `
      + `${t.translated}/${t.total} (${t.pct}%) | ${t.stale} |`,
    );
  }

  return rows.join('\n');
}

/**
 * Render the translations coverage table from already-loaded per-locale data.
 *
 * The function #560 fixed and #566 exists to make testable. It takes records rather than
 * reading the filesystem, so a test can hand it a locale with a status file, one without, and
 * one with a partial file, and assert the rendered row — which is what nothing could do while
 * this logic lived inside an unimportable script.
 *
 * The measured-vs-fallback PREDICATE stays in here, deliberately. Splitting it — caller
 * decides which branch, renderer formats it — is the guard-proxy-predicate anti-pattern this
 * repo has already been bitten by: the two copies drift, and the gate ends up asserting
 * something adjacent to what the consumer actually does.
 *
 * Every measured figure is rendered VERBATIM from the status file, denominators and `pct`
 * included. Recomputing `pct` here with different rounding than
 * `generate-translation-status.js` would be #560's two-derivations defect rebuilt inside a
 * single cell.
 *
 * @param {Array<{code: string, name: string, coverage: object|null,
 *   fallback: {counts: Record<string, number>, total: number}}>} locales
 * @param {{skills: number, agents: number, teams: number, guides: number, total: number}} sourceCounts
 * @param {string[]} contentTypes
 * @returns {string} the markdown table, plus a footnote when any row fell back
 */
export function renderTranslationsTable(locales, sourceCounts, contentTypes) {
  const rows = [
    '| Locale | Language | Skills | Agents | Teams | Guides | Total | Stubs | Unjudged |',
    '|---|---|---|---|---|---|---|---|---|',
  ];
  let anyFallback = false;

  for (const locale of locales) {
    const { coverage } = locale;
    if (coverage && contentTypes.every((ct) => coverage[ct]) && coverage.total) {
      const cell = (ct) => `${coverage[ct].translated}/${coverage[ct].total}`;
      const t = coverage.total;
      rows.push(
        `| ${locale.code} | ${locale.name} | ${cell('skills')} | ${cell('agents')} | `
        + `${cell('teams')} | ${cell('guides')} | ${t.translated}/${t.total} (${t.pct}%) | `
        + `${t.stubs} | ${t.unjudged} |`,
      );
      continue;
    }

    anyFallback = true;
    const { counts, total } = locale.fallback;
    const m = FALLBACK_MARK;
    const pct = sourceCounts.total > 0 ? Math.round((total / sourceCounts.total) * 1000) / 10 : 0;
    rows.push(
      `| ${locale.code} | ${locale.name} | ${counts.skills}/${sourceCounts.skills}${m} | `
      + `${counts.agents}/${sourceCounts.agents}${m} | ${counts.teams}/${sourceCounts.teams}${m} | `
      + `${counts.guides}/${sourceCounts.guides}${m} | ${total}/${sourceCounts.total} (${pct}%)${m} | `
      + `${UNMEASURED} | ${UNMEASURED} |`,
    );
  }

  if (anyFallback) {
    rows.push('');
    rows.push(
      `${FALLBACK_MARK} File count, not a measurement -- this locale has no `
      + '`translation_status.yml`. Run `npm run translation:status` to measure it.',
    );
  }

  return rows.join('\n');
}

/**
 * Does a SKILL.md's frontmatter declare `Bash` in `allowed-tools`? (#600)
 *
 * Pure, and here rather than in `generate-readmes.js`, because that file runs its whole pipeline
 * at module scope — importing it to test one predicate executes a generation. This predicate is
 * the load-bearing part of the claim `SECURITY.md` makes about the corpus, and the reason #600
 * exists is that the previous claim quoted a count with NO stated predicate: unverifiable by
 * anyone, including whoever wrote it.
 *
 * Two spellings exist in the corpus and a naive grep sees one:
 *
 *   allowed-tools: Read Write Edit Bash Grep Glob      inline
 *   allowed-tools:\n  - Bash\n  - Read                block
 *
 * `\bBash\b` on the inline form, so `Bashful` does not match. The block form requires the item
 * to BE `Bash` rather than to contain it, since an indented list item is a whole token.
 *
 * @param {string} text full SKILL.md contents
 * @returns {boolean}
 */
export function declaresBash(text) {
  if (!text.startsWith('---')) return false;
  const end = text.indexOf('\n---', 3);
  // FAIL CLOSED on an unclosed opener. The first version fell back to scanning the whole file,
  // which contradicts this function's own "frontmatter, not body" promise in precisely the
  // malformed case where the promise matters (#686 review). No corpus instance exists — CI
  // validates frontmatter — and a predicate that quietly widens its own scope is how the count
  // it feeds becomes wrong later.
  if (end === -1) return false;
  const frontmatter = text.slice(3, end);
  const inline = frontmatter.match(/^allowed-tools:[ \t]*(\S.*)$/m);
  if (inline) return /\bBash\b/.test(inline[1]);
  const block = frontmatter.match(/^allowed-tools:[ \t]*\n((?:[ \t]+-.*\n?)+)/m);
  return block ? /^[ \t]+-[ \t]*Bash[ \t]*$/m.test(block[1]) : false;
}
