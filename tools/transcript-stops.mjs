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
 * Why fields, not text: a subagent that reads material holding the runtime's own stop strings (a
 * CLI binary's string pool, another transcript, a page quoting one) carries them into its tool
 * results at any offset, offset 0 included. A clean transcript measured here has a tool_result
 * whose text BEGINS with the stop notice. So every signal below is a field, with one exception the
 * maintainer chose on 2026-10-29: the 2.1.281 notice carries no field to read, so it is matched by
 * its opening words, and only on an isMeta record, which the runtime writes and an agent's tool
 * output never becomes. The signals, as Claude Code writes them (read 2026-10-28 over transcripts
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
 *                refusal by message id. Or, the one text match, an isMeta record whose string
 *                content starts with NOTICE_PREFIX, the shape 2.1.281 wrote: printed
 *                `notice@<line>(text)` and linked to the refusal before it.
 *   interrupted  a `user` record with toolDenialKind "interrupted": a tool call the stop cut
 *                off, linked to its refusal through sourceToolAssistantUUID.
 *   api-error    any other API-error record, by its `error` field. rate_limit and server_error
 *                are the kinds measured (a session or credit limit, a lost connection, an
 *                unreachable API) and are transient. Any other kind is printed verbatim and is
 *                not transient: an invalid_request with no refusal on it, for one, could be a
 *                request too long as easily as a flag.
 *   denial       any other toolDenialKind, printed with its cause (denialCause): for
 *                permission-rule, the permissionDecision's reasonType. A hook, a config rule or
 *                a subcommand rule refused one tool call, mostly a nudge such as grep to rg, and
 *                decides nothing on a unit that returned; neither does a permission-rule record
 *                old enough to carry no decision. A safetyCheck (a dangerousRemoval circuit
 *                breaker among them), a user-rejected call and any cause not measured make the
 *                transcript undetermined, so the lead reads it: the maintainer's call, 2026-10-29.
 *                Beside any denial, transient API errors do not make an agent that did not
 *                return transient: Step 8's transient is "and nothing else".
 *
 * Only `assistant` and `user` records are read. The runtime writes other types beside them, none
 * a turn: `api-request-blob` records, for one, are copies of earlier messages sent again with the
 * next request, measured to carry `role` and `content` and no stop field. Read as turns, they would
 * move how a transcript ended, and one carrying a turn's fields would be counted twice.
 *
 * Verdicts, first match wins:
 *   stop          a refusal, a flagged API error, a notice or an interrupt. Any one is enough.
 *                 A refusal's companions depend on the version and the turn: 2.1.281 wrote the
 *                 notice without a refusedMessageId, and a turn refused while only thinking has
 *                 no tool call to interrupt. And a companion whose refusal is missing is still a
 *                 stop, since Step 8 calls a stop or interrupt notice the runtime wrote a stop;
 *                 its signal links to `?` so the missing refusal stays visible.
 *   undetermined  an API-error kind not listed above; a denial that is not informational; no
 *                 assistant record at all; a line that is not a JSON object (a record cut short,
 *                 a transcript still being written), which could have held any signal; an agent
 *                 that did not return with transient errors and a denial; or an agent that did
 *                 not return and shows no other signal (the skill's "Otherwise": the cause is not
 *                 established).
 *   transient     transient API errors and nothing else.
 *   clean         none of the above.
 *
 * The text match reads only a string-content isMeta record, the shape measured. The same words
 * in a tool_result, in an agent's text or in a non-meta user record are not a notice.
 *
 * The tool reports and writes nothing. The lead writes the STOP and NORESULT lines with the
 * skill's own snippets. The label printed is the one the run gave the agent (a unit id, or
 * `verify <unit>#<n>`); mapping it to an id is the lead's job, not this tool's.
 *
 * Usage:
 *   node tools/transcript-stops.mjs [--] <workflow-run-dir>       journal.jsonl plus agent-<id>.jsonl
 *   node tools/transcript-stops.mjs [--] <transcript.jsonl>...    an Agent-tool subagent's, or any file
 *   node tools/transcript-stops.mjs --verify
 *
 * Output: one tab-separated line per transcript (verdict, label, agent id, result, how it ended,
 * the signals with their line numbers, the path), then a summary line. The result is yes or no
 * from the run's journal, which a transcript passed as a file is looked up in too. With no
 * journal naming the agent it is inferred, and printed yes(ended) or no(ended): an agent
 * returned when its transcript ends at end_turn, as every finished Agent-tool transcript measured
 * does; one that died on an error, or is still running, ends anywhere else.
 *
 * Read a run after it has finished. An agent still running has no result yet and reads as
 * undetermined, which is what a sweep measured on a run that was live in another session.
 *
 * Exit 0: every transcript read, each clean or transient, and every agent returned, by its journal
 * or by its ending. 1: at least one stop or undetermined, or an agent that did not return. 2:
 * could not look — a usage error, an unreadable path, a directory with no
 * journal.jsonl, a journal that started no agent, a journal with a line that does not parse (a
 * started or result record may be among them), a journal agent id that is not a plain file name
 * (it would be joined into a path), a started agent with no transcript, or a
 * transcript with no parseable line or no assistant or user record carrying a message role (the
 * format having moved). Exit 2 is never a pass, and the lines it could print are printed first:
 * on exit 2, read every line, since a stop may be among them.
 *
 * The format belongs to another program and moves. The self-test pins the shapes measured, not
 * the runtime. Its fixtures are synthetic records, most in the shapes measured; a few are
 * defensive variants of shapes not seen (a flagged record with no refusal beside it, a blob
 * carrying a turn's fields), and their checks say so. No real transcript is copied: real ones
 * carry other work's content, and a stopped turn's content is what Step 8 forbids reproducing.
 * So a runtime that renamed a stop field would make every stop read clean here, with the
 * self-test still green. After a runtime upgrade, run the tool on a transcript known to hold a
 * stop, and see it read `stop`, before trusting a `clean`. To put that where the reader looks, a
 * line before the summary counts the transcripts written by a version outside MEASURED_VERSIONS
 * (or recording none); it changes no verdict and no exit code.
 */

import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, statSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const TRANSIENT_ERRORS = new Set(['rate_limit', 'server_error']);
/** The Claude Code versions the shapes here were read over; a transcript outside them is warned about. */
export const MEASURED_VERSIONS = ['2.1.278', '2.1.312'];

/** Whether a version string falls outside MEASURED_VERSIONS, compared part by part as numbers; an unreadable one does. */
export function outsideMeasured(version) {
  const parts = (v) => (/^\d+\.\d+\.\d+$/.test(v) ? v.split('.').map(Number) : null);
  const [v, low, high] = [parts(String(version)), ...MEASURED_VERSIONS.map(parts)];
  if (v === null) return true;
  const cmp = (a, b) => {
    for (let i = 0; i < 3; i += 1) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    return 0;
  };
  return cmp(v, low) < 0 || cmp(v, high) > 0;
}

/** The opening words of the runtime's stop notice, matched only on isMeta records (see the header). */
export const NOTICE_PREFIX = 'Your response above was stopped';
/** Denial causes that decide nothing on a unit that returned: routine refusals of one tool call. */
export const INFORMATIONAL_DENIALS = new Set(['hook', 'rule', 'subcommandResults', 'no-decision']);

/**
 * What a denial record says blocked the call. For `permission-rule`, the permissionDecision's
 * reasonType, with its circuit breaker when it names one (`safetyCheck/dangerousRemoval`), or
 * `no-decision` when the record carries none (the runtime added the field after 2.1.287).
 * Any other toolDenialKind is its own cause.
 */
export function denialCause(rec) {
  if (rec.toolDenialKind !== 'permission-rule') return rec.toolDenialKind;
  const decision = rec.permissionDecision;
  if (decision === null || typeof decision !== 'object') return 'no-decision';
  const type = typeof decision.reasonType === 'string' ? decision.reasonType : 'unknown';
  return typeof decision.circuitBreaker === 'string' ? `${type}/${decision.circuitBreaker}` : type;
}

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
  let lastRefusal = null; // the message id of the latest refusal, which a text-matched notice follows
  const uuidToMessageId = new Map();
  const flagged = [];
  const notices = [];
  const interrupts = [];
  const apiErrors = [];
  const denials = new Map(); // kind -> count
  const versions = new Set();
  const unparsed = []; // a line that is not a JSON object could have held any signal
  text.replace(/^\uFEFF/, '').split('\n').forEach((raw, index) => {
    if (raw.trim() === '') return;
    let rec;
    try { rec = JSON.parse(raw); } catch { unparsed.push(index + 1); return; }
    if (rec === null || typeof rec !== 'object' || Array.isArray(rec)) { unparsed.push(index + 1); return; }
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
        const kind = typeof rec.error === 'string' ? rec.error : JSON.stringify(rec.error) ?? 'undefined';
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
      if (msg.stop_reason === 'refusal') lastRefusal = id;
      return;
    }
    if (rec.isMeta !== true) ended = 'user-turn'; // a runtime reminder after the last turn does not end it
    if (typeof rec.refusedMessageId === 'string') notices.push({ line, ref: rec.refusedMessageId, text: false });
    else if (rec.isMeta === true && typeof msg.content === 'string' && msg.content.startsWith(NOTICE_PREFIX)) notices.push({ line, ref: lastRefusal, text: true });
    if (typeof rec.toolDenialKind === 'string') {
      if (rec.toolDenialKind === 'interrupted') interrupts.push({ line, source: rec.sourceToolAssistantUUID });
      else {
        const cause = denialCause(rec);
        denials.set(cause, (denials.get(cause) ?? 0) + 1);
      }
    }
  });
  if (parsed === 0) throw new Error('no parseable JSON line');
  if (withRole === 0) throw new Error(`${parsed} line(s) parsed, no assistant or user record carrying a message role — the transcript format may have moved`);
  return { refusals, flagged, notices, interrupts, apiErrors, denials, uuidToMessageId, assistantRecords, ended, versions, unparsed };
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
  for (const n of s.notices) signals.push(`notice@${n.line}${n.text ? '(text)' : ''}->${refusalLine(n.ref) ?? '?'}`);
  for (const x of s.interrupts) signals.push(`interrupted@${x.line}->${refusalLine(s.uuidToMessageId.get(x.source)) ?? '?'}`);
  for (const e of s.apiErrors) signals.push(`api-error@${e.line}:${e.kind}`);
  for (const [cause, count] of s.denials) signals.push(`denial:${cause}x${count}`);
  if (s.assistantRecords === 0) signals.push('no-assistant-record');
  if (s.unparsed.length > 0) signals.push(`unparsed@${s.unparsed.slice(0, 5).join(',')}${s.unparsed.length > 5 ? `+${s.unparsed.length - 5}` : ''}`);
  let verdict;
  if (s.refusals.size > 0 || s.flagged.length > 0 || s.notices.length > 0 || s.interrupts.length > 0) verdict = 'stop';
  else if (s.assistantRecords === 0 || s.unparsed.length > 0
    || s.apiErrors.some((e) => !TRANSIENT_ERRORS.has(e.kind))
    || [...s.denials.keys()].some((cause) => !INFORMATIONAL_DENIALS.has(cause))) verdict = 'undetermined';
  // "Transient and nothing else": beside a denial, an agent that did not return is not released.
  else if (s.apiErrors.length > 0) verdict = s.denials.size > 0 && result !== 'yes' ? 'undetermined' : 'transient';
  else verdict = result === 'no' ? 'undetermined' : 'clean';
  return { verdict, signals };
}

