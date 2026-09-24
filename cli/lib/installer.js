/**
 * installer.js — Orchestrate install/uninstall across adapters.
 *
 * Takes resolved items and a set of adapters, runs install/uninstall on each,
 * collects and returns results.
 */

import { warn } from './reporter.js';

/**
 * Warn when the requested scope will not be honoured, per adapter and content
 * type (#607).
 *
 * Most adapters install to exactly one place regardless of `--scope`: some
 * always global (a home directory), some always project (a path under
 * projectDir). Before this they accepted the flag and ignored it in silence, so
 * `--scope project -f hermes` printed a successful install at a global path and
 * `--scope global -f cursor` wrote into the project, with nothing saying so.
 *
 * This reports; it does not redirect. Which scope an adapter uses is the
 * adapter's own decision and is unchanged — the defect was never that hermes
 * installs globally, it was that nothing said so.
 *
 * Keyed by CONTENT TYPE as well as adapter, because honouring is a property of
 * the cell: `vibe` branches on scope for skills and writes agents to
 * ~/.vibe/agents unconditionally. Warning per adapter alone reported vibe as
 * fully scope-aware and left the agent downgrade exactly as silent as before.
 *
 * Emits at most one line per adapter. When every type in play shares an
 * effective scope — the common case, and every adapter but vibe — the line does
 * not mention types at all; only a split adapter names them.
 *
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} scope - The requested scope
 * @param {object} opts
 * @param {string[]} opts.contentTypes - The types actually in play this run.
 * @param {boolean} opts.explicit - Whether the user actually passed `--scope`.
 *   `--scope` carries a commander default, so without this every bare
 *   `almanac install` on a machine where hermes is detected would warn that a
 *   flag the user never typed was ignored — warning fatigue aimed precisely at
 *   the people the message is for.
 * @param {string} [opts.verb] - 'installing to' | 'uninstalling from' | 'reading'.
 *   The same mismatch is reported by four call paths and "installing to" is
 *   wrong for three of them. The default is deliberately the neutral 'using'
 *   rather than any real caller's verb: when the default duplicates a call
 *   site's value, deleting that value is an EQUIVALENT mutation and the verb
 *   silently stops being covered. Measured — the first version defaulted to
 *   'installing to' and deleting installAll's explicit verb survived the suite.
 * @returns {void}
 */
export function warnUnsupportedScopes(adapters, scope, { contentTypes, explicit, verb = 'using' }) {
  if (!explicit) return;

  for (const adapter of adapters) {
    // An adapter is not required to extend FrameworkAdapter — the registry
    // accepts anything with the right methods, and the #439 tests use bare
    // duck-typed classes. Calling supportsScope() unguarded threw
    // `adapter.supportsScope is not a function` from here, which runs BEFORE
    // auditAll()'s try/catch: a third-party adapter predating this field would
    // have made `almanac audit` throw outright instead of being recorded as
    // `crashed`, defeating the very guarantee #439 added. Skipping is the
    // pre-#607 behaviour for such an adapter — no warning — which is a gap,
    // not a regression.
    //
    // scopesFor() is what keeps a MALFORMED declaration from getting past the
    // typeof check and throwing further down: `static scopes = 'project'`
    // satisfies String.prototype.includes and then dies at .join(). It
    // normalises anything that is not an array to [], so such an adapter is
    // reported rather than fatal.
    if (typeof adapter.supportsScope !== 'function') continue;
    if (typeof adapter.supports !== 'function') continue;

    const inPlay = contentTypes.filter((type) => adapter.supports(type));
    const unhonoured = inPlay.filter((type) => !adapter.supportsScope(scope, type));
    if (unhonoured.length === 0) continue;

    const { displayName } = adapter.constructor;
    const effectives = [...new Set(unhonoured.map((type) => adapter.effectiveScope(scope, type)))];

    // Every unhonoured type lands in the same place: say it once, without
    // naming types, which is the whole-adapter case for all but vibe.
    if (effectives.length === 1 && effectives[0] !== null && unhonoured.length === inPlay.length) {
      warn(`${displayName} is ${effectives[0]}-only; --scope ${scope} ignored (${verb} ${effectives[0]}).`);
      continue;
    }

    // Split adapter, or a type whose destination cannot be derived. Name the
    // types, because "vibe is global-only" would be false for its skills.
    const parts = unhonoured.map((type) => {
      const effective = adapter.effectiveScope(scope, type);
      return effective === null
        // Reachable today: `--scope workspace` is advertised in every command's
        // help text and no adapter declares it, so every two-scope cell lands
        // here. An earlier version of this comment called the branch
        // unreachable, which was simply wrong.
        ? `${type}s support ${adapter.scopesFor(type).join(', ') || 'no scope'}`
        : `${type}s are ${effective}-only`;
    });
    warn(`${displayName}: ${parts.join('; ')}; --scope ${scope} ignored for ${unhonoured.map((t) => `${t}s`).join(' and ')}.`);
  }
}

/**
 * Install items across all adapters.
 * @param {object} resolved - { skills, agents, teams } from resolveItems()
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} projectDir
 * @param {string} scope
 * @param {object} options - { dryRun, force, almanacRoot }
 * @returns {Promise<object[]>} Array of result objects
 */
