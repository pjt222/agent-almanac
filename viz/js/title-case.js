// Word overrides for proper casing of domain/agent/team slugs
export const WORD_OVERRIDES = {
  gxp: 'GxP', ai: 'AI', mcp: 'MCP', ip: 'IP',
  ux: 'UX', ui: 'UI', a2a: 'A2A', acp: 'ACP',
  tcg: 'TCG', r: 'R', ml: 'ML',
  devops: 'DevOps', mlops: 'MLOps',
};

export function smartTitleCase(slug) {
  return slug.split(/[-_]/)
    .map(w => WORD_OVERRIDES[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
