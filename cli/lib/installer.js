/**
 * installer.js — Orchestrate install/uninstall across adapters.
 *
 * Takes resolved items and a set of adapters, runs install/uninstall on each,
 * collects and returns results.
 */

import { warn } from './reporter.js';
import { assertPlainItemIds } from './item-id.js';
import { copyDiff } from './placement.js';

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

  // Before anything is written: an id becomes a path segment in every adapter,
  // so one that is not a plain name refuses the whole run (cli/lib/item-id.js).
  assertPlainItemIds(allItems);

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

  // Before anything is removed: an unknown name is still handed to the
  // adapters as a skill id, so a name that is not plain refuses the whole run.
  assertPlainItemIds(allItems);

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
 * Copies made with `--from-package copy` are reported here, for every
 * adapter at once, after its own audit (copyFindings). They are warnings,
 * never errors: a stale or edited copy still works, unlike a broken link
 * (the maintainer's decision D2), so they leave the exit code alone.
 *
 * @param {import('../adapters/base.js').FrameworkAdapter[]} adapters
 * @param {string} projectDir
 * @param {string} scope
 * @param {boolean} [scopeExplicit]
 * @param {{ name: string, version: string }|null} [reference] - The package
 *   copies are compared against: the running CLI's own (D3). Without it no
 *   version drift is reported, as for every caller that predates it.
 * @returns {Promise<import('../adapters/base.js').AuditEntry[]>}
 */
export async function auditAll(adapters, projectDir, scope, scopeExplicit = false, reference = null) {
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
    // Listed once, here, and handed to audit(), which lists only when it is
    // not given one. The copy findings below need the same listing, and on the
    // /mnt 9p mount one claude-code listing of this checkout's 373 links took
    // about 2.6 s (measured 2026-10-22), so listing twice doubled `audit`.
    // An adapter is not required to list: the #439 ones define audit() alone.
    let installed;
    let listError = null;
    if (typeof adapter.listInstalled === 'function') {
      try {
        installed = await adapter.listInstalled(projectDir, scope);
      } catch (err) {
        listError = err;
      }
    }
    let result;
    try {
      result = await adapter.audit(projectDir, scope, installed);
    } catch (err) {
      results.push({
        framework: adapter.constructor.displayName,
        ok: [],
        warnings: [],
        errors: [`Audit failed: ${err.message}`],
        crashed: true,
        error: err,
      });
      continue;
    }
    // Outside the try above, so nothing about a copy can turn an adapter that
    // audited into a crashed one or cost it its findings (critique F5).
    let copies = { ok: [], warnings: [] };
    if (listError) copies = { ok: [], warnings: [`copies not checked: ${listError.message}`] };
    else if (installed) {
      // A duck-typed adapter can list anything; whatever it returns must not
      // throw out of auditAll, which would abort the whole audit (#439).
      try {
        copies = copyFindings(installed, reference);
      } catch (err) {
        copies = { ok: [], warnings: [`copies not checked: ${err.message}`] };
      }
    }
    // Normalised here rather than in all 14 adapters: returning from audit()
    // is what proves the adapter ran to completion, so this is the only place
    // that can set the flag authoritatively.
    results.push({
      ...result,
      ok: [...(result.ok || []), ...copies.ok],
      warnings: [...(result.warnings || []), ...copies.warnings],
      crashed: false,
    });
  }
  return results;
}

const counted = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/**
 * What audit says about the copies one adapter lists (#606 part 2).
 *
 * - ok: `<n> copy|copies from <name> <version>`, one line per package version.
 * - warning: the same copies, `while this CLI is <name> <version>`, when a
 *   reference is given and differs (D2, D3). A copy outliving the package it
 *   came from is the point of copy mode, so a missing source is not a finding.
 * - warning: copies edited since they were copied, which uninstall keeps (D1).
 * - warning: entries with a copy marker the CLI cannot read.
 *
 * Only entries with a readable marker are hashed. A hash that throws becomes
 * a warning.
 *
 * @param {object[]} installed - The adapter's listInstalled()
 * @param {{ name: string, version: string }|null} reference
 * @returns {{ ok: string[], warnings: string[] }}
 */
function copyFindings(installed, reference) {
  const versions = new Map();
  const edited = [];
  const unreadable = [];
  const unchecked = [];
  for (const entry of installed) {
    if (entry.markerUnreadable) unreadable.push(entry.id);
    if (!entry.copy) continue;
    const key = JSON.stringify([entry.copy.name, entry.copy.version]);
    if (!versions.has(key)) versions.set(key, { ...entry.copy, ids: [] });
    versions.get(key).ids.push(entry.id);
    try {
      const diff = copyDiff(entry.path);
      if (diff && (diff.modified.length > 0 || diff.added.length > 0)) edited.push(entry.id);
    } catch (err) {
      unchecked.push(`${entry.id} (${err.message})`);
    }
  }

  const ok = [];
  const warnings = [];
  for (const { name, version, ids } of versions.values()) {
    ok.push(`${counted(ids.length, 'copy', 'copies')} from ${name} ${version}`);
    if (reference && (name !== reference.name || version !== reference.version)) {
      warnings.push(`${counted(ids.length, 'copy', 'copies')} from ${name} ${version}, while this CLI is ${reference.name} ${reference.version}: ${ids.sort().join(', ')}`);
    }
  }
  if (edited.length > 0) {
    warnings.push(`${counted(edited.length, 'copy', 'copies')} edited since copied, which uninstall keeps: ${edited.sort().join(', ')}`);
  }
  if (unreadable.length > 0) {
    warnings.push(`${counted(unreadable.length, 'entry', 'entries')} with a copy marker agent-almanac cannot read, counted as not installed by it: ${unreadable.sort().join(', ')}`);
  }
  if (unchecked.length > 0) {
    warnings.push(`${counted(unchecked.length, 'copy', 'copies')} not checked for edits: ${unchecked.sort().join(', ')}`);
  }
  return { ok, warnings };
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
