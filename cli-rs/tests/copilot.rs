//! Integration tests for the GitHub Copilot adapter.
//!
//! Copilot installs skills as directory symlinks under `.github/skills/`.
//! Uninstall removes that symlink, or — for legacy installs — splices a marked
//! section out of `.github/copilot-instructions.md`. Skills only.

use std::fs;
use std::path::Path;

use agent_almanac_rs::adapters::base::{
    Action, ContentType, FrameworkAdapter, InstallCtx, InstallOptions, Item, Scope,
};
use agent_almanac_rs::adapters::copilot::Copilot;
use agent_almanac_rs::adapters::transformer::wrap_in_markers;

fn fake_almanac(root: &Path) {
    fs::create_dir_all(root.join("skills/demo-skill")).unwrap();
    fs::write(root.join("skills/demo-skill/SKILL.md"), "# demo skill").unwrap();
}

fn skill_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Skill,
        id: "demo-skill".to_string(),
        source_dir: almanac.join("skills/demo-skill"),
        domain: None,
    }
}

fn agent_item() -> Item {
    Item {
        kind: ContentType::Agent,
        id: "demo-agent".to_string(),
        source_dir: std::path::PathBuf::new(),
        domain: None,
    }
}

fn ctx<'a>(project: &'a Path, almanac: &'a Path, options: InstallOptions) -> InstallCtx<'a> {
    InstallCtx {
        project_dir: project,
        almanac_root: almanac,
        scope: Scope::Project,
        options,
    }
}

fn is_symlink(p: &Path) -> bool {
    fs::symlink_metadata(p)
        .map(|m| m.file_type().is_symlink())
        .unwrap_or(false)
}

#[test]
fn install_skill_creates_a_resolving_symlink() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Copilot
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    assert_eq!(r.action, Action::Created);
    let link = project.path().join(".github/skills/demo-skill");
    assert!(is_symlink(&link), "a symlink should exist at {link:?}");
    assert!(link.join("SKILL.md").exists(), "the symlink should resolve");
}

#[test]
fn install_is_idempotent_and_force_overwrites() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());

    let first = Copilot
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(first.action, Action::Created);

    let second = Copilot
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(second.action, Action::Skipped);

    let forced = Copilot
        .install(
            &item,
            &ctx(
                project.path(),
                almanac.path(),
                InstallOptions {
                    dry_run: false,
                    force: true,
                    pi_extensions: false,
                },
            ),
        )
        .unwrap();
    assert_eq!(forced.action, Action::Created);
}

#[test]
fn dry_run_touches_nothing() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Copilot
        .install(
            &skill_item(almanac.path()),
            &ctx(
                project.path(),
                almanac.path(),
                InstallOptions {
                    dry_run: true,
                    force: false,
                    pi_extensions: false,
                },
            ),
        )
        .unwrap();
    assert_eq!(r.action, Action::Created);
    assert!(
        !project.path().join(".github").exists(),
        "dry-run must not create .github"
    );
}

#[test]
fn uninstall_removes_the_modern_symlink() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());
    let opts = InstallOptions::default();

    Copilot
        .install(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    let removed = Copilot
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(!is_symlink(
        &project.path().join(".github/skills/demo-skill")
    ));

    let again = Copilot
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(again.action, Action::Skipped);
}

#[test]
fn uninstall_falls_back_to_the_legacy_marked_section() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    // Simulate a legacy install: a marked section in copilot-instructions.md,
    // and no `.github/skills/` symlink.
    let github = project.path().join(".github");
    fs::create_dir_all(&github).unwrap();
    let instr = github.join("copilot-instructions.md");
    let section = wrap_in_markers("skill", "demo-skill", "condensed skill body");
    fs::write(&instr, format!("# Copilot instructions\n\n{section}\n")).unwrap();

    let removed = Copilot
        .uninstall(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert_eq!(removed.path, instr);

    let after = fs::read_to_string(&instr).unwrap();
    assert!(
        !after.contains("demo-skill"),
        "the marked section should be spliced out: {after:?}"
    );
    assert!(after.contains("# Copilot instructions"), "preamble kept");
}

#[test]
fn agent_install_is_skipped_skills_only() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Copilot
        .install(
            &agent_item(),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Skipped);
    assert!(r.details.unwrap().contains("skills only"));
}

#[test]
fn list_installed_reports_the_skill() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    Copilot
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    let installed = Copilot
        .list_installed(project.path(), Scope::Project)
        .unwrap();
    assert!(installed
        .iter()
        .any(|i| i.kind == ContentType::Skill && i.id == "demo-skill"));
}

#[test]
fn audit_warns_when_empty_then_flags_a_broken_symlink() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let empty = Copilot.audit(project.path(), Scope::Project).unwrap();
    assert!(empty
        .warnings
        .iter()
        .any(|s| s == "No Copilot skills installed"));

    Copilot
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    let clean = Copilot.audit(project.path(), Scope::Project).unwrap();
    assert!(clean.ok.iter().any(|s| s.contains("1 skills installed")));
    assert!(clean.errors.is_empty());

    fs::remove_dir_all(almanac.path().join("skills/demo-skill")).unwrap();
    let broken = Copilot.audit(project.path(), Scope::Project).unwrap();
    assert!(
        broken.errors.iter().any(|s| s.contains("broken")),
        "audit should flag the broken symlink: {:?}",
        broken.errors
    );
}
