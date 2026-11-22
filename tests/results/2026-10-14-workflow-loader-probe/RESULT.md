## Run: 2026-10-14-workflow-loader-probe

**Observer**: Claude (Opus 5.5 main loop; probe designed by a Sonnet subagent, reviewed and amended by the main loop before any run; second measurement by an independent Sonnet subagent; review-round-1 fixes and the re-extraction by an Opus fixer subagent) | **Issue**: #293 (AC-1) | **Relates**: #288, #294

### Objective

#293 asks whether the repository's install instruction for a workflow is true. Several docs teach copying the source file under its own extension:

```text
cp workflows/<name>.mjs .claude/workflows/<name>.mjs
```

A static read of the Claude Code 2.1.293/2.1.299 bundle says the Workflow loader keeps an entry only when its file name ends in `.js`. A `.mjs`, `.cjs` or `.ts` name increments a `nearMissExt` counter and is dropped. The bundle also keys the merged workflow map by `meta.name`. A static read of minified code is a hypothesis, so AC-1 asks for a live run before any doc is changed on its strength. This record is that run.

### Environment

| Field | Value |
|-------|-------|
| Binary | Claude Code **2.1.299** (`claude --version`) |
| Session type | Headless `claude -p` child sessions, one per arm, launched by `probe.sh` |
| Model | `claude-sonnet-5-5` (`--model sonnet`; the loader does not depend on the model) |
| Permissions | `--permission-mode dontAsk --allowedTools Workflow` |
| Setting sources | default; the flag is not passed, so the child loads the same settings as a real session |
| User-scope workflows | `~/.claude/workflows` **does not exist** (recorded per run in `run*/user-scope-listing.txt`) |
| Environment | `CLAUDECODE`, `CLAUDE_CODE_*` (except OAuth and API-key helpers), `CLAUDE_PID` and `CLAUDE_EFFORT` are removed with `env -u` so that each child is a fresh top-level session. The names are listed in `run*/meta.txt` and in each `arm-*.cmdline.txt`. |
| Date | 2026-10-14. Run 1 at 14:16Z by the main loop; run 2 at 14:19Z by a separate agent, each in a fresh output directory |

### Method

`probe.sh <outdir>` builds three throwaway projects (`git init`) under a scratch directory outside every repository, and runs one headless session in each. It refuses an output directory inside a repository, or any ancestor that carries `.claude/workflows`.

| Arm | `.claude/workflows/` contents | `meta.name` | What it tests |
|---|---|---|---|
| A (control) | `probe-a.js` | `probe-arm-a` | The setup works at all. If A is not discovered, every other row is reported INCONCLUSIVE. |
| B | `probe-b.mjs` | `probe-arm-b` | Whether a `.mjs` file is discovered. |
| C | `probe-c1.js`, `probe-c2.js` | both `probe-arm-c` | Two files with different stems and the same name. |

Each workflow body is three lines: a pure-literal `meta`, a `log()` of a unique marker, and a `return`. There are no `agent()` calls.

A `.js`/`.mjs` pair that shares one `meta.name` in one directory is deliberately **not** an arm. Because the map is keyed by name, it could not tell "skipped" from "loaded and shadowed".

The prompt asks the child to "Run the saved workflow named `<name>` using the Workflow tool: pass only the name parameter", then to wait for the run and report its return value. The tool call and the session-start registration are read **mechanically** from the `--output-format stream-json` event log with `jq`, never from the model's prose:

- **The tool call itself.** The `tool_use` input and the `tool_result` paired to it by id, with `is_error`. The verdict reads the first call that passes the expected name and no `scriptPath`. An arm with no such call is `unknown` and reported INCONCLUSIVE, never `no`. A `no` needs the lookup's own text, `Workflow "<name>" not found.`, matched as a fixed string.
- **Session-start registration.** The `init` event's `slash_commands`: the total count, the names starting with `probe`, and the names matching `probe-arm`.

Two more observables cover the workflow body:

