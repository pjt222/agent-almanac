use ratatui::style::{Color, Modifier, Style};

pub const FLAME_CORE: Color = Color::Rgb(0xFF, 0xF4, 0xE0);
pub const FLAME_HOT: Color = Color::Rgb(0xFF, 0xB3, 0x47);
pub const FLAME_MID: Color = Color::Rgb(0xFF, 0x6B, 0x35);
pub const EMBER: Color = Color::Rgb(0x8B, 0x45, 0x13);
pub const WARM_TEXT: Color = Color::Rgb(0xD4, 0xA5, 0x74);
pub const NIGHT_BG: Color = Color::Rgb(0x18, 0x10, 0x0C);

pub fn header() -> Style {
    Style::default()
        .fg(FLAME_HOT)
        .add_modifier(Modifier::BOLD)
}

pub fn dim_text() -> Style {
    Style::default().fg(WARM_TEXT).add_modifier(Modifier::DIM)
}

pub fn body() -> Style {
    Style::default().fg(WARM_TEXT)
}

pub fn highlight() -> Style {
    Style::default()
        .fg(FLAME_CORE)
        .bg(EMBER)
        .add_modifier(Modifier::BOLD)
}
