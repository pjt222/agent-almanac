// expected-codes.mjs — print the porcelain codes the two-column test asserts, one
// `<code> <path>` per line, sorted.
//
// This exists so that `two-column-pack.sh` can compare its fixture against THE TEST rather than
// against a literal of its own. The literal it carried before was the fifth instance of this
// PR's recurring class: the script said it refused when the test's fixture changed, and it
// never read the test. Measured — renaming `new2.md` to `new3.md` at all six sites of the
// test's fixture left the test green at 27/27 and the script at exit 0 with zero `REFUSED`
// lines, still reporting `new2.md` (#883 round 5, SF-1). There is now one source for the eight
// codes, so there is nothing left for them to drift against.
//
// Root derived from this file's own location; pass one as argv[2] to point it elsewhere.
// Exit 0 with the lines, or exit 2 with a reason on stderr and NOTHING on stdout — a caller
// that captured an empty success would compare its fixture against nothing and pass.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const path = `${root}/scripts/test/publishable-tree.test.js`;

let source;
try {
  source = readFileSync(path, 'utf8');
} catch (error) {
  console.error(`expected-codes: cannot read ${path}: ${error.message}`);
  process.exit(2);
}

// Anchored on the assertion MESSAGE, not on position: the message names what the block is for
// and a reformat of the object literal does not move it. If the message is reworded the match
// fails and this exits 2, which is the safe direction — a silently different match would
// compare the fixture against some other assertion in the file.
const block = source.match(/assert\.deepEqual\(found\.codes, \{([\s\S]*?)\}, 'the fixture is vacuous/);
if (!block) {
  console.error(
    `expected-codes: could not find the two-column \`deepEqual\` on \`found.codes\` in ${path}. `
    + 'It is matched by its assertion message ("the fixture is vacuous unless git reports…"); '
    + 'if that wording changed, update this matcher rather than the caller.',
  );
  process.exit(2);
}

const rows = [...block[1].matchAll(/'([^']+)':\s*'([^']*)'/g)].map(([, p, code]) => `${code} ${p}`);
if (rows.length === 0) {
  console.error(`expected-codes: the block matched but yielded no entries in ${path}`);
  process.exit(2);
}

console.log(rows.sort().join('\n'));
