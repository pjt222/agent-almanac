# primitives_18.R - Glyph library part 18: community-discovered operational skills (5) + i18n (1)
# Sourced by build-icons.R
# Domains: general (4), morphic (1), i18n (1)

# ══════════════════════════════════════════════════════════════════════════════
# General skills (4)
# ══════════════════════════════════════════════════════════════════════════════

glyph_token_gauge <- function(cx, cy, s, col, bright) {
  # Semi-circular gauge with needle at budget threshold + token counter dots
  layers <- list()

  # Gauge arc (semi-circle, open at bottom)
  t_arc <- seq(pi, 0, length.out = 50)
  gauge_r <- 20 * s
  arc <- data.frame(
    x = cx + gauge_r * cos(t_arc),
    y = cy + gauge_r * sin(t_arc) - 4 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  # Inner arc (thinner, dimmer)
  inner_r <- 14 * s
  arc_inner <- data.frame(
    x = cx + inner_r * cos(t_arc),
    y = cy + inner_r * sin(t_arc) - 4 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc_inner, .aes(x, y),
    color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5))

  # Gauge tick marks (5 ticks along the arc)
  for (i in 0:4) {
    tick_angle <- pi - i * pi / 4
    tick_inner <- data.frame(
      x = c(cx + 17 * s * cos(tick_angle), cx + 20 * s * cos(tick_angle)),
      y = c(cy + 17 * s * sin(tick_angle) - 4 * s, cy + 20 * s * sin(tick_angle) - 4 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = tick_inner, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))
  }

  # Needle pointing to ~70% (budget threshold)
  needle_angle <- pi * 0.3  # 70% of the way from left
  needle <- data.frame(
    x = c(cx, cx + 16 * s * cos(needle_angle)),
    y = c(cy - 4 * s, cy + 16 * s * sin(needle_angle) - 4 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = needle, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.2))

  # Needle pivot dot
  pivot <- data.frame(x0 = cx, y0 = cy - 4 * s, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = pivot,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5))

  # Token counter dots below gauge (row of 5 dots, 3 bright + 2 dim = budget used)
  for (i in 1:5) {
    dot_x <- cx + (i - 3) * 6 * s
    dot_alpha <- if (i <= 3) 0.8 else 0.2
    dot <- data.frame(x0 = dot_x, y0 = cy - 18 * s, r = 2.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, dot_alpha), color = "transparent", linewidth = 0)
  }

  layers
}

glyph_memory_prune <- function(cx, cy, s, col, bright) {
  # Memory cards stack with pruning shears cutting across faded entries
  layers <- list()

  # Stack of 4 memory cards (rectangles, offset)
  card_w <- 14 * s
  card_h <- 8 * s
  for (i in 1:4) {
    yoff <- (3 - i) * 7 * s
    card_alpha <- if (i <= 2) 0.5 else 0.15  # bottom cards faded
    card_border <- if (i <= 2) bright else hex_with_alpha(col, 0.4)
    card <- data.frame(
      xmin = cx - card_w, xmax = cx + card_w,
      ymin = cy + yoff - card_h / 2, ymax = cy + yoff + card_h / 2
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = card,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, card_alpha * 0.2), color = card_border,
      linewidth = .lw(s, 1.8))

    # Content lines on each card
    line_y <- cy + yoff
    line <- data.frame(
      x = c(cx - 10 * s, cx + 8 * s),
      y = c(line_y, line_y)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(if (i <= 2) bright else col, if (i <= 2) 0.5 else 0.2),
      linewidth = .lw(s, 1.2))
  }

  # Pruning shears cutting diagonally across the bottom cards
  # Blade 1
  blade1 <- data.frame(
    x = cx + c(18, 4, -2) * s,
    y = cy + c(2, -8, -14) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = blade1, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  # Blade 2
  blade2 <- data.frame(
    x = cx + c(18, 4, -6) * s,
    y = cy + c(-6, -8, -2) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = blade2, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  # Pivot point of shears
  shear_pivot <- data.frame(x0 = cx + 4 * s, y0 = cy - 8 * s, r = 2.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = shear_pivot,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.2))

  layers
}

