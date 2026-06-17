---
name: memex-verify
description: >
  Run the local pre-commit gate for the memex repo before staging a commit:
  format check, clippy with warnings denied, and the workspace unit-test
  suite, mirroring memex's own CI. Use right before `commit-changes` on a
  memex working tree, after editing any Rust crate under `crates/`, or when
  reproducing a red CI run locally. Optionally runs the Postgres-gated
  integration suite when the `memex-pg` container is up and `.env` is sourced.
  This is a verification gate, NOT a replacement for memex CI — CI remains the
  authority; this catches failures earlier.
license: MIT
allowed-tools: Bash
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: memex
  complexity: basic
  language: Rust
  tags: memex, ci, rust, clippy, testing, pre-commit
---

# Verify the Memex Repo Before Committing

Run memex's three CI gates locally — `cargo fmt --check`, `cargo clippy`
with warnings denied, and the workspace test suite — so a red CI is caught
on your machine before you push. Optionally extend the run with the
Postgres-gated integration suite. This complements, and does not replace,
memex's own CI (`.github/workflows/ci.yml`); CI stays the authority.

## When to Use

- Immediately before invoking `commit-changes` on a memex working tree.
- After editing any Rust source under `crates/` (cli, sync, db, mcp,
  extract), `Cargo.toml`, or `rust-toolchain.toml`.
- When a memex CI run went red and you want to reproduce the failing
  gate locally with the same toolchain.
- Before opening a pull request against `pjt222/memex`.

## Inputs

- **Required**: A checkout of the memex repo (a clone of
  `github.com/pjt222/memex`) with `cwd` set to the repo root. The gates
  read `rust-toolchain.toml` (pinned `1.96.0` + rustfmt/clippy
  components), so run from the root, not a subcrate.
- **Required**: A Rust toolchain on `PATH` (`rustup` provisions the
  pinned channel via `rustup show`). Confirm with `command -v cargo`.
- **Optional (integration gate only)**: A running Postgres+pgvector on
  `:5433` (the `memex-pg` container) and a sourced `.env` supplying
  `MEMEX_TEST_PG_URL` (and `VOYAGE_API_KEY` for embedding-backed tests).

## Procedure

### Step 1: Confirm the toolchain and working directory

The gates must run from the repo root so `rust-toolchain.toml` selects the
pinned `1.96.0` toolchain — local and CI rustfmt/clippy then match.

```bash
# From the memex repo root
test -f rust-toolchain.toml || { echo "not at memex repo root"; exit 1; }
rustup show          # provisions/reports the pinned 1.96.0 toolchain
command -v cargo     # toolchain must be on PATH
```

**Expected:** `rust-toolchain.toml` exists, `rustup show` reports the
active toolchain as `1.96.0`, and `cargo` resolves to a path.

**On failure:** If you are not at the repo root, `cd` there first. If
`cargo` is missing, add it to `PATH` (e.g. `export PATH="$HOME/.cargo/bin:$PATH"`)
and re-run.

### Step 2: Gate 1 — format check

Mirrors the CI `rustfmt` job (`cargo fmt --all --check`). Read-only: it
reports formatting drift without rewriting files.

```bash
cargo fmt --all --check
```

**Expected:** Exit 0 and no diff output — the tree is already formatted.

**On failure:** Non-zero exit prints the unformatted hunks. Apply the
fix with `cargo fmt --all`, re-stage, and re-run this gate. Mark the
overall verify FAIL until this gate is clean.

### Step 3: Gate 2 — clippy with warnings denied

Mirrors the CI clippy step (`cargo clippy --workspace --all-targets -- -D warnings`).
`--all-targets` lints tests and examples too; `-D warnings` makes any
lint a hard error, matching CI exactly.

```bash
cargo clippy --workspace --all-targets -- -D warnings
```

**Expected:** Exit 0 with no warnings emitted.

**On failure:** Each warning is promoted to an error and listed with its
lint name and source span. Fix the code (or, only when justified, add a
scoped `#[allow(...)]`), then re-run. Mark the overall verify FAIL until
clean.

### Step 4: Gate 3 — workspace unit tests

Mirrors the CI unit-tests step (`cargo test --workspace`). This runs the
non-ignored suite across every crate.

```bash
cargo test --workspace
```

**Expected:** Exit 0 and a `test result: ok.` line for each crate's test
binary. The unit count is **~49 at v0.4.0** and **grows per milestone**
(M5 adds watcher tests). Treat the count as informational only — assert
on exit 0 / `test result: ok`, never on a specific number.

