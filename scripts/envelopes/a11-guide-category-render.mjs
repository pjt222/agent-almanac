/**
 * Envelope for integrity checks A11 and A12 — guide category render coverage (#644).
 *
 * A11 exists because `check-readmes` cannot own this assertion. That gate regenerates with the
 * generator's own category ordering and diffs the result against the file, so generator and
 * check agreed perfectly about a category neither rendered: the `investigation` guide was
 * absent from every generated index while `npm run check-readmes` exited 0. A gate that
 * consults the same source as its subject measures nothing.
 *
 * So A11 compares the OTHER side — the registry's guide entries — against the rendered
 * `guides/README.md`. This is the committed record of which of that claim actually fires:
 *
 *   npm run gate-envelope -- --spec scripts/envelopes/a11-guide-category-render.mjs
 *
 * Result on the first run, 2026-08-18, against A11's first version:
 *
 *     gate-envelope: 3 killed, 1 survived as documented of 5 case(s).
 *     [WRONG-RED] the A11 extraction pattern drifts and matches nothing
 *
 * That row was a real defect in A11, not a mis-specified case, and it is the reason the
 * third case exists. Under `set -euo pipefail` the bare `a11_cats=$(grep ... | ...)`
 * assignment aborted the whole script the moment grep matched nothing: red, but with no
 * diagnostic, with A11's zero-check dead, and with A12 and all of categories B and C never
 * reached. A `|| true` on the extraction fixed it. Re-measured after that fix:
 *
 *     gate-envelope: 4 killed, 1 survived as documented of 5 case(s).
 *
 * An adversarial review then found three further routes to #644's exact symptom — a guide in
 * no generated index with every gate green — that the five cases above could not see. Each
 * was reproduced by hand, then fixed, and cases 6-9 are those reproductions. The nine-case run
 * reported:
 *
 *     gate-envelope: 7 killed, 1 survived as documented, 1 inconclusive/invalid of 9 case(s).
 *     [WRONG-RED] total_guides drifts from the guides on disk
 *
 * — because round 2 renamed A12's message field and case 4's `expect` still named the old one.
 * The gate was red and correct throughout; only the expectation was stale. After updating it,
 * re-run with `--only 'total_guides drifts'`:
 *
 *     [KILLED]   total_guides drifts from the guides on disk
 *                FAIL: guides disk=35 total_guides=36
 *
 * Recorded as two runs rather than restated as one clean nine, because the WRONG-RED is the
 * useful part: a case asserting only "the gate went red" would have passed and told nobody the
 * message had moved.
 *
 * A verification pass then found that A12's own two extractions carried no `|| true` (round 1
 * lines copied from A4/A5), and that the co-deletion route — a whole entry removed, every count
 * still agreeing — was guarded by the path set alone and tested in one direction only. Case 5
 * is that missing direction. Full run after both fixes:
 *
 *     gate-envelope: 9 killed, 1 survived as documented of 10 case(s).
 *
 * Note the first case. It is not a synthetic break — it restores `guides/README.md` to the
 * state `main` was in before this PR, up to one trailing newline (the `find` below opens with
 * a newline and takes the second of the two blank-line bytes; measured delta is 1 byte). That
 * is what makes it evidence A11 would have caught #644, rather than merely that A11 can go red.
 *
 * ROT WARNING: cases below hardcode `total_guides: 35` and the full text of the investigation
 * entry. Adding a guide changes both, and the runner will report INCONCLUSIVE rather than
 * mutate the wrong site — correct, but silent until someone runs this, since the envelope is
 * deliberately not in CI. Update the literals in the same commit that adds a guide.
 *
 * The `expect: null` case at the end pins A11's scope boundary as a measurement rather than
 * a prose claim: A11 is a CATEGORY-level assertion and does not notice a single guide missing
 * from a rendered category. That case is genuinely covered — by `check-readmes`, which
 * regenerates the file — and this envelope's gate is `validate-integrity.sh`, so it correctly
 * reports green here. If it ever starts being killed, A11's scope grew and this comment is
 * the thing that went stale.
 */

export const gate = { command: ['bash', 'scripts/validate-integrity.sh'] };

