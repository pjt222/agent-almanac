/**
 * parse-args.js — one default-deny CLI parser for the scripts in this repo (#619).
 *
 * Extracted from `normalize-i18n-fences.js`, which grew it the expensive way. The version it
 * replaced there used `indexOf('--locale')`, which does not match the ordinary GNU spelling
 * `--locale=de`: the scoping silently vanished, and a run narrowed to one locale covered all
 * ten. With `--write` that was **281 files rewritten where 63 were asked for** — a stray broad
 * write reached through a natural spelling of a correct command.
 *
 * That is the whole design brief. Two rules follow from it, and neither is negotiable:
 *
 *   BOTH SPELLINGS. `--flag value` and `--flag=value` mean the same thing, because a caller who
 *   types the other one is not making a mistake and must not be silently ignored.
 *
 *   DEFAULT-DENY. An argument the table does not name is an error. A mistyped `--verdicts` that
 *   parses as "flag absent" produced a run that wrote ten files, printed no verdict list, and
 *   exited 0 — after which the reader concluded there were no stubs to review and started a bulk
 *   delete.
 *
 * ## Why extracted rather than copied again
 *
 * `generate-translation-status.js` had a hand-rolled accept-list that took only the
 * space-separated form and answered `--root=/tmp/x` with `unknown argument(s): --root=/tmp/x` —
 * naming `--root` as known on the very line that rejected it. Writing a third copy of a parser
 * whose second copy already disagreed with the first is the defect class #587 and #623 name in
 * this same directory.
 *
 * ## Still on their own parsers
 *
 * An adversarial review found this inventory incomplete on its first writing, which is the exact
 * failure mode the inventory exists to prevent — so it now names every one, and says what each
 * gets wrong rather than only that it differs.
 *
 *   check-yaml-fences.js                  accepts both spellings, but its `startsWith('--')`
 *                                         guard applies to BOTH, so `--root=--foo` errors there
 *                                         and is taken at face value here. A real disagreement,
 *                                         on an input nobody types.
 *   gate-envelope.js                      space form only; rejects loudly.
 *   check-i18n-fence-parity.js            space form only; rejects loudly.
 *   check-workflow-generator-inputs.js    space form only; rejects loudly, exit 2 on a missing
 *                                         value.
 *
 * None is silent, so these are consistency gaps rather than live hazards. Adopted already:
 * `normalize-i18n-fences.js` (the source), `generate-translation-status.js` (#619's symptom),
 * `backfill-fence-basis.js` and `check-placeholder-drift.js` — the last two found by that review,
 * the first of them carrying #619's own bug and the second a line-identical copy of the parser
 * being extracted.
 */

/**
 * Parse `argv` against a declared table.
 *
 * @param {string[]} argv - arguments AFTER the node binary and script (i.e. `process.argv.slice(2)`)
 * @param {{bool?: string[], value?: string[]}} spec - flag names WITH their leading `--`
 * @param {(message: string) => never} onError - called with a human-readable message; must not return
 * @returns {Record<string, string|boolean>} keys are flag names without `--`
 */
export function parseArgs(argv, spec, onError) {
  const bool = new Set(spec.bool ?? []);
  const value = new Set(spec.value ?? []);
  const opts = {};
  for (const name of bool) opts[name.slice(2)] = false;
  for (const name of value) opts[name.slice(2)] = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const eq = arg.indexOf('=');
    const name = eq >= 0 ? arg.slice(0, eq) : arg;

    if (bool.has(name)) {
      // `--write=1` is not a boolean. Accepting it would invite `--write=0` to mean "off",
      // which it would not.
      if (eq >= 0) onError(`${name} takes no value (got '${arg}')`);
      opts[name.slice(2)] = true;
    } else if (value.has(name)) {
      const raw = eq >= 0 ? arg.slice(eq + 1) : argv[++i];
      // The `startsWith('--')` guard applies only to the SPACE form: `--locale --dry` must not
      // read `"--dry"` as the locale. In the equals form `--locale=--dry` is an explicit, if
      // odd, value and is taken at face value.
      if (raw === undefined || raw === '' || (eq < 0 && raw.startsWith('--'))) {
        onError(`${name} requires a value`);
      }
      opts[name.slice(2)] = raw;
    } else {
      onError(`unknown argument '${arg}'`);
    }
  }
  return opts;
}

/**
 * The conventional `onError` for these scripts: message, usage line, exit 2.
 *
 * Exit 2 and not 1, so a usage mistake is distinguishable from a finding. Several of these
 * scripts exit 1 to mean "the thing I check is wrong", and a caller scripting around them should
 * not have to guess which happened.
 */
export function usageExit(spec) {
  return (message) => {
    console.error(`ERROR: ${message}`);
    console.error(`Usage: ${[...(spec.bool ?? []), ...(spec.value ?? [])].join(' ')}`);
    process.exit(2);
  };
}
