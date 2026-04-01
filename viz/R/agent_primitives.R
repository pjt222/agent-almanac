# agent_primitives.R - Glyph library for 60 agent persona icons
# Each glyph: glyph_agent_xxx(cx, cy, s, col, bright) -> list of ggplot2 layers
# cx, cy = center; s = scale (1.0 = fill ~70% of 100x100 canvas)
# col = agent color; bright = brightened agent color
#
# Uses helpers .lw, .aes, hex_with_alpha, brighten_hex from utils.R / primitives.R

# ── glyph_agent_r_dev: hexagonal R badge with terminal cursor ──────────────
glyph_agent_r_dev <- function(cx, cy, s, col, bright) {
  # hexagon
  t <- seq(0, 2 * pi, length.out = 7)
  r <- 28 * s
  hex <- data.frame(x = cx + r * cos(t + pi / 6), y = cy + r * sin(t + pi / 6))
  # R letter strokes
  r_vert <- data.frame(x = c(cx - 10 * s, cx - 10 * s), y = c(cy - 14 * s, cy + 14 * s))
  r_top <- data.frame(
    x = c(cx - 10 * s, cx + 4 * s, cx + 8 * s, cx + 8 * s, cx + 4 * s, cx - 10 * s),
    y = c(cy + 14 * s, cy + 14 * s, cy + 10 * s, cy + 4 * s, cy + 2 * s, cy + 2 * s)
  )
  r_leg <- data.frame(x = c(cx - 2 * s, cx + 10 * s), y = c(cy + 2 * s, cy - 14 * s))
  # terminal cursor blink
  cursor <- data.frame(
    xmin = cx + 14 * s, xmax = cx + 18 * s,
    ymin = cy - 16 * s, ymax = cy - 10 * s
  )
  list(
    ggplot2::geom_polygon(data = hex, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = r_vert, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = r_top, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = r_leg, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_rect(data = cursor,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = bright, color = NA)
  )
}

# ── glyph_agent_code_review: magnifier over diff +/- lines ────────────────
glyph_agent_code_review <- function(cx, cy, s, col, bright) {
  # document background
  doc <- data.frame(
    xmin = cx - 20 * s, xmax = cx + 14 * s,
    ymin = cy - 22 * s, ymax = cy + 22 * s
  )
  # diff lines: + green, - red (using col shades)
  layers <- list(
    ggplot2::geom_rect(data = doc,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1))
  )
  offsets <- c(12, 4, -4, -12) * s
  for (i in seq_along(offsets)) {
    y <- cy + offsets[i]
    is_add <- i %% 2 == 1
    line_col <- if (is_add) bright else hex_with_alpha(col, 0.6)
    line_df <- data.frame(x = c(cx - 16 * s, cx + 8 * s), y = c(y, y))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_df, .aes(x, y),
      color = line_col, linewidth = .lw(s, 2))
    # +/- marker
    mark <- data.frame(x = cx - 18 * s, y = y)
    layers[[length(layers) + 1]] <- ggplot2::geom_point(data = mark, .aes(x, y),
      color = if (is_add) bright else col, size = 3 * s)
  }
  # magnifier circle
  lens <- data.frame(x0 = cx + 14 * s, y0 = cy - 10 * s, r = 12 * s)
  handle <- data.frame(x = c(cx + 22 * s, cx + 30 * s), y = c(cy - 18 * s, cy - 26 * s))
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = lens,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.05), color = bright, linewidth = .lw(s, 2.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 3.5))
  layers
}

# ── glyph_agent_security: shield with radar eye ──────────────────────────
glyph_agent_security <- function(cx, cy, s, col, bright) {
  w <- 34 * s; h <- 42 * s
  shield <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx - w * 0.25, cx, cx + w * 0.25, cx + w / 2, cx + w / 2),
    y = c(cy + h * 0.38, cy - h * 0.05, cy - h * 0.42, cy - h * 0.48, cy - h * 0.42, cy - h * 0.05, cy + h * 0.38)
  )
  # radar eye in center
  eye_outer <- data.frame(x0 = cx, y0 = cy, r = 12 * s)
  eye_inner <- data.frame(x0 = cx, y0 = cy, r = 5 * s)
  # scan line
  scan_t <- seq(0, pi / 2, length.out = 15)
  scan_r <- 12 * s
  scan <- data.frame(x = cx + scan_r * cos(scan_t), y = cy + scan_r * sin(scan_t))
  list(
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = eye_outer, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = eye_inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = scan, .aes(x, y),
      fill = hex_with_alpha(bright, 0.2), color = NA)
  )
}

# ── glyph_agent_web_dev: browser window with angle brackets ──────────────
glyph_agent_web_dev <- function(cx, cy, s, col, bright) {
  w <- 36 * s; h <- 34 * s
  # browser frame
  frame <- data.frame(
    xmin = cx - w / 2, xmax = cx + w / 2,
    ymin = cy - h / 2, ymax = cy + h / 2
  )
  # title bar
  bar <- data.frame(
    xmin = cx - w / 2, xmax = cx + w / 2,
    ymin = cy + h / 2 - 6 * s, ymax = cy + h / 2
  )
  # three dots in title bar
  dots <- data.frame(
    x = cx + c(-14, -10, -6) * s,
    y = rep(cy + h / 2 - 3 * s, 3)
  )
  # < / > code symbol
  lt <- data.frame(x = c(cx - 2 * s, cx - 12 * s, cx - 2 * s),
                   y = c(cy + 4 * s, cy - 4 * s, cy - 12 * s))
  gt <- data.frame(x = c(cx + 2 * s, cx + 12 * s, cx + 2 * s),
                   y = c(cy + 4 * s, cy - 4 * s, cy - 12 * s))
  slash <- data.frame(x = c(cx + 3 * s, cx - 3 * s), y = c(cy + 6 * s, cy - 14 * s))
  list(
    ggplot2::geom_rect(data = frame,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = col, size = 2.5 * s),
    ggplot2::geom_path(data = lt, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = gt, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = slash, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_survivalist: compass rose with flame center ──────────────
glyph_agent_survivalist <- function(cx, cy, s, col, bright) {
  r_outer <- 28 * s; r_inner <- 12 * s
  # 4 cardinal points
  pts <- data.frame(x = numeric(0), y = numeric(0))
  for (i in 0:3) {
    angle <- i * pi / 2
    pts <- rbind(pts,
      data.frame(x = cx + r_outer * cos(angle), y = cy + r_outer * sin(angle)),
      data.frame(x = cx + r_inner * cos(angle + pi / 4), y = cy + r_inner * sin(angle + pi / 4))
    )
  }
  # small flame in center
  t <- seq(0, 1, length.out = 20)
  hw <- 6 * s; h <- 14 * s
  lx <- cx - hw * sin(t * pi) * (1 - t^0.6)
  ly <- cy - h / 2 + h * t
  flame <- data.frame(
    x = c(lx, rev(cx + hw * sin(rev(t) * pi) * (1 - rev(t)^0.6))),
    y = c(ly, rev(ly))
  )
  # circle ring
  ring <- data.frame(x0 = cx, y0 = cy, r = 20 * s)
  list(
    ggplot2::geom_polygon(data = pts, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = flame, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_mystic: third eye with concentric mandala rings ──────────
glyph_agent_mystic <- function(cx, cy, s, col, bright) {
  layers <- list()
  # mandala rings
  for (r in c(28, 22, 16) * s) {
    ring <- data.frame(x0 = cx, y0 = cy, r = r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = ring,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2))
  }
  # eye shape (vesica piscis)
  t <- seq(-pi / 3, pi / 3, length.out = 30)
  top_lid <- data.frame(x = cx + 20 * s * sin(t * 1.5), y = cy + 10 * s * sin(t))
  bot_lid <- data.frame(x = cx + 20 * s * sin(t * 1.5), y = cy - 10 * s * sin(t))
  eye_df <- data.frame(x = c(top_lid$x, rev(bot_lid$x)), y = c(top_lid$y, rev(bot_lid$y)))
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = eye_df, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2))
  # iris
  iris <- data.frame(x0 = cx, y0 = cy, r = 6 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = iris,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  # pupil
  pupil <- data.frame(x0 = cx, y0 = cy, r = 2.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = pupil,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = bright, color = bright, linewidth = .lw(s, 1))
  layers
}

# ── glyph_agent_martial: flowing circle with balanced figure ─────────────
glyph_agent_martial <- function(cx, cy, s, col, bright) {
  # outer flowing circle
  t <- seq(0, 2 * pi, length.out = 60)
  r <- 28 * s
  # slight wave to convey motion
  wave_r <- r + 2 * s * sin(t * 3)
  circle <- data.frame(x = cx + wave_r * cos(t), y = cy + wave_r * sin(t))
  # balanced figure: head + body line + extended arms
  head <- data.frame(x0 = cx, y0 = cy + 10 * s, r = 5 * s)
  body <- data.frame(x = c(cx, cx), y = c(cy + 5 * s, cy - 10 * s))
  arm_l <- data.frame(x = c(cx, cx - 14 * s), y = c(cy + 2 * s, cy + 8 * s))
  arm_r <- data.frame(x = c(cx, cx + 14 * s), y = c(cy + 2 * s, cy - 4 * s))
  leg_l <- data.frame(x = c(cx, cx - 10 * s), y = c(cy - 10 * s, cy - 20 * s))
  leg_r <- data.frame(x = c(cx, cx + 12 * s), y = c(cy - 10 * s, cy - 18 * s))
  list(
    ggplot2::geom_polygon(data = circle, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = body, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = arm_l, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arm_r, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = leg_l, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = leg_r, .aes(x, y), color = col, linewidth = .lw(s, 2))
  )
}

# ── glyph_agent_designer: golden spiral inside compass circle ────────────
glyph_agent_designer <- function(cx, cy, s, col, bright) {
  # compass circle
  compass <- data.frame(x0 = cx, y0 = cy, r = 28 * s)
  # golden spiral (logarithmic approximation)
  n <- 80
  t <- seq(0, 3.5 * pi, length.out = n)
  r_sp <- 3 * s * exp(0.15 * t)
  r_sp <- pmin(r_sp, 24 * s)  # clamp
  spiral <- data.frame(x = cx + r_sp * cos(t), y = cy + r_sp * sin(t))
  # crosshairs
  ch_h <- data.frame(x = c(cx - 30 * s, cx + 30 * s), y = c(cy, cy))
  ch_v <- data.frame(x = c(cx, cx), y = c(cy - 30 * s, cy + 30 * s))
  # small diamond at compass points
  diamonds <- list()
  for (a in c(0, pi / 2, pi, 3 * pi / 2)) {
    dx <- 28 * s * cos(a); dy <- 28 * s * sin(a)
    d <- 3 * s
    diamonds[[length(diamonds) + 1]] <- data.frame(
      x = c(cx + dx, cx + dx + d * cos(a + pi / 2), cx + dx + d * 1.5 * cos(a),
            cx + dx + d * cos(a - pi / 2)),
      y = c(cy + dy, cy + dy + d * sin(a + pi / 2), cy + dy + d * 1.5 * sin(a),
            cy + dy + d * sin(a - pi / 2))
    )
  }
  layers <- list(
    ggforce::geom_circle(data = compass, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.06), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = ch_h, .aes(x, y), color = col, linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = ch_v, .aes(x, y), color = col, linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = spiral, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
  for (d in diamonds) {
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = d, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  }
  layers
}

# ── glyph_agent_gxp: shield with document + checkmark overlay ───────────
glyph_agent_gxp <- function(cx, cy, s, col, bright) {
  w <- 34 * s; h <- 44 * s
  shield <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx - w * 0.25, cx, cx + w * 0.25, cx + w / 2, cx + w / 2),
    y = c(cy + h * 0.36, cy - h * 0.05, cy - h * 0.42, cy - h * 0.48, cy - h * 0.42, cy - h * 0.05, cy + h * 0.36)
  )
  # small document inside
  doc <- data.frame(
    xmin = cx - 8 * s, xmax = cx + 8 * s,
    ymin = cy - 6 * s, ymax = cy + 14 * s
  )
  # doc lines
  l1 <- data.frame(x = c(cx - 5 * s, cx + 5 * s), y = c(cy + 10 * s, cy + 10 * s))
  l2 <- data.frame(x = c(cx - 5 * s, cx + 5 * s), y = c(cy + 6 * s, cy + 6 * s))
  l3 <- data.frame(x = c(cx - 5 * s, cx + 3 * s), y = c(cy + 2 * s, cy + 2 * s))
  # checkmark below doc
  ck <- data.frame(
    x = c(cx - 6 * s, cx - 1 * s, cx + 8 * s),
    y = c(cy - 8 * s, cy - 14 * s, cy - 2 * s)
  )
  list(
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = doc,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = l1, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = l2, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = l3, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = ck, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
}

# ── glyph_agent_auditor: clipboard with magnifying glass ─────────────────
glyph_agent_auditor <- function(cx, cy, s, col, bright) {
  w <- 26 * s; h <- 36 * s
  board <- data.frame(
    xmin = cx - w / 2 - 4 * s, xmax = cx + w / 2 - 4 * s,
    ymin = cy - h / 2, ymax = cy + h / 2 - 4 * s
  )
  clip <- data.frame(
    xmin = cx - 8 * s, xmax = cx + 4 * s,
    ymin = cy + h / 2 - 6 * s, ymax = cy + h / 2
  )
  # lines on clipboard
  layers <- list(
    ggplot2::geom_rect(data = board,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s)),
    ggplot2::geom_rect(data = clip,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5))
  )
  for (i in 1:4) {
    y <- cy + (2 - i) * 8 * s
    line_df <- data.frame(x = c(cx - w / 2 + 2 * s, cx + w / 2 - 10 * s), y = c(y, y))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_df, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  # magnifier overlay (bottom-right)
  lens <- data.frame(x0 = cx + 12 * s, y0 = cy - 8 * s, r = 10 * s)
  handle <- data.frame(x = c(cx + 19 * s, cx + 28 * s), y = c(cy - 15 * s, cy - 24 * s))
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = lens,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.05), color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))
  layers
}

