# primitives_4.R - Glyph library part 4: Swarm + Morphic domains
# Sourced by build-icons.R

# ── Swarm domain glyphs ────────────────────────────────────────────────────

# ── glyph_swarm_nodes: scattered dots connected by lines from center ─────
glyph_swarm_nodes <- function(cx, cy, s, col, bright) {
  set.seed(99)
  n <- 12
  angles <- seq(0, 2 * pi, length.out = n + 1)[seq_len(n)]
  radii <- 16 * s + runif(n, -4, 8) * s
  nodes_x <- cx + radii * cos(angles)
  nodes_y <- cy + radii * sin(angles)

  layers <- list()
  # connection lines from center to each node

  for (i in seq_len(n)) {
    line <- data.frame(x = c(cx, nodes_x[i]), y = c(cy, nodes_y[i]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1))
  }
  # peer connections (adjacent nodes)
  for (i in seq_len(n)) {
    j <- if (i == n) 1L else i + 1L
    line <- data.frame(x = c(nodes_x[i], nodes_x[j]),
                       y = c(nodes_y[i], nodes_y[j]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 0.8))
  }
  # outer nodes
  for (i in seq_len(n)) {
    df <- data.frame(x0 = nodes_x[i], y0 = nodes_y[i], r = 3 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5))
  }
  # center hub
  hub <- data.frame(x0 = cx, y0 = cy, r = 5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = hub,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  layers
}

