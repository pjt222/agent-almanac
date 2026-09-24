#!/usr/bin/env node
// Content-style checker for skills, agents, teams, and guides.
// See guides/content-styleguide.md for the rules this enforces.
//
// Modes:
//   --added <baseRef>   PR mode: only inspect lines ADDED relative to <baseRef>.
//                       Decorative-dash table separators AND untagged opening code
//                       fences on added lines FAIL (exit 1).
//   --all               Repo-wide informational scan. Always exits 0 (warn-only).
//   --untagged-strict   Repo-wide, ENGLISH trees only, untagged openers only. FAILS
//                       on any, not merely on added lines (#629).
//
// Detection is fence-aware: every file is parsed with code-fence state so that
// (a) separators inside code blocks are ignored, and (b) closing fences are never
// mistaken for untagged openers.

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
// The shared extractor, so `--untagged-strict` cannot drift from the fold it protects (#629).
// Node builtins and local libs only — no package dependency is added to this script.
import { extractFences } from "./lib/fences.js";
import { isTemplate } from "./lib/content-paths.js";

const CONTENT_GLOBS = ["skills/", "agents/", "teams/", "guides/", "i18n/"];

// English only. `i18n/` is deliberately absent: an untagged fence in a TRANSLATION is a
// translation defect owned by check-i18n-fence-parity.js, and #629 is about a property of
// English -- specifically, that `foldedTagSequence` folds an untagged English fence to `text`,
// so a translation may replace it with a localised ```text one and produce an identical folded
// sequence. That escape is only reachable if an untagged English opener exists at all.
const ENGLISH_TREES = ["skills/", "agents/", "teams/", "guides/"];

function isContentFile(p) {
  if (!CONTENT_GLOBS.some((g) => p.startsWith(g))) return false;
  if (isTemplate(p)) return false; // templates are author scaffolding
  // Was `p.includes("/_template")` (#672). Same verdict on every path in this corpus,
  // and two differences that matter: the substring also excluded
  // `guides/my_template_notes.md`, and it matched at any depth, where npm's own
  // negations are root-anchored. `isTemplate` strips an `i18n/<locale>/` prefix, which
  // is what keeps the mirror templates this glob list reaches excluded as before.
  return p.endsWith(".md");
}

// NOT `isContentFile` with a different prefix list. Templates are INCLUDED here, because #629
// asks for "an untagged fence opener anywhere in skills/, agents/, teams/, guides/" and a
// template lives in those trees. Measured safe at introduction: 0 untagged openers in templates,
// so including them costs nothing and removes a carve-out that would have to be remembered.
function isEnglishContentFile(p) {
  if (!ENGLISH_TREES.some((g) => p.startsWith(g))) return false;
  return p.endsWith(".md");
}

// A GFM table separator row: only pipes, dashes, colons, spaces; at least one dash and one pipe.
function isSeparatorRow(line) {
  const t = line.trim();
  if (!t.includes("|") || !t.includes("-")) return false;
  return /^\|?[\s:|-]*-[\s:|-]*\|?$/.test(t);
}
// Decorative = a separator row carrying a run of 4+ dashes (rendered output ignores the count).
function isDecorativeSeparator(line) {
  return isSeparatorRow(line) && /----/.test(line);
}

const FENCE_RE = /^(\s*)(`{3,}|~{3,})(.*)$/;

// Walk a file, return {decorativeSeparators:[lineNo], untaggedOpeners:[lineNo]} (1-based).
function scanFile(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const decorativeSeparators = [];
  const untaggedOpeners = [];
  let inFence = false;
  let markerChar = null;
  let markerLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(FENCE_RE);
    if (m) {
      const ch = m[2][0];
      const len = m[2].length;
      const info = m[3].trim();
      if (!inFence) {
        inFence = true;
        markerChar = ch;
        markerLen = len;
        if (info === "") untaggedOpeners.push(i + 1);
      } else if (ch === markerChar && len >= markerLen && info === "") {
        // GFM: a fence closes only with the same char, >= the opening length,
        // and no info string. A shorter inner fence (``` inside ````) does not close it.
        inFence = false;
        markerChar = null;
        markerLen = 0;
      }
      continue;
    }
    if (inFence) continue;
    if (isDecorativeSeparator(line)) decorativeSeparators.push(i + 1);
  }
  return { decorativeSeparators, untaggedOpeners };
}

// Parse `git diff --unified=0` into a map: file -> Set(added line numbers).
function addedLineMap(baseRef) {
  // --ignore-cr-at-eol: legacy blobs are CRLF but .gitattributes normalizes to LF
  // on commit, which would otherwise mark every line of an edited legacy file as
  // "added" and flag its pre-existing violations. Ignoring CR-at-EOL keeps the
  // added-line set limited to genuine content changes.
  const out = execSync(
    `git diff --unified=0 --ignore-cr-at-eol ${baseRef}...HEAD -- ${CONTENT_GLOBS.join(" ")}`,
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const map = new Map();
  let file = null;
  let newLine = 0;
  for (const line of out.split("\n")) {
    if (line.startsWith("+++ b/")) {
      file = line.slice(6);
      if (!map.has(file)) map.set(file, new Set());
      continue;
    }
    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunk) {
      newLine = parseInt(hunk[1], 10);
      continue;
    }
    if (file && line.startsWith("+") && !line.startsWith("+++")) {
      map.get(file).add(newLine);
      newLine++;
    } else if (file && line.startsWith(" ")) {
      newLine++;
    }
    // deleted lines ('-') do not advance the new-file counter
  }
  return map;
}

