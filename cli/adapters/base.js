/**
 * base.js — Abstract base class for framework adapters.
 *
 * Every adapter must implement these methods. The base provides sensible
 * defaults where possible.
 */

/**
 * @typedef {Object} InstallResult
 * @property {string} action - 'created' | 'updated' | 'skipped'
 * @property {string} path - The path where content was installed
 * @property {string} [details] - Additional info
 */

/**
 * @typedef {Object} AuditEntry
 * @property {string} framework - Framework display name
 * @property {string[]} ok - OK messages
 * @property {string[]} warnings - Warning messages
 * @property {string[]} errors - Error messages
 * @property {boolean} [crashed] - True when audit() threw and produced no verdict.
 *   Set by auditAll(), not by adapters — see cli/lib/installer.js. Absent on
 *   entries obtained by calling an adapter's audit() directly.
 * @property {Error} [error] - The original throw, present only when crashed
 */

export class FrameworkAdapter {
  /** @type {string} Unique framework identifier */
  static id = 'base';

  /** @type {string} Human-readable name */
  static displayName = 'Base';

  /** @type {string} Installation strategy: 'symlink' | 'copy' | 'file-per-item' | 'append-to-file' */
  static strategy = 'symlink';

  /** @type {string[]} Supported content types */
  static contentTypes = ['skill'];

  /**
   * @type {Record<string, Array<'project'|'workspace'|'global'>>} Which scopes
   *   this adapter can honour, KEYED BY CONTENT TYPE.
   *
   *   Most adapters install to exactly ONE place regardless of what `--scope`
   *   asked for — some always global (a home directory), some always project (a
   *   path under projectDir) — and before #607 they accepted the flag and
   *   ignored it in silence, so `--scope project -f hermes` reported a
   *   successful install at a global path and `--scope global -f cursor` wrote
   *   into the project.
   *
   *   Keyed by content type rather than one array per adapter, because
   *   honouring is a property of the CELL, not of the adapter: `vibe` branches
   *   on scope for skills and writes agents to ~/.vibe/agents unconditionally.
   *   A single array cannot express that. Declaring one anyway hides the
   *   divergent cell behind an assertion that it cannot happen, which is the
   *   #607 defect wearing a badge — and that is not hypothetical: the first
   *   version of this change declared vibe `['project','global']` and shipped
   *   the silent agent downgrade its own test could not see, because the test
   *   exercised skills only.
   *
   *   The map must have a key for every entry in `contentTypes`, and no others;
   *   `cli/test/cli.test.js` asserts that in both directions.
   *
   *   This default is permissive so a third-party adapter predating the field
   *   keeps working. Every adapter shipped here declares its own value instead
   *   of inheriting it, asserted as an OWN property — so adding an adapter
   *   forces the decision rather than letting it default into silence.
   */
  static scopes = { skill: ['project', 'global'] };

  /**
   * Check whether this framework is present in the project directory.
   * @param {string} projectDir
   * @returns {Promise<boolean>}
   */
  async detect(projectDir) {
    return false;
  }

  /**
   * Return the target directory for the given scope.
   * @param {string} projectDir
   * @param {'project'|'workspace'|'global'} scope
   * @returns {string}
   */
  getTargetPath(projectDir, scope) {
    throw new Error(`${this.constructor.id}: getTargetPath() not implemented`);
  }

  /**
   * Install a single content item.
   * @param {object} item - { type, id, sourcePath, sourceDir, ... }
   * @param {string} projectDir
   * @param {string} scope
   * @param {object} options - { dryRun, force, almanacRoot }
   * @returns {Promise<InstallResult>}
   */
  async install(item, projectDir, scope, options) {
    throw new Error(`${this.constructor.id}: install() not implemented`);
  }

  /**
   * Uninstall a single content item.
   * @param {object} item - { type, id }
   * @param {string} projectDir
   * @param {string} scope
   * @param {object} options - { dryRun }
   * @returns {Promise<InstallResult>}
   */
  async uninstall(item, projectDir, scope, options) {
    throw new Error(`${this.constructor.id}: uninstall() not implemented`);
  }

  /**
   * List installed items for this framework.
   * @param {string} projectDir
   * @param {string} scope
   * @returns {Promise<object[]>}
   */
  async listInstalled(projectDir, scope) {
    return [];
  }

  /**
   * Audit installed content for health issues.
   * @param {string} projectDir
   * @param {string} scope
   * @returns {Promise<AuditEntry>}
   */
  async audit(projectDir, scope) {
    return {
      framework: this.constructor.displayName,
      ok: [],
      warnings: [],
      errors: [],
    };
  }

  /**
   * Check if this adapter supports a content type.
   * @param {string} contentType - 'skill' | 'agent' | 'team'
   * @returns {boolean}
   */
  supports(contentType) {
    return this.constructor.contentTypes.includes(contentType);
  }

  /**
   * The scopes this adapter can honour for one content type.
   *
   * An unknown content type yields an empty list rather than undefined, so
   * every caller below can treat the result as an array without guarding. A
   * malformed declaration (a bare string, a missing key) also lands here as
   * `[]` rather than throwing — `warnUnsupportedScopes` runs outside
   * `auditAll`'s try/catch, so a third-party adapter with a mistyped field must
   * not be able to abort the audit (#439's failure class, one level down).
   *
   * @param {string} contentType - 'skill' | 'agent' | 'team'
   * @returns {Array<'project'|'workspace'|'global'>}
   */
  scopesFor(contentType) {
    const declared = this.constructor.scopes?.[contentType];
    return Array.isArray(declared) ? declared : [];
  }

  /**
   * Check if this adapter can honour a requested scope for a content type.
   * @param {string} scope - 'project' | 'workspace' | 'global'
   * @param {string} contentType - 'skill' | 'agent' | 'team'
   * @returns {boolean}
   */
  supportsScope(scope, contentType) {
    return this.scopesFor(contentType).includes(scope);
  }

  /**
   * The scope this adapter will ACTUALLY use, for one content type.
   *
   * Returns the request unchanged when it can be honoured. When it cannot AND
   * exactly one scope is declared for that type, that scope is the answer — it
   * is where the install lands no matter what was asked for. With more than one
   * declared scope there is no single truthful answer, so this returns null and
   * the caller reports the mismatch without naming a destination it cannot
   * derive.
   *
   * That null branch is REACHABLE today, contrary to what an earlier version of
   * this comment claimed: `--scope workspace` is advertised in every command's
   * help text, and no adapter declares it, so every two-scope cell lands here.
   *
   * @param {string} scope
   * @param {string} contentType
   * @returns {string|null} The effective scope, or null when underivable.
   */
  effectiveScope(scope, contentType) {
    if (this.supportsScope(scope, contentType)) return scope;
    const declared = this.scopesFor(contentType);
    return declared.length === 1 ? declared[0] : null;
  }
}
