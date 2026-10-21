#!/usr/bin/env bash
# Bulk scaffold caveman/wenyan locale stubs for all skills.
# Gets source_commit once. Existing targets are skipped before any per-file work; for a target
# it would create, it checks once per skill that HEAD carries the English source byte for byte
# (#617) and runs the fence-parity check on the file it wrote (#475). Exits 1 if anything was
# refused.
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
REFUSED=0
# skill -> clean | uncommitted, where "clean" means HEAD carries the English source byte for
# byte and "uncommitted" is everything else (modified, untracked, ignored, hidden by an index
# flag, or git could not answer). One comparison per skill, not per locale: the six targets of
# one skill share one English source.
declare -A SOURCE_STATE=()

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

    # Refuse an English source whose bytes HEAD does not carry (#617): the awk below copies the
    # WORKING TREE's bytes while both commit fields are stamped with HEAD. The test is that
    # property -- HEAD has the path and its blob is byte-identical to the file -- not
    # `git status`, which an ignore rule, status.showUntrackedFiles=no or a skip-worktree /
    # assume-unchanged flag makes report "clean" (#976 round 1). translate-content.sh says why the
    # raw blob is the right side to compare and why the pipe cannot fail open. A git that cannot
    # answer fails `cat-file -e` and refuses too. Per source, so the clean ones are still
    # scaffolded; the run exits 1 at the end. Checked before the dry-run branch, so the preview
    # predicts it.
    rel="skills/$skill/SKILL.md"
    if [[ -z "${SOURCE_STATE[$skill]:-}" ]]; then
      if git -C "$ROOT" cat-file -e "HEAD:./$rel" 2>/dev/null && git -C "$ROOT" show "HEAD:./$rel" | cmp -s - "$source"; then
        SOURCE_STATE[$skill]=clean
      else
        SOURCE_STATE[$skill]=uncommitted
      fi
    fi
    if [[ "${SOURCE_STATE[$skill]}" != clean ]]; then
      if [[ $DRY_RUN -eq 1 ]]; then
        echo "WOULD REFUSE (uncommitted English source, not byte-identical to HEAD:$rel): $target <- $source"
      else
        echo "REFUSED: $target -- English source $source is uncommitted: HEAD:$rel is absent or differs (#617); commit it first"
      fi
      REFUSED=$((REFUSED + 1))
      continue
    fi

    if [[ $DRY_RUN -eq 1 ]]; then
      echo "WOULD CREATE: $target"
      CREATED=$((CREATED + 1))
      continue
    fi

    target_dir_created=0
    [[ -d "$target_dir" ]] || target_dir_created=1
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
        # #770: a scaffold is a byte copy, so it is stamped with the scaffold literal -- the one
        # translate-content.sh stamps, which tools/translator-stamp.mjs and
        # tools/refresh-untranslated-stubs.mjs read from there (scripts/test/scaffolders.test.js
        # pins the two equal). The homage attribution is written by hand when a person actually
        # compresses the body, never here (i18n/README.md, "Caveman and wenyan tiers").
        print "translator: \"(untranslated stub)\""
        print "translation_date: \"" date "\""
        next
      }
      { print }
    ' "$source" > "$target"

    # Post-scaffold guard (#475): the scaffold is a byte copy of committed English, so every
    # frozen fence must match an English revision; a fence the awk above spliced into fails
    # here. ANY non-zero exit refuses: 2 is a scope refusal, and 1 is a finding, a shallow-clone
    # refusal or an uncaught crash, so the checker's printed output says which, never the code
    # alone (translate-content.sh, at its guard, says more, including why `--id` matching across
    # trees can only refuse falsely). Scoped to this target's locale and id: a locale-wide run
    # would also report the pre-existing #477 backlog, refusing a correct scaffold for another
    # file's divergence. The rejected target is removed, and so is its leaf directory if this
    # run created it, so a re-run does not SKIP it as existing.
    parity_rc=0
    parity_out=$(node "$ROOT/scripts/check-i18n-fence-parity.js" --root "$ROOT" --locale "$locale" --id "$skill" 2>&1) || parity_rc=$?
    if [[ $parity_rc -ne 0 ]]; then
      echo "$parity_out"
      rm -f -- "$target"
      if [[ $target_dir_created -eq 1 ]]; then rmdir -- "$target_dir" 2>/dev/null || true; fi
      echo "REFUSED: $target failed the fence-parity check (exit $parity_rc; 2 = the check refused its scope before comparing anything, any other code: read the check's own output above); removed it"
      REFUSED=$((REFUSED + 1))
      continue
    fi

    CREATED=$((CREATED + 1))
  done
done

echo ""
echo "Done. Created: $CREATED  Skipped (existing): $SKIPPED  Refused: $REFUSED"
# Note: this scaffolds i18n translations (a parallel tree), which are NOT
# discovered as slash commands, so no discovery symlink is needed. Any bulk
# route that adds top-level skills must instead end in:
#   bash scripts/sync-discovery-symlinks.sh --fix
echo "Translations are not discovery-linked; run scripts/sync-discovery-symlinks.sh --fix only after adding top-level skills."

if [[ $REFUSED -gt 0 ]]; then
  echo "Refused $REFUSED target(s) -- see the REFUSED (or, in a dry run, WOULD REFUSE) lines above. Exit 1."
  exit 1
fi
