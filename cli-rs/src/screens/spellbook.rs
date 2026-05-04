use crossterm::event::{KeyCode, KeyModifiers};
use ratatui::layout::{Alignment, Constraint, Direction, Layout};
use ratatui::widgets::{Block, BorderType, Borders, List, ListItem, ListState, Paragraph, Wrap};
use ratatui::Frame;

use crate::app::App;
use crate::content::registry::{Registries, SkillSummary};
use crate::theme;

pub struct State {
    pub items: Vec<SkillSummary>,
    pub list_state: ListState,
}

impl State {
    pub fn from_registries(registries: &Registries) -> Self {
        let items = registries.skills.flat();
        let mut list_state = ListState::default();
        if !items.is_empty() {
            list_state.select(Some(0));
        }
        Self { items, list_state }
    }

    pub fn selected(&self) -> Option<&SkillSummary> {
        self.list_state.selected().and_then(|i| self.items.get(i))
    }

    pub fn move_cursor(&mut self, delta: isize) {
        if self.items.is_empty() {
            return;
        }
        let len = self.items.len() as isize;
        let cur = self.list_state.selected().unwrap_or(0) as isize;
        let mut next = cur + delta;
        if next < 0 {
            next = 0;
        }
        if next >= len {
            next = len - 1;
        }
        self.list_state.select(Some(next as usize));
    }

    pub fn jump(&mut self, kind: Jump) {
        if self.items.is_empty() {
            return;
        }
        let target = match kind {
            Jump::Top => 0,
            Jump::Bottom => self.items.len() - 1,
        };
        self.list_state.select(Some(target));
    }
}

pub enum Jump {
    Top,
    Bottom,
}

pub fn draw(frame: &mut Frame<'_>, app: &mut App) {
    let area = frame.area();
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(1)])
        .split(area);

    let panes = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Length(36), Constraint::Min(40)])
        .split(chunks[0]);

    draw_index(frame, panes[0], app);
    draw_page(frame, panes[1], app);

    let footer = Paragraph::new(format!(
        " {}/{}     [j/k] move  [g/G] top/bottom  [Tab] campfire  [q] quit",
        app.spellbook
            .list_state
            .selected()
            .map(|i| i + 1)
            .unwrap_or(0),
        app.spellbook.items.len()
    ))
    .style(theme::dim_text());
    frame.render_widget(footer, chunks[1]);
}

fn draw_index(frame: &mut Frame<'_>, area: ratatui::layout::Rect, app: &mut App) {
    let block = Block::default()
        .title(" Index ")
        .borders(Borders::ALL)
        .border_type(BorderType::Rounded)
        .border_style(theme::dim_text());
    let items: Vec<ListItem> = app
        .spellbook
        .items
        .iter()
        .map(|s| ListItem::new(s.id.clone()))
        .collect();
    let list = List::new(items)
        .block(block)
        .style(theme::body())
        .highlight_style(theme::highlight())
        .highlight_symbol("▶ ");
    frame.render_stateful_widget(list, area, &mut app.spellbook.list_state);
}

fn draw_page(frame: &mut Frame<'_>, area: ratatui::layout::Rect, app: &App) {
    let title = app
        .spellbook
        .selected()
        .map(|s| format!(" {} ", s.id))
        .unwrap_or_else(|| " (empty) ".to_string());
    let block = Block::default()
        .title(title)
        .title_alignment(Alignment::Center)
        .borders(Borders::ALL)
        .border_type(BorderType::Double)
        .border_style(theme::header());

    let body = match app.spellbook.selected() {
        Some(s) => format!(
            "Domain: {}\nPath: skills/{}\n\n{}\n\n[alpha.1: full markdown render lands in next iteration]",
            s.domain, s.path, s.description
        ),
        None => "Empty spellbook.".to_string(),
    };

    let para = Paragraph::new(body)
        .block(block)
        .style(theme::body())
        .wrap(Wrap { trim: false });
    frame.render_widget(para, area);
}

pub fn handle_key(app: &mut App, code: KeyCode, _mods: KeyModifiers) {
    match code {
        KeyCode::Char('j') | KeyCode::Down => app.spellbook.move_cursor(1),
        KeyCode::Char('k') | KeyCode::Up => app.spellbook.move_cursor(-1),
        KeyCode::PageDown => app.spellbook.move_cursor(10),
        KeyCode::PageUp => app.spellbook.move_cursor(-10),
        KeyCode::Char('g') => app.spellbook.jump(Jump::Top),
        KeyCode::Char('G') => app.spellbook.jump(Jump::Bottom),
        KeyCode::Home => app.spellbook.jump(Jump::Top),
        KeyCode::End => app.spellbook.jump(Jump::Bottom),
        _ => {}
    }
}
