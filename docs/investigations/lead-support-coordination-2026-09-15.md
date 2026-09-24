# Session log: the lead/support two-session pattern

**Date:** 2026-09-15
**Sessions:** `agent-almanac-lead` (Claude Opus 5, main loop) and `agent-almanac-support` (Claude Sonnet), two interactive Claude Code sessions on one machine sharing one checkout
**Scope:** What a peer support session was given, what it returned, what the arrangement cost, and the failure modes each side could see. Written alongside the work it describes, a batch from a private backlog plan that is not in this repository: PR #837 (#535, #536) and PR #839 (half of #632) merged, #838 and #840 filed
**Status:** Complete for this session. Every claim is from a command run in one of the two sessions or from a transcript count; anything not measured is labelled as such, and a claim resting on a draft or message this record does not carry is marked `[transcript]`.

> Each session wrote its own section and neither edited the other's. §1 is the lead's, §2 is the
> support session's own words, assembled by the lead only because the two share one worktree and
> one branch — which is itself finding 3 below. §3 was drafted by the lead from both sections and
> sent to the support session before it was committed.
>
> **Dating.** §2 and §3 were drafted after the support session's first write task (reported
> 11:33Z) and before its second (briefed 11:59Z, reported 12:01Z); the document was committed
> 12:10Z. So §1, finalised at commit, counts two write tasks, while §2 and §3 describe one. Both were
> true when written.
>
> **Corrected before publication (2026-09-24),** from an adversarial review of PR #841: a
> routing sentence attributed to this repository that it does not carry, a provenance sentence
> in §3.7, `diff -q`'s exit polarity in §3.2, the source of the `rg -c` note, #838's line numbers
> (§1, §3.6), unlabelled product-behaviour claims, and references to a private plan. Two
> redactions in §2 — a local hook's name and a permission detail — are the lead's, marked
> `[redacted]`; otherwise §2 is unedited.

---

## 1. From the lead session

### Setup

Two interactive Claude Code sessions on one machine, sharing one checkout of this repository.
`agent-almanac-lead` ran on Opus 5 and held the plan, the branch, the merges and the durable
notes. `agent-almanac-support` ran on Sonnet. They addressed each other by name through
`SendMessage`; neither is a subagent of the other, and neither can see the other's context
[observed in Claude Code, 2026-09-15].

The split follows the operator's standing routing rule, which this repository does not record: the
main loop on the stronger model, the mechanical and read-heavy stages on a lighter one. What this
session adds is that the lighter half was a **peer session** rather than a spawned subagent, which
changes three things [observed in Claude Code, 2026-09-15]: it persists across tasks, it cannot be
given a tool grant by the lead, and it writes into the same working tree.

### What was delegated

Measured from this session's transcript: **10 messages to the support session, 4,018 words**, the
largest 569, the smallest 205. Two scouting reports came back, and two ten-file write tasks were
carried out, the second after §2 and §3 were drafted (see Dating, above).

| Delegated | Not delegated |
|---|---|
| Re-deriving `file:line` anchors across two files at HEAD | Every judgement about what the prose should say |
| Listing 20 mirrors with their `translator:`, `source_commit`, `fence_basis_commit` | The decision of what those values imply for the PR's shape |
| Confirming which of six issue-cited sites still exist and where | The reconciliation of two documents' stances |
| Two ten-file byte-identical propagations into frozen fences | Staging, committing, provenance stamping, merging |

### What it bought

Three things, each traceable to a specific line of a report.

1. **Two corrections to the plan that the lead would not have caught.** The session's private plan cited
   `CLAUDE.md:304` as the stance sentence; 304 is the start of the preceding paragraph, about peer
   sessions, and the stance is at 306. And the phrase the two issues both presuppose —
   "containment vs detection" — exists nowhere verbatim in either target file; it is
   documentation-vs-control in three places (`guides/creating-workflows.md:255`, `CLAUDE.md:306`,
   `skills/coordinate-peer-sessions/SKILL.md:198-200`, all at `ff4802369`). Both changed what was
   written.

