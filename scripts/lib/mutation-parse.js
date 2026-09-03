/**
 * mutation-parse.js — does a mutant still PARSE, for every file type the tool accepts (#758).
 *
 * Extracted from `scripts/mutation-check.js` for the reason `mutation-verdict.js` was: that file
 * runs its whole pipeline at module scope, so importing it to test one decision executes a
 * mutation. The decision here — "is this content syntactically a file of its type" — is the
 * gate between a mutant that can be judged and one that cannot.
 *
 * ## Why a boolean was the wrong shape
 *
 * The first `parses()` returned `true` for every extension it did not know. That is not a
 * pass; it is silence dressed as one. Step `[3/5]` then printed `it parses.` for a `.py` file
 * nobody had checked, and a `def` stripped of its colon — a file Python cannot import at all —
 * scored `MUTANT KILLED by 1 failing test(s)` (#758). The count was a test asserting the
 * generator exits 0; it reddened because the file was broken, not because the mutated behaviour
 * was asserted anywhere. Byte for byte indistinguishable from a real kill of the same line —
 * which is the false confidence the JS half of this guard was added to prevent (#621).
 *
 * So the answer is a verdict, and every verdict says what was done:
 *
 *   ok               a checker ran and accepted the content
 *   invalid          a checker ran and rejected it (its stderr is in `detail`)
 *   syntax-free      the type has no syntax to check — every byte sequence is a valid `.md` —
 *                    so the INVALID verdict cannot apply; the caller proceeds and SAYS so
 *   no-checker       the type has syntax and this module knows no checker for it; the caller
 *                    must refuse rather than guess (a mutation-check that cannot reach INVALID
 *                    for a file must not report kills on it)
 *   checker-missing  a checker is known but its interpreter is not on this machine's PATH;
 *                    inconclusive, never a pass
 *
 * ## The checkers, measured 2026-09-03 (exit codes bad / good)
 *
 *   python3 -c 'import ast,sys; ast.parse(sys.stdin.read())'    1 / 0
 *   bash -n                                                      2 / 0   (reads stdin with no file)
 *   Rscript -e 'invisible(parse(file="stdin"))'                  1 / 0
 *   node --check <probe with the right extension>                1 / 0
 *   js-yaml loadAll / JSON.parse                                 in-process
 *
 * Content is fed on STDIN for the external checkers, not through a probe file: `py_compile`
 * would drop a `__pycache__/` beside a probe, and none of the three needs a path. Node is the
 * exception and keeps the probe file, because `node --check` decides module type from the
 * extension and the package's `type`, and a `.js` in an ESM package must be probed as `.mjs`
 * or the guard is dead for every `.js` file here (the case measured for #621).
 *
 * YAML goes through `js-yaml`, loaded dynamically so this module stays importable in a tree
 * without `node_modules`; if the package cannot be resolved the verdict is `checker-missing`,
 * which is honest in the bare-tree case and irrelevant everywhere `npm ci` ran.
 */
import { spawnSync as realSpawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, resolve } from 'node:path';

/** Types where every byte sequence is a valid file, so "does it parse" has no content. */
export const SYNTAX_FREE_EXTENSIONS = new Set(['.md', '.markdown', '.txt']);

/** External checkers: interpreter on PATH, args, content on stdin. Exit 0 = parses. */
export const STDIN_CHECKERS = {
  '.py': { name: 'python3 ast.parse', bin: 'python3', args: ['-c', 'import ast,sys; ast.parse(sys.stdin.read())'] },
  '.sh': { name: 'bash -n', bin: 'bash', args: ['-n'] },
  '.bash': { name: 'bash -n', bin: 'bash', args: ['-n'] },
  '.R': { name: 'Rscript parse()', bin: 'Rscript', args: ['-e', 'invisible(parse(file="stdin"))'] },
  '.r': { name: 'Rscript parse()', bin: 'Rscript', args: ['-e', 'invisible(parse(file="stdin"))'] },
};

const NODE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
const YAML_EXTENSIONS = new Set(['.yml', '.yaml']);
const JSON_EXTENSIONS = new Set(['.json']);

/** Every extension a checker exists for — the list the tool prints when it refuses one. */
export const CHECKED_EXTENSIONS = [
  ...NODE_EXTENSIONS, ...YAML_EXTENSIONS, ...JSON_EXTENSIONS, ...Object.keys(STDIN_CHECKERS),
];

/**
 * What this module can do with an extension: 'syntax-free', 'checker' or 'no-checker'.
 * Case-sensitive on purpose — `.R` is R, and no checker is claimed for spellings nobody uses.
 */
export function classifyExtension(ext) {
  if (SYNTAX_FREE_EXTENSIONS.has(ext)) return 'syntax-free';
  if (NODE_EXTENSIONS.has(ext) || YAML_EXTENSIONS.has(ext) || JSON_EXTENSIONS.has(ext)
      || Object.hasOwn(STDIN_CHECKERS, ext)) return 'checker';
  return 'no-checker';
}

