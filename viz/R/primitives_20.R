# primitives_20.R - Glyph library part 20: pipeline audit batch
# Sourced by build-icons.R
# Domains: review (1), alchemy (1), visualization (2), tensegrity (1)

# ==============================================================================
# Review skills (1)
# ==============================================================================

# -- glyph_test_team_nodes: three connected circles with central checkmark ------
glyph_test_team_nodes <- function(cx, cy, s, col, bright) {
  # Three agent-like circles in a triangle arrangement, connected by lines,
  # with a checkmark in the center -- testing team coordination patterns.
  layers <- list()

  # Triangle arrangement of 3 team nodes
  node_r <- 7 * s
  spread <- 16 * s
  angles <- c(pi / 2, pi / 2 + 2 * pi / 3, pi / 2 + 4 * pi / 3)
  nx <- cx + spread * cos(angles)
  ny <- cy + spread * sin(angles)

  # Connection lines between all pairs
  for (i in 1:2) {
    for (j in (i + 1):3) {
      edge <- data.frame(x = c(nx[i], nx[j]), y = c(ny[i], ny[j]))
      layers[[length(layers) + 1]] <- ggplot2::geom_path(data = edge, .aes(x, y),
        color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1.5))
    }
  }

  # Team node circles
  for (i in 1:3) {
    node <- data.frame(x0 = nx[i], y0 = ny[i], r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8))
  }

  # Central checkmark (validation symbol)
  check <- data.frame(
    x = cx + c(-5, -1, 7) * s,
    y = cy + c(-1, -5, 5) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = check, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  layers
}

# ==============================================================================
# Alchemy skills (1)
# ==============================================================================

# -- glyph_metal_ingot: ingot with radiating extraction lines -------------------
glyph_metal_ingot <- function(cx, cy, s, col, bright) {
  # A trapezoidal ingot shape with radiating lines above it, suggesting
  # the extraction and refinement of raw material into pure essence.
  layers <- list()

  # Ingot body (trapezoid -- wider at bottom, narrower at top)
  ingot <- data.frame(
    x = cx + c(-16, -10, 10, 16) * s,
    y = cy + c(-12, 4, 4, -12) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ingot, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.2))

  # Ingot top face (parallelogram for 3D effect)
  top_face <- data.frame(
    x = cx + c(-10, -4, 16, 10) * s,
    y = cy + c(4, 10, 10, 4) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = top_face, .aes(x, y),
    fill = hex_with_alpha(bright, 0.12), color = bright, linewidth = .lw(s, 1.5))

  # Horizontal line across ingot face (stamp / hallmark)
  stamp <- data.frame(
    x = c(cx - 8 * s, cx + 8 * s),
    y = c(cy - 4 * s, cy - 4 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = stamp, .aes(x, y),
    color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.2))

  # Radiating extraction lines above (5 rays)
  ray_angles <- seq(pi / 6, 5 * pi / 6, length.out = 5)
  for (angle in ray_angles) {
    ray <- data.frame(
      x = c(cx + 6 * s * cos(angle), cx + 20 * s * cos(angle)),
      y = c(cy + 12 * s + 4 * s * sin(angle), cy + 12 * s + 16 * s * sin(angle))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ray, .aes(x, y),
      color = hex_with_alpha(bright, 0.35), linewidth = .lw(s, 1.3))
  }

  layers
}

# ==============================================================================
# Visualization skills (2)
# ==============================================================================

# -- glyph_audit_pipeline: pipeline boxes with gap warning ---------------------
glyph_audit_pipeline <- function(cx, cy, s, col, bright) {
  # Three pipeline stage boxes in a row, connected by arrows. The middle
  # box has a gap/break with a warning triangle above it.
  layers <- list()

  box_w <- 14 * s
  box_h <- 14 * s
  gap <- 6 * s
  offsets <- c(-20, 0, 20)

  # Pipeline boxes
  for (i in 1:3) {
    bx <- cx + offsets[i] * s
    by <- cy - 4 * s
    box_data <- data.frame(
      xmin = bx - box_w / 2, xmax = bx + box_w / 2,
      ymin = by - box_h / 2, ymax = by + box_h / 2
    )
    # Middle box has gap styling (dimmer)
    fill_alpha <- if (i == 2) 0.06 else 0.12
    border_alpha <- if (i == 2) 0.4 else 1.0
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = box_data,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, fill_alpha),
      color = hex_with_alpha(bright, border_alpha),
      linewidth = .lw(s, 1.8))
  }

  # Connection arrows between boxes (dashed for the broken one)
  for (i in 1:2) {
    ax1 <- cx + offsets[i] * s + box_w / 2
    ax2 <- cx + offsets[i + 1] * s - box_w / 2
    ay <- cy - 4 * s
    arrow <- data.frame(x = c(ax1, ax2), y = c(ay, ay))
    lt <- if (i == 1) "dashed" else "solid"
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.3),
      linetype = lt)
  }

  # Warning triangle above middle box
  tri_cx <- cx
  tri_cy <- cy + 14 * s
  tri <- data.frame(
    x = tri_cx + c(-6, 0, 6) * s,
    y = tri_cy + c(-4, 6, -4) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = tri, .aes(x, y),
    fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.8))

  # Exclamation mark inside triangle
  excl_stem <- data.frame(
    x = c(tri_cx, tri_cx),
    y = c(tri_cy + 3 * s, tri_cy - 1 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = excl_stem, .aes(x, y),
    color = bright, linewidth = .lw(s, 1.8))

  excl_dot <- data.frame(x0 = tri_cx, y0 = tri_cy - 3 * s, r = 1 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = excl_dot,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = bright, color = "transparent", linewidth = 0)

  layers
}

