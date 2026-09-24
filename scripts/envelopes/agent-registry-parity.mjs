/**
 * Envelope for the agent/registry parity gate (#434) — does it go red on the drift it names?
 *
 * The gate here is `npm run validate:agent-parity`, the command
 * `.github/workflows/validate-skills.yml` runs, not the inner script.
 *
 * The class this exists for is #398: `apa-specialist` listed 1 skill in its file and 3 in the
 * registry, from the agent's creation commit, and nothing noticed. The repair in #403 §2a was a
 * hand-sync of four agents. So the cases below reproduce that drift in both directions, plus the
 * two failure modes a naive parity check would miss.
 *
 * Result at introduction, 2026-08-25:
 *
 *     gate-envelope: 5 killed, 1 survived as documented of 6 case(s).
 *
 * The documented survivor is ORDER. The two files list skills in different orders in several
 * places today and that is not drift; a gate that reddened on it would be reverted within a week
 * and would take the real check with it.
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/agent-registry-parity.mjs
 */

export const gate = { command: ['npm', 'run', 'validate:agent-parity'] };

const AGENT = 'agents/code-reviewer.md';
const REGISTRY = 'agents/_registry.yml';

export const cases = [
  {
    label: 'THE #398 SHAPE: the registry lists a skill the agent file does not',
    // Drift introduced on the registry side, which is the side #398 was wrong on.
    file: REGISTRY,
    find: '      - review-pull-request\n      - security-audit-codebase',
    replace: '      - review-pull-request\n      - manage-backlog\n      - security-audit-codebase',
    expect: 'code-reviewer.skills',
  },
  {
    label: 'THE OTHER DIRECTION: the agent file lists a skill the registry does not',
    file: AGENT,
    find: '  - review-pull-request\n',
    replace: '  - review-pull-request\n  - manage-backlog\n',
    expect: 'code-reviewer.skills',
  },
  {
    label: 'TOOLS drift, not only skills',
    // `tools` is the second field #434 names and is easy to leave uncovered, since every
    // interesting example anyone reaches for is a skill.
    file: AGENT,
    find: 'tools: [Read, Edit, Grep, Glob, Bash, WebFetch]',
    replace: 'tools: [Read, Edit, Grep, Glob, Bash]',
    expect: 'code-reviewer.tools',
  },
  {
    label: 'VACUITY: an emptied field must FAIL rather than compare equal',
    // The half of a parity check that fails silently. Two empty lists ARE equal, so a gate
    // comparing only agreement reports "no drift" over a field nobody filled in.
    //
    // This empties ONE side, which the agreement check would also catch — so on its own it does
    // not prove the presence rule fires. What it pins is the MESSAGE: the gate must say "empty
    // on the registry side ... asserts nothing" rather than reporting it as ordinary drift,
    // because the two have different repairs. The both-empty case is covered by the unit-level
    // `populated` count the gate prints and by the 150/150 measurement in its header.
    file: REGISTRY,
    find: '    tools: [Read, Edit, Grep, Glob, Bash, WebFetch]\n    skills:\n      - review-pull-request',
    replace: '    tools: []\n    skills:\n      - review-pull-request',
    expect: 'code-reviewer.tools',
  },
  {
    label: 'AN ORPHANED registry entry with no agent file',
    file: REGISTRY,
    find: '  - id: code-reviewer\n',
    replace: '  - id: no-such-agent\n    path: agents/no-such-agent.md\n    description: x\n    tools: [Read]\n    skills:\n      - review-pull-request\n  - id: code-reviewer\n',
    expect: 'no-such-agent',
  },
  {
    label: 'ORDER must NOT redden the gate — documented survivor',
    // Order-insensitivity is deliberate and is asserted here rather than assumed, because it is
    // the property most likely to be "tightened" by someone who reads the comparison as a list
    // equality. The corpus already lists these in differing orders in places.
    file: AGENT,
    find: '  - review-pull-request\n  - security-audit-codebase',
    replace: '  - security-audit-codebase\n  - review-pull-request',
    expect: null,
  },
];
