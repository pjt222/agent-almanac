/**
 * Envelope for `scripts/check-workflow-generator-inputs.js` (#618).
 *
 *   node scripts/gate-envelope.js --spec scripts/envelopes/generator-inputs.mjs
 *
 * #618's second acceptance criterion is "breaking it (remove one path) makes CI go red —
 * verified, not assumed", which is what case 1 measures. The other three exist because the
 * ways this check could be USELESS are more interesting than the way it is meant to work:
 *
 *   - it could fail to notice a NEW import, which is the actual regression (four of the five
 *     historical omissions were a new module, not a deleted path);
 *   - it could fold an unparseable filter into "nothing missing", the vacuous pass this repo
 *     keeps rediscovering;
 *   - it could stop resolving `npm run` and quietly walk one entry point instead of three.
 *
 * The last two are the reason the check errors rather than returning an empty set: an empty
 * graph and an empty missing-list are indistinguishable in the summary line.
 */

export const gate = { command: ['node', 'scripts/check-workflow-generator-inputs.js'] };

export const cases = [
  {
    // #618 AC2, literally.
    label: 'a listed generator input is removed from paths:',
    file: '.github/workflows/update-readmes.yml',
    find: "      - 'scripts/lib/fences.js'\n",
    replace: '',
    expect: 'scripts/lib/fences.js is imported by this workflow',
  },
  {
    // THE REAL REGRESSION SHAPE. Four of the five historical omissions were a module that
    // became reachable, not a path someone deleted — so a check that only notices deletions
    // would have caught none of them. `i18n-targets.js` is a real repo module that this graph
    // does not currently reach, which makes it a faithful stand-in for tomorrow's new import.
    label: 'a generator gains an import that nobody listed',
    file: 'scripts/generate-readmes.js',
    find: "import { CONTENT_TYPES } from './lib/content-types.js';",
    replace: "import { CONTENT_TYPES } from './lib/content-types.js';\nimport { NESTED_TREES } from './lib/i18n-targets.js';",
    expect: 'scripts/lib/i18n-targets.js is imported by this workflow',
  },
  {
    // The vacuous pass. With the filter unparseable the reachable set is still computed and
    // still non-empty, so a naive implementation reports "0 unlisted" and exits 0 — a green
    // run over a workflow whose triggers it never read. The check refuses instead, and the
    // expect names the refusal rather than any missing module.
    label: 'the paths: filter becomes unparseable',
    file: '.github/workflows/update-readmes.yml',
    find: '  push:\n    branches: [main]\n    paths:',
    replace: '  push:\n    branches: [main]\n    pathz:',
    expect: 'no push paths: entries parsed',
  },
  {
    // The other silent-shrink direction: `npm run translation:status` is how
    // generate-translation-status.js enters the graph, and with it unresolvable the walk
    // covers only generate-readmes.js. Nothing would be reported missing, because everything
    // still reachable is listed — a green run over a third of the graph.
    label: 'an npm run step stops resolving to its script',
    file: 'package.json',
    find: '"translation:status": "node scripts/generate-translation-status.js"',
    replace: '"translation:status": "echo skipped"',
    // Not a missing-module message. With that entry point gone the remaining graph is fully
    // listed, so a check that merely skipped what it could not parse would report `0 unlisted`
    // over a third of the job. What fires instead is the refusal to skip: an unrecognised
    // `run:` command is an error unless it is on the explicit NON_ENTRY_COMMANDS list.
    //
    // This case was `expect: null` in its first writing, with a paragraph explaining why the
    // hole was acceptable. Writing that paragraph is what made it obvious the hole was
    // cheaper to close than to document.
    expect: 'could not be resolved to a script or recognised as a non-entry',
  },
];
