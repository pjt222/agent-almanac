#!/usr/bin/env python3
"""mutants.py: break one guard at a time in the skill's Workflow skeleton, its EXAMPLES.md snippets or its
SKILL.md snippets, and show that harness.mjs, derivers.sh or ledger.sh goes red on the row written for that
guard. derivers.sh and ledger.sh are scored under zsh only; run them under bash separately.

Usage (from the repository root):
    python3 tests/results/2026-10-27-decompose-into-pointer-units-harness/mutants.py

First the unmutated EXAMPLES.md and SKILL.md must pass all three checks (harness.mjs and derivers.sh on
EXAMPLES.md, ledger.sh on SKILL.md); otherwise nothing is scored and
the exit is 2 (REFUSED: baseline not green). Each mutant replaces one literal that must occur
exactly once; a needle that does not is refused (exit 2). Mutated copies are written to a temporary
directory, never over the skill. A mutant is KILLED only when its run exits 1 AND a failing row
contains the row name written for that guard; a kill on some other row, or any other non-zero exit,
is INCONCLUSIVE. Exit 0 when every mutant is killed, 1 otherwise.
"""
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = 'skills/decompose-into-pointer-units/SKILL.md'
EXAMPLES = 'skills/decompose-into-pointer-units/references/EXAMPLES.md'