class LookError extends Error {}

/**
 * The agents a Workflow run's journal started, as `{ agents, unparsed }`: a Map of agent id ->
 * { label, result }, and the line numbers that are not JSON objects, any of which could have been
 * a started or result record.
 */
export function readJournal(text) {
  const agents = new Map();
  const unparsed = [];
  text.replace(/^\uFEFF/, '').split('\n').forEach((raw, index) => {
    if (raw.trim() === '') return;
    let rec;
    try { rec = JSON.parse(raw); } catch { unparsed.push(index + 1); return; }
    if (rec === null || typeof rec !== 'object' || Array.isArray(rec)) { unparsed.push(index + 1); return; }
    if (typeof rec.agentId !== 'string') return;
    if (rec.type === 'started') {
      // A second started (a resumed run) keeps the result; one after its result supplies the label.
      const label = typeof rec.label === 'string' ? rec.label : '';
      const agent = agents.get(rec.agentId);
      if (!agent) agents.set(rec.agentId, { label, result: false });
      else if (agent.label === '') agent.label = label;
    } else if (rec.type === 'result') {
      const agent = agents.get(rec.agentId);
      if (agent) agent.result = true;
      else agents.set(rec.agentId, { label: '', result: true });
    }
  });
  return { agents, unparsed };
}

