# primitives_5.R - Glyph library part 5: Alchemy, TCG, Intellectual Property,
#                  plus additions to Design and Review domains
# Sourced by build-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# Alchemy domain glyphs (3)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_athanor: alchemical furnace — triangular vessel with inner flame ──
glyph_athanor <- function(cx, cy, s, col, bright) {

# Triangular vessel (wider at top, tapered at bottom)
  vessel <- data.frame(
    x = c(cx - 20 * s, cx + 20 * s, cx + 8 * s, cx - 8 * s),
    y = c(cy + 18 * s, cy + 18 * s, cy - 18 * s, cy - 18 * s)
  )
  # Rim at top
  rim <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 22 * s,
    ymin = cy + 16 * s, ymax = cy + 22 * s
  )
  # Inner flame (small teardrop)
  t <- seq(0, 1, length.out = 30)
  hw <- 8 * s; h <- 20 * s
  lx <- cx - hw * sin(t * pi) * (1 - t^0.6)
  ly <- cy - 8 * s + h * t
  flame <- data.frame(
    x = c(lx, rev(cx + hw * sin(rev(t) * pi) * (1 - rev(t)^0.6))),
    y = c(ly, rev(ly))
  )
  # Transformation arrows (circular)
  arc_t <- seq(0, 1.5 * pi, length.out = 25)
  arc_r <- 28 * s
  arc <- data.frame(
    x = cx + arc_r * cos(arc_t - pi / 4),
    y = cy + arc_r * sin(arc_t - pi / 4)
  )
  # Arrow tip
  tip_x <- arc$x[25]; tip_y <- arc$y[25]
  ah <- data.frame(
    x = c(tip_x - 4 * s, tip_x, tip_x + 2 * s),
    y = c(tip_y + 3 * s, tip_y, tip_y + 5 * s)
  )
  list(
    ggplot2::geom_polygon(data = vessel, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = rim,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = flame, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arc, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2)),
    ggplot2::geom_polygon(data = ah, .aes(x, y),
      fill = col, color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_transmute: two interlocked circles with conversion arrow ──────────
glyph_transmute <- function(cx, cy, s, col, bright) {
  # Left circle (lead / source)
  c1 <- data.frame(x0 = cx - 12 * s, y0 = cy, r = 16 * s)
  # Right circle (gold / target)
  c2 <- data.frame(x0 = cx + 12 * s, y0 = cy, r = 16 * s)
  # Arrow from left to right through overlap
  arrow_line <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy, cy)
  )
  # Arrow head
  ah <- data.frame(
    x = c(cx + 20 * s, cx + 26 * s, cx + 20 * s),
    y = c(cy + 4 * s, cy, cy - 4 * s)
  )
  # Small dots in each circle (lead dot left, gold dot right)
  dot_l <- data.frame(x0 = cx - 16 * s, y0 = cy, r = 3 * s)
  dot_r <- data.frame(x0 = cx + 16 * s, y0 = cy, r = 3 * s)
  list(
    ggforce::geom_circle(data = c1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = c2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arrow_line, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = ah, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = dot_l, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.4), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = dot_r, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_chrysopoeia: gold ingot with radiating starburst lines ───────────
glyph_chrysopoeia <- function(cx, cy, s, col, bright) {
  # Gold ingot (trapezoid)
  ingot <- data.frame(
    x = c(cx - 16 * s, cx + 16 * s, cx + 12 * s, cx - 12 * s),
    y = c(cy - 4 * s, cy - 4 * s, cy - 14 * s, cy - 14 * s)
  )
  # Top face of ingot (parallelogram for 3D effect)
  top_face <- data.frame(
    x = c(cx - 16 * s, cx + 16 * s, cx + 12 * s, cx - 20 * s),
    y = c(cy - 4 * s, cy - 4 * s, cy + 4 * s, cy + 4 * s)
  )
  # Radiating starburst lines from above the ingot
  layers <- list(
    ggplot2::geom_polygon(data = ingot, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = top_face, .aes(x, y),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
  # Starburst rays from center above ingot
  ray_cx <- cx; ray_cy <- cy + 16 * s
  n_rays <- 8
  for (i in seq_len(n_rays)) {
    angle <- (i - 1) * pi / n_rays * 2 - pi / 2
    # Only upper hemisphere rays
    if (sin(angle) >= -0.3) {
      r_inner <- 4 * s; r_outer <- 14 * s
      ray <- data.frame(
        x = c(ray_cx + r_inner * cos(angle), ray_cx + r_outer * cos(angle)),
        y = c(ray_cy + r_inner * sin(angle), ray_cy + r_outer * sin(angle))
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ray, .aes(x, y),
        color = bright, linewidth = .lw(s, 2))
    }
  }
  # Central glow dot
  center_dot <- data.frame(x0 = ray_cx, y0 = ray_cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center_dot,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 2))
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# TCG domain glyphs (3)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_card_grade: playing card with magnifier lens ──────────────────────
glyph_card_grade <- function(cx, cy, s, col, bright) {
  # Card rectangle
  card <- data.frame(
    xmin = cx - 14 * s, xmax = cx + 10 * s,
    ymin = cy - 22 * s, ymax = cy + 22 * s
  )
  # Card inner border
  inner <- data.frame(
    xmin = cx - 11 * s, xmax = cx + 7 * s,
    ymin = cy - 18 * s, ymax = cy + 18 * s
  )
  # Star rating in card center
  star_pts <- data.frame(x = numeric(0), y = numeric(0))
  for (i in 0:4) {
    outer_a <- -pi / 2 + i * 2 * pi / 5
    inner_a <- outer_a + pi / 5
    star_pts <- rbind(star_pts,
      data.frame(x = cx - 2 * s + 8 * s * cos(outer_a),
                 y = cy + 8 * s * sin(outer_a)),
      data.frame(x = cx - 2 * s + 4 * s * cos(inner_a),
                 y = cy + 4 * s * sin(inner_a))
    )
  }
  # Magnifier lens (bottom-right)
  lens <- data.frame(x0 = cx + 16 * s, y0 = cy - 10 * s, r = 10 * s)
  handle <- data.frame(
    x = c(cx + 23 * s, cx + 30 * s),
    y = c(cy - 17 * s, cy - 24 * s)
  )
  list(
    ggplot2::geom_rect(data = card,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = inner,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = NA, color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = star_pts, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.05), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3.5))
  )
}

# ── glyph_deck_build: three fanned overlapping cards ────────────────────────
glyph_deck_build <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Three cards fanning out (leftmost behind, rightmost in front)
  offsets <- list(
    list(dx = -10, dy = 2, rot = -15),
    list(dx = 0,   dy = 0, rot = 0),
    list(dx = 10,  dy = 2, rot = 15)
  )
  w <- 18 * s; h <- 28 * s
  for (i in seq_along(offsets)) {
    off <- offsets[[i]]
    a <- off$rot * pi / 180
    # Card corners (unrotated)
    corners_x <- c(-w/2, w/2, w/2, -w/2)
    corners_y <- c(-h/2, -h/2, h/2, h/2)
    # Rotate
    rx <- corners_x * cos(a) - corners_y * sin(a) + cx + off$dx * s
    ry <- corners_x * sin(a) + corners_y * cos(a) + cy + off$dy * s
    card_df <- data.frame(x = rx, y = ry)
    alpha_fill <- 0.08 + 0.05 * i
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = card_df, .aes(x, y),
      fill = hex_with_alpha(col, alpha_fill), color = if (i == 3) bright else col,
      linewidth = .lw(s, if (i == 3) 2 else 1.5))
  }
  # Plus symbol on front card (deck building)
  plus_h <- data.frame(x = c(cx + 10 * s - 5 * s, cx + 10 * s + 5 * s),
                       y = c(cy, cy))
  plus_v <- data.frame(x = c(cx + 10 * s, cx + 10 * s),
                       y = c(cy - 5 * s, cy + 5 * s))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = plus_h, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = plus_v, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  layers
}

