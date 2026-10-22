// almanac-skills.mjs: agent-almanac skills in a pi-durable host.
//
// A pi-durable extension whose system-prompt section lists chosen skills by id,
// path and description. The model reads a skill's full SKILL.md with the `read`
// tool when a task calls for it, so only the listing costs context up front.
// Paths are relative to `skillsDir`; the host makes that directory the working
// directory of the environment its tools run in.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as yaml from 'js-yaml';
import { defineExtension, section } from '@earendil-works/pi-durable';

/** A skill's id, its SKILL.md path relative to `skillsDir`, and its description. */
function readSkill(skillsDir, id) {
  const path = `${id}/SKILL.md`;
  const text = readFileSync(join(skillsDir, path), 'utf8');
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
    ...skills.map((skill) => `- ${skill.id} (${skill.path}): ${skill.description}`),
  ].join('\n');
  return defineExtension({
    name: 'almanac-skills',
    sections: [section('available_skills', () => listing)],
  });
}
