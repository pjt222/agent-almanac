//! The cover — the grimoire lying closed on a table by the fire.
//!
//! This is the first thing the reader sees: the reading light above, the
//! embossed cover below, the inscription of what is bound within, and the
//! prompt to open it. Any key opens the book (→ the [`super::spellbook`]
//! screen); `q` leaves the fire entirely.

use crossterm::event::{KeyCode, KeyModifiers};
use ratatui::layout::{Alignment, Constraint, Direction, Layout, Rect};
use ratatui::text::{Line, Span, Text};
use ratatui::widgets::Paragraph;
use ratatui::Frame;

use crate::app::{App, Screen};
use crate::pixels::flame;
use crate::theme;

/// Inner content width of the embossed cover plate (the part between the
/// `│ … │` rules). Every plate row is therefore `INNER + 6` columns wide, so
/// they stack cleanly under [`Alignment::Center`].
const PLATE_INNER: usize = 22;

/// Build the embossed cover plate as a stack of equal-width box-drawn rows.
/// Constructed at runtime rather than hand-laid so the widths can't drift, and
/// kept to ASCII + box-drawing glyphs so it survives narrow/ambiguous-width
/// terminals.
fn cover_plate() -> Vec<String> {
    let w = PLATE_INNER;
    let content: [String; 6] = [
        String::new(),
        format!("   {:<rest$}", "A G E N T", rest = w - 3),
        format!("   {:<rest$}", "A L M A N A C", rest = w - 3),
        String::new(),
        center("* a grimoire *", w),
        String::new(),
    ];
    let mut rows = Vec::with_capacity(content.len() + 4);
    rows.push(format!("╔{}╗", "═".repeat(w + 4)));
    rows.push(format!("║ ┌{}┐ ║", "─".repeat(w)));
    for line in &content {
        rows.push(format!("║ │{line:<w$}│ ║"));
    }
    rows.push(format!("║ └{}┘ ║", "─".repeat(w)));
    rows.push(format!("╚{}╝", "═".repeat(w + 4)));
    rows
}

/// Centre `s` in a field of `w` columns (truncating if it is longer).
fn center(s: &str, w: usize) -> String {
    let len = s.chars().count();
    if len >= w {
        return s.chars().take(w).collect();
    }
    let left = (w - len) / 2;
    format!("{}{s}{}", " ".repeat(left), " ".repeat(w - len - left))
}

pub fn draw(frame: &mut Frame<'_>, app: &App) {
    let area = frame.area();
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(1)])
        .split(area);

    draw_stack(frame, chunks[0], app);

    let footer = Paragraph::new(footer_text(app))
        .style(theme::dim_text())
        .alignment(Alignment::Center);
    frame.render_widget(footer, chunks[1]);
}

/// Centre the firelight, the cover plate, and the inscription as one vertical
/// stack inside `area`.
fn draw_stack(frame: &mut Frame<'_>, area: Rect, app: &App) {
    let flame_lines = flame::frame_lines(&app.fire);
    let flame_h = flame_lines.len() as u16;
    let plate_rows = cover_plate();
    let plate_h = plate_rows.len() as u16;
    // flame · gap · plate · gap · inscription(2)
    let stack_h = flame_h + 1 + plate_h + 1 + 2;
    let top_pad = area.height.saturating_sub(stack_h) / 2;

    let rows = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(top_pad),
            Constraint::Length(flame_h),
            Constraint::Length(1),
            Constraint::Length(plate_h),
            Constraint::Length(1),
            Constraint::Length(2),
            Constraint::Min(0),
        ])
        .split(area);

    frame.render_widget(
        Paragraph::new(flame_lines).alignment(Alignment::Center),
        rows[1],
    );

    let plate: Vec<Line> = plate_rows
        .into_iter()
        .map(|l| Line::from(Span::styled(l, theme::header())))
        .collect();
    frame.render_widget(Paragraph::new(plate).alignment(Alignment::Center), rows[3]);

    frame.render_widget(
        Paragraph::new(inscription(app)).alignment(Alignment::Center),
        rows[5],
    );
}

fn inscription(app: &App) -> Text<'static> {
    let r = &app.registries;
    Text::from(vec![
        Line::from(Span::styled(
            format!(
                "{} spells · {} companions · {} fellowships · {} tomes",
                r.skills.total(),
                r.agents.total(),
                r.teams.total(),
                r.guides.total(),
            ),
            theme::body(),
        )),
        Line::from(Span::styled("inscribed within", theme::dim_text())),
    ])
}

fn footer_text(app: &App) -> String {
    let breath = if app.fire.animate() {
        " · the fire breathes"
    } else {
        ""
    };
    format!("press any key to open the book   ·   [q] leave the fire{breath}")
}

pub fn handle_key(app: &mut App, code: KeyCode, _mods: KeyModifiers) {
    // Any key not caught by the global handler (q / Ctrl-C) opens the book.
    // 1-4 open straight to that volume. (The flare + redraw is handled by
    // `App::touched`.)
    if let KeyCode::Char(c @ '1'..='4') = code {
        let i = c as usize - '1' as usize;
        app.spellbook.volume = crate::screens::spellbook::Volume::from_index(i);
    }
    app.screen = Screen::Spellbook;
}
