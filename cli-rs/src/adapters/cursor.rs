//! Cursor adapter — installs skills into `.cursor/skills/` symlinks.
//!
//! Mirrors the Node CLI's `cli/adapters/cursor.js`:
//!
//! - **Skills (modern)**: `.cursor/skills/<id>` directory symlink (the universal
//!   `SKILL.md` layout). Project scope writes to `<project>/.cursor/skills/`,
//!   global to `~/.cursor/skills/`. Relative link for project/workspace,
//!   absolute for global.
//! - **Skills (legacy `.mdc` rules)**: the Node oracle exposes a
//!   `installLegacyRule` helper that writes a condensed `.cursor/rules/<id>.mdc`
//!   file (wrap_as_mdc), but no CLI flag in Node invokes it — it is dead on the
//!   install path. We mirror that: install always uses the modern path. Listing
//!   and uninstall, however, *do* see legacy `.mdc` rules (so a user who hand-
//!   wrote one or installed it from outside the CLI can still clean it up).
//! - **Agents / Teams / Guides**: not supported (Cursor is skills-only).
//!
//! `detect()` keys on `.cursor/` or a top-level `.cursorrules` file.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, link_target, remove_link, symlink_dir};
use crate::error::{Error, Result};

pub struct Cursor;

impl Cursor {
    fn cursor_base(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(match scope {
            Scope::Global => dirs::home_dir()
                .ok_or(Error::Todo("no home dir"))?
                .join(".cursor"),
            _ => project_dir.join(".cursor"),
        })
    }

