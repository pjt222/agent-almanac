# Dreams

Output of the [`dream`](../skills/dream/SKILL.md) skill, kept.

`dream` is the one skill in the library that inverts the standard format: no inputs, no
validation, no expected output. It produces *fragments* — an image, a half-connection, a
word that will not leave. Those fragments have repeatedly become infrastructure here.
`scripts/mutation-check.js` and the CLAUDE.md section *"Proving a Gate Can Fail"* are the
2026-07-30 dream's **missing click**, made mechanical. The `campfire` command and
`viz/js/campfire.js` are the 2026-03-18 dream's vocabulary.

This directory exists because two of the earliest dreams did **not** survive. The campfire
dream lived in a Claude Code plan file that has since been deleted; the glyph dream was
never emitted as text at all. A dream held only in a session transcript is one cleanup away
from gone. Writing it here is what makes it durable.

## Five is a floor, not a census

The initial five entries were recovered by scanning 15 session transcripts for a `^#+ *Dream`
heading plus a length heuristic. **That is a fact about the search, not about the corpus.**
The probe cannot see:

- a dream that produced no heading — which is the *canonical* shape, since the skill itself
  says dreams produce "fragments, not blueprints" and sets no expected structure
- a short dream, which the length floor drops — again the canonical shape
- a heading worded differently (`## Dreaming`, `## The Dream`, lowercase)
- a session whose transcript is gone, or whose early turns were compacted away — a class
  proven non-empty by the two damaged entries above
- a `/dream` run from a sibling project directory

So the corpus starts at five because five is what one bounded probe returned. If you find an
older dream, add it; the atlas has no notion of a complete set, and an entry dated before the
newest simply takes its place in the spiral.

## The atlas

[`atlas.html`](atlas.html) draws the whole corpus as one figure — open it in a browser, or
build it with:

```bash
npm run build-dreams     # write dreams/atlas.html
npm run check-dreams     # exit 1 if the committed atlas is stale
```

Each dream is a **Chladni sand field**: points sampled over a square plate and kept where
the nodal function is near zero, which is where sand collects. The mode numbers come from
the dream's own motifs, so two dreams that ring in the same modes look alike. Marks are
placed at the golden angle (137.5° × n) at radius ∝ √n — the phyllotaxis rule, which never
collides and never needs relayout. Damaged entries are drawn with an **unconformity**: a
wedge missing from the plate and a red break line across it, the way a stratigraphic section
draws missing time.

The page is a body-fragment HTML document — it carries `<title>`, `<style>` and `<script>`
but no `<html>`/`<head>`/`<body>` wrapper, so the same file opens locally and publishes as
an Artifact unmodified.

## Adding a dream

Write one markdown file. Nothing else. The atlas derives every position, mark, chord and
colour from frontmatter, so there is no registry to update and no layout to adjust — the
figure at fifty entries is the same figure it is at five.

```
dreams/<YYYY-MM-DD>-<slug>.md
```

```yaml
---
title: Geometry — the gnomon, and drawing the gaps   # required
date: 2026-08-11                                     # required
motifs: [geometry, growth, gnomon]                   # required — the eigenmodes, not tags
session: de3ec5d7                                    # transcript id, or "unrecorded"
seed: "the seed the dream was given"
trigger: "why it was invoked"
recovered: full            # full | partial | summary | none
movements: 1               # more than one if the dream was re-entered
glows:                     # the fragments that carried energy
  - "One sentence per fragment."
downstream:                # what it became — issues, code, memory
  - "issue: #460"
---
```

Then `npm run build-dreams` and commit both the entry and the regenerated atlas.

A note on `motifs`: they are treated as **eigenmodes**, not tags. A plate has a discrete
spectrum — a finite vocabulary of shapes it can hold — and the motif list is the record of
which ones a given dream excited. Reuse an existing motif when the dream genuinely rings in
it; two dreams sharing a motif are drawn joined.

A note on `recovered`: the four values are a **closed set**, and the generator refuses
anything outside it rather than guessing. `intact` and the damage note both key off the
exact string, so a typo — `Full`, `parital` — would otherwise draw the dream as damaged,
print no explanation, and quietly make the "N intact" count wrong. Adding a fifth state
means editing `RECOVERY_STATES` in the generator; that is the one part of the gnomon rule
that is *not* free, and it is deliberate.

And do not quietly drop a damaged entry. A loss drawn as a break is more informative than a
gap, and it is the argument for keeping this directory at all.

## Related

- [`skills/dream/SKILL.md`](../skills/dream/SKILL.md) — the skill itself
- [`skills/meditate/SKILL.md`](../skills/meditate/SKILL.md) — clears the space a dream fills
- [`skills/breathe/SKILL.md`](../skills/breathe/SKILL.md) — the buffer that protects fragments
  from premature evaluation on waking
- [`agents/contemplative.md`](../agents/contemplative.md) — the agent that carries these practices
