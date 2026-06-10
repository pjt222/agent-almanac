#!/usr/bin/env node
// Deterministic content-style normalizer for skills, agents, teams, guides, i18n.
// Companion to scripts/check-content-style.js — it rewrites exactly what the
// checker flags, using the SAME fence-state machine so 4-backtick examples that
// wrap 3-backtick fences are never corrupted.
//
// Two transforms, both line-type-local (so the diff shape is provable):
//   separators : decorative table separator rows -> compact `|---|---|`
//                (3 dashes/column, alignment colons preserved)
//   fences     : untagged opening code fences    -> add a language tag
//                (heuristic detection of bash/console/json/yaml/r/diff; `text` fallback)
//
// Usage:
//   node scripts/normalize-content-style.js --mode <separators|fences|both> --scope <english|all>
//   node scripts/normalize-content-style.js --mode both --files a.md b.md ...
//   add --dry to report changes without writing.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CONTENT_GLOBS = ["skills/", "agents/", "teams/", "guides/", "i18n/"];
const ENGLISH_GLOBS = ["skills/", "agents/", "teams/", "guides/"];

function isContentFile(p) {
  if (!CONTENT_GLOBS.some((g) => p.startsWith(g))) return false;
  if (p.includes("/_template")) return false;
  return p.endsWith(".md");
}

// ── Predicates copied verbatim from check-content-style.js ──────────────────
function isSeparatorRow(line) {
  const t = line.trim();
  if (!t.includes("|") || !t.includes("-")) return false;
  return /^\|?[\s:|-]*-[\s:|-]*\|?$/.test(t);
}
function isDecorativeSeparator(line) {
  return isSeparatorRow(line) && /----/.test(line);
}
const FENCE_RE = /^(\s*)(`{3,}|~{3,})(.*)$/;

// ── Separator rewrite ───────────────────────────────────────────────────────
// Compact a decorative separator row to 3 dashes/column, preserving indentation,
// leading/trailing pipe presence, column count, and alignment colons.
function compactSeparator(line) {
  const indentMatch = line.match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : "";
  let t = line.trim();
  const hasLead = t.startsWith("|");
  const hasTrail = t.endsWith("|");
  if (hasLead) t = t.slice(1);
  if (hasTrail) t = t.slice(0, -1);
  const cells = t.split("|").map((cell) => {
    const c = cell.trim();
    const left = c.startsWith(":");
    const right = c.endsWith(":");
    if (left && right) return ":---:";
    if (left) return ":---";
    if (right) return "---:";
    return "---";
  });
  return indent + (hasLead ? "|" : "") + cells.join("|") + (hasTrail ? "|" : "");
}

// ── Fence language heuristic ────────────────────────────────────────────────
// Decide a language tag from the block's content lines. The corpus's untagged
// blocks are overwhelmingly structured prose/output (example dialogues, ASCII
// diagrams, protocol templates, reference tables) for which `text` is the
// styleguide-blessed and CORRECT tag. Prose-based heuristics (yaml on `User:`
// dialogue, json on `[...]` diagrams) produce mostly false positives, so the
// only language we INFER is JSON — and only when it actually parses, which has
// effectively zero false-positive risk on prose. Everything else is `text`.
// (This also guarantees identical tags across the 10 i18n locales, since code
// blocks stay English: a block that parses as JSON in the source parses in
// every translation, and a prose block is `text` in all of them.)
function isJson(s) {
  const t = s.trim();
  if (!/^[[{]/.test(t)) return false;
  try {
    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
}
function guessLanguage(contentLines) {
  const lines = contentLines.filter((l) => l.trim() !== "");
  if (lines.length === 0) return "text";
  // whole block is one JSON value
  if (isJson(lines.join("\n"))) return "json";
  // JSON Lines: every non-empty line is its own JSON value
  if (lines.every((l) => isJson(l))) return "json";
  return "text";
}

// ── File transform ──────────────────────────────────────────────────────────
// Returns {text, sepChanges, fenceChanges}. Fence-aware: only OUTSIDE-fence
// separators are rewritten; only OPENING untagged fences are tagged.
function transform(original, { doSep, doFence }) {
  const hadCRLF = /\r\n/.test(original);
  const lines = original.replace(/\r\n/g, "\n").split("\n");
  let sepChanges = 0;
  let fenceChanges = 0;
  let inFence = false;
  let markerChar = null;
  let markerLen = 0;
  let fenceOpenIdx = -1;

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
        fenceOpenIdx = i;
        if (info === "" && doFence) {
          // collect block content until the matching close to guess language
          const content = [];
          for (let j = i + 1; j < lines.length; j++) {
            const cm = lines[j].match(FENCE_RE);
            if (cm && cm[2][0] === ch && cm[2].length >= len && cm[3].trim() === "") break;
            content.push(lines[j]);
          }
          const lang = guessLanguage(content);
          lines[i] = m[1] + m[2] + lang;
          fenceChanges++;
        }
      } else if (ch === markerChar && len >= markerLen && info === "") {
        inFence = false;
        markerChar = null;
        markerLen = 0;
        fenceOpenIdx = -1;
      }
      continue;
    }
    if (inFence) continue;
    if (doSep && isDecorativeSeparator(line)) {
      const compact = compactSeparator(line);
      if (compact !== line) {
        lines[i] = compact;
        sepChanges++;
      }
    }
  }
  let text = lines.join("\n");
  // Preserve original EOL style so EOL normalization stays a separate concern.
  if (hadCRLF) text = text.replace(/\n/g, "\r\n");
  return { text, sepChanges, fenceChanges };
}

// ── Scope resolution ────────────────────────────────────────────────────────
function listFiles(scope) {
  const globs = scope === "english" ? ENGLISH_GLOBS : CONTENT_GLOBS;
  const out = execSync(`git ls-files ${globs.join(" ")}`, {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
  });
  return out.split("\n").filter(isContentFile);
}

// ── Main ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
function flagVal(name) {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : null;
}
const mode = flagVal("--mode") || "both";
const dry = argv.includes("--dry");
const doSep = mode === "separators" || mode === "both";
const doFence = mode === "fences" || mode === "both";

let files;
const filesIdx = argv.indexOf("--files");
if (filesIdx >= 0) {
  files = argv.slice(filesIdx + 1).filter((a) => !a.startsWith("--"));
} else {
  const scope = flagVal("--scope") || "english";
  files = listFiles(scope);
}

let totalSep = 0;
let totalFence = 0;
let sepFiles = 0;
let fenceFiles = 0;
let written = 0;
for (const f of files) {
  if (!existsSync(f)) continue;
  const original = readFileSync(f, "utf8");
  const { text, sepChanges, fenceChanges } = transform(original, { doSep, doFence });
  if (sepChanges) {
    totalSep += sepChanges;
    sepFiles++;
  }
  if (fenceChanges) {
    totalFence += fenceChanges;
    fenceFiles++;
  }
  if (text !== original) {
    if (!dry) writeFileSync(f, text);
    written++;
  }
}
console.log(`normalize-content-style (mode=${mode}${dry ? ", DRY" : ""}):`);
if (doSep) console.log(`  separators compacted: ${totalSep} across ${sepFiles} files`);
if (doFence) console.log(`  fences tagged:        ${totalFence} across ${fenceFiles} files`);
console.log(`  files ${dry ? "to change" : "written"}: ${written} (of ${files.length} scanned)`);
