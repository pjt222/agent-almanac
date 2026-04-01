# primitives_17.R - Glyph library part 17: physics and logic skills (11)
# Sourced by build-icons.R
# Domains: digital-logic (4), electromagnetism (4), levitation (3)

# ══════════════════════════════════════════════════════════════════════════════
# Digital-logic skills (4)
# ══════════════════════════════════════════════════════════════════════════════

glyph_boolean_table <- function(cx, cy, s, col, bright) {
  # Truth table grid: 2 input columns + 1 output column, 4 rows
  layers <- list()

  # Outer table frame
  table_w <- 20 * s
  table_h <- 24 * s
  frame <- data.frame(
    x = c(cx - table_w, cx + table_w, cx + table_w, cx - table_w, cx - table_w),
    y = c(cy + table_h, cy + table_h, cy - table_h, cy - table_h, cy + table_h)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = frame, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Vertical dividers (3 columns: A | B | OUT)
  for (vx in c(-7, 7)) {
    vline <- data.frame(
      x = c(cx + vx * s, cx + vx * s),
      y = c(cy + table_h, cy - table_h)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = vline, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2))
  }

  # Horizontal header divider
  hdr <- data.frame(
    x = c(cx - table_w, cx + table_w),
    y = c(cy + 12 * s, cy + 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = hdr, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))

  # Row dividers
  for (ry in c(0, -12)) {
    rline <- data.frame(
      x = c(cx - table_w, cx + table_w),
      y = c(cy + ry * s, cy + ry * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = rline, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1))
  }

  # Cell values: truth table rows for AND gate
  # Columns at x offsets: -13.5, 0, 13.5
  # Rows at y offsets: 18, 6, -6, -18
  values <- list(
    c("0", "0", "0"),
    c("0", "1", "0"),
    c("1", "0", "0"),
    c("1", "1", "1")
  )
  col_xs <- c(-13.5, 0, 13.5)
  row_ys <- c(6, -6, -18)
  # Only render data rows (skip header text for simplicity — glyph is visual)
  for (r in seq_along(values)[-1]) {
    for (c_idx in seq_along(col_xs)) {
      val <- values[[r]][c_idx]
      dot_alpha <- if (val == "1") 0.9 else 0.25
      dot <- data.frame(x0 = cx + col_xs[c_idx] * s, y0 = cy + row_ys[r - 1] * s, r = 2.5 * s)
      layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
        .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, dot_alpha), color = "transparent", linewidth = 0)
    }
  }
  # First data row
  for (c_idx in seq_along(col_xs)) {
    val <- values[[1]][c_idx]
    dot_alpha <- if (val == "1") 0.9 else 0.25
    dot <- data.frame(x0 = cx + col_xs[c_idx] * s, y0 = cy + 18 * s, r = 2.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, dot_alpha), color = "transparent", linewidth = 0)
  }

  layers
}

glyph_logic_gates <- function(cx, cy, s, col, bright) {
  # NAND gate symbol: curved body with two inputs and one output
  layers <- list()

  # Gate body (D-shape: flat left side, curved right side)
  t_arc <- seq(-pi / 2, pi / 2, length.out = 30)
  arc_r <- 16 * s
  body <- data.frame(
    x = c(cx - 12 * s, cx - 12 * s,
          cx + arc_r * cos(t_arc),
          cx - 12 * s),
    y = c(cy - 14 * s, cy + 14 * s,
          cy + arc_r * sin(t_arc),
          cy - 14 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = body, .aes(x, y),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2.2))

  # Inversion bubble at output
  bubble <- data.frame(x0 = cx + 18 * s, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = bubble,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.05), color = bright, linewidth = .lw(s, 1.8))

  # Input lines (two)
  for (yoff in c(7, -7)) {
    inp <- data.frame(
      x = c(cx - 24 * s, cx - 12 * s),
      y = c(cy + yoff * s, cy + yoff * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = inp, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.8))
  }

  # Output line
  outp <- data.frame(
    x = c(cx + 21 * s, cx + 28 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = outp, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.8))

  layers
}

