#!/usr/bin/env bash
# Structural integrity validation for agents, teams, guides, and cross-references.
# Run locally with: bash scripts/validate-integrity.sh
# Also invoked by .github/workflows/validate-integrity.yml

set -euo pipefail

failed=0
warn_count=0

echo "=== Category A: Static Validation ==="

# A1: Validate agent frontmatter
echo "--- A1: Agent frontmatter ---"
for f in agents/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  for field in name description tools priority; do
    if ! grep -q "^${field}:" "$f"; then
      echo "FAIL: $f missing required field: $field"
      failed=1
    fi
  done
done
[ "$failed" -eq 0 ] && echo "OK: All agent files have required frontmatter"

# A2: Validate team frontmatter
echo "--- A2: Team frontmatter ---"
a2_fail=0
for f in teams/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  for field in name description lead members coordination; do
    if ! grep -q "^${field}:" "$f"; then
      echo "FAIL: $f missing required field: $field"
      failed=1
      a2_fail=1
    fi
  done
done
[ "$a2_fail" -eq 0 ] && echo "OK: All team files have required frontmatter"

# A3: Validate guide frontmatter
echo "--- A3: Guide frontmatter ---"
a3_fail=0
for f in guides/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  for field in title description category; do
    if ! grep -q "^${field}:" "$f"; then
      echo "FAIL: $f missing required field: $field"
      failed=1
      a3_fail=1
    fi
  done
done
[ "$a3_fail" -eq 0 ] && echo "OK: All guide files have required frontmatter"

# A4: Agent registry count
echo "--- A4: Agent registry count ---"
disk_count=$(find agents -maxdepth 1 -name '*.md' -not -name '_template.md' -not -name 'README.md' | wc -l)
reg_count=$(grep 'total_agents:' agents/_registry.yml | tr -d '\r' | awk '{print $2}')
if [ "$disk_count" != "$reg_count" ]; then
  echo "FAIL: agents disk=$disk_count registry=$reg_count"
  failed=1
else
  echo "OK: $disk_count agents on disk match registry"
fi

# A5: Team registry count
echo "--- A5: Team registry count ---"
disk_count=$(find teams -maxdepth 1 -name '*.md' -not -name '_template.md' -not -name 'README.md' | wc -l)
reg_count=$(grep 'total_teams:' teams/_registry.yml | tr -d '\r' | awk '{print $2}')
if [ "$disk_count" != "$reg_count" ]; then
  echo "FAIL: teams disk=$disk_count registry=$reg_count"
  failed=1
else
  echo "OK: $disk_count teams on disk match registry"
fi

echo ""
echo "=== Category B: Structural Integrity ==="

# B1: Skill symlinks
echo "--- B1: Skill symlinks ---"
b1_fail=0
b1_count=0
for dir in skills/*/; do
  skill_name=$(basename "$dir")
  [[ "$skill_name" == "_template" ]] && continue
  [ ! -f "$dir/SKILL.md" ] && continue
  b1_count=$((b1_count + 1))
  if [ ! -L ".claude/skills/$skill_name" ]; then
    echo "FAIL: missing symlink .claude/skills/$skill_name"
    failed=1
    b1_fail=1
  fi
done
[ "$b1_fail" -eq 0 ] && echo "OK: All $b1_count skills have .claude/skills/ symlinks"

# B2: Agents symlink
echo "--- B2: Agents symlink ---"
if [ -L ".claude/agents" ] && [ -d ".claude/agents" ]; then
  echo "OK: .claude/agents symlink is valid"
else
  echo "FAIL: .claude/agents symlink is broken or missing"
  failed=1
fi

# B3: Team member agents exist
echo "--- B3: Team member agents ---"
b3_fail=0
b3_checked=0
for f in teams/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  # Extract member ids from structured YAML: members:\n  - id: agent-name
  while IFS= read -r line; do
    member=$(echo "$line" | sed -n 's/^  - id: *//p' | tr -d '\r' | xargs)
    if [ -n "$member" ]; then
      # Skip known placeholder values (dyad uses 'any' for flexible member)
      [[ "$member" == "any" ]] && continue
      b3_checked=$((b3_checked + 1))
      if [ ! -f "agents/${member}.md" ]; then
        echo "FAIL: $f references agent '$member' but agents/${member}.md not found"
        failed=1
        b3_fail=1
      fi
    fi
  done < "$f"
