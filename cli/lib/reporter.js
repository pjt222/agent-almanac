/**
 * reporter.js — Console output formatting for the CLI.
 *
 * Handles tables, install results, dry-run previews, and audit reports.
 * Uses chalk for colors when available, falls back to plain text.
 */

let chalk;
try {
  chalk = (await import('chalk')).default;
} catch {
  // Fallback: no colors
  const identity = (s) => s;
  chalk = new Proxy({}, { get: () => identity });
}

/**
 * Print a table of items (skills, agents, or teams).
 * @param {object[]} items
 * @param {object} [options]
 */
export function printItemTable(items, options = {}) {
  if (items.length === 0) {
    console.log(chalk.dim('  (none)'));
    return;
  }

  const maxId = Math.max(...items.map(i => i.id.length), 4);
  const maxType = Math.max(...items.map(i => (i.type || '').length), 4);

  for (const item of items) {
    const id = item.id.padEnd(maxId);
    const type = (item.type || '').padEnd(maxType);
    const domain = item.domain ? chalk.dim(`[${item.domain}]`) : '';
    const complexity = item.complexity ? chalk.dim(item.complexity) : '';
    const desc = chalk.dim(item.description || '');
    console.log(`  ${chalk.cyan(id)}  ${type}  ${domain} ${complexity} ${desc}`);
  }
}

/**
 * Print install/uninstall results.
 * @param {object[]} results - Array of { item, adapter, action, path, error }
 */
export function printResults(results) {
  const ok = results.filter(r => !r.error);
  const failed = results.filter(r => r.error);

  for (const r of ok) {
    const icon = r.action === 'created' ? chalk.green('+') :
                 r.action === 'removed' ? chalk.red('-') :
                 r.action === 'skipped' ? chalk.dim('=') : ' ';
    const framework = chalk.dim(`[${r.adapter}]`);
    console.log(`  ${icon} ${r.item.id} ${framework} ${chalk.dim(r.path || '')}`);
  }

  for (const r of failed) {
    console.log(`  ${chalk.red('!')} ${r.item.id} ${chalk.dim(`[${r.adapter}]`)} ${chalk.red(r.error)}`);
  }

  console.log();
  const summary = [];
  const created = ok.filter(r => r.action === 'created').length;
  const removed = ok.filter(r => r.action === 'removed').length;
  const skipped = ok.filter(r => r.action === 'skipped').length;
  if (created) summary.push(chalk.green(`${created} installed`));
  if (removed) summary.push(chalk.red(`${removed} removed`));
  if (skipped) summary.push(chalk.dim(`${skipped} skipped`));
  if (failed.length) summary.push(chalk.red(`${failed.length} failed`));
  console.log(`  ${summary.join(', ')}`);
}

/**
 * Print detected frameworks.
 * @param {object[]} detections
 */
export function printDetections(detections) {
  if (detections.length === 0) {
    console.log(chalk.dim('  No frameworks detected.'));
    return;
  }
  console.log(chalk.bold('Detected frameworks:'));
  for (const d of detections) {
    console.log(`  ${chalk.cyan(d.displayName.padEnd(24))} ${chalk.dim(d.marker)}`);
  }
}

/**
 * Print audit results.
 * @param {object[]} auditResults - Array of { framework, ok, warnings, errors }
 */
export function printAudit(auditResults) {
  for (const result of auditResults) {
    console.log(chalk.bold(`\n${result.framework}:`));
    for (const msg of result.ok || []) {
      console.log(`  ${chalk.green('OK')}   ${msg}`);
    }
    for (const msg of result.warnings || []) {
      console.log(`  ${chalk.yellow('WARN')} ${msg}`);
    }
    for (const msg of result.errors || []) {
      console.log(`  ${chalk.red('ERR')}  ${msg}`);
    }
  }
}

/**
 * Print a dry-run header.
 */
export function printDryRun() {
  console.log(chalk.yellow('\n  DRY RUN — no changes will be made\n'));
}

/**
 * Print a warning message.
 * @param {string} msg
 */
export function warn(msg) {
  console.log(chalk.yellow(`  WARN: ${msg}`));
}

/**
 * Print an error message.
 * @param {string} msg
 */
export function error(msg) {
  console.error(chalk.red(`  ERROR: ${msg}`));
}

export { chalk };
