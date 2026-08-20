#!/usr/bin/env bash
# Structural integrity validation for agents, teams, guides, workflows, and cross-references.
# Run locally with: bash scripts/validate-integrity.sh
# Also invoked by .github/workflows/validate-integrity.yml

set -euo pipefail

# ── When a command substitution needs `|| true`, and when it must NOT have one (#647) ──
#
# `set -e` plus `pipefail` means a bare `x=$(cmd | …)` carries the pipeline's exit status, so
# the assignment can abort the entire script. There is no message: the run simply stops, and
# every check below the abort is skipped while the log looks like a normal early exit. `grep`
# is the usual culprit, because "found nothing" is exit 1 and is often the case the check is
# hunting for. `| wc -l` does not rescue it -- `pipefail` returns the rightmost non-zero
# status, so `grep(1) | wc -l(0)` still exits 1.
#
# The rule, and it runs in both directions:
#
#   `|| true`  belongs where the next lines EXPLICITLY handle the empty result -- a `-z` test,
#              a count compared against an expected number, a loop that reports when it runs
#              zero times. The guard converts a fatal abort into a value the check then judges.
#
#   NO guard   where nothing checks the empty case. There `|| true` is strictly worse than the
#              abort: it turns a loud stop into a silent empty string, and an empty haystack
#              makes every "is X missing from it" test pass. That is the vacuous pass the A10
#              and A11 rules exist to forbid, arrived at from the other side.
#
# So a blanket sweep of `|| true` over every site is not a fix, and neither is removing them
# all. Each site is a judgement about whether its zero-case has a reader.
#
# `scripts/check-bare-substitutions.js` enforces the first half mechanically: a substitution
# whose pipeline can legitimately exit non-zero must either carry a guard or carry an
# `# abort-ok:` annotation saying why it cannot. It cannot enforce the second half -- whether
# a zero-check really follows is not decidable by grep -- which is why this comment exists.

failed=0
warn_count=0

# ── Assert that a corpus extraction found something (#647) ──────────────────────
#
# This is the other half of the rule above, and the reason a blanket `|| true` sweep would
# have made things worse rather than better.
#
# Every B7-B12 comparison has the shape `comm -23 <(extracted) <(reference)`. `comm -23`
# prints lines present only on the LEFT, so an empty left side reports nothing missing —
# and the check then prints its OK line. Replacing the abort with `|| true` at those sites
# and stopping there would convert "the script died" into "all registry domains have
# hand-tuned colours", measured over an empty registry. Louder is not the same as correct;
# the extraction has to be asserted before its result is trusted.
#
# Returns non-zero so callers can guard the comparison itself, rather than reporting a
# contradiction (FAIL on the extraction, OK on the comparison) in the same block.
require_nonempty() { # <label> <value>
  if [ -z "$2" ]; then
    echo "FAIL: $1 extracted nothing — the pattern has drifted from the file it reads,"
    echo "      so every comparison against it would pass vacuously"
    failed=1
    return 1
  fi
  return 0
}

