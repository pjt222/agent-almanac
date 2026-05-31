//! Google AI Edge adapter — distills almanac content for on-device LLMs.
//!
//! Mirrors `cli/adapters/ai-edge.js`. Each install writes one distilled `.md`
//! per item under `.ai-edge/{skills,agents,teams}/<id>.md` — ~20–40 lines of
//! instruction-following text suitable for models with 2K–8K token windows
//! (Gemma 4, Phi, Llama on-device). The `bundle` helper concatenates all
//! installed skills into a single `bundle.md` system prompt fragment.
//!
//! Strategy `Copy` (writes plain files, not symlinks). Detects on
//! `.ai-edge/`, `ai-edge-gallery.json`, or `app/src/main/assets/models/`.
//!
//! The `bundle` method is not exposed via the Rust CLI yet — the Node CLI has
//! a separate `bundle` subcommand that the Rust port does not implement (see
//! the tracking issue's "Subcommand parity" list). The method stays public so
//! it can be wired up when that command lands.

use std::fs;
use std::path::{Path, PathBuf};

use super::base::{
    Action, AuditEntry, ContentType, FrameworkAdapter, InstallCtx, InstallResult, Item, Scope,
    Strategy,
};
use super::edge_transformer;
use crate::error::Result;

pub struct AiEdge;

impl AiEdge {
    fn dir_for(project_dir: &Path, kind: ContentType) -> PathBuf {
        let plural = match kind {
            ContentType::Skill => "skills",
            ContentType::Agent => "agents",
            ContentType::Team => "teams",
            ContentType::Guide => "guides",
        };
        project_dir.join(".ai-edge").join(plural)
    }

    fn target_for(project_dir: &Path, item: &Item) -> PathBuf {
        Self::dir_for(project_dir, item.kind).join(format!("{}.md", item.id))
    }

    fn source_for(item: &Item) -> PathBuf {
        // `resolve_item` sets `source_dir` to `almanac/skills/<id>/` for skills
        // and `almanac/agents/` (or `teams/`) for agents/teams.
        match item.kind {
            ContentType::Skill => item.source_dir.join("SKILL.md"),
            _ => item.source_dir.join(format!("{}.md", item.id)),
        }
    }

    /// Build a `bundle.md` from every installed skill; respects a token budget.
    /// Not wired to the CLI yet — see the module comment.
    pub fn bundle(&self, project_dir: &Path, max_tokens: usize) -> Result<(PathBuf, usize)> {
        let skills_dir = Self::dir_for(project_dir, ContentType::Skill);
        let mut items: Vec<(String, String, String)> = Vec::new();
        if skills_dir.is_dir() {
            let mut entries: Vec<_> = fs::read_dir(&skills_dir)?.collect::<std::io::Result<_>>()?;
            entries.sort_by_key(|e| e.file_name());
            for entry in entries {
                let name = entry.file_name();
                let name = name.to_string_lossy();
                if let Some(stem) = name.strip_suffix(".md") {
                    let content = fs::read_to_string(entry.path())?;
                    items.push(("skill".to_string(), stem.to_string(), content));
                }
            }
        }
        let bundled = edge_transformer::bundle_for_edge(&items, max_tokens);
        let path = project_dir.join(".ai-edge/bundle.md");
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(&path, bundled)?;
        Ok((path, items.len()))
    }
}