/**
 * The transcripts to read, as `{ list, problems }`: each { path, label, id, result }, and the
 * journal problems that make the run exit 2 after its lines are printed. Throws LookError when a
 * run cannot be looked at at all.
 */
function targets(paths) {
  const problems = [];
  const journalProblem = (path, unparsed) => {
    if (unparsed.length > 0) problems.push(`${path}: line(s) ${unparsed.join(',')} do not parse, and a started or result record may be among them`);
  };
  const kinds = paths.map((p) => {
    try { return statSync(p).isDirectory() ? 'dir' : 'file'; } catch { throw new LookError(`${p}: no such file or directory`); }
  });
  if (kinds.includes('dir')) {
    if (paths.length !== 1) throw new LookError('a run directory is read alone; pass one directory, or transcript files only');
    const dir = paths[0];
    let journal;
    try { journal = readFileSync(join(dir, 'journal.jsonl'), 'utf8'); } catch { throw new LookError(`${dir}: no readable journal.jsonl — not a Workflow run directory; pass an Agent-tool transcript as a file`); }
    const { agents, unparsed } = readJournal(journal);
    journalProblem(join(dir, 'journal.jsonl'), unparsed);
    if (agents.size === 0) throw new LookError(`${dir}/journal.jsonl: no agent started${unparsed.length ? ` (line(s) ${unparsed.join(',')} do not parse)` : ''}`);
    // An agent id becomes part of a path, so one that is not a plain name is refused, not joined.
    const plain = /^[A-Za-z0-9_-]+$/;
    for (const id of agents.keys()) if (!plain.test(id)) problems.push(`${dir}/journal.jsonl: agent id ${JSON.stringify(id)} is not a plain file name; its transcript was not read`);
    const list = [...agents].filter(([id]) => plain.test(id)).map(([id, a]) => ({ path: join(dir, `agent-${id}.jsonl`), label: a.label, id, result: a.result ? 'yes' : 'no' }));
    // Node's readdirSync already lists names in order (libuv sorts them), so this sort cannot be
    // shown wrong by a test; it keeps the order a property of this tool rather than of libuv.
    for (const name of readdirSync(dir).sort()) {
      const m = /^agent-(.+)\.jsonl$/.exec(name);
      if (m && !agents.has(m[1])) list.push({ path: join(dir, name), label: '(unjournaled)', id: m[1], result: '?' });
    }
    return { list, problems };
  }
  // A workflow agent's transcript passed as a file still has its run's journal beside it.
  const journals = new Map();
  const list = paths.map((p) => {
    const m = /(?:^|[\\/])agent-([^\\/]+)\.jsonl$/.exec(p);
    const id = m ? m[1] : '-';
    const dir = dirname(p);
    if (!journals.has(dir)) {
      let journal = null;
      try { journal = readJournal(readFileSync(join(dir, 'journal.jsonl'), 'utf8')); } catch { /* no journal: an Agent-tool transcript */ }
      if (journal) journalProblem(join(dir, 'journal.jsonl'), journal.unparsed);
      journals.set(dir, journal?.agents ?? null);
    }
    const agent = journals.get(dir)?.get(id);
    return agent ? { path: p, label: agent.label, id, result: agent.result ? 'yes' : 'no' } : { path: p, label: '', id, result: '?' };
  });
  return { list, problems };
}

