//! Integration tests for the OpenCode adapter.
//!
//! OpenCode installs skills as folder symlinks under `.opencode/skills/` and
//! agents as per-file symlinks under `.opencode/agents/<id>.md`. Teams and
//! guides are unsupported. Tests use project scope and `tempfile`.

use std::fs;
use std::path::Path;

use agent_almanac_rs::adapters::base::{
    Action, ContentType, FrameworkAdapter, InstallCtx, InstallOptions, Item, Scope,
};
use agent_almanac_rs::adapters::opencode::OpenCode;

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

    let r = OpenCode
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    assert_eq!(r.action, Action::Created);
    let link = project.path().join(".opencode/skills/demo-skill");
    assert!(is_symlink(&link), "a symlink should exist at {link:?}");
    assert!(link.join("SKILL.md").exists(), "the symlink should resolve");
}

#[test]
fn install_agent_creates_a_per_file_symlink() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = OpenCode
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    assert_eq!(r.action, Action::Created);
    let link = project.path().join(".opencode/agents/demo-agent.md");
    assert!(is_symlink(&link), "an agent file symlink should exist");
    assert_eq!(fs::read_to_string(&link).unwrap(), "# demo agent");
}

#[test]
fn install_is_idempotent_and_force_overwrites() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());

    let first = OpenCode
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(first.action, Action::Created);

    let second = OpenCode
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(second.action, Action::Skipped);

    let forced = OpenCode
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

    let r = OpenCode
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
        !project.path().join(".opencode").exists(),
        "dry-run must not create .opencode"
    );
}

#[test]
fn uninstall_skill_then_reports_not_installed() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());
    let opts = InstallOptions::default();

    OpenCode
        .install(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();

    let removed = OpenCode
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);

    let again = OpenCode
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(again.action, Action::Skipped);
}

#[test]
fn uninstall_agent_removes_the_file_symlink() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = agent_item(almanac.path());
    let opts = InstallOptions::default();

    OpenCode
        .install(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    let removed = OpenCode
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(!is_symlink(
        &project.path().join(".opencode/agents/demo-agent.md")
    ));
}

#[test]
fn team_install_is_skipped() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = OpenCode
        .install(
            &team_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Skipped);
    assert!(r.details.unwrap().contains("skills and agents only"));
}

#[test]
fn list_installed_reports_skills_and_agents() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    OpenCode
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    OpenCode
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    let installed = OpenCode
        .list_installed(project.path(), Scope::Project)
        .unwrap();
    assert!(installed
        .iter()
        .any(|i| i.kind == ContentType::Skill && i.id == "demo-skill"));
    assert!(installed
        .iter()
        .any(|i| i.kind == ContentType::Agent && i.id == "demo-agent"));
}

#[test]
fn audit_warns_when_empty_then_flags_a_broken_link() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let empty = OpenCode.audit(project.path(), Scope::Project).unwrap();
    assert!(empty
        .warnings
        .iter()
        .any(|s| s == "No OpenCode content installed"));

    OpenCode
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    let clean = OpenCode.audit(project.path(), Scope::Project).unwrap();
    assert!(clean.ok.iter().any(|s| s.contains("1 items installed")));
    assert!(clean.errors.is_empty());

    fs::remove_dir_all(almanac.path().join("skills/demo-skill")).unwrap();
    let broken = OpenCode.audit(project.path(), Scope::Project).unwrap();
    assert!(
        broken.errors.iter().any(|s| s.contains("broken")),
        "audit should flag the broken link: {:?}",
        broken.errors
    );
}
