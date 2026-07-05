use agent_almanac_rs::{cli, run};

fn main() -> anyhow::Result<()> {
    let args = <cli::Args as clap::Parser>::parse();
    Ok(run(args)?)
}
