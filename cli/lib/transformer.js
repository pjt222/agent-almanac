/**
 * transformer.js — Condense SKILL.md content for append-to-file frameworks.
 *
 * Most frameworks consume SKILL.md directly (no transformation needed).
 * This module is only used by append-to-file adapters (Copilot, Codex, Aider)
 * and Cursor legacy rules (.mdc format).
 */

import { readFileSync } from 'fs';

/**
 * Read and condense a SKILL.md for append-to-file frameworks.
 * Keeps: frontmatter, When to Use, Procedure (step headings + Expected), Validation.
 * Drops: On failure blocks, Common Pitfalls, Related Skills, long code blocks.
 * @param {string} filePath - Path to SKILL.md
 * @returns {string} Condensed content (~50 lines)
 */
export function condenseSkill(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  const result = [];
  let inFrontmatter = false;
  let frontmatterCount = 0;
  let currentSection = '';
  let skipBlock = false;
  let codeBlockDepth = 0;
  let codeBlockLines = 0;

  for (const line of lines) {
    // Track frontmatter
    if (line.trim() === '---') {
      frontmatterCount++;
      if (frontmatterCount <= 2) {
        result.push(line);
        inFrontmatter = frontmatterCount === 1;
        continue;
      }
    }
    if (inFrontmatter) {
      result.push(line);
      continue;
    }

    // Track sections
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      skipBlock = ['Common Pitfalls', 'Related Skills'].includes(currentSection);
      if (!skipBlock) result.push(line);
      continue;
    }

    if (skipBlock) continue;

    // Track code blocks — skip long ones (>10 lines)
    if (line.trim().startsWith('```')) {
      if (codeBlockDepth === 0) {
        codeBlockDepth = 1;
        codeBlockLines = 0;
      } else {
        if (codeBlockLines <= 10) {
          result.push(line); // closing fence
        }
        codeBlockDepth = 0;
        codeBlockLines = 0;
        continue;
      }
    }
    if (codeBlockDepth > 0) {
      codeBlockLines++;
      if (codeBlockLines <= 10) result.push(line);
      continue;
    }

    // Skip "On failure:" blocks
    if (line.startsWith('**On failure:**')) {
      skipBlock = true;
      continue;
    }
    // Resume at next heading or Expected block
    if (skipBlock && (line.startsWith('### ') || line.startsWith('**Expected:**') || line.startsWith('## '))) {
      skipBlock = false;
    }
    if (skipBlock) continue;

    result.push(line);
  }

  // Trim trailing empty lines
  while (result.length > 0 && result[result.length - 1].trim() === '') {
    result.pop();
  }

  return result.join('\n');
}

/**
 * Condense an agent definition for append-to-file frameworks.
 * Keeps: frontmatter, Purpose, Capabilities, Available Skills list.
 * @param {string} filePath - Path to agent .md file
 * @returns {string}
 */
export function condenseAgent(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  const result = [];
  let inFrontmatter = false;
  let frontmatterCount = 0;
  let currentSection = '';
  let includeSection = true;
  const includeSections = ['Purpose', 'Capabilities', 'Available Skills'];

  for (const line of lines) {
    if (line.trim() === '---') {
      frontmatterCount++;
      result.push(line);
      inFrontmatter = frontmatterCount === 1;
      continue;
    }
    if (inFrontmatter) { result.push(line); continue; }

    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      includeSection = includeSections.some(s => currentSection.startsWith(s));
      if (includeSection) result.push(line);
      continue;
    }

    if (includeSection) result.push(line);
  }

  while (result.length > 0 && result[result.length - 1].trim() === '') result.pop();
  return result.join('\n');
}

/**
 * Condense a team definition for append-to-file frameworks.
 * Keeps: frontmatter, Purpose, Team Composition, Coordination Pattern.
 * @param {string} filePath
 * @returns {string}
 */
export function condenseTeam(filePath) {
  const raw = readFileSync(filePath, 'utf8');
  const lines = raw.split('\n');

  const result = [];
  let inFrontmatter = false;
  let frontmatterCount = 0;
  let currentSection = '';
  let includeSection = true;
  const includeSections = ['Purpose', 'Team Composition', 'Coordination Pattern'];

  for (const line of lines) {
    if (line.trim() === '---') {
      frontmatterCount++;
      result.push(line);
      inFrontmatter = frontmatterCount === 1;
      continue;
    }
    if (inFrontmatter) { result.push(line); continue; }

    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      includeSection = includeSections.some(s => currentSection.startsWith(s));
      if (includeSection) result.push(line);
      continue;
    }

    if (includeSection) result.push(line);
  }

  while (result.length > 0 && result[result.length - 1].trim() === '') result.pop();
  return result.join('\n');
}

/**
 * Wrap content in marker comments for idempotent section management.
 * @param {string} contentType - 'skill' | 'agent' | 'team'
 * @param {string} id - Item id
 * @param {string} content - The condensed content
 * @returns {string}
 */
export function wrapInMarkers(contentType, id, content) {
  return `<!-- agent-almanac:start:${contentType}:${id} -->\n${content}\n<!-- agent-almanac:end:${contentType}:${id} -->`;
}

/**
 * Remove a marked section from a file's content.
 * @param {string} fileContent - Full file content
 * @param {string} contentType
 * @param {string} id
 * @returns {string} File content with the section removed
 */
export function removeMarkedSection(fileContent, contentType, id) {
  const startMarker = `<!-- agent-almanac:start:${contentType}:${id} -->`;
  const endMarker = `<!-- agent-almanac:end:${contentType}:${id} -->`;

  const startIdx = fileContent.indexOf(startMarker);
  if (startIdx === -1) return fileContent;

  const endIdx = fileContent.indexOf(endMarker);
  if (endIdx === -1) return fileContent;

  const before = fileContent.substring(0, startIdx).trimEnd();
  const after = fileContent.substring(endIdx + endMarker.length).trimStart();

  return before + (after ? '\n\n' + after : '\n');
}

/**
 * Check if a marked section exists in file content.
 * @param {string} fileContent
 * @param {string} contentType
 * @param {string} id
 * @returns {boolean}
 */
export function hasMarkedSection(fileContent, contentType, id) {
  return fileContent.includes(`<!-- agent-almanac:start:${contentType}:${id} -->`);
}

/**
 * Wrap skill content in Cursor .mdc frontmatter format.
 * @param {object} item - Skill item with id, description
 * @param {string} content - Skill content
 * @returns {string}
 */
export function wrapAsMdc(item, content) {
  return `---
description: ${item.description || item.id}
globs:
alwaysApply: false
---

${content}
`;
}
