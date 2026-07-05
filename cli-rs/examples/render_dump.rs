//! Dump the rendered output of `content::markdown::render` for one file.
//!
//! Prints each ratatui `Line`'s concatenated span text, one per output line,
//! so the real renderer output can be inspected for mangling.
//!
//! Usage: cargo run --example render_dump -- <path/to/file.md>

use std::fs;

use agent_almanac_rs::content::markdown;

fn main() {
    let path = std::env::args()
        .nth(1)
        .expect("usage: render_dump <file.md>");
    let source = fs::read_to_string(&path).expect("failed to read input file");
    for line in markdown::render(&source) {
        let text: String = line
            .spans
            .iter()
            .map(|span| span.content.as_ref())
            .collect();
        println!("{text}");
    }
}
