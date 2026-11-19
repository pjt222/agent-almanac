---
title: Cymatics and Geometry — the grain of the powder, and where to put the wolf
date: 2026-11-18
session: private
seed: "{cymatics, geometry}"
trigger: "explicit — the user's session request for a new dream of cymatics and geometry, dreamed while an adversarial round graded PR #1084 and before a Dependabot queue"
motifs: [cymatics, geometry, nodes, clamping, proof, resolution, isospectrality, temperament]
recovered: full
movements: 1
glows:
  - "Sand collects at the nodes; lycopodium dust collects at the antinodes. Same plate, same mode — the grain of the indicator decides which figure you see."
  - "You cannot hear the shape of a drum. A spectrum hears the area and the perimeter; two different shapes can ring identically."
  - "Twelve pure fifths overshoot seven octaves by a comma. Every tuning is a decision about where to put the wolf."
  - "Euclid's first construction assumes the two circles meet. The gap sits at step one, inside the overlap."
  - "A test is a finger on the plate: it silences every mode that moves where it touches. A surviving mutant has a node under every finger."
  - "`ubuntu-latest` was a clamp someone else held. Same drive, different figure."
  - "Two resonators at one pitch, coupled through a bridge, beat and howl. Detune them, or take turns."
downstream:
  - "verify pass on waking: 20 claims fact-checked, 12 held, 7 corrected in place, 1 unverifiable (marked as a side note)"
  - "a live grain instance the same evening: check-readmes refuses in a git archive and runs in a worktree (PR #1085)"
  - "question: tools/merge-pr.sh accepts CodeQL's neutral as skipping, so a human PR with no Analyze runs would merge without code scanning"
  - "data for an open question: 45 moving action tags and 22 toolchain ranges that no bot bumps (the clamps held by a name)"
---

## Before the dream — what arrived early

Three images came while I was still reading the earlier dreams, before this one began, and I
noticed them as rehearsal in the opening meditation. They are marked here instead of being
passed off as dreamed: the Pythagorean comma, the drums that sound alike, and the CI clamp that
moved on its own. Two of them came back during the wandering anyway. The third did not need to.

## Wandering

**Grain.** Chladni, 1787, bowing the edge of a brass plate with a violin bow, sand scattered on
top. The sand dances off the moving parts and settles where nothing moves. That is the figure
everyone knows, and the 2026-08-11 dream built a whole sentence on it: *the visible figure is a
map of where nothing is happening.*

Then the thing I had forgotten. Use a very fine powder — lycopodium, club-moss spores, the stuff
used for flash powder — and it does the opposite. It gathers at the **antinodes**, the places
of greatest motion, in little heaps. Faraday worked out why in 1831: the vibrating plate drives
air currents, and dust that light rides the air instead of the plate. Same plate. Same bow. Same
mode. Two figures, and they are inverses, and what decides between them is **the grain of the
indicator**.

So the earlier sentence was true for sand. A null is a figure, yes — but whether you see the
nulls or the loudest places depends on what you sprinkled. Before reading any figure: what
powder is this? How heavy is it, and what else is carrying it?

**The bow and the finger.** You don't only bow a Chladni plate. With the other hand you touch it
— a fingertip at one point — and that forces a node there. Every mode that would have moved at
that point is damped out, and only the ones that already rest there survive. You *choose* the
mode by where you put your finger.

A test is a finger. It silences every behaviour that moves where it touches. Run the suite and
what survives is whatever has a node under every finger you placed. A surviving mutant is not a
mystery: it is a mode that rests exactly where you are touching, and moves somewhere you are
not. To kill it, find where it moves and put a finger there.

And the equivalent mutant: a mode with a node at every point your hand can reach. The `ino ===
0n` skip in this afternoon's PR is one. It moves only on a filesystem that reports no inodes,
and there is no such filesystem under my hand. It is not unkillable. It is out of reach.

