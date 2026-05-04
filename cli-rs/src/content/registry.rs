use std::path::Path;

use serde::Deserialize;

use crate::error::{Error, Result};

const SKILLS_YAML: &str = include_str!("../../../skills/_registry.yml");
const AGENTS_YAML: &str = include_str!("../../../agents/_registry.yml");
const TEAMS_YAML: &str = include_str!("../../../teams/_registry.yml");
const GUIDES_YAML: &str = include_str!("../../../guides/_registry.yml");

#[derive(Debug, Default, Clone, Deserialize)]
pub struct SkillsRegistry {
    #[serde(default)]
    pub total_skills: usize,
    #[serde(default)]
    pub domains: serde_yaml::Mapping,
}

impl SkillsRegistry {
    pub fn total(&self) -> usize {
        self.total_skills
    }

    pub fn flat(&self) -> Vec<SkillSummary> {
        let mut out = Vec::new();
        for (domain_key, domain_val) in &self.domains {
            let Some(domain) = domain_key.as_str() else {
                continue;
            };
            let Some(skills) = domain_val.get("skills").and_then(|s| s.as_sequence()) else {
                continue;
            };
            for entry in skills {
                let id = entry
                    .get("id")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                let description = entry
                    .get("description")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                let path = entry
                    .get("path")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                if id.is_empty() {
                    continue;
                }
                out.push(SkillSummary {
                    id,
                    description,
                    path,
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
    pub path: String,
    pub domain: String,
}

#[derive(Debug, Default, Clone, Deserialize)]
pub struct AgentsRegistry {
    #[serde(default)]
    pub total_agents: usize,
    #[serde(default)]
    pub agents: Vec<serde_yaml::Mapping>,
}

impl AgentsRegistry {
    pub fn total(&self) -> usize {
        self.total_agents
    }
}

#[derive(Debug, Default, Clone, Deserialize)]
pub struct TeamsRegistry {
    #[serde(default)]
    pub total_teams: usize,
    #[serde(default)]
    pub teams: Vec<serde_yaml::Mapping>,
}

impl TeamsRegistry {
    pub fn total(&self) -> usize {
        self.total_teams
    }
}

#[derive(Debug, Default, Clone, Deserialize)]
pub struct GuidesRegistry {
    #[serde(default)]
    pub total_guides: usize,
    #[serde(default)]
    pub categories: serde_yaml::Mapping,
    #[serde(default)]
    pub guides: Vec<serde_yaml::Mapping>,
}

impl GuidesRegistry {
    pub fn total(&self) -> usize {
        self.total_guides
    }
}

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