# ── glyph_agent_researcher: open book with magnifier ─────────────────────
glyph_agent_researcher <- function(cx, cy, s, col, bright) {
  # left page
  lp <- data.frame(
    x = c(cx - 24 * s, cx - 24 * s, cx, cx),
    y = c(cy - 16 * s, cy + 16 * s, cy + 12 * s, cy - 16 * s)
  )
  # right page
  rp <- data.frame(
    x = c(cx, cx, cx + 24 * s, cx + 24 * s),
    y = c(cy - 16 * s, cy + 12 * s, cy + 16 * s, cy - 16 * s)
  )
  # spine
  spine <- data.frame(x = c(cx, cx), y = c(cy - 16 * s, cy + 12 * s))
  # text lines on left page
  layers <- list(
    ggplot2::geom_polygon(data = lp, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = rp, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = spine, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  )
  for (i in 1:3) {
    y <- cy + 6 * s - i * 6 * s
    l_df <- data.frame(x = c(cx - 20 * s, cx - 4 * s), y = c(y, y))
    r_df <- data.frame(x = c(cx + 4 * s, cx + 20 * s), y = c(y, y))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = l_df, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = r_df, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  }
  # magnifier in top-right
  lens <- data.frame(x0 = cx + 16 * s, y0 = cy + 14 * s, r = 8 * s)
  handle <- data.frame(x = c(cx + 22 * s, cx + 28 * s), y = c(cy + 8 * s, cy + 2 * s))
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = lens,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  layers
}

# ── glyph_agent_data_sci: scatter chart with brain node ──────────────────
glyph_agent_data_sci <- function(cx, cy, s, col, bright) {
  # axes
  x_axis <- data.frame(x = c(cx - 22 * s, cx + 22 * s), y = c(cy - 18 * s, cy - 18 * s))
  y_axis <- data.frame(x = c(cx - 22 * s, cx - 22 * s), y = c(cy - 18 * s, cy + 18 * s))
  # scatter dots
  dots <- data.frame(
    x = cx + c(-14, -6, 2, 8, 14, -10, 4, 12) * s,
    y = cy + c(-10, -2, 4, -6, 8, 6, 12, 2) * s
  )
  # trend line
  trend <- data.frame(x = c(cx - 18 * s, cx + 18 * s), y = c(cy - 14 * s, cy + 10 * s))
  # brain circle (top-right)
  brain <- data.frame(x0 = cx + 16 * s, y0 = cy + 14 * s, r = 7 * s)
  # brain squiggle
  bt <- seq(0, 2 * pi, length.out = 20)
  squig <- data.frame(
    x = cx + 16 * s + 4 * s * cos(bt),
    y = cy + 14 * s + 3 * s * sin(bt * 2)
  )
  list(
    ggplot2::geom_path(data = x_axis, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = y_axis, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = bright, size = 3 * s),
    ggplot2::geom_path(data = trend, .aes(x, y), color = col, linewidth = .lw(s, 1.2)),
    ggforce::geom_circle(data = brain, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = squig, .aes(x, y), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_architect: layered blocks / architecture towers ──────────
glyph_agent_architect <- function(cx, cy, s, col, bright) {
  layers <- list()
  # three towers of different heights
  towers <- list(
    list(x = cx - 14 * s, w = 10 * s, h = 30 * s),
    list(x = cx + 2 * s,  w = 10 * s, h = 40 * s),
    list(x = cx + 18 * s, w = 10 * s, h = 24 * s)
  )
  base_y <- cy - 20 * s
  for (i in seq_along(towers)) {
    tw <- towers[[i]]
    df <- data.frame(
      xmin = tw$x - tw$w / 2, xmax = tw$x + tw$w / 2,
      ymin = base_y, ymax = base_y + tw$h
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1 + 0.06 * i), color = bright, linewidth = .lw(s, 1.8))
    # window dots
    for (j in 1:3) {
      wy <- base_y + j * tw$h / 4
      if (wy < base_y + tw$h - 2 * s) {
        dot <- data.frame(x = tw$x, y = wy)
        layers[[length(layers) + 1]] <- ggplot2::geom_point(data = dot, .aes(x, y),
          color = bright, size = 2 * s)
      }
    }
  }
  # connecting arrows between towers
  for (pair in list(c(1, 2), c(2, 3))) {
    t1 <- towers[[pair[1]]]; t2 <- towers[[pair[2]]]
    arr <- data.frame(
      x = c(t1$x + t1$w / 2 + 1 * s, t2$x - t2$w / 2 - 1 * s),
      y = c(base_y + min(t1$h, t2$h) * 0.6, base_y + min(t1$h, t2$h) * 0.6)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arr, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  layers
}

# ── glyph_agent_web_design: layout grid with color palette ───────────────
glyph_agent_web_design <- function(cx, cy, s, col, bright) {
  # grid frame
  frame <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 24 * s,
    ymin = cy - 20 * s, ymax = cy + 20 * s
  )
  # header bar
  header <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 24 * s,
    ymin = cy + 14 * s, ymax = cy + 20 * s
  )
  # sidebar
  sidebar <- data.frame(
    xmin = cx - 24 * s, xmax = cx - 10 * s,
    ymin = cy - 20 * s, ymax = cy + 14 * s
  )
  # content area
  content <- data.frame(
    xmin = cx - 10 * s, xmax = cx + 24 * s,
    ymin = cy - 20 * s, ymax = cy + 14 * s
  )
  # color swatches at bottom
  swatches <- list()
  for (i in 1:4) {
    sw <- data.frame(
      xmin = cx - 4 * s + (i - 1) * 8 * s, xmax = cx + 2 * s + (i - 1) * 8 * s,
      ymin = cy - 18 * s, ymax = cy - 12 * s
    )
    swatches[[i]] <- sw
  }
  layers <- list(
    ggplot2::geom_rect(data = frame,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.06), color = bright, linewidth = .lw(s)),
    ggplot2::geom_rect(data = header,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = sidebar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 0.8)),
    ggplot2::geom_rect(data = content,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = NA, color = col, linewidth = .lw(s, 0.8))
  )
  for (i in seq_along(swatches)) {
    alpha <- 0.2 + 0.1 * i
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = swatches[[i]],
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, alpha), color = bright, linewidth = .lw(s, 1))
  }
  layers
}

# ── glyph_agent_ux: user silhouette with flow arrows ────────────────────
glyph_agent_ux <- function(cx, cy, s, col, bright) {
  # user head
  head <- data.frame(x0 = cx - 8 * s, y0 = cy + 14 * s, r = 7 * s)
  # user shoulders arc
  t <- seq(0, pi, length.out = 25)
  shoulders <- data.frame(
    x = cx - 8 * s + 14 * s * cos(t),
    y = cy + 2 * s - 8 * s * sin(t)
  )
  # flow arrows going right
  arrows <- list()
  for (i in 1:3) {
    y <- cy + (2 - i) * 10 * s - 2 * s
    arr <- data.frame(
      x = c(cx + 6 * s, cx + 20 * s),
      y = c(y, y)
    )
    # arrowhead
    ah <- data.frame(
      x = c(cx + 17 * s, cx + 22 * s, cx + 17 * s),
      y = c(y + 3 * s, y, y - 3 * s)
    )
    arrows[[length(arrows) + 1]] <- list(arr = arr, ah = ah)
  }
  # flow dots
  dots <- data.frame(
    x = cx + c(26, 26, 26) * s,
    y = cy + c(8, -2, -12) * s
  )
  layers <- list(
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = shoulders, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
  for (a in arrows) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = a$arr, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = a$ah, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  }
  layers[[length(layers) + 1]] <- ggplot2::geom_point(data = dots, .aes(x, y),
    color = bright, size = 3.5 * s)
  layers
}

# ── glyph_agent_pm: Gantt bars with milestone diamond ────────────────────
glyph_agent_pm <- function(cx, cy, s, col, bright) {
  layers <- list()
  # gantt bars (staggered horizontal)
  bars <- list(
    list(y = 14, x0 = -20, w = 20),
    list(y = 4,  x0 = -10, w = 24),
    list(y = -6, x0 = -4,  w = 18),
    list(y = -16, x0 = 2,  w = 22)
  )
  for (b in bars) {
    df <- data.frame(
      xmin = cx + b$x0 * s, xmax = cx + (b$x0 + b$w) * s,
      ymin = cy + (b$y - 3) * s, ymax = cy + (b$y + 3) * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5))
  }
  # milestone diamond
  md <- data.frame(
    x = cx + c(0, 4, 0, -4) * s + 16 * s,
    y = cy + c(4, 0, -4, 0) * s + 4 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = md, .aes(x, y),
    fill = bright, color = bright, linewidth = .lw(s, 1.5))
  # dependency arrows
  for (i in 1:3) {
    b1 <- bars[[i]]; b2 <- bars[[i + 1]]
    arr <- data.frame(
      x = c(cx + (b1$x0 + b1$w) * s, cx + b2$x0 * s),
      y = c(cy + b1$y * s, cy + b2$y * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arr, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  }
  layers
}

# ── glyph_agent_devops: infinity loop with gear ─────────────────────────
glyph_agent_devops <- function(cx, cy, s, col, bright) {
  # infinity loop (lemniscate)
  t <- seq(0, 2 * pi, length.out = 80)
  a <- 22 * s
  denom <- 1 + sin(t)^2
  inf_x <- cx + a * cos(t) / denom
  inf_y <- cy + a * sin(t) * cos(t) / denom
  infinity <- data.frame(x = inf_x, y = inf_y)
  # gear in center
  n_teeth <- 8
  gear_pts <- data.frame(x = numeric(0), y = numeric(0))
  for (i in seq_len(n_teeth * 2)) {
    angle <- (i - 1) * pi / n_teeth
    r <- if (i %% 2 == 1) 8 * s else 6 * s
    gear_pts <- rbind(gear_pts,
      data.frame(x = cx + r * cos(angle), y = cy + r * sin(angle)))
  }
  gear_center <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  list(
    ggplot2::geom_path(data = infinity, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = gear_pts, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = gear_center, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_mlops: neural network with pipeline arrow ───────────────
glyph_agent_mlops <- function(cx, cy, s, col, bright) {
  layers <- list()
  # three columns of nodes (2-3-2 neural net)
  cols <- list(
    list(x = cx - 18 * s, ys = c(cy + 10 * s, cy - 10 * s)),
    list(x = cx,          ys = c(cy + 14 * s, cy, cy - 14 * s)),
    list(x = cx + 18 * s, ys = c(cy + 10 * s, cy - 10 * s))
  )
  # connections first (behind nodes)
  for (ci in 1:(length(cols) - 1)) {
    for (y1 in cols[[ci]]$ys) {
      for (y2 in cols[[ci + 1]]$ys) {
        line <- data.frame(
          x = c(cols[[ci]]$x, cols[[ci + 1]]$x),
          y = c(y1, y2)
        )
        layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
          color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1))
      }
    }
  }
  # nodes
  for (ci in seq_along(cols)) {
    for (y in cols[[ci]]$ys) {
      node <- data.frame(x0 = cols[[ci]]$x, y0 = y, r = 4 * s)
      layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
        .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.8))
    }
  }
  # pipeline arrow below
  arrow_df <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy - 24 * s, cy - 24 * s)
  )
  ah <- data.frame(
    x = c(cx + 18 * s, cx + 24 * s, cx + 18 * s),
    y = c(cy - 21 * s, cy - 24 * s, cy - 27 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_df, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = ah, .aes(x, y),
    fill = bright, color = bright, linewidth = .lw(s, 1))
  layers
}

# ── glyph_agent_putior: flowchart with connected nodes ───────────────────
glyph_agent_putior <- function(cx, cy, s, col, bright) {
  layers <- list()
  # nodes: start (circle), process (rect), decision (diamond), end (rounded rect)
  # start circle
  start <- data.frame(x0 = cx, y0 = cy + 20 * s, r = 6 * s)
  # process box
  proc <- data.frame(
    xmin = cx - 12 * s, xmax = cx + 12 * s,
    ymin = cy + 2 * s, ymax = cy + 12 * s
  )
  # decision diamond
  diamond <- data.frame(
    x = cx + c(0, 10, 0, -10) * s,
    y = cy + c(-2, -10, -18, -10) * s
  )
  # connecting lines
  l1 <- data.frame(x = c(cx, cx), y = c(cy + 14 * s, cy + 12 * s))
  l2 <- data.frame(x = c(cx, cx), y = c(cy + 2 * s, cy - 2 * s))
  # side branch from diamond
  l3 <- data.frame(x = c(cx + 10 * s, cx + 22 * s), y = c(cy - 10 * s, cy - 10 * s))
  end_box <- data.frame(
    xmin = cx + 22 * s, xmax = cx + 32 * s,
    ymin = cy - 14 * s, ymax = cy - 6 * s
  )
  list(
    ggforce::geom_circle(data = start, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = l1, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = proc,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = l2, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = diamond, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = l3, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = end_box,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_swarm: hexagonal cell cluster with radiating connections ──
glyph_agent_swarm <- function(cx, cy, s, col, bright) {
  layers <- list()
  # central hex
  hex_r <- 10 * s
  t <- seq(0, 2 * pi, length.out = 7)
  center_hex <- data.frame(x = cx + hex_r * cos(t + pi / 6),
                           y = cy + hex_r * sin(t + pi / 6))
  layers[[1]] <- ggplot2::geom_polygon(data = center_hex, .aes(x, y),
    fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2))
  # six surrounding hex cells
  for (i in 1:6) {
    angle <- (i - 1) * pi / 3
    hx <- cx + 18 * s * cos(angle)
    hy <- cy + 18 * s * sin(angle)
    hex <- data.frame(x = hx + hex_r * 0.7 * cos(t + pi / 6),
                      y = hy + hex_r * 0.7 * sin(t + pi / 6))
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = hex, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.2))
    # connection line from center to satellite
    line <- data.frame(x = c(cx, hx), y = c(cy, hy))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))
  }
  # radiating signal lines outward
  for (i in c(1, 3, 5)) {
    angle <- (i - 1) * pi / 3
    line <- data.frame(
      x = c(cx + 24 * s * cos(angle), cx + 32 * s * cos(angle)),
      y = c(cy + 24 * s * sin(angle), cy + 32 * s * sin(angle))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  }
  layers
}

