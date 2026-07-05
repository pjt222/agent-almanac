use ratatui::style::{Color, Modifier, Style};

pub const FLAME_CORE: Color = Color::Rgb(0xFF, 0xF4, 0xE0);
pub const FLAME_HOT: Color = Color::Rgb(0xFF, 0xB3, 0x47);
pub const FLAME_MID: Color = Color::Rgb(0xFF, 0x6B, 0x35);
pub const EMBER: Color = Color::Rgb(0x8B, 0x45, 0x13);
pub const WARM_TEXT: Color = Color::Rgb(0xD4, 0xA5, 0x74);
pub const NIGHT_BG: Color = Color::Rgb(0x18, 0x10, 0x0C);

/// Fore-edge thumb-tab colours, one warm hue per volume. Kept within the
/// firelit palette but distinct enough to read at a glance.
pub const VOLUME_SPELLS: Color = Color::Rgb(0xFF, 0xB3, 0x47); // amber
pub const VOLUME_COMPANIONS: Color = Color::Rgb(0xE2, 0x8C, 0x5A); // copper
pub const VOLUME_FELLOWSHIPS: Color = Color::Rgb(0xC2, 0x6A, 0x46); // terracotta
pub const VOLUME_TOMES: Color = Color::Rgb(0xB9, 0x90, 0x6E); // parchment-brown

pub fn header() -> Style {
    Style::default().fg(FLAME_HOT).add_modifier(Modifier::BOLD)
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

/// A label drawn in a volume's accent colour, bold.
pub fn accent(color: Color) -> Style {
    Style::default().fg(color).add_modifier(Modifier::BOLD)
}

/// Style for the characters a search query matched, in the index.
pub fn match_hl() -> Style {
    Style::default()
        .fg(FLAME_CORE)
        .add_modifier(Modifier::BOLD | Modifier::UNDERLINED)
}

/// Style for a bookmark ribbon marker in the index.
pub fn ribbon() -> Style {
    Style::default().fg(FLAME_MID).add_modifier(Modifier::BOLD)
}
