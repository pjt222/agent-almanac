//! CLI-level integration tests for the `tend` subcommand.

use std::path::{Path, PathBuf};
use std::process::Command;

fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

fn run_tend(cwd: &Path, dry_run: bool) -> (String, String, bool) {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"));
    cmd.arg("tend").arg("--root").arg(almanac_root());
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

fn run_gather(cwd: &Path, team: &str) {
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["gather", team, "--root"])
        .arg(almanac_root())
        .current_dir(cwd)
        .output()
        .expect("gather runs");
    assert!(
        out.status.success(),
        "gather should succeed: {}",
        String::from_utf8_lossy(&out.stdout)
    );
}

#[test]
fn tend_with_no_fires_prints_helpful_message() {
    let project = tempfile::tempdir().unwrap();
    let (stdout, _stderr, ok) = run_tend(project.path(), false);
    assert!(ok);
    assert!(stdout.contains("No fires to tend"), "got: {stdout}");
}

#[test]
fn tend_reports_burning_fire_after_gather() {
    let project = tempfile::tempdir().unwrap();
    run_gather(project.path(), "tending");
    let (stdout, _stderr, ok) = run_tend(project.path(), false);
    assert!(ok);
    assert!(stdout.contains("Tending 1 campfire"), "got: {stdout}");
    assert!(stdout.contains("tending"), "got: {stdout}");
    assert!(stdout.contains("burning"), "got: {stdout}");
}

#[test]
fn tend_dry_run_does_not_warm() {
    let project = tempfile::tempdir().unwrap();
    run_gather(project.path(), "tending");
    let state_path = project.path().join(".agent-almanac/state.json");
    let before = std::fs::read_to_string(&state_path).unwrap();
    // Tiny sleep so an actual warm would change last_warmed.
    std::thread::sleep(std::time::Duration::from_millis(20));
    let (_stdout, _stderr, ok) = run_tend(project.path(), true);
    assert!(ok);
    let after = std::fs::read_to_string(&state_path).unwrap();
    assert_eq!(before, after, "dry-run must not touch state");
}
