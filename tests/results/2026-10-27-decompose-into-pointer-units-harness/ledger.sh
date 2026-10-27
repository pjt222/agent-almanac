#!/usr/bin/env bash
# ledger.sh: run the shell snippets of skills/decompose-into-pointer-units/SKILL.md, extracted
# byte for byte, on the test scenario's fixture, under the shell named in $2 (bash or zsh).
# Usage (from the repository root):
#   bash tests/results/2026-10-27-decompose-into-pointer-units-harness/ledger.sh <SKILL.md> <bash|zsh>
# Prints one line per check (PASS / FAIL) and exits 1 if any check fails, 2 if a snippet cannot be found.
# Two departures from byte for byte, both in fresh(): the Step 2 snippet runs at the scenario's chunk 4 (one
# sed on its argument), and of Step 1 only the tool check, mech_sums and the refusal of a second freeze run
# (the cp and gh lines need a real repository), with the mkdir, touch and the line that writes
# MECH-SHA256SUMS re-typed in fresh().
set -u
skill=$1; shell=$2
work=$(mktemp -d) || exit 2
trap 'rm -rf "${work:?}"' EXIT

# Each snippet is the one fence in SKILL.md that contains its anchor; an anchor in no fence or in two
# fences is refused, so a moved or duplicated fence cannot be run in the wrong place.
node -e '
  const t = require("fs").readFileSync(process.argv[1], "utf8");
  const fences = [...t.matchAll(/```([a-z]+)\n([\s\S]*?)```/g)].map((m) => m[2]);
  const want = [["step1.sh", "mech_sums()"], ["derive-specs.mjs", "readFileSync(file"], ["step2.sh", "bullets="],
    ["record.sh", "work_sums()"], ["step7.sh", "PILOT="], ["step8.sh", "routed=owner-batch"], ["noresult.sh", "NORESULT unit=%s"],
    ["release.sh", "RELEASED unit=%s"], ["step10.sh", "ledger/ids.txt"], ["writers.sh", "reason=owner"],
    ["prerun.sh", "it has a result"]];
  for (const [name, anchor] of want) {
    const hits = fences.filter((f) => f.includes(anchor));
    if (hits.length !== 1) { console.error(name + ": anchor " + anchor + " is in " + hits.length + " fences, want 1"); process.exit(2); }
    require("fs").writeFileSync(process.argv[2] + "/" + name, hits[0]);
  }
' "$skill" "$work" || exit 2
rg '^(for t in|mech_sums\(\))' "$work/step1.sh" > "$work/step1-local.sh"   # not the line that writes the sums
rg '^\[ ! -e "\$RUN_DIR/MECH-SHA256SUMS" \]' "$work/step1.sh" > "$work/step1-guard.sh"   # the refusal of a second freeze
rg '^work_sums\(\)' "$work/record.sh" > "$work/worksums-local.sh"
sed 's/changelog.md" 6 >/changelog.md" 4 >/' "$work/step2.sh" > "$work/step2-chunk4.sh"

failures=0
check() { if [ "$2" = "$3" ]; then echo "PASS  $shell $1"; else echo "FAIL  $shell $1: got [$2] want [$3]"; failures=$((failures + 1)); fi; }
# in_run <snippet>: run it from the run directory, with mech_sums and work_sums defined; prints its output on
# one line, then " rc=<exit code>"
in_run() { out=$(cd "$RUN_DIR" && $shell -c '. "$0"; . "$1"; . "$2"' "$work/step1-local.sh" "$work/worksums-local.sh" "$1" 2>&1); rc=$?; printf '%s rc=%s' "$(printf '%s' "$out" | tr '\n' ' ')" "$rc"; }
ledger() { (cd "$RUN_DIR" && $shell -c '. "$0"; . "$1"; . "$2"' "$work/step1-local.sh" "$work/worksums-local.sh" "$work/step10.sh" 2>&1) | tail -1; }
as_id() { sed "s/^ID=CL1.4.1-02/ID=$2/" "$work/$1" > "$work/$1.$2"; printf '%s' "$work/$1.$2"; }   # the same snippet for another id