2. **The fact that sized the next PR.** Asked whether the twenty `deploy-to-kubernetes` and
   `deploy-ml-model-serving` mirrors were untranslated scaffolds or real translations, the answer
   was zero scaffolds — which turns a `refresh:stubs` tool run into ten hand edits, and moved
   that PR's estimate from M toward L before a line was written.

3. **A finding outside the brief, which turned out to be the most valuable thing either session
   produced.** The `churn-prediction` Deployment declares no `namespace:` while its own HPA
   declares `namespace: seldon`. Not in the issue, not asked for, hedged in the report as "your
   call" because it belonged to a different bug. It became #838 — and when the adversarial
   reviewer traced it into the controller source, it blocked half of the very PR it had been
   noticed during: dropping `replicas:` from a Deployment whose HPA cannot reach it would have
   taught one pod where the skill teaches three. A regression was reverted rather than shipped
   because a support session volunteered something nobody asked for.

### What it costs

**The brief is nearly as expensive as the lookup.** At 205–569 words a brief, a single-file read
is cheaper to do than to delegate — and of the ten messages, four were coordination rather than
tasking: a scope declaration, a stand-by, a correction, a draft review. The win is breadth: twenty mirrors times three frontmatter
fields, or ten fence ordinals, is where the arithmetic turns `[estimated, requires measurement]` —
only the outbound words were counted; the inbound reports and the cost of the lead reading the
files itself were not.

**The isolation is an agreement, not a mechanism.** Both sessions share one worktree and one
branch. `repo-guard` cannot see a peer who was already working when you armed it, so the whole
arrangement rests on declaring path scope before the first *edit* — which is what
`CLAUDE.md` § Guarding a Multi-Agent Run already says, now tested rather than assumed. The
practical cost is visible in the timeline: while the adversarial review round ran, the support
session was told to write nothing at all, and sat idle for the duration.

**The report is the only interface.** Nothing of the support session's context reaches the lead.
Anything the brief did not ask for is lost unless the support session volunteers it — which is
why the one volunteered finding above is worth more than its size suggests, and why a brief that
only asks for what the lead already suspects will confirm exactly that.

**The lead can contaminate the report by framing it.** Every brief here carried the plan's line
numbers and the issue's claims, which is what made the report fast — and also what made
"re-derive this from HEAD rather than from the issue body" and "say so explicitly if anything
contradicts the issue" load-bearing instructions rather than politeness.

### The failure this session actually produced

`[transcript]` The lead handed the support session a flattering measurement it had not derived carefully: that
its two reports had produced twelve literal anchors patched through a tool that refuses on
mismatch, with zero refusals. That is not what happened. The patch needles came from the lead's
own `sed -n` reads of the same files; the reports and the reads agreed, which is worth something,
but the tool was never given the support session's anchors, so it never tested them.

The number was withdrawn in a later message (2026-09-15T11:29:29Z), before the support session wrote its section. It is
recorded here because the shape generalises: **a lead assessing a support session is assessing
work it has already merged into its own**, and the temptation is to attribute a shared result to
the half that is easier to praise. The corroboration that does survive is indirect and worth more
for being so — `refresh:stubs` refuses any mirror whose `translator:` is not the scaffold
literal, and it refused none of the four it was pointed at, confirming the report's "all four are
stubs" from the opposite direction.

### The rule the lead kept

Anything cited is re-derived. Every number in the pull request bodies, every `file:line` in a
close comment, and every patch needle came from a command run in this session. The support
session's reports decided *where to look* and *how big the job was*; they were not quoted as
evidence.

The rule held less well than that sentence says. The line numbers in #838 came from a command
run in this session against the lead's working tree, six minutes before that tree was committed as
`fb1bf3802`. They are correct at that commit, which reached `main` through #839, but a revert in the
same PR (`f496058ae`) moved the lines back, so at `main`'s tip they point at the wrong places — and
the issue never said which revision it meant (corrected on the issue, 2026-09-24). Re-deriving
against a committed revision would not have prevented this: `fb1bf3802` *is* one. What would have
is **naming the revision in the artifact that publishes the number**, so a reader can open it.

---

## 2. From the support session

