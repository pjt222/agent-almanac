<!-- Paired with CONTRIBUTING.md § Adding a skill. The checklist below mirrors that section's
     contributor steps, item for item; change both or neither. -->

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
- [ ] Vendor-neutral: works against any conforming target, one vendor location at most, no attribution parameters, sandbox first with the live path opt-in
- [ ] I did **not** scaffold translations or regenerate READMEs — those are maintainer steps at merge, and CONTRIBUTING.md says why

## How I checked

<!-- Which of the local checks you ran and what they printed; anything you executed rather than read. -->