fresh() {   # a fresh run directory with the scenario fixture: specs derived at chunk 4, the work list recorded, every unit reported
  RUN_DIR="$work/run"; rm -rf "${RUN_DIR:?}"; MECH="$RUN_DIR/mechanical"
  mkdir -p "$MECH" "$RUN_DIR/specs" "$RUN_DIR/gaps" "$RUN_DIR/owner"
  touch "$RUN_DIR/UNIT-LOG.txt"
  printf 'FRAME. ...\n' > "$RUN_DIR/BRIEF.md"
  printf '# Changelog\n\n## 1.5.0\n- a1\n- a2\n- a3\n- a4\n- a5\n- a6\n\n## 1.4.1\n- b1\n- b2\n- b3\n- b4\n- b5\n\n## 1.4.0\n- c1\n- c2\n- c3\n' > "$MECH/changelog.md"
  printf '12\n15\n' > "$MECH/issues.txt"
  cp "$work/derive-specs.mjs" "$RUN_DIR/derive-specs.mjs"
  export RUN_DIR MECH
  (cd "$RUN_DIR" && $shell -c '. "$0"; . "$1"; mech_sums > "$RUN_DIR/MECH-SHA256SUMS"; . "$2"' "$work/step2-chunk4.sh" "$work/step1-local.sh" "$work/record.sh") > "$work/step2.out" 2>&1
  for id in $(jq -r '.[].id' "$RUN_DIR"/specs/cl.json "$RUN_DIR"/specs/issues.json); do printf 'VERDICT: ok\nEVIDENCE: e\nOPEN: none\n' > "$RUN_DIR/$id.txt"; done
}

# Baseline: the scenario trigger. CL1.5.0-02 stopped while writing; its partial report exists.
fresh
check 'step 2 coverage' "$(sed -n 1p "$work/step2.out")" 'bullets=14 covered=14 unique=14'
check 'step 2 issues' "$(sed -n 2p "$work/step2.out")" 'issues=2 issue_specs=2'
check 'step 2 id checks' "$(sed -n '3,4p' "$work/step2.out" | tr '\n' ' ')" 'true true '
check 'step 2 records the work list once, and lists every spec file' "$(sed -n '5,$p' "$work/step2.out")|$(awk '{print $2}' "$RUN_DIR/WORK-SHA256SUMS" | tr '\n' ' ')" '|specs/cl.json specs/issues.json '
check 'a second work list is refused' "$(in_run "$work/record.sh")" 'REFUSED: the work list is already recorded; a new one is a re-run (Step 8 item 2) rc=2'
printf 'VERDICT: partial\n' > "$RUN_DIR/CL1.5.0-02.txt"
(cd "$RUN_DIR" && $shell "$work/step8.sh")
check 'baseline ledger' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'
pilot=$(cd "$RUN_DIR" && $shell -c '. "$0"; . "$1"' "$work/step1-local.sh" "$work/step7.sh" 2>&1)
check 'step 7 pilot glance' "$(printf '%s\n' "$pilot" | sed -n '1,4p' | tr '\n' '|')" 'CL1.5.0-01: VERDICT EVIDENCE OPEN|CL1.5.0-02: VERDICT|CL1.4.1-01: VERDICT EVIDENCE OPEN|pilot reports listed: 3 (read each one end to end before launching the rest)|'

# Step 1 freezes a run directory once: the whole job lives in it, and a second freeze would move the record
# Steps 7 and 10 compare against. A directory not yet frozen (a gh failure before the sums) passes.
check 'step 1: a frozen run directory is not frozen again' "$(out=$($shell "$work/step1-guard.sh" 2>&1); printf '%s rc=%s' "$out" "$?")" 'REFUSED: this run directory is already frozen rc=1'
check 'step 1: a run directory not yet frozen passes' "$(mkdir -p "$work/unfrozen"; out=$(RUN_DIR="$work/unfrozen" $shell "$work/step1-guard.sh" 2>&1); printf '%s rc=%s' "$out" "$?")" ' rc=0'

# Variant B: a second unit with no result, which wrote a partial before dying. Logged as NORESULT by the
# Step 8 snippet, its partial moves to partials/, and it stays unaccounted rather than becoming a stop.
# Where mv has no --backup (BSD, busybox), the snippet refuses and logs nothing, rather than leaving the partial
# to count as a report.
printf 'VERDICT: partial\n' > "$RUN_DIR/CL1.4.1-02.txt"
mkdir -p "$work/shim"; printf '#!/bin/sh\nexit 1\n' > "$work/shim/mv"; chmod +x "$work/shim/mv"
before=$(wc -l < "$RUN_DIR/UNIT-LOG.txt")
check 'no-result: a partial that cannot be moved is refused, and nothing is logged' "$(PATH="$work/shim:$PATH"; export PATH; in_run "$work/noresult.sh") lines=$(( $(wc -l < "$RUN_DIR/UNIT-LOG.txt") - before ))" 'REFUSED: CL1.4.1-02.txt was not moved to partials/ (mv --backup needs GNU coreutils) rc=1 lines=0'
in_run "$work/noresult.sh" > /dev/null
check 'no-result: its partial moves to partials/ and it stays unaccounted' "$(ledger) $(cat "$RUN_DIR/partials/CL1.4.1-02.txt")" 'specs=7 reported=6 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0 VERDICT: partial'