/** Human-readable name of the checker for an extension, or null. */
export function checkerName(ext) {
  if (NODE_EXTENSIONS.has(ext)) return 'node --check';
  if (YAML_EXTENSIONS.has(ext)) return 'js-yaml loadAll';
  if (JSON_EXTENSIONS.has(ext)) return 'JSON.parse';
  return STDIN_CHECKERS[ext]?.name ?? null;
}

/** The `type` of the nearest package.json above `dir`, defaulting to commonjs. */
export function packageType(dir, stopAt) {
  let cur = dir;
  for (;;) {
    const manifest = resolve(cur, 'package.json');
    if (existsSync(manifest)) {
      try {
        return JSON.parse(readFileSync(manifest, 'utf8')).type ?? 'commonjs';
      } catch {
        return 'commonjs';
      }
    }
    if (cur === stopAt || dirname(cur) === cur) return 'commonjs';
    cur = dirname(cur);
  }
}

function tail(text, lines = 6) {
  return String(text ?? '').trim().split('\n').slice(-lines).join('\n');
}

/**
 * Decide whether `content`, standing in for `filePath`, parses as a file of its type.
 *
 * @param {string} filePath - the real path (its extension and package decide the checker)
 * @param {string} content - the bytes to judge (the mutant, or the original as a dry run)
 * @param {string} repoRootDir - where the package.json walk stops
 * @param {object} [deps] - injectable for tests: `spawnSync`, `importYaml`
 * @returns {Promise<{verdict: string, checker: string|null, detail: string}>}
 */
export async function checkSyntax(filePath, content, repoRootDir, deps = {}) {
  const spawnSync = deps.spawnSync ?? realSpawnSync;
  const importYaml = deps.importYaml ?? (() => import('js-yaml'));
  const ext = extname(filePath);
  const klass = classifyExtension(ext);

  if (klass === 'syntax-free') {
    return { verdict: 'syntax-free', checker: null, detail: `no syntax to check for '${ext}'` };
  }
  if (klass === 'no-checker') {
    return { verdict: 'no-checker', checker: null, detail: `no syntax checker is known for '${ext}'` };
  }

  if (JSON_EXTENSIONS.has(ext)) {
    try {
      JSON.parse(content);
      return { verdict: 'ok', checker: 'JSON.parse', detail: '' };
    } catch (err) {
      return { verdict: 'invalid', checker: 'JSON.parse', detail: err.message };
    }
  }

  if (YAML_EXTENSIONS.has(ext)) {
    let yaml;
    try {
      yaml = await importYaml();
    } catch (err) {
      return { verdict: 'checker-missing', checker: 'js-yaml loadAll', detail: `js-yaml could not be loaded (${err.code ?? err.message})` };
    }
    try {
      yaml.loadAll(content);
      return { verdict: 'ok', checker: 'js-yaml loadAll', detail: '' };
    } catch (err) {
      return { verdict: 'invalid', checker: 'js-yaml loadAll', detail: err.message };
    }
  }

  if (NODE_EXTENSIONS.has(ext)) {
    const probeExt = ext !== '.js'
      ? ext
      : (packageType(dirname(filePath), repoRootDir) === 'module' ? '.mjs' : '.cjs');
    const probe = resolve(tmpdir(), `mutation-check-probe-${process.pid}-${Date.now()}${probeExt}`);
    try {
      writeFileSync(probe, content);
      const run = spawnSync(process.execPath, ['--check', probe], { encoding: 'utf8' });
      if (run.error) {
        return { verdict: 'checker-missing', checker: 'node --check', detail: `node could not be spawned (${run.error.code ?? run.error.message})` };
      }
      return run.status === 0
        ? { verdict: 'ok', checker: 'node --check', detail: '' }
        : { verdict: 'invalid', checker: 'node --check', detail: tail(run.stderr) };
    } finally {
      try { unlinkSync(probe); } catch { /* best effort */ }
    }
  }

  const checker = STDIN_CHECKERS[ext];
  const run = spawnSync(checker.bin, checker.args, { input: content, encoding: 'utf8' });
  if (run.error) {
    const missing = run.error.code === 'ENOENT';
    return {
      verdict: 'checker-missing',
      checker: checker.name,
      detail: missing
        ? `${checker.bin} is not on PATH, so '${ext}' syntax cannot be checked on this machine`
        : `${checker.bin} could not be run (${run.error.code ?? run.error.message})`,
    };
  }
  return run.status === 0
    ? { verdict: 'ok', checker: checker.name, detail: '' }
    : { verdict: 'invalid', checker: checker.name, detail: tail(run.stderr) };
}
