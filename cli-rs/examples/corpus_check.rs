//! Corpus regression sweep for the markdown renderer (#272 AC#4).
//!
//! Walks the almanac content trees, and for every `*.md`:
//!   1. counts source-level table candidates (pipe row followed by a GFM
//!      delimiter row, outside fenced code) and compares against the number
//!      of `Tag::Table` events pulldown-cmark emits — a shortfall means a
//!      table the author intended is NOT being recognized (renders as prose);
//!   2. counts source-level fence openers (and how many carry a language
//!      tag) and compares against `CodeBlockKind::Fenced` events;
//!   3. runs `content::markdown::render()` under catch_unwind to surface
//!      panics.
//!
//! Usage: cargo run --example corpus_check [repo_root]

use std::fs;
use std::panic::catch_unwind;
use std::path::{Path, PathBuf};

use pulldown_cmark::{CodeBlockKind, Event, Options, Parser, Tag};

use agent_almanac_rs::content::markdown;

#[derive(Default)]
struct Totals {
    files: usize,
    tables_src: usize,
    tables_parsed: usize,
    near_miss_tables: usize,
    fences_src: usize,
    fences_parsed: usize,
    fences_tagged_src: usize,
    fences_tagged_parsed: usize,
    table_mismatch_files: Vec<(PathBuf, usize, usize)>,
    near_miss_files: Vec<(PathBuf, usize)>,
    table_overcount_files: Vec<(PathBuf, usize, usize)>,
    fence_mismatch_files: Vec<(PathBuf, usize, usize)>,
    panic_files: Vec<PathBuf>,
}

/// True if `line` is a GFM table delimiter row: cells of `:?-+:?` split by
/// pipes, at least one dash, nothing else but whitespace.
fn is_delimiter_row(line: &str) -> bool {
    let t = line.trim();
    if !t.contains('-') || !(t.starts_with('|') || t.contains('|')) {
        return false;
    }
    let inner = t.strip_prefix('|').unwrap_or(t);
    let inner = inner.strip_suffix('|').unwrap_or(inner);
    if inner.is_empty() {
        return false;
    }
    inner.split('|').all(|cell| {
        let c = cell.trim();
        !c.is_empty()
            && c.chars().all(|ch| ch == '-' || ch == ':')
            && c.contains('-')
            && c.matches(':').count() <= 2
    })
}

/// Count cells in a pipe row the way GFM does (leading/trailing pipe trimmed).
fn cell_count(line: &str) -> usize {
    let t = line.trim();
    let inner = t.strip_prefix('|').unwrap_or(t);
    let inner = inner.strip_suffix('|').unwrap_or(inner);
    // Note: ignores escaped pipes; fine for a heuristic sweep.
    inner.split('|').count()
}

/// Source-level scan:
/// (table candidates, near-miss tables, fence openers, tagged fence openers).
///
/// A near-miss is a pipe row followed by a delimiter row with a DIFFERENT
/// cell count — GFM rejects it, so it never shows up in the parsed counts;
/// it is exactly the failure mode a broken separator normalizer would
/// produce, and must be flagged explicitly.
fn scan_source(text: &str) -> (usize, usize, usize, usize) {
    let lines: Vec<&str> = text.lines().collect();
    let mut tables = 0;
    let mut near_miss = 0;
    let mut fences = 0;
    let mut tagged = 0;
    let mut fence_close: Option<(char, usize)> = None;
    let mut prev_was_table_body = false;

    let mut i = 0;
    while i < lines.len() {
        let line = lines[i];
        let trimmed = line.trim_start();

        if let Some((ch, len)) = fence_close {
            // Inside a fence: only a matching closing fence ends it.
            let run = trimmed.chars().take_while(|&c| c == ch).count();
            if run >= len && trimmed[run..].trim().is_empty() {
                fence_close = None;
            }
            i += 1;
            prev_was_table_body = false;
            continue;
        }

        // Fence opener? (``` or ~~~, info string allowed for backticks only
        // if it contains no backtick — CommonMark; keep it simple here.)
        let bt = trimmed.chars().take_while(|&c| c == '`').count();
        let tl = trimmed.chars().take_while(|&c| c == '~').count();
        if bt >= 3 || tl >= 3 {
            let (ch, len) = if bt >= 3 { ('`', bt) } else { ('~', tl) };
            let info = trimmed[len..].trim();
            if ch == '~' || !info.contains('`') {
                fences += 1;
                if !info.is_empty() {
                    tagged += 1;
                }
                fence_close = Some((ch, len));
                i += 1;
                prev_was_table_body = false;
                continue;
            }
        }

        // Table candidate: pipe-ish row + delimiter row. Lines indented 4+
        // spaces are indented code blocks in CommonMark, never tables.
        // Skip rows that are continuations of a table already counted.
        let indent = line.len() - trimmed.len();
        if !prev_was_table_body
            && indent < 4
            && trimmed.starts_with('|')
            && i + 1 < lines.len()
            && is_delimiter_row(lines[i + 1])
        {
            if cell_count(line) == cell_count(lines[i + 1]) {
                tables += 1;
            } else {
                near_miss += 1;
            }
            prev_was_table_body = true;
            i += 2;
            continue;
        }
        prev_was_table_body = trimmed.starts_with('|') && prev_was_table_body;
        i += 1;
    }
    (tables, near_miss, fences, tagged)
}

