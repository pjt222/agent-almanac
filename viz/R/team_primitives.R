# team_primitives.R - Glyph library for team persona icons
# Each glyph: glyph_team_xxx(cx, cy, s, col, bright) -> list of ggplot2 layers
# cx, cy = center; s = scale (1.0 = fill ~70% of 100x100 canvas)
# col = team color; bright = brightened team color
#
# Uses helpers .lw, .aes, hex_with_alpha, brighten_hex from utils.R / primitives.R

# ── glyph_team_r_package_review: hub-and-spoke hexagon with 4 member nodes ──
glyph_team_r_package_review <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Central hexagon (R package hex sticker shape, pointy-top)
  t_hex <- seq(0, 2 * pi, length.out = 7)
  hex_r <- 14 * s
  hex <- data.frame(
    x = cx + hex_r * cos(t_hex - pi / 2),
    y = cy + hex_r * sin(t_hex - pi / 2)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = hex, .aes(x, y),
    fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2.5))

  # 4 member nodes arranged around the hub
  member_r <- 24 * s
  node_r <- 5 * s
  angles <- c(-pi / 4, pi / 4, 3 * pi / 4, -3 * pi / 4)

  for (angle in angles) {
    mx <- cx + member_r * cos(angle)
    my <- cy + member_r * sin(angle)

    # Connection line from center to member
    line <- data.frame(x = c(cx, mx), y = c(cy, my))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))

    # Member node circle
    node <- data.frame(x0 = mx, y0 = my, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))
  }

  # Cross-connections between adjacent member nodes (team coordination)
  for (i in seq_along(angles)) {
    j <- if (i == length(angles)) 1L else i + 1L
    x1 <- cx + member_r * cos(angles[i])
    y1 <- cy + member_r * sin(angles[i])
    x2 <- cx + member_r * cos(angles[j])
    y2 <- cy + member_r * sin(angles[j])
    line <- data.frame(x = c(x1, x2), y = c(y1, y2))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.25), linewidth = .lw(s, 1))
  }

  # Central dot inside hexagon (coordination hub)
  center <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5))

  layers
}

# ── glyph_team_gxp_compliance: shield with checkmark and 4 audit nodes ──
glyph_team_gxp_compliance <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Shield outline
  shield_w <- 16 * s
  shield_h <- 22 * s
  shield <- data.frame(
    x = cx + shield_w * c(0, 1, 1, 0.5, 0, -0.5, -1, -1),
    y = cy + shield_h * c(0.45, 0.45, 0, -0.5, -0.45, -0.5, 0, 0.45)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = shield, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.2))

  # Checkmark inside shield
  check <- data.frame(
    x = cx + s * c(-5, -1, 7),
    y = cy + s * c(-2, -7, 5)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = check, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))

  # 4 audit nodes in corners
  node_r <- 4 * s
  offsets <- list(c(-22, 18), c(22, 18), c(-22, -18), c(22, -18))
  for (off in offsets) {
    mx <- cx + off[1] * s
    my <- cy + off[2] * s
    line <- data.frame(x = c(cx, mx), y = c(cy, my))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2))
    node <- data.frame(x0 = mx, y0 = my, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  }

  layers
}

# ── glyph_team_fullstack_web: layered chevrons (sequential pipeline) ─────
glyph_team_fullstack_web <- function(cx, cy, s, col, bright) {
  layers <- list()

  # 4 stacked chevrons representing the sequential pipeline
  chevron_w <- 18 * s
  y_offsets <- c(15, 5, -5, -15)
  alphas <- c(0.35, 0.28, 0.21, 0.14)

  for (i in seq_along(y_offsets)) {
    yy <- cy + y_offsets[i] * s
    chev <- data.frame(
      x = cx + chevron_w * c(-1, 0, 1),
      y = yy + s * c(4, -4, 4)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = chev, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5), alpha = 1 - (i - 1) * 0.15)
  }

  # Vertical flow line connecting chevrons
  flow <- data.frame(x = c(cx, cx), y = c(cy + 19 * s, cy - 19 * s))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = flow, .aes(x, y),
    color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 1.5))

  # 4 member nodes on the right
  node_r <- 4 * s
  for (i in seq_along(y_offsets)) {
    mx <- cx + 26 * s
    my <- cy + y_offsets[i] * s
    line <- data.frame(x = c(cx + chevron_w, mx), y = c(my, my))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2))
    node <- data.frame(x0 = mx, y0 = my, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  }

  layers
}