# ── Shared: read one event's trigger paths out of a workflow (#641) ──────────────
#
# Two checks need this and each had its own `sed` range: A8c over validate-readmes.yml and
# A10d over validate-integrity.yml. Both ranges were terminated by whatever key happened to
# come next in that file (`schedule:` in one, `workflow_dispatch:` in the other), so each was
# silently coupled to the unrelated ordering of its target's `on:` block.
#
# THREE outcomes, and keeping them distinct is the whole point:
#
#   __UNIVERSAL__   the event block exists and declares no `paths:` key, so the workflow runs
#                   on every change. Coverage is total -- strictly stronger than any list.
#   path entries    a `paths:` filter is present; the caller decides what it must cover.
#   non-zero exit   the event block is absent (1), or `paths:` is present and yields nothing (2).
#
# The middle failure state is the one that matters. Folding "parse produced nothing" into
# "universal" would convert a drifted pattern into a silent all-clear -- the vacuous pass this
# family of checks exists to prevent, and the exact shape that shipped twice in #646.
#
# Both YAML sequence forms are handled because both are in use here: block form in
# validate-integrity.yml, flow form (`paths: ['a', 'b']`) in validate-tests.yml. The previous
# `sed` parses matched only block form, so a legal retag to flow form would have read as empty.
wf_event_paths() { # <workflow file> <event key>
  local file="$1" ev="$2" block entries
  block=$(awk -v ev="$ev" '
    /^  [A-Za-z_-]+:/ {
      key = $0; sub(/^  /, "", key); sub(/:.*$/, "", key)
      inev = (key == ev)
      if (inev) { found = 1 }
      next
    }
    inev { print }
    END { if (!found) exit 9 }
  ' "$file") || return 1

  # UNIVERSAL is the strongest verdict this function can return, so it is reached only on
  # positive evidence that the event carries no filtering key -- never as the fallback for
  # "nothing matched my pattern". The first version decided it by the ABSENCE of `^    paths:`,
  # which made every shape the parser did not understand read as "runs on everything":
  # `paths-ignore:` (a real filter, and the `-` defeats the pattern) and a `paths:` key at any
  # other indent both returned __UNIVERSAL__ with rc 0. Measured, before this guard existed.
  #
  # That is the same default-open defect as folding a broken parse into a pass, aimed at the one
  # verdict where it does most damage: a `paths-ignore:` added to a REQUIRED workflow would stop
  # it reporting on the excluded PRs -- hanging them on "Expected" forever, the exact #641
  # symptom -- while A10d printed "carries no paths filter, every input covered".
  #
  # rc 3 therefore means "this event is filtered by something I could not fully read". Fail
  # closed and name it, rather than guessing in the permissive direction.
  if printf '%s\n' "$block" | grep -qE '^[[:space:]]+paths-ignore:'; then
    return 3
  fi
  if ! printf '%s\n' "$block" | grep -qE '^    paths:'; then
    if printf '%s\n' "$block" | grep -qE '^[[:space:]]+paths:'; then
      return 3
    fi
    printf '__UNIVERSAL__\n'
    return 0
  fi

  entries=$(printf '%s\n' "$block" \
    | awk '
        /^    paths:[[:space:]]*\[/ {
          line = $0
          sub(/^[^[]*\[/, "", line); sub(/\].*$/, "", line)
          n = split(line, parts, ",")
          for (i = 1; i <= n; i++) { gsub(/^[[:space:]]+|[[:space:]]+$/, "", parts[i]); if (parts[i] != "") print parts[i] }
          next
        }
        /^    paths:/ { inp = 1; next }
        inp && /^      - / { print; next }
        inp && /^    [A-Za-z_-]+:/ { inp = 0 }
      ' \
    | sed -E "s/^      - //; s/^['\"]//; s/['\"]$//" \
    | sed '/^$/d' || true)

  [ -z "$entries" ] && return 2
  printf '%s\n' "$entries"
}

echo "=== Category A: Static Validation ==="

# A1: Validate agent frontmatter
echo "--- A1: Agent frontmatter ---"
for f in agents/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  # DO NOT add `intent` here without reading scripts/envelopes/a6a-abort-capable-substitutions.mjs
  # first. A6a owns that field and prints `FAIL: $f missing required field: intent`, which is
  # byte-identical to what this loop would render for `intent` — and the envelope case proving
  # A6a's diagnostic is reachable keys on exactly that string. Adding it here lets that case
  # report [KILLED] over a run in which A6a never executed.
  for field in name description tools priority; do
    if ! grep -q "^${field}:" "$f"; then
      echo "FAIL: $f missing required field: $field"
      failed=1
    fi
  done
done
[ "$failed" -eq 0 ] && echo "OK: All agent files have required frontmatter"

# A2: Validate team frontmatter
echo "--- A2: Team frontmatter ---"
a2_fail=0
for f in teams/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  for field in name description lead members coordination; do
    if ! grep -q "^${field}:" "$f"; then
      echo "FAIL: $f missing required field: $field"
      failed=1
      a2_fail=1
    fi
  done
done
[ "$a2_fail" -eq 0 ] && echo "OK: All team files have required frontmatter"

# A3: Validate guide frontmatter
echo "--- A3: Guide frontmatter ---"
a3_fail=0
for f in guides/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  for field in title description category; do
    if ! grep -q "^${field}:" "$f"; then
      echo "FAIL: $f missing required field: $field"
      failed=1
      a3_fail=1
    fi
  done
done
[ "$a3_fail" -eq 0 ] && echo "OK: All guide files have required frontmatter"

# ── Shared: registry entry set vs disk, for A4 and A5 (#648) ────────────────────
#
# A count is blind in two directions that matter, and A12 already learned both for guides:
# a file added with valid frontmatter and the total bumped, but with NO registry entry, keeps
# the numbers equal while being absent from every generated index -- because the READMEs render
# from the entry LIST, not from the count. And a swap (one file added, one removed in the same
# commit) leaves the number identical while both sides changed.
#
# Extracted rather than written twice, because A4 and A5 differ only in three nouns and the
# duplicated version would drift the way this repo's other duplicated readers have.
registry_entry_set() { # <tree> <registry> <section key>
  local tree="$1" registry="$2" section="$3"
  # `id` is declared HERE, not at its first loop, because the dupes loop now uses it too and a
  # loop variable that leaks to the global scope would be shared between the A4 and A5 calls.
  local reg_ids_all dupes reg_ids disk_ids id
  local rc=0

  # Scoped to the section, not the whole file: `default_skills:` in agents/_registry.yml also
  # holds list entries, and an unscoped `- id:` grep would silently widen the set the day one
  # of those gains an id.
  # `"$` and not `"\$`: inside a single-quoted shell string a backslash reaches sed literally, so
  # `s/^"(.*)"\$/` matched only an id ENDING IN A DOLLAR SIGN and the quote-strip was inert.
  # Verified rather than reasoned -- `printf '"x"\n' | sed -E 's/^"(.*)"\$/\1/'` prints `"x"`.
  # Nothing depends on it today (no id in either registry is quoted), which is exactly why it
  # would have sat here until someone quoted one and got accused of a missing file. A11 and A12
  # already use the correct form; this was the odd one out.
  # Range ENDS at the next top-level key, not at EOF. Both registries happen to put their
  # section last today, so `,$` gave the same answer -- and would keep giving it right up until
  # someone appends a top-level key with its own `- id:` list, at which point the set silently
  # widens and every extra id is reported as "only in registry". Entries are indented, so the
  # first unindented `key:` after the section is the boundary; if none follows, the range still
  # runs to EOF and nothing changes.
  reg_ids_all=$(sed -n "/^${section}:/,/^[a-z_][a-z_0-9]*:/ { /^  - id: /p }" "$registry" | tr -d '\r' \
    | sed -E 's/^  - id: *//' | sed -E 's/^"(.*)"$/\1/' | sort || true)

  # Before `sort -u`, because uniquing would collapse a duplicate and let the set still match
  # disk -- two entries pointing at one file forgiven by the check meant to pair them 1:1.
  dupes=$(printf '%s\n' "$reg_ids_all" | uniq -d || true)
  if [ -n "$dupes" ]; then
    # One FAIL line per duplicate, for the same reason as the discrepancy loops below: the
    # offending id has to sit on the line that says FAIL, or no envelope case can assert WHICH
    # id was duplicated. The header-plus-indent form violated this function's own convention
    # four lines above it.
    while IFS= read -r id; do
      [ -z "$id" ] && continue
      echo "FAIL: $registry has two entries sharing one id: $id"
      rc=1
    done <<< "$dupes"
  fi

  # Same class: `/^\$/d` deleted lines consisting of a literal `$`, not empty lines.
  reg_ids=$(printf '%s\n' "$reg_ids_all" | sed '/^$/d' | sort -u || true)
  disk_ids=$(find "$tree" -maxdepth 1 -name '*.md' -not -name '_template.md' -not -name 'README.md' \
    -exec basename {} .md \; | sort || true)

  # Fail-closed. An empty extraction means the pattern drifted from the file it reads, and
  # comparing an empty set against disk would report every file as missing -- loud, but for the
  # wrong reason. Naming the real cause is what stops the next reader "fixing" the registry.
  if [ -z "$reg_ids" ]; then
    echo "FAIL: extracted 0 '- id:' values from $registry under '${section}:' -- pattern drift, not a clean tree"
    return 1
  fi
  # ONE `FAIL:` LINE PER DISCREPANCY, not a header plus indented detail. Two reasons, and the
  # second is the one that bit: a reader wants the offending id on the line that says FAIL, and
  # `gate-envelope.js` kills a case only when one line contains both `FAIL` and the expected
  # substring. With the detail indented under a header, an envelope asserting "the orphaned
  # entry is named" reported [WRONG-RED] against a check that was naming it correctly -- the
  # harness could not see it, so the case proved nothing either way.
  compare_id_sets "$registry" "$tree" "$reg_ids" "$disk_ids" "$tree/<id>.md" || rc=1
  return "$rc"
}

# Both directions of a registry-vs-disk comparison, extracted so the SKILLS shape below can
# reuse it (#700). It differs from A4/A5 only in how the two sets are gathered -- skills live
# at `skills/<id>/SKILL.md` rather than `<tree>/<id>.md`, and their ids sit six spaces deep
# under `domains.<domain>.skills` rather than two -- so duplicating the reporting half would
# add a fifth hand-rolled comparison to the pile #672 is about.
compare_id_sets() { # <registry> <tree> <reg ids> <disk ids> <expected path shape>
  local registry="$1" tree="$2" reg_ids="$3" disk_ids="$4" shape="$5"
  local only_reg only_disk id rc=0
  only_reg=$(comm -23 <(printf '%s\n' "$reg_ids") <(printf '%s\n' "$disk_ids") || true)
  only_disk=$(comm -13 <(printf '%s\n' "$reg_ids") <(printf '%s\n' "$disk_ids") || true)
  if [ -n "$only_reg" ]; then
    while IFS= read -r id; do
      [ -z "$id" ] && continue
      echo "FAIL: $registry: only in registry (no file): $id -- expected ${shape//<id>/$id}"
      rc=1
    done <<< "$only_reg"
  fi
  if [ -n "$only_disk" ]; then
    while IFS= read -r id; do
      [ -z "$id" ] && continue
      echo "FAIL: $tree: only on disk (no registry entry): $id -- it renders in no generated index"
      rc=1
    done <<< "$only_disk"
  fi
  return "$rc"
}

# A4: Agent registry count and entry set
echo "--- A4: Agent registry vs disk ---"
a4_fail=0
disk_count=$(find agents -maxdepth 1 -name '*.md' -not -name '_template.md' -not -name 'README.md' | wc -l) # abort-ok: find over a directory whose absence is not drift but a broken checkout
# `|| true` and it is the point of this check: if `total_agents:` is ever renamed, the bare
# form aborted the run rather than reporting the drift it exists to catch. The `!=` below is
# the explicit zero-check -- an empty string never equals a number, so the FAIL prints.
reg_count=$(grep 'total_agents:' agents/_registry.yml | tr -d '\r' | awk '{print $2}' || true)
if [ "$disk_count" != "$reg_count" ]; then
  echo "FAIL: agents disk=$disk_count registry=$reg_count"
  failed=1; a4_fail=1
fi
registry_entry_set agents agents/_registry.yml agents || { failed=1; a4_fail=1; }
[ "$a4_fail" -eq 0 ] && echo "OK: $disk_count agents on disk match total_agents and the registry entry set"

# A5: Team registry count and entry set
echo "--- A5: Team registry vs disk ---"
a5_fail=0
disk_count=$(find teams -maxdepth 1 -name '*.md' -not -name '_template.md' -not -name 'README.md' | wc -l) # abort-ok: find over a directory whose absence is not drift but a broken checkout
reg_count=$(grep 'total_teams:' teams/_registry.yml | tr -d '\r' | awk '{print $2}' || true) # see A4
if [ "$disk_count" != "$reg_count" ]; then
  echo "FAIL: teams disk=$disk_count registry=$reg_count"
  failed=1; a5_fail=1
fi
registry_entry_set teams teams/_registry.yml teams || { failed=1; a5_fail=1; }
[ "$a5_fail" -eq 0 ] && echo "OK: $disk_count teams on disk match total_teams and the registry entry set"

# A15: Skill registry entry set (#700)
#
# The count check lives in `validate-skills.yml` and compares `total_skills:` against a disk
# count. A count cannot see a SET difference, and the realistic path leaves it untouched:
# rename `skills/<old>/` to `skills/<new>/` without editing the registry and the number is
# identical while the registry now names a directory that does not exist.
#
# Nothing else caught it. B1 walks `skills/*/` on disk to check symlinks -- the disk-to-symlink
# direction, which never reads the registry. B8 compares registry ids against glyph keys and is
# warn-only. B12 compares against `~/.claude/skills`, is warn-only, and prints SKIP in CI.
#
# The consequence is not tidiness: `skillsDeclaringBash` in the README generator enumerates the
# registry and, until #701, counted a registry-listed-but-missing skill as NON-declaring --
# quietly deflating a figure published in SECURITY.md, in the direction that UNDER-reports how
# much of the corpus instructs an agent to run shell commands. That branch now throws; this is
# the upstream repair, so the throw is unreachable on a green main rather than load-bearing.
echo "--- A15: Skill registry entry set ---"
a15_fail=0
# Six spaces, not two: skills nest under `domains.<domain>.skills`. Scoped to `^domains:` for
# the same reason A4/A5 scope to their section -- a future top-level key with its own `- id:`
# list would silently widen the set.
a15_reg_all=$(sed -n '/^domains:/,/^[a-z_][a-z_0-9]*:/ { /^      - id: /p }' skills/_registry.yml   | tr -d '\r' | sed -E 's/^      - id: *//' | sed -E 's/^"(.*)"$/\1/' | sort || true)
a15_dupes=$(printf '%s\n' "$a15_reg_all" | uniq -d || true)
if [ -n "$a15_dupes" ]; then
  while IFS= read -r id; do
    [ -z "$id" ] && continue
    echo "FAIL: skills/_registry.yml has two entries sharing one id: $id"
    failed=1; a15_fail=1
  done <<< "$a15_dupes"
fi
a15_reg=$(printf '%s\n' "$a15_reg_all" | sed '/^$/d' | sort -u || true)
# Directories carrying a SKILL.md, which is what the generator and the CLI both consume. A bare
# directory with no SKILL.md is not a skill and must not count as one on either side.
a15_disk=$(find skills -mindepth 2 -maxdepth 2 -name 'SKILL.md' -not -path 'skills/_template/*'   -printf '%h\n' 2>/dev/null | sed 's|^skills/||' | sort || true) # abort-ok: see A4
a15_declared=$(grep 'total_skills:' skills/_registry.yml | tr -d '\r' | awk '{print $2}' || true)
a15_extracted=$(printf '%s\n' "$a15_reg" | sed '/^$/d' | wc -l || true)
if [ -z "$a15_reg" ]; then
  echo "FAIL: extracted 0 '- id:' values from skills/_registry.yml under 'domains:' -- pattern drift, not a clean tree"
  failed=1; a15_fail=1
elif [ "$a15_extracted" != "$a15_declared" ]; then
  # The zero-guard only fires on a TOTAL extraction failure. A PARTIAL one -- one id at a
  # different indent, say -- sails past it, shrinks the registry set, and then reports every
  # unextracted skill as "only on disk (no registry entry)": loud, but a false positive, in a
  # REQUIRED context, with a message pointing at the wrong cause.
  #
  # `total_skills:` is an independent statement of the same number, so comparing against it
  # turns that storm into one accurate line. It is not a substitute for the count check in
  # validate-skills.yml, which compares the declared number against DISK; this compares it
  # against what the EXTRACTION found, and the two catch different things.
  echo "FAIL: extracted $a15_extracted '- id:' values from skills/_registry.yml but total_skills says $a15_declared"
  echo "      -- pattern drift in the extraction, not a registry/disk mismatch. Check indentation."
  failed=1; a15_fail=1
else
  compare_id_sets skills/_registry.yml skills "$a15_reg" "$a15_disk" "skills/<id>/SKILL.md" \
    || { failed=1; a15_fail=1; }
fi
[ "$a15_fail" -eq 0 ] && echo "OK: $a15_extracted skills in the registry match the directories on disk"

# A6: Agent intent contract (#285)
echo "--- A6: Agent intent contract ---"
a6_fail=0
declare -A AGENT_INTENT
# A6a: every agent has a valid intent that agrees with tools
for f in agents/*.md; do
  name=$(basename "$f" .md)
  [[ "$name" == "_template" || "$name" == "README" ]] && continue
  # `|| true` on both, and it is load-bearing rather than defensive (#647). Under
  # `set -euo pipefail` a bare `x=$(grep … | …)` carries the pipeline's status, so an agent
  # file WITHOUT `intent:` aborted the whole script on this line -- one line before the
  # `-z` guard that exists to report it. The FAIL below could never print, and every check
  # from A6 to B13 was skipped with no diagnostic at all. Both guards are correct under the
  # rule in the header: an explicit zero-check follows each of them.
  intent=$(grep -m1 '^intent:' "$f" | sed 's/^intent: *//' | tr -d '\r' | xargs || true)
  tools=$(grep -m1 '^tools:' "$f" | tr -d '\r' || true)
  if [ -z "$intent" ]; then
    echo "FAIL: $f missing required field: intent"
    failed=1; a6_fail=1; continue
  fi
  # A1 already fails a file with no `tools:`, so this is a second reader of the same fact
  # rather than the only one. It is here because the alternative is worse than a duplicate
  # FAIL line: an empty `$tools` silently yields has_we=0 below, i.e. "no Write/Edit", so an
  # ADVISORY agent with no `tools:` line agrees with itself and A6a emits nothing at all.
  #
  # The comment here first named the implementing case, which was backwards — that one is
  # already caught, printing `intent=implementing but tools lack Write/Edit` from the check
  # below. Advisory is the direction that escaped silently, and it is the direction a future
  # reader would use to decide whether this guard is removable.
  if [ -z "$tools" ]; then
    echo "FAIL: $f missing required field: tools (A6a cannot judge intent without it)"
    failed=1; a6_fail=1; continue
  fi
  if [[ "$intent" != "advisory" && "$intent" != "implementing" ]]; then
    echo "FAIL: $f intent='$intent' (must be advisory|implementing)"
    failed=1; a6_fail=1; continue
  fi
  AGENT_INTENT[$name]=$intent
  if echo "$tools" | grep -qE '\b(Write|Edit)\b'; then has_we=1; else has_we=0; fi
  if [ "$intent" = "implementing" ] && [ "$has_we" -eq 0 ]; then
    echo "FAIL: $name intent=implementing but tools lack Write/Edit"; failed=1; a6_fail=1
  fi
  if [ "$intent" = "advisory" ] && [ "$has_we" -eq 1 ]; then
    echo "FAIL: $name intent=advisory but tools include Write/Edit"; failed=1; a6_fail=1
  fi
done

# A6b: a team may assign implementation-flavored roles only to implementing
# effective agents (member agent, or subagent_type overriding to a full-capability
# type). Advisory roles (Reviewer/Auditor/Advisor/Specialist/Monitor/Lead) are exempt.
impl_kw='Developer|Implementer|Programmer|Builder|Engineer|Operator|Hardener|Architect'
for f in teams/*.md; do
  tname=$(basename "$f")
  [[ "$tname" == "_template.md" || "$tname" == "README.md" ]] && continue
  while IFS='|' read -r ag sub role; do
    [ -z "$ag" ] && continue
    eff="$ag"
    if [ -n "$sub" ] && [ "$sub" != "any" ]; then
      # subagent_type overrides; full-capability unless it names another advisory agent
      [ "${AGENT_INTENT[$sub]:-implementing}" = "implementing" ] && continue
      eff="$sub"
    fi
    if echo "$role" | grep -qE "$impl_kw"; then
      if [ "${AGENT_INTENT[$eff]:-implementing}" = "advisory" ]; then
        echo "FAIL: $tname assigns implementation role '$role' to advisory agent '$eff' (override subagent_type to a full-capability type, or mark the agent implementing)"
        failed=1; a6_fail=1
      fi
    fi
  done < <(awk '
    /CONFIG:START/{inc=1} /CONFIG:END/{inc=0}
    inc && match($0,/^[[:space:]]*-[[:space:]]*agent:[[:space:]]*/){
      if(a!=""){print a"|"s"|"r}
      a=$0; sub(/^[[:space:]]*-[[:space:]]*agent:[[:space:]]*/,"",a); sub(/[[:space:]]*#.*/,"",a); sub(/[[:space:]]*$/,"",a); s=""; r=""
    }
    inc && match($0,/^[[:space:]]*subagent_type:[[:space:]]*/){
      s=$0; sub(/^[[:space:]]*subagent_type:[[:space:]]*/,"",s); sub(/[[:space:]]*#.*/,"",s); sub(/[[:space:]]*$/,"",s)
    }
    inc && match($0,/^[[:space:]]*role:[[:space:]]*/){
      r=$0; sub(/^[[:space:]]*role:[[:space:]]*/,"",r); sub(/[[:space:]]*#.*/,"",r); sub(/[[:space:]]*$/,"",r)
    }
    END{if(a!=""){print a"|"s"|"r}}
  ' "$f")
done
[ "$a6_fail" -eq 0 ] && echo "OK: All agents have a valid intent agreeing with tools; team implementation roles map to implementing agents"

# A7: Workflow sidecar convention (#288 Phase-1 DoD)
# Sidecar comment block present (name/description/phases) and the discovery
# triple-equality holds: filename stem == sidecar name == meta.name. Grep only,
# no JS parser; registry-count sync stays deferred to #294 (no registry yet).
# Assumes every non-template workflows/*.mjs is a full workflow carrying an
# `export const meta` literal (the bare-file authoring convention) — a helper
# module dropped here with no sidecar/meta would (correctly) fail this check.
# meta.name may be single- or double-quoted; the value must equal the stem.
echo "--- A7: Workflow sidecar convention ---"
a7_fail=0
a7_count=0
for f in workflows/*.mjs; do
  wname=$(basename "$f")
  [[ "$wname" == "_template.mjs" ]] && continue
  stem=$(basename "$f" .mjs)
  a7_count=$((a7_count + 1))
  for field in name description phases; do
    if ! grep -q "^// ${field}:" "$f"; then
      echo "FAIL: $f missing sidecar field: // ${field}:"
      failed=1; a7_fail=1
    fi
  done
  sidecar_name=$(grep -m1 '^// name:' "$f" | sed 's|^// name: *||' | tr -d '\r' | xargs || true)
  meta_name=$(grep -m1 -E "^[[:space:]]*name:[[:space:]]*[\"']" "$f" | sed -E "s/.*name:[[:space:]]*[\"']//; s/[\"'].*//" | tr -d '\r' || true)
  if [ -z "$sidecar_name" ]; then
    echo "FAIL: $f sidecar '// name:' is empty (expected '$stem')"
    failed=1; a7_fail=1
  elif [ "$sidecar_name" != "$stem" ]; then
    echo "FAIL: $f sidecar name '$sidecar_name' != filename stem '$stem'"
    failed=1; a7_fail=1
  fi
  if [ -z "$meta_name" ]; then
    echo "FAIL: $f has no parseable meta.name (expected \`name: '$stem'\` in export const meta)"
    failed=1; a7_fail=1
  elif [ "$meta_name" != "$stem" ]; then
    echo "FAIL: $f meta.name '$meta_name' != filename stem '$stem'"
    failed=1; a7_fail=1
  fi
done
[ "$a7_fail" -eq 0 ] && echo "OK: All $a7_count workflow(s) have a valid sidecar; filename == sidecar name == meta.name"

# A8: Auto-commit file_pattern coverage (#357, hardened #362)
# The git-auto-commit `file_pattern` in .github/workflows/update-readmes.yml is a
# hand-maintained allowlist. Every file the push-to-main auto-commit regenerates must
# be a token in it, or git-auto-commit-action regenerates the file in the runner but
# never stages it -> silent re-drift. Two generators feed that job:
#   1. generate-readmes.js -> the MANAGED array's `path:` literals (static-parsed
#      below from the `const MANAGED = [` ... `];` block; the same literals drive
#      the generator and `--list-outputs`, so path-vs-label divergence is
#      impossible -- and the parse stays free of `npm ci` / js-yaml).
#   2. generate-translation-status.js -> i18n/<code>/translation_status.yml for every
#      `- code:` locale in i18n/_config.yml.
# Both containment directions are checked: a generated file missing from
# file_pattern (silent drop) and a file_pattern token no generator produces
# (dead allowlist entry). file_pattern must remain LITERAL paths — the
# containment checks compare exact tokens, so a glob there would FAIL both
# directions even when semantically correct.
# Also checked: anti-bounce negation sync. update-readmes.yml triggers on the
# English content trees; its deploy-key auto-commit re-triggers workflows
# (unlike GITHUB_TOKEN), so every MANAGED output under a triggering tree must
# carry a matching `!`-negation in the paths list, or the auto-commit bounces
# the workflow. The triggering trees are DERIVED from that workflow's own paths list rather
# than assumed — they were hardcoded as skills/ agents/ teams/ guides/, which went stale the
# moment i18n/README.md became a generated output (#569).
echo "--- A8: Auto-commit file_pattern coverage ---"
a8_fail=0
a8_readmes=$(sed -n '/^const MANAGED = \[/,/^\];/p' scripts/generate-readmes.js \
  | grep -oE "path: ['\"][^'\"]+['\"]" | sed -E "s/^path: ['\"]//; s/['\"]\$//" | sort -u || true)
a8_locales=$(grep -E '^[[:space:]]*-[[:space:]]*code:' i18n/_config.yml | sed -E 's/.*code:[[:space:]]*//; s/[[:space:]]*$//' | tr -d '\r' || true)
a8_status=$(printf '%s\n' "$a8_locales" | sed -E '/^$/d; s#^#i18n/#; s#$#/translation_status.yml#' || true)
a8_expected=$(printf '%s\n%s\n' "$a8_readmes" "$a8_status" | sed -E '/^$/d' | sort -u) # abort-ok: printf|sed|sort-u return 0 on empty input; the -z checks two lines below read the result
a8_fp=$(grep -m1 'file_pattern:' .github/workflows/update-readmes.yml | sed -E 's/.*file_pattern:[[:space:]]*"([^"]*)".*/\1/' | tr '\t' ' ' || true)
if [ -z "$a8_readmes" ] || [ -z "$a8_locales" ] || [ -z "$a8_fp" ]; then
  echo "FAIL: A8 could not derive generated files, locales, or file_pattern"
  failed=1; a8_fail=1
else
  a8_count=0
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    a8_count=$((a8_count + 1))
    case " $a8_fp " in
      *" $f "*) : ;;
      *) echo "FAIL: generated file '$f' missing from update-readmes.yml file_pattern (auto-commit silently drops it -- #357)"; failed=1; a8_fail=1 ;;
    esac
  done <<< "$a8_expected"
  # Reverse containment: flag dead file_pattern tokens no generator produces.
  while IFS= read -r tok; do
    [ -z "$tok" ] && continue
    if ! printf '%s\n' "$a8_expected" | grep -Fxq "$tok"; then
      echo "FAIL: file_pattern token '$tok' matches no generated file (dead allowlist entry -- remove it or fix the generator/A8 parse)"
      failed=1; a8_fail=1
    fi
  done <<< "$(printf '%s' "$a8_fp" | tr ' ' '\n')"
  # Negation sync: every MANAGED output under a triggering content tree needs
  # a `!`-negation in update-readmes.yml paths, or the auto-commit re-triggers
  # the workflow (bounce).
  a8_negations=$(grep -E "^[[:space:]]*-[[:space:]]*'\!" .github/workflows/update-readmes.yml | sed -E "s/^[[:space:]]*-[[:space:]]*'\!//; s/'[[:space:]]*$//" || true)
  # The triggering trees are DERIVED from the workflow's own paths, not hardcoded. They used to
  # be the literal case arms `skills/*|agents/*|teams/*|guides/*`, which is a proxy for "what
  # this workflow triggers on" — and the proxy went stale the moment i18n/README.md became a
  # generated output (#569): `i18n/**/*.md` triggers, so the auto-commit would have re-triggered
  # the workflow with nothing here to notice. Same guard-by-a-proxy shape this repo keeps
  # paying for.
  #
  # Scope of the over-approximation, stated precisely because an earlier version of this
  # comment claimed it "never skips one" and that was false. For a SINGLE-QUOTED wildcard path
  # whose first segment is literal, taking the top-level prefix over-approximates and so fails
  # safe — it can demand a negation that was not strictly needed. Outside that shape it can
  # UNDER-derive, in three known ways: a root-level glob (`**/*.md`) reduces to the dead
  # literal tree `**`; a double-quoted or unquoted entry is invisible to this grep; and a
  # wildcard-FREE trigger equal to a MANAGED output derives no tree at all. The first is caught
  # mechanically just below. The other two are inherited from the single-quote convention the
  # negation parse above already assumes.
  a8_trees=$(grep -E "^[[:space:]]*-[[:space:]]*'[^!][^']*\*" .github/workflows/update-readmes.yml \
    | sed -E "s/^[[:space:]]*-[[:space:]]*'//; s/'.*$//; s#/.*##" | sort -u || true)
  if [ -z "$a8_trees" ]; then
    echo "FAIL: A8 could not derive the triggering trees from update-readmes.yml paths (parse broke, not a pass)"
    failed=1; a8_fail=1
  fi
  # A derived tree that still contains a wildcard came from a root-level glob. The case pattern
  # below QUOTES "$tree", so such a tree matches only paths literally beginning `**/` — nothing
  # — and would silently demand no negation for a pattern that re-triggers on everything.
  # Refuse rather than carry a dead tree.
  while IFS= read -r a8_tree; do
    [ -z "$a8_tree" ] && continue
    case "$a8_tree" in
      *\**)
        echo "FAIL: A8 derived the triggering tree '$a8_tree', which still contains a wildcard — a root-level glob cannot be reduced to a tree prefix, and would silently demand no negations"
        failed=1; a8_fail=1 ;;
    esac
  done <<< "$a8_trees"
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    while IFS= read -r tree; do
      [ -z "$tree" ] && continue
      case "$f" in
        "$tree"/*)
          if ! printf '%s\n' "$a8_negations" | grep -Fxq "$f"; then
            echo "FAIL: MANAGED output '$f' sits under triggering tree '$tree/' but has no '!$f' negation in update-readmes.yml paths (auto-commit would re-trigger the workflow)"
            failed=1; a8_fail=1
          fi ;;
      esac
    done <<< "$a8_trees"
  done <<< "$a8_readmes"
  # Dead negations: a negation for a path no generator manages is stale.
  while IFS= read -r n; do
    [ -z "$n" ] && continue
    if ! printf '%s\n' "$a8_readmes" | grep -Fxq "$n"; then
      echo "FAIL: update-readmes.yml negation '!$n' matches no MANAGED output (stale negation -- remove it or fix the generator/A8 parse)"
      failed=1; a8_fail=1
    fi
  done <<< "$a8_negations"
  # A8c: the PR-level staleness gate's path list must cover every MANAGED output, and its two
  # event blocks must agree (#563 review M1). Without this the gate degrades exactly the way
  # it was built to prevent, one file at a time and with nothing red anywhere: add a tenth
  # MANAGED entry, and A8 above forces it into update-readmes.yml's file_pattern, but nothing
  # forces it into validate-readmes.yml's paths — so hand edits to the new file stop being
  # gated. GitHub Actions cannot resolve a YAML anchor across event blocks, so the list is
  # necessarily duplicated in the workflow; this is what keeps the duplicate honest.
  a8_vr='.github/workflows/validate-readmes.yml'
  if [ ! -f "$a8_vr" ]; then
    echo "FAIL: $a8_vr is missing, so the generated-README staleness gate cannot run (#563)"
    failed=1; a8_fail=1
  else
    # Read through the shared helper, which distinguishes "no filter" from "parse broke".
    # An unfiltered event gates every path there is, which satisfies #563's requirement more
    # strongly than any list can -- so it is accepted, and the per-output containment below is
    # skipped for that event rather than being run against an empty list and passing vacuously.
    # `|| rc=$?`, never `; rc=$?`. A bare assignment carries its command's exit status, so
    # under `set -euo pipefail` a non-zero return ABORTS the script at this line -- red with no
    # diagnostic and every later check skipped. That is the #647 class, and the first version of
    # this very fix shipped it: the envelope reported WRONG-RED because the FAIL below never ran.
    a8_vr_push_rc=0; a8_vr_push=$(wf_event_paths "$a8_vr" push) || a8_vr_push_rc=$?
    a8_vr_pr_rc=0; a8_vr_pr=$(wf_event_paths "$a8_vr" pull_request) || a8_vr_pr_rc=$?
    if [ "$a8_vr_push_rc" -ne 0 ] || [ "$a8_vr_pr_rc" -ne 0 ]; then
      echo "FAIL: A8c could not parse the paths blocks of $a8_vr (rc push=$a8_vr_push_rc pr=$a8_vr_pr_rc; parse broke or a paths: key is empty -- not a pass)"
      failed=1; a8_fail=1
    else
      # Both events must gate the same set, or the gate fires on one event and not the other.
      # Two universals agree; a universal opposite a list does not, and that asymmetry is worth
      # reporting rather than silently treating the superset as good enough.
      if [ "$a8_vr_push" != "$a8_vr_pr" ]; then
        echo "FAIL: $a8_vr push and pull_request paths differ -- the gate would fire on one event and not the other:"
        diff <(printf '%s\n' "$a8_vr_push") <(printf '%s\n' "$a8_vr_pr") | sed 's/^/  /' || true
        failed=1; a8_fail=1
      fi
      if [ "$a8_vr_push" = "__UNIVERSAL__" ]; then
        echo "  A8c: $a8_vr carries no paths filter -- it runs on every change, so every MANAGED output is gated by construction"
      else
        while IFS= read -r f; do
          [ -z "$f" ] && continue
          if ! printf '%s\n' "$a8_vr_push" | grep -Fxq "$f"; then
            echo "FAIL: MANAGED output '$f' is missing from $a8_vr paths (hand edits to it would not be gated -- #563)"
            failed=1; a8_fail=1
          fi
        done <<< "$a8_readmes"
      fi
    fi
  fi

  [ "$a8_fail" -eq 0 ] && echo "OK: all $a8_count auto-generated files (readmes + per-locale translation_status) are in the auto-commit file_pattern; no dead tokens; negations in sync; staleness-gate paths cover every MANAGED output"
fi

# A9: Invocation-phrase allowed-tools coverage (#356, warn-only)
# A skill whose procedure invokes an orchestration tool by name ("via the
# `Agent` tool", "coordinate ... with `SendMessage`") should declare that tool
# in its frontmatter allowed-tools — the #354 drift class. The heuristic is
# deliberately narrow: an invocation verb (lower- or sentence-case), optional
# "the", then a backticked KNOWN orchestration tool name. Measured 2026-07-19
# over all 368 skills: 3 files / 12 lines matched, 0 false positives,
# 0 violations; both historical #354 cases would have been flagged. The verb
# anchor excludes bare mentions (deprecation notes, tool lists). Known
# false-negative classes, accepted because this is warn-only (see #356):
# un-backticked tool names ("with the Agent tool"), markdown emphasis breaking
# adjacency ("**via** `Agent`"), and verbs outside the list.
# allowed-tools is parsed from the frontmatter block only (first ---...---),
# in both inline (space-separated) and YAML block-list form.
echo "--- A9: Invocation-phrase allowed-tools coverage (warn-only) ---"
a9_tools='Agent|SendMessage|TaskCreate|TaskUpdate|TaskGet|TaskList|TeamCreate|TeamDelete|Workflow'
a9_verbs='via|Via|use|Use|uses|used|using|Using|with|With|through|Through|call|calls|calling|Call|invoke|invokes|invoked|Invoke|spawn|spawns|spawned|spawning|Spawn'
# The backtick lives in a single-quoted variable: GNU grep interprets an
# ESCAPED backtick (\`) as a buffer-start anchor, not a literal — a pattern
# built with \` matches under ugrep but silently never matches under GNU grep.
a9_bt='`'
a9_pattern="(${a9_verbs}) (the )?${a9_bt}(${a9_tools})${a9_bt}"
a9_warned=0
a9_hits=$(grep -lE "$a9_pattern" skills/*/SKILL.md || true)
while IFS= read -r f; do
  [ -z "$f" ] && continue
  [ "$f" = "skills/_template/SKILL.md" ] && continue
  invoked=$(grep -oE "$a9_pattern" "$f" | grep -oE "${a9_bt}(${a9_tools})${a9_bt}" | tr -d "$a9_bt" | sort -u || true)
  # Frontmatter region only (skips body code-fence examples); supports both
  # `allowed-tools: A B C` and the YAML block-list form.
  a9_fm=$(sed -n '2,/^---[[:space:]]*$/p' "$f" | tr -d '\r') # abort-ok: `sed -n` prints nothing and exits 0 when the range matches nothing
  a9_inline=$(printf '%s\n' "$a9_fm" | grep -m1 '^allowed-tools:' | sed 's/^allowed-tools:[[:space:]]*//' || true)
  a9_block=$(printf '%s\n' "$a9_fm" | awk '/^allowed-tools:[[:space:]]*$/{f=1;next} f&&/^[[:space:]]*-[[:space:]]/{sub(/^[[:space:]]*-[[:space:]]*/,"");print;next} f{exit}' || true)
  allowed=$(printf '%s %s' "$a9_inline" "$a9_block" | tr '\n' ' ')
  while IFS= read -r tool; do
    [ -z "$tool" ] && continue
    case " $allowed " in
      *" $tool "*) : ;;
      *) echo "WARN: $f invokes \`$tool\` in its procedure but allowed-tools lacks it (#356)"
         warn_count=$((warn_count + 1)); a9_warned=$((a9_warned + 1)) ;;
    esac
  done <<< "$invoked"
