#!/usr/bin/env node
/**
 * scan-skill-content.js — content-security self-gate over skills/ (#436, from #422 P0).
 *
 * Skill content flows OUTWARD to every consumer via the discovery symlink farm and
 * `install-almanac-content`, so a leaked credential or an unsafe executable committed
 * in a skill reaches everyone. This gate scans skill files for two high-signal classes
 * and fails closed:
 *
 *   1. SECRET LEAKS in any skill file (SKILL.md, references/**, scripts/**) — real
 *      credential shapes only, placeholder-aware so the security-*teaching* skills
 *      (which quote token shapes as examples) do not false-fire.
 *   2. DANGEROUS EXECUTABLES in skills/ ** /scripts/** only — `curl … | bash`,
 *      `bash -c "$(curl …)"`, `bash <(curl …)`, `eval "$(curl …)"`, broad `rm -rf`,
 *      world-writable `chmod`.
 *
 * SCOPING NOTE (deliberate): the danger scan covers committed executables under a
 * scripts/ dir, NOT SKILL.md prose. Skill prose legitimately documents install
 * commands (e.g. setup-local-kubernetes / setup-service-mesh show `curl … | sh`), so
 * scanning prose would false-fire on real content. Prose-level danger detection with an
 * allowlist over those install skills is deferred to v2 (see #436).
 *
 * Suppress a verified-safe match with an inline `<!-- security-scan-ignore: reason -->`
 * (or `# security-scan-ignore: reason`) on the matching line or the line directly above,
 * OR mark a value as a documented example with a placeholder marker (example, <...>,
 * YOUR_…, placeholder). A reason is required — narrow at the source, no blanket suppression.
 *
 *   node scripts/scan-skill-content.js            # exit 0 = clean, exit 1 = finding
 *   node scripts/scan-skill-content.js --json      # machine-readable findings
 */
import { readFileSync, readdirSync, lstatSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve, sep } from 'node:path';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const skillsDir = join(repoRoot, 'skills');
const jsonOut = process.argv.includes('--json');

