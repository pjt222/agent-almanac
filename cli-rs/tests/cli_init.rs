//! CLI-level integration tests for the `init` subcommand.

use std::path::{Path, PathBuf};
use std::process::Command;

fn almanac_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("cli-rs has a parent")
        .to_path_buf()
}

fn run_init(cwd: &Path) -> (String, bool) {
    // Hermetic $HOME: `init` runs framework detection, which stats home-based
    // adapters (hermes/openclaw); keep it off the developer's real home.
    let home = tempfile::tempdir().unwrap();
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["init", "--root"])
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
fn init_writes_manifest_in_cwd() {
    let project = tempfile::tempdir().unwrap();
    let (stdout, ok) = run_init(project.path());
    assert!(ok, "got: {stdout}");
    let path = project.path().join("agent-almanac.yml");
    assert!(path.exists());
    let body = std::fs::read_to_string(&path).unwrap();
    assert!(body.contains("version:"), "got: {body}");
    assert!(body.contains("skills:"), "got: {body}");
    assert!(
        body.contains("# Add skill"),
        "should include placeholder, got: {body}"
    );
}

#[test]
fn init_records_detected_frameworks() {
    let project = tempfile::tempdir().unwrap();
    // Seed a claude-code marker so the adapter detects.
    std::fs::create_dir(project.path().join(".claude")).unwrap();
    let (stdout, ok) = run_init(project.path());
    assert!(ok, "got: {stdout}");
    let body = std::fs::read_to_string(project.path().join("agent-almanac.yml")).unwrap();
    assert!(
        body.contains("claude-code"),
        "expected claude-code in frameworks, got:\n{body}"
    );
    // Universal must be filtered out — it always detects and would be noisy.
    assert!(
        !body.contains("- universal"),
        "universal should be filtered, got:\n{body}"
    );
}