# (name, file, old, new, the failing row that must name it[, check]); check defaults to harness for
# EXAMPLES.md and ledger for SKILL.md
MUTANTS = [
    ('M1 stop check narrowed to one source', EXAMPLES,
     "const isStop = (x) => x.stop !== 'none'", "const isStop = (x) => x.stop === 'safety-classifier'",
     'stop reviewer: recorded as stopped'),
    ('M2 verifier stop not checked', EXAMPLES,
     'else if (isStop(v)) verifierStopped.push(id)', 'else if (false) verifierStopped.push(id)',
     'S11 verifier stop: recorded in verifier_stopped'),
    ('M3 spec-kind guard removed', EXAMPLES,
     'if (unknown.length) throw', 'if (false) throw',
     'S8 raw input spec: refused before any agent'),
    ('M4 held filter removed', EXAMPLES,
     'const SPECS = INPUT.filter(s => !HELD.has(s.id))', 'const SPECS = INPUT',
     'S9 held id: never launched'),
    ('M5 verifier no-result not recorded', EXAMPLES,
     'if (!v) { verifierNoResult.push(id);', 'if (!v) {',
     'S10 verifier no result: recorded in verifier_no_result'),
    ('M6 owner-spec guard removed', EXAMPLES,
     "if (INPUT.some(s => s.kind === 'owner' && !(s.unit && s.scope && /^STOP-\\d+$/.test(s.answer || ''))))\n  throw",
     'if (false)\n  throw',
     'an owner spec without its unit is refused'),
    ('M7 a stopped critic\'s gaps used', EXAMPLES,
     'const critics = critRaw.filter(c => c && !isStop(c))', 'const critics = critRaw.filter(c => c)',
     'S14 critic stop: its gaps are not used'),
    ('M8 a gap unit run in the same run', EXAMPLES,
     "if (gaps.length) log(`${gaps.length} gap(s) for the owner batch, by topic: ${Object.entries(byTopic).map(([k, n]) => `${k} ${n}`).join(', ')}; none runs in this run`)",
     "if (gaps.length) await pipeline(gaps.slice(0, 1).map((g, i) => ({ kind: 'gap', id: `G-${TAG}-${i + 1}`, g: 'G1', from: 'x' })), s => runUnit(s, 'Review'))",
     'no gap unit runs'),
    ('M9 a stopped unit also listed as a no-result', EXAMPLES,
     '!round1[i] && !stopped.includes(s.id)', '!round1[i]',
     'the stopped unit is not listed under no_result'),
    ('M10 no-result ids left off the HELD line', EXAMPLES,
     '[...stopped, ...noResult, ...held]', '[...stopped, ...held]',
     'S7 no result: the completeness critic is told the no-result id is held'),
    ('M11 held guard removed', EXAMPLES,
     'if (A.held !== undefined && !Array.isArray(A.held)) throw', 'if (false) throw',
     'S15 held not an array: a string is refused before any agent'),
    ('M12 owner answer not bound to a STOP-<n>', EXAMPLES,
     "/^STOP-\\d+$/.test(s.answer || '')", 's.answer',
     'an owner spec whose answer is not a STOP-<n> is refused'),
    ('M13 a no-result unit retried in code', EXAMPLES,
     "s => runUnit(s, 'Review'), (r, s) => verifyAll", "s => runUnit(s, 'Review').then(r => r ?? runUnit(s, 'Review')), (r, s) => verifyAll",
     'S7 no result: the unit ran once'),
    ('M14 a no-result verifier retried in code', EXAMPLES,
     '() => verify(r, item, i + 1, ph)))', '() => verify(r, item, i + 1, ph).then(v => v ?? verify(r, item, i + 1, ph))))',
     "S10 verifier no result: 'verify CL-B#1' ran once"),
    ('M15 a stopped or no-result critic re-run in code', EXAMPLES,
     "const critRaw = await parallel(criticPrompts.map((p, i) => () => agent(p, { label: criticLabels[i], phase: 'Critics', schema: XSCHEMA })))",
     "const critRaw0 = await parallel(criticPrompts.map((p, i) => () => agent(p, { label: criticLabels[i], phase: 'Critics', schema: XSCHEMA })))\n"
     "const critRaw = await parallel(critRaw0.map((c, i) => () => (c && !isStop(c) ? c : agent(criticPrompts[i], { label: criticLabels[i], phase: 'Critics', schema: XSCHEMA }))))",
     "S14 critic stop: 'completeness R1' ran once"),
    ('M16 the verifier no-result log line dropped', EXAMPLES,
     'if (verifierNoResult.length) log(', 'if (false) log(',
     'S10 verifier no result: the log says the cause is undetermined'),
    ('M17 covers_held not required of a gap', EXAMPLES,
     "required: ['title', 'question', 'priority', 'topic', 'covers_held']", "required: ['title', 'question', 'priority', 'topic']",
     'every critic schema requires covers_held'),
    ('D1 marked gaps not excluded from a topic', EXAMPLES,
     'select((.id as $x | $m | index($x)) | not)\n        | select(', 'select(',
     'the marked gap and the flagged gap are not derived through the topic', 'derivers'),
    ('D2 owner check not restricted to the Answered section', EXAMPLES,
     'answered && index(', 'index(',
     'owner: a scope quoted only in Open is refused', 'derivers'),
    ('D3 covers_held ignored for a topic', EXAMPLES,
     ' and (.covers_held | not))', ')',
     'the marked gap and the flagged gap are not derived through the topic', 'derivers'),
    ('D4 an approved marked id not refused', EXAMPLES,
     '"unknown id \\(.)"),\n    ($i[] | select(. as $x | $m | index($x)) | "marked id \\(.)")', '"unknown id \\(.)")',
     'gaps: an approved marked id is refused', 'derivers'),
    ('D5 owner check exits 0 on a refusal', EXAMPLES,
     '[ -z "$refused" ] || { printf \'%s\\n\' "$refused"; exit 1; }', '[ -z "$refused" ] || printf \'%s\\n\' "$refused"',
     'owner: a scope quoted only in Open is refused with exit 1', 'derivers'),
    ('D6 a release never lifts a hold in the held list', EXAMPLES,
     """awk '{h[$2] = ($1 != "RELEASED")} END {for (i in h) if (h[i]) print i}'""",
     """awk '{h[$2] = 1} END {for (i in h) if (h[i]) print i}'""",
     'held: stopped ids and ids whose last no-result, hold or release line is not a release', 'derivers'),
    ('D7 gap deriver skips the work-list check', EXAMPLES,
     'sha256sum -c --quiet WORK-SHA256SUMS && awk -v f="$GAPS"', 'awk -v f="$GAPS"',
     'gaps: a gaps file changed after it was recorded is refused', 'derivers'),
    ('D8 a gaps file recorded without covers_held', EXAMPLES,
     ' and (.covers_held | type == "boolean"))', ')',
     'record: a list without covers_held is refused', 'derivers'),
    ('L1 stop pattern unanchored', SKILL,
     "rg -o '^\\S+ STOP-[0-9]+ unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt",
     "rg -o 'unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt",
     'no-result: its partial moves to partials/ and it stays unaccounted'),
    ('L2 empty files counted', SKILL,
     "find . -maxdepth 1 -name '*.txt' ! -empty |", "find . -maxdepth 1 -name '*.txt' |",
     'empty file is not reported'),
    ('L3 checksum re-check dropped', SKILL,
     "mech_sums | cmp -s - MECH-SHA256SUMS || { echo 'mechanical/ changed during the run'; exit 1; }   # mech_sums: Step 1\n",
     '',
     'changed input refused'),
    ('L4 held ids not subtracted', SKILL,
     '| comm -23 - ledger/stopped.txt | comm -23 - ledger/held.txt > ledger/unaccounted.txt',
     '| comm -23 - ledger/stopped.txt > ledger/unaccounted.txt',
     'held spec is held, not unaccounted'),
    ('L5 work-list check dropped', SKILL,
     "work_sums | sort | cmp -s - <(sort WORK-SHA256SUMS) || { echo 'the work list changed after it was recorded'; exit 1; }   # work_sums: Step 2\n",
     '',
     're-derivation at chunk 5 after launch is refused'),
    ('L6 a second work list not refused', SKILL,
     """[ ! -e "$RUN_DIR/WORK-SHA256SUMS" ] || { echo 'REFUSED: the work list is already recorded; a new one is a re-run (Step 8 item 2)'; exit 2; }\n""",
     '',
     'a second work list is refused'),
    ('L7 a release never lifts a hold in the ledger', SKILL,
     """awk '{h[$2] = ($1 == "HELD")} END {for (i in h) if (h[i]) print i}'""",
     """awk '{h[$2] = h[$2] || ($1 == "HELD")} END {for (i in h) if (h[i]) print i}'""",
     'a hold released from an unused Answered line is unaccounted until it runs'),
    ('L8 a release after a report not refused', SKILL,
     """[ ! -s "$ID.txt" ] || { echo "REFUSED: $ID.txt exists; a release comes before the run"; exit 1; }\n""",
     '',
     'release after a report is refused'),
    ('L9 a no-result partial left in place', SKILL,
     '[ ! -e "$RUN_DIR/$ID.txt" ] || mv --backup=numbered "$RUN_DIR/$ID.txt" "$RUN_DIR/partials/$ID.txt" ||\n'
     '  { echo "REFUSED: $ID.txt was not moved to partials/ (mv --backup needs GNU coreutils)"; exit 1; }\n',
     '',
     'no-result: its partial moves to partials/'),
    ('L10 a stopped id released', SKILL,
     """awk -v u="unit=$ID" '$2 ~ /^STOP-[0-9]+$/ && $3 == u {f = 1} END {exit !f}' UNIT-LOG.txt && { echo "REFUSED: $ID is stopped; only an owner spec re-scopes it"; exit 1; }\n""",
     '',
     'release of a stopped id is refused'),
    ('L11 a transient release not bound to a first, unreleased no-result', SKILL,
     """    awk -v u="unit=$ID" '$3 != u {next} $2 == "NORESULT" {n++} $2 == "RELEASED" {s = ""; next} $2 == "NORESULT" || $2 == "HELD" {s = s $2 " "}
      END {exit !(n == 1 && s == "NORESULT ")}' UNIT-LOG.txt ||
      { echo "REFUSED: a transient release is for the first no-result of $ID, with no release or hold since"; exit 1; } ;;""",
     '    true ;;',
     'a transient release is logged once'),
    ('L12 an owner release read outside the Answered section', SKILL,
     'answered && (index(', '(index(',
     'release by owner with no Answered line is refused'),
    # Review round 4 (AD4-4, R4-1, AD4-1, G4-2, AD4-9) and the checker re-run.
    ('L13 a release lifts a hold logged after it (Step 10)', SKILL,
     """awk '{h[$2] = ($1 == "HELD")} END {for (i in h) if (h[i]) print i}'""",
     """awk '$1 == "RELEASED" {r[$2] = 1} $1 == "HELD" {h[$2] = 1} END {for (i in h) if (h[i] && !r[i]) print i}'""",
     'a hold logged after a release holds the id again'),
    ('L14 a transient release without its transcript', SKILL,
     '[ -f "${BY#transient:}" ] || { echo "REFUSED: no transcript at ${BY#transient:}"; exit 1; }\n', '',
     'a transient release naming no transcript file is refused'),
    ('L15 an Answered line releases more than once', SKILL,
     '[ "$answers" -gt "$used" ]', '[ "$answers" -gt 0 ]',
     'an Answered line releases once'),
    ('L16 a release without a unit log', SKILL,
     "[ -f UNIT-LOG.txt ] || { echo 'REFUSED: no UNIT-LOG.txt'; exit 2; }\nID=CL1.4.1-02", 'ID=CL1.4.1-02',
     'release: no unit log is refused, and none is started'),
    ('L17 a ledger without a unit log', SKILL,
     "[ -f UNIT-LOG.txt ] || { echo 'REFUSED: no UNIT-LOG.txt'; exit 2; }\nmech_sums", 'mech_sums',
     'ledger: no unit log is refused'),
    ('L18 a later run directory starts an empty unit log', SKILL,
     '     cp "${PRIOR_RUN:?}/UNIT-LOG.txt" "$RUN_DIR/UNIT-LOG.txt" || exit 1 ;;', '     touch "$RUN_DIR/UNIT-LOG.txt" ;;',
     'step 1: with the carried log, a later run directory still counts the stop'),
    ('L19 an existing unit log overwritten', SKILL,
     """  *) [ ! -s "$RUN_DIR/UNIT-LOG.txt" ] || { echo 'REFUSED: this run directory already has a unit log'; exit 1; }\n     cp""",
     '  *) cp',
     'step 1: an existing unit log is not overwritten'),
    ('L20 a failed mv logged as a no-result', SKILL,
     ' ||\n  { echo "REFUSED: $ID.txt was not moved to partials/ (mv --backup needs GNU coreutils)"; exit 1; }', '',
     'no-result: a partial that cannot be moved is refused, and nothing is logged'),
    ('L21 a transient release over a hold logged since', SKILL,
     '$2 == "NORESULT" || $2 == "HELD" {s = s $2 " "}', '$2 == "NORESULT" {s = s $2 " "}',
     'a transient release of a no-result held over a stop since is refused'),
    ('L22 a transient release of a second no-result', SKILL,
     'END {exit !(n == 1 && s == "NORESULT ")}', 'END {exit !(s == "NORESULT ")}',
     'a transient release after an owner release and a second no-result is refused'),
    ('D9 a release lifts a no-result or hold logged after it (held list)', EXAMPLES,
     """awk '{h[$2] = ($1 != "RELEASED")} END {for (i in h) if (h[i]) print i}'""",
     """awk '$1 == "RELEASED" {r[$2] = 1} $1 != "RELEASED" {h[$2] = 1} END {for (i in h) if (h[i] && !r[i]) print i}'""",
     'held: a no-result or a hold logged after a release holds the id again', 'derivers'),
    ('D10 reported units relaunched after a stop', EXAMPLES,
     '($held + $skip)', '$held',
     'launch: after a stop or no-result, a unit that reported is not relaunched', 'derivers'),
    ('D11 a RERUN line not bound to its tag', EXAMPLES,
     '$2 ~ /^RERUN-[0-9]+$/ && $4 == t', '$2 ~ /^RERUN-[0-9]+$/',
     'launch: a RERUN line for another run does not', 'derivers'),
    ('D12 reported units held back with no stop in the job', EXAMPLES,
     r"""if rg -q '^\S+ (STOP-[0-9]+|NORESULT) unit=' UNIT-LOG.txt; then""", 'if true; then',
     'launch: with no stop or no-result in the job, reported units relaunch', 'derivers'),
    ('D13 an unreadable cluster not refused', EXAMPLES,
     """ids=$(jq -r '.[].id' "$CLUSTER") || { echo "REFUSED: $CLUSTER is not a spec list"; exit 2; }""",
     """ids=$(jq -r '.[].id' "$CLUSTER")""",
     'launch: a missing cluster file is refused before any list is printed', 'derivers'),
    ('M18 a rerun prompt that is not the launched one', EXAMPLES,
     'rerunPrompts[id] = verifyPrompt(r, items[i], i + 1)', 'rerunPrompts[id] = verifyPrompt(r, items[i], i)',
     'S10 verifier no result: its rerun prompt is the prompt it was launched with'),
    ('M19 a stopped critic given a rerun prompt', EXAMPLES,
     'if (!critRaw[i]) rerunPrompts[id] = criticPrompts[i]', 'if (!critRaw[i] || isStop(critRaw[i])) rerunPrompts[id] = criticPrompts[i]',
     'S14 critic stop: a stopped critic has no rerun prompt'),
    ('M20 a rerun that runs the whole skeleton too', EXAMPLES,
     '  return { tag: TAG, rerun: RERUN.id,', '  void { tag: TAG, rerun: RERUN.id,',
     'S16 rerun verifier: exactly one agent runs'),
    ('M21 a rerun of a unit id', EXAMPLES,
     "/^(V|X-accuracy|X-completeness)-[A-Za-z0-9._-]+$/.test(RERUN.id || '')", "/^[A-Za-z0-9._-]+$/.test(RERUN.id || '')",
     'S18 rerun refused: a unit id is refused before any agent'),
    ('M22 a rerun alongside specs', EXAMPLES,
     '&& A.tag && !INPUT.length))', '&& A.tag))',
     'S18 rerun refused: a rerun with specs is refused before any agent'),
    ('M23 a verifier rerun under the critic schema', EXAMPLES,
     'schema: isV ? VSCHEMA : XSCHEMA', 'schema: XSCHEMA',
     'S16 rerun verifier: it runs with the verifier schema'),
    ('M24 a stopped rerun counted', EXAMPLES,
     'const ok = r && !isStop(r) ? [r] : []', 'const ok = r ? [r] : []',
     'S17 rerun critic: a stop is recorded and its gaps not used'),
    ('M25 the stopped-unit log line without "do not re-run"', EXAMPLES,
     "log(`STOPPED, record by id and route to the owner, do not re-run: ${stopped.join(', ')}`)",
     "log(`STOPPED, record by id and route to the owner: ${stopped.join(', ')}`)",
     'stop reviewer: the log says not to re-run the stopped unit'),
    ('M26 a gap spec that does not point at the recorded file', EXAMPLES,
     'the question with id ${s.g} in ${DIR}/${s.from}', 'the question with id ${s.g} in ${s.from}',
     'S19 gap spec: the prompt points at the recorded gaps file'),
    ('Ma a stopped unit re-run in code', EXAMPLES,
     'if (isStop(r)) { stopped.push(s.id); return null }', 'if (isStop(r)) { stopped.push(s.id); await runUnit(s, ph); return null }',
     'stop reviewer: the stopped unit ran once'),
    ('Mb a stopped verifier re-run in code', EXAMPLES,
     'else if (isStop(v)) verifierStopped.push(id)', 'else if (isStop(v)) { verifierStopped.push(id); verify(r, items[i], i + 1, ph) }',
     "S11 verifier stop: 'verify CL-B#1' ran once"),
]


