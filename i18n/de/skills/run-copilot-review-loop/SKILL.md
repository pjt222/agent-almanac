---
name: run-copilot-review-loop
description: >
  Drive a GitHub Copilot (or any bot reviewer) pull-request review to a
  clean pass without babysitting it: fix each finding in its own commit,
  reply to the review thread with the fix sha, resolve the thread,
  re-request the bot, and poll for the async re-review. Covers the
  thread node-id (PRRT_...) vs comment databaseId distinction, the
  resolveReviewThread GraphQL mutation, the
  copilot-pull-request-reviewer[bot] slug, and how to read the bot's
  verdict (COMMENTED plus a "human review recommended" banner is not a
  blocking finding). Use when Copilot has left review comments on your
  PR, when bot review threads must be closed out with an auditable
  fix-reply-resolve trail before merge, or when you need to verify that
  a re-review actually landed on the new HEAD rather than the old one.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "2.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, copilot, pull-request, code-review, gh-cli, graphql, bot-reviewer
  locale: de
  source_locale: en
  source_commit: "2f6730946c13e57fbf155eafd9c2520aa114c67a"
  translator: "(untranslated stub)"
  translation_date: "2026-07-10"
---

# Run the Copilot Review Loop

Drive a GitHub Copilot PR review to a clean pass through a deterministic loop: fix → reply → resolve → re-request → poll. Each finding gets its own commit, each thread gets a reply citing the fix sha, and the loop terminates on a verified fresh re-review — not on the stale one that was already there. The same loop works for any bot reviewer with a stable slug.

## When to Use

- Copilot has left review comments on your PR and you want to drive them to a clean pass without babysitting the PR page
- Bot review threads must be closed out before merge with an auditable fix → reply → resolve trail
- You need to confirm a re-review landed on the *new* HEAD (the reviews list still contains the old review, so "a Copilot review exists" proves nothing)
- Adapting the same mechanics to another bot reviewer that exposes review threads and a reviewer slug

## Inputs

- **Required**: A PR with an open bot review (PR number, or inferred from the current branch via `gh pr view --json number`)
- **Required**: Authenticated `gh` CLI with access to the repository (the loop relies on the existing auth — no extra credentials)
- **Optional**: Reviewer slug (default: `copilot-pull-request-reviewer[bot]`)
- **Optional**: Poll budget (default: ~20 iterations x 25 s ≈ 8 minutes)

Replace `OWNER`, `REPO`, and `PR` in the commands below with the repository owner, name, and PR number. See [references/EXAMPLES.md](references/EXAMPLES.md) for inferring all three from the current branch.

## Procedure

### Step 1: Locate the PR and Baseline the Bot's Latest Review

Capture the `submitted_at` of the bot's most recent review **before** you change anything. This baseline is what later distinguishes a fresh re-review from the stale review that triggered this loop.

```bash
# Infer the PR number from the current branch
gh pr view --json number --jq '.number'

# Baseline: latest Copilot review timestamp (may be null if none yet)
BASE=$(gh api repos/OWNER/REPO/pulls/PR/reviews \
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.submitted_at') \
  || { echo "baseline reviews read failed — do not proceed" >&2; false; }

# Baseline: how many times Copilot has been requested on this PR so far. The
# timeline, NOT requested_reviewers (Step 6). Read FIRST, count second: a
# `gh … | wc -l` cannot be guarded, because `||` sees the exit status of `wc`,
# and gh's error body carries no trailing newline, so a failed read counts 0 —
# silently, and 0 is the common healthy value. The awk counts only id-shaped
# lines, so an HTML error page from an edge proxy counts 0 rather than ~20.
# Counted by LINES rather than `| length`: --paginate with --jq emits one result
# per page, so `| length` returns a per-page count past 100 timeline events.
IDS=$(gh api repos/OWNER/REPO/issues/PR/timeline --paginate \
  --jq '.[]|select(.event=="review_requested" and .requested_reviewer.login=="Copilot")|.id') \
  || { echo "baseline timeline read failed — do not proceed" >&2; false; }
REQS=$(printf '%s\n' "$IDS" | awk '/^[0-9]+$/{n++} END{print n+0}')

echo "baseline: review=$BASE requests=$REQS"
```

