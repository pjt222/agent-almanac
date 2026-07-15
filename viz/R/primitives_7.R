# primitives_7.R - Glyph library part 7: Gardening (5) + general (1) + esoteric meta-cognitive (9)
# Sourced by build-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# Gardening domain glyphs (5) + general domain additions (1)
# ══════════════════════════════════════════════════════════════════════════════

# ══════════════════════════════════════════════════════════════════════════════
# General domain additions
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_memory_file: document index with linked topic files ────────────────
glyph_memory_file <- function(cx, cy, s, col, bright) {
  # Main document (MEMORY.md) — larger rectangle with folded corner
  doc <- data.frame(
    xmin = cx - 16 * s, xmax = cx + 16 * s,
    ymin = cy - 24 * s, ymax = cy + 24 * s
  )
  # Folded corner triangle (top-right)
  fold <- data.frame(
    x = c(cx + 8 * s, cx + 16 * s, cx + 16 * s),
    y = c(cy + 24 * s, cy + 24 * s, cy + 16 * s)
  )
  # Index lines (short dashes representing concise entries)
  lines <- list()
  y_positions <- c(16, 10, 4, -2, -8)
  line_widths <- c(20, 16, 18, 14, 20) # varying lengths
  for (i in seq_along(y_positions)) {
    ln <- data.frame(
      x = c(cx - 10 * s, cx - 10 * s + line_widths[i] * s),
      y = rep(cy + y_positions[i] * s, 2)
    )
    alpha <- if (i <= 2) 0.7 else 0.4
    lines[[i]] <- ggplot2::geom_path(data = ln, .aes(x, y),
      color = hex_with_alpha(bright, alpha), linewidth = .lw(s, 1.8))
  }
  # Link arrow (bottom-right, pointing to topic file)
  arrow_shaft <- data.frame(
    x = c(cx + 4 * s, cx + 14 * s),
    y = c(cy - 16 * s, cy - 22 * s)
  )
  arrow_head <- data.frame(
    x = c(cx + 10 * s, cx + 14 * s, cx + 12 * s),
    y = c(cy - 18 * s, cy - 22 * s, cy - 24 * s)
  )
  # Small linked file (topic file, offset bottom-right)
  topic <- data.frame(
    xmin = cx + 10 * s, xmax = cx + 24 * s,
    ymin = cy - 28 * s, ymax = cy - 16 * s
  )
  # Topic file content lines
  tl1 <- data.frame(
    x = c(cx + 13 * s, cx + 21 * s),
    y = rep(cy - 19 * s, 2)
  )
  tl2 <- data.frame(
    x = c(cx + 13 * s, cx + 19 * s),
    y = rep(cy - 23 * s, 2)
  )
  c(
    list(
      # Main document
      ggplot2::geom_rect(data = doc,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
      # Folded corner
      ggplot2::geom_polygon(data = fold, .aes(x, y),
        fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.2)),
      # Link arrow
      ggplot2::geom_path(data = arrow_shaft, .aes(x, y),
        color = col, linewidth = .lw(s, 1.5)),
      ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
        fill = col, color = col, linewidth = .lw(s, 0.5)),
      # Topic file
      ggplot2::geom_rect(data = topic,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
      ggplot2::geom_path(data = tl1, .aes(x, y),
        color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.2)),
      ggplot2::geom_path(data = tl2, .aes(x, y),
        color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.2))
    ),
    lines
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Gardening domain glyphs (5)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_bonsai_tree: stylized bonsai silhouette in pot ──────────────────────
glyph_bonsai_tree <- function(cx, cy, s, col, bright) {
  # Pot / base rectangle
  pot <- data.frame(
    xmin = cx - 10 * s, xmax = cx + 10 * s,
    ymin = cy - 26 * s, ymax = cy - 16 * s
  )
  pot_rim <- data.frame(
    xmin = cx - 13 * s, xmax = cx + 13 * s,
    ymin = cy - 16 * s, ymax = cy - 13 * s
  )
  # Trunk (vertical with slight curve via path)
  trunk <- data.frame(
    x = c(cx, cx - 1 * s, cx + 1 * s, cx),
    y = c(cy - 13 * s, cy - 4 * s, cy + 4 * s, cy + 8 * s)
  )
  # Canopy: 3 overlapping circles forming rounded crown
  canopy1 <- data.frame(x0 = cx - 8 * s, y0 = cy + 12 * s, r = 10 * s)
  canopy2 <- data.frame(x0 = cx + 8 * s, y0 = cy + 12 * s, r = 10 * s)
  canopy3 <- data.frame(x0 = cx, y0 = cy + 18 * s, r = 11 * s)
  # Left branch
  branch_l <- data.frame(
    x = c(cx - 1 * s, cx - 12 * s),
    y = c(cy + 2 * s, cy + 10 * s)
  )
  # Right branch
  branch_r <- data.frame(
    x = c(cx + 1 * s, cx + 10 * s),
    y = c(cy + 5 * s, cy + 12 * s)
  )
  list(
    ggplot2::geom_rect(data = pot,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = pot_rim,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = trunk, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = branch_l, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = branch_r, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = canopy1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = canopy2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = canopy3, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_pruning_shears: bypass secateurs in profile ─────────────────────────
glyph_pruning_shears <- function(cx, cy, s, col, bright) {
  # Left blade (arc)
  t_l <- seq(pi / 6, pi * 0.7, length.out = 25)
  blade_l <- data.frame(
    x = cx - 4 * s + 22 * s * cos(t_l),
    y = cy + 6 * s + 18 * s * sin(t_l)
  )
  # Right blade (arc, mirrored)
  t_r <- seq(pi * 0.3, pi * 5 / 6, length.out = 25)
  blade_r <- data.frame(
    x = cx + 4 * s - 22 * s * cos(t_r),
    y = cy + 6 * s + 18 * s * sin(t_r)
  )
  # Pivot circle
  pivot <- data.frame(x0 = cx, y0 = cy + 6 * s, r = 4 * s)
  # Left handle
  handle_l <- data.frame(
    x = c(cx - 3 * s, cx - 14 * s),
    y = c(cy + 2 * s, cy - 24 * s)
  )
  # Right handle
  handle_r <- data.frame(
    x = c(cx + 3 * s, cx + 10 * s),
    y = c(cy + 2 * s, cy - 24 * s)
  )
  # Grip bumps on handles
  grip_l <- data.frame(
    x = cx + c(-7, -9, -11) * s,
    y = cy + c(-8, -14, -20) * s
  )
  grip_r <- data.frame(
    x = cx + c(5, 7, 9) * s,
    y = cy + c(-8, -14, -20) * s
  )
  list(
    ggplot2::geom_path(data = blade_l, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = blade_r, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = pivot, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = handle_l, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = handle_r, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_point(data = grip_l, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), size = 2.5 * s),
    ggplot2::geom_point(data = grip_r, .aes(x, y),
      color = hex_with_alpha(col, 0.5), size = 2.5 * s)
  )
}

# ── glyph_moon_calendar: crescent moon over calendar grid ─────────────────────
glyph_moon_calendar <- function(cx, cy, s, col, bright) {
  # Crescent moon (two overlapping circles)
  moon_outer <- data.frame(x0 = cx, y0 = cy + 16 * s, r = 12 * s)
  # Inner circle offset to create crescent
  moon_inner <- data.frame(x0 = cx + 6 * s, y0 = cy + 18 * s, r = 10 * s)
  # Calendar grid below (3x4 grid of small squares)
  layers <- list(
    # Moon (outer filled, then inner cuts out)
    ggforce::geom_circle(data = moon_outer, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = moon_inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha("#000000", 0.85), color = NA)
  )
  # Calendar frame
  cal_frame <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 26 * s, ymax = cy + 2 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = cal_frame,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.5))
  # Grid cells (4 rows x 3 cols)
  cell_w <- 10 * s; cell_h <- 6 * s
  for (row in 0:3) {
    for (col_i in 0:2) {
      cell <- data.frame(
        xmin = cx - 16 * s + col_i * (cell_w + 2 * s),
        xmax = cx - 16 * s + col_i * (cell_w + 2 * s) + cell_w,
        ymin = cy - 24 * s + row * (cell_h + 1 * s),
        ymax = cy - 24 * s + row * (cell_h + 1 * s) + cell_h
      )
      alpha <- if (row == 1 && col_i == 1) 0.35 else 0.12
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = cell,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, alpha),
        color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 0.6))
    }
  }
  layers
}

