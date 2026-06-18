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

    /// Let the reading fire breathe while idle (default: it only flares on input).
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
    /// Install a skill, agent, or team into the detected framework(s).
    Install {
        /// Content kind (`skills`, `agents`, or `teams`; guides are not installed).
        #[arg(value_enum)]
        kind: Kind,
        /// Content id — a skill, agent, or team name.
        id: String,
        /// Install into the global scope instead of the project directory.
        #[arg(long)]
        global: bool,
        /// Overwrite an existing install instead of skipping it.
        #[arg(long)]
        force: bool,
        /// Report what would change without touching the filesystem.
        #[arg(long)]
        dry_run: bool,
        /// Opt in to installing agents/teams as Pi extension scaffolds
        /// (the `pi` adapter; Pi has no native agent support).
        #[arg(long)]
        pi_extensions: bool,
    },
    /// Remove a previously installed skill or agent.
    Uninstall {
        /// Content kind (`skills` or `agents`).
        #[arg(value_enum)]
        kind: Kind,
        /// Content id to remove.
        id: String,
        /// Operate on the global `~/.claude` instead of `./.claude`.
        #[arg(long)]
        global: bool,
        /// Report what would change without touching the filesystem.
        #[arg(long)]
        dry_run: bool,
    },
    /// Audit installed content for broken or stale symlinks.
    Audit {
        /// Audit the global `~/.claude` instead of `./.claude`.
        #[arg(long)]
        global: bool,
    },
    /// Gather a team around the campfire — install members + their skills.
    Gather {
        /// Team id (a "campfire" name).
        name: String,
        /// Report what would change without touching the filesystem.
        #[arg(short = 'n', long)]
        dry_run: bool,
    },
    /// Tend your campfires — health check across gathered teams.
    Tend {
        /// Check fire health without warming (no state mutation).
        #[arg(short = 'n', long)]
        dry_run: bool,
    },
    /// Generate an `agent-almanac.yml` manifest in the current directory.
    Init,
    /// Reconcile installed state with `agent-almanac.yml`.
    Sync {
        /// Report what would change without touching the filesystem.
        #[arg(short = 'n', long)]
        dry_run: bool,
    },
    /// Search skills, agents, and teams by id/description/domain/tag.
    Search {
        /// Substring (case-insensitive).
        query: String,
    },
    /// Scatter a gathered team — uninstall members + skills not shared elsewhere.
    Scatter {
        /// Team id of the burning fire to scatter.
        name: String,
        /// Report what would change without touching the filesystem.
        #[arg(short = 'n', long)]
        dry_run: bool,
    },
    /// Generate a bundled system prompt from installed edge content.
    Bundle {
        /// Target adapter (only `ai-edge` is supported today).
        #[arg(short, long, default_value = "ai-edge")]
        framework: String,
        /// Token budget for the bundle.
        #[arg(long, default_value_t = 4000)]
        max_tokens: usize,
    },
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

impl Kind {
    /// The adapter-level content type this CLI kind maps to.
    pub fn content_type(self) -> crate::adapters::base::ContentType {
        use crate::adapters::base::ContentType;
        match self {
            Kind::Skills => ContentType::Skill,
            Kind::Agents => ContentType::Agent,
            Kind::Teams => ContentType::Team,
            Kind::Guides => ContentType::Guide,
        }
    }
}
