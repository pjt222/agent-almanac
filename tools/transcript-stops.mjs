#!/usr/bin/env node
/**
 * transcript-stops.mjs — read a run's subagent transcripts by structure, after the run, for the
 * stops an agent's own report does not admit.
 *
 * `skills/decompose-into-pointer-units` Step 8 asks the lead, after every run, to read the
 * transcript of every unit, verifier and critic the run launched "by structure, not by
 * substring": a report's `stop` field is the agent's own account of itself, and an agent refused
 * part way can finish its report and write `none`. For a subagent that returned nothing it asks
 * whether the cause was a stop, transient, or not established. The skill is runtime-agnostic and
 * leaves the runtime's notices to the brief. This tool is the instrument for one runtime, Claude
 * Code, and it reads record fields only.
 *
 * Why fields and never text: a subagent that reads material holding the runtime's own stop
 * strings (a CLI binary's string pool, another transcript, a page quoting one) carries them into
 * its tool results at any offset, offset 0 included. A clean transcript measured here has a
 * tool_result whose text BEGINS with the stop notice. So no signal below is a text match, not
 * even an anchored one. The signals, as Claude Code writes them (read 2026-10-28 over transcripts
 * written by 2.1.278 to 2.1.312; the stop records themselves by 2.1.281, 2.1.306 and 2.1.311):
 *
 *   refusal      an `assistant` record whose message.stop_reason is "refusal": the API's own
 *                verdict, message.stop_details.category naming the classifier. Counted once per
 *                message.id, since one turn can span several records.
 *   flagged      an API-error record (isApiErrorMessage) that carries a refusal itself, as
 *                message.stop_reason "refusal" or a refusedMessageId. Measured as error
 *                "invalid_request" on the synthetic record that ended an agent.
 *   notice       a `user` record carrying a refusedMessageId (the runtime writes it with
 *                isMeta): its "your response above was stopped" companion, linked to its
 *                refusal by message id.
 *   interrupted  a `user` record with toolDenialKind "interrupted": a tool call the stop cut
 *                off, linked to its refusal through sourceToolAssistantUUID.
 *   api-error    any other API-error record, by its `error` field. rate_limit and server_error
 *                are the kinds measured (a session or credit limit, a lost connection, an
 *                unreachable API) and are transient. Any other kind is printed verbatim and is
 *                not transient: an invalid_request with no refusal on it, for one, could be a
 *                request too long as easily as a flag.
 *   denial       any other toolDenialKind. permission-rule and user-rejected are counted and
 *                decide nothing: one tool call was refused and the agent went on. A kind not
 *                measured is undetermined.
 *
 * Only `assistant` and `user` records are read. `api-request-blob` records replay earlier blocks
 * into the next request, a refused turn among them, and would count each one twice.
 *
 * Verdicts, first match wins:
 *   stop          a refusal or a flagged API error. A refusal alone is enough, because its
 *                 companions depend on the version and the turn: 2.1.281 wrote the notice
 *                 without a refusedMessageId, and a turn refused while only thinking has no tool
 *                 call to interrupt.
 *   unconfirmed   a notice or an interrupt whose refusal is not in the transcript.
 *   undetermined  an API-error or denial kind not listed above; no assistant record at all; or,
 *                 in a run directory, an agent the journal started that has no result and no
 *                 other signal (the skill's "Otherwise": the cause is not established).
 *   transient     transient API errors and nothing else.
 *   clean         none of the above.
 *
 * Blind spot: a notice written in the 2.1.281 shape (isMeta, no refusedMessageId) is not
 * recognised, so an orphan one reads clean. Its refusal, when present, still makes the stop.
 *
 * The tool reports and writes nothing. The lead writes the STOP and NORESULT lines with the
 * skill's own snippets. The label printed is the one the run gave the agent (a unit id, or
 * `verify <unit>#<n>`); mapping it to an id is the lead's job, not this tool's.
 *
 * Usage:
 *   node tools/transcript-stops.mjs [--] <workflow-run-dir>       journal.jsonl plus agent-<id>.jsonl
 *   node tools/transcript-stops.mjs [--] <transcript.jsonl>...    an Agent-tool subagent's, no journal
 *   node tools/transcript-stops.mjs --verify
 *
 * Output: one tab-separated line per transcript (verdict, label, agent id, result: yes, no, or ?
 * outside a run directory, how it ended, the signals with their line numbers, the path), then a
 * summary line.
 *
 * Read a run after it has finished. An agent still running has no result yet and reads as
 * undetermined, which is what a sweep measured on a run that was live in another session.
 *
 * Exit 0: every transcript read, each clean or transient, and every agent the journal started
 * returned a result. 1: at least one stop, unconfirmed or undetermined, or an agent with no
 * result. 2: could not look — a usage error, an unreadable path, a directory with no
 * journal.jsonl, a journal that started no agent, a started agent with no transcript, or a
 * transcript with no parseable line or no assistant or user record carrying a message role (the
 * format having moved). Exit 2 is never a pass, and the lines it could print are printed first.
 *
 * The format belongs to another program and moves. The self-test pins the shapes measured, not
 * the runtime, and its fixtures are synthetic records in those shapes. No real transcript is
 * copied: real ones carry other work's content, and a stopped turn's content is what Step 8
 * forbids reproducing. So a runtime that renamed a stop field would make every stop read clean
 * here, with the self-test still green. After a runtime upgrade, run the tool on a transcript
 * known to hold a stop, and see it read `stop`, before trusting a `clean`.
 */