done <<< "$a9_hits"
[ "$a9_warned" -eq 0 ] && echo "OK: no invocation-phrase/allowed-tools drift (anchored pattern, warn-only)"

# A10: Content-type literals outside JavaScript (#585)
#
# #578 routed every JS consumer through `scripts/lib/content-types.js`. Three consumers are not
# JavaScript and cannot import it: two shell loops and one shell `case`. #584's PR body asserted
# the remaining literals "survive only inside a comment" -- true of A8's `case` arms, false of
# the repo, generalised from one site.
#
# So this ASSERTS rather than shares. A check beats a share when the languages differ, and it
# is the only option available here: this job runs `setup-node` with deliberately NO `npm ci`
# (the constraint A8 documents), and a shell script cannot import an ESM binding regardless.
# The SSOT is therefore read the way A8 reads MANAGED -- a static `sed` parse of the JS source.
#
# Two legal derivations, not one. `validate-translations.yml:59` iterates `agents teams guides`
# and is CORRECT to: it globs `"$locale_dir"*.md`, which finds nothing under the nested
# `skills/<id>/SKILL.md` layout. A rule demanding every loop equal CONTENT_TYPES would fire on
# it. So the flat form is derived too, from the `NESTING` record in scripts/lib/i18n-targets.js
# -- the same record that throws there on an unclassified tree, which makes it the cross-language
# source for the nesting fact rather than a second literal invented here.
#
# Every extraction below fails CLOSED. A pattern that drifts and matches nothing reports FAIL,
# never OK: a silent zero is the vacuous pass this whole check exists to prevent, and it is the
# same shape #578's first `NESTED.has(dir)` predicate had.
echo "--- A10: Content-type literals outside JavaScript ---"
a10_fail=0
a10_flat=""
# Counted separately, because they mean different things: `a10_full` is surfaces required to
# carry every tree, `a10_flatsites` is surfaces legitimately carrying only the non-nested ones.
# Reported rather than asserted -- the assertion is per site, against the form that site's own
# behaviour requires.
#
# `a10_loops_full` is asserted, and is LOOP-ONLY on purpose. The per-site rule and a count rule
# catch different drifts, so this repo now carries both. The per-site rule misses CO-DELETION:
# remove a loop's `= "skills"` branch AND drop `skills` from its list in one edit and it is a
# well-formed flat loop, silently. Do that to both full loops and no loop iterates the nested
# tree anywhere. Counting only loops is what makes that visible -- `a10_full` cannot, because
# translate-content.sh's three surfaces always count full and would report `3 full` on a corpus
# with zero full loops.
a10_full=0
a10_flatsites=0
a10_loops_full=0
a10_checked_find=0

