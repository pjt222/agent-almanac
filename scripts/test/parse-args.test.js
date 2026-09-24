/**
 * Unit tests for `scripts/lib/parse-args.js` (#619).
 *
 * Every case here is a spelling someone actually typed, or a silence someone actually paid for.
 * The parser exists because `indexOf('--locale')` did not match `--locale=de`, the scoping
 * silently vanished, and a run narrowed to one locale rewrote 281 files instead of 63.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs } from '../lib/parse-args.js';

const SPEC = { bool: ['--write', '--dry'], value: ['--locale', '--root'] };

/** Collect the error instead of exiting, so a rejection is assertable. */
function parse(argv, spec = SPEC) {
  const errors = [];
  const opts = parseArgs(argv, spec, (message) => {
    errors.push(message);
    throw new Error(`__stop__ ${message}`);
  });
  return { opts, errors };
}

function parseExpectingError(argv, spec = SPEC) {
  try {
    parse(argv, spec);
  } catch (error) {
    if (!error.message.startsWith('__stop__')) throw error;
    return error.message.slice('__stop__ '.length);
  }
  assert.fail('expected a usage error, got none');
}

test('the equals form and the space form mean the same thing', () => {
  // THE 281-FILE CASE. `--locale=de` is the ordinary GNU idiom; the parser this replaces did not
  // match it, so the scoping vanished without a word and a narrowed run went corpus-wide.
  assert.equal(parse(['--locale=de']).opts.locale, 'de');
  assert.equal(parse(['--locale', 'de']).opts.locale, 'de');
});

test('an unknown argument is an error, never a silent no-op', () => {
  // A mistyped `--verdicts` used to parse as "flag absent": the scan ran, ten files were
  // written, no verdict list printed, exit 0 — and the reader concluded there were no stubs.
  assert.match(parseExpectingError(['--verdict']), /unknown argument '--verdict'/);
  assert.match(parseExpectingError(['-write']), /unknown argument '-write'/);
  assert.match(parseExpectingError(['stray']), /unknown argument 'stray'/);
});

test('a value flag with no value is rejected in both spellings', () => {
  assert.match(parseExpectingError(['--root']), /--root requires a value/);
  assert.match(parseExpectingError(['--root=']), /--root requires a value/);
});

test('the space form does not swallow the next flag as its value', () => {
  // `--locale --dry` must not read "--dry" as the locale. This guard predates the extraction and
  // is the reason the space form is treated differently from the equals form below.
  assert.match(parseExpectingError(['--locale', '--dry']), /--locale requires a value/);
});

test('the equals form takes a leading-dash value at face value', () => {
  // Deliberately NOT symmetric with the case above. `--locale=--dry` is explicit: the caller
  // wrote the value into the same token, so there is no ambiguity to protect them from.
  assert.equal(parse(['--locale=--dry']).opts.locale, '--dry');
});

test('a boolean flag rejects a value', () => {
  // Accepting `--write=1` would invite `--write=0` to mean "off", which it would not — the
  // dangerous direction for a flag whose whole job is to authorise writing.
  assert.match(parseExpectingError(['--write=1']), /--write takes no value/);
  assert.match(parseExpectingError(['--write=0']), /--write takes no value/);
});

test('booleans default false and values default null', () => {
  const { opts } = parse([]);
  assert.deepEqual(opts, { write: false, dry: false, locale: null, root: null });
});

test('flags may appear in any order and repeat, last value winning', () => {
  const { opts } = parse(['--dry', '--locale=de', '--root', '/tmp/x', '--locale=ja']);
  assert.equal(opts.dry, true);
  assert.equal(opts.locale, 'ja');
  assert.equal(opts.root, '/tmp/x');
  assert.equal(opts.write, false);
});

test('a value containing `=` survives — only the FIRST one splits', () => {
  assert.equal(parse(['--root=/tmp/a=b']).opts.root, '/tmp/a=b');
});

test('an empty spec rejects everything, including nothing gracefully', () => {
  assert.deepEqual(parse([], {}).opts, {});
  assert.match(parseExpectingError(['--anything'], {}), /unknown argument/);
});