# ── glyph_collection_grid: 2x2 card grid with star badge ───────────────────
glyph_collection_grid <- function(cx, cy, s, col, bright) {
  layers <- list()
  # 2x2 grid of small cards
  gap <- 3 * s; cw <- 16 * s; ch <- 20 * s
  for (row in 0:1) {
    for (col_i in 0:1) {
      x0 <- cx - (cw + gap / 2) + col_i * (cw + gap)
      y0 <- cy - (ch + gap / 2) + row * (ch + gap)
      card_df <- data.frame(
        xmin = x0, xmax = x0 + cw,
        ymin = y0, ymax = y0 + ch
      )
      alpha <- 0.1 + (row * 2 + col_i) * 0.04
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = card_df,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, alpha), color = col, linewidth = .lw(s, 1.2))
    }
  }
  # Star badge in top-right corner
  star_cx <- cx + 18 * s; star_cy <- cy + 18 * s
  star_pts <- data.frame(x = numeric(0), y = numeric(0))
  for (i in 0:4) {
    outer_a <- -pi / 2 + i * 2 * pi / 5
    inner_a <- outer_a + pi / 5
    star_pts <- rbind(star_pts,
      data.frame(x = star_cx + 7 * s * cos(outer_a),
                 y = star_cy + 7 * s * sin(outer_a)),
      data.frame(x = star_cx + 3.5 * s * cos(inner_a),
                 y = star_cy + 3.5 * s * sin(inner_a))
    )
  }
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = star_pts, .aes(x, y),
    fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2))
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Intellectual Property domain glyphs (2)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_patent_landscape: overlapping documents with network nodes ────────
glyph_patent_landscape <- function(cx, cy, s, col, bright) {
  # Three overlapping document rectangles
  docs <- list(
    data.frame(xmin = cx - 22 * s, xmax = cx - 2 * s,
               ymin = cy - 14 * s, ymax = cy + 18 * s),
    data.frame(xmin = cx - 16 * s, xmax = cx + 4 * s,
               ymin = cy - 18 * s, ymax = cy + 14 * s),
    data.frame(xmin = cx - 10 * s, xmax = cx + 10 * s,
               ymin = cy - 22 * s, ymax = cy + 10 * s)
  )
  layers <- list()
  for (i in seq_along(docs)) {
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = docs[[i]],
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.06 + 0.04 * i), color = col,
      linewidth = .lw(s, 1.2))
  }
  # Network nodes in top-right area (landscape map)
  node_positions <- list(c(18, 16), c(26, 8), c(16, 2), c(28, -4))
  # Connections between nodes
  conns <- list(c(1, 2), c(1, 3), c(2, 4), c(3, 4))
  for (conn in conns) {
    p1 <- node_positions[[conn[1]]]; p2 <- node_positions[[conn[2]]]
    line <- data.frame(
      x = c(cx + p1[1] * s, cx + p2[1] * s),
      y = c(cy + p1[2] * s, cy + p2[2] * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1))
  }
  # Nodes
  for (pos in node_positions) {
    node <- data.frame(x0 = cx + pos[1] * s, y0 = cy + pos[2] * s, r = 3.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.8))
  }
  layers
}