# An empty placeholder file is not a report.
: > "$RUN_DIR/CL1.4.1-02.txt"
check 'empty file is not reported' "$(ledger)" 'specs=7 reported=6 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0'
rm -f "$RUN_DIR/CL1.4.1-02.txt"

# The owner releases the no-result, and it is re-run.
cat > "$RUN_DIR/OWNER-QUESTIONS.md" <<'EOF'
# run-001 owner batch (2026-10-27)

## Answered

- STOP-1, unit CL1.5.0-02: "hold" (owner message, 2026-10-27)

## Open

- NORESULT, unit CL1.4.1-02: "re-run it once, unchanged" (a lead note in the Answered form, 2026-10-27)
EOF
check 'release by owner with no Answered line is refused' "$(in_run "$work/release.sh")" 'REFUSED: no unused Answered line releases CL1.4.1-02 rc=1'
mv "$RUN_DIR/CL1.5.0-02.txt" "$work/stopped-partial.txt"   # a stop with nothing on disk, so the report check cannot answer first
check 'release of a stopped id is refused' "$(in_run "$(as_id release.sh CL1.5.0-02)")" 'REFUSED: CL1.5.0-02 is stopped; only an owner spec re-scopes it rc=1'
mv "$work/stopped-partial.txt" "$RUN_DIR/CL1.5.0-02.txt"
sed -i 's/^- STOP-1, unit CL1.5.0-02: "hold".*$/&\n- NORESULT, unit CL1.4.1-02: "re-run it once, unchanged" (owner message, 2026-10-27)/' "$RUN_DIR/OWNER-QUESTIONS.md"
check 'release by owner from an Answered line is logged' "$(in_run "$work/release.sh") $(rg -c 'RELEASED unit=CL1.4.1-02 by=owner' "$RUN_DIR/UNIT-LOG.txt")" ' rc=0 1'
check 'released and not yet re-run is unaccounted' "$(ledger)" 'specs=7 reported=6 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0'
printf 'VERDICT: ok\n' > "$RUN_DIR/CL1.4.1-02.txt"
check 'released, then re-run: reported, not held_ran' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'
check 'release after a report is refused' "$(in_run "$work/release.sh")" 'REFUSED: CL1.4.1-02.txt exists; a release comes before the run rc=1'

# A transient no-result is released once, by the lead, from its transcript; a verifier or critic the same way.
mkdir -p "$work/t"; : > "$work/t/IS12.jsonl"; : > "$work/t/V.jsonl"
transient() { sed "s|BY=owner |BY=transient:$2 |" "$(as_id release.sh "$1")"; }   # the release snippet for id $1, transcript $2
in_run "$(as_id noresult.sh IS12)" > /dev/null
transient IS12 "$work/t/IS12.jsonl" > "$work/release-transient.sh"
check 'a transient release is logged once' "$(in_run "$work/release-transient.sh")|$(in_run "$work/release-transient.sh")" ' rc=0|REFUSED: a transient release is for the first no-result of IS12, with no release or hold since rc=1'
printf 'VERDICT: ok\n' > "$RUN_DIR/IS12.txt"
printf 'partial\n' > "$RUN_DIR/V-CL1.4.0-01-1.txt"
in_run "$(as_id noresult.sh V-CL1.4.0-01-1)" > /dev/null
transient V-CL1.4.0-01-1 "$work/t/V.jsonl" > "$work/release-v.sh"
check 'a verifier with no result: its partial moves, and a transient release is logged' "$(in_run "$work/release-v.sh") $(cat "$RUN_DIR/partials/V-CL1.4.0-01-1.txt") $(rg -c 'RELEASED unit=V-CL1.4.0-01-1 by=transient:' "$RUN_DIR/UNIT-LOG.txt")" ' rc=0 partial 1'

