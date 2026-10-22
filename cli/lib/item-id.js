/**
 * item-id.js — The rule an item id must meet before any path is built from it.
 *
 * Every adapter turns an item id, and hermes also a skill's domain, into a path
 * segment: `<base>/<id>`, `<base>/<id>.md`, `<base>/<domain>/<id>`. Before this
 * rule, `uninstall ../../README.md -f universal` resolved to the project's own
 * README.md, removed it and exited 0. Any name carrying `..`, a separator or an
 * absolute path reached outside the install directories the same way, whether it
 * came from a command-line argument or from a registry read through `--source`.
 *
 * The rule is this repository's own id convention: scripts/lib/tools-registry.js
 * uses the same expression for tool ids. Every id and domain key in the shipped
 * registries matches it. Counted on 2026-10-21: 534 distinct ids across skills,
 * domains, agents, teams, their cross-references and default_skills.
 *
 * This is the first of two layers. The second, childPath() in
 * cli/adapters/base.js, refuses a path that leaves its base directory even when
 * an adapter is called directly. Neither layer relies on the other.
 */

export const ITEM_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Thrown before anything is installed or removed; index.js turns it into exit 1. */
export class InvalidItemIdError extends Error {
  constructor(offenders) {
    super(
      'Refusing item names that are not plain ids (lowercase letters, digits and single hyphens): ' +
      `${offenders.join(', ')}. Nothing was installed or removed.`,
    );
    this.name = 'InvalidItemIdError';
    this.offenders = offenders;
  }
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function isPlainItemId(value) {
  return typeof value === 'string' && ITEM_ID_RE.test(value);
}

/**
 * Throw InvalidItemIdError naming every offender, or return when all items pass.
 * A skill's domain is checked too, because hermes uses it as a directory name.
 * @param {Array<{id?: unknown, domain?: unknown}>} items
 */
export function assertPlainItemIds(items) {
  const offenders = [];
  for (const item of items) {
    if (!isPlainItemId(item?.id)) offenders.push(JSON.stringify(String(item?.id)));
    if (item?.domain !== undefined && !isPlainItemId(item.domain)) {
      offenders.push(`domain ${JSON.stringify(String(item.domain))} of ${JSON.stringify(String(item?.id))}`);
    }
  }
  if (offenders.length > 0) throw new InvalidItemIdError([...new Set(offenders)]);
}