glyph_circuit_breaker <- function(cx, cy, s, col, bright) {
  # Circuit path with a break/gap and switch lever in tripped position
  layers <- list()

  # Left circuit path (entering)
  left_path <- data.frame(
    x = c(cx - 24 * s, cx - 8 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = left_path, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.2))

  # Right circuit path (exiting)
  right_path <- data.frame(
    x = c(cx + 8 * s, cx + 24 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = right_path, .aes(x, y),
    color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 2.2))

  # Contact points at the break
  left_contact <- data.frame(x0 = cx - 8 * s, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = left_contact,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5))

  right_contact <- data.frame(x0 = cx + 8 * s, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = right_contact,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.15), color = hex_with_alpha(bright, 0.5),
    linewidth = .lw(s, 1.5))

  # Switch lever (tripped position — angled upward from left contact)
  lever <- data.frame(
    x = c(cx - 8 * s, cx + 4 * s),
    y = c(cy, cy + 16 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = lever, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.8))

  # Lightning/fault indicator above the gap
  zap <- data.frame(
    x = cx + c(-2, 1, -1, 2) * s,
    y = cy + c(10, 7, 5, 2) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = zap, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))

  # Upper and lower circuit continuation (showing the full circuit context)
  upper_path <- data.frame(
    x = c(cx - 24 * s, cx - 24 * s, cx + 24 * s, cx + 24 * s),
    y = c(cy, cy + 20 * s, cy + 20 * s, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = upper_path, .aes(x, y),
    color = hex_with_alpha(col, 0.25), linewidth = .lw(s, 1.2))

  layers
}

glyph_verify_checkmark <- function(cx, cy, s, col, bright) {
  # Output document with verification checkmark stamp + evidence chain
  layers <- list()

  # Document body
  doc <- data.frame(
    xmin = cx - 14 * s, xmax = cx + 10 * s,
    ymin = cy - 20 * s, ymax = cy + 20 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = doc,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2))

  # Document fold corner (top-right)
  fold <- data.frame(
    x = cx + c(4, 10, 10) * s,
    y = cy + c(20, 20, 14) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = fold, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))

  # Content lines on document
  for (i in 1:4) {
    line_y <- cy + (14 - i * 7) * s
    line_w <- if (i == 4) 6 else 10
    content_line <- data.frame(
      x = c(cx - 10 * s, cx - 10 * s + line_w * 2 * s),
      y = c(line_y, line_y)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = content_line, .aes(x, y),
      color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 1.2))
  }

  # Verification checkmark stamp (overlaid, bottom-right)
  stamp_cx <- cx + 8 * s
  stamp_cy <- cy - 10 * s
  stamp_r <- 10 * s
  stamp_circle <- data.frame(x0 = stamp_cx, y0 = stamp_cy, r = stamp_r)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = stamp_circle,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Checkmark inside stamp
  check <- data.frame(
    x = stamp_cx + c(-5, -1, 6) * s,
    y = stamp_cy + c(0, -5, 6) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = check, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  # Evidence chain dots (3 connected dots below document)
  for (i in 1:3) {
    chain_x <- cx + (i - 2) * 8 * s
    chain_dot <- data.frame(x0 = chain_x, y0 = cy - 24 * s, r = 2 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = chain_dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1))
    if (i < 3) {
      chain_link <- data.frame(
        x = c(chain_x + 2 * s, chain_x + 6 * s),
        y = c(cy - 24 * s, cy - 24 * s)
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_path(data = chain_link, .aes(x, y),
        color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.2))
    }
  }

  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Morphic skills (1)
# ══════════════════════════════════════════════════════════════════════════════

