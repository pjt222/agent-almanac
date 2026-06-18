//! CLI-level integration tests for the `gather` subcommand — exercises the
//! compiled binary against the `claude-code` adapter (detected via `.claude/`).

use std::path::{Path, PathBuf};
use std::process::Command;

fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

fn run_gather(cwd: &Path, team: &str, dry_run: bool) -> (String, String, bool) {
    // Hermetic $HOME so home-based adapters (hermes/openclaw/vibe) can't touch
    // the developer's real home and detection is deterministic across machines.
    let home = tempfile::tempdir().unwrap();
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"));
    cmd.arg("gather")
        .arg(team)
        .arg("--root")
        .arg(almanac_root())
        .env("HOME", home.path());
    if dry_run {
        cmd.arg("--dry-run");
    }
    let out = cmd.current_dir(cwd).output().expect("binary runs");
    (
        String::from_utf8_lossy(&out.stdout).into_owned(),
        String::from_utf8_lossy(&out.stderr).into_owned(),
        out.status.success(),
    )
}

#[test]
fn gather_unknown_team_errors() {
    let project = tempfile::tempdir().unwrap();
    let (_stdout, stderr, ok) = run_gather(project.path(), "no-such-fire", false);
    assert!(!ok);
    assert!(
        stderr.contains("team: no-such-fire") || stderr.contains("unknown"),
        "got: {stderr}"
    );
}

#[test]
fn gather_in_empty_dir_runs_universal_only() {
    let project = tempfile::tempdir().unwrap();
    // tending is a small 4-member team — fast to gather.
    let (stdout, _stderr, ok) = run_gather(project.path(), "tending", false);
    assert!(ok, "exit clean, got: {stdout}");
    assert!(stdout.contains("Gathering `tending`"), "got: {stdout}");
    assert!(
        stdout.contains("universal:"),
        "universal should fire, got: {stdout}"
    );
    // claude-code wasn't detected — must not appear
    assert!(!stdout.contains("claude-code:"), "got: {stdout}");

    // State file written
    let state_path = project.path().join(".agent-almanac/state.json");
    assert!(state_path.exists(), "state file should exist");
    let raw = std::fs::read_to_string(&state_path).unwrap();
    assert!(
        raw.contains("\"tending\""),
        "state should record tending fire: {raw}"
    );
}

/// Extract `skillCount` for the `tending` fire from a project's state file.
fn tending_skill_count(project: &Path) -> usize {
    let raw = std::fs::read_to_string(project.join(".agent-almanac/state.json")).unwrap();
    let key = "\"skillCount\":";
    let idx = raw.find(key).expect("state has a skillCount field");
    raw[idx + key.len()..]
        .split([',', '\n', '}'])
        .next()
        .unwrap()
        .trim()
        .parse()
        .expect("skillCount is numeric")
}

/// `skillCount` must be the number of unique skills gathered — independent of how
/// many adapters install each one. Regression for the bug where the count was
/// incremented once per (skill × skill-installing-adapter), so a `.claude`
/// project (claude-code + universal) double-counted relative to an empty dir
/// (universal only).
#[test]
fn gather_skill_count_is_independent_of_adapter_count() {
    let one_adapter = tempfile::tempdir().unwrap();
    let (_o, _e, ok1) = run_gather(one_adapter.path(), "tending", false);
    assert!(ok1, "gather should succeed in an empty dir");
    let universal_only = tending_skill_count(one_adapter.path());

    let two_adapters = tempfile::tempdir().unwrap();
    std::fs::create_dir(two_adapters.path().join(".claude")).unwrap();
    let (_o, _e, ok2) = run_gather(two_adapters.path(), "tending", false);
    assert!(ok2, "gather should succeed in a .claude dir");
    let with_claude = tending_skill_count(two_adapters.path());

    assert!(universal_only > 0, "tending should gather some skills");
    assert_eq!(
        universal_only, with_claude,
        "skillCount must be the unique-skill count, not multiplied by adapter count \
         (universal-only={universal_only}, +claude-code={with_claude})"
    );
}

#[test]
fn gather_dry_run_writes_no_state() {
    let project = tempfile::tempdir().unwrap();
    let (stdout, _stderr, ok) = run_gather(project.path(), "tending", true);
    assert!(ok, "got: {stdout}");
    assert!(
        stdout.contains("(dry-run"),
        "should mark dry-run, got: {stdout}"
    );
    assert!(
        !project.path().join(".agent-almanac/state.json").exists(),
        "state file should NOT be written on dry-run"
    );
}
