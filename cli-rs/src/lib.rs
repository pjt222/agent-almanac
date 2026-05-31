pub mod adapters;
pub mod app;
pub mod campfire;
pub mod cli;
pub mod content;
pub mod error;
pub mod event;
pub mod fire;
pub mod manifest;
pub mod pixels;
pub mod screens;
pub mod search;
pub mod state;
pub mod theme;

use std::path::{Path, PathBuf};

use adapters::base::{ContentType, InstallCtx, InstallOptions, Item, Scope};
use cli::{Args, Command, Kind};
use error::{Error, Result};

pub fn run(args: Args) -> Result<()> {
    match args.command {
        None | Some(Command::Tui) => app::run_tui(args.root.as_deref(), args.animate),
        Some(Command::List { kind }) => command_list(kind, args.root.as_deref()),
        Some(Command::Detect) => command_detect(args.root.as_deref()),
        Some(Command::Install {
            kind,
            id,
            global,
            force,
            dry_run,
            pi_extensions,
        }) => command_install(
            kind,
            &id,
            global,
            force,
            dry_run,
            pi_extensions,
            args.root.as_deref(),
        ),
        Some(Command::Uninstall {
            kind,
            id,
            global,
            dry_run,
        }) => command_uninstall(kind, &id, global, dry_run),
        Some(Command::Audit { global }) => command_audit(global),
        Some(Command::Gather { name, dry_run }) => {
            command_gather(&name, dry_run, args.root.as_deref())
        }
        Some(Command::Tend { dry_run }) => command_tend(dry_run),
        Some(Command::Search { query }) => command_search(&query, args.root.as_deref()),
        Some(Command::Init) => command_init(args.root.as_deref()),
        Some(Command::Sync { dry_run }) => command_sync(dry_run, args.root.as_deref()),
        Some(Command::Scatter { name, dry_run }) => {
            command_scatter(&name, dry_run, args.root.as_deref())
        }
        Some(Command::Bundle {
            framework,
            max_tokens,
        }) => command_bundle(&framework, max_tokens),
        Some(Command::Version) => {
            println!("{}", env!("CARGO_PKG_VERSION"));
            Ok(())
        }
    }
}

fn command_list(kind: cli::Kind, root: Option<&std::path::Path>) -> Result<()> {
    let registries = content::registry::load(root)?;
    let total = match kind {
        cli::Kind::Skills => registries.skills.total(),
        cli::Kind::Agents => registries.agents.total(),
        cli::Kind::Teams => registries.teams.total(),
        cli::Kind::Guides => registries.guides.total(),
    };
    println!("{kind:?}: {total}");
    Ok(())
}

fn command_detect(_root: Option<&Path>) -> Result<()> {
    let cwd = std::env::current_dir()?;
    let detected = adapters::detect_all(&cwd)?;
    if detected.is_empty() {
        println!("No frameworks detected in {}", cwd.display());
    } else {
        for id in detected {
            println!("{id}");
        }
    }
    Ok(())
}

/// Resolve a CLI `kind`/`id` pair to an installable [`Item`], verifying the id
/// against the registry and locating its on-disk source directory.
fn resolve_item(almanac_root: &Path, kind: Kind, id: &str) -> Result<Item> {
    let ctype = kind.content_type();
    let registries = content::registry::load(Some(almanac_root))?;
    let mut domain = None;
    let source_dir = match ctype {
        ContentType::Skill => {
            let skill = registries
                .skills
                .flat()
                .into_iter()
                .find(|s| s.id == id)
                .ok_or_else(|| Error::UnknownItem(format!("skill: {id}")))?;
            domain = Some(skill.domain);
            almanac_root.join("skills").join(id)
        }
        ContentType::Agent => {
            if !registries.agents.flat().iter().any(|a| a.id == id) {
                return Err(Error::UnknownItem(format!("agent: {id}")));
            }
            // claude-code installs the whole agents/ directory as one symlink.
            almanac_root.join("agents")
        }
        ContentType::Team => {
            if !registries.teams.flat().iter().any(|t| t.id == id) {
                return Err(Error::UnknownItem(format!("team: {id}")));
            }
            almanac_root.join("teams")
        }
        ContentType::Guide => almanac_root.join("teams"),
    };
    Ok(Item {
        kind: ctype,
        id: id.to_string(),
        source_dir,
        domain,
    })
}