# ── glyph_team_ml_data_science: neural network hub with 4 review nodes ───
glyph_team_ml_data_science <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Central brain/network: 3 interconnected inner nodes
  inner_r <- 10 * s
  inner_angles <- c(-pi / 2, pi / 6, 5 * pi / 6)
  inner_pts <- lapply(inner_angles, function(a) {
    c(cx + inner_r * cos(a), cy + inner_r * sin(a))
  })

  # Connections between inner nodes (triangle)
  for (i in 1:3) {
    j <- if (i == 3) 1 else i + 1
    line <- data.frame(
      x = c(inner_pts[[i]][1], inner_pts[[j]][1]),
      y = c(inner_pts[[i]][2], inner_pts[[j]][2])
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.8))
  }

  # Inner nodes
  for (pt in inner_pts) {
    node <- data.frame(x0 = pt[1], y0 = pt[2], r = 3 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  }

  # 4 outer review nodes
  outer_r <- 26 * s
  node_r <- 5 * s
  outer_angles <- c(-pi / 4, pi / 4, 3 * pi / 4, -3 * pi / 4)

  for (angle in outer_angles) {
    mx <- cx + outer_r * cos(angle)
    my <- cy + outer_r * sin(angle)

    # Connect to nearest inner node
    nearest <- inner_pts[[which.min(sapply(inner_pts, function(p) {
      (p[1] - mx)^2 + (p[2] - my)^2
    }))]]
    line <- data.frame(x = c(nearest[1], mx), y = c(nearest[2], my))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 1.2))

    node <- data.frame(x0 = mx, y0 = my, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  }

  layers
}

# ── glyph_team_devops_platform: gear/cog with 4 platform nodes ──────────
glyph_team_devops_platform <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Gear teeth (8 outer bumps)
  n_teeth <- 8
  outer_r <- 16 * s
  inner_r <- 12 * s
  gear_pts <- data.frame(x = numeric(0), y = numeric(0))

  for (i in seq_len(n_teeth)) {
    a1 <- (i - 1) * 2 * pi / n_teeth
    a2 <- a1 + pi / n_teeth * 0.4
    a3 <- a1 + pi / n_teeth * 0.6
    a4 <- a1 + pi / n_teeth
    gear_pts <- rbind(gear_pts,
      data.frame(x = cx + inner_r * cos(a1), y = cy + inner_r * sin(a1)),
      data.frame(x = cx + outer_r * cos(a2), y = cy + outer_r * sin(a2)),
      data.frame(x = cx + outer_r * cos(a3), y = cy + outer_r * sin(a3)),
      data.frame(x = cx + inner_r * cos(a4), y = cy + inner_r * sin(a4))
    )
  }
  gear_pts <- rbind(gear_pts, gear_pts[1, ])

  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = gear_pts, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2))

  # Central hole
  hole <- data.frame(x0 = cx, y0 = cy, r = 6 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = hole,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5))

  # 4 platform nodes at cardinal directions
  platform_r <- 28 * s
  node_r <- 5 * s
  card_angles <- c(0, pi / 2, pi, 3 * pi / 2)

  for (angle in card_angles) {
    mx <- cx + platform_r * cos(angle)
    my <- cy + platform_r * sin(angle)
    line <- data.frame(x = c(cx + outer_r * cos(angle), mx),
                       y = c(cy + outer_r * sin(angle), my))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2))
    node <- data.frame(x0 = mx, y0 = my, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  }

  layers
}

# ── glyph_team_tending: spiral mandala with 4 modality nodes ─────────────
glyph_team_tending <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Spiral (Archimedean) representing the sequential inner journey
  n_pts <- 80
  t_vals <- seq(0, 3 * pi, length.out = n_pts)
  spiral_scale <- 5 * s
  spiral <- data.frame(
    x = cx + spiral_scale * t_vals / pi * cos(t_vals),
    y = cy + spiral_scale * t_vals / pi * sin(t_vals)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = spiral, .aes(x, y),
    color = bright, linewidth = .lw(s, 2), alpha = 0.7)

  # Central glow dot
  center <- data.frame(x0 = cx, y0 = cy, r = 3.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5))

  # 4 modality nodes at cardinal directions
  outer_r <- 26 * s
  node_r <- 5 * s
  angles <- c(-pi / 2, 0, pi / 2, pi)  # top, right, bottom, left

  for (angle in angles) {
    mx <- cx + outer_r * cos(angle)
    my <- cy + outer_r * sin(angle)
    line <- data.frame(x = c(cx, mx), y = c(cy, my))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.2))
    node <- data.frame(x0 = mx, y0 = my, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))
  }

  # Sequential arcs connecting adjacent modality nodes (flow direction)
  for (i in 1:3) {
    a1 <- angles[i]
    a2 <- angles[i + 1]
    arc_pts <- seq(a1, a2, length.out = 15)
    arc <- data.frame(
      x = cx + (outer_r + 4 * s) * cos(arc_pts),
      y = cy + (outer_r + 4 * s) * sin(arc_pts)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
      color = hex_with_alpha(col, 0.2), linewidth = .lw(s, 1))
  }

  layers
}