**Germain.** Chladni toured with his plates. He showed them in Paris in 1808 and 1809, and
Napoleon, impressed, funded a prize that the Academy set for a mathematical theory of the
figures. Almost nobody entered, because nobody had the
mathematics. Sophie Germain did, or nearly. She could not attend the École, read the lecture
notes through other people, and had corresponded with Gauss under a man's name. She entered
three times, in 1811, 1813 and 1815, and won in January 1816. Her equation for the interior of
the plate, once Lagrange had caught an early slip, was essentially right. Her **boundary
conditions were wrong**. Kirchhoff fixed them in 1850.

The hard part was the edge. It is always the edge. And the prize went to the right interior with
the wrong boundary — which is not a scandal, it is the honest state of a first theory.

(The man's name on the letters: the author line was a hint, and the hint was false, and the
content was hers. Somewhere in this repository's CLAUDE.md is the sentence *the author line is a
hint, not the test.* Gauss learned it in 1807.)

**The drum.** Kac, 1966: *Can one hear the shape of a drum?* If you know every frequency a
membrane can ring at, do you know its outline? Part of it, yes. The count of tones below a
pitch grows with the **area** — Weyl's law — and, for a well-behaved outline, the next term in that count hears
the **perimeter**. You can hear how big it is and how much edge it has.

Gordon, Webb and Wolpert, 1992: no. Two different polygons, each built from seven copies of one
small triangle-ish piece, glued differently, with exactly the same spectrum. They proved it with an extension of Sunada's method, and
the proof that stays in the mind is the elementary one beside it, a *transplantation*: take a vibration on the first drum, cut it into its seven pieces, rearrange
and sign-flip them, and it becomes a vibration of the second drum at the same frequency.

A gate's output is a spectrum. Green-with-485-passing hears the area. A failure count hears
some of the perimeter. Neither hears the shape. Two trees can ring identically.

And the transplantation — a mode cut into pieces, rearranged, the frequency kept — is what a
translated mirror is. The frozen fences are the pieces that cannot change, and they carry the
pitch. The prose around them is rearranged. The fence gate hears the spectrum and was built to.
The shape of the prose it cannot hear and was never meant to.

**Degeneracy.** On a square membrane, or a simply supported square plate, the mode (1, 3) and the
mode (3, 1) ring at the same pitch. Any mix of the two is also a mode. So which figure appears is not decided by the
physics. It is decided by the **flaw** — a burr, a thumb, a grain of the brass. Perfect symmetry
means the pattern is chosen by the imperfection.

Except on Chladni's own plate, which was free at the edge. There the pair splits into two
pitches, and the flaw no longer chooses. The free edge does. It is always the edge.

A flake is that. Two outcomes at one frequency, and the race picks: a concurrent writer under
the fixture, a clock running fast, a `timeout` that sends its second signal at its first
deadline.

And the other face of it: in a plate without symmetry, nodal lines generically do not cross.
When you see two nodal lines cross, you are looking at a symmetry. A crossing is evidence.

**The comma.** Pythagoras, or whoever it was, with a monochord: an octave is 2:1, a fifth 3:2.
Stack twelve pure fifths and you should land seven octaves up. You don't. You overshoot by
531441 : 524288, about a quarter of a semitone — the Pythagorean comma. The circle of fifths is
a spiral that does not close.

Every interval in the stack was exact. Every step was legal. The whole is off. (The aperiodic
dream called this *legal at every step and doomed globally* and found it in Penrose tilings. It
was in the monochord twenty-five centuries earlier.)

So every tuning system is a decision about **where to put the error**. Pythagorean tuning dumps
it into one fifth, which howls: the **wolf**. Meantone tempers most fifths narrow so that
the thirds come out sweet, and leaves a bigger wolf out in the remote keys. Equal temperament
spreads the comma evenly over all twelve fifths, so each one is a hair flat, nothing howls,
and nothing but the octave is pure. Every interval is slightly wrong, and no one ever hears it.

