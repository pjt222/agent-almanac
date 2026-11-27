# Extended Examples — run-copilot-review-loop

Extended command variants for the [run-copilot-review-loop](../SKILL.md) skill. All commands rely on an already-authenticated `gh` CLI — no extra credentials.

## Inferring OWNER, REPO, and PR from the Current Branch

Instead of hardcoding placeholders, derive all three from the checkout:

```bash
OWNER=$(gh repo view --json owner --jq '.owner.login')
REPO=$(gh repo view --json name --jq '.name')
PR=$(gh pr view --json number --jq '.number')
echo "$OWNER/$REPO#$PR"
```

Every command in the skill then works verbatim with `"$OWNER"`, `"$REPO"`, `"$PR"` substituted:

```bash
gh api "repos/$OWNER/$REPO/pulls/$PR/reviews" \
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.submitted_at'
```

## Thread Listing with Full Finding Bodies (Triage View)

The Step 2 query returns only IDs and paths. For triage, pull the first-comment body and line number per thread:

```bash
gh api graphql -f query='query { repository(owner:"OWNER",name:"REPO"){
  pullRequest(number:PR){ reviewThreads(first:40){ nodes {
    id isResolved comments(first:1){ nodes { databaseId path line body } } } } } } }' \
| jq -r '.data.repository.pullRequest.reviewThreads.nodes[]
         | select(.isResolved==false)
         | "--- \(.comments.nodes[0].path):\(.comments.nodes[0].line)\nreply-id: \(.comments.nodes[0].databaseId)\nresolve-id: \(.id)\n\(.comments.nodes[0].body)\n"'
```

## One-Shot Status: Open-Thread Count + Latest Verdict

A quick "where does this PR stand" check combining both signals:

```bash
OPEN=$(gh api graphql -f query='query { repository(owner:"OWNER",name:"REPO"){
  pullRequest(number:PR){ reviewThreads(first:40){ nodes { isResolved } } } } }' \
  --jq '[.data.repository.pullRequest.reviewThreads.nodes[]|select(.isResolved==false)]|length')

VERDICT=$(gh api repos/OWNER/REPO/pulls/PR/reviews \
  --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|"\(.state) @ \(.submitted_at)"')

echo "open threads: $OPEN | latest copilot review: $VERDICT"
```

## Poll Variant with Exit Codes and Finding Printout

A stricter poll suitable for scripting. It exits `0` when a review newer than the baseline lands, printing any unresolved threads first — a review with no open threads and one with threads are both exit `0`, because both are a review that happened, and neither is a clean pass until SKILL.md Step 8's block read has run. Exit `1` is the timeout. Exit `2` is "nothing to poll for": the timeline carries no `review_requested` event for Copilot on this PR, so no review is coming. Exit `3` is a **no-review** — Copilot posted a review object whose body says no review happened. Two wordings measured here: the quota-limit message (#479, #470) and "Copilot wasn't able to review any files in this pull request" (#506, a lockfile-only PR). Hand the PR to `advocatus-diaboli` rather than reading either as a pass. Exit `4` is a body matching neither the accept marker nor a known no-review wording — the format moved; the body is printed, read it and add the marker rather than removing the guard.

