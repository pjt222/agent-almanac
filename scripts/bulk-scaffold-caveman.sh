#!/usr/bin/env bash
# Bulk scaffold caveman/wenyan locale stubs for all skills.
# Gets source_commit once; no per-file git calls.
# Usage: bash scripts/bulk-scaffold-caveman.sh [--dry-run]

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)" # abort-ok: cd into this script's own parent; failure means the script was deleted mid-run
cd "$ROOT"

DRY_RUN=0
[[ "${1:-}" == "--dry-run" ]] && DRY_RUN=1

SOURCE_COMMIT=$(git log -1 --format=%h) # abort-ok: `git log -1` fails only in a repo with no commits, which is a broken invocation rather than drift
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
    # Inject ONLY inside the YAML frontmatter block. The unscoped `/^name:/`
    # this replaces fired on every column-0 `name:` in the file, including
    # inside ```yaml fences — a skill documenting a GitHub Actions workflow got
    # `locale:`/`translator:` spliced into the workflow a reader is told to copy.
    # 64 such injections across 44 files reached main before anything compared
    # translated fences against English (#475, found via #472).
    awk -v locale="$locale" -v commit="$SOURCE_COMMIT" -v date="$TODAY" '
      NR == 1 && /^---[[:space:]]*$/ { in_fm = 1; print; next }
      in_fm && /^---[[:space:]]*$/   { in_fm = 0; print; next }
      in_fm && /^name:/ {
        print
        print "locale: " locale
        print "source_locale: en"
        print "source_commit: " commit
        # #552: equal to source_commit at birth, because a scaffold is a byte copy of
        # English, so its frozen fences do mirror this revision. The two fields diverge
        # afterwards -- a human bumps source_commit by retranslating, the fence
        # normalizer bumps fence_basis_commit by propagating bytes.
        print "fence_basis_commit: " commit
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
# Note: this scaffolds i18n translations (a parallel tree), which are NOT
# discovered as slash commands, so no discovery symlink is needed. Any bulk
# route that adds top-level skills must instead end in:
#   bash scripts/sync-discovery-symlinks.sh --fix
echo "Translations are not discovery-linked; run scripts/sync-discovery-symlinks.sh --fix only after adding top-level skills."
