//! OpenClaw / NemoClaw adapter — hybrid symlink + append-to-file, global only.
//!
//! Mirrors `cli/adapters/openclaw.js`. OpenClaw and the NVIDIA NemoClaw stack
//! share `~/.openclaw/workspace/`:
//!
//! - **Skills**: directory symlink at `~/.openclaw/workspace/<id>`.
//! - **Agents**: condensed agent section spliced into
//!   `~/.openclaw/workspace/AGENTS.md`, wrapped in `agent-almanac` marker
//!   comments. Re-install replaces the block; uninstall splices it out.
//! - **Teams / Guides**: not supported.
//!
//! Global location only — `scope` is ignored. `detect()` keys on
//! `~/.openclaw/openclaw.json` or a `~/.nemoclaw/` directory.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, remove_link, symlink_dir};
use super::transformer;
use crate::error::{Error, Result};

pub struct OpenClaw;

const MARKER_TYPE: &str = "agent";

impl OpenClaw {
    fn home() -> Result<PathBuf> {
        dirs::home_dir().ok_or(Error::Todo("no home dir"))
    }
    fn workspace_dir() -> Result<PathBuf> {
        Ok(Self::home()?.join(".openclaw/workspace"))
    }
    fn agents_file() -> Result<PathBuf> {
        Ok(Self::workspace_dir()?.join("AGENTS.md"))
    }

    fn install_skill(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let ws = Self::workspace_dir()?;
        let target = ws.join(&item.id);

        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: target,
                details: Some("dry-run".to_string()),
            });
        }
        if target.exists() && !ctx.options.force {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: target,
                details: Some("already exists".to_string()),
            });
        }
        fs::create_dir_all(&ws)?;
        if is_symlink(&target) || target.exists() {
            remove_link(&target)?;
        }
        // Global location → absolute link (matches Node, which never emits a
        // relative path here).
        symlink_dir(&item.source_dir, &target)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }

    fn install_agent(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let file = Self::agents_file()?;
        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: file,
                details: Some("dry-run: append to AGENTS.md".to_string()),
            });
        }
        fs::create_dir_all(Self::workspace_dir()?)?;
        let content = if file.exists() {
            fs::read_to_string(&file)?
        } else {
            String::new()
        };
        if transformer::has_marked_section(&content, MARKER_TYPE, &item.id) && !ctx.options.force {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: file,
                details: Some("already in AGENTS.md".to_string()),
            });
        }
        let content = transformer::remove_marked_section(&content, MARKER_TYPE, &item.id);
        let source = item.source_dir.join(format!("{}.md", item.id));
        let condensed = transformer::condense_agent(&source)?;
        let section = transformer::wrap_in_markers(MARKER_TYPE, &item.id, &condensed);
        let new_content = format!("{}\n\n{}\n", content.trim_end(), section);
        fs::write(&file, new_content)?;
        Ok(InstallResult {
            action: Action::Created,
            path: file,
            details: None,
        })
    }

    fn uninstall_skill(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let target = Self::workspace_dir()?.join(&item.id);
        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Removed,
                path: target,
                details: Some("dry-run".to_string()),
            });
        }
        if !target.exists() && !is_symlink(&target) {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: target,
                details: Some("not installed".to_string()),
            });
        }
        remove_link(&target)?;
        Ok(InstallResult {
            action: Action::Removed,
            path: target,
            details: None,
        })
    }

    fn uninstall_agent(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let file = Self::agents_file()?;
        if !file.exists() {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: file,
                details: Some("no AGENTS.md".to_string()),
            });
        }
        let content = fs::read_to_string(&file)?;
        if !transformer::has_marked_section(&content, MARKER_TYPE, &item.id) {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: file,
                details: Some("not in AGENTS.md".to_string()),
            });
        }
        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Removed,
                path: file,
                details: Some("dry-run".to_string()),
            });
        }
        let new_content = transformer::remove_marked_section(&content, MARKER_TYPE, &item.id);
        fs::write(&file, new_content)?;
        Ok(InstallResult {
            action: Action::Removed,
            path: file,
            details: None,
        })
    }
}

