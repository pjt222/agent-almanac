# primitives_12.R - Glyph library part 12: New domains + missing skills (51)
# Sourced by build-icons.R and build-team-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# MCP-integration missing (2)
# ══════════════════════════════════════════════════════════════════════════════

glyph_mcp_analyze <- function(cx, cy, s, col, bright) {
  # Magnifier over code brackets
  loupe <- data.frame(x0 = cx + 4 * s, y0 = cy + 6 * s, r = 14 * s)
  handle <- data.frame(x = c(cx + 14 * s, cx + 22 * s),
                       y = c(cy - 4 * s, cy - 14 * s))
  brk_l <- data.frame(x = c(cx - 16 * s, cx - 22 * s, cx - 16 * s),
                       y = c(cy + 12 * s, cy, cy - 12 * s))
  brk_r <- data.frame(x = c(cx + 2 * s, cx + 8 * s, cx + 2 * s),
                       y = c(cy + 12 * s, cy, cy - 12 * s))
  list(
    ggplot2::geom_path(data = brk_l, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = brk_r, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = loupe, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.05), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  )
}

glyph_mcp_scaffold <- function(cx, cy, s, col, bright) {
  # Frame scaffold with server node
  frame <- data.frame(
    x = c(cx - 18 * s, cx + 18 * s, cx + 18 * s, cx - 18 * s, cx - 18 * s),
    y = c(cy + 16 * s, cy + 16 * s, cy - 16 * s, cy - 16 * s, cy + 16 * s))
  srv <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  list(
    ggplot2::geom_path(data = frame, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5), linetype = "dashed"),
    ggforce::geom_circle(data = srv, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_cross_review <- function(cx, cy, s, col, bright) {
  # Two project boxes exchanging crossing arrows — cross-project review
  layers <- list()

  # Left project box
  left_box <- data.frame(
    xmin = cx - 24 * s, xmax = cx - 8 * s,
    ymin = cy - 12 * s, ymax = cy + 12 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = left_box,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8))

  # Right project box
  right_box <- data.frame(
    xmin = cx + 8 * s, xmax = cx + 24 * s,
    ymin = cy - 12 * s, ymax = cy + 12 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = right_box,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = hex_with_alpha(bright, 0.7),
    linewidth = .lw(s, 1.8))

  # Crossing arrows (top: left→right, bottom: right→left)
  arrow_lr <- data.frame(
    x = c(cx - 8 * s, cx + 8 * s),
    y = c(cy + 5 * s, cy + 5 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_lr, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.5))
  ah_lr <- data.frame(
    x = cx + c(5, 8, 5) * s,
    y = cy + c(7, 5, 3) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ah_lr, .aes(x, y),
    fill = hex_with_alpha(bright, 0.7), color = "transparent", linewidth = 0)

  arrow_rl <- data.frame(
    x = c(cx + 8 * s, cx - 8 * s),
    y = c(cy - 5 * s, cy - 5 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_rl, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.5))
  ah_rl <- data.frame(
    x = cx + c(-5, -8, -5) * s,
    y = cy + c(-3, -5, -7) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ah_rl, .aes(x, y),
    fill = hex_with_alpha(bright, 0.7), color = "transparent", linewidth = 0)

  # Code lines inside left box
  for (y_off in c(6, 2, -2, -6)) {
    line <- data.frame(
      x = c(cx - 22 * s, cx - 12 * s),
      y = c(cy + y_off * s, cy + y_off * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(bright, 0.25), linewidth = .lw(s, 1))
  }

  # Code lines inside right box
  for (y_off in c(6, 2, -2, -6)) {
    line <- data.frame(
      x = c(cx + 10 * s, cx + 22 * s),
      y = c(cy + y_off * s, cy + y_off * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(bright, 0.25), linewidth = .lw(s, 1))
  }

  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Review missing (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_magnifier_skill <- function(cx, cy, s, col, bright) {
  # Magnifier over skill document
  doc <- data.frame(
    x = c(cx - 14 * s, cx + 6 * s, cx + 6 * s, cx - 14 * s),
    y = c(cy + 14 * s, cy + 14 * s, cy - 14 * s, cy - 14 * s))
  loupe <- data.frame(x0 = cx + 8 * s, y0 = cy + 4 * s, r = 12 * s)
  list(
    ggplot2::geom_polygon(data = doc, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = loupe, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.05), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_skill_update <- function(cx, cy, s, col, bright) {
  # Document with upward refresh arrow
  doc <- data.frame(
    x = c(cx - 12 * s, cx + 12 * s, cx + 12 * s, cx - 12 * s),
    y = c(cy + 16 * s, cy + 16 * s, cy - 10 * s, cy - 10 * s))
  arrow <- data.frame(x = c(cx, cx, cx - 6 * s, cx, cx + 6 * s, cx),
                      y = c(cy - 18 * s, cy - 6 * s, cy - 6 * s, cy, cy - 6 * s, cy - 6 * s))
  list(
    ggplot2::geom_polygon(data = doc, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arrow[1:2, ], .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = arrow[3:5, ], .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_skill_refactor <- function(cx, cy, s, col, bright) {
  # Two rectangles with crossing arrows
  r1 <- data.frame(
    x = c(cx - 20 * s, cx - 6 * s, cx - 6 * s, cx - 20 * s),
    y = c(cy + 12 * s, cy + 12 * s, cy - 12 * s, cy - 12 * s))
  r2 <- data.frame(
    x = c(cx + 6 * s, cx + 20 * s, cx + 20 * s, cx + 6 * s),
    y = c(cy + 12 * s, cy + 12 * s, cy - 12 * s, cy - 12 * s))
  arr <- data.frame(x = c(cx - 4 * s, cx + 4 * s), y = c(cy, cy))
  list(
    ggplot2::geom_polygon(data = r1, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = r2, .aes(x, y),
      fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arr, .aes(x, y),
      color = bright, linewidth = .lw(s, 2),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed"))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Esoteric / Kabbalistic missing (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_tree_of_life <- function(cx, cy, s, col, bright) {
  # Simplified Tree of Life with 3 pillars and connecting paths
  nodes <- data.frame(
    x0 = cx + c(0, -14, 14, -14, 14, 0, -14, 14, 0, 0) * s,
    y0 = cy + c(24, 14, 14, 2, 2, -4, -14, -14, -20, -28) * s,
    r = rep(4 * s, 10))
  list(
    ggplot2::geom_segment(data = data.frame(
      x = cx + c(0, 0, -14, -14, 14, 14, -14, 14) * s,
      y = cy + c(24, 24, 14, 14, 14, 14, 2, 2) * s,
      xend = cx + c(-14, 14, -14, 0, 14, 0, 0, 0) * s,
      yend = cy + c(14, 14, 2, -4, 2, -4, -20, -20) * s),
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = nodes, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_gematria <- function(cx, cy, s, col, bright) {
  # Hebrew-style letter forms with numerical values (circles with lines)
  t <- seq(0, 2 * pi, length.out = 7)
  hex <- data.frame(x = cx + 20 * s * cos(t), y = cy + 20 * s * sin(t))
  inner <- data.frame(x0 = cx, y0 = cy, r = 10 * s)
  lines <- data.frame(
    x = cx + c(-12, -6, 0, 6) * s,
    y = cy + c(-6, 8, -8, 6) * s,
    xend = cx + c(-6, 0, 6, 12) * s,
    yend = cy + c(8, -8, 6, -6) * s)
  list(
    ggplot2::geom_polygon(data = hex, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = lines,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_hebrew_letters <- function(cx, cy, s, col, bright) {
  # Stylized letter forms (abstract strokes)
  strokes <- list(
    data.frame(x = c(cx - 16 * s, cx - 16 * s, cx - 8 * s),
               y = c(cy - 12 * s, cy + 12 * s, cy + 12 * s)),
    data.frame(x = c(cx - 2 * s, cx - 2 * s, cx + 6 * s, cx + 6 * s),
               y = c(cy + 12 * s, cy - 12 * s, cy - 12 * s, cy + 4 * s)),
    data.frame(x = c(cx + 12 * s, cx + 12 * s, cx + 20 * s),
               y = c(cy + 12 * s, cy - 6 * s, cy - 12 * s)))
  layers <- list()
  for (st in strokes) {
    layers <- c(layers, list(
      ggplot2::geom_path(data = st, .aes(x, y),
        color = bright, linewidth = .lw(s, 2.5))))
  }
  bg <- data.frame(x0 = cx, y0 = cy, r = 24 * s)
  c(list(ggforce::geom_circle(data = bg, .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.06), color = col, linewidth = .lw(s, 1))), layers)
}

# ══════════════════════════════════════════════════════════════════════════════
# Travel (6)
# ══════════════════════════════════════════════════════════════════════════════

glyph_tour_route <- function(cx, cy, s, col, bright) {
  # Route path with waypoint dots
  path <- data.frame(
    x = cx + c(-18, -8, 4, 14, 20) * s,
    y = cy + c(-10, 8, -6, 10, -4) * s)
  pts <- data.frame(x0 = path$x, y0 = path$y, r = rep(3 * s, 5))
  list(
    ggplot2::geom_path(data = path, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = pts, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_spatial_map <- function(cx, cy, s, col, bright) {
  # Map rectangle with elevation line
  map <- data.frame(
    x = c(cx - 20 * s, cx + 20 * s, cx + 20 * s, cx - 20 * s),
    y = c(cy + 14 * s, cy + 14 * s, cy - 14 * s, cy - 14 * s))
  elev <- data.frame(
    x = cx + c(-18, -10, -2, 6, 14, 18) * s,
    y = cy + c(-4, 4, -2, 10, 2, 6) * s)
  list(
    ggplot2::geom_polygon(data = map, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = elev, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_tour_report <- function(cx, cy, s, col, bright) {
  # Document with small map inset
  doc <- data.frame(
    x = c(cx - 14 * s, cx + 14 * s, cx + 14 * s, cx - 14 * s),
    y = c(cy + 18 * s, cy + 18 * s, cy - 18 * s, cy - 18 * s))
  inset <- data.frame(
    x = c(cx - 8 * s, cx + 8 * s, cx + 8 * s, cx - 8 * s),
    y = c(cy + 12 * s, cy + 12 * s, cy, cy))
  list(
    ggplot2::geom_polygon(data = doc, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = inset, .aes(x, y),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1))
  )
}

glyph_hiking_trail <- function(cx, cy, s, col, bright) {
  # Mountain silhouette with trail path
  mtn <- data.frame(
    x = c(cx - 22 * s, cx - 6 * s, cx + 2 * s, cx + 12 * s, cx + 22 * s),
    y = c(cy - 14 * s, cy + 16 * s, cy + 8 * s, cy + 18 * s, cy - 14 * s))
  trail <- data.frame(
    x = cx + c(-16, -8, 0, 6) * s,
    y = cy + c(-12, -4, -10, 2) * s)
  list(
    ggplot2::geom_polygon(data = mtn, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = trail, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5), linetype = "dotted")
  )
}

glyph_gear_checklist <- function(cx, cy, s, col, bright) {
  # Backpack shape with check marks
  pack <- data.frame(
    x = c(cx - 12 * s, cx + 12 * s, cx + 12 * s, cx + 8 * s, cx - 8 * s, cx - 12 * s),
    y = c(cy + 14 * s, cy + 14 * s, cy - 14 * s, cy - 18 * s, cy - 18 * s, cy - 14 * s))
  ck1 <- data.frame(x = c(cx - 6 * s, cx - 2 * s, cx + 6 * s),
                    y = c(cy + 4 * s, cy, cy + 8 * s))
  ck2 <- data.frame(x = c(cx - 6 * s, cx - 2 * s, cx + 6 * s),
                    y = c(cy - 6 * s, cy - 10 * s, cy - 2 * s))
  list(
    ggplot2::geom_polygon(data = pack, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = ck1, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = ck2, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_trail_assess <- function(cx, cy, s, col, bright) {
  # Trail path with weather indicator (sun/cloud)
  trail <- data.frame(
    x = cx + c(-20, -10, 0, 10, 20) * s,
    y = cy + c(-8, 2, -4, 6, 0) * s)
  sun <- data.frame(x0 = cx + 10 * s, y0 = cy + 16 * s, r = 6 * s)
  list(
    ggplot2::geom_path(data = trail, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = sun, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Relocation (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_relocation_plan <- function(cx, cy, s, col, bright) {
  # Map with arrow path
  map <- data.frame(
    x = c(cx - 20 * s, cx + 20 * s, cx + 20 * s, cx - 20 * s),
    y = c(cy + 14 * s, cy + 14 * s, cy - 14 * s, cy - 14 * s))
  arrow <- data.frame(x = c(cx - 12 * s, cx + 12 * s),
                      y = c(cy - 4 * s, cy + 4 * s))
  list(
    ggplot2::geom_polygon(data = map, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arrow, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(4 * s, "pt"), type = "closed"))
  )
}

glyph_document_check <- function(cx, cy, s, col, bright) {
  # Passport-like rectangle with checkmark
  doc <- data.frame(
    x = c(cx - 12 * s, cx + 12 * s, cx + 12 * s, cx - 12 * s),
    y = c(cy + 18 * s, cy + 18 * s, cy - 18 * s, cy - 18 * s))
  ck <- data.frame(x = c(cx - 6 * s, cx - 1 * s, cx + 8 * s),
                   y = c(cy - 2 * s, cy - 8 * s, cy + 6 * s))
  photo <- data.frame(x0 = cx, y0 = cy + 8 * s, r = 6 * s)
  list(
    ggplot2::geom_polygon(data = doc, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = photo, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = ck, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_bureaucracy <- function(cx, cy, s, col, bright) {
  # Stacked forms with stamp circle
  f1 <- data.frame(
    x = c(cx - 14 * s, cx + 10 * s, cx + 10 * s, cx - 14 * s),
    y = c(cy + 16 * s, cy + 16 * s, cy - 8 * s, cy - 8 * s))
  f2 <- data.frame(
    x = c(cx - 10 * s, cx + 14 * s, cx + 14 * s, cx - 10 * s),
    y = c(cy + 12 * s, cy + 12 * s, cy - 12 * s, cy - 12 * s))
  stamp <- data.frame(x0 = cx + 6 * s, y0 = cy - 4 * s, r = 8 * s)
  list(
    ggplot2::geom_polygon(data = f1, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = f2, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = stamp, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# A2A Protocol (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_agent_card <- function(cx, cy, s, col, bright) {
  # Card with agent silhouette
  card <- data.frame(
    x = c(cx - 16 * s, cx + 16 * s, cx + 16 * s, cx - 16 * s),
    y = c(cy + 12 * s, cy + 12 * s, cy - 12 * s, cy - 12 * s))
  head <- data.frame(x0 = cx, y0 = cy + 4 * s, r = 6 * s)
  body <- data.frame(x0 = cx, y0 = cy - 8 * s, r = 10 * s)
  list(
    ggplot2::geom_polygon(data = card, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_arc(data = data.frame(x0 = cx, y0 = cy - 8 * s, r = 10 * s,
      start = -pi, end = 0), .aes(x0 = x0, y0 = y0, r = r, start = start, end = end),
      color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_a2a_server <- function(cx, cy, s, col, bright) {
  # Server box with JSON-like brackets
  box <- data.frame(
    x = c(cx - 14 * s, cx + 14 * s, cx + 14 * s, cx - 14 * s),
    y = c(cy + 16 * s, cy + 16 * s, cy - 16 * s, cy - 16 * s))
  bl <- data.frame(x = c(cx - 6 * s, cx - 10 * s, cx - 10 * s, cx - 6 * s),
                   y = c(cy + 10 * s, cy + 10 * s, cy - 10 * s, cy - 10 * s))
  br <- data.frame(x = c(cx + 6 * s, cx + 10 * s, cx + 10 * s, cx + 6 * s),
                   y = c(cy + 10 * s, cy + 10 * s, cy - 10 * s, cy - 10 * s))
  list(
    ggplot2::geom_polygon(data = box, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = bl, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = br, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_a2a_test <- function(cx, cy, s, col, bright) {
  # Two circles (agents) with bidirectional arrow
  a1 <- data.frame(x0 = cx - 14 * s, y0 = cy, r = 8 * s)
  a2 <- data.frame(x0 = cx + 14 * s, y0 = cy, r = 8 * s)
  arr <- data.frame(x = c(cx - 4 * s, cx + 4 * s), y = c(cy, cy))
  list(
    ggforce::geom_circle(data = a1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = a2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = arr, .aes(x = x[1], y = y[1], xend = x[2], yend = y[2]),
      color = bright, linewidth = .lw(s, 2),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), ends = "both", type = "closed"))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Geometry (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_compass_ruler <- function(cx, cy, s, col, bright) {
  # Compass legs and a straight edge
  leg1 <- data.frame(x = c(cx, cx - 14 * s), y = c(cy + 18 * s, cy - 14 * s))
  leg2 <- data.frame(x = c(cx, cx + 14 * s), y = c(cy + 18 * s, cy - 14 * s))
  ruler <- data.frame(x = c(cx - 20 * s, cx + 20 * s), y = c(cy - 18 * s, cy - 18 * s))
  pivot <- data.frame(x0 = cx, y0 = cy + 18 * s, r = 3 * s)
  list(
    ggplot2::geom_path(data = leg1, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = leg2, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = ruler, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = pivot, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_trig_circle <- function(cx, cy, s, col, bright) {
  # Unit circle with sine wave quadrant
  circle <- data.frame(x0 = cx, y0 = cy, r = 18 * s)
  axes_h <- data.frame(x = c(cx - 22 * s, cx + 22 * s), y = c(cy, cy))
  axes_v <- data.frame(x = c(cx, cx), y = c(cy - 22 * s, cy + 22 * s))
  t <- seq(0, pi / 2, length.out = 20)
  arc <- data.frame(x = cx + 18 * s * cos(t), y = cy + 18 * s * sin(t))
  list(
    ggplot2::geom_path(data = axes_h, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = axes_v, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = circle, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.05), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arc, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_proof_triangle <- function(cx, cy, s, col, bright) {
  # Triangle with right angle marker
  tri <- data.frame(
    x = c(cx - 18 * s, cx + 18 * s, cx - 18 * s, cx - 18 * s),
    y = c(cy - 14 * s, cy - 14 * s, cy + 14 * s, cy - 14 * s))
  right <- data.frame(
    x = c(cx - 18 * s, cx - 12 * s, cx - 12 * s),
    y = c(cy - 8 * s, cy - 8 * s, cy - 14 * s))
  list(
    ggplot2::geom_polygon(data = tri, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = right, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Stochastic Processes (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_markov_nodes <- function(cx, cy, s, col, bright) {
  # Three state nodes with transition arrows
  n1 <- data.frame(x0 = cx - 16 * s, y0 = cy + 10 * s, r = 7 * s)
  n2 <- data.frame(x0 = cx + 16 * s, y0 = cy + 10 * s, r = 7 * s)
  n3 <- data.frame(x0 = cx, y0 = cy - 12 * s, r = 7 * s)
  a1 <- data.frame(x = c(cx - 8 * s, cx + 8 * s), y = c(cy + 10 * s, cy + 10 * s))
  a2 <- data.frame(x = c(cx + 12 * s, cx + 4 * s), y = c(cy + 2 * s, cy - 6 * s))
  a3 <- data.frame(x = c(cx - 4 * s, cx - 12 * s), y = c(cy - 6 * s, cy + 2 * s))
  list(
    ggplot2::geom_path(data = a1, .aes(x, y), color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed")),
    ggplot2::geom_path(data = a2, .aes(x, y), color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed")),
    ggplot2::geom_path(data = a3, .aes(x, y), color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed")),
    ggforce::geom_circle(data = n1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = n2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = n3, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_hmm_states <- function(cx, cy, s, col, bright) {
  # Hidden layer (dashed circles) and observed layer (solid circles)
  h1 <- data.frame(x0 = cx - 12 * s, y0 = cy + 10 * s, r = 6 * s)
  h2 <- data.frame(x0 = cx + 12 * s, y0 = cy + 10 * s, r = 6 * s)
  o1 <- data.frame(x0 = cx - 12 * s, y0 = cy - 10 * s, r = 6 * s)
  o2 <- data.frame(x0 = cx + 12 * s, y0 = cy - 10 * s, r = 6 * s)
  list(
    ggforce::geom_circle(data = h1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5), linetype = "dashed"),
    ggforce::geom_circle(data = h2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5), linetype = "dashed"),
    ggplot2::geom_segment(data = data.frame(x = cx - 12 * s, y = cy + 3 * s,
      xend = cx - 12 * s, yend = cy - 3 * s),
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_segment(data = data.frame(x = cx + 12 * s, y = cy + 3 * s,
      xend = cx + 12 * s, yend = cy - 3 * s),
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = bright, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = o1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = o2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_random_walk <- function(cx, cy, s, col, bright) {
  # Jagged random walk path
  set.seed(42)
  n <- 12
  dx <- cumsum(rnorm(n, 0, 3))
  dy <- cumsum(rnorm(n, 0, 3))
  dx <- dx / max(abs(dx)) * 20
  dy <- dy / max(abs(dy)) * 16
  walk <- data.frame(x = cx + dx * s, y = cy + dy * s)
  start <- data.frame(x0 = walk$x[1], y0 = walk$y[1], r = 3 * s)
  end_pt <- data.frame(x0 = walk$x[n], y0 = walk$y[n], r = 3 * s)
  list(
    ggplot2::geom_path(data = walk, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = start, .aes(x0 = x0, y0 = y0, r = r),
      fill = col, color = col, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = end_pt, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Theoretical Science (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_wave_function <- function(cx, cy, s, col, bright) {
  # Psi-like wave with probability envelope
  t <- seq(-pi, pi, length.out = 50)
  wave <- data.frame(x = cx + t / pi * 20 * s,
                     y = cy + sin(2 * t) * 14 * s)
  env_top <- data.frame(x = cx + t / pi * 20 * s,
                        y = cy + abs(sin(t)) * 14 * s)
  list(
    ggplot2::geom_path(data = env_top, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = wave, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_derivation <- function(cx, cy, s, col, bright) {
  # Steps descending with equals signs
  lines <- data.frame(
    x = rep(cx - 8 * s, 4), y = cy + c(14, 6, -2, -10) * s,
    xend = rep(cx + 12 * s, 4), yend = cy + c(14, 6, -2, -10) * s)
  eqs <- data.frame(
    x = rep(cx - 14 * s, 3), y = cy + c(10, 2, -6) * s,
    xend = rep(cx - 10 * s, 3), yend = cy + c(10, 2, -6) * s)
  list(
    ggplot2::geom_segment(data = lines,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = eqs,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_literature_survey <- function(cx, cy, s, col, bright) {
  # Stack of papers with magnifier
  for_offset <- c(0, 4, 8)
  layers <- list()
  for (off in for_offset) {
    p <- data.frame(
      x = c(cx - 14 * s + off * s, cx + 10 * s + off * s,
            cx + 10 * s + off * s, cx - 14 * s + off * s),
      y = c(cy + 12 * s - off * s, cy + 12 * s - off * s,
            cy - 12 * s - off * s, cy - 12 * s - off * s))
    layers <- c(layers, list(
      ggplot2::geom_polygon(data = p, .aes(x, y),
        fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1))))
  }
  loupe <- data.frame(x0 = cx + 10 * s, y0 = cy + 6 * s, r = 8 * s)
  c(layers, list(
    ggforce::geom_circle(data = loupe, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.05), color = bright, linewidth = .lw(s, 2))
  ))
}

# ══════════════════════════════════════════════════════════════════════════════
# Diffusion (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_drift_diffusion <- function(cx, cy, s, col, bright) {
  # DDM accumulator path between two boundaries
  bnd_top <- data.frame(x = c(cx - 22 * s, cx + 22 * s), y = c(cy + 16 * s, cy + 16 * s))
  bnd_bot <- data.frame(x = c(cx - 22 * s, cx + 22 * s), y = c(cy - 16 * s, cy - 16 * s))
  set.seed(7)
  n <- 20
  t_x <- seq(-20, 20, length.out = n) * s + cx
  t_y <- cumsum(rnorm(n, 0.5, 1.5))
  t_y <- t_y / max(abs(t_y)) * 14 * s + cy
  path <- data.frame(x = t_x, y = t_y)
  list(
    ggplot2::geom_path(data = bnd_top, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1), linetype = "dashed"),
    ggplot2::geom_path(data = bnd_bot, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1), linetype = "dashed"),
    ggplot2::geom_path(data = path, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_diffusion_network <- function(cx, cy, s, col, bright) {
  # Noise dots on left → clean circle on right
  set.seed(13)
  noise <- data.frame(x0 = cx + runif(12, -22, -6) * s,
                      y0 = cy + runif(12, -14, 14) * s,
                      r = rep(2 * s, 12))
  clean <- data.frame(x0 = cx + 14 * s, y0 = cy, r = 12 * s)
  arrow <- data.frame(x = c(cx - 4 * s, cx + 2 * s), y = c(cy, cy))
  list(
    ggforce::geom_circle(data = noise, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.3), color = col, linewidth = .lw(s, 0.5)),
    ggplot2::geom_path(data = arrow, .aes(x, y),
      color = bright, linewidth = .lw(s, 2),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed")),
    ggforce::geom_circle(data = clean, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_diffusion_sde <- function(cx, cy, s, col, bright) {
  # SDE curve with drift and diffusion terms
  t <- seq(0, 2 * pi, length.out = 40)
  drift <- data.frame(x = cx + (t / (2 * pi) * 40 - 20) * s,
                      y = cy + sin(t) * 10 * s)
  spread_top <- data.frame(x = drift$x, y = drift$y + 6 * s)
  spread_bot <- data.frame(x = drift$x, y = drift$y - 6 * s)
  list(
    ggplot2::geom_path(data = spread_top, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1), linetype = "dashed"),
    ggplot2::geom_path(data = spread_bot, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1), linetype = "dashed"),
    ggplot2::geom_path(data = drift, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Hildegard (5)
# ══════════════════════════════════════════════════════════════════════════════

glyph_herbal_mortar <- function(cx, cy, s, col, bright) {
  # Mortar bowl with pestle
  t <- seq(pi, 2 * pi, length.out = 30)
  mortar <- data.frame(x = cx + 16 * s * cos(t), y = cy + 12 * s * sin(t) - 4 * s)
  rim <- data.frame(x = c(cx - 18 * s, cx + 18 * s), y = c(cy - 4 * s, cy - 4 * s))
  pestle <- data.frame(x = c(cx + 4 * s, cx + 14 * s),
                       y = c(cy - 4 * s, cy + 16 * s))
  leaf <- data.frame(x = c(cx - 10 * s, cx - 6 * s, cx - 10 * s),
                     y = c(cy + 4 * s, cy + 12 * s, cy + 12 * s))
  list(
    ggplot2::geom_path(data = mortar, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = rim, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = pestle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = leaf, .aes(x, y),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1))
  )
}

glyph_humoral_balance <- function(cx, cy, s, col, bright) {
  # Four quadrant circles (four humors)
  offsets <- list(c(-10, 10), c(10, 10), c(-10, -10), c(10, -10))
  nodes <- data.frame(
    x0 = cx + sapply(offsets, `[`, 1) * s,
    y0 = cy + sapply(offsets, `[`, 2) * s,
    r = rep(8 * s, 4))
  center <- data.frame(x0 = cx, y0 = cy, r = 4 * s)
  list(
    ggforce::geom_circle(data = nodes, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = center, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_neume_notes <- function(cx, cy, s, col, bright) {
  # Staff lines with neume-like marks
  staff <- data.frame(
    x = rep(cx - 20 * s, 4), y = cy + c(8, 2, -4, -10) * s,
    xend = rep(cx + 20 * s, 4), yend = cy + c(8, 2, -4, -10) * s)
  notes <- data.frame(x0 = cx + c(-12, -4, 6, 14) * s,
                      y0 = cy + c(8, -4, 2, -10) * s,
                      r = rep(3 * s, 4))
  list(
    ggplot2::geom_segment(data = staff,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = notes, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_viriditas_spiral <- function(cx, cy, s, col, bright) {
  # Green spiral representing viriditas (greening power)
  t <- seq(0, 4 * pi, length.out = 60)
  r <- t / (4 * pi) * 20
  spiral <- data.frame(x = cx + r * s * cos(t), y = cy + r * s * sin(t))
  center <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  list(
    ggplot2::geom_path(data = spiral, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = center, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_physica_book <- function(cx, cy, s, col, bright) {
  # Open book with plant illustration
  spine <- data.frame(x = c(cx, cx), y = c(cy + 16 * s, cy - 16 * s))
  left <- data.frame(
    x = c(cx, cx - 20 * s, cx - 20 * s, cx),
    y = c(cy + 16 * s, cy + 12 * s, cy - 12 * s, cy - 16 * s))
  right <- data.frame(
    x = c(cx, cx + 20 * s, cx + 20 * s, cx),
    y = c(cy + 16 * s, cy + 12 * s, cy - 12 * s, cy - 16 * s))
  # Simple plant on left page
  stem <- data.frame(x = c(cx - 10 * s, cx - 10 * s),
                     y = c(cy - 8 * s, cy + 6 * s))
  list(
    ggplot2::geom_polygon(data = left, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = right, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = spine, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = stem, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Maintenance (4)
# ══════════════════════════════════════════════════════════════════════════════

glyph_broom_clean <- function(cx, cy, s, col, bright) {
  # Broom silhouette
  handle <- data.frame(x = c(cx + 6 * s, cx - 10 * s),
                       y = c(cy + 20 * s, cy - 6 * s))
  bristles <- data.frame(
    x = cx + c(-16, -12, -8, -4, 0) * s,
    y = rep(cy - 16 * s, 5),
    xend = rep(cx - 10 * s, 5),
    yend = rep(cy - 6 * s, 5))
  list(
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_segment(data = bristles,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = col, linewidth = .lw(s, 1.5))
  )
}

glyph_tidy_folders <- function(cx, cy, s, col, bright) {
  # Three organized folder tabs
  folders <- list(
    data.frame(x = c(cx - 18 * s, cx - 18 * s, cx - 14 * s, cx - 6 * s, cx - 6 * s),
               y = c(cy - 4 * s, cy + 8 * s, cy + 12 * s, cy + 12 * s, cy - 4 * s)),
    data.frame(x = c(cx - 4 * s, cx - 4 * s, cx, cx + 8 * s, cx + 8 * s),
               y = c(cy - 4 * s, cy + 8 * s, cy + 12 * s, cy + 12 * s, cy - 4 * s)),
    data.frame(x = c(cx + 10 * s, cx + 10 * s, cx + 14 * s, cx + 22 * s, cx + 22 * s),
               y = c(cy - 4 * s, cy + 8 * s, cy + 12 * s, cy + 12 * s, cy - 4 * s)))
  layers <- list()
  for (f in folders) {
    layers <- c(layers, list(
      ggplot2::geom_polygon(data = f, .aes(x, y),
        fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5))))
  }
  layers
}

glyph_repair_link <- function(cx, cy, s, col, bright) {
  # Broken chain link being reconnected
  link1 <- data.frame(x0 = cx - 10 * s, y0 = cy, r = 8 * s)
  link2 <- data.frame(x0 = cx + 10 * s, y0 = cy, r = 8 * s)
  spark <- data.frame(
    x = cx + c(-2, 0, 2) * s,
    y = cy + c(6, 10, 6) * s)
  list(
    ggforce::geom_circle(data = link1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = link2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = spark, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_escalation_arrow <- function(cx, cy, s, col, bright) {
  # Upward escalation arrow with priority levels
  arrow_body <- data.frame(x = c(cx, cx), y = c(cy - 18 * s, cy + 8 * s))
  arrow_head <- data.frame(
    x = c(cx - 8 * s, cx, cx + 8 * s),
    y = c(cy + 4 * s, cy + 16 * s, cy + 4 * s))
  levels <- data.frame(
    x = rep(cx - 16 * s, 3), y = cy + c(-12, -4, 4) * s,
    xend = rep(cx - 8 * s, 3), yend = cy + c(-12, -4, 4) * s)
  list(
    ggplot2::geom_segment(data = levels,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arrow_body, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_symlink_audit <- function(cx, cy, s, col, bright) {
  # Bent arrow (symlink) with magnifying glass (audit)
  # Arrow: right-angle bend from left to right-down
  arrow_path <- data.frame(
    x = c(cx - 16 * s, cx - 16 * s, cx + 4 * s),
    y = c(cy + 14 * s, cy - 2 * s, cy - 2 * s))
  arrow_head <- data.frame(
    x = c(cx + 0 * s, cx + 8 * s, cx + 0 * s),
    y = c(cy + 3 * s, cy - 2 * s, cy - 7 * s))
  # Dashed second arrow (broken/missing symlink)
  dash_segs <- data.frame(
    x    = cx + c(-16, -10, -4) * s,
    y    = rep(cy + 14 * s, 3),
    xend = cx + c(-12, -6, 0) * s,
    yend = rep(cy + 14 * s, 3))
  # Magnifying glass (audit) — lower right
  lens <- data.frame(x0 = cx + 10 * s, y0 = cy - 10 * s, r = 8 * s)
  handle <- data.frame(
    x = c(cx + 15 * s, cx + 20 * s),
    y = c(cy - 15 * s, cy - 20 * s))
  # Checkmark inside lens
  check <- data.frame(
    x = c(cx + 6 * s, cx + 9 * s, cx + 14 * s),
    y = c(cy - 11 * s, cy - 14 * s, cy - 6 * s))
  list(
    ggplot2::geom_path(data = arrow_path, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = col, color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_segment(data = dash_segs,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.08), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = check, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Blender (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_3d_cube <- function(cx, cy, s, col, bright) {
  # Isometric cube
  front <- data.frame(
    x = cx + c(0, -16, 0, 16) * s,
    y = cy + c(-16, -6, 4, -6) * s)
  top <- data.frame(
    x = cx + c(0, -16, 0, 16) * s,
    y = cy + c(4, -6, 16, 6) * s)
  right <- data.frame(
    x = cx + c(0, 16, 16, 0) * s,
    y = cy + c(4, 6, -6, -16) * s)
  list(
    ggplot2::geom_polygon(data = front, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = top, .aes(x, y),
      fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = right, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_blender_script <- function(cx, cy, s, col, bright) {
  # Script brackets with small cube
  brk_l <- data.frame(x = c(cx - 10 * s, cx - 16 * s, cx - 10 * s),
                      y = c(cy + 14 * s, cy, cy - 14 * s))
  brk_r <- data.frame(x = c(cx + 4 * s, cx + 10 * s, cx + 4 * s),
                      y = c(cy + 14 * s, cy, cy - 14 * s))
  cube <- data.frame(
    x = cx + c(14, 8, 14, 20) * s,
    y = cy + c(6, 2, -2, 2) * s)
  list(
    ggplot2::geom_path(data = brk_l, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = brk_r, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = cube, .aes(x, y),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_render_camera <- function(cx, cy, s, col, bright) {
  # Camera lens circle with aperture blades
  outer <- data.frame(x0 = cx, y0 = cy, r = 18 * s)
  inner <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  t <- seq(0, 2 * pi, length.out = 7)[-7]
  blades <- data.frame(
    x = cx + 12 * s * cos(t), y = cy + 12 * s * sin(t),
    xend = cx + 8 * s * cos(t + 0.5), yend = cy + 8 * s * sin(t + 0.5))
  list(
    ggforce::geom_circle(data = outer, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = blades,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Visualization (2)
# ══════════════════════════════════════════════════════════════════════════════

glyph_2d_canvas <- function(cx, cy, s, col, bright) {
  # Canvas with layered shapes
  canvas <- data.frame(
    x = c(cx - 20 * s, cx + 20 * s, cx + 20 * s, cx - 20 * s),
    y = c(cy + 14 * s, cy + 14 * s, cy - 14 * s, cy - 14 * s))
  rect <- data.frame(
    x = c(cx - 12 * s, cx - 2 * s, cx - 2 * s, cx - 12 * s),
    y = c(cy + 8 * s, cy + 8 * s, cy - 2 * s, cy - 2 * s))
  circ <- data.frame(x0 = cx + 8 * s, y0 = cy - 2 * s, r = 8 * s)
  list(
    ggplot2::geom_polygon(data = canvas, .aes(x, y),
      fill = hex_with_alpha(col, 0.06), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = rect, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = circ, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_pub_chart <- function(cx, cy, s, col, bright) {
  # Bar chart with axis lines
  axis_h <- data.frame(x = c(cx - 18 * s, cx + 18 * s), y = c(cy - 14 * s, cy - 14 * s))
  axis_v <- data.frame(x = c(cx - 18 * s, cx - 18 * s), y = c(cy - 14 * s, cy + 14 * s))
  bars <- data.frame(
    xmin = cx + c(-14, -6, 2, 10) * s,
    xmax = cx + c(-8, 0, 8, 16) * s,
    ymin = rep(cy - 14 * s, 4),
    ymax = cy + c(4, 10, 6, 12) * s)
  list(
    ggplot2::geom_path(data = axis_h, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = axis_v, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = bars,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# 3D Printing (3)
# ══════════════════════════════════════════════════════════════════════════════

glyph_3d_model_prep <- function(cx, cy, s, col, bright) {
  # Layered slices of a model
  layers_list <- list()
  for (i in 0:5) {
    y_off <- cy + (i * 5 - 12) * s
    layer <- data.frame(
      x = c(cx - (14 - i) * s, cx + (14 - i) * s),
      y = c(y_off, y_off))
    layers_list <- c(layers_list, list(
      ggplot2::geom_path(data = layer, .aes(x, y),
        color = if (i %% 2 == 0) bright else col,
        linewidth = .lw(s, 1.5))))
  }
  layers_list
}

glyph_material_spool <- function(cx, cy, s, col, bright) {
  # Filament spool
  outer <- data.frame(x0 = cx, y0 = cy, r = 16 * s)
  inner <- data.frame(x0 = cx, y0 = cy, r = 6 * s)
  hub <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  list(
    ggforce::geom_circle(data = outer, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = hub, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_print_debug <- function(cx, cy, s, col, bright) {
  # Nozzle shape with wrench
  nozzle <- data.frame(
    x = c(cx - 8 * s, cx + 8 * s, cx + 4 * s, cx - 4 * s),
    y = c(cy + 16 * s, cy + 16 * s, cy + 4 * s, cy + 4 * s))
  tip <- data.frame(x = c(cx - 2 * s, cx + 2 * s),
                    y = c(cy + 4 * s, cy + 4 * s))
  wrench <- data.frame(
    x = c(cx - 14 * s, cx - 8 * s, cx - 4 * s),
    y = c(cy - 16 * s, cy - 6 * s, cy - 10 * s))
  list(
    ggplot2::geom_polygon(data = nozzle, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = tip, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = wrench, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

