/**
 * Envelope for integrity check A15 — skill registry entry set vs disk (#700).
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/a15-skill-registry-entry-set.mjs
 *
 * A15 is the skills-shaped sibling of A4/A5, and it exists because the only thing guarding
 * `skills/_registry.yml` was a COUNT, in `validate-skills.yml`. A count cannot see a set
 * difference, and the realistic path leaves it untouched: rename `skills/<old>/` to
 * `skills/<new>/` without editing the registry and the number is identical while the registry
 * names a directory that does not exist.
 *
 * ## Why the mutations are renames and an indent shift, never an added or deleted entry
 *
 * Same constraint as `a4-a5-registry-entry-sets.mjs`: the harness mutates file CONTENT, it
 * cannot add or remove a file. That is not a limitation here, it is the right instrument —
 * renaming one `- id:` leaves the entry COUNT untouched, so `total_skills` stays green and only
 * the set logic can fire. A case that changed the count would be killed by the count check and
 * prove nothing about A15.
 *
 * ## Case 5 is why this file exists at all
 *
 * Cases 1-4 mirror shapes already proven for A4/A5. Case 5 does not: it covers the
 * `total_skills` cross-check, which was ADDED during #708 to close a hole found in review — a
 * PARTIAL extraction slipping past a zero-guard that fires only on TOTAL failure, then
 * reporting every unextracted skill as "only on disk". That fix is new load-bearing logic in a
 * MERGE-BLOCKING context (`integrity` is a required status check), and the PR transcript does
 * not record its branch ever having fired. A fix for a false-positive hole, itself uncovered,
 * is exactly the shape this repo's envelopes exist to refuse.
 *
 * The mutation is a one-space indent shift rather than an edited count, for two reasons: it
 * reproduces the real partial-extraction scenario instead of a stale number, and it does not
 * hardcode `total_skills`, which changes every time a skill is added.
 *
 * ## Every `expect` must sit on a single FAIL line
 *
 * `gate-envelope.js` kills a case only when ONE line contains both `FAIL` and the expected
 * substring. A4/A5 learned this the expensive way — a header FAIL plus indented per-id detail
 * reported [WRONG-RED] against a check that was naming ids correctly. Case 5's substring is the
 * two-cause clause, which is both on the FAIL line and independent of any count.
 */

export const gate = { command: ['bash', 'scripts/validate-integrity.sh'] };

export const cases = [
  {
    // The #700 scenario proper: the directory still exists under its old name, the registry
    // now names one that does not. `total_skills` is untouched, so nothing else can fire.
    label: 'A15: a skill id is renamed — the orphaned ENTRY is named, with the SKILL.md path shape',
    file: 'skills/_registry.yml',
    find: '      - id: create-r-package\n',
    replace: '      - id: create-r-package-typo\n',
    // Also pins `${shape//<id>/$id}`: A15 must say `skills/<id>/SKILL.md`, not A4's `<tree>/<id>.md`.
    expect: 'only in registry (no file): create-r-package-typo -- expected skills/create-r-package-typo/SKILL.md',
  },
  {
    // Same mutation, other half. Two claims, not one: a check printing only `only in registry`
    // would satisfy case 1 while leaving the now-unreferenced directory unnamed.
    label: 'A15: a skill id is renamed — the unreferenced DIRECTORY is named',
    file: 'skills/_registry.yml',
    find: '      - id: create-r-package\n',
    replace: '      - id: create-r-package-typo\n',
    expect: 'skills: only on disk (no registry entry): create-r-package',
  },
  {
    // A duplicate must be caught BEFORE `sort -u` collapses it, or two entries pointing at one
    // directory are forgiven by the very check meant to pair them one-to-one.
    label: 'A15: two entries sharing one id are caught before sort -u collapses them',
    file: 'skills/_registry.yml',
    find: '      - id: create-skill\n',
    replace: '      - id: create-r-package\n',
    expect: 'has two entries sharing one id: create-r-package',
  },
  {
    // FAIL-CLOSED. Breaking the `domains:` anchor makes the sed range match nothing, so the
    // extraction returns empty. Comparing an empty set against disk would report all 370
    // directories as unregistered — loud, and the next reader "repairs" a clean registry.
    label: 'A15: a drifted section key reports pattern drift, not 370 unregistered skills',
    file: 'skills/_registry.yml',
    find: '\ndomains:\n',
    replace: '\ndomainz:\n',
    expect: "extracted 0 '- id:' values from skills/_registry.yml under 'domains:' -- pattern drift",
  },
  {
    // THE CASE WITH NO PRIOR EVIDENCE. One id shifted by a single space no longer matches the
    // six-space `- id:` pattern, so the extraction silently SHRINKS. The zero-guard above does
    // not fire — it only sees TOTAL failure — and without this cross-check the run would report
    // the unextracted skill as "only on disk (no registry entry)": a false positive, in a
    // required context, naming the wrong cause and sending the reader to edit a clean registry.
    //
    // Asserting the two-cause clause rather than the numbers: the message must NOT claim the
    // extraction drifted, because a stale `total_skills` produces this same branch and is the
    // likelier trigger in practice (it needs only a skipped step 3 of "Adding a New Skill").
    label: 'A15: a PARTIAL extraction is caught by the total_skills cross-check, naming both causes',
    file: 'skills/_registry.yml',
    find: '      - id: create-skill\n',
    replace: '       - id: create-skill\n',
    expect: 'either the extraction pattern drifted or total_skills is stale',
  },
];
