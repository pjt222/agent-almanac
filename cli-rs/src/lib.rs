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

/// Reject an id that is anything other than a single safe path component.
///
/// The uninstall path has no registry to validate the id against, so a crafted
/// id like `../../something` would otherwise flow straight into an adapter's
/// `fs::remove_file`. Requiring exactly one [`Component::Normal`](std::path::Component::Normal)
/// rejects `..`, `/`, `\`, absolute paths, `.`, and nested paths on every
/// platform, while accepting the kebab-case ids the registry uses. Also applied
/// on the install path as defense-in-depth (the registry lookup there already
/// rejects unknown ids).
fn validate_item_id(id: &str) -> Result<()> {
    let mut comps = Path::new(id).components();
    match (comps.next(), comps.next()) {
        (Some(std::path::Component::Normal(c)), None) if c.to_str() == Some(id) => Ok(()),
        _ => Err(Error::InvalidId(id.to_string())),
    }
}

/// Resolve a CLI `kind`/`id` pair to an installable [`Item`], verifying the id
/// against the registry and locating its on-disk source directory.
fn resolve_item(almanac_root: &Path, kind: Kind, id: &str) -> Result<Item> {
    validate_item_id(id)?;
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

/// One filesystem-mutating operation an adapter can perform on an [`Item`].
#[derive(Clone, Copy)]
enum AdapterOp {
    Install,
    Uninstall,
}

/// Outcome of running an [`AdapterOp`] for one item across all detected adapters.
struct ItemRun {
    /// Adapters that actually ran the op (both detected and supporting the kind).
    ran: usize,
    /// Adapters whose op returned an error — reported to stderr, not propagated.
    failed: usize,
}

/// Run `op` for `item` across every detected adapter that supports the item's
/// kind, collecting per-adapter failures instead of propagating them.
///
/// Mirrors Node's `installAll`/`uninstallAll` (`cli/lib/installer.js`): each
/// adapter's error is reported to stderr and counted, never bubbled up — one
/// failing framework must not abort the rest of the run, nor flip the process
/// exit code (Node exits 0 on partial failure). Successful adapter results go
/// through [`report`] to stdout unchanged — the supported-adapter success lines
/// keep their old content and order — while errors now go to stderr. (The
/// install-time `"<adapter>: does not support <kind>"` stdout notice the old
/// `command_install` loop printed is intentionally dropped to match Node.)
/// Unsupported kinds follow Node's `installAll`: warn only for non-skill types
/// on non-universal adapters; everything else skips silently.
fn apply_to_adapters(
    op: AdapterOp,
    item: &Item,
    ctx: &InstallCtx<'_>,
    detected: &[&'static str],
) -> ItemRun {
    let mut run = ItemRun { ran: 0, failed: 0 };
    for adapter in adapters::all() {
        if !detected.iter().any(|d| *d == adapter.id()) {
            continue;
        }
        if !adapter.supports(item.kind) {
            if matches!(op, AdapterOp::Install)
                && item.kind != ContentType::Skill
                && adapter.id() != "universal"
            {
                eprintln!(
                    "warning: {:?}s not supported by {}; skipping {}",
                    item.kind,
                    adapter.display_name(),
                    item.id
                );
            }
            continue;
        }
        let res = match op {
            AdapterOp::Install => adapter.install(item, ctx),
            AdapterOp::Uninstall => adapter.uninstall(item, ctx),
        };
        run.ran += 1;
        match res {
            Ok(r) => report(adapter.id(), r.action, &r.path, r.details),
            Err(e) => {
                run.failed += 1;
                let verb = match op {
                    AdapterOp::Install => "installing",
                    AdapterOp::Uninstall => "uninstalling",
                };
                eprintln!("error {verb} `{}` via {}: {e}", item.id, adapter.id());
            }
        }
    }
    run
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

    let run = apply_to_adapters(AdapterOp::Install, &item, &ctx, &detected);
    if run.ran == 0 {
        println!("no detected framework handles {kind:?}");
    }
    Ok(())
}

fn command_uninstall(kind: Kind, id: &str, global: bool, dry_run: bool) -> Result<()> {
    // No registry on the uninstall path, so the id is otherwise unvalidated and
    // flows into adapter `fs::remove_file` calls — guard against `..` traversal.
    validate_item_id(id)?;
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
    apply_to_adapters(AdapterOp::Uninstall, &item, &ctx, &detected);
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
        // One framework's audit failure must not abort the rest — synthesize an
        // error entry and continue (mirrors Node `auditAll`).
        let entry = match adapter.audit(&project_dir, scope) {
            Ok(e) => e,
            Err(e) => adapters::base::AuditEntry {
                framework: adapter.display_name().to_string(),
                errors: vec![format!("Audit failed: {e}")],
                ..Default::default()
            },
        };
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

    // Resolve the team's unique skills up front, separating registry-known
    // (installable) from unknown ids. `skill_count` mirrors Node's
    // `allSkillItems.length`: the number of unique RESOLVABLE skills, independent
    // of how many adapters install each one. Unknown ids are warned and dropped.
    let mut resolvable: Vec<Item> = Vec::new();
    for sid in &skill_ids {
        match resolve_item(&almanac_root, Kind::Skills, sid) {
            Ok(item) => resolvable.push(item),
            Err(_) => println!("warning: unknown skill `{sid}` — skipping"),
        }
    }
    let skill_count = resolvable.len();

    if dry_run {
        println!("(dry-run — no filesystem changes)");
    }
    println!(
        "Gathering `{team_id}` — {} agent(s), {} unique skill(s)",
        agent_ids.len(),
        skill_count
    );

    // Ids that errored on install, across skills, agents, AND the team — Node's
    // `failedIds` is computed over the full `[...skills, ...agents, ...teams]`
    // install result set (`installer.js`), so an agent/team that fails to install
    // is recorded too (otherwise `tend`/campfire status would falsely show a
    // healthy fire). One failing adapter does not abort the rest of the gather;
    // an id is recorded once even if several adapters failed it. Ordering is
    // diagnostic-only (gather order) — exact Node order/duplication is not a
    // contract for this state field.
    let mut failed: Vec<String> = Vec::new();

    for item in &resolvable {
        let run = apply_to_adapters(AdapterOp::Install, item, &ctx, &detected);
        if run.failed > 0 && !failed.iter().any(|f| f == &item.id) {
            failed.push(item.id.clone());
        }
    }

    for aid in &agent_ids {
        let Ok(item) = resolve_item(&almanac_root, Kind::Agents, aid) else {
            continue;
        };
        let run = apply_to_adapters(AdapterOp::Install, &item, &ctx, &detected);
        if run.failed > 0 && !failed.iter().any(|f| f == &item.id) {
            failed.push(item.id.clone());
        }
    }

    if let Ok(team_item) = resolve_item(&almanac_root, Kind::Teams, team_id) {
        let run = apply_to_adapters(AdapterOp::Install, &team_item, &ctx, &detected);
        if run.failed > 0 && !failed.iter().any(|f| f == &team_item.id) {
            failed.push(team_item.id.clone());
        }
    }

    // Record the fire even on partial failure — the installs above no longer
    // short-circuit, so state stays consistent with what landed on disk.
    if !dry_run {
        let mut state = campfire::state::load(&project_dir);
        campfire::state::record_gather(&mut state, team_id, agent_ids, skill_count, failed);
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
        let Ok(item) = resolve_item(&almanac_root, Kind::Skills, sid) else {
            continue;
        };
        apply_to_adapters(AdapterOp::Install, &item, &ctx, &detected);
    }
    for aid in &desired.agents {
        let Ok(item) = resolve_item(&almanac_root, Kind::Agents, aid) else {
            continue;
        };
        apply_to_adapters(AdapterOp::Install, &item, &ctx, &detected);
    }
    for tid in &desired.teams {
        let Ok(item) = resolve_item(&almanac_root, Kind::Teams, tid) else {
            continue;
        };
        apply_to_adapters(AdapterOp::Install, &item, &ctx, &detected);
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
            match universal.uninstall(item, &ctx) {
                Ok(r) => report(universal.id(), r.action, &r.path, r.details),
                Err(e) => {
                    eprintln!(
                        "error uninstalling `{}` via {}: {e}",
                        item.id,
                        universal.id()
                    )
                }
            }
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
        apply_to_adapters(AdapterOp::Uninstall, &item, &ctx, &detected);
    }

    for aid in &to_remove_agents {
        let item = Item {
            kind: ContentType::Agent,
            id: aid.clone(),
            source_dir: PathBuf::new(),
            domain: None,
        };
        apply_to_adapters(AdapterOp::Uninstall, &item, &ctx, &detected);
    }

    // Team itself — always remove (Node behaviour).
    let team_item = Item {
        kind: ContentType::Team,
        id: team_id.to_string(),
        source_dir: PathBuf::new(),
        domain: None,
    };
    apply_to_adapters(AdapterOp::Uninstall, &team_item, &ctx, &detected);

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

#[cfg(test)]
mod tests {
    use super::validate_item_id;

    #[test]
    fn valid_kebab_ids_accepted() {
        for id in ["commit-changes", "create-r-package", "meditate", "a"] {
            assert!(validate_item_id(id).is_ok(), "`{id}` should be accepted");
        }
    }

    #[test]
    fn traversal_and_separators_rejected() {
        // Cross-platform-dangerous inputs: rejected on every OS. (A lone
        // backslash is a separator only on Windows, so it is intentionally
        // omitted here — on Unix it is a literal, traversal-safe filename char.)
        for bad in [
            "",
            ".",
            "..",
            "../foo",
            "../../etc/passwd",
            "foo/bar",
            "a/b/c",
            "/etc/passwd",
            "/abs",
            "a/",
        ] {
            assert!(
                validate_item_id(bad).is_err(),
                "`{bad}` should be rejected as a traversal/non-component id"
            );
        }
    }
}
