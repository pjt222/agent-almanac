#!/usr/bin/env python3
"""mutants.py: break one guard at a time in the skill's skeleton or Step 10 snippet, and show that
harness.mjs or ledger.sh goes red on the row written for that guard.

Usage (from the repository root):
    python3 tests/results/2026-10-27-decompose-into-pointer-units-harness/mutants.py

Each mutant replaces one literal that must occur exactly once; a needle that does not is refused
(exit 2). Mutated copies are written to a temporary directory, never over the skill. A mutant is
KILLED only when its run exits 1 with at least one FAIL row; any other non-zero exit is the
instrument breaking and is INCONCLUSIVE. Exit 0 when every mutant is killed, 1 otherwise.
"""
import os
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = 'skills/decompose-into-pointer-units/SKILL.md'
EXAMPLES = 'skills/decompose-into-pointer-units/references/EXAMPLES.md'

MUTANTS = [
    ('M1 gap hold dropped', EXAMPLES,
     'const holdGaps = stopped.length + noResult.length > 0', 'const holdGaps = false'),
    ('M2 stop check narrowed to one source', EXAMPLES,
     "if (r.stop !== 'none') { stopped.push(s.id); return null }",
     "if (r.stop === 'safety-classifier') { stopped.push(s.id); return null }"),
    ('M3 raw input guard removed', EXAMPLES,
     "if (INPUT.some(s => s.kind === 'raw')) throw", 'if (false) throw'),
    ('M4 held filter removed', EXAMPLES,
     'const SPECS = INPUT.filter(s => !HELD.has(s.id))', 'const SPECS = INPUT'),
    ('L1 stop pattern unanchored', SKILL,
     "rg -o '^\\S+ STOP-[0-9]+ unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt",
     "rg -o 'unit=([A-Za-z0-9._-]+)' -r '$1' UNIT-LOG.txt"),
    ('L2 empty files counted', SKILL,
     "find . -maxdepth 1 -name '*.txt' ! -empty |", "find . -maxdepth 1 -name '*.txt' |"),
    ('L3 checksum re-check dropped', SKILL,
     "mech_sums | cmp -s - MECH-SHA256SUMS || { echo 'mechanical/ changed during the run'; exit 1; }   # mech_sums: Step 1\n",
     ''),
]

survivors = 0
with tempfile.TemporaryDirectory() as tmp:
    for name, path, old, new in MUTANTS:
        source = open(path, encoding='utf-8').read()
        if source.count(old) != 1:
            print(f'REFUSED {name}: needle occurs {source.count(old)} times in {path}')
            sys.exit(2)
        mutated = os.path.join(tmp, name.split()[0] + '-' + os.path.basename(path))
        with open(mutated, 'w', encoding='utf-8') as handle:
            handle.write(source.replace(old, new))
        if path == EXAMPLES:
            command = ['node', os.path.join(HERE, 'harness.mjs'), mutated]
        else:
            command = ['bash', os.path.join(HERE, 'ledger.sh'), mutated, 'zsh']
        run = subprocess.run(command, capture_output=True, text=True)
        fails = [line for line in run.stdout.splitlines() if line.startswith('FAIL')]
        # A kill is exit 1 with a failing row. Any other non-zero exit is the instrument breaking,
        # which says nothing about the guard: INCONCLUSIVE, and it counts against the run.
        if run.returncode == 1 and fails:
            verdict = 'KILLED'
        else:
            verdict = 'SURVIVED' if run.returncode == 0 else 'INCONCLUSIVE'
            survivors += 1
        print(f'{verdict}  {name}: exit {run.returncode}, {len(fails)} failing row(s)')
        for line in fails:
            print(f'    {line}')
sys.exit(0 if survivors == 0 else 1)
