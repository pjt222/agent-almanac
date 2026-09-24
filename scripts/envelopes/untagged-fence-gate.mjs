/**
 * Envelope for the untagged-fence gate (#629) — does it actually go red, and on exactly the
 * corpus it claims?
 *
 * A gate that has only ever been seen GREEN is a green light of unknown wiring, and this one
 * ships blocking in a required job, so the cost of it being dead is a merge that should have
 * been refused. `scripts/check-content-style.js` already had a fence-aware scanner and reported
 * `untagged code fences: 0 across 0 files` for months — as INFORMATION, from a mode that never
 * exits non-zero. The whole change is that a finding now fails, so "it fails" is the claim that
 * needs evidence.
 *
 * The gate here is `npm run validate:untagged-fences`, the exact command
 * `.github/workflows/validate-skills.yml` runs — not the inner script. A mutation that dies
 * against `node scripts/check-content-style.js` but survives the npm indirection would otherwise
 * pass unnoticed, which is the wiring failure this repo has shipped before.
 *
 * Every case mutates a real tracked file against the real corpus. The mutation is always the
 * same shape — strip a fence's info string — because that is the only way an untagged opener
 * arrives in practice: someone deletes or forgets a tag.
 *
 * Result at introduction, 2026-08-25:
 *
 *     gate-envelope: 3 killed, 1 survived as documented of 4 case(s).
 *
 * The documented survivor is the scope boundary, measured rather than asserted. #629 is about a
 * property of ENGLISH — the fold that turns an untagged English fence into `text` — so an
 * untagged fence in a TRANSLATION must leave this gate green and be owned by
 * `check-i18n-fence-parity.js` instead. If that row ever starts being killed, the gate has
 * quietly widened into i18n and will begin reporting a population nobody triaged.
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/untagged-fence-gate.mjs
 */

export const gate = { command: ['npm', 'run', 'validate:untagged-fences'] };

export const cases = [
  {
    label: 'ENGLISH SKILL: a fence loses its tag',
    // The case the gate exists for. `foldedTagSequence` would fold this to `text`, so a
    // translation could then legally carry a localised ```text fence at the same ordinal and
    // leave the body check entirely — the #481 escape, invisible to every other gate.
    file: 'skills/add-rcpp-integration/SKILL.md',
    find: '```bash',
    replace: '```',
    expect: 'skills/add-rcpp-integration/SKILL.md',
  },
  {
    label: 'TEMPLATE: a fence loses its tag',
    // Templates are deliberately IN scope, unlike `isContentFile`, which skips them. #629 says
    // "anywhere in skills/, agents/, teams/, guides/" and a template lives there. This row is
    // what stops the carve-out from being reintroduced by someone reusing `isContentFile`.
    // The template carries two ```bash openers, so the fence alone is an ambiguous mutation and
    // the envelope refuses it. Anchor on the line that follows the second one.
    file: 'skills/_template/SKILL.md',
    find: '```bash\nnext_command',
    replace: '```\nnext_command',
    expect: 'skills/_template/SKILL.md',
  },
  {
    label: 'GUIDE: a fence loses its tag',
    // A second tree, because ENGLISH_TREES is a list and a list can lose an entry. Covering only
    // skills/ would leave three quarters of the claimed scope unmeasured.
    file: 'guides/content-styleguide.md',
    find: '```bash',
    replace: '```',
    expect: 'guides/content-styleguide.md',
  },
  {
    label: 'SCOPE BOUNDARY: an untagged fence in a TRANSLATION must NOT redden this gate',
    // Documented survivor. English-only is deliberate: an untagged fence in a translation is a
    // translation defect, and routing it here would report a population nobody has read — the
    // exact mistake #591 forbids. Owned by check-i18n-fence-parity.js.
    file: 'i18n/de/skills/create-dockerfile/SKILL.md',
    find: '```bash',
    replace: '```',
    expect: null,
  },
];
