# Community Replies — 2026-03-26

All three posted. Adversarial-reviewed (advocatus-diaboli).

---

## Thread 1: Discussion #270 — `emerge`/`evolves-from` fields

**URL:** https://github.com/agentskills/agentskills/discussions/270
**Author:** dacrystal | **Comments:** 0 | **Posted:** 2026-03-23

### Draft Reply

The two-field split feels right. Having a single mechanism try to cover both "augment an existing skill" and "create a new identity rooted in one" leads to ambiguity for harnesses — making them mutually exclusive is a clean call.

We use a similar fork in an [`evolve-skill`](https://github.com/pjt222/agent-almanac/blob/main/skills/evolve-skill/SKILL.md) procedure — a decision matrix between **refinement** (in-place edit, version bump) and **variant** (new catalog identity rooted in the original). The variant path maps closely to `evolves-from`.

Where they diverge: refinement assumes skills are *locally mutable* (the author evolves them over time), while `emerge` treats the parent as an immutable published unit and layers on behavior without touching it. That's a genuinely different model, and I think it's worth the spec being explicit about which assumption it makes.

Two questions:

1. For `emerge` — the "invisible in catalog" constraint means a user can't discover or activate the augmentation independently. What happens when someone wants to *inspect* what augmentations are layered onto a skill? Is there a query mechanism, or does the parent skill's effective body just silently include emerge additions?

2. On your Q3 — should `evolves-from` resolve the base skill's effective body (including emerge additions) or raw body only? I'd lean toward raw body. If evolved skills inherit emerge augmentations, adding an emerge to the base retroactively changes the behavior of all evolved descendants, which seems like it would violate the chain depth cap's intent of keeping things predictable.

---

## Thread 2: Discussion #272 — `includes` frontmatter field

**URL:** https://github.com/agentskills/agentskills/discussions/272
**Author:** romainsimon | **Comments:** 0 | **Posted:** 2026-03-23

### Draft Reply

This hits a real gap. The spec is designed around self-contained skills, but the moment you have a multi-skill repo with shared data — your French accounting example is a great concrete case — you're either duplicating files or reaching outside the skill directory. Neither of which the current spec handles cleanly.

For contrast on the opposite end of the spectrum: we use a `references/` subdirectory inside each skill folder for supplementary content (extended examples, large config templates). Something like `skills/configure-api-gateway/references/EXAMPLES.md` that the skill body links to via relative path. That works well for per-skill content, but it's explicitly *not* shared — each skill owns its own references, so any common data gets duplicated across skill directories.

The tension you're surfacing is real: `includes` solves DRY at the cost of portability. A skill with `includes: ["data/french-tax-tables.csv"]` can't be installed standalone without also resolving that path from the source repo.

Which raises the question: does `includes` resolve at **install/distribution time** (the tool bundles referenced files into the skill directory, producing a self-contained artifact) or at **activation time** (the client needs ongoing access to the source repo structure)? The first feels much safer for portability — it's a build step that outputs a self-contained package. The second creates a runtime dependency on repo layout.

I see you've already specified no `../` traversal, which is good. Does that mean the intent is install-time resolution where the distribution tool copies the included files in?

---

## Thread 3: Issue #255 — .well-known URI

**URL:** https://github.com/agentskills/agentskills/issues/255
**Author:** jonathanhefner | **Last activity:** 2026-03-24

### Draft Reply

Thanks @jonathanhefner, that clears it up — manifest at `index.json` pointing to individual skills makes sense.

On the versioning thread @pja-ant raised: one lightweight pattern that works for us is recording a `source_commit` hash per skill — enough to detect staleness without full digest infrastructure. The question for the manifest spec is whether there's room for that kind of "freshness hint" alongside the stronger digest-based integrity that @balthazar-bot is asking for, or whether the spec should pick one verification model and stick with it.

---

## Deferred: Advocatus Diaboli Link Drop

**Target:** jonathanhefner's "devil's advocate" comment on Issue #15
**URL:** https://github.com/agentskills/agentskills/issues/15#issuecomment-3953421393
**Our agent:** https://github.com/pjt222/agent-almanac/blob/main/agents/advocatus-diaboli.md

**Why deferred:** Adversarial review concluded a pure link drop would undermine the credibility of the substantive replies when viewed as a set. The advocatus-diaboli reference should be saved for a thread where adversarial testing, critical review, or devil's advocate methodology is the actual topic — not shoehorned onto an incidental phrase.

**When to use:** Next time a discussion opens about skill quality assurance, adversarial testing, assumption-challenging review processes, or steelmanning in the agentskills ecosystem.
