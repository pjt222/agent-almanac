#!/usr/bin/env python3
"""mutants.py: break one guard at a time in the skill's skeleton or Step 10 snippet, and show that
harness.mjs or ledger.sh goes red on the row written for that guard.

Usage (from the repository root):
    python3 tests/results/2026-10-27-decompose-into-pointer-units-harness/mutants.py

First the unmutated EXAMPLES.md and SKILL.md must pass both checks; otherwise nothing is scored and
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

# (name, file, old, new, the failing row that must name it)
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
     "if (INPUT.some(s => s.kind === 'owner' && !(s.unit && s.scope && s.answer))) throw", 'if (false) throw',
     'an owner spec without its unit is refused'),
    ('M7 a stopped critic\'s gaps used', EXAMPLES,
     'const critics = critRaw.filter(c => c && !isStop(c))', 'const critics = critRaw.filter(c => c)',
     'S14 critic stop: its gaps are not used'),
    ('M8 a gap unit run in the same run', EXAMPLES,
     "if (gaps.length) log(`${gaps.length} gap(s) returned for the owner batch; none runs in this run`)",
     "if (gaps.length) await pipeline(gaps.slice(0, 1).map((g, i) => ({ kind: 'gap', id: `G-${TAG}-${i + 1}`, g: 'G1', from: 'x' })), s => runUnit(s, 'Review'))",
     'no gap unit runs'),
    ('L1 stop pattern unanchored', SKILL,
     "rg -o '^\\S+ STOP-[0-9]+ unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt",
     "rg -o 'unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt",
     'no-result stays unaccounted'),
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
]


def check(path):
    if path.endswith('EXAMPLES.md'):
        command = ['node', os.path.join(HERE, 'harness.mjs'), path]
    else:
        command = ['bash', os.path.join(HERE, 'ledger.sh'), path, 'zsh']
    return subprocess.run(command, capture_output=True, text=True)


for path in (EXAMPLES, SKILL):
    base = check(path)
    if base.returncode != 0 or any(line.startswith('FAIL') for line in base.stdout.splitlines()):
        print(f'REFUSED: baseline not green for {path} (exit {base.returncode})')
        sys.exit(2)
print('baseline green: harness.mjs on EXAMPLES.md, ledger.sh on SKILL.md under zsh')

survivors = 0
with tempfile.TemporaryDirectory() as tmp:
    for name, path, old, new, row in MUTANTS:
        source = open(path, encoding='utf-8').read()
        if source.count(old) != 1:
            print(f'REFUSED {name}: needle occurs {source.count(old)} times in {path}')
            sys.exit(2)
        mutated = os.path.join(tmp, name.split()[0] + '-' + os.path.basename(path))
        with open(mutated, 'w', encoding='utf-8') as handle:
            handle.write(source.replace(old, new))
        run = check(mutated)
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
