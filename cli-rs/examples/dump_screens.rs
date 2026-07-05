//! Render the TUI screens to an in-memory backend and print them — a way to
//! eyeball layout without a real terminal. Run with e.g.:
//!
//! ```sh
//! cargo run --example dump_screens -- 110 32
//! cargo run --example dump_screens -- 110 32 --root ..
//! ```
//!
//! Optional `--root <path>` loads real bodies (and uses the on-disk
//! registries); `--skill <id>` also dumps that specific skill's page.
//! Width/height default to 100×30.

use ratatui::backend::TestBackend;
use ratatui::Terminal;

use agent_almanac_rs::app::{App, Screen};
use agent_almanac_rs::screens::{cover, spellbook};

fn main() {
    let mut args = std::env::args().skip(1);
    let mut width = 100u16;
    let mut height = 30u16;
    let mut root: Option<std::path::PathBuf> = None;
    let mut skill: Option<String> = None;
    let mut positional = Vec::new();
    while let Some(a) = args.next() {
        match a.as_str() {
            "--root" => root = args.next().map(Into::into),
            "--skill" => skill = args.next(),
            _ => positional.push(a),
        }
    }
    if let Some(w) = positional.first().and_then(|s| s.parse().ok()) {
        width = w;
    }
    if let Some(h) = positional.get(1).and_then(|s| s.parse().ok()) {
        height = h;
    }

    let mut app = App::new(root.as_deref(), false).expect("app");

    // Cover.
    app.screen = Screen::Cover;
    render(&mut app, width, height, "COVER");

    // Spellbook, each volume.
    app.screen = Screen::Spellbook;
    for i in 0..4 {
        let vol = spellbook::Volume::from_index(i);
        app.spellbook.volume = vol;
        render(
            &mut app,
            width,
            height,
            &format!("SPELLBOOK · {}", vol.label()),
        );
    }

    // A search + a couple of ribbons, on the Spells volume.
    use crossterm::event::{KeyCode, KeyModifiers};
    let key = |app: &mut App, code| {
        spellbook::handle_key(app, code, KeyModifiers::NONE);
    };
    app.spellbook.volume = spellbook::Volume::Spells;
    key(&mut app, KeyCode::Char('/'));
    for ch in "review".chars() {
        key(&mut app, KeyCode::Char(ch));
    }
    key(&mut app, KeyCode::Enter); // commit the filter, leave search mode
    key(&mut app, KeyCode::Char('m')); // ribbon the first match
    key(&mut app, KeyCode::Char('j'));
    key(&mut app, KeyCode::Char('j'));
    key(&mut app, KeyCode::Char('m')); // ribbon the third match
    render(
        &mut app,
        width,
        height,
        "SPELLBOOK · search 'review' + ribbons",
    );

    // A named skill's page (handy for eyeballing markdown: code blocks, tables).
    if let Some(id) = skill {
        let mut app2 = App::new(root.as_deref(), false).expect("app");
        app2.screen = Screen::Spellbook;
        app2.spellbook.volume = spellbook::Volume::Spells;
        let vi = &mut app2.spellbook.volumes[0];
        if let Some(row) = vi.filtered.iter().position(|&i| vi.items[i].id() == id) {
            vi.list_state.select(Some(row));
        }
        render(&mut app2, width, height, &format!("SKILL PAGE · {id}"));
    }
}

fn render(app: &mut App, width: u16, height: u16, label: &str) {
    let backend = TestBackend::new(width, height);
    let mut terminal = Terminal::new(backend).expect("terminal");
    terminal
        .draw(|frame| match app.screen {
            Screen::Cover => cover::draw(frame, app),
            Screen::Spellbook => spellbook::draw(frame, app),
        })
        .expect("draw");
    println!("\n========== {label} ({width}x{height}) ==========");
    println!("{}", terminal.backend());
}
