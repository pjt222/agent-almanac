#!/usr/bin/env bash
# Sync Claude Code discovery symlinks for almanac skills and agents.
#
# One idempotent path that every content-adding route ends in, so a skill that
# lands in skills/_registry.yml also reaches the discovery hubs (fixes the class
# of drift behind #324). Complements the audit-discovery-symlinks skill: this is
# the *fixer*, that is the *detector*.
#
# Topology (see guides/symlink-architecture.md):
#   Repo-internal .claude/  — RELATIVE links (portable within the repo)
#     .claude/agents        -> ../agents                 (single dir symlink)
#     .claude/skills/<id>   -> ../../skills/<id>          (one per skill)
#   Global ~/.claude/        — ABSOLUTE links (the chain target other projects use)
#     ~/.claude/agents      -> <almanac>/agents          (single dir symlink)
#     ~/.claude/skills/<id> -> <almanac>/skills/<id>      (one per skill)
#
# Teams are intentionally NOT symlinked — .claude/teams is reserved for
# TeamCreate runtime state; team definitions are read directly from teams/.
#
# Modes:
#   --report  (default)  read-only; list missing/wrong/broken/stale; exit 1 on drift
#   --fix                create missing + repair wrong/broken almanac links;
#                        remove almanac-owned stale orphans. NEVER touches an
#                        entry whose target does not resolve under the almanac.
#
# The global (~/.claude) layer is skipped when ~/.claude is absent (e.g. CI),
# so --report on a fresh CI checkout validates only the repo-internal layer.

set -euo pipefail

MODE=report
for arg in "$@"; do
  case "$arg" in
    --report) MODE=report ;;
    --fix)    MODE=fix ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "unknown argument: $arg (use --report or --fix)" >&2; exit 2 ;;
  esac
done

ALMANAC_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cd "$ALMANAC_ROOT"

REG="skills/_registry.yml"
[ -f "$REG" ] || { echo "FATAL: $REG not found (run from the almanac repo)" >&2; exit 2; }

# Registered skill ids (skip the _template guard defensively; it is not in the registry).
mapfile -t SKILL_IDS < <(grep '^      - id: ' "$REG" | sed 's/.*- id: //' | tr -d '\r ' | grep -v '^_template$' | sort -u)

missing=0 wrong=0 broken=0 stale=0 fixed=0

# ensure_link <link_path> <expected_target> <label>
# Classifies and (in --fix) repairs a single almanac-owned symlink. Only ever
# acts on a path that is absent or is itself a symlink — never on a real dir/file.
ensure_link() {
  local link="$1" target="$2" label="$3"
  if [ -L "$link" ]; then
    local cur; cur=$(readlink "$link")
    if [ "$cur" = "$target" ]; then
      if [ ! -e "$link" ]; then
        broken=$((broken + 1)); echo "BROKEN: $label $link -> $cur (dangling)"
        if [ "$MODE" = fix ]; then ln -sfn "$target" "$link"; fixed=$((fixed + 1)); echo "  fixed -> $target"; fi
      fi
      return 0
    fi
    # points somewhere else
    wrong=$((wrong + 1)); echo "WRONG: $label $link -> $cur (expected $target)"
    if [ "$MODE" = fix ]; then ln -sfn "$target" "$link"; fixed=$((fixed + 1)); echo "  repaired -> $target"; fi
  elif [ -e "$link" ]; then
    # a real file/dir sits where a symlink belongs — never clobber it
    wrong=$((wrong + 1)); echo "WRONG: $label $link is a real path, not a symlink (expected -> $target); left untouched"
  else
    missing=$((missing + 1)); echo "MISSING: $label $link -> $target"
    if [ "$MODE" = fix ]; then ln -s "$target" "$link"; fixed=$((fixed + 1)); echo "  created -> $target"; fi
  fi
  return 0
}

echo "=== Discovery symlink sync ($MODE) — almanac: $ALMANAC_ROOT ==="
echo "Registered skills: ${#SKILL_IDS[@]}"

# ---- Repo-internal layer (.claude/, relative) ----
echo "--- repo-internal .claude/ (relative) ---"
if [ "$MODE" = fix ] && [ ! -d .claude/skills ]; then mkdir -p .claude/skills; fi
ensure_link ".claude/agents" "../agents" "agents-dir"
for id in "${SKILL_IDS[@]}"; do
  ensure_link ".claude/skills/$id" "../../skills/$id" "skill"
done

# ---- Global layer (~/.claude/, absolute) ----
if [ -d "$HOME/.claude" ]; then
  echo "--- global ~/.claude/ (absolute) ---"
  if [ "$MODE" = fix ] && [ ! -d "$HOME/.claude/skills" ]; then mkdir -p "$HOME/.claude/skills"; fi
  ensure_link "$HOME/.claude/agents" "$ALMANAC_ROOT/agents" "agents-dir"
  if [ -d "$HOME/.claude/skills" ]; then
    for id in "${SKILL_IDS[@]}"; do
      ensure_link "$HOME/.claude/skills/$id" "$ALMANAC_ROOT/skills/$id" "skill"
    done
    # Stale = an almanac-OWNED global link whose id is no longer registered.
    # A link whose target does not resolve under the almanac is external
    # (e.g. peon-ping-*) and is NEVER reported or touched.
    declare -A REGISTERED=()
    for id in "${SKILL_IDS[@]}"; do REGISTERED["$id"]=1; done
    while IFS= read -r name; do
      local_link="$HOME/.claude/skills/$name"
      [ -L "$local_link" ] || continue
      tgt=$(readlink "$local_link")
      case "$tgt" in
        "$ALMANAC_ROOT"/skills/*)
          if [ -z "${REGISTERED[$name]:-}" ]; then
            stale=$((stale + 1)); echo "STALE: skill $local_link -> $tgt (id not registered)"
            if [ "$MODE" = fix ]; then rm "$local_link"; fixed=$((fixed + 1)); echo "  removed almanac-owned orphan"; fi
          fi ;;
        *) : ;;  # external link — leave it alone
      esac
    done < <(find "$HOME/.claude/skills" -maxdepth 1 -mindepth 1 -printf '%f\n' 2>/dev/null | sort)
  fi
else
  echo "--- global ~/.claude/ absent (CI) — skipped ---"
fi

echo "=== SUMMARY: missing=$missing wrong=$wrong broken=$broken stale=$stale fixed=$fixed ==="
drift=$((missing + wrong + broken + stale))
if [ "$MODE" = fix ]; then
  # after a fix pass, residual drift means something could not be auto-repaired
  residual=$((drift - fixed))
  [ "$residual" -le 0 ] && { echo "OK: hub in sync"; exit 0; } || { echo "FAILED: $residual issue(s) need manual attention"; exit 1; }
fi
[ "$drift" -eq 0 ] && { echo "OK: hub in sync"; exit 0; } || { echo "DRIFT: $drift issue(s) — run with --fix"; exit 1; }