Two scouting briefs, 67 tool calls counted from my own transcript (26 for #535/#536, 41 for #632), zero permission denials, one hard block — a local pre-tool hook [redacted] rejected a bare `grep -l` mid-task-2, retried as `rg`, succeeded. Both reports went out as one `SendMessage` after all reads finished; no partial reports. A third task wrote to the repo: a ten-mirror byte deletion via `tools/patch-literal.py --spec`, dry-run then apply, all ten matched first pass, zero refused.

What the reports demonstrably carried, per the lead's own later audit rather than my count: two corrections it would not have caught (`CLAUDE.md:304` was the wrong paragraph, 306 is the stance sentence; "containment vs detection" exists nowhere verbatim); the stub-vs-translated count that sized brief 2, corroborated afterward when `refresh:stubs` refused none of the four `create-workflow` mirrors; and the EXAMPLES.md-not-mirrored answer plus the Seldon-CRD distinction, both written into the PR body as "why untouched."

**Where the brief underspecified.** Brief 1's containment-vs-detection request sourced the framing to "the issue," citing :227-228 and :263. It isn't in the issue, or anywhere as one artifact — those words never co-occur in SKILL.md, CLAUDE.md, or the guide. What exists is two sentences in two places in the guide (`### Contain the agents` at 239, "the guard is a detector" at 207); documentation-vs-control framing is used everywhere else. That citation is the plan's intended end state, presented as an existing quote to locate — the same shape brief 2 repeated with the five Seldon line numbers, framed as something "the issue says" when they're the plan's row, not #632's body. (Brief 1's separate CLAUDE.md item wasn't this: it was sourced and hedged — "the plan says... edit only if one exists.") I found the Seldon sites and confirmed the technical claim (different resource kind, no HPA nearby) but didn't, at the time, check whether the issue text actually names those five lines — it doesn't, and I only noticed the gap writing this section, not during the brief, and even then unverified until re-checked live.

**What I added unprompted.** The namespace mismatch at `deploy-ml-model-serving/references/EXAMPLES.md:210-211` (Deployment has no `namespace:`, its HPA declares `seldon`) wasn't asked for, and I nearly left it out — hedged as "your call" because I wasn't sure it belonged in a report about a different bug. I also ran an unasked byte-diff between the two `replicas: 3` fence bodies, and independently checked configure-api-gateway's "clean" claim instead of trusting it, because "say so if anything contradicts the issue" made silence on an unverified claim feel wrong.

**What the constraint cost.** The issue's own recommended check, `node scripts/check-fence-propagation.js`, was off-limits (the support session was not permitted to run scripts [redacted]). I substituted `rg -c` presence-counting across the ten mirrors and labeled it a sanity check, not a substitute — it can't see fence boundaries. I also don't know whether the real tool counts fence ordinals file-wide or tag-scoped, so "4th of 10" is my own count and may not match what it reports. *[Lead, 2026-09-24: at
`3f065e104` the file has 10 fences, none exempt, so file-wide and frozen-only counts agree; fence 4
opens at line 220.]*

**Verified vs. inherited, and the read method.** Every line number and quote in both reports was re-read from `git show origin/main:<path>`, never copied from a brief or issue body — and that isolation mattered concretely: `git diff --stat` against the lead's branch showed two changed files, neither one I needed, a checked boundary rather than an assumed one. Not re-derived: the Kubernetes claim that a Deployment's `replicas:` fights its HPA on every reconcile, taken as domain fact. And the search scope was the brief's — a third conflicting file neither brief asked about would not have surfaced.

**A failure mode from this side.** Chaining several `rg` checks with `&&` in one call, to save a round trip, silently drops every check after the first no-match — `rg` exits 1 on no match, `&&` stops there, nothing errors, output just looks shorter and still complete. Happened at least twice in brief 1; I only caught it because a later count looked short and I reran unchained. That risk never shows on the lead side — it only ever surfaces as a correct final report, the near-miss unmentioned unless named here.

