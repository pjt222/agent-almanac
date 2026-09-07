#!/usr/bin/env node
/**
 * agent-report.mjs — recover a subagent's final report from its transcript.
 *
 * A subagent's report reaches the lead as a notification that is truncated past a few thousand
 * characters, and a subagent whose Write tool is blocked (as `advocatus-diaboli`'s was in the
 * 2026-09-02 session, for a 35 KB ADR review) cannot save the report itself. The full text is
 * still in its transcript — `<session>/subagents/agent-<name>-<hash>.jsonl`, one JSON object per
 * line, assistant messages carrying `content: [{ type: 'text', text }]` blocks under
 * `message.role === 'assistant'`. This tool pulls an assistant text block containing a marker
 * (the report's title line) — the LAST one by default, the N-th with `--nth N` — and writes it
 * to a file byte for byte — no trailing newline is added, so the file can be diffed against the
 * transcript text — so the lead can save the deliverable where the subagent could not.
 *
 * `--nth` exists for a reviewer that is continued across rounds: every report begins with the
 * same marker (`GATE:` here), so round N is the N-th block carrying it, and the last block is
 * whichever round finished most recently. `--count` prints how many blocks carry the marker,
 * which is what a wait loop polls for round N (`until [ "$(… --count)" -ge N ]`); a transcript
 * that cannot be searched is still exit 2 there, never a printed zero.
 *
 * Transcript shape measured against Claude Code 2.1.258, 2026-09-02; the format belongs to
 * another program and may move.
 *
 * Usage:
 *   node tools/agent-report.mjs <transcript.jsonl> <marker> <out.md> [--nth N]
 *   node tools/agent-report.mjs <transcript.jsonl> <marker> --count
 *   node tools/agent-report.mjs --verify
 *
 * Exit 0 on success; 1 if no assistant text carries the marker (or fewer than N do), or
 * `--verify` fails; 2 on usage, an unreadable transcript, a failed output write, a transcript
 * with NO parseable line, or one whose parseable lines carry no `message.role === 'assistant'`
 * at all — that last is the transcript format having moved, and it must not be reported as "the
 * subagent never wrote it". Malformed lines are skipped (a transcript can hold partial writes).
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Every assistant text block containing `marker`, in transcript order (possibly empty). Throws
 * when the transcript cannot be searched at all: nothing parses, or nothing parsed is an
 * assistant message — the two "could not look" cases, kept apart from "nothing to find".
 */
export function reports(transcriptText, marker) {
  const lines = transcriptText.split('\n').filter((l) => l.trim() !== '');
  let parsed = 0;
  let assistant = 0;
  const found = [];
  for (const line of lines) {
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    parsed += 1;
    const msg = entry?.message;
    if (!msg || msg.role !== 'assistant' || !Array.isArray(msg.content)) continue;
    assistant += 1;
    for (const block of msg.content) {
      if (block?.type === 'text' && typeof block.text === 'string' && block.text.includes(marker)) found.push(block.text);
    }
  }
  if (parsed === 0) throw new Error('no parseable JSON line in the transcript');
  if (assistant === 0) throw new Error(`${parsed} line(s) parsed, none with message.role === 'assistant' — the transcript format may have changed`);
  return found;
}

/** The last assistant text block containing `marker`, or null when none carries it; throws as `reports` does. */
export function lastReport(transcriptText, marker) {
  const all = reports(transcriptText, marker);
  return all.length === 0 ? null : all[all.length - 1];
}

