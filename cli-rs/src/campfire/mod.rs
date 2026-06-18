//! Campfire state — per-project tracking of "gathered" teams.
//!
//! Ported from Node `cli/lib/state.js`. State lives in
//! `.agent-almanac/state.json` inside the project directory (NOT the XDG data
//! dir; that one is used by the TUI for cross-project bookmarks). Each
//! `Fire` entry records when a team was gathered/last-warmed, which agents
//! were brought, how many skills landed, and any that failed to install.

pub mod state;