# Before a verifier or critic re-runs through args.rerun, the pre-rerun check reads the log: only a released
# no-result with no file and no stop passes (AD5-4). V-CL1.4.0-01-1 was released for a transient cause above.
prerun() { sed "s/^ID=V-CL1.4.1-02-1 /ID=$1 /" "$work/prerun.sh" > "$work/prerun-$1.sh"; printf '%s' "$work/prerun-$1.sh"; }
check 'pre-rerun: a released no-result passes' "$(in_run "$(prerun V-CL1.4.0-01-1)")" 'rerun V-CL1.4.0-01-1: released, not stopped, no result yet rc=0'
printf '2026-10-27 NORESULT unit=X-accuracy-R1-1 cause=undetermined\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'pre-rerun: a no-result not released is refused' "$(in_run "$(prerun X-accuracy-R1-1)")" 'REFUSED: X-accuracy-R1-1 is stopped, or has no release since its last no-result rc=1'
printf '2026-10-27 RELEASED unit=X-accuracy-R1-1 by=transient:/t/x\n2026-10-27 NORESULT unit=X-accuracy-R1-1 cause=undetermined\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'pre-rerun: a re-run that returned nothing again is refused' "$(in_run "$(prerun X-accuracy-R1-1)")" 'REFUSED: X-accuracy-R1-1 is stopped, or has no release since its last no-result rc=1'
printf '2026-10-27 NORESULT unit=V-CL1.4.0-02-1 cause=undetermined\n2026-10-27 RELEASED unit=V-CL1.4.0-02-1 by=transient:/t/x\n2026-10-27 STOP-3 unit=V-CL1.4.0-02-1 stage=verify written=nothing routed=owner-batch\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'pre-rerun: a checker stopped since its release is refused' "$(in_run "$(prerun V-CL1.4.0-02-1)")" 'REFUSED: V-CL1.4.0-02-1 is stopped, or has no release since its last no-result rc=1'
check 'pre-rerun: a checker with nothing logged is refused' "$(in_run "$(prerun V-CL1.4.0-03-1)")" 'REFUSED: V-CL1.4.0-03-1 is stopped, or has no release since its last no-result rc=1'
printf 'CONFIRMED\n' > "$RUN_DIR/V-CL1.4.0-01-1.txt"
check 'pre-rerun: a checker whose file exists is refused' "$(in_run "$(prerun V-CL1.4.0-01-1)")" 'REFUSED: V-CL1.4.0-01-1.txt exists; it has a result rc=1'
rm "$RUN_DIR/V-CL1.4.0-01-1.txt"

