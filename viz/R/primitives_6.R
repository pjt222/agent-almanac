# primitives_6.R - Glyph library part 6: AI-evolved skills
#                  Defensive (center, redirect, awareness),
#                  Swarm (forage-solutions, build-coherence, coordinate-reasoning),
#                  Morphic (assess-context)
# Sourced by build-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# Defensive domain AI glyphs (3)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_center_balance: vertical axis + asymmetric 70/30 weight arc ────────
glyph_center_balance <- function(cx, cy, s, col, bright) {
  # Central vertical axis (spine)
  axis <- data.frame(
    x = c(cx, cx),
    y = c(cy - 28 * s, cy + 28 * s)
  )
  # Grounded base (wide horizontal)
  base <- data.frame(
    x = c(cx - 16 * s, cx + 16 * s),
    y = c(cy - 28 * s, cy - 28 * s)
  )
  # Asymmetric weight arcs (70/30 distribution)
  # Left arc (70% - larger, brighter)
  t_l <- seq(pi / 2, 3 * pi / 2, length.out = 25)
  r_l <- 18 * s
  arc_l <- data.frame(
    x = cx + r_l * cos(t_l) * 0.6,
    y = cy + r_l * sin(t_l) * 0.8
  )
  # Right arc (30% - smaller, dimmer)
  t_r <- seq(-pi / 2, pi / 2, length.out = 25)
  r_r <- 10 * s
  arc_r <- data.frame(
    x = cx + r_r * cos(t_r) * 0.6 + 2 * s,
    y = cy + r_r * sin(t_r) * 0.8
  )
  # Center point (one-point / dantian)
  dot <- data.frame(x0 = cx, y0 = cy - 4 * s, r = 4 * s)
  # Top crown marker
  crown <- data.frame(
    x = c(cx - 5 * s, cx, cx + 5 * s),
    y = c(cy + 24 * s, cy + 30 * s, cy + 24 * s)
  )
  list(
    ggplot2::geom_path(data = axis, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = base, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = arc_l, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arc_r, .aes(x, y),
      color = hex_with_alpha(col, 0.45), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = dot, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = crown, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_redirect_spiral: incoming force arrow curving into redirect spiral ──
glyph_redirect_spiral <- function(cx, cy, s, col, bright) {
  # Incoming force arrow (straight, from upper-left)
  arrow_in <- data.frame(
    x = c(cx - 26 * s, cx - 6 * s),
    y = c(cy + 20 * s, cy + 4 * s)
  )
  # Arrow head on incoming
  ah_in <- data.frame(
    x = c(cx - 10 * s, cx - 6 * s, cx - 12 * s),
    y = c(cy + 8 * s, cy + 4 * s, cy + 2 * s)
  )
  # Redirect spiral (Archimedean, curving away)
  t <- seq(0, 2.5 * pi, length.out = 50)
  r_base <- 4 * s
  r_growth <- 3.5 * s
  spiral <- data.frame(
    x = cx + (r_base + r_growth * t) * cos(t + pi),
    y = cy + (r_base + r_growth * t) * sin(t + pi) * 0.7
  )
  # Center pivot point
  pivot <- data.frame(x0 = cx, y0 = cy, r = 3.5 * s)
  # Outgoing energy (fading path from spiral end)
  out_start <- length(spiral$x)
  arrow_out <- data.frame(
    x = c(spiral$x[out_start], spiral$x[out_start] + 8 * s),
    y = c(spiral$y[out_start], spiral$y[out_start] - 6 * s)
  )
  list(
    ggplot2::geom_path(data = arrow_in, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = ah_in, .aes(x, y),
      fill = col, color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = spiral, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = pivot, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arrow_out, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.5))
  )
}

# ── glyph_awareness_eye: open eye with concentric radar rings ────────────────
glyph_awareness_eye <- function(cx, cy, s, col, bright) {
  # Eye outline (upper lid)
  t_up <- seq(0, pi, length.out = 40)
  eye_up <- data.frame(
    x = cx + 26 * s * cos(t_up),
    y = cy + 12 * s * sin(t_up)
  )
  # Eye outline (lower lid)
  t_lo <- seq(pi, 2 * pi, length.out = 40)
  eye_lo <- data.frame(
    x = cx + 26 * s * cos(t_lo),
    y = cy + 12 * s * sin(t_lo)
  )
  # Iris
  iris <- data.frame(x0 = cx, y0 = cy, r = 9 * s)
  # Pupil
  pupil <- data.frame(x0 = cx, y0 = cy, r = 4 * s)
  # Concentric radar rings (awareness field)
  ring1 <- data.frame(x0 = cx, y0 = cy, r = 18 * s)
  ring2 <- data.frame(x0 = cx, y0 = cy, r = 26 * s)
  ring3 <- data.frame(x0 = cx, y0 = cy, r = 34 * s)
  list(
    # Radar rings (outermost first, fading)
    ggforce::geom_circle(data = ring3, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.15), linewidth = .lw(s, 0.8)),
    ggforce::geom_circle(data = ring2, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.25), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = ring1, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 1.2)),
    # Eye shape
    ggplot2::geom_path(data = eye_up, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = eye_lo, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    # Iris and pupil
    ggforce::geom_circle(data = iris, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = pupil, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Swarm domain AI glyphs (3)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_forage_circuit: branching trail paths as circuit traces ────────────
glyph_forage_circuit <- function(cx, cy, s, col, bright) {
  # Central hub
  hub <- data.frame(x0 = cx, y0 = cy, r = 5 * s)
  # Branch trails radiating outward (5 branches, varying brightness)
  layers <- list(
    ggforce::geom_circle(data = hub, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2))
  )
  n_branches <- 5
  angles <- c(-pi/3, -pi/6, pi/12, pi/3, 2*pi/3)
  lengths <- c(24, 20, 26, 22, 18) * s
  brightnesses <- c(0.8, 0.5, 0.9, 0.6, 0.3)

  for (i in seq_len(n_branches)) {
    a <- angles[i]
    l <- lengths[i]
    b <- brightnesses[i]
    # Main trail
    trail <- data.frame(
      x = c(cx, cx + l * cos(a)),
      y = c(cy, cy + l * sin(a))
    )
    # Trail end dot (resource node)
    dot <- data.frame(x0 = cx + l * cos(a), y0 = cy + l * sin(a), r = 3 * s)
    # Sub-branch (fork halfway)
    if (i <= 3) {
      mid_x <- cx + l * 0.5 * cos(a)
      mid_y <- cy + l * 0.5 * sin(a)
      fork_a <- a + pi / 5
      fork <- data.frame(
        x = c(mid_x, mid_x + 10 * s * cos(fork_a)),
        y = c(mid_y, mid_y + 10 * s * sin(fork_a))
      )
      layers <- c(layers, list(
        ggplot2::geom_path(data = fork, .aes(x, y),
          color = hex_with_alpha(col, b * 0.5), linewidth = .lw(s, 1))
      ))
    }
    layers <- c(layers, list(
      ggplot2::geom_path(data = trail, .aes(x, y),
        color = hex_with_alpha(bright, b), linewidth = .lw(s, 1.5 + b)),
      ggforce::geom_circle(data = dot, .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, b * 0.6), color = hex_with_alpha(bright, b),
        linewidth = .lw(s, 1))
    ))
  }
  layers
}

# ── glyph_coherence_converge: multiple paths through hexagonal filter ────────
glyph_coherence_converge <- function(cx, cy, s, col, bright) {
  # Input paths (3 paths entering from left)
  layers <- list()
  y_offsets <- c(-16, 0, 16) * s
  for (i in seq_along(y_offsets)) {
    path_in <- data.frame(
      x = c(cx - 30 * s, cx - 10 * s),
      y = c(cy + y_offsets[i], cy + y_offsets[i] * 0.3)
    )
    alpha_in <- c(0.4, 0.7, 0.5)[i]
    layers <- c(layers, list(
      ggplot2::geom_path(data = path_in, .aes(x, y),
        color = hex_with_alpha(col, alpha_in), linewidth = .lw(s, 1.8))
    ))
  }
  # Central hexagonal filter
  hex_t <- seq(0, 2 * pi, length.out = 7)
  hex_r <- 12 * s
  hex_df <- data.frame(
    x = cx + hex_r * cos(hex_t + pi / 6),
    y = cy + hex_r * sin(hex_t + pi / 6)
  )
  # Inner converge point
  converge <- data.frame(x0 = cx, y0 = cy, r = 3.5 * s)
  # Output path (single, bright, to the right)
  path_out <- data.frame(
    x = c(cx + 10 * s, cx + 30 * s),
    y = c(cy, cy)
  )
  # Output arrow head
  ah <- data.frame(
    x = c(cx + 26 * s, cx + 32 * s, cx + 26 * s),
    y = c(cy + 4 * s, cy, cy - 4 * s)
  )
  layers <- c(layers, list(
    ggplot2::geom_polygon(data = hex_df, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = converge, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = path_out, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = ah, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  ))
  layers
}

# ── glyph_coordinate_web: connected nodes with brightness decay gradient ─────
glyph_coordinate_web <- function(cx, cy, s, col, bright) {
  # Central coordination node
  center_node <- data.frame(x0 = cx, y0 = cy, r = 5 * s)
  # Surrounding nodes (6) at varying distances with decay
  n_nodes <- 6
  angles <- seq(0, 2 * pi, length.out = n_nodes + 1)[1:n_nodes]
  distances <- c(20, 18, 22, 16, 24, 19) * s
  freshness <- c(0.9, 0.7, 0.5, 0.8, 0.3, 0.6)  # brightness = freshness

  layers <- list(
    ggforce::geom_circle(data = center_node, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2.5))
  )

  for (i in seq_len(n_nodes)) {
    nx <- cx + distances[i] * cos(angles[i])
    ny <- cy + distances[i] * sin(angles[i])
    f <- freshness[i]
    # Connection line (brightness = freshness)
    conn <- data.frame(x = c(cx, nx), y = c(cy, ny))
    # Node dot
    node <- data.frame(x0 = nx, y0 = ny, r = 3 * s)
    layers <- c(layers, list(
      ggplot2::geom_path(data = conn, .aes(x, y),
        color = hex_with_alpha(bright, f * 0.6), linewidth = .lw(s, 0.8 + f)),
      ggforce::geom_circle(data = node, .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, f * 0.5), color = hex_with_alpha(bright, f),
        linewidth = .lw(s, 1.2))
    ))
  }
  # Add a few cross-connections between adjacent nodes for web effect
  for (i in c(1, 3, 5)) {
    j <- i + 1
    n1x <- cx + distances[i] * cos(angles[i])
    n1y <- cy + distances[i] * sin(angles[i])
    n2x <- cx + distances[j] * cos(angles[j])
    n2y <- cy + distances[j] * sin(angles[j])
    cross <- data.frame(x = c(n1x, n2x), y = c(n1y, n2y))
    avg_f <- (freshness[i] + freshness[j]) / 2
    layers <- c(layers, list(
      ggplot2::geom_path(data = cross, .aes(x, y),
        color = hex_with_alpha(col, avg_f * 0.4), linewidth = .lw(s, 0.7))
    ))
  }
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Morphic domain AI glyph (1)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_assess_context_lens: scanning lens over layered structure ───────────
glyph_assess_context_lens <- function(cx, cy, s, col, bright) {
  # Layered structure (3 horizontal bands representing context layers)
  layers_list <- list()
  band_ys <- c(-18, -6, 6) * s
  band_widths <- c(36, 30, 24) * s
  band_alphas <- c(0.15, 0.2, 0.25)
  for (i in seq_along(band_ys)) {
    band <- data.frame(
      xmin = cx - band_widths[i] / 2,
      xmax = cx + band_widths[i] / 2,
      ymin = cy + band_ys[i] - 4 * s,
      ymax = cy + band_ys[i] + 4 * s
    )
    layers_list <- c(layers_list, list(
      ggplot2::geom_rect(data = band,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, band_alphas[i]),
        color = hex_with_alpha(col, band_alphas[i] + 0.15),
        linewidth = .lw(s, 1))
    ))
  }
  # Scanning lens (circle with crosshair, positioned off-center for movement)
  lens_cx <- cx + 6 * s
  lens_cy <- cy + 2 * s
  lens_r <- 14 * s
  lens <- data.frame(x0 = lens_cx, y0 = lens_cy, r = lens_r)
  # Crosshair lines
  cross_h <- data.frame(
    x = c(lens_cx - lens_r * 0.7, lens_cx + lens_r * 0.7),
    y = c(lens_cy, lens_cy)
  )
  cross_v <- data.frame(
    x = c(lens_cx, lens_cx),
    y = c(lens_cy - lens_r * 0.7, lens_cy + lens_r * 0.7)
  )
  # Lens handle (line extending down-right)
  handle <- data.frame(
    x = c(lens_cx + lens_r * 0.65, lens_cx + lens_r * 0.65 + 10 * s),
    y = c(lens_cy - lens_r * 0.65, lens_cy - lens_r * 0.65 - 10 * s)
  )
  layers_list <- c(layers_list, list(
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.08), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = cross_h, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = cross_v, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  ))
  layers_list
}

