#!/usr/bin/env node
// Content-style checker for skills, agents, teams, and guides.
// See guides/content-styleguide.md for the rules this enforces.
//
// Modes:
//   --added <baseRef>   PR mode: only inspect lines ADDED relative to <baseRef>.
//                       Decorative-dash table separators on added lines FAIL (exit 1).
//                       Untagged opening code fences on added lines WARN (non-fatal).
//   --all               Repo-wide informational scan. Always exits 0 (warn-only).
//
// Detection is fence-aware: every file is parsed with code-fence state so that
// (a) separators inside code blocks are ignored, and (b) closing fences are never
// mistaken for untagged openers.

import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

const CONTENT_GLOBS = ["skills/", "agents/", "teams/", "guides/", "i18n/"];

function isContentFile(p) {
  if (!CONTENT_GLOBS.some((g) => p.startsWith(g))) return false;
  if (p.includes("/_template")) return false; // templates are author scaffolding
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
  const out = execSync(
    `git diff --unified=0 ${baseRef}...HEAD -- ${CONTENT_GLOBS.join(" ")}`,
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
  const warnings = [];
  for (const [file, added] of map) {
    if (!isContentFile(file) || !existsSync(file)) continue;
    const { decorativeSeparators, untaggedOpeners } = scanFile(readFileSync(file, "utf8"));
    for (const ln of decorativeSeparators) {
      if (added.has(ln)) errors.push(`${file}:${ln}  decorative table separator (use \`|---|---|\`)`);
    }
    for (const ln of untaggedOpeners) {
      if (added.has(ln)) warnings.push(`${file}:${ln}  untagged code fence (add a language tag)`);
    }
  }
  for (const w of warnings) console.log(`WARN  ${w}`);
  for (const e of errors) console.log(`FAIL  ${e}`);
  if (errors.length) {
    console.log(`\n${errors.length} blocking content-style error(s). See guides/content-styleguide.md.`);
    process.exit(1);
  }
  console.log(
    `Content-style: 0 blocking errors${warnings.length ? `, ${warnings.length} warning(s)` : ""} on added lines.`,
  );
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

const [, , mode, arg] = process.argv;
if (mode === "--added") {
  runAdded(arg || "origin/main");
} else if (mode === "--all") {
  runAll();
} else {
  console.error("usage: check-content-style.js --added <baseRef> | --all");
  process.exit(2);
}