done
[ "$b3_fail" -eq 0 ] && echo "OK: All $b3_checked team member agent references exist on disk"

# B4: Agent skill references exist
echo "--- B4: Agent skill references ---"
b4_fail=0
b4_checked=0
for f in agents/*.md; do
  name=$(basename "$f")
  [[ "$name" == "_template.md" || "$name" == "README.md" ]] && continue
  # Extract skills from YAML frontmatter (indented list items under skills:)
  in_skills=0
  while IFS= read -r line; do
    if echo "$line" | grep -q '^skills:'; then
      in_skills=1
      continue
    fi
    if [ "$in_skills" -eq 1 ]; then
      if echo "$line" | grep -q '^  - '; then
        skill_id=$(echo "$line" | sed 's/^  - //' | tr -d '\r' | xargs)
        b4_checked=$((b4_checked + 1))
        if [ ! -d "skills/${skill_id}" ]; then
          echo "FAIL: $f references skill '$skill_id' but skills/${skill_id}/ not found"
          failed=1
          b4_fail=1
        fi
      else
        in_skills=0
      fi
    fi
  done < "$f"
done
[ "$b4_fail" -eq 0 ] && echo "OK: All $b4_checked agent skill references exist on disk"

# B5: Orphan detection (warn only, not fail)
echo "--- B5: Orphan detection ---"
orphan_count=0
orphan_list=""
# Build reference corpus: all .md files except registries, READMEs, and templates
ref_corpus_file=$(mktemp)
find agents teams guides -name '*.md' -not -name '_template.md' -not -name 'README.md' -exec cat {} + > "$ref_corpus_file" 2>/dev/null
# Add skill-to-skill cross-references (all SKILL.md files)
find skills -name 'SKILL.md' -exec cat {} + >> "$ref_corpus_file" 2>/dev/null
for dir in skills/*/; do
  skill_name=$(basename "$dir")
  [[ "$skill_name" == "_template" ]] && continue
  # A skill is orphaned if it only appears in its own SKILL.md, nowhere else
  # Count total occurrences, subtract self-references (skill name appears in its own file)
  total=$(grep -c "$skill_name" "$ref_corpus_file" 2>/dev/null || echo 0)
  self=$(grep -c "$skill_name" "skills/${skill_name}/SKILL.md" 2>/dev/null || echo 0)
  external=$((total - self))
  if [ "$external" -le 0 ]; then
    orphan_count=$((orphan_count + 1))
    orphan_list="${orphan_list}  - ${skill_name} (self-refs: ${self}, external: ${external})\n"
  fi
done
rm -f "$ref_corpus_file"
if [ "$orphan_count" -gt 0 ]; then
  echo "WARN: $orphan_count orphan skills detected (registered but never referenced):"
  printf "$orphan_list"
  warn_count=$((warn_count + orphan_count))
else
  echo "OK: No orphan skills detected"
fi

# B6: Translation integrity
echo "--- B6: Translation integrity ---"
b6_fail=0
b6_checked=0
for content_type in skills agents teams guides; do
  for locale_dir in i18n/*/"$content_type"/; do
    [ ! -d "$locale_dir" ] && continue
    locale=$(basename "$(dirname "$locale_dir")")
    if [ "$content_type" = "skills" ]; then
      for skill_dir in "$locale_dir"*/; do
        [ ! -d "$skill_dir" ] && continue
        skill_name=$(basename "$skill_dir")
        b6_checked=$((b6_checked + 1))
        if [ ! -f "skills/${skill_name}/SKILL.md" ]; then
          echo "WARN: orphan translation i18n/$locale/skills/$skill_name ($locale)"
          warn_count=$((warn_count + 1))
        fi
      done
    else
      for item in "$locale_dir"*.md; do
        [ ! -f "$item" ] && continue
        item_name=$(basename "$item")
        b6_checked=$((b6_checked + 1))
        if [ ! -f "$content_type/$item_name" ]; then
          echo "WARN: orphan translation i18n/$locale/$content_type/$item_name ($locale)"
          warn_count=$((warn_count + 1))
        fi
      done
    fi
  done
done
if [ "$b6_checked" -gt 0 ]; then
  echo "OK: Checked $b6_checked translation(s) for source existence"