a10_all=$(sed -n 's/^export const CONTENT_TYPES = Object.freeze(\[\(.*\)\]);$/\1/p' scripts/lib/content-types.js \
  | tr -d "'\"" | tr ',' ' ' | tr -s ' ' '\n' | sed '/^$/d' | sort || true)
a10_nested=$(sed -n 's/^const NESTING = {\(.*\)};$/\1/p' scripts/lib/i18n-targets.js \
  | tr ',' '\n' | grep -E ':[[:space:]]*true' | sed -E 's/^[[:space:]]*//; s/[[:space:]]*:.*//' | sed '/^$/d' | sort || true)

# Compare one extracted list against the full SSOT. Order is ignored -- these are loop and case
# arms, where order carries no meaning -- but duplicates are not, hence `sort` and not `sort -u`.
a10_expect_all() { # <label> <sorted-newline-list>
  a10_full=$((a10_full + 1))
  if [ -z "$2" ]; then
    echo "FAIL: A10 extracted no content types from $1 -- the pattern drifted, so that site is UNCHECKED"
    failed=1; a10_fail=1
  elif [ "$2" != "$a10_all" ]; then
    echo "FAIL: $1 lists [$(printf '%s' "$2" | tr '\n' ' ')] but CONTENT_TYPES is [$(printf '%s' "$a10_all" | tr '\n' ' ')]"
    failed=1; a10_fail=1
  fi
}

