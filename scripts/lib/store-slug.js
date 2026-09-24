/**
 * Detect private memory-store slugs in content bound for a public repository.
 *
 * Claude Code keys its per-project state to `~/.claude/projects/<slug>/`, where the slug is the
 * project's absolute path with separators rewritten. A slug is therefore a filesystem path in
 * disguise: quoting one publishes the directory layout of somebody's machine, and — because a
 * project directory is usually named after the project — the identity of work that may be
 * private, client-owned, or embargoed.
 *
 * This exists because it happened. While #407 was being written, a measurement of memory stores
 * on the author's machine put two real slugs into a public artifact, one of them a funded
 * research project. Nothing in the repo would have caught it; a reviewer did. A reviewer is not
 * a control, so this is the control.
 *
 * The rule is default-deny: any slug that is not the repository's own and does not read as a
 * placeholder is a finding. Slugs cannot be allowlisted individually — an allowlist of real
 * slugs is the same disclosure as printing them.
 */

// The repo's own project path. It is already published throughout the repository (CLAUDE.md
// names it, every guide's examples use it), and it discloses nothing the reader does not have.
export const OWN_SLUG = '-mnt-d-dev-p-agent-almanac';

// Matches the slug segment following a projects/ directory in any of the shapes content uses:
// `~/.claude/projects/-foo`, `/home/u/.claude/projects/-foo`, `.claude/projects/-foo`.
const SLUG_RE = /\.claude\/projects\/(-[^\s/`'")\]]+)/g;

// The second shape, and the one the actual incident used. An author who knows the full path is
// sensitive often elides its head — `…-<tail_of_the_path>/memory/` — which removes every token this
// detector would otherwise key on while leaving the identifying tail in place. Eliding the head
// is not redaction; the tail is the project's name.
//
// Written only after testing the first pattern against the real leaked line and watching it pass.
// A detector that fires on the shape you imagined and not the shape you shipped is worse than
// none, because it certifies the file.
const ELIDED_RE = /(?:…|\.\.\.)\s*(-?[A-Za-z0-9][A-Za-z0-9_-]*)\/memory\b/g;

// The third shape, found by testing the second one against the OTHER real leaked line and
// watching it pass: an elided slug with no trailing `/memory` at all — `…<tail_of_the_path>` on its
// own inside backticks. To fire on that without firing on ordinary prose that uses an ellipsis,
// the token must look like a path segment rather than a word: at least five characters and
// carrying an underscore or an internal hyphen.
// Unicode ellipsis only, and never an ALL-CAPS token. Both guards are false-positive repairs
// measured against this repo rather than imagined: `[...CONTENT_TYPES]` is JavaScript spread
// syntax, it appears in three existing test files, and an ASCII `...` before an identifier is
// far more often code than an elided path. The `…/memory` form above still accepts both
// spellings, because the `/memory` suffix disambiguates it.
const ELIDED_BARE_RE = /…\s*(-?[A-Za-z0-9][A-Za-z0-9_-]{4,})(?![\w/-])/g;

/**
 * A slug is a placeholder if it is visibly a stand-in rather than a real path.
 *
 * @param {boolean} isFullSlug true when the capture is a whole slug (matched after
 *   `projects/`), false when it is an elided TAIL. The distinction is load-bearing, see below.
 */
function isPlaceholder(slug, isFullSlug) {
  if (/[<>{}$*]/.test(slug)) return true; // <project_a>, ${SLUG}, -foo-*
  if (/\.{3}|…/.test(slug)) return true; // elided

  // The metasyntactic-name rule applies to FULL SLUGS ONLY, and the reason is the whole
  // justification for anchoring it: a real slug encodes an absolute path, so it begins with the
  // filesystem root (`-mnt-…`, `-home-…`, `-Users-…`), which means a metasyntactic first segment
  // can only be a whole-slug stand-in. An elided tail begins with whatever the author cut it at,
  // so the same rule there waives real projects. That is the exact shape of the incident this
  // detector exists for, so the tail path does not get the keyword waiver at all. Worked examples
  // live in the test rather than here: writing them in this comment made the rule fire on its own
  // documentation, which is the third time this file has caught itself and the reason the
  // examples are now somewhere the scan can distinguish from a real leak.
  if (isFullSlug && /^-(?:slug|project|example|placeholder|your|foo|bar|baz|qux|sample|test)\b/i.test(slug)) {
    return true;
  }
  return false;
}

/**
 * @param {string} text file contents
 * @returns {{slug: string, line: number}[]} one entry per private slug occurrence, 1-based lines
 */
export function findPrivateStoreSlugs(text) {
  const out = [];
  text.split(/\r?\n/).forEach((line, i) => {
    for (const re of [SLUG_RE, ELIDED_RE, ELIDED_BARE_RE]) {
      re.lastIndex = 0; // both are /g and module-level: reset or a previous line's index carries
      for (const m of line.matchAll(re)) {
        const slug = m[1];
        if (slug === OWN_SLUG) continue;
        if (isPlaceholder(slug, re === SLUG_RE)) continue;
        // An elided mention of this repo's own store discloses nothing new, and the elision
        // means it will not match OWN_SLUG outright. Applies to both elided shapes.
        if (re !== SLUG_RE && OWN_SLUG.endsWith(slug.replace(/^-/, ''))) continue;
        // For the bare shape only: a word is not a path segment. Without this the rule fires on
        // ordinary prose, and a rule that cries wolf is switched off within a week.
        if (re === ELIDED_BARE_RE && !/_|[A-Za-z0-9]-[A-Za-z0-9]/.test(slug)) continue;
        // a CONSTANT_NAME is not a path segment — slugs encode lowercase filesystem paths
        if (re === ELIDED_BARE_RE && slug === slug.toUpperCase()) continue;
        out.push({ slug, line: i + 1 });
      }
    }
  });
  return out;
}