glyph_flip_flop <- function(cx, cy, s, col, bright) {
  # D flip-flop: rectangular box with clock edge triangle
  layers <- list()

  # Main box
  box <- data.frame(
    xmin = cx - 14 * s, xmax = cx + 14 * s,
    ymin = cy - 18 * s, ymax = cy + 18 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = box,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2.2))

  # Clock triangle on left edge (pointing right)
  tri <- data.frame(
    x = cx + c(-14, -8, -14) * s,
    y = cy + c(-6, 0, 6) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = tri, .aes(x, y),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))

  # D input line (top-left)
  d_in <- data.frame(
    x = c(cx - 24 * s, cx - 14 * s),
    y = c(cy + 10 * s, cy + 10 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = d_in, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.5))

  # Q output line (top-right)
  q_out <- data.frame(
    x = c(cx + 14 * s, cx + 24 * s),
    y = c(cy + 10 * s, cy + 10 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = q_out, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.5))

  # Q-bar output with inversion bubble (bottom-right)
  qb_out <- data.frame(
    x = c(cx + 14 * s, cx + 20 * s),
    y = c(cy - 10 * s, cy - 10 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = qb_out, .aes(x, y),
    color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))
  qb_dot <- data.frame(x0 = cx + 22 * s, y0 = cy - 10 * s, r = 2.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = qb_dot,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.05), color = bright, linewidth = .lw(s, 1.2))

  # Clock input line (left, at center)
  clk_in <- data.frame(
    x = c(cx - 24 * s, cx - 14 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = clk_in, .aes(x, y),
    color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))

  layers
}

glyph_cpu_chip <- function(cx, cy, s, col, bright) {
  # IC chip: rectangle with pin rows on all four sides
  layers <- list()

  # Main die
  die <- data.frame(
    xmin = cx - 14 * s, xmax = cx + 14 * s,
    ymin = cy - 14 * s, ymax = cy + 14 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = die,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2.5))

  # Orientation notch (top-left corner)
  notch <- data.frame(x0 = cx - 10 * s, y0 = cy + 10 * s, r = 2.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = notch,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1))

  # Pins on all 4 sides (4 pins per side)
  pin_len <- 6 * s
  pin_offsets <- c(-9, -3, 3, 9)
  for (po in pin_offsets) {
    # Top
    pin <- data.frame(x = c(cx + po * s, cx + po * s), y = c(cy + 14 * s, cy + 14 * s + pin_len))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pin, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 2))
    # Bottom
    pin <- data.frame(x = c(cx + po * s, cx + po * s), y = c(cy - 14 * s, cy - 14 * s - pin_len))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pin, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 2))
    # Left
    pin <- data.frame(x = c(cx - 14 * s, cx - 14 * s - pin_len), y = c(cy + po * s, cy + po * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pin, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 2))
    # Right
    pin <- data.frame(x = c(cx + 14 * s, cx + 14 * s + pin_len), y = c(cy + po * s, cy + po * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pin, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 2))
  }

  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Electromagnetism skills (4)
# ══════════════════════════════════════════════════════════════════════════════

glyph_magnetic_field <- function(cx, cy, s, col, bright) {
  # Bar magnet with curved field lines
  layers <- list()

  # Bar magnet (horizontal rectangle, split into N and S)
  magnet_w <- 10 * s
  magnet_h <- 6 * s
  # North half (left)
  n_half <- data.frame(
    xmin = cx - magnet_w, xmax = cx,
    ymin = cy - magnet_h, ymax = cy + magnet_h
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = n_half,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.8))
  # South half (right)
  s_half <- data.frame(
    xmin = cx, xmax = cx + magnet_w,
    ymin = cy - magnet_h, ymax = cy + magnet_h
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = s_half,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8))

  # Field lines (3 arcs above and below the magnet)
  for (r_mult in c(12, 18, 24)) {
    t_upper <- seq(0, pi, length.out = 30)
    arc_upper <- data.frame(
      x = cx + r_mult * s * cos(t_upper),
      y = cy + r_mult * s * sin(t_upper) * 0.6 + magnet_h
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc_upper, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.2))
    arc_lower <- data.frame(
      x = cx + r_mult * s * cos(t_upper),
      y = cy - r_mult * s * sin(t_upper) * 0.6 - magnet_h
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc_lower, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.2))
  }

  layers
}