# ── glyph_prior_art_search: magnifier over layered document stack ───────────
glyph_prior_art_search <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Stack of 3 documents (bottom to top)
  for (i in 0:2) {
    doc <- data.frame(
      xmin = cx - 18 * s + i * 2 * s, xmax = cx + 10 * s + i * 2 * s,
      ymin = cy - 18 * s + i * 4 * s, ymax = cy + 10 * s + i * 4 * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = doc,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08 + 0.04 * i), color = col,
      linewidth = .lw(s, 1.2))
    # Text lines on each doc
    for (j in 1:2) {
      line_y <- cy - 12 * s + i * 4 * s + j * 6 * s
      line <- data.frame(
        x = c(cx - 14 * s + i * 2 * s, cx + 4 * s + i * 2 * s),
        y = c(line_y, line_y)
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
        color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1))
    }
  }
  # Large magnifier overlaid (top-right)
  lens <- data.frame(x0 = cx + 14 * s, y0 = cy + 8 * s, r = 14 * s)
  handle <- data.frame(
    x = c(cx + 24 * s, cx + 32 * s),
    y = c(cy - 2 * s, cy - 10 * s)
  )
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = lens,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.05), color = bright, linewidth = .lw(s, 2.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 3.5))
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Design domain addition (1)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_paintbrush_enhance: paintbrush with sparkle dots ──────────────────
glyph_paintbrush_enhance <- function(cx, cy, s, col, bright) {
  # Brush handle (diagonal line)
  handle <- data.frame(
    x = c(cx - 18 * s, cx + 6 * s),
    y = c(cy - 16 * s, cy + 8 * s)
  )
  # Brush head (small rectangle at end)
  a <- atan2(24, 24)  # angle of handle
  bw <- 8 * s; bh <- 12 * s
  tip_x <- cx + 6 * s; tip_y <- cy + 8 * s
  brush_head <- data.frame(
    x = c(tip_x - 5 * s, tip_x + 5 * s, tip_x + 8 * s, tip_x - 2 * s),
    y = c(tip_y + 2 * s, tip_y - 2 * s, tip_y + 8 * s, tip_y + 12 * s)
  )
  # Bristle tips
  bristles <- list()
  for (i in 1:3) {
    bx <- tip_x - 2 * s + i * 3 * s
    by <- tip_y + 12 * s + i * s
    bristles[[i]] <- data.frame(x = c(bx, bx + s), y = c(by, by + 4 * s))
  }
  # Sparkle enhancement dots (scattered around brush head)
  sparkles <- data.frame(
    x = cx + c(14, 20, 8, 18, 24, 12) * s,
    y = cy + c(16, 10, 22, 24, 18, 4) * s
  )
  # Sparkle cross pattern (main sparkle)
  sp_cx <- cx + 20 * s; sp_cy <- cy + 20 * s
  sp_h <- data.frame(x = c(sp_cx - 4 * s, sp_cx + 4 * s), y = c(sp_cy, sp_cy))
  sp_v <- data.frame(x = c(sp_cx, sp_cx), y = c(sp_cy - 4 * s, sp_cy + 4 * s))

  layers <- list(
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = brush_head, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2))
  )
  for (b in bristles) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = b, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  }
  layers[[length(layers) + 1]] <- ggplot2::geom_point(data = sparkles, .aes(x, y),
    color = bright, size = 2.5 * s)
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sp_h, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sp_v, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Review domain addition (1)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_pr_review: merge arrow with checkmark badge ───────────────────────
glyph_pr_review <- function(cx, cy, s, col, bright) {
  # Two branch lines converging to merge point
  branch_l <- data.frame(
    x = c(cx - 18 * s, cx - 8 * s, cx),
    y = c(cy + 16 * s, cy + 8 * s, cy)
  )
  branch_r <- data.frame(
    x = c(cx + 18 * s, cx + 8 * s, cx),
    y = c(cy + 16 * s, cy + 8 * s, cy)
  )
  # Merged trunk going down
  trunk <- data.frame(
    x = c(cx, cx),
    y = c(cy, cy - 18 * s)
  )
  # Commit dots
  dots <- data.frame(
    x = c(cx - 18 * s, cx + 18 * s, cx, cx, cx),
    y = c(cy + 16 * s, cy + 16 * s, cy, cy - 8 * s, cy - 18 * s)
  )
  # Checkmark badge (bottom-right)
  badge <- data.frame(x0 = cx + 18 * s, y0 = cy - 12 * s, r = 10 * s)
  ck <- data.frame(
    x = c(cx + 12 * s, cx + 17 * s, cx + 26 * s),
    y = c(cy - 12 * s, cy - 18 * s, cy - 6 * s)
  )
  list(
    ggplot2::geom_path(data = branch_l, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = branch_r, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = trunk, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_point(data = dots, .aes(x, y),
      color = bright, size = 4 * s),
    ggforce::geom_circle(data = badge, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = ck, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  )
}