import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, statSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const TRANSIENT_ERRORS = new Set(['rate_limit', 'server_error']);
export const COUNTED_DENIALS = new Set(['permission-rule', 'user-rejected']);

/**
 * The signals in one transcript's text, as `{ refusals, flagged, notices, interrupts, apiErrors,
 * denials, uuidToMessageId, assistantRecords, ended, versions }`, every line number 1-based.
 * Throws when the transcript cannot be read at all: no line parses, or no `assistant` or `user`
 * record carries a message role.
 */
export function scan(text) {
  let parsed = 0;
  let withRole = 0;
  let assistantRecords = 0;
  let ended = null;
  const refusals = new Map(); // message id -> { line, category }
  const uuidToMessageId = new Map();
  const flagged = [];
  const notices = [];
  const interrupts = [];
  const apiErrors = [];
  const denials = new Map(); // kind -> count
  const versions = new Set();
  text.split('\n').forEach((raw, index) => {
    if (raw.trim() === '') return;
    let rec;
    try { rec = JSON.parse(raw); } catch { return; }
    if (rec === null || typeof rec !== 'object' || Array.isArray(rec)) return;
    parsed += 1;
    const line = index + 1;
    if (typeof rec.version === 'string') versions.add(rec.version);
    if (rec.type !== 'assistant' && rec.type !== 'user') return;
    const msg = rec.message;
    if (msg === null || typeof msg !== 'object' || typeof msg.role !== 'string') return;
    withRole += 1;
    if (rec.type === 'assistant') {
      assistantRecords += 1;
      ended = msg.stop_reason ?? 'mid-turn';
      if (rec.isApiErrorMessage === true) {
        const kind = typeof rec.error === 'string' ? rec.error : String(rec.error);
        if (msg.stop_reason === 'refusal' || typeof rec.refusedMessageId === 'string') flagged.push({ line, kind });
        else apiErrors.push({ line, kind });
        return;
      }
      const id = typeof msg.id === 'string' ? msg.id : `line-${line}`;
      if (typeof rec.uuid === 'string') uuidToMessageId.set(rec.uuid, id);
      if (msg.stop_reason === 'refusal' && !refusals.has(id)) {
        const category = msg.stop_details && typeof msg.stop_details.category === 'string' ? msg.stop_details.category : null;
        refusals.set(id, { line, category });
      }
      return;
    }
    ended = 'user-turn';
    if (typeof rec.refusedMessageId === 'string') notices.push({ line, ref: rec.refusedMessageId });
    if (typeof rec.toolDenialKind === 'string') {
      if (rec.toolDenialKind === 'interrupted') interrupts.push({ line, source: rec.sourceToolAssistantUUID });
      else denials.set(rec.toolDenialKind, (denials.get(rec.toolDenialKind) ?? 0) + 1);
    }
  });
  if (parsed === 0) throw new Error('no parseable JSON line');
  if (withRole === 0) throw new Error(`${parsed} line(s) parsed, no assistant or user record carrying a message role — the transcript format may have moved`);
  return { refusals, flagged, notices, interrupts, apiErrors, denials, uuidToMessageId, assistantRecords, ended, versions };
}

