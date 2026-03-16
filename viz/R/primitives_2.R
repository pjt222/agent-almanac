# primitives_2.R - Glyph library part 2: DevOps, Git, MCP, MLOps, Observability
# Sourced by primitives.R or build-icons.R

# ── glyph_pipeline: multi-stage pipeline arrows ─────────────────────────
glyph_pipeline <- function(cx, cy, s, col, bright) {
  layers <- list()
  n <- 4
  for (i in seq_len(n)) {
    bx <- cx + (i - 2.5) * 16 * s
    df <- data.frame(xmin = bx - 6 * s, xmax = bx + 6 * s, ymin = cy - 10 * s, ymax = cy + 10 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15 + 0.06 * i), color = bright, linewidth = .lw(s, 1.8))
    if (i < n) {
      arr <- data.frame(x = bx + 6 * s, xend = bx + 10 * s, y = cy, yend = cy)
      layers[[length(layers) + 1]] <- ggplot2::geom_segment(data = arr,
        .aes(x = x, xend = xend, y = y, yend = yend), color = bright, linewidth = .lw(s, 2),
        arrow = ggplot2::arrow(length = ggplot2::unit(0.12, "inches")))
    }
  }
  layers
}

# ── glyph_terraform_blocks: interlocking infrastructure blocks ───────────
glyph_terraform_blocks <- function(cx, cy, s, col, bright) {
  layers <- list()
  positions <- list(c(-12, 10), c(12, 10), c(0, -6), c(-12, -22), c(12, -22))
  for (i in seq_along(positions)) {
    px <- cx + positions[[i]][1] * s
    py <- cy + positions[[i]][2] * s
    df <- data.frame(xmin = px - 10 * s, xmax = px + 10 * s, ymin = py - 6 * s, ymax = py + 6 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12 + 0.05 * i), color = bright, linewidth = .lw(s, 1.5))
  }
  # connections
  conns <- list(c(1, 3), c(2, 3), c(3, 4), c(3, 5))
  for (cn in conns) {
    from <- positions[[cn[1]]]; to <- positions[[cn[2]]]
    line <- data.frame(x = c(cx + from[1] * s, cx + to[1] * s),
                       y = c(cx + from[2] * s - 50 + cy, cx + to[2] * s - 50 + cy))
    # Corrected y: relative to cy
    line <- data.frame(x = c(cx + from[1] * s, cx + to[1] * s),
                       y = c(cy + from[2] * s, cy + to[2] * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  layers
}

# ── glyph_ship_wheel: Kubernetes helm wheel ──────────────────────────────
glyph_ship_wheel <- function(cx, cy, s, col, bright) {
  r <- 24 * s
  inner_r <- 10 * s
  n_spokes <- 7
  # outer ring
  t <- seq(0, 2 * pi, length.out = 60)
  outer <- data.frame(x = cx + r * cos(t), y = cy + r * sin(t))
  inner <- data.frame(x = cx + inner_r * cos(t), y = cy + inner_r * sin(t))
  layers <- list(
    ggplot2::geom_polygon(data = outer, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = inner, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
  # spokes with handles
  for (i in seq_len(n_spokes)) {
    a <- (i - 1) * 2 * pi / n_spokes - pi / 2
    spoke <- data.frame(x = c(cx + inner_r * cos(a), cx + r * cos(a)),
                        y = c(cy + inner_r * sin(a), cy + r * sin(a)))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = spoke, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
    # handle nub
    handle <- data.frame(x0 = cx + (r + 4 * s) * cos(a), y0 = cy + (r + 4 * s) * sin(a), r = 3 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = handle,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.2))
  }
  layers
}

# ── glyph_key_lock: key + lock ───────────────────────────────────────────
glyph_key_lock <- function(cx, cy, s, col, bright) {
  # lock body
  lock <- data.frame(xmin = cx - 12 * s, xmax = cx + 12 * s, ymin = cy - 16 * s, ymax = cy + 2 * s)
  # shackle
  t <- seq(0, pi, length.out = 25)
  shackle <- data.frame(x = cx + 9 * s * cos(t), y = cy + 2 * s + 12 * s * sin(t))
  # keyhole
  kh <- data.frame(x0 = cx, y0 = cy - 6 * s, r = 4 * s)
  key_slot <- data.frame(x = c(cx - 2 * s, cx + 2 * s, cx + 2 * s, cx - 2 * s),
                         y = c(cy - 6 * s, cy - 6 * s, cy - 14 * s, cy - 14 * s))
  list(
    ggplot2::geom_rect(data = lock, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = shackle, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggforce::geom_circle(data = kh, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = key_slot, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = NA)
  )
}

# ── glyph_registry_box: box grid with tags ──────────────────────────────
glyph_registry_box <- function(cx, cy, s, col, bright) {
  layers <- list()
  # 3x2 grid of boxes
  for (row in 1:2) {
    for (col_i in 1:3) {
      bx <- cx + (col_i - 2) * 16 * s
      by <- cy + (row - 1.5) * 16 * s
      df <- data.frame(xmin = bx - 6 * s, xmax = bx + 6 * s, ymin = by - 6 * s, ymax = by + 6 * s)
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.12 + 0.04 * (row + col_i)), color = bright, linewidth = .lw(s, 1.5))
      # tag dot
      layers[[length(layers) + 1]] <- ggplot2::geom_point(
        data = data.frame(x = bx + 4 * s, y = by + 4 * s), .aes(x, y),
        color = bright, size = 2 * s)
    }
  }
  layers
}

# ── glyph_git_sync: Git + circular sync arrows ──────────────────────────
glyph_git_sync <- function(cx, cy, s, col, bright) {
  r <- 22 * s
  # circular arrows (reuse refresh logic)
  t1 <- seq(pi * 0.1, pi * 0.9, length.out = 25)
  t2 <- seq(pi * 1.1, pi * 1.9, length.out = 25)
  arc1 <- data.frame(x = cx + r * cos(t1), y = cy + r * sin(t1))
  arc2 <- data.frame(x = cx + r * cos(t2), y = cy + r * sin(t2))
  # branch symbol in center
  main <- data.frame(x = c(cx, cx), y = c(cy - 12 * s, cy + 12 * s))
  branch <- data.frame(x = c(cx, cx + 8 * s), y = c(cy - 2 * s, cy + 6 * s))
  list(
    ggplot2::geom_path(data = arc1, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = arc2, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = main, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = branch, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_point(data = data.frame(x = c(cx, cx, cx + 8 * s), y = c(cy - 12 * s, cy + 12 * s, cy + 6 * s)),
      .aes(x, y), color = bright, size = 4 * s)
  )
}

# ── glyph_gateway: funnel/gateway arch ───────────────────────────────────
glyph_gateway <- function(cx, cy, s, col, bright) {
  # arch
  t <- seq(0, pi, length.out = 30)
  arch_x <- cx + 24 * s * cos(t)
  arch_y <- cy + 24 * s * sin(t)
  arch <- data.frame(x = arch_x, y = arch_y)
  # pillars
  p1 <- data.frame(x = c(cx - 24 * s, cx - 24 * s), y = c(cy, cy - 20 * s))
  p2 <- data.frame(x = c(cx + 24 * s, cx + 24 * s), y = c(cy, cy - 20 * s))
  # funnel lines inside
  f1 <- data.frame(x = c(cx - 18 * s, cx - 4 * s), y = c(cy + 10 * s, cy - 10 * s))
  f2 <- data.frame(x = c(cx + 18 * s, cx + 4 * s), y = c(cy + 10 * s, cy - 10 * s))
  # arrow out
  arr <- data.frame(x = cx, xend = cx, y = cy - 10 * s, yend = cy - 24 * s)
  list(
    ggplot2::geom_path(data = arch, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = p1, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = p2, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = f1, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = f2, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = arr, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.15, "inches")))
  )
}

# ── glyph_mesh_grid: interconnected service mesh ────────────────────────
glyph_mesh_grid <- function(cx, cy, s, col, bright) {
  layers <- list()
  # 3x3 grid of nodes
  positions <- list()
  for (row in 1:3) {
    for (col_i in 1:3) {
      positions[[length(positions) + 1]] <- c(cx + (col_i - 2) * 18 * s, cy + (row - 2) * 18 * s)
    }
  }
  # connections
  conns <- list(c(1,2), c(2,3), c(4,5), c(5,6), c(7,8), c(8,9),
                c(1,4), c(2,5), c(3,6), c(4,7), c(5,8), c(6,9))
  for (cn in conns) {
    from <- positions[[cn[1]]]; to <- positions[[cn[2]]]
    line <- data.frame(x = c(from[1], to[1]), y = c(from[2], to[2]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  # nodes
  for (i in seq_along(positions)) {
    p <- positions[[i]]
    df <- data.frame(x0 = p[1], y0 = p[2], r = 4 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_policy_shield: shield + code brackets ─────────────────────────
glyph_policy_shield <- function(cx, cy, s, col, bright) {
  w <- 30 * s; h <- 38 * s
  shield <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx - w * 0.25, cx, cx + w * 0.25, cx + w / 2, cx + w / 2),
    y = c(cy + h * 0.4, cy - h * 0.05, cy - h * 0.42, cy - h * 0.48, cy - h * 0.42, cy - h * 0.05, cy + h * 0.4)
  )
  # brackets inside
  lb <- data.frame(x = c(cx - 2 * s, cx - 8 * s, cx - 8 * s, cx - 2 * s),
                   y = c(cy + 10 * s, cy + 10 * s, cy - 10 * s, cy - 10 * s))
  rb <- data.frame(x = c(cx + 2 * s, cx + 8 * s, cx + 8 * s, cx + 2 * s),
                   y = c(cy + 10 * s, cy + 10 * s, cy - 10 * s, cy - 10 * s))
  slash <- data.frame(x = c(cx + 4 * s, cx - 4 * s), y = c(cy + 8 * s, cy - 8 * s))
  list(
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = lb, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = rb, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = slash, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_cost_down: dollar sign + down arrow ───────────────────────────
glyph_cost_down <- function(cx, cy, s, col, bright) {
  # dollar S shape
  t_top <- seq(pi * 0.3, pi * 1.2, length.out = 20)
  t_bot <- seq(pi * 1.3, pi * 2.2, length.out = 20)
  r <- 14 * s
  s_top <- data.frame(x = cx + r * cos(t_top), y = cy + 8 * s + r * 0.4 * sin(t_top))
  s_bot <- data.frame(x = cx + r * cos(t_bot), y = cy - 8 * s + r * 0.4 * sin(t_bot))
  # vertical line through
  vline <- data.frame(x = c(cx, cx), y = c(cy + 20 * s, cy - 14 * s))
  # down arrow
  arrow_df <- data.frame(x = cx + 18 * s, xend = cx + 18 * s, y = cy + 12 * s, yend = cy - 18 * s)
  list(
    ggplot2::geom_path(data = s_top, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = s_bot, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = vline, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_segment(data = arrow_df, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 3),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.2, "inches")))
  )
}

# ── glyph_cluster_local: small cluster + laptop ─────────────────────────
glyph_cluster_local <- function(cx, cy, s, col, bright) {
  # laptop base
  laptop <- data.frame(xmin = cx - 22 * s, xmax = cx + 22 * s, ymin = cy - 22 * s, ymax = cy - 14 * s)
  # laptop screen
  screen <- data.frame(xmin = cx - 18 * s, xmax = cx + 18 * s, ymin = cy - 14 * s, ymax = cy + 4 * s)
  # mini cluster nodes on screen
  layers <- list(
    ggplot2::geom_rect(data = laptop, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = screen, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s))
  )
  # 3 pod boxes on screen
  for (i in 1:3) {
    bx <- cx + (i - 2) * 10 * s
    df <- data.frame(xmin = bx - 4 * s, xmax = bx + 4 * s, ymin = cy - 10 * s, ymax = cy - 2 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = col, linewidth = .lw(s, 1))
  }
  # cloud above
  t <- seq(0, pi, length.out = 30)
  cloud <- data.frame(x = cx + 16 * s * cos(t), y = cy + 14 * s + 8 * s * sin(t))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = cloud, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers
}

# ── glyph_anchor: helm anchor ───────────────────────────────────────────
glyph_anchor <- function(cx, cy, s, col, bright) {
  # vertical shaft
  shaft <- data.frame(x = c(cx, cx), y = c(cy + 18 * s, cy - 18 * s))
  # cross bar
  cross <- data.frame(x = c(cx - 14 * s, cx + 14 * s), y = c(cy + 8 * s, cy + 8 * s))
  # ring at top
  ring <- data.frame(x0 = cx, y0 = cy + 22 * s, r = 5 * s)
  # curved flukes at bottom
  t_l <- seq(pi, pi * 0.5, length.out = 20)
  t_r <- seq(0, pi * 0.5, length.out = 20)
  fluke_l <- data.frame(x = cx - 14 * s * cos(t_l) - 14 * s, y = cy - 18 * s + 14 * s * sin(t_l))
  fluke_r <- data.frame(x = cx + 14 * s * cos(t_r) + 14 * s, y = cy - 18 * s + 14 * s * sin(t_r))
  list(
    ggplot2::geom_path(data = shaft, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = cross, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = fluke_l, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = fluke_r, .aes(x, y), color = col, linewidth = .lw(s, 2.5))
  )
}

# ── glyph_terminal: terminal prompt >_ ──────────────────────────────────
glyph_terminal <- function(cx, cy, s, col, bright) {
  # window frame
  frame <- data.frame(xmin = cx - 28 * s, xmax = cx + 28 * s, ymin = cy - 20 * s, ymax = cy + 20 * s)
  # title bar
  title <- data.frame(xmin = cx - 28 * s, xmax = cx + 28 * s, ymin = cy + 14 * s, ymax = cy + 20 * s)
  # prompt >
  prompt <- data.frame(x = c(cx - 18 * s, cx - 10 * s, cx - 18 * s),
                       y = c(cy + 4 * s, cy, cy - 4 * s))
  # cursor block
  cursor <- data.frame(xmin = cx - 6 * s, xmax = cx, ymin = cy - 3 * s, ymax = cy + 3 * s)
  # dots in title bar
  dots <- data.frame(x = c(cx - 22 * s, cx - 18 * s, cx - 14 * s),
                     y = rep(cy + 17 * s, 3))
  list(
    ggplot2::geom_rect(data = frame, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s)),
    ggplot2::geom_rect(data = title, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = col, size = 2.5 * s),
    ggplot2::geom_path(data = prompt, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_rect(data = cursor, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.6), color = NA)
  )
}

# ── glyph_robot_doc: AI + document ──────────────────────────────────────
glyph_robot_doc <- function(cx, cy, s, col, bright) {
  # robot head
  head <- data.frame(xmin = cx - 14 * s, xmax = cx + 14 * s, ymin = cy + 2 * s, ymax = cy + 20 * s)
  # antenna
  ant <- data.frame(x = c(cx, cx), y = c(cy + 20 * s, cy + 28 * s))
  ant_tip <- data.frame(x0 = cx, y0 = cy + 28 * s, r = 2.5 * s)
  # eyes
  eye_l <- data.frame(x0 = cx - 6 * s, y0 = cy + 12 * s, r = 3 * s)
  eye_r <- data.frame(x0 = cx + 6 * s, y0 = cy + 12 * s, r = 3 * s)
  # document below
  doc <- data.frame(xmin = cx - 10 * s, xmax = cx + 10 * s, ymin = cy - 24 * s, ymax = cy - 2 * s)
  # lines on doc
  lines <- lapply(1:3, function(i) {
    ly <- cy - 6 * s - i * 5 * s
    data.frame(x = c(cx - 6 * s, cx + 6 * s), y = c(ly, ly))
  })
  layers <- list(
    ggplot2::geom_rect(data = head, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = ant, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = ant_tip, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = 1),
    ggforce::geom_circle(data = eye_l, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = eye_r, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = doc, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5))
  )
  for (l in lines) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  }
  layers
}

# ── glyph_shield_scan: shield + scanning line ───────────────────────────
glyph_shield_scan <- function(cx, cy, s, col, bright) {
  w <- 30 * s; h <- 38 * s
  shield <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx - w * 0.25, cx, cx + w * 0.25, cx + w / 2, cx + w / 2),
    y = c(cy + h * 0.4, cy - h * 0.05, cy - h * 0.42, cy - h * 0.48, cy - h * 0.42, cy - h * 0.05, cy + h * 0.4)
  )
  # scan line
  scan <- data.frame(x = c(cx - w * 0.35, cx + w * 0.35), y = c(cy, cy))
  # eye symbol above scan
  eye_t <- seq(0, pi, length.out = 20)
  eye_top <- data.frame(x = cx + 10 * s * cos(eye_t), y = cy + 6 * s + 5 * s * sin(eye_t))
  eye_bot <- data.frame(x = cx + 10 * s * cos(eye_t), y = cy + 6 * s - 5 * s * sin(eye_t))
  pupil <- data.frame(x0 = cx, y0 = cy + 6 * s, r = 3 * s)
  list(
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = scan, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = eye_top, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = eye_bot, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = pupil, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = 1)
  )
}

