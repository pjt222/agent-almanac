//! Pi Coding Agent adapter (pi.dev, earendil-works/pi) — installs skills into
//! Pi's dedicated skill directory via symlinks, and (opt-in) agents/teams as
//! Pi extension scaffolds.
//!
//! Mirrors the Node CLI's `cli/adapters/pi.js`:
//!
//! - **Skills**: `<scope>/skills/<id>` → `skills/<id>` — one symlink per skill.
//!   Project scope targets `.pi/skills/`, global `~/.pi/agent/skills/`. Pi
//!   discovers skills as folders containing a `SKILL.md`, which is the almanac
//!   skill layout exactly, so a plain symlink needs no transformation.
//! - **Agents / Teams**: Pi has *no native agent support* — "build your own
//!   with extensions". So agent/team installs are **opt-in** via
//!   `InstallOptions::pi_extensions`. When enabled, the definition `.md` is
//!   symlinked into an extension scaffold at `<scope>/extensions/<id>/<id>.md`;
//!   the user must still write an `index.ts` wrapper to activate it. Without
//!   the opt-in, agent/team installs are skipped with an explanatory message.
//! - **Guides**: not supported.
//!
//! Symlink targets are absolute (pi does not use the relative-link style — see
//! `adapters::symlink`, where the shared helpers now live).

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{dir_is_empty, is_symlink, remove_link, symlink_dir, symlink_file};
use crate::error::{Error, Result};

pub struct Pi;

impl Pi {
    fn skills_base(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.target_path(project_dir, scope)?.join("skills"))
    }

    fn extensions_base(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.target_path(project_dir, scope)?.join("extensions"))
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
        fs::create_dir_all(&skills_dir)?;
        if is_symlink(&target) || target.exists() {
            remove_link(&target)?;
        }
        symlink_dir(&item.source_dir, &target)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }

    /// Install an agent or team as a Pi extension scaffold: the definition
    /// `.md` symlinked into `extensions/<id>/<id>.md`. Gated on the
    /// `pi_extensions` opt-in — Pi has no native agent support.
    fn install_extension(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if !ctx.options.pi_extensions {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.extensions_base(ctx.project_dir, ctx.scope)?,
                details: Some(format!(
                    "{:?} support needs --pi-extensions (Pi requires a dedicated extension)",
                    item.kind
                )),
            });
        }

        let ext_dir = self
            .extensions_base(ctx.project_dir, ctx.scope)?
            .join(&item.id);
        let target = ext_dir.join(format!("{}.md", item.id));
        // Agents resolve `source_dir` to the almanac `agents/` directory, teams
        // to `teams/`; the definition file is `<id>.md` inside it.
        let source = item.source_dir.join(format!("{}.md", item.id));

        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: target,
                details: Some("dry-run: extension scaffold".to_string()),
            });
        }
        if target.exists() && !ctx.options.force {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: target,
                details: Some("already exists".to_string()),
            });
        }
        fs::create_dir_all(&ext_dir)?;
        if is_symlink(&target) || target.exists() {
            remove_link(&target)?;
        }
        symlink_file(&source, &target)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: Some("extension scaffold — add an index.ts wrapper to activate".to_string()),
        })
    }

    fn uninstall_extension(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let ext_dir = self
            .extensions_base(ctx.project_dir, ctx.scope)?
            .join(&item.id);
        let target = ext_dir.join(format!("{}.md", item.id));

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
        // Remove only the symlinked `.md` — never the directory wholesale: the
        // user may have hand-written an `index.ts` next to it. Drop the dir
        // only when nothing else remains.
        remove_link(&target)?;
        if ext_dir.is_dir() && dir_is_empty(&ext_dir) {
            fs::remove_dir(&ext_dir)?;
            Ok(InstallResult {
                action: Action::Removed,
                path: target,
                details: None,
            })
        } else {
            Ok(InstallResult {
                action: Action::Removed,
                path: target,
                details: Some(format!(
                    "kept extensions/{}/ — other files present",
                    item.id
                )),
            })
        }
    }
}

impl FrameworkAdapter for Pi {
    fn id(&self) -> &'static str {
        "pi"
    }

    fn display_name(&self) -> &'static str {
        "Pi Coding Agent"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        // Agents/teams are supported only via the `pi_extensions` opt-in, but
        // they are declared here so the install path reaches the adapter.
        &[ContentType::Skill, ContentType::Agent, ContentType::Team]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(".pi").exists())
    }

    fn target_path(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(match scope {
            Scope::Global => dirs::home_dir()
                .ok_or(Error::Todo("no home dir"))?
                .join(".pi/agent"),
            _ => project_dir.join(".pi"),
        })
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent | ContentType::Team => self.install_extension(item, ctx),
            ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("pi does not install guides".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => {
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
            ContentType::Agent | ContentType::Team => self.uninstall_extension(item, ctx),
            ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("pi does not install guides".to_string()),
            }),
        }
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

        // Extension scaffolds: one folder per agent/team. The folder alone does
        // not record whether it was an agent or a team, so it is reported as
        // `Agent` (the dominant case).
        let ext_dir = self.extensions_base(project_dir, scope)?;
        if ext_dir.is_dir() {
            for entry in fs::read_dir(&ext_dir)? {
                let entry = entry?;
                if entry.path().is_dir() {
                    items.push(Item {
                        kind: ContentType::Agent,
                        id: entry.file_name().to_string_lossy().into_owned(),
                        source_dir: PathBuf::new(),
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
        for item in installed.iter().filter(|i| i.kind == ContentType::Skill) {
            // A broken symlink fails `exists()` (which follows the link).
            if skills_dir.join(&item.id).exists() {
                valid += 1;
            } else {
                broken += 1;
            }
        }
        let extensions = installed
            .iter()
            .filter(|i| i.kind == ContentType::Agent)
            .count();

        if valid > 0 {
            entry.ok.push(format!("{valid} skills installed"));
        }
        if extensions > 0 {
            entry.ok.push(format!("{extensions} extension scaffolds"));
        }
        if broken > 0 {
            entry.errors.push(format!("{broken} broken skill symlinks"));
        }
        if installed.is_empty() {
            entry.warnings.push("No Pi content installed".to_string());
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_keys_on_dot_pi() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!Pi.detect(dir.path()).unwrap());
        fs::create_dir(dir.path().join(".pi")).unwrap();
        assert!(Pi.detect(dir.path()).unwrap());
    }

    #[test]
    fn content_types_include_skill_agent_team() {
        assert!(Pi.supports(ContentType::Skill));
        assert!(Pi.supports(ContentType::Agent));
        assert!(Pi.supports(ContentType::Team));
        assert!(!Pi.supports(ContentType::Guide));
    }
}
