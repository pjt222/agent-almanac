# primitives_13.R - Glyph library part 13: citations, linguistics, + missing skills (11)
# Sourced by build-icons.R and build-team-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# Citations (3) — NEW domain
# ══════════════════════════════════════════════════════════════════════════════

glyph_citation_format <- function(cx, cy, s, col, bright) {
  # Large quotation marks with numbered reference bracket
  # Left quote
  lq1 <- data.frame(x0 = cx - 14 * s, y0 = cy + 14 * s, r = 5 * s)
  lq2 <- data.frame(x0 = cx - 4 * s, y0 = cy + 14 * s, r = 5 * s)
  # Right quote
  rq1 <- data.frame(x0 = cx + 4 * s, y0 = cy + 14 * s, r = 5 * s)
  rq2 <- data.frame(x0 = cx + 14 * s, y0 = cy + 14 * s, r = 5 * s)
  # Reference bracket [1]
  brk <- data.frame(
    x = cx + c(-8, -8, 8, 8) * s,
    y = cy + c(-4, -14, -14, -4) * s
  )
  # Number "1" inside bracket
  num_line <- data.frame(x = c(cx, cx), y = c(cy - 6 * s, cy - 12 * s))
  list(
    ggforce::geom_circle(data = lq1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = lq2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = rq1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = rq2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = brk, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = num_line, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_bibliography <- function(cx, cy, s, col, bright) {
  # Stack of 3 books with list lines
  layers <- list()
  # Book stack (3 stacked rectangles)
  for (i in 0:2) {
    y_off <- (i - 1) * 10 * s
    book <- data.frame(
      xmin = cx - 18 * s, xmax = cx - 2 * s,
      ymin = cy + y_off - 3 * s, ymax = cy + y_off + 3 * s
    )
    alpha <- 0.1 + i * 0.05
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = book,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, alpha), color = bright, linewidth = .lw(s, 1.5))
  }
  # Bibliography list lines on the right
  for (i in 0:3) {
    y_pos <- cy + (8 - i * 6) * s
    line <- data.frame(
      x = c(cx + 4 * s, cx + 20 * s),
      y = c(y_pos, y_pos)
    )
    bullet <- data.frame(x = cx + 2 * s, y = y_pos)
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
    layers[[length(layers) + 1]] <- ggplot2::geom_point(data = bullet, .aes(x, y),
      color = bright, size = 2.5 * s)
  }
  layers
}

glyph_ref_validate <- function(cx, cy, s, col, bright) {
  # Checkmark over reference brackets [ref]
  # Bracket pair
  lbrk <- data.frame(
    x = c(cx - 16 * s, cx - 20 * s, cx - 20 * s, cx - 16 * s),
    y = c(cy + 8 * s, cy + 8 * s, cy - 12 * s, cy - 12 * s)
  )
  rbrk <- data.frame(
    x = c(cx + 16 * s, cx + 20 * s, cx + 20 * s, cx + 16 * s),
    y = c(cy + 8 * s, cy + 8 * s, cy - 12 * s, cy - 12 * s)
  )
  # Text lines inside brackets
  line1 <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy + 2 * s, cy + 2 * s))
  line2 <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy - 6 * s, cy - 6 * s))
  # Checkmark above
  check <- data.frame(
    x = cx + c(-6, -2, 8) * s,
    y = cy + c(16, 12, 22) * s
  )
  list(
    ggplot2::geom_path(data = lbrk, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = rbrk, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = line1, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = line2, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = check, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Linguistics (1) — NEW domain
# ══════════════════════════════════════════════════════════════════════════════

glyph_etymology_tree <- function(cx, cy, s, col, bright) {
  # Tree trunk with branching word-root lines
  trunk <- data.frame(x = c(cx, cx), y = c(cy - 20 * s, cy + 2 * s))
  # Root lines below
  root_l <- data.frame(x = c(cx, cx - 14 * s), y = c(cy - 20 * s, cy - 26 * s))
  root_r <- data.frame(x = c(cx, cx + 14 * s), y = c(cy - 20 * s, cy - 26 * s))
  # Branch lines above
  br_l <- data.frame(x = c(cx, cx - 16 * s), y = c(cy + 2 * s, cy + 14 * s))
  br_r <- data.frame(x = c(cx, cx + 16 * s), y = c(cy + 2 * s, cy + 14 * s))
  br_m <- data.frame(x = c(cx, cx), y = c(cy + 2 * s, cy + 18 * s))
  # Leaf nodes (word descendants)
  nodes <- data.frame(
    x0 = cx + c(-16, 0, 16) * s,
    y0 = cy + c(14, 18, 14) * s,
    r = rep(4 * s, 3)
  )
  list(
    ggplot2::geom_path(data = trunk, .aes(x, y),
      color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = root_l, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = root_r, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = br_l, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = br_r, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = br_m, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = nodes, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Diffusion missing (1)
# ══════════════════════════════════════════════════════════════════════════════

glyph_gen_diffusion <- function(cx, cy, s, col, bright) {
  # Neural network nodes with noise-to-image arrow
  # Noise cloud (left side - scattered dots)
  set.seed(42)
  noise <- data.frame(
    x = cx + runif(8, -22, -8) * s,
    y = cy + runif(8, -12, 12) * s
  )
  # Arrow from noise to output
  arrow_line <- data.frame(x = c(cx - 6 * s, cx + 6 * s), y = c(cy, cy))
  # Output grid (right side - clean image representation)
  grid_pts <- expand.grid(
    gx = cx + c(12, 18, 24) * s,
    gy = cy + c(-6, 0, 6) * s
  )
  grid_df <- data.frame(x0 = grid_pts$gx, y0 = grid_pts$gy, r = rep(2.5 * s, 9))
  list(
    ggplot2::geom_point(data = noise, .aes(x, y),
      color = hex_with_alpha(col, 0.5), size = 3 * s),
    ggplot2::geom_path(data = arrow_line, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(4 * s, "pt"), type = "closed")),
    ggforce::geom_circle(data = grid_df, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Esoteric missing (1)
# ══════════════════════════════════════════════════════════════════════════════

glyph_argument_scale <- function(cx, cy, s, col, bright) {
  # Balanced scale with thesis/antithesis pans
  # Fulcrum triangle
  fulcrum <- data.frame(
    x = cx + c(-6, 0, 6) * s,
    y = cy + c(-18, -12, -18) * s
  )
  # Beam
  beam <- data.frame(x = c(cx - 22 * s, cx + 22 * s), y = c(cy, cy))
  # Central post
  post <- data.frame(x = c(cx, cx), y = c(cy - 12 * s, cy))
  # Left pan (thesis)
  l_pan <- data.frame(
    x = cx + c(-26, -18) * s,
    y = c(cy - 2 * s, cy - 2 * s)
  )
  l_chain_l <- data.frame(x = c(cx - 22 * s, cx - 26 * s), y = c(cy, cy - 2 * s))
  l_chain_r <- data.frame(x = c(cx - 22 * s, cx - 18 * s), y = c(cy, cy - 2 * s))
  # Right pan (antithesis)
  r_pan <- data.frame(
    x = cx + c(18, 26) * s,
    y = c(cy - 2 * s, cy - 2 * s)
  )
  r_chain_l <- data.frame(x = c(cx + 22 * s, cx + 18 * s), y = c(cy, cy - 2 * s))
  r_chain_r <- data.frame(x = c(cx + 22 * s, cx + 26 * s), y = c(cy, cy - 2 * s))
  # Thesis/antithesis markers
  t_mark <- data.frame(x0 = cx - 22 * s, y0 = cy + 10 * s, r = 6 * s)
  a_mark <- data.frame(x0 = cx + 22 * s, y0 = cy + 10 * s, r = 6 * s)
  list(
    ggplot2::geom_polygon(data = fulcrum, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = post, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = beam, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = l_pan, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = l_chain_l, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = l_chain_r, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = r_pan, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = r_chain_l, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = r_chain_r, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = t_mark, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = a_mark, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# General missing (5)
# ══════════════════════════════════════════════════════════════════════════════

glyph_agent_create <- function(cx, cy, s, col, bright) {
  # Person silhouette with plus sign
  # Head
  head <- data.frame(x0 = cx - 4 * s, y0 = cy + 12 * s, r = 8 * s)
  # Body (simple trapezoid)
  body <- data.frame(
    x = cx + c(-14, -8, 4, 10) * s - 4 * s,
    y = cy + c(-14, 2, 2, -14) * s
  )
  # Plus sign (right side)
  plus_h <- data.frame(x = c(cx + 14 * s, cx + 26 * s), y = c(cy + 6 * s, cy + 6 * s))
  plus_v <- data.frame(x = c(cx + 20 * s, cx + 20 * s), y = c(cy, cy + 12 * s))
  list(
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = body, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = plus_h, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = plus_v, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  )
}

glyph_team_create <- function(cx, cy, s, col, bright) {
  # Group of 3 figures with plus sign
  layers <- list()
  # Three figure heads in a row
  offsets <- c(-14, 0, 14)
  for (i in seq_along(offsets)) {
    hd <- data.frame(x0 = cx + offsets[i] * s, y0 = cy + 10 * s, r = 5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = hd,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12 + i * 0.04), color = col, linewidth = .lw(s, 1.5))
  }
  # Shared body arc
  arc_t <- seq(pi, 2 * pi, length.out = 20)
  arc_r <- 20 * s
  arc <- data.frame(
    x = cx + arc_r * cos(arc_t),
    y = cy + 2 * s + arc_r * 0.4 * sin(arc_t)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
    color = col, linewidth = .lw(s, 2))
  # Plus sign
  plus_h <- data.frame(x = c(cx + 16 * s, cx + 26 * s), y = c(cy - 10 * s, cy - 10 * s))
  plus_v <- data.frame(x = c(cx + 21 * s, cx + 21 * s), y = c(cy - 15 * s, cy - 5 * s))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = plus_h, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = plus_v, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))
  layers
}

glyph_agent_evolve <- function(cx, cy, s, col, bright) {
  # Person silhouette with upward DNA helix
  # Head
  head <- data.frame(x0 = cx - 6 * s, y0 = cy + 10 * s, r = 7 * s)
  # Body
  body <- data.frame(
    x = cx + c(-14, -9, 1, 6) * s - 3 * s,
    y = cy + c(-10, 1, 1, -10) * s
  )
  # DNA helix (right side, vertical)
  t_dna <- seq(-pi, pi, length.out = 20)
  helix_1 <- data.frame(
    x = cx + 16 * s + 5 * s * sin(t_dna),
    y = cy + 16 * s * (t_dna / pi)
  )
  helix_2 <- data.frame(
    x = cx + 16 * s - 5 * s * sin(t_dna),
    y = cy + 16 * s * (t_dna / pi)
  )
  # Upward arrow tip
  arrow_tip <- data.frame(
    x = cx + c(12, 16, 20) * s,
    y = cy + c(14, 20, 14) * s
  )
  list(
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = body, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = helix_1, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = helix_2, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arrow_tip, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_team_evolve <- function(cx, cy, s, col, bright) {
  # Group with upward arrow
  layers <- list()
  # Three figure heads
  offsets <- c(-12, 0, 12)
  for (off in offsets) {
    hd <- data.frame(x0 = cx + off * s, y0 = cy + 4 * s, r = 5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = hd,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5))
  }
  # Shared body arc
  arc_t <- seq(pi, 2 * pi, length.out = 20)
  arc <- data.frame(
    x = cx + 18 * s * cos(arc_t),
    y = cy - 3 * s + 8 * s * sin(arc_t)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
    color = col, linewidth = .lw(s, 1.5))
  # Large upward arrow
  arrow_shaft <- data.frame(x = c(cx, cx), y = c(cy - 14 * s, cy + 18 * s))
  arrow_head <- data.frame(
    x = cx + c(-8, 0, 8) * s,
    y = cy + c(14, 22, 14) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_shaft, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
    fill = bright, color = bright, linewidth = .lw(s, 1))
  layers
}

glyph_fail_early <- function(cx, cy, s, col, bright) {
  # Stop sign / early-exit gate
  # Octagonal stop sign shape
  t <- seq(0, 2 * pi, length.out = 9)
  r <- 18 * s
  octagon <- data.frame(
    x = cx + r * cos(t + pi / 8),
    y = cy + r * sin(t + pi / 8)
  )
  # X mark inside
  x1 <- data.frame(x = c(cx - 8 * s, cx + 8 * s), y = c(cy + 8 * s, cy - 8 * s))
  x2 <- data.frame(x = c(cx - 8 * s, cx + 8 * s), y = c(cy - 8 * s, cy + 8 * s))
  # Exit arrow pointing right (out of the gate)
  arrow_line <- data.frame(
    x = c(cx + 14 * s, cx + 28 * s),
    y = c(cy - 14 * s, cy - 14 * s)
  )
  list(
    ggplot2::geom_polygon(data = octagon, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = x1, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = x2, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = arrow_line, .aes(x, y),
      color = col, linewidth = .lw(s, 2),
      arrow = ggplot2::arrow(length = ggplot2::unit(4 * s, "pt"), type = "closed"))
  )
}