# ── glyph_agent_shifter: overlapping geometric shapes transitioning ───────
glyph_agent_shifter <- function(cx, cy, s, col, bright) {
  # triangle (left side, fading)
  tri <- data.frame(
    x = c(cx - 24 * s, cx - 8 * s, cx - 16 * s),
    y = c(cy - 12 * s, cy - 12 * s, cy + 12 * s)
  )
  # square (center, mid-transition)
  sq <- data.frame(
    xmin = cx - 8 * s, xmax = cx + 8 * s,
    ymin = cy - 8 * s, ymax = cy + 8 * s
  )
  # circle (right side, full)
  circ <- data.frame(x0 = cx + 18 * s, y0 = cy, r = 10 * s)
  # transition particles between shapes
  particles <- data.frame(
    x = cx + c(-14, -4, 6, 14, -8, 2, 10) * s,
    y = cy + c(16, -16, 18, -14, -20, 20, -18) * s
  )
  # morphing arcs connecting shapes
  t <- seq(0, pi, length.out = 15)
  arc1 <- data.frame(x = cx - 16 * s + 8 * s * cos(t),
                     y = cy - 16 * s + 4 * s * sin(t))
  arc2 <- data.frame(x = cx + 2 * s + 8 * s * cos(t),
                     y = cy + 16 * s + 4 * s * sin(t))
  list(
    ggplot2::geom_polygon(data = tri, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = sq,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = circ, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_point(data = particles, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), size = 2 * s),
    ggplot2::geom_path(data = arc1, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = arc2, .aes(x, y), color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_agent_jigsawr: interlocking puzzle pieces in hexagonal badge ──
glyph_agent_jigsawr <- function(cx, cy, s, col, bright) {
  # hexagonal outer frame
  t <- seq(0, 2 * pi, length.out = 7)
  r <- 28 * s
  hex <- data.frame(x = cx + r * cos(t + pi / 6), y = cy + r * sin(t + pi / 6))
  # Two interlocking puzzle pieces
  # Left piece
  lp <- data.frame(
    x = cx + s * c(-16, -4, -4, -2, 0, -2, -4, -4, -16, -16),
    y = cy + s * c(12, 12, 5, 4, 0, -4, -5, -12, -12, 12)
  )
  # Right piece (interlocks with left)
  rp <- data.frame(
    x = cx + s * c(-4, 16, 16, -4, -4, -2, 0, -2, -4, -4, -2, 0, -2, -4),
    y = cy + s * c(12, 12, -12, -12, -5, -4, 0, 4, 5, 12, 12, 12, 12, 12)
  )
  # Simplified: two rectangles with a tab
  rp_simple <- data.frame(
    x = cx + s * c(0, 16, 16, 0, 0, 2, 4, 2, 0),
    y = cy + s * c(12, 12, -12, -12, -5, -4, 0, 4, 5)
  )
  # Code cursor at center
  cursor <- data.frame(
    xmin = cx + 6 * s, xmax = cx + 10 * s,
    ymin = cy - 2 * s, ymax = cy + 2 * s
  )
  list(
    ggplot2::geom_polygon(data = hex, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = lp, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = rp_simple, .aes(x, y),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = cursor,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = bright, color = NA)
  )
}

# ── glyph_agent_alchemist: triangular flask with inner flame + spiral ──────
glyph_agent_alchemist <- function(cx, cy, s, col, bright) {
  # Erlenmeyer flask shape (wide bottom, narrow neck)
  flask <- data.frame(
    x = c(cx - 6 * s, cx + 6 * s, cx + 20 * s, cx + 20 * s,
          cx - 20 * s, cx - 20 * s),
    y = c(cy + 24 * s, cy + 24 * s, cy - 8 * s, cy - 20 * s,
          cy - 20 * s, cy - 8 * s)
  )
  # Neck ring
  neck <- data.frame(
    xmin = cx - 8 * s, xmax = cx + 8 * s,
    ymin = cy + 22 * s, ymax = cy + 26 * s
  )
  # Inner flame
  t <- seq(0, 1, length.out = 25)
  hw <- 7 * s; h <- 18 * s
  lx <- cx - hw * sin(t * pi) * (1 - t^0.6)
  ly <- cy - 16 * s + h * t
  flame <- data.frame(
    x = c(lx, rev(cx + hw * sin(rev(t) * pi) * (1 - rev(t)^0.6))),
    y = c(ly, rev(ly))
  )
  # Transformation spiral (around flask)
  sp_t <- seq(0, 2.5 * pi, length.out = 40)
  sp_r <- 3 * s * exp(0.12 * sp_t)
  sp_r <- pmin(sp_r, 16 * s)
  spiral <- data.frame(
    x = cx + sp_r * cos(sp_t),
    y = cy - 2 * s + sp_r * sin(sp_t) * 0.5
  )
  list(
    ggplot2::geom_polygon(data = flask, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = neck,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = flame, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = spiral, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_polymath: star network spanning multiple quadrants ─────────
glyph_agent_polymath <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Central hub (brain/star)
  hub <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  # Knowledge domain nodes in 5 positions (pentagon arrangement)
  n_nodes <- 5
  node_r <- 24 * s
  nodes <- list()
  for (i in seq_len(n_nodes)) {
    angle <- -pi / 2 + (i - 1) * 2 * pi / n_nodes
    nodes[[i]] <- c(cx + node_r * cos(angle), cy + node_r * sin(angle))
  }
  # Connections from hub to each node
  for (pos in nodes) {
    line <- data.frame(x = c(cx, pos[1]), y = c(cy, pos[2]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  }
  # Cross-connections between adjacent nodes
  for (i in seq_len(n_nodes)) {
    j <- if (i == n_nodes) 1L else i + 1L
    line <- data.frame(x = c(nodes[[i]][1], nodes[[j]][1]),
                       y = c(nodes[[i]][2], nodes[[j]][2]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1))
  }
  # Domain nodes
  for (i in seq_along(nodes)) {
    pos <- nodes[[i]]
    node <- data.frame(x0 = pos[1], y0 = pos[2], r = 5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))
  }
  # Central hub (on top)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = hub,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2.5))
  # Star in center of hub
  star_pts <- data.frame(x = numeric(0), y = numeric(0))
  for (i in 0:4) {
    outer_a <- -pi / 2 + i * 2 * pi / 5
    inner_a <- outer_a + pi / 5
    star_pts <- rbind(star_pts,
      data.frame(x = cx + 5 * s * cos(outer_a), y = cy + 5 * s * sin(outer_a)),
      data.frame(x = cx + 2.5 * s * cos(inner_a), y = cy + 2.5 * s * sin(inner_a))
    )
  }
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = star_pts, .aes(x, y),
    fill = bright, color = bright, linewidth = .lw(s, 1))
  layers
}

# ── glyph_agent_tcg: playing card with star rating overlay ─────────────────
glyph_agent_tcg <- function(cx, cy, s, col, bright) {
  # Main card
  card <- data.frame(
    xmin = cx - 16 * s, xmax = cx + 16 * s,
    ymin = cy - 24 * s, ymax = cy + 24 * s
  )
  # Inner border
  inner <- data.frame(
    xmin = cx - 13 * s, xmax = cx + 13 * s,
    ymin = cy - 20 * s, ymax = cy + 20 * s
  )
  # Card art area (top half of inner)
  art <- data.frame(
    xmin = cx - 13 * s, xmax = cx + 13 * s,
    ymin = cy + 2 * s, ymax = cy + 20 * s
  )
  # Star in card art
  star_pts <- data.frame(x = numeric(0), y = numeric(0))
  star_cy <- cy + 11 * s
  for (i in 0:4) {
    outer_a <- -pi / 2 + i * 2 * pi / 5
    inner_a <- outer_a + pi / 5
    star_pts <- rbind(star_pts,
      data.frame(x = cx + 10 * s * cos(outer_a),
                 y = star_cy + 10 * s * sin(outer_a)),
      data.frame(x = cx + 5 * s * cos(inner_a),
                 y = star_cy + 5 * s * sin(inner_a))
    )
  }
  # Text lines in bottom half
  l1 <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy - 6 * s, cy - 6 * s))
  l2 <- data.frame(x = c(cx - 10 * s, cx + 6 * s), y = c(cy - 12 * s, cy - 12 * s))
  # Small fanned card behind (to show deck context)
  behind <- data.frame(
    x = c(cx - 12 * s, cx + 20 * s, cx + 20 * s, cx - 12 * s),
    y = c(cy - 22 * s, cy - 22 * s, cy + 26 * s, cy + 26 * s)
  )
  list(
    ggplot2::geom_polygon(data = behind, .aes(x, y),
      fill = hex_with_alpha(col, 0.06), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = card,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = inner,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = NA, color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = art,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = NA),
    ggplot2::geom_polygon(data = star_pts, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = l1, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = l2, .aes(x, y), color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_agent_gardener: bonsai tree inside contemplative enso circle ─────
glyph_agent_gardener <- function(cx, cy, s, col, bright) {
  # Outer enso ring (incomplete circle, ~300 degrees)
  t_enso <- seq(pi / 6, pi / 6 + 5 * pi / 3, length.out = 60)
  r_enso <- 28 * s
  enso <- data.frame(
    x = cx + r_enso * cos(t_enso),
    y = cy + r_enso * sin(t_enso)
  )
  # Soil line (horizontal segment at base)
  soil <- data.frame(
    x = c(cx - 16 * s, cx + 16 * s),
    y = c(cy - 12 * s, cy - 12 * s)
  )
  # Trunk: vertical rectangle from center-bottom
  trunk <- data.frame(
    xmin = cx - 2.5 * s, xmax = cx + 2.5 * s,
    ymin = cy - 12 * s, ymax = cy + 2 * s
  )
  # Canopy: 2 overlapping filled circles forming rounded crown
  canopy1 <- data.frame(x0 = cx - 6 * s, y0 = cy + 8 * s, r = 9 * s)
  canopy2 <- data.frame(x0 = cx + 6 * s, y0 = cy + 8 * s, r = 9 * s)
  canopy3 <- data.frame(x0 = cx, y0 = cy + 14 * s, r = 8 * s)
  # Root hints: 3 short diagonal path segments below trunk
  root1 <- data.frame(
    x = c(cx - 2 * s, cx - 8 * s),
    y = c(cy - 12 * s, cy - 18 * s)
  )
  root2 <- data.frame(
    x = c(cx, cx + 2 * s),
    y = c(cy - 12 * s, cy - 20 * s)
  )
  root3 <- data.frame(
    x = c(cx + 2 * s, cx + 7 * s),
    y = c(cy - 12 * s, cy - 17 * s)
  )
  list(
    # Enso ring
    ggplot2::geom_path(data = enso, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    # Soil line
    ggplot2::geom_path(data = soil, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    # Roots
    ggplot2::geom_path(data = root1, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = root2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = root3, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2)),
    # Trunk
    ggplot2::geom_rect(data = trunk,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    # Canopy
    ggforce::geom_circle(data = canopy1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = canopy2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = canopy3, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_ip: shield with patent document inside ─────────────────────
glyph_agent_ip <- function(cx, cy, s, col, bright) {
  w <- 36 * s; h <- 44 * s
  # Shield shape
  shield <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx - w * 0.25, cx, cx + w * 0.25,
          cx + w / 2, cx + w / 2),
    y = c(cy + h * 0.36, cy - h * 0.05, cy - h * 0.42, cy - h * 0.48,
          cy - h * 0.42, cy - h * 0.05, cy + h * 0.36)
  )
  # Document inside shield
  doc <- data.frame(
    xmin = cx - 10 * s, xmax = cx + 10 * s,
    ymin = cy - 10 * s, ymax = cy + 14 * s
  )
  # Document lines
  l1 <- data.frame(x = c(cx - 7 * s, cx + 7 * s), y = c(cy + 10 * s, cy + 10 * s))
  l2 <- data.frame(x = c(cx - 7 * s, cx + 7 * s), y = c(cy + 6 * s, cy + 6 * s))
  l3 <- data.frame(x = c(cx - 7 * s, cx + 4 * s), y = c(cy + 2 * s, cy + 2 * s))
  # Badge at top of doc
  badge <- data.frame(
    xmin = cx - 4 * s, xmax = cx + 4 * s,
    ymin = cy - 6 * s, ymax = cy - 1 * s
  )
  # Copyright symbol hint below doc
  copy_circle <- data.frame(x0 = cx, y0 = cy - 16 * s, r = 4 * s)
  list(
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = doc,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = l1, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = l2, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = l3, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = badge,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = copy_circle, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_quarto: document page with Q lettermark + code blocks ────
glyph_agent_quarto <- function(cx, cy, s, col, bright) {
  # Page outline (tall rectangle)
  page <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 26 * s, ymax = cy + 26 * s
  )
  # Folded corner (top-right)
  fold <- data.frame(
    x = c(cx + 10 * s, cx + 18 * s, cx + 18 * s),
    y = c(cy + 26 * s, cy + 26 * s, cy + 18 * s)
  )
  fold_tri <- data.frame(
    x = c(cx + 10 * s, cx + 18 * s, cx + 10 * s),
    y = c(cy + 26 * s, cy + 18 * s, cy + 18 * s)
  )
  # Bold Q lettermark (circle + diagonal tail)
  q_circle <- data.frame(x0 = cx, y0 = cy + 4 * s, r = 12 * s)
  q_inner <- data.frame(x0 = cx, y0 = cy + 4 * s, r = 7 * s)
  q_tail <- data.frame(
    x = c(cx + 4 * s, cx + 14 * s),
    y = c(cy - 2 * s, cy - 12 * s)
  )
  # Code block rectangles (small, below Q)
  block1 <- data.frame(
    xmin = cx - 14 * s, xmax = cx - 2 * s,
    ymin = cy - 20 * s, ymax = cy - 14 * s
  )
  block2 <- data.frame(
    xmin = cx + 2 * s, xmax = cx + 14 * s,
    ymin = cy - 20 * s, ymax = cy - 14 * s
  )
  # Tiny lines inside code blocks
  bl1 <- data.frame(x = c(cx - 12 * s, cx - 5 * s), y = c(cy - 17 * s, cy - 17 * s))
  bl2 <- data.frame(x = c(cx + 4 * s, cx + 12 * s), y = c(cy - 17 * s, cy - 17 * s))
  # CLI chevron at bottom
  chev <- data.frame(
    x = c(cx - 6 * s, cx - 2 * s, cx - 6 * s),
    y = c(cy - 22 * s, cy - 24 * s, cy - 26 * s + 2 * s)
  )
  list(
    # Page background
    ggplot2::geom_rect(data = page,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.8)),
    # Folded corner
    ggplot2::geom_polygon(data = fold_tri, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.2)),
    # Q lettermark
    ggforce::geom_circle(data = q_circle, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = q_inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = q_tail, .aes(x, y),
      color = bright, linewidth = .lw(s, 3.5)),
    # Code blocks
    ggplot2::geom_rect(data = block1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.18), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = block2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.18), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = bl1, .aes(x, y), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = bl2, .aes(x, y), color = bright, linewidth = .lw(s, 1.2)),
    # CLI chevron
    ggplot2::geom_path(data = chev, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_shiny_dev: reactive diamond inside browser with graph ─────
glyph_agent_shiny_dev <- function(cx, cy, s, col, bright) {
  # Browser frame
  win <- data.frame(
    xmin = cx - 26 * s, xmax = cx + 26 * s,
    ymin = cy - 24 * s, ymax = cy + 24 * s
  )
  # Title bar
  bar <- data.frame(
    xmin = cx - 26 * s, xmax = cx + 26 * s,
    ymin = cy + 18 * s, ymax = cy + 24 * s
  )
  # Window dots
  dots <- data.frame(
    x = cx + c(-22, -18, -14) * s,
    y = rep(cy + 21 * s, 3)
  )
  # Reactive diamond (center, Shiny logo evocative)
  diamond <- data.frame(
    x = cx + c(0, 10, 0, -10) * s,
    y = cy + c(10, 0, -10, 0) * s
  )
  # Inner diamond
  diamond_inner <- data.frame(
    x = cx + c(0, 5, 0, -5) * s,
    y = cy + c(5, 0, -5, 0) * s
  )
  # Reactive graph nodes (4 nodes around diamond)
  layers <- list(
    # Browser frame
    ggplot2::geom_rect(data = win,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2)),
    # Title bar
    ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = NA),
    # Dots
    ggplot2::geom_point(data = dots, .aes(x, y),
      color = bright, size = 2 * s)
  )
  # Reactive graph: 4 small nodes with lines to diamond
  node_pos <- list(
    c(cx - 20 * s, cy + 8 * s),
    c(cx - 20 * s, cy - 8 * s),
    c(cx + 20 * s, cy + 8 * s),
    c(cx + 20 * s, cy - 8 * s)
  )
  for (pos in node_pos) {
    line <- data.frame(x = c(pos[1], cx), y = c(pos[2], cy))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
    node <- data.frame(x0 = pos[1], y0 = pos[2], r = 3.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.2))
  }
  # Reactive diamond (on top)
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = diamond, .aes(x, y),
    fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = diamond_inner, .aes(x, y),
    fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5))
  # "S" hint below diamond
  s_path <- data.frame(
    x = cx + c(3, 3, -3, -3) * s,
    y = cy + c(-14, -17, -17, -20) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = s_path, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers
}

# ── glyph_agent_shaman: drum circle with spirit lines radiating upward ────
glyph_agent_shaman <- function(cx, cy, s, col, bright) {
  # Central drum circle
  drum <- data.frame(x0 = cx, y0 = cy, r = 16 * s)
  # Cross pattern on drum face
  cross_h <- data.frame(x = c(cx - 12 * s, cx + 12 * s), y = c(cy, cy))
  cross_v <- data.frame(x = c(cx, cx), y = c(cy - 12 * s, cy + 12 * s))
  # Drum rim (smaller inner circle)
  rim <- data.frame(x0 = cx, y0 = cy, r = 10 * s)
  # Wavy spirit lines rising above drum
  spirit_lines <- list()
  for (i in 1:5) {
    x_offset <- (i - 3) * 8 * s
    t <- seq(0, 1, length.out = 15)
    wave_x <- cx + x_offset + 3 * s * sin(t * pi * 3)
    wave_y <- cy + 18 * s + t * 16 * s
    spirit_lines[[i]] <- data.frame(x = wave_x, y = wave_y)
  }
  # Radiating dots around drum
  dots <- data.frame(x = numeric(0), y = numeric(0))
  for (i in 0:7) {
    angle <- i * pi / 4
    dots <- rbind(dots, data.frame(
      x = cx + 22 * s * cos(angle),
      y = cy + 22 * s * sin(angle)
    ))
  }
  layers <- list(
    # Drum
    ggforce::geom_circle(data = drum, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.5)),
    # Cross pattern
    ggplot2::geom_path(data = cross_h, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = cross_v, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    # Rim
    ggforce::geom_circle(data = rim, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = col, linewidth = .lw(s, 1.5)),
    # Radiating dots
    ggplot2::geom_point(data = dots, .aes(x, y), color = bright, size = 2.5 * s)
  )
  # Spirit lines
  for (line in spirit_lines) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_agent_dog_trainer: seated dog silhouette with hand signal ───────
glyph_agent_dog_trainer <- function(cx, cy, s, col, bright) {
  # Dog head (circle)
  head <- data.frame(x0 = cx - 8 * s, y0 = cy + 4 * s, r = 6 * s)
  # Ear triangles
  ear_l <- data.frame(
    x = c(cx - 12 * s, cx - 10 * s, cx - 8 * s),
    y = c(cy + 12 * s, cy + 8 * s, cy + 10 * s)
  )
  ear_r <- data.frame(
    x = c(cx - 4 * s, cx - 6 * s, cx - 8 * s),
    y = c(cy + 12 * s, cy + 8 * s, cy + 10 * s)
  )
  # Triangular body (sitting pose)
  body <- data.frame(
    x = c(cx - 14 * s, cx - 2 * s, cx - 8 * s),
    y = c(cy - 12 * s, cy - 12 * s, cy + 2 * s)
  )
  # Front legs (small rectangles)
  leg_l <- data.frame(
    xmin = cx - 12 * s, xmax = cx - 10 * s,
    ymin = cy - 18 * s, ymax = cy - 12 * s
  )
  leg_r <- data.frame(
    xmin = cx - 6 * s, xmax = cx - 4 * s,
    ymin = cy - 18 * s, ymax = cy - 12 * s
  )
  # Hand/arm giving signal (open palm above dog)
  arm <- data.frame(x = c(cx + 14 * s, cx + 14 * s), y = c(cy - 6 * s, cy + 8 * s))
  palm <- data.frame(x0 = cx + 14 * s, y0 = cy + 12 * s, r = 5 * s)
  # Connection line between hand and dog
  connection <- data.frame(x = c(cx - 8 * s, cx + 14 * s), y = c(cy + 4 * s, cy + 12 * s))
  list(
    # Dog body
    ggplot2::geom_polygon(data = body, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    # Dog head
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2)),
    # Ears
    ggplot2::geom_polygon(data = ear_l, .aes(x, y),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = ear_r, .aes(x, y),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    # Legs
    ggplot2::geom_rect(data = leg_l,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = leg_r,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    # Hand signal
    ggplot2::geom_path(data = arm, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = palm, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2)),
    # Connection line
    ggplot2::geom_path(data = connection, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1), linetype = "dashed")
  )
}

# ── glyph_agent_mycologist: mushroom cap with mycelium network below ──────
glyph_agent_mycologist <- function(cx, cy, s, col, bright) {
  # Dome-shaped mushroom cap (arc + polygon)
  t <- seq(0, pi, length.out = 30)
  cap_r <- 18 * s
  cap_top <- data.frame(
    x = cx + cap_r * cos(t),
    y = cy + 12 * s + 8 * s * sin(t)
  )
  cap_bottom <- data.frame(
    x = c(cx - cap_r, cx + cap_r, cx + cap_r * 0.8, cx - cap_r * 0.8),
    y = c(cy + 12 * s, cy + 12 * s, cy + 8 * s, cy + 8 * s)
  )
  cap_full <- rbind(cap_top, cap_bottom)
  # Stem (rectangle)
  stem <- data.frame(
    xmin = cx - 4 * s, xmax = cx + 4 * s,
    ymin = cy - 10 * s, ymax = cy + 8 * s
  )
  # Mycelium threads (branching lines below stem)
  myc_threads <- list()
  # Main root
  myc_threads[[1]] <- data.frame(x = c(cx, cx), y = c(cy - 10 * s, cy - 16 * s))
  # Left branch
  myc_threads[[2]] <- data.frame(x = c(cx, cx - 12 * s), y = c(cy - 16 * s, cy - 24 * s))
  myc_threads[[3]] <- data.frame(x = c(cx - 6 * s, cx - 18 * s), y = c(cy - 20 * s, cy - 26 * s))
  # Right branch
  myc_threads[[4]] <- data.frame(x = c(cx, cx + 12 * s), y = c(cy - 16 * s, cy - 24 * s))
  myc_threads[[5]] <- data.frame(x = c(cx + 6 * s, cx + 18 * s), y = c(cy - 20 * s, cy - 26 * s))
  # Spore dots below cap
  spores <- data.frame(
    x = cx + c(-10, -4, 2, 8, -6, 4) * s,
    y = cy + c(6, 8, 6, 8, 4, 4) * s
  )
  layers <- list(
    # Mushroom cap
    ggplot2::geom_polygon(data = cap_full, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    # Stem
    ggplot2::geom_rect(data = stem,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    # Spore dots
    ggplot2::geom_point(data = spores, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), size = 1.5 * s)
  )
  # Mycelium threads
  for (thread in myc_threads) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = thread, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.2))
  }
  layers
}

# ── glyph_agent_prospector: gold pan with water ripples and nugget ────────
glyph_agent_prospector <- function(cx, cy, s, col, bright) {
  # Shallow elliptical pan (top view)
  pan <- data.frame(x0 = cx, y0 = cy, r = 20 * s)
  # Inner pan edge (slightly smaller)
  pan_inner <- data.frame(x0 = cx, y0 = cy, r = 16 * s)
  # Concentric water ripple circles
  ripples <- list()
  for (r in c(12, 8, 4) * s) {
    ripples[[length(ripples) + 1]] <- data.frame(x0 = cx, y0 = cy, r = r)
  }
  # Gold nugget at center bottom
  nugget <- data.frame(
    x = cx + c(-2, 2, 3, 0, -3) * s,
    y = cy + c(-8, -8, -5, -3, -5) * s
  )
  # Pan handle extending from side
  handle_base <- data.frame(
    xmin = cx + 18 * s, xmax = cx + 22 * s,
    ymin = cy - 2 * s, ymax = cy + 2 * s
  )
  handle_ext <- data.frame(
    x = c(cx + 22 * s, cx + 30 * s),
    y = c(cy, cy)
  )
  # Small gravel dots in pan
  gravel <- data.frame(
    x = cx + c(-8, -4, 4, 8, -10, 10, -6, 6) * s,
    y = cy + c(-4, 2, -2, 4, 0, -6, 6, -8) * s
  )
  list(
    # Pan outer circle
    ggforce::geom_circle(data = pan, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2.5)),
    # Pan inner edge
    ggforce::geom_circle(data = pan_inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = col, linewidth = .lw(s, 1.2)),
    # Water ripples
    ggforce::geom_circle(data = ripples[[1]], .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = ripples[[2]], .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = ripples[[3]], .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1)),
    # Gravel dots
    ggplot2::geom_point(data = gravel, .aes(x, y),
      color = hex_with_alpha(col, 0.4), size = 1.5 * s),
    # Gold nugget (bright point)
    ggplot2::geom_polygon(data = nugget, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    # Handle
    ggplot2::geom_rect(data = handle_base,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = handle_ext, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}

# ── glyph_agent_librarian: open book with catalog index tabs ───────────
glyph_agent_librarian <- function(cx, cy, s, col, bright) {
  # Open book — two angled pages meeting at spine
  # Left page
  left_page <- data.frame(
    x = cx + c(-24, -2, -2, -24) * s,
    y = cy + c(16, 20, -20, -16) * s
  )
  # Right page
  right_page <- data.frame(
    x = cx + c(2, 24, 24, 2) * s,
    y = cy + c(20, 16, -16, -20) * s
  )
  # Spine line
  spine <- data.frame(
    x = c(cx, cx),
    y = c(cy + 22 * s, cy - 22 * s)
  )
  # Text lines on left page
  ll1 <- data.frame(x = c(cx - 20 * s, cx - 6 * s), y = c(cy + 10 * s, cy + 12 * s))
  ll2 <- data.frame(x = c(cx - 20 * s, cx - 6 * s), y = c(cy + 4 * s, cy + 6 * s))
  ll3 <- data.frame(x = c(cx - 20 * s, cx - 6 * s), y = c(cy - 2 * s, cy + 0 * s))
  ll4 <- data.frame(x = c(cx - 20 * s, cx - 6 * s), y = c(cy - 8 * s, cy - 6 * s))
  # Index tabs along right edge (catalog tabs)
  tab1 <- data.frame(
    xmin = cx + 22 * s, xmax = cx + 28 * s,
    ymin = cy + 10 * s, ymax = cy + 16 * s
  )
  tab2 <- data.frame(
    xmin = cx + 22 * s, xmax = cx + 28 * s,
    ymin = cy + 0 * s,  ymax = cy + 6 * s
  )
  tab3 <- data.frame(
    xmin = cx + 22 * s, xmax = cx + 28 * s,
    ymin = cy - 10 * s, ymax = cy - 4 * s
  )
  list(
    # Pages
    ggplot2::geom_polygon(data = left_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = right_page, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.8)),
    # Spine
    ggplot2::geom_path(data = spine, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    # Text lines
    ggplot2::geom_path(data = ll1, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = ll2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = ll3, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = ll4, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    # Catalog index tabs
    ggplot2::geom_rect(data = tab1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = tab2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = tab3,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_tour_planner: map pin with route line and compass ────────
glyph_agent_tour_planner <- function(cx, cy, s, col, bright) {
  # Map pin (teardrop shape)
  t <- seq(0, 2 * pi, length.out = 40)
  pin_r <- 10 * s
  pin_x <- cx - 8 * s + pin_r * cos(t)
  pin_y <- cy + 8 * s + pin_r * sin(t)
  pin <- data.frame(x = pin_x, y = pin_y)
  pin_point <- data.frame(
    x = c(cx - 14 * s, cx - 8 * s, cx - 2 * s),
    y = c(cy + 2 * s, cy - 8 * s, cy + 2 * s)
  )
  pin_center <- data.frame(x0 = cx - 8 * s, y0 = cy + 8 * s, r = 4 * s)
  # Route line (curved path)
  route_t <- seq(0, 1, length.out = 25)
  route <- data.frame(
    x = cx - 8 * s + 24 * s * route_t + 6 * s * sin(route_t * pi * 2),
    y = cy - 8 * s + 20 * s * route_t * (1 - route_t) * 2
  )
  # Compass rose (small, bottom-right)
  comp_cx <- cx + 16 * s; comp_cy <- cy - 14 * s
  comp_r <- 8 * s
  compass <- data.frame(x0 = comp_cx, y0 = comp_cy, r = comp_r)
  # Cardinal ticks
  n_tick <- data.frame(x = c(comp_cx, comp_cx), y = c(comp_cy + comp_r * 0.5, comp_cy + comp_r))
  e_tick <- data.frame(x = c(comp_cx + comp_r * 0.5, comp_cx + comp_r), y = c(comp_cy, comp_cy))
  list(
    ggplot2::geom_polygon(data = pin, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = pin_point, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = pin_center, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = route, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 2), linetype = "dashed"),
    ggforce::geom_circle(data = compass, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = n_tick, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = e_tick, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_hiking_guide: mountain peaks with trail path ─────────────
glyph_agent_hiking_guide <- function(cx, cy, s, col, bright) {
  # Large mountain peak
  peak1 <- data.frame(
    x = cx + c(-20, 0, 20) * s,
    y = cy + c(-16, 20, -16) * s
  )
  # Smaller peak (overlapping)
  peak2 <- data.frame(
    x = cx + c(4, 18, 30) * s,
    y = cy + c(-16, 10, -16) * s
  )
  # Snow cap on main peak
  snow <- data.frame(
    x = cx + c(-6, 0, 6) * s,
    y = cy + c(14, 20, 14) * s
  )
  # Trail path (winding up from bottom-left)
  trail_t <- seq(0, 1, length.out = 20)
  trail <- data.frame(
    x = cx - 16 * s + 20 * s * trail_t + 4 * s * sin(trail_t * pi * 3),
    y = cy - 20 * s + 30 * s * trail_t
  )
  # Sun circle (top-right)
  sun <- data.frame(x0 = cx + 22 * s, y0 = cy + 22 * s, r = 5 * s)
  list(
    ggplot2::geom_polygon(data = peak1, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = peak2, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = snow, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = trail, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = sun, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_relocation: suitcase with arrow and EU stars ─────────────
glyph_agent_relocation <- function(cx, cy, s, col, bright) {
  # Suitcase body
  case <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 16 * s, ymax = cy + 10 * s
  )
  # Handle
  handle <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 6 * s,
    ymin = cy + 10 * s, ymax = cy + 16 * s
  )
  handle_inner <- data.frame(
    xmin = cx - 3 * s, xmax = cx + 3 * s,
    ymin = cy + 12 * s, ymax = cy + 16 * s
  )
  # Horizontal straps on suitcase
  strap1 <- data.frame(x = c(cx - 18 * s, cx + 18 * s), y = c(cy, cy))
  strap2 <- data.frame(x = c(cx - 18 * s, cx + 18 * s), y = c(cy - 8 * s, cy - 8 * s))
  # Arrow (direction of travel)
  arrow_line <- data.frame(x = c(cx - 28 * s, cx - 22 * s), y = c(cy - 2 * s, cy - 2 * s))
  arrow_head <- data.frame(
    x = cx + c(-24, -20, -24) * s,
    y = cy + c(2, -2, -6) * s
  )
  # EU-like star circle hint (3 small stars)
  stars <- data.frame(
    x = cx + c(22, 26, 24) * s,
    y = cy + c(6, 6, 12) * s
  )
  list(
    ggplot2::geom_rect(data = case,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = handle,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_rect(data = handle_inner,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = NA),
    ggplot2::geom_path(data = strap1, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = strap2, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = arrow_line, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_point(data = stars, .aes(x, y), color = bright, size = 3 * s, shape = 8)
  )
}

# ── glyph_agent_mcp_dev: socket connector with gear ─────────────────────
glyph_agent_mcp_dev <- function(cx, cy, s, col, bright) {
  # Plug/socket shape (rounded rectangle with prongs)
  socket <- data.frame(
    xmin = cx - 14 * s, xmax = cx + 14 * s,
    ymin = cy - 8 * s, ymax = cy + 14 * s
  )
  # Connection prongs (3 vertical lines extending down)
  prong1 <- data.frame(x = c(cx - 8 * s, cx - 8 * s), y = c(cy - 8 * s, cy - 18 * s))
  prong2 <- data.frame(x = c(cx, cx), y = c(cy - 8 * s, cy - 18 * s))
  prong3 <- data.frame(x = c(cx + 8 * s, cx + 8 * s), y = c(cy - 8 * s, cy - 18 * s))
  # Gear on top-right
  gear_cx <- cx + 10 * s; gear_cy <- cy + 20 * s
  gear_outer <- data.frame(x0 = gear_cx, y0 = gear_cy, r = 8 * s)
  gear_inner <- data.frame(x0 = gear_cx, y0 = gear_cy, r = 4 * s)
  # Gear teeth (4 small rectangles)
  teeth <- list()
  for (i in 0:3) {
    angle <- i * pi / 2
    teeth[[i + 1]] <- data.frame(
      x = c(gear_cx + 7 * s * cos(angle), gear_cx + 11 * s * cos(angle)),
      y = c(gear_cy + 7 * s * sin(angle), gear_cy + 11 * s * sin(angle))
    )
  }
  # Cable line from socket to left
  cable <- data.frame(
    x = c(cx - 14 * s, cx - 24 * s, cx - 28 * s),
    y = c(cy + 3 * s, cy + 3 * s, cy + 8 * s)
  )
  layers <- list(
    ggplot2::geom_rect(data = socket,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = prong1, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = prong2, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = prong3, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = gear_outer, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = gear_inner, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = cable, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 2))
  )
  for (tooth in teeth) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = tooth, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
  }
  layers
}

# ── glyph_agent_acp_dev: two-arrow handshake / agent exchange ────────────
glyph_agent_acp_dev <- function(cx, cy, s, col, bright) {
  # Left agent circle
  left_agent <- data.frame(x0 = cx - 16 * s, y0 = cy, r = 10 * s)
  # Right agent circle
  right_agent <- data.frame(x0 = cx + 16 * s, y0 = cy, r = 10 * s)
  # Forward arrow (left to right, above center)
  fwd_line <- data.frame(x = c(cx - 4 * s, cx + 4 * s), y = c(cy + 6 * s, cy + 6 * s))
  fwd_head <- data.frame(
    x = cx + c(2, 6, 2) * s,
    y = cy + c(9, 6, 3) * s
  )
  # Return arrow (right to left, below center)
  ret_line <- data.frame(x = c(cx + 4 * s, cx - 4 * s), y = c(cy - 6 * s, cy - 6 * s))
  ret_head <- data.frame(
    x = cx + c(-2, -6, -2) * s,
    y = cy + c(-3, -6, -9) * s
  )
  # "A" letters inside circles
  a_left <- data.frame(
    x = c(cx - 20 * s, cx - 16 * s, cx - 12 * s),
    y = c(cy - 4 * s, cy + 4 * s, cy - 4 * s)
  )
  a_right <- data.frame(
    x = c(cx + 12 * s, cx + 16 * s, cx + 20 * s),
    y = c(cy - 4 * s, cy + 4 * s, cy - 4 * s)
  )
  # Protocol indicator (brackets below)
  bracket_l <- data.frame(
    x = c(cx - 8 * s, cx - 12 * s, cx - 12 * s, cx - 8 * s),
    y = c(cy - 18 * s, cy - 18 * s, cy - 24 * s, cy - 24 * s)
  )
  bracket_r <- data.frame(
    x = c(cx + 8 * s, cx + 12 * s, cx + 12 * s, cx + 8 * s),
    y = c(cy - 18 * s, cy - 18 * s, cy - 24 * s, cy - 24 * s)
  )
  list(
    ggforce::geom_circle(data = left_agent, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = right_agent, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = fwd_line, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = fwd_head, .aes(x, y), fill = bright, color = bright),
    ggplot2::geom_path(data = ret_line, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = ret_head, .aes(x, y), fill = col, color = col),
    ggplot2::geom_path(data = a_left, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = a_right, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = bracket_l, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = bracket_r, .aes(x, y), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_geometrist: triangle with compass arc ────────────────────
glyph_agent_geometrist <- function(cx, cy, s, col, bright) {
  # Main triangle (equilateral)
  h <- 24 * s
  w <- 28 * s
  tri <- data.frame(
    x = c(cx, cx - w / 2, cx + w / 2),
    y = c(cy + h * 0.6, cy - h * 0.4, cy - h * 0.4)
  )
  # Compass arc (quarter circle from one vertex)
  t <- seq(-pi / 6, pi / 3, length.out = 25)
  arc_r <- 18 * s
  arc <- data.frame(
    x = cx - w / 2 + arc_r * cos(t),
    y = cy - h * 0.4 + arc_r * sin(t)
  )
  # Right-angle marker at bottom-left
  sq_size <- 5 * s
  right_angle <- data.frame(
    x = c(cx - w / 2 + sq_size, cx - w / 2 + sq_size, cx - w / 2),
    y = c(cy - h * 0.4, cy - h * 0.4 + sq_size, cy - h * 0.4 + sq_size)
  )
  # Angle arc at top vertex
  top_arc_t <- seq(-pi / 2 - pi / 6, -pi / 2 + pi / 6, length.out = 15)
  top_arc <- data.frame(
    x = cx + 8 * s * cos(top_arc_t),
    y = cy + h * 0.6 + 8 * s * sin(top_arc_t)
  )
  # Dotted construction line
  bisector <- data.frame(
    x = c(cx, cx),
    y = c(cy + h * 0.6, cy - h * 0.4)
  )
  list(
    ggplot2::geom_polygon(data = tri, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = arc, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = right_angle, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = top_arc, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = bisector, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1), linetype = "dashed")
  )
}

# ── glyph_agent_markovian: chain of connected states with arrows ─────────
glyph_agent_markovian <- function(cx, cy, s, col, bright) {
  # Three state circles in a row
  states <- list(
    data.frame(x0 = cx - 20 * s, y0 = cy, r = 8 * s),
    data.frame(x0 = cx, y0 = cy, r = 8 * s),
    data.frame(x0 = cx + 20 * s, y0 = cy, r = 8 * s)
  )
  # Transition arrows between states
  arrow1 <- data.frame(x = c(cx - 11 * s, cx - 9 * s), y = c(cy + 3 * s, cy + 3 * s))
  arrow2 <- data.frame(x = c(cx + 9 * s, cx + 11 * s), y = c(cy + 3 * s, cy + 3 * s))
  # Return arrows below
  ret1 <- data.frame(x = c(cx - 9 * s, cx - 11 * s), y = c(cy - 3 * s, cy - 3 * s))
  ret2 <- data.frame(x = c(cx + 11 * s, cx + 9 * s), y = c(cy - 3 * s, cy - 3 * s))
  # Self-loop on middle state (arc above)
  loop_t <- seq(pi / 4, 3 * pi / 4, length.out = 20)
  loop <- data.frame(
    x = cx + 10 * s * cos(loop_t),
    y = cy + 8 * s + 10 * s * sin(loop_t)
  )
  # State labels (dots in center)
  dots <- data.frame(
    x = c(cx - 20 * s, cx, cx + 20 * s),
    y = c(cy, cy, cy)
  )
  # Probability annotations (small numbers)
  p_line1 <- data.frame(x = c(cx - 14 * s, cx - 8 * s), y = c(cy + 8 * s, cy + 8 * s))
  p_line2 <- data.frame(x = c(cx + 8 * s, cx + 14 * s), y = c(cy + 8 * s, cy + 8 * s))
  layers <- list()
  # State circles
  for (st in states) {
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = st,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2))
  }
  # State center dots
  layers[[length(layers) + 1]] <- ggplot2::geom_point(data = dots, .aes(x, y),
    color = bright, size = 3 * s)
  # Arrows
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow1, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow2, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ret1, .aes(x, y),
    color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ret2, .aes(x, y),
    color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  # Self-loop
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = loop, .aes(x, y),
    color = bright, linewidth = .lw(s, 1.8))
  # Probability lines
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = p_line1, .aes(x, y),
    color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = p_line2, .aes(x, y),
    color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1))
  layers
}

# ── glyph_agent_theorist: atom orbitals with central nucleus ─────────────
glyph_agent_theorist <- function(cx, cy, s, col, bright) {
  # Central nucleus
  nucleus <- data.frame(x0 = cx, y0 = cy, r = 6 * s)
  # Three elliptical orbits at different angles
  orbits <- list()
  for (angle_off in c(0, pi / 3, 2 * pi / 3)) {
    t <- seq(0, 2 * pi, length.out = 50)
    orbit_a <- 24 * s
    orbit_b <- 10 * s
    ox <- orbit_a * cos(t)
    oy <- orbit_b * sin(t)
    # Rotate by angle_off
    rx <- cx + ox * cos(angle_off) - oy * sin(angle_off)
    ry <- cy + ox * sin(angle_off) + oy * cos(angle_off)
    orbits[[length(orbits) + 1]] <- data.frame(x = rx, y = ry)
  }
  # Electron dots on orbits
  electrons <- data.frame(
    x = c(cx + 24 * s, cx - 12 * s + 5 * s, cx - 12 * s - 5 * s),
    y = c(cy, cy + 20.8 * s * 0.5, cy - 20.8 * s * 0.5)
  )
  # Formula hint (integral sign top-right)
  integral <- data.frame(
    x = c(cx + 22 * s, cx + 20 * s, cx + 22 * s, cx + 24 * s),
    y = c(cy + 24 * s, cy + 20 * s, cy + 16 * s, cy + 12 * s)
  )
  layers <- list(
    # Nucleus
    ggforce::geom_circle(data = nucleus, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 2.5))
  )
  # Orbits
  for (orbit in orbits) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = orbit, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  }
  # Electrons
  layers[[length(layers) + 1]] <- ggplot2::geom_point(data = electrons, .aes(x, y),
    color = bright, size = 3.5 * s)
  # Integral
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = integral, .aes(x, y),
    color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 2))
  layers
}

# ── glyph_agent_diffusion: bell curve with spreading particles ───────────
glyph_agent_diffusion <- function(cx, cy, s, col, bright) {
  # Gaussian bell curve
  x_vals <- seq(-3, 3, length.out = 50)
  gauss_y <- dnorm(x_vals) / dnorm(0)  # normalize to 0-1
  curve_df <- data.frame(
    x = cx + x_vals * 10 * s,
    y = cy - 10 * s + gauss_y * 28 * s
  )
  # Baseline
  baseline <- data.frame(
    x = c(cx - 30 * s, cx + 30 * s),
    y = c(cy - 10 * s, cy - 10 * s)
  )
  # Spreading particles (dots radiating outward from center)
  particle_angles <- seq(0, 2 * pi, length.out = 13)[-13]
  inner_r <- 6 * s; outer_r <- 14 * s
  particles_inner <- data.frame(
    x = cx + inner_r * cos(particle_angles[c(1, 3, 5, 7, 9, 11)]),
    y = cy + 4 * s + inner_r * sin(particle_angles[c(1, 3, 5, 7, 9, 11)])
  )
  particles_outer <- data.frame(
    x = cx + outer_r * cos(particle_angles),
    y = cy + 4 * s + outer_r * sin(particle_angles)
  )
  # Time arrow below baseline
  time_arrow <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy - 18 * s, cy - 18 * s)
  )
  arrow_head <- data.frame(
    x = cx + c(20, 26, 20) * s,
    y = cy + c(-15, -18, -21) * s
  )
  list(
    ggplot2::geom_path(data = baseline, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = curve_df, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_point(data = particles_inner, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), size = 2.5 * s),
    ggplot2::geom_point(data = particles_outer, .aes(x, y),
      color = hex_with_alpha(col, 0.4), size = 1.5 * s),
    ggplot2::geom_path(data = time_arrow, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = col, color = col, linewidth = .lw(s, 0.5))
  )
}

# ── glyph_agent_hildegard: abbey window with herbal sprig ─────────────────
glyph_agent_hildegard <- function(cx, cy, s, col, bright) {
  # Gothic pointed arch (abbey window)
  arch_t <- seq(-pi / 2 - 0.6, -pi / 2 + 0.6, length.out = 20)
  arch_r <- 26 * s
  arch_top <- data.frame(
    x = cx + arch_r * cos(arch_t),
    y = cy + 12 * s + arch_r * sin(arch_t) + arch_r
  )
  # Window pillars
  left_pillar <- data.frame(
    x = c(cx - 15.5 * s, cx - 15.5 * s),
    y = c(cy - 24 * s, cy + 12 * s)
  )
  right_pillar <- data.frame(
    x = c(cx + 15.5 * s, cx + 15.5 * s),
    y = c(cy - 24 * s, cy + 12 * s)
  )
  # Base sill
  sill <- data.frame(
    x = c(cx - 18 * s, cx + 18 * s),
    y = c(cy - 24 * s, cy - 24 * s)
  )
  # Herbal sprig (central stem + 3 leaf pairs)
  stem <- data.frame(
    x = c(cx, cx),
    y = c(cy - 18 * s, cy + 6 * s)
  )
  leaves <- data.frame(x = numeric(0), y = numeric(0))
  leaf_offsets <- c(-10, -2, 6) * s
  for (yo in leaf_offsets) {
    lt <- seq(0, pi, length.out = 12)
    lr <- 7 * s
    leaf_l <- data.frame(x = cx - lr * cos(lt) * 0.5, y = cy + yo + lr * sin(lt) * 0.4)
    leaf_r <- data.frame(x = cx + lr * cos(lt) * 0.5, y = cy + yo + lr * sin(lt) * 0.4)
    leaves <- rbind(leaves, leaf_l, data.frame(x = NA, y = NA), leaf_r, data.frame(x = NA, y = NA))
  }
  # Radiance point at apex
  apex <- data.frame(x = cx, y = cy + 18 * s)
  list(
    ggplot2::geom_path(data = arch_top, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = left_pillar, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = right_pillar, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = sill, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = stem, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = leaves, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_point(data = apex, .aes(x, y),
      color = bright, size = 5 * s)
  )
}

# ── glyph_agent_janitor: broom with sparkle marks ─────────────────────────
glyph_agent_janitor <- function(cx, cy, s, col, bright) {
  # Broom handle (diagonal)
  handle <- data.frame(
    x = c(cx - 8 * s, cx + 12 * s),
    y = c(cy + 28 * s, cy - 12 * s)
  )
  # Broom bristles (fan at bottom)
  bristle_angles <- seq(-0.5, 0.5, length.out = 7)
  bristles <- do.call(rbind, lapply(bristle_angles, function(a) {
    dx <- sin(a) * 14 * s
    dy <- -cos(a) * 14 * s
    rbind(
      data.frame(x = cx + 12 * s, y = cy - 12 * s),
      data.frame(x = cx + 12 * s + dx, y = cy - 12 * s + dy - 6 * s),
      data.frame(x = NA, y = NA)
    )
  }))
  # Sparkle marks (clean indicators)
  spark1 <- data.frame(
    x = c(cx - 18 * s, cx - 18 * s, NA, cx - 22 * s, cx - 14 * s),
    y = c(cy + 6 * s, cy + 14 * s, NA, cy + 10 * s, cy + 10 * s)
  )
  spark2 <- data.frame(
    x = c(cx - 24 * s, cx - 24 * s, NA, cx - 27 * s, cx - 21 * s),
    y = c(cy - 4 * s, cy + 2 * s, NA, cy - 1 * s, cy - 1 * s)
  )
  spark3 <- data.frame(
    x = c(cx + 20 * s, cx + 20 * s, NA, cx + 17 * s, cx + 23 * s),
    y = c(cy + 14 * s, cy + 20 * s, NA, cy + 17 * s, cy + 17 * s)
  )
  list(
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = hex_with_alpha(col, 0.7), linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = bristles, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = spark1, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = spark2, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = spark3, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.2))
  )
}

# ── glyph_agent_blender: 3D cube with Blender viewport ring ──────────────
glyph_agent_blender <- function(cx, cy, s, col, bright) {
  # Isometric cube (3 visible faces)
  sz <- 16 * s
  # Front face
  front <- data.frame(
    x = c(cx - sz, cx, cx, cx - sz),
    y = c(cy - sz * 0.4, cy - sz, cy + sz * 0.3, cy + sz * 0.7)
  )
  # Right face
  right <- data.frame(
    x = c(cx, cx + sz, cx + sz, cx),
    y = c(cy - sz, cy - sz * 0.4, cy + sz * 0.7, cy + sz * 0.3)
  )
  # Top face
  top <- data.frame(
    x = c(cx - sz, cx, cx + sz, cx),
    y = c(cy + sz * 0.7, cy + sz * 1.1, cy + sz * 0.7, cy + sz * 0.3)
  )
  # Viewport ring (circle around cube)
  ring <- data.frame(x0 = cx, y0 = cy + 2 * s, r = 28 * s)
  # Axis lines (RGB-style: x, y, z)
  axis_x <- data.frame(
    x = c(cx, cx + 20 * s), y = c(cy - sz * 0.2, cy - sz * 0.7)
  )
  axis_z <- data.frame(
    x = c(cx, cx), y = c(cy + sz * 0.3, cy + sz * 1.4)
  )
  list(
    ggforce::geom_circle(data = ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = front, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = right, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = top, .aes(x, y),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = axis_x, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = axis_z, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1))
  )
}

