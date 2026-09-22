// expected-codes.mjs — print the porcelain codes the two-column test asserts, one
// `<code> <path>` per line, sorted.
//
// `two-column-pack.sh` compares its fixture against THE TEST through this file, rather than
// against a literal of its own. That literal was the fifth instance of this PR's recurring
// class: the script said it refused when the test's fixture changed and never read the test
// (#883 round 5, SF-1).
//
// ## Why this parser accounts for every line
//
// A parser that silently drops what it cannot read is the same defect one level down, and it
// was measured on the predecessor: adding a DOUBLE-quoted ninth entry to the test's
// `deepEqual` left this printing eight codes, the script's eight-code fixture matched, and the
// guard passed while the test asserted nine (#883 round 5 delta, SF-A). An unreadable entry is
// an ABSENCE to a regex and a MISMATCH to a human, and only the second reading is safe.
//
// So: every non-blank line inside the block must parse as an entry or be a comment. Anything
// else exits 2. That one rule closes four shapes at once — a double-quoted entry refuses
// instead of vanishing, a comment carrying a quoted pair is skipped instead of counted, a
// block whose brace matching ran past its end carries lines that are neither, and a reworded
// entry refuses rather than shortening the set.
//
// The anchor is the test's TITLE plus the first `deepEqual(found.codes` after it, not the
// assertion message: a reworded message cannot then move the anchor onto a different block,
// it can only fail to find this one. The block's extent is taken by brace matching, not by a
// lazy `[\s\S]*?`, which stops at the first nested `}`.
//
// Root derived from this file's own location; pass one as argv[2] to point it elsewhere.
// Exit 0 with the lines, or exit 2 with a reason on stderr and NOTHING on stdout — a caller
// that captured an empty success would compare its fixture against nothing and pass.
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = process.argv[2] ?? resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const path = `${root}/scripts/test/publishable-tree.test.js`;

const refuse = (message) => {
  console.error(`expected-codes: ${message}`);
  process.exit(2);
};

let source;
try {
  source = readFileSync(path, 'utf8');
} catch (error) {
  refuse(`cannot read ${path}: ${error.message}`);
}

const TITLE = "test('a TWO-COLUMN code";
const titleAt = source.indexOf(TITLE);
if (titleAt === -1) {
  refuse(
    `could not find the two-column test in ${path}. It is anchored on its title, "${TITLE}…"; `
    + 'if the title changed, update this anchor rather than the caller.',
  );
}
// The anchor's claim is that a reworded message cannot move it onto ANOTHER block. That holds
// only while the title prefix is unique: a second test whose title starts the same way takes
// the first occurrence, and which one that is depends on file order (#883 round 6 delta, N-2).
if (source.indexOf(TITLE, titleAt + 1) !== -1) {
  refuse(
    `the title prefix "${TITLE}…" occurs more than once in ${path}, so this anchor does not `
    + 'identify a single test. Rename one, or anchor on more of the title.',
  );
}

const NEEDLE = 'deepEqual(found.codes, {';
const openAt = source.indexOf(NEEDLE, titleAt);
if (openAt === -1) {
  refuse(`found the two-column test but no \`${NEEDLE}\` after it in ${path}.`);
}

// Extent and accounting in ONE line-wise pass, and the two are not separable. A character walk
// counting braces treats a `}` inside a comment as a closer, which ends the block early and
// silently — the truncated set compared equal and passed, measured (#883 round 6 delta, N-1).
// Skipping comment lines BEFORE counting means a commented brace can neither close the block
// nor extend it.
//
// Per line, in order: blank and comment lines contribute nothing at all; a line that brings
// depth to zero ends the block and is not required to be an entry (it carries the assertion
// tail); every other line must be an entry. A nested object therefore refuses rather than being
// skipped, whether it is written on one line (depth returns to 1 and the line is not an entry)
// or across several (depth stays above 1, same verdict).
const ENTRY = /^'([^']+)':\s*'([^']*)',?$/;
const isComment = (line) => line.startsWith('//') || line.startsWith('*') || line.startsWith('/*');

let depth = 1;
let closed = false;
const rows = [];
for (const raw of source.slice(openAt + NEEDLE.length).split('\n')) {
  const line = raw.trim();
  if (line === '' || isComment(line)) continue;
  depth += (line.match(/\{/g) ?? []).length - (line.match(/\}/g) ?? []).length;
  if (depth <= 0) {
    // The depth-zero line is exempt from the entry rule because it carries the assertion tail.
    // CHECK that it is the tail rather than assuming it: an entry whose path or code contains
    // a `}` also brings depth to zero, and was taken as the tail — the block closed there and
    // the entry vanished, so a ninth entry could leave eight codes at exit 0 (#883 round 8,
    // N-1). The character walk this replaced refused that shape, which made it a regression,
    // and the header's "anything else exits 2" was broader than the code. The tail always
    // starts with `}`; an entry never does.
    if (!line.startsWith('}')) {
      refuse(
        `the line that closes the two-column \`deepEqual\` is not the assertion tail: ${JSON.stringify(line)}\n`
        + '  A tail starts with `}`. A line that brings the brace depth to zero and does not is '
        + 'an entry carrying a brace in its path or code, and taking it as the tail would drop '
        + 'it from the set in silence.',
      );
    }
    closed = true;
    break;
  }
  const entry = line.match(ENTRY);
  if (!entry) {
    refuse(
      `line inside the two-column \`deepEqual\` is neither an entry nor a comment: ${JSON.stringify(line)}\n`
      + '  Entries are single-quoted `\'<path>\': \'<code>\',`. This refuses rather than skipping '
      + 'the line, because a dropped entry is an absence to a parser and a mismatch to a reader, '
      + 'and the caller would compare its fixture against the shorter set and pass.',
    );
  }
  rows.push(`${entry[2]} ${entry[1]}`);
}

if (!closed) {
  refuse(`the object literal after \`${NEEDLE}\` is never closed in ${path}.`);
}
if (rows.length === 0) {
  refuse(`the two-column \`deepEqual\` block in ${path} yielded no entries.`);
}

console.log(rows.sort().join('\n'));
