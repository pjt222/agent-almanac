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
 *   invalid          a checker ran and rejected it (its own message is in `detail`)
 *   syntax-free      the type has no syntax to check — every byte sequence is a valid `.md` —
 *                    so the INVALID verdict cannot apply; the caller proceeds and SAYS so
 *   no-checker       the type has syntax and this module knows no checker for it; the caller
 *                    must refuse rather than guess (a mutation-check that cannot reach INVALID
 *                    for a file must not report kills on it)
 *   checker-missing  a checker is known but did not render a verdict: its interpreter is not on
 *                    PATH, it could not be spawned, it was killed by a signal, or (YAML) the
 *                    parser package could not be loaded or itself threw. Inconclusive, never a
 *                    pass — and never `invalid` either, which would be this tool's own lie in
 *                    mirror image: "it does NOT parse" about a checker that never answered
 *
 * ## The checkers, measured 2026-09-03 (exit codes bad / good)
 *
 *   python3 -I -c 'import sys; compile(sys.stdin.read(), "<mutant>", "exec")'   1 / 0
 *   bash -n                                                                     2 / 0
 *   Rscript --vanilla -e 'invisible(parse(file="stdin"))'                       1 / 0
 *   node --check <probe with the right extension>                               1 / 0
 *   node --check - over the wrapped Workflow dialect (see below)                1 / 0
 *   js-yaml loadAll / JSON.parse                                                in-process
 *
 * `compile()`, not `ast.parse()`: the adversarial review of the first draft measured that
 * `ast.parse("return 1")` exits 0 while `compile("return 1", ...)` reports `'return' outside
 * function` — the symbol-table checks run only in `compile`, so `return`, `break` and `await`
 * placed illegally were a residual member of exactly the class this module closes. `compile`
 * writes nothing, which was the reason for avoiding `py_compile` (a `__pycache__/` beside a
 * probe). `-I` and `--vanilla` keep startup files out of it: without them a broken
 * `sitecustomize` or, in this repository, `viz/.Rprofile` sourcing renv can make a perfectly
 * good file "not parse" when the tool is run from that directory.
 *
 * Content is fed on STDIN for the external checkers, not through a probe file; none of them
 * needs a path. Node is the exception and keeps the probe file for ordinary JS, because
 * `node --check` decides module type from the extension and the package's `type`, and a `.js`
 * in an ESM package must be probed as `.mjs` or the guard is dead for every `.js` file here
 * (the case measured for #621).
 *
 * ## The Workflow dialect
 *
 * `workflows/*.mjs` are Claude Code Workflow scripts: the runtime wraps the body in an async
 * function, so they carry a top-level `return` that a raw ES module rejects — `node --check`
 * says "Illegal return statement" on a perfectly valid workflow, unmutated. The first #773
 * proof hit exactly that: `INVALID MUTANT` on the original. A file whose path is
 * `…/workflows/<name>.mjs` is therefore checked with the recipe `workflows/_template.mjs`
 * documents and `workflow-template.test.js` enforces: strip `export` from `export const meta`,
 * wrap in `(async()=>{ … })()`, and `node --check -` on stdin. The dialect is keyed by PATH,
 * not content, because that is what the runtime keys on too.
 *
 * A leading BOM is stripped before any checker sees the bytes: Python's loader and `require()`
 * both accept one, `JSON.parse` does not, and a BOM is not a syntax property of the file.
 *
 * YAML goes through `js-yaml`, loaded dynamically so this module stays importable in a tree
 * without `node_modules`; if the package cannot be resolved the verdict is `checker-missing`,
 * and so is any throw that is not js-yaml's own `YAMLException` — a parser that broke is not a
 * file that does not parse.
 */
import { spawnSync as realSpawnSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, resolve } from 'node:path';

/** Types where every byte sequence is a valid file, so "does it parse" has no content. */
export const SYNTAX_FREE_EXTENSIONS = new Set(['.md', '.markdown', '.txt']);

/** External checkers: interpreter on PATH, args, content on stdin. Exit 0 = parses. */
export const STDIN_CHECKERS = {
  '.py': { name: 'python3 compile()', bin: 'python3', args: ['-I', '-c', 'import sys; compile(sys.stdin.read(), "<mutant>", "exec")'] },
  '.sh': { name: 'bash -n', bin: 'bash', args: ['-n'] },
  '.bash': { name: 'bash -n', bin: 'bash', args: ['-n'] },
  '.R': { name: 'Rscript parse()', bin: 'Rscript', args: ['--vanilla', '-e', 'invisible(parse(file="stdin"))'] },
  '.r': { name: 'Rscript parse()', bin: 'Rscript', args: ['--vanilla', '-e', 'invisible(parse(file="stdin"))'] },
};

const NODE_EXTENSIONS = new Set(['.js', '.mjs', '.cjs']);
const YAML_EXTENSIONS = new Set(['.yml', '.yaml']);
const JSON_EXTENSIONS = new Set(['.json']);

/** Every extension a checker exists for — the list the tool prints when it refuses one. */
export const CHECKED_EXTENSIONS = [
  ...NODE_EXTENSIONS, ...YAML_EXTENSIONS, ...JSON_EXTENSIONS, ...Object.keys(STDIN_CHECKERS),
];

export const WORKFLOW_DIALECT_CHECKER = 'node --check (workflow dialect)';

/** A Claude Code Workflow script: `<anything>/workflows/<name>.mjs`. Keyed by path, like the runtime. */
export function isWorkflowScript(filePath) {
  return extname(filePath) === '.mjs' && basename(dirname(filePath)) === 'workflows';
}

/** The documented wrap-then-check transform for the Workflow dialect. */
export function wrapWorkflow(source) {
  return `(async()=>{\n${source.replace(/^\s*export const meta/m, 'const meta')}\n})()`;
}

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

/** Human-readable name of the checker for a path, or null. */
export function checkerName(filePath) {
  const ext = extname(filePath);
  if (isWorkflowScript(filePath)) return WORKFLOW_DIALECT_CHECKER;
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

// Where the useful line sits differs by interpreter: python and R end their output with the
// `SyntaxError:` line (traceback first), node begins with it (`[stdin]:3`, the source line,
// the caret, `SyntaxError: …`) and follows with a stack trace and its version banner.
function tail(text, lines = 6) {
  return String(text ?? '').trim().split('\n').slice(-lines).join('\n');
}
function head(text, lines = 5) {
  return String(text ?? '').trim().split('\n').slice(0, lines).join('\n');
}

/** Turn a spawnSync result into a verdict, or null when the checker rendered none. */
function noVerdict(run, checker, bin) {
  if (run.error) {
    const missing = run.error.code === 'ENOENT';
    return {
      verdict: 'checker-missing',
      checker,
      missing,
      detail: missing
        ? `${bin} is not on PATH, so this file type cannot be syntax-checked on this machine`
        : `${bin} could not be run (${run.error.code ?? run.error.message})`,
    };
  }
  if (run.signal || run.status === null) {
    return {
      verdict: 'checker-missing',
      checker,
      missing: false,
      detail: `${bin} did not render a verdict (${run.signal ? `killed by ${run.signal}` : 'no exit status'})`,
    };
  }
  return null;
}

/**
 * Decide whether `content`, standing in for `filePath`, parses as a file of its type.
 *
 * @param {string} filePath - the real path (its extension, directory and package decide the checker)
 * @param {string} content - the bytes to judge (the mutant, or the original as a dry run)
 * @param {string} repoRootDir - where the package.json walk stops
 * @param {object} [deps] - injectable for tests: `spawnSync`, `importYaml`
 * @returns {Promise<{verdict: string, checker: string|null, detail: string, missing?: boolean}>}
 */
export async function checkSyntax(filePath, rawContent, repoRootDir, deps = {}) {
  const spawnSync = deps.spawnSync ?? realSpawnSync;
  const importYaml = deps.importYaml ?? (() => import('js-yaml'));
  const ext = extname(filePath);
  const klass = classifyExtension(ext);
  const content = rawContent.charCodeAt(0) === 0xfeff ? rawContent.slice(1) : rawContent;

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
    const checker = 'js-yaml loadAll';
    let yaml;
    try {
      yaml = await importYaml();
    } catch (err) {
      return { verdict: 'checker-missing', checker, missing: true, detail: `js-yaml could not be loaded (${err.code ?? err.message})` };
    }
    try {
      yaml.loadAll(content);
      return { verdict: 'ok', checker, detail: '' };
    } catch (err) {
      if (err?.name === 'YAMLException') return { verdict: 'invalid', checker, detail: err.message };
      return { verdict: 'checker-missing', checker, missing: false, detail: `js-yaml threw ${err?.name ?? 'an error'} rather than a parse verdict (${err?.message ?? err})` };
    }
  }

  if (isWorkflowScript(filePath)) {
    const checker = WORKFLOW_DIALECT_CHECKER;
    const run = spawnSync(process.execPath, ['--check', '-'], { input: wrapWorkflow(content), encoding: 'utf8' });
    return noVerdict(run, checker, 'node') ?? (run.status === 0
      ? { verdict: 'ok', checker, detail: '' }
      : { verdict: 'invalid', checker, detail: head(run.stderr) });
  }

  if (NODE_EXTENSIONS.has(ext)) {
    const checker = 'node --check';
    const probeExt = ext !== '.js'
      ? ext
      : (packageType(dirname(filePath), repoRootDir) === 'module' ? '.mjs' : '.cjs');
    const probe = resolve(tmpdir(), `mutation-check-probe-${process.pid}-${Date.now()}${probeExt}`);
    try {
      writeFileSync(probe, content);
      const run = spawnSync(process.execPath, ['--check', probe], { encoding: 'utf8' });
      return noVerdict(run, checker, 'node') ?? (run.status === 0
        ? { verdict: 'ok', checker, detail: '' }
        : { verdict: 'invalid', checker, detail: head(run.stderr) });
    } finally {
      try { unlinkSync(probe); } catch { /* best effort */ }
    }
  }

  const checker = STDIN_CHECKERS[ext];
  const run = spawnSync(checker.bin, checker.args, { input: content, encoding: 'utf8' });
  return noVerdict(run, checker.name, checker.bin) ?? (run.status === 0
    ? { verdict: 'ok', checker: checker.name, detail: '' }
    : { verdict: 'invalid', checker: checker.name, detail: tail(run.stderr) });
}