# ── glyph_agent_fabricator: 3D printer nozzle with layered output ─────────
glyph_agent_fabricator <- function(cx, cy, s, col, bright) {
  # Printer frame (inverted U)
  frame <- data.frame(
    x = c(cx - 22 * s, cx - 22 * s, cx + 22 * s, cx + 22 * s),
    y = c(cy - 20 * s, cy + 20 * s, cy + 20 * s, cy - 20 * s)
  )
  # Horizontal rail at top
  rail <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy + 14 * s, cy + 14 * s)
  )
  # Nozzle (triangle pointing down)
  nozzle <- data.frame(
    x = c(cx - 5 * s, cx + 5 * s, cx),
    y = c(cy + 14 * s, cy + 14 * s, cy + 6 * s)
  )
  # Build plate
  plate <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 22 * s, ymax = cy - 18 * s
  )
  # Printed layers (stacked horizontal lines)
  layer_ys <- seq(cy - 16 * s, cy - 4 * s, length.out = 5)
  layer_widths <- c(16, 14, 12, 10, 8) * s
  layers_list <- list(
    ggplot2::geom_path(data = frame, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = rail, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = nozzle, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = plate,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1))
  )
  for (i in seq_along(layer_ys)) {
    w <- layer_widths[i]
    alpha <- 0.3 + 0.15 * i
    ld <- data.frame(
      x = c(cx - w / 2, cx + w / 2),
      y = c(layer_ys[i], layer_ys[i])
    )
    layers_list[[length(layers_list) + 1]] <- ggplot2::geom_path(
      data = ld, .aes(x, y),
      color = hex_with_alpha(bright, min(alpha, 1)), linewidth = .lw(s, 2.5)
    )
  }
  layers_list
}