# ── glyph_spark_create: lightning + plus sign ────────────────────────────
glyph_spark_create <- function(cx, cy, s, col, bright) {
  # lightning bolt
  bolt <- data.frame(
    x = c(cx + 4 * s, cx - 8 * s, cx, cx - 12 * s, cx - 4 * s, cx + 8 * s, cx),
    y = c(cy + 26 * s, cy + 6 * s, cy + 4 * s, cy - 22 * s, cy - 4 * s, cy - 2 * s, cy + 4 * s)
  )
  # plus sign (bottom right)
  px <- cx + 18 * s; py <- cy - 14 * s
  plus_h <- data.frame(x = c(px - 6 * s, px + 6 * s), y = c(py, py))
  plus_v <- data.frame(x = c(px, px), y = c(py - 6 * s, py + 6 * s))
  list(
    ggplot2::geom_polygon(data = bolt, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = plus_h, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = plus_v, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
}

# ── glyph_continue_here: document page with resume triangle ─────────────
glyph_continue_here <- function(cx, cy, s, col, bright) {
  # document page outline (rounded rectangle via polygon)
  page_w <- 20 * s; page_h <- 28 * s
  fold <- 8 * s
  page <- data.frame(
    x = c(cx - page_w, cx + page_w - fold, cx + page_w, cx + page_w, cx - page_w),
    y = c(cy + page_h, cy + page_h, cy + page_h - fold, cy - page_h, cy - page_h)
  )
  # folded corner
  corner <- data.frame(
    x = c(cx + page_w - fold, cx + page_w - fold, cx + page_w),
    y = c(cy + page_h, cy + page_h - fold, cy + page_h - fold)
  )
  # resume/play triangle (center of page)
  tri_s <- 12 * s
  triangle <- data.frame(
    x = c(cx - tri_s * 0.5, cx - tri_s * 0.5, cx + tri_s * 0.7),
    y = c(cy + tri_s * 0.7, cy - tri_s * 0.7, cy)
  )
  # text lines (left-aligned, below center)
  line_y_positions <- c(cy - page_h * 0.55, cy - page_h * 0.72)
  line_widths <- c(24 * s, 18 * s)
  layers <- list(
    ggplot2::geom_polygon(data = page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = corner, .aes(x, y),
      fill = hex_with_alpha(col, 0.20), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = triangle, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2.5))
  )
  for (i in seq_along(line_y_positions)) {
    line_df <- data.frame(
      x = c(cx - page_w * 0.7, cx - page_w * 0.7 + line_widths[i]),
      y = c(line_y_positions[i], line_y_positions[i])
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(
      data = line_df, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_evolution_arrow: ascending curve/arrow ────────────────────────
glyph_evolution_arrow <- function(cx, cy, s, col, bright) {
  t <- seq(0, 1, length.out = 40)
  curve_x <- cx - 24 * s + 48 * s * t
  curve_y <- cy - 18 * s + 36 * s * t^0.5
  df <- data.frame(x = curve_x, y = curve_y)
  # arrow at end
  arr <- data.frame(x = curve_x[40], xend = curve_x[40] + 4 * s,
                    y = curve_y[40], yend = curve_y[40] + 2 * s)
  # steps below curve
  layers <- list(
    ggplot2::geom_path(data = df, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_segment(data = arr, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 3),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.18, "inches")))
  )
  # step markers
  for (i in 1:4) {
    ti <- i / 5
    sx <- cx - 24 * s + 48 * s * ti
    sy <- cy - 18 * s + 36 * s * ti^0.5
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = sx, y = sy), .aes(x, y), color = bright, size = 4 * s)
  }
  layers
}

# ── glyph_git_config: gear + branch ─────────────────────────────────────
glyph_git_config <- function(cx, cy, s, col, bright) {
  # gear (simplified)
  r <- 18 * s
  t <- seq(0, 2 * pi, length.out = 60)
  teeth <- r + 4 * s * sin(8 * t)
  gear <- data.frame(x = cx + teeth * cos(t), y = cy + teeth * sin(t))
  inner <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  # branch lines through gear
  main <- data.frame(x = c(cx, cx), y = c(cy - 28 * s, cy + 28 * s))
  branch <- data.frame(x = c(cx, cx + 14 * s), y = c(cy + 8 * s, cy + 18 * s))
  list(
    ggplot2::geom_polygon(data = gear, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = main, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = branch, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_point(data = data.frame(x = cx + 14 * s, y = cy + 18 * s), .aes(x, y),
      color = bright, size = 4 * s)
  )
}

# ── glyph_commit_diamond: diamond node + arrow ─────────────────────────
glyph_commit_diamond <- function(cx, cy, s, col, bright) {
  # vertical line
  vline <- data.frame(x = c(cx, cx), y = c(cy - 28 * s, cy + 28 * s))
  # diamond
  r <- 14 * s
  diamond <- data.frame(
    x = c(cx - r, cx, cx + r, cx),
    y = c(cy, cy + r, cy, cy - r)
  )
  # commit dots above and below
  dots <- data.frame(x = rep(cx, 2), y = c(cy + 22 * s, cy - 22 * s))
  list(
    ggplot2::geom_path(data = vline, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = diamond, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = bright, size = 5 * s)
  )
}

# ── glyph_branch_fork: forking branch lines ────────────────────────────
glyph_branch_fork <- function(cx, cy, s, col, bright) {
  # main trunk
  trunk <- data.frame(x = c(cx, cx), y = c(cy - 28 * s, cy + 28 * s))
  # forks
  f1 <- data.frame(x = c(cx, cx - 16 * s), y = c(cy + 4 * s, cy + 20 * s))
  f2 <- data.frame(x = c(cx, cx + 16 * s), y = c(cy - 8 * s, cy - 22 * s))
  # commit dots
  dots <- data.frame(
    x = c(cx, cx, cx - 16 * s, cx + 16 * s, cx),
    y = c(cy - 28 * s, cy + 28 * s, cy + 20 * s, cy - 22 * s, cy)
  )
  list(
    ggplot2::geom_path(data = trunk, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = f1, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = f2, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = bright, size = 5 * s)
  )
}

# ── glyph_merge_arrows: two branches merging ───────────────────────────
glyph_merge_arrows <- function(cx, cy, s, col, bright) {
  # two branches converging
  b1 <- data.frame(x = c(cx - 18 * s, cx), y = c(cy + 20 * s, cy - 4 * s))
  b2 <- data.frame(x = c(cx + 18 * s, cx), y = c(cy + 20 * s, cy - 4 * s))
  # merged trunk going down
  trunk <- data.frame(x = c(cx, cx), y = c(cy - 4 * s, cy - 24 * s))
  # dots
  dots <- data.frame(
    x = c(cx - 18 * s, cx + 18 * s, cx, cx),
    y = c(cy + 20 * s, cy + 20 * s, cy - 4 * s, cy - 24 * s)
  )
  list(
    ggplot2::geom_path(data = b1, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = b2, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = trunk, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = bright, size = 5 * s)
  )
}

# ── glyph_conflict_cross: crossed branches + resolve ───────────────────
glyph_conflict_cross <- function(cx, cy, s, col, bright) {
  # X cross
  x1 <- data.frame(x = c(cx - 20 * s, cx + 20 * s), y = c(cy + 20 * s, cy - 20 * s))
  x2 <- data.frame(x = c(cx + 20 * s, cx - 20 * s), y = c(cy + 20 * s, cy - 20 * s))
  # checkmark overlay (resolve)
  ck <- data.frame(
    x = c(cx - 10 * s, cx - 2 * s, cx + 14 * s),
    y = c(cy + 2 * s, cy - 8 * s, cy + 12 * s)
  )
  list(
    ggplot2::geom_path(data = x1, .aes(x, y), color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = x2, .aes(x, y), color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = ck, .aes(x, y), color = bright, linewidth = .lw(s, 4))
  )
}

# ── glyph_tag_release: tag + download arrow ─────────────────────────────
glyph_tag_release <- function(cx, cy, s, col, bright) {
  # tag shape
  tag <- data.frame(
    x = c(cx - 14 * s, cx + 10 * s, cx + 18 * s, cx + 10 * s, cx - 14 * s),
    y = c(cy + 8 * s, cy + 8 * s, cy, cy - 8 * s, cy - 8 * s)
  )
  # hole in tag
  hole <- data.frame(x0 = cx - 8 * s, y0 = cy, r = 3 * s)
  # download arrow below
  arr_line <- data.frame(x = c(cx, cx), y = c(cy - 14 * s, cy - 28 * s))
  arr_head <- data.frame(
    x = c(cx - 8 * s, cx, cx + 8 * s),
    y = c(cy - 22 * s, cy - 30 * s, cy - 22 * s)
  )
  list(
    ggplot2::geom_polygon(data = tag, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggforce::geom_circle(data = hole, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arr_line, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = arr_head, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
}

# ── glyph_server_plug: server + plug cable ──────────────────────────────
glyph_server_plug <- function(cx, cy, s, col, bright) {
  # server rack
  layers <- list()
  for (i in 1:3) {
    y_off <- (i - 2) * 12 * s + 4 * s
    df <- data.frame(xmin = cx - 18 * s, xmax = cx + 18 * s, ymin = cy + y_off - 4 * s, ymax = cy + y_off + 4 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12 + 0.05 * i), color = bright, linewidth = .lw(s, 1.5))
    # LED dot
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = cx + 14 * s, y = cy + y_off), .aes(x, y),
      color = bright, size = 2.5 * s)
  }
  # cable at bottom
  cable <- data.frame(x = c(cx, cx), y = c(cy - 12 * s, cy - 24 * s))
  plug <- data.frame(xmin = cx - 4 * s, xmax = cx + 4 * s, ymin = cy - 28 * s, ymax = cy - 24 * s)
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = cable, .aes(x, y),
    color = col, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = plug,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  layers
}

# ── glyph_wrench_server: wrench + server ────────────────────────────────
glyph_wrench_server <- function(cx, cy, s, col, bright) {
  # server box
  srv <- data.frame(xmin = cx - 16 * s, xmax = cx + 16 * s, ymin = cy - 8 * s, ymax = cy + 8 * s)
  # LED
  led <- data.frame(x0 = cx + 12 * s, y0 = cy, r = 2 * s)
  # wrench diagonal across
  # handle
  w_handle <- data.frame(x = c(cx - 22 * s, cx - 6 * s), y = c(cy - 22 * s, cy - 6 * s))
  # jaw
  jaw <- data.frame(
    x = c(cx - 6 * s, cx + 2 * s, cx + 6 * s, cx - 2 * s),
    y = c(cy - 6 * s, cy + 2 * s, cy - 2 * s, cy + 6 * s)
  )
  list(
    ggplot2::geom_rect(data = srv, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = led, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = 1),
    ggplot2::geom_path(data = w_handle, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = jaw, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  )
}

# ── glyph_debug_cable: broken cable + repair ────────────────────────────
glyph_debug_cable <- function(cx, cy, s, col, bright) {
  # left cable segment
  c1 <- data.frame(x = c(cx - 28 * s, cx - 6 * s), y = c(cy, cy))
  # right cable segment
  c2 <- data.frame(x = c(cx + 6 * s, cx + 28 * s), y = c(cy, cy))
  # broken ends (zigzag)
  zig <- data.frame(
    x = c(cx - 6 * s, cx - 2 * s, cx + 2 * s, cx + 6 * s),
    y = c(cy, cy + 6 * s, cy - 6 * s, cy)
  )
  # repair spark
  sp1 <- data.frame(x = c(cx - 3 * s, cx + 3 * s), y = c(cy + 10 * s, cy + 14 * s))
  sp2 <- data.frame(x = c(cx + 3 * s, cx - 3 * s), y = c(cy + 10 * s, cy + 14 * s))
  # wrench below
  w <- data.frame(x = c(cx - 8 * s, cx + 8 * s), y = c(cy - 14 * s, cy - 14 * s))
  list(
    ggplot2::geom_path(data = c1, .aes(x, y), color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = c2, .aes(x, y), color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = zig, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = sp1, .aes(x, y), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = sp2, .aes(x, y), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = w, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
}