/// Parser-level counts: (tables, fenced blocks, fenced blocks with a tag).
fn scan_parsed(text: &str) -> (usize, usize, usize) {
    let options = Options::ENABLE_TABLES | Options::ENABLE_STRIKETHROUGH;
    let mut tables = 0;
    let mut fences = 0;
    let mut tagged = 0;
    for event in Parser::new_ext(text, options) {
        match event {
            Event::Start(Tag::Table(_)) => tables += 1,
            Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) => {
                fences += 1;
                if !lang.is_empty() {
                    tagged += 1;
                }
            }
            _ => {}
        }
    }
    (tables, fences, tagged)
}

fn walk(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if name.starts_with('.') || name == "node_modules" || name == "target" || name == "cli-rs" {
            continue;
        }
        if path.is_dir() {
            walk(&path, out);
        } else if path.extension().is_some_and(|e| e == "md") {
            out.push(path);
        }
    }
}

fn main() {
    let root = std::env::args()
        .nth(1)
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from(".."));
    let trees = ["skills", "agents", "teams", "guides", "i18n"];

    let mut files = Vec::new();
    for tree in trees {
        walk(&root.join(tree), &mut files);
    }
    files.sort();

    let mut t = Totals::default();
    for path in files {
        let Ok(text) = fs::read_to_string(&path) else {
            continue;
        };
        t.files += 1;

        let (ts, nm, fs_, tg) = scan_source(&text);
        let (tp, fp, tgp) = scan_parsed(&text);
        t.tables_src += ts;
        t.tables_parsed += tp;
        t.near_miss_tables += nm;
        t.fences_src += fs_;
        t.fences_parsed += fp;
        t.fences_tagged_src += tg;
        t.fences_tagged_parsed += tgp;

        if tp < ts {
            t.table_mismatch_files.push((path.clone(), ts, tp));
        }
        if nm > 0 {
            t.near_miss_files.push((path.clone(), nm));
        }
        if tp > ts {
            // Parsed more tables than the scanner saw (blockquoted or
            // pipe-less headers): informational, but reported so a real
            // failure can't be offset by a scanner-invisible table.
            t.table_overcount_files.push((path.clone(), ts, tp));
        }
        if fp != fs_ {
            t.fence_mismatch_files.push((path.clone(), fs_, fp));
        }

        let body = text.clone();
        if catch_unwind(move || {
            let lines = markdown::render(&body);
            lines.len()
        })
        .is_err()
        {
            t.panic_files.push(path);
        }
    }

    println!("files scanned:        {}", t.files);
    println!(
        "tables   src/parsed:  {} / {}",
        t.tables_src, t.tables_parsed
    );
    println!("table near-misses:    {}", t.near_miss_tables);
    println!(
        "fences   src/parsed:  {} / {}",
        t.fences_src, t.fences_parsed
    );
    println!(
        "tagged   src/parsed:  {} / {}",
        t.fences_tagged_src, t.fences_tagged_parsed
    );
    println!("render panics:        {}", t.panic_files.len());

    if !t.table_mismatch_files.is_empty() {
        println!("\nTABLE MISMATCHES (src candidates > parsed tables):");
        for (p, s, q) in &t.table_mismatch_files {
            println!("  {} ({} -> {})", p.display(), s, q);
        }
    }
    if !t.near_miss_files.is_empty() {
        println!("\nNEAR-MISS TABLES (delimiter cell count != header cell count):");
        for (p, n) in &t.near_miss_files {
            println!("  {} ({})", p.display(), n);
        }
    }
    if !t.table_overcount_files.is_empty() {
        println!("\nINFO: parsed > src table candidates (blockquoted/pipe-less headers):");
        for (p, s, q) in &t.table_overcount_files {
            println!("  {} ({} -> {})", p.display(), s, q);
        }
    }
    if !t.fence_mismatch_files.is_empty() {
        println!("\nFENCE MISMATCHES (src openers != parsed fenced blocks):");
        for (p, s, q) in &t.fence_mismatch_files {
            println!("  {} ({} -> {})", p.display(), s, q);
        }
    }
    if !t.panic_files.is_empty() {
        println!("\nRENDER PANICS:");
        for p in &t.panic_files {
            println!("  {}", p.display());
        }
    }

    let ok = t.table_mismatch_files.is_empty()
        && t.near_miss_files.is_empty()
        && t.panic_files.is_empty();
    std::process::exit(if ok { 0 } else { 1 });
}
