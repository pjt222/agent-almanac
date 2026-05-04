use ratatui::style::{Color, Style};
use ratatui::text::{Line, Span};

pub const UPPER_HALF: char = '\u{2580}';

#[derive(Debug, Clone, Copy)]
pub struct Pixel(pub Option<Color>);

pub type PixelGrid = Vec<Vec<Pixel>>;

pub fn render(grid: &PixelGrid, transparent_bg: Color) -> Vec<Line<'static>> {
    let mut lines = Vec::new();
    let mut row_iter = grid.iter();
    while let Some(top_row) = row_iter.next() {
        let bottom_row = row_iter.next();
        let width = top_row.len();
        let mut spans: Vec<Span<'static>> = Vec::with_capacity(width);
        for x in 0..width {
            let top = top_row.get(x).copied().unwrap_or(Pixel(None));
            let bottom = bottom_row
                .and_then(|r| r.get(x).copied())
                .unwrap_or(Pixel(None));
            let fg = top.0.unwrap_or(transparent_bg);
            let bg = bottom.0.unwrap_or(transparent_bg);
            let style = Style::default().fg(fg).bg(bg);
            spans.push(Span::styled(UPPER_HALF.to_string(), style));
        }
        lines.push(Line::from(spans));
    }
    lines
}

#[allow(dead_code)]
pub fn solid_grid(width: usize, height: usize, color: Color) -> PixelGrid {
    (0..height)
        .map(|_| (0..width).map(|_| Pixel(Some(color))).collect())
        .collect()
}
