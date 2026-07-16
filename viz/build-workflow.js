#!/usr/bin/env node
// build-workflow.js
// Delegates workflow diagram generation to build-workflow.R, which uses
// putior to scan PUT annotations and generate Mermaid syntax.
// Output: public/data/workflow.mmd
// put id:"invoke_putior", label:"Invoke putior via Rscript to generate workflow diagram", node_type:"process"

import { execSync } from 'child_process';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

try {
  execSync('Rscript build-workflow.R', {
    cwd: __dirname,
    stdio: 'inherit',
  });
} catch (err) {
  console.error('build-workflow.R failed:', err.message);
  process.exit(1);
}
