/**
 * tree-counts.js — the three directory counts SECURITY.md and the translation tables publish.
 *
 * Extracted from `generate-readmes.js` for the reason #691 extracted `skills-inventory.js` from
 * the same file: that file runs its whole pipeline plus `process.exit` at import time, so nothing
 * living inside it can be imported, and nothing that cannot be imported can be tested against a
 * fixture. What stood in for a test was a scan of the generator's source — and the #874 review
 * measured what that was worth:
 *
 *   add `import { readdirSync } from 'node:fs';` as a SECOND import line, revert one call site
 *   to a disk walk, plant a gitignored `scripts/local-probe.js`, and the source scan stays green
 *   while the published count is wrong again. It asserted the absence of two identifiers from
 *   one import's braces; `opendirSync`, `globSync`, `fs/promises` or the same two names through
 *   any other specifier all pass it. A test that goes red on a harmless refactor and green on
 *   the defect is a denylist, not coverage.
 *
 * These functions take `root`, so `tree-counts.test.js` drives them against a git fixture holding
 * a gitignored file beside an untracked one, and the assertion is the published NUMBER rather
 * than the spelling of an import.
 *
 * Every count here goes through `git-files.js`, which applies git's ignore rule and refuses when
 * it cannot: a gitignored file is not part of the artifact any of these sentences describes.
 * Measured on #871 — importing a skill asset left a `__pycache__/`, and the committed SECURITY.md
 * went out claiming 19 non-Markdown files where a clean checkout computed 18, with a `.py` there
 * named in the executable-scripts list under a paragraph asserting "All of it ships".
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { topLevelEntries } from './git-files.js';
import { isTemplateSegment } from './content-paths.js';

/** Extensions a top-level `scripts/` entry must carry to count as a script. */
const SCRIPT_EXTENSIONS = ['.js', '.sh', '.mjs'];

/**
 * Top-level executable files under `scripts/`, the figure SECURITY.md publishes for the
 * repository-only tooling. Non-recursive, as the `readdirSync` it replaced was: `scripts/lib/`
 * and `scripts/test/` are not what that sentence counts.
 */
export function scriptFileCount(root) {
  return topLevelEntries(root, 'scripts').files
    .filter((name) => SCRIPT_EXTENSIONS.some((ext) => name.endsWith(ext))).length;
}

/**
 * Shipped-shaped workflow scripts under `workflows/`.
 *
 * `isTemplateSegment`, never a `_`-prefix test: the comment at the call site stated the TEMPLATE
 * intent while the code tested the underscore convention, so a future `workflows/_draft.mjs`
 * would have gone uncounted under a sentence describing scaffolding as the only exclusion
 * (#672).
 */
export function workflowFileCount(root) {
  return topLevelEntries(root, 'workflows').files
    .filter((name) => name.endsWith('.mjs') && !isTemplateSegment(name)).length;
}

/**
 * How many translated files a locale carries, per content type and in total.
 *
 * `localeRel` is REPO-RELATIVE (`i18n/de`), because the enumeration goes through git and a
 * pathspec is relative to the repository.
 *
 * A skill is a DIRECTORY carrying SKILL.md; every other type is a flat `.md` file. The `.md` arm
 * tests files only, which is a narrowing: the form this replaced ran `endsWith('.md')` over every
 * entry, so `i18n/de/agents/notes.md/` would have counted as a translated agent.
 *
 * @returns {{counts: Record<string, number>, total: number}}
 */
export function localeTranslationCounts(root, localeRel, contentTypes) {
  const counts = {};
  let total = 0;
  for (const contentType of contentTypes) {
    const typeRel = `${localeRel}/${contentType}`;
    const { files, dirs } = topLevelEntries(root, typeRel);
    const count = contentType === 'skills'
      ? dirs.filter((name) => existsSync(resolve(root, typeRel, name, 'SKILL.md'))).length
      : files.filter((name) => name.endsWith('.md')).length;
    counts[contentType] = count;
    total += count;
  }
  return { counts, total };
}