# ── glyph_team_scrum: sprint board with 3 columns and cards ──────────────────
glyph_team_scrum <- function(cx, cy, s, col, bright) {
  # Sprint board with 3 columns
  board <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s, cx + 22 * s, cx - 22 * s),
    y = c(cy + 16 * s, cy + 16 * s, cy - 16 * s, cy - 16 * s))
  col1 <- data.frame(x = c(cx - 8 * s, cx - 8 * s), y = c(cy + 16 * s, cy - 16 * s))
  col2 <- data.frame(x = c(cx + 8 * s, cx + 8 * s), y = c(cy + 16 * s, cy - 16 * s))
  # Cards in columns
  cards <- data.frame(
    xmin = cx + c(-20, -20, -6, -6, 10) * s,
    xmax = cx + c(-10, -10, 6, 6, 20) * s,
    ymin = cy + c(8, -2, 8, -6, 4) * s,
    ymax = cy + c(14, 4, 14, 0, 10) * s)
  list(
    ggplot2::geom_polygon(data = board, .aes(x, y),
      fill = hex_with_alpha(col, 0.06), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = col1, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = col2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = cards,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1))
  )
}

# ── glyph_team_opaque: amorphous cluster of shifting nodes ───────────────────
glyph_team_opaque <- function(cx, cy, s, col, bright) {
  # Amorphous cluster of shifting nodes
  set.seed(99)
  n <- 8
  t <- seq(0, 2 * pi, length.out = n + 1)[-(n + 1)]
  r_base <- 14
  nodes <- data.frame(
    x0 = cx + (r_base + runif(n, -4, 4)) * s * cos(t),
    y0 = cy + (r_base + runif(n, -4, 4)) * s * sin(t),
    r = rep(5 * s, n))
  # Shifting connections (partial mesh)
  edges <- data.frame(
    x = nodes$x0[c(1, 2, 3, 5, 6, 8)],
    y = nodes$y0[c(1, 2, 3, 5, 6, 8)],
    xend = nodes$x0[c(4, 5, 7, 8, 1, 3)],
    yend = nodes$y0[c(4, 5, 7, 8, 1, 3)])
  list(
    ggplot2::geom_segment(data = edges,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = nodes, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.12), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_team_agentskills_alignment: magnifier over SKILL.md with alignment grid + 4 nodes ──
glyph_team_agentskills_alignment <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Central document (SKILL.md representation)
  doc <- data.frame(
    x = c(cx - 10 * s, cx + 10 * s, cx + 10 * s, cx - 10 * s),
    y = c(cy + 12 * s, cy + 12 * s, cy - 12 * s, cy - 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = doc, .aes(x, y),
    fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5))

  # Alignment grid lines inside document
  for (y_off in c(6, 0, -6)) {
    gl <- data.frame(
      x = c(cx - 6 * s, cx + 6 * s),
      y = c(cy + y_off * s, cy + y_off * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = gl, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1))
  }

  # Magnifier overlaying the document
  loupe <- data.frame(x0 = cx + 6 * s, y0 = cy + 4 * s, r = 10 * s)
  handle <- data.frame(
    x = c(cx + 13 * s, cx + 20 * s),
    y = c(cy - 3 * s, cy - 10 * s)
  )
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = loupe,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.05), color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))

  # 4 member nodes around the document
  member_r <- 24 * s
  node_r <- 4.5 * s
  angles <- c(-pi / 4, pi / 4, 3 * pi / 4, -3 * pi / 4)
  for (angle in angles) {
    mx <- cx + member_r * cos(angle)
    my <- cy + member_r * sin(angle)
    line <- data.frame(x = c(cx, mx), y = c(cy, my))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 1.2))
    node <- data.frame(x0 = mx, y0 = my, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  }

  layers
}