# ── glyph_agent_kabalist: Tree of Life (3 pillars + sephirot circles) ─────
glyph_agent_kabalist <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Three pillars (vertical lines)
  for (px in c(-16, 0, 16) * s) {
    pillar <- data.frame(x = c(cx + px, cx + px), y = c(cy - 26 * s, cy + 26 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pillar, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.5))
  }
  # Sephirot positions (simplified Tree of Life: 10 circles)
  seph <- data.frame(
    x0 = cx + c(0, -16, 16, -16, 16, 0, -16, 16, 0, 0) * s,
    y0 = cy + c(26, 16, 16, 4, 4, -2, -14, -14, -20, -26) * s,
    r = rep(5 * s, 10)
  )
  # Connecting paths between sephirot
  edges <- list(c(1,2), c(1,3), c(2,4), c(3,5), c(2,6), c(3,6),
                c(4,6), c(5,6), c(4,7), c(5,8), c(6,9), c(7,9), c(8,9), c(9,10))
  for (e in edges) {
    ed <- data.frame(x = c(seph$x0[e[1]], seph$x0[e[2]]),
                     y = c(seph$y0[e[1]], seph$y0[e[2]]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ed, .aes(x, y),
      color = hex_with_alpha(bright, 0.25), linewidth = .lw(s, 1))
  }
  # Draw sephirot circles
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = seph,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))
  layers
}

