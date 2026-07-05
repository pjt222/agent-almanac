//! Hermes Agent adapter (Nous Research) — installs skills and agents into
//! `~/.hermes/` via symlinks.
//!
//! Mirrors the Node CLI's `cli/adapters/hermes.js`:
//!
//! - **Skills**: `~/.hermes/skills/<domain>/<id>` → `skills/<id>` — one symlink
//!   per skill, kept under its domain so the Hermes layout preserves the
//!   almanac's domain hierarchy.
//! - **Agents**: `~/.hermes/agents/<id>.md` → `agents/<id>.md` — one file
//!   symlink per agent (unlike claude-code's single directory symlink).
//! - **Teams / Guides**: not supported.
//!
//! Hermes is global by nature: the adapter always installs into `~/.hermes`,
//! regardless of the requested scope (the Node adapter only ever touches
//! `~/.hermes`). Tests redirect `$HOME` to a tempdir — honoured by
//! `dirs::home_dir()` on Linux — to stay reproducible without a real home.
//! Symlink targets are absolute, matching Node.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::symlink::{is_symlink, remove_link, symlink_dir, symlink_file};
use crate::error::{Error, Result};

pub struct Hermes;

/// Skills with no resolved domain fall here, matching Node's `domain || 'general'`.
const DEFAULT_DOMAIN: &str = "general";

impl Hermes {
    fn skills_base(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.target_path(project_dir, scope)?.join("skills"))
    }

    fn agents_base(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf> {
        Ok(self.target_path(project_dir, scope)?.join("agents"))
    }

    fn install_skill(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let domain = item.domain.as_deref().unwrap_or(DEFAULT_DOMAIN);
        let target_dir = self.skills_base(ctx.project_dir, ctx.scope)?.join(domain);
        let target = target_dir.join(&item.id);

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
        fs::create_dir_all(&target_dir)?;
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

    fn install_agent(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let agents_base = self.agents_base(ctx.project_dir, ctx.scope)?;
        let target = agents_base.join(format!("{}.md", item.id));
        // `resolve_item` sets an agent's `source_dir` to the almanac `agents/`
        // directory; Hermes links the single `<id>.md` file inside it.
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
        fs::create_dir_all(&agents_base)?;
        if is_symlink(&target) || target.exists() {
            remove_link(&target)?;
        }
        symlink_file(&source, &target)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }

    /// Locate an installed skill's symlink when its domain is unknown (the
    /// uninstall path has no registry): scan every domain directory for `<id>`.
    fn find_installed_skill(&self, project_dir: &Path, scope: Scope, id: &str) -> Result<PathBuf> {
        let skills_base = self.skills_base(project_dir, scope)?;
        if !skills_base.is_dir() {
            return Ok(skills_base.join(DEFAULT_DOMAIN).join(id));
        }
        for entry in fs::read_dir(&skills_base)? {
            let candidate = entry?.path().join(id);
            if candidate.exists() || is_symlink(&candidate) {
                return Ok(candidate);
            }
        }
        // Nothing found — return the default-domain path so the caller reports
        // a clean "not installed" skip.
        Ok(skills_base.join(DEFAULT_DOMAIN).join(id))
    }
}

impl FrameworkAdapter for Hermes {
    fn id(&self) -> &'static str {
        "hermes"
    }

    fn display_name(&self) -> &'static str {
        "Hermes Agent"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Symlink
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill, ContentType::Agent]
    }

    fn detect(&self, _project_dir: &Path) -> Result<bool> {
        // Hermes stores config at `~/.hermes/config.yaml`; mirror Node and
        // probe the home directory regardless of the project directory.
        let home = dirs::home_dir().ok_or(Error::Todo("no home dir"))?;
        Ok(home.join(".hermes/config.yaml").exists())
    }

    fn target_path(&self, _project_dir: &Path, _scope: Scope) -> Result<PathBuf> {
        // Hermes is global-only: the tool reads `~/.hermes` regardless of cwd or
        // the requested scope, so install must always land there (matches Node
        // `hermes.js`, which hardcodes `homedir()`). A previous project-scope
        // branch wrote to `./.hermes`, which Hermes never reads — installs were
        // silently unusable on the default (non-`--global`) scope. Tests redirect
        // `$HOME` (honoured by `dirs::home_dir()` on Linux) instead.
        Ok(dirs::home_dir()
            .ok_or(Error::Todo("no home dir"))?
            .join(".hermes"))
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent => self.install_agent(item, ctx),
            ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some(format!("hermes does not install {:?}s", item.kind)),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let path = match item.kind {
            ContentType::Skill => match &item.domain {
                Some(domain) => self
                    .skills_base(ctx.project_dir, ctx.scope)?
                    .join(domain)
                    .join(&item.id),
                None => self.find_installed_skill(ctx.project_dir, ctx.scope, &item.id)?,
            },
            ContentType::Agent => self
                .agents_base(ctx.project_dir, ctx.scope)?
                .join(format!("{}.md", item.id)),
            ContentType::Team | ContentType::Guide => {
                return Ok(InstallResult {
                    action: Action::Skipped,
                    path: self.target_path(ctx.project_dir, ctx.scope)?,
                    details: Some(format!("hermes does not install {:?}s", item.kind)),
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
        let mut items = Vec::new();

        let skills_base = self.skills_base(project_dir, scope)?;
        if skills_base.is_dir() {
            for domain_entry in fs::read_dir(&skills_base)? {
                let domain_entry = domain_entry?;
                let domain_dir = domain_entry.path();
                if !domain_dir.is_dir() {
                    continue;
                }
                let domain = domain_entry.file_name().to_string_lossy().into_owned();
                for skill_entry in fs::read_dir(&domain_dir)? {
                    let skill_entry = skill_entry?;
                    items.push(Item {
                        kind: ContentType::Skill,
                        id: skill_entry.file_name().to_string_lossy().into_owned(),
                        source_dir: fs::read_link(skill_entry.path()).unwrap_or_default(),
                        domain: Some(domain.clone()),
                    });
                }
            }
        }

        let agents_base = self.agents_base(project_dir, scope)?;
        if agents_base.is_dir() {
            for entry in fs::read_dir(&agents_base)? {
                let entry = entry?;
                let name = entry.file_name().to_string_lossy().into_owned();
                items.push(Item {
                    kind: ContentType::Agent,
                    id: name.strip_suffix(".md").unwrap_or(&name).to_string(),
                    source_dir: fs::read_link(entry.path()).unwrap_or_default(),
                    domain: None,
                });
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
                .push("No Hermes content installed".to_string());
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

    #[test]
    fn content_types_exclude_teams_and_guides() {
        let h = Hermes;
        assert!(h.supports(ContentType::Skill));
        assert!(h.supports(ContentType::Agent));
        assert!(!h.supports(ContentType::Team));
        assert!(!h.supports(ContentType::Guide));
    }
}
