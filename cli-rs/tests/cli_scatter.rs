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
    // Hermetic $HOME (home-based adapters must not touch the real home).
    let home = tempfile::tempdir().unwrap();
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"));
    cmd.arg("scatter")
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

fn run_gather(cwd: &Path, team: &str) {
    let home = tempfile::tempdir().unwrap();
    let out = Command::new(env!("CARGO_BIN_EXE_agent-almanac-rs"))
        .args(["gather", team, "--root"])
        .arg(almanac_root())
        .env("HOME", home.path())
        .current_dir(cwd)
        .output()
        .expect("gather runs");
    assert!(out.status.success());
}

/// The set of skill ids installed under the universal `.agents/skills/` tree.
fn installed_skills(project: &Path) -> std::collections::BTreeSet<String> {
    let mut set = std::collections::BTreeSet::new();
    if let Ok(rd) = std::fs::read_dir(project.join(".agents/skills")) {
        for e in rd.flatten() {
            set.insert(e.file_name().to_string_lossy().into_owned());
        }
    }
    set
}

/// Scattering one fire must KEEP every skill still needed by another burning
/// fire (the `kept_skills` cross-fire-sharing branch — previously uncovered, and
/// touched by the collect refactor). `r-package-review` and `scrum-team` share
/// agents (code-reviewer, senior-software-developer) plus the inherited default
/// skills, so scattering scrum-team must return the install set to exactly
/// r-package-review's footprint — never less.
#[test]
fn scatter_keeps_skills_shared_with_other_fires() {
    let project = tempfile::tempdir().unwrap();

    run_gather(project.path(), "r-package-review");
    let needed_by_remaining = installed_skills(project.path());
    assert!(
        !needed_by_remaining.is_empty(),
        "gather should install skills under .agents/skills"
    );

    run_gather(project.path(), "scrum-team");
    let both = installed_skills(project.path());
    assert!(
        both.len() > needed_by_remaining.len(),
        "scrum-team should add at least one unique skill, else the test proves nothing \
         (r-pkg={}, both={})",
        needed_by_remaining.len(),
        both.len()
    );

    let (stdout, _e, ok) = run_scatter(project.path(), "scrum-team", false);
    assert!(ok, "scatter should succeed: {stdout}");

    let after = installed_skills(project.path());
    assert_eq!(
        after, needed_by_remaining,
        "scatter must keep exactly the skills the still-burning r-package-review fire needs"
    );

    let state = std::fs::read_to_string(project.path().join(".agent-almanac/state.json")).unwrap();
    assert!(
        !state.contains("\"scrum-team\""),
        "scrum-team fire should be removed: {state}"
    );
    assert!(
        state.contains("\"r-package-review\""),
        "r-package-review fire should still burn: {state}"
    );
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
