//! Claude Code adapter — installs skills and agents into `.claude/` via symlinks.
//!
//! Mirrors the Node CLI's `cli/adapters/claude-code.js`:
//!
//! - **Skills**: `.claude/skills/<id>` → `skills/<id>` (one symlink per skill).
//! - **Agents**: `.claude/agents` → `agents/` (a single directory symlink —
//!   Claude Code discovers every agent through it).
//! - **Teams**: not symlinked. `TeamCreate` writes runtime state to
//!   `~/.claude/teams/`, so that path must stay free; team definitions are
//!   read directly from `teams/` at activation time.
//!
//! Project/workspace scope writes a *relative* symlink (survives a repo move);
//! global scope writes an absolute one.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, link_target, remove_link, symlink_dir};
use crate::error::{Error, Result};

pub struct ClaudeCode;

impl ClaudeCode {
    fn install_skill(
        &self,
        item: &Item,
        base: &Path,
        ctx: &InstallCtx<'_>,
    ) -> Result<InstallResult> {
        let skills_dir = base.join("skills");
        let target = skills_dir.join(&item.id);

        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: target,
                details: Some("dry-run".to_string()),
            });
        }
        // A live (resolving) symlink already there: skip unless forced.
        if target.exists() && !ctx.options.force {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: target,
                details: Some("already exists".to_string()),
            });
        }
        fs::create_dir_all(&skills_dir)?;
        // Clear any prior entry — a forced reinstall, or a stale broken link.
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

    fn install_agents(&self, base: &Path, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        // Claude Code discovers agents through one directory symlink.
        let link_path = base.join("agents");
        let source = ctx.almanac_root.join("agents");

        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: link_path,
                details: Some("dry-run: agents directory symlink".to_string()),
            });
        }
        if link_path.exists() && !ctx.options.force {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: link_path,
                details: Some("agents symlink already exists".to_string()),
            });
        }
        fs::create_dir_all(base)?;
        if is_symlink(&link_path) || link_path.exists() {
            remove_link(&link_path)?;
        }
        let link = link_target(&source, base, ctx.scope)?;
        symlink_dir(&link, &link_path)?;
        Ok(InstallResult {
            action: Action::Created,
            path: link_path,
            details: Some("agents directory symlink".to_string()),
        })
    }
}

impl FrameworkAdapter for ClaudeCode {
    fn id(&self) -> &'static str {
        "claude-code"
    }

    fn display_name(&self) -> &'static str {
        "Claude Code"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill, ContentType::Agent, ContentType::Team]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(".claude").exists())
    }

    fn target_path(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(match scope {
            Scope::Global => dirs::home_dir()
                .ok_or(Error::Todo("no home dir"))?
                .join(".claude"),
            _ => project_dir.join(".claude"),
        })
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let base = self.target_path(ctx.project_dir, ctx.scope)?;
        match item.kind {
            ContentType::Skill => self.install_skill(item, &base, ctx),
            ContentType::Agent => self.install_agents(&base, ctx),
            ContentType::Team => Ok(InstallResult {
                action: Action::Skipped,
                path: base.join("teams"),
                details: Some(
                    "teams are blueprints read from teams/ — no symlink (TeamCreate owns ~/.claude/teams/ at runtime)"
                        .to_string(),
                ),
            }),
            ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: base,
                details: Some("claude-code does not install guides".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let base = self.target_path(ctx.project_dir, ctx.scope)?;
        let path = match item.kind {
            ContentType::Skill => base.join("skills").join(&item.id),
            ContentType::Agent => base.join("agents"),
            ContentType::Team => base.join("teams"),
            ContentType::Guide => {
                return Ok(InstallResult {
                    action: Action::Skipped,
                    path: base,
                    details: Some("claude-code does not install guides".to_string()),
                })
            }
        };
        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Removed,
                path,
                details: Some("dry-run".to_string()),
            });
        }
        // `exists()` is false for a broken symlink, so check the link itself too.
        if !path.exists() && !is_symlink(&path) {
            return Ok(InstallResult {
                action: Action::Skipped,
                path,
                details: Some("not installed".to_string()),
            });
        }
        remove_link(&path)?;
        Ok(InstallResult {
            action: Action::Removed,
            path,
            details: None,
        })
    }

    fn list_installed(&self, project_dir: &Path, scope: Scope) -> Result<Vec<Item>> {
        let base = self.target_path(project_dir, scope)?;
        let mut items = Vec::new();

        let skills_dir = base.join("skills");
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

        let agents = base.join("agents");
        if is_symlink(&agents) {
            items.push(Item {
                kind: ContentType::Agent,
                id: "agents".to_string(),
                source_dir: fs::read_link(&agents).unwrap_or_default(),
                domain: None,
            });
        }
        Ok(items)
    }

    fn audit(&self, project_dir: &Path, scope: Scope) -> Result<AuditEntry> {
        let base = self.target_path(project_dir, scope)?;
        let installed = self.list_installed(project_dir, scope)?;
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };

        let skills_dir = base.join("skills");
        let (mut valid, mut broken) = (0usize, 0usize);
        for item in installed.iter().filter(|i| i.kind == ContentType::Skill) {
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

        let agents = base.join("agents");
        if is_symlink(&agents) {
            if agents.exists() {
                entry.ok.push("agents symlink valid".to_string());
            } else {
                entry.errors.push("agents symlink is broken".to_string());
            }
        } else {
            entry.warnings.push("no agents symlink".to_string());
        }

        // A teams symlink is a misconfiguration: it collides with the path
        // TeamCreate uses for runtime state.
        if is_symlink(&base.join("teams")) {
            entry.warnings.push(
                "teams symlink exists — remove it to avoid colliding with TeamCreate runtime state"
                    .to_string(),
            );
        }
        Ok(entry)
    }
}

// `relative_to` / `link_target` unit tests live in `super::symlink`.