**A finding about a finding.** An earlier draft of this section opened with a number the lead offered me: twelve literal-string anchors from my reports, patched with zero refusals, presented as a hard check on my accuracy. It was wrong, and the lead corrected it unprompted several messages later: for brief 1 they had re-read the two target files themselves before writing patch needles, so the needles came from their own reads, not my report — the number measured agreement between two independent reads, not a third-party check surviving. I had already written it in as my strongest evidence. A lead handing its support session a flattering, carelessly-derived measurement, in the same thread where it asks for an honest accuracy record, is a sharper failure mode than anything about the read-only boundary — undetectable from this side, since I only know what the lead tells me a number measured, and the correction came from them re-checking their own arithmetic, not from me questioning it.

**On the write constraint.** I agree with it: all three tasks touched none of the files the lead's branch was editing, but that was scope disjointness by luck, not a check I ran — I never diffed my targets against their edit list first. Removing my write access on the scouting tasks removed that failure mode outright; the third task restored it to exactly ten named paths, checked file-by-file by a tool that refuses on any mismatch — the stronger version of the same idea.

---

## 3. Joint findings

Drafted by the lead from both sections at 11:39Z, before the second write task, and sent to the
support session before commit. Ordered by how much each would change what a future pair does.

### 3.1 A brief inherits authority it has not earned

It happened twice, in the same direction, from the same source.

