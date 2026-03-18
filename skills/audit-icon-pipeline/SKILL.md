---
name: audit-icon-pipeline
description: >
  Detect missing glyphs, icons, and HD variants by comparing registries against
  glyph mapping files, icon directories, and manifests. Reports gaps for skills,
  agents, and teams across all palettes.
license: MIT
allowed-tools: Read Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: visualization
  complexity: basic
  language: R
  tags: visualization, audit, icons, glyphs, pipeline, gap-analysis
---

# Audit Icon Pipeline

Detect missing glyphs, missing icons, and stale manifests by comparing registries against glyph mapping files, icon directories, and manifests. Produces a structured gap report covering skills, agents, and teams.

## When to Use

- After adding new skills, agents, or teams to check if icons are needed
- Before a full pipeline render to identify what's missing
- After registry updates to ensure manifests are in sync
- Periodic health check of the icon pipeline

## Inputs

- **Optional**: Entity type filter — `skill`, `agent`, `team`, or `all` (default: `all`)
- **Optional**: Palette to check (default: `cyberpunk` — the reference palette)

## Procedure

### Step 1: Read Registries

Collect all entity IDs from the source-of-truth registries.

1. Read `skills/_registry.yml` — extract all skill IDs across all domains
2. Read `agents/_registry.yml` — extract all agent IDs
3. Read `teams/_registry.yml` — extract all team IDs
4. Record counts: total skills, agents, teams

**Expected:** Three lists of entity IDs with counts matching `total_skills`, `total_agents`, `total_teams`.

**On failure:** If a registry file is missing, report the path and skip that entity type.

### Step 2: Read Glyph Mappings

Collect all mapped entity IDs from the glyph mapping files.

1. Read `viz/R/glyphs.R` — extract all keys from `SKILL_GLYPHS` list
2. Read `viz/R/agent_glyphs.R` — extract all keys from `AGENT_GLYPHS` list
3. Read `viz/R/team_glyphs.R` — extract all keys from `TEAM_GLYPHS` list

**Expected:** Three lists of mapped IDs.

**On failure:** If a glyph file is missing, report it and mark all entities of that type as unmapped.

### Step 3: Compute Missing Glyphs

Diff registry IDs against mapped IDs.

1. Missing skill glyphs: `registry_skill_ids - mapped_skill_ids`
2. Missing agent glyphs: `registry_agent_ids - mapped_agent_ids`
3. Missing team glyphs: `registry_team_ids - mapped_team_ids`

**Expected:** Lists of entity IDs that exist in registries but have no glyph function mapped.

**On failure:** If diff computation fails, verify ID formats match between registry and glyph files (e.g., underscores vs hyphens).

### Step 4: Check Rendered Icons

Verify that mapped glyphs have corresponding rendered icon files.

1. For each mapped skill ID, check `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. For each mapped agent ID, check `viz/public/icons/<palette>/agents/<agentId>.webp`
3. For each mapped team ID, check `viz/public/icons/<palette>/teams/<teamId>.webp`
4. Check HD variants in `viz/public/icons-hd/` with the same structure

**Expected:** Lists of entities with glyphs but missing rendered icons (standard and/or HD).

**On failure:** If the icon directory doesn't exist, the pipeline hasn't been run yet — report all as missing.

### Step 5: Check Manifest Freshness

Compare manifest counts against registry counts.

1. Read `viz/public/data/icon-manifest.json` — count entries
2. Read `viz/public/data/agent-icon-manifest.json` — count entries
3. Read `viz/public/data/team-icon-manifest.json` — count entries
4. Compare against registry totals

**Expected:** Manifest counts match registry counts. Discrepancies indicate stale manifests.

**On failure:** If manifest files don't exist, the data pipeline needs to run first (`node build-data.js && node build-icon-manifest.js`).

### Step 6: Generate Gap Report

Produce a structured summary.

1. Format output as a clear table or list:
   ```
   === Icon Pipeline Audit ===

   MISSING GLYPHS (no glyph function):
     Skills: 5 missing — [list]
     Agents: 2 missing — [list]
     Teams: 0 missing

   MISSING ICONS (glyph exists, no rendered WebP):
     Standard (512px): 3 skills, 1 agent
     HD (1024px): 8 skills, 3 agents, 1 team

   STALE MANIFESTS:
     icon-manifest.json: 320 entries vs 326 registry (stale)
     agent-icon-manifest.json: 66 entries vs 66 registry (OK)
     team-icon-manifest.json: 15 entries vs 15 registry (OK)
   ```
2. Suggest next actions based on findings

**Expected:** A complete gap report with actionable next steps.

**On failure:** If all checks pass with zero gaps, report "Pipeline fully in sync" as a positive outcome.

## Validation Checklist

- [ ] All three registries read successfully
- [ ] All three glyph mapping files checked
- [ ] Icon directories scanned for both standard and HD
- [ ] Manifest freshness verified
- [ ] Gap report produced with counts and entity lists
- [ ] Actionable next steps provided

## Common Pitfalls

- **ID format mismatch**: Registry uses kebab-case (`create-skill`), glyph maps may use snake_case keys — ensure comparison normalizes
- **Palette assumption**: Only checking cyberpunk palette misses palette-specific rendering gaps
- **Empty directories**: A domain directory existing but empty counts as "icons present" when globbing — check file existence, not directory existence
- **HD not rendered**: HD icons are in a separate directory tree (`icons-hd/`) — don't confuse with standard icons

## Related Skills

- [create-glyph](../create-glyph/SKILL.md) — create a missing glyph identified by this audit
- [enhance-glyph](../enhance-glyph/SKILL.md) — improve quality of existing glyphs
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — run the full pipeline to generate missing icons