    fn skills_dir(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.cursor_base(project_dir, scope)?.join("skills"))
    }

    fn rules_dir(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.cursor_base(project_dir, scope)?.join("rules"))
    }

    fn install_skill(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let skills_dir = self.skills_dir(ctx.project_dir, ctx.scope)?;
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

impl FrameworkAdapter for Cursor {
    fn id(&self) -> &'static str {
        "cursor"
    }

    fn display_name(&self) -> &'static str {
        "Cursor"
    }

    fn strategy(&self) -> Strategy {
        // Node declares `file-per-item`. The modern install path is actually a
        // single directory symlink (one fs entry per skill), so `Symlink` is
        // semantically accurate; the strategy tag is informational.
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(".cursor").exists() || project_dir.join(".cursorrules").exists())
    }

    fn target_path(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        self.cursor_base(project_dir, scope)
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent | ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("Cursor supports skills only".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind != ContentType::Skill {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("Cursor supports skills only".to_string()),
            });
        }

        let skill = self.skills_dir(ctx.project_dir, ctx.scope)?.join(&item.id);
        let rule = self
            .rules_dir(ctx.project_dir, ctx.scope)?
            .join(format!("{}.mdc", item.id));

        let mut removed = Vec::new();
        for path in [&skill, &rule] {
            if path.exists() || is_symlink(path) {
                if ctx.options.dry_run {
                    removed.push(path.clone());
                    continue;
                }
                remove_link(path)?;
                removed.push(path.clone());
            }
        }

        if removed.is_empty() {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: skill,
                details: Some("not installed".to_string()),
            });
        }
        // Report the first path (the modern one when both existed); details
        // surfaces the legacy `.mdc` cleanup when it happened.
        let details = if removed.len() > 1 {
            Some(format!("also removed {}", removed[1].display()))
        } else {
            None
        };
        Ok(InstallResult {
            action: Action::Removed,
            path: removed.into_iter().next().unwrap(),
            details,
        })
    }

    fn list_installed(&self, project_dir: &Path, scope: Scope) -> Result<Vec<Item>> {
        let mut items = Vec::new();

        let skills = self.skills_dir(project_dir, scope)?;
        if skills.is_dir() {
            for entry in fs::read_dir(&skills)? {
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

        let rules = self.rules_dir(project_dir, scope)?;
        if rules.is_dir() {
            for entry in fs::read_dir(&rules)? {
                let entry = entry?;
                let path = entry.path();
                let name = entry.file_name();
                let name = name.to_string_lossy();
                if let Some(stem) = name.strip_suffix(".mdc") {
                    items.push(Item {
                        kind: ContentType::Skill,
                        id: stem.to_string(),
                        source_dir: path,
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
                .push("No Cursor content installed".to_string());
        } else {
            entry
                .ok
                .push(format!("{} items installed", installed.len()));
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
    fn detect_keys_on_dot_cursor_or_cursorrules() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!Cursor.detect(dir.path()).unwrap());
        fs::create_dir(dir.path().join(".cursor")).unwrap();
        assert!(Cursor.detect(dir.path()).unwrap());

        let dir2 = tempfile::tempdir().unwrap();
        fs::write(dir2.path().join(".cursorrules"), "rules").unwrap();
        assert!(Cursor.detect(dir2.path()).unwrap());
    }

    #[test]
    fn content_types_are_skills_only() {
        assert!(Cursor.supports(ContentType::Skill));
        assert!(!Cursor.supports(ContentType::Agent));
        assert!(!Cursor.supports(ContentType::Team));
        assert!(!Cursor.supports(ContentType::Guide));
    }

    #[test]
    fn install_creates_relative_symlink_into_cursor_skills() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        let result = Cursor.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Created);
        let target = dir.path().join(".cursor/skills/demo");
        assert!(is_symlink(&target));
        assert!(fs::read_link(&target).unwrap().is_relative());
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

        Cursor.install(&item, &ctx).unwrap();
        let result = Cursor.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
    }

    #[test]
    fn uninstall_removes_modern_symlink() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        Cursor.install(&item, &ctx).unwrap();
        let result = Cursor.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Removed);
        assert!(!is_symlink(&dir.path().join(".cursor/skills/demo")));
    }

    #[test]
    fn uninstall_removes_legacy_mdc_rule_too() {
        // A user (or earlier install) wrote a `.cursor/rules/demo.mdc`; the
        // adapter must clean it up even though it never installs one itself.
        let dir = tempfile::tempdir().unwrap();
        let rules_dir = dir.path().join(".cursor/rules");
        fs::create_dir_all(&rules_dir).unwrap();
        let mdc = rules_dir.join("demo.mdc");
        fs::write(&mdc, "---\nalwaysApply: false\n---\n").unwrap();

        let item = skill_item("demo", dir.path().join("skills/demo"));
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        let result = Cursor.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Removed);
        assert!(!mdc.exists());
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
        let result = Cursor.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("not installed"));
    }

    #[test]
    fn list_installed_returns_both_formats() {
        let dir = tempfile::tempdir().unwrap();
        // Install a modern skill symlink.
        let skill_dir = write_skill(&dir.path().join("skills"), "modern");
        let item = skill_item("modern", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        Cursor.install(&item, &ctx).unwrap();
        // Hand-place a legacy `.mdc` rule.
        let rules = dir.path().join(".cursor/rules");
        fs::create_dir_all(&rules).unwrap();
        fs::write(rules.join("legacy.mdc"), "---\n---\n").unwrap();

        let listed = Cursor.list_installed(dir.path(), Scope::Project).unwrap();
        let ids: Vec<_> = listed.iter().map(|i| i.id.as_str()).collect();
        assert_eq!(ids, vec!["legacy", "modern"]);
    }

    #[test]
    fn audit_reports_count_when_installed() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        Cursor.install(&item, &ctx).unwrap();
        let entry = Cursor.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(entry.ok, vec!["1 items installed".to_string()]);
        assert!(entry.warnings.is_empty());
    }

    #[test]
    fn audit_warns_when_empty() {
        let dir = tempfile::tempdir().unwrap();
        let entry = Cursor.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(
            entry.warnings,
            vec!["No Cursor content installed".to_string()]
        );
        assert!(entry.ok.is_empty());
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
        let result = Cursor.install(&agent, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(
            result.details.as_deref(),
            Some("Cursor supports skills only")
        );
    }
}
