<!-- Paired with CONTRIBUTING.md. The checklist below carries § Adding a skill — its four
     contributor steps and its four one-line checks — plus the acceptance rules from § What the
     library accepts and the two maintainer steps a contributor must leave out. Change both or
     neither. -->

## Why

<!-- The gap this fills or the defect it fixes, in a paragraph. Link the issue if one exists. -->

## What

<!-- What changed, in the order a reviewer should read it. -->

## Checklist for a new skill

<!-- Delete this section if the PR adds no skill. -->

- [ ] `skills/<skill-name>/SKILL.md` from `skills/_template/SKILL.md`, with all six sections — When to Use, Inputs, Procedure, Validation, Common Pitfalls, Related Skills — under 500 lines, every code fence tagged
- [ ] Entry in `skills/_registry.yml` under a domain, and `total_skills` bumped by one
- [ ] Symlink `.claude/skills/<skill-name>` → `../../skills/<skill-name>`, committed
- [ ] Local checks run and clean (CONTRIBUTING.md § Local checks)
- [ ] `description` is mine, not the template's; `allowed-tools` matches what the procedure invokes; every fence has been run, not only read
- [ ] No file or directory in the skill carries a name from `USER_OWNED_EXCLUDE` or `EXCLUDED_SKILL_DIRS` (`scripts/build-hermes-distribution.js`), no directory starts with `_` or `.`, nothing in it is a symlink
- [ ] Vendor-neutral: works against any conforming target, one vendor location at most, no attribution parameters, sandbox first with the live path opt-in
- [ ] I did **not** scaffold translations or regenerate READMEs — those are maintainer steps at merge, and CONTRIBUTING.md says why

## How I checked

<!-- Which of the local checks you ran and what they printed; anything you executed rather than read. -->