const clean = (s) => String(s).replace(/[\t\n\r]/g, ' ');

function run(paths, out = console) {
  let list;
  let problems;
  try { ({ list, problems } = targets(paths)); } catch (e) {
    if (e instanceof LookError) { out.error(`transcript-stops: ${e.message}`); return 2; }
    throw e;
  }
  const tally = new Map();
  let failures = 0;
  for (const problem of problems) out.error(`transcript-stops: ${problem}`);
  let noResult = 0;
  let inferredNo = 0;
  const unmeasured = new Set();
  let unmeasuredTranscripts = 0;
  for (const t of list) {
    let text;
    try { text = readFileSync(t.path, 'utf8'); } catch (e) {
      out.error(`transcript-stops: ${t.path}: no readable transcript (${e.code ?? e.message})${t.result === '?' ? '' : ` for started agent ${t.id}`}`);
      failures += 1;
      continue;
    }
    let scanned;
    try { scanned = scan(text); } catch (e) {
      out.error(`transcript-stops: ${t.path}: ${e.message}`);
      failures += 1;
      continue;
    }
    // With no journal to say, an agent returned when its transcript ends at end_turn: every
    // finished Agent-tool transcript measured does, and one that died or is still running does not.
    const outside = scanned.versions.size === 0 ? ['none recorded'] : [...scanned.versions].filter(outsideMeasured);
    if (outside.length > 0) { unmeasuredTranscripts += 1; for (const v of outside) unmeasured.add(v); }
    const inferred = t.result === '?';
    const result = inferred ? (scanned.ended === 'end_turn' ? 'yes' : 'no') : t.result;
    const { verdict, signals } = classify(scanned, { result });
    tally.set(verdict, (tally.get(verdict) ?? 0) + 1);
    if (result === 'no') noResult += 1;
    if (result === 'no' && inferred) inferredNo += 1;
    // Every column is cleaned: a record's own values (an error kind, a category, a stop reason) and
    // the path reach the output, and a tab or newline in one would shift or forge a row.
    const columns = [verdict, t.label || '-', t.id, `result=${result}${inferred ? '(ended)' : ''}`, `ended=${scanned.ended}`, signals.join(' ') || '-', t.path];
    out.log(columns.map(clean).join('\t'));
  }
  if (unmeasuredTranscripts > 0) {
    out.log(`transcript-stops: ${unmeasuredTranscripts} transcript(s) written by a version outside the measured ${MEASURED_VERSIONS.join(' to ')} (${clean([...unmeasured].sort().join(', '))}): run the tool on a transcript known to hold a stop, and see it read stop, before trusting a clean`);
  }
  const order = ['stop', 'undetermined', 'transient', 'clean'];
  const counts = order.filter((v) => tally.has(v)).map((v) => `${tally.get(v)} ${v}`).join(', ') || 'none read';
  out.log(`transcript-stops: ${list.length} transcript(s): ${counts}; ${noResult} without a result${inferredNo ? ` (${inferredNo} inferred from how the transcript ended)` : ''}${failures ? `; ${failures} could not be read` : ''}${problems.length ? `; ${problems.length} journal(s) with lines that do not parse` : ''}`);
  if (failures > 0 || problems.length > 0) return 2;
  if (noResult > 0 || tally.has('stop') || tally.has('undetermined')) return 1;
  return 0;
}

