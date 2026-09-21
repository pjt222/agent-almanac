/**
 * What the content trees actually contain, for the generated security surface (#691).
 *
 * Both functions here were inline in `scripts/generate-readmes.js`, which executes its
 * whole pipeline plus `process.exit` at import time. Nothing could import it, so nothing
 * could test them — and the properties they carry are exactly the kind that a refactor
 * breaks silently while every gate stays green.
 *
 * They do not live in `lib/readme-sections.js`, the destination #691 finding 3 names,
 * because that module's header claims zero imports and `dependency-free.test.js` guards
 * the reachability of the no-`npm ci` integrity path through it. These need `fs`. (Note
 * that guard would NOT have caught the addition: it detects package dependencies by
 * `ERR_MODULE_NOT_FOUND`, and `node:fs` resolves fine — the header's claim is broader
 * than its test. Worth knowing before trusting the claim.)
 */
import { readFileSync, readdirSync, existsSync, openSync, readSync, closeSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { declaresBash } from './readme-sections.js';
import { CONTENT_TYPES } from './content-types.js';
import { listTracked } from './git-files.js';

/** Extensions the inventory is entitled to call "documentation". */
const DOCUMENTATION_EXTENSIONS = ['.md', '.yml', '.yaml'];

/** `files` entries under this prefix are the CLI, not a content tree. */
const CLI_PREFIX = 'cli/';

/**
 * Directories the generated inventory ASSERTS do not ship.
 *
 * Exported so the sentence and its guard read from one list. They were two lists for one
 * revision, and the guard covered two of the four names the sentence made — mixed
 * authority, where a reader seeing throws around `scripts/` and `workflows/` infers the
 * whole sentence is machine-checked.
 */
export const REPO_ONLY = Object.freeze(['viz', 'scripts', 'workflows', '.claude']);

/**
 * npm lifecycle scripts that execute in a CONSUMER's tree at install time.
 *
 * `prepare` is on the list even though a registry install does not run it: npm DOES run it
 * consumer-side for a git install (`npm install pjt222/agent-almanac`), which is a documented
 * install path for this package. Excluding it would leave the sentence green while a script
 * ran in someone else's tree.
 */
export const INSTALL_HOOKS = Object.freeze(['preinstall', 'install', 'postinstall', 'prepare']);

/**
 * Throw if anything the inventory calls repository-only actually ships, or if the package
 * has grown a script that runs in a consumer's tree on install.
 *
 * Lives here rather than in `generate-readmes.js` for the reason everything else moved:
 * that file executes its pipeline on import, so a guard written there is one no test can
 * reach. Mutation confirmed it — shrinking the list in place survived the whole suite.
 */
export function assertInventoryClaims(root) {
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const files = pkg.files ?? [];
  for (const repoOnly of REPO_ONLY) {
    if (files.some((entry) => entry.replace(/^!/, '').startsWith(`${repoOnly}/`))) {
      throw new Error(
        `SECURITY.md says ${repoOnly}/ exists only in the repository, but package.json ` +
        '`files` ships it. Give it an inventory bullet and remove it from that sentence.',
      );
    }
  }
  for (const hook of INSTALL_HOOKS) {
    if (pkg.scripts?.[hook]) {
      throw new Error(
        'SECURITY.md states this package declares no install-time script hooks, but ' +
        `package.json declares "${hook}". That script runs in a consumer's tree on ` +
        'install — describe it in the inventory before adding it.',
      );
    }
  }
}

/**
 * How many registered skills declare `Bash`, and how many there are.
 *
 * Enumerates the REGISTRY, never the directory. That is the whole property: a directory
 * walk finds 371 including `skills/_template/`, which declares Bash and is not a skill,
 * so every term gains one and a figure published in SECURITY.md quietly inflates. The
 * shipped package excludes `_template` for the same reason (#669).
 *
 * A registry id with no `SKILL.md` **throws**. The previous form was
 * `existsSync(file) && declaresBash(...)`, which counted a missing skill as
 * *non-declaring* — the direction that under-reports how much of the corpus instructs an
 * agent to run shell commands, in a security document.
 *
 * #691 asserts that A4/A5 make this unreachable on a green main. They do not: A4 and A5
 * are the AGENT and TEAM registries, and the only skills-registry gate anywhere is a
 * count, which a renamed directory leaves untouched. So the branch is reachable, and it
 * must be loud rather than tolerant. The upstream repair is #700.
 */
export function skillsDeclaringBash(root, domains) {
  const ids = Object.values(domains).flatMap((d) => (d.skills || []).map((s) => s.id));
  const missing = [];
  const declaring = ids.filter((id) => {
    const file = resolve(root, 'skills', id, 'SKILL.md');
    if (!existsSync(file)) {
      missing.push(id);
      return false;
    }
    return declaresBash(readFileSync(file, 'utf8'));
  }).length;

  if (missing.length) {
    throw new Error(
      `skills/_registry.yml lists ${missing.length} skill(s) with no SKILL.md on disk: ` +
      `${missing.join(', ')}. Counting them as non-declaring would understate the Bash ` +
      'share published in SECURITY.md. Fix the registry, or restore the skill (#700).',
    );
  }
  return { ids, declaring };
}

/**
 * Does `files`' negation set exclude this path?
 *
 * Derived from the consumer's own accept-list rather than re-stated. The first version
 * skipped any entry NAMED `_template` at any depth, which was a 55th hand-rolled
 * exclusion site (#672) AND disagreed with npm: the negations are root-anchored
 * gitignore-style patterns, so `skills/<id>/_template/helper.py` SHIPS while that walk
 * skipped it — the inventory would have said 16 where 17 shipped, under a sentence that
 * now says "all of it ships".
 *
 * `content-paths.js`'s `isExcludedId` was the other candidate and is wrong in the
 * opposite direction: its `_`-prefix rule would skip `skills/_experimental/tool.py`,
 * which ships. Neither hand-rolled rule is the package's rule. This one is.
 */
export function isExcludedFromPackage(relPath, negations) {
  return negations.some((pattern) => (pattern.endsWith('/')
    ? relPath.startsWith(pattern)
    : relPath === pattern));
}

/**
 * Every shipped file under `tree`, repo-relative.
 *
 * ENUMERATED FROM THE INDEX, not by a recursive `readdirSync` (#872), and not by the ignore rule
 * either (#874 review). What this inventory describes is the RELEASE, which CI packs from a
 * commit — so the honest set is the index, which is what the next commit will contain. (Index,
 * not HEAD, and the difference is measurable: with one file `git add`ed and another
 * `rm --cached`ed, HEAD and `ls-files --cached` disagree. The index is the better local
 * predictor of the next release, which is why it is the one read.) The tempting shortcut, "skip what git ignores",
 * rests on a premise measured false: with a `files` array and no `.npmignore`, a LOCAL
 * `npm pack` packs the working tree, shipping an ignored `.pyc`, an ignored `.py` and an
 * untracked sibling alike. So that rule would describe neither artifact.
 *
 * The defect it fixes is unchanged: importing a skill asset with `importlib` left a
 * `__pycache__/`, and the committed SECURITY.md went out claiming 19 non-Markdown files where a
 * clean checkout computed 18 — a `.py` there would have been NAMED in the executable-scripts
 * sentence, under a paragraph asserting "All of it ships". Only CI could see it, because
 * `check-readmes` regenerates from the same contaminated tree it compares against.
 *
 * The npm-ships predicate is UNCHANGED and is still `isExcludedFromPackage`. The recursive walk
 * tested each directory before descending, so every ancestor of a file was tested with its
 * trailing slash; a flat list must test those prefixes explicitly or a directory negation like
 * `!skills/_template/` stops excluding anything. The two rules are independent: git decides what
 * is in the working artifact, npm's `files` decides what ships out of it, and neither is a proxy
 * for the other (`CLAUDE.md` § Excluding a Template, a README, or a Non-Shipped File).
 */
function shippedFilesUnder(root, tree, negations) {
  const treeDepth = tree.split('/').length;
  return listTracked(root, tree).filter((rel) => {
    const parts = rel.split('/');
    for (let depth = treeDepth; depth < parts.length - 1; depth++) {
      if (isExcludedFromPackage(`${parts.slice(0, depth + 1).join('/')}/`, negations)) return false;
    }
    return !isExcludedFromPackage(rel, negations);
  });
}

/**
 * Files in the shipped content trees that are NOT documentation.
 *
 * The inventory called these trees "Markdown and YAML documentation" for a section whose
 * stated job is scoping *executable* content for a security researcher. Sixteen files
 * contradicted it at the time this was written, including an executable Python script,
 * and all of them ship — `skills/` is in `package.json`'s `files`.
 *
 * Derived by exclusion, never by naming extensions to look for. An earlier pass over the
 * same question enumerated `.py` and `.webp` and missed ten `.bib` files; an allowlist of
 * "interesting" extensions would have shipped that undercount and stayed green. Anything
 * that is not `.md`/`.yml`/`.yaml` counts, including extensions nobody has used yet.
 */
export function nonDocumentationFiles(root, trees = null) {
  const { negations } = shippedEntries(root);
  const found = [];
  for (const tree of trees ?? contentTrees(root)) {
    if (!existsSync(resolve(root, tree))) continue;
    found.push(...shippedFilesUnder(root, tree, negations));
  }
  return found
    .filter((path) => !DOCUMENTATION_EXTENSIONS.some((ext) => path.endsWith(ext)))
    .sort();
}

/**
 * Shipped files that a shell or interpreter would execute.
 *
 * Exported so the generated sentence can DERIVE its exemplar instead of naming one.
 * A hardcoded `verify_runtime.py` inside a generated sentence is the defect
 * `generateSecuritySurface` polices ten lines above, where three `scripts/` tools get
 * `existsSync` throws for exactly this reason. Deleting that one file — registry and
 * SKILL.md untouched, so nothing throws — would have had the healer regenerate and
 * auto-commit "15 files … including verify_runtime.py", a false claim in a security
 * document, with every gate green.
 */
export function executableFiles(paths, root = null) {
  return paths.filter((path) => {
    if (/\.(py|sh|bash|zsh|ps1|rb|pl|lua|awk|bat|cmd|mjs|cjs|js|[Rr])$/.test(path)) return true;
    // An extension allowlist alone under-claims in the quiet direction, and this module's
    // sibling JSDoc bans allowlists for exactly that reason. A shebanged EXTENSIONLESS file
    // is doubly invisible: the regex misses it and `extensionOf` returns null, so it is
    // counted but named by no extension. Sniff the first two bytes — 16 reads, offline.
    if (!root || extensionOf(path) !== null) return false;
    try {
      const handle = openSync(resolve(root, path), 'r');
      const buffer = Buffer.alloc(2);
      readSync(handle, buffer, 0, 2, 0);
      closeSync(handle);
      return buffer.toString('latin1') === '#!';
    } catch (error) {
      // NOT swallowed. `skillsDeclaringBash` above argues, in this same file, that counting a
      // missing skill as non-declaring under-reports in a security document and must be loud.
      // A bare catch here makes the opposite choice in the same direction: EACCES, ELOOP and
      // EISDIR would all render as "not executable", silently. No error is expected when
      // reading two bytes of a tracked regular file, so an error means something worth seeing.
      throw new Error(`could not read ${path} to test for a shebang: ${error.message}`);
    }
  });
}

/**
 * The extension of a path, or `null` when it has none.
 *
 * `path.slice(path.lastIndexOf('.'))` is what this replaced, and it fabricated on two
 * plausible inputs: `skills/foo/LICENSE` gave `lastIndexOf` = -1 and `slice(-1)` = `"E"`,
 * published as an extension; `skills/foo.bar/LICENSE` published `.bar/LICENSE`. Both would
 * have rendered into a security document as fact.
 */
export function extensionOf(path) {
  const base = path.slice(path.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  return dot <= 0 ? null : base.slice(dot);
}

/**
 * What `package.json` ships, split into inclusions and negations.
 *
 * Returns FILES as well as directories. Filtering to `endsWith('/')` silently dropped
 * `cli/index.js` — the file `npx agent-almanac` executes, and one `bin` forces into the
 * package regardless — so the generated sentence told a researcher that a vulnerability
 * in the entry point was "against the repository only". That is #600's failure mode (a
 * bullet naming 5 of 13 adapters) reproduced in freshly authored security prose, and the
 * test written alongside it pinned the behaviour rather than catching it.
 *
 * The negations are returned too, because they are the package's own exclusion rule and
 * the walk below has no business restating it.
 */
export function shippedEntries(root) {
  const files = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).files ?? [];
  assertInterpretable(files, root);
  return {
    included: files.filter((entry) => !entry.startsWith('!')),
    negations: files.filter((entry) => entry.startsWith('!')).map((entry) => entry.slice(1)),
  };
}

/**
 * Content trees the inventory scans: shipped directories that are not the CLI.
 *
 * Derived rather than listed, because a hardcoded `['skills','agents','teams','guides']`
 * beside `shippedEntries` is a drift PAIR inside one module: add a tree to `files` and the
 * preamble says it ships while the file count never scans it — the "16 files" claim
 * silently excluding a tree the same paragraph says ships.
 */
export function contentTrees(root) {
  const shippedDirs = shippedEntries(root).included
    .filter((entry) => entry.endsWith('/'))
    .map((entry) => entry.replace(/\/$/, ''));

  const unaccounted = shippedDirs
    .filter((dir) => !`${dir}/`.startsWith(CLI_PREFIX) && !CONTENT_TYPES.includes(dir));
  if (unaccounted.length) {
    // `!startsWith('cli/')` alone was a COINCIDENCE promoted to a rule, and the test written
    // beside it pinned the coincidence: it shipped `dreams/` and asserted it was accepted as
    // a content tree. Ship `dreams/` for real and the first bullet's COUNT would include its
    // files while the bullet's LABEL still read "Skills, agents, teams, guides" — the same
    // drift pair one level up, between a count and the label describing it.
    //
    // Throwing is the honest response: a shipped directory that no inventory bullet
    // describes is #691 finding 4 recurring, and the generator is the one place that can
    // notice. Repair is to add a bullet for it, not to widen this filter.
    throw new Error(
      `package.json ships ${unaccounted.map((d) => `${d}/`).join(', ')}, which is neither the ` +
      'CLI nor a content type, so no bullet in SECURITY.md describes it. Add an inventory ' +
      'bullet for it before shipping it (#691 finding 4).',
    );
  }
  return shippedDirs.filter((dir) => CONTENT_TYPES.includes(dir));
}

/**
 * Refuse a `files` array this module cannot faithfully interpret.
 *
 * `isExcludedFromPackage` models npm's negations as "trailing slash means prefix, otherwise
 * exact path". Where that diverges from npm is MEASURED, not reasoned about — each row below
 * is `npm pack --dry-run` on this tree with the stated `files`, counted against a positive
 * control that proves the probe is not vacuous:
 *
 *   files: ["skills/","!skills/_template"]        npm packs 0 of skills/_template/.
 *       A directory negation WITHOUT its trailing slash still excludes the directory. This
 *       matcher can never match it, because `walk` appends the slash before testing — so one
 *       deleted character silently turns the exclusion off HERE while npm keeps honouring it.
 *   files: ["agents/","!_template.md"]            npm packs 0 of agents/_template.md.
 *       An unanchored, slash-free pattern matches at depth. This matcher compares exact paths
 *       and would match nothing.
 *   files: ["skills/","!skills/*\/references/"]   npm packs 2 where the literal reading packs
 *       all of them. npm expands the glob; this matcher does not.
 *   control: files: ["agents/"]                   npm packs agents/_template.md.
 *       So the three zeros above are exclusions, not an empty probe.
 *
 * All three under-count silently, so all three are refused rather than guessed at — the same
 * contract `mutation-check` holds itself to.
 *
 * A FOURTH class was proposed, refuted, and then REFUTED ONLY IN PART — the correction matters
 * because the original wording licensed two shapes that lose files silently (#879 round 2).
 * The refutation holds for FILE negations: the real array places `!agents/_template.md`,
 * `!teams/_template.md` and `!guides/_template.md` before the entries they carve from, and
 * `npm pack --dry-run` honours them there — 78 files under `agents/`, zero templates. Position
 * does not matter for those.
 *
 * It does NOT hold for a DIRECTORY negation, re-derived here rather than taken on report:
 *
 *   [skills/,!skills/_template/]                       packs skills/real only     (honoured)
 *   [!skills/_template/,skills/]                       packs _template TOO        (DEAD)
 *   [agents/,!agents/_template.md]                     packs agents/real.md only  (honoured)
 *   [!agents/_template.md,agents/]                     packs agents/real.md only  (honoured)
 *   [skills/,!skills/_template/,skills/_template/SKILL.md]   packs the re-included file
 *
 * So two shapes are refused below: a directory negation positioned before an inclusion it
 * prefixes, which npm ignores while this matcher honours it; and an inclusion nested under a
 * negated prefix, which npm packs while this matcher carves it out. Both make the matcher
 * report FEWER files than ship — the silent direction, and the one a security document must
 * never take. Today's array is neither shape; an alphabetised `files` would become the first
 * one without a word from any gate.
 */
function assertInterpretable(files, root) {
  const negations = files.filter((entry) => entry.startsWith('!')).map((entry) => entry.slice(1));
  for (const [index, entry] of files.entries()) {
    if (entry.startsWith('!') && entry.endsWith('/')) {
      // A DIRECTORY negation is dead unless it follows the inclusion it carves from — measured,
      // npm packs the whole directory when the order is reversed, while this matcher goes on
      // excluding it. Under-counting is the silent direction (#879 round 2).
      const carved = entry.slice(1);
      const inclusionAfter = files.slice(index + 1)
        .some((later) => !later.startsWith('!') && carved.startsWith(later));
      if (inclusionAfter) {
        throw new Error(
          `package.json \`files\` entry "${entry}" is a DIRECTORY negation placed before an `
          + 'inclusion it carves from. Measured: npm ignores it in that position and packs the '
          + 'directory, while this module keeps excluding it — so the published file count would '
          + 'be lower than what ships. Move the negation after the inclusion.',
        );
      }
    }
    if (!entry.startsWith('!') && negations.some((pattern) => pattern.endsWith('/') && entry.startsWith(pattern))) {
      throw new Error(
        `package.json \`files\` entry "${entry}" re-includes a path under a negated directory. `
        + 'Measured: npm packs it, while this module carves it out with the negation — again the '
        + 'silent direction. Narrow the negation instead of re-including beneath it.',
      );
    }
  }
  for (const entry of files) {
    if (/[*?[\]{}()|+@!]/.test(entry.slice(entry.startsWith('!') ? 1 : 0))) {
      throw new Error(
        `package.json \`files\` entry "${entry}" contains a glob or extglob metacharacter. ` +
        'Measured: npm expands it and this module compares literally, so the two disagree in ' +
        'silence. Teach scripts/lib/skills-inventory.js the pattern, or avoid the glob.',
      );
    }
    if (entry.startsWith('!') && !entry.slice(1).includes('/')) {
      throw new Error(
        `package.json \`files\` entry "${entry}" is an unanchored negation. Measured: npm ` +
        'matches such a pattern at any depth, while this module compares exact paths and ' +
        'would match nothing — so the published file count would silently include files that ' +
        `do not ship. Anchor it: "!<dir>/${entry.slice(1)}".`,
      );
    }
    if (entry.startsWith('!') && !entry.endsWith('/')
      && existsSync(resolve(root, entry.slice(1)))
      && !readdirSync(resolve(root, dirname(entry.slice(1))), { withFileTypes: true })
        .some((e) => e.name === basename(entry.slice(1)) && e.isFile())) {
      throw new Error(
        `package.json \`files\` entry "${entry}" negates a DIRECTORY without a trailing ` +
        'slash. Measured: npm excludes it and its contents; this module would never match it, ' +
        'because the walk appends the slash before testing. Write ' + `"${entry}/".`,
      );
    }
  }
}

/**
 * The sentence SECURITY.md carries about pack-time hooks, derived from a manifest.
 *
 * A pure function of `pkg` so it can be unit-tested, which is the point: the clause lived inline
 * in `generate-readmes.js` and its only guard was `check-readmes`, a SNAPSHOT gate. A snapshot
 * cannot tell a derivation from a literal that renders the same bytes — measured in the #879
 * review, reverting the derivation to `['prepack']` regenerated SECURITY.md byte-identically and
 * the mutant SURVIVED. Here a manifest without the hook is an argument, and the assertion is the
 * returned string.
 *
 * `prepack` only, deliberately. A future `postpack` is a cleanup step, and describing it as
 * refusing a pack would be false of it (#879 round 2, N9); it gets its own clause when it exists.
 * The INSTALL_HOOKS above are the consumer-side ones this sentence disclaims — `prepack` is not
 * among them, which is what keeps the disclaimer true.
 */
export function packHookSentence(pkg) {
  if (!pkg?.scripts?.prepack) return '';
  return ' It does declare `prepack`, which runs in the PUBLISHER\'s tree when the package is'
    + ' packed and never in a consumer\'s; it refuses a pack carrying files the published commit'
    + ' does not (#876).';
}