```bash
#!/usr/bin/env bash
# poll-copilot.sh OWNER REPO PR [iterations]
set -euo pipefail
OWNER=$1; REPO=$2; PR=$3; ITER=${4:-20}

latest_review() {
  # Timestamp AND body from ONE read of ONE review object: two reads let a review
  # landing between them pair a new timestamp with the previous review's body.
  gh api "repos/$OWNER/$REPO/pulls/$PR/reviews" \
    --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|if . == null then "null" else "\(.submitted_at)\n\(.commit_id)\n\(.body // "")" end'
}

open_threads() {
  gh api graphql -f query="query { repository(owner:\"$OWNER\",name:\"$REPO\"){
    pullRequest(number:$PR){ reviewThreads(first:40){ nodes {
      id isResolved comments(first:1){ nodes { databaseId path line body } } } } } } }" \
  | jq -r '.data.repository.pullRequest.reviewThreads.nodes[]
           | select(.isResolved==false)
           | "\(.comments.nodes[0].path):\(.comments.nodes[0].line) \(.comments.nodes[0].body)"'
}

request_ids() {
  # The timeline, not requested_reviewers: that field omits Bot-type reviewers
  # and reads [] whether or not the request landed. Ids one per line rather than
  # `| length`, which --paginate would make a per-page count past 100 events.
  gh api "repos/$OWNER/$REPO/issues/$PR/timeline" --paginate \
    --jq '.[]|select(.event=="review_requested" and .requested_reviewer.login=="Copilot")|.id'
}

HEAD_SHA=$(git rev-parse HEAD)
# Read once, deliberately: push again mid-poll and every later review reads as
# "not the pushed HEAD" until timeout. Fail-safe, and the stderr line names the
# sha so it is diagnosable. Re-run the script after a second push.
# The guard is needed even under `pipefail`, which aborts here with rc 1 and no
# message — the timeout's own code, so a failed baseline would read as a timeout.
BASE=$(latest_review | sed -n 1p) \
  || { echo "baseline reviews read failed — do not poll" >&2; exit 2; }

# Read FIRST, count second. A guard on `X=$(gh … | wc -l)` cannot fire: `||` sees
# the exit status of `wc`, and gh's error body has no trailing newline, so a failed
# read counts 0 — the common healthy value. Separating them makes the guard real
# and makes the operand always an integer, so the arm rule in SKILL.md Step 6 has
# nothing left to bite on here. The awk counts only id-shaped lines, so an HTML
# error page from an edge proxy counts 0 rather than one per line.
IDS=$(request_ids) || { echo "timeline read failed — cannot confirm the request" >&2; exit 2; }
REQS=$(printf '%s\n' "$IDS" | awk '/^[0-9]+$/{n++} END{print n+0}')
if [ "$REQS" -gt 0 ]; then
  :
else
  echo "no usable review_requested event for Copilot on this PR — nothing to poll for" >&2
  exit 2
fi

for i in $(seq 1 "$ITER"); do
  sleep 25
  REVIEW=$(latest_review) || { echo "reviews read failed — retrying" >&2; continue; }
  LATEST=$(printf '%s\n' "$REVIEW" | sed -n 1p)
  SHA=$(printf '%s\n' "$REVIEW" | sed -n 2p)
  BODY=$(printf '%s\n' "$REVIEW" | tail -n +3)

  # gh writes the error body to stdout on a failed request, so require a timestamp.
  case "$LATEST" in
    [0-9][0-9][0-9][0-9]-*) ;;
    *) continue ;;
  esac

  # The direct assertion the request count only proxies: the review must be on the
  # head you pushed. commit_id is present on every review kind.
  if [ "$SHA" != "$HEAD_SHA" ]; then
    echo "review $LATEST is on $SHA, not the pushed HEAD — still waiting" >&2
    continue
  fi

  if [ "$LATEST" != "$BASE" ]; then
    # Default-deny: accept on a marker measured in every genuine review, name both
    # no-review wordings, refuse anything else rather than guess (see the counts
    # in SKILL.md Step 8). Matching only "unable to review" let #506's "wasn't
    # able to review any files" through as a clean pass.
    case "$BODY" in
      *"Pull request overview"*) ;;
      *"unable to review"*|*"wasn't able to review"*)
        echo "Copilot declined, this is not a review: $BODY" >&2; exit 3 ;;
      *)
        echo "unrecognised review body — read it before calling it a pass:" >&2
        echo "$BODY" >&2; exit 4 ;;
    esac
    FINDINGS=$(open_threads)
    if [ -z "$FINDINGS" ]; then
      # No open threads is not yet a clean pass: a suppression block posts none.
      echo "re-review at $LATEST, no open threads — run SKILL.md Step 8's block read before calling it clean"; exit 0
    fi
    echo "re-review at $LATEST with new findings:"; echo "$FINDINGS"; exit 0
  fi
done

echo "timeout: no re-review after $ITER iterations" >&2
exit 1
```