/**
 * The verdict for one scanned transcript and its signals as printable tokens. `result` is
 * 'yes' or 'no' when a journal says whether the agent returned, '?' otherwise.
 */
export function classify(s, { result = '?' } = {}) {
  const refusalLine = (id) => s.refusals.get(id)?.line;
  const signals = [];
  for (const r of s.refusals.values()) signals.push(`refusal@${r.line}${r.category ? `(${r.category})` : ''}`);
  for (const f of s.flagged) signals.push(`flagged@${f.line}:${f.kind}`);
  for (const n of s.notices) signals.push(`notice@${n.line}->${refusalLine(n.ref) ?? '?'}`);
  for (const x of s.interrupts) signals.push(`interrupted@${x.line}->${refusalLine(s.uuidToMessageId.get(x.source)) ?? '?'}`);
  for (const e of s.apiErrors) signals.push(`api-error@${e.line}:${e.kind}`);
  for (const [kind, count] of s.denials) signals.push(`denial:${kind}x${count}`);
  if (s.assistantRecords === 0) signals.push('no-assistant-record');
  let verdict;
  if (s.refusals.size > 0 || s.flagged.length > 0) verdict = 'stop';
  else if (s.notices.length > 0 || s.interrupts.length > 0) verdict = 'unconfirmed';
  else if (s.assistantRecords === 0
    || s.apiErrors.some((e) => !TRANSIENT_ERRORS.has(e.kind))
    || [...s.denials.keys()].some((kind) => !COUNTED_DENIALS.has(kind))) verdict = 'undetermined';
  else if (s.apiErrors.length > 0) verdict = 'transient';
  else verdict = result === 'no' ? 'undetermined' : 'clean';
  return { verdict, signals };
}

class LookError extends Error {}

/** The agents a Workflow run's journal started, as a Map of agent id -> { label, result }. */
export function readJournal(text) {
  const agents = new Map();
  for (const raw of text.split('\n')) {
    if (raw.trim() === '') continue;
    let rec;
    try { rec = JSON.parse(raw); } catch { continue; }
    if (rec === null || typeof rec !== 'object' || typeof rec.agentId !== 'string') continue;
    if (rec.type === 'started' && !agents.has(rec.agentId)) agents.set(rec.agentId, { label: typeof rec.label === 'string' ? rec.label : '', result: false });
    else if (rec.type === 'result') {
      const agent = agents.get(rec.agentId);
      if (agent) agent.result = true;
      else agents.set(rec.agentId, { label: '', result: true });
    }
  }
  return agents;
}

/** The transcripts to read, as { path, label, id, result }; throws LookError when a run cannot be looked at. */
function targets(paths) {
  const kinds = paths.map((p) => {
    try { return statSync(p).isDirectory() ? 'dir' : 'file'; } catch { throw new LookError(`${p}: no such file or directory`); }
  });
  if (kinds.includes('dir')) {
    if (paths.length !== 1) throw new LookError('a run directory is read alone; pass one directory, or transcript files only');
    const dir = paths[0];
    let journal;
    try { journal = readFileSync(join(dir, 'journal.jsonl'), 'utf8'); } catch { throw new LookError(`${dir}: no readable journal.jsonl — not a Workflow run directory; pass an Agent-tool transcript as a file`); }
    const agents = readJournal(journal);
    if (agents.size === 0) throw new LookError(`${dir}/journal.jsonl: no agent started`);
    const list = [...agents].map(([id, a]) => ({ path: join(dir, `agent-${id}.jsonl`), label: a.label, id, result: a.result ? 'yes' : 'no' }));
    for (const name of readdirSync(dir).sort()) {
      const m = /^agent-(.+)\.jsonl$/.exec(name);
      if (m && !agents.has(m[1])) list.push({ path: join(dir, name), label: '(unjournaled)', id: m[1], result: '?' });
    }
    return list;
  }
  return paths.map((p) => {
    const m = /agent-([^/]+)\.jsonl$/.exec(p);
    return { path: p, label: '', id: m ? m[1] : '-', result: '?' };
  });
}

const clean = (s) => String(s).replace(/[\t\n\r]/g, ' ');

