//! Per-project campfire state — see module doc-comment in `mod.rs`.

use std::collections::BTreeMap;
use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use time::format_description::well_known::Rfc3339;
use time::{Duration, OffsetDateTime};

use crate::error::Result;

const STATE_DIR: &str = ".agent-almanac";
const STATE_FILE: &str = "state.json";
const STATE_VERSION: u32 = 1;

/// Burning until 7 days have passed since `last_warmed`.
const BURNING_THRESHOLD: Duration = Duration::days(7);
/// Embers between 7 and 30 days; cold after that.
const EMBERS_THRESHOLD: Duration = Duration::days(30);

/// On-disk fire entry, keyed by team id in `CampfireState::fires`.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct Fire {
    /// ISO-8601 timestamp the team was first gathered.
    pub gathered: String,
    /// ISO-8601 timestamp of the most recent warming (gather/tend/regather).
    #[serde(rename = "lastWarmed")]
    pub last_warmed: String,
    /// Member agent ids that were brought to this fire.
    pub agents: Vec<String>,
    /// Total number of skills installed for this team.
    #[serde(rename = "skillCount")]
    pub skill_count: usize,
    /// Skills that failed to install on the last gather (ids).
    #[serde(default, rename = "failedSkills")]
    pub failed_skills: Vec<String>,
}

/// The whole on-disk campfire state file.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CampfireState {
    pub version: u32,
    #[serde(default)]
    pub welcomed: bool,
    /// Map of team id → fire entry. `BTreeMap` for stable serialisation order.
    #[serde(default)]
    pub fires: BTreeMap<String, Fire>,
    /// Reserved for future standalone-agent tracking (matches Node shape).
    #[serde(default)]
    pub wanderers: Vec<String>,
}

impl Default for CampfireState {
    fn default() -> Self {
        Self {
            version: STATE_VERSION,
            welcomed: false,
            fires: BTreeMap::new(),
            wanderers: Vec::new(),
        }
    }
}

/// Heat status derived from `last_warmed`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Heat {
    Burning,
    Embers,
    Cold,
}

impl Heat {
    pub fn as_str(self) -> &'static str {
        match self {
            Heat::Burning => "burning",
            Heat::Embers => "embers",
            Heat::Cold => "cold",
        }
    }
}

pub fn state_path(project_dir: &Path) -> PathBuf {
    project_dir.join(STATE_DIR).join(STATE_FILE)
}

/// Load the campfire state for a project. Returns `Default` on any failure —
/// a malformed state file must not block the CLI.
pub fn load(project_dir: &Path) -> CampfireState {
    let path = state_path(project_dir);
    let Ok(raw) = fs::read_to_string(&path) else {
        return CampfireState::default();
    };
    serde_json::from_str(&raw).unwrap_or_default()
}

/// Persist the state file. Creates the `.agent-almanac/` directory if needed.
pub fn save(project_dir: &Path, state: &CampfireState) -> Result<()> {
    let dir = project_dir.join(STATE_DIR);
    fs::create_dir_all(&dir)?;
    let mut raw = serde_json::to_string_pretty(state)?;
    raw.push('\n');
    fs::write(dir.join(STATE_FILE), raw)?;
    Ok(())
}

fn now_iso() -> String {
    OffsetDateTime::now_utc()
        .format(&Rfc3339)
        .expect("Rfc3339 formatting is infallible for UTC OffsetDateTime")
}

/// Update `state.fires[team_id]` with a fresh gather entry.
pub fn record_gather(
    state: &mut CampfireState,
    team_id: &str,
    agents: Vec<String>,
    skill_count: usize,
    failed_skills: Vec<String>,
) {
    let now = now_iso();
    state.fires.insert(
        team_id.to_string(),
        Fire {
            gathered: now.clone(),
            last_warmed: now,
            agents,
            skill_count,
            failed_skills,
        },
    );
}

/// Remove the named fire (no-op if it isn't burning).
pub fn record_scatter(state: &mut CampfireState, team_id: &str) {
    state.fires.remove(team_id);
}

/// Touch `last_warmed` to the current time. No-op if the fire isn't burning.
pub fn record_warm(state: &mut CampfireState, team_id: &str) {
    if let Some(fire) = state.fires.get_mut(team_id) {
        fire.last_warmed = now_iso();
    }
}

