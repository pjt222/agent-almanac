#!/usr/bin/env node
/**
 * scan-skill-content.js — content-security self-gate over skills/ (#436, from #422 P0).
 *
 * Skill content flows OUTWARD to every consumer via the discovery symlink farm and
 * `install-almanac-content`, so a leaked credential or an unsafe executable committed
 * in a skill reaches everyone. This gate scans skill files for two high-signal,
 * low-false-positive classes and fails closed:
 *
 *   1. SECRET LEAKS in any skill file (SKILL.md, references/**, scripts/**) — real
 *      credential shapes only, placeholder-aware so the security-*teaching* skills
 *      (which quote token shapes as examples) do not false-fire.
 *   2. DANGEROUS EXECUTABLES in skills/ ** /scripts/** only (real code, not prose) —
 *      `curl … | bash`, `wget … | sh`, `eval "$(curl …`, broad `rm -rf`, `chmod 777`.
 *
 * Prose in SKILL.md is instructional, so dangerous-command patterns there are NOT
 * flagged (the corpus documents them as things to avoid); only committed executables
 * under a scripts/ dir are treated as runnable.
 *
 * Suppress a verified-safe match with an inline `<!-- security-scan-ignore: reason -->`
 * on the matching line or the line directly above it (a reason is required — narrow at
 * the source, no blanket suppression).
 *
 *   node scripts/scan-skill-content.js            # exit 0 = clean, exit 1 = finding
 *   node scripts/scan-skill-content.js --json      # machine-readable findings
 *
 * Mirrors the CI gate (.github/workflows/validate-security.yml).
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve, sep } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const skillsDir = join(repoRoot, 'skills');
const jsonOut = process.argv.includes('--json');

// ── secret shapes (real credentials, not placeholders) ───────────────────────
const SECRET_RULES = [
  { id: 'private-key', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { id: 'aws-access-key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'github-token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { id: 'slack-token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { id: 'google-api-key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'stripe-key', re: /\b(?:sk|rk)_live_[A-Za-z0-9]{24,}\b/ },
  {
    id: 'generic-secret-assignment',
    // key = "value" where value is >=16 chars, mixed, no whitespace
    re: /\b(?:password|passwd|secret|api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret)\b\s*[:=]\s*["'`]([^"'`\s]{16,})["'`]/i,
    valueGroup: 1,
  },
];

// A match is a placeholder / teaching example (not a real leak) when the line or the
// captured value carries any of these markers. Keeps the security skills from firing.
const PLACEHOLDER_MARKERS = [
  'example', 'xxxx', 'yyyy', 'your_', 'your-', 'placeholder', 'dummy', 'redacted',
  'changeme', 'change-me', 'todo', 'fixme', 'foo', 'bar', 'sample', 'test',
  '...', '<', '>', '{{', '}}', '${', 'abc123', 'notarealkey', 'fake', 'sk_test_',
];
// Regex-definition context: the "secret" is actually a detection pattern in a security
// skill (e.g. a character class or quantifier next to the match).
const REGEX_CONTEXT = /\[[0-9a-zA-Z_\\-]{2,}\]|\\[dws]|\{\d+(?:,\d*)?\}|\(\?:|\/[gimsuy]*\s*[,)]/;

// Example/teaching context — applies to ALL rules. A match here is documentation
// (an explicit placeholder marker, or a detection pattern quoted in a security skill).
function isExampleContext(line, value) {
  const hayVal = (value || '').toLowerCase();
  if (PLACEHOLDER_MARKERS.some((m) => hayVal.includes(m))) return true;
  if (REGEX_CONTEXT.test(line)) return true;
  return false;
}

// Value heuristics — applies ONLY to the generic key=value rule, whose captured value
// must look like a real random secret. High-precision shape rules (private-key, AKIA,
// ghp_, …) skip these so a genuine leaked key is never masked by, e.g., its own dashes.
function isWeakSecretValue(value) {
  if (!value) return true;
  // env / command / template references are not literal secrets ($VAR, ${VAR}, $(...), %VAR%)
  if (/[$%]/.test(value)) return true;
  // ALL_CAPS token used as a stand-in value
  if (/^[A-Z_]{3,}$/.test(value)) return true;
  // dictionary placeholders: lowercase words joined by -, _ or space (webhook-password)
  if (/^[a-z]+([-_ ][a-z]+)+$/.test(value)) return true;
  // the value names its own kind → a label, not a secret
  if (/(?:^|[-_])(?:key|secret|password|passwd|token|jwt|webhook|signing|user|client|cookie|value|here|string)(?:$|[-_])/i.test(value)) return true;
  // obvious sequences / repeated fillers
  if (/0123456789|1234567890|abcdefabcdef|abcdef0123456789|deadbeef|0000000000/i.test(value)) return true;
  if (/(.)\1{4,}/.test(value)) return true; // 5+ of the same char in a row
  // low character diversity is not a real secret
  if (new Set(value).size < 6) return true;
  return false;
}

// ── dangerous executable patterns (scripts/ only) ────────────────────────────
const DANGER_RULES = [
  { id: 'curl-pipe-shell', re: /\bcurl\b[^\n|]*\|\s*(?:sudo\s+)?(?:bash|sh|zsh)\b/ },
  { id: 'wget-pipe-shell', re: /\bwget\b[^\n|]*\|\s*(?:sudo\s+)?(?:bash|sh|zsh)\b/ },
  { id: 'eval-curl', re: /\beval\b\s*["'`]?\$\(\s*(?:curl|wget)\b/ },
  { id: 'rm-rf-root', re: /\brm\s+-[a-z]*rf?[a-z]*\s+(?:\/(?:\s|$|\*)|~\/?(?:\s|$|\*)|\$HOME\b|\$\{HOME\})/ },
  { id: 'chmod-777', re: /\bchmod\s+(?:-[A-Za-z]+\s+)*777\b/ },
];

// ── file walk ────────────────────────────────────────────────────────────────
function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const BINARY_EXT = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|woff2?|ttf|otf|mp4|mp3|wasm)$/i;

function isSuppressed(lines, idx) {
  const here = lines[idx] || '';
  const above = lines[idx - 1] || '';
  return /<!--\s*security-scan-ignore:\s*\S/.test(here) || /<!--\s*security-scan-ignore:\s*\S/.test(above)
    || /#\s*security-scan-ignore:\s*\S/.test(here) || /#\s*security-scan-ignore:\s*\S/.test(above);
}

const findings = [];
let filesScanned = 0;

for (const abs of walk(skillsDir)) {
  if (BINARY_EXT.test(abs)) continue;
  const rel = relative(repoRoot, abs).split(sep).join('/');
  const inScripts = rel.includes('/scripts/');
  let content;
  try {
    content = readFileSync(abs, 'utf8');
  } catch {
    continue;
  }
  filesScanned++;
  const lines = content.split(/\r?\n/);

  lines.forEach((line, i) => {
    if (isSuppressed(lines, i)) return;

    for (const rule of SECRET_RULES) {
      const m = line.match(rule.re);
      if (!m) continue;
      const value = rule.valueGroup ? m[rule.valueGroup] : m[0];
      if (isExampleContext(line, value)) continue;
      // the generic key=value rule additionally requires a real-looking (high-entropy) value
      if (rule.valueGroup && isWeakSecretValue(value)) continue;
      findings.push({ severity: 'CRITICAL', kind: 'secret', rule: rule.id, file: rel, line: i + 1 });
    }

    if (inScripts) {
      for (const rule of DANGER_RULES) {
        if (rule.re.test(line)) {
          findings.push({ severity: 'HIGH', kind: 'dangerous-exec', rule: rule.id, file: rel, line: i + 1 });
        }
      }
    }
  });
}

if (jsonOut) {
  console.log(JSON.stringify({ filesScanned, findings }, null, 2));
} else {
  for (const f of findings) {
    console.error(`::error file=${f.file},line=${f.line}::[${f.severity}] ${f.kind} (${f.rule}) — verify and remove, or suppress with an inline "security-scan-ignore: <reason>" if it is a documented example`);
  }
  if (findings.length === 0) {
    console.log(`scan-skill-content: OK — ${filesScanned} skill file(s) scanned, 0 findings`);
  } else {
    console.error(`\nscan-skill-content: ${findings.length} finding(s) across ${filesScanned} files:`);
    for (const f of findings) console.error(`  - [${f.severity}] ${f.file}:${f.line} ${f.kind}/${f.rule}`);
  }
}

process.exit(findings.length > 0 ? 1 : 0);