# ── glyph_agent_lapidary: faceted gemstone with cutting angles ────────────
glyph_agent_lapidary <- function(cx, cy, s, col, bright) {
  # Crown (top facets: table + kite facets)
  table <- data.frame(
    x = c(cx - 10 * s, cx + 10 * s, cx + 14 * s, cx - 14 * s),
    y = c(cy + 10 * s, cy + 10 * s, cy + 4 * s, cy + 4 * s)
  )
  # Crown outline (wider than table)
  crown <- data.frame(
    x = c(cx - 22 * s, cx - 14 * s, cx - 10 * s, cx + 10 * s, cx + 14 * s, cx + 22 * s),
    y = c(cy - 2 * s, cy + 4 * s, cy + 10 * s, cy + 10 * s, cy + 4 * s, cy - 2 * s)
  )
  # Pavilion (bottom: V-shape)
  pavilion <- data.frame(
    x = c(cx - 22 * s, cx, cx + 22 * s),
    y = c(cy - 2 * s, cy - 28 * s, cy - 2 * s)
  )
  # Internal facet lines
  facet_l <- data.frame(x = c(cx - 14 * s, cx), y = c(cy + 4 * s, cy - 28 * s))
  facet_r <- data.frame(x = c(cx + 14 * s, cx), y = c(cy + 4 * s, cy - 28 * s))
  facet_m <- data.frame(x = c(cx, cx), y = c(cy + 10 * s, cy - 28 * s))
  list(
    ggplot2::geom_polygon(data = pavilion, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = crown, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = table, .aes(x, y),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = facet_l, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = facet_r, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = facet_m, .aes(x, y),
      color = hex_with_alpha(bright, 0.15), linewidth = .lw(s, 0.8))
  )
}

# ── glyph_agent_number_theorist: prime spiral with number markers ─────────
glyph_agent_number_theorist <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Spiral path (Archimedean)
  t <- seq(0, 4 * pi, length.out = 80)
  spiral <- data.frame(
    x = cx + (4 + 5 * t) * s * cos(t),
    y = cy + (4 + 5 * t) * s * sin(t)
  )
  layers[[1]] <- ggplot2::geom_path(data = spiral, .aes(x, y),
    color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5))
  # Prime number markers at positions along the spiral
  primes <- c(2, 3, 5, 7, 11, 13, 17, 19, 23)
  idx <- round(primes / 23 * 79) + 1
  idx <- pmin(idx, nrow(spiral))
  pts <- data.frame(x0 = spiral$x[idx], y0 = spiral$y[idx], r = rep(3 * s, length(idx)))
  layers[[2]] <- ggforce::geom_circle(data = pts,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1))
  # Outer ring
  ring <- data.frame(x0 = cx, y0 = cy, r = 28 * s)
  layers[[3]] <- ggforce::geom_circle(data = ring,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = NA, color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.5))
  layers
}

