/**
 * tools-registry.js — read `tools/_registry.yml`, check it against disk, render its two views.
 *
 * WHY a hand-rolled reader instead of js-yaml: `validate-integrity.sh` runs without `npm ci`
 * (every checker it calls is dependency-free, by the constraint its workflow states), and the
 * parity check below is called from there. The registry is therefore constrained to the shape
 * this reader accepts — a flat list of entries whose every field is ONE line — and the reader
 * refuses (throws, with the line number) anything else rather than guessing: a block scalar
 * (`>-`, `|`), a nested key, an unknown field, a doubled field, an unknown top-level key, an
 * escape sequence inside a quoted value (YAML would decode it; this reader would keep it
 * verbatim and render it), an inline ` #` comment on an unquoted value (YAML would strip it).
 * The generator (`generate-readmes.js`) reads the same file through this same module, so the
 * two renderings cannot disagree about what a row says.
 *
 * Fields, in the order entries carry them (the librarian's design, 2026-09-08):
 *   id            kebab-case, equals the filename stem
 *   path          tools/<file>
 *   language      bash | python | node
 *   status        active | deprecated
 *   superseded_by id of an ACTIVE replacement, never itself; null unless deprecated
 *   description   neutral, name-first, one clause — the README table's column
 *   need          one need-first sentence ending in a full stop — the ONLY line CLAUDE.md renders
 *   not_for       optional: one clause naming the tool or gate this is confused with
 *   tag           optional: review | translation | measurement (a term covers ≥2 tools or is absent)
 *   invoke        one canonical example command
 *   verify        the exact self-test invocation, naming the path or the id
 *   verify_in_ci  true | false (false only with verify_skip_reason)
 *   verify_skip_reason  required iff verify_in_ci is false
 *   deps          free text or null
 *   promoted_from where the tool came from — a commit or PR, never a docstring anecdote
 *   issue         issue/PR numbers, or null
 * plus the top-level `total_tools`, the row count with deprecated rows included, checked.
 */

import { existsSync, readFileSync, readdirSync, lstatSync } from 'node:fs';
import { join } from 'node:path';

export const REGISTRY_PATH = 'tools/_registry.yml';
export const TOOLS_DIR = 'tools';
/** Entries under tools/ that are not tools: the exact set, not a prefix rule. */
export const NOT_TOOLS = new Set(['README.md', 'fixtures', '_registry.yml']);

export const FIELDS = [
  'id', 'path', 'language', 'status', 'superseded_by', 'description', 'need', 'not_for', 'tag',
  'invoke', 'verify', 'verify_in_ci', 'verify_skip_reason', 'deps', 'promoted_from', 'issue',
];
export const REQUIRED = ['id', 'path', 'language', 'status', 'description', 'need', 'invoke', 'verify', 'verify_in_ci'];
export const LANGUAGES = new Set(['bash', 'python', 'node']);
export const STATUSES = new Set(['active', 'deprecated']);
/** The closed tag vocabulary. The renderer's group order is derived from this set, so a tag added here renders. */
export const TAGS = new Set(['review', 'translation', 'measurement']);

/**
 * Strip one layer of matching quotes; leave an unquoted value as written. This reader interprets
 * NO escape sequences, so anything YAML would decode is refused instead of kept verbatim: a
 * backslash or an inner double quote inside a double-quoted value, an inner single quote inside a
 * single-quoted one. Rephrase the value, or switch the quote style so the inner character needs
 * no escape (`"It's fine."`, `'Say "hi".'`). An unquoted value carrying ` #` is refused too:
 * YAML reads that as a comment, this reader would keep it as part of the value.
 */