export async function installAll(resolved, adapters, projectDir, scope, options) {
  const results = [];

  const allItems = [
    ...resolved.skills,
    ...resolved.agents,
    ...resolved.teams,
  ];

  // Derived from the items actually being installed rather than from the
  // adapter's full contentTypes: an agent-only install must not warn about
  // skills, and vibe's split means the answer differs per type.
  warnUnsupportedScopes(adapters, scope, {
    contentTypes: [...new Set(allItems.filter((i) => !i.unknown).map((i) => i.type))],
    explicit: options?.scopeExplicit === true,
    verb: 'installing to',
  });

  for (const item of allItems) {
    if (item.unknown) {
      results.push({
        item,
        adapter: '—',
        action: 'skipped',
        path: '',
        error: `Unknown item: ${item.id}`,
      });
      continue;
    }

    for (const adapter of adapters) {
      if (!adapter.supports(item.type)) {
        // Warn once for non-skill types on skills-only adapters
        if (item.type !== 'skill' && adapter.constructor.id !== 'universal') {
          warn(`${item.type}s not supported by ${adapter.constructor.displayName}. Skipping ${item.id}.`);
        }
        continue;
      }

      try {
        const result = await adapter.install(item, projectDir, scope, options);
        results.push({
          item,
          adapter: adapter.constructor.id,
          ...result,
        });
      } catch (err) {
        results.push({
          item,
          adapter: adapter.constructor.id,
          action: 'failed',
          path: '',
          error: err.message,
        });
      }
    }
  }

  return results;
}

/**
 * Uninstall items across all adapters.
 * @param {object} resolved - { skills, agents, teams }
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} projectDir
 * @param {string} scope
 * @param {object} options - { dryRun }
 * @returns {Promise<object[]>}
 */
export async function uninstallAll(resolved, adapters, projectDir, scope, options) {
  const results = [];

  const allItems = [
    ...resolved.skills,
    ...resolved.agents,
    ...resolved.teams,
  ];

  warnUnsupportedScopes(adapters, scope, {
    contentTypes: [...new Set(allItems.map((i) => i.type))],
    explicit: options?.scopeExplicit === true,
    verb: 'uninstalling from',
  });

  for (const item of allItems) {
    for (const adapter of adapters) {
      if (!adapter.supports(item.type)) continue;

      try {
        const result = await adapter.uninstall(item, projectDir, scope, options);
        results.push({
          item,
          adapter: adapter.constructor.id,
          ...result,
        });
      } catch (err) {
        results.push({
          item,
          adapter: adapter.constructor.id,
          action: 'failed',
          path: '',
          error: err.message,
        });
      }
    }
  }

  return results;
}

/**
 * Audit all adapters.
 *
 * A crash and a finding are different kinds of result: a finding means the
 * adapter ran and reported something, while a crash means it produced no
 * verdict at all — so a fully broken install reads as "nothing installed,
 * nothing wrong" (#365). `crashed` carries that distinction structurally, so
 * callers never have to match on the `Audit failed:` message prefix (#439).
 *
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} projectDir
 * @param {string} scope
 * @returns {Promise<import('../adapters/base.js').AuditEntry[]>}
 */
export async function auditAll(adapters, projectDir, scope, scopeExplicit = false) {
  const results = [];

  // The audit path carries the same silence as the install path. An earlier
  // version of this comment justified it with a symptom that cannot occur:
  // "auditing at a scope the adapter never uses reports nothing installed for
  // content that IS installed". The warning fires only for scope-IGNORING
  // adapters, whose audit lands on their one real location and duly reports
  // what is there. The real reason is plainer — the audit output is labelled
  // with a scope it did not honour, so a reader comparing two runs at two
  // scopes sees identical results and no explanation.
  //
  // Output only; it does not touch auditExitCode. No items are in play here, so
  // the types are the adapter's own.
  for (const adapter of adapters) {
    if (typeof adapter.supports !== 'function') continue;
    warnUnsupportedScopes([adapter], scope, {
      contentTypes: adapter.constructor.contentTypes ?? [],
      explicit: scopeExplicit,
      verb: 'reading',
    });
  }

  for (const adapter of adapters) {
    try {
      const result = await adapter.audit(projectDir, scope);
      // Normalised here rather than in all 14 adapters: returning from audit()
      // is what proves the adapter ran to completion, so this is the only place
      // that can set the flag authoritatively.
      results.push({ ...result, crashed: false });
    } catch (err) {
      results.push({
        framework: adapter.constructor.displayName,
        ok: [],
        warnings: [],
        errors: [`Audit failed: ${err.message}`],
        crashed: true,
        error: err,
      });
    }
  }
  return results;
}

/**
 * Exit codes for `audit` (#439).
 *
 * 1 is deliberately absent. It already means "usage or loader error": getContext()
 * exits 1 for an undetectable almanac root and for an unknown --framework, and node
 * itself exits 1 with ERR_MODULE_NOT_FOUND when the CLI's deps are missing. Reusing
 * it would leave automation unable to tell "the CLI is not installed here" from
 * "your install is broken" — the ambiguity that made check B11 unfixable (#443).
 */
export const AUDIT_EXIT = {
  CLEAN: 0,
  CRASHED: 2,
  FINDINGS: 3,
};

/**
 * Reduce audit results to a process exit code.
 *
 * A crash outranks a finding: a finding is a completed audit that found
 * something, while a crash means that framework has no verdict at all, so it is
 * the more urgent thing to report. Warnings never affect the code — they
 * describe ordinary states such as "No Copilot skills installed", so failing on
 * them would make a machine with one framework installed exit non-zero for
 * every other adapter.
 *
 * An empty result set is CLEAN. "Nothing was detected" is surfaced by the
 * command as a warning rather than a failure, since a fresh clone with nothing
 * installed yet is a legitimate state.
 *
 * @param {import('../adapters/base.js').AuditEntry[]} results
 * @returns {number}
 */
export function auditExitCode(results) {
  if (results.some((r) => r.crashed)) return AUDIT_EXIT.CRASHED;
  if (results.some((r) => (r.errors || []).length > 0)) return AUDIT_EXIT.FINDINGS;
  return AUDIT_EXIT.CLEAN;
}
