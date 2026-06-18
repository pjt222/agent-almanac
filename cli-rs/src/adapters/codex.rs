//! OpenAI Codex adapter — appends condensed agent sections to `AGENTS.md`.
//!
//! Mirrors the Node CLI's `cli/adapters/codex.js`:
//!
//! - **Agents**: a condensed section, wrapped in `agent-almanac` marker
//!   comments, is appended to `AGENTS.md` in the project directory. Re-installs
//!   replace the marked block in place; uninstall splices it out.
//! - **Skills**: not handled here — Codex reads skills from the shared
//!   `.agents/skills/` path owned by the universal adapter.
//! - **Teams / Guides**: not supported.
//!
//! This is the first `append-to-file` adapter (claude-code and hermes are
//! `symlink`). `AGENTS.md` lives in the project directory regardless of scope,
//! matching Node.

use std::fs;
use std::path::Path;

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::transformer;
use crate::error::Result;

pub struct Codex;

const AGENTS_FILE: &str = "AGENTS.md";
/// The marker `content_type` Codex uses — it only ever splices agent sections.
const MARKER_TYPE: &str = "agent";

impl Codex {
    fn agents_file(project_dir: &Path) -> std::path::PathBuf {
        project_dir.join(AGENTS_FILE)
    }

    fn install_agent(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let file = Self::agents_file(ctx.project_dir);

        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: file,
                details: Some("dry-run: append to AGENTS.md".to_string()),
            });
        }

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

        // Drop any prior block for this id, then append a fresh one.
        let content = transformer::remove_marked_section(&content, MARKER_TYPE, &item.id);
        // `resolve_item` sets an agent's `source_dir` to the almanac `agents/`
        // directory; the definition file is `<id>.md` inside it.
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

    fn uninstall_agent(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let file = Self::agents_file(ctx.project_dir);
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
        let content = transformer::remove_marked_section(&content, MARKER_TYPE, &item.id);
        fs::write(&file, content)?;
        Ok(InstallResult {
            action: Action::Removed,
            path: file,
            details: None,
        })
    }
}

impl FrameworkAdapter for Codex {
    fn id(&self) -> &'static str {
        "codex"
    }

    fn display_name(&self) -> &'static str {
        "OpenAI Codex"
    }

    fn strategy(&self) -> Strategy {
        Strategy::AppendToFile
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill, ContentType::Agent]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(Self::agents_file(project_dir).exists())
    }

    fn target_path(&self, project_dir: &Path, _scope: Scope) -> Result<std::path::PathBuf> {
        // `AGENTS.md` is a project-directory file; scope does not vary it.
        Ok(Self::agents_file(project_dir))
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Agent => self.install_agent(item, ctx),
            // Codex reads skills from the universal `.agents/skills/` path.
            ContentType::Skill => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::agents_file(ctx.project_dir),
                details: Some("skills handled by the universal adapter".to_string()),
            }),
            ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::agents_file(ctx.project_dir),
                details: Some(format!("codex does not install {:?}s", item.kind)),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Agent => self.uninstall_agent(item, ctx),
            ContentType::Skill => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::agents_file(ctx.project_dir),
                details: Some("skills handled by the universal adapter".to_string()),
            }),
            ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::agents_file(ctx.project_dir),
                details: Some(format!("codex does not install {:?}s", item.kind)),
            }),
        }
    }

    fn list_installed(&self, _project_dir: &Path, _scope: Scope) -> Result<Vec<Item>> {
        // Agent sections live inside AGENTS.md; the Node adapter likewise
        // reports nothing here.
        Ok(Vec::new())
    }

    fn audit(&self, project_dir: &Path, _scope: Scope) -> Result<AuditEntry> {
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };
        if Self::agents_file(project_dir).exists() {
            entry.ok.push("AGENTS.md exists".to_string());
        } else {
            entry.warnings.push("No AGENTS.md found".to_string());
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn detect_keys_on_agents_md() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!Codex.detect(dir.path()).unwrap());
        fs::write(dir.path().join("AGENTS.md"), "# AGENTS").unwrap();
        assert!(Codex.detect(dir.path()).unwrap());
    }
}
