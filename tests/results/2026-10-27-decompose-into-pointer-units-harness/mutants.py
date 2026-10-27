#!/usr/bin/env python3
"""mutants.py: break one guard at a time in the skill's skeleton or Step 10 snippet, and show that
harness.mjs or ledger.sh goes red on the row written for that guard.

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
     'if (!v) verifierNoResult.push(id)', 'if (!v) {}',
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
     'const critRaw = await parallel([...accuracy, completeness])',
     'const critRaw0 = await parallel([...accuracy, completeness])\nconst critRaw = await parallel([...accuracy, completeness].map((t, i) => () => (critRaw0[i] && !isStop(critRaw0[i]) ? critRaw0[i] : t())))',
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
    ('D6 released ids not subtracted from the held list', EXAMPLES,
     ' | comm -23 - <(printf \'%s\\n\' "$released")', '',
     'held: stopped ids and unreleased no-result and held ids', 'derivers'),
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
    ('L7 released ids not subtracted from held', SKILL,
     ' | comm -23 - ledger/released.txt > ledger/held.txt', ' > ledger/held.txt',
     'released and not yet re-run is unaccounted'),
    ('L8 a release after a report not refused', SKILL,
     """[ ! -s "$ID.txt" ] || { echo "REFUSED: $ID.txt exists; a release comes before the run"; exit 1; }\n""",
     '',
     'release after a report is refused'),
    ('L9 a no-result partial left in place', SKILL,
     '[ ! -e "$RUN_DIR/$ID.txt" ] || mv --backup=numbered "$RUN_DIR/$ID.txt" "$RUN_DIR/partials/$ID.txt"\n',
     '',
     'no-result: its partial moves to partials/'),
    ('L10 a stopped id released', SKILL,
     """awk -v u="unit=$ID" '$2 ~ /^STOP-[0-9]+$/ && $3 == u {f = 1} END {exit !f}' UNIT-LOG.txt && { echo "REFUSED: $ID is stopped; only an owner spec re-scopes it"; exit 1; }\n""",
     '',
     'release of a stopped id is refused'),
    ('L11 a second transient release not refused', SKILL,
     """awk -v u="unit=$ID" '$2 == "RELEASED" && $3 == u && $4 ~ /^by=transient:/ {f = 1} END {exit !f}' UNIT-LOG.txt &&
                  { echo "REFUSED: $ID was already re-run once for a transient cause"; exit 1; }""",
     'true',
     'a transient release is logged once'),
    ('L12 an owner release read outside the Answered section', SKILL,
     'answered && (index(', '(index(',
     'release by owner with no Answered line is refused'),
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
