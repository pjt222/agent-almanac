---
title: "Driving the Copilot Review Loop"
description: "Converging a PR to a clean GitHub Copilot review pass — thread IDs, the fix/reply/resolve/re-request cascade, and reading the bot's verdict"
category: workflow
agents: []
teams: [visual-pr-review]
skills: [run-copilot-review-loop]
---

# Driving the Copilot Review Loop

GitHub's Copilot code review is an asynchronous bot reviewer: it posts findings as review threads on a pull request, and it re-reviews on request. Converging a PR to a clean pass is a loop — fix, reply, resolve, re-request, poll — driven with `gh` REST and GraphQL calls. This guide documents the loop, the two-ID data model that trips people up, and how to read the bot's verdict.

This is the interactive counterpart to [Running a Code Review](running-a-code-review.md). That guide is *static* review: you orchestrate almanac review teams over a codebase and receive one synthesized report. This guide is the *bot loop*: an external, hosted reviewer you cannot orchestrate, only converge with — each round is fix commits, thread bookkeeping, and an async re-review you poll for. The machine-consumable procedure is the [run-copilot-review-loop](../skills/run-copilot-review-loop/SKILL.md) skill; the reference commands below were validated on a real PR cleanup and are generalized in [pjt222/gateway#5](https://github.com/pjt222/gateway/issues/5).

## When to Use This Guide

- A PR has open Copilot review threads and you want to drive it to a clean re-review, not just push fixes and hope
- You replied to a Copilot comment but the thread still shows as an open conversation blocking merge hygiene
- A `resolveReviewThread` call failed with "Could not resolve to a node" and you suspect an ID mix-up
- Copilot re-reviewed but you cannot tell whether its `COMMENTED` verdict is a pass or a complaint
- You are deciding between an almanac review team and the Copilot loop — see the positioning above; they are complementary, not alternatives

## Prerequisites

- **An authenticated `gh` CLI**: every command below relies on existing `gh auth` credentials; no tokens appear in commands.
- **Copilot code review enabled on the repository**: the bot must already be assignable as a reviewer.
- **A PR with at least one Copilot review**: the loop starts from existing findings. The reviewing identity is `copilot-pull-request-reviewer[bot]`.
- **jq available**: the thread-listing command filters GraphQL output with `jq`.

Commands below use `OWNER`, `REPO`, and `PR` as placeholders — substitute your repository owner, name, and PR number.

## Workflow Overview

```text
Copilot review lands (state: COMMENTED, N open threads)
        |
        v
for each finding:
  fix        -- one commit per finding
        |
        v
push the fix commits (bot may auto-resolve outdated threads here)
        |
        v
for each thread:
  reply      -- REST, needs the comment databaseId, cites the fix sha
  resolve    -- GraphQL mutation, needs the thread node-id (PRRT_...)
        |
        v
re-request copilot-pull-request-reviewer[bot]
        |
        v
poll the async re-review
        |
   +----+------------------------------+
   |                                   |
new findings                      clean pass
(repeat the cascade)   (COMMENTED, "0 new comments")
```

One round of this cascade converged the originating PR to a clean pass. Multiple rounds are normal for larger finding sets.

## The Review-Thread Data Model

Every Copilot finding lives in a **review thread**, and every thread involves **two different IDs**. Confusing them is the single most common failure in the loop:

| Object | ID | Looks like | Used for | API surface |
|---|---|---|---|---|
| Review thread | GraphQL node-id | `PRRT_kwDO...` | `resolveReviewThread` mutation | GraphQL only |
| Review comment | `databaseId` | integer, e.g. `1987654321` | the REST replies endpoint | REST |

- **Replying** targets the thread's *top comment* via its integer `databaseId` on the REST endpoint `repos/OWNER/REPO/pulls/PR/comments/<databaseId>/replies`.
- **Resolving** targets the *thread* via its `PRRT_...` node-id in the GraphQL `resolveReviewThread` mutation. There is no REST endpoint for resolving threads — this is why the loop necessarily mixes REST and GraphQL.
- Passing the integer to the mutation fails with "Could not resolve to a node"; passing the `PRRT_...` id to the REST endpoint returns 404.

Fetch both IDs for every open thread in one call:

```bash
gh api graphql -f query='query { repository(owner:"OWNER",name:"REPO"){
  pullRequest(number:PR){ reviewThreads(first:40){ nodes {
    id isResolved comments(first:1){ nodes { databaseId path line } } } } } } }' \
| jq -r '.data.repository.pullRequest.reviewThreads.nodes[]
         | select(.isResolved==false)
         | "\(.comments.nodes[0].databaseId) \(.id) \(.comments.nodes[0].path)"'
```

Each output line is `<databaseId> <PRRT_nodeId> <path>` — everything one cascade round needs per thread.

### Resolved vs outdated

Two independent thread states, often conflated:

- **Resolved** (`isResolved`) is a conversation state someone *sets* — a human via the UI, a script via the mutation, or the bot itself.
- **Outdated** is positional: a later push changed the diff lines the comment was anchored to. It happens automatically and says nothing about whether the finding was addressed. An outdated thread can still be unresolved and still counts as an open conversation.

### Who auto-resolves

`copilot-pull-request-reviewer[bot]` auto-resolves its own threads on push when the pushed commits change the flagged lines. You still resolve manually — via the mutation — for threads whose fix did *not* touch the anchored lines: a claim corrected in another file, a doc fix, or a PR-description edit (see below). Do not wait for auto-resolution to close those; it never comes.

## The Cascade: Fix, Reply, Resolve, Re-request, Poll

### 1. Fix — one commit per finding

Make each fix its own commit. The reply for each thread cites a specific sha; one commit per finding keeps that citation meaningfully scoped, lets the bot's re-review map cleanly onto what changed, and makes a bad fix individually revertable. A single "address review comments" mega-commit defeats all three.

### 2. Push

Push the fix commits to the PR branch. The shas now exist on the remote, so the citations in your replies resolve as links — and this is the point where the bot auto-resolves any threads whose anchored lines your push changed.

### 3. Reply — cite the fix sha

Reply on each thread with what changed and the commit that changed it. REST, using the top comment's `databaseId`:

```bash
gh api --method POST "repos/OWNER/REPO/pulls/PR/comments/<databaseId>/replies" -f body="Fixed in <sha> — <what changed>."
```

The reply is the audit trail: a future reader (or the re-reviewing bot) sees finding → fix sha → resolution in one thread.

### 4. Resolve — the GraphQL mutation

For every thread the push did not auto-resolve, run the mutation with the thread's `PRRT_...` node-id:

```bash
gh api graphql -f query='mutation { resolveReviewThread(input:{threadId:"<PRRT_nodeId>"}){ thread { isResolved } } }'
```

The response echoes `"isResolved": true` — verify it, then re-run the thread-listing query and confirm the open-thread count is zero before re-requesting.

### 5. Re-request the bot

Two naming forms coexist and both matter:

```bash
gh api --method POST repos/OWNER/REPO/pulls/PR/requested_reviewers -f "reviewers[]=copilot-pull-request-reviewer[bot]"
```

You *request* the literal slug `copilot-pull-request-reviewer[bot]`, but the pending reviewer then appears in `requested_reviewers` as the user login `Copilot`. Scripts that poll for the user form while having requested the slug form are correct; scripts that grep for the slug in `requested_reviewers` never see it.

### 6. Poll the async re-review

The re-review takes a variable amount of time and lands as a new review on the new HEAD. Record the timestamp of the bot's latest review *before* re-requesting, then wait for a newer one:

```bash
BASE=$(gh api repos/OWNER/REPO/pulls/PR/reviews \
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.submitted_at')
# loop ~25s: exit when a copilot review with submitted_at > BASE appears,
# OR when "Copilot" drops out of requested_reviewers (finished, no new comments).
```

A runnable form of that loop:

```bash
while true; do
  LATEST=$(gh api repos/OWNER/REPO/pulls/PR/reviews \
    --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.submitted_at')
  if [ -n "$LATEST" ] && [ "$LATEST" != "$BASE" ] && [ "$LATEST" != "null" ]; then
    echo "re-review landed: $LATEST"; break
  fi
  PENDING=$(gh api repos/OWNER/REPO/pulls/PR/requested_reviewers \
    --jq '[.users[].login] | index("Copilot") != null')
  if [ "$PENDING" = "false" ]; then
    echo "Copilot left requested_reviewers — finished, no new comments"; break
  fi
  sleep 25
done
```

Both exit conditions are terminal: a new review means findings (or an explicit "0 new comments" pass) landed; the bot silently leaving `requested_reviewers` means it finished with nothing to say. If new findings landed, repeat the cascade from step 1.

The full scripted implementation — `threads`, `reply`, `resolve`, `rerequest`, `poll`, and `status` subcommands with PR auto-detection — is tracked in [pjt222/gateway#5](https://github.com/pjt222/gateway/issues/5).

## Fix the Claim Everywhere It Appears

Copilot reviews more than the diff hunks — findings can quote the **PR description**. When a finding says the description claims something the code no longer does (a renamed flag, a dropped feature, a stale number), fixing only the code leaves the finding valid: the false claim still stands where the bot quoted it.

Edit the description too:

```bash
gh pr edit PR --body-file updated-description.md
```

The general rule: **a finding is about a claim, not a location**. Fix the claim at every place it appears — code, comments, README, PR description — then reply once citing all of the touched locations. A description-quoting thread is also the canonical case for manual resolution: no push ever outdates it, so the bot never auto-resolves it.

## Reading the Verdict

Copilot's review states do not mean what human review states mean:

- The bot only ever submits reviews with state **`COMMENTED`** — it never submits `APPROVED` or `CHANGES_REQUESTED`. If your loop waits for an approval, it waits forever.
- A **clean pass** is a `COMMENTED` review whose body reports **"0 new comments"** — or the bot dropping out of `requested_reviewers` without posting anything.
- Every Copilot review carries the boilerplate banner recommending human review. The banner is unconditional; it appears on clean passes too. It is **not a blocking finding** and requires no response.

Check the latest verdict:

```bash
gh api repos/OWNER/REPO/pulls/PR/reviews \
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|{state, submitted_at, body}'
```

So the loop's exit criterion is: **zero unresolved threads and a latest Copilot review that raised zero new comments**. `state: COMMENTED` plus the human-review banner *is* the green light.

## Pairing with Runtime Verification

Copilot reads the diff; it never runs the app. A clean Copilot pass proves the *text* of the change survived review — not that the page renders, the canvas draws, or the interaction works. For PRs with a visual or frontend surface, pair the loop with the [visual-pr-review](../teams/visual-pr-review.md) team, which drives the built app headlessly and verifies runtime behavior the bot structurally cannot see. Run the Copilot loop for diff-level findings and the team for runtime evidence; a PR is done when both are clean.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `Could not resolve to a node` from the mutation | Passed the integer `databaseId` instead of the thread node-id | Use the `PRRT_...` id from the thread-listing query; the integer is only for the REST replies endpoint |
| 404 from the replies endpoint | Passed the `PRRT_...` node-id, or a reply's id instead of the top comment's | Use the *top* comment's integer `databaseId` from the thread-listing query |
| Re-requested reviewer never shows up in `requested_reviewers` | Polling for the slug `copilot-pull-request-reviewer[bot]` | The pending-reviewer user form is `Copilot`; request the slug, poll for the user form |
| Threads reopened as "outdated" but unresolved after push | Outdated is positional, not a resolution | Resolve explicitly with the mutation; outdated ≠ resolved |
| A finding survives the re-review despite the code fix | The finding quotes the PR description (or a doc), which still carries the stale claim | Fix the claim everywhere it appears — `gh pr edit PR --body-file ...` — then resolve manually |
| Loop waits forever for an `APPROVED` review | Copilot never approves; it only submits `COMMENTED` | Treat "0 new comments" (or leaving `requested_reviewers`) as the pass condition |
| Poll loop exits immediately with a "new" review | `BASE` captured after the re-review already landed, or was `null` on a first review | Capture `BASE` *before* re-requesting; treat `null` as "any review is new" |
| Thread-listing query returns fewer threads than the PR shows | More than 40 threads; the query pages at `first:40` | Raise `first:` or paginate with `pageInfo { hasNextPage endCursor }` |

## Related Resources

- [run-copilot-review-loop](../skills/run-copilot-review-loop/SKILL.md) -- the machine-consumable procedure for this loop
- [visual-pr-review](../teams/visual-pr-review.md) -- runtime/visual verification team complementing the diff-level bot review
- [Running a Code Review](running-a-code-review.md) -- static multi-agent review with almanac teams; this guide's counterpart
- [Headless WebGL Verification](headless-webgl-verification.md) -- proving a frontend PR actually renders, the runtime half of the pairing
- [create-pull-request](../skills/create-pull-request/SKILL.md) -- authoring the PR the loop converges
- [review-pull-request](../skills/review-pull-request/SKILL.md) -- human/agent-side PR review procedure
- [pjt222/gateway#5](https://github.com/pjt222/gateway/issues/5) -- the reference `copilot-review.sh` tool issue with the full command set
