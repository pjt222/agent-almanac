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

ROOT="$(cd "$(dirname "$0")/.." && pwd)" # abort-ok: cd into this script's own parent; failure means the script was deleted mid-run
TODAY=$(date +%Y-%m-%d)
SOURCE_COMMIT=$(git -C "$ROOT" log -1 --format=%h) # abort-ok: `git log -1` fails only in a repo with no commits, which is a broken invocation

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

# Check if target already exists. Before the dirty-source check below, because a SKIP writes
# nothing and so claims nothing.
if [ -f "$TARGET_FILE" ]; then
  echo "SKIP: $TARGET_FILE already exists"
  exit 0
fi

# Refuse an English source HEAD does not carry (#617). The copy below takes the WORKING TREE's
# bytes while both commit fields are stamped with HEAD, so from a source with uncommitted edits
# -- or an untracked one -- `source_commit` and `fence_basis_commit` would be false at birth.
# Checked before anything is created, so a refusal writes nothing at all. A git that cannot
# answer is a refusal too, never a "clean".
SOURCE_STATUS_RC=0
SOURCE_STATUS=$(git -C "$ROOT" status --porcelain -- "$SOURCE_FILE") || SOURCE_STATUS_RC=$?
if [ "$SOURCE_STATUS_RC" -ne 0 ]; then
  echo "ERROR: git could not report whether $SOURCE_FILE is committed (exit $SOURCE_STATUS_RC); refusing to scaffold"
  exit 1
fi
if [ -n "$SOURCE_STATUS" ]; then
  echo "REFUSED: $SOURCE_FILE has uncommitted changes (git status --porcelain: $SOURCE_STATUS)"
  echo "  A scaffold stamps source_commit and fence_basis_commit with HEAD ($SOURCE_COMMIT), which does not"
  echo "  carry these bytes (#617). Commit the English source first, then scaffold."
  exit 1
fi

# Create target directory, remembering whether this run made it so a refusal can take it back
TARGET_DIR_CREATED=0
[ -d "$TARGET_DIR" ] || TARGET_DIR_CREATED=1
mkdir -p "$TARGET_DIR"

# Copy source to target
cp "$SOURCE_FILE" "$TARGET_FILE"

# Add translation frontmatter fields after the existing frontmatter
# We insert locale, source_locale, source_commit, fence_basis_commit, translator,
# translation_date into the YAML frontmatter block (before the closing ---)
#
# fence_basis_commit (#552) is the revision this file's frozen fences were last verified
# against, and it is separate from source_commit for a reason a scaffold makes vivid: the two
# are equal HERE and diverge immediately afterwards. A scaffold is a byte copy, so its fences
# trivially mirror $SOURCE_COMMIT and the claim is true at birth. From then on a human bumps
# source_commit by retranslating, while normalize-i18n-fences.js bumps fence_basis_commit by
# propagating English bytes -- two different events that one field could not record.
#
# Stamping it here is what keeps the field's absence meaningful. If new translations were born
# without it, "absent" would mean both "unverified" and "recent", and it would stop being usable
# as a backlog signal.

# Find the line number of the second --- (closing frontmatter)
CLOSE_LINE=$(awk '/^---$/{count++; if(count==2){print NR; exit}}' "$TARGET_FILE") # abort-ok: awk exits 0 when no line matches; the -z check on the next line is the reader
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
  fence_basis_commit: $SOURCE_COMMIT\\
  translator: \"(untranslated stub)\"\\
  translation_date: \"$TODAY\"" "$TARGET_FILE"
else
  # For agents/teams/guides, fields go at top-level of frontmatter (no indent)
  sed -i "${CLOSE_LINE}i\\
locale: $LOCALE\\
source_locale: en\\
source_commit: $SOURCE_COMMIT\\
fence_basis_commit: $SOURCE_COMMIT\\
translator: \"(untranslated stub)\"\\
translation_date: \"$TODAY\"" "$TARGET_FILE"
fi

# Post-scaffold guard (#475). A scaffold is a byte copy of committed English, so every frozen
# fence in it must match an English revision; a scaffolder that splices anything into a fence
# -- as the unscoped `/^name:/` rule in bulk-scaffold-caveman.sh once did, 64 times -- fails
# here instead of reaching a commit. ANY non-zero exit refuses: 1 is a violation, 2 is "could
# not measure", and a guard that passed on 2 would pass on a check that ran nothing. The target
# this run created is removed on refusal, so a re-run does not SKIP it as "already exists".
PARITY_RC=0
PARITY_OUT=$(node "$ROOT/scripts/check-i18n-fence-parity.js" --root "$ROOT" --locale "$LOCALE" --id "$ID" 2>&1) || PARITY_RC=$?
if [ "$PARITY_RC" -ne 0 ]; then
  echo "$PARITY_OUT"
  rm -f -- "$TARGET_FILE"
  if [ "$TARGET_DIR_CREATED" -eq 1 ]; then rmdir -- "$TARGET_DIR" 2>/dev/null || true; fi
  echo "REFUSED: $TARGET_FILE failed the fence-parity check (exit $PARITY_RC: 1 = a fence diverges from English, 2 = the check could not run); removed it."
  echo "  The check's own output is above; it ran: node scripts/check-i18n-fence-parity.js --locale $LOCALE --id $ID"
  exit 1
fi

echo "CREATED: $TARGET_FILE (source_commit: $SOURCE_COMMIT, fence_basis_commit: $SOURCE_COMMIT)"
echo "  Next: translate prose sections, keeping code blocks and IDs in English"