# ── glyph_soil_layers: soil horizon cross-section with roots ──────────────────
glyph_soil_layers <- function(cx, cy, s, col, bright) {
  # Three horizontal bands with wavy top edges
  # Top layer (topsoil) - darkest, most organic
  t_wave <- seq(-1, 1, length.out = 30)
  wave_x <- cx + t_wave * 24 * s

  # Topsoil band (top)
  top_wave_y <- cy + 10 * s + 3 * s * sin(t_wave * pi * 2)
  top_poly <- data.frame(
    x = c(wave_x, rev(wave_x)),
    y = c(top_wave_y, rep(cy + 28 * s, length(wave_x)))
  )
  # Subsoil band (middle)
  mid_wave_y <- cy - 6 * s + 2 * s * sin(t_wave * pi * 1.5 + 1)
  mid_poly <- data.frame(
    x = c(wave_x, rev(wave_x)),
    y = c(mid_wave_y, rev(top_wave_y))
  )
  # Bedrock band (bottom)
  bed_poly <- data.frame(
    x = c(wave_x, rev(wave_x)),
    y = c(rep(cy - 28 * s, length(wave_x)), rev(mid_wave_y))
  )
  # Root filaments in top layer
  root1 <- data.frame(
    x = c(cx - 4 * s, cx - 6 * s, cx - 2 * s, cx - 8 * s),
    y = c(cy + 26 * s, cy + 20 * s, cy + 16 * s, cy + 12 * s)
  )
  root2 <- data.frame(
    x = c(cx + 6 * s, cx + 4 * s, cx + 8 * s, cx + 3 * s),
    y = c(cy + 26 * s, cy + 22 * s, cy + 18 * s, cy + 14 * s)
  )
  root3 <- data.frame(
    x = c(cx, cx + 2 * s, cx - 2 * s),
    y = c(cy + 26 * s, cy + 18 * s, cy + 12 * s)
  )
  list(
    ggplot2::geom_polygon(data = bed_poly, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = NA),
    ggplot2::geom_polygon(data = mid_poly, .aes(x, y),
      fill = hex_with_alpha(col, 0.18), color = NA),
    ggplot2::geom_polygon(data = top_poly, .aes(x, y),
      fill = hex_with_alpha(col, 0.28), color = NA),
    # Wavy boundary lines
    ggplot2::geom_path(
      data = data.frame(x = wave_x, y = top_wave_y), .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(
      data = data.frame(x = wave_x, y = mid_wave_y), .aes(x, y),
      color = col, linewidth = .lw(s, 1.2)),
    # Roots
    ggplot2::geom_path(data = root1, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = root2, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = root3, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.3))
  )
}

