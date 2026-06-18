//! `agent-almanac.yml` manifest — declarative install spec.
//!
//! Ported from Node `cli/lib/manifest.js`. A manifest lists which skills,
//! agents, and teams should be installed. Skill entries may be plain ids,
//! the wildcard `*` (= every skill), or a `{ domain: <name> }` object.
//!
//! `init` writes a manifest; `sync` reads + reconciles against installed
//! state.

use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};

use crate::content::registry::Registries;
use crate::error::Result;

const MANIFEST_FILE: &str = "agent-almanac.yml";

/// One manifest entry — either a string id / `*` wildcard or a domain-filter
/// object. Serde untagged so the YAML stays terse.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(untagged)]
pub enum Entry {
    /// Plain id or the `*` wildcard. The `#`-prefixed placeholder strings
    /// emitted by `init` ("# Add skill names ...") also live here — they are
    /// valid YAML strings that simply never resolve to a registry item.
    Id(String),
    /// Domain expansion: `{ domain: foo, complexity: bar }`.
    Domain {
        domain: String,
        #[serde(default, skip_serializing_if = "Option::is_none")]
        complexity: Option<String>,
    },
}

/// Path-only source spec — matches Node's `{ path: <root> }`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Source {
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    /// Manifest schema version.
    pub version: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub source: Option<Source>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub frameworks: Option<Vec<String>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub skills: Option<Vec<Entry>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub agents: Option<Vec<Entry>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub teams: Option<Vec<Entry>>,
}

pub fn manifest_path(dir: &Path) -> PathBuf {
    dir.join(MANIFEST_FILE)
}

/// Load a manifest from `<dir>/agent-almanac.yml`. Returns `Ok(None)` when the
/// file is absent, `Err` on parse failure.
pub fn load(dir: &Path) -> Result<Option<Manifest>> {
    let path = manifest_path(dir);
    if !path.exists() {
        return Ok(None);
    }
    let raw = fs::read_to_string(&path)?;
    let manifest: Manifest = serde_yaml::from_str(&raw)?;
    Ok(Some(manifest))
}

/// Write a manifest to `<dir>/agent-almanac.yml` and return the absolute path.
pub fn save(dir: &Path, manifest: &Manifest) -> Result<PathBuf> {
    let path = manifest_path(dir);
    let raw = serde_yaml::to_string(manifest)?;
    fs::write(&path, raw)?;
    Ok(path)
}

/// Generate a fresh manifest scaffolded with detected frameworks and
/// placeholder comments under each list (matches Node `init`).
pub fn generate(almanac_root: &Path, frameworks: Vec<String>) -> Manifest {
    Manifest {
        version: "1.0".to_string(),
        source: Some(Source {
            path: almanac_root.display().to_string(),
        }),
        frameworks: if frameworks.is_empty() {
            None
        } else {
            Some(frameworks)
        },
        skills: Some(vec![Entry::Id(
            "# Add skill names or domain references here".to_string(),
        )]),
        agents: Some(vec![Entry::Id("# Add agent names here".to_string())]),
        teams: Some(vec![Entry::Id("# Add team names here".to_string())]),
    }
}

/// Resolved manifest — concrete ids ready for install / uninstall.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct Resolved {
    pub skills: Vec<String>,
    pub agents: Vec<String>,
    pub teams: Vec<String>,
}