There is no exit-condition asymmetry to manage any more, and that is the point of the shape above. Every completion mode observed on this repository posts a **review object** — 58 of 58 Copilot requests across 52 PRs produced one, zero mismatches — and there are **four** modes, not three: a clean pass (#491), findings (#512, #562 as threads; five #494 passes only in a suppression block, which a thread count never sees — SKILL.md Step 8), a quota refusal (#479, #470), and nothing-to-review (#506). So the reviews list is the only surface the poll reads, the `commit_id` decides whether the review is yours, and the body separates the two modes that ran from the two that did not. `requested_reviewers` is not consulted at all — it omits Bot-type reviewers, so it reads `[]` for a request that landed and for one that never did.

## Unresolve a Thread (Undo an Accidental Resolve)

The inverse mutation exists and takes the same `PRRT_...` thread node-id:

```bash
gh api graphql -f query='mutation { unresolveReviewThread(input:{threadId:"<PRRT_nodeId>"}){ thread { isResolved } } }'
```

## Wrapper Script Shape

For repos where the loop runs often, wrap the calls behind subcommands (this is the shape of `scripts/copilot-review.sh` proposed in the reference implementation):

```text
copilot-review.sh threads              # list open threads: <databaseId> <PRRT_nodeId> <path>
copilot-review.sh reply <id> <msg>     # REST reply to a thread's top comment (databaseId)
copilot-review.sh resolve <nodeId>     # GraphQL resolveReviewThread (PRRT_ node-id)
copilot-review.sh rerequest            # POST requested_reviewers with the bot slug
copilot-review.sh poll                 # block until re-review or timeout (exit 0/1/2/3/4)
copilot-review.sh status               # open-thread count + latest Copilot verdict
```

Repo and PR are inferred from the current branch (`gh pr view --json number`), overridable by flags. Keep credentials out — the already-authenticated `gh` is the only dependency.

## Adapting to Another Bot Reviewer

The mechanics generalize to any bot that files review threads. Parameterize two strings:

```bash
BOT_REVIEW_LOGIN="copilot-pull-request-reviewer[bot]"   # author of submitted reviews
BOT_REQUEST_SLUG="copilot-pull-request-reviewer[bot]"   # slug for requested_reviewers POST
```

Verify that a request actually landed on the **timeline**, which is the only surface that answers it for a Bot reviewer:

```bash
gh api repos/OWNER/REPO/issues/PR/timeline --paginate \
  --jq '.[]|select(.event=="review_requested")|"\(.requested_reviewer.login) type=\(.requested_reviewer.type)"'
# -> Copilot type=Bot
```

## Canonical Step 7 Poll Loop (Subshell Form)

The full subshell poll loop extracted from `SKILL.md` Step 7 (20 × 25 s ≈ 8 min budget; single atomic API read for `submitted_at`, `commit_id`, and `body`; exit 0 = genuine review on pushed HEAD, exit 1 = timeout, exit 2 = bad `$BASE` or `git rev-parse` failure, exit 3 = quota/nothing-to-review refusal, exit 4 = unrecognized review body):

```bash
# Runs in a subshell: the exits below end the poll, not your shell.
( : "${BASE:?run Step 1 first}"
  # `:?` catches unset, not garbage: a failed Step 1 read leaves JSON in $BASE.
  case "$BASE" in null|[0-9][0-9][0-9][0-9]-*) ;; *)
    echo "BASE is not a timestamp: $BASE — re-run Step 1" >&2; exit 2 ;;
  esac
  # Read once: push again mid-poll and every later review reads as "not the
  # pushed HEAD" until timeout — fail-safe, and the stderr line names the sha.
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

## Corpus Measurements Behind Steps 6–8

- **Timeline vs. `requested_reviewers` (Step 6):** `requested_reviewers` omits Bot-type reviewers, measured on PRs #512 and #562 (read `[]` while the review arrived minutes later; both carried `review_requested Copilot type=Bot` on the timeline) vs. #553 (no timeline event, no review).
- **Completion modes (Step 7):** 58 of 58 requests across 52 PRs posted a review object; 29 of 76 bodies in the corpus were no-reviews (quota refusal on #470/#479 arriving in 5–12 s; nothing-to-review on #506 lockfile-only PR arriving after ~2 min).
- **Marker stability (Step 8):** `"Pull request overview"` appeared in 47 of 47 genuine reviews and 0 of 29 no-reviews, whereas four genuine reviews (#524, #525, #736, #755) lacked `"reviewed N out of M"`.
- **Suppression blocks (Step 8):** appeared on 8 of 47 genuine reviews (7 `Suppressed comments (N)`, 1 `Comments suppressed due to low confidence (N)` on #221), including under zero headlines (5 of 16 zero-headline genuine reviews; five consecutive #494 passes carried 14 entries across 5 heads, whereas #491 carried none) and non-zero headlines (#221, #494, #537). Entries are leads, not verdicts (e.g., #494/#922).