fn scope_of(global: bool) -> Scope {
    if global {
        Scope::Global
    } else {
        Scope::Project
    }
}

/// Print one adapter result line, e.g. `claude-code: Created .claude/skills/x`.
fn report(adapter_id: &str, action: adapters::base::Action, path: &Path, details: Option<String>) {
    let suffix = details.map(|d| format!(" ({d})")).unwrap_or_default();
    println!("{adapter_id}: {action:?} {}{suffix}", path.display());
}

#[allow(clippy::too_many_arguments)]
fn command_install(
    kind: Kind,
    id: &str,
    global: bool,
    force: bool,
    dry_run: bool,
    pi_extensions: bool,
    root: Option<&Path>,
) -> Result<()> {
    let root = root.ok_or(Error::RootNotFound)?;
    let almanac_root = root
        .canonicalize()
        .map_err(|_| Error::RegistryNotFound(root.display().to_string()))?;
    let ctype = kind.content_type();
    let item = resolve_item(&almanac_root, kind, id)?;
    let project_dir = std::env::current_dir()?;

    // Install only into frameworks actually present — mirrors the Node CLI's
    // `getAdaptersForDetections`. Without this gate every adapter would write
    // its tree unconditionally (e.g. a stray `.hermes/` in any directory).
    let detected = adapters::detect_all(&project_dir)?;
    if detected.is_empty() {
        println!(
            "no frameworks detected in {}; nothing installed",
            project_dir.display()
        );
        return Ok(());
    }

    let ctx = InstallCtx {
        project_dir: &project_dir,
        almanac_root: &almanac_root,
        scope: scope_of(global),
        options: InstallOptions {
            dry_run,
            force,
            pi_extensions,
        },
    };

    let mut handled = false;
    for adapter in adapters::all() {
        if !detected.iter().any(|d| *d == adapter.id()) {
            continue;
        }
        if !adapter.supports(ctype) {
            println!("{}: does not support {kind:?}", adapter.id());
            continue;
        }
        let r = adapter.install(&item, &ctx)?;
        report(adapter.id(), r.action, &r.path, r.details);
        handled = true;
    }
    if !handled {
        println!("no detected framework handles {kind:?}");
    }
    Ok(())
}

fn command_uninstall(kind: Kind, id: &str, global: bool, dry_run: bool) -> Result<()> {
    let ctype = kind.content_type();
    let project_dir = std::env::current_dir()?;
    // Uninstall only needs the id; `source_dir` is unused on this path and
    // `domain` is unknown (no registry without `--root`). Adapters that need
    // the domain — Hermes — scan their install tree to recover it.
    let item = Item {
        kind: ctype,
        id: id.to_string(),
        source_dir: PathBuf::new(),
        domain: None,
    };
    let ctx = InstallCtx {
        project_dir: &project_dir,
        almanac_root: &project_dir,
        scope: scope_of(global),
        options: InstallOptions {
            dry_run,
            force: false,
            pi_extensions: false,
        },
    };
    let detected = adapters::detect_all(&project_dir)?;
    if detected.is_empty() {
        println!(
            "no frameworks detected in {}; nothing to uninstall",
            project_dir.display()
        );
        return Ok(());
    }
    for adapter in adapters::all() {
        if !detected.iter().any(|d| *d == adapter.id()) {
            continue;
        }
        if !adapter.supports(ctype) {
            continue;
        }
        let r = adapter.uninstall(&item, &ctx)?;
        report(adapter.id(), r.action, &r.path, r.details);
    }
    Ok(())
}

fn command_audit(global: bool) -> Result<()> {
    let project_dir = std::env::current_dir()?;
    let scope = scope_of(global);
    let detected = adapters::detect_all(&project_dir)?;
    if detected.is_empty() {
        println!("no frameworks detected in {}", project_dir.display());
        return Ok(());
    }
    for adapter in adapters::all() {
        if !detected.iter().any(|d| *d == adapter.id()) {
            continue;
        }
        let entry = adapter.audit(&project_dir, scope)?;
        println!("{}", entry.framework);
        for s in &entry.ok {
            println!("  ok: {s}");
        }
        for s in &entry.warnings {
            println!("  warn: {s}");
        }
        for s in &entry.errors {
            println!("  error: {s}");
        }
        if entry.ok.is_empty() && entry.warnings.is_empty() && entry.errors.is_empty() {
            println!("  (nothing installed)");
        }
    }
    Ok(())
}