glyph_faraday_coil <- function(cx, cy, s, col, bright) {
  # Solenoid coil with induced current arrow
  layers <- list()

  # Coil windings (5 overlapping ellipses along vertical axis)
  n_windings <- 5
  coil_w <- 14 * s
  coil_h <- 4 * s
  y_start <- cy + 14 * s
  y_step <- 7 * s

  for (i in seq_len(n_windings)) {
    yy <- y_start - (i - 1) * y_step
    t_ell <- seq(0, 2 * pi, length.out = 40)
    ell <- data.frame(
      x = cx + coil_w * cos(t_ell),
      y = yy + coil_h * sin(t_ell)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ell, .aes(x, y),
      color = hex_with_alpha(bright, 0.5 + 0.1 * (i %% 2)), linewidth = .lw(s, 1.8))
  }

  # Vertical core line through the center
  core <- data.frame(
    x = c(cx, cx),
    y = c(cy + 20 * s, cy - 20 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = core, .aes(x, y),
    color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5))

  # Current arrow (curved, to the right of the coil)
  t_arr <- seq(-pi / 3, pi / 3, length.out = 20)
  arrow_arc <- data.frame(
    x = cx + 20 * s + 6 * s * sin(t_arr),
    y = cy + 12 * s * t_arr / (pi / 3)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_arc, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 2))
  # Arrow head
  ah <- data.frame(
    x = cx + c(20 + 6 * sin(pi / 3) - 2, 20 + 6 * sin(pi / 3), 20 + 6 * sin(pi / 3) + 2) * s,
    y = cy + c(10, 12, 10) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ah, .aes(x, y),
    fill = bright, color = bright, linewidth = .lw(s, 0.5))

  layers
}

glyph_maxwell_wave <- function(cx, cy, s, col, bright) {
  # Orthogonal E and B wave sinusoids propagating along horizontal axis
  layers <- list()

  # Propagation axis
  axis <- data.frame(
    x = c(cx - 26 * s, cx + 26 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = axis, .aes(x, y),
    color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.2))

  # E-field wave (vertical plane, sine wave)
  t_wave <- seq(-2 * pi, 2 * pi, length.out = 80)
  amplitude_e <- 16 * s
  wave_e <- data.frame(
    x = cx + t_wave / (2 * pi) * 24 * s,
    y = cy + amplitude_e * sin(t_wave)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = wave_e, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.2))

  # B-field wave (rendered as dashed, half-amplitude, phase-shifted 90 degrees)
  # Simulated as smaller amplitude with different alpha
  amplitude_b <- 10 * s
  wave_b <- data.frame(
    x = cx + t_wave / (2 * pi) * 24 * s,
    y = cy + amplitude_b * cos(t_wave)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = wave_b, .aes(x, y),
    color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.8))

  # Direction arrow at right end
  arr <- data.frame(
    x = cx + c(22, 26, 22) * s,
    y = cy + c(3, 0, -3) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = arr, .aes(x, y),
    fill = hex_with_alpha(bright, 0.6), color = "transparent", linewidth = 0)

  layers
}

glyph_motor_coil <- function(cx, cy, s, col, bright) {
  # Stator circle with rotor coils inside
  layers <- list()

  # Outer stator ring
  stator <- data.frame(x0 = cx, y0 = cy, r = 22 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = stator,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.06), color = bright, linewidth = .lw(s, 2.5))

  # Inner rotor circle
  rotor <- data.frame(x0 = cx, y0 = cy, r = 10 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = rotor,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.8))

  # Rotor coil windings (4 arms radiating from center)
  for (angle in c(0, pi / 2, pi, 3 * pi / 2)) {
    arm <- data.frame(
      x = c(cx, cx + 10 * s * cos(angle)),
      y = c(cy, cy + 10 * s * sin(angle))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arm, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 2))
  }

  # Stator pole pieces (4 inward-pointing arcs)
  for (angle in c(pi / 4, 3 * pi / 4, 5 * pi / 4, 7 * pi / 4)) {
    pole <- data.frame(
      x = cx + c(14, 18, 22) * s * cos(angle),
      y = cy + c(14, 18, 22) * s * sin(angle)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pole, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 2.5))
  }

  # Center shaft dot
  shaft <- data.frame(x0 = cx, y0 = cy, r = 2.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = shaft,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.2))

  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Levitation skills (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_maglev_float <- function(cx, cy, s, col, bright) {
  # Object floating above a surface with visible gap
  layers <- list()

  # Ground / track surface
  ground <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy - 14 * s, cy - 14 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ground, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  # Magnetic rails (two lines below ground)
  for (yoff in c(-18, -22)) {
    rail <- data.frame(
      x = c(cx - 18 * s, cx + 18 * s),
      y = c(cy + yoff * s, cy + yoff * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = rail, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5))
  }

  # Floating vehicle body (rounded rectangle above the gap)
  body <- data.frame(
    xmin = cx - 16 * s, xmax = cx + 16 * s,
    ymin = cy - 2 * s, ymax = cy + 14 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = body,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.2))

  # Gap glow (wavy lines between body and track)
  for (i in 1:3) {
    t_glow <- seq(-pi, pi, length.out = 30)
    glow <- data.frame(
      x = cx + t_glow / pi * 14 * s,
      y = cy - (4 + i * 3) * s + 1.5 * s * sin(t_glow * 3 + i)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = glow, .aes(x, y),
      color = hex_with_alpha(bright, 0.3 - i * 0.05), linewidth = .lw(s, 1.2))
  }

  layers
}

