//! A small CommonMark → ratatui renderer. Not a full implementation — enough
//! to make SKILL.md / agent / team / guide bodies readable inside the page
//! pane: headings, emphasis, inline code, lists, block quotes, rules, fenced
//! code blocks (rendered line-by-line on a dark band), and pipe tables (parsed
//! and laid out with aligned columns).

use pulldown_cmark::{CodeBlockKind, Event, HeadingLevel, Options, Parser, Tag, TagEnd};
use ratatui::style::{Color, Modifier, Style};
use ratatui::text::{Line, Span};

use crate::theme;

const CODE_BG: Color = Color::Rgb(0x10, 0x0A, 0x06);
/// A table column is never padded wider than this (keeps wide tables sane).
const MAX_TABLE_COL: usize = 26;

pub fn render(source: &str) -> Vec<Line<'static>> {
    let options = Options::ENABLE_TABLES | Options::ENABLE_STRIKETHROUGH;
    let mut renderer = Renderer::default();
    for event in Parser::new_ext(source, options) {
        renderer.handle(event);
    }
    renderer.finish()
}

type Cell = Vec<Span<'static>>;
type Row = Vec<Cell>;

#[derive(Default)]
struct Renderer {
    lines: Vec<Line<'static>>,
    current: Vec<Span<'static>>,
    style_stack: Vec<Style>,
    list_depth: usize,
    in_code_block: bool,
    // table assembly
    in_table: bool,
    in_cell: bool,
    table_header_rows: usize,
    table_rows: Vec<Row>,
    current_row: Row,
    current_cell: Cell,
}

impl Renderer {
    fn current_style(&self) -> Style {
        self.style_stack
            .last()
            .copied()
            .unwrap_or_else(|| Style::default().fg(theme::WARM_TEXT))
    }

    /// Route a span to the current table cell, or to the line being built.
    fn push_span(&mut self, span: Span<'static>) {
        if self.in_cell {
            self.current_cell.push(span);
        } else {
            self.current.push(span);
        }
    }

    fn push_text(&mut self, text: String) {
        let style = self.current_style();
        self.push_span(Span::styled(text, style));
    }

    fn flush_line(&mut self) {
        let line = std::mem::take(&mut self.current);
        self.lines.push(Line::from(line));
    }

    /// Flush the line in progress only if it has content (avoids stray blanks).
    fn break_line(&mut self) {
        if !self.current.is_empty() {
            self.flush_line();
        }
    }

    fn blank(&mut self) {
        self.lines.push(Line::default());
    }

