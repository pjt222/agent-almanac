#!/usr/bin/env node
/**
 * agent-report.mjs — recover a subagent's final report from its transcript.
 *
 * A subagent's report reaches the lead as a notification that is truncated past a few thousand
 * characters, and a subagent whose Write tool is blocked (as `advocatus-diaboli`'s was in the
 * 2026-09-02 session, for a 35 KB ADR review) cannot save the report itself. The full text is
 * still in its transcript — `<session>/subagents/agent-<name>-<hash>.jsonl`, one JSON object per
 * line, assistant messages carrying `content: [...]` blocks under `message.role === 'assistant'`.
 * A report is a `text` block, or the `input.message` of a `SendMessage` tool call — measured on
 * this session's transcripts (2026-09-07): one reviewer delivered ten rounds as text blocks and
 * three through SendMessage, one of those three nowhere else. This tool pulls the report that
 * carries a marker (the report's title line) — the LAST one by default, the N-th with `--nth N`
 * — and writes it to a file byte for byte — no trailing newline is added, so the file can be
 * diffed against the transcript text — so the lead can save the deliverable where the subagent
 * could not.
 *
 * A block "carries" the marker when one of its lines STARTS with it, at column 0. A block that
 * merely mentions the marker mid-line — a reviewer restating the format it was asked for — or
 * quotes an earlier round's marker line inside an indented block is not a report, and for
 * `--nth`/`--count` that distinction is what makes the position mean anything.
 *
 * One round can reach the transcript twice: the reviewer measured above sent a 2 KB summary
 * through SendMessage and, asked for the full report, wrote 28 KB as text under the same
 * `GATE:` line, one user turn later — two messages apart in the transcript, where the next
 * report of a different source was twenty messages on. So two reports are ONE round when they
 * come from different sources, carry a byte-identical marker line, and lie at most
 * MERGE_WINDOW (4) messages apart; the longer text is kept, and a round merges at most once,
 * so a third report with the same line is a new round. Two consecutive text blocks with the
 * same marker line stay two rounds (a confirm-only reply can legitimately repeat the previous
 * one). On that transcript this counts 11 rounds where a text-only scan counts 10 and a naive
 * union counts 13. What the rule cannot see: a summary sent with `blocking=1` whose full text
 * revised to `blocking=2` is two rounds here, and two rounds with identical lines from
 * different sources within the window would be one. `--raw` disables the merge and shows the
 * unmerged sequence.
 *
 * `--nth` exists for a reviewer that is continued across rounds: every report begins with the
 * same marker (`GATE:` here), so round N is the N-th report carrying it, and the last is
 * whichever round finished most recently. `--count` prints how many rounds carry the marker,
 * which is what a wait loop polls for round N; a transcript that cannot be searched is still
 * exit 2 there, with nothing printed, never a zero — so the loop must stop on a non-zero exit
 * rather than compare an empty string:
 *
 *   while :; do n=$(node tools/agent-report.mjs --count "$T" 'GATE:') || exit 2; [ "$n" -ge 3 ] && break; sleep 20; done
 *
 * Transcript shape measured against Claude Code 2.1.258, 2026-09-02, and again 2026-09-07; the
 * format belongs to another program and may move.
 *
 * Usage:
 *   node tools/agent-report.mjs [--nth N] [--raw] [--] <transcript.jsonl> <marker> <out.md>
 *   node tools/agent-report.mjs --count [--raw] [--] <transcript.jsonl> <marker>
 *   node tools/agent-report.mjs --verify
 *
 * Flags may come before or after the positionals; `--` ends them, for a marker or a path that
 * itself begins with `--`.
 *
 * Exit 0 on success; 1 if no report carries the marker (or fewer than N do), or `--verify`
 * fails; 2 on usage, an unreadable transcript, a failed output write, a transcript with NO
 * parseable line, or one whose parseable lines carry no `message.role === 'assistant'` at all
 * — that last is the transcript format having moved, and it must not be reported as "the
 * subagent never wrote it". Malformed lines are skipped (a transcript can hold partial writes).
 */