function run(paths, out = console) {
  let list;
  try { list = targets(paths); } catch (e) {
    if (e instanceof LookError) { out.error(`transcript-stops: ${e.message}`); return 2; }
    throw e;
  }
  const tally = new Map();
  let failures = 0;
  let noResult = 0;
  for (const t of list) {
    let text;
    try { text = readFileSync(t.path, 'utf8'); } catch {
      out.error(`transcript-stops: ${t.path}: no readable transcript${t.result === '?' ? '' : ` for started agent ${t.id}`}`);
      failures += 1;
      continue;
    }
    let scanned;
    try { scanned = scan(text); } catch (e) {
      out.error(`transcript-stops: ${t.path}: ${e.message}`);
      failures += 1;
      continue;
    }
    const { verdict, signals } = classify(scanned, { result: t.result });
    tally.set(verdict, (tally.get(verdict) ?? 0) + 1);
    if (t.result === 'no') noResult += 1;
    out.log([verdict, clean(t.label || '-'), clean(t.id), `result=${t.result}`, `ended=${scanned.ended}`, signals.join(' ') || '-', t.path].join('\t'));
  }
  const order = ['stop', 'unconfirmed', 'undetermined', 'transient', 'clean'];
  const counts = order.filter((v) => tally.has(v)).map((v) => `${tally.get(v)} ${v}`).join(', ') || 'none read';
  out.log(`transcript-stops: ${list.length} transcript(s): ${counts}; ${noResult} without a result${failures ? `; ${failures} could not be read` : ''}`);
  if (failures > 0) return 2;
  if (noResult > 0 || ['stop', 'unconfirmed', 'undetermined'].some((v) => tally.has(v))) return 1;
  return 0;
}

