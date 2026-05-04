use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::error::Result;

const STATE_FILE: &str = "state.json";

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct PersistentState {
    pub bookmarks: Vec<String>,
    pub recent: Vec<String>,
    pub last_screen: Option<String>,
    #[serde(default)]
    pub schema_version: u32,
}

pub fn state_dir() -> Option<PathBuf> {
    dirs::data_dir().map(|d| d.join("agent-almanac"))
}

pub fn legacy_node_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(".agent-almanac"))
}

pub fn load() -> Result<PersistentState> {
    let Some(dir) = state_dir() else {
        return Ok(PersistentState::default());
    };
    let path = dir.join(STATE_FILE);
    if !path.exists() {
        return Ok(PersistentState::default());
    }
    let raw = fs::read_to_string(&path)?;
    let parsed: PersistentState = serde_json::from_str(&raw)?;
    Ok(parsed)
}

pub fn save(state: &PersistentState) -> Result<()> {
    let Some(dir) = state_dir() else {
        return Ok(());
    };
    fs::create_dir_all(&dir)?;
    let path = dir.join(STATE_FILE);
    let raw = serde_json::to_string_pretty(state)?;
    fs::write(&path, raw)?;
    Ok(())
}
