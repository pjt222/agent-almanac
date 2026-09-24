#!/usr/bin/env bash
# _lab.sh — build a throwaway checkout of this repository at a given commit.
#
# Sourced by the probes in this directory, not run. Two of them needed the same twenty lines —
# `prove-the-bypass-survived.sh` and `generator-cli-arms.sh` — and a snippet typed a second time
# becomes a file here rather than a third copy (CLAUDE.md § Adding a Tool states the rule for
# `tools/`; the same reason applies to a results directory, where the copies would drift while
# claiming to measure the same thing).
#
# Leading underscore by the convention `scripts/test/_tmp.js` set: not itself a probe.
#
# WHY A LAB AT ALL
#   The interesting arm of both probes runs at a PARENT commit, where the files under test do not
#   yet exist. Reproducing that in the working tree means restoring several files and a deletion
#   afterwards, and a probe that can leave the repository in a state nobody expects is worth less
#   than the figure it produces. Nothing here writes to the repository.
#
# WHY IT IS A GIT REPOSITORY AND NOT AN EXTRACTION
#   `scripts/lib/git-files.js` refuses to enumerate outside a checkout, so every count in this
#   repository's suites and in `generate-readmes.js` would fail in a plain `tar -x` for a reason
#   that has nothing to do with what is being measured.

# build_lab <repo-root> <sha> <dir>
#
# Extracts <sha>, links the caller's node_modules in, and makes the result a one-commit git
# repository. Returns non-zero rather than printing: the caller decides what an unbuildable lab
# means for its own claim.
build_lab() {
  lab_root=${1:?build_lab needs a repository root}
  lab_sha=${2:?build_lab needs a commit}
  lab_dir=${3:?build_lab needs a target directory}

  mkdir -p "${lab_dir:?}" || return 1
  git -C "${lab_root:?}" archive "${lab_sha}" | tar -x -C "${lab_dir:?}" || return 1
  # Symlinked, never copied: it is ~700 MB and the suites only read it. `.gitignore` carries
  # `node_modules`, so the `git add -A` below does not follow it into the index.
  ln -s "${lab_root:?}/node_modules" "${lab_dir:?}/node_modules" || return 1
  (
    cd "${lab_dir:?}" || exit 1
    # Every `GIT_*` dropped rather than the ones anyone thought of, and HOME/XDG moved with them:
    # git honours an absolute `GIT_DIR` over `-C` and over the cwd, and `$XDG_CONFIG_HOME/git/
    # ignore` is read through no variable at all. A lab built under an inherited `GIT_DIR` is
    # built inside the caller's repository, silently, at exit 0. Same rule as
    # `scripts/test/_git-fixture.js`, for the same reason.
    for lab_var in $(env | sed -n 's/^\(GIT_[A-Za-z0-9_]*\)=.*/\1/p'); do unset "$lab_var"; done
    export HOME="${lab_dir:?}" XDG_CONFIG_HOME="${lab_dir:?}/.config" GIT_CONFIG_NOSYSTEM=1
    git init -q -b main . &&
      git -c user.email=lab@example.invalid -c user.name=lab add -A &&
      git -c user.email=lab@example.invalid -c user.name=lab commit -qm "lab at ${lab_sha}"
  ) >/dev/null 2>&1 || return 1
}
