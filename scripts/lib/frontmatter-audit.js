/**
 * frontmatter-audit.js — a YAML-based second opinion on where a provenance field landed (#552).
 *
 * Separate from `provenance.js` on purpose. This is the only module in the chain that needs a
 * real YAML parser, and `provenance.js` is imported by tools whose test fixtures are bare temp
 * repos with no `node_modules`; giving it a dependency broke 38 of them. Keeping the dependency
 * here confines it to the one consumer that wants it.
 */

import * as yaml from 'js-yaml';

import { SOURCE_COMMIT_FIELD, FENCE_BASIS_FIELD } from './provenance.js';

/**
 * Parse a stamped file's frontmatter with a real YAML parser and check where the field landed.
 *
 * Deliberately does NOT use `readFrontmatterField`. That reader tolerates any indentation by
 * design, so it reads the field back correctly whether it sits beside `source_commit` or in a
 * different mapping entirely — which means it cannot detect the one placement error that
 * produces valid YAML with the wrong meaning. `js-yaml` sees the structure the reader flattens.
 *
 * ## Why no test drives this THROUGH `--verify`
 *
 * Because nothing can, and that is the point rather than a gap. The reconstruction check runs
 * first and compares against `stampFrontmatterField`'s own output, so any diff this tool
 * actually produced passes reconstruction and reaches here already correct. This fires only when
 * `stampFrontmatterField` is itself wrong — the one case reconstruction is blind to, since it
 * shares that transform. Mutating the call site therefore SURVIVES the suite, measured, and no
 * fixture can change that without injecting a broken transform.
 *
 * So it is tested as a function instead, and the honest description of its wiring is: defence in
 * depth against a defect in a shared primitive, whose value is realised by running it over the
 * corpus (3,415 of 3,415 clean, 2,444 top-level / 971 nested) rather than by a unit assertion.
 *
 * @param {string} text whole file contents at the audited ref
 * @returns {string|null} a problem description, or null when the file is sound
 */
export function auditYaml(text) {
  const fm = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(\n|$)/);
  if (!fm) return 'no frontmatter block';
  let doc;
  try {
    doc = yaml.load(fm[1]);
  } catch (e) {
    return `frontmatter is not valid YAML: ${String(e.message).split('\n')[0]}`;
  }
  if (!doc || typeof doc !== 'object') return 'frontmatter is not a mapping';

  const atTop = Object.prototype.hasOwnProperty.call(doc, FENCE_BASIS_FIELD);
  const meta = doc.metadata && typeof doc.metadata === 'object' ? doc.metadata : null;
  const inMeta = Boolean(meta && Object.prototype.hasOwnProperty.call(meta, FENCE_BASIS_FIELD));
  if (!atTop && !inMeta) return `${FENCE_BASIS_FIELD} parsed into neither the top level nor metadata`;

  const holder = atTop ? doc : meta;
  if (!Object.prototype.hasOwnProperty.call(holder, SOURCE_COMMIT_FIELD)) {
    return `${FENCE_BASIS_FIELD} landed in a different mapping than ${SOURCE_COMMIT_FIELD}`;
  }
  if (String(holder[FENCE_BASIS_FIELD]) !== String(holder[SOURCE_COMMIT_FIELD])) {
    return `${FENCE_BASIS_FIELD} (${holder[FENCE_BASIS_FIELD]}) !== ${SOURCE_COMMIT_FIELD} (${holder[SOURCE_COMMIT_FIELD]})`;
  }
  return null;
}
