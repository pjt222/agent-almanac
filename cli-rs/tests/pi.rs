//! Integration tests for the Pi adapter.
//!
//! Pi installs skills as folder symlinks under `.pi/skills/` (project) or
//! `~/.pi/agent/skills/` (global). Tests use project scope and `tempfile`.

use std::fs;
use std::path::Path;

use agent_almanac_rs::adapters::base::{
    Action, ContentType, FrameworkAdapter, InstallCtx, InstallOptions, Item, Scope,
};
use agent_almanac_rs::adapters::pi::Pi;

fn fake_almanac(root: &Path) {
    fs::create_dir_all(root.join("skills/demo-skill")).unwrap();
    fs::write(root.join("skills/demo-skill/SKILL.md"), "# demo skill").unwrap();
    fs::create_dir_all(root.join("agents")).unwrap();
    fs::write(root.join("agents/demo-agent.md"), "# demo agent").unwrap();
    fs::create_dir_all(root.join("teams")).unwrap();
    fs::write(root.join("teams/demo-team.md"), "# demo team").unwrap();
}

fn skill_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Skill,
        id: "demo-skill".to_string(),
        source_dir: almanac.join("skills/demo-skill"),
        domain: None,
    }
}

fn agent_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Agent,
        id: "demo-agent".to_string(),
        source_dir: almanac.join("agents"),
        domain: None,
    }
}

fn team_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Team,
        id: "demo-team".to_string(),
        source_dir: almanac.join("teams"),
        domain: None,
    }
}

/// `InstallOptions` with the Pi extension opt-in enabled.
fn ext_opts() -> InstallOptions {
    InstallOptions {
        dry_run: false,
        force: false,
        pi_extensions: true,
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

    let r = Pi
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    assert_eq!(r.action, Action::Created);
    let link = project.path().join(".pi/skills/demo-skill");
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

    let first = Pi
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(first.action, Action::Created);

    let second = Pi
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(second.action, Action::Skipped);

    let forced = Pi
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

    let r = Pi
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
        !project.path().join(".pi").exists(),
        "dry-run must not create .pi"
    );
}

#[test]
fn uninstall_removes_then_reports_not_installed() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());
    let opts = InstallOptions::default();

    Pi.install(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();

    let removed = Pi
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(!is_symlink(&project.path().join(".pi/skills/demo-skill")));

    let again = Pi
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(again.action, Action::Skipped);
}

#[test]
fn agent_install_is_skipped_without_the_opt_in() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    // Default options: pi_extensions is off.
    let r = Pi
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Skipped);
    assert!(
        r.details.unwrap().contains("--pi-extensions"),
        "the skip message should point at the opt-in flag"
    );
    assert!(!project.path().join(".pi").exists(), "no files written");
}

#[test]
fn agent_installs_as_an_extension_scaffold_with_the_opt_in() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Pi
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), ext_opts()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Created);

    let link = project
        .path()
        .join(".pi/extensions/demo-agent/demo-agent.md");
    assert!(
        is_symlink(&link),
        "expected an extension scaffold at {link:?}"
    );
    assert_eq!(fs::read_to_string(&link).unwrap(), "# demo agent");
}

#[test]
fn team_installs_as_an_extension_scaffold_with_the_opt_in() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Pi
        .install(
            &team_item(almanac.path()),
            &ctx(project.path(), almanac.path(), ext_opts()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Created);
    let link = project.path().join(".pi/extensions/demo-team/demo-team.md");
    assert!(is_symlink(&link));
    assert_eq!(fs::read_to_string(&link).unwrap(), "# demo team");
}

#[test]
fn uninstall_extension_removes_symlink_and_empty_dir() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = agent_item(almanac.path());

    Pi.install(&item, &ctx(project.path(), almanac.path(), ext_opts()))
        .unwrap();

    let removed = Pi
        .uninstall(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(
        !project.path().join(".pi/extensions/demo-agent").exists(),
        "an empty scaffold dir should be removed"
    );
}

#[test]
fn uninstall_extension_keeps_user_authored_files() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = agent_item(almanac.path());

    Pi.install(&item, &ctx(project.path(), almanac.path(), ext_opts()))
        .unwrap();

    // The user writes the Pi extension wrapper next to the scaffolded .md.
    let ext_dir = project.path().join(".pi/extensions/demo-agent");
    let user_file = ext_dir.join("index.ts");
    fs::write(&user_file, "export default () => {};").unwrap();

    let removed = Pi
        .uninstall(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(
        !is_symlink(&ext_dir.join("demo-agent.md")),
        "the scaffolded symlink is removed"
    );
    assert!(
        user_file.exists(),
        "a hand-written index.ts must NOT be destroyed"
    );
    assert!(removed.details.unwrap().contains("kept"));
}

#[test]
fn list_installed_reports_the_skill() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    Pi.install(
        &skill_item(almanac.path()),
        &ctx(project.path(), almanac.path(), InstallOptions::default()),
    )
    .unwrap();

    let installed = Pi.list_installed(project.path(), Scope::Project).unwrap();
    assert!(installed
        .iter()
        .any(|i| i.kind == ContentType::Skill && i.id == "demo-skill"));
}

#[test]
fn list_installed_includes_skills_and_extension_scaffolds() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    Pi.install(
        &skill_item(almanac.path()),
        &ctx(project.path(), almanac.path(), InstallOptions::default()),
    )
    .unwrap();
    Pi.install(
        &agent_item(almanac.path()),
        &ctx(project.path(), almanac.path(), ext_opts()),
    )
    .unwrap();

    let installed = Pi.list_installed(project.path(), Scope::Project).unwrap();
    assert!(
        installed
            .iter()
            .any(|i| i.kind == ContentType::Skill && i.id == "demo-skill"),
        "the skill should be listed"
    );
    assert!(
        installed.iter().any(|i| i.id == "demo-agent"),
        "the extension scaffold should be listed"
    );

    // Audit reports the scaffold alongside the skill.
    let audit = Pi.audit(project.path(), Scope::Project).unwrap();
    assert!(audit.ok.iter().any(|s| s.contains("1 skills installed")));
    assert!(audit.ok.iter().any(|s| s.contains("1 extension scaffolds")));
}

#[test]
fn audit_warns_when_empty_then_flags_a_broken_symlink() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let empty = Pi.audit(project.path(), Scope::Project).unwrap();
    assert!(empty
        .warnings
        .iter()
        .any(|s| s == "No Pi content installed"));

    Pi.install(
        &skill_item(almanac.path()),
        &ctx(project.path(), almanac.path(), InstallOptions::default()),
    )
    .unwrap();

    let clean = Pi.audit(project.path(), Scope::Project).unwrap();
    assert!(clean.ok.iter().any(|s| s.contains("1 skills installed")));
    assert!(clean.errors.is_empty());

    // Break the link by deleting the skill source.
    fs::remove_dir_all(almanac.path().join("skills/demo-skill")).unwrap();
    let broken = Pi.audit(project.path(), Scope::Project).unwrap();
    assert!(
        broken.errors.iter().any(|s| s.contains("broken")),
        "audit should flag the broken symlink: {:?}",
        broken.errors
    );
}
