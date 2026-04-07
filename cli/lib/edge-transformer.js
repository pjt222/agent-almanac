/**
 * edge-transformer.js — Aggressively distill almanac content for edge LLMs.
 *
 * On-device models (Gemma 4, Phi, Llama) have small context windows (2K-8K tokens)
 * and no tool-use capabilities. This transformer strips content to its essence:
 * just the procedure steps and validation criteria, formatted for instruction-following.
 *
 * Target: ~20-40 lines per skill (vs. ~50 for append-to-file, ~300 for full SKILL.md).
 */

import { readFileSync } from 'fs';

/**
 * Distill a SKILL.md to a compact instruction format for edge LLMs.
 *
 * Keeps: name, description, numbered procedure steps (headings only), validation checklist.
 * Drops: frontmatter (except name/description), code blocks, Expected/On failure,
 *        Common Pitfalls, Related Skills, When to Use, Inputs.
 *
 * @param {string} filePath - Path to SKILL.md
 * @returns {string} Distilled content (~20-40 lines)
 */
export function distillSkill(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  let name = '';
  let description = '';
  const steps = [];
  const validation = [];

  let inFrontmatter = false;
  let frontmatterCount = 0;
  let currentSection = '';
  let inCodeBlock = false;
  let inValidation = false;
  let inDescription = false;

  for (const line of lines) {
    // Parse frontmatter for name and description only
    if (line.trim() === '---') {
      frontmatterCount++;
      inFrontmatter = frontmatterCount === 1;
      continue;
    }
    if (inFrontmatter) {
      const nameMatch = line.match(/^name:\s*(.+)/);
      if (nameMatch) name = nameMatch[1].trim();
      const descMatch = line.match(/^description:\s*[>|]?\s*(.*)/);
      if (descMatch) {
        if (descMatch[1]) {
          description = descMatch[1].trim();
          inDescription = false;
        } else {
          // Multiline description (> or |) — collect continuation lines
          inDescription = true;
          description = '';
        }
      } else if (inDescription && line.match(/^\s+/)) {
        description += (description ? ' ' : '') + line.trim();
      } else if (inDescription) {
        inDescription = false;
      }
      continue;
    }

    // Skip code blocks entirely
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Track sections
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      inValidation = currentSection === 'Validation';
      continue;
    }

    // Capture procedure step headings
    if (line.startsWith('### Step ')) {
      const stepText = line.replace(/^### Step \d+:\s*/, '').trim();
      steps.push(stepText);
      continue;
    }

    // Capture validation items (store without leading dash to avoid double-prefix)
    if (inValidation && line.match(/^- \[[ x]\]/)) {
      validation.push(line.replace(/^- \[[ x]\]\s*/, '').trim());
    }
  }

  // Build compact output
  const output = [];
  output.push(`# ${name}`);
  if (description) output.push('', description);

  if (steps.length > 0) {
    output.push('', '## Steps');
    steps.forEach((step, i) => output.push(`${i + 1}. ${step}`));
  }

  if (validation.length > 0) {
    output.push('', '## Verify');
    validation.forEach(v => output.push(`- ${v}`));
  }

  return output.join('\n');
}

/**
 * Distill an agent definition for edge LLMs.
 * Keeps: name, description, purpose (first paragraph), skill list.
 * @param {string} filePath
 * @returns {string}
 */
export function distillAgent(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  let name = '';
  let description = '';
  let purpose = '';
  const skills = [];

  let inFrontmatter = false;
  let frontmatterCount = 0;
  let currentSection = '';
  let capturedPurpose = false;

  for (const line of lines) {
    if (line.trim() === '---') {
      frontmatterCount++;
      inFrontmatter = frontmatterCount === 1;
      continue;
    }
    if (inFrontmatter) {
      const nameMatch = line.match(/^name:\s*(.+)/);
      if (nameMatch) name = nameMatch[1].trim();
      const descMatch = line.match(/^description:\s*(.*)/);
      if (descMatch && descMatch[1]) description = descMatch[1].trim();
      const skillMatch = line.match(/^\s+-\s+(\S+)/);
      if (currentSection === 'skills' && skillMatch) skills.push(skillMatch[1]);
      if (line.match(/^skills:/)) currentSection = 'skills';
      else if (line.match(/^\w/) && currentSection === 'skills') currentSection = '';
      continue;
    }

    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      continue;
    }

    if (currentSection === 'Purpose' && !capturedPurpose && line.trim()) {
      purpose = line.trim();
      capturedPurpose = true;
    }
  }

  const output = [`# ${name}`];
  if (description) output.push('', description);
  if (purpose) output.push('', purpose);
  if (skills.length > 0) {
    output.push('', '## Skills');
    skills.forEach(s => output.push(`- ${s}`));
  }

  return output.join('\n');
}

/**
 * Distill a team definition for edge LLMs.
 * Keeps: name, description, member list with roles.
 * @param {string} filePath
 * @returns {string}
 */
export function distillTeam(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  let name = '';
  let description = '';
  const members = [];

  let inFrontmatter = false;
  let frontmatterCount = 0;
  let inMembers = false;
  let currentMember = null;

  for (const line of lines) {
    if (line.trim() === '---') {
      frontmatterCount++;
      inFrontmatter = frontmatterCount === 1;
      continue;
    }
    if (inFrontmatter) {
      const nameMatch = line.match(/^name:\s*(.+)/);
      if (nameMatch) name = nameMatch[1].trim();
      const descMatch = line.match(/^description:\s*(.*)/);
      if (descMatch && descMatch[1]) description = descMatch[1].trim();
      if (line.match(/^members:/)) inMembers = true;
      else if (line.match(/^\w/) && inMembers) inMembers = false;
      if (inMembers) {
        const agentMatch = line.match(/^\s+-\s+agent:\s*(.+)/);
        if (agentMatch) currentMember = { agent: agentMatch[1].trim() };
        const roleMatch = line.match(/^\s+role:\s*(.+)/);
        if (roleMatch && currentMember) {
          currentMember.role = roleMatch[1].trim();
          members.push(currentMember);
          currentMember = null;
        }
      }
      continue;
    }
  }

  const output = [`# ${name}`];
  if (description) output.push('', description);
  if (members.length > 0) {
    output.push('', '## Members');
    members.forEach(m => output.push(`- **${m.agent}**: ${m.role || 'member'}`));
  }

  return output.join('\n');
}

/**
 * Bundle multiple distilled items into a single system prompt fragment.
 * @param {Array<{type: string, id: string, content: string}>} items
 * @param {object} options
 * @param {number} [options.maxTokens=4000] - Approximate token budget
 * @returns {string}
 */
export function bundleForEdge(items, options = {}) {
  const maxTokens = options.maxTokens || 4000;
  const output = ['# Available Procedures', ''];

  let approxTokens = 10; // header overhead
  let loadedCount = 0;
  for (const item of items) {
    // Rough estimate: 1 token ≈ 4 characters
    const itemTokens = Math.ceil(item.content.length / 4);
    if (approxTokens + itemTokens > maxTokens) break;
    output.push(item.content, '');
    approxTokens += itemTokens;
    loadedCount++;
  }

  output.push(`---`, `${loadedCount} procedures loaded. Follow steps in order.`);
  return output.join('\n');
}