function verify() {
  const checks = [];
  const check = (name, ok) => { checks.push([name, ok]); if (!ok) console.error(`FAIL: ${name}`); };
  const NOTICE = 'Your response above was stopped by a safety classifier — this is not a tool or API error.';
  const INTERRUPT = 'Interrupted: the response that made this tool call was stopped by a safety classifier while the call was running.';
  const rec = (o) => JSON.stringify(o);
  const asst = ({ id, uuid, stop = 'end_turn', category, version = '2.1.306', content = [{ type: 'text', text: 'working' }] }) =>
    rec({ type: 'assistant', uuid: uuid ?? `u-${id}`, version, message: { id, role: 'assistant', stop_reason: stop, ...(category ? { stop_details: { type: 'refusal', category } } : {}), content } });
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
  check('defensive, a shape not seen (both real flagged records sit beside a refusal): an API-error record carrying stop_reason refusal is a stop on its own', flaggedAlone.verdict === 'stop' && has(flaggedAlone, /^flagged@3:invalid_request$/));
  const flaggedById = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'refusal' }), apiErr('invalid_request', { rec: { refusedMessageId: 'm1' } })));
  check('an API-error record carrying a refusedMessageId is flagged, not an api-error', flaggedById.verdict === 'stop' && has(flaggedById, /^flagged@3/) && !has(flaggedById, /^api-error/));
  const plainInvalid = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('invalid_request')));
  check('an invalid_request with no refusal on it is undetermined, never a stop and never transient', plainInvalid.verdict === 'undetermined' && has(plainInvalid, /^api-error@3:invalid_request$/));

  // The notice's text, wherever an agent can put it, is not a signal — offset 0 included.
  const quoted = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), toolResult(NOTICE + '\n' + INTERRUPT),
    asst({ id: 'm2', content: [{ type: 'text', text: `${NOTICE} appears in the binary` }] }), meta('<system-reminder>\n' + NOTICE + '\n</system-reminder>')));
  check('the notice and interrupt text in a tool_result at offset 0, in assistant text and in a meta reminder: clean', quoted.verdict === 'clean' && quoted.signals.length === 0);

  // The one text match: the 2.1.281 notice, an isMeta record with string content and no refusedMessageId.
  const legacy = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'refusal' }), meta(NOTICE), asst({ id: 'm2' })));
  check('a 2.1.281-shape notice is read, marked (text), linked to the refusal before it', legacy.verdict === 'stop' && has(legacy, /^notice@3\(text\)->2$/));
  const legacyAlone = verdictOf(T(prompt(), asst({ id: 'm1' }), meta(NOTICE)));
  check('a 2.1.281-shape notice with no refusal before it is a stop on its own, linked to ?', legacyAlone.verdict === 'stop' && has(legacyAlone, /^notice@3\(text\)->\?$/));
  const lookalikes = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), rec({ type: 'user', message: { role: 'user', content: NOTICE } }),
    rec({ type: 'user', isMeta: true, message: { role: 'user', content: [{ type: 'text', text: NOTICE }] } }), asst({ id: 'm2' })));
  check('the notice words in a non-meta user record, or in an isMeta record whose content is not a string, are not a notice', lookalikes.verdict === 'clean' && lookalikes.signals.length === 0);

  // Transient means transient and nothing else.
  check('rate_limit alone: transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('rate_limit'))).verdict === 'transient');
  check('server_error alone: transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error'))).verdict === 'transient');
  check('rate_limit beside a refusal: stop', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'refusal' }), apiErr('rate_limit'))).verdict === 'stop');
  check('rate_limit beside an orphan notice: a stop, not transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), meta(NOTICE, { refusedMessageId: 'gone' }), apiErr('rate_limit'))).verdict === 'stop');
  check('rate_limit beside an API-error kind not measured: undetermined, not transient', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('rate_limit'), apiErr('authentication_failed'))).verdict === 'undetermined');

  // Denials, by the cause the record names (permissionDecision, the measured shapes).
  const decided = (reasonType, extra = {}) => ({ toolDenialKind: 'permission-rule', permissionDecision: { decision: 'reject', source: reasonType === 'hook' ? 'hook' : 'config', reasonType, reason: 'why', ...extra } });
  const denialsIn = (...extras) => T(prompt(), ...extras.flatMap((x, i) => [asst({ id: `m${i}`, stop: 'tool_use' }), toolResult('denied', x)]), asst({ id: 'last' }));
  const nudges = verdictOf(denialsIn(decided('hook'), decided('hook', { reasonCode: 'hook:PreToolUse' }), decided('rule'), decided('subcommandResults'), { toolDenialKind: 'permission-rule' }));
  check('hook, config-rule, subcommand-rule and no-decision denials decide nothing on a returned unit, each printed with its cause', nudges.verdict === 'clean'
    && has(nudges, /^denial:hookx2$/) && has(nudges, /^denial:rulex1$/) && has(nudges, /^denial:subcommandResultsx1$/) && has(nudges, /^denial:no-decisionx1$/));
  const breaker = verdictOf(denialsIn(decided('hook'), decided('safetyCheck', { reasonCode: 'safetyCheck', circuitBreaker: 'dangerousRemoval' })), { result: 'yes' });
  check('a safetyCheck circuit breaker makes even a returned unit undetermined, printed apart from a hook', breaker.verdict === 'undetermined' && has(breaker, /^denial:safetyCheck\/dangerousRemovalx1$/) && has(breaker, /^denial:hookx1$/));
  check('a plain safetyCheck is undetermined', verdictOf(denialsIn(decided('safetyCheck')), { result: 'yes' }).verdict === 'undetermined');
  check('a user-rejected call is undetermined', verdictOf(denialsIn({ toolDenialKind: 'user-rejected' }), { result: 'yes' }).verdict === 'undetermined');
  check('a denial kind not measured is undetermined', verdictOf(denialsIn({ toolDenialKind: 'hook-blocked' })).verdict === 'undetermined');
  check('a permission-rule reasonType not measured is undetermined', verdictOf(denialsIn(decided('classifier'))).verdict === 'undetermined');
  const diedAfterNudge = T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), toolResult('denied', decided('hook')), apiErr('server_error'));
  check('transient errors beside a hook nudge: an agent that did not return is undetermined, never released as transient', verdictOf(diedAfterNudge, { result: 'no' }).verdict === 'undetermined');
  check('transient errors beside a hook nudge: an agent that returned stays transient', verdictOf(diedAfterNudge, { result: 'yes' }).verdict === 'transient');

  // Orphan companions.
  const orphanNotice = verdictOf(T(prompt(), asst({ id: 'm1' }), meta(NOTICE, { refusedMessageId: 'elsewhere' })));
  check('a notice whose refusal is not in the transcript: a stop, linked to ?', orphanNotice.verdict === 'stop' && has(orphanNotice, /^notice@3->\?$/));
  const orphanInterrupt = verdictOf(T(prompt(), asst({ id: 'm1', uuid: 'r1', stop: 'tool_use' }), toolResult(INTERRUPT, { toolDenialKind: 'interrupted', sourceToolAssistantUUID: 'r1' })));
  check('an interrupt whose source turn was not refused: a stop, linked to ?', orphanInterrupt.verdict === 'stop' && has(orphanInterrupt, /^interrupted@3->\?$/));

  // Records that are not assistant or user turns.
  const blobOnly = verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), blob({ id: 'm9', role: 'assistant', stop_reason: 'refusal', content: [] }),
    rec({ type: 'api-request-blob', isMeta: true, refusedMessageId: 'm9', toolDenialKind: 'interrupted', message: { role: 'user', content: NOTICE } }), asst({ id: 'm2' })));
  check('defensive, a shape not seen: api-request-blob records carrying a refused turn\'s and its companions\' fields are not read', blobOnly.verdict === 'clean' && blobOnly.signals.length === 0);
  const blobLast = T(prompt(), asst({ id: 'm1' }), rec({ type: 'api-request-blob', agentId: 'x', hash: 'h', sessionId: 's', message: { role: 'assistant', content: [{ type: 'text', text: 'earlier' }] } }));
  check('an api-request-blob in its measured shape (role and content only) after the last turn does not move how it ended', scan(blobLast).ended === 'end_turn');
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
  check('versions compare as numbers, ends included, and an unreadable one is outside',
    !outsideMeasured('2.1.278') && !outsideMeasured('2.1.312') && !outsideMeasured('2.1.300') && outsideMeasured('2.1.313') && outsideMeasured('2.1.40')
    && outsideMeasured('2.10.0') && outsideMeasured('1.9.999') && outsideMeasured('2.1') && outsideMeasured('next'));
  check('a runtime reminder (isMeta) after the last turn does not move how it ended', scan(T(prompt(), asst({ id: 'm1' }), meta('<system-reminder>x</system-reminder>'))).ended === 'end_turn');
  check('no signal and no result: undetermined (the cause is not established)', verdictOf(quiet, { result: 'no' }).verdict === 'undetermined');
  check('transient and no result: transient (the skill releases it once)', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error')), { result: 'no' }).verdict === 'transient');

  // Could not look.
  const throws = (text) => { try { scan(text); return false; } catch { return true; } };
  check('no parseable line: throws', throws('{"partial": tru\nnot json'));

  // A line that does not parse could have held any signal, so it is never read as clean.
  const cut = (line) => line.slice(0, -1);
  const corrupt = verdictOf(T(prompt(), cut(asst({ id: 'm1', stop: 'refusal' })), asst({ id: 'm2' })));
  check('a record cut short mid-file is undetermined, never clean, and names its line', corrupt.verdict === 'undetermined' && has(corrupt, /^unparsed@2$/));
  check('a truncated last line (a transcript still being written) is undetermined', verdictOf(T(prompt(), asst({ id: 'm1' }), cut(asst({ id: 'm2', stop: 'refusal' })))).verdict === 'undetermined');
  check('a line that parses to a non-object is unparsed too', has(verdictOf(T(prompt(), 'null', '[1]', asst({ id: 'm1' }))), /^unparsed@2,3$/));
  check('a stop beside an unparsed line is still a stop', verdictOf(T(prompt(), asst({ id: 'm1', stop: 'refusal' }), '{"x": tru')).verdict === 'stop');
  check('more than five unparsed lines are listed as five and a count', has(verdictOf(T(prompt(), asst({ id: 'm1' }), ...Array(7).fill('{'))), /^unparsed@3,4,5,6,7\+2$/));
  const bom = verdictOf('\uFEFF' + T(asst({ id: 'm1', stop: 'refusal' }), asst({ id: 'm2' })));
  check('a byte-order mark before line 1 is stripped, so a refusal there is read', bom.verdict === 'stop' && has(bom, /^refusal@1$/) && !has(bom, /^unparsed/));
  const journal = readJournal('\uFEFF' + T(rec({ type: 'started', agentId: 'j1', label: 'L' }), '{"type": "result", "agentId": "j1"'));
  check('a journal strips its byte-order mark and reports the lines that do not parse', journal.agents.get('j1')?.label === 'L' && JSON.stringify(journal.unparsed) === '[2]');
  const resumed = readJournal(T(rec({ type: 'started', agentId: 'k1', label: 'K' }), rec({ type: 'result', agentId: 'k1' }), rec({ type: 'started', agentId: 'k1', label: 'K2' }))).agents.get('k1');
  check('a second started after a result (a resumed run) keeps the result and the first label', resumed?.result === true && resumed?.label === 'K');
  const early = readJournal(T(rec({ type: 'result', agentId: 'k2' }), rec({ type: 'started', agentId: 'k2', label: 'L2' }))).agents.get('k2');
  check('a result before its started keeps the result and takes the label', early?.result === true && early?.label === 'L2');
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
    check('run dir: a transcript the journal never started is still read, labelled (unjournaled)', row('a9')[0] === 'clean' && row('a9')[1] === '(unjournaled)' && row('a9')[3] === 'result=yes(ended)');
    check('run dir: the summary counts every transcript and the missing result', /^transcript-stops: 4 transcript\(s\): 1 stop, 1 undetermined, 2 clean; 1 without a result$/.test(rows[rows.length - 1]));
    const green = runDir('green', [{ type: 'started', agentId: 'b1', label: 'U1' }, { type: 'result', agentId: 'b1', result: {} }, { type: 'started', agentId: 'b2', label: 'U2' }, { type: 'result', agentId: 'b2', result: {} }],
      { b1: CLEAN, b2: T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('rate_limit'), asst({ id: 'm2' })) });
    check('run dir: clean and transient agents that all returned exit 0', cli(green).status === 0);
    const unreturned = runDir('unreturned', [{ type: 'started', agentId: 'e1', label: 'U1' }], { e1: T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error')) });
    const r5 = cli(unreturned);
    check('run dir: a transient agent with no result exits 1 — the missing result alone decides it', r5.status === 1 && /^transient\tU1\te1\tresult=no\t/.test(r5.stdout));
    const gap = runDir('gap', [{ type: 'started', agentId: 'c1', label: 'U1' }, { type: 'started', agentId: 'c2', label: 'U2' }, { type: 'result', agentId: 'c1', result: {} }], { c1: CLEAN });
    const r3 = cli(gap);
    check('run dir: a started agent with no transcript exits 2, after printing the agents it could read', r3.status === 2 && /^clean\tU1/.test(r3.stdout) && /c2/.test(r3.stderr)
      && /; 1 could not be read$/.test(r3.stdout.trim()));
    const many = runDir('unjournaled', [{ type: 'started', agentId: 'h0', label: 'U0' }, { type: 'result', agentId: 'h0', result: {} }],
      Object.fromEntries(['h0', 'h5', 'h3', 'h1', 'h4', 'h2'].map((id) => [id, CLEAN]))); // created out of name order
    const unjournaledOrder = cli(many).stdout.split('\n').filter((l) => l.includes('(unjournaled)')).map((l) => l.split('\t')[2]).join(',');
    check('unjournaled transcripts are read in name order, whatever order the directory lists them in', unjournaledOrder === 'h1,h2,h3,h4,h5');
    const cutJournal = runDir('cutjournal', [{ type: 'started', agentId: 'g1', label: 'U1' }, { type: 'result', agentId: 'g1', result: {} }], { g1: CLEAN });
    writeFileSync(join(cutJournal, 'journal.jsonl'), readFileSync(join(cutJournal, 'journal.jsonl'), 'utf8') + '{"type":"started","agentId":"g2"');
    const r8 = cli(cutJournal);
    check('a journal line that does not parse exits 2, after the lines it could print, naming the line', r8.status === 2 && /^clean\tU1\tg1\t/.test(r8.stdout)
      && /journal\.jsonl: line\(s\) 3 do not parse/.test(r8.stderr) && /1 journal\(s\) with lines that do not parse$/.test(r8.stdout.trim()));
    const odd = runDir('oddid', [{ type: 'started', agentId: '../../x', label: 'U9' }, { type: 'started', agentId: 'i1', label: 'U1' }, { type: 'result', agentId: 'i1', result: {} }], { i1: CLEAN });
    const r10 = cli(odd);
    check('a journal agent id that is not a plain file name is refused, not joined into a path; the others are read', r10.status === 2
      && /agent id "\.\.\/\.\.\/x" is not a plain file name/.test(r10.stderr) && !/no readable transcript/.test(r10.stderr) && /^clean\tU1\ti1\t/.test(r10.stdout));
    const dirAsFile = runDir('dirasfile', [{ type: 'started', agentId: 'j9', label: 'U1' }, { type: 'result', agentId: 'j9', result: {} }], { j9: CLEAN });
    mkdirSync(join(dirAsFile, 'agent-zz.jsonl'));
    check('a read error names its code', /agent-zz\.jsonl: no readable transcript \(EISDIR\)/.test(cli(dirAsFile).stderr));
    const lookalike = join(dir, 'foo-agent-bar.jsonl');
    writeFileSync(lookalike, CLEAN);
    check('a file whose name only contains agent-<id> gets no id', /^clean\t-\t-\t/.test(cli(lookalike).stdout));
    check('a directory with no journal.jsonl exits 2', cli(runDir('nojournal', null, { d1: CLEAN })).status === 2);
    check('a journal that started no agent exits 2', cli(runDir('empty', [{ type: 'launched' }], {})).status === 2);
    const fileA = join(dir, 'agent-fa.jsonl');
    const fileB = join(dir, 'agent-fb.jsonl');
    writeFileSync(fileA, CLEAN);
    writeFileSync(fileB, T(prompt(), asst({ id: 'm1', stop: 'tool_use' }), apiErr('server_error')));
    const r4 = cli(fileA);
    check('a file with no journal, ending at end_turn: returned by its ending, exit 0', r4.status === 0 && /^clean\t-\tfa\tresult=yes\(ended\)\tended=end_turn\t/.test(r4.stdout));
    const r4b = cli(fileA, fileB);
    check('a file with no journal that died on a server error: transient, did not return by its ending, exit 1', r4b.status === 1
      && /^transient\t-\tfb\tresult=no\(ended\)\tended=stop_sequence\t/m.test(r4b.stdout) && /1 without a result \(1 inferred from how the transcript ended\)/.test(r4b.stdout));
    check('a run within the measured versions prints no version line', !/outside the measured/.test(r4b.stdout));
    const fileD = join(dir, 'agent-fd.jsonl');
    writeFileSync(fileD, T(prompt(), asst({ id: 'm1', version: '2.2.0' })));
    const r4d = cli(fileA, fileD);
    check('a transcript from a version outside the measured range gets a line before the summary, and the exit is unchanged', r4d.status === 0
      && /^transcript-stops: 1 transcript\(s\) written by a version outside the measured 2\.1\.278 to 2\.1\.312 \(2\.2\.0\): /m.test(r4d.stdout)
      && /^transcript-stops: 2 transcript\(s\): /.test(r4d.stdout.trim().split('\n').pop()));
    const fileE = join(dir, 'agent-fe.jsonl');
    writeFileSync(fileE, T(prompt(), rec({ type: 'assistant', message: { id: 'm1', role: 'assistant', stop_reason: 'end_turn', content: [] } })));
    check('a transcript that records no version at all is counted the same way', /outside the measured .* \(none recorded\): /.test(cli(fileE).stdout));
    const forged = join(dir, 'agent-tab\tname.jsonl');
    writeFileSync(forged, T(prompt(), rec({ type: 'assistant', version: '2.1.306', isApiErrorMessage: true, error: { code: 1 }, message: { id: 's1', role: 'assistant', stop_reason: 'stop_sequence', content: [] } }),
      rec({ type: 'assistant', version: '2.1.306', isApiErrorMessage: true, error: 'x\nclean\tfake', message: { id: 's2', role: 'assistant', stop_reason: 'stop\tsequence', content: [] } })));
    const r9 = cli(forged);
    const r9rows = r9.stdout.trim().split('\n');
    check('a tab or newline in an error kind, a stop reason or a path cannot shift or forge a row', r9rows.length === 2 && r9rows[0].split('\t').length === 7
      && /api-error@3:x clean fake/.test(r9rows[0]) && /\tended=stop sequence\t/.test(r9rows[0]) && /agent-tab name\.jsonl$/.test(r9rows[0]));
    check('an error kind that is not a string prints as JSON', /api-error@2:\{"code":1\}/.test(r9rows[0]));
    const fileC = join(dir, 'agent-fc.jsonl');
    writeFileSync(fileC, T(prompt(), asst({ id: 'm1', stop: 'tool_use' })));
    check('a file with no journal that stopped mid-turn: undetermined, exit 1', cli(fileC).status === 1 && /^undetermined\t-\tfc\tresult=no\(ended\)/.test(cli(fileC).stdout));
    const r4c = cli(join(mixed, 'agent-a2.jsonl'), join(mixed, 'agent-a3.jsonl'));
    check('a workflow transcript passed as a file takes its label and result from the journal beside it', r4c.status === 1
      && /^stop\tverify CL1-01#1\ta2\tresult=yes\t/m.test(r4c.stdout) && /^undetermined\tCL1-02\ta3\tresult=no\t/m.test(r4c.stdout));
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