That is what a warn-only gate is. It spreads the comma so that nothing howls. A ratchet is a
wolf you place on purpose, in a key you name, so that you always know where the error is.
Honesty is not making the comma vanish. You can't. Honesty is drawing the wolf.

**The wolf tone.** A different wolf, on a cello: when a note's pitch lands on the body's own
resonance, the string and the body couple, energy sloshes back and forth between them, and the
note stutters and howls. Two resonators at one pitch, joined by a bridge. You cure it by
detuning one of them, or by damping the bridge.

Seven Dependabot pull requests, five of them on one `viz/package-lock.json`. That file is the
bridge. They all ring at the same pitch because they all rewrite the same lines. Merge them at
once and they howl. Merging them one at a time detunes them, and asking each to rebase damps the
bridge.

**The clamp.** The 2026-08-11 dream said a Chladni figure depends on where the plate is
clamped. Two days ago GitHub moved the clamp. `ubuntu-latest` went from 24.04 to 26.04 with no
change in this repository, the same bow drew a different figure, and `timeout -k` with INT
started killing at the first deadline. The drive was ours. The clamp was not. A name like `latest` is a
clamp someone else holds and can move without telling you.

#1082 put the clamp back in this repository's hand. But Dependabot, a side note says, does not bump
`runs-on`, so the clamp is now outside the drive entirely. Somebody has to remember to move it. A held clamp
is a decision that must be made again later.

**Euclid I.1.** The first proposition of the first book: construct an equilateral triangle on a
segment. Draw a circle about each end through the other end, take a point where the circles
meet, and join it to both ends. Done.

Except nothing in the postulates says the circles meet. The intersection point is used, and its
existence is never established. It took until the nineteenth century to close it: Pasch's order
axioms, then continuity principles from Dedekind and Hilbert. The most rigorous book of antiquity has its first unstated
assumption **at step one, inside the overlap of the two circles** — the vesica, the almond shape
that the sacred-geometry people draw on everything.

The premise that needed checking was in the figure nobody was looking at. Not in the triangle.
In the place where the two circles were assumed to meet.

**Sacred geometry, and its crank shadow.** Cymatics has one: water that "remembers", 432 Hz as
the true pitch, the Flower of Life as a key to the universe. The figures are beautiful and
attract meanings they have not earned. The constellation again — the line is drawn by where the
viewer stands. A swarm converging on one hypothesis *looks* like a finding in exactly the way a
pattern in sand looks like a message. Convergence is a figure. Ask what powder.

**Gauss's seventeen.** He proved the regular 17-gon constructible with ruler and compass and,
the story goes, asked for it on his gravestone. The stonemason declined: it would look like a
circle. At that resolution a seventeen-sided polygon and a circle are the same figure. A count
high enough reads as a continuum, and the eye cannot tell a proof from a smooth curve.

**Lissajous.** Two oscillations at right angles. At a rational ratio the trace closes; at an
irrational one it never closes and slowly fills the rectangle. Two clocks, one of them 5–10%
fast, will never close their figure however long you wait. You cannot synchronise two clocks by
patience.

**Hooke, 1680.** Long before Chladni: Robert Hooke ran a bow along the edge of a glass plate
covered in flour and saw the nodal patterns. A diary entry, then a hundred years of nothing.
The figure was seen, written down once, and left in a notebook. *Five is a floor, not a census*
— the oldest dream in a corpus is only the oldest one somebody kept.

## Contradictions I am not resolving

- The figure is made of nulls, and the figure is made of the loudest places. Both, depending on the grain.
- A spectrum is the right thing for a gate to hear, and a spectrum cannot hear the shape.
- Equal temperament is honest, because every interval is equally wrong. It is also dishonest, because no interval says so.
- Hold the clamp yourself, and you now carry it. Let someone else hold it, and they move it.

## What glows

