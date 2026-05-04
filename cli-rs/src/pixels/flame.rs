use ratatui::style::Color;
use ratatui::text::Line;

use super::halfblock::{render, Pixel, PixelGrid};
use crate::theme;

const FRAME_W: usize = 14;
const FRAME_H: usize = 10;

const FRAME_A: &[&str] = &[
    "      .       ",
    "     ###      ",
    "    #####     ",
    "   #######    ",
    "  ###OOO###   ",
    "  ##OOoOO##   ",
    "  #OOoooOO#   ",
    "   ##oeo##    ",
    "    #eeee#    ",
    "    .eeee.    ",
];

const FRAME_B: &[&str] = &[
    "       .      ",
    "     ###      ",
    "    ## ##     ",
    "   ##OOO##    ",
    "  ##OOOOO##   ",
    "  #OOoooOO#   ",
    "   #OoooO#    ",
    "    #ooe#     ",
    "    #eeee#    ",
    "    eeeeee    ",
];

pub fn frame_lines(tick: u64) -> Vec<Line<'static>> {
    let frames = [FRAME_A, FRAME_B];
    let frame = frames[(tick as usize / 6) % frames.len()];
    let grid = decode(frame);
    render(&grid, Color::Reset)
}

fn decode(art: &[&str]) -> PixelGrid {
    let mut grid: PixelGrid = Vec::with_capacity(FRAME_H);
    for row in art {
        let mut line: Vec<Pixel> = Vec::with_capacity(FRAME_W);
        for (i, ch) in row.chars().enumerate() {
            if i >= FRAME_W {
                break;
            }
            line.push(Pixel(color_for(ch)));
        }
        while line.len() < FRAME_W {
            line.push(Pixel(None));
        }
        grid.push(line);
    }
    grid
}

fn color_for(ch: char) -> Option<Color> {
    match ch {
        '#' => Some(theme::FLAME_MID),
        'O' => Some(theme::FLAME_HOT),
        'o' => Some(theme::FLAME_CORE),
        'e' => Some(theme::EMBER),
        '.' => Some(theme::FLAME_MID),
        ' ' => None,
        _ => None,
    }
}
