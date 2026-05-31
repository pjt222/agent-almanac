//! Universal `.agents/skills/` adapter — the de facto cross-client path.
//!
//! Mirrors the Node CLI's `cli/adapters/universal.js`. `.agents/skills/<id>` is
//! the agentskills.io-compliant interoperability layout consumed by OpenCode,
//! Cursor, Copilot, Gemini CLI, Vibe, Autohand, Letta, and other clients. The
//! universal adapter always detects (every project is a candidate) — it is the
//! fallback path other adapters defer to when they say "skills handled by the
//! universal adapter".
//!
//! - **Skills**: `<scope>/.agents/skills/<id>` symlink. Project scope writes to
//!   `<project>/.agents/skills/`, global to `~/.agents/skills/`. Relative link
//!   for project/workspace (survives a repo move), absolute for global.
//! - **Agents / Teams / Guides**: not supported (framework-specific).

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, link_target, remove_link, symlink_dir};
use crate::error::{Error, Result};

pub struct Universal;

impl Universal {
    fn skills_base(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.target_path(project_dir, scope)?.join("skills"))
    }

    fn install_skill(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let skills_dir = self.skills_base(ctx.project_dir, ctx.scope)?;
        let target = skills_dir.join(&item.id);

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
        // Create the dir before `link_target` — it canonicalizes `skills_dir`.
        fs::create_dir_all(&skills_dir)?;
        if is_symlink(&target) || target.exists() {
            remove_link(&target)?;
        }
        let link = link_target(&item.source_dir, &skills_dir, ctx.scope)?;
        symlink_dir(&link, &target)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }
}

