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

A stricter poll suitable for scripting: exits `0` on a clean re-review (newer review with zero new threads, or the bot removed from `requested_reviewers`), exits `1` on timeout, and prints any new findings before exiting.

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

BASE=$(latest_review)

for i in $(seq 1 "$ITER"); do
  sleep 25
  LATEST=$(latest_review)
  if [ "$LATEST" != "$BASE" ] && [ "$LATEST" != "null" ]; then
    FINDINGS=$(open_threads)
    if [ -z "$FINDINGS" ]; then
      echo "clean re-review at $LATEST (0 new comments)"; exit 0
    fi
    echo "re-review at $LATEST with new findings:"; echo "$FINDINGS"; exit 0
  fi
  STILL=$(gh api "repos/$OWNER/$REPO/pulls/$PR" \
    --jq '[.requested_reviewers[].login] | any(. == "Copilot")')
  if [ "$STILL" = "false" ]; then
    echo "Copilot finished without posting a new review (no new comments)"; exit 0
  fi
done

echo "timeout: no re-review after $ITER iterations" >&2
exit 1
```

Note the exit-condition asymmetry: a **newer review** is detected from the reviews list (author `copilot-pull-request-reviewer[bot]`), while the **finished-without-comments** case is detected by `Copilot` (the user form) dropping out of `requested_reviewers`.

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
copilot-review.sh poll                 # block until re-review or timeout (exit 0/1)
copilot-review.sh status               # open-thread count + latest Copilot verdict
```

Repo and PR are inferred from the current branch (`gh pr view --json number`), overridable by flags. Keep credentials out — the already-authenticated `gh` is the only dependency.

## Adapting to Another Bot Reviewer

The mechanics generalize to any bot that files review threads. Parameterize two strings:

```bash
BOT_REVIEW_LOGIN="copilot-pull-request-reviewer[bot]"   # author of submitted reviews
BOT_REQUEST_SLUG="copilot-pull-request-reviewer[bot]"   # slug for requested_reviewers POST
```

Verify the pending-reviewer login form empirically before trusting the poll's second exit condition — for Copilot the pending entry appears as `Copilot`, not as the `[bot]` slug:

```bash
gh api repos/OWNER/REPO/pulls/PR --jq '.requested_reviewers[].login'
```