glyph_acoustic_node <- function(cx, cy, s, col, bright) {
  # Standing wave between transducer and reflector with trapped particle
  layers <- list()

  # Transducer (top plate)
  tx <- data.frame(
    xmin = cx - 12 * s, xmax = cx + 12 * s,
    ymin = cy + 20 * s, ymax = cy + 24 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = tx,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))

  # Reflector (bottom plate)
  rx <- data.frame(
    xmin = cx - 12 * s, xmax = cx + 12 * s,
    ymin = cy - 24 * s, ymax = cy - 20 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = rx,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))

  # Standing wave pattern (sinusoidal envelope on left and right)
  t_sw <- seq(-20, 20, length.out = 60)
  for (side in c(-1, 1)) {
    sw <- data.frame(
      x = cx + side * (6 + 6 * abs(sin(t_sw * pi / 20))) * s,
      y = cy + t_sw * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sw, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.5))
  }

  # Trapped particle at a node point (center)
  particle <- data.frame(x0 = cx, y0 = cy, r = 4 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = particle,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 2))

  # Additional trapped particles at other nodes
  for (yoff in c(10, -10)) {
    p2 <- data.frame(x0 = cx, y0 = cy + yoff * s, r = 2.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = p2,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = hex_with_alpha(bright, 0.5),
      linewidth = .lw(s, 1.2))
  }

  layers
}

