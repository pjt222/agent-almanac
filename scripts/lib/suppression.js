/**
 * Inline waiver syntax for `scripts/scan-skill-content.js`.
 *
 * A finding can be waived with `security-scan-ignore: <reason>` on the matching line or the line
 * directly above it. A reason is required — the point is a narrow, readable waiver at the source,
 * never a blanket suppression.
 *
 * Extracted from the scanner so the mechanism can be tested. It needed testing: the pattern
 * accepted `<!--` and `#` only, which was correct while the scan covered markdown and shell. When
 * the privacy rule (#407) brought `.js` files into scope, every waiver written in a `//` comment
 * read as accepted and was not. A suppression syntax that does not suppress is worse than none —
 * the author believes the line is waived, stops looking at the finding, and the gate stays red for
 * a reason nobody re-reads.
 *
 * The rule that follows, and what `scripts/test/suppression.test.js` enforces: this pattern must
 * recognize the comment syntax of every file type the scanner walks, and every waiver already
 * written in the repository must actually match it.
 */

/** Comment openers recognized in a waiver: HTML/markdown, shell/YAML/Python/R, and JS/CSS. */
export const SUPPRESSION_RE = /(?:<!--|#|\/\/|\/\*)\s*security-scan-ignore:\s*\S/;

/**
 * @param {string[]} lines file split into lines
 * @param {number} idx 0-based index of the line carrying the finding
 * @returns {boolean} true when this line or the one directly above waives it
 */
export function isSuppressed(lines, idx) {
  const here = lines[idx] || '';
  const above = lines[idx - 1] || '';
  return SUPPRESSION_RE.test(here) || SUPPRESSION_RE.test(above);
}