# ── glyph_team_entomology: hub-and-spoke with insect identity ────────────────
glyph_team_entomology <- function(cx, cy, s, col, bright) {
  # Central hub (conservation)
  hub <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  # Spoke nodes
  node1 <- data.frame(x0 = cx - 16 * s, y0 = cy + 14 * s, r = 6 * s)
  node2 <- data.frame(x0 = cx + 16 * s, y0 = cy + 14 * s, r = 6 * s)
  # Connecting lines
  line1 <- data.frame(x = c(cx - 6 * s, cx - 12 * s), y = c(cy + 6 * s, cy + 10 * s))
  line2 <- data.frame(x = c(cx + 6 * s, cx + 12 * s), y = c(cy + 6 * s, cy + 10 * s))
  # Insect legs on hub (6 radiating lines)
  hub_legs <- list()
  for (a in c(pi/6, pi/2, 5*pi/6, 7*pi/6, 3*pi/2, 11*pi/6)) {
    hub_legs[[length(hub_legs) + 1]] <- data.frame(
      x = c(cx + 8 * s * cos(a), cx + 13 * s * cos(a)),
      y = c(cy + 8 * s * sin(a), cy + 13 * s * sin(a))
    )
  }
  # Base line
  base_line <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy - 16 * s, cy - 16 * s)
  )
  layers <- list(
    ggforce::geom_circle(data = hub, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = node1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = node2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = line1, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = line2, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = base_line, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5))
  )
  for (leg in hub_legs) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = leg, .aes(x, y),
      color = bright, linewidth = .lw(s, 1))
  }
  layers
}