// ── secret shapes ────────────────────────────────────────────────────────────
const SECRET_RULES = [
  { id: 'private-key', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  // an END footer alone catches a header split across lines by markdown reflow
  { id: 'private-key-footer', re: /-----END (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { id: 'aws-access-key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'github-token', re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/ },
  { id: 'slack-token', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { id: 'google-api-key', re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: 'stripe-key', re: /\b(?:sk|rk)_live_[A-Za-z0-9]{24,}\b/ },
  {
    id: 'generic-secret-assignment',
    // optional prefix/suffix so compound env names match (AWS_SECRET_ACCESS_KEY, DB_PASSWORD_PROD)
    re: /\b(?:[A-Za-z0-9]+[_-])*(?:password|passwd|secret|api[_-]?key|secret[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|access[_-]?key)(?:[_-][A-Za-z0-9]+)*\b\s*[:=]\s*["'`]?([^"'`\s]{16,})["'`]?/i,
    valueGroup: 1,
  },
];

const PLACEHOLDER_MARKERS = [
  'example', 'xxxx', 'yyyy', 'your_', 'your-', 'placeholder', 'dummy', 'redacted',
  'changeme', 'change-me', 'todo', 'fixme', 'foo', 'bar', 'sample',
  '...', '<', '>', '{{', '}}', '${', 'notarealkey', 'fake',
];
const REGEX_CONTEXT = /\[[0-9a-zA-Z_\\-]{2,}\]|\\[dws]|\{\d+(?:,\d*)?\}|\(\?:|\/[gimsuy]*\s*[,)]/;

// Example/teaching context — applies to the high-precision SHAPE rules (private-key,
// AKIA, ghp_, …): an explicit placeholder marker or a regex-detection quote.
function isExampleContext(line, value) {
  const hayVal = (value || '').toLowerCase();
  if (PLACEHOLDER_MARKERS.some((m) => hayVal.includes(m))) return true;
  if (REGEX_CONTEXT.test(line)) return true;
  return false;
}

// The generic key=value rule does NOT use the loose marker substring check (a real
// secret containing "test"/"foo" must not self-mask). It fires unless the captured
// value is provably not a real random secret.
function isWeakSecretValue(raw) {
  if (!raw) return true;
  const value = raw.replace(/[,;:)\]}'"`.]+$/, ''); // strip trailing punctuation from the capture
  if (!value) return true;
  if (REGEX_CONTEXT.test(value)) return true;                // a detection pattern, not a literal
  if (/[$%<>]/.test(value)) return true;                     // env/cmd/template ref or <placeholder>
  if (/^[A-Z_]{3,}$/.test(value)) return true;               // ALL_CAPS stand-in
  if (/^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/i.test(value)) return true; // snake_case identifier / variable ref (resolved_api_key)
  if (/^[a-z]+([-_ /][a-z]+)+$/i.test(value)) return true;   // dictionary words joined by -_/space (webhook-password, argocd/git-creds)
  // names its own kind, or is an obvious example value
  if (/(?:password|passwd|secret|api[_-]?key|token|credential|creds|example|placeholder|changeme|redacted|dummy|sample|your[_-]|abc123|xxxx|yyyy)/i.test(value)) return true;
  if (/0123456789|1234567890|abcdefabcdef|abcdef0123456789|deadbeef|0000000000|\.\.\./i.test(value)) return true;
  if (/(.)\1{4,}/.test(value)) return true;                  // 5+ repeated char
  if (new Set(value).size < 6) return true;                  // low diversity
  return false;
}

// ── dangerous executable patterns (scripts/ only, run on continuation-joined lines) ──
const DANGER_RULES = [
  { id: 'curl-pipe-shell', re: /\bcurl\b[^|]*\|\s*(?:sudo\s+)?(?:bash|sh|zsh)\b/ },
  { id: 'wget-pipe-shell', re: /\bwget\b[^|]*\|\s*(?:sudo\s+)?(?:bash|sh|zsh)\b/ },
  { id: 'shell-c-cmdsub', re: /\b(?:bash|sh|zsh)\b\s+(?:-[A-Za-z]*c[A-Za-z]*\s+)?["'`]?\$\(\s*(?:curl|wget)\b/ },
  { id: 'shell-procsub', re: /\b(?:bash|sh|zsh)\b\s+["'`]?<\(\s*(?:curl|wget)\b/ },
  { id: 'eval-curl', re: /\beval\b\s*["'`]?\$\(\s*(?:curl|wget)\b/ },
  // rm with recursive AND force (short or long, any order) targeting a root-ish path
  { id: 'rm-rf-root', re: /\brm\b(?=[^\n]*(?:-[A-Za-z]*r|--recursive))(?=[^\n]*(?:-[A-Za-z]*f|--force))[^\n]*?\s(?:\/(?:\s|$|\*)|~\/?(?:\s|$|\*)|\$HOME\b|\$\{HOME\})/ },
  { id: 'chmod-777', re: /\bchmod\s+(?:-[A-Za-z]+\s+)*777\b/ },
  // world/other-writable symbolic mode (chmod a+rwx, o+w, ugo+rwx …)
  { id: 'chmod-world-write', re: /\bchmod\s+(?:-[A-Za-z]+\s+)*(?:a|o|ugo|go)\+[rwxXst]*w/ },
];

const BINARY_EXT = /\.(png|jpe?g|gif|webp|ico|svg|pdf|zip|gz|bz2|xz|7z|rar|tar|woff2?|ttf|otf|eot|mp4|mp3|wav|wasm|exe|so|dll|dylib|class|jar|db|sqlite|bin)$/i;

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of entries) {
    const p = join(dir, name);
    let st;
    try {
      st = lstatSync(p); // lstat: do not follow symlinks (no cycle risk, no escaping skills/)
    } catch {
      continue;
    }
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) walk(p, acc);
    else if (st.isFile()) acc.push(p);
  }
  return acc;
}

function isSuppressed(lines, idx) {
  const here = lines[idx] || '';
  const above = lines[idx - 1] || '';
  const re = /(?:<!--|#)\s*security-scan-ignore:\s*\S/;
  return re.test(here) || re.test(above);
}

// join backslash line-continuations into logical lines, keeping the first line number
function logicalLines(physical) {
  const out = [];
  let buf = null;
  let start = 0;
  physical.forEach((line, i) => {
    if (buf === null) {
      start = i;
      buf = line;
    } else {
      buf += ' ' + line;
    }
    if (/\\\s*$/.test(line)) {
      buf = buf.replace(/\\\s*$/, ' ');
    } else {
      out.push({ text: buf, line: start });
      buf = null;
    }
  });
  if (buf !== null) out.push({ text: buf, line: start });
  return out;
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

  // secrets: per physical line
  lines.forEach((line, i) => {
    if (isSuppressed(lines, i)) return;
    for (const rule of SECRET_RULES) {
      const m = line.match(rule.re);
      if (!m) continue;
      const value = rule.valueGroup ? m[rule.valueGroup] : m[0];
      if (rule.valueGroup) {
        if (isWeakSecretValue(value)) continue;
      } else if (isExampleContext(line, value)) {
        continue;
      }
      findings.push({ severity: 'CRITICAL', kind: 'secret', rule: rule.id, file: rel, line: i + 1 });
    }
  });

  // dangerous executables: continuation-joined logical lines, scripts/ only
  if (inScripts) {
    for (const { text, line } of logicalLines(lines)) {
      if (isSuppressed(lines, line)) continue;
      for (const rule of DANGER_RULES) {
        if (rule.re.test(text)) {
          findings.push({ severity: 'HIGH', kind: 'dangerous-exec', rule: rule.id, file: rel, line: line + 1 });
        }
      }
    }
  }
}

const HINT = 'verify and remove; if it is a documented example use a placeholder marker (example, <placeholder>, YOUR_TOKEN) or an inline "security-scan-ignore: <reason>"';

if (jsonOut) {
  console.log(JSON.stringify({ filesScanned, findings }, null, 2));
} else {
  for (const f of findings) {
    console.error(`::error file=${f.file},line=${f.line}::[${f.severity}] ${f.kind} (${f.rule}) — ${HINT}`);
  }
  if (findings.length === 0) {
    console.log(`scan-skill-content: OK — ${filesScanned} skill file(s) scanned, 0 findings`);
  } else {
    console.error(`\nscan-skill-content: ${findings.length} finding(s) across ${filesScanned} files:`);
    for (const f of findings) console.error(`  - [${f.severity}] ${f.file}:${f.line} ${f.kind}/${f.rule}`);
  }
}

process.exit(findings.length > 0 ? 1 : 0);