if [ -z "$a10_all" ] || [ -z "$a10_nested" ]; then
  echo "FAIL: A10 could not parse CONTENT_TYPES and/or NESTING -- every site below would go UNCHECKED"
  failed=1; a10_fail=1
else
  a10_flat=$(printf '%s\n' "$a10_all" | grep -vxF -f <(printf '%s\n' "$a10_nested") || true)
  if [ "$a10_flat" = "$a10_all" ]; then
    echo "FAIL: A10 derived no nested trees from NESTING, so the flat form cannot be told from the full one"
    failed=1; a10_fail=1
  fi

  # Every `for content_type in` loop in both files, matched by pattern rather than by line
  # number so a THIRD loop added later is checked too, instead of being invisible to a
  # hardcoded inventory.
  #
  # Which form a loop SHOULD take is derived from what the loop does, not from a list kept
  # here. A loop that branches on a nested tree (`[ "$content_type" = "skills" ]`) must iterate
  # the full list, because that branch is dead otherwise. A loop that does not branch --
  # validate-translations.yml:59, which globs `"$locale_dir"*.md` -- must iterate the flat
  # subset, because the nested layout puts nothing where that glob looks.
  #
  # The weaker rule this replaces ("at least one loop iterates the full list") let a full loop
  # silently degrade to the flat form whenever another full loop survived. Measured: dropping
  # `skills` from validate-translations.yml:81 left A10 reporting OK at exit 0, while CI stopped
  # checking every skill mirror for an orphaned source.
  a10_nested_re=$(printf '%s' "$a10_nested" | paste -sd'|' - || true)
  for a10_file in scripts/validate-integrity.sh .github/workflows/validate-translations.yml; do
    a10_hits=$(grep -nE 'for content_type in [a-z ]+; do' "$a10_file" 2>/dev/null || true)
    # Per FILE, not once overall. A pattern that still matches the other file would otherwise
    # satisfy a global check while this file went entirely unread -- measured: renaming the
    # loop variable in validate-integrity.sh left the old global guard silent.
    if [ -z "$a10_hits" ]; then
      echo "FAIL: A10 found no 'for content_type in' loop in $a10_file -- the pattern drifted, so that file is UNCHECKED"
      failed=1; a10_fail=1
      continue
    fi
    # Herestring, not a pipe: a `while` on the right of a pipe runs in a subshell, where
    # `failed=1` would be discarded and the whole check would report OK while finding violations.
    while IFS= read -r a10_hit; do
      [ -z "$a10_hit" ] && continue
      a10_line=${a10_hit%%:*}
      a10_list=$(printf '%s' "$a10_hit" | grep -oE 'for content_type in [a-z ]+; do' \
        | sed -E 's/^for content_type in //; s/; do$//' | tr -s ' ' '\n' | sed '/^$/d' | sort || true)
      # The branch sits 4 lines into both real cases; 10 is margin. A restructure that moves it
      # further reads here as "flat loop with a full list" and FAILS -- loud and worth reading,
      # which is the right direction for a heuristic window.
      # F5: `[a-z ]+` above admits no hyphen. A hyphenated tree name would make its loop line
      # unmatchable while the SSOT parse handled it fine -- widen both together if that day comes.
      if sed -n "${a10_line},$((a10_line + 10))p" "$a10_file" | grep -qE "= \"($a10_nested_re)\""; then
        a10_want="$a10_all"; a10_form="full: a \`= \"<nested tree>\"\` branch appears within 10 lines"
      else
        a10_want="$a10_flat"; a10_form="flat: no \`= \"<nested tree>\"\` branch within 10 lines (a branch written as \`case\`, \`[[ == ]]\`, or with single quotes reads as absent here)"
      fi
      if [ "$a10_list" = "$a10_want" ]; then
        if [ "$a10_want" = "$a10_all" ]; then
          a10_full=$((a10_full + 1)); a10_loops_full=$((a10_loops_full + 1))
        else
          a10_flatsites=$((a10_flatsites + 1))
        fi
      else
        echo "FAIL: $a10_file:$a10_line iterates [$(printf '%s' "$a10_list" | tr '\n' ' ')] but must be $a10_form: [$(printf '%s' "$a10_want" | tr '\n' ' ')]"
        failed=1; a10_fail=1
      fi
    done <<< "$a10_hits"
  done

  # Catches TOTAL degradation. It does not catch PARTIAL co-deletion -- one loop losing both its
  # branch and its list entry while another full loop survives -- and nothing here can, because
  # co-deletion removes every signal in the file that the loop ever handled the nested tree.
  # Distinguishing "deliberately stopped handling skills" from "accidentally stopped" needs a
  # human-declared expectation, i.e. the per-file inventory this check exists to avoid. Tracked
  # rather than papered over.
  if [ "$a10_loops_full" -eq 0 ]; then
    echo "FAIL: A10 found no loop iterating the FULL content-type list -- nested trees are walked nowhere. If that is deliberate, this line is the place to say so."
    failed=1; a10_fail=1
  fi

  # B5's reference corpus, a SEVENTH site and the same flat/nested split in a different shape:
  # two `find` pathspecs whose union must be the SSOT -- `find agents teams guides -name '*.md'`
  # plus `find skills -name 'SKILL.md'`. Invisible to the loop pattern above, and missed by both
  # #585's inventory and the first version of this check. Add a fifth mirrored tree and B5's
  # reference corpus silently omits it, so skills referenced only from that tree read as orphans.
  a10_find_flat=$(grep -oE "^find [a-z ]+ -name '\*\.md'" scripts/validate-integrity.sh \
    | sed -E "s/^find //; s/ -name '\*\.md'\$//" | tr -s ' ' '\n' | sed '/^$/d' | sort || true)
  a10_find_nested=$(grep -oE "^find [a-z ]+ -name 'SKILL\.md'" scripts/validate-integrity.sh \
    | sed -E "s/^find //; s/ -name 'SKILL\.md'\$//" | tr -s ' ' '\n' | sed '/^$/d' | sort || true)
  if [ -z "$a10_find_flat" ] || [ -z "$a10_find_nested" ]; then
    echo "FAIL: A10 could not extract B5's find pathspecs -- that site is UNCHECKED"
    failed=1; a10_fail=1
  else
    a10_checked_find=1
    if [ "$a10_find_flat" != "$a10_flat" ]; then
      echo "FAIL: B5's flat find walks [$(printf '%s' "$a10_find_flat" | tr '\n' ' ')] but the non-nested trees are [$(printf '%s' "$a10_flat" | tr '\n' ' ')]"
      failed=1; a10_fail=1
    fi
    if [ "$a10_find_nested" != "$a10_nested" ]; then
      echo "FAIL: B5's SKILL.md find walks [$(printf '%s' "$a10_find_nested" | tr '\n' ' ')] but the nested trees are [$(printf '%s' "$a10_nested" | tr '\n' ' ')]"
      failed=1; a10_fail=1
    fi
  fi

  # A10d: this job must actually RUN when one of the files A10 reads changes.
  #
  # A check that cannot fire on the file it guards is not a gate. `validate-integrity.yml`
  # already self-lists its own path for that reason, and A8c enforces the same property for the
  # staleness gate's outputs -- but nothing covered A10's INPUTS, and one of them
  # (.github/workflows/validate-translations.yml) was outside the trigger. A PR editing only that
  # file dropped a tree from its loop with A10 never running. Found by checking the CI log
  # rather than the check's own green.
  #
  # The source list below is hardcoded and inherently so: it is the set of files A10 opens, which
  # only A10 knows. Adding a read without adding it here is the one drift this cannot see.
  # `|| rc=$?` for the reason spelled out at A8c: a bare assignment would abort the script here.
  a10_paths_rc=0; a10_paths=$(wf_event_paths .github/workflows/validate-integrity.yml pull_request) || a10_paths_rc=$?
  a10_covered() { # <repo-relative path> -> 0 when some pull_request path entry matches it
    while IFS= read -r a10_pat; do
      [ -z "$a10_pat" ] && continue
      case "$a10_pat" in
        */\*\*) [ "${1#${a10_pat%/\*\*}/}" != "$1" ] && return 0 ;;
        *) [ "$a10_pat" = "$1" ] && return 0 ;;
      esac
    done <<< "$a10_paths"
    return 1
  }
  if [ "$a10_paths_rc" -ne 0 ]; then
    # rc 1 = no pull_request block at all; rc 2 = a paths: key that yielded nothing. Neither is
    # "runs on everything": an unreadable filter leaves trigger coverage UNKNOWN, and reporting
    # unknown as universal is how a drifted pattern becomes a silent all-clear.
    echo "FAIL: A10 could not read validate-integrity.yml's pull_request paths (rc=$a10_paths_rc) -- trigger coverage UNCHECKED"
    failed=1; a10_fail=1
  elif [ "$a10_paths" = "__UNIVERSAL__" ]; then
    # No paths filter: the workflow runs on every change, so every input A10 reads is covered.
    # This is the state #641 put it in so the job could become a required status check -- a
    # path-filtered workflow does not report on PRs outside its filter, and a required check
    # that never reports leaves the PR on "Expected" and refuses the merge forever.
    echo "  A10d: validate-integrity.yml carries no paths filter -- it runs on every change, so every A10 input is covered"
  else
    for a10_src in scripts/lib/content-types.js scripts/lib/i18n-targets.js \
                   scripts/validate-integrity.sh scripts/translate-content.sh \
                   .github/workflows/validate-translations.yml; do
      if ! a10_covered "$a10_src"; then
        echo "FAIL: A10 reads $a10_src, but .github/workflows/validate-integrity.yml does not run on changes to it -- editing that file alone bypasses this check entirely"
        failed=1; a10_fail=1
      fi
    done
  fi

  # translate-content.sh. The `case` arms are the ACCEPT-RULE -- what the scaffolder will and
  # will not act on. The other two describe that rule to a human, and a description that
  # disagrees with the rule is a lie someone reads while debugging.
  a10_expect_all "scripts/translate-content.sh case arms (the accept-rule)" \
    "$(sed -n '/^case "\$CONTENT_TYPE" in$/,/^esac$/p' scripts/translate-content.sh \
      | grep -oE '^  [a-z]+\)$' | tr -d ' )' | sort || true)"
  a10_expect_all "scripts/translate-content.sh usage line" \
    "$(grep -oE 'content-type: [a-z |]+' scripts/translate-content.sh \
      | sed -E 's/^content-type: //' | tr '|' ' ' | tr -s ' ' '\n' | sed '/^$/d' | sort || true)"
  a10_expect_all "scripts/translate-content.sh unknown-type message" \
    "$(grep -oE 'Use: [a-z, ]+' scripts/translate-content.sh \
      | sed -E 's/^Use: //' | tr ',' ' ' | tr -s ' ' '\n' | sed '/^$/d' | sort || true)"
