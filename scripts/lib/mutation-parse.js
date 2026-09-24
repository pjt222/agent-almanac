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
 *   node --input-type=module --check - over the wrapped Workflow dialect        1 / 0
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
 * function — `asserted, never measured`, from the vendor-API notes in `workflows/README.md`;
 * what IS measured here is node's own stdin goal, a different question — so they carry a
 * top-level `return` that a raw ES module rejects: `node --check` says
 * "Illegal return statement" on a perfectly valid workflow, unmutated. The first #773
 * proof hit exactly that: `INVALID MUTANT` on the original. Such a file is therefore checked
 * with the wrap `workflows/_template.mjs` documents and `workflow-template.test.js` enforces:
 * strip `export` from `export const meta`, wrap in `(async()=>{ … })()`. `wrapWorkflow` below
 * is the ONE implementation of that transform — the template test imports it rather than
 * keeping a second copy, since both sides are JavaScript in the same module graph and this
 * repository has paid for a set that exists twice.
 *
 * The dialect is keyed by PATH, ROOT-ANCHORED: `workflows/<name>.mjs` or
 * `.claude/workflows/<name>.mjs` relative to the repository root, never "any parent directory
 * happens to be called workflows". A depth-agnostic test was written first and is the same
 * shape CLAUDE.md records being measured wrong for `_template` and reverted.
 *
 * What makes the anchor load-bearing is the WRAP, not the goal — the goal is now the stricter
 * of the two (below), so do not read that paragraph as licence to delete this one. A `.mjs`
 * wrongly given the dialect has a top-level `return` accepted and its first `export const meta`
 * silently stripped, so a mutant that strands a `return` outside every function, or that breaks
 * a second export, is scored `ok` and then read as a kill. That is the #758 class.
 *
 * The wrapped body is checked under `--input-type=module`, deliberately STRICTER than the
 * documented recipe's bare `node --check -`. Measured on node v25.9.0: stdin with no
 * `--input-type` is parsed as sloppy CommonJS, which accepts `function f(a, a) {}` and a
 * `with` statement that ESM rejects — exactly the single-token-deletion mutants this tool
 * makes. All four files under `workflows/` pass the wrap under BOTH goals — measured by two
 * suites, the module arm here and the CommonJS arm in `workflow-template.test.js` — so the
 * stricter goal costs nothing today and closes that gap.
 *
 * "Stricter" is not containment, and one construct runs the other way: `import.meta` parses
 * under the module goal and is a SyntaxError under the bare CJS one (measured). Nothing shipped
 * uses it and no single-token deletion creates it, so the claim to rely on is the narrow one —
 * stricter for every construct at issue here — not a superset.
 *
 * The two error directions are still not symmetric. Checking looser than the runtime yields a
 * false KILL, the bug #758 exists to fix. Checking stricter yields a false INVALID, which
 * refuses to judge rather than judging wrongly — but on an UNMUTATED file that is the
 * precondition refusal, which by design has no override, so such a workflow could not be
 * mutation-checked at all. That is the cost being accepted, not a free choice.
 *
 * The recipe in the template, the guide, the skill and `workflows/README.md` is deliberately
 * NOT changed to match: it is an authoring aid, it appears inside code fences that ten i18n
 * mirrors freeze, and the wrap — the part that matters — is identical.
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
import { dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path';

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

export const WORKFLOW_DIALECT_CHECKER = 'node --input-type=module --check (workflow dialect)';

/** Root-relative directories whose `.mjs` files the runtime treats as Workflow scripts. */
export const WORKFLOW_DIRS = Object.freeze(['workflows', '.claude/workflows']);

/**
 * A Claude Code Workflow script — root-anchored, never "some parent is called workflows".
 * `repoRootDir` is required: without it there is no anchor, and an unanchored test is the
 * shape this repository has already measured wrong once (CLAUDE.md, `_template`).
 */
export function isWorkflowScript(filePath, repoRootDir) {
  if (extname(filePath) !== '.mjs' || !repoRootDir) return false;
  const rel = relative(repoRootDir, filePath);
  if (rel.startsWith('..') || isAbsolute(rel)) return false;
  return WORKFLOW_DIRS.includes(dirname(rel.split(sep).join('/')));
}

/**
 * The documented wrap-then-check transform for the Workflow dialect.
 *
 * `[ \t]*`, not `\s*`: `\s` matches a newline, so with `m` the pattern could start at a blank
 * line ABOVE the declaration and consume it, shifting every later line by two or more. The
 * documented recipe is a `sed` operating line by line, which cannot do that, so this is the
 * more faithful spelling as well as the safer one. The wrap therefore prepends exactly ONE
 * line, which is what `WRAP_LINE_OFFSET` lets the caller subtract back out.
 */
export const WRAP_LINE_OFFSET = 1;

export function wrapWorkflow(source) {
  return `(async()=>{\n${source.replace(/^[ \t]*export const meta/m, 'const meta')}\n})()`;
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
export function checkerName(filePath, repoRootDir) {
  const ext = extname(filePath);
  if (isWorkflowScript(filePath, repoRootDir)) return WORKFLOW_DIALECT_CHECKER;
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

// Where the useful line sits differs by interpreter. Python, R and bash end their output with
// the message (`SyntaxError:`, `Execution halted`, `syntax error near …`), so `tail` reaches it;
// bash may add a token line after it, which `tail` also keeps. Node begins with it (`[stdin]:3`,
// the source line, the caret, `SyntaxError: …`) and follows with a stack trace and a version
// banner, so `head` is the one that reaches it there.
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
 * @param {string} rawContent - the bytes to judge (the mutant, or the original as a dry run)
 * @param {string} repoRootDir - the repository root: where the package.json walk stops AND the
 *   anchor `isWorkflowScript` measures against. Passing a directory nearer the file (say
 *   `dirname(filePath)`) silently turns the Workflow dialect off rather than erroring, so it
 *   must be the real root — `mutation-check.js` passes `git rev-parse --show-toplevel`.
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
      // missing:false — the remedy is `npm ci`, not installing an interpreter, so the caller
      // must not print its install hint here.
      return { verdict: 'checker-missing', checker, missing: false, detail: `js-yaml could not be loaded (${err.code ?? err.message}); run npm ci` };
    }
    try {
      yaml.loadAll(content);
      return { verdict: 'ok', checker, detail: '' };
    } catch (err) {
      if (err?.name === 'YAMLException') return { verdict: 'invalid', checker, detail: err.message };
      return { verdict: 'checker-missing', checker, missing: false, detail: `js-yaml threw ${err?.name ?? 'an error'} rather than a parse verdict (${err?.message ?? err})` };
    }
  }

  if (isWorkflowScript(filePath, repoRootDir)) {
    const checker = WORKFLOW_DIALECT_CHECKER;
    const run = spawnSync(process.execPath, ['--input-type=module', '--check', '-'], { input: wrapWorkflow(content), encoding: 'utf8' });
    return noVerdict(run, checker, 'node') ?? (run.status === 0
      ? { verdict: 'ok', checker, detail: '' }
      // node numbers lines in the WRAPPED text; subtract the wrapper's own line so the excerpt
      // names a line the reader can find in the file.
      : { verdict: 'invalid', checker, detail: head(run.stderr).replace(/\[stdin\]:(\d+)/g, (_, n) => `[stdin]:${Number(n) - WRAP_LINE_OFFSET}`) });
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