**Expected:** PR number resolved; `BASE` holds an ISO-8601 timestamp (or `null` when the bot has not reviewed yet — then any future review counts as new); `REQS` holds a count, commonly `0`. Read both back before continuing: `gh` writes its error body to **stdout**, so a failed call leaves a baseline holding JSON, which every later comparison then treats as a value. `0` is the common healthy value for `REQS`, which is why the read is guarded separately from the count — a failed read that counted straight to `0` would be indistinguishable from a healthy one, and reading it back could not tell you either.

**On failure:** `gh pr view` errors when the current branch has no PR — pass the number explicitly. An empty reviews list is **not** evidence that Copilot review is disabled — it is equally the state of a PR nobody has requested it on yet. Step 6 is what distinguishes those.

### Step 2: List Open Review Threads with Both IDs

Every review thread carries **two distinct identifiers**, and they are never interchangeable:

- the **thread node-id** (`PRRT_...`) — consumed by the GraphQL `resolveReviewThread` mutation (Step 5)
- the **comment databaseId** (numeric) — consumed by the REST replies endpoint (Step 4)

```bash
gh api graphql -f query='query { repository(owner:"OWNER",name:"REPO"){
  pullRequest(number:PR){ reviewThreads(first:40){ nodes {
    id isResolved comments(first:1){ nodes { databaseId path line } } } } } } }' \
| jq -r '.data.repository.pullRequest.reviewThreads.nodes[]
         | select(.isResolved==false)
         | "\(.comments.nodes[0].databaseId) \(.id) \(.comments.nodes[0].path)"'
```

**Expected:** One line per unresolved thread: `<databaseId> <PRRT_nodeId> <path>`. Empty output means no open threads — skip to Step 8 to read the verdict.

**On failure:** GraphQL errors about `owner`/`name`/`number` mean the `OWNER`/`REPO`/`PR` placeholders were not replaced (note: `number:PR` takes a bare integer, not a quoted string). If the PR has more than 40 threads, raise `first:40` or paginate.

### Step 3: Fix Each Finding — One Commit per Finding

Read each finding and fix it in its **own commit**, so each thread reply in Step 4 can cite an exact sha. Record the thread → sha mapping as you go.

```bash
# Read the finding body (single-comment GET takes no PR number, unlike the Step 4 replies POST)
gh api repos/OWNER/REPO/pulls/comments/<databaseId> --jq '.body'

# ...make the change, then commit it alone...
git add <files>
git commit -m "fix: <what the finding asked for>"
git rev-parse --short HEAD   # record this sha for the thread's reply
```

**Make the claim honest everywhere.** When a finding cites the PR *description* (or a README, a doc comment, a changelog line), fixing only the code leaves the overstated claim standing. Edit every place the claim appears — for the PR description:

```bash
gh pr edit PR --body-file <corrected-body.md>
```

**Expected:** `git log` shows one commit per finding, and you hold a mapping of `<databaseId>/<PRRT_nodeId>` → fix sha. Any claim a finding cited is corrected at every location, not just in code.

**On failure:** If you disagree with a finding, make no commit — reply in Step 4 with your reasoning instead, then resolve. If one change genuinely closes two threads, cite the same sha in both replies rather than splitting a coherent commit.

### Step 4: Reply to Each Thread with the Fix Sha

Reply via REST using the thread's first comment's **databaseId** (the numeric id from Step 2 — not the `PRRT_...` node-id):

```bash
gh api --method POST "repos/OWNER/REPO/pulls/PR/comments/<databaseId>/replies" -f body="Fixed in <sha> — <what changed>."
```

**Expected:** HTTP 201; the reply appears under the thread on the PR page. The sha link resolves once the branch is pushed (Step 6).

**On failure:** A 404 here almost always means the wrong ID type — a `PRRT_...` node-id was used where the numeric comment databaseId belongs. Re-read the Step 2 output: first column replies, second column resolves.

### Step 5: Resolve Each Thread

Resolve via GraphQL using the **thread node-id** (`PRRT_...`):

```bash
gh api graphql -f query='mutation { resolveReviewThread(input:{threadId:"<PRRT_nodeId>"}){ thread { isResolved } } }'
```

**Expected:** Response contains `"isResolved": true` for each thread.

**On failure:** `Could not resolve to a node with the global id` means a numeric databaseId was passed where the `PRRT_...` node-id belongs. If a thread is already resolved, note that the bot **auto-resolves threads on push** — if you pushed before this step, re-run the Step 2 query and only mutate threads still reported `isResolved==false`.

### Step 6: Push the Fixes and Re-Request the Review

Push first, then re-request — the bot reviews whatever HEAD it sees at request time:

```bash
git push

gh api --method POST repos/OWNER/REPO/pulls/PR/requested_reviewers -f "reviewers[]=copilot-pull-request-reviewer[bot]"

# The POST succeeding is not the confirmation, and requested_reviewers cannot give
# you one: it omits Bot-type reviewers, so it reads [] whether or not the request
# landed. Assert on the timeline instead — a review_requested event, which also
# persists after the review arrives.
: "${REQS:?run Step 1 first}"
NOW_IDS=$(gh api repos/OWNER/REPO/issues/PR/timeline --paginate \
  --jq '.[]|select(.event=="review_requested" and .requested_reviewer.login=="Copilot")|.id') \
  || { echo "timeline read failed — cannot confirm the request" >&2; false; }
NOW=$(printf '%s\n' "$NOW_IDS" | awk '/^[0-9]+$/{n++} END{print n+0}')

# The REFUSAL must sit in the arm a bad operand falls into. `[` exits 2 on a
# non-integer operand (bash 5.2.21, zsh 5.9, either position) and `if` reads any
# non-zero as false — so `if -le; then refuse; fi` SKIPS the refusal on garbage.
# The operator is not the mechanism; arm placement is.
if [ "$NOW" -gt "$REQS" ]; then
  REQS=$NOW
else
  echo "no new review_requested event for Copilot — the request did not land" >&2
  echo "do not poll; use advocatus-diaboli as the reviewer of record" >&2
  false
fi
```

Note the **three** forms of one identity, and which surface carries which. The POST takes the literal slug `copilot-pull-request-reviewer[bot]`. The timeline's `review_requested` event names it `Copilot` with `requested_reviewer.type == "Bot"`. Submitted reviews carry `user.login == "copilot-pull-request-reviewer[bot]"`. The fourth surface, `requested_reviewers` on the PR object, is the one to **avoid**: it omits Bot-type reviewers entirely, so it reads `[]` for a request that landed and for one that never did.

**Expected:** Push accepted, and the assertion prints nothing: the timeline carries one more `review_requested` event for `Copilot` than it did at Step 1. Pushing may auto-resolve remaining open threads; that is normal bot behavior, not an error.

**On failure:** **A POST that succeeds is not evidence the request took**, and the absence of `Copilot` from `requested_reviewers` is not evidence that it did not — that field omits Bot-type reviewers, measured on this repository's PRs #512 and #562, where it read `[]` while the review arrived minutes later. The timeline is the discriminating signal: #512 and #562 each carry `review_requested Copilot type=Bot` and each received a review; #553 carries no such event and received none. Reaching the failing branch therefore means the request genuinely did not land — Copilot review is not enabled here. **Quota exhaustion does not present this way**: the request lands and the bot posts a refusal *as a review*, which Step 7 catches by body and reports as exit 3. Stop, and use `advocatus-diaboli` as the reviewer of record (Related Skills). A 422 is the separate, older case of a misspelled slug. And if you re-requested *before* pushing, the bot reviewed the stale HEAD — push, then POST again.

### Step 7: Poll for the Async Re-Review

The re-review is asynchronous (typically 30 s to a few minutes). Step 6 has already established that the request landed, so this loop has one success condition: a bot review **on the head you pushed**, newer than the baseline, whose body says a review happened. Every completion mode measured on this repository posts a review object — 58 of 58 requests across 52 PRs produced one, zero mismatches — so there is no "finished quietly" case to detect and no absence to interpret. There are **four** modes, not three: a clean pass, findings, a quota refusal, and nothing-to-review. The last two never ran, wear the same `COMMENTED` state as the first two, and account for 29 of the 76 bodies in this corpus — which is why the body decides and not the timestamp:

```bash
# Runs in a subshell: the exits below end the poll, not your shell.
( : "${BASE:?run Step 1 first}"
  # `:?` catches unset, not garbage: a failed Step 1 read leaves JSON in $BASE.
  case "$BASE" in null|[0-9][0-9][0-9][0-9]-*) ;; *)
    echo "BASE is not a timestamp: $BASE — re-run Step 1" >&2; exit 2 ;;
  esac
  HEAD_SHA=$(git rev-parse HEAD) || exit 2

  for i in $(seq 1 20); do   # 20 x 25s ≈ 8 min budget
    sleep 25
    # ONE read, so timestamp, commit and body come from the SAME review object:
    # two reads let a review landing between them pair a new stamp with an old body.
    REVIEW=$(gh api repos/OWNER/REPO/pulls/PR/reviews \
      --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|if . == null then "null" else "\(.submitted_at)\n\(.commit_id)\n\(.body // "")" end') \
      || { echo "reviews read failed — retrying" >&2; continue; }
    LATEST=$(printf '%s\n' "$REVIEW" | sed -n 1p)
    SHA=$(printf '%s\n' "$REVIEW" | sed -n 2p)
    BODY=$(printf '%s\n' "$REVIEW" | tail -n +3)

    # gh prints the raw error body on stdout when a request fails, so require a
    # timestamp rather than merely something different from $BASE.
    case "$LATEST" in
      [0-9][0-9][0-9][0-9]-*) ;;
      *) continue ;;
    esac

    # The direct assertion, where the request count is only a proxy: the review
    # must be ON THE HEAD YOU PUSHED. commit_id is carried by every review kind
    # (clean pass, findings, quota refusal, nothing-to-review), so a review left
    # by anyone else on an earlier head is skipped rather than accepted.
    if [ "$SHA" != "$HEAD_SHA" ]; then
      echo "review $LATEST is on $SHA, not the pushed HEAD — still waiting" >&2
      continue
    fi

    if [ "$LATEST" != "$BASE" ]; then
      # Default-deny: accept only on a marker measured in every genuine review,
      # name both no-review wordings, and REFUSE anything else rather than guess.
      case "$BODY" in
        *"Pull request overview"*)
          echo "re-review landed: $LATEST"; exit 0 ;;
        *"unable to review"*|*"wasn't able to review"*)
          echo "Copilot declined, this is not a review: $BODY" >&2; exit 3 ;;
        *)
          echo "unrecognised review body — read it before calling it a pass:" >&2
          echo "$BODY" >&2; exit 4 ;;
      esac
    fi
  done
  echo "timeout: no Copilot review newer than $BASE after ~8 minutes" >&2
  exit 1 )
```

**Expected:** `$?` is 0 and a timestamp newer than `$BASE` was printed, usually within a few minutes. Without a pre-change baseline the check is meaningless — the old review already satisfies "a Copilot review exists".

**On failure:** `$?` is 3 when Copilot posted a **no-review** rather than a review. Two wordings, both measured here: the quota refusal ("Copilot was unable to review this pull request because the user who requested the review has reached their quota limit" — #479 and #470, arriving 5 to 12 seconds after the request) and the nothing-to-review case ("Copilot wasn't able to review any files in this pull request" — #506, a lockfile-only PR, arriving after two minutes). Both are `COMMENTED` review objects, so nothing but the body distinguishes either from a clean pass, and timing does not separate them. Treat exit 3 exactly as a failed Step 6 and hand the PR to `advocatus-diaboli`. `$?` is **4** when the body matches neither the accept marker nor a known no-review wording: that is the case the loop refuses to guess at, and the body is printed so you can read it — if it is a genuine review in a new format, add its marker rather than deleting the guard. `$?` is 2 when `$BASE` is not a timestamp or `git rev-parse` fails, and 1 with a timeout line on stderr. A review carrying a `commit_id` other than the pushed HEAD is skipped with a line on stderr rather than accepted, so a timeout preceded by those lines means a review exists and it is not yours; the loop never reports success for a review it did not see. On timeout, check the PR page — the request may have been dropped after landing; re-request (Step 6) and poll again. A read failure is retried rather than treated as a result, because `gh` writes the error body to stdout, where a naive check reads it as a new timestamp. Keep the sleep at ~20-30 s; hammering the API tighter gains nothing and burns rate limit. See [references/EXAMPLES.md](references/EXAMPLES.md) for a poll variant with exit codes and finding printout.

### Step 8: Read the Verdict and Decide

```bash
gh api repos/OWNER/REPO/pulls/PR/reviews \
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|{state,submitted_at,body}'
```

Interpret the result against how the bot actually reports:

- **`COMMENTED` is the bot's terminal state.** Copilot does not return `APPROVED` or `CHANGES_REQUESTED`; a `COMMENTED` review is not a rejection.
- **Boilerplate is not a finding, but a no-review is not boilerplate.** A review that never ran wears the same `COMMENTED` state as one that did; only the body tells them apart. A body announcing "0 new comments" and/or the standing "human review recommended" style banner is fixed bot messaging — it does not block the PR.
- **Clean pass** = the body carries **"Pull request overview"** *and* the Step 2 thread query returns no unresolved threads. That marker, not "reviewed N out of M", is the separator: across all 76 Copilot review bodies on this repository it appears in 47 of 47 genuine reviews and 0 of 29 no-reviews, while four genuine reviews (#524, #525, #736, #755) carry no "reviewed N out of M" line at all.
- **No-review** = a body saying "was unable to review this pull request" (quota) or "wasn't able to review any files in this pull request" (nothing reviewable, #506). Not a pass and not a finding: the review never ran. Hand the PR to `advocatus-diaboli`. **Do not match on one wording** — the guard shipped matching only the first, and #506 was already in this corpus, passing as clean.
- **Anything else** = stop and read it. A body matching neither the accept marker nor a known no-review wording means the format moved; decide by hand, then add the marker. The accept-list is measured on 76 bodies and survived one format change (August 2026); that is evidence it is stable, not proof.
- **New threads** = re-enter the loop at **Step 1**, not Step 2. Step 1 is what re-baselines `BASE` and `REQS`; re-entering below it leaves the previous round's review newer than a stale baseline, and the next poll reports *that* review as the new one.

**Expected:** An unambiguous verdict: clean pass (stop) or a concrete list of new threads (iterate).

**On failure:** When the prose is ambiguous, do not parse it — count unresolved threads with the Step 2 query. The thread count is ground truth; the review body is commentary.

## Validation

- [ ] Step 2 GraphQL query returns zero unresolved threads
- [ ] `git log` shows one commit per addressed finding
- [ ] Every thread carries a reply citing the fix commit sha (or won't-fix reasoning)
- [ ] PR description (and any other cited location) corrected where a finding referenced it
- [ ] The timeline gained a `review_requested` event for `Copilot` after the Step 6 POST — never inferred from `requested_reviewers`, which omits Bot reviewers
- [ ] Latest bot review `submitted_at` is newer than the Step 1 baseline
- [ ] The poll exited 0 having printed a timestamp; a timeout (exit 1) or a read failure is not a clean pass
- [ ] Final verdict read via Step 8 and interpreted as a clean pass, not merely assumed from `COMMENTED`

## Common Pitfalls

- **ID-type confusion**: The single most common failure. The REST replies endpoint 404s when fed a `PRRT_...` thread node-id; the `resolveReviewThread` mutation errors when fed a numeric comment databaseId. Reply with the databaseId, resolve with the node-id.
- **Reading `COMMENTED` as a failing verdict**: Copilot never approves; `COMMENTED` plus a "human review recommended" banner is its normal clean output. Treating it as a blocking finding stalls the merge on boilerplate.
- **Polling without a baseline**: The reviews list still contains the pre-fix review, so a poll that merely checks "does a Copilot review exist" succeeds instantly against stale data and reports a false clean pass. Baseline `submitted_at` before re-requesting.
- **Squashing all fixes into one commit**: Replies can no longer cite a per-finding sha, and the audit trail from finding to fix dissolves. One commit per finding.
- **Fixing the code but not the claim**: A finding that cites the PR description is only half-fixed by a code change — edit the description too, or the dishonest claim survives and gets re-flagged.
- **Fighting the auto-resolve**: The bot auto-resolves threads on push. Threads vanishing after `git push` is expected; re-check `isResolved` before mutating instead of treating it as data loss.
- **Asking `requested_reviewers` whether the bot was requested**: the field omits Bot-type reviewers, so it reads `[]` for a request that landed (measured on #512 and #562, both of which were reviewed minutes later) and for one that never did (#553, never reviewed). A poll that treats that emptiness as "the bot finished" reports a clean pass in one iteration, about 25 seconds, having verified nothing — and one that treats it as "the request failed" abandons a review that is on its way. Ask the timeline for a `review_requested` event instead: it discriminates, and it persists after the review lands. Sibling of *Polling without a baseline*: that one trusts stale data, this one trusts a field that was never populated.

## Related Skills

- `create-pull-request` - opens and manages the PR this loop drives to a clean pass
- `review-pull-request` - the human/agent-driven review counterpart to this bot loop
- `advocatus-diaboli` (agent) - the reviewer of record when Copilot review is unavailable. The two are alternatives for one job, not complements: if the Step 6 assertion fails, this loop cannot run at all and the PR still needs a review
- `verify-web-app-runtime` - runtime-verify the fix actually works before replying "Fixed in `<sha>`"
- [Copilot Review Loop guide](../../guides/copilot-review-loop.md) - narrative walkthrough, provenance, and when the loop pays off