function listAllContentFiles() {
  const out = execSync(`git ls-files ${CONTENT_GLOBS.join(" ")}`, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split("\n").filter(isContentFile);
}

function runAdded(baseRef) {
  const map = addedLineMap(baseRef);
  const errors = [];
  for (const [file, added] of map) {
    if (!isContentFile(file) || !existsSync(file)) continue;
    const { decorativeSeparators, untaggedOpeners } = scanFile(readFileSync(file, "utf8"));
    for (const ln of decorativeSeparators) {
      if (added.has(ln)) errors.push(`${file}:${ln}  decorative table separator (use \`|---|---|\`)`);
    }
    for (const ln of untaggedOpeners) {
      if (added.has(ln)) errors.push(`${file}:${ln}  untagged code fence (add a language tag)`);
    }
  }
  for (const e of errors) console.log(`FAIL  ${e}`);
  if (errors.length) {
    console.log(`\n${errors.length} blocking content-style error(s). See guides/content-styleguide.md.`);
    process.exit(1);
  }
  console.log("Content-style: 0 blocking errors on added lines.");
}

function runAll() {
  let deco = 0;
  let untagged = 0;
  let dfiles = 0;
  let ufiles = 0;
  for (const file of listAllContentFiles()) {
    if (!existsSync(file)) continue;
    const { decorativeSeparators, untaggedOpeners } = scanFile(readFileSync(file, "utf8"));
    if (decorativeSeparators.length) {
      dfiles++;
      deco += decorativeSeparators.length;
    }
    if (untaggedOpeners.length) {
      ufiles++;
      untagged += untaggedOpeners.length;
    }
  }
  console.log("Content-style repo-wide scan (informational, warn-only):");
  console.log(`  decorative table separators: ${deco} across ${dfiles} files`);
  console.log(`  untagged code fences:        ${untagged} across ${ufiles} files`);
  console.log("Normalization is tracked separately; see guides/content-styleguide.md.");
}

// #629. Blocking, repo-wide, English only, untagged openers only.
//
// Why not just make `--all` blocking: `runAll` also counts decorative separators, a class with
// 11 live members, so flipping it would redden every PR for a different debt. Why not rely on
// `--added`: it fails only for an opener on a line the diff marks as added, which misses the
// case where a fence BECOMES an opener because a preceding fence's parity flipped -- no line of
// its own was touched, so there is no added line to catch. That is the #628 shape.
//
// This ships blocking rather than warn-only because the corpus was measured at zero when the
// gate was introduced: 558 English .md files, 0 untagged openers, templates included. A gate
// that ships clean can block; one that ships dirty needs a ratchet.
function runUntaggedStrict() {
  const out = execSync(`git ls-files ${ENGLISH_TREES.join(" ")}`, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  const files = out.split("\n").filter(isEnglishContentFile);

  // A scan that matched no files would report "0 violations" and mean nothing -- the vacuous
  // pass this repo has shipped before. Refuse rather than report a clean-looking zero.
  if (files.length === 0) {
    console.error("FAIL: no English content files matched; the scan would be vacuous.");
    process.exit(2);
  }

  const errors = [];
  let scanned = 0;
  for (const file of files) {
    // Was `if (!existsSync(file)) continue;`, copied from the informational `runAll`. In a
    // BLOCKING gate a silent skip is the green-over-nothing shape this repo bans -- and the
    // success line counted `files.length`, so a skipped file would still have read as covered.
    // Refuse instead: git named it, so it should be readable.
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch (err) {
      console.error(`FAIL: ${file} is listed by git but unreadable (${err.code}).`);
      console.error("A blocking gate must not silently skip its own subject.");
      process.exit(2);
    }
    scanned++;
    // `extractFences`, NOT this file's local `scanFile`. The escape #629 protects against is
    // defined by `foldedTagSequence`, which folds an untagged fence to `text` -- and an untagged
    // fence is exactly `info === ''` in the shared extractor. Detecting openers with a second
    // state machine would make this gate a THIRD fence parser, against the repo's own doctrine
    // ("A second copy would drift"), and that copy already had a divergence to show for it: the
    // local FENCE_RE uses `(.*)$` and normalises only CRLF, where `toLines` also normalises a
    // lone CR -- so a committed lone-CR file yields openers the fold sees and the gate did not.
    for (const fence of extractFences(text)) {
      if (fence.info === "") errors.push(`${file}:${fence.line}`);
    }
  }

  if (errors.length) {
    for (const e of errors) console.log(`FAIL  ${e}  untagged code fence (add a language tag)`);
    console.log(
      `\n${errors.length} untagged fence opener(s) in the English trees.\n` +
        "An untagged English fence folds to `text`, so a translation may replace it with a\n" +
        "localised ```text fence and produce an identical folded tag sequence -- the #481 escape,\n" +
        "invisible to every gate. Tag the English source. See guides/content-styleguide.md.",
    );
    process.exit(1);
  }
  console.log(
    // `scanned`, not `files.length`: the two are equal only because nothing was skipped, and
    // reporting the list size would have claimed coverage a skip did not deliver.
    `Untagged-fence gate: 0 untagged openers across ${scanned} English content file(s).`,
  );
}

const [, , mode, arg] = process.argv;
if (mode === "--added") {
  runAdded(arg || "origin/main");
} else if (mode === "--all") {
  runAll();
} else if (mode === "--untagged-strict") {
  runUntaggedStrict();
} else {
  console.error(
    "usage: check-content-style.js --added <baseRef> | --all | --untagged-strict",
  );
  process.exit(2);
}
