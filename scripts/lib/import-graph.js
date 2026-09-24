/**
 * import-graph.js — the static relative-import graph of a JavaScript module, walked from disk.
 *
 * Extracted from `scripts/check-workflow-generator-inputs.js` (#892), where it was module-private
 * and closed over that script's `--root`. It moved so a second consumer can compare what a
 * loader actually reads against what the source statically imports.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, relative, resolve as resolvePath } from 'node:path';

/**
 * Every repo-local module reachable from `entry` by static relative imports, as paths relative
 * to `root` with `/` separators, `entry` itself included.
 *
 * Only relative specifiers are followed: a bare specifier is a package, and packages are
 * covered by the `package.json` / `package-lock.json` entries the filter already carries for
 * exactly this reason.
 *
 * `root` is a parameter rather than a module-level constant so the walk can serve more than one
 * caller: `check-workflow-generator-inputs.js` passes its `--root`, and a caller outside the
 * repository root passes its own (#892).
 *
 * @param {string} root the directory paths are resolved against and reported relative to
 * @param {string} entry a path relative to `root`
 * @param {Set<string>} [seen] accumulator; returned, so a caller can seed it
 * @returns {Set<string>} the reachable modules
 * @throws {Error} when `entry` or any relative import it reaches does not exist
 */
export function importGraph(root, entry, seen = new Set()) {
  const absolute = resolvePath(root, entry);
  const rel = relative(root, absolute).split('\\').join('/');
  if (seen.has(rel)) return seen;
  if (!existsSync(absolute)) {
    throw new Error(`entry or import does not exist: ${rel}`);
  }
  seen.add(rel);
  const text = readFileSync(absolute, 'utf8');
  // `export … from './x.js'` is an edge as much as `import` is: a re-exporting barrel module
  // sits in the graph and its own changes move generated output. The negated character class
  // spans newlines, so multi-line forms are covered without an `s` flag.
  //
  // Two constraints on the span before the specifier, and both are load-bearing.
  //
  // ANCHORED ON `from`, because without it the class ran from an `export` keyword straight into
  // the FUNCTION BODY below and took the first quoted string it found:
  //
  //     export function isExcludedId(id) {
  //       const stem = id.endsWith('.md') ? …
  //
  // read as an import of `./lib/.md`, which does not exist, so this check hard-refused —
  // exiting non-zero even under `--warn`, in a REQUIRED context. It surfaced the first time a
  // module in the healer's graph exported a function whose body's first quoted literal began
  // with a dot (#672), and would have recurred for any future one. `import './side-effect.js'`
  // has no `from`, hence the optional group rather than a required one.
  //
  // And the span is `[\w$*,{}\s]`, not `[^'"]`, because anchoring alone did NOT close the
  // class -- it only narrowed it. Any line-start `export`/`import` whose text contains the word
  // `from` before a dotted quoted string still matched, so
  //
  //     export const probe = 1; // adapted from './old.js'
  //
  // reproduced the same hard refusal. Measured on this tree, not argued. The character class
  // is what an import CLAUSE can actually contain -- identifiers, `*`, `as`, commas, braces,
  // whitespace -- and it admits the multi-line form (a newline is `\s`) while excluding the
  // `=`, `;`, `(` and `/` that any statement or comment carrying a stray `from` must have.
  //
  // Found by an adversarial reviewer, who named the experiment rather than asserting it; the
  // planted line refused exactly as predicted.
  const specifiers = [...text.matchAll(/^\s*(?:import|export)\s(?:[\w$*,{}\s]*?\bfrom\s*)?['"](\.[^'"]+)['"]/gm)]
    .map((m) => m[1]);
  for (const specifier of specifiers) {
    importGraph(root, relative(root, resolvePath(dirname(absolute), specifier)), seen);
  }
  return seen;
}
