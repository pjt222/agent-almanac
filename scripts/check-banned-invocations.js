#!/usr/bin/env node
/**
 * Fail when documentation instructs a reader to run a command the repository bans.
 *
 * WHY THIS EXISTS (#526)
 *
 * `check-i18n-fence-parity.js` freezes a translated code fence to a body appearing in
 * *some* revision of the paired English file. That is deliberate — it lets a translation
 * lag without being called a violation. But it makes the gate answer "was this ever
 * English?", never "is this English now?", and those two questions differ in exactly one
 * case: when English deletes something on purpose.
 *
 * English commit acc252e6d ("eliminate bare Rscript calls") replaced every
 * `Rscript build-*-icons.R` with `bash viz/build.sh`, because direct Rscript calls bypass
 * platform detection and can select the wrong R binary. Three locales never received it,
 * and the parity checker prints "OK: every gated code fence matches an English source
 * revision" over eighteen of them. A deletion cannot propagate through a historical-match
 * gate; the old text stays frozen, valid and green forever.
 *
 * Two further instances of the same drift were prose — a bare `Rscript
 * generate-palette-colors.R` in all four full locales, and a stale hardcoded count in all
 * ten — so a fence-shaped fix could not have worked either. Half the corpus this needs to
 * cover is not in fences at all.
 *
 * Hence: content-based, corpus-wide, prose and fences alike, matching a small enumerated
 * list of forbidden strings. The scope is what is banned, not where it might hide.
 *
 * Usage:
 *   node scripts/check-banned-invocations.js            # scan, exit 1 on any hit
 *   node scripts/check-banned-invocations.js --root DIR # scan an alternate tree (tests)
 *   node scripts/check-banned-invocations.js --list     # print the rule table and exit 0
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { CONTENT_TYPES } from './lib/content-types.js';

/**
 * The banned forms and what to use instead.
 *
 * `pattern` must be a literal substring, not a regex: the failure this tool exists to
 * catch was a regex (`Rscript build-.*-icons\.R`) scoped so tightly it could not match
 * `generate-palette-colors.R` and returned a confident zero. Literals cannot silently
 * under-match.
 */
const BANNED = [
  { pattern: 'Rscript build-icons.R',             use: 'bash viz/build.sh' },
  { pattern: 'Rscript build-agent-icons.R',       use: 'bash viz/build.sh --type agent' },
  { pattern: 'Rscript build-team-icons.R',        use: 'bash viz/build.sh --type team' },
  { pattern: 'Rscript generate-palette-colors.R', use: 'bash viz/build.sh' },
];

/**
 * Skills allowed to contain the banned strings, by skill id — which covers every locale
 * mirror at once, so a translation cannot drift out of its own exemption.
 *
 * Default-deny: a skill is exempt only by appearing here, and every entry must name the
 * reason. An allowlist of "documentation-ish" paths would be edited by moving a file.
 */
const EXEMPT_SKILLS = new Map([
  ['render-icon-pipeline', 'Quotes the banned forms in order to ban them ("Never run ...").'],
]);

/**
 * Trees to walk, derived from the SSOT (#578). `docs/` is excluded: it analyses what
 * build.sh calls internally.
 *
 * Sharing the constant is justified rather than convenient: this walks both the English
 * trees and their locale MIRRORS (join(locDir, tree)), and mirrors exist for exactly the
 * content types. If the two ever needed to diverge, that divergence would itself be the
 * bug — a content type with a mirror that this gate does not scan.
 *
 * Local binding, not a bare re-export: this module reads TREES internally. (Nothing is
 * exported from here — it is an imported binding aliased to a local const.)
 */
const TREES = CONTENT_TYPES;

function parseArgs(argv) {
  const out = { root: process.cwd(), list: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--list') out.list = true;
    else if (argv[i] === '--root') {
      out.root = argv[i + 1];
      if (!out.root) { console.error('--root requires a directory'); process.exit(2); }
      i += 1;
    } else if (argv[i].startsWith('--')) {
      console.error(`unknown flag: ${argv[i]}`);
      process.exit(2);
    }
  }
  return out;
}

