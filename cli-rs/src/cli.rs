use std::path::PathBuf;

use clap::{Parser, Subcommand, ValueEnum};

#[derive(Debug, Parser)]
#[command(
    name = "agent-almanac-rs",
    version,
    about = "Interactive almanac of agentic skills, agents, teams, and guides",
    long_about = None,
)]
pub struct Args {
    /// Override the almanac content root (defaults to embedded registries; required for spellbook content during alpha).
    #[arg(long, global = true, env = "AGENT_ALMANAC_ROOT")]
    pub root: Option<PathBuf>,

    /// Enable idle animation on the campfire screen (default: input-driven only).
    #[arg(long, global = true, env = "AGENT_ALMANAC_ANIMATE")]
    pub animate: bool,

    #[command(subcommand)]
    pub command: Option<Command>,
}

#[derive(Debug, Subcommand)]
pub enum Command {
    /// Launch the interactive TUI (default when no subcommand is given).
    Tui,
    /// List counts for a content kind.
    List {
        #[arg(value_enum)]
        kind: Kind,
    },
    /// Detect installed frameworks in the current directory.
    Detect,
    /// Print version and exit.
    Version,
}

#[derive(Debug, Clone, Copy, ValueEnum)]
pub enum Kind {
    Skills,
    Agents,
    Teams,
    Guides,
}
