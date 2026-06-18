//! CLI-level integration tests for `install` — exercises the compiled binary
//! to verify the detect-gating in `command_install`: installs land only in
//! frameworks actually present in the working directory.

use std::path::{Path, PathBuf};
use std::process::Command;

/// The almanac repository root (the parent of `cli-rs/`).
fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

/// Run the compiled binary in `cwd`; return (stdout, success).
fn run_install(cwd: &Path) -> (String, bool) {
    // Hermetic $HOME: home-based adapters (hermes/openclaw/vibe) detect via the
    // home dir, so an empty throwaway home keeps the binary off the developer's
    // real `~/.hermes` etc. and makes detection deterministic across machines.
    let home = tempfile::tempdir().unwrap();
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["install", "skills", "commit-changes", "--root"])
        .arg(almanac_root())
        .env("HOME", home.path())
        .current_dir(cwd)
        .output()
        .expect("binary runs");
    (
        String::from_utf8_lossy(&out.stdout).into_owned(),
        out.status.success(),
    )
}

#[test]
fn install_in_an_empty_dir_only_runs_universal() {
    // The universal adapter always detects (it owns `.agents/skills/`, the
    // cross-client interop path). In an otherwise empty directory it is the
    // only framework that installs — no `.claude/`, no `.hermes/`, etc.
    let project = tempfile::tempdir().unwrap();
    let (stdout, ok) = run_install(project.path());

    assert!(ok, "command should exit cleanly");
    assert!(
        stdout.contains("universal:"),
        "universal should have installed, got: {stdout}"
    );
    assert!(
        project
            .path()
            .join(".agents/skills/commit-changes")
            .exists(),
        "the skill symlink should resolve under .agents/skills/"
    );
    // No framework-specific adapter detected → no framework-specific tree.
    assert!(!project.path().join(".claude").exists());
    assert!(!project.path().join(".hermes").exists());
    assert!(!stdout.contains("claude-code:"));
    assert!(!stdout.contains("hermes:"));
}

#[test]
fn install_targets_only_the_detected_framework() {
    let project = tempfile::tempdir().unwrap();
    // Mark the directory as a Claude Code project — but not a Hermes one.
    std::fs::create_dir(project.path().join(".claude")).unwrap();

    let (stdout, ok) = run_install(project.path());

    assert!(ok, "command should exit cleanly");
    assert!(
        stdout.contains("claude-code:"),
        "claude-code should have installed, got: {stdout}"
    );
    assert!(
        project
            .path()
            .join(".claude/skills/commit-changes")
            .exists(),
        "the skill symlink should resolve under .claude"
    );
    // Hermes was not detected — it must not have written its tree.
    assert!(
        !project.path().join(".hermes").exists(),
        "hermes was undetected; .hermes must not be created"
    );
    assert!(
        !stdout.contains("hermes:"),
        "hermes should not appear in the report, got: {stdout}"
    );
}

/// The uninstall path has no registry to validate ids against, so a crafted
/// traversal id would otherwise reach an adapter's `fs::remove_file`. The
/// central `validate_item_id` guard must reject it before any filesystem work —
/// before even the detect-gate — and exit non-zero.
#[test]
fn uninstall_rejects_path_traversal_id() {
    let project = tempfile::tempdir().unwrap();
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["uninstall", "skills", "../../../etc/hosts"])
        .env("HOME", project.path())
        .current_dir(project.path())
        .output()
        .expect("binary runs");

    assert!(
        !out.status.success(),
        "a traversal id must be rejected, not silently processed"
    );
    let stderr = String::from_utf8_lossy(&out.stderr).to_lowercase();
    assert!(
        stderr.contains("invalid item id"),
        "expected an invalid-id error, got: {stderr}"
    );
}
