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

A stricter poll suitable for scripting. It exits `0` when a review newer than the baseline lands, printing any new findings first — a clean re-review and one with findings are both exit `0`, because both are a review that happened. Exit `1` is the timeout. Exit `2` is "nothing to poll for": the timeline carries no `review_requested` event for Copilot on this PR, so no review is coming. Exit `3` is a **refusal** — Copilot posted a review object whose body says it was unable to review, which on this repository is the quota-limit message; hand the PR to `advocatus-diaboli` rather than reading it as a pass.

```bash
#!/usr/bin/env bash
# poll-copilot.sh OWNER REPO PR [iterations]
set -euo pipefail
OWNER=$1; REPO=$2; PR=$3; ITER=${4:-20}

latest_review() {
  gh api "repos/$OWNER/$REPO/pulls/$PR/reviews" \
    --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.submitted_at'
}

open_threads() {
  gh api graphql -f query="query { repository(owner:\"$OWNER\",name:\"$REPO\"){
    pullRequest(number:$PR){ reviewThreads(first:40){ nodes {
      id isResolved comments(first:1){ nodes { databaseId path line body } } } } } } }" \
  | jq -r '.data.repository.pullRequest.reviewThreads.nodes[]
           | select(.isResolved==false)
           | "\(.comments.nodes[0].path):\(.comments.nodes[0].line) \(.comments.nodes[0].body)"'
}

requests_logged() {
  # The timeline, not requested_reviewers: that field omits Bot-type reviewers
  # and reads [] whether or not the request landed.
  # Counted by LINES: --paginate with --jq emits one result per page, so `| length`
  # would return a count per page once the timeline passes 100 events.
  gh api "repos/$OWNER/$REPO/issues/$PR/timeline" --paginate \
    --jq '.[]|select(.event=="review_requested" and .requested_reviewer.login=="Copilot")|.id' \
    | wc -l
}

BASE=$(latest_review)

# Tested as `-gt 0`, never `-eq 0`: a command substitution inside an `if` condition is
# exempt from errexit, so a failed read reaches `[` as a JSON body, which exits 2 —
# and `if` reads that as false. The negated form would then poll anyway.
if [ "$(requests_logged)" -gt 0 ] 2>/dev/null; then
  :
else
  echo "no usable review_requested event for Copilot on this PR — nothing to poll for" >&2
  exit 2
fi

for i in $(seq 1 "$ITER"); do
  sleep 25
  LATEST=$(latest_review) || { echo "reviews read failed — retrying" >&2; continue; }

  # gh writes the error body to stdout on a failed request, so require a timestamp.
  case "$LATEST" in
    [0-9][0-9][0-9][0-9]-*) ;;
    *) continue ;;
  esac

  if [ "$LATEST" != "$BASE" ]; then
    BODY=$(gh api "repos/$OWNER/$REPO/pulls/$PR/reviews" \
      --jq '[.[]|select(.user.login=="copilot-pull-request-reviewer[bot]")]|last|.body')
    case "$BODY" in
      *"unable to review"*)
        echo "Copilot declined, this is not a review: $BODY" >&2; exit 3 ;;
    esac
    FINDINGS=$(open_threads)
    if [ -z "$FINDINGS" ]; then
      echo "clean re-review at $LATEST (0 new comments)"; exit 0
    fi
    echo "re-review at $LATEST with new findings:"; echo "$FINDINGS"; exit 0
  fi
done

echo "timeout: no re-review after $ITER iterations" >&2
exit 1
```

There is no exit-condition asymmetry to manage any more, and that is the point of the shape above. Every completion mode observed on this repository posts a **review object**: a clean pass (five on #494), findings (#512, #562), and a quota refusal (#479, #470). So the reviews list is the only surface the poll reads, and the body is what separates a refusal from a pass. `requested_reviewers` is not consulted at all — it omits Bot-type reviewers, so it reads `[]` for a request that landed and for one that never did.

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
copilot-review.sh poll                 # block until re-review or timeout (exit 0/1/2/3)
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