def check(path, kind):
    if kind == 'harness':
        command = ['node', os.path.join(HERE, 'harness.mjs'), path]
    elif kind == 'derivers':
        command = ['bash', os.path.join(HERE, 'derivers.sh'), path, 'zsh']
    else:
        command = ['bash', os.path.join(HERE, 'ledger.sh'), path, 'zsh']
    return subprocess.run(command, capture_output=True, text=True)


for path, kind in ((EXAMPLES, 'harness'), (EXAMPLES, 'derivers'), (SKILL, 'ledger')):
    base = check(path, kind)
    if base.returncode != 0 or any(line.startswith('FAIL') for line in base.stdout.splitlines()):
        print(f'REFUSED: baseline not green for {kind} on {path} (exit {base.returncode})')
        sys.exit(2)
print('baseline green: harness.mjs and derivers.sh on EXAMPLES.md, ledger.sh on SKILL.md, under zsh')

survivors = 0
with tempfile.TemporaryDirectory() as tmp:
    for name, path, old, new, row, *rest in MUTANTS:
        kind = rest[0] if rest else ('harness' if path == EXAMPLES else 'ledger')
        source = open(path, encoding='utf-8').read()
        if source.count(old) != 1:
            print(f'REFUSED {name}: needle occurs {source.count(old)} times in {path}')
            sys.exit(2)
        mutated = os.path.join(tmp, name.split()[0] + '-' + os.path.basename(path))
        with open(mutated, 'w', encoding='utf-8') as handle:
            handle.write(source.replace(old, new))
        run = check(mutated, kind)
        fails = [line for line in run.stdout.splitlines() if line.startswith('FAIL')]
        # A kill is exit 1 with a failing row that names this guard's row. Anything else says nothing
        # about the guard: INCONCLUSIVE (or SURVIVED on exit 0), and it counts against the run.
        if run.returncode == 1 and any(row in line for line in fails):
            verdict = 'KILLED'
        else:
            verdict = 'SURVIVED' if run.returncode == 0 else 'INCONCLUSIVE'
            survivors += 1
        print(f'{verdict}  {name}: exit {run.returncode}, {len(fails)} failing row(s); expected row "{row}"')
        for line in fails:
            print(f'    {line}')
sys.exit(0 if survivors == 0 else 1)
