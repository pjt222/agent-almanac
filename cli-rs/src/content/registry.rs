use std::path::Path;

use serde::Deserialize;
use serde_yaml::{Mapping, Value};

use crate::error::{Error, Result};

const SKILLS_YAML: &str = include_str!("../../../skills/_registry.yml");
const AGENTS_YAML: &str = include_str!("../../../agents/_registry.yml");
const TEAMS_YAML: &str = include_str!("../../../teams/_registry.yml");
const GUIDES_YAML: &str = include_str!("../../../guides/_registry.yml");

// ── small YAML accessors ─────────────────────────────────────────────────────

/// Read a scalar string field from a mapping, or `""` if missing/non-string.
fn str_field(map: &Mapping, key: &str) -> String {
    map.get(key)
        .and_then(Value::as_str)
        .unwrap_or_default()
        .to_string()
}

/// Read a sequence-of-strings field from a mapping (e.g. `tags`, `members`).
fn str_seq_field(map: &Mapping, key: &str) -> Vec<String> {
    map.get(key)
        .and_then(Value::as_sequence)
        .map(|seq| {
            seq.iter()
                .filter_map(|v| v.as_str().map(str::to_string))
                .collect()
        })
        .unwrap_or_default()
}

// ── skills ───────────────────────────────────────────────────────────────────

#[derive(Debug, Default, Clone, Deserialize)]
pub struct SkillsRegistry {
    #[serde(default)]
    pub total_skills: usize,
    #[serde(default)]
    pub domains: Mapping,
}

impl SkillsRegistry {
    pub fn total(&self) -> usize {
        self.total_skills
    }

    /// All skills across all domains, sorted by id. `path` is relative to the
    /// `skills/` directory (e.g. `create-r-package/SKILL.md`).
    pub fn flat(&self) -> Vec<SkillSummary> {
        let mut out = Vec::new();
        for (domain_key, domain_val) in &self.domains {
            let Some(domain) = domain_key.as_str() else {
                continue;
            };
            let Some(skills) = domain_val.get("skills").and_then(Value::as_sequence) else {
                continue;
            };
            for entry in skills {
                let Some(map) = entry.as_mapping() else {
                    continue;
                };
                let id = str_field(map, "id");
                if id.is_empty() {
                    continue;
                }
                out.push(SkillSummary {
                    id,
                    description: str_field(map, "description"),
                    path: str_field(map, "path"),
                    domain: domain.to_string(),
                });
            }
        }
        out.sort_by(|a, b| a.id.cmp(&b.id));
        out
    }
}

#[derive(Debug, Clone)]
pub struct SkillSummary {
    pub id: String,
    pub description: String,
    /// Relative to the `skills/` directory.
    pub path: String,
    pub domain: String,
}

// ── agents ───────────────────────────────────────────────────────────────────

#[derive(Debug, Default, Clone, Deserialize)]
pub struct AgentsRegistry {
    #[serde(default)]
    pub total_agents: usize,
    /// Skills every agent inherits implicitly (the registry's `default_skills`).
    #[serde(default)]
    pub default_skills: Vec<Mapping>,
    #[serde(default)]
    pub agents: Vec<Mapping>,
}

impl AgentsRegistry {
    pub fn total(&self) -> usize {
        self.total_agents
    }

    /// Names of the skills every agent inherits (e.g. `meditate`, `heal`).
    pub fn default_skill_names(&self) -> Vec<String> {
        self.default_skills
            .iter()
            .map(|m| str_field(m, "skill"))
            .filter(|s| !s.is_empty())
            .collect()
    }

    /// All agents, sorted by id. `path` is relative to the almanac root
    /// (e.g. `agents/r-developer.md`).
    pub fn flat(&self) -> Vec<AgentSummary> {
        let mut out: Vec<AgentSummary> = self
            .agents
            .iter()
            .filter_map(|map| {
                let id = str_field(map, "id");
                if id.is_empty() {
                    return None;
                }
                Some(AgentSummary {
                    id,
                    description: str_field(map, "description"),
                    priority: str_field(map, "priority"),
                    tags: str_seq_field(map, "tags"),
                    core_skills: str_seq_field(map, "skills"),
                    path: str_field(map, "path"),
                })
            })
            .collect();
        out.sort_by(|a, b| a.id.cmp(&b.id));
        out
    }
}

#[derive(Debug, Clone)]
pub struct AgentSummary {
    pub id: String,
    pub description: String,
    pub priority: String,
    pub tags: Vec<String>,
    /// The agent's frontmatter `skills:` list — its ≤5 "prepared spells".
    pub core_skills: Vec<String>,
    /// Relative to the almanac root.
    pub path: String,
}

// ── teams ────────────────────────────────────────────────────────────────────

