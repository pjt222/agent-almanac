# primitives_9.R - Glyph library part 9: General containerization + ShinyProxy (7)
# Sourced by build-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# General containerization glyphs (6) + ShinyProxy (1)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_dockerfile: document with container whale fin ──────────────────────
glyph_dockerfile <- function(cx, cy, s, col, bright) {
  # Document body with folded corner
  doc <- data.frame(
    x = c(cx - 16 * s, cx + 10 * s, cx + 16 * s, cx + 16 * s, cx - 16 * s),
    y = c(cy + 24 * s, cy + 24 * s, cy + 18 * s, cy - 24 * s, cy - 24 * s)
  )
  # Folded corner
  fold <- data.frame(
    x = c(cx + 10 * s, cx + 16 * s, cx + 10 * s),
    y = c(cx + 24 * s, cy + 18 * s, cy + 18 * s)
  )
  # Code lines (representing FROM, RUN, COPY, CMD)
  lines <- list()
  for (i in 1:4) {
    w <- c(18, 24, 20, 14)[i] * s
    yy <- cy + (12 - i * 8) * s
    lines[[i]] <- data.frame(
      x = c(cx - 10 * s, cx - 10 * s + w),
      y = c(yy, yy)
    )
  }
  # Small whale fin on top-left (Docker signature)
  fin_t <- seq(0, pi, length.out = 20)
  fin_r <- 6 * s
  fin <- data.frame(
    x = cx - 8 * s + fin_r * cos(fin_t),
    y = cy + 16 * s + fin_r * sin(fin_t) * 0.5
  )
  list(
    ggplot2::geom_polygon(data = doc, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = fold, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = lines[[1]], .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = lines[[2]], .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = lines[[3]], .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = lines[[4]], .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = fin, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.8))
  )
}

# ── glyph_multistage_build: two boxes with arrow (builder → runtime) ────────
glyph_multistage_build <- function(cx, cy, s, col, bright) {
  # Builder stage (left, larger, dashed feel via lower alpha)
  builder <- data.frame(
    xmin = cx - 28 * s, xmax = cx - 4 * s,
    ymin = cy - 14 * s, ymax = cy + 14 * s
  )
  # Runtime stage (right, smaller, brighter)
  runtime <- data.frame(
    xmin = cx + 4 * s, xmax = cx + 28 * s,
    ymin = cy - 10 * s, ymax = cy + 10 * s
  )
  # Arrow from builder to runtime
  arrow_df <- data.frame(
    x = cx - 3 * s, xend = cx + 3 * s,
    y = cy, yend = cy
  )
  # Gear icon in builder (build tools)
  gear_t <- seq(0, 2 * pi, length.out = 9)
  gear_r <- 5 * s
  gear <- data.frame(
    x = cx - 16 * s + gear_r * cos(gear_t),
    y = cy + gear_r * sin(gear_t)
  )
  # Binary dot in runtime (compiled artifact)
  artifact <- data.frame(x = cx + 16 * s, y = cy)
  # Labels: "B" and "R" as dots to suggest stages
  b_dots <- data.frame(
    x = c(cx - 20 * s, cx - 12 * s),
    y = rep(cy + 10 * s, 2)
  )
  r_dot <- data.frame(
    x = cx + 16 * s,
    y = cy + 7 * s
  )
  list(
    # Builder box
    ggplot2::geom_rect(data = builder,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.8)),
    # Runtime box
    ggplot2::geom_rect(data = runtime,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.18), color = bright, linewidth = .lw(s, 2.2)),
    # Arrow
    ggplot2::geom_segment(data = arrow_df,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 3),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.15, "inches"))),
    # Gear in builder
    ggplot2::geom_polygon(data = gear, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.2)),
    # Artifact in runtime
    ggplot2::geom_point(data = artifact, .aes(x, y),
      color = bright, size = 7 * s),
    # Stage indicator dots
    ggplot2::geom_point(data = b_dots, .aes(x, y),
      color = col, size = 2 * s),
    ggplot2::geom_point(data = r_dot, .aes(x, y),
      color = bright, size = 2.5 * s)
  )
}