glyph_levitation_compare <- function(cx, cy, s, col, bright) {
  # Decision matrix / comparison table with checkmarks
  layers <- list()

  # Table frame (3 columns × 4 rows)
  table_w <- 22 * s
  table_h <- 22 * s
  frame <- data.frame(
    x = c(cx - table_w, cx + table_w, cx + table_w, cx - table_w, cx - table_w),
    y = c(cy + table_h, cy + table_h, cy - table_h, cy - table_h, cy + table_h)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = frame, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Column dividers
  for (vx in c(-7, 7)) {
    vline <- data.frame(
      x = c(cx + vx * s, cx + vx * s),
      y = c(cy + table_h, cy - table_h)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = vline, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2))
  }

  # Header divider
  hdr <- data.frame(
    x = c(cx - table_w, cx + table_w),
    y = c(cy + 12 * s, cy + 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = hdr, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))

  # Row dividers
  for (ry in c(2, -8)) {
    rline <- data.frame(
      x = c(cx - table_w, cx + table_w),
      y = c(cy + ry * s, cy + ry * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = rline, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1))
  }

  # Checkmarks and crosses in cells (simplified visual)
  # Row 1: check, check, x
  # Row 2: check, x, check
  # Row 3: x, check, check
  col_xs <- c(-14.5, 0, 14.5)
  row_ys <- c(7, -3, -15)
  checks <- list(
    c(TRUE, TRUE, FALSE),
    c(TRUE, FALSE, TRUE),
    c(FALSE, TRUE, TRUE)
  )
  for (r in seq_along(row_ys)) {
    for (c_idx in seq_along(col_xs)) {
      px <- cx + col_xs[c_idx] * s
      py <- cy + row_ys[r] * s
      if (checks[[r]][c_idx]) {
        # Checkmark
        ck <- data.frame(
          x = px + c(-2, 0, 4) * s,
          y = py + c(0, -3, 4) * s
        )
        layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ck, .aes(x, y),
          color = bright, linewidth = .lw(s, 1.8))
      } else {
        # X mark
        x1 <- data.frame(x = px + c(-2, 2) * s, y = py + c(-2, 2) * s)
        x2 <- data.frame(x = px + c(-2, 2) * s, y = py + c(2, -2) * s)
        layers[[length(layers) + 1]] <- ggplot2::geom_path(data = x1, .aes(x, y),
          color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
        layers[[length(layers) + 1]] <- ggplot2::geom_path(data = x2, .aes(x, y),
          color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
      }
    }
  }

  layers
}

# ── gpu-optimization ──────────────────────────────────────────────────

glyph_gpu_bottleneck <- function(cx, cy, s, col, bright) {
  # GPU chip with a narrowing funnel overlay — bottleneck analysis
  layers <- list()

  # GPU die (wide rectangle)
  die <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 12 * s, ymax = cy + 12 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = die,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2))

  # Grid of compute cores (4x3)
  for (row in -1:1) {
    for (col_i in -1:2) {
      core <- data.frame(
        xmin = cx + (col_i * 8 - 12) * s, xmax = cx + (col_i * 8 - 6) * s,
        ymin = cy + (row * 7 - 2) * s,    ymax = cy + (row * 7 + 2) * s
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = core,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(bright, 0.2), color = hex_with_alpha(bright, 0.5),
        linewidth = .lw(s, 0.8))
    }
  }

  # Funnel / bottleneck overlay (converging lines below die)
  funnel <- data.frame(
    x = c(cx - 14 * s, cx - 4 * s, cx + 4 * s, cx + 14 * s),
    y = c(cy - 12 * s, cy - 22 * s, cy - 22 * s, cy - 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = funnel, .aes(x, y),
    fill = hex_with_alpha(col, 0.08), color = hex_with_alpha(bright, 0.6),
    linewidth = .lw(s, 1.5))

  # Exclamation mark in funnel center
  bang_line <- data.frame(
    x = c(cx, cx),
    y = c(cy - 15 * s, cy - 19 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bang_line, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  bang_dot <- data.frame(x0 = cx, y0 = cy - 21 * s, r = 1.2 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = bang_dot,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = bright, color = bright, linewidth = 0)

  layers
}

glyph_gpu_pipeline <- function(cx, cy, s, col, bright) {
  # Double-buffered pipeline: two stacked GPU stages with data flow arrows
  layers <- list()

  # Stage A (top buffer)
  stage_a <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy + 4 * s,  ymax = cy + 16 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = stage_a,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8))

  # Stage B (bottom buffer)
  stage_b <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 16 * s, ymax = cy - 4 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = stage_b,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = hex_with_alpha(bright, 0.6),
    linewidth = .lw(s, 1.8))

  # Compute blocks inside stages
  for (stage_cy in c(cy + 10 * s, cy - 10 * s)) {
    for (offset in c(-10, 0, 10)) {
      bar <- data.frame(
        xmin = cx + (offset - 3) * s, xmax = cx + (offset + 3) * s,
        ymin = stage_cy - 2 * s, ymax = stage_cy + 2 * s
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = bar,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(bright, 0.2), color = "transparent", linewidth = 0)
    }
  }

  # Bidirectional arrows between stages (overlap indicator)
  arrow_down <- data.frame(
    x = c(cx - 6 * s, cx - 6 * s), y = c(cy + 4 * s, cy - 4 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_down, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.5))

  arrow_up <- data.frame(
    x = c(cx + 6 * s, cx + 6 * s), y = c(cy - 4 * s, cy + 4 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_up, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.5))

  # Arrow heads
  ah_down <- data.frame(
    x = cx + c(-8, -6, -4) * s,
    y = cy + c(-1, -4, -1) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ah_down, .aes(x, y),
    fill = hex_with_alpha(bright, 0.7), color = "transparent", linewidth = 0)

  ah_up <- data.frame(
    x = cx + c(4, 6, 8) * s,
    y = cy + c(1, 4, 1) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ah_up, .aes(x, y),
    fill = hex_with_alpha(bright, 0.7), color = "transparent", linewidth = 0)

  layers
}
