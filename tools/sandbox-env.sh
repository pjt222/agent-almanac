# sandbox-env.sh -- the sandbox home a CLI probe runs under; sourced, never executed
#
# WHY
# ---
# A spawn of cli/index.js that sees the caller's home detects the caller's Hermes and OpenClaw,
# and pi's global directory follows $PI_CODING_AGENT_DIR wherever the CLI runs, so a probe's
# install or gather could write into the real ~/.hermes, ~/.openclaw or pi directory (#1071,
# #1075). The test suite spawns through sandboxEnv() in cli/test/sandbox-env.js; probes run by
# hand re-typed the same preamble in review round after review round. This file is that
# preamble, once.
#
# The list of variables is one half of a PAIR. The other half is SANDBOX_SET and SANDBOX_UNSET
# in cli/test/sandbox-env.js, and cli/test/sandbox-env.test.js holds the two equal in both
# directions. It parses the lines of almanac_sandbox below against the JS lists, and it sources
# this file in bash (and in zsh, where installed) and compares what a child process receives
# with what sandboxEnv() builds. Keep one variable per line, in one of these three forms,
# because the parse refuses any other line that exports or removes a variable:
#
#     export NAME="$sandbox_home"
#     export NAME="$sandbox_home/<relative path>"
#     unset NAME
#
# USAGE (bash or zsh; Claude Code's Bash tool runs zsh)
#     . tools/sandbox-env.sh                 defines the two functions below; changes nothing
#     almanac_cli <home> <repo> <args...>    runs node <repo>/cli/index.js <args...> --source <repo>
#                                            in a subshell that almanac_sandbox <home> set up, so
#                                            the calling shell keeps its own HOME; detect, demo
#                                            and no command at all get no --source, since they
#                                            declare none and commander refuses it. It returns
#                                            the CLI's exit status
#     almanac_sandbox <home>                 pins the variables in THIS shell, for a probe whose
#                                            every command must see the sandbox
#
#   <home>   an existing directory, by absolute path, that is not the current $HOME. Make one
#            with mktemp -d. HOME and USERPROFILE become <home>; HERMES_HOME <home>/.hermes;
#            LOCALAPPDATA and PI_CODING_AGENT_DIR are removed, so pi uses <home>/.pi/agent.
#   <repo>   a checkout holding cli/index.js, by absolute path: the CLI that runs, and the
#            --source of every command that declares one.
#
# Both functions return 2 and change nothing in the calling shell when an argument is refused:
# almanac_sandbox refuses before its first export, and almanac_cli refuses a missing argument
# or a bad repo before its subshell starts, and a refused home inside it. After almanac_sandbox
# in the current shell, git, gh and npm read their configuration from the sandbox home until the
# shell exits, which is why almanac_cli is the one to reach for.
#
# The sandbox moves the home variables and nothing else; the working directory stays where it
# is. The CLI's default scope, project, writes under $PWD, so a probe run from a checkout
# installs into that checkout's tracked .claude/skills/. cd to a scratch project first, or pass
# -g. The tests spawn with cwd at the repository root, as a probe from the checkout does.
#
# shellcheck shell=bash

# Run as a script, this file could not change the shell that started it, and every probe after
# it would run against the real home while looking sandboxed. Each shell it supports says when
# it runs the file by name as a script: bash names the file in BASH_SOURCE and in $0 alike, and
# zsh's ZSH_EVAL_CONTEXT is then exactly `toplevel` (sourced, it ends in `:file`, as in
# `cmdarg:file`, `toplevel:file` or `cmdarg:eval:file`). zsh also refuses the file read from
# stdin (`zsh < file`). bash does not: read from stdin, it sets BASH_SOURCE and $0 as an eval
# of the file's text does, which is a load into the current shell, so `bash < file` exits 0.
# sh (dash) gives no such signal at all, so under sh this guard does not fire; the file is for
# bash and zsh only.
if { [ -n "${BASH_VERSION:-}" ] && [ "${BASH_SOURCE[0]:-}" = "$0" ]; } ||
  { [ -n "${ZSH_VERSION:-}" ] && [ "${ZSH_EVAL_CONTEXT:-}" = toplevel ]; }; then
  printf 'sandbox-env.sh: refused: source this file (. tools/sandbox-env.sh) rather than running it; a script cannot change the shell that started it\n' >&2
  exit 2
fi

# Pin the CLI's home variables to <home> in the current shell.
almanac_sandbox() {
  if [ "$#" -ne 1 ]; then
    printf 'almanac_sandbox: refused: want one argument, the sandbox home; got %s\n' "$#" >&2
    return 2
  fi
  local sandbox_home="$1"
  case "$sandbox_home" in
    /*) ;;
    *)
      printf 'almanac_sandbox: refused: the home must be an absolute path: %s\n' "$sandbox_home" >&2
      return 2
      ;;
  esac
  if [ ! -d "$sandbox_home" ]; then
    printf 'almanac_sandbox: refused: no such directory: %s\n' "$sandbox_home" >&2
    return 2
  fi
  if [ -n "${HOME:-}" ] && [ "$sandbox_home" -ef "$HOME" ]; then
    printf 'almanac_sandbox: refused: %s is the current HOME, so nothing would move\n' "$sandbox_home" >&2
    return 2
  fi
  export HOME="$sandbox_home"
  export USERPROFILE="$sandbox_home"
  export HERMES_HOME="$sandbox_home/.hermes"
  unset LOCALAPPDATA
  unset PI_CODING_AGENT_DIR
}

# Run the CLI from <repo> against <repo>, in a subshell with the sandbox applied.
almanac_cli() {
  if [ "$#" -lt 2 ]; then
    printf 'almanac_cli: refused: want <home> <repo> [args...]; got %s argument(s)\n' "$#" >&2
    return 2
  fi
  local sandbox_home="$1" almanac_repo="$2"
  shift 2
  case "$almanac_repo" in
    /*) ;;
    *)
      printf 'almanac_cli: refused: the repo must be an absolute path: %s\n' "$almanac_repo" >&2
      return 2
      ;;
  esac
  if [ ! -f "$almanac_repo/cli/index.js" ]; then
    printf 'almanac_cli: refused: %s holds no cli/index.js\n' "$almanac_repo" >&2
    return 2
  fi
  (
    almanac_sandbox "$sandbox_home" || exit 2
    # Commander refuses an option a command does not declare (`error: unknown option
    # '--source'`, exit 1), and detect, demo and the bare program declare no --source.
    # cli/test/sandbox-env.test.js holds this list equal to the commands cli/index.js registers
    # without the option.
    case "${1:-}" in
      ''|detect|demo) node "$almanac_repo/cli/index.js" "$@" ;;
      *) node "$almanac_repo/cli/index.js" "$@" --source "$almanac_repo" ;;
    esac
  )
}
