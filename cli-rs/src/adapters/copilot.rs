//! GitHub Copilot adapter — installs skills into `.github/skills/` via symlinks.
//!
//! Mirrors the Node CLI's `cli/adapters/copilot.js`:
//!
//! - **Skills** (install) — the *modern* layout: a directory symlink at
//!   `.github/skills/<id>`. Despite the adapter's declared `append-to-file`
//!   strategy, install never appends — it always symlinks.
//! - **Skills** (uninstall) — removes the `.github/skills/<id>` symlink if
//!   present; otherwise falls back to splicing a marked `skill` section out of
//!   the *legacy* `.github/copilot-instructions.md` file. The append path
//!   exists only to clean up installs from older Copilot layouts.
//! - **Agents / Teams / Guides**: not supported — Copilot is skills-only.
//!
//! Copilot configuration is repo-scoped (`.github/` is committed repository
//! config), so scope is ignored: `target_path` is always `<project>/.github`
//! and the symlink is always relative, matching the Node oracle.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, link_target, remove_link, symlink_dir};
use super::transformer::{has_marked_section, remove_marked_section};
use crate::error::Result;

pub struct Copilot;

impl Copilot {
    fn skills_dir(&self, project_dir: &Path) -> PathBuf {
        project_dir.join(".github/skills")
    }

    fn instructions_file(&self, project_dir: &Path) -> PathBuf {
        project_dir.join(".github/copilot-instructions.md")
    }
}

impl FrameworkAdapter for Copilot {
    fn id(&self) -> &'static str {
        "copilot"
    }

    fn display_name(&self) -> &'static str {
        "GitHub Copilot"
    }

    fn strategy(&self) -> Strategy {
        // Mirrors the Node adapter's declared strategy. The actual install is a
        // modern symlink; the append path is a uninstall-only legacy fallback.
        Strategy::AppendToFile
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(self.instructions_file(project_dir).exists())
    }

    fn target_path(&self, project_dir: &Path, _scope: Scope) -> Result<PathBuf> {
        // `.github/` is repo-scoped config — scope is ignored.
        Ok(project_dir.join(".github"))
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind != ContentType::Skill {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("copilot supports skills only".to_string()),
            });
        }
        let skills_dir = self.skills_dir(ctx.project_dir);
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
        // Always a relative link — Copilot is project-only.
        let link = link_target(&item.source_dir, &skills_dir, Scope::Project)?;
        symlink_dir(&link, &target)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind != ContentType::Skill {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("copilot supports skills only".to_string()),
            });
        }

        // Modern layout: the `.github/skills/<id>` symlink.
        let skill_path = self.skills_dir(ctx.project_dir).join(&item.id);
        if skill_path.exists() || is_symlink(&skill_path) {
            if ctx.options.dry_run {
                return Ok(InstallResult {
                    action: Action::Removed,
                    path: skill_path,
                    details: Some("dry-run".to_string()),
                });
            }
            remove_link(&skill_path)?;
            return Ok(InstallResult {
                action: Action::Removed,
                path: skill_path,
                details: None,
            });
        }

        // Legacy layout: a marked section inside `.github/copilot-instructions.md`.
        let instr = self.instructions_file(ctx.project_dir);
        if instr.exists() {
            let content = fs::read_to_string(&instr)?;
            if has_marked_section(&content, "skill", &item.id) {
                if ctx.options.dry_run {
                    return Ok(InstallResult {
                        action: Action::Removed,
                        path: instr,
                        details: Some("dry-run".to_string()),
                    });
                }
                let stripped = remove_marked_section(&content, "skill", &item.id);
                fs::write(&instr, stripped)?;
                return Ok(InstallResult {
                    action: Action::Removed,
                    path: instr,
                    details: Some("removed legacy marked section".to_string()),
                });
            }
        }

        Ok(InstallResult {
            action: Action::Skipped,
            path: skill_path,
            details: Some("not installed".to_string()),
        })
    }

    fn list_installed(&self, project_dir: &Path, _scope: Scope) -> Result<Vec<Item>> {
        let mut items = Vec::new();
        let skills_dir = self.skills_dir(project_dir);
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
        let skills_dir = self.skills_dir(project_dir);
        let installed = self.list_installed(project_dir, scope)?;
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };

        let (mut valid, mut broken) = (0usize, 0usize);
        for item in &installed {
            // A broken symlink fails `exists()` (which follows the link).
            if skills_dir.join(&item.id).exists() {
                valid += 1;
            } else {
                broken += 1;
            }
        }
        if valid > 0 {
            entry.ok.push(format!("{valid} skills installed"));
        }
        if broken > 0 {
            entry.errors.push(format!("{broken} broken skill symlinks"));
        }
        if installed.is_empty() {
            entry
                .warnings
                .push("No Copilot skills installed".to_string());
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_keys_on_copilot_instructions_file() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!Copilot.detect(dir.path()).unwrap());
        fs::create_dir(dir.path().join(".github")).unwrap();
        fs::write(dir.path().join(".github/copilot-instructions.md"), "x").unwrap();
        assert!(Copilot.detect(dir.path()).unwrap());
    }

    #[test]
    fn content_types_are_skills_only() {
        assert!(Copilot.supports(ContentType::Skill));
        assert!(!Copilot.supports(ContentType::Agent));
        assert!(!Copilot.supports(ContentType::Team));
        assert!(!Copilot.supports(ContentType::Guide));
    }
}