# ── glyph_team_dyad: two overlapping circles (practitioner-witness pair) ─────
glyph_team_dyad <- function(cx, cy, s, col, bright) {
  # Two equal circles slightly overlapping, one filled, one outlined
  # Represents the practitioner-witness alternation
  offset <- 10 * s
  r <- 16 * s

  circle_l <- data.frame(x0 = cx - offset, y0 = cy, r = r)
  circle_r <- data.frame(x0 = cx + offset, y0 = cy, r = r)

  # Connecting horizontal line between centers
  link <- data.frame(
    x = c(cx - offset, cx + offset),
    y = c(cy, cy)
  )

  # Small shared center point (overlap)
  center <- data.frame(x0 = cx, y0 = cy, r = 3 * s)

  list(
    ggforce::geom_circle(data = circle_l, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.2)),
    ggforce::geom_circle(data = circle_r, .aes(x0 = x0, y0 = y0, r = r),
      fill = "transparent", color = bright, linewidth = .lw(s, 2.2)),
    ggplot2::geom_path(data = link, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = center, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_team_analytical_chemistry: three-part analytical hub ────────────────
glyph_team_analytical_chemistry <- function(cx, cy, s, col, bright) {
  # Central hub point
  hub <- data.frame(x0 = cx, y0 = cy, r = 4 * s)

  # Node positions (triangle arrangement)
  # Top: spectroscopist (prism)
  top_x <- cx; top_y <- cy + 18 * s
  # Bottom-left: chromatographer (column)
  bl_x <- cx - 16 * s; bl_y <- cy - 12 * s
  # Bottom-right: senior-researcher (magnifier)
  br_x <- cx + 16 * s; br_y <- cy - 12 * s

  # Connecting lines from hub to each node
  line_top <- data.frame(x = c(cx, top_x), y = c(cy, top_y))
  line_bl <- data.frame(x = c(cx, bl_x), y = c(cy, bl_y))
  line_br <- data.frame(x = c(cx, br_x), y = c(cy, br_y))

  # Top node: small triangle (prism)
  prism <- data.frame(
    x = top_x + c(-6, 6, 0, -6) * s,
    y = top_y + c(-5, -5, 7, -5) * s
  )

  # Bottom-left node: small rectangle (column)
  column <- data.frame(
    xmin = bl_x - 4 * s, xmax = bl_x + 4 * s,
    ymin = bl_y - 7 * s, ymax = bl_y + 7 * s
  )

  # Bottom-right node: circle (magnifier lens)
  lens <- data.frame(x0 = br_x, y0 = br_y + 2 * s, r = 6 * s)
  # Magnifier handle
  handle <- data.frame(
    x = c(br_x + 4 * s, br_x + 9 * s),
    y = c(br_y - 3 * s, br_y - 8 * s)
  )

  list(
    # Connection lines first (behind nodes)
    ggplot2::geom_path(data = line_top, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = line_bl, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = line_br, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5)),
    # Central hub
    ggforce::geom_circle(data = hub, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2)),
    # Top: prism
    ggplot2::geom_polygon(data = prism, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    # Bottom-left: column
    ggplot2::geom_rect(data = column, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8)),
    # Bottom-right: magnifier
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

# ── glyph_team_physical_computing: sequential 3-node flow (gate → magnet → equation) ──
glyph_team_physical_computing <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Three nodes in a left-to-right sequential flow
  node_xs <- c(cx - 20 * s, cx, cx + 20 * s)
  node_y <- cy
  node_r <- 8 * s

  # Connection arrows between nodes
  for (i in 1:2) {
    arrow_line <- data.frame(
      x = c(node_xs[i] + node_r, node_xs[i + 1] - node_r),
      y = c(node_y, node_y)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_line, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.8))
    # Arrow head
    ah <- data.frame(
      x = node_xs[i + 1] + c(-node_r - 4, -node_r, -node_r - 4) * s / s,
      y = node_y + c(3, 0, -3) * s
    )
    # Recalculate with proper offset
    ah_tip_x <- node_xs[i + 1] - node_r
    ah <- data.frame(
      x = c(ah_tip_x - 4 * s, ah_tip_x, ah_tip_x - 4 * s),
      y = node_y + c(3, 0, -3) * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ah, .aes(x, y),
      fill = hex_with_alpha(bright, 0.6), color = "transparent", linewidth = 0)
  }

  # Node 1: Logic gate (simplified AND-gate D-shape)
  n1x <- node_xs[1]
  t_arc1 <- seq(-pi / 2, pi / 2, length.out = 20)
  gate <- data.frame(
    x = c(n1x - 5 * s, n1x - 5 * s, n1x + 6 * s * cos(t_arc1), n1x - 5 * s),
    y = c(node_y - 6 * s, node_y + 6 * s, node_y + 6 * s * sin(t_arc1), node_y - 6 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = gate, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8))

  # Node 2: Magnet (horseshoe shape)
  n2x <- node_xs[2]
  t_mag <- seq(0, pi, length.out = 30)
  mag_r <- 6 * s
  horseshoe <- data.frame(
    x = n2x + mag_r * cos(t_mag),
    y = node_y + mag_r * sin(t_mag) - 2 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = horseshoe, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  # Magnet legs
  for (side in c(-1, 1)) {
    leg <- data.frame(
      x = c(n2x + side * mag_r, n2x + side * mag_r),
      y = c(node_y - 2 * s, node_y - 7 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = leg, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  }

  # Node 3: Equation symbol (sigma / integral-like curve)
  n3x <- node_xs[3]
  t_sig <- seq(-pi / 2, pi / 2, length.out = 30)
  sigma <- data.frame(
    x = n3x + 5 * s * cos(t_sig + pi),
    y = node_y + 7 * s * sin(t_sig)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sigma, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  # Outer node circles (faint)
  for (nx in node_xs) {
    circ <- data.frame(x0 = nx, y0 = node_y, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = circ,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = hex_with_alpha(bright, 0.4),
      linewidth = .lw(s, 1.2))
  }

  # Label: "sequential" flow indicator (thin bar below nodes)
  bar <- data.frame(
    x = c(node_xs[1] - node_r, node_xs[3] + node_r),
    y = c(node_y - 14 * s, node_y - 14 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bar, .aes(x, y),
    color = hex_with_alpha(col, 0.25), linewidth = .lw(s, 1))

  layers
}

# ── glyph_team_synoptic_mind: shared-workspace all-to-all mesh ───────────────
glyph_team_synoptic_mind <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Large outer circle (shared workspace boundary)
  workspace <- data.frame(x0 = cx, y0 = cy, r = 26 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = workspace,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.06), color = hex_with_alpha(bright, 0.4),
    linewidth = .lw(s, 1.8))

  # 4 nodes evenly positioned inside the workspace
  # Node 1 (top, slightly larger = adaptic lead / integrator)
  inner_r <- 15 * s
  angles <- c(pi / 2, 7 * pi / 6, 11 * pi / 6, 0)
  node_radii <- c(6, 4.5, 4.5, 4.5)
  node_xs <- cx + inner_r * cos(angles)
  node_ys <- cy + inner_r * sin(angles)
  # Shift node 4 (angle=0) inward to keep it inside workspace

  # All-to-all connection lines (every pair)
  for (i in 1:3) {
    for (j in (i + 1):4) {
      edge <- data.frame(
        x = c(node_xs[i], node_xs[j]),
        y = c(node_ys[i], node_ys[j])
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_path(data = edge, .aes(x, y),
        color = hex_with_alpha(bright, 0.35), linewidth = .lw(s, 1.2))
    }
  }

  # Draw nodes on top of lines
  for (i in seq_along(angles)) {
    nd <- data.frame(x0 = node_xs[i], y0 = node_ys[i], r = node_radii[i] * s)
    fill_alpha <- if (i == 1) 0.35 else 0.18
    lw <- if (i == 1) .lw(s, 2.5) else .lw(s, 1.8)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = nd,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, fill_alpha), color = bright, linewidth = lw)
  }

  # Central awareness glow (the shared field)
  glow <- data.frame(x0 = cx, y0 = cy, r = 4 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = glow,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.25), color = hex_with_alpha(bright, 0.5),
    linewidth = .lw(s, 1.5))

  layers
}

# ── glyph_team_translation_campaign: wave-parallel grid (3 waves x 4 locales) ──
glyph_team_translation_campaign <- function(cx, cy, s, col, bright) {
  layers <- list()

  # 3 rows (waves) x 4 columns (locales)
  wave_ys <- cy + c(14, 0, -14) * s
  locale_xs <- cx + c(-18, -6, 6, 18) * s
  dot_r <- 3 * s

  # Vertical arrows between waves (wave dependency: top -> middle -> bottom)
  for (j in seq_along(locale_xs)) {
    for (w in 1:2) {
      arrow_line <- data.frame(
        x = c(locale_xs[j], locale_xs[j]),
        y = c(wave_ys[w] - dot_r - 1 * s, wave_ys[w + 1] + dot_r + 1 * s)
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_line, .aes(x, y),
        color = hex_with_alpha(col, 0.45), linewidth = .lw(s, 1.2),
        arrow = ggplot2::arrow(length = ggplot2::unit(2.5 * s, "pt"), type = "closed"))
    }
  }

  # Horizontal lines connecting dots within each wave row
  for (w in seq_along(wave_ys)) {
    row_line <- data.frame(
      x = c(locale_xs[1], locale_xs[4]),
      y = c(wave_ys[w], wave_ys[w])
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = row_line, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1.2))
  }

  # Dots for each wave x locale cell
  for (w in seq_along(wave_ys)) {
    for (j in seq_along(locale_xs)) {
      dot <- data.frame(x0 = locale_xs[j], y0 = wave_ys[w], r = dot_r)
      layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
        .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, 0.25), color = bright,
        linewidth = .lw(s, 1.5))
    }
  }

  layers
}