# ── glyph_compose_services: multi-service grid with connections ──────────────
glyph_compose_services <- function(cx, cy, s, col, bright) {
  layers <- list()

  # 4 service boxes in 2x2 grid
  positions <- list(
    c(cx - 14 * s, cy + 12 * s),  # web app (top-left)
    c(cx + 14 * s, cy + 12 * s),  # database (top-right)
    c(cx - 14 * s, cy - 12 * s),  # cache (bottom-left)
    c(cx + 14 * s, cy - 12 * s)   # worker (bottom-right)
  )
  fills <- c(0.2, 0.15, 0.12, 0.1)
  for (i in seq_along(positions)) {
    px <- positions[[i]][1]; py <- positions[[i]][2]
    box <- data.frame(
      xmin = px - 10 * s, xmax = px + 10 * s,
      ymin = py - 7 * s, ymax = py + 7 * s
    )
    border_col <- if (i == 1) bright else col
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = box,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, fills[i]), color = border_col, linewidth = .lw(s, 1.6))
  }
  # Connections: web→db, web→cache, worker→db, worker→cache
  conns <- list(c(1, 2), c(1, 3), c(4, 2), c(4, 3))
  for (cn in conns) {
    line <- data.frame(
      x = c(positions[[cn[1]]][1], positions[[cn[2]]][1]),
      y = c(positions[[cn[1]]][2], positions[[cn[2]]][2])
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1))
  }
  # Health check heartbeat on the main app box
  hb_x <- seq(-6, 6, length.out = 15) * s + positions[[1]][1]
  hb_y <- positions[[1]][2] + c(0, 0, 0, 2, -3, 5, -4, 3, 0, 0, 0, 1, -1, 0, 0) * s
  hb <- data.frame(x = hb_x, y = hb_y)
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = hb, .aes(x, y),
    color = bright, linewidth = .lw(s, 1.8))
  layers
}

# ── glyph_nginx_shield: N-shape with shield/proxy arrow ─────────────────────
glyph_nginx_shield <- function(cx, cy, s, col, bright) {
  # Stylized "N" shape
  n_path <- data.frame(
    x = c(cx - 16 * s, cx - 16 * s, cx + 16 * s, cx + 16 * s),
    y = c(cy - 20 * s, cy + 20 * s, cy - 20 * s, cy + 20 * s)
  )
  # Shield outline around the N
  sh <- 26 * s
  shield <- data.frame(
    x = c(cx, cx - sh, cx - sh, cx - sh * 0.6, cx, cx + sh * 0.6, cx + sh, cx + sh),
    y = c(cy - sh, cy - sh * 0.4, cy + sh * 0.5, cy + sh * 0.85, cy + sh, cy + sh * 0.85, cy + sh * 0.5, cy - sh * 0.4)
  )
  # Forward arrow (proxy direction)
  arr <- data.frame(
    x = cx - 8 * s, xend = cx + 8 * s,
    y = cy - 10 * s, yend = cy - 10 * s
  )
  # Lock indicator dot at top
  lock_dot <- data.frame(x = cx, y = cy + 22 * s)
  list(
    # Shield
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    # N letterform
    ggplot2::geom_path(data = n_path, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    # Proxy arrow
    ggplot2::geom_segment(data = arr,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.12, "inches"))),
    # Lock dot
    ggplot2::geom_point(data = lock_dot, .aes(x, y),
      color = bright, size = 4 * s)
  )
}

# ── glyph_proxy_routes: fan-out from single entry to multiple backends ──────
glyph_proxy_routes <- function(cx, cy, s, col, bright) {
  # Entry point (left circle)
  entry <- data.frame(x = cx - 24 * s, y = cy)
  # Three backend targets (right side)
  targets <- list(
    data.frame(x = cx + 22 * s, y = cy + 18 * s),
    data.frame(x = cx + 22 * s, y = cy),
    data.frame(x = cx + 22 * s, y = cy - 18 * s)
  )
  # Route lines from entry to each target
  route_layers <- list()
  for (i in seq_along(targets)) {
    line <- data.frame(
      x = c(entry$x, cx - 4 * s, targets[[i]]$x),
      y = c(entry$y, entry$y, targets[[i]]$y)
    )
    route_layers[[i]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = if (i == 2) bright else col, linewidth = .lw(s, 1.8))
  }
  # Backend boxes
  backend_layers <- list()
  for (i in seq_along(targets)) {
    box <- data.frame(
      xmin = targets[[i]]$x - 5 * s, xmax = targets[[i]]$x + 5 * s,
      ymin = targets[[i]]$y - 5 * s, ymax = targets[[i]]$y + 5 * s
    )
    backend_layers[[i]] <- ggplot2::geom_rect(data = box,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15 + 0.05 * i), color = col, linewidth = .lw(s, 1.2))
  }
  # Central routing diamond
  diamond <- data.frame(
    x = c(cx - 4 * s, cx + 4 * s, cx + 12 * s, cx + 4 * s),
    y = c(cy, cy + 8 * s, cy, cy - 8 * s)
  )
  c(
    list(
      # Entry globe
      ggplot2::geom_point(data = entry, .aes(x, y),
        color = bright, size = 8 * s),
      # Routing diamond
      ggplot2::geom_polygon(data = diamond, .aes(x, y),
        fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5))
    ),
    route_layers,
    backend_layers
  )
}

