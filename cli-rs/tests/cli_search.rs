//! CLI-level integration tests for `search`.

use std::path::{Path, PathBuf};
use std::process::Command;

fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

fn run_search(query: &str) -> (String, bool) {
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["search", query, "--root"])
        .arg(almanac_root())
        .output()
        .expect("binary runs");
    (
        String::from_utf8_lossy(&out.stdout).into_owned(),
        out.status.success(),
    )
}

#[test]
fn search_finds_skill_by_id() {
    let (stdout, ok) = run_search("commit-changes");
    assert!(ok);
    assert!(stdout.contains("skill commit-changes"), "got: {stdout}");
}

#[test]
fn search_no_match_reports_zero() {
    let (stdout, ok) = run_search("xyzzy-no-such-thing-zzz");
    assert!(ok);
    assert!(stdout.contains("0 result(s)"), "got: {stdout}");
}

#[test]
fn search_is_case_insensitive() {
    // Case-insensitive matching: the same set of items hits for both queries.
    // The header line echoes the raw query so we compare hit-line counts.
    let count_hits = |out: &str| out.lines().filter(|l| l.starts_with("  ")).count();
    let (lower, _) = run_search("meditate");
    let (upper, _) = run_search("MEDITATE");
    assert_eq!(count_hits(&lower), count_hits(&upper));
    assert!(
        count_hits(&lower) > 0,
        "expected at least one hit, got:\n{lower}"
    );
}