/// Expand wildcards + domain references against the registries. Placeholder
/// entries beginning with `#` are silently skipped (init's scaffold lines).
/// Unknown ids are dropped — `sync` reports them via the install machinery.
pub fn resolve(manifest: &Manifest, registries: &Registries) -> Resolved {
    let mut skills: Vec<String> = Vec::new();
    let mut agents: Vec<String> = Vec::new();
    let mut teams: Vec<String> = Vec::new();

    let all_skills: Vec<_> = registries.skills.flat();
    let all_agents: Vec<_> = registries.agents.flat();
    let all_teams: Vec<_> = registries.teams.flat();

    for entry in manifest.skills.iter().flatten() {
        match entry {
            Entry::Id(s) if s.starts_with('#') => continue,
            Entry::Id(s) if s == "*" => {
                for skill in &all_skills {
                    skills.push(skill.id.clone());
                }
            }
            Entry::Id(s) => {
                if all_skills.iter().any(|sk| sk.id == *s) {
                    skills.push(s.clone());
                }
            }
            Entry::Domain { domain, .. } => {
                for skill in &all_skills {
                    if &skill.domain == domain {
                        skills.push(skill.id.clone());
                    }
                }
            }
        }
    }

    for entry in manifest.agents.iter().flatten() {
        match entry {
            Entry::Id(s) if s.starts_with('#') => continue,
            Entry::Id(s) if s == "*" => {
                for a in &all_agents {
                    agents.push(a.id.clone());
                }
            }
            Entry::Id(s) => {
                if all_agents.iter().any(|a| a.id == *s) {
                    agents.push(s.clone());
                }
            }
            // Agents have no domain expansion.
            Entry::Domain { .. } => {}
        }
    }

    for entry in manifest.teams.iter().flatten() {
        match entry {
            Entry::Id(s) if s.starts_with('#') => continue,
            Entry::Id(s) if s == "*" => {
                for t in &all_teams {
                    teams.push(t.id.clone());
                }
            }
            Entry::Id(s) => {
                if all_teams.iter().any(|t| t.id == *s) {
                    teams.push(s.clone());
                }
            }
            Entry::Domain { .. } => {}
        }
    }

    // Stable dedup preserving first occurrence.
    skills.sort();
    skills.dedup();
    agents.sort();
    agents.dedup();
    teams.sort();
    teams.dedup();

    Resolved {
        skills,
        agents,
        teams,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn round_trip_minimal() {
        let dir = tempdir().unwrap();
        let m = Manifest {
            version: "1.0".to_string(),
            source: None,
            frameworks: None,
            skills: Some(vec![Entry::Id("commit-changes".to_string())]),
            agents: None,
            teams: None,
        };
        save(dir.path(), &m).unwrap();
        let loaded = load(dir.path()).unwrap().expect("manifest exists");
        assert_eq!(
            loaded.skills.unwrap(),
            vec![Entry::Id("commit-changes".to_string())]
        );
    }

    #[test]
    fn load_missing_returns_none() {
        let dir = tempdir().unwrap();
        assert!(load(dir.path()).unwrap().is_none());
    }

    #[test]
    fn placeholder_strings_are_skipped_on_resolve() {
        let m = Manifest {
            version: "1.0".to_string(),
            source: None,
            frameworks: None,
            skills: Some(vec![Entry::Id("# placeholder".to_string())]),
            agents: Some(vec![Entry::Id("# placeholder".to_string())]),
            teams: Some(vec![Entry::Id("# placeholder".to_string())]),
        };
        let regs = crate::content::registry::load(None).unwrap();
        let r = resolve(&m, &regs);
        assert!(r.skills.is_empty());
        assert!(r.agents.is_empty());
        assert!(r.teams.is_empty());
    }

    #[test]
    fn domain_entry_expands_to_skill_ids() {
        let m = Manifest {
            version: "1.0".to_string(),
            source: None,
            frameworks: None,
            skills: Some(vec![Entry::Domain {
                domain: "git".to_string(),
                complexity: None,
            }]),
            agents: None,
            teams: None,
        };
        let regs = crate::content::registry::load(None).unwrap();
        let r = resolve(&m, &regs);
        assert!(!r.skills.is_empty(), "git domain should expand to skills");
    }

    #[test]
    fn wildcard_expands_to_all() {
        let m = Manifest {
            version: "1.0".to_string(),
            source: None,
            frameworks: None,
            skills: Some(vec![Entry::Id("*".to_string())]),
            agents: None,
            teams: None,
        };
        let regs = crate::content::registry::load(None).unwrap();
        let r = resolve(&m, &regs);
        let total = regs.skills.total();
        assert_eq!(r.skills.len(), total);
    }

    #[test]
    fn unknown_id_is_dropped() {
        let m = Manifest {
            version: "1.0".to_string(),
            source: None,
            frameworks: None,
            skills: Some(vec![Entry::Id("nope-no-such-skill-zzz".to_string())]),
            agents: None,
            teams: None,
        };
        let regs = crate::content::registry::load(None).unwrap();
        let r = resolve(&m, &regs);
        assert!(r.skills.is_empty());
    }
}