# ── glyph_agent_skill_reviewer: magnifier over SKILL.md document ──────────
glyph_agent_skill_reviewer <- function(cx, cy, s, col, bright) {
  # Document body
  doc <- data.frame(
    x = c(cx - 14 * s, cx + 14 * s, cx + 14 * s, cx - 14 * s),
    y = c(cy - 22 * s, cy - 22 * s, cy + 18 * s, cy + 18 * s)
  )
  # Text lines on document
  layers <- list(
    ggplot2::geom_polygon(data = doc, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5))
  )
  for (ly in seq(cy - 14 * s, cy + 10 * s, by = 6 * s)) {
    w <- if (ly > cy + 6 * s) 16 else 22
    line_d <- data.frame(
      x = c(cx - 10 * s, cx - 10 * s + w * s),
      y = c(ly, ly)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_d, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.5))
  }
  # Magnifier (circle + handle) in top-right
  mag <- data.frame(x0 = cx + 10 * s, y0 = cy + 12 * s, r = 10 * s)
  handle <- data.frame(
    x = c(cx + 17 * s, cx + 24 * s),
    y = c(cy + 5 * s, cy - 2 * s)
  )
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = mag,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 2))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))
  layers
}

# ── glyph_agent_version_manager: semantic version tag with increment arrow ─
glyph_agent_version_manager <- function(cx, cy, s, col, bright) {
  # Version tag (rounded rectangle shape via polygon)
  tag <- data.frame(
    x = c(cx - 20 * s, cx + 20 * s, cx + 20 * s, cx - 20 * s),
    y = c(cy - 8 * s, cy - 8 * s, cy + 8 * s, cy + 8 * s)
  )
  # Three version number segments (major.minor.patch)
  sep1 <- data.frame(x = c(cx - 7 * s, cx - 7 * s), y = c(cy - 6 * s, cy + 6 * s))
  sep2 <- data.frame(x = c(cx + 7 * s, cx + 7 * s), y = c(cy - 6 * s, cy + 6 * s))
  # Upward arrow (version bump)
  arrow_shaft <- data.frame(x = c(cx, cx), y = c(cy + 12 * s, cy + 26 * s))
  arrow_head <- data.frame(
    x = c(cx - 6 * s, cx, cx + 6 * s),
    y = c(cy + 20 * s, cy + 26 * s, cy + 20 * s)
  )
  # Circular dots for major.minor.patch
  dots <- data.frame(
    x0 = c(cx - 14 * s, cx, cx + 14 * s),
    y0 = rep(cy, 3),
    r = rep(3.5 * s, 3)
  )
  list(
    ggplot2::geom_polygon(data = tag, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = sep1, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = sep2, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = dots,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = arrow_shaft, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = arrow_head, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}

# ── glyph_agent_advocatus: devil's pitchfork crossed with scales ──────────
glyph_agent_advocatus <- function(cx, cy, s, col, bright) {
  # Pitchfork handle
  handle <- data.frame(x = c(cx, cx), y = c(cy - 22 * s, cy + 8 * s))
  # Three prongs
  prong_l <- data.frame(x = c(cx - 10 * s, cx - 10 * s, cx - 6 * s),
                        y = c(cy + 18 * s, cy + 12 * s, cy + 8 * s))
  prong_m <- data.frame(x = c(cx, cx), y = c(cy + 22 * s, cy + 8 * s))
  prong_r <- data.frame(x = c(cx + 10 * s, cx + 10 * s, cx + 6 * s),
                        y = c(cy + 18 * s, cy + 12 * s, cy + 8 * s))
  # Small balance scale at base
  beam <- data.frame(x = c(cx - 12 * s, cx + 12 * s),
                     y = c(cy - 14 * s, cy - 14 * s))
  pan_l <- data.frame(x0 = cx - 12 * s, y0 = cy - 18 * s, r = 4 * s)
  pan_r <- data.frame(x0 = cx + 12 * s, y0 = cy - 18 * s, r = 4 * s)
  list(
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = prong_l, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = prong_m, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = prong_r, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = beam, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = pan_l, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = pan_r, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_apa: academic document with APA header ───────────────────
glyph_agent_apa <- function(cx, cy, s, col, bright) {
  # Document outline
  doc <- data.frame(
    x = c(cx - 16 * s, cx + 16 * s, cx + 16 * s, cx - 16 * s),
    y = c(cy + 22 * s, cy + 22 * s, cy - 22 * s, cy - 22 * s)
  )
  # Header line (bold - represents "APA" title)
  header <- data.frame(x = c(cx - 10 * s, cx + 10 * s), y = c(cy + 16 * s, cy + 16 * s))
  # Centered text lines
  lines_y <- c(8, 2, -4, -10, -16)
  layers <- list(
    ggplot2::geom_polygon(data = doc, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = header, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  )
  for (y_off in lines_y) {
    w <- if (y_off == -16) 6 else 10
    line <- data.frame(
      x = c(cx - w * s, cx + w * s),
      y = c(cy + y_off * s, cy + y_off * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_agent_etymologist: root tree with word-family branches ─────────
glyph_agent_etymologist <- function(cx, cy, s, col, bright) {
  # Central trunk (word root)
  trunk <- data.frame(x = c(cx, cx), y = c(cy - 16 * s, cy + 4 * s))
  # Deep root (origin language)
  root <- data.frame(x = c(cx, cx), y = c(cy - 16 * s, cy - 24 * s))
  root_l <- data.frame(x = c(cx, cx - 8 * s), y = c(cy - 24 * s, cy - 28 * s))
  root_r <- data.frame(x = c(cx, cx + 8 * s), y = c(cy - 24 * s, cy - 28 * s))
  # Branch out to descendant words
  br1 <- data.frame(x = c(cx, cx - 18 * s), y = c(cy + 4 * s, cy + 16 * s))
  br2 <- data.frame(x = c(cx, cx - 6 * s), y = c(cy + 4 * s, cy + 20 * s))
  br3 <- data.frame(x = c(cx, cx + 6 * s), y = c(cy + 4 * s, cy + 20 * s))
  br4 <- data.frame(x = c(cx, cx + 18 * s), y = c(cy + 4 * s, cy + 16 * s))
  # Leaf nodes (modern word forms)
  leaves <- data.frame(
    x0 = cx + c(-18, -6, 6, 18) * s,
    y0 = cy + c(16, 20, 20, 16) * s,
    r = rep(3.5 * s, 4)
  )
  # Root node
  root_node <- data.frame(x0 = cx, y0 = cy - 24 * s, r = 4 * s)
  list(
    ggplot2::geom_path(data = trunk, .aes(x, y), color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = root, .aes(x, y), color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = root_l, .aes(x, y), color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = root_r, .aes(x, y), color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = root_node, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = br1, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = br2, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = br3, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = br4, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = leaves, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_nlp: text tokens flowing through transformer ─────────────
glyph_agent_nlp <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Input token blocks (left column)
  for (i in 0:2) {
    y_pos <- cy + (8 - i * 10) * s
    tok <- data.frame(
      xmin = cx - 24 * s, xmax = cx - 12 * s,
      ymin = y_pos - 3 * s, ymax = y_pos + 3 * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = tok,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5))
  }
  # Central transformer block
  trans <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 6 * s,
    ymin = cy - 14 * s, ymax = cy + 14 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = trans,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(bright, 0.12), color = bright, linewidth = .lw(s, 2))
  # Attention lines inside transformer
  for (y_off in c(-6, 0, 6)) {
    attn <- data.frame(
      x = c(cx - 4 * s, cx + 4 * s),
      y = c(cy + y_off * s, cy + y_off * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = attn, .aes(x, y),
      color = bright, linewidth = .lw(s, 1))
  }
  # Output token blocks (right column)
  for (i in 0:2) {
    y_pos <- cy + (8 - i * 10) * s
    tok <- data.frame(
      xmin = cx + 12 * s, xmax = cx + 24 * s,
      ymin = y_pos - 3 * s, ymax = y_pos + 3 * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = tok,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
  }
  # Flow arrows
  arr_l <- data.frame(x = c(cx - 12 * s, cx - 6 * s), y = c(cy, cy))
  arr_r <- data.frame(x = c(cx + 6 * s, cx + 12 * s), y = c(cy, cy))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arr_l, .aes(x, y),
    color = col, linewidth = .lw(s, 2),
    arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed"))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arr_r, .aes(x, y),
    color = bright, linewidth = .lw(s, 2),
    arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed"))
  layers
}

# ── Entomology agents (3) ──────────────────────────────────────────────────

# ── glyph_agent_conservation_ento: leaf-shield with insect ─────────────────
glyph_agent_conservation_ento <- function(cx, cy, s, col, bright) {
  # Shield outline
  t_shield <- seq(0, 2 * pi, length.out = 40)
  shield_r <- 20 * s
  shield <- data.frame(
    x = cx + shield_r * 0.8 * cos(t_shield),
    y = cy + shield_r * sin(t_shield) * ifelse(t_shield > pi, 0.7, 1)
  )
  # Leaf vein inside shield
  stem_leaf <- data.frame(x = c(cx, cx), y = c(cy - 10 * s, cy + 14 * s))
  vein_l <- data.frame(x = c(cx, cx - 10 * s), y = c(cy + 4 * s, cy + 10 * s))
  vein_r <- data.frame(x = c(cx, cx + 10 * s), y = c(cy + 4 * s, cy + 10 * s))
  # Small insect silhouette
  bug <- data.frame(x0 = cx, y0 = cy - 4 * s, r = 3 * s)
  bug_legs <- list()
  for (a in c(pi/4, pi/2, 3*pi/4, 5*pi/4, 3*pi/2, 7*pi/4)) {
    bug_legs[[length(bug_legs) + 1]] <- data.frame(
      x = c(cx + 3 * s * cos(a), cx + 6 * s * cos(a)),
      y = c(cy - 4 * s + 3 * s * sin(a), cy - 4 * s + 6 * s * sin(a))
    )
  }
  layers <- list(
    ggplot2::geom_path(data = shield, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = stem_leaf, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = vein_l, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = vein_r, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = bug, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  )
  for (leg in bug_legs) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = leg, .aes(x, y),
      color = bright, linewidth = .lw(s, 1))
  }
  layers
}

# ── glyph_agent_taxonomic_ento: magnifier over segmented insect ────────────
glyph_agent_taxonomic_ento <- function(cx, cy, s, col, bright) {
  # Magnifying glass handle
  handle <- data.frame(
    x = c(cx + 10 * s, cx + 22 * s),
    y = c(cy - 8 * s, cy - 20 * s)
  )
  # Lens circle
  lens <- data.frame(x0 = cx - 2 * s, y0 = cy + 4 * s, r = 14 * s)
  # Insect inside lens (segmented body)
  seg1 <- data.frame(x0 = cx - 2 * s, y0 = cy + 10 * s, r = 3 * s)
  seg2 <- data.frame(x0 = cx - 2 * s, y0 = cy + 4 * s, r = 4 * s)
  seg3 <- data.frame(x0 = cx - 2 * s, y0 = cy - 3 * s, r = 3.5 * s)
  # Classification brackets on right
  brk_top <- data.frame(
    x = cx + c(16, 20, 20, 16) * s,
    y = cy + c(14, 14, 6, 6) * s
  )
  brk_bot <- data.frame(
    x = cx + c(16, 20, 20, 16) * s,
    y = cy + c(2, 2, -6, -6) * s
  )
  list(
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = col, linewidth = .lw(s, 3)),
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.06), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = seg1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = seg2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = seg3, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = brk_top, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = brk_bot, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_agent_citizen_ento: smartphone with insect + upload arrow ────────
glyph_agent_citizen_ento <- function(cx, cy, s, col, bright) {
  # Phone outline
  phone <- data.frame(
    xmin = cx - 12 * s, xmax = cx + 12 * s,
    ymin = cy - 20 * s, ymax = cy + 20 * s
  )
  # Screen area
  screen <- data.frame(
    xmin = cx - 10 * s, xmax = cx + 10 * s,
    ymin = cy - 16 * s, ymax = cy + 14 * s
  )
  # Insect on screen
  body_c <- data.frame(x0 = cx, y0 = cy - 2 * s, r = 5 * s)
  head_c <- data.frame(x0 = cx, y0 = cy + 5 * s, r = 3 * s)
  # Share/upload arrow
  arrow_shaft <- data.frame(
    x = c(cx + 18 * s, cx + 18 * s),
    y = c(cy + 4 * s, cy + 18 * s)
  )
  arrow_head <- data.frame(
    x = cx + c(14, 18, 22) * s,
    y = cy + c(14, 20, 14) * s
  )
  list(
    ggplot2::geom_rect(data = phone, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = screen, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.05), color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = body_c, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = head_c, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = arrow_shaft, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

# ── glyph_agent_contemplative: still water with single ripple ────────────────
glyph_agent_contemplative <- function(cx, cy, s, col, bright) {
  # Horizontal line (water surface) with concentric quarter-circles
  # radiating from center — awareness without action
  water <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy, cy)
  )
  # Concentric ripple arcs above the water line
  layers <- list(
    ggplot2::geom_path(data = water, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
  for (i in 1:4) {
    r <- (6 + i * 5) * s
    t_arc <- seq(pi, 2 * pi, length.out = 30)
    arc <- data.frame(
      x = cx + r * cos(t_arc),
      y = cy + r * sin(t_arc)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
      color = hex_with_alpha(bright, 0.6 - i * 0.1), linewidth = .lw(s, 2 - i * 0.3))
  }
  # Small still point at center of water surface
  center <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5))
  layers
}

# ── glyph_agent_spectroscopist: prism dispersing light ────────────────────────
glyph_agent_spectroscopist <- function(cx, cy, s, col, bright) {
  # Triangular prism with light beam entering left, rainbow bands exiting right
  # Prism triangle
  prism <- data.frame(
    x = cx + c(-8, 8, 0, -8) * s,
    y = cy + c(-14, -14, 14, -14) * s
  )
  # Incoming light beam (single line from left)
  beam_in <- data.frame(
    x = c(cx - 24 * s, cx - 4 * s),
    y = c(cy + 2 * s, cy + 2 * s)
  )
  # Dispersed spectrum bands (5 lines fanning out from right side of prism)
  layers <- list(
    ggplot2::geom_polygon(data = prism, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2.2)),
    ggplot2::geom_path(data = beam_in, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
  # 5 dispersed spectrum lines
  angles <- seq(-0.35, 0.35, length.out = 5)
  alphas <- c(0.5, 0.65, 0.8, 0.65, 0.5)
  for (i in seq_along(angles)) {
    band <- data.frame(
      x = c(cx + 4 * s, cx + 24 * s * cos(angles[i]) + 4 * s),
      y = c(cy - 2 * s, cy + 20 * s * sin(angles[i]) - 2 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = band, .aes(x, y),
      color = hex_with_alpha(bright, alphas[i]), linewidth = .lw(s, 1.5 + 0.3 * (3 - abs(i - 3))))
  }
  layers
}

# ── glyph_agent_chromatographer: column with separated bands ──────────────────
glyph_agent_chromatographer <- function(cx, cy, s, col, bright) {
  # Vertical column rectangle with colored horizontal bands inside showing separation
  # Column outline
  col_rect <- data.frame(
    xmin = cx - 8 * s, xmax = cx + 8 * s,
    ymin = cy - 22 * s, ymax = cy + 22 * s
  )
  # Flow arrow at top
  arrow_shaft <- data.frame(
    x = c(cx, cx),
    y = c(cy + 28 * s, cy + 22 * s)
  )
  arrow_head <- data.frame(
    x = cx + c(-3, 0, 3) * s,
    y = cy + c(24, 22, 24) * s
  )
  # Separated bands inside column (3 bands at different heights)
  layers <- list(
    ggplot2::geom_rect(data = col_rect, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.06), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = arrow_shaft, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.8)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = hex_with_alpha(col, 0.6), color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 0.5))
  )
  # 3 separated bands
  band_ys <- c(10, 0, -12)
  band_alphas <- c(0.35, 0.55, 0.25)
  band_heights <- c(4, 3, 5)
  for (i in seq_along(band_ys)) {
    band <- data.frame(
      xmin = cx - 7 * s, xmax = cx + 7 * s,
      ymin = cy + (band_ys[i] - band_heights[i]) * s,
      ymax = cy + (band_ys[i] + band_heights[i]) * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = band,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, band_alphas[i]), color = "transparent", linewidth = 0)
  }
  layers
}

# ── glyph_agent_logician: NAND gate with binary digits ────────────────────────
glyph_agent_logician <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Gate body (D-shape)
  t_arc <- seq(-pi / 2, pi / 2, length.out = 30)
  arc_r <- 14 * s
  body <- data.frame(
    x = c(cx - 10 * s, cx - 10 * s,
          cx + arc_r * cos(t_arc),
          cx - 10 * s),
    y = c(cy - 12 * s, cy + 12 * s,
          cy + arc_r * sin(t_arc),
          cy - 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = body, .aes(x, y),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2.2))

  # Inversion bubble
  bubble <- data.frame(x0 = cx + 16 * s, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = bubble,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.05), color = bright, linewidth = .lw(s, 1.5))

  # Input lines
  for (yoff in c(6, -6)) {
    inp <- data.frame(
      x = c(cx - 22 * s, cx - 10 * s),
      y = c(cy + yoff * s, cy + yoff * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = inp, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))
  }

  # Output line
  outp <- data.frame(
    x = c(cx + 19 * s, cx + 26 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = outp, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))

  # Binary digit indicators (0 and 1)
  zero <- data.frame(x0 = cx - 22 * s, y0 = cy + 16 * s, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = zero,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = "transparent", color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))

  # "1" as a vertical bar
  one <- data.frame(
    x = c(cx + 24 * s, cx + 24 * s),
    y = c(cy + 13 * s, cy + 19 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = one, .aes(x, y),
    color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 2))

  layers
}

# ── glyph_agent_physicist: atom orbital rings around central dot ───────────────
glyph_agent_physicist <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Three elliptical orbital rings at different tilts
  orbit_r <- 22 * s
  orbit_minor <- 8 * s

  tilts <- c(0, 2 * pi / 3, 4 * pi / 3)
  for (tilt in tilts) {
    t_ell <- seq(0, 2 * pi, length.out = 60)
    ell <- data.frame(
      x = cx + orbit_r * cos(t_ell) * cos(tilt) - orbit_minor * sin(t_ell) * sin(tilt),
      y = cy + orbit_r * cos(t_ell) * sin(tilt) + orbit_minor * sin(t_ell) * cos(tilt)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ell, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.8))
  }

  # Central nucleus
  nucleus <- data.frame(x0 = cx, y0 = cy, r = 5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = nucleus,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2))

  # Electron dots on orbits
  for (i in seq_along(tilts)) {
    tilt <- tilts[i]
    t_e <- i * 2 * pi / 3 + pi / 6
    ex <- cx + orbit_r * cos(t_e) * cos(tilt) - orbit_minor * sin(t_e) * sin(tilt)
    ey <- cy + orbit_r * cos(t_e) * sin(tilt) + orbit_minor * sin(t_e) * cos(tilt)
    electron <- data.frame(x0 = ex, y0 = ey, r = 2.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = electron,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.7), color = bright, linewidth = .lw(s, 1.2))
  }

  layers
}

# ── glyph_agent_adaptic: panoramic eye with multi-domain lens ────────────────
glyph_agent_adaptic <- function(cx, cy, s, col, bright) {
  layers <- list()

  # Almond / vesica eye outline — two arcs (top and bottom)
  t_arc <- seq(0, pi, length.out = 50)
  eye_w <- 26 * s   # half-width of the almond
  eye_h <- 14 * s   # half-height at centre

  # Upper arc (convex upward)
  upper <- data.frame(
    x = cx + eye_w * cos(t_arc),
    y = cy + eye_h * sin(t_arc)
  )
  # Lower arc (convex downward, mirror)
  lower <- data.frame(
    x = cx + eye_w * cos(t_arc),
    y = cy - eye_h * sin(t_arc)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = upper, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = lower, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  # 3 overlapping domain-lens circles inside the eye
  offsets <- c(-8, 0, 8)
  radii   <- c(7, 8, 7)
  alphas  <- c(0.12, 0.18, 0.12)
  for (i in seq_along(offsets)) {
    lens <- data.frame(x0 = cx + offsets[i] * s, y0 = cy, r = radii[i] * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = lens,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, alphas[i]),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))
  }

  # Central bright integrating-awareness point
  core <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = core,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.7), color = bright, linewidth = .lw(s, 2))

  layers
}