# ── glyph_ant_trail: branching path with resource dots ───────────────────
glyph_ant_trail <- function(cx, cy, s, col, bright) {
  # main trail (sinusoidal path)
  t <- seq(0, 1, length.out = 40)
  trail_x <- cx - 28 * s + 56 * s * t
  trail_y <- cy + 6 * s * sin(t * 3 * pi)
  trail <- data.frame(x = trail_x, y = trail_y)

  # branch trail 1 (upward)
  b1_t <- seq(0, 1, length.out = 15)
  b1_x <- cx - 4 * s + 18 * s * b1_t
  b1_y <- cy + 6 * s * sin(0.4 * 3 * pi) + 16 * s * b1_t
  branch1 <- data.frame(x = b1_x, y = b1_y)

  # branch trail 2 (downward)
  b2_t <- seq(0, 1, length.out = 15)
  b2_x <- cx + 10 * s + 14 * s * b2_t
  b2_y <- cy + 6 * s * sin(0.7 * 3 * pi) - 14 * s * b2_t
  branch2 <- data.frame(x = b2_x, y = b2_y)

  # resource dots at trail endpoints
  resources <- data.frame(
    x0 = c(cx + 14 * s, cx + 24 * s, cx + 28 * s),
    y0 = c(cy + 18 * s, cy - 16 * s, cy + trail_y[40] - cy),
    r = c(4, 3.5, 3) * s
  )

  # ant dots along main trail
  ant_idx <- c(5, 12, 20, 28, 35)
  ants <- data.frame(x = trail_x[ant_idx], y = trail_y[ant_idx])

  layers <- list(
    ggplot2::geom_path(data = trail, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = branch1, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = branch2, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_point(data = ants, .aes(x, y), color = bright, size = 3.5 * s)
  )
  for (i in seq_len(nrow(resources))) {
    df <- data.frame(x0 = resources$x0[i], y0 = resources$y0[i], r = resources$r[i])
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_vote_circles: overlapping circles converging ───────────────────
glyph_vote_circles <- function(cx, cy, s, col, bright) {
  layers <- list()
  # three overlapping vote circles
  offsets <- list(c(-10, 8), c(10, 8), c(0, -8))
  radii <- c(16, 16, 16) * s
  for (i in seq_along(offsets)) {
    df <- data.frame(
      x0 = cx + offsets[[i]][1] * s,
      y0 = cy + offsets[[i]][2] * s,
      r = radii[i]
    )
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08 + 0.04 * i), color = bright,
      linewidth = .lw(s, 1.8))
  }
  # convergence point (center of overlap)
  center <- data.frame(x0 = cx, y0 = cy + 2 * s, r = 5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 2.5))
  # arrows pointing inward
  for (i in seq_along(offsets)) {
    ox <- offsets[[i]][1] * s
    oy <- offsets[[i]][2] * s
    arr <- data.frame(
      x = c(cx + ox * 1.4, cx + ox * 0.5),
      y = c(cy + oy * 1.4 + 2 * s, cy + oy * 0.5 + 2 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arr, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
  }
  layers
}

# ── glyph_shield_wall: layered hexagonal barrier with alert marks ────────
glyph_shield_wall <- function(cx, cy, s, col, bright) {
  layers <- list()
  # three hexagonal shields in a row
  hex_r <- 14 * s
  positions <- c(-18, 0, 18) * s
  for (i in seq_along(positions)) {
    t <- seq(0, 2 * pi, length.out = 7)
    hex <- data.frame(
      x = cx + positions[i] + hex_r * cos(t + pi / 6),
      y = cy + hex_r * sin(t + pi / 6)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = hex, .aes(x, y),
      fill = hex_with_alpha(col, 0.08 + 0.06 * i), color = bright,
      linewidth = .lw(s, 1.8))
  }
  # alert marks (exclamation-like lines above)
  for (dx in c(-12, 0, 12) * s) {
    mark <- data.frame(x = c(cx + dx, cx + dx), y = c(cy + 20 * s, cy + 28 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = mark, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
    dot <- data.frame(x0 = cx + dx, y0 = cy + 30 * s, r = 1.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  }
  # ground line
  ground <- data.frame(x = c(cx - 28 * s, cx + 28 * s), y = c(cy - 16 * s, cy - 16 * s))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ground, .aes(x, y),
    color = col, linewidth = .lw(s, 2))
  layers
}

# ── glyph_budding: parent circle spawning smaller circles outward ────────
glyph_budding <- function(cx, cy, s, col, bright) {
  # parent circle
  parent <- data.frame(x0 = cx, y0 = cy, r = 14 * s)
  layers <- list(
    ggforce::geom_circle(data = parent, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2.5))
  )
  # budding children at various stages
  buds <- list(
    list(angle = pi / 4,     dist = 22, r = 8),
    list(angle = 3 * pi / 4, dist = 24, r = 7),
    list(angle = -pi / 3,    dist = 20, r = 9),
    list(angle = -2 * pi / 3, dist = 26, r = 6),
    list(angle = pi,          dist = 28, r = 5)
  )
  for (b in buds) {
    bx <- cx + b$dist * s * cos(b$angle)
    by <- cy + b$dist * s * sin(b$angle)
    # connection line
    line <- data.frame(x = c(cx, bx), y = c(cy, by))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
    # bud circle
    df <- data.frame(x0 = bx, y0 = by, r = b$r * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── Morphic domain glyphs ──────────────────────────────────────────────────

# ── glyph_scan_outline: body outline with diagnostic scan lines ──────────
glyph_scan_outline <- function(cx, cy, s, col, bright) {
  # humanoid outline (simplified torso silhouette)
  outline <- data.frame(
    x = c(cx - 10 * s, cx - 14 * s, cx - 12 * s, cx - 8 * s,
          cx, cx + 8 * s, cx + 12 * s, cx + 14 * s, cx + 10 * s,
          cx + 6 * s, cx - 6 * s),
    y = c(cy + 30 * s, cy + 10 * s, cy - 4 * s, cy - 18 * s,
          cy - 28 * s, cy - 18 * s, cy - 4 * s, cy + 10 * s, cy + 30 * s,
          cy + 30 * s, cy + 30 * s)
  )
  # head circle
  head <- data.frame(x0 = cx, y0 = cy + 34 * s, r = 6 * s)
  # horizontal scan lines
  layers <- list(
    ggplot2::geom_polygon(data = outline, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
  scan_ys <- seq(cy - 20, cy + 24, by = 8) * s
  for (sy in scan_ys) {
    scan <- data.frame(x = c(cx - 18 * s, cx + 18 * s), y = c(sy, sy))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = scan, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1))
  }
  # active scan highlight
  active <- data.frame(x = c(cx - 16 * s, cx + 16 * s), y = c(cy + 8 * s, cy + 8 * s))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = active, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  layers
}

# ── glyph_morph_arrow: shape transitioning from square to circle ─────────
glyph_morph_arrow <- function(cx, cy, s, col, bright) {
  # square on left
  sq <- data.frame(
    xmin = cx - 30 * s, xmax = cx - 14 * s,
    ymin = cy - 8 * s,  ymax = cy + 8 * s
  )
  # arrow in middle
  arr_line <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy, cy))
  arr_head <- data.frame(
    x = c(cx + 6 * s, cx + 12 * s, cx + 6 * s),
    y = c(cy + 4 * s, cy, cy - 4 * s)
  )
  # circle on right
  circ <- data.frame(x0 = cx + 22 * s, y0 = cy, r = 8 * s)
  # transition particles between
  particles <- data.frame(
    x = cx + c(-4, 0, 4, -2, 2) * s,
    y = cy + c(12, -10, 14, -12, 10) * s
  )
  list(
    ggplot2::geom_rect(data = sq,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arr_line, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = arr_head, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = circ, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_point(data = particles, .aes(x, y), color = col, size = 2.5 * s)
  )
}

# ── glyph_dissolve: solid shape fragmenting into particles ───────────────
glyph_dissolve <- function(cx, cy, s, col, bright) {
  # left half: solid rectangle
  solid <- data.frame(
    xmin = cx - 24 * s, xmax = cx - 4 * s,
    ymin = cy - 16 * s, ymax = cy + 16 * s
  )
  # right half: scattered fragments
  set.seed(77)
  n_frag <- 18
  frag_x <- cx + runif(n_frag, 2, 28) * s
  frag_y <- cy + runif(n_frag, -18, 18) * s
  frag_size <- runif(n_frag, 1.5, 4) * s
  frag_alpha <- seq(0.5, 0.1, length.out = n_frag)

  layers <- list(
    ggplot2::geom_rect(data = solid,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2))
  )
  # dissolving edge: partial rectangles
  for (i in 1:4) {
    dx <- cx + (i * 3 - 4) * s
    fdf <- data.frame(
      xmin = dx - 2 * s, xmax = dx + 2 * s,
      ymin = cy - (16 - i * 2) * s, ymax = cy + (16 - i * 2) * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = fdf,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2 - 0.03 * i), color = col,
      linewidth = .lw(s, 1))
  }
  # scattered particles
  for (i in seq_len(n_frag)) {
    df <- data.frame(x0 = frag_x[i], y0 = frag_y[i], r = frag_size[i])
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, frag_alpha[i]),
      color = hex_with_alpha(bright, frag_alpha[i]),
      linewidth = .lw(s, 0.8))
  }
  layers
}

# ── glyph_regenerate: broken ring with regrowth segments ─────────────────
glyph_regenerate <- function(cx, cy, s, col, bright) {
  r <- 24 * s
  # broken ring (gap at top-right)
  t_main <- seq(pi * 0.3, pi * 2.1, length.out = 50)
  ring_main <- data.frame(x = cx + r * cos(t_main), y = cy + r * sin(t_main))

  # regrowth segments filling the gap
  t_grow1 <- seq(pi * 2.1, pi * 2.25, length.out = 10)
  grow1 <- data.frame(x = cx + r * cos(t_grow1), y = cy + r * sin(t_grow1))
  t_grow2 <- seq(pi * 0.15, pi * 0.3, length.out = 10)
  grow2 <- data.frame(x = cx + r * cos(t_grow2), y = cy + r * sin(t_grow2))

  # growth dots (new material forming)
  t_dots <- seq(pi * 2.25, pi * 2.4, length.out = 4)
  dots <- data.frame(x = cx + r * cos(t_dots), y = cy + r * sin(t_dots))

  # inner glow ring
  inner <- data.frame(x0 = cx, y0 = cy, r = 10 * s)

  list(
    ggplot2::geom_path(data = ring_main, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = grow1, .aes(x, y),
      color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = grow2, .aes(x, y),
      color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_point(data = dots, .aes(x, y),
      color = bright, size = 3 * s),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_camo_grid: grid of squares shifting colors/opacity ─────────────
glyph_camo_grid <- function(cx, cy, s, col, bright) {
  layers <- list()
  n <- 5
  cell <- 10 * s
  offset_x <- cx - (n - 1) * cell / 2
  offset_y <- cy - (n - 1) * cell / 2
  set.seed(55)
  for (row in seq_len(n)) {
    for (col_i in seq_len(n)) {
      x <- offset_x + (col_i - 1) * cell
      y <- offset_y + (row - 1) * cell
      # vary alpha across the grid (gradient from solid to transparent)
      alpha <- 0.05 + 0.35 * ((col_i - 1) + (row - 1)) / (2 * (n - 1))
      is_bright <- ((row + col_i) %% 3 == 0)
      fill_col <- if (is_bright) bright else col
      df <- data.frame(
        xmin = x - cell * 0.42, xmax = x + cell * 0.42,
        ymin = y - cell * 0.42, ymax = y + cell * 0.42
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(fill_col, alpha),
        color = hex_with_alpha(bright, 0.3 + alpha * 0.5),
        linewidth = .lw(s, 1))
    }
  }
  layers
}

# ── Jigsawr domain glyphs ────────────────────────────────────────────────

# ── glyph_jigsaw_code: puzzle piece with code brackets ──────────────────
glyph_jigsaw_code <- function(cx, cy, s, col, bright) {
  # Basic jigsaw piece outline (simplified)
  r <- 22 * s
  piece <- data.frame(
    x = cx + r * c(-1, -0.3, -0.3, -0.15, 0, 0.15, 0.3, 0.3, 1, 1, 0.3, 0.3, 0.15, 0, -0.15, -0.3, -0.3, -1, -1),
    y = cy + r * c(1, 1, 0.8, 0.85, 0.7, 0.85, 0.8, 1, 1, -1, -1, -0.8, -0.85, -0.7, -0.85, -0.8, -1, -1, 1)
  )
  # Code brackets < >
  lbracket <- data.frame(
    x = cx + s * c(-2, -8, -2),
    y = cy + s * c(10, 0, -10)
  )
  rbracket <- data.frame(
    x = cx + s * c(2, 8, 2),
    y = cy + s * c(10, 0, -10)
  )
  list(
    ggplot2::geom_polygon(data = piece, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = lbracket, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = rbracket, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  )
}

# ── glyph_jigsaw_plus: puzzle piece with + symbol ──────────────────────
glyph_jigsaw_plus <- function(cx, cy, s, col, bright) {
  r <- 20 * s
  # Simplified puzzle piece
  piece <- data.frame(
    x = cx + r * c(-1, -0.3, -0.3, -0.15, 0, 0.15, 0.3, 0.3, 1, 1, -1, -1),
    y = cy + r * c(1, 1, 0.8, 0.85, 0.7, 0.85, 0.8, 1, 1, -1, -1, 1)
  )
  # Plus symbol
  plus_h <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy - 4 * s, cy - 4 * s))
  plus_v <- data.frame(x = c(cx, cx), y = c(cy - 14 * s, cy + 6 * s))
  list(
    ggplot2::geom_polygon(data = piece, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = plus_h, .aes(x, y),
      color = bright, linewidth = .lw(s, 3.5)),
    ggplot2::geom_path(data = plus_v, .aes(x, y),
      color = bright, linewidth = .lw(s, 3.5))
  )
}

# ── glyph_jigsaw_book: open book with puzzle piece ─────────────────────
glyph_jigsaw_book <- function(cx, cy, s, col, bright) {
  # Open book (two angled rectangles)
  left_page <- data.frame(
    x = cx + s * c(-22, -4, -4, -22),
    y = cy + s * c(-16, -12, 18, 14)
  )
  right_page <- data.frame(
    x = cx + s * c(4, 22, 22, 4),
    y = cy + s * c(-12, -16, 14, 18)
  )
  # Spine line
  spine <- data.frame(x = c(cx, cx), y = c(cy - 12 * s, cy + 18 * s))
  # Small puzzle piece on right page
  pp_cx <- cx + 13 * s
  pp_cy <- cy + 2 * s
  pp_s <- s * 0.5
  piece <- data.frame(
    x = pp_cx + 14 * pp_s * c(-1, 0, 0.15, 0, 0.15, 0.3, 0.3, 1, 1, -1, -1),
    y = pp_cy + 14 * pp_s * c(1, 1, 0.85, 0.7, 0.85, 0.8, 1, 1, -1, -1, 1)
  )
  list(
    ggplot2::geom_polygon(data = left_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = right_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = spine, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = piece, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_jigsaw_check: checkmark over puzzle grid ────────────────────
glyph_jigsaw_check <- function(cx, cy, s, col, bright) {
  # 2x2 grid of small squares (puzzle tiles)
  layers <- list()
  cell <- 12 * s
  for (row in 0:1) {
    for (col_i in 0:1) {
      df <- data.frame(
        xmin = cx + (col_i - 1) * cell, xmax = cx + (col_i - 1) * cell + cell * 0.9,
        ymin = cy + (row - 1) * cell - 4 * s, ymax = cy + (row - 1) * cell + cell * 0.9 - 4 * s
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.2))
    }
  }
  # Checkmark (big, overlaid)
  check <- data.frame(
    x = cx + s * c(-10, -3, 14),
    y = cy + s * c(4, -4, 16)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = check, .aes(x, y),
    color = bright, linewidth = .lw(s, 4))
  layers
}

# ── glyph_jigsaw_stack: layered pieces with validation mark ──────────
glyph_jigsaw_stack <- function(cx, cy, s, col, bright) {
  # Three stacked rectangles (layers) offset slightly
  layers <- list()
  for (i in 3:1) {
    offset <- (i - 2) * 5 * s
    df <- data.frame(
      xmin = cx - 18 * s + offset, xmax = cx + 18 * s + offset,
      ymin = cy - 12 * s + offset, ymax = cy + 4 * s + offset
    )
    alpha <- 0.08 + (4 - i) * 0.06
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, alpha), color = col, linewidth = .lw(s, 1.5))
  }
  # Small checkmark badge in bottom-right
  badge <- data.frame(x0 = cx + 14 * s, y0 = cy - 14 * s, r = 8 * s)
  check <- data.frame(
    x = cx + s * c(10, 14, 20),
    y = cy + s * c(-14, -18, -10)
  )
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = badge,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = check, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))
  layers
}