# The rest of the release arms run on a copy of the run directory, so the ledger rows below keep their state.
side="$work/side"
in_side() { rm -rf "${side:?}"; cp -r "$RUN_DIR" "$side"; eval "$1"; (RUN_DIR="$side"; export RUN_DIR; in_run "$2"); }
# No report, so that without the log check the owner arm would answer and write a release into a new log.
check 'release: no unit log is refused, and none is started' "$(in_side 'rm "$side/UNIT-LOG.txt" "$side/CL1.4.1-02.txt"' "$work/release.sh") $([ -e "$side/UNIT-LOG.txt" ] && echo started)" 'REFUSED: no UNIT-LOG.txt rc=2 '
transient IS15 "$work/t/IS12.jsonl" > "$work/release-is15.sh"
check 'a transient release of a held id with no no-result is refused' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 HELD unit=IS15 reason=overlaps-STOP-1\n" >> "$side/UNIT-LOG.txt"' "$work/release-is15.sh")" 'REFUSED: a transient release is for the first no-result of IS15, with no release or hold since rc=1'
check 'a transient release of a no-result held over a stop since is refused' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 NORESULT unit=IS15 cause=undetermined\n2026-10-27 HELD unit=IS15 reason=overlaps-STOP-2\n" >> "$side/UNIT-LOG.txt"' "$work/release-is15.sh")" 'REFUSED: a transient release is for the first no-result of IS15, with no release or hold since rc=1'
transient IS15 /nonexistent/IS15.jsonl > "$work/release-notranscript.sh"
check 'a transient release naming no transcript file is refused' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 NORESULT unit=IS15 cause=undetermined\n" >> "$side/UNIT-LOG.txt"' "$work/release-notranscript.sh")" 'REFUSED: no transcript at /nonexistent/IS15.jsonl rc=1'
transient CL1.4.1-02 "$work/t/IS12.jsonl" > "$work/release-again.sh"
check 'a transient release after an owner release and a second no-result is refused' "$(in_side 'rm "$side/CL1.4.1-02.txt"; printf "2026-10-27 NORESULT unit=CL1.4.1-02 cause=undetermined\n" >> "$side/UNIT-LOG.txt"' "$work/release-again.sh")" 'REFUSED: a transient release is for the first no-result of CL1.4.1-02, with no release or hold since rc=1'
check 'a second owner release from the same Answered line is refused' "$(in_side 'rm "$side/CL1.4.1-02.txt"; printf "2026-10-27 NORESULT unit=CL1.4.1-02 cause=undetermined\n" >> "$side/UNIT-LOG.txt"' "$work/release.sh")" 'REFUSED: no unused Answered line releases CL1.4.1-02 rc=1'
# The owner arm is bound to what it releases: each hold since the last release by its reason, a no-result by
# a NORESULT Answered line not yet used (AD5-2). IS15 has no report in each of these copies.
owner_is15() { sed "s|^- STOP-1, unit CL1.5.0-02: \"hold\".*$|&\\n$1|" "$side/OWNER-QUESTIONS.md" > "$side/oq" && mv "$side/oq" "$side/OWNER-QUESTIONS.md"; }
as_id release.sh IS15 > /dev/null
check 'an answer given before a later hold does not lift that hold' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 HELD unit=IS15 reason=overlaps-STOP-1\n2026-10-27 HELD unit=IS15 reason=overlaps-STOP-2\n" >> "$side/UNIT-LOG.txt"; owner_is15 "- HELD, unit IS15, overlaps-STOP-1: \"ruled out\" (owner message, 2026-10-27)"' "$work/release.sh.IS15")" 'REFUSED: no Answered line releases IS15 from: HELD overlaps-STOP-2 rc=1'
check 'a no-result answer does not lift a hold logged after it' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 NORESULT unit=IS15 cause=undetermined\n2026-10-27 HELD unit=IS15 reason=overlaps-STOP-2\n" >> "$side/UNIT-LOG.txt"; owner_is15 "- NORESULT, unit IS15: \"re-run it once\" (owner message, 2026-10-27)"' "$work/release.sh.IS15")" 'REFUSED: no Answered line releases IS15 from: HELD overlaps-STOP-2 rc=1'
check 'a hold answered under another reason is refused' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 HELD unit=IS15 reason=overlaps-STOP-1\n" >> "$side/UNIT-LOG.txt"; owner_is15 "- HELD, unit IS15, owner: \"run it\" (owner message, 2026-10-27)"' "$work/release.sh.IS15")" 'REFUSED: no Answered line releases IS15 from: HELD overlaps-STOP-1 rc=1'
check 'a pre-run owner hold is released by its own Answered line' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 HELD unit=IS15 reason=owner\n" >> "$side/UNIT-LOG.txt"; owner_is15 "- HELD, unit IS15, owner: \"run it\" (owner message, 2026-10-27)"' "$work/release.sh.IS15") $(rg -c 'RELEASED unit=IS15 by=owner' "$side/UNIT-LOG.txt")" ' rc=0 1'
check 'after a transient release and a second no-result, one owner answer releases' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 NORESULT unit=IS15 cause=undetermined\n2026-10-27 RELEASED unit=IS15 by=transient:/t/x\n2026-10-27 NORESULT unit=IS15 cause=undetermined\n" >> "$side/UNIT-LOG.txt"; owner_is15 "- NORESULT, unit IS15: \"once more\" (owner message, 2026-10-27)"' "$work/release.sh.IS15")" ' rc=0'
sed 's/^ID=CL1.4.1-02; BY=owner /ID=IS15; BY=foo /' "$work/release.sh" > "$work/release-by.sh"
check 'a release with an unknown BY is refused, nothing written' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 NORESULT unit=IS15 cause=undetermined\n" >> "$side/UNIT-LOG.txt"' "$work/release-by.sh") $(rg -c 'RELEASED unit=IS15' "$side/UNIT-LOG.txt" || echo 0)" 'REFUSED: BY is owner or transient:<transcript path> rc=1 0'
check 'an owner release with no owner batch is refused' "$(in_side 'rm "$side/IS15.txt" "$side/OWNER-QUESTIONS.md"; printf "2026-10-27 NORESULT unit=IS15 cause=undetermined\n" >> "$side/UNIT-LOG.txt"' "$work/release.sh.IS15")" 'REFUSED: no OWNER-QUESTIONS.md rc=2'
# A line without its date is invisible to every reader, so each reader refuses the log (R5-1).
check 'release: a unit-log line without its date is refused' "$(in_side 'rm "$side/IS15.txt"; printf "2026-10-27 NORESULT unit=IS15 cause=undetermined\nHELD unit=IS15 reason=overlaps-STOP-1\n" >> "$side/UNIT-LOG.txt"' "$(transient IS15 "$work/t/IS12.jsonl" > "$work/release-dl.sh"; printf '%s' "$work/release-dl.sh")")" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date rc=2'
check 'ledger: a unit-log line without its date is refused' "$(in_side 'printf "HELD unit=IS15 reason=overlaps-STOP-1\n" >> "$side/UNIT-LOG.txt"' /dev/null >/dev/null; (RUN_DIR="$side"; ledger))" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date'
# An unreadable log is refused too (not as root, which reads any file: there this row fails loudly).
check 'release: an unreadable unit log is refused' "$(in_side 'rm "$side/CL1.4.1-02.txt"; chmod 000 "$side/UNIT-LOG.txt"' "$work/release.sh" | sed 's/.*REFUSED/REFUSED/'; chmod 600 "$side/UNIT-LOG.txt")" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date rc=2'
check 'ledger: an unreadable unit log is refused' "$(in_side 'chmod 000 "$side/UNIT-LOG.txt"' /dev/null >/dev/null; (RUN_DIR="$side"; ledger); chmod 600 "$side/UNIT-LOG.txt")" 'REFUSED: UNIT-LOG.txt is unreadable, or a line does not start with its date'
check 'the documented writers write lines every reader reads' "$(in_side 'rm "$side/IS15.txt"' "$work/writers.sh" >/dev/null; (RUN_DIR="$side"; ledger))" 'specs=7 reported=6 stopped=1 held=2 unaccounted=0 extra=0 held_ran=1'
check 'ledger: no unit log is refused' "$(in_side 'rm "$side/UNIT-LOG.txt"' /dev/null >/dev/null; (RUN_DIR="$side"; ledger))" 'REFUSED: no UNIT-LOG.txt'
rm -rf "${side:?}"

