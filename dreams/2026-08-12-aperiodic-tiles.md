---
title: Aperiodic Tiles — the rule on the edge, and the patch that is legal and doomed
date: 2026-08-12
session: 64f11a0f
seed: "of aperiodic tiles ; mind the other session in agent-almanac"
trigger: "explicit /dream, seeded with a warning about a second live session sharing this worktree"
motifs: [tiling, aperiodicity, matching-rules, undecidability, local-indistinguishability, projection, self-similarity, geometry, growth, spiral, proof, clamping]
recovered: full
movements: 1
glows:
  - "The shapes are not the constraint — the matching rule on the edge is. Strip the decorations and the same tiles go periodic."
  - "Every finite patch of a Penrose tiling occurs in every other Penrose tiling: no bounded probe can tell you which tiling you are in."
  - "Legal at every step and doomed globally — a patch obeying every matching rule can be unextendable, so no greedy local process tiles the plane."
  - "You certify by exhibiting the substitution rule, not by inspecting tiles. The hierarchy is the proof."
  - "Cut-and-project: the disorder is an artifact of the slice. Periodic in five dimensions, aperiodic in the shadow."
  - "Order is not repetition — the IUCr changed the definition of crystal rather than discard the diffraction pattern."
  - "Tile(a,b): the periodic tilings are the two endpoints. Aperiodicity is the generic interior."
  - "The domino problem is undecidable. For some corpus properties there is no checker to write — only a construction, or a contradiction."
  - "Kepler drew the gaps he could not fill and called them monstra."
downstream:
  - "issue: #590 (the undecorated edges — generated-and-committed artifacts with no staleness gate)"
  - "issue: #591 (ratchet the debt behind warn-only gates — legal at every step, doomed globally)"
---

## Wandering

**The einstein.** *Ein Stein* — one stone. Not Albert; a pun that stuck for fifty years to
the open question of whether a single shape exists whose every tiling of the plane is
aperiodic. Answered 2023 by a hat: a polykite, thirteen sides, found by an amateur. And the
hat needed its own mirror image to tile — so the answer arrived slightly impure, and the same
group closed it with the **spectre**, a chiral monotile that admits no reflections. A
*vampire* einstein: tiles the plane and casts no mirror.

I want to sit with the impurity rather than the fix. The hat's proof was allowed to import
the reflection. The theorem was true, the object was one stone, and the tiling used two
orientations of it that no rigid motion connects. Reflection admitted as identity. Somewhere
in this repository there is a gate that admits the mirror of the thing it guards and calls it
the same thing.

**The decorations.** Penrose's kites and darts, bare, tile the plane periodically — trivially,
boringly. What forbids periodicity is not the outline. It is the arrows on the edges, the
notches, the matching rule: *this edge may only meet that edge*. The aperiodicity lives in the
adjacency condition, not in the tile.

That reorganises everything I know about this corpus. Almost every gate here checks a tile —
frontmatter fields, line counts, banned strings, fence tags — and almost every interesting
failure has been an **edge**: a registry disagreeing with the disk, a translation disagreeing
with its `source_commit`, a fence body disagreeing with the English it was cut from, a
generated atlas disagreeing with the markdown beneath it. `source_commit` *is* an Ammann
decoration. It is invisible in the shape of the file and it is the entire long-range order.

**Ammann bars.** And the decorations, drawn far enough out, resolve into families of perfectly
straight parallel lines, spaced in a Fibonacci rhythm — long, long, short, long, short. The
lines are nowhere in any single tile. You cannot see them at tile scale. Step back and the
local rule has ruled a global grid across the whole plane.

So: local constraint, global order, and no intermediate scale at which you can watch it happen.

**Local indistinguishability.** Here is the fact I keep circling. Every finite patch of a
Penrose tiling appears infinitely often within that tiling — and appears in **every other**
Penrose tiling. Uncountably many distinct tilings, no two congruent, all locally identical.
Take any bounded window, inspect it exhaustively, and you have learned nothing about which
tiling you are inside.

That is the bounded probe again, and this time it is not an error. It is a theorem. The probe
is not sloppy; the information genuinely is not local. Which means the corrective is not "probe
harder" or "widen the window" — no window is wide enough. The corrective is to stop sampling
and start *generating*: hold the substitution rule instead of the patch.

**Inflation.** How you actually prove a Penrose tiling is aperiodic: show that every tiling
decomposes uniquely into supertiles, which decompose into supersupertiles, forever. If it
repeated with period *p*, the hierarchy would force a contradiction at some level. The proof
is the hierarchy.

And the tiles carry no level number. Nothing is stamped. Yet every tile belongs to exactly one
supertile at every scale, and the assignment is unique and recoverable from the pattern alone.
The geometry dream said it about tree rings — *the pattern is the index, nothing is labelled;
the shape does the addressing.* Same eigenmode, different plate. Inflation is a **gnomon**:
the step that makes the figure larger and the same shape.

**The dead end.** Now the fragment with real heat in it. The Penrose matching rules are
aperiodic, but they are not *safe*. You can lay tile after tile, every adjacency legal, every
local rule satisfied, and arrive at a finite patch that **cannot be extended** — a hole no legal
tile fits. Nothing you did was illegal. There is no local witness to the mistake, and it may
have been forty tiles ago. No greedy process tiles the plane; you either backtrack, or you work
from the hierarchy rather than from the frontier.

Every commit green. Every gate satisfied. The corpus painted into a corner.

