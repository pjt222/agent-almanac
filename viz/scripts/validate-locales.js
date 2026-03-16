#!/usr/bin/env node
/**
 * validate-locales.js — Check that all locale JSON files have the same keys as en.json.
 * Exits 0 if all match, 1 if there are mismatches.
 *
 * Usage:  node viz/scripts/validate-locales.js
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, '..', 'public', 'locales');

function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key === '_meta') continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

const files = readdirSync(localesDir).filter(f => f.endsWith('.json'));
const enFile = files.find(f => f === 'en.json');
if (!enFile) {
  console.error('ERROR: en.json not found in', localesDir);
  process.exit(1);
}

const enData = JSON.parse(readFileSync(join(localesDir, enFile), 'utf8'));
const enKeys = new Set(flattenKeys(enData));

let hasErrors = false;

for (const file of files) {
  if (file === 'en.json') continue;

  const data = JSON.parse(readFileSync(join(localesDir, file), 'utf8'));
  const localeKeys = new Set(flattenKeys(data));

  const missing = [...enKeys].filter(k => !localeKeys.has(k));
  const extra = [...localeKeys].filter(k => !enKeys.has(k));

  if (missing.length > 0) {
    console.warn(`${file}: missing ${missing.length} key(s): ${missing.join(', ')}`);
    hasErrors = true;
  }
  if (extra.length > 0) {
    console.warn(`${file}: extra ${extra.length} key(s): ${extra.join(', ')}`);
    hasErrors = true;
  }
  if (missing.length === 0 && extra.length === 0) {
    console.log(`${file}: OK (${localeKeys.size} keys)`);
  }
}

console.log(`\nen.json: ${enKeys.size} keys (reference)`);
process.exit(hasErrors ? 1 : 0);
