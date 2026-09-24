/**
 * Envelope for the generated-artifact inventory gate (#590) — does it go red, and on which class?
 *
 * The gate's whole claim is that `generated-artifacts.yml` cannot silently stop being true. That
 * is a claim about SEVERAL failure modes, not one, so testing a single mutation would prove the
 * gate fires without proving it covers what it advertises. Each case below is a different way the
 * inventory can rot.
 *
 * The gate here is `npm run check:generated-artifacts` — the command CI runs, not the inner
 * script. A mutation that dies against `node scripts/…` but survives the npm indirection is the
 * wiring failure this repo has shipped before.
 *
 * Result at introduction, 2026-08-26:
 *
 *     gate-envelope: 7 killed, 1 survived as documented of 8 case(s).
 *
 * The documented survivor pins the reverse sweep's stated blind spot as a MEASUREMENT rather
 * than a promise: the sweep keys on the GENERATOR'S FILE BASENAME — `build*`, `generate*`,
 * `update*` — so a generator whose FILENAME carries none of those is invisible to it and covered
 * only by the forward assertion.
 *
 * It said "npm scripts named …-prefixed" for one revision, which described the design before the
 * alias-to-filename change and was empirically false afterwards: a script named
 * `postprocess-thing2` running `scripts/build-thing2.js` IS swept. Round 2 of the review caught
 * it — documentation of the control diverging from the control, in the PR that fixed exactly
 * that one layer down.
 * `generated-artifacts.yml`'s header says so; this row is the proof, and the day it starts being
 * killed the sweep has widened and the header needs updating.
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/generated-artifacts.mjs
 */

export const gate = { command: ['npm', 'run', 'check:generated-artifacts'] };

export const cases = [
  {
    label: 'REVERSE: a new generator behind an npm script named build*',
    // The property #590 asks for in its own words — "a table nobody can add a row to without
    // naming a reader". Someone adds a generator and forgets the inventory.
    file: 'package.json',
    find: '    "build-dreams": "node scripts/build-dreams.js",',
    replace: '    "build-dreams": "node scripts/build-dreams.js",\n'
      + '    "build-unlisted-thing": "node scripts/build-unlisted-thing.js",',
    expect: 'scripts/build-unlisted-thing.js',
  },
  {
    label: 'REVERSE: a new generator invoked only from viz/build.sh',
    // Source 2 of the sweep, and the reason it exists. viz/package.json has NO script for
    // build-wordmark.R or build-terminal-glyphs.js, so an npm-script-only sweep would miss two
    // real generators — one of which feeds cli/lib/glyph-data.json, which ships to npm. Deleting
    // source 2 must therefore be caught, and this row is what catches it.
    file: 'viz/build.sh',
    find: 'node build-terminal-glyphs.js',
    replace: 'node build-terminal-glyphs.js\nnode build-unlisted-viz-thing.js',
    expect: 'viz/build-unlisted-viz-thing.js',
  },
  {
    label: 'FORWARD: an artifact path that no longer matches anything tracked',
    // The artifact moved or was deleted and the row still claims it. Silent otherwise: nothing
    // else in the repo reads this file's paths.
    file: 'generated-artifacts.yml',
    find: '    paths: [dreams/atlas.html]',
    replace: '    paths: [dreams/atlas-renamed.html]',
    expect: 'matches no tracked file',
  },
  {
    label: 'FORWARD: a named generator that does not exist',
    file: 'generated-artifacts.yml',
    find: '    generator: scripts/build-dreams.js',
    replace: '    generator: scripts/build-dreams-renamed.js',
    expect: 'does not exist',
  },
  {
    label: 'FORWARD: a row naming a gate command nothing runs',
    // Renames the command IN THE INVENTORY. An earlier label called this "its workflow no longer
    // runs", which overstated what the mutation shows — it never touches a workflow. The case
    // below is the one that does.
    file: 'generated-artifacts.yml',
    find: '      command: npm run check-dreams',
    replace: '      command: npm run check-dreams-renamed',
    expect: 'does not appear in',
  },
  {
    label: 'FORWARD: the gate is UNWIRED FROM CI, and comments about it survive',
    // The review's F3, reproduced before it was fixed. The forward check asks whether the gate's
    // command appears in the file that runs it, and `#`-prefixed lines used to count. Deleting
    // the real step from deploy-pages.yml left THREE comment mentions of `build-data` behind,
    // and the check stayed green over an unwired gate — this repo's own "prove the wiring, not
    // the component" rule, failed. Comments are stripped before the haystack test now.
    //
    // This is also why `where:` points at the WORKFLOW rather than package.json: a package.json
    // needle proves the npm alias exists and says nothing about whether CI invokes it.
    file: '.github/workflows/deploy-pages.yml',
    find: '      - name: Generate viz data from registries\n'
      + '        working-directory: viz\n'
      + '        run: npm run build-data\n',
    replace: '',
    expect: 'outside of comments',
  },
  // NOT AN ENVELOPE CASE: "an exemption must not swallow a different generator by containment".
  //
  // The property is only observable when a generator is simultaneously DISCOVERED, UNLISTED and
  // falsely exempted — two edits, in two distant regions of the file, where an envelope case is
  // one find/replace on one file. Written as one anyway, it SURVIVED: adding a harmless
  // exemption is correctly a no-op, so the case asserted nothing. It indicted the fixture, not
  // the gate.
  //
  // It lives in `scripts/test/generated-artifacts.test.js`, which builds its fixture from
  // scratch and can arrange all three conditions at once — with COLLIDING paths, which the
  // original test's `gen/scratch.js` vs `gen/other.js` did not have, and which is why that test
  // could not catch the bug it claimed to cover.
  {
    label: 'FORWARD: an unread edge that does not say what being unread costs',
    // `gate.kind: none` is a legitimate answer — #590 says "the decision not to have one is
    // recorded with its reason". This makes the reason mandatory rather than customary, so a row
    // cannot be downgraded to unread by deleting one line.
    file: 'generated-artifacts.yml',
    find: '    ships_to_npm: true\n    unread_edge:',
    replace: '    ships_to_npm: true\n    unread_edge_removed:',
    expect: 'no `unread_edge` explains',
  },
  {
    label: 'DOCUMENTED LIMIT: a generator whose FILENAME carries none of the three prefixes',
    // Survivor by construction, and the honest boundary of the design. The sweep keys on the
    // generator's FILE BASENAME, so `postprocess-thing.js` is invisible to it however the script
    // that runs it is named. Note both halves of this fixture are unprefixed on purpose: the
    // ALIAS being unprefixed is no longer what makes it survive, and a fixture that relied on
    // that would have kept surviving for a reason that had stopped being true.
    //
    // Stated in generated-artifacts.yml's header as the `token: none` analogue; this row makes
    // it a measured fact. If it ever starts being killed, the sweep widened — update the header,
    // do not delete the case.
    file: 'package.json',
    find: '    "build-dreams": "node scripts/build-dreams.js",',
    replace: '    "build-dreams": "node scripts/build-dreams.js",\n'
      + '    "postprocess-thing": "node scripts/postprocess-thing.js",',
    expect: null,
    why: "the reverse sweep keys on the GENERATOR'S FILE BASENAME; `postprocess-thing.js` "
      + 'carries none of the three prefixes, so it is covered only by the forward assertion, '
      + 'exactly as debt-ratchet.yml marks `token: none`.',
  },
];