glyph_identity_boot <- function(cx, cy, s, col, bright) {
  # Concentric identity rings loading progressively upward from anchor core
  layers <- list()

  # Anchor core (solid bright dot at center-bottom)
  core <- data.frame(x0 = cx, y0 = cy - 8 * s, r = 4 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = core,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.6), color = bright, linewidth = .lw(s, 2))

  # Concentric rings loading upward (4 rings, progressively fading)
  ring_radii <- c(8, 13, 18, 23)
  ring_alphas <- c(0.7, 0.5, 0.3, 0.15)
  # Each ring is a partial arc, more complete for inner rings (loading effect)
  arc_extents <- c(0.9, 0.7, 0.5, 0.3)  # fraction of full circle

  for (i in seq_along(ring_radii)) {
    r <- ring_radii[i] * s
    # Arc starts from bottom, extends proportionally
    start_angle <- -pi / 2 - arc_extents[i] * pi
    end_angle <- -pi / 2 + arc_extents[i] * pi
    t_ring <- seq(start_angle, end_angle, length.out = 40)
    ring <- data.frame(
      x = cx + r * cos(t_ring),
      y = cy - 8 * s + r * sin(t_ring)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ring, .aes(x, y),
      color = hex_with_alpha(bright, ring_alphas[i]),
      linewidth = .lw(s, 2.2 - i * 0.3))
  }

  # Upward loading arrow (from core going up)
  arrow_body <- data.frame(
    x = c(cx, cx),
    y = c(cy - 4 * s, cy + 18 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_body, .aes(x, y),
    color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.5))

  # Arrow head
  arrow_head <- data.frame(
    x = cx + c(-4, 0, 4) * s,
    y = cy + c(14, 20, 14) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
    fill = hex_with_alpha(bright, 0.4), color = "transparent", linewidth = 0)

  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# i18n skills (1)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_translate: two offset documents with curved arrow ──────────────
glyph_translate <- function(cx, cy, s, col, bright) {
  # Two overlapping document pages offset horizontally, with a curved arrow
  # from left to right suggesting content translation between languages.
  # Left page has "source" text lines; right page has "translated" text lines.
  layers <- list()

  # Left document (source)
  left_cx <- cx - 10 * s
  doc_w <- 22 * s
  doc_h <- 30 * s
  left_doc <- data.frame(
    xmin = left_cx - doc_w / 2, xmax = left_cx + doc_w / 2,
    ymin = cy - doc_h / 2, ymax = cy + doc_h / 2
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = left_doc,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2))

  # Source text lines (4 lines, uniform)
  for (i in 1:4) {
    ly <- cy + (10 - i * 6) * s
    line_data <- data.frame(
      x = c(left_cx - 8 * s, left_cx + 7 * s),
      y = c(ly, ly)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_data, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.3))
  }

  # Right document (translated, offset right and slightly down)
  right_cx <- cx + 10 * s
  right_doc <- data.frame(
    xmin = right_cx - doc_w / 2, xmax = right_cx + doc_w / 2,
    ymin = cy - doc_h / 2 - 2 * s, ymax = cy + doc_h / 2 - 2 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = right_doc,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.08), color = hex_with_alpha(bright, 0.7),
    linewidth = .lw(s, 2))

  # Translated text lines (4 lines, varied lengths to suggest different script)
  line_widths <- c(6, 9, 5, 8)
  for (i in 1:4) {
    ly <- cy + (10 - i * 6) * s - 2 * s
    line_data <- data.frame(
      x = c(right_cx - 8 * s, right_cx - 8 * s + line_widths[i] * s),
      y = c(ly, ly)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_data, .aes(x, y),
      color = hex_with_alpha(bright, 0.45), linewidth = .lw(s, 1.3))
  }

  # Curved arrow from left doc to right doc (above the documents)
  t_arrow <- seq(pi, 0, length.out = 30)
  arrow_r <- 12 * s
  arrow_arc <- data.frame(
    x = cx + arrow_r * cos(t_arrow),
    y = cy + 18 * s + 6 * s * sin(t_arrow)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_arc, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Arrowhead at right end of curve
  arrow_tip_x <- cx + arrow_r
  arrow_tip_y <- cy + 18 * s
  arrow_head <- data.frame(
    x = arrow_tip_x + c(-4, 0, -4) * s,
    y = arrow_tip_y + c(3, 0, -3) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
    fill = bright, color = "transparent", linewidth = 0)

  layers
}