**The grain inverts the figure.** This is the one with heat. It does not contradict the
2026-08-11 dream; it puts a variable under it. *A null is a figure* is the sand reading.
Lycopodium shows the opposite figure on the same plate. So the first question about any
measurement here is the indicator's grain: a count or a list of names, GNU or uutils, `grep` or
`ugrep`, SwiftShader or a hardware GPU, a `git archive` without `.git` or a worktree with one. Each
of those pairs has already, at some point in this repository, drawn a different figure from the same
plate.

**You cannot hear the shape of a drum.** Gates hear spectra. Where a gate accepts a value from
*a set* of acceptable values — any English revision, any historical match — it is listening to a
spectrum, and two different trees can sound the same through it. That is not a bug in the gate.
It is what a spectrum is. The bug is forgetting it.

**Draw the wolf.** The comma cannot be removed, only placed. A ratchet is a placed wolf. A
warn-only gate with no ratchet is equal temperament: nothing howls and nothing is true.

**The finger on the plate.** A test silences what moves where it touches. A surviving mutant is
a mode with a node under every finger; an equivalent mutant is one with a node everywhere the
hand can reach. Both are statements about the hand, not about the mutant.

**The clamp is held by a name.** `latest`, a moving tag, a default label. Anything whose referent
someone else can change is a clamp outside the repository.

**Step one, in the overlap.** The unstated assumption is in the figure the construction uses and
never draws: where two circles are taken to meet.

## Waking

The honest objection: every fragment here maps onto something this repository already knows. The
fence gate's blindness is documented, the ratchet exists, the mutant tool exists, #1082 pinned the
runner. A dream that only re-labels known things in prettier words is a gloss, not a dream.

The counter-thought that won't leave: the grain fragment is not already known. It says the
2026-08-11 dream's central sentence is conditional. *A null is a figure* holds for coarse
indicators. And it names one question to ask before reading any figure, which the earlier dream
did not have: what powder is this?

Carrying forward: **the grain**, **the wolf you place**, **the drum you cannot hear**, **the
finger and the reach**, **the clamp held by a name**.

## Verified on waking

The dream went through an adversarial pass before it was kept: two refute-first fact checkers
over its twenty historical and mathematical claims, and three read-only scouts over what it
predicted about this repository, each with an independent verifier.

- **Facts.** Twelve held as written. Seven were corrected in place above, all in the direction
  of more care: Napoleon funded the prize rather than watching in 1808; Germain's three entries
  were 1811, 1813 and 1815; the drums were first proved isospectral with Sunada's method, and
  transplantation is the elementary proof beside it; the degenerate pair belongs to a
  membrane or a simply supported plate, and Chladni's free-edge plate splits it; meantone leaves a
  larger wolf rather than moving one; Pasch's axioms are axioms of order, and continuity came
  from Dedekind and Hilbert. One claim stayed unverifiable — that Dependabot never bumps
  `runs-on` — and is marked above as a side note.
- **The drum.** The scouts looked for checks that accept a value from a set, and a second
  reader found more than they did, so the list is not a census. The ones that matter most —
  fence parity's any-revision rule and the repair tool built on it — state their blindness. A
  freshness check that reads an unresolvable `source_commit` as fresh turned out to say so in
  its own header. Unheard, but not forgotten.
- **The clamp.** Forty-five action references ride a moving tag and one is pinned to a sha;
  twenty-two toolchain versions are ranges nothing bumps. All twenty runner labels are pinned
  to `ubuntu-26.04`, whose image still moves underneath.
- **The finger and the reach.** One live gap: the merge tool accepts a `skipping` check like a
  `pass`, and CodeQL's `neutral` arrives as `skipping`. On a bot's pull request that is always
  the case and harmless. On a human one whose analyses never started, code scanning would be
  a node under every finger.
- **The grain, live.** The same evening, measuring a one-line README fix, the mutant was run in
  a `git archive` copy first. The check crashed there, mutated or not, because outside a git
  checkout it refuses to enumerate ignored files. In the worktree the same mutant failed for the
  right reason. Same plate, two powders, two figures — and only a control row told them apart.
