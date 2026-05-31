//! The reading light.
//!
//! A grimoire is read by firelight. This module models that fire as a single
//! `intensity` value in `0.0..=1.0` that decays toward a resting `floor` and
//! flares to full whenever the reader does something (a keypress, a page turn,
//! a search). When `--animate` is on, the resting state is not flat — the fire
//! breathes slowly. When it is off, the fire is steady except for the short
//! settling tail after a flare.
//!
//! The TUI reads `needs_ticks()` to decide whether to keep redrawing on a frame
//! clock or fall back to a long, CPU-friendly `event::poll` deadline.

/// Resting intensity when idle and not animating.
const FLOOR: f32 = 0.45;
/// How much the breathing animation lifts the fire above the floor.
const BREATH_AMPLITUDE: f32 = 0.18;
/// Radians advanced per animation tick — small, so the breath is slow.
const BREATH_RATE: f32 = 0.07;
/// Fraction of the gap to the target closed each tick (exponential approach).
const DECAY: f32 = 0.16;
/// Distance from the target below which we snap and stop ticking.
const SETTLE_EPSILON: f32 = 0.01;

#[derive(Debug, Clone)]
pub struct FireState {
    /// Current brightness, `0.0..=1.0`.
    intensity: f32,
    /// Monotonic frame counter, used both for flame-frame selection and the
    /// breathing phase.
    tick: u64,
    /// Whether the idle state breathes (`--animate`) or stays flat.
    animate: bool,
}

impl FireState {
    pub fn new(animate: bool) -> Self {
        let mut fire = Self {
            intensity: FLOOR,
            tick: 0,
            animate,
        };
        fire.intensity = fire.target();
        fire
    }

    /// Current brightness in `0.0..=1.0`.
    pub fn intensity(&self) -> f32 {
        self.intensity
    }

    /// Monotonic frame counter (wraps).
    pub fn tick(&self) -> u64 {
        self.tick
    }

    pub fn animate(&self) -> bool {
        self.animate
    }

    /// Flare the fire to full — call on any reader activity.
    pub fn bump(&mut self) {
        self.intensity = 1.0;
    }

    /// Advance one animation frame: bump the tick, ease toward the target.
    pub fn advance(&mut self) {
        self.tick = self.tick.wrapping_add(1);
        let target = self.target();
        self.intensity += (target - self.intensity) * DECAY;
        if (self.intensity - target).abs() < SETTLE_EPSILON {
            self.intensity = target;
        }
        self.intensity = self.intensity.clamp(0.0, 1.0);
    }

    /// The brightness the fire is currently easing toward.
    fn target(&self) -> f32 {
        if self.animate {
            let phase = (self.tick as f32 * BREATH_RATE).sin() * 0.5 + 0.5;
            FLOOR + BREATH_AMPLITUDE * phase
        } else {
            FLOOR
        }
    }

    /// True while the fire is meaningfully away from its target (the settling
    /// tail after a flare).
    pub fn is_settling(&self) -> bool {
        (self.intensity - self.target()).abs() > SETTLE_EPSILON
    }

    /// True if the event loop should keep a frame clock running: either the
    /// fire breathes, or it is still settling after a flare.
    pub fn needs_ticks(&self) -> bool {
        self.animate || self.is_settling()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn static_fire_rests_at_floor_and_stops_ticking() {
        let mut fire = FireState::new(false);
        assert!((fire.intensity() - FLOOR).abs() < f32::EPSILON);
        assert!(
            !fire.needs_ticks(),
            "static fire at rest should not need ticks"
        );
        fire.bump();
        assert!(fire.intensity() > FLOOR);
        assert!(fire.needs_ticks(), "after a flare it must settle");
        for _ in 0..200 {
            fire.advance();
        }
        assert!((fire.intensity() - FLOOR).abs() < SETTLE_EPSILON);
        assert!(
            !fire.needs_ticks(),
            "settled fire should stop needing ticks"
        );
    }

    #[test]
    fn animated_fire_always_needs_ticks_and_stays_in_range() {
        let mut fire = FireState::new(true);
        for _ in 0..500 {
            fire.advance();
            let i = fire.intensity();
            assert!((0.0..=1.0).contains(&i), "intensity out of range: {i}");
            assert!(fire.needs_ticks());
        }
    }
}