fn command_gather(team_id: &str, dry_run: bool, root: Option<&Path>) -> Result<()> {
    use adapters::base::Action;
    use std::collections::BTreeSet;

    let root = root.ok_or(Error::RootNotFound)?;
    let almanac_root = root
        .canonicalize()
        .map_err(|_| Error::RegistryNotFound(root.display().to_string()))?;

    let registries = content::registry::load(Some(&almanac_root))?;
    let team = registries
        .teams
        .flat()
        .into_iter()
        .find(|t| t.id == team_id)
        .ok_or_else(|| Error::UnknownItem(format!("team: {team_id}")))?;

    // Inherited skills every agent gets (e.g. meditate, heal).
    let default_skills: Vec<String> = registries.agents.default_skill_names();
    let agents_by_id: std::collections::HashMap<String, content::registry::AgentSummary> =
        registries
            .agents
            .flat()
            .into_iter()
            .map(|a| (a.id.clone(), a))
            .collect();

    let mut agent_ids: Vec<String> = Vec::new();
    let mut skill_ids: BTreeSet<String> = BTreeSet::new();
    for member_id in &team.members {
        let Some(agent) = agents_by_id.get(member_id) else {
            println!("warning: team `{team_id}` lists unknown agent `{member_id}` — skipping");
            continue;
        };
        agent_ids.push(member_id.clone());
        for sid in &agent.core_skills {
            skill_ids.insert(sid.clone());
        }
        for sid in &default_skills {
            skill_ids.insert(sid.clone());
        }
    }

    let project_dir = std::env::current_dir()?;
    let detected = adapters::detect_all(&project_dir)?;
    if detected.is_empty() {
        println!(
            "no frameworks detected in {}; nothing gathered",
            project_dir.display()
        );
        return Ok(());
    }

    let ctx = InstallCtx {
        project_dir: &project_dir,
        almanac_root: &almanac_root,
        scope: Scope::Project,
        options: InstallOptions {
            dry_run,
            force: false,
            pi_extensions: false,
        },
    };

    if dry_run {
        println!("(dry-run — no filesystem changes)");
    }
    println!(
        "Gathering `{team_id}` — {} agent(s), {} unique skill(s)",
        agent_ids.len(),
        skill_ids.len()
    );

    let mut installed_skill_count = 0usize;
    let mut failed_skills: Vec<String> = Vec::new();

    for sid in &skill_ids {
        let item = match resolve_item(&almanac_root, Kind::Skills, sid) {
            Ok(i) => i,
            Err(_) => {
                println!("warning: unknown skill `{sid}` — skipping");
                failed_skills.push(sid.clone());
                continue;
            }
        };
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Skill) {
                continue;
            }
            match adapter.install(&item, &ctx) {
                Ok(r) => {
                    if r.action == Action::Created {
                        installed_skill_count += 1;
                    }
                    report(adapter.id(), r.action, &r.path, r.details);
                }
                Err(e) => {
                    println!("error installing skill `{sid}` via {}: {e}", adapter.id());
                    if !failed_skills.contains(sid) {
                        failed_skills.push(sid.clone());
                    }
                }
            }
        }
    }

    for aid in &agent_ids {
        let item = match resolve_item(&almanac_root, Kind::Agents, aid) {
            Ok(i) => i,
            Err(_) => continue,
        };
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Agent) {
                continue;
            }
            let r = adapter.install(&item, &ctx)?;
            report(adapter.id(), r.action, &r.path, r.details);
        }
    }

    if let Ok(team_item) = resolve_item(&almanac_root, Kind::Teams, team_id) {
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Team) {
                continue;
            }
            let r = adapter.install(&team_item, &ctx)?;
            report(adapter.id(), r.action, &r.path, r.details);
        }
    }

    if !dry_run {
        let mut state = campfire::state::load(&project_dir);
        campfire::state::record_gather(
            &mut state,
            team_id,
            agent_ids,
            installed_skill_count,
            failed_skills,
        );
        campfire::state::save(&project_dir, &state)?;
    }

    Ok(())
}

