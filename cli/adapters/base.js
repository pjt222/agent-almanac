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
}
