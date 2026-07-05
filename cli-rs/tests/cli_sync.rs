//! CLI-level integration tests for the `sync` subcommand.

use std::path::{Path, PathBuf};
use std::process::Command;

fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

fn run_init(cwd: &Path) {
    let home = tempfile::tempdir().unwrap();
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["init", "--root"])
        .arg(almanac_root())
        .env("HOME", home.path())
        .current_dir(cwd)
        .output()
        .expect("init runs");
    assert!(out.status.success());
}

fn run_sync(cwd: &Path, dry_run: bool) -> (String, String, bool) {
    // Hermetic $HOME (home-based adapters must not touch the real home).
    let home = tempfile::tempdir().unwrap();
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"));
    cmd.arg("sync")
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

fn write_manifest(cwd: &Path, body: &str) {
    std::fs::write(cwd.join("agent-almanac.yml"), body).unwrap();
}

#[test]
fn sync_errors_without_manifest() {
    let project = tempfile::tempdir().unwrap();
    let (_stdout, stderr, ok) = run_sync(project.path(), false);
    assert!(!ok);
    assert!(stderr.contains("agent-almanac.yml"), "got: {stderr}");
}

#[test]
fn sync_installs_desired_skills() {
    let project = tempfile::tempdir().unwrap();
    write_manifest(
        project.path(),
        "version: '1.0'\nskills:\n  - commit-changes\n",
    );
    let (stdout, _stderr, ok) = run_sync(project.path(), false);
    assert!(ok, "got: {stdout}");
    assert!(
        project
            .path()
            .join(".agents/skills/commit-changes")
            .exists(),
        "universal install should have created the skill symlink"
    );
}

#[test]
fn sync_removes_extras_via_universal() {
    let project = tempfile::tempdir().unwrap();
    // First write a manifest that includes a skill so it gets installed.
    write_manifest(
        project.path(),
        "version: '1.0'\nskills:\n  - commit-changes\n",
    );
    let (_, _, ok) = run_sync(project.path(), false);
    assert!(ok);
    assert!(project
        .path()
        .join(".agents/skills/commit-changes")
        .exists());

    // Now rewrite the manifest to drop that skill — sync should remove it.
    write_manifest(project.path(), "version: '1.0'\nskills: []\n");
    let (stdout, _, ok) = run_sync(project.path(), false);
    assert!(ok, "got: {stdout}");
    assert!(
        !project
            .path()
            .join(".agents/skills/commit-changes")
            .exists(),
        "the extra skill should have been removed, stdout was: {stdout}"
    );
}

#[test]
fn sync_dry_run_makes_no_changes() {
    let project = tempfile::tempdir().unwrap();
    run_init(project.path());
    // init's manifest contains only `#` placeholders — sync should find
    // nothing to install or remove.
    let (stdout, _, ok) = run_sync(project.path(), true);
    assert!(ok, "got: {stdout}");
    assert!(stdout.contains("(dry-run"), "got: {stdout}");
    assert!(
        !project.path().join(".agents").exists(),
        "no install on dry-run"
    );
}
