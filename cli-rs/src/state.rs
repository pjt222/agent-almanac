//! Persisted reader state — currently just bookmarks (ribbons).
//!
//! Stored as JSON under the XDG data dir (`dirs::data_dir()`, which maps to
//! `%APPDATA%` on Windows). The legacy Node CLI used `~/.agent-almanac/`; a
//! prompted migration from there is planned (it is deliberately *not*
//! automatic — see the v2.0 port notes).

use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::error::Result;

const STATE_FILE: &str = "state.json";

/// Bumped whenever the on-disk shape changes in a way older readers should not
/// trust. v1 reinterpreted `bookmarks` as `"<volume>/<id>"` keys; a file with a
/// lower version has its bookmarks dropped on load.
pub const SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct PersistentState {
    /// Bookmarked entries, as `"<volume>/<id>"` keys (e.g. `"spells/meditate"`).
    #[serde(default)]
    pub bookmarks: Vec<String>,
    #[serde(default)]
    pub recent: Vec<String>,
    #[serde(default)]
    pub last_screen: Option<String>,
    #[serde(default)]
    pub schema_version: u32,
}

pub fn state_dir() -> Option<PathBuf> {
    dirs::data_dir().map(|d| d.join("agent-almanac"))
}

/// The Node CLI's state directory, kept for the (future, prompted) migration.
pub fn legacy_node_dir() -> Option<PathBuf> {
    dirs::home_dir().map(|h| h.join(".agent-almanac"))
}

/// Load persisted state, falling back to defaults on any problem (missing file,
/// unreadable, malformed JSON, or an older schema). Never fails — a broken
/// state file must not brick the TUI.
pub fn load() -> PersistentState {
    let Some(path) = state_dir().map(|d| d.join(STATE_FILE)) else {
        return PersistentState::default();
    };
    let Ok(raw) = fs::read_to_string(&path) else {
        return PersistentState::default();
    };
    let mut parsed: PersistentState = serde_json::from_str(&raw).unwrap_or_default();
    if parsed.schema_version < SCHEMA_VERSION {
        parsed.bookmarks.clear();
        parsed.schema_version = SCHEMA_VERSION;
    }
    parsed
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
