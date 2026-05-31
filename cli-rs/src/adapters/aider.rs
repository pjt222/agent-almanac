//! Aider adapter — appends condensed skill sections to `CONVENTIONS.md`.
//!
//! Mirrors the Node CLI's `cli/adapters/aider.js`:
//!
//! - **Skills**: a condensed `SKILL.md`, wrapped in `agent-almanac` marker
//!   comments, is appended to `CONVENTIONS.md` in the project directory.
//!   Re-installs replace the marked block in place; uninstall splices it out.
//! - **Agents / Teams / Guides**: not supported (Aider is skills-only).
//!
//! `CONVENTIONS.md` is project-scoped — Aider has no global location, so the
//! adapter ignores `Scope`. `detect()` keys on `.aider.conf.yml` or
//! `CONVENTIONS.md`.

use std::fs;
use std::path::Path;

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::transformer;
use crate::error::Result;

pub struct Aider;

const CONVENTIONS_FILE: &str = "CONVENTIONS.md";
const CONFIG_FILE: &str = ".aider.conf.yml";
const MARKER_TYPE: &str = "skill";

impl Aider {
    fn conventions_file(project_dir: &Path) -> std::path::PathBuf {
        project_dir.join(CONVENTIONS_FILE)
    }

    fn install_skill(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let file = Self::conventions_file(ctx.project_dir);

        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Created,
                path: file,
                details: Some("dry-run: append to CONVENTIONS.md".to_string()),
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
                details: Some("already in CONVENTIONS.md".to_string()),
            });
        }

        let content = transformer::remove_marked_section(&content, MARKER_TYPE, &item.id);
        // `resolve_item` sets a skill's `source_dir` to `almanac/skills/<id>/`;
        // the definition file is `SKILL.md` inside it.
        let source = item.source_dir.join("SKILL.md");
        let condensed = transformer::condense_skill(&source)?;
        let section = transformer::wrap_in_markers(MARKER_TYPE, &item.id, &condensed);
        let new_content = format!("{}\n\n{}\n", content.trim_end(), section);
        fs::write(&file, new_content)?;

        Ok(InstallResult {
            action: Action::Created,
            path: file,
            details: None,
        })
    }

    fn uninstall_skill(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        let file = Self::conventions_file(ctx.project_dir);
        if !file.exists() {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: file,
                details: Some("no CONVENTIONS.md".to_string()),
            });
        }
        let content = fs::read_to_string(&file)?;
        if !transformer::has_marked_section(&content, MARKER_TYPE, &item.id) {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: file,
                details: Some("not in CONVENTIONS.md".to_string()),
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

impl FrameworkAdapter for Aider {
    fn id(&self) -> &'static str {
        "aider"
    }

    fn display_name(&self) -> &'static str {
        "Aider"
    }

    fn strategy(&self) -> Strategy {
        Strategy::AppendToFile
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(CONFIG_FILE).exists() || Self::conventions_file(project_dir).exists())
    }

    fn target_path(&self, project_dir: &Path, _scope: Scope) -> Result<std::path::PathBuf> {
        // `CONVENTIONS.md` is project-directory only; scope does not vary it.
        Ok(Self::conventions_file(project_dir))
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.install_skill(item, ctx),
            ContentType::Agent | ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::conventions_file(ctx.project_dir),
                details: Some("Aider supports skills only".to_string()),
            }),
        }
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        match item.kind {
            ContentType::Skill => self.uninstall_skill(item, ctx),
            ContentType::Agent | ContentType::Team | ContentType::Guide => Ok(InstallResult {
                action: Action::Skipped,
                path: Self::conventions_file(ctx.project_dir),
                details: Some("Aider supports skills only".to_string()),
            }),
        }
    }

    fn list_installed(&self, _project_dir: &Path, _scope: Scope) -> Result<Vec<Item>> {
        // Skill sections live inside CONVENTIONS.md; the Node adapter likewise
        // reports nothing here.
        Ok(Vec::new())
    }

    fn audit(&self, project_dir: &Path, _scope: Scope) -> Result<AuditEntry> {
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };
        if Self::conventions_file(project_dir).exists() {
            entry.ok.push("CONVENTIONS.md exists".to_string());
        } else {
            entry.warnings.push("No CONVENTIONS.md found".to_string());
        }
        Ok(entry)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapters::base::InstallOptions;
    use std::path::PathBuf;

    fn skill_item(id: &str, source_dir: PathBuf) -> Item {
        Item {
            kind: ContentType::Skill,
            id: id.to_string(),
            source_dir,
            domain: Some("general".to_string()),
        }
    }

    fn write_skill(dir: &Path, id: &str) -> PathBuf {
        let skill_dir = dir.join(id);
        fs::create_dir_all(&skill_dir).unwrap();
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: demo\ndescription: demo skill\n---\n\n\
             ## When to Use\n\nWhen testing.\n\n\
             ## Procedure\n\n### Step 1\n\n**Expected:** ok\n\n**On failure:** drop me\n\n\
             ## Common Pitfalls\n\n- drop me too\n\n\
             ## Validation\n\nDone.\n",
        )
        .unwrap();
        skill_dir
    }

    #[test]
    fn detect_keys_on_either_file() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!Aider.detect(dir.path()).unwrap());
        fs::write(dir.path().join("CONVENTIONS.md"), "# CONVENTIONS").unwrap();
        assert!(Aider.detect(dir.path()).unwrap());

        let dir2 = tempfile::tempdir().unwrap();
        fs::write(dir2.path().join(".aider.conf.yml"), "model: gpt-4").unwrap();
        assert!(Aider.detect(dir2.path()).unwrap());
    }

    #[test]
    fn install_appends_marked_section() {
        let dir = tempfile::tempdir().unwrap();
        let skills_root = dir.path().join("skills");
        let skill_dir = write_skill(&skills_root, "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        let result = Aider.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Created);
        let content = fs::read_to_string(dir.path().join("CONVENTIONS.md")).unwrap();
        assert!(content.contains("<!-- agent-almanac:start:skill:demo -->"));
        assert!(content.contains("<!-- agent-almanac:end:skill:demo -->"));
        // Condensed content keeps Validation, drops Pitfalls and On failure.
        assert!(content.contains("## Validation"));
        assert!(!content.contains("Common Pitfalls"));
        assert!(!content.contains("drop me"));
    }

    #[test]
    fn install_skips_if_already_present() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        Aider.install(&item, &ctx).unwrap();
        let result = Aider.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("already in CONVENTIONS.md"));
    }

    #[test]
    fn install_replaces_when_forced() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let opts = InstallOptions {
            force: true,
            ..Default::default()
        };
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: opts,
        };

        Aider.install(&item, &ctx).unwrap();
        let result = Aider.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Created);
        let content = fs::read_to_string(dir.path().join("CONVENTIONS.md")).unwrap();
        // Only one copy of the marker remains.
        assert_eq!(
            content
                .matches("<!-- agent-almanac:start:skill:demo -->")
                .count(),
            1
        );
    }

    #[test]
    fn uninstall_splices_section_out() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };

        Aider.install(&item, &ctx).unwrap();
        let result = Aider.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Removed);
        let content = fs::read_to_string(dir.path().join("CONVENTIONS.md")).unwrap();
        assert!(!content.contains("agent-almanac:start:skill:demo"));
    }

    #[test]
    fn uninstall_is_idempotent_when_file_missing() {
        let dir = tempfile::tempdir().unwrap();
        let item = skill_item("demo", dir.path().join("skills/demo"));
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        let result = Aider.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("no CONVENTIONS.md"));
    }

    #[test]
    fn uninstall_is_idempotent_when_section_absent() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(
            dir.path().join("CONVENTIONS.md"),
            "# CONVENTIONS\n\nUnrelated.\n",
        )
        .unwrap();
        let item = skill_item("demo", dir.path().join("skills/demo"));
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        let result = Aider.uninstall(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(result.details.as_deref(), Some("not in CONVENTIONS.md"));
    }

    #[test]
    fn non_skill_kinds_skip_with_message() {
        let dir = tempfile::tempdir().unwrap();
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: InstallOptions::default(),
        };
        let agent = Item {
            kind: ContentType::Agent,
            id: "demo-agent".to_string(),
            source_dir: dir.path().to_path_buf(),
            domain: None,
        };
        let result = Aider.install(&agent, &ctx).unwrap();
        assert_eq!(result.action, Action::Skipped);
        assert_eq!(
            result.details.as_deref(),
            Some("Aider supports skills only")
        );
    }

    #[test]
    fn dry_run_does_not_touch_disk() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let opts = InstallOptions {
            dry_run: true,
            ..Default::default()
        };
        let ctx = InstallCtx {
            project_dir: dir.path(),
            almanac_root: dir.path(),
            scope: Scope::Project,
            options: opts,
        };
        let result = Aider.install(&item, &ctx).unwrap();
        assert_eq!(result.action, Action::Created);
        assert!(!dir.path().join("CONVENTIONS.md").exists());
    }

    #[test]
    fn audit_reports_warning_when_no_file() {
        let dir = tempfile::tempdir().unwrap();
        let entry = Aider.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(entry.framework, "Aider");
        assert!(entry.ok.is_empty());
        assert_eq!(entry.warnings, vec!["No CONVENTIONS.md found".to_string()]);
    }

    #[test]
    fn audit_reports_ok_when_file_present() {
        let dir = tempfile::tempdir().unwrap();
        fs::write(dir.path().join("CONVENTIONS.md"), "# C").unwrap();
        let entry = Aider.audit(dir.path(), Scope::Project).unwrap();
        assert_eq!(entry.ok, vec!["CONVENTIONS.md exists".to_string()]);
        assert!(entry.warnings.is_empty());
    }
}