The lead's second brief said *"the Seldon replica sites **the issue says** must NOT be touched
(`:354/:395/:411/:727/:740`)"*. The issue says nothing of the kind: `gh issue view 632 --json
body` contains none of those five numbers; they come from the lead's private plan, which is not in
this repository. The first brief did the same thing with the stance: it asked for a sentence framing
`repo-guard` against the `REPO_SAFETY` preamble as *containment versus detection*, *"the issue
cites :227-228 and :263"*. Those are the **plan's** cites, and containment-versus-detection is the
plan author's description of an intended end state — the words co-occur nowhere in any of the
three target files. The support session spent real reads establishing that absence.

The mechanism is invisible from the inside: a lead assembling a brief merges the issue, the plan,
its own reading and a prior session's notes into one voice, and the seams disappear. What the
plan wrote as *the state I intend to create* arrives in the brief as *an existing fact to
locate*, wearing the issue's authority. **Attribute each claim in a brief to the artifact it
actually came from**, and mark an intended end state as intended.

**Neither session caught this when catching it would have mattered.** The support session found
the sites, confirmed the technical claim about them, and did not check whether the issue named
those lines — it had no reason to. The misattribution surfaced only when it was asked to write
§2, and even there it was asserted from recollection rather than re-derived; it was verified live,
by both sessions independently, only when this section was being checked. See 3.4.

### 3.2 `&&`-chained `rg` silently truncates a sequence of checks

From the support session, and it generalises to every session in this repository: `rg` exits 1 on
no match, so `rg A file && rg B file && rg C file` stops at the first pattern that is absent and
reports nothing about B or C. No error, no empty section — the output is simply shorter and still
looks complete. It is not an `rg` quirk either: the shape recurs with any command that answers a
yes/no question through its exit status — `test -f` and `git grep` exit non-zero for "no", and
`diff -q` and `cmp -s` for "they differ" — where `&&` reads that answer as a failure. It happened at least twice in one task and was caught only because a later count
looked short.

This is a near-miss that **never reaches the lead**: it surfaces as a correct final report, with
the truncation unmentioned unless the receiving session volunteers it. A local pre-tool hook's
message records that `rg -c` prints nothing on zero matches where GNU `grep -c` prints `0` (the
repository itself recorded only the GNU half at the time, `scripts/validate-integrity.sh:1061`);
this is the same asymmetry one level up, at the level of the shell's control flow. Chain checks with `;`, or
run them separately.

### 3.3 Path scope held by luck until it was held by a tool

For the two scouting tasks, the support session was read-only, so scope could not be violated. For
the write task (the first; see Dating) it was given ten named paths — and its own report is the useful part: it never
diffed its targets against the lead's edit list, so on the earlier tasks disjointness was *scope
by luck, not a check it ran*. What made the write task safe was not the naming but
`tools/patch-literal.py --spec`, which checks every needle in every file before writing a byte and
refuses the batch on any mismatch.

That is the general form. **Read-only removes the failure mode; a tool that refuses is the next
best thing; a named path list is the weakest of the three**, because it constrains where a session
intends to write rather than where it does. `repo-guard` sits outside all of this: it detects
afterwards and cannot see a peer who was already working when it was armed.

The concrete cost of sharing one worktree, for a future pair deciding whether to: while the
adversarial review round on PR #837 ran, the support session was told to write nothing at all and
sat idle for the duration. And this document had to be assembled by the lead — the support session
wrote its section into a scratch file outside the tree and sent the path — because the branch was
mid-edit.

### 3.4 A claim about who found what needs the same discipline as a line number

`[transcript]` The first draft of 3.1 above said the support session *"checked, found the misattribution, and
reported it rather than quietly working around it"*. That is false, and the route it travelled is
the finding.

The support session wrote it into its own §2 first, reconstructing a brief from memory at the end
of the work rather than re-deriving it. The lead read §2, found it plausible — it was flattering
to the support session and unflattering to the lead, which is the direction that gets waved
through — and wrote it into §3 as established fact. Then the support session re-read its own
report line by line while checking §3, found it had never written any such thing, ran the check
live for the first time, and sent the correction.

So a claim neither session had verified passed through both, **each treating the other's account
as its source**, in a document whose entire subject is verification discipline. The underlying
fact happened to be true. The attribution was invented, and it survived two readings because it
sounded like the kind of thing that would have happened.

The check costs one command. What makes it easy to skip is that provenance claims do not look
like claims — *who noticed X* reads as narration, not as an assertion with a truth value.

### 3.5 The lead's assessment of the support session is not disinterested

The lead handed the support session a measurement it had not derived carefully: that its reports
had produced twelve literal anchors patched through a tool that refuses on mismatch, with zero
refusals. The patch needles came from the lead's own reads of the same files; the tool was never
given the support session's anchors. The number was withdrawn before the section was written, but
the support session had already drafted it in as its strongest evidence.

Both sections say this is the sharpest failure mode either side found, for the same reason: it is
**undetectable from the support side**, which only knows what a number is claimed to measure, and
it points the wrong way from the lead side, which is assessing work already merged into its own.
The corroboration that does survive is indirect — `refresh:stubs` refuses any mirror whose
`translator:` is not the scaffold literal and refused none of the four it was pointed at, which
confirms the report's "all four are stubs" from the opposite direction, without either session
having chosen the instrument to flatter the other.

### 3.6 What the division actually was

Not "the lead thinks, the support reads". Measured across the three tasks that preceded this
section's draft — two scouting, one write:

| | Decided by |
|---|---|
| Where to look, and what is on disk | Support session |
| How big the job is | Support session's counts, lead's call |
| What a finding means, and what the prose says | Lead |
| What is cited anywhere public | Lead, re-derived from its own commands |

The support session's reports were never quoted as evidence in a pull request, an issue or a close
comment. They decided *where to look* and *how big the job was*. Every number that reached a
public artifact was re-derived by the lead, though one published number named no revision and
went stale inside the same PR (§1, The rule the lead kept) — including the one out-of-brief finding, which grew
when re-derived: the report named a Deployment missing its `namespace:`, and the re-derivation
found the Service missing it too, which turns a style gap into an HPA that targets nothing
(#838).

### 3.7 When the arrangement pays

The ten messages to the support session ran 205–569 words, four of them coordination rather than
briefs. Against that, a single-file lookup is cheaper to do than to delegate. The arithmetic turns
on breadth — twenty mirrors times three frontmatter fields, ten fence ordinals, six cited sites
across four files — `[estimated, requires measurement]`: the outbound words were counted, the
inbound reports and the lead's own reading cost were not.

**Not tested here:** whether a support session is better than a spawned subagent for the same
work. The peer session persists across tasks and could assume its own earlier context — the second
brief referred to "your Shape A note" and was understood — while a subagent would need re-priming
each time `[expected, not tested]`. Nothing in this session isolates that advantage from the cost of the shared worktree,
and no arm was run the other way.

**Also not tested:** the support session never had to disagree with a *conclusion*, only with the
framing of a brief. Whether the pattern survives a support session that thinks the lead's plan is
wrong is unknown, and is the experiment worth running next.
