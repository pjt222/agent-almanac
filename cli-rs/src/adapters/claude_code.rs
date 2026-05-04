use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use crate::error::{Error, Result};

pub struct ClaudeCode;

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

    fn install(&self, _item: &Item, _ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        Err(Error::Todo("claude-code install (alpha.1 stub)"))
    }

    fn uninstall(&self, _item: &Item, _ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        Err(Error::Todo("claude-code uninstall (alpha.1 stub)"))
    }

    fn list_installed(&self, _project_dir: &Path, _scope: Scope) -> Result<Vec<Item>> {
        Ok(Vec::new())
    }

    fn audit(&self, _project_dir: &Path, _scope: Scope) -> Result<AuditEntry> {
        Ok(AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        })
    }
}

#[allow(dead_code)]
fn _make_install_skipped(path: PathBuf) -> InstallResult {
    InstallResult {
        action: Action::Skipped,
        path,
        details: Some("alpha.1 stub".to_string()),
    }
}