#[derive(Debug, Default, Clone, Deserialize)]
pub struct TeamsRegistry {
    #[serde(default)]
    pub total_teams: usize,
    #[serde(default)]
    pub teams: Vec<Mapping>,
}

impl TeamsRegistry {
    pub fn total(&self) -> usize {
        self.total_teams
    }

    /// All teams, sorted by id. `path` is relative to the almanac root.
    pub fn flat(&self) -> Vec<TeamSummary> {
        let mut out: Vec<TeamSummary> = self
            .teams
            .iter()
            .filter_map(|map| {
                let id = str_field(map, "id");
                if id.is_empty() {
                    return None;
                }
                Some(TeamSummary {
                    id,
                    description: str_field(map, "description"),
                    lead: str_field(map, "lead"),
                    members: str_seq_field(map, "members"),
                    coordination: str_field(map, "coordination"),
                    tags: str_seq_field(map, "tags"),
                    path: str_field(map, "path"),
                })
            })
            .collect();
        out.sort_by(|a, b| a.id.cmp(&b.id));
        out
    }
}

#[derive(Debug, Clone)]
pub struct TeamSummary {
    pub id: String,
    pub description: String,
    pub lead: String,
    pub members: Vec<String>,
    /// The coordination pattern (`hub-and-spoke`, `wave-parallel`, …).
    pub coordination: String,
    pub tags: Vec<String>,
    /// Relative to the almanac root.
    pub path: String,
}

// ── guides ───────────────────────────────────────────────────────────────────

#[derive(Debug, Default, Clone, Deserialize)]
pub struct GuidesRegistry {
    #[serde(default)]
    pub total_guides: usize,
    #[serde(default)]
    pub categories: Mapping,
    #[serde(default)]
    pub guides: Vec<Mapping>,
}

impl GuidesRegistry {
    pub fn total(&self) -> usize {
        self.total_guides
    }

    /// All guides in registry order (which groups them by category).
    /// `path` is relative to the almanac root.
    pub fn flat(&self) -> Vec<GuideSummary> {
        self.guides
            .iter()
            .filter_map(|map| {
                let id = str_field(map, "id");
                if id.is_empty() {
                    return None;
                }
                let title = {
                    let t = str_field(map, "title");
                    if t.is_empty() {
                        id.clone()
                    } else {
                        t
                    }
                };
                Some(GuideSummary {
                    id,
                    title,
                    description: str_field(map, "description"),
                    category: str_field(map, "category"),
                    agents: str_seq_field(map, "agents"),
                    teams: str_seq_field(map, "teams"),
                    skills: str_seq_field(map, "skills"),
                    path: str_field(map, "path"),
                })
            })
            .collect()
    }
}

#[derive(Debug, Clone)]
pub struct GuideSummary {
    pub id: String,
    pub title: String,
    pub description: String,
    pub category: String,
    pub agents: Vec<String>,
    pub teams: Vec<String>,
    pub skills: Vec<String>,
    /// Relative to the almanac root.
    pub path: String,
}

// ── bundle + loading ─────────────────────────────────────────────────────────

#[derive(Debug, Default, Clone)]
pub struct Registries {
    pub skills: SkillsRegistry,
    pub agents: AgentsRegistry,
    pub teams: TeamsRegistry,
    pub guides: GuidesRegistry,
}

pub fn load(root: Option<&Path>) -> Result<Registries> {
    if let Some(root) = root {
        load_from_disk(root)
    } else {
        load_from_embedded()
    }
}

fn load_from_embedded() -> Result<Registries> {
    Ok(Registries {
        skills: serde_yaml::from_str(SKILLS_YAML)?,
        agents: serde_yaml::from_str(AGENTS_YAML)?,
        teams: serde_yaml::from_str(TEAMS_YAML)?,
        guides: serde_yaml::from_str(GUIDES_YAML)?,
    })
}

fn load_from_disk(root: &Path) -> Result<Registries> {
    let skills = read_yaml::<SkillsRegistry>(&root.join("skills/_registry.yml"))?;
    let agents = read_yaml::<AgentsRegistry>(&root.join("agents/_registry.yml"))?;
    let teams = read_yaml::<TeamsRegistry>(&root.join("teams/_registry.yml"))?;
    let guides = read_yaml::<GuidesRegistry>(&root.join("guides/_registry.yml"))?;
    Ok(Registries {
        skills,
        agents,
        teams,
        guides,
    })
}

fn read_yaml<T: for<'de> Deserialize<'de>>(path: &Path) -> Result<T> {
    if !path.exists() {
        return Err(Error::RegistryNotFound(path.display().to_string()));
    }
    let raw = std::fs::read_to_string(path)?;
    Ok(serde_yaml::from_str(&raw)?)
}
