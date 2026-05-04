use std::path::Path;

use crossterm::event::{KeyCode, KeyModifiers};
use ratatui::layout::{Alignment, Constraint, Direction, Layout, Rect};
use ratatui::style::{Modifier, Style};
use ratatui::text::{Line, Span, Text};
use ratatui::widgets::{Block, BorderType, Borders, Clear, List, ListItem, ListState, Paragraph, Wrap};
use ratatui::Frame;

use crate::app::App;
use crate::content::body::BodyCache;
use crate::content::registry::{Registries, SkillSummary};
use crate::search::FuzzyIndex;
use crate::theme;

pub struct State {
    pub items: Vec<SkillSummary>,
    pub filtered: Vec<usize>,
    pub list_state: ListState,
    pub body_cache: BodyCache,
    pub fuzzy: FuzzyIndex,
    pub search_mode: bool,
    pub search_query: String,
    pub scroll: u16,
}

impl State {
    pub fn new(registries: &Registries, root: Option<&Path>) -> Self {
        let items = registries.skills.flat();
        let filtered: Vec<usize> = (0..items.len()).collect();
        let mut list_state = ListState::default();
        if !items.is_empty() {
            list_state.select(Some(0));
        }
        Self {
            items,
            filtered,
            list_state,
            body_cache: BodyCache::new(root),
            fuzzy: FuzzyIndex::default(),
            search_mode: false,
            search_query: String::new(),
            scroll: 0,
        }
    }

    pub fn selected(&self) -> Option<&SkillSummary> {
        let idx = self.list_state.selected()?;
        let real = self.filtered.get(idx).copied()?;
        self.items.get(real)
    }

    pub fn move_cursor(&mut self, delta: isize) {
        if self.filtered.is_empty() {
            return;
        }
        let len = self.filtered.len() as isize;
        let cur = self.list_state.selected().unwrap_or(0) as isize;
        let mut next = cur + delta;
        if next < 0 {
            next = 0;
        }
        if next >= len {
            next = len - 1;
        }
        self.list_state.select(Some(next as usize));
        self.scroll = 0;
    }

    pub fn jump(&mut self, kind: Jump) {
        if self.filtered.is_empty() {
            return;
        }
        let target = match kind {
            Jump::Top => 0,
            Jump::Bottom => self.filtered.len() - 1,
        };
        self.list_state.select(Some(target));
        self.scroll = 0;
    }

    pub fn scroll(&mut self, delta: i16) {
        if delta < 0 {
            self.scroll = self.scroll.saturating_sub((-delta) as u16);
        } else {
            self.scroll = self.scroll.saturating_add(delta as u16);
        }
    }

    pub fn enter_search(&mut self) {
        self.search_mode = true;
    }

    pub fn exit_search(&mut self, commit: bool) {
        self.search_mode = false;
        if !commit {
            self.search_query.clear();
            self.recompute_filter();
        }
    }

    pub fn append_query(&mut self, ch: char) {
        self.search_query.push(ch);
        self.recompute_filter();
    }

    pub fn pop_query(&mut self) {
        self.search_query.pop();
        self.recompute_filter();
    }

    fn recompute_filter(&mut self) {
        self.filtered = self
            .fuzzy
            .filter(&self.items, &self.search_query, |s| &s.id);
        if self.filtered.is_empty() {
            self.list_state.select(None);
        } else {
            self.list_state.select(Some(0));
        }
        self.scroll = 0;
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

    let footer = make_footer(app);
    frame.render_widget(footer, chunks[1]);

    if app.spellbook.search_mode {
        draw_search_overlay(frame, area, &app.spellbook);
    }
}

fn make_footer(app: &App) -> Paragraph<'static> {
    let total = app.spellbook.filtered.len();
    let cur = app
        .spellbook
        .list_state
        .selected()
        .map(|i| i + 1)
        .unwrap_or(0);
    let mode = if app.spellbook.search_mode {
        "[search]"
    } else if !app.spellbook.search_query.is_empty() {
        "[filtered]"
    } else {
        "[browse]"
    };
    let body_status = if app.spellbook.body_cache.root().is_some() {
        "rooted"
    } else {
        "summary"
    };
    Paragraph::new(format!(
        " {mode} {cur}/{total} · body:{body_status}     [j/k] move  [/] search  [J/K] page-scroll  [g/G] top/bottom  [Tab] campfire  [q] quit"
    ))
    .style(theme::dim_text())
}

