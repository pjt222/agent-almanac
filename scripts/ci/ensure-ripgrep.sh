#!/usr/bin/env bash
# Make `rg` runnable on PATH for the steps that follow, or fail the job.
#
# ONE definition, sourced by every workflow that needs it. It previously existed as four
# verbatim copies; this repository's convention for a definition that must exist in more
# than one place is a single source plus a drift check (TEMPLATE_SEGMENTS /
# TEMPLATE_NAMES), because the first edit to a duplicated block lands in three of four
# copies and misses one.
#
# ripgrep is NOT on the runner image: absent from the Ubuntu 24.04 software manifest, and
# not part of base Ubuntu. Measured on this branch's first CI run, which took the install
# path and reported `ripgrep 14.1.0`.
#
# The verdict of this script is "is rg runnable on PATH", never "did apt succeed":
#
#   * `apt-get update` is deliberately `|| true`. Modern apt exits 100 when ANY configured
#     source fails to fetch, and runner images carry several third-party sources, so a
#     stale unrelated source would otherwise skip the install. A genuine failure still
#     lands on the `rg --version` assertion below.
#   * `rg --version` is the assertion. Its output is NOT truncated: ripgrep's second line
#     carries `features:+pcre2`, which is what a `-P` call site would need. No such site
#     survives migration today (all four `grep -oP` uses were measured to need no
#     lookaround, \K or backreference, so plain `rg -o` suffices), but printing the
#     feature set costs nothing and the version number alone would not record it.
set -euo pipefail

if command -v rg >/dev/null 2>&1; then
  echo "ripgrep already present on the image"
else
  sudo apt-get update -qq || true
  sudo apt-get install -y -qq ripgrep
fi

rg --version
