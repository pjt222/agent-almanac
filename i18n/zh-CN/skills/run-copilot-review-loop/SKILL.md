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
  version: "1.0"
  domain: git
  complexity: intermediate
  language: multi
  tags: github, copilot, pull-request, code-review, gh-cli, graphql, bot-reviewer
  locale: zh-CN
  source_locale: en
  source_commit: 3b0afd0b
  translator: "Claude + human review"
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
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.submitted_at')
echo "baseline: $BASE"
```

**Expected:** PR number resolved; `BASE` holds an ISO-8601 timestamp (or `null` when the bot has not reviewed yet — then any future review counts as new).

**On failure:** `gh pr view` errors when the current branch has no PR — pass the number explicitly. If the reviews list contains no bot entries at all, Copilot review may not be enabled on the repository; request it once (Step 6) before running the loop.

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
```

Note the two forms of the same identity: the POST takes the literal slug `copilot-pull-request-reviewer[bot]`, but the pending entry then appears in `requested_reviewers` under the user form `Copilot`, while submitted reviews carry `user.login == "copilot-pull-request-reviewer[bot]"`.

**Expected:** Push accepted; the PR's `requested_reviewers` now lists `Copilot`. Pushing may auto-resolve remaining open threads — that is normal bot behavior, not an error.

**On failure:** A 422 means the slug is misspelled or Copilot code review is not enabled for the repository. If you re-requested *before* pushing, the bot reviewed the stale HEAD — push, then POST the re-request again.

### Step 7: Poll for the Async Re-Review

The re-review is asynchronous (typically 30 s to a few minutes). Poll against the Step 1 baseline; exit when a **newer** bot review lands, or when the bot drops out of `requested_reviewers` (it finished without posting new comments):

```bash
for i in $(seq 1 20); do   # 20 x 25s ≈ 8 min budget
  sleep 25
  LATEST=$(gh api repos/OWNER/REPO/pulls/PR/reviews \
    --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.submitted_at')
  if [ "$LATEST" != "$BASE" ] && [ "$LATEST" != "null" ]; then
    echo "re-review landed: $LATEST"; break
  fi
  REQUESTED=$(gh api repos/OWNER/REPO/pulls/PR \
    --jq '[.requested_reviewers[].login] | any(. == "Copilot")')
  if [ "$REQUESTED" = "false" ]; then
    echo "Copilot left requested_reviewers — finished, no new comments"; break
  fi
done
```

**Expected:** The loop exits within a few minutes on one of the two conditions. Without a pre-change baseline the check is meaningless — the old review already satisfies "a Copilot review exists".

**On failure:** On timeout, check the PR page — the request may have been dropped; re-request (Step 6) and poll again. Keep the sleep at ~20-30 s; hammering the API tighter gains nothing and burns rate limit. See [references/EXAMPLES.md](references/EXAMPLES.md) for a poll variant with exit codes and finding printout.

### Step 8: Read the Verdict and Decide

```bash
gh api repos/OWNER/REPO/pulls/PR/reviews \
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|{state,submitted_at,body}'
```

Interpret the result against how the bot actually reports:

- **`COMMENTED` is the bot's terminal state.** Copilot does not return `APPROVED` or `CHANGES_REQUESTED`; a `COMMENTED` review is not a rejection.
- **Boilerplate is not a finding.** A review body announcing "0 new comments" and/or the standing "human review recommended" style banner is fixed bot messaging — it does not block the PR.
- **Clean pass** = the fresh review introduced zero new comments **and** the Step 2 thread query returns no unresolved threads.
- **New threads** = re-enter the loop at Step 2 with the new findings.

**Expected:** An unambiguous verdict: clean pass (stop) or a concrete list of new threads (iterate).

**On failure:** When the prose is ambiguous, do not parse it — count unresolved threads with the Step 2 query. The thread count is ground truth; the review body is commentary.

## Validation

- [ ] Step 2 GraphQL query returns zero unresolved threads
- [ ] `git log` shows one commit per addressed finding
- [ ] Every thread carries a reply citing the fix commit sha (or won't-fix reasoning)
- [ ] PR description (and any other cited location) corrected where a finding referenced it
- [ ] Latest bot review `submitted_at` is newer than the Step 1 baseline, or the bot is no longer in `requested_reviewers`
- [ ] Final verdict read via Step 8 and interpreted as a clean pass, not merely assumed from `COMMENTED`

## Common Pitfalls

- **ID-type confusion**: The single most common failure. The REST replies endpoint 404s when fed a `PRRT_...` thread node-id; the `resolveReviewThread` mutation errors when fed a numeric comment databaseId. Reply with the databaseId, resolve with the node-id.
- **Reading `COMMENTED` as a failing verdict**: Copilot never approves; `COMMENTED` plus a "human review recommended" banner is its normal clean output. Treating it as a blocking finding stalls the merge on boilerplate.
- **Polling without a baseline**: The reviews list still contains the pre-fix review, so a poll that merely checks "does a Copilot review exist" succeeds instantly against stale data and reports a false clean pass. Baseline `submitted_at` before re-requesting.
- **Re-requesting before pushing**: The bot reviews the HEAD it sees at request time. Re-request first and it re-reviews the unfixed code — the same findings come straight back.
- **Squashing all fixes into one commit**: Replies can no longer cite a per-finding sha, and the audit trail from finding to fix dissolves. One commit per finding.
- **Fixing the code but not the claim**: A finding that cites the PR description is only half-fixed by a code change — edit the description too, or the dishonest claim survives and gets re-flagged.
- **Fighting the auto-resolve**: The bot auto-resolves threads on push. Threads vanishing after `git push` is expected; re-check `isResolved` before mutating instead of treating it as data loss.

## Related Skills

- `create-pull-request` - opens and manages the PR this loop drives to a clean pass
- `review-pull-request` - the human/agent-driven review counterpart to this bot loop
- `verify-web-app-runtime` - runtime-verify the fix actually works before replying "Fixed in `<sha>`"
- [Copilot Review Loop guide](../../guides/copilot-review-loop.md) - narrative walkthrough, provenance, and when the loop pays off
