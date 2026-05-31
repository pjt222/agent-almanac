//! Firelight glyph — the half-block flame that lights the grimoire.
//!
//! Drawn procedurally rather than from sprite frames: for each pixel a "heat"
//! value is computed from a teardrop body shape, a time-driven edge wobble, and
//! the fire's `intensity` (which both brightens the flame and lets it reach
//! higher). The pixel grid is then rendered two-rows-per-line with the
//! half-block character.
//!
//! (The `cli/lib/glyph-data.json` campfire assets are full-resolution 512×640
//! PNGs meant for the iTerm/Kitty graphics protocol, not pixel art — see the
//! v2.0 port notes — so they are deliberately not used here.)

use ratatui::style::Color;
use ratatui::text::Line;

use super::halfblock::{render, Pixel, PixelGrid};
use crate::fire::FireState;
use crate::theme;

const W: usize = 17; // odd → a true centre column
const H: usize = 14; // → 7 half-block rows

/// Render the flame for the current fire state.
pub fn frame_lines(fire: &FireState) -> Vec<Line<'static>> {
    let grid = flame_grid(fire.tick(), fire.intensity());
    render(&grid, Color::Reset)
}

fn flame_grid(tick: u64, intensity: f32) -> PixelGrid {
    use std::f32::consts::PI;
    let cx = (W / 2) as f32;
    let half_w = cx - 1.0;
    let t = tick as f32;
    let brightness = brightness_for(intensity);
    // How far up the canvas the flame body reaches (fraction of the height);
    // a flare pushes it nearly to the top, the resting glow sits lower.
    let reach = 0.62 + intensity * 0.36;
    let ember_top = H - 2; // bottom two pixel rows are the ember bed

    let mut grid: PixelGrid = vec![vec![Pixel(None); W]; H];
    for (y, row) in grid.iter_mut().enumerate() {
        // 0 at the very top (flame tip), 1 at the very bottom (ember bed).
        let from_top = y as f32 / (H - 1) as f32;
        let height_above_base = 1.0 - from_top;

        // The glowing ember bed: a wide, dim band, brighter at the centre.
        if y >= ember_top {
            let bed_radius = (half_w * (0.55 + intensity * 0.30)).max(1.0);
            for (x, cell) in row.iter_mut().enumerate() {
                let dx = (x as f32 - cx).abs();
                if dx <= bed_radius {
                    let heat = 0.16 + 0.30 * (1.0 - dx / bed_radius);
                    if let Some(c) = heat_color(heat) {
                        *cell = Pixel(Some(scale(c, brightness)));
                    }
                }
            }
            continue;
        }

        // Teardrop body: a point at the tip, bulging just below the middle,
        // slightly pinched at the base; with a time-driven edge wobble that
        // grows the higher up we are.
        let shape = (from_top * PI * 0.85).sin().max(0.0);
        let body_radius = shape * half_w * (0.52 + intensity * 0.42);
        let wobble = ((t * 0.5 + from_top * 6.0).sin() * 0.6
            + (t * 0.31 - from_top * 3.3).sin() * 0.4)
            * (1.0 - from_top)
            * 1.7;
        let radius = (body_radius + wobble).max(0.0);
        let above_tip = height_above_base > reach;

        for (x, cell) in row.iter_mut().enumerate() {
            let dx = (x as f32 - cx).abs();

            if above_tip {
                // Above the flame: only the occasional drifting spark.
                if spark(x, y, tick) {
                    *cell = Pixel(Some(scale(theme::EMBER, brightness)));
                }
                continue;
            }
            if radius < 0.4 || dx / radius > 1.0 {
                continue;
            }
            // Heat: 1 at the centre column, falling to 0 at the edge; hotter
            // toward the base-centre, cooler at the tip.
            let mut heat = 1.0 - dx / radius;
            heat *= 0.42 + from_top * 0.58;
            heat *= 0.62 + intensity * 0.5;
            if let Some(color) = heat_color(heat) {
                *cell = Pixel(Some(scale(color, brightness)));
            }
        }
    }
    grid
}

/// A cheap deterministic twinkle for sparks just above the flame tip.
fn spark(x: usize, y: usize, tick: u64) -> bool {
    (x.wrapping_mul(7) ^ y.wrapping_mul(13) ^ (tick as usize).wrapping_mul(11)).is_multiple_of(89)
}

fn heat_color(heat: f32) -> Option<Color> {
    if heat <= 0.04 {
        None
    } else if heat < 0.20 {
        Some(theme::EMBER)
    } else if heat < 0.45 {
        Some(theme::FLAME_MID)
    } else if heat < 0.72 {
        Some(theme::FLAME_HOT)
    } else {
        Some(theme::FLAME_CORE)
    }
}

/// Map fire intensity (`~0.45..=1.0`) to a per-channel brightness multiplier:
/// the resting glow a touch below the palette's nominal colour, a full flare
/// pushed brighter (clamped per channel in [`scale`]).
fn brightness_for(intensity: f32) -> f32 {
    (0.62 + intensity * 0.68).clamp(0.6, 1.4)
}

/// Multiply an RGB colour by a brightness factor, clamping per channel.
/// Non-RGB colours pass through unchanged.
fn scale(color: Color, factor: f32) -> Color {
    match color {
        Color::Rgb(r, g, b) => {
            let s = |v: u8| ((v as f32) * factor).round().clamp(0.0, 255.0) as u8;
            Color::Rgb(s(r), s(g), s(b))
        }
        other => other,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fire::FireState;

    #[test]
    fn flame_renders_seven_lines_and_is_non_empty_when_lit() {
        let lines = frame_lines(&FireState::new(false));
        assert_eq!(lines.len(), H / 2);
        let painted: usize = lines
            .iter()
            .flat_map(|l| l.spans.iter())
            .filter(|s| s.content.trim() != "" || s.style.bg.is_some())
            .count();
        assert!(painted > 0, "a resting fire should still show flame pixels");
    }

    #[test]
    fn flare_paints_more_than_rest() {
        let count = |fire: &FireState| -> usize {
            flame_grid(fire.tick(), fire.intensity())
                .iter()
                .flatten()
                .filter(|p| p.0.is_some())
                .count()
        };
        let resting = FireState::new(false);
        let mut flared = FireState::new(false);
        flared.bump();
        assert!(
            count(&flared) >= count(&resting),
            "a flare should fill at least as much as the resting glow"
        );
    }
}
