#!/usr/bin/env bash
# translate-content.sh
#
# Scaffold a translation file by copying the English source to the i18n directory
# and pre-filling translation frontmatter fields.
#
# Usage:
#   bash scripts/translate-content.sh <content-type> <id> <locale>
#
# Examples:
#   bash scripts/translate-content.sh skills create-r-package de
#   bash scripts/translate-content.sh agents r-developer zh-CN
#   bash scripts/translate-content.sh teams r-package-review ja
#   bash scripts/translate-content.sh guides quick-reference es

set -euo pipefail

if [ $# -ne 3 ]; then
  echo "Usage: $0 <content-type> <id> <locale>"
  echo "  content-type: skills | agents | teams | guides"
  echo "  id:           skill/agent/team/guide name (e.g., create-r-package)"
  echo "  locale:       target locale (e.g., de, zh-CN, ja, es)"
  exit 1
fi

CONTENT_TYPE="$1"
ID="$2"
LOCALE="$3"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TODAY=$(date +%Y-%m-%d)
SOURCE_COMMIT=$(git -C "$ROOT" log -1 --format=%h)

# Resolve source and target paths
case "$CONTENT_TYPE" in
  skills)
    SOURCE_FILE="$ROOT/skills/$ID/SKILL.md"
    TARGET_DIR="$ROOT/i18n/$LOCALE/skills/$ID"
    TARGET_FILE="$TARGET_DIR/SKILL.md"
    ;;
  agents)
    SOURCE_FILE="$ROOT/agents/$ID.md"
    TARGET_DIR="$ROOT/i18n/$LOCALE/agents"
    TARGET_FILE="$TARGET_DIR/$ID.md"
    ;;
  teams)
    SOURCE_FILE="$ROOT/teams/$ID.md"
    TARGET_DIR="$ROOT/i18n/$LOCALE/teams"
    TARGET_FILE="$TARGET_DIR/$ID.md"
    ;;
  guides)
    SOURCE_FILE="$ROOT/guides/$ID.md"
    TARGET_DIR="$ROOT/i18n/$LOCALE/guides"
    TARGET_FILE="$TARGET_DIR/$ID.md"
    ;;
  *)
    echo "ERROR: Unknown content type '$CONTENT_TYPE'. Use: skills, agents, teams, guides"
    exit 1
    ;;
esac

# Validate source exists
if [ ! -f "$SOURCE_FILE" ]; then
  echo "ERROR: Source file not found: $SOURCE_FILE"
  exit 1
fi

# Create target directory
mkdir -p "$TARGET_DIR"

# Check if target already exists
if [ -f "$TARGET_FILE" ]; then
  echo "SKIP: $TARGET_FILE already exists"
  exit 0
fi

# Copy source to target
cp "$SOURCE_FILE" "$TARGET_FILE"

# Add translation frontmatter fields after the existing frontmatter
# We insert locale, source_locale, source_commit, translator, translation_date
# into the YAML frontmatter block (before the closing ---)

# Find the line number of the second --- (closing frontmatter)
CLOSE_LINE=$(awk '/^---$/{count++; if(count==2){print NR; exit}}' "$TARGET_FILE")
if [ -z "$CLOSE_LINE" ]; then
  echo "ERROR: Could not find closing frontmatter delimiter in $TARGET_FILE"
  exit 1
fi

if [ "$CONTENT_TYPE" = "skills" ]; then
  # For skills, fields go INSIDE the metadata block (2-space indent)
  # Insert at the end of metadata, immediately before the closing --- of the frontmatter
  sed -i "${CLOSE_LINE}i\\
  locale: $LOCALE\\
  source_locale: en\\
  source_commit: $SOURCE_COMMIT\\
  translator: \"Claude + human review\"\\
  translation_date: \"$TODAY\"" "$TARGET_FILE"
else
  # For agents/teams/guides, fields go at top-level of frontmatter (no indent)
  sed -i "${CLOSE_LINE}i\\
locale: $LOCALE\\
source_locale: en\\
source_commit: $SOURCE_COMMIT\\
translator: \"Claude + human review\"\\
translation_date: \"$TODAY\"" "$TARGET_FILE"
fi

echo "CREATED: $TARGET_FILE (source_commit: $SOURCE_COMMIT)"
echo "  Next: translate prose sections, keeping code blocks and IDs in English"
