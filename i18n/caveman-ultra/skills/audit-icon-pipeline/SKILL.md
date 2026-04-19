---
name: audit-icon-pipeline
locale: caveman-ultra
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

Detect missing glyphs, icons, stale manifests → compare registries vs glyph mappings, icon dirs, manifests. Structured gap report → skills, agents, teams.

## Use When

- After add new skills/agents/teams → icons needed?
- Pre-full pipeline render → identify missing
- After registry updates → manifests in sync
- Periodic health check of icon pipeline

## In

- **Optional**: Entity type filter — `skill`, `agent`, `team`, `all` (default: `all`)
- **Optional**: Palette (default: `cyberpunk` — reference)

## Do

### Step 1: Read Registries

Collect entity IDs from source-of-truth registries.

1. `skills/_registry.yml` → all skill IDs across all domains
2. `agents/_registry.yml` → all agent IDs
3. `teams/_registry.yml` → all team IDs
4. Record counts: total skills, agents, teams

**→** 3 lists of entity IDs w/ counts matching `total_skills`, `total_agents`, `total_teams`.

**If err:** Registry file missing → report path + skip that type.

### Step 2: Read Glyph Mappings

Collect mapped entity IDs from glyph mapping files.

1. `viz/R/glyphs.R` → all keys from `SKILL_GLYPHS` list
2. `viz/R/agent_glyphs.R` → all keys from `AGENT_GLYPHS` list
3. `viz/R/team_glyphs.R` → all keys from `TEAM_GLYPHS` list

**→** 3 lists of mapped IDs.

**If err:** Glyph file missing → report + mark all entities of that type unmapped.

### Step 3: Compute Missing Glyphs

Diff registry IDs vs mapped IDs.

1. Missing skill glyphs: `registry_skill_ids - mapped_skill_ids`
2. Missing agent glyphs: `registry_agent_ids - mapped_agent_ids`
3. Missing team glyphs: `registry_team_ids - mapped_team_ids`

**→** Lists of entity IDs in registries w/o glyph fn mapped.

**If err:** Diff fails → verify ID formats match (underscores vs hyphens).

### Step 4: Check Rendered Icons

Verify mapped glyphs have corresponding rendered icon files.

1. Per mapped skill ID → check `viz/public/icons/<palette>/<domain>/<skillId>.webp`
2. Per mapped agent ID → check `viz/public/icons/<palette>/agents/<agentId>.webp`
3. Per mapped team ID → check `viz/public/icons/<palette>/teams/<teamId>.webp`
4. HD variants in `viz/public/icons-hd/` same structure

**→** Lists of entities w/ glyphs but missing rendered icons (standard/HD).

**If err:** Icon dir missing → pipeline not run → report all as missing.

### Step 5: Check Manifest Freshness

Compare manifest counts vs registry counts.

1. `viz/public/data/icon-manifest.json` → count entries
2. `viz/public/data/agent-icon-manifest.json` → count entries
3. `viz/public/data/team-icon-manifest.json` → count entries
4. Compare vs registry totals

**→** Manifest counts match registry counts. Discrepancy = stale.

**If err:** Manifest files missing → data pipeline must run first (`node build-data.js && node build-icon-manifest.js`).

### Step 6: Detect Orphan Icons

Walk `viz/public/icons*/` → flag WebP files whose `<palette>/<domain>/<skillId>` triple absent from `icon-manifest.json`.

1. Enumerate all WebPs: `find viz/public/icons* -name "*.webp"`
2. Per file → extract `<domain>/<id>` from path
3. Check `<domain>/<id>` has entry in `icon-manifest.json`
4. Non-matching = orphans → exist on disk but no longer referenced

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

**→** Zero orphans. Any = skills re-homed to diff domain w/o cleanup (18 orphans per re-homing = 9 palettes × 2 sizes).

**If err:** Delete orphans manually → no manifest entry, won't be served. Re-home events rare → manual cleanup OK.

### Step 7: Generate Gap Report

Structured summary.

1. Format out as clear table/list:
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

**→** Complete gap report w/ actionable next steps.

**If err:** All checks pass, zero gaps → report "Pipeline fully in sync" as positive outcome.

## Check

- [ ] All 3 registries read
- [ ] All 3 glyph mapping files checked
- [ ] Icon dirs scanned both standard + HD
- [ ] Manifest freshness verified
- [ ] Orphan icons checked (disk paths vs manifest)
- [ ] Gap report produced w/ counts + entity lists
- [ ] Actionable next steps provided

## Traps

- **ID format mismatch**: Registry = kebab-case (`create-skill`), glyph maps may use snake_case → normalize comparison
- **Palette assumption**: Only checking cyberpunk misses palette-specific gaps
- **Empty dirs**: Domain dir exists but empty → counts as "icons present" w/ globbing → check file existence, not dir
- **HD not rendered**: HD icons in separate tree (`icons-hd/`) → don't confuse w/ standard
- **Orphans after re-homing**: Skill domain change → `build.sh` creates icons at new path but NOT deletes old → always run Step 6 orphan check after any domain migration

## →

- [create-glyph](../create-glyph/SKILL.md) — create missing glyph identified by this audit
- [enhance-glyph](../enhance-glyph/SKILL.md) — improve quality of existing glyphs
- [render-icon-pipeline](../render-icon-pipeline/SKILL.md) — run full pipeline → generate missing icons