# -- glyph_render_pipeline: gear cog feeding into icon frame -------------------
glyph_render_pipeline <- function(cx, cy, s, col, bright) {
  # A gear/cog on the left connected by an arrow to a small framed icon
  # on the right -- the rendering process producing icon output.
  layers <- list()

  # Gear cog (left side)
  gear_cx <- cx - 14 * s
  gear_cy <- cy
  gear_r <- 10 * s
  tooth_count <- 8
  tooth_h <- 4 * s

  # Inner circle of gear
  inner <- data.frame(x0 = gear_cx, y0 = gear_cy, r = gear_r)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = inner,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8))

  # Gear teeth (small rectangles around the perimeter)
  for (i in seq_len(tooth_count)) {
    angle <- (i - 1) * 2 * pi / tooth_count
    # Tooth as two lines from inner to outer radius
    inner_x <- gear_cx + gear_r * cos(angle)
    inner_y <- gear_cy + gear_r * sin(angle)
    outer_x <- gear_cx + (gear_r + tooth_h) * cos(angle)
    outer_y <- gear_cy + (gear_r + tooth_h) * sin(angle)
    tooth <- data.frame(x = c(inner_x, outer_x), y = c(inner_y, outer_y))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = tooth, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  }

  # Center dot of gear
  gear_core <- data.frame(x0 = gear_cx, y0 = gear_cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = gear_core,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.2))

  # Arrow from gear to icon frame
  arrow_line <- data.frame(
    x = c(cx - 2 * s, cx + 6 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_line, .aes(x, y),
    color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))

  # Arrowhead
  arrow_head <- data.frame(
    x = cx + c(3, 6, 3) * s,
    y = cy + c(2.5, 0, -2.5) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
    fill = bright, color = "transparent", linewidth = 0)

  # Icon frame (right side -- small rounded rectangle with inner shape)
  frame_cx <- cx + 16 * s
  frame <- data.frame(
    xmin = frame_cx - 8 * s, xmax = frame_cx + 8 * s,
    ymin = cy - 8 * s, ymax = cy + 8 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = frame,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Simple shape inside frame (small diamond = icon)
  inner_icon <- data.frame(
    x = frame_cx + c(0, 4, 0, -4) * s,
    y = cy + c(4, 0, -4, 0) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = inner_icon, .aes(x, y),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.2))

  layers
}

# ==============================================================================
# Tensegrity skills (1)
# ==============================================================================

# -- glyph_tensegrity: struts and cables in structural balance -----------------
glyph_tensegrity <- function(cx, cy, s, col, bright) {
  # Three angled compression struts (thick, solid) with tension cables
  # (thin, taut) connecting their endpoints -- the balance of push and pull
  # that defines tensegrity structures.
  layers <- list()

  # Three compression struts (thick solid bars at different angles)
  struts <- list(
    list(x1 = cx - 18 * s, y1 = cy - 10 * s, x2 = cx + 6 * s,  y2 = cy + 18 * s),
    list(x1 = cx + 18 * s, y1 = cy - 8 * s,  x2 = cx - 8 * s,  y2 = cy + 14 * s),
    list(x1 = cx - 12 * s, y1 = cy + 8 * s,  x2 = cx + 14 * s, y2 = cy - 16 * s)
  )

  # Draw tension cables first (behind struts)
  # Cables connect endpoints of different struts
  cable_pairs <- list(
    c(1, 2, 2, 1),  # strut1.end -> strut2.start
    c(2, 2, 3, 1),  # strut2.end -> strut3.start
    c(3, 2, 1, 1),  # strut3.end -> strut1.start
    c(1, 1, 3, 2),  # strut1.start -> strut3.end
    c(2, 1, 1, 2),  # strut2.start -> strut1.end
    c(3, 1, 2, 2)   # strut3.start -> strut2.end
  )

  for (pair in cable_pairs) {
    s1 <- struts[[pair[1]]]
    s2 <- struts[[pair[3]]]
    x1 <- if (pair[2] == 1) s1$x1 else s1$x2
    y1 <- if (pair[2] == 1) s1$y1 else s1$y2
    x2 <- if (pair[4] == 1) s2$x1 else s2$x2
    y2 <- if (pair[4] == 1) s2$y1 else s2$y2
    cable <- data.frame(x = c(x1, x2), y = c(y1, y2))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = cable, .aes(x, y),
      color = hex_with_alpha(bright, 0.25), linewidth = .lw(s, 0.8))
  }

  # Draw compression struts (thick, prominent)
  for (strut in struts) {
    bar <- data.frame(x = c(strut$x1, strut$x2), y = c(strut$y1, strut$y2))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bar, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  }

  # Node dots at strut endpoints
  for (strut in struts) {
    for (pt in list(c(strut$x1, strut$y1), c(strut$x2, strut$y2))) {
      node <- data.frame(x0 = pt[1], y0 = pt[2], r = 2.5 * s)
      layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
        .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, 0.5), color = bright,
        linewidth = .lw(s, 1.2))
    }
  }

  layers
}