fn draw_index(frame: &mut Frame<'_>, area: Rect, app: &mut App) {
    let title = if app.spellbook.search_query.is_empty() {
        " Index ".to_string()
    } else {
        format!(" Index · /{} ", app.spellbook.search_query)
    };
    let block = Block::default()
        .title(title)
        .borders(Borders::ALL)
        .border_type(BorderType::Rounded)
        .border_style(theme::dim_text());
    let items: Vec<ListItem> = app
        .spellbook
        .filtered
        .iter()
        .filter_map(|&i| app.spellbook.items.get(i))
        .map(|s| ListItem::new(s.id.clone()))
        .collect();
    let list = List::new(items)
        .block(block)
        .style(theme::body())
        .highlight_style(theme::highlight())
        .highlight_symbol("▶ ");
    frame.render_stateful_widget(list, area, &mut app.spellbook.list_state);
}

fn draw_page(frame: &mut Frame<'_>, area: Rect, app: &mut App) {
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

    let inner = block.inner(area);
    frame.render_widget(block, area);

    let lines = build_page_lines(app);
    let para = Paragraph::new(Text::from(lines))
        .style(theme::body())
        .scroll((app.spellbook.scroll, 0))
        .wrap(Wrap { trim: false });
    frame.render_widget(para, inner);
}

fn build_page_lines(app: &mut App) -> Vec<Line<'static>> {
    let Some(skill) = app.spellbook.selected().cloned() else {
        return vec![Line::from("Empty spellbook.")];
    };
    let mut lines = Vec::new();
    lines.push(Line::from(Span::styled(
        format!("Domain · {}", skill.domain),
        Style::default()
            .fg(theme::FLAME_HOT)
            .add_modifier(Modifier::BOLD),
    )));
    lines.push(Line::from(Span::styled(
        format!("Path · skills/{}", skill.path),
        theme::dim_text(),
    )));
    lines.push(Line::default());

    if let Some(body) = app.spellbook.body_cache.get_skill(&skill.id, &skill.path) {
        lines.extend(body.rendered.iter().cloned());
    } else {
        lines.push(Line::from(Span::styled(
            skill.description.clone(),
            theme::body(),
        )));
        lines.push(Line::default());
        lines.push(Line::from(Span::styled(
            "[--root not provided — pass --root <agent-almanac> to render full SKILL.md]",
            theme::dim_text(),
        )));
    }
    lines
}

fn draw_search_overlay(frame: &mut Frame<'_>, area: Rect, state: &State) {
    let width = area.width.min(60);
    let height = 3u16;
    let x = area.x + (area.width.saturating_sub(width)) / 2;
    let y = area.y + (area.height.saturating_sub(height)) / 2;
    let popup = Rect::new(x, y, width, height);
    frame.render_widget(Clear, popup);
    let block = Block::default()
        .title(" Search ")
        .borders(Borders::ALL)
        .border_type(BorderType::Double)
        .border_style(theme::header());
    let inner = block.inner(popup);
    frame.render_widget(block, popup);
    let para = Paragraph::new(format!("/{}_", state.search_query)).style(theme::body());
    frame.render_widget(para, inner);
}

pub fn handle_key(app: &mut App, code: KeyCode, mods: KeyModifiers) {
    if app.spellbook.search_mode {
        match code {
            KeyCode::Esc => app.spellbook.exit_search(false),
            KeyCode::Enter => app.spellbook.exit_search(true),
            KeyCode::Backspace => app.spellbook.pop_query(),
            KeyCode::Char(ch) if !mods.contains(KeyModifiers::CONTROL) => {
                app.spellbook.append_query(ch);
            }
            _ => {}
        }
        return;
    }
    match code {
        KeyCode::Char('/') => app.spellbook.enter_search(),
        KeyCode::Char('j') | KeyCode::Down => app.spellbook.move_cursor(1),
        KeyCode::Char('k') | KeyCode::Up => app.spellbook.move_cursor(-1),
        KeyCode::Char('J') => app.spellbook.scroll(2),
        KeyCode::Char('K') => app.spellbook.scroll(-2),
        KeyCode::PageDown => app.spellbook.move_cursor(10),
        KeyCode::PageUp => app.spellbook.move_cursor(-10),
        KeyCode::Char('g') => app.spellbook.jump(Jump::Top),
        KeyCode::Char('G') => app.spellbook.jump(Jump::Bottom),
        KeyCode::Home => app.spellbook.jump(Jump::Top),
        KeyCode::End => app.spellbook.jump(Jump::Bottom),
        KeyCode::Esc => {
            if !app.spellbook.search_query.is_empty() {
                app.spellbook.search_query.clear();
                app.spellbook.recompute_filter();
            }
        }
        _ => {}
    }
}