# ── glyph_search_lens_shield: magnifier + privacy shield (SearXNG) ──────────
glyph_search_lens_shield <- function(cx, cy, s, col, bright) {
  # Magnifying glass lens (circle)
  lens_t <- seq(0, 2 * pi, length.out = 50)
  lens_r <- 16 * s
  lens <- data.frame(
    x = cx - 4 * s + lens_r * cos(lens_t),
    y = cy + 4 * s + lens_r * sin(lens_t)
  )
  # Handle
  handle <- data.frame(
    x = c(cx + 7 * s, cx + 22 * s),
    y = c(cy - 7 * s, cy - 22 * s)
  )
  # Privacy shield inside the lens
  sh <- 8 * s
  shield <- data.frame(
    x = c(cx - 4 * s, cx - 4 * s - sh, cx - 4 * s - sh * 0.6, cx - 4 * s,
          cx - 4 * s + sh * 0.6, cx - 4 * s + sh),
    y = c(cy + 4 * s - sh, cy + 4 * s, cy + 4 * s + sh * 0.7, cy + 4 * s + sh,
          cy + 4 * s + sh * 0.7, cy + 4 * s)
  )
  # Checkmark in shield
  check <- data.frame(
    x = c(cx - 7 * s, cx - 4 * s, cx),
    y = c(cy + 4 * s, cy + 1 * s, cy + 9 * s)
  )
  # Search result lines below lens
  result_lines <- list()
  for (i in 1:3) {
    w <- (20 - i * 3) * s
    result_lines[[i]] <- data.frame(
      x = c(cx - 18 * s, cx - 18 * s + w),
      y = rep(cy - 14 * s - i * 5 * s, 2)
    )
  }
  c(
    list(
      # Lens circle
      ggplot2::geom_polygon(data = lens, .aes(x, y),
        fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2)),
      # Handle
      ggplot2::geom_path(data = handle, .aes(x, y),
        color = bright, linewidth = .lw(s, 3.5)),
      # Shield inside lens
      ggplot2::geom_polygon(data = shield, .aes(x, y),
        fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.2)),
      # Checkmark
      ggplot2::geom_path(data = check, .aes(x, y),
        color = bright, linewidth = .lw(s, 2))
    ),
    lapply(result_lines, function(df) {
      ggplot2::geom_path(data = df, .aes(x, y),
        color = col, linewidth = .lw(s, 1.2))
    })
  )
}

# ── glyph_shinyproxy_grid: grid of app diamonds behind a proxy gateway ──────
glyph_shinyproxy_grid <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Gateway bar (top)
  gate <- data.frame(
    xmin = cx - 26 * s, xmax = cx + 26 * s,
    ymin = cy + 14 * s, ymax = cy + 22 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = gate,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2))

  # Lock icon on gateway
  lock <- data.frame(x = cx, y = cy + 18 * s)
  layers[[length(layers) + 1]] <- ggplot2::geom_point(data = lock, .aes(x, y),
    color = bright, size = 4 * s)

  # 3x2 grid of Shiny diamonds below gateway
  grid_positions <- list(
    c(cx - 16 * s, cy + 2 * s), c(cx, cy + 2 * s), c(cx + 16 * s, cy + 2 * s),
    c(cx - 16 * s, cy - 14 * s), c(cx, cy - 14 * s), c(cx + 16 * s, cy - 14 * s)
  )
  for (i in seq_along(grid_positions)) {
    px <- grid_positions[[i]][1]; py <- grid_positions[[i]][2]
    diamond_s <- 6 * s
    diamond <- data.frame(
      x = c(px, px - diamond_s, px, px + diamond_s),
      y = c(py + diamond_s, py, py - diamond_s, py)
    )
    alpha <- if (i <= 3) 0.2 else 0.12
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = diamond, .aes(x, y),
      fill = hex_with_alpha(col, alpha), color = col, linewidth = .lw(s, 1.2))
  }

  # Connection lines from gateway to top row
  for (i in 1:3) {
    px <- grid_positions[[i]][1]
    conn <- data.frame(
      x = c(px, px),
      y = c(cy + 14 * s, cy + 8 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = conn, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1))
  }

  layers
}