fn command_sync(dry_run: bool, root: Option<&Path>) -> Result<()> {
    use crate::adapters::base::FrameworkAdapter;
    use std::collections::HashSet;

    let root = root.ok_or(Error::RootNotFound)?;
    let almanac_root = root
        .canonicalize()
        .map_err(|_| Error::RegistryNotFound(root.display().to_string()))?;

    let project_dir = std::env::current_dir()?;
    let manifest = manifest::load(&project_dir)?.ok_or(Error::ManifestMissing)?;
    let registries = content::registry::load(Some(&almanac_root))?;
    let desired = manifest::resolve(&manifest, &registries);
    let desired_skill_ids: HashSet<String> = desired.skills.iter().cloned().collect();

    let detected = adapters::detect_all(&project_dir)?;
    if detected.is_empty() {
        println!(
            "no frameworks detected in {}; nothing to sync",
            project_dir.display()
        );
        return Ok(());
    }

    if dry_run {
        println!("(dry-run — no filesystem changes)");
    }
    let scope = Scope::Project;
    let ctx = InstallCtx {
        project_dir: &project_dir,
        almanac_root: &almanac_root,
        scope,
        options: InstallOptions {
            dry_run,
            force: false,
            pi_extensions: false,
        },
    };

    println!(
        "Sync: install missing — {} skill(s), {} agent(s), {} team(s) desired",
        desired.skills.len(),
        desired.agents.len(),
        desired.teams.len()
    );

    for sid in &desired.skills {
        let item = match resolve_item(&almanac_root, Kind::Skills, sid) {
            Ok(i) => i,
            Err(_) => continue,
        };
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Skill) {
                continue;
            }
            let r = adapter.install(&item, &ctx)?;
            report(adapter.id(), r.action, &r.path, r.details);
        }
    }
    for aid in &desired.agents {
        let item = match resolve_item(&almanac_root, Kind::Agents, aid) {
            Ok(i) => i,
            Err(_) => continue,
        };
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Agent) {
                continue;
            }
            let r = adapter.install(&item, &ctx)?;
            report(adapter.id(), r.action, &r.path, r.details);
        }
    }
    for tid in &desired.teams {
        let item = match resolve_item(&almanac_root, Kind::Teams, tid) {
            Ok(i) => i,
            Err(_) => continue,
        };
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Team) {
                continue;
            }
            let r = adapter.install(&item, &ctx)?;
            report(adapter.id(), r.action, &r.path, r.details);
        }
    }

    // Removal pass — universal adapter only (the cross-client interop path).
    // Skills installed under `.agents/skills/` that aren't in the desired set
    // get unlinked. Other adapters are left alone: each one tracks its own
    // surface and cross-adapter teardown belongs in a future `--prune-all`.
    let universal = adapters::universal::Universal;
    let installed = universal.list_installed(&project_dir, scope)?;
    let extras: Vec<&Item> = installed
        .iter()
        .filter(|i| !desired_skill_ids.contains(&i.id))
        .collect();
    if !extras.is_empty() {
        println!("Sync: remove extras — {} skill(s)", extras.len());
        for item in extras {
            let r = universal.uninstall(item, &ctx)?;
            report(universal.id(), r.action, &r.path, r.details);
        }
    }

    Ok(())
}

fn command_init(root: Option<&Path>) -> Result<()> {
    let root = root.ok_or(Error::RootNotFound)?;
    let almanac_root = root
        .canonicalize()
        .map_err(|_| Error::RegistryNotFound(root.display().to_string()))?;

    let registries = content::registry::load(Some(&almanac_root))?;
    let project_dir = std::env::current_dir()?;

    // Frameworks: detected, excluding `universal` (Node convention — universal
    // is implicit, not a framework the user "chose").
    let detected: Vec<String> = adapters::detect_all(&project_dir)?
        .into_iter()
        .filter(|d| *d != "universal")
        .map(|d| d.to_string())
        .collect();

    let manifest = manifest::generate(&almanac_root, detected);
    let path = manifest::save(&project_dir, &manifest)?;

    println!("Created {}", path.display());
    println!(
        "Available: {} skills, {} agents, {} teams",
        registries.skills.total(),
        registries.agents.total(),
        registries.teams.total()
    );
    println!("Edit the file, then run `agent-almanac-rs sync` to apply.");
    Ok(())
}

