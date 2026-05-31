//! CLI-level integration tests for the `scatter` subcommand.

use std::path::{Path, PathBuf};
use std::process::Command;

fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

fn run_scatter(cwd: &Path, team: &str, dry_run: bool) -> (String, String, bool) {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"));
    cmd.arg("scatter")
        .arg(team)
        .arg("--root")
        .arg(almanac_root());
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
    assert!(out.status.success());
}

#[test]
fn scatter_when_not_burning_errors() {
    let project = tempfile::tempdir().unwrap();
    let (_stdout, stderr, ok) = run_scatter(project.path(), "tending", false);
    assert!(!ok);
    assert!(stderr.contains("not burning"), "got: {stderr}");
}

#[test]
fn scatter_removes_fire_from_state() {
    let project = tempfile::tempdir().unwrap();
    run_gather(project.path(), "tending");
    let state_path = project.path().join(".agent-almanac/state.json");
    assert!(state_path.exists());
    let before = std::fs::read_to_string(&state_path).unwrap();
    assert!(before.contains("\"tending\""));

    let (stdout, _stderr, ok) = run_scatter(project.path(), "tending", false);
    assert!(ok, "got: {stdout}");
    assert!(stdout.contains("Scattering `tending`"), "got: {stdout}");

    let after = std::fs::read_to_string(&state_path).unwrap();
    assert!(
        !after.contains("\"tending\""),
        "state should not list tending after scatter: {after}"
    );
}

#[test]
fn scatter_dry_run_keeps_state() {
    let project = tempfile::tempdir().unwrap();
    run_gather(project.path(), "tending");
    let state_path = project.path().join(".agent-almanac/state.json");
    let before = std::fs::read_to_string(&state_path).unwrap();

    let (stdout, _stderr, ok) = run_scatter(project.path(), "tending", true);
    assert!(ok, "got: {stdout}");
    assert!(stdout.contains("(dry-run"), "got: {stdout}");

    let after = std::fs::read_to_string(&state_path).unwrap();
    assert_eq!(before, after, "dry-run must not touch state");
}
