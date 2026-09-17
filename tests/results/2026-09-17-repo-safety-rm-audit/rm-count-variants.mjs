#!/usr/bin/env node
// rm-count-variants.mjs — count the same corpus four different ways, so a disagreement with a
// published figure cannot be blamed on one splitting choice.
//
// It walks RECURSIVELY. Version 1 did not, and shared rm-audit.mjs's blind spot exactly: the
// four "independent" rules all counted the same 14% of the corpus, which is a cross-check of the
// splitting rule against itself and of the scope against nothing. See RESULT.md.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function walk(dir, acc = []) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return acc; }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.endsWith('.jsonl')) acc.push(full);
  }
  return acc;
}

const files = [];
for (const d of process.argv.slice(2)) files.push(...walk(d));
if (files.length === 0) {
  console.error('REFUSED: no .jsonl beneath the roots — a scan over nothing reports clean');
  process.exit(2);
}

const cmds = [];
for (const f of files) {
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let r; try { r = JSON.parse(line); } catch { continue; }
    const c = r?.message?.content; if (!Array.isArray(c)) continue;
    for (const b of c) {
      if (b?.type === 'tool_use' && b?.name === 'Bash' && typeof b?.input?.command === 'string') {
        cmds.push(b.input.command);
      }
    }
  }
}

const RM = /(^|[\s(])rm(\s|$)/;
let newlineLines = 0, opSplit = 0, rawOccur = 0, cmdsWithRm = 0;
for (const c of cmds) {
  if (RM.test(c)) cmdsWithRm++;
  for (const l of c.split('\n')) if (RM.test(l)) newlineLines++;
  for (const l of c.split(/\n|&&|\|\||;|\|/)) if (RM.test(l)) opSplit++;
  rawOccur += (c.match(/(^|[\s(])rm(\s|$)/g) || []).length;
}
console.log(`files (recursive)             ${files.length}`);
console.log(`Bash command strings          ${cmds.length}`);
console.log(`command strings containing rm ${cmdsWithRm}`);
console.log(`newline-split lines with rm   ${newlineLines}`);
console.log(`operator-split lines with rm  ${opSplit}`);
console.log(`raw 'rm' token occurrences    ${rawOccur}`);
