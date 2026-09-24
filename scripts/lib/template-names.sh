#!/usr/bin/env bash
# template-names.sh -- the one shell definition of "this name is author scaffolding" (#672).
#
# Sourced by `validate-integrity.sh`, `sync-discovery-symlinks.sh` and one step of
# `.github/workflows/validate-skills.yml`.
#
# COUNTS, measured on the pre-change files rather than quoted from the issue -- an earlier
# revision of this comment said the two scripts "between them carried 19", which was wrong:
# that 19 belongs to validate-integrity.sh alone, and the neighbouring comment in that file
# said "19 ... and sync-discovery carried two more", so the two texts contradicted each other.
#
#   validate-integrity.sh        19 lines  (18 routed here, 1 `-not -path` kept, see below)
#   sync-discovery-symlinks.sh    3 lines  (2 executable, both routed)
#   validate-skills.yml           2 lines  (1 routed, 1 `-not -path` kept)
#
# And they were written in at least SIX distinct constructions, not the "four" an earlier
# revision claimed -- the issue itself hedged "at least four" and dropping the hedge was an
# overclaim:
#
#   [[ "$name" == "_template.md" ]]          -not -name '_template.md'
#   [ "$f" = "skills/_template/SKILL.md" ]   ! -name '_template'
#   grep -v '^_template$'                    -not -path 'skills/_template/*'
#
# ## This list is one half of a PAIR
#
# The other half is `TEMPLATE_SEGMENTS` in `scripts/lib/content-paths.js`. A shell script
# cannot import an ES module, so the duplication is structural rather than lazy -- which is
# exactly the situation that produced the 19 sites in the first place, one level up. It is
# therefore GATED by `scripts/test/template-predicate.test.js`, which reads this array by
# SOURCING this file and asserts set equality against `TEMPLATE_SEGMENTS` in both directions,
# then drives `is_template` name by name over the UNION of both sets. Add a spelling to one
# side and the suite goes red naming the other.
#
# It read the array with a REGEX for one revision, and that was evadable in three ways an
# adversarial review enumerated: a `TEMPLATE_NAMES+=(...)` on a later line, a second full
# assignment, and a double-quoted name added inside these parens. All three left the shell set
# a strict superset of the JS one with every test green. Sourcing closes the class, because it
# observes what the consumers observe rather than what the source text looks like.
#
# Do not "simplify" the array to a `_template*` glob. The exact set is what makes the drift
# check in `templateSpellingDrift` able to fail at all; a prefix silently absorbs a new
# spelling and reports nothing. The reasoning is in that function's JSDoc.
#
# shellcheck shell=bash

# Every name a template goes by, matching content-paths.js's TEMPLATE_SEGMENTS exactly.
TEMPLATE_NAMES=('_template' '_template.md' '_template.mjs')

# Is this basename (or bare path segment) a template's name?
#
# Usage mirrors the `[[ ... ]] && continue` idiom it replaces, which is safe under `set -e`
# because a non-final command in an `&&` list does not trigger the exit.
is_template() { # <basename>
  local candidate
  for candidate in "${TEMPLATE_NAMES[@]}"; do
    [[ "$1" == "$candidate" ]] && return 0
  done
  return 1
}

# `find` predicates excluding every template name, for expansion into a find invocation:
#
#   find agents -maxdepth 1 -name '*.md' "${TEMPLATE_FIND_PRUNE[@]}" -not -name 'README.md'
#
# Built from the array above rather than written out, so a new spelling reaches the `find`
# sites and the `[[ ]]` sites together.
#
# The widening is a no-op at SIX of the seven expansion sites, each constrained by
# `-name '*.md'`. The seventh is NOT, and the exception is recorded here rather than left for
# a reader to discover: `sync-discovery-symlinks.sh` matches `-type d`, so expanding this array
# there additionally excludes directories named `_template.md` or `_template.mjs` from
# `disk_skill_dirs`. That count arms the orphan-cleanup safety guard, so the delta weakens a
# guard rather than tightening one. No such directory exists and none plausibly would, but
# "no-op wherever `-name '*.md'` constrains" is a claim about six sites and was being read as
# a claim about seven.
TEMPLATE_FIND_PRUNE=()
for _template_name in "${TEMPLATE_NAMES[@]}"; do
  TEMPLATE_FIND_PRUNE+=(-not -name "$_template_name")
done
unset _template_name

# Filter template ids out of a newline-separated id list on stdin.
#
# `-x` anchors whole-line and `-F` takes the patterns literally, so this is the exact-set
# semantics of `is_template` rather than the `grep -v '^_template$'` it replaces -- which was
# a fourth spelling of the rule, and covered only one of the three names.
strip_template_ids() {
  grep -vxF -f <(printf '%s\n' "${TEMPLATE_NAMES[@]}") || true
}
