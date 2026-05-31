//! CLI-level integration tests for meta surfaces: `--version`, the `version`
//! subcommand, `--help`, and `list <kind>`. These pin the binary's CLI contract
//! — the Node suite asserts the same surfaces, but no Rust test exercised them
//! through the binary (only the lib-level counts in `smoke.rs`).

use std::path::{Path, PathBuf};
use std::process::Command;

/// Repo root = the parent of `cli-rs/` (where the on-disk registries live).
fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

/// Run the built binary with no `--root` (clap built-ins / `version` don't need it).
fn run(args: &[&str]) -> (String, bool) {
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(args)
        .output()
        .expect("binary runs");
    (
        String::from_utf8_lossy(&out.stdout).into_owned(),
        out.status.success(),
    )
}

/// Run `list <kind> --root <repo>`, mirroring the `cli_search.rs` idiom.
fn run_list(kind: &str) -> (String, bool) {
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["list", kind, "--root"])
        .arg(almanac_root())
        .output()
        .expect("binary runs");
    (
        String::from_utf8_lossy(&out.stdout).into_owned(),
        out.status.success(),
    )
}

/// Version comes from `CARGO_PKG_VERSION` (clap `#[command(version)]`), so these
/// assertions track `Cargo.toml` automatically rather than rotting on each bump.
const VERSION: &str = env!("CARGO_PKG_VERSION");
const PKG: &str = env!("CARGO_PKG_NAME");

#[test]
fn version_flag_prints_name_and_semver() {
    let (out, ok) = run(&["--version"]);
    assert!(ok, "--version exited non-zero: {out}");
    assert!(out.contains(PKG), "expected crate name `{PKG}` in: {out}");
    assert!(
        out.contains(VERSION),
        "expected version `{VERSION}` in: {out}"
    );
}

#[test]
fn version_subcommand_prints_semver() {
    let (out, ok) = run(&["version"]);
    assert!(ok, "version subcommand exited non-zero: {out}");
    assert_eq!(out.trim(), VERSION, "got: {out}");
}

#[test]
fn help_lists_subcommands() {
    let (out, ok) = run(&["--help"]);
    assert!(ok, "--help exited non-zero: {out}");
    for sub in [
        "install",
        "uninstall",
        "gather",
        "scatter",
        "tend",
        "search",
        "sync",
        "bundle",
        "init",
    ] {
        assert!(out.contains(sub), "help missing `{sub}` in:\n{out}");
    }
}

#[test]
fn list_each_kind_prints_positive_count() {
    for (kind, label) in [
        ("skills", "Skills:"),
        ("agents", "Agents:"),
        ("teams", "Teams:"),
        ("guides", "Guides:"),
    ] {
        let (out, ok) = run_list(kind);
        assert!(ok, "list {kind} failed: {out}");
        assert!(
            out.contains(label),
            "list {kind} missing `{label}` in: {out}"
        );
        // Drift-resilient: assert a positive count, not a hard-coded total.
        let n: usize = out
            .split_whitespace()
            .last()
            .and_then(|t| t.parse().ok())
            .unwrap_or_else(|| panic!("no trailing count in `list {kind}`: {out}"));
        assert!(n > 0, "list {kind} count not positive: {out}");
    }
}