fi

[ "$a10_fail" -eq 0 ] && echo "OK: $((a10_full + a10_flatsites + a10_checked_find * 2)) shell/YAML content-type list(s) agree with CONTENT_TYPES ($a10_loops_full full loop(s), $a10_flatsites flat loop(s), $((a10_full - a10_loops_full)) full surface(s), $((a10_checked_find * 2)) find pathspec(s))"

# A11: Every guide category reaches the rendered index (#644)
#
# `generate-readmes.js` rendered its two guide indexes from a hardcoded four-category
# literal while the registry carried five, so the one `investigation` guide appeared in
# no generated index at all. #644 replaced both literals with `lib/guide-categories.js`,
# which means the two indexes can no longer disagree with EACH OTHER -- and that is the
# whole of what sharing buys. Both call sites could still be wrong together, which is
# precisely the shape that shipped.
#
# Derived from the guides' own `category:` fields, NOT from the `categories:` block keys.
# The generator skips a category with no guides (`if (catGuides.length === 0) continue`),
# so a declared-but-empty category legitimately renders nothing and a block-keyed rule
# would fail on a correct tree.
#
# FOUR sub-checks, because an adversarial review of the first version found three ways to
# reproduce #644's exact symptom -- a guide in no generated index, every gate green -- that
# render coverage alone cannot see. Each was reproduced before being fixed:
#
#   A11a  every guide entry yields a USABLE category. A deleted `category:` line, an empty
#         `category: ""`, or a bare `category:` (no trailing space, so the pattern misses it)
#         all drop the guide from BOTH indexes while leaving the surviving categories fully
#         rendered -- so a distinct-value check finds nothing wrong. Measured: setting the
#         investigation guide to `category: ""` removed it from both files and left the old
#         A11 green. Compares a NON-uniqued count against the entry count for that reason.
#   A11b  every used category is DECLARED in the `categories:` block. Without this the union
#         in guideCategoryOrder() renders a typo'd category under a garbage heading, and
#         A11c then finds that heading and passes. Worse, A11c's own remediation advice
#         ("run npm run update-readmes") is the laundering step: measured, regenerating with
#         `category: investigatoin` produces `## Investigatoin` / `*investigatoin*` and turns
#         every gate green. The union stays -- rendering under a wrong heading beats not
#         rendering -- but it is now reported rather than silently absorbed.
#   A11c  every used category reaches BOTH rendered indexes. `guides/README.md` alone is not
#         enough: the two generators share only the ORDER, while the loop, the empty-skip and
#         the rendering are separately duplicated. Measured: reverting `generateGuidesSection`
#         alone to the old literal drops the guide from README.md while guides/README.md keeps
#         it, and `check-readmes` plus the old A11 both stay green. Note the two files use
#         DIFFERENT markup -- `## Label` in guides/README.md, `**Label**` in README.md.
#
# `check-readmes` cannot own any of this, by construction rather than by omission: it
# regenerates with the generator's own ordering and diffs the result against the file, so
# generator and check agree perfectly about a guide neither renders. A gate that consults
# the same source as its subject measures nothing. The comparison here is against the OTHER
# side -- the registry -- which is why it belongs in this script.
#
# Fails CLOSED. An empty extraction is FAIL, never OK -- a pattern that drifts and matches
# nothing is the vacuous pass this check exists to prevent (the A10 rule, applied here).
#
# Every extraction in A11 and A12 carries `|| true` or a justified `# abort-ok:`, and that is
# load-bearing rather than
# noise. Under `set -euo pipefail` a bare `x=$(grep ... )` aborts the ENTIRE script the moment
# grep matches nothing -- red with no diagnostic, the zero-check dead, and every later check
# skipped. The envelope reported WRONG-RED on the first version of A11 for exactly this.
# `grep -c` is the sneakiest member of the family: it prints `0` and exits 1, so a count
# extraction aborts even though the number you wanted was produced.
#
# The scope of that sentence is A11 and A12 ONLY. It said "every extraction below" until a
# review pointed out that A12's own two lines -- copied from A4/A5 in round 1 -- had no guard,
# which made the claim false about the exact failure class this gate exists to measure, five
# lines above the note tracking that class.
#
# That sentence used to end "the rest of this script is not [guarded]: #647 is the sweep, and
# until it lands do not read this paragraph as covering A1-A10." #647 IS this commit, so both
# halves were false on arrival. The whole file is now at zero unguarded sites --
# `npm run check:bare-substitutions` reports 0 UNGUARDED across all six tracked
# shell scripts, against 30 unguarded on the commit that introduced the sweep -- and the rule at
# the top of this file, not
# this paragraph, is where the guard policy lives.
echo "--- A11: Guide category render coverage ---"
a11_fail=0
# Non-uniqued, empties dropped: this is a per-ENTRY list, not a set (A11a needs the count).
a11_used=$(grep -E '^    category: ' guides/_registry.yml | tr -d '\r' \
  | sed -E 's/^    category: *//' | sed -E 's/^"(.*)"$/\1/' | sed -E "s/^'(.*)'$/\1/" \
  | sed '/^[[:space:]]*$/d' || true)
a11_used_count=$(printf '%s\n' "$a11_used" | sed '/^[[:space:]]*$/d' | wc -l) # abort-ok: printf|sed|wc return 0 on empty input; the -ne and -eq 0 tests in A11a below read the count
a11_entries=$(grep -c '^  - id: ' guides/_registry.yml || true)
# `tr -d '\r'` FIRST: the range anchors are `$`-terminated, so on a CRLF file they would miss
# both delimiters and the range would run to EOF. Moot under the repo's line-endings gate, but
# a guard positioned where it cannot do what its placement implies is worse than no guard.
# `[a-z0-9]` for the first character, not `[a-z]`: `3d-printing` already exists as a skills
# domain, so a digit-initial guide category is a realistic future key, and rejecting it here
# would be a loud FAIL on a correct tree.
a11_declared=$(tr -d '\r' < guides/_registry.yml | sed -n '/^categories:$/,/^guides:$/p' \
  | grep -E '^  [a-z0-9][a-z0-9_-]*:$' | sed 's/[: ]//g' || true)
if [ -z "$a11_declared" ]; then
  # Without this the run still goes red -- every used category cascades into a "not declared"
  # FAIL -- but it reports five wrong diagnoses instead of the one true one.
  echo "FAIL: A11 extracted 0 declared categories from the 'categories:' block -- pattern drift, not a clean tree"
  failed=1; a11_fail=1
fi
a11_cats=$(printf '%s\n' "$a11_used" | sed '/^[[:space:]]*$/d' | sort -u || true)
a11_readme_block=$(sed -n '/<!-- AUTO:START:guides -->/,/<!-- AUTO:END:guides -->/p' README.md | tr -d '\r' || true)
if [ -z "$a11_readme_block" ]; then
  echo "FAIL: A11 found no AUTO:guides block in README.md -- the markers moved or were deleted"
  failed=1; a11_fail=1
fi

# A11a: no guide entry silently lacks a usable category.
if [ "$a11_used_count" -ne "$a11_entries" ]; then
  echo "FAIL: $a11_entries guide entries but only $a11_used_count usable 'category:' value(s)"
  echo "      (an entry with a deleted, empty or valueless category renders in NO index, and"
  echo "       the categories that remain still render, so nothing else here would notice)"
  failed=1; a11_fail=1
fi

if [ "$a11_used_count" -eq 0 ]; then
  echo "FAIL: A11 extracted 0 guide categories from guides/_registry.yml -- pattern drift, not a clean tree"
  failed=1; a11_fail=1