impl FrameworkAdapter for Universal {
    fn id(&self) -> &'static str {
        "universal"
    }

    fn display_name(&self) -> &'static str {
        "Universal (.agents/)"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill]
    }

    /// Always detects — `.agents/skills/` is the universal interop path, valid
    /// in any project. The install detect-gate (`command_install`) uses this to
    /// guarantee the universal adapter always runs alongside framework-specific
    /// adapters.
    fn detect(&self, _project_dir: &Path) -> Result<bool> {
        Ok(true)
    }

    fn target_path(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(match scope {
            Scope::Global => dirs::home_dir()
                .ok_or(Error::Todo("no home dir"))?
                .join(".agents"),
            _ => project_dir.join(".agents"),
        })
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent | ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("Universal adapter only supports skills".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind != ContentType::Skill {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("Universal adapter only supports skills".to_string()),
            });
        }
        let target = self.skills_base(ctx.project_dir, ctx.scope)?.join(&item.id);
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

    fn list_installed(&self, project_dir: &Path, scope: Scope) -> Result<Vec<Item>> {
        let mut items = Vec::new();
        let skills_dir = self.skills_base(project_dir, scope)?;
        if skills_dir.is_dir() {
            for entry in fs::read_dir(&skills_dir)? {
                let entry = entry?;
                let path = entry.path();
                if is_symlink(&path) {
                    items.push(Item {
                        kind: ContentType::Skill,
                        id: entry.file_name().to_string_lossy().into_owned(),
                        source_dir: fs::read_link(&path).unwrap_or_default(),
                        domain: None,
                    });
                }
            }
        }
        items.sort_by(|a, b| a.id.cmp(&b.id));
        Ok(items)
    }

    fn audit(&self, project_dir: &Path, scope: Scope) -> Result<AuditEntry> {
        let skills_dir = self.skills_base(project_dir, scope)?;
        let installed = self.list_installed(project_dir, scope)?;
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };

        let (mut valid, mut broken_ids) = (0usize, Vec::new());
        for item in &installed {
            if skills_dir.join(&item.id).exists() {
                valid += 1;
            } else {
                broken_ids.push(item.id.clone());
            }
        }
        if valid > 0 {
            entry.ok.push(format!("{valid} skills installed"));
        }
        if !broken_ids.is_empty() {
            entry.errors.push(format!(
                "{} broken symlinks: {}",
                broken_ids.len(),
                broken_ids.join(", ")
            ));
        }
        if installed.is_empty() {
            entry
                .warnings
                .push("No skills installed in .agents/skills/".to_string());
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapters::base::InstallOptions;

    fn skill_item(id: &str, source_dir: PathBuf) -> Item {
        Item {
            kind: ContentType::Skill,
            id: id.to_string(),
            source_dir,
            domain: Some("general".to_string()),
        }
    }

    fn write_skill(skills_root: &Path, id: &str) -> PathBuf {
        let skill_dir = skills_root.join(id);
        fs::create_dir_all(&skill_dir).unwrap();
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: demo\n---\n\n## When to Use\n\nIn tests.\n",
        )
        .unwrap();
        skill_dir
    }

    #[test]
    fn detect_always_true() {
        let dir = tempfile::tempdir().unwrap();
        assert!(Universal.detect(dir.path()).unwrap());
    }

    #[test]
    fn content_types_are_skills_only() {
        assert!(Universal.supports(ContentType::Skill));
        assert!(!Universal.supports(ContentType::Agent));
        assert!(!Universal.supports(ContentType::Team));
        assert!(!Universal.supports(ContentType::Guide));
    }

    #[test]
    fn install_creates_relative_symlink_into_dot_agents() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir.clone());
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        let result = Universal.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Created);
        let target = dir.path().join(".agents/skills/demo");
        assert!(is_symlink(&target));
        // Relative link survives a repo move; absolute would point off-disk.
        let link = fs::read_link(&target).unwrap();
        assert!(link.is_relative(), "expected relative link, got {link:?}");
    }

    #[test]
    fn install_skips_if_already_present() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        Universal.install(&item, &ctx).unwrap();
        let result = Universal.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("already exists"));
    }

    #[test]
    fn install_replaces_when_forced() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let opts = InstallOptions {
            force: true,
            ..Default::default()
        };
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: opts,
        };

        Universal.install(&item, &ctx).unwrap();
        let result = Universal.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Created);
    }

    #[test]
    fn uninstall_removes_symlink() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        Universal.install(&item, &ctx).unwrap();
        let result = Universal.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Removed);
        assert!(!is_symlink(&dir.path().join(".agents/skills/demo")));
    }

    #[test]
    fn uninstall_is_idempotent_when_missing() {
        let dir = tempfile::tempdir().unwrap();
        let item = skill_item("demo", dir.path().join("skills/demo"));
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        let result = Universal.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("not installed"));
    }

    #[test]
    fn list_installed_returns_symlinked_skills() {
        let dir = tempfile::tempdir().unwrap();
        for id in ["alpha", "beta"] {
            let skill_dir = write_skill(&dir.path().join("skills"), id);
            let item = skill_item(id, skill_dir);
            let ctx = InstallCtx {
                project_dir: dir.path(),
                almanac_root: dir.path(),
                scope: Scope::Project,
                options: InstallOptions::default(),
            };
            Universal.install(&item, &ctx).unwrap();
        }
        let listed = Universal
            .list_installed(dir.path(), Scope::Project)
            .unwrap();
        let ids: Vec<_> = listed.iter().map(|i| i.id.as_str()).collect();
        assert_eq!(ids, vec!["alpha", "beta"]);
    }

    #[test]
    fn audit_flags_empty_dir() {
        let dir = tempfile::tempdir().unwrap();
        let entry = Universal.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(entry.framework, "Universal (.agents/)");
        assert_eq!(
            entry.warnings,
            vec!["No skills installed in .agents/skills/".to_string()]
        );
    }

    #[test]
    fn audit_reports_valid_installs() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        Universal.install(&item, &ctx).unwrap();
        let entry = Universal.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(entry.ok, vec!["1 skills installed".to_string()]);
        assert!(entry.errors.is_empty());
    }

    #[test]
    fn non_skill_kinds_skip_with_message() {
        let dir = tempfile::tempdir().unwrap();
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        let agent = Item {
            kind: ContentType::Agent,
            id: "demo-agent".to_string(),
            source_dir: dir.path().to_path_buf(),
            domain: None,
        };
        let result = Universal.install(&agent, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(
            result.details.as_deref(),
            Some("Universal adapter only supports skills")
        );
    }
}
