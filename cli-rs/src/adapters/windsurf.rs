//! Windsurf adapter — dual-mode condensed-skill writer.
//!
//! Mirrors `cli/adapters/windsurf.js`. Windsurf supports two on-disk layouts:
//!
//! - **Directory mode** (default): `.windsurf/rules/<id>.md` — one condensed
//!   `SKILL.md` per skill, written plain (no marker comments). Re-install
//!   overwrites; uninstall deletes the file.
//! - **Single-file mode**: `.windsurfrules` — condensed skill content spliced
//!   into the file, wrapped in `agent-almanac` marker comments, idempotent on
//!   re-install and removable on uninstall. Selected when `.windsurfrules`
//!   exists AND `.windsurf/rules/` does not; otherwise directory mode wins.
//!
//! `detect()` keys on `.windsurf/` or `.windsurfrules`. Skills only — agents,
//! teams, and guides skip with a message. Windsurf has no global location in
//! the Node oracle; we mirror that (scope is ignored).

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::transformer;
use crate::error::Result;

pub struct Windsurf;

const MARKER_TYPE: &str = "skill";

impl Windsurf {
    fn rules_dir(project_dir: &Path) -> PathBuf {
        project_dir.join(".windsurf/rules")
    }
    fn single_file(project_dir: &Path) -> PathBuf {
        project_dir.join(".windsurfrules")
    }
    fn rule_file(project_dir: &Path, id: &str) -> PathBuf {
        Self::rules_dir(project_dir).join(format!("{id}.md"))
    }

    /// Single-file mode applies only when `.windsurfrules` exists and the
    /// directory layout doesn't.
    fn uses_single_file(project_dir: &Path) -> bool {
        Self::single_file(project_dir).exists() && !Self::rules_dir(project_dir).exists()
    }

    fn install_dir_mode(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let target = Self::rule_file(ctx.project_dir, &item.id);
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
        fs::create_dir_all(Self::rules_dir(ctx.project_dir))?;
        let condensed = transformer::condense_skill(&item.source_dir.join("SKILL.md"))?;
        fs::write(&target, condensed)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }

    fn install_single_file(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let file = Self::single_file(ctx.project_dir);
        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: file,
                details: Some("dry-run: append to .windsurfrules".to_string()),
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
                details: Some("already in .windsurfrules".to_string()),
            });
        }
        let content = transformer::remove_marked_section(&content, MARKER_TYPE, &item.id);
        let condensed = transformer::condense_skill(&item.source_dir.join("SKILL.md"))?;
        let section = transformer::wrap_in_markers(MARKER_TYPE, &item.id, &condensed);
        let new_content = format!("{}\n\n{}\n", content.trim_end(), section);
        fs::write(&file, new_content)?;
        Ok(InstallResult {
            action: Action::Created,
            path: file,
            details: None,
        })
    }
}

