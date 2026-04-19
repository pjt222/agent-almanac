---
name: audit-icon-pipeline
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-19"
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

Find missing glyphs, missing icons, stale manifests. Diff registries vs glyph maps, icon dirs, manifests. Produce gap report for skills, agents, teams.

## When Use

- New skills, agents, teams added — check icon needs
- Before full pipeline render — find what missing
- After registry updates — verify manifest sync
- Periodic pipeline health check

## Inputs

- **Optional**: Entity type filter — `skill`, `agent`, `team`, or `all` (default: `all`)
- **Optional**: Palette to check (default: `cyberpunk` — reference palette)

## Steps

### Step 1: Read Registries

Collect entity IDs from source-of-truth registries.

1. Read `skills/_registry.yml` — grab skill IDs across domains
2. Read `agents/_registry.yml` — grab agent IDs
3. Read `teams/_registry.yml` — grab team IDs
4. Record counts: skills, agents, teams

**Got:** Three ID lists with counts matching `total_skills`, `total_agents`, `total_teams`.

**If fail:** Registry file missing? Report path, skip that type.

### Step 2: Read Glyph Mappings

Collect mapped entity IDs from glyph map files.

1. Read `viz/R/glyphs.R` — grab keys from `SKILL_GLYPHS` list
2. Read `viz/R/agent_glyphs.R` — grab keys from `AGENT_GLYPHS` list
3. Read `viz/R/team_glyphs.R` — grab keys from `TEAM_GLYPHS` list

**Got:** Three mapped-ID lists.

**If fail:** Glyph file missing? Report it, mark all entities of that type unmapped.

### Step 3: Compute Missing Glyphs

Diff registry IDs vs mapped IDs.

1. Missing skill glyphs: `registry_skill_ids - mapped_skill_ids`
2. Missing agent glyphs: `registry_agent_ids - mapped_agent_ids`
3. Missing team glyphs: `registry_team_ids - mapped_team_ids`

**Got:** Lists of entity IDs in registries but no glyph function mapped.

**If fail:** Diff fails? Verify ID formats match between registry and glyph files (underscores vs hyphens).

### Step 4: Check Rendered Icons

Verify mapped glyphs have rendered icon files.

1. For each mapped skill ID, check `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. For each mapped agent ID, check `viz/public/icons/<palette>/agents/<agentId>.webp`
3. For each mapped team ID, check `viz/public/icons/<palette>/teams/<teamId>.webp`
4. Check HD variants in `viz/public/icons-hd/` — same structure

**Got:** Lists of entities with glyphs but no rendered icons (standard and/or HD).

**If fail:** Icon dir absent? Pipeline not run yet — report all as missing.

### Step 5: Check Manifest Freshness

Compare manifest counts vs registry counts.

1. Read `viz/public/data/icon-manifest.json` — count entries
2. Read `viz/public/data/agent-icon-manifest.json` — count entries
3. Read `viz/public/data/team-icon-manifest.json` — count entries
4. Compare vs registry totals

**Got:** Manifest counts match registry counts. Mismatch → stale manifest.

**If fail:** Manifest files absent? Data pipeline needs to run first (`node build-data.js && node build-icon-manifest.js`).

### Step 6: Detect Orphan Icons

Walk `viz/public/icons*/`. Flag WebP files whose `<palette>/<domain>/<skillId>` triple absent from `icon-manifest.json`.

1. Enumerate WebP files: `find viz/public/icons* -name "*.webp"`
2. For each file, extract `<domain>/<id>` from path
3. Check if `<domain>/<id>` has entry in `icon-manifest.json`
4. Collect non-matching files as orphans — on disk but unreferenced

```bash
# Quick orphan count per palette
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('viz/public/data/icon-manifest.json'));
const ids = new Set(manifest.map(e => e.domain + '/' + e.id));
const orphans = require('child_process')
  .execSync('find viz/public/icons -name \"*.webp\"').toString().trim().split('\n')
  .filter(p => { const parts = p.split('/'); const id = parts.slice(-2).join('/').replace('.webp',''); return !ids.has(id); });
console.log('Orphans:', orphans.length);
orphans.forEach(p => console.log(' ', p));
"
```

**Got:** Zero orphans. Any orphans → skills re-homed to different domain, no cleanup (18 orphans per re-homing = 9 palettes × 2 sizes).

**If fail:** Delete orphans manually — no manifest entry, will not be served. Re-home events rare, manual cleanup acceptable.

### Step 7: Generate Gap Report

Produce structured summary.

1. Format output as clear table or list:
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
2. Suggest next actions from findings

**Got:** Full gap report with actionable next steps.

**If fail:** All checks pass, zero gaps? Report "Pipeline fully in sync" — positive outcome.

## Checks

- [ ] All three registries read OK
- [ ] All three glyph map files checked
- [ ] Icon dirs scanned — standard and HD
- [ ] Manifest freshness verified
- [ ] Orphan icons checked (disk paths vs manifest)
- [ ] Gap report produced — counts and entity lists
- [ ] Next steps provided

## Pitfalls

- **ID format mismatch**: Registry uses kebab-case (`create-skill`), glyph maps may use snake_case keys — normalize before comparison
- **Palette assumption**: Checking only cyberpunk palette misses palette-specific rendering gaps
- **Empty directories**: Domain dir exists but empty counts as "icons present" when globbing — check file existence, not directory existence
- **HD not rendered**: HD icons live in separate tree (`icons-hd/`) — don't confuse with standard icons
- **Orphans after re-homing**: Skill domain changes? `build.sh` creates icons at new path, does NOT delete old — always run Step 6 orphan check after domain migration

## See Also

- [create-glyph](../create-glyph/SKILL.md) — create missing glyph flagged by this audit
- [enhance-glyph](../enhance-glyph/SKILL.md) — improve quality of existing glyphs
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — run full pipeline to generate missing icons