/// Compute the heat status for a fire given its `last_warmed` timestamp and a
/// reference instant (`now`).
pub fn compute_heat(last_warmed: &str, now: OffsetDateTime) -> Heat {
    let Ok(then) = OffsetDateTime::parse(last_warmed, &Rfc3339) else {
        // An unparsable timestamp is treated as cold — surfaces the corruption
        // in the CLI without crashing.
        return Heat::Cold;
    };
    let elapsed = now - then;
    if elapsed < BURNING_THRESHOLD {
        Heat::Burning
    } else if elapsed < EMBERS_THRESHOLD {
        Heat::Embers
    } else {
        Heat::Cold
    }
}

/// All fires with their computed heat status. Iteration order is the
/// underlying `BTreeMap` order (alphabetical by team id).
pub fn fire_status(state: &CampfireState) -> Vec<(String, &Fire, Heat)> {
    let now = OffsetDateTime::now_utc();
    state
        .fires
        .iter()
        .map(|(id, fire)| (id.clone(), fire, compute_heat(&fire.last_warmed, now)))
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    fn temp_state() -> (TempDir, PathBuf) {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().to_path_buf();
        (dir, path)
    }

    #[test]
    fn load_returns_default_on_missing_file() {
        let (_g, dir) = temp_state();
        let s = load(&dir);
        assert_eq!(s.version, STATE_VERSION);
        assert!(s.fires.is_empty());
    }

    #[test]
    fn save_then_load_round_trip() {
        let (_g, dir) = temp_state();
        let mut s = CampfireState::default();
        record_gather(
            &mut s,
            "tending",
            vec!["mystic".to_string(), "gardener".to_string()],
            12,
            vec![],
        );
        save(&dir, &s).unwrap();

        let s2 = load(&dir);
        assert_eq!(s2.fires.len(), 1);
        let fire = &s2.fires["tending"];
        assert_eq!(
            fire.agents,
            vec!["mystic".to_string(), "gardener".to_string()]
        );
        assert_eq!(fire.skill_count, 12);
    }

    #[test]
    fn record_scatter_removes_fire() {
        let mut s = CampfireState::default();
        record_gather(&mut s, "tending", vec![], 0, vec![]);
        assert!(s.fires.contains_key("tending"));
        record_scatter(&mut s, "tending");
        assert!(s.fires.is_empty());
    }

    #[test]
    fn record_warm_updates_last_warmed() {
        let mut s = CampfireState::default();
        record_gather(&mut s, "tending", vec![], 0, vec![]);
        let before = s.fires["tending"].last_warmed.clone();
        // Sleep would be flaky; we rely on monotonically-increasing wall clock
        // at sub-second resolution. If this fails on a host with broken clocks
        // the warm semantics are the least of our problems.
        std::thread::sleep(std::time::Duration::from_millis(15));
        record_warm(&mut s, "tending");
        let after = &s.fires["tending"].last_warmed;
        assert!(after > &before, "{before} should sort before {after}");
    }

    #[test]
    fn compute_heat_burning_at_one_day() {
        let now = OffsetDateTime::now_utc();
        let last = now - Duration::days(1);
        let s = last.format(&Rfc3339).unwrap();
        assert_eq!(compute_heat(&s, now), Heat::Burning);
    }

    #[test]
    fn compute_heat_embers_at_ten_days() {
        let now = OffsetDateTime::now_utc();
        let last = now - Duration::days(10);
        let s = last.format(&Rfc3339).unwrap();
        assert_eq!(compute_heat(&s, now), Heat::Embers);
    }

    #[test]
    fn compute_heat_cold_at_sixty_days() {
        let now = OffsetDateTime::now_utc();
        let last = now - Duration::days(60);
        let s = last.format(&Rfc3339).unwrap();
        assert_eq!(compute_heat(&s, now), Heat::Cold);
    }

    #[test]
    fn compute_heat_unparsable_is_cold() {
        let now = OffsetDateTime::now_utc();
        assert_eq!(compute_heat("not-a-date", now), Heat::Cold);
    }

    #[test]
    fn deserialises_node_shape() {
        let raw = r#"{
          "version": 1,
          "welcomed": true,
          "fires": {
            "tending": {
              "gathered": "2026-05-01T12:00:00Z",
              "lastWarmed": "2026-05-20T12:00:00Z",
              "agents": ["mystic"],
              "skillCount": 7,
              "failedSkills": []
            }
          },
          "wanderers": []
        }"#;
        let s: CampfireState = serde_json::from_str(raw).unwrap();
        assert!(s.welcomed);
        assert_eq!(s.fires["tending"].agents, vec!["mystic".to_string()]);
        assert_eq!(s.fires["tending"].skill_count, 7);
    }
}
