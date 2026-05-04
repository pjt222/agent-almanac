use std::path::{Path, PathBuf};

use crate::error::Result;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Strategy {
    Symlink,
    Copy,
    FilePerItem,
    AppendToFile,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Scope {
    Project,
    Workspace,
    Global,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ContentType {
    Skill,
    Agent,
    Team,
    Guide,
}

#[derive(Debug, Clone)]
pub struct Item {
    pub kind: ContentType,
    pub id: String,
    pub source_dir: PathBuf,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Action {
    Created,
    Updated,
    Skipped,
}

#[derive(Debug, Clone)]
pub struct InstallResult {
    pub action: Action,
    pub path: PathBuf,
    pub details: Option<String>,
}

#[derive(Debug, Default, Clone)]
pub struct AuditEntry {
    pub framework: String,
    pub ok: Vec<String>,
    pub warnings: Vec<String>,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone, Copy, Default)]
pub struct InstallOptions {
    pub dry_run: bool,
    pub force: bool,
}

#[derive(Debug, Clone)]
pub struct InstallCtx<'a> {
    pub project_dir: &'a Path,
    pub almanac_root: &'a Path,
    pub scope: Scope,
    pub options: InstallOptions,
}

pub trait FrameworkAdapter: Send + Sync {
    fn id(&self) -> &'static str;
    fn display_name(&self) -> &'static str;
    fn strategy(&self) -> Strategy;
    fn content_types(&self) -> &'static [ContentType];

    fn supports(&self, kind: ContentType) -> bool {
        self.content_types().contains(&kind)
    }

    fn detect(&self, project_dir: &Path) -> Result<bool>;
    fn target_path(&self, project_dir: &Path, scope: Scope) -> Result<PathBuf>;
    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult>;
    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult>;
    fn list_installed(&self, project_dir: &Path, scope: Scope) -> Result<Vec<Item>>;
    fn audit(&self, project_dir: &Path, scope: Scope) -> Result<AuditEntry>;
}
