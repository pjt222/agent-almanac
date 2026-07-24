#!/usr/bin/env node
/**
 * validate-locales-json.js — fail if any viz UI locale file is not valid JSON.
 *
 * The force-graph frontend loads `viz/public/locales/<locale>.json` at runtime and
 * looks up UI strings by key. A file that fails to parse leaves the loader with no
 * table, so the UI silently renders raw i18n keys (e.g. `nav.search`) instead of
 * translated labels — a failure that is invisible in CI until a human opens the page.
 * This gate parses every locale file and fails closed so a malformed file is caught
 * at PR time. Mirrors the CI gate (.github/workflows/validate-locales-json.yml).
 *
 *   node scripts/validate-locales-json.js   # exit 0 = all valid, exit 1 = problem
 *
 * Fail-closed: an empty or missing locales directory is itself a failure — an absent
 * corpus must never read as a pass.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const localesDir = resolve(scriptDir, '..', 'viz', 'public', 'locales');

/** @type {string[]} */
const failures = [];

let files;
try {
  files = readdirSync(localesDir).filter((f) => f.endsWith('.json')).sort();
} catch (err) {
  console.error(`::error::cannot read locales directory ${localesDir}: ${err.message}`);
  process.exit(1);
}

if (files.length === 0) {
  console.error(`::error::no *.json locale files found in ${localesDir} (fail-closed)`);
  process.exit(1);
}

for (const file of files) {
  const path = join(localesDir, file);
  let raw;
  try {
    raw = readFileSync(path, 'utf8');
  } catch (err) {
    failures.push(`${file}: unreadable — ${err.message}`);
    console.error(`::error file=viz/public/locales/${file}::unreadable — ${err.message}`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    failures.push(`${file}: invalid JSON — ${err.message}`);
    console.error(`::error file=viz/public/locales/${file}::invalid JSON — ${err.message}`);
    continue;
  }
  // A locale table must be a plain non-empty object of key -> value. An array,
  // null, or empty object would parse but still leave the UI without strings.
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    failures.push(`${file}: parsed but is not a JSON object`);
    console.error(`::error file=viz/public/locales/${file}::parsed but is not a JSON object`);
    continue;
  }
  if (Object.keys(parsed).length === 0) {
    failures.push(`${file}: parsed to an empty object (no UI strings)`);
    console.error(`::error file=viz/public/locales/${file}::parsed to an empty object (no UI strings)`);
    continue;
  }
}

if (failures.length > 0) {
  console.error(`\nvalidate-locales-json: ${failures.length} of ${files.length} locale file(s) failed:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(`validate-locales-json: OK — ${files.length} locale file(s) valid (${files.join(', ')})`);