# ── GPU Acceleration Team ──────────────────────────────────────────────

glyph_team_gpu_acceleration <- function(cx, cy, s, col, bright) {
  # Three GPU cores converging on a central optimization target — hub-and-spoke
  layers <- list()

  # Central hub (target / optimized kernel)
  hub <- data.frame(x0 = cx, y0 = cy, r = 7 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = hub,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2))

  # Inner target ring
  inner <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = inner,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1))

  # Three spoke nodes (GPU cores at 120-degree intervals)
  node_r <- 8 * s
  spoke_r <- 22 * s
  angles <- c(pi / 2, pi / 2 + 2 * pi / 3, pi / 2 + 4 * pi / 3)

  for (a in angles) {
    nx <- cx + spoke_r * cos(a)
    ny <- cy + spoke_r * sin(a)

    # Spoke line (hub to node)
    spoke <- data.frame(
      x = c(cx + 7 * s * cos(a), nx - node_r * cos(a)),
      y = c(cy + 7 * s * sin(a), ny - node_r * sin(a))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = spoke, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))

    # Node circle
    node <- data.frame(x0 = nx, y0 = ny, r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = hex_with_alpha(bright, 0.6),
      linewidth = .lw(s, 1.5))

    # Mini GPU grid inside each node (2x2)
    for (dr in c(-1, 1)) {
      for (dc in c(-1, 1)) {
        blk <- data.frame(
          xmin = nx + (dc * 3 - 1.5) * s, xmax = nx + (dc * 3 + 1.5) * s,
          ymin = ny + (dr * 3 - 1.5) * s, ymax = ny + (dr * 3 + 1.5) * s
        )
        layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = blk,
          .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
          fill = hex_with_alpha(bright, 0.2), color = hex_with_alpha(bright, 0.4),
          linewidth = .lw(s, 0.6))
      }
    }
  }

  layers
}