- **Which file was dispatched.** The body marker in the persisted copy of the resolved script, whose path the `tool_result` names. The stream's `task_started.prompt` holds the same bytes, and the grep of the session directory takes in that copy (and the model's reply), so the three marker files per arm are one observation, not three. They say which file the loader dispatched, not that its body ran.
- **Whether the body ran.** The runtime's own run-state record of the run (`wf_<runId>.json` in the session directory), committed as `arm-*.run-state.json` with four fields: `workflowName`, `status`, the `log()` lines (`logs`) and the return value (`result`). Each committed record was checked by hand to carry the `taskId` of its own dispatching call: w9hcqvb10, w1xci5fa5, w4u6korui and wla99s9tj, the Task IDs in the paired `tool_result`. `probe.sh` itself does not check this pairing; it collects every run-state record under the arm's session slug (#971). With it, the stream's `task_updated` and `task_notification` events (`extracted.json` `.task_status`).

### Results

Both runs agree on every arm.

| Arm | Run | `tool_result` (verbatim, first line) | `is_error` | `init` slash command | File dispatched (marker in the script copy) | Run-state record (`status`, `logs`) |
|---|---|---|---|---|---|---|
| A | 1 | `Workflow launched in background. Task ID: w9hcqvb10` | false | `probe-arm-a` | `PROBE_BODY_A_91c2` | `completed`, `[PROBE_BODY_A_91c2]` |
| A | 2 | `Workflow launched in background. Task ID: w4u6korui` | false | `probe-arm-a` | `PROBE_BODY_A_91c2` | `completed`, `[PROBE_BODY_A_91c2]` |
| B | 1 | `<tool_use_error>Workflow "probe-arm-b" not found. Available: deep-research</tool_use_error>` | true | *(none)* | none | none |
| B | 2 | `<tool_use_error>Workflow "probe-arm-b" not found. Available: deep-research</tool_use_error>` | true | *(none)* | none | none |
| C | 1 | `Workflow launched in background. Task ID: w1xci5fa5` | false | `probe-arm-c` (one entry) | `PROBE_BODY_c1_5e1d` (`probe-c1.js`); `c2` absent | `completed`, `[PROBE_BODY_c1_5e1d]` |
| C | 2 | `Workflow launched in background. Task ID: wla99s9tj` | false | `probe-arm-c` (one entry) | `PROBE_BODY_c1_5e1d` (`probe-c1.js`); `c2` absent | `completed`, `[PROBE_BODY_c1_5e1d]` |

The control gate passed in both runs. Every child exited 0 with empty stderr. Each arm made exactly one Workflow call, and it passed `name` alone. The `init` event registered 446 slash commands in arms A and C and 445 in arm B, in both runs (`extracted.json` `.init_slash_command_count`).

**Completion.** In arms A and C of both runs the background run completed before `-p` exited. Two mechanical records show it:

- The stream's `task_updated` and `task_notification` events report status `completed`, and the notification names the same `tool_use_id` as the Workflow call (`extracted.json` `.task_status`).
- The runtime's run-state record shows status `completed`, `logs` holding that body's marker, and the body's return value (`arm-*.run-state.json`). For arm C, `logs` holds `PROBE_BODY_c1_5e1d` only; `c2`'s marker appears nowhere in it.

After the notification the child repeats the same return value in its reply. That is model prose and serves as corroboration only.

### Findings (scoped to Claude Code 2.1.299, project scope)

1. **A project workflow saved as `.claude/workflows/<name>.mjs` is not discovered.** It is not registered as a slash command at session start. Invoking it by name fails with `Workflow "<name>" not found`, and the error's `Available:` list does not include it. The live run agrees with the static read. `deep-research`, the one name that list holds, is not a workflow in this repository (`workflows/` at `25a165bca` holds `batch-generate-waves`, `review-changes` and `verify-handoff`), nor in the scratch project, user scope or an installed plugin's workflows directory. It is presumably bundled with Claude Code; that was not read from the binary.
2. **A `.js` file is discovered, runs by name through the Workflow tool, and is registered as the slash command `probe-arm-a`.** The run-state record shows status `completed` and the body's `log()` marker (`run*/arm-A.run-state.json`). The workflow was registered as a slash command; it was not invoked through one.
3. **The invocation name is `meta.name`, not the file stem.** `probe-a.js` registers and is invoked as `probe-arm-a`. No arm registered a name derived from its file name. In both runs the `init` slash commands starting with `probe` are only `probe-feature-flag-state` (a skill of this repository) and the `meta.name` values, with no `probe-a`, `probe-b`, `probe-c1` or `probe-c2` (`extracted.json` `.init_slash_commands_starting_probe`). The count agrees: 445 in arm B, which registered no workflow, and one more in arms A and C. Invoking by the stem was not attempted. The docs' phrasing `.claude/workflows/<name>.mjs` → `Workflow({ name })` reads as if the stem were the name.
4. **Two `.js` files with the same `meta.name` collide silently.** One slash command is registered, the tool call succeeds with no warning, and one file's body runs: the run-state `logs` hold one marker. In both runs that was `probe-c1.js`. The two runs used the same file names on the same filesystem, so their agreement is no evidence of an ordering rule, and none is inferred. The tie-break rule (sort order, directory order, or something else) was **not** read and is not claimed. "Silently" was checked in three places: the arm's stderr (empty), the `tool_result` (no warning), and the stream's non-assistant events. A case-insensitive search of those events for `overrid`, `duplicat`, `collid`, `collision`, `shadow`, `warn`, `probe-c2` and `c2_b83f` finds nothing, while the same search finds `c1_5e1d` twice.

Consequence for this repository: the install instruction `cp workflows/<name>.mjs .claude/workflows/<name>.mjs` installs a workflow the Workflow tool does not find. The sites below are the complete output of two read-only searches at `25a165bca`, English sources only:

```bash
git grep -n -e '\.claude/workflows' 25a165bca -- ':!i18n' ':!tests/results'
git grep -n -i -e 'discovery contract' -e 'discovery triple' -e 'discovered by filename' \
  -e 'triple is out of sync' -e 'not found by name' 25a165bca -- ':!i18n' ':!tests/results'
```

The first returns 22 lines and the second 11. Two lines are in both (`guides/creating-workflows.md:390`, `guides/understanding-the-system.md:254`), so there are 31 distinct lines. Each is classified below. A neighbouring line that was read but not matched is named inside its hit's entry.

**(a) Install sites that name the `.mjs` extension (finding 1), 14 lines**

- `skills/create-workflow/SKILL.md:65`, `:168`, `:171`, `:174` (the curated `almanac-<name>.mjs` prefix) and `:299`. `:171` sits in a frozen fence that has 4 stub mirrors.
- `skills/write-continue-here/SKILL.md:138`: it copies `workflows/verify-handoff.mjs` into `.claude/workflows/` and then runs `Workflow({ name: 'verify-handoff', … })`, which is arm B's case. None of its 10 mirrors mentions `verify-handoff`, so the fix is English-only.
- `guides/creating-workflows.md:107` and `:118`
- `guides/understanding-the-system.md:131`
- `workflows/README.md:37`
- `CLAUDE.md:25` and `:70`
- `SECURITY.md:16`, generated from `scripts/generate-readmes.js:940`

**(b) Stem-as-discovery and not-found diagnosis sites (findings 1 and 3), 10 lines**

- `guides/creating-workflows.md:67` ("The `name` **must equal the filename stem** — that is the … discovery contract") and `:390`. The second is the troubleshooting row for "Workflow not found by name": it blames `meta.name` ≠ stem and omits the extension.
- `guides/understanding-the-system.md:254` ("discovered by filename")
- `skills/create-workflow/SKILL.md:6`, `:71` and `:79` (the "triple-name discovery contract"), plus two failure diagnoses. `:83` reads a not-found error as "the triple is out of sync", and `:178`, the On-failure for `/<name>` not found, omits the extension.
- `workflows/README.md:33`
- `workflows/_template.mjs:20` (the sentence starts at `:19`)

**(c) Tooling, 5 lines**

- `scripts/lib/mutation-parse.js:73` (a comment) and `:143` (`WORKFLOW_DIRS` includes `.claude/workflows`; the `.mjs`-only test is at `:151`), and `scripts/test/mutation-parse.test.js:77`, which asserts that `/r/.claude/workflows/x.mjs` is a workflow script. All three encode `.claude/workflows/<name>.mjs` as a workflow path.
- `scripts/check-workflow-contract.js:6` and `scripts/validate-integrity.sh:525`, comments calling integrity check A7 the "discovery triple-equality". The same phrase wraps across `validate-integrity.sh:484-485`.

**(d) Matches that need no edit, 2 lines**

- `CHANGELOG.md:18` (history)
- `skills/create-workflow/SKILL.md:33` (names the directory, not the extension)

The repository's own convention that the stem equals `meta.name` (for example `create-workflow:38`, `:73`, `:76` and `:300`, and integrity check A7) is outside this hit set and stays legitimate. Only calling it the discovery contract is wrong.

Sprint 4 should re-run both commands at its own base rather than trust these line numbers, which were cut at `25a165bca`.

Correcting the sites is Sprint 4's #293 docs slice, which this record licenses. It is **not** done here. The planned shape keeps `.mjs` as the repository's source extension and teaches `cp workflows/<name>.mjs .claude/workflows/<name>.js`.

Finding 4 also corrects the namespacing advice at `create-workflow:171` and `:174` (and `creating-workflows.md:118`). Arm C's two files had different stems and still collided. So a file-name prefix (`almanac-<name>.js`) does not stop a curated install from colliding with a user's `<name>` (measured in one directory; user scope was not exercised). The loader keys on `meta.name` (finding 3), so a curated install must namespace `meta.name`. Under the triple-name contract the stem follows it, and the invocation name becomes `almanac-<name>`. A file-name prefix only stops `cp` from overwriting a file of the same name. A doc should also say that name collisions are silent.

### What this record does not establish

- **Other versions.** Only 2.1.299 was measured.
- **User scope.** `~/.claude/workflows` did not exist and was not exercised.
- **The collision tie-break,** as above.
- **Invocation through a slash command, or by file stem.** Registration was observed; neither invocation was attempted.
- **Interactive sessions.** These were headless `-p` sessions with the `CLAUDE*` session variables removed. An unscrubbed control (`PROBE_KEEP_ENV=1`) was not run.

### Files

- `probe.sh` — the probe. Re-run with `bash probe.sh <fresh-outdir-outside-any-repo>`.
  - `bash probe.sh --reextract <outdir>` launches no session. It re-runs only the extraction, the run-state collection, the verdicts and the SUMMARY, over an outdir that still holds its raw `arm-*.stream.jsonl`.
  - It takes three things from that outdir's `meta.txt`: the original outdir, from which the session-directory slug is derived, plus the version and the model.
  - It refuses an outdir inside a repository, so it cannot be pointed at the committed `run*/` directories, which hold no raw logs.
- `run1/` and `run2/` — per run: `SUMMARY.txt` and `meta.txt`, plus per arm:
  - `cmdline`, `exitcode` and `stderr`;
  - `extracted.json`: the Workflow `tool_use`/`tool_result`, the `init` slash-command count and filtered names, and `.task_status`;
  - `run-state.json`: the runtime's run-state record, reduced to `workflowName`, `status`, `logs` and `result` (`[]` for arm B, which ran nothing);
  - the three marker files, `script-file.txt`, and `arm-*.script-copy.js.txt` (the persisted copy of the resolved script, renamed so it is not mistaken for runnable code).

**Re-extraction after review round 1.** `--reextract` regenerated the derived files over the original outdirs; no session was re-run. `extracted.json`, `markers.txt` and the verdict rows are read from the raw `stream.jsonl`. `run-state.json`, `transcript-markers.txt`, `script-file.txt`, the script copy, `script-markers.txt` and SUMMARY's `ran` lines are read from each run's session directory under `~/.claude/projects`, which still existed. `meta.txt`, `cmdline`, `exitcode`, `stderr`, `user-scope-listing.txt` and `workflow-sources.txt` are the run's own, and the re-extraction did not rewrite them. The later redaction below did rewrite the scratch path in `meta.txt` and `workflow-sources.txt` (#1101).

- **Byte-identical where unchanged.** Every field of the earlier `extracted.json` is byte-identical: with the three new keys deleted, each file compares equal to the earlier commit's with `cmp`. `markers.txt` (under the new system/user filter) did not change. The script files and `transcript-markers.txt` were re-read from session directories that still held them, and did not change either.
- **What changed.** Besides the new keys and the new `run-state.json` files, only `SUMMARY.txt` changed. It gained `ran` lines, and `run-state.json` joined its file list. The `BODY_MARKERS` column became `DISPATCHED` (arm C's `body=` became `file=`), and "resolved" became "dispatched" on the script-copy line. Its first line now carries the re-extraction time, with the run's own start time beside it. The rows' verdicts are unchanged.
- **Uncommitted paths.** `SUMMARY.txt`'s `per-arm files:` and `user scope listing:` lines name the originals in the operator's scratch directory, which are not committed.

Not committed: the raw `stream.jsonl` event logs. Their `init` events carry the operator's whole local environment (plugin list, 446 slash commands, agent definitions, a messaging socket path), which is not this repository's to publish. They are kept outside the repository with the session record.

Redaction: `/home/<operator>` was rewritten to `~` in the derived files. The Claude Code project-store slug in every `~/.claude/projects/<slug>/…` path was rewritten to the placeholder `<scratch-slug>`. Two more rewrites followed in #1101. The operator's live session scratch path became `/tmp/claude-<uid>/-<project-slug>/<session-id>/` (14 lines, in `SUMMARY.txt`, `meta.txt` and `workflow-sources.txt`). Each child session's id became a label naming its run and arm, `<session-run1-A>`, `<session-run1-C>`, `<session-run2-A>` or `<session-run2-C>` (26 occurrences, in `SUMMARY.txt`, `extracted.json` and `script-file.txt`). A re-runner must do all four before committing new or re-extracted output, copying, never editing in place. The first three are one `sed`:

```bash
sed -e 's#/home/[a-z0-9_]*#~#g' -e 's#\(claude/projects/\)-[^ /`"]*#\1<scratch-slug>#g' \
    -e 's#/tmp/claude-[0-9]*/[^/]*/[0-9a-f-]\{36\}/#/tmp/claude-<uid>/-<project-slug>/<session-id>/#g' src > dst
```

The fourth maps each child session's id to its own label, so no single pattern does it. Afterwards no session id may be left:

```bash
rg -n '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' dst   # must print nothing
```

Then run `node scripts/scan-skill-content.js` and `bash tools/check-redaction.sh` over every file to be committed. `probe.sh` does not redact (#971).

- **Home paths.** 28 replacements in all, re-counted after the re-extraction: 26 in the regenerated files and 2 in the files the re-extraction does not write.
- **Store slugs.** 26 replacements, in `SUMMARY.txt`, `extracted.json` and `script-file.txt`. A first commit classified these paths as harmless evidence. The repository's `content-security` CI job (`scripts/scan-skill-content.js`, rule `private-store-slug`) treats any slug other than this repository's own as a disclosure, default-deny, and reported all 26 as HIGH findings. So they were rewritten rather than argued.
- **Scanners.** Neither scanner flags a session id or a `/tmp/claude-<uid>/…` scratch path, so the `rg` check above is what catches those. `node scripts/scan-skill-content.js` reports 0 findings. `tools/check-redaction.sh` over this file, `probe.sh` and every file under `run1/` and `run2/` (68 files) reports clean.
