//! Integration tests for the claude-code adapter.
//!
//! Each test builds a throwaway almanac root and a throwaway project dir with
//! `tempfile`, installs into the project's `.claude/`, and asserts on the
//! resulting symlinks — fully reproducible on Linux, no real `~/.claude`.

use std::fs;
use std::path::Path;

use agent_almanac_rs::adapters::base::{
    Action, ContentType, FrameworkAdapter, InstallCtx, InstallOptions, Item, Scope,
};
use agent_almanac_rs::adapters::claude_code::ClaudeCode;

/// Lay down a minimal almanac root: one skill, one agent.
fn fake_almanac(root: &Path) {
    fs::create_dir_all(root.join("skills/demo-skill")).unwrap();
    fs::write(root.join("skills/demo-skill/SKILL.md"), "# demo skill").unwrap();
    fs::create_dir_all(root.join("agents")).unwrap();
    fs::write(root.join("agents/demo-agent.md"), "# demo agent").unwrap();
}

fn skill_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Skill,
        id: "demo-skill".to_string(),
        source_dir: almanac.join("skills/demo-skill"),
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

    let r = ClaudeCode
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    assert_eq!(r.action, Action::Created);
    let link = project.path().join(".claude/skills/demo-skill");
    assert!(is_symlink(&link), "a symlink should exist at {link:?}");
    assert!(
        link.join("SKILL.md").exists(),
        "the symlink should resolve to the skill directory"
    );
}

#[test]
fn install_is_idempotent_and_force_overwrites() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());

    let first = ClaudeCode
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(first.action, Action::Created);

    // A second plain install finds the live symlink and skips.
    let second = ClaudeCode
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(second.action, Action::Skipped);

    // With --force it is replaced.
    let forced = ClaudeCode
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

    let r = ClaudeCode
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
        !project.path().join(".claude").exists(),
        "dry-run must not create .claude"
    );
}

#[test]
fn uninstall_removes_then_reports_not_installed() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());
    let opts = InstallOptions::default();

    ClaudeCode
        .install(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();

    let removed = ClaudeCode
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(!is_symlink(
        &project.path().join(".claude/skills/demo-skill")
    ));

    // Uninstalling again is a no-op skip, not an error.
    let again = ClaudeCode
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(again.action, Action::Skipped);
}

#[test]
fn install_agents_links_the_whole_directory() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let item = Item {
        kind: ContentType::Agent,
        id: "demo-agent".to_string(),
        source_dir: almanac.path().join("agents"),
        domain: None,
    };
    let r = ClaudeCode
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Created);

    let link = project.path().join(".claude/agents");
    assert!(is_symlink(&link));
    assert!(
        link.join("demo-agent.md").exists(),
        "agents symlink should resolve to the agents directory"
    );
}

#[test]
fn list_installed_reports_skills_and_agents() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let opts = InstallOptions::default();

    ClaudeCode
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), opts),
        )
        .unwrap();
    ClaudeCode
        .install(
            &Item {
                kind: ContentType::Agent,
                id: "demo-agent".to_string(),
                source_dir: almanac.path().join("agents"),
                domain: None,
            },
            &ctx(project.path(), almanac.path(), opts),
        )
        .unwrap();

    let installed = ClaudeCode
        .list_installed(project.path(), Scope::Project)
        .unwrap();
    assert!(installed
        .iter()
        .any(|i| i.kind == ContentType::Skill && i.id == "demo-skill"));
    assert!(installed
        .iter()
        .any(|i| i.kind == ContentType::Agent && i.id == "agents"));
}

#[test]
fn audit_reports_valid_then_flags_a_broken_symlink() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    ClaudeCode
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    // Healthy install: one OK line, no errors.
    let clean = ClaudeCode.audit(project.path(), Scope::Project).unwrap();
    assert!(clean.ok.iter().any(|s| s.contains("1 skills installed")));
    assert!(clean.errors.is_empty(), "clean install: {:?}", clean.errors);

    // Break the link by deleting the skill's source directory.
    fs::remove_dir_all(almanac.path().join("skills/demo-skill")).unwrap();
    let broken = ClaudeCode.audit(project.path(), Scope::Project).unwrap();
    assert!(
        broken.errors.iter().any(|s| s.contains("broken")),
        "audit should flag the broken symlink: {:?}",
        broken.errors
    );
}
