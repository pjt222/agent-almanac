// Weakest claim 3: does `shippedFilesUnder`'s ancestor-prefix loop admit exactly what the
// recursive `walk` it replaced admitted?
//
// The two rules are only equal if the prefix loop tests the same directory prefixes, with the
// same trailing slash, at the same depths. An off-by-one changes what SECURITY.md claims ships
// and nothing else would notice, because the published number is whatever the code says.
//
// This re-implements the ORIGINAL walk verbatim from git history and compares, on the real
// corpus and on synthetic negation sets chosen to hit the boundaries.
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { nonDocumentationFiles, shippedEntries } from '../../../scripts/lib/skills-inventory.js';

// Derived, never hardcoded — see enumeration-cost.mjs.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DOC = ['.md', '.yml', '.yaml'];

// Verbatim from 7f3ffcf5d^:scripts/lib/skills-inventory.js
function isExcludedFromPackage(relPath, negations) {
  return negations.some((pattern) => (pattern.endsWith('/')
    ? relPath.startsWith(pattern)
    : relPath === pattern));
}
function oldWalk(root, dir, negations, out) {
  for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (isExcludedFromPackage(entry.isDirectory() ? `${rel}/` : rel, negations)) continue;
    if (entry.isDirectory()) oldWalk(root, rel, negations, out);
    else out.push(rel);
  }
  return out;
}

// The new rule, lifted out of skills-inventory.js so it can be driven with arbitrary negations.
function newRule(paths, tree, negations) {
  const treeDepth = tree.split('/').length;
  return paths.filter((rel) => {
    const parts = rel.split('/');
    for (let depth = treeDepth; depth < parts.length - 1; depth++) {
      if (isExcludedFromPackage(`${parts.slice(0, depth + 1).join('/')}/`, negations)) return false;
    }
    return !isExcludedFromPackage(rel, negations);
  });
}

function allFiles(root, dir, out = []) {
  for (const entry of readdirSync(resolve(root, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) allFiles(root, rel, out);
    else out.push(rel);
  }
  return out;
}

const TREES = ['skills', 'agents', 'teams', 'guides'];
const CASES = [
  ['the real package negations', shippedEntries(ROOT).negations],
  ['a file negation at depth 1', ['agents/_template.md']],
  ['a directory negation at depth 1', ['skills/_template/']],
  ['a directory negation at depth 2', ['skills/create-skill/references/']],
  ['a file negation at depth 3', ['skills/consult-a-decision-oracle/references/separation.py']],
  ['a negation naming the TREE itself', ['skills/']],
  ['a prefix that matches no boundary', ['skills/create-sk']],
  ['no negations at all', []],
];

let bad = 0;
for (const [label, negations] of CASES) {
  for (const tree of TREES) {
    const old = oldWalk(ROOT, tree, negations, []).sort();
    const fresh = newRule(allFiles(ROOT, tree), tree, negations).sort();
    const same = JSON.stringify(old) === JSON.stringify(fresh);
    if (!same) {
      bad++;
      const only = (a, b) => a.filter((p) => !b.includes(p)).slice(0, 4);
      console.log(`DIFFER  ${label} / ${tree}\n  only-old:  ${JSON.stringify(only(old, fresh))}\n  only-new:  ${JSON.stringify(only(fresh, old))}`);
    }
  }
  console.log(`${bad === 0 ? 'ok  ' : 'BAD '} ${label}`);
}

// And the shipped function end to end against the old walk plus the old documentation filter.
const negations = shippedEntries(ROOT).negations;
const oldInventory = TREES.flatMap((t) => oldWalk(ROOT, t, negations, []))
  .filter((p) => !DOC.some((e) => p.endsWith(e))).sort();
const shipped = nonDocumentationFiles(ROOT, TREES);
console.log(`\nnonDocumentationFiles: ${shipped.length} paths; old walk on the same tree: ${oldInventory.length}`);
console.log(`identical: ${JSON.stringify(shipped) === JSON.stringify(oldInventory)}`);
const onlyOld = oldInventory.filter((p) => !shipped.includes(p));
const onlyNew = shipped.filter((p) => !oldInventory.includes(p));
if (onlyOld.length || onlyNew.length) {
  console.log(`only-old (expected: gitignored artefacts only): ${JSON.stringify(onlyOld)}`);
  console.log(`only-new (expected: none):                      ${JSON.stringify(onlyNew)}`);
}
console.log(`\ncases compared: ${CASES.length} x ${TREES.length} trees; disagreements: ${bad}`);
