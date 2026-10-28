// almanac-skills.mjs: agent-almanac skills in a pi-durable host.
//
// A pi-durable extension whose system-prompt section lists chosen skills by id,
// SKILL.md path and description. The model reads a skill's full SKILL.md with
// the `read` tool when a task calls for it, so only the listing costs context up
// front. The paths are absolute, so they resolve whatever working directory the
// host gives its tools.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as yaml from 'js-yaml';
import { defineExtension, section } from '@earendil-works/pi-durable';

/** A skill's id, the absolute path of its SKILL.md, and its description. */
function readSkill(skillsDir, id) {
  const path = resolve(skillsDir, id, 'SKILL.md');
  const text = readFileSync(path, 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fields = frontmatter ? yaml.load(frontmatter[1]) : {};
  return { id, path, description: String(fields?.description ?? '').trim() };
}

/**
 * @param {{ skillsDir: string, ids: string[] }} options
 *   `skillsDir`: a directory holding `<id>/SKILL.md`, such as an `.agents/skills/`
 *   that `agent-almanac install` wrote, or the agent-almanac package's `skills/`.
 *   `ids`: the skills to offer.
 */
export function almanacSkills({ skillsDir, ids }) {
  const skills = ids.map((id) => readSkill(skillsDir, id));
  const listing = [
    'These skills are available. When a task matches one, read its SKILL.md with the read tool and follow it.',
    'A path inside a skill, such as references/EXAMPLES.md, is relative to the directory that holds its SKILL.md.',
    ...skills.map((skill) => `- ${skill.id} (${skill.path}): ${skill.description}`),
  ].join('\n');
  return defineExtension({
    name: 'almanac-skills',
    sections: [section('available_skills', () => listing)],
  });
}
