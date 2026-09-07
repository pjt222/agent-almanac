# Contributing

Agent Almanac is a library of procedures for AI agents, written to the
[Agent Skills](https://agentskills.io) open standard. This file is for anyone opening a pull
request or an issue from outside the project. It states what the library accepts, what a skill
PR must contain, which of the steps are yours and which are the maintainer's, and what to expect
once you have opened it.

The rules below are the ones that decided [#763](https://github.com/pjt222/agent-almanac/pull/763),
the first external skill PR; the triage that closed
[#589](https://github.com/pjt222/agent-almanac/pull/589), the first external contribution of any
kind, is the shape described under "What to expect from us". Both authors arrived at an
undocumented repository, because until then the rules lived only in `CLAUDE.md`, a file written
for Claude Code sessions rather than for a person reading the repository on GitHub. Where a rule
is enforced by a CI check, the check is named; where it is applied in review, that is said too.

## What the library accepts

**Skills are vendor-neutral procedures.** A skill describes how to do something so that any
agent, on any tool, can follow it. It is not a product listing, and it is not a place to promote a
service to the agents that read it. The working principle is *serve AI systems, don't promote to
them*.

A procedure may mention a product. What decides is the shape:

- A skill whose procedure works against any conforming target, with one product as a worked
  example, is a procedure. It fits.
- A skill whose procedure only works against one product, however well built, is a listing. It
  does not fit — but its generalisation usually does, and the reply will say what that
  generalisation looks like rather than close the door. #763 arrived as the second shape and was
  merged as the first, reworked by its author.

Three rules follow from the principle. They are applied in review:

- **One vendor location, not two.** A product may appear as a worked example, in one place — the
  Examples section, or one named step. It must not also be the thing a required section defers
  to: a Validation section describes the mechanism, not a vendor's checker.
- **No attribution tracking.** No `?src=` or `?ref=` parameters on URLs, no tracking pixels, no
  "powered by" lines. A skill is read by agents on behalf of people who did not choose it.
- **Sandbox first; real money and real damage are opt-in.** A procedure that can move funds,
  delete data, or change a live system makes the testnet, sandbox, or dry run its primary path
  and gates the live path behind an explicit input the reader has to set. "Be careful" in prose is
  not a gate. The merged form of #763 refuses a mainnet network unless `MAINNET_OPTIN=true` is
  set, and that is the pattern.

### Why the third rule is policy text and not a gate

`scripts/scan-skill-content.js` runs on every pull request as the `content-security` check. It
scans every file under a skill for credential shapes, and every committed executable under a
skill's `scripts/` directory for dangerous invocations. It does not read the procedure's prose,
and that scoping is deliberate: install skills legitimately document `curl … | sh`, so a prose
scan false-fires on real content. Whether a procedure's *primary path* is a sandbox is not a
syntactic property either — the same sentence is fine as a pitfall and wrong as Step 1. So this
rule is stated here and applied in review. That is the recorded decision on #765 finding 4:
policy text, not a gate. A mechanical form that does not false-fire would be welcome as an
addition, not as a replacement for this paragraph.

## What to expect from us

Agent Almanac has one maintainer. There is no service-level agreement. The first column below is
the track record; the other three are defaults, set in this file and changed by editing it.

| You opened | What happens first | Nudge us after | We close after |
|---|---|---|---|
| A skill, agent, team, or guide PR | A substantive first reply — #763, the first skill PR from outside, got one within a day | 14 days of silence | 60 days of your silence following a change request |
| A translation PR | A reply once the fence and frontmatter gates have run; the prose is read by a person | 14 days | 60 days, as above |
| A bug report or a security finding | Triage written into the thread with the reasoning — the close of #589 is the shape, and it came within a day | 7 days | Never on age alone; on a decision, with the reason stated |
| A question or a proposal | An answer, or a pointer to the issue that already owns it | 14 days | When answered |

A pull request that is not merged is closed with the reason written into the thread. Your branch
stays on your fork, the closing comment says so, and a reopen is welcome if the reason changes.
Silence, age, and merge conflicts are not by themselves reasons to close — a conflict is a request
to rebase, and the thread will say so.

Three mechanics worth knowing before you open a PR:

- **Leave "Allow edits by maintainers" ticked** — GitHub ticks it by default when a PR comes from
  a fork. On #763 it is what let the review fixes land on the author's own branch: the PR's commit
  list shows the author's two commits untouched and the fixes on top, each listed in the thread for
  a veto before merge. Without it, each small fix is another round trip.
- **Merges are merge commits, never squashes.** Your commits keep their authorship and their
  messages.
- **Your PR reports checks.** Measured on #763: the checks on the contributor's first commit
  started three seconds after the PR was opened and seven hours before the maintainer's first
  comment. Two of them were red, and the red lines named exactly the items this file's checklist
  now covers. If you ever see an *empty* check list on your PR, say so in the thread rather than
  read it as a pass — that is what the first external PR, #589, got, before the fork-PR policy was
  changed.

## Adding a skill

The steps are split in two, and the split is not cosmetic. The contributor's steps are the ones
the CI checks read. The maintainer's steps run **once, at merge, after the English text is
final** — and one of them is actively harmful if run earlier.

### Your steps — what the PR must contain

1. **`skills/<skill-name>/SKILL.md`, copied from `skills/_template/SKILL.md`.** The name is
   lowercase kebab-case, starts with a verb, and is the directory name. The file carries the
   template's frontmatter and all six required sections as `##` headings:

   - When to Use
   - Inputs
   - Procedure — numbered steps, each with a fenced command, an **Expected:** line and an
     **On failure:** line
   - Validation
   - Common Pitfalls
   - Related Skills

   The `skills` check enforces the six headings, at least one entry under Common Pitfalls, and a
   500-line ceiling; the step shape is read in review. Extended examples go in
   `references/EXAMPLES.md` rather than the main file. Every code fence carries a language tag
   (` ```bash `, ` ```yaml `, ` ```text `), never a bare ` ``` ` — the required `skills` check
   fails on any untagged fence in the English content trees, and `content-style` fails one on any
   added line as well.

2. **A registry entry in `skills/_registry.yml`**, under a domain — add one if none fits; several
   domains hold a single skill — plus the `total_skills` count at the top of that file bumped by
   one. Copy the shape of a neighbouring entry: `path` is relative to `skills/`, so it reads
   `<skill-name>/SKILL.md`. The `skills` check compares the count against the directories on
   disk, and the `integrity` check refuses a skill on disk that has no entry.

3. **A discovery symlink**, so Claude Code finds the skill as a slash command in this repository:

   ```bash
   ln -s ../../skills/<skill-name> .claude/skills/<skill-name>
   git add .claude/skills/<skill-name>
   ```

   It is a git symlink and is committed. The `integrity` check fails on its absence — that was one
   of the two red lines on #763's first push. On Windows, git needs `core.symlinks=true` to create
   and check out symlinks; WSL is the easier path. The maintainer's own tool for this,
   `scripts/sync-discovery-symlinks.sh --fix`, also writes to the global `~/.claude/skills/` hub
   on whatever machine runs it, so the one-line form above is the right one for a contributor.

4. **Run the local checks** in the section below and fix what they report.

Optional, welcome, and never required for a merge: a test scenario under `tests/scenarios/skills/`
made from `tests/_template.md`, and a `references/EXAMPLES.md`.

Four things a first push has tripped on, or a gate refuses, each one line to check:

- `description` in the frontmatter is your text, not the template's — #763's first push still
  carried the template's own "Max 1024 characters." note.
- `allowed-tools` names the tools the procedure actually invokes. #763's first push declared
  `allowed-tools: Read` for a procedure built on HTTP calls; this is read in review, not by a gate.
- The commands are runnable as written. Reviewers execute fences rather than only read them, and
  the defects found on #763 after it merged were in fences that everyone, the maintainer
  included, had read and nobody had run.
- No file or directory inside the skill is named `bin`, `cache`, `logs`, `memories`, `sessions`,
  `workspace`, `backups`, `node_modules`, `venv` or `site-packages` — the full lists are
  `USER_OWNED_EXCLUDE` and `EXCLUDED_SKILL_DIRS` in `scripts/build-hermes-distribution.js` — no
  directory starts with `_` or `.`, and nothing inside it is a symlink. A downstream distribution
  drops those names, and the `skills` check refuses them here, at any depth, so they cannot vanish
  silently there.

### Maintainer steps — run at merge, not in your PR

These are listed so you know they exist and can leave them out. If a check goes red for one of
them on your PR, say so in the thread; it is not yours to fix.

- **Translation scaffolds** for the four translated locales (`de`, `zh-CN`, `ja`, `es`). A
  scaffold copies the English bytes at the moment it runs, so one made while a PR is still being
  revised leaves every mirror stale after the next push. That is why it runs once, after merge,
  and why a contributor is asked *not* to run `npm run translate:scaffold`.
- **README regeneration** (`npm run update-readmes`). The generated index sections are rebuilt by
  CI on push to `main`, and a PR that touches only content does not trigger the `readmes` check
  at all. Running it locally is harmless if you want to; it is not on your list.
- **The visualization's data and icons** — `viz/public/data/skills.json`, and for a new domain a
  palette entry, glyph and icon. These become their own issue when a merge creates the need.
- **The global discovery hub** on the maintainer's machine.

### Local checks — what CI runs, plus the setup a fork needs

Commit your work first: the style check diffs `<base>...HEAD`, so uncommitted changes — staged
or not — are invisible to it, and it reports a clean run over nothing. `<base>` is this
repository's `main` as your clone knows it — `origin/main` on a clone of this repository,
`upstream/main` on a fork once the two setup lines below have run (the fetch is one-shot, so
run it again before each later round). The line-endings check is the one exception: it reads
the index, so `git add` is enough there. Paste the block interactively: saved as a script, the
ceiling line's path guard ends the script at a mistyped path instead of ending the one check.

```bash
# On a fork only; safe to paste every round. The first line adds the remote once — and errors,
# rather than silently using it, if you already have an `upstream` that points somewhere else
# (https and ssh forms of this repository pass, with or without a port; a longer repository name does not).
git remote get-url upstream 2>/dev/null | grep -qE "github\.com(:[0-9]+)?[:/]pjt222/agent-almanac(\.git)?$" || git remote add upstream https://github.com/pjt222/agent-almanac.git
git fetch upstream main

npm ci
node scripts/audit-skill-sections.js --missing         # the six sections and a non-empty Common Pitfalls; "0 skill(s) reported" when clean
lines=$(wc -l < skills/<skill-name>/SKILL.md); [ "${lines:?no such file - check the path}" -le 500 ] || { echo "FAIL: $lines lines > 500"; false; }   # the 500-line ceiling, counted the way CI counts it; silent when clean
node scripts/check-content-style.js --added <base>     # bare fences and table rules, on committed added lines
npm run validate:line-endings                          # any CRLF in the index fails
npm run validate:integrity                             # registry entry, symlink, cross-references
npm run validate:security                              # credential shapes, dangerous executables
npm run check:hermes-distribution                      # the excluded-name and symlink rules above
```

Two more that CI runs and you may not be able to: `skills-ref validate skills/<skill-name>`, the
reference validator from [agentskills/agentskills](https://github.com/agentskills/agentskills),
installed with pip (CI pins a commit); and `claude plugin validate .`, which needs the Claude
Code CLI and, on a clean tree, passes with two warnings — one about `CLAUDE.md`, one about
`agents/README.md` — that are expected and not yours.

`npm test` is the maintainer's release gate, not a contributor check: it includes a
generated-README comparison that goes red on any registry change until the maintainer
regenerates.

### Which checks report, and which can refuse the merge

A skill PR reports these contexts, measured on #763's first commit: `banned-invocations`,
`cli-test`, `content-security`, `content-style`, `integrity`, `line-endings`, `scripts-test`,
`skills`, `tests`, `yaml-fences`. Five of them are required by branch protection and refuse the
merge while red: `line-endings`, `integrity`, `skills`, `scripts-test`, `cli-test`. The others
go red visibly and are still findings to fix — the distinction only decides whether the merge
button works, not whether a red is merged past. It is stated here so a red check does not read as
a judgement call in the thread.

## Other contributions

- **Agents, teams and guides** follow the same split: the file and its registry entry are yours;
  README regeneration and translation scaffolds are the maintainer's. The templates are
  `agents/_template.md`, `teams/_template.md` and `guides/_template.md`, and each type's README
  states its required sections. An agent lists at most five core skills in frontmatter —
  [`guides/agent-best-practices.md`](guides/agent-best-practices.md) says why.
- **Translations** have their own contributor guide at [`i18n/README.md`](i18n/README.md). The one
  rule that surprises people: a code fence stays byte-identical to the English unless it is tagged
  `text`, `markdown` or `md`, and a gate checks each fence against every revision of the English
  file.
- **Bug reports** are GitHub issues. The most useful report names the command, the measured
  output, and the expected output. The reasoning written into the close of #589 — a security
  patch that arrived as a PR — is the shape of triage you will get back.
- **Security findings** follow [`SECURITY.md`](SECURITY.md): a public issue, no private channel,
  no guaranteed timeline. Read its "What This Repository Contains" section first — `scripts/` does
  not ship in the npm package, so a finding against it has a different threat model from one
  against `cli/`.

## Commits, licence, and the PR text

Commit subjects here follow the conventional-commits shape — `feat(<skill-name>): …`, `fix(…)`,
`docs(…)`, `chore(…)`. It is a convention, not a gate; a clear message in another shape will not
be bounced. The pull-request template in `.github/` carries the checklist above: fill in the why,
tick what applies, delete what does not. Everything you contribute is licensed under the
repository's [MIT licence](LICENSE), with you as its author in git history.