/** Every markdown file under a content tree, recursively. */
function markdownUnder(dir, acc = []) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return acc;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const abs = join(dir, entry);
    const st = statSync(abs);
    if (st.isDirectory()) markdownUnder(abs, acc);
    else if (st.isFile() && entry.endsWith('.md')) acc.push(abs);
  }
  return acc;
}

/**
 * The skill id a path belongs to, or null.
 * Handles both `skills/<id>/SKILL.md` and `i18n/<locale>/skills/<id>/SKILL.md`.
 */
function skillIdOf(relPath) {
  const parts = relPath.split(/[/\\]/);
  const i = parts.indexOf('skills');
  if (i === -1 || i + 1 >= parts.length) return null;
  return parts[i + 1];
}

function collectFiles(root) {
  const roots = [];
  for (const tree of TREES) roots.push(join(root, tree));
  const i18n = join(root, 'i18n');
  if (existsSync(i18n) && statSync(i18n).isDirectory()) {
    for (const loc of readdirSync(i18n)) {
      const locDir = join(i18n, loc);
      if (!statSync(locDir).isDirectory()) continue;
      for (const tree of TREES) roots.push(join(locDir, tree));
    }
  }
  const files = [];
  for (const r of roots) markdownUnder(r, files);
  return files;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.list) {
    console.log('Banned invocations (literal substring match, prose and fences alike):\n');
    for (const b of BANNED) console.log(`  ${b.pattern}\n      use: ${b.use}`);
    console.log('\nExempt skills (all locales):\n');
    for (const [id, why] of EXEMPT_SKILLS) console.log(`  ${id}\n      ${why}`);
    process.exit(0);
  }

  const files = collectFiles(args.root);
  if (files.length === 0) {
    console.error(`banned-invocations: no markdown found under ${args.root} — refusing to report success.`);
    process.exit(2);
  }

  const hits = [];
  let exemptFiles = 0;
  for (const abs of files) {
    const rel = relative(args.root, abs).split('\\').join('/');
    const id = skillIdOf(rel);
    if (id && EXEMPT_SKILLS.has(id)) { exemptFiles += 1; continue; }
    const lines = readFileSync(abs, 'utf8').replace(/\r\n/g, '\n').split('\n');
    lines.forEach((line, n) => {
      for (const b of BANNED) {
        if (line.includes(b.pattern)) hits.push({ rel, line: n + 1, text: line.trim(), banned: b });
      }
    });
  }

  console.log(`banned-invocations: scanned ${files.length} markdown file(s) ` +
              `(${exemptFiles} skipped as exempt), ${BANNED.length} banned form(s).`);

  if (hits.length === 0) {
    console.log('OK: no banned invocation is published anywhere in the content trees.');
    process.exit(0);
  }

  const byFile = new Map();
  for (const h of hits) {
    if (!byFile.has(h.rel)) byFile.set(h.rel, []);
    byFile.get(h.rel).push(h);
  }
  console.log(`\n${hits.length} banned invocation(s) across ${byFile.size} file(s):\n`);
  for (const [rel, list] of [...byFile.entries()].sort()) {
    console.log(`  ${rel}`);
    for (const h of list) {
      console.log(`    ${String(h.line).padStart(5)}: ${h.text.slice(0, 96)}`);
      console.log(`           use instead: ${h.banned.use}`);
    }
  }
  console.log('\nThese are commands the repository bans (CLAUDE.md "Viz Deploy Model";');
  console.log('skills/render-icon-pipeline/SKILL.md). A frozen fence that still carries one');
  console.log('passes check-i18n-fence-parity.js, which asks whether a body was EVER English,');
  console.log('never whether it is English NOW — see #526.');
  process.exit(1);
}

main();