else
  while IFS= read -r guide_cat; do
    [ -z "$guide_cat" ] && continue
    # A11b: used must be declared. Additive with A11c -- both report, neither short-circuits,
    # so the envelope's typo case keeps matching the A11c message it expects.
    if ! printf '%s\n' "$a11_declared" | grep -qxF "$guide_cat"; then
      echo "FAIL: guide category '$guide_cat' is not declared in the 'categories:' block of guides/_registry.yml"
      echo "      (it still renders, under a heading with no description -- do NOT fix this by"
      echo "       regenerating, which makes the garbage heading real and turns every gate green)"
      failed=1; a11_fail=1
    fi
    # A11c: rendered in both indexes. Capitalise the first letter only -- guideCategoryLabel().
    label="$(printf '%s' "${guide_cat:0:1}" | tr '[:lower:]' '[:upper:]')${guide_cat:1}"
    if ! grep -qxF "## $label" guides/README.md; then
      echo "FAIL: guide category '$guide_cat' has no '## $label' heading in guides/README.md"
      echo "      (a guide in that category renders in no generated index; run 'npm run update-readmes')"
      failed=1; a11_fail=1
    fi
    # Scoped to the AUTO block, unlike the `## $label` side. `guides/README.md` is fully
    # generated and its only `##` lines ARE the category headings, so that one needs no scope.
    # README.md is hand-written outside its markers, and a whole-line bold is a common way to
    # label a prose section -- an unscoped match would let a hand-added `**Design**` elsewhere
    # in the file stand in for the generated one. Measured today: the file's only whole-line
    # bold entries are the five category labels, all inside the block, so this changes nothing
    # now and closes the coincidence later.
    # `printf '%s\n'`, not `'%s'`: command substitution strips the block's trailing newline, so
    # `'%s'` leaves the last line unterminated. Both greps this repo runs -- ugrep locally, GNU
    # grep in CI -- match an incomplete last line with `-qxF`, verified on both, so this is not
    # a live bug. It is one byte to stop depending on that semantic, and the dependence would
    # be invisible in situ: the block's last line is always the END marker, never a label.
    if ! printf '%s\n' "$a11_readme_block" | grep -qxF "**$label**"; then
      echo "FAIL: guide category '$guide_cat' has no '**$label**' line in README.md's AUTO:guides block"
      echo "      (the two indexes share only their ORDER; each renders separately)"
      failed=1; a11_fail=1
    fi
  done <<< "$a11_cats"
fi
[ "$a11_fail" -eq 0 ] && echo "OK: $a11_used_count guide entries, $(printf '%s\n' "$a11_cats" | wc -l) distinct categories in use, all declared and rendered in both indexes"

# A12: Guide registry vs disk (#644)
# Mirrors A4/A5 on the total, and then goes past them. `total_guides` was the one registry
# total no validator compared to disk -- `total_skills` is checked by validate-skills.yml
# against a find-count, agents and teams by A4/A5, guides by nothing.
#
# The PATH SET is checked too, because the count alone inherits A4/A5's blindness: a guide
# file added with valid frontmatter and `total_guides` bumped, but NO registry entry, keeps
# both numbers equal and is in no index -- one more route to the #644 symptom with everything
# green. A set comparison also catches the swap a count cannot see (one file added, one
# removed). A4/A5 have the same gap against their own registries; that is #648, not this PR.
echo "--- A12: Guide registry vs disk ---"
a12_fail=0
# Both guarded. Deleting or renaming the `total_guides:` key makes grep exit 1, which under
# `set -euo pipefail` aborted the whole script here -- red with no diagnostic, A12's own FAIL
# never printed, categories B and C never reached. Verified before the guard was added. The
# envelope's count case cannot see it: mutating 35 -> 36 keeps the key greppable, so only a
# deletion reaches this path. Safe because the comparison below is a string `!=` -- an empty
# `reg_count` compares unequal and fails correctly rather than passing.
disk_count=$(find guides -maxdepth 1 -name '*.md' -not -name '_template.md' -not -name 'README.md' | wc -l || true)
reg_count=$(grep 'total_guides:' guides/_registry.yml | tr -d '\r' | awk '{print $2}' || true)
if [ "$disk_count" != "$reg_count" ]; then
  echo "FAIL: guides disk=$disk_count total_guides=$reg_count"
  failed=1; a12_fail=1
fi
a12_reg_paths_all=$(grep -E '^    path: ' guides/_registry.yml | tr -d '\r' \
  | sed -E 's/^    path: *//' | sed -E 's/^"(.*)"$/\1/' | sort || true)
a12_dupe_paths=$(printf '%s\n' "$a12_reg_paths_all" | uniq -d || true)
if [ -n "$a12_dupe_paths" ]; then
  # `sort -u` below would collapse a duplicate and let the set still match disk, so two entries
  # pointing at one file would be forgiven by the very check meant to pair them one-to-one.
  echo "FAIL: guides/_registry.yml has two entries sharing one path:"
  printf '%s\n' "$a12_dupe_paths" | sed 's/^/      /'
  failed=1; a12_fail=1
fi
a12_reg_paths=$(printf '%s\n' "$a12_reg_paths_all" | sort -u || true)
a12_disk_paths=$(find guides -maxdepth 1 -name '*.md' -not -name '_template.md' -not -name 'README.md' | sort || true)
if [ -z "$a12_reg_paths" ]; then
  echo "FAIL: A12 extracted 0 'path:' values from guides/_registry.yml -- pattern drift, not a clean tree"
  failed=1; a12_fail=1
elif [ "$a12_reg_paths" != "$a12_disk_paths" ]; then
  echo "FAIL: guides/_registry.yml path set differs from guides/*.md on disk"
  comm -3 <(printf '%s\n' "$a12_reg_paths") <(printf '%s\n' "$a12_disk_paths") \
    | sed 's/^\t/      only on disk: /; s/^\([^ ]\)/      only in registry: \1/'
  failed=1; a12_fail=1
fi
[ "$a12_fail" -eq 0 ] && echo "OK: $disk_count guides on disk match total_guides and the registry path set"

echo ""
echo "=== Category B: Structural Integrity ==="

# B1: Skill symlinks
echo "--- B1: Skill symlinks ---"
b1_fail=0
b1_count=0
for dir in skills/*/; do
  skill_name=$(basename "$dir")
  [[ "$skill_name" == "_template" ]] && continue
  [ ! -f "$dir/SKILL.md" ] && continue
  b1_count=$((b1_count + 1))
  if [ ! -L ".claude/skills/$skill_name" ]; then
    echo "FAIL: missing symlink .claude/skills/$skill_name"
    failed=1
    b1_fail=1
  fi
done
[ "$b1_fail" -eq 0 ] && echo "OK: All $b1_count skills have .claude/skills/ symlinks"

# B2: Agents symlink
echo "--- B2: Agents symlink ---"
if [ -L ".claude/agents" ] && [ -d ".claude/agents" ]; then
  echo "OK: .claude/agents symlink is valid"
else
  echo "FAIL: .claude/agents symlink is broken or missing"
  failed=1
fi

# B3: Team member agents exist
echo "--- B3: Team member agents ---"
b3_fail=0
b3_checked=0
for f in teams/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  # Extract member ids from structured YAML: members:\n  - id: agent-name
  while IFS= read -r line; do
    # GUARDED, not annotated (#647 review). The first version claimed `sed -n …p` exits 0 on
    # no match -- true, and irrelevant: `pipefail` surfaces the RIGHTMOST non-zero, and `xargs`
    # exits 1 on an unmatched quote. A team file carrying `  - id: o'brien` killed this loop
    # mid-B3 with one `xargs:` line on stderr and no FAIL -- an abort on the line above the
    # check written to report the malformed input. The `-n` test below is the zero-case reader.
    member=$(echo "$line" | sed -n 's/^  - id: *//p' | tr -d '\r' | xargs || true)
    if [ -n "$member" ]; then
      # Skip known placeholder values (dyad uses 'any' for flexible member)
      [[ "$member" == "any" ]] && continue
      b3_checked=$((b3_checked + 1))
      if [ ! -f "agents/${member}.md" ]; then
        echo "FAIL: $f references agent '$member' but agents/${member}.md not found"
        failed=1
        b3_fail=1
      fi
    fi
  done < "$f"
done
[ "$b3_fail" -eq 0 ] && echo "OK: All $b3_checked team member agent references exist on disk"

# B4: Agent skill references exist
echo "--- B4: Agent skill references ---"
b4_fail=0
b4_checked=0
for f in agents/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  # Extract skills from YAML frontmatter (indented list items under skills:)
  in_skills=0
  while IFS= read -r line; do
    if echo "$line" | grep -q '^skills:'; then
      in_skills=1
      continue
    fi
    if [ "$in_skills" -eq 1 ]; then
      if echo "$line" | grep -q '^  - '; then
        # Same `xargs` unmatched-quote abort as B3 above; the `-d` test below reads the empty case.
        skill_id=$(echo "$line" | sed 's/^  - //' | tr -d '\r' | xargs || true)
        b4_checked=$((b4_checked + 1))
        if [ ! -d "skills/${skill_id}" ]; then
          echo "FAIL: $f references skill '$skill_id' but skills/${skill_id}/ not found"
          failed=1
          b4_fail=1
        fi
      else
        in_skills=0
      fi
    fi
  done < "$f"
done
[ "$b4_fail" -eq 0 ] && echo "OK: All $b4_checked agent skill references exist on disk"

# B5: Orphan detection (warn only, not fail)
echo "--- B5: Orphan detection ---"
orphan_count=0
orphan_list=""
# Build reference corpus: all .md files except registries, READMEs, and templates
ref_corpus_file=$(mktemp)
find agents teams guides -name '*.md' -not -name '_template.md' -not -name 'README.md' -exec cat {} + > "$ref_corpus_file" 2>/dev/null
# Add skill-to-skill cross-references (all SKILL.md files)
find skills -name 'SKILL.md' -exec cat {} + >> "$ref_corpus_file" 2>/dev/null
for dir in skills/*/; do
  skill_name=$(basename "$dir")
  [[ "$skill_name" == "_template" ]] && continue
  # A skill is orphaned if it only appears in its own SKILL.md, nowhere else
  # Count total occurrences, subtract self-references (skill name appears in its own file)
  total=$(grep -c "$skill_name" "$ref_corpus_file" 2>/dev/null || echo 0)
  self=$(grep -c "$skill_name" "skills/${skill_name}/SKILL.md" 2>/dev/null || echo 0)
  external=$((total - self))
  if [ "$external" -le 0 ]; then
    orphan_count=$((orphan_count + 1))
    orphan_list="${orphan_list}  - ${skill_name} (self-refs: ${self}, external: ${external})\n"
  fi
done
rm -f "$ref_corpus_file"
if [ "$orphan_count" -gt 0 ]; then
  echo "WARN: $orphan_count orphan skills detected (registered but never referenced):"
  printf "$orphan_list"
  warn_count=$((warn_count + orphan_count))
else
  echo "OK: No orphan skills detected"
fi

# B6: Translation integrity
echo "--- B6: Translation integrity ---"
b6_fail=0
b6_checked=0
for content_type in skills agents teams guides; do
  for locale_dir in i18n/*/"$content_type"/; do
    [ ! -d "$locale_dir" ] && continue
    locale=$(basename "$(dirname "$locale_dir")")
    if [ "$content_type" = "skills" ]; then
      for skill_dir in "$locale_dir"*/; do
        [ ! -d "$skill_dir" ] && continue
        skill_name=$(basename "$skill_dir")
        b6_checked=$((b6_checked + 1))
        if [ ! -f "skills/${skill_name}/SKILL.md" ]; then
          echo "WARN: orphan translation i18n/$locale/skills/$skill_name ($locale)"
          warn_count=$((warn_count + 1))
        fi
      done
    else
      for item in "$locale_dir"*.md; do
        [ ! -f "$item" ] && continue
        item_name=$(basename "$item")
        b6_checked=$((b6_checked + 1))
        if [ ! -f "$content_type/$item_name" ]; then
          echo "WARN: orphan translation i18n/$locale/$content_type/$item_name ($locale)"
          warn_count=$((warn_count + 1))
        fi
      done
    fi
  done