# ── glyph_unleash_starburst: agents radiating outward from central burst ─────
glyph_unleash_starburst <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Central burst ring
  burst <- data.frame(x0 = cx, y0 = cy, r = 6 * s)
  layers <- c(layers, list(
    ggforce::geom_circle(data = burst, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 2.5))
  ))
  # Radiating agent dots in 3 concentric waves (inner, mid, outer)
  wave_configs <- list(
    list(n = 5,  r = 14, dot_r = 3.0, alpha = 0.9, offset = 0),         # wave 1
    list(n = 7,  r = 22, dot_r = 2.5, alpha = 0.65, offset = pi / 7),   # wave 2
    list(n = 9,  r = 30, dot_r = 2.0, alpha = 0.4, offset = pi / 9)     # wave 3
  )
  for (w in wave_configs) {
    angles <- seq(0, 2 * pi, length.out = w$n + 1)[seq_len(w$n)] + w$offset
    for (a in angles) {
      dot_x <- cx + w$r * s * cos(a)
      dot_y <- cy + w$r * s * sin(a)
      # Trail from center to dot
      trail <- data.frame(x = c(cx, dot_x), y = c(cy, dot_y))
      dot <- data.frame(x0 = dot_x, y0 = dot_y, r = w$dot_r * s)
      layers <- c(layers, list(
        ggplot2::geom_path(data = trail, .aes(x, y),
          color = hex_with_alpha(col, w$alpha * 0.4), linewidth = .lw(s, 0.8)),
        ggforce::geom_circle(data = dot, .aes(x0 = x0, y0 = y0, r = r),
          fill = hex_with_alpha(bright, w$alpha * 0.6),
          color = hex_with_alpha(bright, w$alpha),
          linewidth = .lw(s, 1))
      ))
    }
  }
  layers
}