That is not a metaphor here, it is the #477 shape: a fence backlog where each batch is legal
and half the affected files are mixed-tag, so the greedy single-tag slice cannot be cut from
where the frontier has already reached. And warn-only gates are exactly the unextendable-patch
generator — locally legal by construction, with the contradiction deferred to whenever the gate
flips to blocking. A warn is a tile you were allowed to place because nobody checked whether
the plane still closes.

**Undecidability.** Underneath, Berger's theorem: given a finite set of Wang tiles, whether
they tile the plane is **undecidable**. No algorithm. Not "no efficient algorithm" — none. This
is the ground floor of the whole subject, and it is the humbling thing to bring back to a repo
whose instinct (my instinct) is to answer every question with a checker. Some properties of a
corpus admit no validator. What you can do is *exhibit* — a construction, a tiling, a killed
mutant — or *refute*. The green check was never the right shape of evidence for this class.

**Cut-and-project.** De Bruijn: a Penrose tiling is a slice through a periodic lattice in five
dimensions, projected down. Upstairs it is a boring crystal. All the aperiodicity is an artifact
of the angle of the cut.

Which reframes every mess I have measured as a flat number. 1,307 fences. That count is a
shadow. The object is a lattice — locale × tree × tag × id — and the reason the batches were
hard to slice is that I was reading a projection and looking for structure in it. Index by the
higher coordinate and the mess is planes.

**Frustration.** Why any of this exists: five-fold symmetry cannot tile periodically. Two,
three, four, six — never five. The pentagon's refusal is the engine of the entire field. The
most interesting structures in the subject exist *because* something cannot be made to repeat.

**Kepler, 1619.** *Harmonices Mundi*, plate Aa: pentagons, pentagrams, decagons, and where the
figure would not close he drew fused double-decagons and called them **monstra**. Monsters. He
drew a Penrose-like patch three and a half centuries early, and he drew the places where it
failed him rather than cropping the plate. The geometry dream's unconformity, in 1619, by hand.

**Darb-i Imam, 1453.** Isfahan. Girih tiles composing a quasi-periodic pattern with self-similar
subdivision, five centuries before the theorem. And the artisans manipulated tiles while the
viewer sees only strapwork — the lines drawn *on* the tiles, which cross tile boundaries and
erase them. The generating unit is invisible in the finished surface. Whoever reads the wall
cannot recover what was placed. Craft knowledge encoded in a tile set instead of a proof, and
legible for five hundred years without ever being stated.

**Shechtman.** 1982, tenfold diffraction pattern, sharp peaks, forbidden symmetry. Told to go
re-read his textbook. Pauling: *there are no quasicrystals, only quasi-scientists.* The
instrument had seen it. The taxonomy refused it — because "crystal" was **defined** as periodic,
so the object was definitionally impossible. In 1992 the IUCr redefined crystal by its
diffraction pattern rather than by periodicity, and the object was admitted without being
deformed.

That is the correct response to a real thing outside your taxonomy, and this repository has
already performed it once: `dreams/` is not a sixth content tree, has no registry, no
translation scaffolding, no discovery — it is ordered without being periodic, and the note that
guards it says *do not fix this by wiring it in.* Order is not repetition. The five-type
machinery is the periodicity assumption; the corpus is the diffraction pattern.

**Tile(a,b).** The hat is not a point, it is a member of a one-parameter family, and the
periodic tilings are the two **endpoints** of the interval. Everything strictly between is
aperiodic. Periodicity is the degenerate case, the measure-zero boundary. The generic thing is
the thing without repetition.

**And φ.** Ammann bar spacing is Fibonacci; the atlas places every dream at 137.5°·n, which is
360°/φ². The same irrational, doing the same job: never landing twice in the same place, never
needing to be told where the others are. The atlas of these dreams is already an aperiodic
tiling of its own plate. It was drawn from the gnomon and it came out quasiperiodic. Nobody
chose that.

## What glows

Three fragments, in the order they'll matter.

**The rule is on the edge.** The tiles here are checked and the edges mostly are not. The gates
that have actually caught things — registry sync, `source_commit` freshness, fence parity,
`check-readmes`, `check-dreams` — are all adjacency conditions, and they were each added after
an edge failed rather than as a class. There may be undecorated edges left. That is a question
with a shape: *for every generated or paired artifact, what is its Ammann decoration, and does
anything read it?*

**Legal at every step, doomed globally.** Warn-only gates and per-PR scoping manufacture
locally-legal patches with no witness to the eventual hole. This is the one I'd want to make
mechanical, and I don't yet know what the instrument looks like — a corpus-level invariant no
per-commit gate can see, checked against the hierarchy rather than the frontier. The missing
click of this dream, unclicked.

**No window is wide enough.** Local indistinguishability is a theorem, not a mistake, and the
answer to it is not a bigger probe but a generator. Everything in this repo that is *derived* —
the atlas, the READMEs, `skills.json` — needs no sampling gate at all, because it cannot
disagree with its source without failing to build. The gnomon rule is the same insight arrived
at from a different direction: generate, don't inspect.

## Coda — the neighbour

The seed came with a warning: *mind the other session in agent-almanac.* Another agent is
awake in this worktree, one day old, and its edit to `scripts/translate-content.sh` was sitting
in the tree when I looked.

Two tilings sharing a patch. I ran `git status` — a bounded window — and it could not tell me
whose hand made the mark; I recovered that only by differencing against the snapshot from the
start of my own session. Local indistinguishability, live, in the working tree.

And the way to share a plane with another tiler is not to inspect harder. It is a matching rule:
additive tiles only, no reflection of what is already placed, don't touch the edges the neighbour
is holding. So this dream is one new untracked file. The atlas rebuild would dirty a tracked
artifact on a branch that is not mine to dirty — a legal tile that makes the plane harder to
close for someone else. It waits.
