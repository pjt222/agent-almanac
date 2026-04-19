#!/usr/bin/env bash
# Bulk scaffold caveman/wenyan locale stubs for all skills.
# Gets source_commit once; no per-file git calls.
# Usage: bash scripts/bulk-scaffold-caveman.sh [--dry-run]

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

SOURCE_COMMIT=$(git log -1 --format=%h)
TODAY=$(date +%Y-%m-%d)
LOCALES=(caveman-lite caveman caveman-ultra wenyan-lite wenyan wenyan-ultra)
CREATED=0
SKIPPED=0
ERRORS=0

echo "source_commit: $SOURCE_COMMIT  date: $TODAY  dry-run: $DRY_RUN"

for locale in "${LOCALES[@]}"; do
  for skill_dir in skills/*/; do
    skill=$(basename "$skill_dir")
    [[ "$skill" == _* ]] && continue
    source="$ROOT/skills/$skill/SKILL.md"
    [[ ! -f "$source" ]] && continue

    target_dir="$ROOT/i18n/$locale/skills/$skill"
    target="$target_dir/SKILL.md"

    if [[ -f "$target" ]]; then
      SKIPPED=$((SKIPPED + 1))
      continue
    fi

    if [[ $DRY_RUN -eq 1 ]]; then
      echo "WOULD CREATE: $target"
      CREATED=$((CREATED + 1))
      continue
    fi

    mkdir -p "$target_dir"
    awk -v locale="$locale" -v commit="$SOURCE_COMMIT" -v date="$TODAY" '
      /^name:/ {
        print
        print "locale: " locale
        print "source_locale: en"
        print "source_commit: " commit
        print "translator: \"Julius Brussee homage \342\200\224 caveman\""
        print "translation_date: \"" date "\""
        next
      }
      { print }
    ' "$source" > "$target"

    CREATED=$((CREATED + 1))
  done
done

echo ""
echo "Done. Created: $CREATED  Skipped (existing): $SKIPPED  Errors: $ERRORS"
