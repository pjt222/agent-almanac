#!/usr/bin/env node
/**
 * check-tools-registry.js — `tools/_registry.yml` against disk, and optionally each tool's self-test.
 *
 * Two checks, deliberately separate, because one row's self-test needs a live fetch from a
 * third-party repository and a required CI context must never depend on that:
 *
 *   node scripts/check-tools-registry.js            parity + schema (offline; run by validate-integrity.sh)
 *   node scripts/check-tools-registry.js --verify   also run every row's `verify` where verify_in_ci is true,
 *                                                   and PRINT the rows it skipped with their reasons — an
 *                                                   opt-out nobody counts is a row that silently stopped
 *                                                   being checked
 *
 * Exit 0 clean; 1 on any schema error, any file without a row, any row without a file, anything
 * under tools/ that is not a plain file, or any self-test that exits non-zero; 2 when the
 * registry cannot be read or parsed (never a pass). Dependency-free: the reader is
 * `scripts/lib/tools-registry.js`, not js-yaml.
 *
 * Output contract: exactly ONE line starts with `OK:`, it is the last line, and it is printed
 * only when nothing failed — on the `--verify` path too, where a self-test that fails turns the
 * summary into `FAIL:`. validate-integrity.sh requires that line as well as exit 0, so a checker
 * that exits 0 having done nothing cannot read as a pass; per-self-test lines are `PASS:` /
 * `FAIL:` so a `^OK:` grep over a tools-verify log cannot match a partial run.
 */

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadRegistry } from './lib/tools-registry.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function main(argv, io = console, root = ROOT, run = spawnSync) {
  const verify = argv.includes('--verify');
  const unknown = argv.filter((a) => a !== '--verify');
  if (unknown.length) { io.error(`check-tools-registry: unknown argument(s): ${unknown.join(' ')}`); return 2; }
  let reg;
  try {
    reg = loadRegistry(root);
  } catch (err) {
    io.error(`check-tools-registry: cannot read the registry: ${err.message}`);
    return 2;
  }
  let failed = false;
  for (const e of reg.errors) { io.log(`FAIL: schema: ${e}`); failed = true; }
  for (const p of reg.fileWithoutRow) { io.log(`FAIL: file without row: ${p} -- it renders in no index; add an entry to tools/_registry.yml`); failed = true; }
  for (const p of reg.rowWithoutFile) { io.log(`FAIL: row without file: ${p} -- the registry names a tool that is not on disk`); failed = true; }
  for (const p of reg.notPlainFile) { io.log(`FAIL: not a plain file under tools/: ${p} -- a tool is one flat file; a subdirectory or symlink there is representable by no row (NOT_TOOLS is the exact exemption set)`); failed = true; }
  let verifyNote = '';
  if (verify) {
    let ran = 0;
    const skipped = [];
    for (const e of reg.entries) {
      if (!e.verify) continue;
      if (e.verify_in_ci !== 'true') { skipped.push(`${e.id}: ${e.verify_skip_reason ?? '(no reason given)'}`); continue; }
      const r = run('bash', ['-c', e.verify], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
      ran += 1;
      if (r.status === 0) io.log(`PASS: ${e.id}: \`${e.verify}\` exit 0`);
      else { io.log(`FAIL: ${e.id}: \`${e.verify}\` exit ${r.status}\n${(r.stdout || '') + (r.stderr || '')}`.trimEnd()); failed = true; }
    }
    io.log(`verify: ${ran} self-test(s) run, ${skipped.length} skipped${skipped.length ? ': ' + skipped.join('; ') : ''}`);
    verifyNote = `; ${ran} self-test(s) run`;
  }
  const active = reg.entries.filter((e) => e.status === 'active').length;
  const summary = `${reg.entries.length} row(s) (${active} active) against ${reg.entries.length - reg.rowWithoutFile.length + reg.fileWithoutRow.length} file(s) under tools/, both directions${verifyNote}`;
  io.log(failed ? `FAIL: ${summary} -- see the lines above` : `OK: ${summary}`);
  return failed ? 1 : 0;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  process.exitCode = main(process.argv.slice(2));
}