fn command_search(query: &str, root: Option<&Path>) -> Result<()> {
    let q = query.to_lowercase();
    let registries = content::registry::load(root)?;

    let contains = |hay: &str| hay.to_lowercase().contains(&q);
    let any_contains = |fields: &[&str]| fields.iter().any(|f| contains(f));

    let mut hits: Vec<(&'static str, String, String)> = Vec::new();

    for skill in registries.skills.flat() {
        if any_contains(&[&skill.id, &skill.description, &skill.domain]) {
            hits.push(("skill", skill.id, skill.description));
        }
    }
    for agent in registries.agents.flat() {
        let tags = agent.tags.join(",");
        if any_contains(&[&agent.id, &agent.description, &tags]) {
            hits.push(("agent", agent.id, agent.description));
        }
    }
    for team in registries.teams.flat() {
        let tags = team.tags.join(",");
        if any_contains(&[&team.id, &team.description, &tags]) {
            hits.push(("team", team.id, team.description));
        }
    }

    if hits.is_empty() {
        println!("0 result(s) for \"{query}\"");
        return Ok(());
    }

    println!("{} result(s) for \"{query}\":", hits.len());
    for (kind, id, desc) in &hits {
        let snippet: String = desc.chars().take(80).collect();
        let ellipsis = if desc.chars().count() > 80 { "…" } else { "" };
        println!("  {kind:<5} {id} — {snippet}{ellipsis}");
    }
    Ok(())
}

fn command_scatter(team_id: &str, dry_run: bool, root: Option<&Path>) -> Result<()> {
    use std::collections::{BTreeSet, HashSet};

    let root = root.ok_or(Error::RootNotFound)?;
    let almanac_root = root
        .canonicalize()
        .map_err(|_| Error::RegistryNotFound(root.display().to_string()))?;

    let registries = content::registry::load(Some(&almanac_root))?;
    let team = registries
        .teams
        .flat()
        .into_iter()
        .find(|t| t.id == team_id)
        .ok_or_else(|| Error::UnknownItem(format!("team: {team_id}")))?;

    let project_dir = std::env::current_dir()?;
    let mut state = campfire::state::load(&project_dir);
    if !state.fires.contains_key(team_id) {
        return Err(Error::FireNotBurning(team_id.to_string()));
    }

    let default_skills: Vec<String> = registries.agents.default_skill_names();
    let agents_by_id: std::collections::HashMap<String, content::registry::AgentSummary> =
        registries
            .agents
            .flat()
            .into_iter()
            .map(|a| (a.id.clone(), a))
            .collect();

    // Collect this team's full skill + agent set.
    let mut team_agent_ids: Vec<String> = Vec::new();
    let mut team_skill_ids: BTreeSet<String> = BTreeSet::new();
    for member_id in &team.members {
        let Some(agent) = agents_by_id.get(member_id) else {
            continue;
        };
        team_agent_ids.push(member_id.clone());
        for sid in &agent.core_skills {
            team_skill_ids.insert(sid.clone());
        }
        for sid in &default_skills {
            team_skill_ids.insert(sid.clone());
        }
    }

    // Anything still needed by OTHER burning fires must stay installed.
    let mut kept_skills: HashSet<String> = HashSet::new();
    let mut kept_agents: HashSet<String> = HashSet::new();
    for (other_id, other_fire) in state.fires.iter() {
        if other_id == team_id {
            continue;
        }
        for other_agent_id in &other_fire.agents {
            kept_agents.insert(other_agent_id.clone());
            if let Some(other_agent) = agents_by_id.get(other_agent_id) {
                for sid in &other_agent.core_skills {
                    kept_skills.insert(sid.clone());
                }
                for sid in &default_skills {
                    kept_skills.insert(sid.clone());
                }
            }
        }
    }

    let to_remove_skills: Vec<String> = team_skill_ids
        .iter()
        .filter(|s| !kept_skills.contains(s.as_str()))
        .cloned()
        .collect();
    let to_remove_agents: Vec<String> = team_agent_ids
        .iter()
        .filter(|a| !kept_agents.contains(a.as_str()))
        .cloned()
        .collect();

    let detected = adapters::detect_all(&project_dir)?;
    if detected.is_empty() {
        println!(
            "no frameworks detected in {}; nothing scattered",
            project_dir.display()
        );
        return Ok(());
    }

    let ctx = InstallCtx {
        project_dir: &project_dir,
        almanac_root: &almanac_root,
        scope: Scope::Project,
        options: InstallOptions {
            dry_run,
            force: false,
            pi_extensions: false,
        },
    };

    if dry_run {
        println!("(dry-run — no filesystem changes)");
    }
    println!(
        "Scattering `{team_id}` — removing {} skill(s), {} agent(s) (kept {} shared skill(s))",
        to_remove_skills.len(),
        to_remove_agents.len(),
        kept_skills.len(),
    );

    for sid in &to_remove_skills {
        let item = Item {
            kind: ContentType::Skill,
            id: sid.clone(),
            source_dir: PathBuf::new(),
            domain: None,
        };
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Skill) {
                continue;
            }
            let r = adapter.uninstall(&item, &ctx)?;
            report(adapter.id(), r.action, &r.path, r.details);
        }
    }

    for aid in &to_remove_agents {
        let item = Item {
            kind: ContentType::Agent,
            id: aid.clone(),
            source_dir: PathBuf::new(),
            domain: None,
        };
        for adapter in adapters::all() {
            if !detected.iter().any(|d| *d == adapter.id()) {
                continue;
            }
            if !adapter.supports(ContentType::Agent) {
                continue;
            }
            let r = adapter.uninstall(&item, &ctx)?;
            report(adapter.id(), r.action, &r.path, r.details);
        }
    }

    // Team itself — always remove (Node behaviour).
    let team_item = Item {
        kind: ContentType::Team,
        id: team_id.to_string(),
        source_dir: PathBuf::new(),
        domain: None,
    };
    for adapter in adapters::all() {
        if !detected.iter().any(|d| *d == adapter.id()) {
            continue;
        }
        if !adapter.supports(ContentType::Team) {
            continue;
        }
        let r = adapter.uninstall(&team_item, &ctx)?;
        report(adapter.id(), r.action, &r.path, r.details);
    }

    if !dry_run {
        campfire::state::record_scatter(&mut state, team_id);
        campfire::state::save(&project_dir, &state)?;
    }

    Ok(())
}