# A RELEASED line written by hand does not lift a stop.
printf '2026-10-27 RELEASED unit=CL1.5.0-02 by=owner\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'a hand-written release does not lift a stop' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'

# A rerouted run of stopped work under a new id shows up as extra.
printf 'VERDICT: rerouted\n' > "$RUN_DIR/CL1.5.0-02b.txt"
check 'reroute under a new id is extra' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=1 held_ran=0'
rm -f "$RUN_DIR/CL1.5.0-02b.txt"

# Verifier, critic, brief, owner, repository and partial files are not extra.
mkdir -p "$RUN_DIR/repo"
printf 'x\n' > "$RUN_DIR/V-CL1.5.0-01-1.txt"; printf 'x\n' > "$RUN_DIR/X-accuracy-R1-1.txt"; printf 'x\n' > "$RUN_DIR/X-completeness-R1.txt"
printf 'G-R1-1\n' > "$RUN_DIR/owner/R1-approved-gaps.txt"; printf 'abc\n' > "$RUN_DIR/repo/head.txt"
check 'verifier, critic and lead files are not extra' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'

# A recorded gap spec (the shape the gap deriver writes; the deriver itself runs in derivers.sh) is counted.
printf '[{"kind":"gap","id":"G-R1-1","g":"G-R1-1","from":"gaps/R1.json"}]\n' > "$RUN_DIR/specs/gaps-R1.json"
(cd "$RUN_DIR" && sha256sum specs/gaps-R1.json >> WORK-SHA256SUMS)
check 'a recorded gap spec without a report is unaccounted' "$(ledger)" 'specs=8 reported=7 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0'
printf 'VERDICT: ok\n' > "$RUN_DIR/G-R1-1.txt"
check 'a recorded gap spec with a report is reported' "$(ledger)" 'specs=8 reported=8 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'

