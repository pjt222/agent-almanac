//! OpenCode adapter — installs skills and agents into `.opencode/` via symlinks.
//!
//! Mirrors the Node CLI's `cli/adapters/opencode.js`:
//!
//! - **Skills**: `<base>/skills/<id>` → `skills/<id>` — one directory symlink
//!   per skill.
//! - **Agents**: `<base>/agents/<id>.md` → `agents/<id>.md` — one *file* symlink
//!   per agent (like Hermes, unlike claude-code's single directory symlink).
//! - **Teams / Guides**: not supported.
//!
//! `<base>` is `.opencode` for project/workspace scope and `~/.config/opencode`
//! for global. Symlink style follows `claude_code.rs` (relative for
//! project/workspace, absolute for global) — matching the Node oracle's
//! `relative()`.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, link_target, remove_link, symlink_dir, symlink_file};
use crate::error::{Error, Result};

pub struct OpenCode;

impl OpenCode {
    fn skills_dir(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.target_path(project_dir, scope)?.join("skills"))
    }

    fn agents_dir(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.target_path(project_dir, scope)?.join("agents"))
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

    /// Install an agent as a single-file symlink `agents/<id>.md`. `source_dir`
    /// resolves to the almanac `agents/` directory; the file is `<id>.md`.
    fn install_agent(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let agents_dir = self.agents_dir(ctx.project_dir, ctx.scope)?;
        let target = agents_dir.join(format!("{}.md", item.id));
        let source = item.source_dir.join(format!("{}.md", item.id));

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
        fs::create_dir_all(&agents_dir)?;
        if is_symlink(&target) || target.exists() {
            remove_link(&target)?;
        }
        let link = link_target(&source, &agents_dir, ctx.scope)?;
        symlink_file(&link, &target)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }
}

impl FrameworkAdapter for OpenCode {
    fn id(&self) -> &'static str {
        "opencode"
    }

    fn display_name(&self) -> &'static str {
        "OpenCode"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill, ContentType::Agent]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(".opencode").exists() || project_dir.join("opencode.json").exists())
    }

    fn target_path(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(match scope {
            Scope::Global => dirs::home_dir()
                .ok_or(Error::Todo("no home dir"))?
                .join(".config/opencode"),
            _ => project_dir.join(".opencode"),
        })
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent => self.install_agent(item, ctx),
            ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("opencode supports skills and agents only".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let target = match item.kind {
            ContentType::Skill => self.skills_dir(ctx.project_dir, ctx.scope)?.join(&item.id),
            ContentType::Agent => self
                .agents_dir(ctx.project_dir, ctx.scope)?
                .join(format!("{}.md", item.id)),
            ContentType::Team | ContentType::Guide => {
                return Ok(InstallResult {
                    action: Action::Skipped,
                    path: self.target_path(ctx.project_dir, ctx.scope)?,
                    details: Some("opencode supports skills and agents only".to_string()),
                })
            }
        };
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

        let skills_dir = self.skills_dir(project_dir, scope)?;
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

        let agents_dir = self.agents_dir(project_dir, scope)?;
        if agents_dir.is_dir() {
            for entry in fs::read_dir(&agents_dir)? {
                let entry = entry?;
                let path = entry.path();
                if is_symlink(&path) {
                    let name = entry.file_name().to_string_lossy().into_owned();
                    items.push(Item {
                        kind: ContentType::Agent,
                        id: name.strip_suffix(".md").unwrap_or(&name).to_string(),
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
        let skills_dir = self.skills_dir(project_dir, scope)?;
        let agents_dir = self.agents_dir(project_dir, scope)?;
        let installed = self.list_installed(project_dir, scope)?;
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };

        let (mut valid, mut broken) = (0usize, 0usize);
        for item in &installed {
            // A broken symlink fails `exists()` (which follows the link).
            let path = match item.kind {
                ContentType::Agent => agents_dir.join(format!("{}.md", item.id)),
                _ => skills_dir.join(&item.id),
            };
            if path.exists() {
                valid += 1;
            } else {
                broken += 1;
            }
        }
        if valid > 0 {
            entry.ok.push(format!("{valid} items installed"));
        }
        if broken > 0 {
            entry.errors.push(format!("{broken} broken links"));
        }
        if installed.is_empty() {
            entry
                .warnings
                .push("No OpenCode content installed".to_string());
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_keys_on_dot_opencode_or_opencode_json() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!OpenCode.detect(dir.path()).unwrap());
        fs::create_dir(dir.path().join(".opencode")).unwrap();
        assert!(OpenCode.detect(dir.path()).unwrap());

        let dir2 = tempfile::tempdir().unwrap();
        fs::write(dir2.path().join("opencode.json"), "{}").unwrap();
        assert!(OpenCode.detect(dir2.path()).unwrap());
    }

    #[test]
    fn content_types_are_skills_and_agents() {
        assert!(OpenCode.supports(ContentType::Skill));
        assert!(OpenCode.supports(ContentType::Agent));
        assert!(!OpenCode.supports(ContentType::Team));
        assert!(!OpenCode.supports(ContentType::Guide));
    }
}
