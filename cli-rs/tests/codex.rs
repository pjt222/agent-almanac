//! Integration tests for the Codex adapter.
//!
//! Codex is `append-to-file`: agent definitions are condensed and spliced into
//! `AGENTS.md` between `agent-almanac` marker comments. Each test builds a
//! throwaway almanac root and project dir with `tempfile`.

use std::fs;
use std::path::Path;

use agent_almanac_rs::adapters::base::{
    Action, ContentType, FrameworkAdapter, InstallCtx, InstallOptions, Item, Scope,
};
use agent_almanac_rs::adapters::codex::Codex;

/// An agent definition with both kept and dropped sections, so the condense
/// step has something to actually trim.
const DEMO_AGENT: &str = "\
---
name: demo-agent
---
# Demo Agent

## Purpose
Does demo things.

## Capabilities
- thing one

## Available Skills
- skill-a

## Limitations
- cannot fly
";

fn fake_almanac(root: &Path) {
    fs::create_dir_all(root.join("agents")).unwrap();
    fs::write(root.join("agents/demo-agent.md"), DEMO_AGENT).unwrap();
}

fn agent_item(almanac: &Path) -> Item {
    Item {
        kind: ContentType::Agent,
        id: "demo-agent".to_string(),
        source_dir: almanac.join("agents"),
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

#[test]
fn install_agent_appends_a_condensed_marked_section() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Codex
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Created);

    let doc = fs::read_to_string(project.path().join("AGENTS.md")).unwrap();
    assert!(doc.contains("<!-- agent-almanac:start:agent:demo-agent -->"));
    assert!(doc.contains("<!-- agent-almanac:end:agent:demo-agent -->"));
    assert!(doc.contains("Does demo things."), "kept Purpose");
    assert!(doc.contains("- skill-a"), "kept Available Skills");
    assert!(!doc.contains("cannot fly"), "dropped Limitations");
}

#[test]
fn install_is_idempotent_and_force_replaces() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = agent_item(almanac.path());

    let first = Codex
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(first.action, Action::Created);

    let second = Codex
        .install(
            &item,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(second.action, Action::Skipped);

    let forced = Codex
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

    // A forced re-install must not duplicate the section.
    let doc = fs::read_to_string(project.path().join("AGENTS.md")).unwrap();
    assert_eq!(
        doc.matches("<!-- agent-almanac:start:agent:demo-agent -->")
            .count(),
        1,
        "exactly one marked section after a forced re-install"
    );
}

#[test]
fn dry_run_does_not_write_agents_md() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Codex
        .install(
            &agent_item(almanac.path()),
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
    assert!(!project.path().join("AGENTS.md").exists());
}

#[test]
fn uninstall_splices_the_section_out() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());
    let item = agent_item(almanac.path());
    let opts = InstallOptions::default();

    Codex
        .install(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    let removed = Codex
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(removed.action, Action::Removed);

    let doc = fs::read_to_string(project.path().join("AGENTS.md")).unwrap();
    assert!(!doc.contains("agent-almanac:start:agent:demo-agent"));

    // Uninstalling again finds no section — a clean skip.
    let again = Codex
        .uninstall(&item, &ctx(project.path(), almanac.path(), opts))
        .unwrap();
    assert_eq!(again.action, Action::Skipped);
}

#[test]
fn uninstall_without_agents_md_is_a_skip() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let r = Codex
        .uninstall(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Skipped);
}

#[test]
fn skill_install_is_skipped_for_the_universal_adapter() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();

    let skill = Item {
        kind: ContentType::Skill,
        id: "demo-skill".to_string(),
        source_dir: almanac.path().join("skills/demo-skill"),
        domain: None,
    };
    let r = Codex
        .install(
            &skill,
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    assert_eq!(r.action, Action::Skipped);
    assert!(!project.path().join("AGENTS.md").exists());
}

#[test]
fn audit_warns_without_agents_md_then_reports_ok() {
    let almanac = tempfile::tempdir().unwrap();
    let project = tempfile::tempdir().unwrap();
    fake_almanac(almanac.path());

    let empty = Codex.audit(project.path(), Scope::Project).unwrap();
    assert!(empty.warnings.iter().any(|s| s == "No AGENTS.md found"));
    assert!(empty.ok.is_empty());

    Codex
        .install(
            &agent_item(almanac.path()),
            &ctx(project.path(), almanac.path(), InstallOptions::default()),
        )
        .unwrap();
    let populated = Codex.audit(project.path(), Scope::Project).unwrap();
    assert!(populated.ok.iter().any(|s| s == "AGENTS.md exists"));
    assert!(populated.warnings.is_empty());
}
