# primitives_3.R - Glyph library part 3: MLOps, Observability, PM, R-packages, Reporting, Review, Web-dev, Esoteric, Design
# Sourced by build-icons.R

# ── MLOps glyphs ─────────────────────────────────────────────────────────

glyph_experiment_flask <- function(cx, cy, s, col, bright) {
  # flask body
  flask <- data.frame(
    x = c(cx - 6 * s, cx - 6 * s, cx - 18 * s, cx + 18 * s, cx + 6 * s, cx + 6 * s),
    y = c(cy + 20 * s, cy + 4 * s, cy - 20 * s, cy - 20 * s, cy + 4 * s, cy + 20 * s)
  )
  # rim
  rim <- data.frame(x = c(cx - 8 * s, cx + 8 * s), y = c(cy + 20 * s, cy + 20 * s))
  # liquid level
  liquid <- data.frame(
    x = c(cx - 14 * s, cx + 14 * s, cx + 6 * s, cx - 6 * s),
    y = c(cy - 14 * s, cy - 14 * s, cy, cy)
  )
  # bubbles
  b1 <- data.frame(x0 = cx - 4 * s, y0 = cy - 8 * s, r = 2 * s)
  b2 <- data.frame(x0 = cx + 3 * s, y0 = cy - 4 * s, r = 1.5 * s)
  list(
    ggplot2::geom_polygon(data = flask, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = liquid, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = NA),
    ggplot2::geom_path(data = rim, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = b1, .aes(x0 = x0, y0 = y0, r = r), fill = NA, color = bright, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = b2, .aes(x0 = x0, y0 = y0, r = r), fill = NA, color = bright, linewidth = .lw(s, 1))
  )
}