function unquote(raw) {
  const s = raw.trim();
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    const inner = s.slice(1, -1);
    if (inner.includes('\\') || inner.includes('"')) throw new Error('a backslash or a double quote inside a double-quoted value is an escape this reader does not interpret; rephrase, or use single quotes');
    return inner;
  }
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) {
    const inner = s.slice(1, -1);
    if (inner.includes("'")) throw new Error('a single quote inside a single-quoted value is an escape this reader does not interpret; rephrase, or use double quotes');
    return inner;
  }
  if (/\s#/.test(s)) throw new Error('an inline ` #` on an unquoted value is a comment to YAML and a value to this reader; quote the value or drop the comment');
  return s;
}

/**
 * Parse the registry text into `{ entries, declaredTotal }`. Throws on any shape this reader
 * does not accept, with the line number, so a refusal is never mistaken for an empty registry.
 * `declaredTotal` is the `total_tools:` scalar (null when absent) — read, not skipped, because
 * every other registry here carries a validated total and "a number no tool reads is
 * documentation drift" (CLAUDE.md § Ratcheting a Warn-Only Gate).
 */
export function parseRegistry(text) {
  const lines = text.split('\n');
  const entries = [];
  let declaredTotal = null;
  let current = null;
  let inList = false;
  lines.forEach((rawLine, i) => {
    const n = i + 1;
    const line = rawLine.replace(/\r$/, '');
    if (line.trim() === '' || line.trim().startsWith('#')) return;
    if (/^tools:\s*$/.test(line)) { inList = true; return; }
    if (!inList) {
      const top = /^([a-z_]+):\s*(.*)$/.exec(line);
      if (top && top[1] === 'total_tools') { declaredTotal = unquote(top[2]); return; }
      if (top) throw new Error(`${REGISTRY_PATH}:${n}: unknown top-level key \`${top[1]}\` (only \`total_tools\` and \`tools\`)`);
      throw new Error(`${REGISTRY_PATH}:${n}: expected \`total_tools:\` or \`tools:\`, got: ${line}`);
    }
    let m = /^  - ([a-z_]+):\s*(.*)$/.exec(line);
    if (m) {
      current = {};
      entries.push(current);
      setField(current, m[1], m[2], n);
      return;
    }
    m = /^    ([a-z_]+):\s*(.*)$/.exec(line);
    if (m && current) { setField(current, m[1], m[2], n); return; }
    throw new Error(`${REGISTRY_PATH}:${n}: not a one-line field of the current entry (block scalars, nesting and other indents are refused): ${line}`);
  });
  if (!inList) throw new Error(`${REGISTRY_PATH}: no \`tools:\` list`);
  return { entries, declaredTotal };
}

function setField(entry, key, value, n) {
  if (!FIELDS.includes(key)) throw new Error(`${REGISTRY_PATH}:${n}: unknown field \`${key}\``);
  if (key in entry) throw new Error(`${REGISTRY_PATH}:${n}: field \`${key}\` given twice in one entry`);
  if (/^[>|]/.test(value.trim())) throw new Error(`${REGISTRY_PATH}:${n}: block scalars are refused; write \`${key}\` on one line`);
  let v;
  try { v = unquote(value); } catch (err) { throw new Error(`${REGISTRY_PATH}:${n}: ${err.message}`); }
  entry[key] = v === 'null' || v === '' ? null : v;
}

/**
 * Every schema violation in `entries`, as `id: message` strings (empty when clean).
 * `declaredTotal` is the `total_tools:` scalar; it must equal the row count, deprecated rows
 * included, exactly as `total_skills` must — a bump that is forgotten is a red check, not a stale number.
 */