impl FrameworkAdapter for Windsurf {
    fn id(&self) -> &'static str {
        "windsurf"
    }

    fn display_name(&self) -> &'static str {
        "Windsurf"
    }

    fn strategy(&self) -> Strategy {
        Strategy::FilePerItem
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(".windsurf").exists() || Self::single_file(project_dir).exists())
    }

    fn target_path(&self, project_dir: &Path, _scope: Scope) -> Result<PathBuf> {
        Ok(if Self::uses_single_file(project_dir) {
            Self::single_file(project_dir)
        } else {
            Self::rules_dir(project_dir)
        })
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => {
                if Self::uses_single_file(ctx.project_dir) {
                    self.install_single_file(item, ctx)
                } else {
                    self.install_dir_mode(item, ctx)
                }
            }
            ContentType::Agent | ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("Windsurf supports skills only".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind != ContentType::Skill {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("Windsurf supports skills only".to_string()),
            });
        }

        // Directory mode wins if the per-skill rule file exists.
        let rule = Self::rule_file(ctx.project_dir, &item.id);
        if rule.exists() {
            if ctx.options.dry_run {
                return Ok(InstallResult {
                    action: Action::Removed,
                    path: rule,
                    details: Some("dry-run".to_string()),
                });
            }
            fs::remove_file(&rule)?;
            return Ok(InstallResult {
                action: Action::Removed,
                path: rule,
                details: None,
            });
        }

        // Otherwise try splicing out of `.windsurfrules`.
        let file = Self::single_file(ctx.project_dir);
        if file.exists() {
            let content = fs::read_to_string(&file)?;
            if transformer::has_marked_section(&content, MARKER_TYPE, &item.id) {
                if ctx.options.dry_run {
                    return Ok(InstallResult {
                        action: Action::Removed,
                        path: file,
                        details: Some("dry-run".to_string()),
                    });
                }
                let new_content =
                    transformer::remove_marked_section(&content, MARKER_TYPE, &item.id);
                fs::write(&file, new_content)?;
                return Ok(InstallResult {
                    action: Action::Removed,
                    path: file,
                    details: None,
                });
            }
        }

        Ok(InstallResult {
            action: Action::Skipped,
            path: rule,
            details: Some("not installed".to_string()),
        })
    }

    fn list_installed(&self, project_dir: &Path, _scope: Scope) -> Result<Vec<Item>> {
        let mut items = Vec::new();
        let rules = Self::rules_dir(project_dir);
        if rules.is_dir() {
            for entry in fs::read_dir(&rules)? {
                let entry = entry?;
                let name = entry.file_name();
                let name = name.to_string_lossy();
                if let Some(stem) = name.strip_suffix(".md") {
                    items.push(Item {
                        kind: ContentType::Skill,
                        id: stem.to_string(),
                        source_dir: entry.path(),
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
                .push("No Windsurf content installed".to_string());
        } else {
            entry
                .ok
                .push(format!("{} rules installed", installed.len()));
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
            "---\nname: demo\n---\n\n## When to Use\n\nIn tests.\n\n## Procedure\n\n### Step 1\n\n**Expected:** ok\n",
        )
        .unwrap();
        skill_dir
    }

    fn ctx<'a>(project_dir: &'a Path) -> InstallCtx<'a> {
        InstallCtx {
            project_dir,
            almanac_root: project_dir,
            scope: Scope::Project,
            options: InstallOptions::default(),
        }
    }

    #[test]
    fn detect_keys_on_either_path() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!Windsurf.detect(dir.path()).unwrap());
        fs::create_dir(dir.path().join(".windsurf")).unwrap();
        assert!(Windsurf.detect(dir.path()).unwrap());

        let dir2 = tempfile::tempdir().unwrap();
        fs::write(dir2.path().join(".windsurfrules"), "").unwrap();
        assert!(Windsurf.detect(dir2.path()).unwrap());
    }

    #[test]
    fn content_types_are_skills_only() {
        assert!(Windsurf.supports(ContentType::Skill));
        assert!(!Windsurf.supports(ContentType::Agent));
    }

    #[test]
    fn install_dir_mode_writes_condensed_rule_file() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let result = Windsurf.install(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Created);
        let target = dir.path().join(".windsurf/rules/demo.md");
        assert!(target.is_file());
        let content = fs::read_to_string(&target).unwrap();
        // condense_skill keeps frontmatter + When-to-Use + Procedure heading.
        assert!(content.contains("## When to Use"));
        // Dir mode writes plain content, no markers.
        assert!(!content.contains("agent-almanac:start"));
    }

    #[test]
    fn install_dir_mode_skips_when_present_without_force() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        Windsurf.install(&item, &ctx(dir.path())).unwrap();
        let result = Windsurf.install(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Skipped);
    }

    #[test]
    fn install_single_file_mode_appends_marked_section() {
        let dir = tempfile::tempdir().unwrap();
        // `.windsurfrules` present, `.windsurf/rules/` absent → single-file mode.
        fs::write(dir.path().join(".windsurfrules"), "# Rules\n").unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let result = Windsurf.install(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Created);
        let content = fs::read_to_string(dir.path().join(".windsurfrules")).unwrap();
        assert!(content.contains("<!-- agent-almanac:start:skill:demo -->"));
        assert!(content.contains("## When to Use"));
        // Directory was never created.
        assert!(!dir.path().join(".windsurf/rules").exists());
    }

    #[test]
    fn dir_mode_wins_when_rules_dir_exists_even_if_windsurfrules_present() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join(".windsurfrules"), "# Rules\n").unwrap();
        fs::create_dir_all(dir.path().join(".windsurf/rules")).unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        Windsurf.install(&item, &ctx(dir.path())).unwrap();
        assert!(dir.path().join(".windsurf/rules/demo.md").is_file());
        // `.windsurfrules` left untouched.
        let content = fs::read_to_string(dir.path().join(".windsurfrules")).unwrap();
        assert!(!content.contains("agent-almanac:start"));
    }

    #[test]
    fn uninstall_removes_dir_mode_rule() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        Windsurf.install(&item, &ctx(dir.path())).unwrap();
        let result = Windsurf.uninstall(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Removed);
        assert!(!dir.path().join(".windsurf/rules/demo.md").exists());
    }

    #[test]
    fn uninstall_splices_single_file_section() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join(".windsurfrules"), "# Rules\n").unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        Windsurf.install(&item, &ctx(dir.path())).unwrap();
        let result = Windsurf.uninstall(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Removed);
        let content = fs::read_to_string(dir.path().join(".windsurfrules")).unwrap();
        assert!(!content.contains("agent-almanac:start:skill:demo"));
    }

    #[test]
    fn uninstall_is_idempotent_when_missing() {
        let dir = tempfile::tempdir().unwrap();
        let item = skill_item("demo", dir.path().join("skills/demo"));
        let result = Windsurf.uninstall(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("not installed"));
    }

    #[test]
    fn list_installed_returns_dir_mode_rules() {
        let dir = tempfile::tempdir().unwrap();
        for id in ["alpha", "beta"] {
            let skill_dir = write_skill(&dir.path().join("skills"), id);
            let item = skill_item(id, skill_dir);
            Windsurf.install(&item, &ctx(dir.path())).unwrap();
        }
        let listed = Windsurf.list_installed(dir.path(), Scope::Project).unwrap();
        let ids: Vec<_> = listed.iter().map(|i| i.id.as_str()).collect();
        assert_eq!(ids, vec!["alpha", "beta"]);
    }

    #[test]
    fn audit_warns_when_empty_and_ok_when_populated() {
        let dir = tempfile::tempdir().unwrap();
        let empty = Windsurf.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(
            empty.warnings,
            vec!["No Windsurf content installed".to_string()]
        );

        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        Windsurf.install(&item, &ctx(dir.path())).unwrap();
        let full = Windsurf.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(full.ok, vec!["1 rules installed".to_string()]);
    }
}