impl FrameworkAdapter for OpenClaw {
    fn id(&self) -> &'static str {
        "openclaw"
    }

    fn display_name(&self) -> &'static str {
        "OpenClaw/NemoClaw"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill, ContentType::Agent]
    }

    fn detect(&self, _project_dir: &Path) -> Result<bool> {
        let home = match dirs::home_dir() {
            Some(h) => h,
            None => return Ok(false),
        };
        Ok(home.join(".openclaw/openclaw.json").exists() || home.join(".nemoclaw").exists())
    }

    fn target_path(&self, _project_dir: &Path, _scope: Scope) -> Result<PathBuf> {
        Self::workspace_dir()
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent => self.install_agent(item, ctx),
            ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::workspace_dir()?,
                details: Some(format!("openclaw does not install {:?}s", item.kind)),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.uninstall_skill(item, ctx),
            ContentType::Agent => self.uninstall_agent(item, ctx),
            ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::workspace_dir()?,
                details: Some(format!("openclaw does not install {:?}s", item.kind)),
            }),
        }
    }

    fn list_installed(&self, _project_dir: &Path, _scope: Scope) -> Result<Vec<Item>> {
        let mut items = Vec::new();
        let ws = Self::workspace_dir()?;
        if ws.is_dir() {
            for entry in fs::read_dir(&ws)? {
                let entry = entry?;
                let name = entry.file_name();
                let name_str = name.to_string_lossy();
                if name_str == "AGENTS.md" {
                    continue;
                }
                if is_symlink(&entry.path()) {
                    items.push(Item {
                        kind: ContentType::Skill,
                        id: name_str.into_owned(),
                        source_dir: fs::read_link(entry.path()).unwrap_or_default(),
                        domain: None,
                    });
                }
            }
        }
        items.sort_by(|a, b| a.id.cmp(&b.id));
        Ok(items)
    }

    fn audit(&self, project_dir: &Path, scope: Scope) -> Result<AuditEntry> {
        let installed = self.list_installed(project_dir, scope)?;
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };
        if installed.is_empty() {
            entry
                .warnings
                .push("No skills in ~/.openclaw/workspace/".to_string());
        } else {
            entry
                .ok
                .push(format!("{} skills in workspace", installed.len()));
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    //! Tests use a custom `HOME` to keep file ops scoped to a tempdir; this is
    //! safe because the adapter resolves `~` via `dirs::home_dir()` which
    //! honors `HOME` on Linux. Tests are serialized (`serial_test`) because
    //! they mutate the process-wide environment.
    use super::*;
    use crate::adapters::base::InstallOptions;
    use serial_test::serial;

    fn skill_item(id: &str, source_dir: PathBuf) -> Item {
        Item {
            kind: ContentType::Skill,
            id: id.to_string(),
            source_dir,
            domain: Some("general".to_string()),
        }
    }

    fn agent_item(id: &str, source_dir: PathBuf) -> Item {
        Item {
            kind: ContentType::Agent,
            id: id.to_string(),
            source_dir,
            domain: None,
        }
    }

    fn write_skill(skills_root: &Path, id: &str) -> PathBuf {
        let skill_dir = skills_root.join(id);
        fs::create_dir_all(&skill_dir).unwrap();
        fs::write(skill_dir.join("SKILL.md"), "---\nname: demo\n---\n\nbody\n").unwrap();
        skill_dir
    }

    fn write_agent(agents_root: &Path, id: &str) -> PathBuf {
        fs::create_dir_all(agents_root).unwrap();
        fs::write(
            agents_root.join(format!("{id}.md")),
            "---\nname: demo-agent\n---\n\n## Purpose\n\nTest.\n\n## Capabilities\n\nNone.\n",
        )
        .unwrap();
        agents_root.to_path_buf()
    }

    fn ctx_global<'a>(project_dir: &'a Path) -> InstallCtx<'a> {
        InstallCtx {
            project_dir,
            almanac_root: project_dir,
            scope: Scope::Global,
            options: InstallOptions::default(),
        }
    }

    #[test]
    #[serial]
    fn detect_keys_on_openclaw_json_or_nemoclaw_dir() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        assert!(!OpenClaw.detect(home.path()).unwrap());

        fs::create_dir_all(home.path().join(".openclaw")).unwrap();
        fs::write(home.path().join(".openclaw/openclaw.json"), "{}").unwrap();
        assert!(OpenClaw.detect(home.path()).unwrap());

        let home2 = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home2.path());
        fs::create_dir(home2.path().join(".nemoclaw")).unwrap();
        assert!(OpenClaw.detect(home2.path()).unwrap());
    }

    #[test]
    #[serial]
    fn install_skill_writes_workspace_symlink() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let almanac = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&almanac.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir.clone());

        let result = OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        assert_eq!(result.action, Action::Created);
        let link = home.path().join(".openclaw/workspace/demo");
        assert!(is_symlink(&link));
        assert_eq!(fs::read_link(&link).unwrap(), skill_dir);
    }

    #[test]
    #[serial]
    fn install_skill_skips_when_present_without_force() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let almanac = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&almanac.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        let result = OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        assert_eq!(result.action, Action::Skipped);
    }

    #[test]
    #[serial]
    fn install_agent_appends_to_agents_md() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let almanac = tempfile::tempdir().unwrap();
        write_agent(&almanac.path().join("agents"), "demo-agent");
        let item = agent_item("demo-agent", almanac.path().join("agents"));

        let result = OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        assert_eq!(result.action, Action::Created);
        let agents_md = home.path().join(".openclaw/workspace/AGENTS.md");
        assert!(agents_md.is_file());
        let content = fs::read_to_string(&agents_md).unwrap();
        assert!(content.contains("<!-- agent-almanac:start:agent:demo-agent -->"));
        assert!(content.contains("## Purpose"));
    }

    #[test]
    #[serial]
    fn install_agent_skips_when_already_present() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let almanac = tempfile::tempdir().unwrap();
        write_agent(&almanac.path().join("agents"), "demo-agent");
        let item = agent_item("demo-agent", almanac.path().join("agents"));
        OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        let result = OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("already in AGENTS.md"));
    }

    #[test]
    #[serial]
    fn uninstall_skill_removes_symlink() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let almanac = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&almanac.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        let result = OpenClaw
            .uninstall(&item, &ctx_global(almanac.path()))
            .unwrap();
        assert_eq!(result.action, Action::Removed);
        assert!(!is_symlink(&home.path().join(".openclaw/workspace/demo")));
    }

    #[test]
    #[serial]
    fn uninstall_skill_idempotent_when_missing() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let item = skill_item("demo", home.path().join("skills/demo"));
        let result = OpenClaw.uninstall(&item, &ctx_global(home.path())).unwrap();
        assert_eq!(result.action, Action::Skipped);
    }

    #[test]
    #[serial]
    fn uninstall_agent_splices_section() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let almanac = tempfile::tempdir().unwrap();
        write_agent(&almanac.path().join("agents"), "demo-agent");
        let item = agent_item("demo-agent", almanac.path().join("agents"));
        OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();
        let result = OpenClaw
            .uninstall(&item, &ctx_global(almanac.path()))
            .unwrap();
        assert_eq!(result.action, Action::Removed);
        let content =
            fs::read_to_string(home.path().join(".openclaw/workspace/AGENTS.md")).unwrap();
        assert!(!content.contains("agent-almanac:start:agent:demo-agent"));
    }

    #[test]
    #[serial]
    fn uninstall_agent_idempotent_when_file_missing() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let item = agent_item("demo-agent", home.path().join("agents"));
        let result = OpenClaw.uninstall(&item, &ctx_global(home.path())).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("no AGENTS.md"));
    }

    #[test]
    #[serial]
    fn list_and_audit_report_installed_skills() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let almanac = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&almanac.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        OpenClaw
            .install(&item, &ctx_global(almanac.path()))
            .unwrap();

        // AGENTS.md should not show up in the listing.
        fs::write(home.path().join(".openclaw/workspace/AGENTS.md"), "# A").unwrap();
        let listed = OpenClaw.list_installed(home.path(), Scope::Global).unwrap();
        let ids: Vec<_> = listed.iter().map(|i| i.id.as_str()).collect();
        assert_eq!(ids, vec!["demo"]);

        let entry = OpenClaw.audit(home.path(), Scope::Global).unwrap();
        assert_eq!(entry.ok, vec!["1 skills in workspace".to_string()]);
    }

    #[test]
    #[serial]
    fn audit_warns_when_workspace_empty() {
        let home = tempfile::tempdir().unwrap();
        std::env::set_var("HOME", home.path());
        let entry = OpenClaw.audit(home.path(), Scope::Global).unwrap();
        assert_eq!(
            entry.warnings,
            vec!["No skills in ~/.openclaw/workspace/".to_string()]
        );
    }
}
