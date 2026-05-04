use pulldown_cmark::{CodeBlockKind, Event, HeadingLevel, Parser, Tag, TagEnd};
use ratatui::style::{Color, Modifier, Style};
use ratatui::text::{Line, Span};

use crate::theme;

pub fn render(source: &str) -> Vec<Line<'static>> {
    let parser = Parser::new(source);
    let mut renderer = Renderer::default();
    for event in parser {
        renderer.handle(event);
    }
    renderer.finish()
}

#[derive(Default)]
struct Renderer {
    lines: Vec<Line<'static>>,
    current: Vec<Span<'static>>,
    style_stack: Vec<Style>,
    list_depth: usize,
    in_code_block: bool,
}

impl Renderer {
    fn current_style(&self) -> Style {
        self.style_stack
            .last()
            .copied()
            .unwrap_or_else(|| Style::default().fg(theme::WARM_TEXT))
    }

    fn push_text(&mut self, text: String) {
        let style = self.current_style();
        self.current.push(Span::styled(text, style));
    }

    fn flush_line(&mut self) {
        let line = std::mem::take(&mut self.current);
        self.lines.push(Line::from(line));
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
            Event::Text(text) => self.push_text(text.into_string()),
            Event::Code(code) => {
                let style = Style::default()
                    .fg(theme::FLAME_HOT)
                    .add_modifier(Modifier::BOLD);
                self.current.push(Span::styled(code.into_string(), style));
            }
            Event::SoftBreak | Event::HardBreak => self.flush_line(),
            Event::Rule => {
                self.flush_line();
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
            Tag::Paragraph => {
                if !self.current.is_empty() {
                    self.flush_line();
                }
            }
            Tag::Heading { level, .. } => {
                if !self.current.is_empty() {
                    self.flush_line();
                }
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
                if !self.current.is_empty() {
                    self.flush_line();
                }
                self.style_stack.push(
                    Style::default()
                        .fg(theme::FLAME_HOT)
                        .bg(Color::Rgb(0x10, 0x0A, 0x06)),
                );
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
                if !self.current.is_empty() {
                    self.flush_line();
                }
            }
            Tag::Item => {
                let indent = "  ".repeat(self.list_depth.saturating_sub(1));
                let style = self.current_style();
                self.current
                    .push(Span::styled(format!("{indent}• "), style));
            }
            Tag::Emphasis => {
                let mut s = self.current_style();
                s = s.add_modifier(Modifier::ITALIC);
                self.style_stack.push(s);
            }
            Tag::Strong => {
                let mut s = self.current_style();
                s = s.add_modifier(Modifier::BOLD);
                self.style_stack.push(s);
            }
            Tag::Strikethrough => {
                let mut s = self.current_style();
                s = s.add_modifier(Modifier::CROSSED_OUT);
                self.style_stack.push(s);
            }
            Tag::Link { .. } => {
                let s = Style::default()
                    .fg(theme::FLAME_HOT)
                    .add_modifier(Modifier::UNDERLINED);
                self.style_stack.push(s);
            }
            Tag::Image { .. } => {
                self.push_text("[image]".to_string());
            }
            _ => {}
        }
    }

    fn end_tag(&mut self, tag: TagEnd) {
        match tag {
            TagEnd::Paragraph => self.flush_line(),
            TagEnd::Heading(_) => {
                self.flush_line();
                self.style_stack.pop();
                self.lines.push(Line::default());
            }
            TagEnd::BlockQuote(_) => {
                self.flush_line();
                self.style_stack.pop();
            }
            TagEnd::CodeBlock => {
                self.flush_line();
                self.style_stack.pop();
                self.in_code_block = false;
                self.lines.push(Line::default());
            }
            TagEnd::List(_) => {
                self.list_depth = self.list_depth.saturating_sub(1);
                if self.list_depth == 0 {
                    self.lines.push(Line::default());
                }
            }
            TagEnd::Item => self.flush_line(),
            TagEnd::Emphasis | TagEnd::Strong | TagEnd::Strikethrough | TagEnd::Link => {
                self.style_stack.pop();
            }
            _ => {}
        }
    }
}