function verify() {
  const checks = [];
  const check = (name, ok) => { checks.push([name, ok]); if (!ok) console.error(`FAIL: ${name}`); };
  const NOTICE = 'Your response above was stopped by a safety classifier — this is not a tool or API error.';
  const INTERRUPT = 'Interrupted: the response that made this tool call was stopped by a safety classifier while the call was running.';
  const rec = (o) => JSON.stringify(o);
  const asst = ({ id, uuid, stop = 'end_turn', category, content = [{ type: 'text', text: 'working' }] }) =>
    rec({ type: 'assistant', uuid: uuid ?? `u-${id}`, version: '2.1.306', message: { id, role: 'assistant', stop_reason: stop, ...(category ? { stop_details: { type: 'refusal', category } } : {}), content } });
  const toolResult = (text, extra = {}) => rec({ type: 'user', ...extra, message: { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't1', content: text, ...(extra.toolDenialKind ? { is_error: true } : {}) }] } });
  const prompt = () => rec({ type: 'user', message: { role: 'user', content: 'the brief' } });
  const meta = (content, extra = {}) => rec({ type: 'user', isMeta: true, ...extra, message: { role: 'user', content } });
  const apiErr = (kind, extra = {}) => rec({ type: 'assistant', isApiErrorMessage: true, error: kind, ...(extra.rec ?? {}), message: { id: `syn-${kind}`, role: 'assistant', model: '<synthetic>', stop_reason: extra.stop ?? 'stop_sequence', content: [{ type: 'text', text: 'API Error' }] } });
  const blob = (message) => rec({ type: 'api-request-blob', hash: 'h', message });
  const T = (...lines) => lines.join('\n');
  const verdictOf = (text, opts) => classify(scan(text), opts);
  const has = (r, re) => r.signals.some((s) => re.test(s));

  // The measured stop: a refused tool call, its interrupt and its notice, all linked.
  const full = verdictOf(T(prompt(), asst({ id: 'm1' }), asst({ id: 'm2', uuid: 'r2', stop: 'refusal', category: 'cyber', content: [{ type: 'tool_use', name: 'Write', input: {} }] }),
    toolResult(INTERRUPT, { toolDenialKind: 'interrupted', sourceToolAssistantUUID: 'r2' }), meta(NOTICE, { refusedMessageId: 'm2', turnCompanion: true }), asst({ id: 'm3' })));
  check('refusal + interrupt + notice: stop, each companion linked to the refusal line', full.verdict === 'stop'
    && has(full, /^refusal@3\(cyber\)$/) && has(full, /^interrupted@4->3$/) && has(full, /^notice@5->3$/));

  // A refusal alone is a stop: no notice (2.1.281 wrote none with an id), no tool call to interrupt.
  const lone = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'refusal', content: [{ type: 'thinking', thinking: '' }] }), asst({ id: 'm2' })));
  check('a lone refusal on a thinking-only turn, with no notice and no interrupt, is a stop', lone.verdict === 'stop' && lone.signals.length === 1);

  // A flagged API error: a stop with no refusal turn of its own, and beside one.
  const flaggedAlone = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('invalid_request', { stop: 'refusal' })));
  check('an API-error record carrying stop_reason refusal is a stop on its own', flaggedAlone.verdict === 'stop' && has(flaggedAlone, /^flagged@3:invalid_request$/));
  const flaggedById = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'refusal' }), apiErr('invalid_request', { rec: { refusedMessageId: 'm1' } })));
  check('an API-error record carrying a refusedMessageId is flagged, not an api-error', flaggedById.verdict === 'stop' && has(flaggedById, /^flagged@3/) && !has(flaggedById, /^api-error/));
  const plainInvalid = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('invalid_request')));
  check('an invalid_request with no refusal on it is undetermined, never a stop and never transient', plainInvalid.verdict === 'undetermined' && has(plainInvalid, /^api-error@3:invalid_request$/));

  // The notice's text, wherever an agent can put it, is not a signal — offset 0 included.
  const quoted = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), toolResult(NOTICE + '\n' + INTERRUPT),
    asst({ id: 'm2', content: [{ type: 'text', text: `${NOTICE} appears in the binary` }] }), meta('<system-reminder>\n' + NOTICE + '\n</system-reminder>')));
  check('the notice and interrupt text in a tool_result at offset 0, in assistant text and in a meta reminder: clean', quoted.verdict === 'clean' && quoted.signals.length === 0);

  // Transient means transient and nothing else.
  check('rate_limit alone: transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('rate_limit'))).verdict === 'transient');
  check('server_error alone: transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error'))).verdict === 'transient');
  check('rate_limit beside a refusal: stop', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'refusal' }), apiErr('rate_limit'))).verdict === 'stop');
  check('rate_limit beside an orphan notice: unconfirmed, not transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), meta(NOTICE, { refusedMessageId: 'gone' }), apiErr('rate_limit'))).verdict === 'unconfirmed');
  check('rate_limit beside an API-error kind not measured: undetermined, not transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('rate_limit'), apiErr('authentication_failed'))).verdict === 'undetermined');

  // Denials.
  const denied = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), toolResult('denied', { toolDenialKind: 'permission-rule' }),
    asst({ id: 'm2', stop: 'tool_use' }), toolResult('denied', { toolDenialKind: 'permission-rule' }), toolResult('no', { toolDenialKind: 'user-rejected' }), asst({ id: 'm3' })));
  check('permission-rule and user-rejected denials are counted and decide nothing', denied.verdict === 'clean' && has(denied, /^denial:permission-rulex2$/) && has(denied, /^denial:user-rejectedx1$/));
  check('a denial kind not measured is undetermined', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), toolResult('x', { toolDenialKind: 'hook-blocked' }), asst({ id: 'm2' }))).verdict === 'undetermined');

  // Orphan companions.
  const orphanNotice = verdictOf(T(prompt(), asst({ id: 'm1' }), meta(NOTICE, { refusedMessageId: 'elsewhere' })));
  check('a notice whose refusal is not in the transcript: unconfirmed, linked to ?', orphanNotice.verdict === 'unconfirmed' && has(orphanNotice, /^notice@3->\?$/));
  const orphanInterrupt = verdictOf(T(prompt(), asst({ id: 'm1', uuid: 'r1', stop: 'tool_use' }), toolResult(INTERRUPT, { toolDenialKind: 'interrupted', sourceToolAssistantUUID: 'r1' })));
  check('an interrupt whose source turn was not refused: unconfirmed, linked to ?', orphanInterrupt.verdict === 'unconfirmed' && has(orphanInterrupt, /^interrupted@3->\?$/));

  // Records that are not assistant or user turns.
  const blobOnly = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), blob({ id: 'm9', role: 'assistant', stop_reason: 'refusal', content: [] }),
    rec({ type: 'api-request-blob', isMeta: true, refusedMessageId: 'm9', toolDenialKind: 'interrupted', message: { role: 'user', content: NOTICE } }), asst({ id: 'm2' })));
  check('api-request-blob records replaying a refused turn and its companions are not read', blobOnly.verdict === 'clean' && blobOnly.signals.length === 0);
  const streamed = verdictOf(T(prompt(), asst({ id: 'm1', uuid: 'a', stop: 'refusal', content: [{ type: 'thinking', thinking: '' }] }),
    asst({ id: 'm1', uuid: 'b', stop: 'refusal', content: [{ type: 'tool_use', name: 'Write', input: {} }] }),
    toolResult(INTERRUPT, { toolDenialKind: 'interrupted', sourceToolAssistantUUID: 'b' }), blob({ id: 'm1', role: 'assistant', stop_reason: 'refusal', content: [] })));
  check('one refused turn over two records, plus its blob copy: ONE refusal, and the interrupt links through the second record', streamed.verdict === 'stop'
    && streamed.signals.filter((x) => x.startsWith('refusal@')).length === 1 && has(streamed, /^interrupted@4->2$/));

  // No assistant record; no result.
  const unanswered = verdictOf(T(prompt()));
  check('a transcript with no assistant record is undetermined, never clean', unanswered.verdict === 'undetermined' && has(unanswered, /^no-assistant-record$/));
  const quiet = T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), toolResult('ok'));
  check('no signal, result unknown: clean; ended at the user turn', verdictOf(quiet).verdict === 'clean' && scan(quiet).ended === 'user-turn');
  check('no signal and no result: undetermined (the cause is not established)', verdictOf(quiet, { result: 'no' }).verdict === 'undetermined');
  check('transient and no result: transient (the skill releases it once)', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error')), { result: 'no' }).verdict === 'transient');

  // Could not look.
  const throws = (text) => { try { scan(text); return false; } catch { return true; } };
  check('no parseable line: throws', throws('{"partial": tru\nnot json'));
  check('records with no assistant or user message role (format moved): throws', throws(T(rec({ type: 'api-request', id: 'x' }), rec({ type: 'model', message: { role: 'model', content: [] } }), rec({ type: 'user', message: { content: 'no role' } }))));

  // The CLI, end to end.
  const dir = mkdtempSync(join(tmpdir(), 'transcript-stops-'));
  const self = fileURLToPath(import.meta.url);
  const cli = (...args) => spawnSync(process.execPath, [self, ...args], { encoding: 'utf8' });
  try {
    const runDir = (name, journal, agents) => {
      const d = join(dir, name);
      mkdirSync(d);
      if (journal !== null) writeFileSync(join(d, 'journal.jsonl'), journal.map(rec).join('\n') + '\n');
      for (const [id, text] of Object.entries(agents)) writeFileSync(join(d, `agent-${id}.jsonl`), text);
      return d;
    };
    const CLEAN = T(prompt(), asst({ id: 'm1' }));
    const STOPPED = T(prompt(), asst({ id: 'm1', stop: 'refusal' }), asst({ id: 'm2' }));
    const mixed = runDir('mixed', [{ type: 'launched' }, { type: 'started', agentId: 'a1', label: 'CL1-01' }, { type: 'started', agentId: 'a2', label: 'verify CL1-01#1' },
      { type: 'started', agentId: 'a3', label: 'CL1-02' }, { type: 'result', agentId: 'a1', result: {} }, { type: 'result', agentId: 'a2', result: 'text' }],
    { a1: CLEAN, a2: STOPPED, a3: CLEAN, a9: CLEAN });
    const r1 = cli(mixed);
    const rows = r1.stdout.trim().split('\n');
    const row = (id) => rows.find((l) => l.split('\t')[2] === id)?.split('\t') ?? [];
    check('run dir: a stop and a no-result exit 1', r1.status === 1);
    check('run dir: one line per started agent, with its label and result', row('a1')[0] === 'clean' && row('a1')[1] === 'CL1-01' && row('a1')[3] === 'result=yes'
      && row('a2')[0] === 'stop' && row('a2')[1] === 'verify CL1-01#1' && row('a3')[0] === 'undetermined' && row('a3')[3] === 'result=no');
    check('run dir: a transcript the journal never started is still read, labelled (unjournaled)', row('a9')[0] === 'clean' && row('a9')[1] === '(unjournaled)' && row('a9')[3] === 'result=?');
    check('run dir: the summary counts every transcript and the missing result', /^transcript-stops: 4 transcript\(s\): 1 stop, 1 undetermined, 2 clean; 1 without a result$/.test(rows[rows.length - 1]));
    const green = runDir('green', [{ type: 'started', agentId: 'b1', label: 'U1' }, { type: 'result', agentId: 'b1', result: {} }, { type: 'started', agentId: 'b2', label: 'U2' }, { type: 'result', agentId: 'b2', result: {} }],
      { b1: CLEAN, b2: T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('rate_limit'), asst({ id: 'm2' })) });
    check('run dir: clean and transient agents that all returned exit 0', cli(green).status === 0);
    const unreturned = runDir('unreturned', [{ type: 'started', agentId: 'e1', label: 'U1' }], { e1: T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error')) });
    const r5 = cli(unreturned);
    check('run dir: a transient agent with no result exits 1 — the missing result alone decides it', r5.status === 1 && /^transient\tU1\te1\tresult=no\t/.test(r5.stdout));
    const gap = runDir('gap', [{ type: 'started', agentId: 'c1', label: 'U1' }, { type: 'started', agentId: 'c2', label: 'U2' }, { type: 'result', agentId: 'c1', result: {} }], { c1: CLEAN });
    const r3 = cli(gap);
    check('run dir: a started agent with no transcript exits 2, after printing the agents it could read', r3.status === 2 && /^clean\tU1/.test(r3.stdout) && /c2/.test(r3.stderr));
    check('a directory with no journal.jsonl exits 2', cli(runDir('nojournal', null, { d1: CLEAN })).status === 2);
    check('a journal that started no agent exits 2', cli(runDir('empty', [{ type: 'launched' }], {})).status === 2);
    const fileA = join(dir, 'agent-fa.jsonl');
    const fileB = join(dir, 'agent-fb.jsonl');
    writeFileSync(fileA, CLEAN);
    writeFileSync(fileB, T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error')));
    const r4 = cli(fileA, fileB);
    check('files: clean and transient exit 0, each line with result=?', r4.status === 0 && r4.stdout.split('\n').filter((l) => /\tresult=\?\t/.test(l)).length === 2);
    const broken = join(dir, 'broken.jsonl');
    writeFileSync(broken, '{"partial": tru');
    // Each refusal names its own reason: an exit code alone cannot tell them apart, since an
    // unparseable file would also fail the role check, and an unknown flag read as a path would
    // also be missing.
    const r6 = cli(fileA, broken);
    check('a transcript with no parseable line exits 2, saying so', r6.status === 2 && /broken\.jsonl: no parseable JSON line/.test(r6.stderr));
    const r7 = cli('--strict', fileA);
    check('an unknown flag exits 2 as a flag, not as a missing path', r7.status === 2 && /unknown flag --strict/.test(r7.stderr));
    check('no argument, a missing path, or a directory beside a file: exit 2',
      cli().status === 2 && cli(join(dir, 'absent.jsonl')).status === 2 && cli(green, fileA).status === 2);
    check('`--` ends the flags', cli('--', fileA).status === 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }

  const failed = checks.filter(([, ok]) => !ok).length;
  console.log(`transcript-stops --verify: ${checks.length - failed} of ${checks.length} checks passed`);
  return failed === 0 ? 0 : 1;
}

function main(argv) {
  if (argv.length === 1 && argv[0] === '--verify') return verify();
  const paths = [];
  let flagsDone = false;
  for (const arg of argv) {
    if (!flagsDone && arg === '--') { flagsDone = true; continue; }
    if (!flagsDone && arg.startsWith('--')) { console.error(`transcript-stops: unknown flag ${arg}`); return 2; }
    paths.push(arg);
  }
  if (paths.length === 0) {
    console.error('usage: node tools/transcript-stops.mjs [--] <workflow-run-dir> | <transcript.jsonl>...\n       node tools/transcript-stops.mjs --verify');
    return 2;
  }
  return run(paths);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exitCode = main(process.argv.slice(2));