glyph_model_registry <- function(cx, cy, s, col, bright) {
  box <- data.frame(xmin = cx - 18 * s, xmax = cx + 18 * s, ymin = cy - 14 * s, ymax = cy + 14 * s)
  tag <- data.frame(
    x = c(cx + 10 * s, cx + 22 * s, cx + 22 * s, cx + 10 * s),
    y = c(cy + 8 * s, cy + 8 * s, cy - 2 * s, cy - 2 * s)
  )
  # version lines
  v1 <- data.frame(x = c(cx - 12 * s, cx + 4 * s), y = c(cy + 6 * s, cy + 6 * s))
  v2 <- data.frame(x = c(cx - 12 * s, cx + 4 * s), y = c(cy, cy))
  v3 <- data.frame(x = c(cx - 12 * s, cx + 4 * s), y = c(cy - 6 * s, cy - 6 * s))
  list(
    ggplot2::geom_rect(data = box, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = tag, .aes(x, y),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = v1, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = v2, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = v3, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

glyph_serve_endpoint <- function(cx, cy, s, col, bright) {
  # server box
  srv <- data.frame(xmin = cx - 16 * s, xmax = cx + 16 * s, ymin = cy - 6 * s, ymax = cy + 14 * s)
  # arrow out (serving)
  arr <- data.frame(x = cx, xend = cx, y = cy - 6 * s, yend = cy - 22 * s)
  # endpoint circle
  ep <- data.frame(x0 = cx, y0 = cy - 24 * s, r = 4 * s)
  # API lines on server
  l1 <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy + 8 * s, cy + 8 * s))
  l2 <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy + 2 * s, cy + 2 * s))
  list(
    ggplot2::geom_rect(data = srv, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = l1, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = l2, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = arr, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2.5), arrow = ggplot2::arrow(length = ggplot2::unit(0.15, "inches"))),
    ggforce::geom_circle(data = ep, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_table_store <- function(cx, cy, s, col, bright) {
  # table grid
  frame <- data.frame(xmin = cx - 22 * s, xmax = cx + 22 * s, ymin = cy - 16 * s, ymax = cy + 16 * s)
  # header row
  hdr <- data.frame(xmin = cx - 22 * s, xmax = cx + 22 * s, ymin = cy + 8 * s, ymax = cy + 16 * s)
  layers <- list(
    ggplot2::geom_rect(data = frame, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_rect(data = hdr, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
  # column lines
  for (dx in c(-8, 8) * s) {
    vl <- data.frame(x = c(cx + dx, cx + dx), y = c(cy - 16 * s, cy + 16 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = vl, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  }
  # row lines
  for (dy in c(0, -8) * s) {
    hl <- data.frame(x = c(cx - 22 * s, cx + 22 * s), y = c(cy + dy, cy + dy))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = hl, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  }
  # key icon in header
  layers[[length(layers) + 1]] <- ggplot2::geom_point(
    data = data.frame(x = cx - 16 * s, y = cy + 12 * s), .aes(x, y), color = bright, size = 3 * s)
  layers
}

glyph_version_branch <- function(cx, cy, s, col, bright) {
  # data cylinder
  t <- seq(0, 2 * pi, length.out = 40)
  w <- 14 * s; ell <- 4 * s
  body <- data.frame(x = c(cx - w, cx - w, cx + w, cx + w), y = c(cy + 10 * s, cy - 4 * s, cy - 4 * s, cy + 10 * s))
  top <- data.frame(x = cx + w * cos(t), y = cy + 10 * s + ell * sin(t))
  # version tags branching off
  tags <- list(
    data.frame(x = c(cx + w, cx + w + 12 * s), y = c(cy + 6 * s, cy + 14 * s)),
    data.frame(x = c(cx + w, cx + w + 12 * s), y = c(cy, cy - 8 * s)),
    data.frame(x = c(cx + w, cx + w + 12 * s), y = c(cy - 4 * s, cy - 18 * s))
  )
  layers <- list(
    ggplot2::geom_polygon(data = body, .aes(x, y), fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = top, .aes(x, y), fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))
  )
  for (i in seq_along(tags)) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = tags[[i]], .aes(x, y), color = bright, linewidth = .lw(s, 2))
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = tags[[i]]$x[2], y = tags[[i]]$y[2]), .aes(x, y), color = bright, size = 4 * s)
  }
  layers
}

glyph_dag_pipeline <- function(cx, cy, s, col, bright) {
  # DAG nodes
  nodes <- list(c(-20, 14), c(0, 14), c(-10, 0), c(10, 0), c(0, -14), c(20, -14))
  edges <- list(c(1,3), c(2,3), c(2,4), c(3,5), c(4,5), c(4,6))
  layers <- list()
  for (e in edges) {
    from <- nodes[[e[1]]]; to <- nodes[[e[2]]]
    line <- data.frame(x = c(cx + from[1] * s, cx + to[1] * s), y = c(cy + from[2] * s, cy + to[2] * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  }
  for (n in nodes) {
    df <- data.frame(x0 = cx + n[1] * s, y0 = cy + n[2] * s, r = 5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2))
  }
  layers
}

glyph_drift_curve <- function(cx, cy, s, col, bright) {
  t <- seq(-3, 3, length.out = 50)
  # original distribution
  y1 <- 24 * s * dnorm(t, 0, 1) / dnorm(0, 0, 1)
  d1 <- data.frame(x = cx + t * 8 * s, y = cy - 8 * s + y1)
  # shifted distribution
  y2 <- 20 * s * dnorm(t, 1, 1.2) / dnorm(0, 0, 1)
  d2 <- data.frame(x = cx + t * 8 * s, y = cy - 8 * s + y2)
  # shift arrow
  arr <- data.frame(x = cx - 4 * s, xend = cx + 10 * s, y = cy + 18 * s, yend = cy + 18 * s)
  list(
    ggplot2::geom_path(data = d1, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = d2, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_segment(data = arr, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2), arrow = ggplot2::arrow(length = ggplot2::unit(0.15, "inches")))
  )
}

glyph_split_ab <- function(cx, cy, s, col, bright) {
  # vertical split line
  split <- data.frame(x = c(cx, cx), y = c(cy - 24 * s, cy + 24 * s))
  # A side
  a_box <- data.frame(xmin = cx - 24 * s, xmax = cx - 4 * s, ymin = cy - 16 * s, ymax = cy + 16 * s)
  # B side
  b_box <- data.frame(xmin = cx + 4 * s, xmax = cx + 24 * s, ymin = cy - 16 * s, ymax = cy + 16 * s)
  # A and B indicators
  a_dot <- data.frame(x0 = cx - 14 * s, y0 = cy, r = 6 * s)
  b_dot <- data.frame(x0 = cx + 14 * s, y0 = cy, r = 6 * s)
  list(
    ggplot2::geom_rect(data = a_box, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = b_box, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = split, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggforce::geom_circle(data = a_dot, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.3), color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = b_dot, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_auto_tune <- function(cx, cy, s, col, bright) {
  layers <- list()
  # knobs (3)
  for (i in 1:3) {
    kx <- cx + (i - 2) * 16 * s
    df <- data.frame(x0 = kx, y0 = cy + 4 * s, r = 7 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2))
    # pointer
    angle <- c(-0.5, 0.3, 0.8)[i] * pi
    ptr <- data.frame(x = c(kx, kx + 5 * s * cos(angle)), y = c(cy + 4 * s, cy + 4 * s + 5 * s * sin(angle)))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ptr, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  }
  # auto refresh arrows below
  r <- 8 * s
  t1 <- seq(0.2, 2.8, length.out = 20)
  auto_arc <- data.frame(x = cx + r * cos(t1), y = cy - 18 * s + r * sin(t1))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = auto_arc, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers
}

glyph_anomaly_spike <- function(cx, cy, s, col, bright) {
  t <- seq(-28, 28, length.out = 60) * s
  y_base <- cy + 3 * s * sin(t / (5 * s) * pi)
  # spike in the middle
  spike_idx <- 28:33
  y_base[spike_idx] <- cy + c(4, 12, 24, 22, 8, 2) * s
  df <- data.frame(x = cx + t, y = y_base)
  # baseline
  base_line <- data.frame(x = c(cx - 28 * s, cx + 28 * s), y = c(cy, cy))
  # alert triangle at spike top
  tri <- data.frame(
    x = c(cx - 4 * s, cx, cx + 4 * s),
    y = c(cy + 20 * s, cy + 28 * s, cy + 20 * s)
  )
  list(
    ggplot2::geom_path(data = base_line, .aes(x, y), color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = df, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = tri, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_forecast_line <- function(cx, cy, s, col, bright) {
  # historical data
  t <- seq(-24, 0, length.out = 20) * s
  y_hist <- cy + cumsum(c(0, rnorm(19, 0.5, 1))) * s
  set.seed(99)
  y_hist <- cy + c(-8, -6, -4, -5, -2, 0, 2, 1, 4, 5, 6, 5, 8, 7, 9, 10, 8, 11, 12, 14) * s
  hist_df <- data.frame(x = cx + t, y = y_hist)
  # forecast (dashed feel - just brighter)
  t_f <- seq(0, 18, length.out = 12) * s
  y_f <- cy + c(14, 15, 17, 18, 20, 21, 22, 24, 25, 26, 28, 30) * s
  fore_df <- data.frame(x = cx + t_f, y = y_f)
  # confidence band
  band_upper <- data.frame(x = cx + t_f, y = y_f + seq(2, 8, length.out = 12) * s)
  band_lower <- data.frame(x = cx + t_f, y = y_f - seq(2, 8, length.out = 12) * s)
  list(
    ggplot2::geom_path(data = hist_df, .aes(x, y), color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = fore_df, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = band_upper, .aes(x, y), color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = band_lower, .aes(x, y), color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1))
  )
}

glyph_label_tag <- function(cx, cy, s, col, bright) {
  # tag shape
  tag <- data.frame(
    x = c(cx - 18 * s, cx + 12 * s, cx + 20 * s, cx + 12 * s, cx - 18 * s),
    y = c(cy + 10 * s, cy + 10 * s, cy, cy - 10 * s, cy - 10 * s)
  )
  hole <- data.frame(x0 = cx - 10 * s, y0 = cy, r = 3.5 * s)
  # annotation marker (pen tip)
  pen <- data.frame(x = c(cx + 6 * s, cx + 6 * s, cx + 10 * s),
                    y = c(cy + 4 * s, cy - 4 * s, cy))
  list(
    ggplot2::geom_polygon(data = tag, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggforce::geom_circle(data = hole, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = pen, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

# ── Observability glyphs ─────────────────────────────────────────────────

glyph_prometheus_fire <- function(cx, cy, s, col, bright) {
  # flame (reuse flame shape but with metrics overlay)
  t <- seq(0, 1, length.out = 30)
  hw <- 16 * s; h <- 32 * s
  lx <- cx - hw * sin(t * pi) * (1 - t^0.6)
  ly <- cy - h / 2 + h * t
  df <- data.frame(x = c(lx, rev(cx + hw * sin(rev(t) * pi) * (1 - rev(t)^0.6))), y = c(ly, rev(ly)))
  # metrics lines overlaid
  m1 <- data.frame(x = c(cx - 10 * s, cx - 4 * s, cx + 2 * s, cx + 8 * s),
                   y = c(cy - 6 * s, cy, cy - 4 * s, cy + 4 * s))
  list(
    ggplot2::geom_polygon(data = df, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = m1, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_dashboard_grid <- function(cx, cy, s, col, bright) {
  layers <- list()
  # 2x2 panel grid
  positions <- list(c(-12, 10), c(12, 10), c(-12, -10), c(12, -10))
  for (i in seq_along(positions)) {
    px <- cx + positions[[i]][1] * s; py <- cy + positions[[i]][2] * s
    df <- data.frame(xmin = px - 10 * s, xmax = px + 10 * s, ymin = py - 8 * s, ymax = py + 8 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1 + 0.04 * i), color = bright, linewidth = .lw(s, 1.5))
  }
  # mini chart in top-left
  mc <- data.frame(x = cx + c(-18, -14, -10, -6) * s, y = cy + c(6, 12, 8, 14) * s)
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = mc, .aes(x, y), color = bright, linewidth = .lw(s, 1.5))
  # mini bar in top-right
  for (j in 1:3) {
    bar <- data.frame(xmin = cx + (4 + j * 4) * s, xmax = cx + (6 + j * 4) * s,
                      ymin = cy + 4 * s, ymax = cy + (4 + j * 3) * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = NA)
  }
  layers
}

glyph_log_funnel <- function(cx, cy, s, col, bright) {
  # funnel
  funnel <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s, cx + 6 * s, cx + 6 * s, cx - 6 * s, cx - 6 * s),
    y = c(cy + 18 * s, cy + 18 * s, cy - 2 * s, cy - 18 * s, cy - 18 * s, cy - 2 * s)
  )
  # log lines going in
  lines <- lapply(1:4, function(i) {
    data.frame(x = c(cx - 18 * s + (i - 1) * 3 * s, cx + 10 * s - (i - 1) * 3 * s),
               y = c(cy + 18 * s + i * 3 * s, cy + 18 * s + i * 3 * s))
  })
  layers <- list(
    ggplot2::geom_polygon(data = funnel, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s))
  )
  for (l in lines) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  layers
}

glyph_trace_spans <- function(cx, cy, s, col, bright) {
  layers <- list()
  # horizontal span bars at different levels
  spans <- list(
    list(x = -20, w = 40, y = 14, col_f = 0.3),
    list(x = -10, w = 24, y = 4, col_f = 0.25),
    list(x = 0, w = 16, y = -6, col_f = 0.2),
    list(x = -6, w = 20, y = -16, col_f = 0.15)
  )
  for (sp in spans) {
    df <- data.frame(xmin = cx + sp$x * s, xmax = cx + (sp$x + sp$w) * s,
                     ymin = cy + sp$y * s - 3 * s, ymax = cy + sp$y * s + 3 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, sp$col_f), color = bright, linewidth = .lw(s, 1.5))
  }
  # connecting vertical lines
  for (i in 1:3) {
    conn_x <- cx + c(-10, 0, -6)[i] * s
    conn <- data.frame(x = c(conn_x, conn_x), y = c(cy + spans[[i]]$y * s - 3 * s, cy + spans[[i + 1]]$y * s + 3 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = conn, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  }
  layers
}

glyph_gauge_slo <- function(cx, cy, s, col, bright) {
  # gauge arc
  t <- seq(pi * 0.15, pi * 0.85, length.out = 30)
  r <- 26 * s
  arc <- data.frame(x = cx + r * cos(t), y = cy - 4 * s + r * sin(t))
  # needle pointing ~75%
  needle_angle <- pi * 0.35
  needle <- data.frame(x = c(cx, cx + 20 * s * cos(needle_angle)),
                       y = c(cy - 4 * s, cy - 4 * s + 20 * s * sin(needle_angle)))
  # center pivot
  pivot <- data.frame(x0 = cx, y0 = cy - 4 * s, r = 4 * s)
  # base
  base <- data.frame(x = c(cx - r, cx + r), y = c(cy - 4 * s, cy - 4 * s))
  list(
    ggplot2::geom_path(data = arc, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = base, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = needle, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = pivot, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_bell_alert <- function(cx, cy, s, col, bright) {
  # bell body
  t <- seq(0, pi, length.out = 30)
  bell_x <- cx + 18 * s * cos(t)
  bell_y <- cy - 4 * s + 22 * s * sin(t)
  bell <- data.frame(x = c(cx - 22 * s, bell_x, cx + 22 * s), y = c(cy - 10 * s, bell_y, cy - 10 * s))
  # clapper
  clapper <- data.frame(x0 = cx, y0 = cy - 14 * s, r = 4 * s)
  # alert lines
  l1 <- data.frame(x = c(cx - 10 * s, cx - 16 * s), y = c(cy + 22 * s, cy + 28 * s))
  l2 <- data.frame(x = c(cx + 10 * s, cx + 16 * s), y = c(cy + 22 * s, cy + 28 * s))
  l3 <- data.frame(x = c(cx, cx), y = c(cy + 24 * s, cy + 30 * s))
  list(
    ggplot2::geom_polygon(data = bell, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggforce::geom_circle(data = clapper, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = l1, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = l2, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = l3, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_runbook <- function(cx, cy, s, col, bright) {
  # book shape
  book <- data.frame(
    x = c(cx - 18 * s, cx - 18 * s, cx + 18 * s, cx + 18 * s),
    y = c(cy - 22 * s, cy + 22 * s, cy + 22 * s, cy - 22 * s)
  )
  spine <- data.frame(x = c(cx - 18 * s, cx - 18 * s), y = c(cy - 22 * s, cy + 22 * s))
  # step indicators
  layers <- list(
    ggplot2::geom_polygon(data = book, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = spine, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
  for (i in 1:4) {
    y <- cy + (3 - i) * 10 * s
    arr <- data.frame(x = cx - 10 * s, xend = cx + 10 * s, y = y, yend = y)
    layers[[length(layers) + 1]] <- ggplot2::geom_segment(data = arr,
      .aes(x = x, xend = xend, y = y, yend = yend), color = col, linewidth = .lw(s, 1.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.08, "inches")))
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = cx - 12 * s, y = y), .aes(x, y), color = bright, size = 2.5 * s)
  }
  layers
}

glyph_timeline <- function(cx, cy, s, col, bright) {
  # horizontal line
  base <- data.frame(x = c(cx - 28 * s, cx + 28 * s), y = c(cy, cy))
  layers <- list(ggplot2::geom_path(data = base, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)))
  # event markers
  events <- c(-20, -8, 4, 16) * s
  for (i in seq_along(events)) {
    ex <- cx + events[i]
    sign <- if (i %% 2 == 1) 1 else -1
    marker <- data.frame(x = c(ex, ex), y = c(cy, cy + sign * 14 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = marker, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = ex, y = cy + sign * 14 * s), .aes(x, y), color = bright, size = 4 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = ex, y = cy), .aes(x, y), color = bright, size = 3 * s)
  }
  layers
}

glyph_capacity_chart <- function(cx, cy, s, col, bright) {
  # growth curve
  t <- seq(-24, 24, length.out = 40) * s
  y_val <- cy - 14 * s + 28 * s / (1 + exp(-t / (8 * s)))
  df <- data.frame(x = cx + t, y = y_val)
  # ceiling line
  ceiling <- data.frame(x = c(cx - 28 * s, cx + 28 * s), y = c(cy + 16 * s, cy + 16 * s))
  # alert zone (shaded area near ceiling)
  list(
    ggplot2::geom_path(data = ceiling, .aes(x, y), color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = df, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
}

glyph_rotation_clock <- function(cx, cy, s, col, bright) {
  # clock face
  t <- seq(0, 2 * pi, length.out = 60)
  r <- 22 * s
  face <- data.frame(x = cx + r * cos(t), y = cy + r * sin(t))
  # hour marks
  layers <- list(ggplot2::geom_polygon(data = face, .aes(x, y),
    fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)))
  for (i in 1:12) {
    a <- i * pi / 6 - pi / 2
    m1 <- data.frame(x = c(cx + (r - 3 * s) * cos(a), cx + r * cos(a)),
                     y = c(cy + (r - 3 * s) * sin(a), cy + r * sin(a)))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = m1, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  # hands
  hour_hand <- data.frame(x = c(cx, cx + 10 * s * cos(pi / 3)), y = c(cy, cy + 10 * s * sin(pi / 3)))
  min_hand <- data.frame(x = c(cx, cx + 16 * s * cos(pi * 0.8)), y = c(cy, cy + 16 * s * sin(pi * 0.8)))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = hour_hand, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = min_hand, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  # rotation arrow
  t2 <- seq(pi * 0.1, pi * 0.6, length.out = 15)
  rot <- data.frame(x = cx + (r + 6 * s) * cos(t2), y = cy + (r + 6 * s) * sin(t2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = rot, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  layers
}

glyph_chaos_monkey <- function(cx, cy, s, col, bright) {
  # explosion / starburst
  layers <- list()
  n <- 10
  for (i in seq_len(n)) {
    a <- (i - 1) * 2 * pi / n
    r_out <- if (i %% 2 == 0) 28 * s else 16 * s
    line <- data.frame(x = c(cx, cx + r_out * cos(a)), y = c(cy, cy + r_out * sin(a)))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = if (i %% 2 == 0) bright else col, linewidth = .lw(s, 2.5))
  }
  # center circle
  center <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center, .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 2))
  layers
}

glyph_heartbeat <- function(cx, cy, s, col, bright) {
  # ECG line
  segments <- c(-28, -20, -16, -12, -8, -4, 0, 4, 8, 12, 16, 20, 28) * s
  heights <- c(0, 0, 2, -2, 0, -4, 18, -12, 4, 0, 0, 0, 0) * s
  df <- data.frame(x = cx + segments, y = cy + heights)
  list(ggplot2::geom_path(data = df, .aes(x, y), color = bright, linewidth = .lw(s, 3)))
}

glyph_signals_unified <- function(cx, cy, s, col, bright) {
  # three overlapping circles (metrics, logs, traces)
  c1 <- data.frame(x0 = cx - 10 * s, y0 = cy + 6 * s, r = 14 * s)
  c2 <- data.frame(x0 = cx + 10 * s, y0 = cy + 6 * s, r = 14 * s)
  c3 <- data.frame(x0 = cx, y0 = cy - 8 * s, r = 14 * s)
  # center intersection dot
  center <- data.frame(x0 = cx, y0 = cy, r = 4 * s)
  list(
    ggforce::geom_circle(data = c1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = c2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = c3, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = center, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2))
  )
}

# ── Project Management, R-packages, Reporting, Review, Web-dev, Esoteric, Design ──

glyph_charter_scroll <- function(cx, cy, s, col, bright) {
  # scroll body
  body <- data.frame(xmin = cx - 16 * s, xmax = cx + 16 * s, ymin = cy - 18 * s, ymax = cy + 18 * s)
  # curls at top and bottom
  t <- seq(0, pi, length.out = 20)
  curl_top <- data.frame(x = cx - 16 * s + 4 * s * cos(t), y = cy + 18 * s + 4 * s * sin(t))
  curl_bot <- data.frame(x = cx + 16 * s + 4 * s * cos(t + pi), y = cy - 18 * s + 4 * s * sin(t + pi))
  lines_layers <- list(
    ggplot2::geom_rect(data = body, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = curl_top, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = curl_bot, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  )
  for (i in 1:5) {
    ly <- cy + (3 - i) * 7 * s
    l <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(ly, ly))
    lines_layers[[length(lines_layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  lines_layers
}

glyph_wbs_tree <- function(cx, cy, s, col, bright) {
  # hierarchical boxes
  boxes <- list(c(0, 18, 16, 8), c(-18, 2, 12, 6), c(0, 2, 12, 6), c(18, 2, 12, 6),
                c(-22, -14, 10, 5), c(-14, -14, 10, 5), c(14, -14, 10, 5), c(22, -14, 10, 5))
  edges <- list(c(1,2), c(1,3), c(1,4), c(2,5), c(2,6), c(4,7), c(4,8))
  layers <- list()
  for (e in edges) {
    from <- boxes[[e[1]]]; to <- boxes[[e[2]]]
    line <- data.frame(x = c(cx + from[1] * s, cx + to[1] * s), y = c(cy + from[2] * s, cy + to[2] * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y), color = col, linewidth = .lw(s, 1.2))
  }
  for (b in boxes) {
    df <- data.frame(xmin = cx + b[1] * s - b[3] / 2 * s, xmax = cx + b[1] * s + b[3] / 2 * s,
                     ymin = cy + b[2] * s - b[4] / 2 * s, ymax = cy + b[2] * s + b[4] / 2 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))
  }
  layers
}

glyph_sprint_board <- function(cx, cy, s, col, bright) {
  layers <- list()
  # 3 columns
  for (i in 1:3) {
    bx <- cx + (i - 2) * 20 * s
    frame <- data.frame(xmin = bx - 8 * s, xmax = bx + 8 * s, ymin = cy - 22 * s, ymax = cy + 22 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = frame,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.06 + 0.04 * i), color = bright, linewidth = .lw(s, 1.2))
    # cards
    n_cards <- c(3, 2, 1)[i]
    for (j in seq_len(n_cards)) {
      card <- data.frame(xmin = bx - 6 * s, xmax = bx + 6 * s,
                         ymin = cy + 18 * s - j * 10 * s, ymax = cy + 24 * s - j * 10 * s)
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = card,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1))
    }
  }
  layers
}

glyph_backlog_stack <- function(cx, cy, s, col, bright) {
  layers <- list()
  for (i in 1:5) {
    y_off <- (3 - i) * 8 * s
    x_off <- (i - 3) * 1.5 * s
    df <- data.frame(xmin = cx - 18 * s + x_off, xmax = cx + 18 * s + x_off,
                     ymin = cy + y_off - 3 * s, ymax = cy + y_off + 3 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1 + 0.06 * i), color = bright, linewidth = .lw(s, 1.5))
  }
  layers
}

glyph_status_gauge <- function(cx, cy, s, col, bright) {
  glyph_gauge_slo(cx, cy, s, col, bright)
}

glyph_retro_mirror <- function(cx, cy, s, col, bright) {
  # mirror (oval)
  t <- seq(0, 2 * pi, length.out = 50)
  mirror <- data.frame(x = cx + 20 * s * cos(t), y = cy + 4 * s + 24 * s * sin(t) * 0.7)
  # reflection line
  ref <- data.frame(x = c(cx - 12 * s, cx + 12 * s), y = c(cy + 4 * s, cy + 4 * s))
  # arrows (looking back)
  a1 <- data.frame(x = cx - 10 * s, xend = cx - 18 * s, y = cy - 8 * s, yend = cy - 16 * s)
  a2 <- data.frame(x = cx + 10 * s, xend = cx + 18 * s, y = cy - 8 * s, yend = cy - 16 * s)
  list(
    ggplot2::geom_polygon(data = mirror, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = ref, .aes(x, y), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = a1, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2), arrow = ggplot2::arrow(length = ggplot2::unit(0.1, "inches"))),
    ggplot2::geom_segment(data = a2, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2), arrow = ggplot2::arrow(length = ggplot2::unit(0.1, "inches")))
  )
}

# ── R-packages ───────────────────────────────────────────────────────────

glyph_hexagon_r <- function(cx, cy, s, col, bright) {
  # R hex sticker style
  angles <- seq(0, 2 * pi, length.out = 7)[-7]
  r <- 28 * s
  hex <- data.frame(x = cx + r * cos(angles + pi / 6), y = cy + r * sin(angles + pi / 6))
  # R letter approximation
  r_body <- data.frame(x = c(cx - 8 * s, cx - 8 * s, cx + 4 * s, cx + 4 * s, cx - 8 * s),
                       y = c(cy - 12 * s, cy + 12 * s, cy + 12 * s, cy + 2 * s, cy + 2 * s))
  r_leg <- data.frame(x = c(cx, cx + 10 * s), y = c(cy + 2 * s, cy - 12 * s))
  # arc for R top
  t <- seq(-pi / 2, pi / 2, length.out = 15)
  r_arc <- data.frame(x = cx + 4 * s + 6 * s * cos(t), y = cy + 7 * s + 5 * s * sin(t))
  list(
    ggplot2::geom_polygon(data = hex, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = r_body, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = r_arc, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = r_leg, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_upload_check <- function(cx, cy, s, col, bright) {
  arr <- data.frame(x = cx - 8 * s, xend = cx - 8 * s, y = cy - 14 * s, yend = cy + 14 * s)
  ck <- data.frame(x = c(cx + 2 * s, cx + 8 * s, cx + 20 * s), y = c(cy - 2 * s, cy - 10 * s, cy + 10 * s))
  bar <- data.frame(x = c(cx - 18 * s, cx + 2 * s), y = c(cy + 14 * s, cy + 14 * s))
  list(
    ggplot2::geom_segment(data = arr, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 3), arrow = ggplot2::arrow(length = ggplot2::unit(0.18, "inches"))),
    ggplot2::geom_path(data = bar, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = ck, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
}

glyph_doc_pen <- function(cx, cy, s, col, bright) {
  # document
  doc <- data.frame(xmin = cx - 14 * s, xmax = cx + 10 * s, ymin = cy - 18 * s, ymax = cy + 18 * s)
  # pen diagonal
  pen_body <- data.frame(x = c(cx + 4 * s, cx + 22 * s), y = c(cy - 8 * s, cy + 14 * s))
  pen_tip <- data.frame(x = c(cx + 2 * s, cx + 6 * s, cx + 4 * s),
                        y = c(cy - 10 * s, cy - 10 * s, cy - 16 * s))
  lines_layers <- list(
    ggplot2::geom_rect(data = doc, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = pen_body, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = pen_tip, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 1))
  )
  for (i in 1:3) {
    ly <- cy + (2 - i) * 8 * s
    l <- data.frame(x = c(cx - 10 * s, cx + 2 * s), y = c(ly, ly))
    lines_layers[[length(lines_layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  lines_layers
}

glyph_test_tube <- function(cx, cy, s, col, bright) {
  # tube
  tube_body <- data.frame(x = c(cx - 6 * s, cx - 6 * s, cx + 6 * s, cx + 6 * s),
                          y = c(cy + 18 * s, cy - 12 * s, cy - 12 * s, cy + 18 * s))
  # rounded bottom
  t <- seq(pi, 2 * pi, length.out = 15)
  bottom <- data.frame(x = cx + 6 * s * cos(t), y = cy - 12 * s + 6 * s * sin(t))
  # liquid
  liquid <- data.frame(x = c(cx - 6 * s, cx - 6 * s, cx + 6 * s, cx + 6 * s),
                       y = c(cy + 4 * s, cy - 12 * s, cy - 12 * s, cy + 4 * s))
  # check mark
  ck <- data.frame(x = c(cx - 4 * s, cx, cx + 6 * s), y = c(cy - 4 * s, cy - 8 * s, cy + 2 * s))
  # rim
  rim <- data.frame(x = c(cx - 8 * s, cx + 8 * s), y = c(cy + 18 * s, cy + 18 * s))
  list(
    ggplot2::geom_polygon(data = tube_body, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = bottom, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = liquid, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = NA),
    ggplot2::geom_path(data = rim, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = ck, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_github_actions <- function(cx, cy, s, col, bright) {
  # gear
  r <- 16 * s
  t <- seq(0, 2 * pi, length.out = 60)
  teeth <- r + 3 * s * sin(8 * t)
  gear <- data.frame(x = cx + teeth * cos(t), y = cy + teeth * sin(t))
  inner <- data.frame(x0 = cx, y0 = cy, r = 7 * s)
  # play triangle in center
  play <- data.frame(
    x = c(cx - 4 * s, cx - 4 * s, cx + 6 * s),
    y = c(cy + 5 * s, cy - 5 * s, cy)
  )
  list(
    ggplot2::geom_polygon(data = gear, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = play, .aes(x, y),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_book_web <- function(cx, cy, s, col, bright) {
  # open book
  spine <- data.frame(x = c(cx, cx), y = c(cy - 16 * s, cy + 16 * s))
  left_page <- data.frame(x = c(cx, cx - 22 * s, cx - 22 * s, cx),
                          y = c(cy + 16 * s, cy + 14 * s, cy - 14 * s, cy - 16 * s))
  right_page <- data.frame(x = c(cx, cx + 22 * s, cx + 22 * s, cx),
                           y = c(cy + 16 * s, cy + 14 * s, cy - 14 * s, cy - 16 * s))
  # web icon (globe)
  globe <- data.frame(x0 = cx + 14 * s, y0 = cy, r = 8 * s)
  list(
    ggplot2::geom_polygon(data = left_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = right_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = spine, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggforce::geom_circle(data = globe, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_lock_tree <- function(cx, cy, s, col, bright) {
  # tree with lock
  lines <- list(
    data.frame(x = c(cx, cx - 14 * s), y = c(cy + 6 * s, cy - 8 * s)),
    data.frame(x = c(cx, cx + 14 * s), y = c(cy + 6 * s, cy - 8 * s)),
    data.frame(x = c(cx - 14 * s, cx - 20 * s), y = c(cy - 8 * s, cy - 20 * s)),
    data.frame(x = c(cx + 14 * s, cx + 20 * s), y = c(cy - 8 * s, cy - 20 * s))
  )
  lock_body <- data.frame(xmin = cx - 6 * s, xmax = cx + 6 * s, ymin = cy + 10 * s, ymax = cy + 22 * s)
  t <- seq(0, pi, length.out = 15)
  shackle <- data.frame(x = cx + 5 * s * cos(t), y = cy + 22 * s + 6 * s * sin(t))
  layers <- list(
    ggplot2::geom_rect(data = lock_body, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = shackle, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
  for (l in lines) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y), color = col, linewidth = .lw(s, 2))
  }
  # leaf nodes
  for (pos in list(c(-14, -8), c(14, -8), c(-20, -20), c(20, -20))) {
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = cx + pos[1] * s, y = cy + pos[2] * s), .aes(x, y), color = bright, size = 4 * s)
  }
  layers
}

glyph_bridge_cpp <- function(cx, cy, s, col, bright) {
  # bridge arch
  t <- seq(0, pi, length.out = 25)
  arch <- data.frame(x = cx + 24 * s * cos(t), y = cy + 12 * s * sin(t))
  # pillars
  p1 <- data.frame(x = c(cx - 24 * s, cx - 24 * s), y = c(cy, cy - 16 * s))
  p2 <- data.frame(x = c(cx + 24 * s, cx + 24 * s), y = c(cy, cy - 16 * s))
  # R on left
  r_mark <- data.frame(x0 = cx - 18 * s, y0 = cy - 8 * s, r = 6 * s)
  # C++ on right
  cpp_mark <- data.frame(x0 = cx + 18 * s, y0 = cy - 8 * s, r = 6 * s)
  # road
  road <- data.frame(x = c(cx - 28 * s, cx + 28 * s), y = c(cy, cy))
  list(
    ggplot2::geom_path(data = arch, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = p1, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = p2, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = road, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = r_mark, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = cpp_mark, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5))
  )
}

glyph_scroll_tutorial <- function(cx, cy, s, col, bright) { glyph_charter_scroll(cx, cy, s, col, bright) }
glyph_rocket_tag <- function(cx, cy, s, col, bright) { glyph_rocket_deploy(cx, cy, s, col, bright) }

glyph_rocket_deploy <- function(cx, cy, s, col, bright) {
  # rocket body
  body <- data.frame(
    x = c(cx - 6 * s, cx - 6 * s, cx - 4 * s, cx, cx + 4 * s, cx + 6 * s, cx + 6 * s),
    y = c(cy - 12 * s, cy + 8 * s, cy + 16 * s, cy + 22 * s, cy + 16 * s, cy + 8 * s, cy - 12 * s)
  )
  # fins
  fin_l <- data.frame(x = c(cx - 6 * s, cx - 14 * s, cx - 6 * s), y = c(cy - 6 * s, cy - 16 * s, cy - 12 * s))
  fin_r <- data.frame(x = c(cx + 6 * s, cx + 14 * s, cx + 6 * s), y = c(cy - 6 * s, cy - 16 * s, cy - 12 * s))
  # flame
  flame <- data.frame(
    x = c(cx - 4 * s, cx - 6 * s, cx, cx + 6 * s, cx + 4 * s),
    y = c(cy - 12 * s, cy - 22 * s, cy - 18 * s, cy - 22 * s, cy - 12 * s)
  )
  # window
  window <- data.frame(x0 = cx, y0 = cy + 6 * s, r = 3 * s)
  list(
    ggplot2::geom_polygon(data = body, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = fin_l, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = fin_r, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = flame, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = window, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── Reporting ────────────────────────────────────────────────────────────

glyph_quarto_diamond <- function(cx, cy, s, col, bright) {
  r <- 18 * s
  diamond <- data.frame(x = c(cx - r, cx, cx + r, cx), y = c(cy, cy + r, cy, cy - r))
  # doc behind
  doc <- data.frame(xmin = cx - 10 * s, xmax = cx + 22 * s, ymin = cy - 22 * s, ymax = cy + 22 * s)
  list(
    ggplot2::geom_rect(data = doc, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_polygon(data = diamond, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2.5))
  )
}

glyph_academic_paper <- function(cx, cy, s, col, bright) {
  doc <- data.frame(xmin = cx - 16 * s, xmax = cx + 16 * s, ymin = cy - 22 * s, ymax = cy + 22 * s)
  # citation bracket
  cite <- data.frame(x = c(cx - 10 * s, cx - 10 * s, cx + 10 * s, cx + 10 * s),
                     y = c(cy - 14 * s, cy - 18 * s, cy - 18 * s, cy - 14 * s))
  layers <- list(
    ggplot2::geom_rect(data = doc, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = cite, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  )
  for (i in 1:5) {
    ly <- cy + (3 - i) * 7 * s + 2 * s
    l <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(ly, ly))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y), color = col, linewidth = .lw(s, 1.2))
  }
  layers
}

glyph_template_params <- function(cx, cy, s, col, bright) {
  doc <- data.frame(xmin = cx - 16 * s, xmax = cx + 16 * s, ymin = cy - 18 * s, ymax = cy + 18 * s)
  # gear overlay
  gear_r <- 10 * s
  t <- seq(0, 2 * pi, length.out = 40)
  teeth <- gear_r + 2.5 * s * sin(6 * t)
  gear <- data.frame(x = cx + 10 * s + teeth * cos(t), y = cy - 10 * s + teeth * sin(t))
  list(
    ggplot2::geom_rect(data = doc, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = gear, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))
  )
}

glyph_table_stats <- function(cx, cy, s, col, bright) {
  # table
  frame <- data.frame(xmin = cx - 20 * s, xmax = cx + 20 * s, ymin = cy - 16 * s, ymax = cy + 16 * s)
  hdr <- data.frame(xmin = cx - 20 * s, xmax = cx + 20 * s, ymin = cy + 8 * s, ymax = cy + 16 * s)
  layers <- list(
    ggplot2::geom_rect(data = frame, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_rect(data = hdr, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
  # sigma symbol (dot approximation)
  layers[[length(layers) + 1]] <- ggplot2::geom_point(
    data = data.frame(x = cx, y = cy + 12 * s), .aes(x, y), color = bright, size = 5 * s)
  layers
}

# ── Review (magnifier variants) ──────────────────────────────────────────

.magnifier_base <- function(cx, cy, s, col, bright) {
  r <- 20 * s
  t <- seq(0, 2 * pi, length.out = 50)
  lens <- data.frame(x = cx - 4 * s + r * cos(t), y = cy + 4 * s + r * sin(t))
  handle <- data.frame(x = c(cx - 4 * s + r * cos(-pi / 4), cx - 4 * s + (r + 14 * s) * cos(-pi / 4)),
                       y = c(cy + 4 * s + r * sin(-pi / 4), cy + 4 * s + (r + 14 * s) * sin(-pi / 4)))
  list(
    ggplot2::geom_polygon(data = lens, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = handle, .aes(x, y), color = bright, linewidth = .lw(s, 3.5))
  )
}

glyph_magnifier_paper <- function(cx, cy, s, col, bright) {
  base <- .magnifier_base(cx, cy, s, col, bright)
  # paper lines inside lens
  for (i in 1:3) {
    ly <- cy + (2 - i) * 8 * s + 4 * s
    l <- data.frame(x = c(cx - 12 * s, cx + 6 * s), y = c(ly, ly))
    base[[length(base) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  }
  base
}

glyph_magnifier_chart <- function(cx, cy, s, col, bright) {
  base <- .magnifier_base(cx, cy, s, col, bright)
  # mini chart inside
  chart <- data.frame(x = cx + c(-10, -4, 2, 8) * s, y = cy + c(2, 10, 4, 12) * s)
  base[[length(base) + 1]] <- ggplot2::geom_path(data = chart, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  base[[length(base) + 1]] <- ggplot2::geom_point(data = chart, .aes(x, y), color = bright, size = 3 * s)
  base
}

glyph_magnifier_arch <- function(cx, cy, s, col, bright) {
  base <- .magnifier_base(cx, cy, s, col, bright)
  # architecture boxes inside
  boxes <- list(c(-8, 10, 8, 6), c(4, 10, 8, 6), c(-2, 0, 12, 6))
  for (b in boxes) {
    df <- data.frame(xmin = cx + b[1] * s - b[3] / 2 * s, xmax = cx + b[1] * s + b[3] / 2 * s,
                     ymin = cy + b[2] * s - b[4] / 2 * s + 4 * s, ymax = cy + b[2] * s + b[4] / 2 * s + 4 * s)
    base[[length(base) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1))
  }
  base
}

glyph_magnifier_layout <- function(cx, cy, s, col, bright) {
  base <- .magnifier_base(cx, cy, s, col, bright)
  # layout grid inside
  for (dx in c(-8, 0, 8) * s) {
    for (dy in c(-4, 4, 12) * s) {
      df <- data.frame(xmin = cx + dx - 3 * s, xmax = cx + dx + 3 * s,
                       ymin = cy + dy - 2 * s + 4 * s, ymax = cy + dy + 2 * s + 4 * s)
      base[[length(base) + 1]] <- ggplot2::geom_rect(data = df,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 0.8))
    }
  }
  base
}

glyph_magnifier_user <- function(cx, cy, s, col, bright) {
  base <- .magnifier_base(cx, cy, s, col, bright)
  # person silhouette inside
  head <- data.frame(x0 = cx - 4 * s, y0 = cy + 12 * s, r = 5 * s)
  t <- seq(0, pi, length.out = 20)
  body <- data.frame(x = cx - 4 * s + 10 * s * cos(t), y = cy + 2 * s + 6 * s * sin(t - pi))
  base[[length(base) + 1]] <- ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5))
  base[[length(base) + 1]] <- ggplot2::geom_path(data = body, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  base
}

# ── Web-dev ──────────────────────────────────────────────────────────────

glyph_nextjs_scaffold <- function(cx, cy, s, col, bright) {
  # N shape
  n_left <- data.frame(x = c(cx - 14 * s, cx - 14 * s), y = c(cy - 16 * s, cy + 16 * s))
  n_diag <- data.frame(x = c(cx - 14 * s, cx + 14 * s), y = c(cy + 16 * s, cy - 16 * s))
  n_right <- data.frame(x = c(cx + 14 * s, cx + 14 * s), y = c(cy - 16 * s, cy + 16 * s))
  # scaffold dots
  dots <- data.frame(x = cx + c(-20, -20, 20, 20) * s, y = cy + c(-20, 20, -20, 20) * s)
  list(
    ggplot2::geom_path(data = n_left, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = n_diag, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = n_right, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = col, size = 3 * s)
  )
}

glyph_tailwind_ts <- function(cx, cy, s, col, bright) {
  # wind curves
  w1 <- data.frame(x = cx + seq(-20, 20, length.out = 20) * s,
                   y = cy + 8 * s + 6 * s * sin(seq(0, 2 * pi, length.out = 20)))
  w2 <- data.frame(x = cx + seq(-16, 16, length.out = 20) * s,
                   y = cy - 4 * s + 4 * s * sin(seq(0, 2 * pi, length.out = 20)))
  # TS letters
  ts_box <- data.frame(xmin = cx + 6 * s, xmax = cx + 22 * s, ymin = cy - 20 * s, ymax = cy - 10 * s)
  list(
    ggplot2::geom_path(data = w1, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = w2, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_rect(data = ts_box, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5))
  )
}

glyph_graphql_query <- function(cx, cy, s, col, bright) {
  # Outer curly braces — left brace
  t_l <- seq(pi / 2, -pi / 2, length.out = 20)
  brace_l <- data.frame(
    x = cx - 16 * s + 6 * s * cos(t_l),
    y = cy + 18 * s * sin(t_l)
  )
  # Right brace
  t_r <- seq(pi / 2, -pi / 2, length.out = 20)
  brace_r <- data.frame(
    x = cx + 16 * s - 6 * s * cos(t_r),
    y = cy + 18 * s * sin(t_r)
  )
  # Field lines inside the braces
  fields <- lapply(c(8, 0, -8), function(dy) {
    data.frame(
      x    = cx - 8 * s,
      xend = cx + 6 * s,
      y    = cy + dy * s,
      yend = cy + dy * s
    )
  })
  # Small circle node at end of middle field line (graph traversal)
  node <- data.frame(x0 = cx + 10 * s, y0 = cy, r = 3 * s)
  layers <- list(
    ggplot2::geom_path(data = brace_l, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = brace_r, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = node, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5))
  )
  for (f in fields) {
    layers[[length(layers) + 1]] <- ggplot2::geom_segment(
      data = f, .aes(x = x, y = y, xend = xend, yend = yend),
      color = col, linewidth = .lw(s, 1.8)
    )
  }
  layers
}

# ── Esoteric ─────────────────────────────────────────────────────────────

glyph_healing_hands <- function(cx, cy, s, col, bright) {
  # two curved hand shapes
  t <- seq(0, pi, length.out = 20)
  hand_l <- data.frame(x = cx - 4 * s + 16 * s * cos(t + pi * 0.6), y = cy + 16 * s * sin(t + pi * 0.6) * 0.6)
  hand_r <- data.frame(x = cx + 4 * s + 16 * s * cos(pi - t + pi * 0.4), y = cy + 16 * s * sin(pi - t + pi * 0.4) * 0.6)
  # glow between
  glow <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  # energy lines
  layers <- list(
    ggplot2::geom_path(data = hand_l, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = hand_r, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = glow, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2))
  )
  for (a in seq(0, 2 * pi, length.out = 7)[-7]) {
    ray <- data.frame(x = c(cx + 8 * s * cos(a), cx + 14 * s * cos(a)),
                      y = c(cy + 8 * s * sin(a), cy + 14 * s * sin(a)))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ray, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  layers
}

glyph_lotus_seated <- function(cx, cy, s, col, bright) {
  # seated figure (simplified)
  head <- data.frame(x0 = cx, y0 = cy + 18 * s, r = 5 * s)
  # body triangle
  body <- data.frame(x = c(cx - 12 * s, cx, cx + 12 * s), y = c(cy - 10 * s, cy + 12 * s, cy - 10 * s))
  # crossed legs (oval)
  t <- seq(0, 2 * pi, length.out = 30)
  legs <- data.frame(x = cx + 16 * s * cos(t), y = cy - 14 * s + 4 * s * sin(t))
  list(
    ggplot2::geom_polygon(data = body, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_polygon(data = legs, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2))
  )
}

glyph_third_eye <- function(cx, cy, s, col, bright) {
  # eye shape
  t <- seq(0, pi, length.out = 30)
  eye_top <- data.frame(x = cx + 24 * s * cos(t), y = cy + 12 * s * sin(t))
  eye_bot <- data.frame(x = cx + 24 * s * cos(t), y = cy - 12 * s * sin(t))
  # pupil
  pupil <- data.frame(x0 = cx, y0 = cy, r = 7 * s)
  inner <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  # radiating lines
  layers <- list(
    ggplot2::geom_path(data = eye_top, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = eye_bot, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = pupil, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = 1)
  )
  for (a in seq(0, 2 * pi, length.out = 9)[-9]) {
    ray <- data.frame(x = c(cx + 18 * s * cos(a), cx + 26 * s * cos(a)),
                      y = c(cy + 18 * s * sin(a), cy + 26 * s * sin(a)))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ray, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── Design ───────────────────────────────────────────────────────────────

glyph_palette <- function(cx, cy, s, col, bright) {
  # palette shape
  t <- seq(0, 2 * pi, length.out = 50)
  pal <- data.frame(x = cx + 24 * s * cos(t), y = cy + 20 * s * sin(t) * 0.8)
  # thumb hole
  hole <- data.frame(x0 = cx + 8 * s, y0 = cy - 4 * s, r = 5 * s)
  # color dots
  dots <- data.frame(
    x = cx + c(-12, -4, 4, 12, -8) * s,
    y = cy + c(8, 12, 10, 6, 2) * s
  )
  list(
    ggplot2::geom_polygon(data = pal, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggforce::geom_circle(data = hole, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = bright, size = 5 * s)
  )
}

glyph_compass_drafting <- function(cx, cy, s, col, bright) {
  # two legs of compass
  leg_l <- data.frame(x = c(cx, cx - 14 * s), y = c(cy + 22 * s, cy - 18 * s))
  leg_r <- data.frame(x = c(cx, cx + 14 * s), y = c(cy + 22 * s, cy - 18 * s))
  # pivot
  pivot <- data.frame(x0 = cx, y0 = cy + 22 * s, r = 3 * s)
  # pencil tip on right leg
  tip <- data.frame(x = c(cx + 12 * s, cx + 16 * s, cx + 14 * s),
                    y = c(cy - 16 * s, cy - 16 * s, cy - 22 * s))
  # arc being drawn
  t <- seq(pi * 0.3, pi * 0.7, length.out = 20)
  arc_r <- 30 * s
  arc <- data.frame(x = cx + arc_r * cos(t - pi / 2), y = cy - 2 * s + arc_r * sin(t - pi / 2))
  list(
    ggplot2::geom_path(data = leg_l, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = leg_r, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = pivot, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = 1),
    ggplot2::geom_polygon(data = tip, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = arc, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── Esoteric guidance variants ─────────────────────────────────────────────

glyph_healing_hands_guide <- function(cx, cy, s, col, bright) {
  # healing hands shifted left, with a small figure (recipient) on right
  ox <- cx - 6 * s
  t <- seq(0, pi, length.out = 20)
  hand_l <- data.frame(x = ox - 3 * s + 12 * s * cos(t + pi * 0.6),
                        y = cy + 12 * s * sin(t + pi * 0.6) * 0.6)
  hand_r <- data.frame(x = ox + 3 * s + 12 * s * cos(pi - t + pi * 0.4),
                        y = cy + 12 * s * sin(pi - t + pi * 0.4) * 0.6)
  glow <- data.frame(x0 = ox, y0 = cy, r = 6 * s)
  # recipient figure (right side)
  fx <- cx + 16 * s
  fig_head <- data.frame(x0 = fx, y0 = cy + 12 * s, r = 4 * s)
  fig_body <- data.frame(x = c(fx, fx - 6 * s, fx + 6 * s),
                          y = c(cy + 7 * s, cy - 10 * s, cy - 10 * s))
  # energy arc connecting hands to figure
  arc_t <- seq(0, pi, length.out = 15)
  arc <- data.frame(x = ox + (fx - ox) / 2 + 12 * s * cos(arc_t),
                     y = cy + 4 * s + 8 * s * sin(arc_t))
  layers <- list(
    ggplot2::geom_path(data = hand_l, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = hand_r, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = glow, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = fig_head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = fig_body, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arc, .aes(x, y), color = col, linewidth = .lw(s, 1.2))
  )
  layers
}

glyph_lotus_seated_guide <- function(cx, cy, s, col, bright) {
  # seated figure (meditator) on right, guide figure on left
  # guide figure (standing, smaller)
  gx <- cx - 14 * s
  g_head <- data.frame(x0 = gx, y0 = cy + 16 * s, r = 3.5 * s)
  g_body <- data.frame(x = c(gx - 4 * s, gx, gx + 4 * s),
                        y = c(cy - 8 * s, cy + 12 * s, cy - 8 * s))
  # meditator (seated, right side)
  mx <- cx + 10 * s
  m_head <- data.frame(x0 = mx, y0 = cy + 16 * s, r = 4 * s)
  m_body <- data.frame(x = c(mx - 10 * s, mx, mx + 10 * s),
                        y = c(cy - 8 * s, cy + 10 * s, cy - 8 * s))
  t <- seq(0, 2 * pi, length.out = 30)
  m_legs <- data.frame(x = mx + 13 * s * cos(t), y = cy - 12 * s + 3.5 * s * sin(t))
  # sound/voice waves from guide to meditator
  w1 <- data.frame(x0 = (gx + mx) / 2 - 2 * s, y0 = cy + 6 * s, r = 3 * s)
  w2 <- data.frame(x0 = (gx + mx) / 2 + 2 * s, y0 = cy + 4 * s, r = 4 * s)
  list(
    ggforce::geom_circle(data = g_head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = g_body, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = m_body, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_polygon(data = m_legs, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.3)),
    ggforce::geom_circle(data = m_head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = w1, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = w2, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(bright, 0.25), linewidth = .lw(s, 0.8))
  )
}

glyph_third_eye_guide <- function(cx, cy, s, col, bright) {
  # third eye (smaller, upper area) with monitor/tasker figure below
  # eye shape (shifted up)
  ey <- cy + 8 * s
  t <- seq(0, pi, length.out = 30)
  eye_top <- data.frame(x = cx + 18 * s * cos(t), y = ey + 9 * s * sin(t))
  eye_bot <- data.frame(x = cx + 18 * s * cos(t), y = ey - 9 * s * sin(t))
  pupil <- data.frame(x0 = cx, y0 = ey, r = 5 * s)
  inner <- data.frame(x0 = cx, y0 = ey, r = 2.5 * s)
  # monitor figure below (person with clipboard)
  fy <- cy - 14 * s
  fig_head <- data.frame(x0 = cx, y0 = fy + 8 * s, r = 3.5 * s)
  fig_body <- data.frame(x = c(cx - 5 * s, cx, cx + 5 * s),
                          y = c(fy - 6 * s, fy + 4 * s, fy - 6 * s))
  # clipboard (small rectangle beside figure)
  clip <- data.frame(
    x = c(cx + 8 * s, cx + 16 * s, cx + 16 * s, cx + 8 * s),
    y = c(fy + 4 * s, fy + 4 * s, fy - 6 * s, fy - 6 * s)
  )
  clip_line1 <- data.frame(x = c(cx + 10 * s, cx + 14 * s),
                             y = c(fy + 1 * s, fy + 1 * s))
  clip_line2 <- data.frame(x = c(cx + 10 * s, cx + 14 * s),
                             y = c(fy - 2 * s, fy - 2 * s))
  list(
    ggplot2::geom_path(data = eye_top, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = eye_bot, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = pupil, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = 1),
    ggforce::geom_circle(data = fig_head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = fig_body, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = clip, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = clip_line1, .aes(x, y), color = col, linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = clip_line2, .aes(x, y), color = col, linewidth = .lw(s, 0.8))
  )
}

# ── Workflow-visualization glyphs ────────────────────────────────────────

glyph_putior_install <- function(cx, cy, s, col, bright) {
  # package box
  box <- data.frame(xmin = cx - 16 * s, xmax = cx + 16 * s, ymin = cy - 10 * s, ymax = cy + 14 * s)
  # "P" letter inside box
  p_stem <- data.frame(x = c(cx - 6 * s, cx - 6 * s), y = c(cy - 4 * s, cy + 10 * s))
  p_arc_t <- seq(-pi / 2, pi / 2, length.out = 15)
  p_arc <- data.frame(x = cx - 6 * s + 7 * s * cos(p_arc_t),
                       y = cy + 5 * s + 5 * s * sin(p_arc_t))
  # install arrow pointing down into box
  arr <- data.frame(x = cx, xend = cx, y = cy + 26 * s, yend = cy + 16 * s)
  arr_l <- data.frame(x = c(cx - 6 * s, cx), y = c(cy + 20 * s, cy + 14 * s))
  arr_r <- data.frame(x = c(cx + 6 * s, cx), y = c(cy + 20 * s, cy + 14 * s))
  list(
    ggplot2::geom_rect(data = box, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = p_stem, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = p_arc, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_segment(data = arr, .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.12, "inches"))),
    ggplot2::geom_path(data = arr_l, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = arr_r, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

glyph_workflow_scan <- function(cx, cy, s, col, bright) {
  # magnifier lens
  lens <- data.frame(x0 = cx - 4 * s, y0 = cy + 4 * s, r = 14 * s)
  # magnifier handle
  handle <- data.frame(x = c(cx + 6 * s, cx + 22 * s), y = c(cy - 6 * s, cy - 22 * s))
  # flowchart inside lens: three nodes with arrows
  n1 <- data.frame(xmin = cx - 14 * s, xmax = cx - 6 * s, ymin = cy + 8 * s, ymax = cy + 14 * s)
  n2 <- data.frame(xmin = cx - 4 * s, xmax = cx + 4 * s, ymin = cy, ymax = cy + 6 * s)
  n3 <- data.frame(xmin = cx - 14 * s, xmax = cx - 6 * s, ymin = cy - 8 * s, ymax = cy - 2 * s)
  e1 <- data.frame(x = c(cx - 6 * s, cx - 4 * s), y = c(cy + 10 * s, cy + 4 * s))
  e2 <- data.frame(x = c(cx - 4 * s, cx - 6 * s), y = c(cy, cy - 4 * s))
  list(
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = handle, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_rect(data = n1, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = n2, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = n3, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = e1, .aes(x, y), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = e2, .aes(x, y), color = col, linewidth = .lw(s, 1.2))
  )
}

glyph_annotation_tag <- function(cx, cy, s, col, bright) {
  # code lines (left side)
  layers <- list()
  for (i in 1:4) {
    w <- c(20, 14, 18, 12)[i] * s
    ly <- cy + (3 - i) * 8 * s + 4 * s
    line <- data.frame(x = c(cx - 20 * s, cx - 20 * s + w), y = c(ly, ly))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  }
  # annotation tag (right side) — label shape with "PUT" implied
  tag <- data.frame(
    x = c(cx + 2 * s, cx + 22 * s, cx + 26 * s, cx + 22 * s, cx + 2 * s),
    y = c(cy + 8 * s, cy + 8 * s, cy, cy - 8 * s, cy - 8 * s)
  )
  # hash/comment prefix inside tag
  hash1 <- data.frame(x = c(cx + 6 * s, cx + 10 * s), y = c(cy + 4 * s, cy + 4 * s))
  hash2 <- data.frame(x = c(cx + 6 * s, cx + 10 * s), y = c(cy - 2 * s, cy - 2 * s))
  # connecting arrow from tag to code
  conn <- data.frame(x = c(cx + 2 * s, cx - 6 * s), y = c(cy, cy))
  layers <- c(layers, list(
    ggplot2::geom_polygon(data = tag, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = hash1, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = hash2, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_segment(data = data.frame(x = cx + 2 * s, xend = cx - 6 * s, y = cy, yend = cy),
      .aes(x = x, xend = xend, y = y, yend = yend), color = col, linewidth = .lw(s, 1.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.08, "inches")))
  ))
  layers
}

glyph_mermaid_diagram <- function(cx, cy, s, col, bright) {
  # flowchart: 4 nodes in a diamond arrangement with directional arrows
  # top node
  n_top <- data.frame(xmin = cx - 8 * s, xmax = cx + 8 * s, ymin = cy + 14 * s, ymax = cy + 22 * s)
  # left node
  n_left <- data.frame(xmin = cx - 24 * s, xmax = cx - 8 * s, ymin = cy - 2 * s, ymax = cy + 6 * s)
  # right node
  n_right <- data.frame(xmin = cx + 8 * s, xmax = cx + 24 * s, ymin = cy - 2 * s, ymax = cy + 6 * s)
  # bottom node
  n_bot <- data.frame(xmin = cx - 8 * s, xmax = cx + 8 * s, ymin = cy - 22 * s, ymax = cy - 14 * s)
  # edges
  e_tl <- data.frame(x = c(cx - 4 * s, cx - 12 * s), y = c(cy + 14 * s, cy + 6 * s))
  e_tr <- data.frame(x = c(cx + 4 * s, cx + 12 * s), y = c(cy + 14 * s, cy + 6 * s))
  e_lb <- data.frame(x = c(cx - 12 * s, cx - 4 * s), y = c(cy - 2 * s, cy - 14 * s))
  e_rb <- data.frame(x = c(cx + 12 * s, cx + 4 * s), y = c(cy - 2 * s, cy - 14 * s))
  list(
    ggplot2::geom_rect(data = n_top, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = n_left, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = n_right, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = n_bot, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = e_tl, .aes(x, y), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = e_tr, .aes(x, y), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = e_lb, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = e_rb, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

glyph_ci_diagram <- function(cx, cy, s, col, bright) {
  # GitHub Actions gear (outer ring with teeth)
  t <- seq(0, 2 * pi, length.out = 50)
  gear_outer <- data.frame(x = cx - 8 * s + 12 * s * cos(t), y = cy + 4 * s + 12 * s * sin(t))
  gear_inner <- data.frame(x0 = cx - 8 * s, y0 = cy + 4 * s, r = 6 * s)
  # teeth (4 stubs)
  layers <- list(
    ggplot2::geom_polygon(data = gear_outer, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.8)),
    ggforce::geom_circle(data = gear_inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
  for (a in c(0, pi / 2, pi, 3 * pi / 2)) {
    tooth <- data.frame(
      x = c(cx - 8 * s + 11 * s * cos(a - 0.2), cx - 8 * s + 16 * s * cos(a),
            cx - 8 * s + 11 * s * cos(a + 0.2)),
      y = c(cy + 4 * s + 11 * s * sin(a - 0.2), cy + 4 * s + 16 * s * sin(a),
            cy + 4 * s + 11 * s * sin(a + 0.2))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = tooth, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 0.8))
  }
  # diagram output (right side) — small flowchart
  out_box <- data.frame(xmin = cx + 8 * s, xmax = cx + 22 * s, ymin = cy - 4 * s, ymax = cy + 4 * s)
  refresh <- data.frame(x = c(cx + 4 * s, cx + 8 * s), y = c(cy, cy))
  # re-generate arrow
  layers <- c(layers, list(
    ggplot2::geom_rect(data = out_box, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_segment(data = data.frame(x = cx + 4 * s, xend = cx + 8 * s, y = cy, yend = cy),
      .aes(x = x, xend = xend, y = y, yend = yend), color = bright, linewidth = .lw(s, 2),
      arrow = ggplot2::arrow(length = ggplot2::unit(0.08, "inches"))),
    # small diagram lines inside output box
    ggplot2::geom_path(data = data.frame(x = c(cx + 11 * s, cx + 19 * s), y = c(cy + 1 * s, cy + 1 * s)),
      .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = data.frame(x = c(cx + 11 * s, cx + 16 * s), y = c(cy - 2 * s, cy - 2 * s)),
      .aes(x, y), color = col, linewidth = .lw(s, 1))
  ))
  layers
}

glyph_putior_mcp <- function(cx, cy, s, col, bright) {
  # MCP server plug (left side)
  plug_body <- data.frame(xmin = cx - 22 * s, xmax = cx - 6 * s, ymin = cy - 8 * s, ymax = cy + 8 * s)
  # prongs
  p1 <- data.frame(x = c(cx - 6 * s, cx, cx, cx - 6 * s),
                    y = c(cy + 4 * s, cy + 4 * s, cy + 2 * s, cy + 2 * s))
  p2 <- data.frame(x = c(cx - 6 * s, cx, cx, cx - 6 * s),
                    y = c(cy - 2 * s, cy - 2 * s, cy - 4 * s, cy - 4 * s))
  # connection wire to diagram
  wire <- data.frame(x = c(cx, cx + 6 * s), y = c(cy, cy))
  # diagram node (right side)
  diag <- data.frame(xmin = cx + 6 * s, xmax = cx + 22 * s, ymin = cy - 10 * s, ymax = cy + 10 * s)
  # flowchart lines inside diagram
  fl1 <- data.frame(x = c(cx + 10 * s, cx + 18 * s), y = c(cy + 5 * s, cy + 5 * s))
  fl2 <- data.frame(x = c(cx + 10 * s, cx + 18 * s), y = c(cy, cy))
  fl3 <- data.frame(x = c(cx + 10 * s, cx + 15 * s), y = c(cy - 5 * s, cy - 5 * s))
  # connection glow dot
  glow <- data.frame(x0 = cx + 3 * s, y0 = cy, r = 2.5 * s)
  list(
    ggplot2::geom_rect(data = plug_body, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = p1, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 0.8)),
    ggplot2::geom_polygon(data = p2, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = wire, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = glow, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = diag, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = fl1, .aes(x, y), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = fl2, .aes(x, y), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = fl3, .aes(x, y), color = col, linewidth = .lw(s, 1.2))
  )
}

# ── Design additions ─────────────────────────────────────────────────────

glyph_paintbrush_code <- function(cx, cy, s, col, bright) {
  # paintbrush handle (diagonal, lower-left to upper-right)
  handle <- data.frame(
    x = c(cx - 18 * s, cx - 14 * s, cx + 2 * s, cx - 2 * s),
    y = c(cy - 14 * s, cy - 18 * s, cy + 2 * s, cy + 6 * s)
  )
  # brush tip (bristle area)
  tip <- data.frame(
    x = c(cx + 2 * s, cx - 2 * s, cx + 8 * s, cx + 12 * s),
    y = c(cy + 2 * s, cy + 6 * s, cy + 14 * s, cy + 10 * s)
  )
  # code lines (right side, emerging from brush)
  c1 <- data.frame(x = c(cx + 6 * s, cx + 22 * s), y = c(cy + 4 * s, cy + 4 * s))
  c2 <- data.frame(x = c(cx + 6 * s, cx + 18 * s), y = c(cy - 2 * s, cy - 2 * s))
  c3 <- data.frame(x = c(cx + 6 * s, cx + 14 * s), y = c(cy - 8 * s, cy - 8 * s))
  list(
    ggplot2::geom_polygon(data = handle, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = tip, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = c1, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = c2, .aes(x, y), color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = c3, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

glyph_palette_color <- function(cx, cy, s, col, bright) {
  # palette shape (same as glyph_palette)
  t <- seq(0, 2 * pi, length.out = 50)
  pal <- data.frame(x = cx + 24 * s * cos(t), y = cy + 20 * s * sin(t) * 0.8)
  # thumb hole
  hole <- data.frame(x0 = cx + 8 * s, y0 = cy - 4 * s, r = 5 * s)
  # color swatch dots — varied sizes to distinguish from mono version
  dots <- data.frame(
    x = cx + c(-14, -6, 2, 10, -10, -2) * s,
    y = cy + c(8, 12, 12, 8, 2, 4) * s,
    sz = c(5, 4, 6, 4, 3, 5) * s
  )
  # rainbow arc across top of palette (key differentiator from glyph_palette)
  arc_t <- seq(pi * 0.15, pi * 0.85, length.out = 25)
  arc <- data.frame(x = cx + 20 * s * cos(arc_t), y = cy + 16 * s * sin(arc_t) * 0.6)
  list(
    ggplot2::geom_polygon(data = pal, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggforce::geom_circle(data = hole, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_point(data = dots[1:3, ], .aes(x, y), color = bright, size = dots$sz[1:3]),
    ggplot2::geom_point(data = dots[4:6, ], .aes(x, y), color = col, size = dots$sz[4:6]),
    ggplot2::geom_path(data = arc, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
}