fn command_tend(dry_run: bool) -> Result<()> {
    let project_dir = std::env::current_dir()?;
    let mut state = campfire::state::load(&project_dir);

    let fires = campfire::state::fire_status(&state);
    if fires.is_empty() {
        println!("No fires to tend. Gather a campfire first.");
        return Ok(());
    }

    println!("Tending {} campfire(s):", fires.len());
    for (id, fire, heat) in &fires {
        let agents = if fire.agents.is_empty() {
            "(no agents)".to_string()
        } else {
            fire.agents.join(", ")
        };
        println!(
            "  {}  {id} — {} skill(s), agents: {agents}",
            heat.as_str(),
            fire.skill_count,
        );
        println!("    last warmed: {}", fire.last_warmed);
        if !fire.failed_skills.is_empty() {
            println!("    failed skills: {}", fire.failed_skills.join(", "));
        }
    }

    if !dry_run {
        // Warm each fire we tended.
        let ids: Vec<String> = fires.iter().map(|(id, _, _)| id.clone()).collect();
        for id in ids {
            campfire::state::record_warm(&mut state, &id);
        }
        campfire::state::save(&project_dir, &state)?;
    }

    Ok(())
}

fn command_bundle(framework: &str, max_tokens: usize) -> Result<()> {
    let project_dir = std::env::current_dir()?;
    match framework {
        "ai-edge" => {
            let (path, count) = adapters::ai_edge::AiEdge.bundle(&project_dir, max_tokens)?;
            println!("Bundle written to {}", path.display());
            println!("  {count} skill(s) included (budget: {max_tokens} tokens)");
            Ok(())
        }
        other => Err(Error::BundleUnsupported(other.to_string())),
    }
}
