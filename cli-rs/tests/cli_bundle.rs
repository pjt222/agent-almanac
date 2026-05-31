//! CLI-level integration tests for the `bundle` subcommand — exercises the
//! compiled binary against the `ai-edge` adapter only (the sole adapter that
//! implements bundling).

use std::path::{Path, PathBuf};
use std::process::Command;

fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

fn run_bundle(cwd: &Path, framework: Option<&str>) -> (String, String, bool) {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"));
    cmd.arg("bundle").arg("--root").arg(almanac_root());
    if let Some(f) = framework {
        cmd.args(["--framework", f]);
    }
    let out = cmd.current_dir(cwd).output().expect("binary runs");
    (
        String::from_utf8_lossy(&out.stdout).into_owned(),
        String::from_utf8_lossy(&out.stderr).into_owned(),
        out.status.success(),
    )
}

#[test]
fn bundle_default_framework_writes_to_ai_edge_dir() {
    let project = tempfile::tempdir().unwrap();
    // Install one skill via the ai-edge adapter so bundle has something to read.
    let install = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["install", "skills", "commit-changes", "--root"])
        .arg(almanac_root())
        .current_dir(project.path())
        .output()
        .expect("install runs");
    assert!(install.status.success());

    // ai-edge only detects when `.ai-edge/` already exists, so the install above
    // won't have populated it. Seed the directory and run install once more.
    std::fs::create_dir(project.path().join(".ai-edge")).unwrap();
    let install2 = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["install", "skills", "commit-changes", "--root"])
        .arg(almanac_root())
        .current_dir(project.path())
        .output()
        .expect("install runs");
    assert!(install2.status.success());

    let (stdout, _stderr, ok) = run_bundle(project.path(), None);
    assert!(ok, "bundle should exit cleanly, got: {stdout}");
    assert!(stdout.contains("Bundle written"), "got: {stdout}");
    assert!(project.path().join(".ai-edge/bundle.md").exists());
}

#[test]
fn bundle_rejects_unknown_framework() {
    let project = tempfile::tempdir().unwrap();
    let (_stdout, stderr, ok) = run_bundle(project.path(), Some("claude-code"));
    assert!(!ok);
    assert!(
        stderr.contains("does not support bundling"),
        "got: {stderr}"
    );
}
