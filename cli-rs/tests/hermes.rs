//! Integration tests for the Hermes adapter.
//!
//! Hermes is global-only: it installs into `~/.hermes/` regardless of the
//! requested scope (matching Node `hermes.js`, which hardcodes `homedir()`).
//! Each test redirects `$HOME` to a tempdir — `dirs::home_dir()` honours `$HOME`
//! on Linux — so file operations stay scoped and reproducible without touching a
//! real `~/.hermes`. `$HOME` is process-global, so the tests are serialized with
//! `serial_test`.

use std::fs;
use std::path::Path;

use agent_almanac_rs::adapters::base::{
    Action, ContentType, FrameworkAdapter, InstallCtx, InstallOptions, Item, Scope,
};
use agent_almanac_rs::adapters::hermes::Hermes;
use serial_test::serial;

/// Redirect `$HOME` for the duration of a test and restore it on drop, so a
/// redirected test can never leak into a sibling that reads the home directory.
struct HomeGuard {
    prev: Option<std::ffi::OsString>,
}

impl HomeGuard {
    fn set(home: &Path) -> Self {
        let prev = std::env::var_os("HOME");
        std::env::set_var("HOME", home);
        HomeGuard { prev }
    }
}

impl Drop for HomeGuard {
    fn drop(&mut self) {
        match &self.prev {
            Some(v) => std::env::set_var("HOME", v),
            None => std::env::remove_var("HOME"),
        }
    }
}

/// Lay down a minimal almanac root: one skill, one agent.
fn fake_almanac(root: &Path) {
    fs::create_dir_all(root.join("skills/demo-skill")).unwrap();
    fs::write(root.join("skills/demo-skill/SKILL.md"), "# demo skill").unwrap();
    fs::create_dir_all(root.join("agents")).unwrap();
    fs::write(root.join("agents/demo-agent.md"), "# demo agent").unwrap();
}

/// A skill item carrying its domain — the normal install path.
fn skill_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Skill,
        id: "demo-skill".to_string(),
        source_dir: almanac.join("skills/demo-skill"),
        domain: Some("git".to_string()),
    }
}

/// An agent item: `source_dir` is the almanac `agents/` directory, as
/// `resolve_item` sets it.
fn agent_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Agent,
        id: "demo-agent".to_string(),
        source_dir: almanac.join("agents"),
        domain: None,
    }
}

/// Build a ctx with `Scope::Project` on purpose: Hermes must ignore it and
/// install globally regardless. The `project_dir` is otherwise unused.
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
#[serial]
fn install_lands_in_home_not_project_even_for_project_scope() {
    // Regression guard for the project-scope bug: a default (`Scope::Project`)
    // install must land in `~/.hermes`, never in the project's `./.hermes`
    // (which Hermes never reads).
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Hermes
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();

    assert_eq!(r.action, Action::Created);
    let link = home.path().join(".hermes/skills/git/demo-skill");
    assert!(is_symlink(&link), "a symlink should exist at {link:?}");
    assert!(
        link.join("SKILL.md").exists(),
        "the symlink should resolve to the skill directory"
    );
    assert!(
        !project.path().join(".hermes").exists(),
        "Hermes must never write into the project dir — it is global-only"
    );
}

#[test]
#[serial]
fn install_is_idempotent_and_force_overwrites() {
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());

    let first = Hermes
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(first.action, Action::Created);

    let second = Hermes
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(second.action, Action::Skipped);

    let forced = Hermes
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
#[serial]
fn dry_run_touches_nothing() {
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Hermes
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
        !home.path().join(".hermes").exists(),
        "dry-run must not create .hermes"
    );
}

#[test]
#[serial]
fn install_agent_creates_a_per_file_symlink() {
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Hermes
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Created);

    let link = home.path().join(".hermes/agents/demo-agent.md");
    assert!(is_symlink(&link), "expected a file symlink at {link:?}");
    assert_eq!(fs::read_to_string(&link).unwrap(), "# demo agent");
}

#[test]
#[serial]
fn skill_without_domain_falls_back_to_general() {
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let mut item = skill_item(almanac.path());
    item.domain = None;
    let r = Hermes
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Created);
    assert!(is_symlink(
        &home.path().join(".hermes/skills/general/demo-skill")
    ));
}

#[test]
#[serial]
fn uninstall_removes_a_known_domain_skill() {
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = skill_item(almanac.path());
    let opts = InstallOptions::default();

    Hermes
        .install(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    let removed = Hermes
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(!is_symlink(
        &home.path().join(".hermes/skills/git/demo-skill")
    ));
}

#[test]
#[serial]
fn uninstall_scans_for_domain_when_unknown() {
    // The CLI uninstall path has no registry, so the Item arrives with
    // `domain: None`. The adapter must still find a skill installed under its
    // real domain by scanning the install tree.
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let opts = InstallOptions::default();

    // Installed under domain "git"...
    Hermes
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), opts),
        )
        .unwrap();

    // ...uninstalled with the domain unknown.
    let domainless = Item {
        kind: ContentType::Skill,
        id: "demo-skill".to_string(),
        source_dir: std::path::PathBuf::new(),
        domain: None,
    };
    let removed = Hermes
        .uninstall(&domainless, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);
    assert!(!is_symlink(
        &home.path().join(".hermes/skills/git/demo-skill")
    ));

    // A second uninstall is a clean skip, not an error.
    let again = Hermes
        .uninstall(&domainless, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(again.action, Action::Skipped);
}

#[test]
#[serial]
fn list_installed_reports_skills_with_domain_and_agents() {
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let opts = InstallOptions::default();

    Hermes
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), opts),
        )
        .unwrap();
    Hermes
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), opts),
        )
        .unwrap();

    let installed = Hermes
        .list_installed(project.path(), Scope::Project)
        .unwrap();
    assert!(installed.iter().any(|i| i.kind == ContentType::Skill
        && i.id == "demo-skill"
        && i.domain.as_deref() == Some("git")));
    assert!(installed
        .iter()
        .any(|i| i.kind == ContentType::Agent && i.id == "demo-agent"));
}

#[test]
#[serial]
fn audit_warns_when_empty_then_counts_when_populated() {
    let home = tempfile::tempdir().unwrap();
    let _h = HomeGuard::set(home.path());
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let opts = InstallOptions::default();

    let empty = Hermes.audit(project.path(), Scope::Project).unwrap();
    assert!(empty
        .warnings
        .iter()
        .any(|s| s == "No Hermes content installed"));
    assert!(empty.ok.is_empty());

    Hermes
        .install(
            &skill_item(almanac.path()),
            &ctx(project.path(), almanac.path(), opts),
        )
        .unwrap();
    let populated = Hermes.audit(project.path(), Scope::Project).unwrap();
    assert!(populated.ok.iter().any(|s| s.contains("1 items installed")));
    assert!(populated.warnings.is_empty());
}
