import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
const dirs = process.argv.slice(2);
let files = [];
for (const d of dirs) { try { for (const n of readdirSync(d)) if (n.endsWith('.jsonl')) files.push(join(d, n)); } catch {} }
let cmds = [];
for (const f of files) {
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let r; try { r = JSON.parse(line); } catch { continue; }
    const c = r?.message?.content; if (!Array.isArray(c)) continue;
    for (const b of c) if (b?.type === 'tool_use' && b?.name === 'Bash' && typeof b?.input?.command === 'string') cmds.push(b.input.command);
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
console.log(`files                         ${files.length}`);
console.log(`Bash command strings          ${cmds.length}`);
console.log(`command strings containing rm ${cmdsWithRm}`);
console.log(`newline-split lines with rm   ${newlineLines}`);
console.log(`operator-split lines with rm  ${opSplit}`);
console.log(`raw 'rm' token occurrences    ${rawOccur}`);