export function schemaErrors(entries, declaredTotal = undefined) {
  const errors = [];
  if (declaredTotal !== undefined) {
    if (declaredTotal === null) errors.push('registry: `total_tools` is missing');
    else if (String(entries.length) !== String(declaredTotal)) errors.push(`registry: \`total_tools\` is ${declaredTotal} but the list carries ${entries.length} row(s)`);
  }
  const seen = new Map();
  entries.forEach((e, i) => {
    const id = e.id ?? `(entry ${i + 1})`;
    for (const f of REQUIRED) if (e[f] === null || e[f] === undefined) errors.push(`${id}: missing required field \`${f}\``);
    if (e.id && seen.has(e.id)) errors.push(`${id}: duplicate id (also entry ${seen.get(e.id)})`);
    if (e.id) seen.set(e.id, i + 1);
    if (e.id && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) errors.push(`${id}: id is not kebab-case`);
    if (e.path && !e.path.startsWith(`${TOOLS_DIR}/`)) errors.push(`${id}: path does not start with \`${TOOLS_DIR}/\``);
    if (e.path && e.id && e.path.replace(/^tools\//, '').replace(/\.[^.]+$/, '') !== e.id) errors.push(`${id}: id does not equal the filename stem of \`${e.path}\``);
    if (e.language && !LANGUAGES.has(e.language)) errors.push(`${id}: language \`${e.language}\` is not one of ${[...LANGUAGES].join('|')}`);
    if (e.status && !STATUSES.has(e.status)) errors.push(`${id}: status \`${e.status}\` is not one of ${[...STATUSES].join('|')}`);
    if (e.status === 'deprecated' && !e.superseded_by) errors.push(`${id}: deprecated without \`superseded_by\``);
    if (e.status === 'active' && e.superseded_by) errors.push(`${id}: active with a \`superseded_by\` (only a deprecated row names a successor)`);
    if (e.tag && !TAGS.has(e.tag)) errors.push(`${id}: tag \`${e.tag}\` is not one of ${[...TAGS].join('|')}`);
    if (e.verify_in_ci !== undefined && e.verify_in_ci !== null && e.verify_in_ci !== 'true' && e.verify_in_ci !== 'false') errors.push(`${id}: verify_in_ci must be true or false`);
    if (e.verify_in_ci === 'false' && !e.verify_skip_reason) errors.push(`${id}: verify_in_ci is false without \`verify_skip_reason\``);
    if (e.verify_in_ci === 'true' && e.verify_skip_reason) errors.push(`${id}: verify_skip_reason given while verify_in_ci is true`);
    // The self-test must be about THIS tool: it names the path, or -- for a tool whose self-test
    // is a node:test suite beside the other suites -- its id (`scripts/test/<id>.test.js`).
    if (e.verify && e.path && e.id && !e.verify.includes(e.path) && !e.verify.includes(e.id)) errors.push(`${id}: verify command names neither \`${e.path}\` nor \`${e.id}\``);
    // A full stop, exactly: the renderer strips it to append `(not for …)` and the path arrow,
    // and a `?` or `!` would survive that strip and render mid-line.
    if (e.need && !/\.$/.test(e.need)) errors.push(`${id}: need must be one sentence ending in a full stop`);
  });
  // superseded_by must name another entry, and one that is itself active: CLAUDE.md § Adding a
  // Tool keeps a deprecated row "so a reader of an old handoff finds the successor", and a
  // successor that is itself deprecated, or the row itself, defeats that.
  const byId = new Map(entries.filter((e) => e.id).map((e) => [e.id, e]));
  for (const e of entries) {
    if (!e.superseded_by) continue;
    if (e.superseded_by === e.id) errors.push(`${e.id}: superseded_by names itself`);
    else if (!byId.has(e.superseded_by)) errors.push(`${e.id}: superseded_by \`${e.superseded_by}\` names no entry`);
    else if (byId.get(e.superseded_by).status !== 'active') errors.push(`${e.id}: superseded_by \`${e.superseded_by}\` is not active; name the live successor`);
  }
  // a tag must cover at least two tools, or not exist
  const tagCounts = new Map();
  for (const e of entries) if (e.tag) tagCounts.set(e.tag, (tagCounts.get(e.tag) || 0) + 1);
  for (const [tag, c] of tagCounts) if (c < 2) errors.push(`tag \`${tag}\` covers one tool; a term that covers one is an id, not a class — drop it`);
  return errors;
}

/**
 * Registry vs disk, as three named lists. Never a bare boolean: `fileWithoutRow`,
 * `rowWithoutFile` and `notPlainFile` are different defects with different fixes. The third is
 * the direction the first two cannot see: a tool is one flat file under tools/, so a subdirectory
 * (`tools/hermes/validate.py`) or a symlink there is representable by no row and would otherwise
 * drop out of both lists silently. `lstatSync`, so a broken symlink is reported, not thrown on.
 */
export function checkParity(root, entries) {
  const onDisk = [];
  const notPlainFile = [];
  for (const name of readdirSync(join(root, TOOLS_DIR)).sort()) {
    if (NOT_TOOLS.has(name)) continue;
    const p = `${TOOLS_DIR}/${name}`;
    if (lstatSync(join(root, TOOLS_DIR, name)).isFile()) onDisk.push(p);
    else notPlainFile.push(p);
  }
  const rows = entries.map((e) => e.path).filter(Boolean);
  const rowSet = new Set(rows);
  const diskSet = new Set(onDisk);
  return {
    fileWithoutRow: onDisk.filter((p) => !rowSet.has(p)),
    rowWithoutFile: rows.filter((p) => !existsSync(join(root, p)) || !diskSet.has(p)),
    notPlainFile,
  };
}

/** Load, parse, and check; the shape every caller wants. Throws only when the file cannot be parsed. */
export function loadRegistry(root) {
  const text = readFileSync(join(root, REGISTRY_PATH), 'utf8');
  const { entries, declaredTotal } = parseRegistry(text);
  const errors = schemaErrors(entries, declaredTotal);
  const parity = checkParity(root, entries);
  return { entries, errors, ...parity };
}

/** The CLAUDE.md index: one need-first line per ACTIVE tool, `not_for` as a suffix, grouped by tag in TAGS order, untagged last. */
export function renderClaudeBlock(entries) {
  const active = entries.filter((e) => e.status === 'active');
  const order = [...TAGS, null];
  const lines = [];
  for (const tag of order) {
    for (const e of active.filter((x) => (x.tag ?? null) === tag)) {
      const notFor = e.not_for ? ` (not for ${e.not_for})` : '';
      lines.push(`- ${e.need.replace(/\.$/, '')}${notFor} → \`${e.path}\``);
    }
  }
  if (lines.length !== active.length) throw new Error(`renderClaudeBlock rendered ${lines.length} of ${active.length} active tools; a tag outside TAGS reached the renderer`);
  const skipped = entries.length - active.length;
  const head = `\`tools/_registry.yml\` catalogues ${active.length} operator utilities under \`tools/\`, each with a self-test (\`verify\` in its row). \`npm run check:tools-registry\` checks every row against disk in both directions inside \`validate:integrity\`; a separate, non-required job runs each row's self-test where \`verify_in_ci\` allows it. **Read this list before writing a helper or a one-off** — a snippet typed a second time in a session gets promoted here, not re-typed a third time (\`tools/README.md\` § Adding one).${skipped ? ` ${skipped} deprecated tool(s) are in the registry with a successor and are not listed here.` : ''}`;
  return `${head}\n\n${lines.join('\n')}`;
}

/** A markdown table cell: `|` would split the row, so it is escaped. */
function cell(s) {
  return String(s).replace(/\|/g, '\\|');
}

/** The compact table for tools/README.md: id, language, description, verify. Deprecated rows appear with their successor. */
export function renderReadmeTable(entries) {
  const rows = entries.map((e) => {
    const status = e.status === 'deprecated' ? ` — **deprecated**, use \`${e.superseded_by}\`` : '';
    return `| \`${e.path.replace(/^tools\//, '')}\` | ${e.language} | ${cell(e.description)}${status} | \`${cell(e.verify)}\` |`;
  });
  return `Generated from \`tools/_registry.yml\` by \`npm run update-readmes\`; the need-first index the same file feeds is in \`CLAUDE.md\` § Tools. Edit the registry, not this table.\n\n| Tool | Runtime | Description | Self-test |\n|---|---|---|---|\n${rows.join('\n')}`;
}