else
  echo "OK: No translations to check"
fi

echo ""
echo "=== Category C: Pipeline Sync Validation ==="

# B7: Palette domain coverage (registry domains vs cyberpunk color map)
echo "--- B7: Palette domain coverage ---"
b7_warn=0
reg_domains=$(grep '^\s\+[a-z0-9_-]\+:$' skills/_registry.yml | grep -v 'skills:' | sed 's/://;s/^ *//' | sort)
palette_domains=$(grep -oP '^\s+"[a-z0-9-]+"' viz/R/palettes.R | head -60 | sed 's/[" ]//g' | sort)
b7_missing=$(comm -23 <(echo "$reg_domains") <(echo "$palette_domains"))
if [ -n "$b7_missing" ]; then
  b7_count=$(echo "$b7_missing" | wc -l)
  echo "WARN: $b7_count domain(s) in registry without hand-tuned cyberpunk color (will use auto-fallback):"
  echo "$b7_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b7_count))
  b7_warn=$b7_count
fi
[ "$b7_warn" -eq 0 ] && echo "OK: All registry domains have hand-tuned cyberpunk colors"

# B8: Glyph mapping coverage (registry skill IDs vs SKILL_GLYPHS keys)
echo "--- B8: Glyph mapping coverage ---"
b8_warn=0
reg_skills=$(grep '^      - id: ' skills/_registry.yml | sed 's/.*- id: //' | tr -d '\r' | sort)
glyph_skills=$(grep -oP '^\s+"[a-z0-9-]+"' viz/R/glyphs.R | sed 's/[" ]//g' | sort)
b8_missing=$(comm -23 <(echo "$reg_skills") <(echo "$glyph_skills"))
if [ -n "$b8_missing" ]; then
  b8_count=$(echo "$b8_missing" | wc -l)
  echo "WARN: $b8_count skill(s) in registry without glyph mapping (will render with fallback):"
  echo "$b8_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b8_count))
  b8_warn=$b8_count
fi
[ "$b8_warn" -eq 0 ] && echo "OK: All registry skills have glyph mappings"

# B9: Agent glyph coverage (registry agent IDs vs AGENT_GLYPHS keys)
echo "--- B9: Agent glyph coverage ---"
b9_warn=0
reg_agents=$(sed -n '/^agents:/,$ { /^  - id: /p }' agents/_registry.yml | sed 's/.*- id: //' | tr -d '\r' | sort)
glyph_agents=$(grep -oP '^\s+"[a-z0-9-]+"' viz/R/agent_glyphs.R | sed 's/[" ]//g' | sort)
b9_missing=$(comm -23 <(echo "$reg_agents") <(echo "$glyph_agents"))
if [ -n "$b9_missing" ]; then
  b9_count=$(echo "$b9_missing" | wc -l)
  echo "WARN: $b9_count agent(s) in registry without glyph mapping:"
  echo "$b9_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b9_count))
  b9_warn=$b9_count
fi
[ "$b9_warn" -eq 0 ] && echo "OK: All registry agents have glyph mappings"

# B10: DOMAIN_STYLES coverage (registry domains vs build-icon-manifest.js DOMAIN_STYLES)
echo "--- B10: DOMAIN_STYLES coverage ---"
b10_warn=0
style_domains=$(grep -oP "'[a-z0-9-]+'" viz/build-icon-manifest.js | head -60 | sed "s/'//g" | sort -u)
b10_missing=$(comm -23 <(echo "$reg_domains") <(echo "$style_domains"))
if [ -n "$b10_missing" ]; then
  b10_count=$(echo "$b10_missing" | wc -l)
  echo "WARN: $b10_count domain(s) in registry without DOMAIN_STYLES entry (will use generic prompt):"
  echo "$b10_missing" | sed 's/^/  - /'
  warn_count=$((warn_count + b10_count))
  b10_warn=$b10_count
fi
[ "$b10_warn" -eq 0 ] && echo "OK: All registry domains have DOMAIN_STYLES entries"

echo ""
echo "=== Summary ==="
if [ "$failed" -ne 0 ]; then
  echo "FAILED: One or more checks failed"
  exit 1
else
  echo "PASSED: All integrity checks passed"
  [ "$warn_count" -gt 0 ] && echo "WARNINGS: $warn_count warning(s) detected"
  exit 0
fi
