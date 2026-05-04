use crossterm::event::{KeyCode, KeyModifiers};
use ratatui::layout::{Alignment, Constraint, Direction, Layout};
use ratatui::widgets::{Block, BorderType, Borders, Paragraph};
use ratatui::Frame;

use crate::app::{App, Screen};
use crate::pixels::flame;
use crate::theme;

pub fn draw(frame: &mut Frame<'_>, app: &mut App) {
    let area = frame.area();
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(1)])
        .split(area);

    let block = Block::default()
        .title(" Campfire ")
        .title_alignment(Alignment::Center)
        .borders(Borders::ALL)
        .border_type(BorderType::Rounded)
        .border_style(theme::dim_text());

    let inner = block.inner(chunks[0]);
    frame.render_widget(block, chunks[0]);

    let lines = flame::frame_lines(app.campfire_tick);
    let flame_widget = Paragraph::new(lines).alignment(Alignment::Center);
    frame.render_widget(flame_widget, inner);

    let footer = Paragraph::new(format!(
        "{} skills · {} agents · {} teams · {} guides     [Tab] spellbook  [q] quit",
        app.registries.skills.total(),
        app.registries.agents.total(),
        app.registries.teams.total(),
        app.registries.guides.total()
    ))
    .style(theme::dim_text())
    .alignment(Alignment::Center);
    frame.render_widget(footer, chunks[1]);
}

pub fn handle_key(app: &mut App, code: KeyCode, _mods: KeyModifiers) {
    match code {
        KeyCode::Enter | KeyCode::Char(' ') => app.screen = Screen::Spellbook,
        KeyCode::Char('s') => app.screen = Screen::Spellbook,
        _ => app.campfire_tick = app.campfire_tick.wrapping_add(1),
    }
}