done
if [ "$b6_checked" -gt 0 ]; then
  echo "OK: Checked $b6_checked translation(s) for source existence"
else
  echo "OK: No translations to check"
fi

echo ""
echo "=== Category C: Pipeline Sync Validation ==="

# B7: Palette domain coverage (registry domains vs cyberpunk color map)
echo "--- B7: Palette domain coverage ---"
b7_warn=0
# Guarded and then ASSERTED, per the two rules at the top of this file. Both greps here are
# corpus patterns that a reformat of `_registry.yml` or of `palettes.R` would silently stop
# matching, and `comm -23` over an empty left side reports nothing missing -- so the guard
# alone would turn a drifted pattern into this block's OK line.
reg_domains=$(grep '^\s\+[a-z0-9_-]\+:$' skills/_registry.yml | grep -v 'skills:' | sed 's/://;s/^ *//' | sort || true)
palette_domains=$(sed -n '/hand_domains.*list/,/hand_agents.*list/p' viz/R/palettes.R | grep -oP '^\s+"[a-z0-9-]+"' | sed 's/[" ]//g' | sort || true)
require_nonempty 'B7 registry domains (skills/_registry.yml)' "$reg_domains" || b7_warn=-1
require_nonempty 'B7 palette domains (viz/R/palettes.R)' "$palette_domains" || b7_warn=-1
b7_missing=$(comm -23 <(echo "$reg_domains") <(echo "$palette_domains") || true)
if [ "$b7_warn" -eq 0 ] && [ -n "$b7_missing" ]; then
  b7_count=$(echo "$b7_missing" | wc -l)
  echo "WARN: $b7_count domain(s) in registry without hand-tuned cyberpunk color (will use auto-fallback):"
  echo "$b7_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b7_count))
  b7_warn=$b7_count
fi
[ "$b7_warn" -eq 0 ] && echo "OK: All registry domains have hand-tuned cyberpunk colors"

# B8: Glyph mapping coverage (registry skill IDs vs SKILL_GLYPHS keys)
echo "--- B8: Glyph mapping coverage ---"
b8_warn=0
reg_skills=$(grep '^      - id: ' skills/_registry.yml | sed 's/.*- id: //' | tr -d '\r' | sort || true)
glyph_skills=$(grep -oP '^\s+"[a-z0-9-]+"' viz/R/glyphs.R | sed 's/[" ]//g' | sort || true)
require_nonempty 'B8 registry skill ids (skills/_registry.yml)' "$reg_skills" || b8_warn=-1
require_nonempty 'B8 glyph keys (viz/R/glyphs.R)' "$glyph_skills" || b8_warn=-1
b8_missing=$(comm -23 <(echo "$reg_skills") <(echo "$glyph_skills") || true)
if [ "$b8_warn" -eq 0 ] && [ -n "$b8_missing" ]; then
  b8_count=$(echo "$b8_missing" | wc -l)
  echo "WARN: $b8_count skill(s) in registry without glyph mapping (will render with fallback):"
  echo "$b8_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b8_count))
  b8_warn=$b8_count
fi
[ "$b8_warn" -eq 0 ] && echo "OK: All registry skills have glyph mappings"

# B9: Agent glyph coverage (registry agent IDs vs AGENT_GLYPHS keys)
echo "--- B9: Agent glyph coverage ---"
b9_warn=0
reg_agents=$(sed -n '/^agents:/,$ { /^  - id: /p }' agents/_registry.yml | sed 's/.*- id: //' | tr -d '\r' | sort || true)
glyph_agents=$(grep -oP '^\s+"[a-z0-9-]+"' viz/R/agent_glyphs.R | sed 's/[" ]//g' | sort || true)
require_nonempty 'B9 registry agent ids (agents/_registry.yml)' "$reg_agents" || b9_warn=-1
require_nonempty 'B9 agent glyph keys (viz/R/agent_glyphs.R)' "$glyph_agents" || b9_warn=-1
b9_missing=$(comm -23 <(echo "$reg_agents") <(echo "$glyph_agents") || true)
if [ "$b9_warn" -eq 0 ] && [ -n "$b9_missing" ]; then
  b9_count=$(echo "$b9_missing" | wc -l)
  echo "WARN: $b9_count agent(s) in registry without glyph mapping:"
  echo "$b9_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b9_count))
  b9_warn=$b9_count
fi
[ "$b9_warn" -eq 0 ] && echo "OK: All registry agents have glyph mappings"

# B10: DOMAIN_STYLES coverage (registry domains vs build-icon-manifest.js DOMAIN_STYLES)
echo "--- B10: DOMAIN_STYLES coverage ---"
b10_warn=0
if [ -f "viz/domain-styles.yml" ]; then
  style_domains=$(grep '^[a-z0-9-]\+:' viz/domain-styles.yml | sed 's/:.*//' | sort || true)
else
  # Fallback: parse JS if YAML not yet extracted
  style_domains=$(grep -oP "'[a-z0-9-]+'" viz/build-icon-manifest.js | head -60 | sed "s/'//g" | sort -u || true)
fi
# BOTH sides asserted, and `reg_domains` is not exempt for having been asserted in B7. That
# assertion sets `b7_warn`, which nothing here reads -- so B10 would compare an EMPTY left side,
# find nothing missing, and print its OK line six lines below B7's FAIL saying that every
# comparison against it would pass vacuously. That contradiction is new-in-#647 reachable: before
# the guard on `:1112`, an empty extraction aborted the script at B7 and B10 never ran at all.
# Making B7 survivable is what made this line reachable and wrong.
require_nonempty 'B10 registry domains (skills/_registry.yml)' "$reg_domains" || b10_warn=-1
require_nonempty 'B10 style domains (viz/domain-styles.yml)' "$style_domains" || b10_warn=-1
b10_missing=$(comm -23 <(echo "$reg_domains") <(echo "$style_domains") || true)
if [ "$b10_warn" -eq 0 ] && [ -n "$b10_missing" ]; then
  b10_count=$(echo "$b10_missing" | wc -l)
  echo "WARN: $b10_count domain(s) in registry without DOMAIN_STYLES entry (will use generic prompt):"
  echo "$b10_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b10_count))
  b10_warn=$b10_count
fi
[ "$b10_warn" -eq 0 ] && echo "OK: All registry domains have DOMAIN_STYLES entries"

# B11 (CLI audit) was removed: it could not fire on a real failure, never ran
# in CI (this job performs no `npm ci`, so the CLI died at module resolution),
# and would not have triggered anyway -- `cli/**` is absent from this
# workflow's paths. Audit coverage lives in ci-node-cli.yml, whose test:cli
# asserts the adapter results directly (#373, #438). Do not re-add a stdout
# grep here. See #443.

# B12: Global discovery-hub coverage (warn-only; #324/#325)
# Repo-internal skill symlinks are the hard gate (B1); the global hub
# ~/.claude/skills drifts silently when new skills land without a global link.
# The fix path is: bash scripts/sync-discovery-symlinks.sh --fix
echo "--- B12: Global discovery-hub coverage ---"
if [ -d "$HOME/.claude/skills" ]; then
  b12_reg=$(grep '^      - id: ' skills/_registry.yml | sed 's/.*- id: //' | tr -d '\r ' | grep -v '^_template$' | sort -u || true)
  b12_hub=$(find "$HOME/.claude/skills" -maxdepth 1 -mindepth 1 -printf '%f\n' 2>/dev/null | sort -u || true)
  # Only the registry side is asserted. An empty `b12_hub` is a legitimate state -- a machine
  # that has never run sync-discovery-symlinks.sh -- and the comparison is exactly what should
  # report it, so asserting it would fail an honest first run.
  b12_ok=0
  require_nonempty 'B12 registry skill ids (skills/_registry.yml)' "$b12_reg" || b12_ok=1
  b12_missing=$(comm -23 <(echo "$b12_reg") <(echo "$b12_hub") || true)
  if [ "$b12_ok" -ne 0 ]; then
    : # the extraction already reported FAIL; comparing against it would be meaningless
  elif [ -n "$b12_missing" ]; then
    b12_count=$(echo "$b12_missing" | wc -l)
    echo "WARN: $b12_count registered skill(s) missing from global ~/.claude/skills (run: bash scripts/sync-discovery-symlinks.sh --fix):"
    echo "$b12_missing" | sed 's/^/  - /'
    warn_count=$((warn_count + b12_count))
  else
    echo "OK: global discovery hub covers all registered skills"
  fi
else
  echo "SKIP: ~/.claude/skills not present (e.g. CI)"
fi

# B13: README / translation-status parity (#560)
# The README translations table and i18n/*/translation_status.yml are the two
# reader-facing statements of the same fact, and were independent derivations
# until #560: the table counted files, so every cell was `translated + stubs`
# (`de 383/500 (76.6%)` vs a measured `347/500 (69.4%)`). check-readmes could
# not see it -- it regenerates the table with the same generator and compares
# it against itself, so it agrees with any generator bug, and it runs only in
# release.yml anyway. This check parses both COMMITTED artifacts instead, and
# lives here because this workflow triggers on i18n/** and scripts/** for both
# pushes and PRs.
# Dependency-free by design (see A8): node only, no npm ci, no js-yaml.
echo "--- B13: README / translation-status parity ---"
if ! command -v node >/dev/null 2>&1; then
  # Fail, never skip: "no interpreter" is an unevaluated check, and an
  # unevaluated check reported as OK is the failure mode this whole issue is
  # about.
  echo "FAIL: node not available, so B13 could not be evaluated (this is not a pass)"
  failed=1
else
  # `|| b13_rc=$?` is load-bearing: this script runs under `set -e`, and a
  # bare `b13_out=$(...)` assignment aborts the whole script the moment the
  # checker exits non-zero. That still fails closed, but it prints nothing --
  # no discrepancy list, no summary -- so CI would go red with no diagnostic
  # and every line below here would be dead. Proving the checker can fail is
  # not the same as proving the check that runs it can report a failure; this
  # PR exists because of that exact distinction.
  b13_rc=0
  b13_out=$(node scripts/check-readme-translation-parity.js 2>&1) || b13_rc=$?
  echo "$b13_out"
  # 0 = agree, 1 = disagree, 2 = could not evaluate. Anything non-zero fails.
  if [ "$b13_rc" -ne 0 ]; then
    failed=1
  fi
fi

echo ""
echo "=== Summary ==="
if [ "$failed" -ne 0 ]; then
  echo "FAILED: One or more checks failed"
  exit 1
else
  echo "PASSED: All integrity checks passed"
  [ "$warn_count" -gt 0 ] && echo "WARNINGS: $warn_count warning(s) detected"
  exit 0
fi