    fn finish(mut self) -> Vec<Line<'static>> {
        if !self.current.is_empty() {
            self.flush_line();
        }
        self.lines
    }

    fn handle(&mut self, event: Event<'_>) {
        match event {
            Event::Start(tag) => self.start_tag(tag),
            Event::End(tag) => self.end_tag(tag),
            Event::Text(text) => {
                let text = text.into_string();
                if self.in_code_block {
                    // Code text arrives with embedded newlines; emit one line each.
                    let mut segs = text.split('\n').peekable();
                    while let Some(seg) = segs.next() {
                        self.push_text(seg.to_string());
                        if segs.peek().is_some() {
                            self.flush_line();
                        }
                    }
                } else {
                    self.push_text(text);
                }
            }
            Event::Code(code) => {
                let style = Style::default()
                    .fg(theme::FLAME_HOT)
                    .add_modifier(Modifier::BOLD);
                self.push_span(Span::styled(code.into_string(), style));
            }
            Event::SoftBreak | Event::HardBreak => {
                if !self.in_cell {
                    self.flush_line();
                }
            }
            Event::Rule => {
                self.break_line();
                self.lines.push(Line::from(Span::styled(
                    "─".repeat(40),
                    Style::default().fg(theme::EMBER),
                )));
            }
            Event::Html(_) | Event::InlineHtml(_) => {}
            Event::FootnoteReference(_) | Event::TaskListMarker(_) => {}
            Event::InlineMath(_) | Event::DisplayMath(_) => {}
        }
    }

    fn start_tag(&mut self, tag: Tag<'_>) {
        match tag {
            Tag::Paragraph => self.break_line(),
            Tag::Heading { level, .. } => {
                self.break_line();
                let style = match level {
                    HeadingLevel::H1 => Style::default()
                        .fg(theme::FLAME_CORE)
                        .add_modifier(Modifier::BOLD | Modifier::UNDERLINED),
                    HeadingLevel::H2 => Style::default()
                        .fg(theme::FLAME_HOT)
                        .add_modifier(Modifier::BOLD),
                    _ => Style::default()
                        .fg(theme::FLAME_MID)
                        .add_modifier(Modifier::BOLD),
                };
                self.style_stack.push(style);
            }
            Tag::BlockQuote(_) => {
                self.style_stack.push(
                    Style::default()
                        .fg(theme::WARM_TEXT)
                        .add_modifier(Modifier::ITALIC),
                );
                self.push_text("│ ".to_string());
            }
            Tag::CodeBlock(kind) => {
                self.in_code_block = true;
                self.break_line();
                self.style_stack
                    .push(Style::default().fg(theme::FLAME_HOT).bg(CODE_BG));
                if let CodeBlockKind::Fenced(lang) = kind {
                    if !lang.is_empty() {
                        self.lines.push(Line::from(Span::styled(
                            format!("┌─ {} ─", lang.into_string()),
                            Style::default().fg(theme::EMBER),
                        )));
                    }
                }
            }
            Tag::List(_) => {
                self.list_depth += 1;
                self.break_line();
            }
            Tag::Item => {
                let indent = "  ".repeat(self.list_depth.saturating_sub(1));
                let style = self.current_style();
                self.push_span(Span::styled(format!("{indent}• "), style));
            }
            Tag::Table(_) => {
                self.break_line();
                self.in_table = true;
                self.table_rows.clear();
                self.current_row.clear();
                self.current_cell.clear();
                self.table_header_rows = 0;
            }
            Tag::TableHead => {
                self.current_row.clear();
                self.table_header_rows = 1;
            }
            Tag::TableRow => self.current_row.clear(),
            Tag::TableCell => {
                self.current_cell.clear();
                self.in_cell = true;
            }
            Tag::Emphasis => {
                let s = self.current_style().add_modifier(Modifier::ITALIC);
                self.style_stack.push(s);
            }
            Tag::Strong => {
                let s = self.current_style().add_modifier(Modifier::BOLD);
                self.style_stack.push(s);
            }
            Tag::Strikethrough => {
                let s = self.current_style().add_modifier(Modifier::CROSSED_OUT);
                self.style_stack.push(s);
            }
            Tag::Link { .. } => {
                self.style_stack.push(
                    Style::default()
                        .fg(theme::FLAME_HOT)
                        .add_modifier(Modifier::UNDERLINED),
                );
            }
            Tag::Image { .. } => self.push_text("[image] ".to_string()),
            _ => {}
        }
    }

    fn end_tag(&mut self, tag: TagEnd) {
        match tag {
            TagEnd::Paragraph => self.flush_line(),
            TagEnd::Heading(_) => {
                self.flush_line();
                self.style_stack.pop();
                self.blank();
            }
            TagEnd::BlockQuote(_) => {
                self.flush_line();
                self.style_stack.pop();
            }
            TagEnd::CodeBlock => {
                self.flush_line();
                self.style_stack.pop();
                self.in_code_block = false;
                self.blank();
            }
            TagEnd::List(_) => {
                self.list_depth = self.list_depth.saturating_sub(1);
                if self.list_depth == 0 {
                    self.blank();
                }
            }
            TagEnd::Item => self.flush_line(),
            TagEnd::TableCell => {
                self.in_cell = false;
                let cell = std::mem::take(&mut self.current_cell);
                self.current_row.push(cell);
            }
            TagEnd::TableHead | TagEnd::TableRow => {
                let row = std::mem::take(&mut self.current_row);
                self.table_rows.push(row);
            }
            TagEnd::Table => {
                self.in_table = false;
                let rows = std::mem::take(&mut self.table_rows);
                let header = self.table_header_rows;
                self.render_table(rows, header);
                self.blank();
            }
            TagEnd::Emphasis | TagEnd::Strong | TagEnd::Strikethrough | TagEnd::Link => {
                self.style_stack.pop();
            }
            _ => {}
        }
    }

    /// Lay out a parsed table: per-column max widths (capped), `cell │ cell`
    /// separators, and a `─┼─` rule under the header row.
    fn render_table(&mut self, rows: Vec<Row>, header_rows: usize) {
        if rows.is_empty() {
            return;
        }
        let n_cols = rows.iter().map(Vec::len).max().unwrap_or(0);
        if n_cols == 0 {
            return;
        }
        let cell_w = |cell: &Cell| {
            cell.iter()
                .map(|s| s.content.chars().count())
                .sum::<usize>()
        };
        let mut widths = vec![1usize; n_cols];
        for row in &rows {
            for (c, cell) in row.iter().enumerate() {
                widths[c] = widths[c].max(cell_w(cell).min(MAX_TABLE_COL));
            }
        }
        let sep = Style::default().fg(theme::EMBER);

        for (i, row) in rows.iter().enumerate() {
            let mut line: Vec<Span<'static>> = Vec::new();
            for (c, &w) in widths.iter().enumerate() {
                if c > 0 {
                    line.push(Span::styled(" │ ", sep));
                }
                let empty: Cell = Vec::new();
                let cell = row.get(c).unwrap_or(&empty);
                let used = cell_w(cell);
                line.extend(cell.iter().cloned());
                if used < w {
                    line.push(Span::raw(" ".repeat(w - used)));
                }
            }
            self.lines.push(Line::from(line));

            if i + 1 == header_rows {
                let mut rule: Vec<Span<'static>> = Vec::new();
                for (c, &w) in widths.iter().enumerate() {
                    if c > 0 {
                        rule.push(Span::styled("─┼─", sep));
                    }
                    rule.push(Span::styled("─".repeat(w), sep));
                }
                self.lines.push(Line::from(rule));
            }
        }
    }
}
