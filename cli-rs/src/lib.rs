pub mod adapters;
pub mod app;
pub mod cli;
pub mod content;
pub mod error;
pub mod event;
pub mod pixels;
pub mod screens;
pub mod state;
pub mod theme;

use cli::{Args, Command};
use error::Result;

pub fn run(args: Args) -> Result<()> {
    match args.command {
        None => app::run_tui(args.root.as_deref()),
        Some(Command::List { kind }) => command_list(kind, args.root.as_deref()),
        Some(Command::Detect) => command_detect(args.root.as_deref()),
        Some(Command::Version) => {
            println!("{}", env!("CARGO_PKG_VERSION"));
            Ok(())
        }
        Some(Command::Tui) => app::run_tui(args.root.as_deref()),
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

fn command_detect(_root: Option<&std::path::Path>) -> Result<()> {
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