# ── glyph_garden_eye: eye merged with leaf (observation) ──────────────────────
glyph_garden_eye <- function(cx, cy, s, col, bright) {
  # Almond eye outline (upper lid)
  t_up <- seq(0, pi, length.out = 40)
  eye_up <- data.frame(
    x = cx + 26 * s * cos(t_up),
    y = cy + 10 * s * sin(t_up)
  )
  # Lower lid
  t_lo <- seq(pi, 2 * pi, length.out = 40)
  eye_lo <- data.frame(
    x = cx + 26 * s * cos(t_lo),
    y = cy + 10 * s * sin(t_lo)
  )
  # Iris circle
  iris <- data.frame(x0 = cx, y0 = cy, r = 9 * s)
  # Pupil
  pupil <- data.frame(x0 = cx, y0 = cy, r = 4 * s)
  # Leaf veins radiating from iris (6 veins)
  layers <- list(
    # Eye shape
    ggplot2::geom_path(data = eye_up, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = eye_lo, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    # Iris
    ggforce::geom_circle(data = iris, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    # Pupil
    ggforce::geom_circle(data = pupil, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5))
  )
  # Leaf veins radiating from pupil center outward through iris
  n_veins <- 6
  for (i in seq_len(n_veins)) {
    angle <- (i - 1) * pi / 3 + pi / 6
    vein_r <- 14 * s
    vein <- data.frame(
      x = c(cx + 4 * s * cos(angle), cx + vein_r * cos(angle)),
      y = c(cy + 4 * s * sin(angle), cy + vein_r * sin(angle))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = vein, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1))
  }
  # Central midrib (vertical through eye)
  midrib <- data.frame(
    x = c(cx, cx),
    y = c(cy - 12 * s, cy + 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = midrib, .aes(x, y),
    color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 0.8))
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Esoteric domain meta-cognitive glyphs (9)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_open_book: open book with emerging knowledge path ────────────────
glyph_open_book <- function(cx, cy, s, col, bright) {
  # Spine (vertical center line)
  spine <- data.frame(
    x = c(cx, cx),
    y = c(cy - 20 * s, cy + 4 * s)
  )
  # Left page (polygon fanning outward)
  left_page <- data.frame(
    x = c(cx, cx - 22 * s, cx - 20 * s, cx),
    y = c(cy + 4 * s, cy + 2 * s, cy - 20 * s, cy - 20 * s)
  )
  # Right page
  right_page <- data.frame(
    x = c(cx, cx + 22 * s, cx + 20 * s, cx),
    y = c(cy + 4 * s, cy + 2 * s, cy - 20 * s, cy - 20 * s)
  )
  # Text lines on left page
  ll1 <- data.frame(x = c(cx - 18 * s, cx - 4 * s), y = rep(cy - 4 * s, 2))
  ll2 <- data.frame(x = c(cx - 16 * s, cx - 4 * s), y = rep(cy - 9 * s, 2))
  ll3 <- data.frame(x = c(cx - 14 * s, cx - 4 * s), y = rep(cy - 14 * s, 2))
  # Text lines on right page
  rl1 <- data.frame(x = c(cx + 4 * s, cx + 18 * s), y = rep(cy - 4 * s, 2))
  rl2 <- data.frame(x = c(cx + 4 * s, cx + 16 * s), y = rep(cy - 9 * s, 2))
  rl3 <- data.frame(x = c(cx + 4 * s, cx + 14 * s), y = rep(cy - 14 * s, 2))
  # Curved knowledge path emerging upward from book
  t_path <- seq(0, 1, length.out = 30)
  kpath <- data.frame(
    x = cx + 8 * s * sin(t_path * pi * 1.5),
    y = cy + 4 * s + t_path * 22 * s
  )
  # Knowledge dots along path
  kdots <- data.frame(
    x = cx + 8 * s * sin(c(0.3, 0.6, 0.9) * pi * 1.5),
    y = cy + 4 * s + c(0.3, 0.6, 0.9) * 22 * s
  )
  list(
    ggplot2::geom_polygon(data = left_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_polygon(data = right_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = spine, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = ll1, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = ll2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = ll3, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = rl1, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = rl2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = rl3, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = kpath, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_point(data = kdots, .aes(x, y),
      color = bright, size = 3.5 * s)
  )
}

# ── glyph_open_book_guide: open book with small seated guide figure ────────
glyph_open_book_guide <- function(cx, cy, s, col, bright) {
  # Reuse book base (simplified)
  spine <- data.frame(x = c(cx, cx), y = c(cy - 16 * s, cy + 4 * s))
  left_page <- data.frame(
    x = c(cx, cx - 20 * s, cx - 18 * s, cx),
    y = c(cy + 4 * s, cy + 2 * s, cy - 16 * s, cy - 16 * s)
  )
  right_page <- data.frame(
    x = c(cx, cx + 20 * s, cx + 18 * s, cx),
    y = c(cy + 4 * s, cy + 2 * s, cy - 16 * s, cy - 16 * s)
  )
  # Text lines (fewer, book is smaller)
  ll1 <- data.frame(x = c(cx - 16 * s, cx - 4 * s), y = rep(cy - 4 * s, 2))
  ll2 <- data.frame(x = c(cx - 14 * s, cx - 4 * s), y = rep(cy - 9 * s, 2))
  rl1 <- data.frame(x = c(cx + 4 * s, cx + 16 * s), y = rep(cy - 4 * s, 2))
  rl2 <- data.frame(x = c(cx + 4 * s, cx + 14 * s), y = rep(cy - 9 * s, 2))
  # Guide figure above book (seated, simplified stick figure)
  head <- data.frame(x0 = cx, y0 = cy + 18 * s, r = 5 * s)
  body <- data.frame(x = c(cx, cx), y = c(cy + 13 * s, cy + 6 * s))
  arm_l <- data.frame(x = c(cx, cx - 8 * s), y = c(cy + 10 * s, cy + 6 * s))
  arm_r <- data.frame(x = c(cx, cx + 8 * s), y = c(cy + 10 * s, cy + 6 * s))
  list(
    ggplot2::geom_polygon(data = left_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = right_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = spine, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = ll1, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = ll2, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = rl1, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = rl2, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1)),
    # Guide figure
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = body, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arm_l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arm_r, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_dialogue_bubbles: two speech bubbles in exchange ─────────────────
glyph_dialogue_bubbles <- function(cx, cy, s, col, bright) {
  # Larger bubble (upper-left, teacher)
  t_big <- seq(0, 2 * pi, length.out = 50)
  big_bub <- data.frame(
    x = cx - 6 * s + 16 * s * cos(t_big),
    y = cy + 8 * s + 12 * s * sin(t_big)
  )
  # Tail for big bubble (pointing down-right)
  big_tail <- data.frame(
    x = c(cx + 4 * s, cx + 10 * s, cx + 6 * s),
    y = c(cy - 2 * s, cy - 6 * s, cy + 2 * s)
  )
  # Smaller bubble (lower-right, learner)
  small_bub <- data.frame(
    x = cx + 8 * s + 10 * s * cos(t_big),
    y = cy - 12 * s + 8 * s * sin(t_big)
  )
  # Tail for small bubble (pointing up-left)
  small_tail <- data.frame(
    x = c(cx + 2 * s, cx - 2 * s, cx + 4 * s),
    y = c(cy - 6 * s, cy - 2 * s, cy - 8 * s)
  )
  # Inner marks in big bubble (3 horizontal dashes)
  bm1 <- data.frame(x = c(cx - 14 * s, cx - 2 * s), y = rep(cy + 12 * s, 2))
  bm2 <- data.frame(x = c(cx - 12 * s, cx), y = rep(cy + 8 * s, 2))
  bm3 <- data.frame(x = c(cx - 10 * s, cx - 4 * s), y = rep(cy + 4 * s, 2))
  # Inner marks in small bubble (2 shorter dashes)
  sm1 <- data.frame(x = c(cx + 4 * s, cx + 12 * s), y = rep(cy - 10 * s, 2))
  sm2 <- data.frame(x = c(cx + 6 * s, cx + 14 * s), y = rep(cy - 14 * s, 2))
  # Curved connection between bubbles
  t_conn <- seq(0, 1, length.out = 20)
  conn <- data.frame(
    x = cx + 6 * s + 4 * s * sin(t_conn * pi),
    y = cy - 4 * s + t_conn * 6 * s
  )
  list(
    ggplot2::geom_polygon(data = big_bub, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = big_tail, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_polygon(data = small_bub, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_polygon(data = small_tail, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = bm1, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = bm2, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = bm3, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = sm1, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = sm2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = conn, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1),
      linetype = "dashed")
  )
}

# ── glyph_dialogue_bubbles_guide: bubbles with directed coaching arrow ─────
glyph_dialogue_bubbles_guide <- function(cx, cy, s, col, bright) {
  # Larger bubble (upper-left)
  t_big <- seq(0, 2 * pi, length.out = 50)
  big_bub <- data.frame(
    x = cx - 6 * s + 14 * s * cos(t_big),
    y = cy + 8 * s + 10 * s * sin(t_big)
  )
  # Smaller bubble (lower-right)
  small_bub <- data.frame(
    x = cx + 8 * s + 10 * s * cos(t_big),
    y = cy - 10 * s + 8 * s * sin(t_big)
  )
  # Content marks
  bm1 <- data.frame(x = c(cx - 14 * s, cx - 2 * s), y = rep(cy + 10 * s, 2))
  bm2 <- data.frame(x = c(cx - 12 * s, cx), y = rep(cy + 6 * s, 2))
  sm1 <- data.frame(x = c(cx + 4 * s, cx + 12 * s), y = rep(cy - 10 * s, 2))
  # Directed arrow from big to small (coaching direction)
  arrow_shaft <- data.frame(
    x = c(cx + 4 * s, cx + 6 * s),
    y = c(cy, cy - 4 * s)
  )
  arrow_head <- data.frame(
    x = c(cx + 3 * s, cx + 6 * s, cx + 9 * s),
    y = c(cy - 2 * s, cy - 6 * s, cy - 2 * s)
  )
  # Guide hand (small open palm near arrow)
  hand_base <- data.frame(
    x = c(cx + 10 * s, cx + 14 * s, cx + 16 * s, cx + 12 * s),
    y = c(cy + 2 * s, cy + 4 * s, cy, cy - 2 * s)
  )
  list(
    ggplot2::geom_polygon(data = big_bub, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = small_bub, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = bm1, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = bm2, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = sm1, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = arrow_shaft, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = hand_base, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_listening_ear: ear shape with incoming sound waves ───────────────
glyph_listening_ear <- function(cx, cy, s, col, bright) {
  # Outer ear (C-shape, open to the left)
  t_ear <- seq(-pi * 0.7, pi * 0.7, length.out = 40)
  ear_outer <- data.frame(
    x = cx + 6 * s + 18 * s * cos(t_ear),
    y = cy + 16 * s * sin(t_ear)
  )
  # Inner helix (smaller C inside)
  t_helix <- seq(-pi * 0.5, pi * 0.5, length.out = 30)
  ear_inner <- data.frame(
    x = cx + 8 * s + 10 * s * cos(t_helix),
    y = cy + 8 * s * sin(t_helix)
  )
  # Ear canal (small circle)
  canal <- data.frame(x0 = cx + 10 * s, y0 = cy, r = 3 * s)
  # Sound waves (3 concentric arcs from left)
  layers <- list(
    ggplot2::geom_path(data = ear_outer, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = ear_inner, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = canal, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  )
  # Sound wave arcs (emanating from left toward ear)
  wave_radii <- c(12, 18, 24)
  wave_alphas <- c(0.6, 0.4, 0.25)
  for (i in seq_along(wave_radii)) {
    t_wave <- seq(pi * 0.6, pi * 1.4, length.out = 25)
    wave <- data.frame(
      x = cx - 10 * s + wave_radii[i] * s * cos(t_wave),
      y = cy + wave_radii[i] * s * sin(t_wave)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = wave, .aes(x, y),
      color = hex_with_alpha(col, wave_alphas[i]), linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_listening_ear_guide: ear with guiding hand gesture ───────────────
glyph_listening_ear_guide <- function(cx, cy, s, col, bright) {
  # Ear (simplified, shifted right)
  t_ear <- seq(-pi * 0.7, pi * 0.7, length.out = 40)
  ear_outer <- data.frame(
    x = cx + 8 * s + 16 * s * cos(t_ear),
    y = cy + 14 * s * sin(t_ear)
  )
  ear_inner <- data.frame(
    x = cx + 10 * s + 8 * s * cos(seq(-pi * 0.4, pi * 0.4, length.out = 25)),
    y = cy + 6 * s * sin(seq(-pi * 0.4, pi * 0.4, length.out = 25))
  )
  canal <- data.frame(x0 = cx + 12 * s, y0 = cy, r = 2.5 * s)
  # Sound waves (2 arcs)
  layers <- list(
    ggplot2::geom_path(data = ear_outer, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.2)),
    ggplot2::geom_path(data = ear_inner, .aes(x, y),
      color = col, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = canal, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.2))
  )
  for (r_val in c(14, 20)) {
    t_w <- seq(pi * 0.6, pi * 1.4, length.out = 20)
    wave <- data.frame(
      x = cx - 8 * s + r_val * s * cos(t_w),
      y = cy + r_val * s * sin(t_w)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = wave, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.3))
  }
  # Guide hand (cupped, near ear, lower-left)
  hand_palm <- data.frame(
    x = c(cx - 14 * s, cx - 8 * s, cx - 6 * s, cx - 10 * s, cx - 16 * s),
    y = c(cy - 8 * s, cy - 12 * s, cy - 6 * s, cy - 2 * s, cy - 4 * s)
  )
  # Fingers (3 short lines fanning from palm)
  f1 <- data.frame(x = c(cx - 6 * s, cx - 2 * s), y = c(cy - 6 * s, cy - 2 * s))
  f2 <- data.frame(x = c(cx - 8 * s, cx - 4 * s), y = c(cy - 12 * s, cy - 8 * s))
  f3 <- data.frame(x = c(cx - 14 * s, cx - 12 * s), y = c(cy - 8 * s, cy - 4 * s))
  layers <- c(layers, list(
    ggplot2::geom_polygon(data = hand_palm, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = f1, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = f2, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = f3, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  ))
  layers
}

# ── glyph_telescope_stars: telescope pointed at star field ─────────────────
glyph_telescope_stars <- function(cx, cy, s, col, bright) {
  # Telescope tube (angled trapezoid, pointing upper-right)
  tube <- data.frame(
    x = c(cx - 16 * s, cx + 10 * s, cx + 14 * s, cx - 12 * s),
    y = c(cy - 8 * s, cy + 12 * s, cy + 8 * s, cy - 12 * s)
  )
  # Eyepiece (small rect at bottom-left end)
  eyepiece <- data.frame(
    xmin = cx - 20 * s, xmax = cx - 14 * s,
    ymin = cy - 14 * s, ymax = cy - 6 * s
  )
  # Tripod legs (3 lines from center-bottom of tube)
  pivot_x <- cx - 4 * s; pivot_y <- cy - 10 * s
  leg1 <- data.frame(x = c(pivot_x, cx - 18 * s), y = c(pivot_y, cy - 26 * s))
  leg2 <- data.frame(x = c(pivot_x, cx + 2 * s), y = c(pivot_y, cy - 26 * s))
  leg3 <- data.frame(x = c(pivot_x, cx - 8 * s), y = c(pivot_y, cy - 28 * s))
  # Cone field of view (expanding from telescope end, upper-right)
  fov_l <- data.frame(
    x = c(cx + 12 * s, cx + 24 * s),
    y = c(cy + 10 * s, cy + 24 * s)
  )
  fov_r <- data.frame(
    x = c(cx + 12 * s, cx + 24 * s),
    y = c(cy + 10 * s, cy + 12 * s)
  )
  # Stars scattered in field of view (7 dots)
  stars <- data.frame(
    x = cx + c(16, 20, 24, 18, 22, 14, 20) * s,
    y = cy + c(14, 18, 22, 22, 26, 20, 24) * s
  )
  star_sizes <- c(2.5, 3.5, 2, 3, 2.5, 1.5, 2) * s
  layers <- list(
    ggplot2::geom_polygon(data = tube, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = eyepiece,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = leg1, .aes(x, y),
      color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = leg2, .aes(x, y),
      color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = leg3, .aes(x, y),
      color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = fov_l, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1),
      linetype = "dashed"),
    ggplot2::geom_path(data = fov_r, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1),
      linetype = "dashed")
  )
  for (i in seq_len(nrow(stars))) {
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = stars[i, , drop = FALSE], .aes(x, y),
      color = bright, size = star_sizes[i])
  }
  layers
}

# ── glyph_telescope_stars_guide: telescope with companion figure ───────────
glyph_telescope_stars_guide <- function(cx, cy, s, col, bright) {
  # Telescope tube (simplified, shifted left)
  tube <- data.frame(
    x = c(cx - 18 * s, cx + 6 * s, cx + 10 * s, cx - 14 * s),
    y = c(cy - 4 * s, cy + 12 * s, cy + 8 * s, cy - 8 * s)
  )
  # Tripod
  pivot_x <- cx - 6 * s; pivot_y <- cy - 6 * s
  leg1 <- data.frame(x = c(pivot_x, cx - 20 * s), y = c(pivot_y, cy - 22 * s))
  leg2 <- data.frame(x = c(pivot_x, cx), y = c(pivot_y, cy - 22 * s))
  # Stars (5)
  stars <- data.frame(
    x = cx + c(12, 16, 20, 14, 18) * s,
    y = cy + c(16, 20, 24, 24, 18) * s
  )
  # Companion figure standing beside telescope (right side)
  fig_head <- data.frame(x0 = cx + 16 * s, y0 = cy, r = 4 * s)
  fig_body <- data.frame(
    x = c(cx + 16 * s, cx + 16 * s),
    y = c(cy - 4 * s, cy - 16 * s)
  )
  fig_arm <- data.frame(
    x = c(cx + 16 * s, cx + 8 * s),
    y = c(cy - 6 * s, cy - 2 * s)
  )
  fig_leg_l <- data.frame(
    x = c(cx + 16 * s, cx + 12 * s),
    y = c(cy - 16 * s, cy - 24 * s)
  )
  fig_leg_r <- data.frame(
    x = c(cx + 16 * s, cx + 20 * s),
    y = c(cy - 16 * s, cy - 24 * s)
  )
  list(
    ggplot2::geom_polygon(data = tube, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = leg1, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = leg2, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_point(data = stars, .aes(x, y),
      color = bright, size = 2.5 * s),
    # Companion figure
    ggforce::geom_circle(data = fig_head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = fig_body, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = fig_arm, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = fig_leg_l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = fig_leg_r, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_flame_spiral: inner flame with ascending spiral (motivation) ────
glyph_flame_spiral <- function(cx, cy, s, col, bright) {
  # Flame body — teardrop shape built from two mirrored curves
  # Left edge of flame (curves outward then tapers to tip)
  t_fl <- seq(0, 1, length.out = 35)
  flame_l <- data.frame(
    x = cx - (14 * s * sin(t_fl * pi) * (1 - t_fl * 0.6)),
    y = cy - 18 * s + t_fl * 46 * s
  )
  # Right edge (mirror)
  flame_r <- data.frame(
    x = cx + (14 * s * sin(t_fl * pi) * (1 - t_fl * 0.6)),
    y = cy - 18 * s + t_fl * 46 * s
  )
  # Combined flame outline polygon
  flame_poly <- data.frame(
    x = c(flame_l$x, rev(flame_r$x)),
    y = c(flame_l$y, rev(flame_r$y))
  )
  # Inner flame core (smaller, brighter teardrop)
  t_in <- seq(0, 1, length.out = 25)
  core_l <- data.frame(
    x = cx - (7 * s * sin(t_in * pi) * (1 - t_in * 0.5)),
    y = cy - 10 * s + t_in * 34 * s
  )
  core_r <- data.frame(
    x = cx + (7 * s * sin(t_in * pi) * (1 - t_in * 0.5)),
    y = cy - 10 * s + t_in * 34 * s
  )
  core_poly <- data.frame(
    x = c(core_l$x, rev(core_r$x)),
    y = c(core_l$y, rev(core_r$y))
  )
  # Spiral ascending through the flame — represents flow channel / growth
  # Logarithmic spiral starting tight at base, expanding upward
  t_sp <- seq(0, 3.5 * pi, length.out = 60)
  spiral_r <- 2 * s + t_sp * 1.2 * s
  spiral <- data.frame(
    x = cx + spiral_r * cos(t_sp) * 0.4,
    y = cy - 12 * s + t_sp * 3.2 * s
  )
  # Trim spiral to stay within flame (roughly)
  spiral <- spiral[spiral$y <= cy + 22 * s, ]
  # Three spark dots rising from the flame tip (autonomy, competence, relatedness)
  sparks <- data.frame(
    x = cx + c(-4, 1, 5) * s,
    y = cy + c(26, 30, 27) * s
  )
  spark_sizes <- c(2, 3, 2.5) * s
  # Base ember glow (ground the flame)
  ember <- data.frame(x0 = cx, y0 = cy - 16 * s, r = 6 * s)
  layers <- list(
    # Ember glow at base
    ggforce::geom_circle(data = ember, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = NA),
    # Outer flame
    ggplot2::geom_polygon(data = flame_poly, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    # Inner core
    ggplot2::geom_polygon(data = core_poly, .aes(x, y),
      fill = hex_with_alpha(bright, 0.15), color = col, linewidth = .lw(s, 1.5)),
    # Spiral through flame
    ggplot2::geom_path(data = spiral, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.8))
  )
  # Spark dots
  for (i in seq_len(nrow(sparks))) {
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = sparks[i, , drop = FALSE], .aes(x, y),
      color = bright, size = spark_sizes[i])
  }
  layers
}