function verify() {
  const dir = mkdtempSync(join(tmpdir(), 'agent-report-'));
  const checks = [];
  const check = (name, ok) => { checks.push([name, ok]); if (!ok) console.error(`FAIL: ${name}`); };
  const quiet = { log() {}, error() {} };
  try {
    const entry = (role, blocks) => JSON.stringify({ message: { role, content: blocks } });
    const transcript = [
      entry('user', [{ type: 'text', text: '# Report — not this one, wrong role' }]),
      entry('assistant', [{ type: 'text', text: '# Report\n\nfirst draft' }]),
      '{"partial": tru',
      'null',
      entry('assistant', [{ type: 'tool_use', name: 'Read', input: {} }, { type: 'text' }, { type: 'text', text: 'interim text without the marker' }]),
      entry('assistant', [{ type: 'text', text: '# Report\n\nfinal text, no trailing newline' }]),
    ].join('\n');
    const FIRST = '# Report\n\nfirst draft';
    const FINAL = '# Report\n\nfinal text, no trailing newline';
    check('picks the LAST assistant block with the marker', lastReport(transcript, '# Report') === FINAL);
    check('reports: every carrying block, in order', JSON.stringify(reports(transcript, '# Report')) === JSON.stringify([FIRST, FINAL]));
    check('a user block with the marker is not a report', lastReport([entry('user', [{ type: 'text', text: '# Report' }]), entry('assistant', [{ type: 'text', text: 'x' }])].join('\n'), '# Report') === null);
    check('marker absent → null', lastReport(transcript, '# Elsewhere') === null);
    let why = '';
    try { lastReport('not json\nnor this', '# Report'); } catch (err) { why = err.message; }
    check('nothing parseable is refused, not null', /no parseable JSON line/.test(why));
    why = '';
    try { lastReport('{"message":{"speaker":"assistant","content":[{"type":"text","text":"# Report"}]}}', '# Report'); } catch (err) { why = err.message; }
    check('parseable but no assistant role is refused as a format change', /none with message\.role === 'assistant'/.test(why));

    // The CLI end to end: a verbatim write (no newline added), exit codes as documented.
    const t = join(dir, 't.jsonl');
    writeFileSync(t, transcript);
    const out = join(dir, 'out.md');
    check('cli: found → 0, written byte for byte', main([t, '# Report', out], quiet) === 0 && readFileSync(out, 'utf8') === FINAL);
    check('cli: not found → 1', main([t, '# Elsewhere', join(dir, 'none.md')], quiet) === 1);
    check('cli: unreadable → 2', main([join(dir, 'missing.jsonl'), '# Report', out], quiet) === 2);
    const garbage = join(dir, 'garbage.jsonl');
    writeFileSync(garbage, 'not json\nnor this\n');
    check('cli: unparseable → 2', main([garbage, '# Report', out], quiet) === 2);
    const moved = join(dir, 'moved.jsonl');
    writeFileSync(moved, '{"message":{"speaker":"assistant","content":[{"type":"text","text":"# Report"}]}}\n');
    check('cli: format change → 2, not 1', main([moved, '# Report', out], quiet) === 2);
    check('cli: failed write → 2', main([t, '# Report', join(dir, 'no', 'such', 'dir', 'out.md')], quiet) === 2);
    check('cli: usage → 2', main(['only-one'], quiet) === 2 && main([t, '# Report', out, 'extra'], quiet) === 2);

    // --nth and --count.
    const nth1 = join(dir, 'nth1.md');
    check('cli: --nth 1 → the first carrying block', main([t, '# Report', nth1, '--nth', '1'], quiet) === 0 && readFileSync(nth1, 'utf8') === FIRST);
    const nth2 = join(dir, 'nth2.md');
    check('cli: --nth 2 → the second, flag before the positionals too', main(['--nth', '2', t, '# Report', nth2], quiet) === 0 && readFileSync(nth2, 'utf8') === FINAL);
    check('cli: --nth past the end → 1, nothing written', main([t, '# Report', join(dir, 'nth3.md'), '--nth', '3'], quiet) === 1);
    check('cli: --nth 0, negative, non-numeric, missing → 2', ['0', '-1', 'two'].every((v) => main([t, '# Report', out, '--nth', v], quiet) === 2) && main([t, '# Report', out, '--nth'], quiet) === 2);
    const printed = [];
    const capture = { log(s) { printed.push(String(s)); }, error() {} };
    check('cli: --count prints the count, exit 0', main([t, '# Report', '--count'], capture) === 0 && printed.at(-1) === '2');
    printed.length = 0;
    check('cli: --count with no carrying block prints 0, exit 0', main([t, '# Elsewhere', '--count'], capture) === 0 && printed.at(-1) === '0');
    printed.length = 0;
    check('cli: --count on an unsearchable transcript → 2, prints nothing', main([garbage, '# Report', '--count'], capture) === 2 && main([moved, '# Report', '--count'], capture) === 2 && printed.length === 0);
    check('cli: --count with an out path, or with --nth → 2', main([t, '# Report', out, '--count'], quiet) === 2 && main([t, '# Report', '--count', '--nth', '1'], quiet) === 2);
    check('cli: an unknown flag → 2', main([t, '# Report', out, '--last'], quiet) === 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(`agent-report --verify: ${checks.length - failed}/${checks.length} checks passed`);
  return failed ? 1 : 0;
}

const USAGE = 'Usage: node tools/agent-report.mjs <transcript.jsonl> <marker> <out.md> [--nth N] | <transcript.jsonl> <marker> --count | --verify';

function main(argv, io = console) {
  if (argv[0] === '--verify') return verify();
  const positional = [];
  let nth = null;
  let count = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--count') {
      count = true;
    } else if (arg === '--nth') {
      const value = argv[i + 1];
      if (!/^[1-9][0-9]*$/.test(value ?? '')) { io.error(USAGE); return 2; }
      nth = Number(value);
      i += 1;
    } else if (arg.startsWith('--')) {
      io.error(USAGE);
      return 2;
    } else {
      positional.push(arg);
    }
  }
  const wellFormed = count ? positional.length === 2 && nth === null : positional.length === 3;
  if (!wellFormed) { io.error(USAGE); return 2; }
  const [transcript, marker, outPath] = positional;
  let text;
  try {
    text = readFileSync(transcript, 'utf8');
  } catch (err) {
    io.error(`agent-report: cannot read ${transcript}: ${err.message}`);
    return 2;
  }
  let all;
  try {
    all = reports(text, marker);
  } catch (err) {
    io.error(`agent-report: ${err.message}`);
    return 2;
  }
  if (count) {
    io.log(String(all.length));
    return 0;
  }
  const found = nth === null ? (all.length === 0 ? null : all[all.length - 1]) : (all[nth - 1] ?? null);
  if (found === null) {
    io.error(nth === null
      ? `agent-report: no assistant text containing ${JSON.stringify(marker)} in ${transcript}`
      : `agent-report: ${all.length} assistant text block(s) contain ${JSON.stringify(marker)} in ${transcript}; --nth ${nth} asked for one that does not exist`);
    return 1;
  }
  try {
    writeFileSync(outPath, found);
  } catch (err) {
    io.error(`agent-report: cannot write ${outPath}: ${err.message}`);
    return 2;
  }
  io.log(`${Buffer.byteLength(found, 'utf8')} bytes → ${outPath}`);
  return 0;
}

// realpath on both sides; no try/catch, so a resolution failure throws rather than exiting 0.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  process.exitCode = main(process.argv.slice(2));
}