**On failure:** A non-zero exit and `test result: FAILED.` name the
failing tests. Reproduce a single one with
`cargo test --workspace <test_name> -- --nocapture`, fix, and re-run.
Mark the overall verify FAIL.

### Step 5: Gate 4 (optional) — Postgres-gated integration suite

The `#[ignore]`-gated integration suite is omitted from CI today (it needs
a Postgres+pgvector service and a `VOYAGE_API_KEY` secret — see
`docs/CONTINUE_HERE.md` §5). Run it locally only when the database and
`.env` are available; skip this gate otherwise without failing verify.

```bash
# Only when the memex-pg container is up and .env is sourced:
docker start memex-pg            # idempotent if already running
set -a && . ./.env && set +a     # exports MEMEX_TEST_PG_URL, VOYAGE_API_KEY, ...
MEMEX_TEST_PG_URL="$MEMEX_TEST_PG_URL" cargo test --workspace -- --include-ignored
```

**Expected:** Exit 0 with `test result: ok.` including the integration
binaries. The total is **~60 at v0.4.0** (unit + ~11 integration) and
also grows per milestone — informational only.

**On failure:** If the suite fails because Postgres is unreachable or
`MEMEX_TEST_PG_URL` is unset, that is an environment gap — note it as
"integration gate skipped" rather than a code FAIL. If it fails with
actual `test result: FAILED.`, treat it as a real FAIL and fix.

### Step 6: Report per-gate results and the overall verdict

Summarize each gate (PASS/SKIP/FAIL) and the rolled-up verdict.

```bash
# Conceptual rollup: overall is non-zero if ANY required gate failed.
echo "fmt: <PASS|FAIL>  clippy: <PASS|FAIL>  unit-tests: <PASS|FAIL>  integration: <PASS|SKIP|FAIL>"
```

**Expected:** Gates 1–3 (required) all PASS. The integration gate is PASS
or SKIP. Overall verdict PASS.

**On failure:** Exit non-zero overall if ANY required gate (1–3) or a
non-skipped integration run failed. Do not proceed to `commit-changes`
until the verdict is PASS.

## Validation

- [ ] Run from the memex repo root (`rust-toolchain.toml` present;
      `rustup show` reports `1.96.0`)
- [ ] `cargo fmt --all --check` exits 0 with no diff
- [ ] `cargo clippy --workspace --all-targets -- -D warnings` exits 0
- [ ] `cargo test --workspace` exits 0 with `test result: ok.` per crate
- [ ] Test counts reported as informational (`~49` unit / `~60` total at
      v0.4.0), never asserted as a pass/fail threshold
- [ ] Integration gate either run (Postgres up + `.env` sourced) and
      green, or explicitly recorded as SKIPPED
- [ ] Overall verdict is non-zero if any required gate failed

## Common Pitfalls

- **Asserting a fixed test count.** Counts grow each milestone; a literal
  `assert 49` turns a healthy run red. Assert exit 0 / `test result: ok`
  and report the count as `~N at v0.4.0`.
- **Running from a subcrate.** Outside the repo root, `rust-toolchain.toml`
  is not picked up, so local fmt/clippy can drift from CI's `1.96.0` and
  give false greens or reds. Always run from the root.
- **Treating a skipped integration gate as a failure.** No Postgres / no
  `.env` means SKIP, not FAIL. Only `test result: FAILED.` on a run that
  actually executed is a real failure.
- **Dropping `--all-targets` from clippy.** Without it, lints in test and
  example code are missed, so local clippy passes while CI fails. Match
  CI's `--workspace --all-targets -- -D warnings` exactly.
- **Treating this as a CI replacement.** This is a local early-warning
  gate. The authority remains `.github/workflows/ci.yml`; a green local
  run does not exempt a PR from CI.
- **Forgetting to source `.env` before the integration gate.** A
  `.env`-loading gotcha is documented in `docs/OBSERVATIONS.md`; export
  the file (`set -a && . ./.env && set +a`) so `MEMEX_TEST_PG_URL` reaches
  the test process.

## Related Skills

- `memex` — the umbrella skill for agent-native shared memory; this gate
  guards commits made within its workflow.
- `memex-wrap` — session-close ritual; run memex-verify as its pre-commit
  gate before the wrap commits.
- `memex-init` — session-start ritual that pairs with this close-side gate.
- `commit-changes` — the next step once all required gates pass.