# A held spec is counted as held, not unaccounted; one that has a report ran while held.
rm -f "$RUN_DIR/G-R1-1.txt"
printf '2026-10-27 HELD unit=G-R1-1 reason=overlaps-STOP-1\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'held spec is held, not unaccounted' "$(ledger)" 'specs=8 reported=7 stopped=1 held=1 unaccounted=0 extra=0 held_ran=0'
printf 'VERDICT: ok\n' > "$RUN_DIR/G-R1-1.txt"
check 'held spec with a report is held_ran' "$(ledger)" 'specs=8 reported=8 stopped=1 held=1 unaccounted=0 extra=0 held_ran=1'
sed 's/^ID=CL1.4.1-02/ID=G-R1-1/' "$work/release.sh" > "$work/release-g.sh"
sed -i 's/^- STOP-1, unit CL1.5.0-02: "hold".*$/&\n- HELD, unit G-R1-1, overlaps-STOP-1: "the overlap is ruled out; run it" (owner message, 2026-10-27)/' "$RUN_DIR/OWNER-QUESTIONS.md"
check 'a release after a held run is refused, and held_ran stays visible' "$(in_run "$work/release-g.sh") $(ledger)" 'REFUSED: G-R1-1.txt exists; a release comes before the run rc=1 specs=8 reported=8 stopped=1 held=1 unaccounted=0 extra=0 held_ran=1'

# A release is an event: it lifts the hold before it, and a hold logged after it holds the id again.
rm -f "$RUN_DIR/G-R1-1.txt"
check 'a hold released from an unused Answered line is unaccounted until it runs' "$(in_run "$work/release-g.sh") $(ledger)" ' rc=0 specs=8 reported=7 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0'
check 'an Answered line releases once' "$(in_run "$work/release-g.sh")" 'REFUSED: G-R1-1 has no no-result or hold to release rc=1'
printf '2026-10-27 HELD unit=G-R1-1 reason=overlaps-STOP-2\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'a hold logged after a release holds the id again' "$(ledger)" 'specs=8 reported=7 stopped=1 held=1 unaccounted=0 extra=0 held_ran=0'
printf 'VERDICT: ok\n' > "$RUN_DIR/G-R1-1.txt"
check 'a run under a hold logged after a release is held_ran' "$(ledger)" 'specs=8 reported=8 stopped=1 held=1 unaccounted=0 extra=0 held_ran=1'

# A re-derivation at chunk 5 written to a new file and appended to the record, so that both checksums
# hold: the id it shares with the first derivation is refused (AD4-2).
printf '[{"kind":"cl","id":"CL1.5.0-01","release":"1.5.0","lines":[4,5,6,7,8]}]\n' > "$RUN_DIR/specs/cl2.json"
(cd "$RUN_DIR" && sha256sum specs/cl2.json >> WORK-SHA256SUMS)
check 'an id in two spec entries is refused, though both files are recorded' "$(ledger)" 'an id is in two spec entries: CL1.5.0-01'
rm "$RUN_DIR/specs/cl2.json"; (cd "$RUN_DIR" && sed -i '/ specs\/cl2.json$/d' WORK-SHA256SUMS)

# The work list: a spec file added without being recorded, or a re-derivation after launch, is refused.
printf '[{"kind":"cl","id":"CL-X","release":"1.5.0","lines":[8]}]\n' > "$RUN_DIR/specs/added.json"
check 'a spec file added without being recorded is refused' "$(ledger)" 'the work list changed after it was recorded'
rm -f "$RUN_DIR/specs/added.json"
cp "$RUN_DIR/specs/cl.json" "$work/cl-chunk4.json"
(cd "$RUN_DIR" && node derive-specs.mjs "$MECH/changelog.md" 5 > specs/cl.json)
check 're-derivation at chunk 5 after launch is refused' "$(jq -c '[.[] | select(.release == "1.5.0") | .lines]' "$RUN_DIR/specs/cl.json") $(ledger)" '[[4,5,6,7,8],[9]] the work list changed after it was recorded'
cp "$work/cl-chunk4.json" "$RUN_DIR/specs/cl.json"
check 'restored work list matches again' "$(ledger)" 'specs=8 reported=8 stopped=1 held=1 unaccounted=0 extra=0 held_ran=1'

# A mechanical input changed after the freeze is refused.
printf -- '- a7\n' >> "$RUN_DIR/mechanical/changelog.md"
check 'changed input refused' "$(ledger)" 'mechanical/ changed during the run'

echo
[ "$failures" -eq 0 ] && echo "ALL PASS ($shell)" || echo "$failures FAIL ($shell)"
[ "$failures" -eq 0 ]
