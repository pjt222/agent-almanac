//! Gemini CLI adapter — installs skills into `.gemini/skills/` via symlinks.
//!
//! Mirrors the Node CLI's `cli/adapters/gemini.js`:
//!
//! - **Skills**: `<scope>/skills/<id>` → `skills/<id>` — one symlink per skill.
//!   Project scope targets `.gemini/skills/`, global `~/.gemini/skills/`.
//!   Gemini discovers a skill as a folder containing a `SKILL.md`, which is the
//!   almanac skill layout exactly, so a plain symlink needs no transformation.
//! - **Agents / Teams / Guides**: not supported — Gemini is skills-only.
//!
//! Symlink style follows `claude_code.rs`: a *relative* link for
//! project/workspace scope (survives a repo move), an *absolute* one for
//! global. The Node adapter always emits a relative link and has no global
//! scope; the global branch here is a unilateral parity extension, harmless
//! because Node never exercises that path.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, link_target, remove_link, symlink_dir};
use crate::error::{Error, Result};

pub struct Gemini;

impl Gemini {
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

impl FrameworkAdapter for Gemini {
    fn id(&self) -> &'static str {
        "gemini"
    }

    fn display_name(&self) -> &'static str {
        "Gemini CLI"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(".gemini").exists())
    }

    fn target_path(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(match scope {
            Scope::Global => dirs::home_dir()
                .ok_or(Error::Todo("no home dir"))?
                .join(".gemini"),
            _ => project_dir.join(".gemini"),
        })
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent | ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("gemini supports skills only".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind != ContentType::Skill {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("gemini supports skills only".to_string()),
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
        // `exists()` is false for a broken symlink, so check the link itself too.
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
                .push("No Gemini skills installed".to_string());
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_keys_on_dot_gemini() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!Gemini.detect(dir.path()).unwrap());
        fs::create_dir(dir.path().join(".gemini")).unwrap();
        assert!(Gemini.detect(dir.path()).unwrap());
    }

    #[test]
    fn content_types_are_skills_only() {
        assert!(Gemini.supports(ContentType::Skill));
        assert!(!Gemini.supports(ContentType::Agent));
        assert!(!Gemini.supports(ContentType::Team));
        assert!(!Gemini.supports(ContentType::Guide));
    }

    // `relative_to` / `link_target` unit tests live in `super::symlink`.
}
