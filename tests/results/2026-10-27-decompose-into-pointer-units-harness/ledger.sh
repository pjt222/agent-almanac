#!/usr/bin/env bash
# ledger.sh: run the shell snippets of skills/decompose-into-pointer-units/SKILL.md, extracted
# byte for byte, on the test scenario's fixture, under the shell named in $2 (bash or zsh).
# Usage (from the repository root):
#   bash tests/results/2026-10-27-decompose-into-pointer-units-harness/ledger.sh <SKILL.md> <bash|zsh>
# Prints one line per check (PASS / FAIL) and exits 1 if any check fails.
set -u
skill=$1; shell=$2
work=$(mktemp -d) || exit 2
trap 'rm -rf "${work:?}"' EXIT

# Fences in document order: 1 Step 1 bash, 2 Step 2 js, 3 Step 2 bash, 8 Step 7 bash,
# 9 Step 8 bash, 11 Step 10 bash.
node -e '
  const t = require("fs").readFileSync(process.argv[1], "utf8");
  const fences = [...t.matchAll(/```([a-z]+)\n([\s\S]*?)```/g)];
  const want = { 1: "step1.sh", 2: "derive-specs.mjs", 3: "step2.sh", 8: "step7.sh", 9: "step8.sh", 11: "step10.sh" };
  const anchors = { 1: "mech_sums()", 2: "derive-specs.mjs", 3: "bullets=", 8: "PILOT=", 9: "STOP-%s", 11: "ledger/ids.txt" };
  for (const [n, name] of Object.entries(want)) {
    const body = fences[n - 1] ? fences[n - 1][2] : "";
    if (!body.includes(anchors[n])) { console.error("fence " + n + " (" + name + ") lacks its anchor " + anchors[n] + ": the fence order moved"); process.exit(2); }
    require("fs").writeFileSync(process.argv[2] + "/" + name, body);
  }
' "$skill" "$work" || exit 2

failures=0
check() { if [ "$2" = "$3" ]; then echo "PASS  $shell $1"; else echo "FAIL  $shell $1: got [$2] want [$3]"; failures=$((failures + 1)); fi; }

fresh() {   # a fresh run directory with the scenario fixture, specs derived by the Step 2 snippet at chunk 4
  RUN_DIR="$work/run"; rm -rf "${RUN_DIR:?}"; MECH="$RUN_DIR/mechanical"
  mkdir -p "$MECH" "$RUN_DIR/specs"
  printf '# Changelog\n\n## 1.5.0\n- a1\n- a2\n- a3\n- a4\n- a5\n- a6\n\n## 1.4.1\n- b1\n- b2\n- b3\n- b4\n- b5\n\n## 1.4.0\n- c1\n- c2\n- c3\n' > "$MECH/changelog.md"
  printf '12\n15\n' > "$MECH/issues.txt"
  cp "$work/derive-specs.mjs" "$RUN_DIR/derive-specs.mjs"
  # Step 1: the tool check and mech_sums, as written (the cp and gh lines need a real repository).
  rg '^(for t in|mech_sums\(\))' "$work/step1.sh" > "$work/step1-local.sh"   # not the line that writes the sums
  export RUN_DIR MECH
  (cd "$RUN_DIR" && sed 's/changelog.md" 6 >/changelog.md" 4 >/' "$work/step2.sh" > "$work/step2-chunk4.sh" && $shell -c '. "$0"; . "$1"; mech_sums > "$RUN_DIR/MECH-SHA256SUMS"' "$work/step2-chunk4.sh" "$work/step1-local.sh") > "$work/step2.out" 2>&1
  for id in $(jq -r '.[].id' "$RUN_DIR"/specs/cl.json "$RUN_DIR"/specs/issues.json); do printf 'VERDICT: ok\nEVIDENCE: e\nOPEN: none\n' > "$RUN_DIR/$id.txt"; done
}
ledger() { $shell -c '. "$0"; . "$1"' "$work/step1-local.sh" "$work/step10.sh" 2>&1 | tail -1; }

