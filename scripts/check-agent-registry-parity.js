#!/usr/bin/env node
/**
 * Agent file vs registry parity (#434).
 *
 * `agents/<id>.md` frontmatter and the matching `agents/_registry.yml` entry both carry `skills`
 * and `tools`, and nothing compared them. That is how #398 survived from an agent's creation
 * commit: `apa-specialist` listed 1 skill in the file and 3 in the registry, and the #403 §2a
 * work re-synced four agents BY HAND. A hand-sync with no gate behind it is a repair, not a fix —
 * the same drift is free to reappear on the next agent added.
 *
 * Ships BLOCKING, because the corpus was measured clean at introduction: 75 agent files, 75
 * registry entries, 0 field drifts, and — the part that matters more — 150 of 150 field
 * comparisons populated on BOTH sides. Two empty lists compare equal, so a "0 drift" result over
 * a corpus where the fields were absent would prove nothing at all. That is why `--strict`
 * (the default) also requires PRESENCE rather than only agreement.
 *
 * Order-insensitive: the two files list skills in different orders in several places today and
 * that is not drift. Duplicates ARE reported, since a list containing the same skill twice
 * disagrees with a set-equal counterpart in a way nobody intends.
 *
 *   node scripts/check-agent-registry-parity.js
 *   node scripts/check-agent-registry-parity.js --json
 *
 * Teams are deliberately out of scope. #434 raises them as "consider", and `teams/_registry.yml`
 * carries `lead`/`members`/`coordination` against a different frontmatter shape — a second
 * comparison with its own vacuity question, which belongs in its own change with its own
 * measurement.
 */
import * as yaml from 'js-yaml';
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { isTemplate } from './lib/content-paths.js';

const FIELDS = ['skills', 'tools'];

function frontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) return null;
  try {
    return yaml.load(m[1]);
  } catch {
    return null;
  }
}

/**
 * Normalise a field to a sorted array of strings.
 *
 * Both shapes occur: the frontmatter uses a YAML flow sequence (`tools: [Read, Edit]`) and a
 * block sequence for `skills`, and js-yaml gives an array for both. A comma-separated STRING is
 * accepted too rather than silently read as a one-element list, because that is the shape a
 * hand-edit produces and reading it as one long "skill" would report drift with an unreadable
 * message.
 */
function normalise(value) {
  if (value == null) return [];
  const parts = Array.isArray(value) ? value : String(value).split(',');
  return parts.map((v) => String(v).trim()).filter(Boolean).sort();
}

const sameSet = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

function listAgentFiles() {
  const out = execSync('git ls-files agents/*.md', { encoding: 'utf8', maxBuffer: 1 << 26 });
  return out
    .split('\n')
    .filter(Boolean)
    // `!p.includes('_template')` before #672, which also dropped a hypothetical
    // `agents/my_template_notes.md` from the parity comparison — silently, since a file
    // absent from BOTH sides of a set comparison is invisible rather than red.
    .filter((p) => !isTemplate(p) && !p.endsWith('README.md'));
}

function loadRegistry() {
  const reg = yaml.load(readFileSync('agents/_registry.yml', 'utf8'));
  const node = reg?.agents;
  if (Array.isArray(node)) return node;
  if (node && typeof node === 'object') {
    return Object.entries(node).map(([name, v]) =>
      v && typeof v === 'object' ? { id: v.id ?? name, ...v } : { id: name });
  }
  return [];
}

function main() {
  const json = process.argv.includes('--json');
  const files = listAgentFiles();
  const entries = loadRegistry();

  // Vacuity, both sides. A scan that reaches nothing reports "0 drift" and means nothing — the
  // shape this repo keeps rediscovering. Refuse rather than print a clean-looking zero.
  if (files.length === 0 || entries.length === 0) {
    console.error(
      `FAIL: nothing to compare (${files.length} agent file(s), ${entries.length} registry entry(s)).`,
    );
    process.exit(2);
  }

  const errors = [];
  const seen = new Set();
  let comparisons = 0;
  let populated = 0;

  for (const file of files) {
    if (!existsSync(file)) continue;
    const fm = frontmatter(readFileSync(file, 'utf8'));
    if (!fm) {
      errors.push(`${file}: no parseable YAML frontmatter`);
      continue;
    }
    const id = fm.name || file.replace(/^agents\//, '').replace(/\.md$/, '');
    const entry = entries.find((e) => e.id === id || e.name === id);
    if (!entry) {
      errors.push(`${file}: name "${id}" has no entry in agents/_registry.yml`);
      continue;
    }
    seen.add(entry.id ?? entry.name);

    for (const field of FIELDS) {
      comparisons++;
      const inFile = normalise(fm[field]);
      const inReg = normalise(entry[field]);
      if (inFile.length && inReg.length) populated++;

      // Presence is checked separately from agreement. Absent on BOTH sides compares equal and
      // would pass silently, which is the vacuous half of a parity check.
      if (!inFile.length || !inReg.length) {
        errors.push(
          `${id}.${field}: empty on ${!inFile.length ? 'the file' : 'the registry'} side` +
            `${!inFile.length && !inReg.length ? ' (both)' : ''} — a parity check over two empty` +
            ' lists asserts nothing',
        );
        continue;
      }
      if (!sameSet(inFile, inReg)) {
        const onlyFile = inFile.filter((x) => !inReg.includes(x));
        const onlyReg = inReg.filter((x) => !inFile.includes(x));
        errors.push(
          `${id}.${field}: file and registry disagree\n` +
            `    only in ${file}: ${onlyFile.join(', ') || '(none)'}\n` +
            `    only in registry: ${onlyReg.join(', ') || '(none)'}` +
            (onlyFile.length || onlyReg.length ? '' : '\n    (same members, different multiplicity)'),
        );
      }
    }
  }

  for (const entry of entries) {
    const id = entry.id ?? entry.name;
    if (!seen.has(id)) errors.push(`registry entry "${id}" has no agent file`);
  }

  if (json) {
    console.log(JSON.stringify({ files: files.length, entries: entries.length, comparisons, populated, errors }, null, 2));
  }

  if (errors.length) {
    for (const e of errors) console.log(`FAIL  ${e}`);
    console.log(`\n${errors.length} agent/registry parity error(s).`);
    console.log('Fix the agent file and agents/_registry.yml together; see #398 and #434.');
    process.exit(1);
  }

  console.log(
    `Agent registry parity: ${files.length} agent(s), ${comparisons} field comparison(s), ` +
      `${populated} populated on both sides. No drift.`,
  );
}

main();