impl FrameworkAdapter for AiEdge {
    fn id(&self) -> &'static str {
        "ai-edge"
    }

    fn display_name(&self) -> &'static str {
        "Google AI Edge"
    }

    fn strategy(&self) -> Strategy {
        Strategy::Copy
    }

    fn content_types(&self) -> &'static [ContentType] {
        &[ContentType::Skill, ContentType::Agent, ContentType::Team]
    }

    fn detect(&self, project_dir: &Path) -> Result<bool> {
        Ok(project_dir.join(".ai-edge").exists()
            || project_dir.join("ai-edge-gallery.json").exists()
            || project_dir.join("app/src/main/assets/models").exists())
    }

    fn target_path(&self, project_dir: &Path, _scope: Scope) -> Result<PathBuf> {
        Ok(project_dir.join(".ai-edge"))
    }

    fn install(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind == ContentType::Guide {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("ai-edge does not install Guides".to_string()),
            });
        }
        let target = Self::target_for(ctx.project_dir, item);
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
        if let Some(parent) = target.parent() {
            fs::create_dir_all(parent)?;
        }
        let source = Self::source_for(item);
        let distilled = match item.kind {
            ContentType::Skill => edge_transformer::distill_skill(&source)?,
            ContentType::Agent => edge_transformer::distill_agent(&source)?,
            ContentType::Team => edge_transformer::distill_team(&source)?,
            ContentType::Guide => unreachable!(),
        };
        fs::write(&target, distilled)?;
        Ok(InstallResult {
            action: Action::Created,
            path: target,
            details: None,
        })
    }

    fn uninstall(&self, item: &Item, ctx: &InstallCtx<'_>) -> Result<InstallResult> {
        if item.kind == ContentType::Guide {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: self.target_path(ctx.project_dir, ctx.scope)?,
                details: Some("ai-edge does not install Guides".to_string()),
            });
        }
        let target = Self::target_for(ctx.project_dir, item);
        if !target.exists() {
            return Ok(InstallResult {
                action: Action::Skipped,
                path: target,
                details: Some("not installed".to_string()),
            });
        }
        if ctx.options.dry_run {
            return Ok(InstallResult {
                action: Action::Removed,
                path: target,
                details: Some("dry-run".to_string()),
            });
        }
        fs::remove_file(&target)?;
        Ok(InstallResult {
            action: Action::Removed,
            path: target,
            details: None,
        })
    }

    fn list_installed(&self, project_dir: &Path, _scope: Scope) -> Result<Vec<Item>> {
        let mut items: Vec<Item> = Vec::new();
        for (plural, kind) in [
            ("skills", ContentType::Skill),
            ("agents", ContentType::Agent),
            ("teams", ContentType::Team),
        ] {
            let dir = project_dir.join(".ai-edge").join(plural);
            if !dir.is_dir() {
                continue;
            }
            let mut entries: Vec<_> = fs::read_dir(&dir)?.collect::<std::io::Result<_>>()?;
            entries.sort_by_key(|e| e.file_name());
            for entry in entries {
                let name = entry.file_name();
                let name = name.to_string_lossy();
                if let Some(stem) = name.strip_suffix(".md") {
                    items.push(Item {
                        kind,
                        id: stem.to_string(),
                        source_dir: entry.path(),
                        domain: None,
                    });
                }
            }
        }
        Ok(items)
    }

    fn audit(&self, project_dir: &Path, scope: Scope) -> Result<AuditEntry> {
        let installed = self.list_installed(project_dir, scope)?;
        let bundle = project_dir.join(".ai-edge/bundle.md");
        let has_bundle = bundle.exists();
        let mut entry = AuditEntry {
            framework: self.display_name().to_string(),
            ..Default::default()
        };
        if !installed.is_empty() {
            entry
                .ok
                .push(format!("{} items distilled", installed.len()));
        }
        if has_bundle {
            entry.ok.push("bundle.md present".to_string());
        }
        if !has_bundle && !installed.is_empty() {
            entry.warnings.push(
                "No bundle.md — run `agent-almanac bundle --framework ai-edge` to generate"
                    .to_string(),
            );
        }
        if installed.is_empty() {
            entry
                .warnings
                .push("No content installed for AI Edge".to_string());
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
    fn agent_item(id: &str, source_dir: PathBuf) -> Item {
        Item {
            kind: ContentType::Agent,
            id: id.to_string(),
            source_dir,
            domain: None,
        }
    }
    fn team_item(id: &str, source_dir: PathBuf) -> Item {
        Item {
            kind: ContentType::Team,
            id: id.to_string(),
            source_dir,
            domain: None,
        }
    }

    fn write_skill(skills_root: &Path, id: &str) -> PathBuf {
        let skill_dir = skills_root.join(id);
        fs::create_dir_all(&skill_dir).unwrap();
        fs::write(
            skill_dir.join("SKILL.md"),
            "---\nname: demo\ndescription: a demo skill\n---\n\n\
             ## Procedure\n\n### Step 1: Pause\n\n### Step 2: Check\n\n\
             ## Validation\n\n- [ ] thing one\n- [ ] thing two\n",
        )
        .unwrap();
        skill_dir
    }

    fn write_agent(agents_root: &Path, id: &str) -> PathBuf {
        fs::create_dir_all(agents_root).unwrap();
        fs::write(
            agents_root.join(format!("{id}.md")),
            "---\nname: demo-agent\ndescription: an agent\nskills:\n  - skill-a\n---\n\n\
             ## Purpose\n\nA purpose line.\n",
        )
        .unwrap();
        agents_root.to_path_buf()
    }

    fn write_team(teams_root: &Path, id: &str) -> PathBuf {
        fs::create_dir_all(teams_root).unwrap();
        fs::write(
            teams_root.join(format!("{id}.md")),
            "---\nname: demo-team\ndescription: a team\nmembers:\n  - agent: alpha\n    role: lead\n---\n",
        )
        .unwrap();
        teams_root.to_path_buf()
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
    fn detect_keys_on_dot_ai_edge_or_gallery_json_or_models_dir() {
        let dir = tempfile::tempdir().unwrap();
        assert!(!AiEdge.detect(dir.path()).unwrap());
        fs::create_dir(dir.path().join(".ai-edge")).unwrap();
        assert!(AiEdge.detect(dir.path()).unwrap());

        let dir2 = tempfile::tempdir().unwrap();
        fs::write(dir2.path().join("ai-edge-gallery.json"), "{}").unwrap();
        assert!(AiEdge.detect(dir2.path()).unwrap());

        let dir3 = tempfile::tempdir().unwrap();
        fs::create_dir_all(dir3.path().join("app/src/main/assets/models")).unwrap();
        assert!(AiEdge.detect(dir3.path()).unwrap());
    }

    #[test]
    fn install_distills_skill_into_ai_edge_skills() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        let result = AiEdge.install(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Created);
        let target = dir.path().join(".ai-edge/skills/demo.md");
        assert!(target.is_file());
        let content = fs::read_to_string(&target).unwrap();
        assert!(content.contains("# demo"));
        assert!(content.contains("## Steps"));
        assert!(content.contains("## Verify"));
    }

    #[test]
    fn install_distills_agent_into_ai_edge_agents() {
        let dir = tempfile::tempdir().unwrap();
        write_agent(&dir.path().join("agents"), "demo-agent");
        let item = agent_item("demo-agent", dir.path().join("agents"));
        let result = AiEdge.install(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Created);
        let content = fs::read_to_string(dir.path().join(".ai-edge/agents/demo-agent.md")).unwrap();
        assert!(content.contains("# demo-agent"));
        assert!(content.contains("A purpose line."));
        assert!(content.contains("- skill-a"));
    }

    #[test]
    fn install_distills_team_into_ai_edge_teams() {
        let dir = tempfile::tempdir().unwrap();
        write_team(&dir.path().join("teams"), "demo-team");
        let item = team_item("demo-team", dir.path().join("teams"));
        let result = AiEdge.install(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Created);
        let content = fs::read_to_string(dir.path().join(".ai-edge/teams/demo-team.md")).unwrap();
        assert!(content.contains("- **alpha**: lead"));
    }

    #[test]
    fn install_skips_when_present_without_force() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        AiEdge.install(&item, &ctx(dir.path())).unwrap();
        let result = AiEdge.install(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Skipped);
    }

    #[test]
    fn uninstall_removes_distilled_file() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        let item = skill_item("demo", skill_dir);
        AiEdge.install(&item, &ctx(dir.path())).unwrap();
        let result = AiEdge.uninstall(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Removed);
        assert!(!dir.path().join(".ai-edge/skills/demo.md").exists());
    }

    #[test]
    fn uninstall_idempotent_when_missing() {
        let dir = tempfile::tempdir().unwrap();
        let item = skill_item("demo", dir.path().join("skills/demo"));
        let result = AiEdge.uninstall(&item, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Skipped);
    }

    #[test]
    fn guide_kind_is_unsupported() {
        let dir = tempfile::tempdir().unwrap();
        let guide = Item {
            kind: ContentType::Guide,
            id: "demo-guide".to_string(),
            source_dir: dir.path().to_path_buf(),
            domain: None,
        };
        let result = AiEdge.install(&guide, &ctx(dir.path())).unwrap();
        assert_eq!(result.action, Action::Skipped);
    }

    #[test]
    fn list_installed_returns_distilled_items_across_kinds() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        write_agent(&dir.path().join("agents"), "demo-agent");
        AiEdge
            .install(&skill_item("demo", skill_dir), &ctx(dir.path()))
            .unwrap();
        AiEdge
            .install(
                &agent_item("demo-agent", dir.path().join("agents")),
                &ctx(dir.path()),
            )
            .unwrap();

        let listed = AiEdge.list_installed(dir.path(), Scope::Project).unwrap();
        let ids: Vec<_> = listed.iter().map(|i| i.id.as_str()).collect();
        assert!(ids.contains(&"demo"));
        assert!(ids.contains(&"demo-agent"));
    }

    #[test]
    fn audit_flags_missing_bundle() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        AiEdge
            .install(&skill_item("demo", skill_dir), &ctx(dir.path()))
            .unwrap();
        let entry = AiEdge.audit(dir.path(), Scope::Project).unwrap();
        assert!(entry.ok.iter().any(|s| s.contains("1 items distilled")));
        assert!(entry.warnings.iter().any(|w| w.contains("No bundle.md")));
    }

    #[test]
    fn bundle_writes_concatenated_skills_file() {
        let dir = tempfile::tempdir().unwrap();
        let skill_dir = write_skill(&dir.path().join("skills"), "demo");
        AiEdge
            .install(&skill_item("demo", skill_dir), &ctx(dir.path()))
            .unwrap();
        let (path, count) = AiEdge.bundle(dir.path(), 4000).unwrap();
        assert_eq!(count, 1);
        assert!(path.is_file());
        let content = fs::read_to_string(&path).unwrap();
        assert!(content.contains("# Available Procedures"));
        assert!(content.contains("# demo"));
        assert!(content.contains("1 procedures loaded"));
    }

    #[test]
    fn audit_warns_when_empty() {
        let dir = tempfile::tempdir().unwrap();
        let entry = AiEdge.audit(dir.path(), Scope::Project).unwrap();
        assert!(entry
            .warnings
            .iter()
            .any(|w| w == "No content installed for AI Edge"));
    }
}