import { readFileSync, writeFileSync, mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * How far apart, in transcript messages (every parsed line carrying a `message`, any role), a
 * summary and its full text may lie and still be one round. Measured pairs: 2 apart; the
 * nearest pair of different sources that was NOT one round: 20 apart.
 */
export const MERGE_WINDOW = 4;

/** The first line of `text` that starts with `marker` at column 0, trailing whitespace trimmed; null when none does. */
export function markerLine(text, marker) {
  const line = text.split('\n').find((l) => l.startsWith(marker));
  return line === undefined ? null : line.trimEnd();
}

/** Whether some line of `text` starts with `marker` at column 0. */
export function carries(text, marker) {
  return markerLine(text, marker) !== null;
}

/**
 * Every report carrying `marker`, in transcript order (possibly empty): assistant `text` blocks
 * and the `input.message` of assistant `SendMessage` tool calls. Unless `merge` is false, two
 * reports from different sources with the same marker line at most MERGE_WINDOW messages apart
 * are one round (the longer text kept, at most one merge per round). Throws when the transcript
 * cannot be searched at all: nothing parses, or nothing parsed is an assistant message — the
 * two "could not look" cases, kept apart from "nothing to find".
 */
export function reports(transcriptText, marker, { merge = true } = {}) {
  const lines = transcriptText.split('\n').filter((l) => l.trim() !== '');
  let parsed = 0;
  let assistant = 0;
  let index = 0;
  const found = [];
  const consider = (text, source) => {
    if (typeof text !== 'string') return;
    const key = markerLine(text, marker);
    if (key === null) return;
    const previous = found[found.length - 1];
    if (merge && previous && !previous.merged && previous.source !== source && previous.key === key && index - previous.index <= MERGE_WINDOW) {
      found[found.length - 1] = { text: text.length > previous.text.length ? text : previous.text, source, key, index: previous.index, merged: true };
      return;
    }
    found.push({ text, source, key, index, merged: false });
  };
  for (const line of lines) {
    let entry;
    try { entry = JSON.parse(line); } catch { continue; }
    parsed += 1;
    const msg = entry?.message;
    if (!msg || !Array.isArray(msg.content)) continue;
    index += 1;
    if (msg.role !== 'assistant') continue;
    assistant += 1;
    for (const block of msg.content) {
      if (block?.type === 'text') consider(block.text, 'text');
      else if (block?.type === 'tool_use' && block.name === 'SendMessage') consider(block.input?.message, 'send');
    }
  }
  if (parsed === 0) throw new Error('no parseable JSON line in the transcript');
  if (assistant === 0) throw new Error(`${parsed} line(s) parsed, none with message.role === 'assistant' — the transcript format may have changed`);
  return found.map((r) => r.text);
}

/** The last report carrying `marker`, or null when none does; throws as `reports` does. */
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
    const user = (text) => entry('user', [{ type: 'text', text }]);
    const FIRST = '# Report\n\nfirst draft';
    const FINAL = '# Report\n\nfinal text, no trailing newline';
    const transcript = [
      user('# Report — not this one, wrong role'),
      entry('assistant', [{ type: 'text', text: FIRST }]),
      '{"partial": tru',
      'null',
      entry('assistant', [{ type: 'tool_use', name: 'Read', input: {} }, { type: 'text' }, { type: 'text', text: 'interim text without the marker' }]),
      entry('assistant', [{ type: 'text', text: 'I will answer in the form the lead asked for, beginning # Report and then the findings.' }]),
      entry('assistant', [{ type: 'text', text: 'Quoting the earlier round:\n\n    # Report\n    first draft\n\nis not a report of my own.' }]),
      entry('assistant', [{ type: 'text', text: FINAL }]),
    ].join('\n');
    check('picks the LAST report with the marker', lastReport(transcript, '# Report') === FINAL);
    check('reports: every carrying block, in order', JSON.stringify(reports(transcript, '# Report')) === JSON.stringify([FIRST, FINAL]));
    check('a block that mentions the marker mid-line, or quotes it indented, is not a report', !carries('I will begin with # Report and then', '# Report') && !carries('    # Report\n', '# Report') && carries('# Report  \nbody', '# Report') && markerLine('# Report  \nbody', '# Report') === '# Report');
    check('a user block with the marker is not a report', lastReport([user('# Report'), entry('assistant', [{ type: 'text', text: 'x' }])].join('\n'), '# Report') === null);
    check('marker absent → null', lastReport(transcript, '# Elsewhere') === null);
    // Reports through SendMessage: the measured shape is a short summary sent first and the full
    // text written one user turn later under the same marker line — one round, the longer kept.
    // Marker lines differ between rounds, as real `GATE: blocking=N …` lines do.
    const SUMMARY = '# Report: 2 blocking\n\nsummary sent first';
    const FULL = '# Report: 2 blocking\n\nthe full report, written as text after the lead asked for it';
    const SENT_ONLY = '# Report: 1 blocking\n\nsent through SendMessage only';
    const send = (message) => entry('assistant', [{ type: 'tool_use', name: 'SendMessage', input: { to: 'lead', message } }]);
    const viaSend = [
      send(SUMMARY),
      user('please write the full report as text'),
      entry('assistant', [{ type: 'text', text: FULL }]),
      send(SENT_ONLY),
      entry('assistant', [{ type: 'tool_use', name: 'Write', input: { file_path: 'x', content: '# Report\n\nnot a message' } }]),
      entry('assistant', [{ type: 'text', text: FIRST }]),
      send(FIRST),
    ].join('\n');
    check('a summary sent, then the full text under the same marker line two messages later, is ONE round and the longer is kept; a send with no text counterpart counts; an exact duplicate counts once; other tool calls never count',
      JSON.stringify(reports(viaSend, '# Report')) === JSON.stringify([FULL, SENT_ONLY, FIRST]));
    check('--raw: the unmerged sequence', reports(viaSend, '# Report', { merge: false }).length === 5);
    const twoTexts = [
      entry('assistant', [{ type: 'text', text: '# Report\nconfirm, round 7' }]),
      entry('assistant', [{ type: 'text', text: '# Report\nconfirm, round 8' }]),
    ].join('\n');
    check('two consecutive TEXT reports with the same marker line stay two rounds', reports(twoTexts, '# Report').length === 2);
    const farApart = [
      send(SUMMARY),
      user('1'), user('2'), user('3'), user('4'),
      entry('assistant', [{ type: 'text', text: FULL }]),
    ].join('\n');
    check('the same marker line from different sources beyond MERGE_WINDOW messages is two rounds', reports(farApart, '# Report').length === 2);
    const nearApart = [
      send(SUMMARY),
      user('1'), user('2'), user('3'),
      entry('assistant', [{ type: 'text', text: FULL }]),
    ].join('\n');
    check('… and at exactly MERGE_WINDOW apart it is one', reports(nearApart, '# Report').length === 1);
    const triple = [send(SUMMARY), entry('assistant', [{ type: 'text', text: FULL }]), send(SUMMARY)].join('\n');
    check('a round merges at most once: send, text, send with one line is two rounds', reports(triple, '# Report').length === 2);
    const differentLines = [send('# Report A\nsent'), entry('assistant', [{ type: 'text', text: '# Report B\nwritten' }])].join('\n');
    check('different marker lines never merge, whatever the sources', reports(differentLines, '# Report').length === 2);
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

    // --nth, --count, --raw.
    const nth1 = join(dir, 'nth1.md');
    check('cli: --nth 1 → the first report', main([t, '# Report', nth1, '--nth', '1'], quiet) === 0 && readFileSync(nth1, 'utf8') === FIRST);
    const nth2 = join(dir, 'nth2.md');
    check('cli: --nth 2 → the second, flag before the positionals too', main(['--nth', '2', t, '# Report', nth2], quiet) === 0 && readFileSync(nth2, 'utf8') === FINAL);
    check('cli: --nth 02 is 2', main(['--nth', '02', t, '# Report', nth2], quiet) === 0 && readFileSync(nth2, 'utf8') === FINAL);
    check('cli: --nth past the end → 1, nothing written', main([t, '# Report', join(dir, 'nth3.md'), '--nth', '3'], quiet) === 1);
    check('cli: --nth 0, negative, non-numeric, missing → 2', ['0', '-1', 'two', '1.5'].every((v) => main([t, '# Report', out, '--nth', v], quiet) === 2) && main([t, '# Report', out, '--nth'], quiet) === 2);
    const printed = [];
    const capture = { log(s) { printed.push(String(s)); }, error() {} };
    check('cli: --count prints the round count, exit 0', main([t, '# Report', '--count'], capture) === 0 && printed.at(-1) === '2');
    printed.length = 0;
    check('cli: --count with no carrying block prints 0, exit 0', main([t, '# Elsewhere', '--count'], capture) === 0 && printed.at(-1) === '0');
    printed.length = 0;
    check('cli: --count on an unsearchable transcript → 2, prints nothing', main([garbage, '# Report', '--count'], capture) === 2 && main([moved, '# Report', '--count'], capture) === 2 && printed.length === 0);
    check('cli: --count with an out path, or with --nth → 2', main([t, '# Report', out, '--count'], quiet) === 2 && main([t, '# Report', '--count', '--nth', '1'], quiet) === 2);
    check('cli: an unknown flag → 2', main([t, '# Report', out, '--last'], quiet) === 2);
    const v = join(dir, 'via-send.jsonl');
    writeFileSync(v, viaSend);
    printed.length = 0;
    check('cli: --count merges by default; --raw does not', main(['--count', v, '# Report'], capture) === 0 && printed.at(-1) === '3' && main(['--count', '--raw', v, '# Report'], capture) === 0 && printed.at(-1) === '5');
    const raw2 = join(dir, 'raw2.md');
    check('cli: --raw --nth 2 is the full text that the merge would have folded into round 1', main(['--raw', '--nth', '2', v, '# Report', raw2], quiet) === 0 && readFileSync(raw2, 'utf8') === FULL);
    // `--` ends the flags: a marker that begins with `--` is reachable.
    const dashed = join(dir, 'dashed.jsonl');
    writeFileSync(dashed, entry('assistant', [{ type: 'text', text: '--verdict: fine' }]));
    printed.length = 0;
    check('cli: -- ends the flags, so a marker beginning with -- is reachable', main(['--count', '--', dashed, '--verdict'], capture) === 0 && printed.at(-1) === '1' && main([dashed, '--verdict', out], quiet) === 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(`agent-report --verify: ${checks.length - failed}/${checks.length} checks passed`);
  return failed ? 1 : 0;
}

const USAGE = 'Usage: node tools/agent-report.mjs [--nth N] [--raw] [--] <transcript.jsonl> <marker> <out.md> | --count [--raw] [--] <transcript.jsonl> <marker> | --verify';

function main(argv, io = console) {
  if (argv[0] === '--verify') return verify();
  const positional = [];
  let nth = null;
  let count = false;
  let raw = false;
  let flagsEnded = false;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (flagsEnded || !arg.startsWith('--')) {
      positional.push(arg);
    } else if (arg === '--') {
      flagsEnded = true;
    } else if (arg === '--count') {
      count = true;
    } else if (arg === '--raw') {
      raw = true;
    } else if (arg === '--nth') {
      const value = argv[i + 1];
      if (!/^[0-9]+$/.test(value ?? '') || Number(value) < 1) { io.error(USAGE); return 2; }
      nth = Number(value);
      i += 1;
    } else {
      io.error(USAGE);
      return 2;
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
    all = reports(text, marker, { merge: !raw });
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
      ? `agent-report: no report carrying ${JSON.stringify(marker)} in ${transcript}`
      : `agent-report: ${all.length} report(s) carry ${JSON.stringify(marker)} in ${transcript}; --nth ${nth} asked for one that does not exist`);
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