# Baseline: the scenario trigger. CL1.5.0-02 stopped while writing; its partial report exists.
fresh
check 'step 2 coverage' "$(sed -n 1p "$work/step2.out")" 'bullets=14 covered=14 unique=14'
check 'step 2 issues' "$(sed -n 2p "$work/step2.out")" 'issues=2 issue_specs=2'
check 'step 2 id checks' "$(sed -n '3,4p' "$work/step2.out" | tr '\n' ' ')" 'true true '
printf 'VERDICT: partial\n' > "$RUN_DIR/CL1.5.0-02.txt"
(cd "$RUN_DIR" && $shell "$work/step8.sh")
check 'baseline ledger' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'
pilot=$($shell -c '. "$0"; . "$1"' "$work/step1-local.sh" "$work/step7.sh" 2>&1)
check 'step 7 pilot glance' "$(printf '%s\n' "$pilot" | sed -n '1,4p' | tr '\n' '|')" 'CL1.5.0-01: VERDICT EVIDENCE OPEN|CL1.5.0-02: VERDICT|CL1.4.1-01: VERDICT EVIDENCE OPEN|pilot reports listed: 3 (read each one end to end before launching the rest)|'

# Variant B: after the baseline stop, a second unit with no result, logged as NORESULT and with no STOP line.
# It must stay unaccounted, not become a stop.
rm -f "$RUN_DIR/CL1.4.1-02.txt"
printf '2026-10-27 NORESULT unit=CL1.4.1-02 cause=undetermined\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'no-result stays unaccounted' "$(ledger)" 'specs=7 reported=6 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0'

# An empty placeholder file is not a report.
: > "$RUN_DIR/CL1.4.1-02.txt"
check 'empty file is not reported' "$(ledger)" 'specs=7 reported=6 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0'

# A rerouted run of stopped work under a new id shows up as extra.
printf 'VERDICT: ok\n' > "$RUN_DIR/CL1.4.1-02.txt"
printf 'VERDICT: rerouted\n' > "$RUN_DIR/CL1.5.0-02b.txt"
check 'reroute under a new id is extra' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=1 held_ran=0'
rm -f "$RUN_DIR/CL1.5.0-02b.txt"

# Verifier, critic and owner files are not extra.
printf 'x\n' > "$RUN_DIR/V-CL1.5.0-01-1.txt"; printf 'x\n' > "$RUN_DIR/X-accuracy-R1-1.txt"; printf 'G1\n' > "$RUN_DIR/approved-gaps.txt"
check 'verifier and critic files are not extra' "$(ledger)" 'specs=7 reported=7 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'

# An owner-approved gap spec (written by the gap deriver into specs/) is counted.
printf '[{"kind":"gap","id":"G1","g":"G1","from":"X-completeness-R0.txt"}]\n' > "$RUN_DIR/specs/gaps.json"
check 'approved gap spec without a report is unaccounted' "$(ledger)" 'specs=8 reported=7 stopped=1 held=0 unaccounted=1 extra=0 held_ran=0'
printf 'VERDICT: ok\n' > "$RUN_DIR/G1.txt"
check 'approved gap spec with a report is reported' "$(ledger)" 'specs=8 reported=8 stopped=1 held=0 unaccounted=0 extra=0 held_ran=0'

# A held spec is counted as held, not unaccounted; one that has a report ran while held.
rm -f "$RUN_DIR/G1.txt"
printf '2026-10-27 HELD unit=G1 reason=overlaps-STOP-1\n' >> "$RUN_DIR/UNIT-LOG.txt"
check 'held spec is held, not unaccounted' "$(ledger)" 'specs=8 reported=7 stopped=1 held=1 unaccounted=0 extra=0 held_ran=0'
printf 'VERDICT: ok\n' > "$RUN_DIR/G1.txt"
check 'held spec with a report is held_ran' "$(ledger)" 'specs=8 reported=8 stopped=1 held=1 unaccounted=0 extra=0 held_ran=1'

# A mechanical input changed after the freeze is refused.
printf -- '- a7\n' >> "$RUN_DIR/mechanical/changelog.md"
check 'changed input refused' "$(ledger)" 'mechanical/ changed during the run'

echo
[ "$failures" -eq 0 ] && echo "ALL PASS ($shell)" || echo "$failures FAIL ($shell)"
[ "$failures" -eq 0 ]