export const cases = [
  {
    // The #644 defect itself, restored up to one trailing newline (see the header): the
    // section the four-category literal omitted. The registry still declares and uses
    // `investigation`; the index no longer renders it. This is the state every gate passed on.
    label: 'the pre-#644 state — the investigation section absent from the rendered index',
    file: 'guides/README.md',
    find: `
## Investigation

*Methodology guides for legitimate research, audit, and reverse-engineering of integration surfaces*

### [Reverse-Engineering a CLI Harness](reverse-engineering-a-cli-harness.md)
Five-phase methodology for legitimate integration research against a closed-source CLI harness — baseline, flag discovery, dark-launch detection, wire capture, redaction discipline.`,
    replace: '',
    expect: "guide category 'investigation' has no '## Investigation' heading",
  },
  {
    // The likelier drift than #644, and the reason A11 reads the guides' own `category:`
    // fields rather than the `categories:` block keys: a value no category block declares
    // still renders (the helper appends it), so the index and the registry disagree about a
    // heading name. A block-keyed rule would not see this at all.
    label: "a guide's category is typo'd, so it renders under a heading nothing declares",
    file: 'guides/_registry.yml',
    find: '    category: investigation',
    replace: '    category: investigatoin',
    expect: "guide category 'investigatoin' has no '## Investigatoin' heading",
  },
  {
    // The vacuous pass this check exists to prevent. A drifted extraction pattern yields an
    // empty category list, and an empty list satisfies a for-loop trivially — every category
    // would go unchecked while the run stayed green. A11 reports FAIL on zero instead.
    label: 'the A11 extraction pattern drifts and matches nothing',
    file: 'scripts/validate-integrity.sh',
    find: "grep -E '^    category: ' guides/_registry.yml",
    replace: "grep -E '^    categoree: ' guides/_registry.yml",
    expect: 'A11 extracted 0 guide categories',
  },
  {
    // A12: the total no validator compared to disk before #644. `total_skills` is checked by
    // validate-skills.yml, agents and teams by A4/A5, guides by nothing.
    // The `expect` names A12's message verbatim, and that is the point of naming it: round 2
    // renamed the field from `registry=` to `total_guides=` (A12 now checks two things, so
    // "registry" had become ambiguous) and this case reported WRONG-RED until it was updated.
    // The gate was red and correct throughout — only the expectation was stale. A case that
    // asserted merely "went red" would have passed and told nobody the message had moved.
    label: 'total_guides drifts from the guides on disk',
    file: 'guides/_registry.yml',
    find: 'total_guides: 35',
    replace: 'total_guides: 36',
    expect: 'guides disk=35 total_guides=36',
  },
  {
    // The co-deletion class, and the reason it earns its own case: when a WHOLE entry goes,
    // the `- id:` line and the `category:` line vanish together, so A11a's two counts fall to
    // 34 in lockstep and stay equal. `total_guides` and the disk count are both untouched at
    // 35. Measured on this exact mutation: A11a green, count green, and the path set is the
    // ONLY red left standing. It is therefore the sole control over this route, and until now
    // the only direction it was tested in was the other one -- case 9 points a path at nothing,
    // while this points nothing at a file. A control that survives alone is a control nobody
    // has checked.
    label: 'a whole registry entry deleted — every count still agrees, only the path set differs',
    file: 'guides/_registry.yml',
    find: `  - id: reverse-engineering-a-cli-harness
    path: guides/reverse-engineering-a-cli-harness.md
    title: "Reverse-Engineering a CLI Harness"
    description: "Five-phase methodology for legitimate integration research against a closed-source CLI harness — baseline, flag discovery, dark-launch detection, wire capture, redaction discipline"
    category: investigation
    agents: [security-analyst, code-reviewer]
    teams: []
    skills: [audit-dependency-versions, security-audit-codebase]
`,
    replace: '',
    expect: 'path set differs from guides/*.md on disk',
  },
  {
    // A11a. The review's sharpest finding: an entry whose category is unusable drops the
    // guide from BOTH indexes while every surviving category still renders, so a check on
    // DISTINCT values finds nothing wrong. Reproduced by hand before the fix — the guide
    // vanished from both files and the first version of A11 stayed green. The deleted-line
    // and bare-`category:` variants take the same route and the same count check catches them.
    label: 'a guide entry whose category is empty — invisible in both indexes, no value to check',
    file: 'guides/_registry.yml',
    find: '    category: investigation',
    replace: '    category: ""',
    expect: "usable 'category:' value(s)",
  },
  {
    // A11b. The laundered state: the category renders correctly everywhere, but nothing
    // declares it. Reached in practice by typo'ing a category and then following A11c's own
    // remediation advice — measured, `npm run update-readmes` renders `## Investigatoin` with
    // `*investigatoin*` as its description and turns every gate green. Mutating the block
    // rather than the guide reaches that end state in one file, which is what the runner does.
    label: 'a used category is not declared in the categories block',
    file: 'guides/_registry.yml',
    find: `  investigation:
    description: Methodology guides for legitimate research, audit, and reverse-engineering of integration surfaces
`,
    replace: '',
    expect: "is not declared in the 'categories:' block",
  },
  {
    // A11c, the README.md half. The two generators share their ORDER and nothing else — the
    // loop, the empty-skip and the rendering are separately duplicated. Measured: reverting
    // `generateGuidesSection` alone to the old literal drops the guide from README.md while
    // guides/README.md keeps it, and `check-readmes` and the old A11 both stay green. This
    // case mutates the rendered file directly, because the runner does find/replace and never
    // regenerates. Note the different markup: `**Label**` here, `## Label` in guides/README.md.
    label: 'the investigation block absent from the ROOT README index',
    file: 'README.md',
    find: `
**Investigation**

- [Reverse-Engineering a CLI Harness](guides/reverse-engineering-a-cli-harness.md) — Five-phase methodology for legitimate integration research against a closed-source CLI harness — baseline, flag discovery, dark-launch detection, wire capture, redaction discipline`,
    replace: '',
    expect: "has no '**Investigation**' line in README.md",
  },
  {
    // A12's path set. The count alone inherits A4/A5's blindness — a guide file on disk with
    // `total_guides` bumped and no registry entry keeps both numbers equal and is in no index.
    // A path pointing nowhere is the same disagreement in the reachable-by-find/replace form.
    label: 'a registry path that no file on disk backs',
    file: 'guides/_registry.yml',
    find: '    path: guides/reverse-engineering-a-cli-harness.md',
    replace: '    path: guides/does-not-exist.md',
    expect: 'path set differs from guides/*.md on disk',
  },
  {
    // A11's scope boundary, measured. The guide's category heading survives, so A11 is
    // satisfied and SHOULD be: it asserts that every category reaches the index, not that
    // every guide does. `check-readmes` owns the per-guide claim and does catch this — it is
    // simply a different gate than the one this envelope runs.
    label: 'a single guide dropped from a category that still has other guides',
    file: 'guides/README.md',
    find: `### [Agent Memory Hygiene](agent-memory-hygiene.md)
Three-layer model — weights, retrieval, behavior — for diagnosing what kind of forgetting a memory problem actually needs and applying the right tool.`,
    replace: '',
    expect: null,
    why: 'A11 is category-level by design; the per-guide claim belongs to check-readmes, which regenerates the file.',
  },
];