# ── glyph_agent_translator: overlapping documents with translation bridge ─────
glyph_agent_translator <- function(cx, cy, s, col, bright) {
  # Two document pages side by side with a curved arrow between them and an
  # "A" on the source page — the translator agent persona bridging languages.
  layers <- list()

  # Left document (source, slightly larger to emphasize origin)
  left_cx <- cx - 12 * s
  doc_w <- 20 * s
  doc_h <- 28 * s
  left_doc <- data.frame(
    xmin = left_cx - doc_w / 2, xmax = left_cx + doc_w / 2,
    ymin = cy - doc_h / 2, ymax = cy + doc_h / 2
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = left_doc,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2))

  # "A" letter on source page (representing source language)
  a_letter <- data.frame(
    x = left_cx + c(-5, 0, 5) * s,
    y = cy + c(-6, 6, -6) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = a_letter, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  # A crossbar
  a_bar <- data.frame(
    x = c(left_cx - 3 * s, left_cx + 3 * s),
    y = c(cy - 1 * s, cy - 1 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = a_bar, .aes(x, y),
    color = bright, linewidth = .lw(s, 1.5))

  # Right document (target, slightly offset down)
  right_cx <- cx + 12 * s
  right_doc <- data.frame(
    xmin = right_cx - doc_w / 2, xmax = right_cx + doc_w / 2,
    ymin = cy - doc_h / 2 - 2 * s, ymax = cy + doc_h / 2 - 2 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = right_doc,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.08), color = hex_with_alpha(bright, 0.7),
    linewidth = .lw(s, 2))

  # Text lines on right page (varied lengths = different language)
  line_widths <- c(12, 8, 14, 10)
  for (i in 1:4) {
    ly <- cy + (8 - i * 5) * s - 2 * s
    line_data <- data.frame(
      x = c(right_cx - 7 * s, right_cx - 7 * s + line_widths[i] * s),
      y = c(ly, ly)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_data, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.3))
  }

  # Curved arrow from left doc to right doc (above)
  t_arrow <- seq(pi, 0, length.out = 30)
  arrow_r <- 10 * s
  arrow_arc <- data.frame(
    x = cx + arrow_r * cos(t_arrow),
    y = cy + 16 * s + 5 * s * sin(t_arrow)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_arc, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Arrowhead
  arrow_tip_x <- cx + arrow_r
  arrow_tip_y <- cy + 16 * s
  arrow_head <- data.frame(
    x = arrow_tip_x + c(-3.5, 0, -3.5) * s,
    y = arrow_tip_y + c(2.5, 0, -2.5) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
    fill = bright, color = "transparent", linewidth = 0)

  layers
}

# -- glyph_agent_cli_dev: terminal with wrench overlay -------------------------
glyph_agent_cli_dev <- function(cx, cy, s, col, bright) {
  # A terminal window with a small wrench/tool overlay — the CLI developer
  # who builds command-line tools.
  layers <- list()

  # Terminal frame
  frame <- data.frame(
    xmin = cx - 20 * s, xmax = cx + 20 * s,
    ymin = cy - 16 * s, ymax = cy + 16 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = frame,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Title bar
  bar <- data.frame(
    x = c(cx - 20 * s, cx + 20 * s),
    y = c(cy + 10 * s, cy + 10 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bar, .aes(x, y),
    color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1))

  # Three dots in title bar
  for (i in 1:3) {
    dot <- data.frame(x0 = cx + (-14 + (i - 1) * 5) * s, y0 = cy + 13 * s, r = 1.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = "transparent", linewidth = 0)
  }

  # Prompt chevron
  chevron <- data.frame(
    x = cx + c(-14, -10, -14) * s,
    y = cy + c(4, 1, -2) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = chevron, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Cursor block (blinking cursor)
  cursor <- data.frame(
    xmin = cx - 6 * s, xmax = cx - 4 * s,
    ymin = cy - 2 * s, ymax = cy + 4 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = cursor,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(bright, 0.6), color = "transparent", linewidth = 0)

  # Output line
  out_line <- data.frame(
    x = c(cx - 14 * s, cx + 6 * s),
    y = c(cy - 6 * s, cy - 6 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = out_line, .aes(x, y),
    color = hex_with_alpha(bright, 0.35), linewidth = .lw(s, 1.8))

  # Wrench overlay (bottom-right corner)
  wrench_cx <- cx + 14 * s
  wrench_cy <- cy - 10 * s
  handle <- data.frame(
    x = c(wrench_cx - 2 * s, wrench_cx + 6 * s),
    y = c(wrench_cy + 6 * s, wrench_cy - 2 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.5))

  head <- data.frame(x0 = wrench_cx - 3 * s, y0 = wrench_cy + 7 * s, r = 2.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = head,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))

  layers
}

# ── glyph_agent_claw_polisher: stylized claw with sparkle accents ────────────
glyph_agent_claw_polisher <- function(cx, cy, s, col, bright) {
  # A three-pronged claw (talon) with small sparkle dots representing
  # the polishing / refinement aspect of open-source contribution.
  layers <- list()

  # Three claw prongs radiating from a base arc
  for (i in 1:3) {
    angle <- (i - 2) * 0.4 + pi / 2  # fan out from top
    base_x <- cx + 5 * s * cos(angle + pi)
    base_y <- cy + 5 * s * sin(angle + pi)
    tip_x <- cx + 24 * s * cos(angle)
    tip_y <- cy + 24 * s * sin(angle)
    mid_x <- cx + 16 * s * cos(angle + 0.15)
    mid_y <- cy + 16 * s * sin(angle + 0.15)
    prong <- data.frame(
      x = c(base_x, mid_x, tip_x),
      y = c(base_y, mid_y, tip_y)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = prong, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5), lineend = "round")
  }

  # Base arc connecting prong roots
  arc_t <- seq(-0.4 + pi / 2 + pi, 0.4 + pi / 2 + pi, length.out = 12)
  arc <- data.frame(
    x = cx + 8 * s * cos(arc_t),
    y = cy + 8 * s * sin(arc_t)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))

  # Sparkle dots (polishing effect) — 3 small circles near the tips
  sparkle_offsets <- list(c(-18, 12), c(8, 20), c(20, 6))
  for (sp in sparkle_offsets) {
    dot <- data.frame(x0 = cx + sp[1] * s, y0 = cy + sp[2] * s, r = 2 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.7), color = NA)
  }

  layers
}

# ── GPU Optimization ──────────────────────────────────────────────────

glyph_agent_kernel_optimizer <- function(cx, cy, s, col, bright) {
  # GPU chip with a tuning dial — the kernel performance engineer
  layers <- list()

  # GPU die
  die <- data.frame(
    xmin = cx - 16 * s, xmax = cx + 16 * s,
    ymin = cy - 10 * s, ymax = cy + 10 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = die,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Memory bus lines (horizontal, inside die)
  for (y_off in c(-5, 0, 5)) {
    bus <- data.frame(
      x = c(cx - 12 * s, cx + 12 * s),
      y = c(cy + y_off * s, cy + y_off * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bus, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1))
  }

  # Warp blocks (small filled squares on bus lines)
  for (y_off in c(-5, 0, 5)) {
    for (x_off in c(-8, -2, 4, 10)) {
      blk <- data.frame(
        xmin = cx + (x_off - 2) * s, xmax = cx + (x_off + 2) * s,
        ymin = cy + (y_off - 1.5) * s, ymax = cy + (y_off + 1.5) * s
      )
      layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = blk,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(bright, 0.15), color = hex_with_alpha(bright, 0.4),
        linewidth = .lw(s, 0.6))
    }
  }

  # Tuning dial (bottom-right) — circular gauge with needle
  dial_cx <- cx + 12 * s
  dial_cy <- cy - 16 * s
  dial <- data.frame(x0 = dial_cx, y0 = dial_cy, r = 6 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dial,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5))

  # Needle pointing to "optimized" position (~2 o'clock)
  needle_angle <- pi / 4
  needle <- data.frame(
    x = c(dial_cx, dial_cx + 4.5 * s * cos(needle_angle)),
    y = c(dial_cy, dial_cy + 4.5 * s * sin(needle_angle))
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = needle, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  layers
}
