# primitives_15.R - Glyph library part 15: tending skill glyphs (5)
# Sourced by build-icons.R and profile-render.R

# ══════════════════════════════════════════════════════════════════════════════
# Tending / esoteric skills (5)
# ══════════════════════════════════════════════════════════════════════════════

glyph_breath_pause <- function(cx, cy, s, col, bright) {
  # Two concentric expanding circles (inhale/exhale) with a tiny dot at center
  outer_ring <- data.frame(x0 = cx, y0 = cy, r = 22 * s)
  inner_ring <- data.frame(x0 = cx, y0 = cy, r = 14 * s)
  center_dot <- data.frame(x0 = cx, y0 = cy, r = 3 * s)

  # Faint expansion ripple (outermost)
  ripple <- data.frame(x0 = cx, y0 = cy, r = 28 * s)

  list(
    ggforce::geom_circle(data = ripple, .aes(x0 = x0, y0 = y0, r = r),
      fill = "transparent", color = hex_with_alpha(col, 0.15), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = outer_ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.06), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = inner_ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.08), color = bright, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = center_dot, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.6), color = bright, linewidth = .lw(s, 1.2))
  )
}

glyph_rest_stillness <- function(cx, cy, s, col, bright) {
  # Empty circle with a single horizontal line -- intentional emptiness
  ring <- data.frame(x0 = cx, y0 = cy, r = 20 * s)
  hline <- data.frame(
    x = c(cx - 10 * s, cx + 10 * s),
    y = c(cy, cy)
  )
  # Faint lower arc (ground / support)
  t_arc <- seq(pi + pi/6, 2 * pi - pi/6, length.out = 25)
  arc <- data.frame(
    x = cx + 26 * s * cos(t_arc),
    y = cy + 26 * s * sin(t_arc)
  )

  list(
    ggplot2::geom_path(data = arc, .aes(x, y),
      color = hex_with_alpha(col, 0.15), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.04), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = hline, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_tuning_fork <- function(cx, cy, s, col, bright) {
  # Two parallel tines vibrating with resonance waves between them
  # Left tine
  tine_l <- data.frame(
    x = c(cx - 6 * s, cx - 6 * s),
    y = c(cy - 10 * s, cy + 22 * s)
  )
  # Right tine
  tine_r <- data.frame(
    x = c(cx + 6 * s, cx + 6 * s),
    y = c(cy - 10 * s, cy + 22 * s)
  )
  # Handle (stem below)
  stem <- data.frame(
    x = c(cx, cx),
    y = c(cy - 10 * s, cy - 24 * s)
  )
  # Junction
  junction <- data.frame(
    x = c(cx - 6 * s, cx, cx + 6 * s),
    y = c(cy - 10 * s, cy - 10 * s, cy - 10 * s)
  )
  # Resonance waves between tines (3 wavy lines)
  layers <- list(
    ggplot2::geom_path(data = stem, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = junction, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = tine_l, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.2)),
    ggplot2::geom_path(data = tine_r, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.2))
  )
  # Vibration arcs (sine curves between tines)
  for (i in 1:3) {
    t_wave <- seq(0, 1, length.out = 20)
    y_pos <- cy + (6 + i * 5) * s
    wave <- data.frame(
      x = cx + 4 * s * sin(t_wave * 2 * pi) * (0.3 + 0.2 * i),
      y = rep(y_pos, 20) + t_wave * 0  # horizontal waves
    )
    # Use small arcs instead
    wave <- data.frame(
      x = cx + seq(-4, 4, length.out = 15) * s * (0.5 + 0.15 * i),
      y = y_pos + sin(seq(0, pi, length.out = 15)) * 2 * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = wave, .aes(x, y),
      color = hex_with_alpha(bright, 0.3 + 0.1 * i), linewidth = .lw(s, 1))
  }
  layers
}

glyph_dream_cloud <- function(cx, cy, s, col, bright) {
  # Soft cloud shape with floating dots/sparks drifting upward
  # Cloud body (overlapping circles)
  cloud_parts <- data.frame(
    x0 = cx + c(-12, -4, 6, 14) * s,
    y0 = cy + c(-4, 4, 6, -2) * s,
    r = c(10, 12, 11, 9) * s
  )
  # Floating sparks above cloud
  set.seed(42)
  n_sparks <- 7
  sparks <- data.frame(
    x0 = cx + runif(n_sparks, -16, 16) * s,
    y0 = cy + runif(n_sparks, 12, 26) * s,
    r = runif(n_sparks, 1.5, 3) * s
  )

  layers <- list()
  # Cloud circles
  for (i in seq_len(nrow(cloud_parts))) {
    layers[[length(layers) + 1]] <- ggforce::geom_circle(
      data = cloud_parts[i, ], .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = hex_with_alpha(bright, 0.4),
      linewidth = .lw(s, 1.5))
  }
  # Sparks
  for (i in seq_len(nrow(sparks))) {
    layers[[length(layers) + 1]] <- ggforce::geom_circle(
      data = sparks[i, ], .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.35), color = bright,
      linewidth = .lw(s, 0.8))
  }
  layers
}

glyph_gratitude_sun <- function(cx, cy, s, col, bright) {
  # Radiating lines from a warm center, like sunrise or recognition glow
  # Central circle (warm core)
  core <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  inner_glow <- data.frame(x0 = cx, y0 = cy, r = 4 * s)

  # 12 radiating lines
  n_rays <- 12
  layers <- list(
    ggforce::geom_circle(data = core, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = inner_glow, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5))
  )
  for (i in seq_len(n_rays)) {
    angle <- (i - 1) * 2 * pi / n_rays
    # Alternating long and short rays
    ray_len <- if (i %% 2 == 0) 22 else 18
    ray <- data.frame(
      x = c(cx + 10 * s * cos(angle), cx + ray_len * s * cos(angle)),
      y = c(cy + 10 * s * sin(angle), cy + ray_len * s * sin(angle))
    )
    alpha_val <- if (i %% 2 == 0) 0.7 else 0.5
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ray, .aes(x, y),
      color = hex_with_alpha(bright, alpha_val), linewidth = .lw(s, 1.5 + (i %% 2) * 0.5))
  }
  layers
}
