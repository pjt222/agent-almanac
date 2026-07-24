# primitives.R - Glyph library for pictogram-style icon generation
# Each glyph function: glyph_xxx(cx, cy, s, col, bright) -> list of ggplot2 layers
# cx, cy = center; s = scale (1.0 = fill ~70% of 100x100 canvas); col = domain color; bright = brightened color

# ── Helpers ────────────────────────────────────────────────────────────────
.lw <- function(s, base = 2.5) base * s
.aes <- ggplot2::aes

# ── glyph_polychromatic_a: three-color A-shaped graph ─────────────────────
# Favicon glyph: letter A formed by 3 colored polygon segments + 3 vertex nodes.
# Unlike standard glyphs, takes a `colors` list(c1, c2, c3) instead of col/bright.
# Legs use arc caps at node ends; crossbar uses mitered ends at leg crossings.
glyph_polychromatic_a <- function(cx, cy, s, colors) {
  c1 <- colors$c1  # left leg
  c2 <- colors$c2  # right leg
  c3 <- colors$c3  # crossbar

  # Helper: points along a circular arc
  arc_pts <- function(center_x, center_y, radius, from_angle, to_angle, n = 8) {
    angles <- seq(from_angle, to_angle, length.out = n)
    data.frame(x = center_x + radius * cos(angles),
               y = center_y + radius * sin(angles))
  }

  # Helper: build a leg polygon with arc caps at each node end
  # node_a → node_b direction, with arc caps fitting against node circles
  leg_polygon <- function(ax, ay, bx, by) {
    hw    <- lw / 2                           # half-width of the leg
    t_em  <- sqrt(fit_r^2 - hw^2)            # emergence distance from node center

    # Unit vector along the leg (a → b)
    dx <- bx - ax; dy <- by - ay
    leg_len <- sqrt(dx^2 + dy^2)
    ux <- dx / leg_len; uy <- dy / leg_len

    # Perpendicular (left when facing a→b)
    px <- -uy; py <- ux

    # ── Node-A end (start of leg) ──
    e1_a <- c(ax + t_em * ux + hw * px, ay + t_em * uy + hw * py)  # left edge
    e2_a <- c(ax + t_em * ux - hw * px, ay + t_em * uy - hw * py)  # right edge

    # Arc from e2_a → e1_a (convex cap curving toward node center)
    angle_e2_a <- atan2(e2_a[2] - ay, e2_a[1] - ax)
    angle_e1_a <- atan2(e1_a[2] - ay, e1_a[1] - ax)
    # Ensure arc goes the short way around (through the leg direction)
    if (angle_e1_a - angle_e2_a > pi) angle_e1_a <- angle_e1_a - 2 * pi
    if (angle_e2_a - angle_e1_a > pi) angle_e2_a <- angle_e2_a - 2 * pi
    arc_a <- arc_pts(ax, ay, fit_r, angle_e2_a, angle_e1_a, n = 10)

    # ── Node-B end (end of leg) ──
    e1_b <- c(bx - t_em * ux + hw * px, by - t_em * uy + hw * py)  # left edge
    e2_b <- c(bx - t_em * ux - hw * px, by - t_em * uy - hw * py)  # right edge

    # Arc from e1_b → e2_b (convex cap curving toward node center)
    angle_e1_b <- atan2(e1_b[2] - by, e1_b[1] - bx)
    angle_e2_b <- atan2(e2_b[2] - by, e2_b[1] - bx)
    if (angle_e2_b - angle_e1_b > pi) angle_e2_b <- angle_e2_b - 2 * pi
    if (angle_e1_b - angle_e2_b > pi) angle_e1_b <- angle_e1_b - 2 * pi
    arc_b <- arc_pts(bx, by, fit_r, angle_e1_b, angle_e2_b, n = 10)

    # Polygon vertex order: left edge a→b, arc at b, right edge b→a, arc at a
    data.frame(
      x = c(e1_a[1], e1_b[1], arc_b$x, e2_b[1], e2_a[1], arc_a$x),
      y = c(e1_a[2], e1_b[2], arc_b$y, e2_b[2], e2_a[2], arc_a$y)
    )
  }

  # A-shape vertices on 100x100 canvas (scaled + translated)
  apex_x  <- cx + 0 * s
  apex_y  <- cy + 32 * s
  bl_x    <- cx - 28 * s
  bl_y    <- cy - 28 * s
  br_x    <- cx + 28 * s
  br_y    <- cy - 28 * s

  # Crossbar at 40% height between legs
  frac <- 0.4
  cb_lx <- bl_x + frac * (apex_x - bl_x)
  cb_ly <- bl_y + frac * (apex_y - bl_y)
  cb_rx <- br_x + frac * (apex_x - br_x)
  cb_ry <- br_y + frac * (apex_y - br_y)

  node_r <- 10 * s   # data-coordinate radius for ggforce::geom_circle
  lw <- .lw(s, 3.0)
  hw <- lw / 2
  fit_r <- node_r + 4 * s  # arc cap radius — legs end 4*s outside circle edge

  # ── Leg polygons with arc caps ──
  left_leg_poly  <- leg_polygon(bl_x, bl_y, apex_x, apex_y)
  right_leg_poly <- leg_polygon(br_x, br_y, apex_x, apex_y)

  # ── Crossbar polygon with mitered ends ──
  # Crossbar direction
  cb_dx <- cb_rx - cb_lx; cb_dy <- cb_ry - cb_ly
  cb_len <- sqrt(cb_dx^2 + cb_dy^2)
  cb_ux <- cb_dx / cb_len; cb_uy <- cb_dy / cb_len
  cb_px <- -cb_uy; cb_py <- cb_ux  # crossbar perpendicular

  # Left leg unit vector (for miter cut at left crossbar end)
  ll_dx <- apex_x - bl_x; ll_dy <- apex_y - bl_y
  ll_len <- sqrt(ll_dx^2 + ll_dy^2)
  ll_ux <- ll_dx / ll_len; ll_uy <- ll_dy / ll_len

  # Right leg unit vector (for miter cut at right crossbar end)
  rl_dx <- apex_x - br_x; rl_dy <- apex_y - br_y
  rl_len <- sqrt(rl_dx^2 + rl_dy^2)
  rl_ux <- rl_dx / rl_len; rl_uy <- rl_dy / rl_len

  # Unified gap: circle-to-leg radial gap = crossbar-to-leg perpendicular gap
  element_gap <- fit_r - node_r

  # Trim crossbar so perpendicular gap to each leg = element_gap
  sin_theta <- sqrt(1 - (cb_ux * ll_ux + cb_uy * ll_uy)^2)
  if (abs(sin_theta) < 1e-10) sin_theta <- 1e-10
  cb_trim <- (hw + element_gap) / sin_theta
  cb_l_center <- c(cb_lx + cb_trim * cb_ux, cb_ly + cb_trim * cb_uy)
  cb_r_center <- c(cb_rx - cb_trim * cb_ux, cb_ry - cb_trim * cb_uy)

  # Miter: intersect crossbar top/bottom edges with cut lines ALONG leg direction
  # so the crossbar end edges are parallel to the adjacent leg's long sides.
  # Formula: t = -hw * (cb_p × leg_u) / (cb_u × leg_u)  [2D cross product]
  cross2 <- function(ax, ay, bx, by) ax * by - ay * bx

  # At left end: cut along left leg direction
  pxv_l <- cross2(cb_px, cb_py, ll_ux, ll_uy)
  uxv_l <- cross2(cb_ux, cb_uy, ll_ux, ll_uy)
  t_top_l <- if (abs(uxv_l) > 0.01) -hw * pxv_l / uxv_l else 0
  t_bot_l <- -t_top_l
  cb_lt <- c(cb_l_center[1] + hw * cb_px + t_top_l * cb_ux,
             cb_l_center[2] + hw * cb_py + t_top_l * cb_uy)
  cb_lb <- c(cb_l_center[1] - hw * cb_px + t_bot_l * cb_ux,
             cb_l_center[2] - hw * cb_py + t_bot_l * cb_uy)

  # At right end: cut along right leg direction
  pxv_r <- cross2(cb_px, cb_py, rl_ux, rl_uy)
  uxv_r <- cross2(cb_ux, cb_uy, rl_ux, rl_uy)
  t_top_r <- if (abs(uxv_r) > 0.01) -hw * pxv_r / uxv_r else 0
  t_bot_r <- -t_top_r
  cb_rt <- c(cb_r_center[1] + hw * cb_px + t_top_r * cb_ux,
             cb_r_center[2] + hw * cb_py + t_top_r * cb_uy)
  cb_rb <- c(cb_r_center[1] - hw * cb_px + t_bot_r * cb_ux,
             cb_r_center[2] - hw * cb_py + t_bot_r * cb_uy)

  crossbar_poly <- data.frame(
    x = c(cb_lt[1], cb_rt[1], cb_rb[1], cb_lb[1]),
    y = c(cb_lt[2], cb_rt[2], cb_rb[2], cb_lb[2])
  )

  # Node data (ggforce::geom_circle uses data coordinates for r)
  node_bl   <- data.frame(x0 = bl_x, y0 = bl_y, r = node_r)
  node_br   <- data.frame(x0 = br_x, y0 = br_y, r = node_r)
  node_apex <- data.frame(x0 = apex_x, y0 = apex_y, r = node_r)

  list(
    # Layer 1: crossbar polygon behind
    ggplot2::geom_polygon(data = crossbar_poly, .aes(x, y),
      fill = c3, color = NA),
    # Layer 2-3: leg polygons in middle
    ggplot2::geom_polygon(data = left_leg_poly, .aes(x, y),
      fill = c1, color = NA),
    ggplot2::geom_polygon(data = right_leg_poly, .aes(x, y),
      fill = c2, color = NA),
    # Layer 4-6: nodes on top (data-coordinate circles, consistent across SVG/PNG)
    ggforce::geom_circle(data = node_bl, .aes(x0 = x0, y0 = y0, r = r),
      color = c1, fill = hex_with_alpha(c1, 0.85),
      linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = node_br, .aes(x0 = x0, y0 = y0, r = r),
      color = c2, fill = hex_with_alpha(c2, 0.85),
      linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = node_apex, .aes(x0 = x0, y0 = y0, r = r),
      color = c3, fill = hex_with_alpha(c3, 0.85),
      linewidth = .lw(s, 1.5))
  )
}

# ── glyph_flame: teardrop flame shape ──────────────────────────────────────
glyph_flame <- function(cx, cy, s, col, bright) {
  t <- seq(0, 1, length.out = 40)
  hw <- 18 * s
  h <- 38 * s
  lx <- cx - hw * sin(t * pi) * (1 - t^0.6)
  ly <- cy - h / 2 + h * t
  df <- data.frame(x = c(lx, rev(cx + hw * sin(rev(t) * pi) * (1 - rev(t)^0.6))),
                   y = c(ly, rev(ly)))
  # inner flame
  hw2 <- 9 * s
  h2 <- 22 * s
  lx2 <- cx - hw2 * sin(t * pi) * (1 - t^0.5)
  ly2 <- cy - h2 / 2 + h2 * t
  df2 <- data.frame(x = c(lx2, rev(cx + hw2 * sin(rev(t) * pi) * (1 - rev(t)^0.5))),
                    y = c(ly2, rev(ly2)))
  list(
    ggplot2::geom_polygon(data = df, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = df2, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_droplet: water drop ──────────────────────────────────────────────
glyph_droplet <- function(cx, cy, s, col, bright) {
  t <- seq(0, 2 * pi, length.out = 50)
  r <- 16 * s
  h <- 38 * s
  # Bottom circle portion
  bx <- cx + r * cos(t)
  by <- cy - h * 0.15 + r * sin(t)
  # Top point
  top_y <- cy + h * 0.5
  # Build teardrop: circle bottom, pointed top
  t2 <- seq(-pi, 0, length.out = 25)
  bottom_x <- cx + r * cos(t2)
  bottom_y <- cy - h * 0.15 + r * sin(t2)
  df <- data.frame(
    x = c(cx - r, cx, cx + r, rev(bottom_x)),
    y = c(cy - h * 0.15, top_y, cy - h * 0.15, rev(bottom_y))
  )
  # wave lines inside
  w1 <- data.frame(x = cx + seq(-10, 10, length.out = 20) * s,
                   y = cy - 8 * s + 3 * s * sin(seq(0, 2 * pi, length.out = 20)))
  w2 <- data.frame(x = cx + seq(-8, 8, length.out = 20) * s,
                   y = cy - 14 * s + 2 * s * sin(seq(0, 2 * pi, length.out = 20)))
  list(
    ggplot2::geom_polygon(data = df, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = w1, .aes(x, y), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = w2, .aes(x, y), color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_leaf: single leaf with central vein ──────────────────────────────
glyph_leaf <- function(cx, cy, s, col, bright) {
  t <- seq(0, 2 * pi, length.out = 60)
  lx <- 22 * s * cos(t)
  ly <- 34 * s * sin(t) * abs(sin(t / 2))^0.5
  # rotate 30 deg
  a <- 30 * pi / 180
  rx <- lx * cos(a) - ly * sin(a)
  ry <- lx * sin(a) + ly * cos(a)
  df <- data.frame(x = cx + rx, y = cy + ry)
  # vein
  vein <- data.frame(x = c(cx - 12 * s, cx + 12 * s), y = c(cy - 8 * s, cy + 8 * s))
  # side veins
  sv1 <- data.frame(x = c(cx - 2 * s, cx - 10 * s), y = c(cy + 2 * s, cy + 12 * s))
  sv2 <- data.frame(x = c(cx + 2 * s, cx + 10 * s), y = c(cy - 2 * s, cy - 12 * s))
  sv3 <- data.frame(x = c(cx + 4 * s, cx - 4 * s), y = c(cy, cy + 10 * s))
  list(
    ggplot2::geom_polygon(data = df, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = vein, .aes(x, y), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = sv1, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = sv2, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = sv3, .aes(x, y), color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_whetstone_blade: knife on sharpening stone ─────────────────────
glyph_whetstone_blade <- function(cx, cy, s, col, bright) {
  # Whetstone base (rounded rectangle via polygon)
  sw <- 28 * s; sh <- 8 * s
  stone_y <- cy - 12 * s
  stone <- data.frame(
    x = c(cx - sw / 2, cx + sw / 2, cx + sw / 2, cx - sw / 2),
    y = c(stone_y - sh / 2, stone_y - sh / 2, stone_y + sh / 2, stone_y + sh / 2)
  )
  # Knife blade (angled ~30 deg, resting on stone)
  # Blade tip top-right, handle bottom-left
  a <- 25 * pi / 180
  bl <- 36 * s   # blade total length
  bw <- 6 * s    # blade width
  bx <- cx - 4 * s; by <- stone_y + sh / 2  # base point on stone
  # Spine line and edge line
  tip_x <- bx + bl * cos(a); tip_y <- by + bl * sin(a)
  spine_dx <- -bw * sin(a); spine_dy <- bw * cos(a)
  blade <- data.frame(
    x = c(bx, tip_x, tip_x + spine_dx * 0.3, bx + spine_dx),
    y = c(by, tip_y, tip_y + spine_dy * 0.3, by + spine_dy)
  )
  # Handle (small rectangle at base of blade)
  hl <- 14 * s
  hx <- bx - hl * cos(a); hy <- by - hl * sin(a)
  handle <- data.frame(
    x = c(bx, bx + spine_dx, hx + spine_dx, hx),
    y = c(by, by + spine_dy, hy + spine_dy, hy)
  )
  # Spark lines (3 small strokes at contact point)
  sp_x <- bx + 8 * s * cos(a)
  sp_y <- stone_y + sh / 2
  spark1 <- data.frame(x = c(sp_x, sp_x - 6 * s), y = c(sp_y, sp_y + 10 * s))
  spark2 <- data.frame(x = c(sp_x + 3 * s, sp_x + 1 * s), y = c(sp_y, sp_y + 11 * s))
  spark3 <- data.frame(x = c(sp_x - 4 * s, sp_x - 9 * s), y = c(sp_y, sp_y + 8 * s))
  list(
    ggplot2::geom_polygon(data = stone, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = handle, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = blade, .aes(x, y),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = spark1, .aes(x, y), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = spark2, .aes(x, y), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = spark3, .aes(x, y), color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_shield_check: shield outline + checkmark ────────────────────────
glyph_shield_check <- function(cx, cy, s, col, bright) {
  w <- 32 * s; h <- 40 * s
  df <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx - w * 0.25, cx, cx + w * 0.25, cx + w / 2, cx + w / 2),
    y = c(cy + h * 0.4, cy - h * 0.05, cy - h * 0.45, cy - h * 0.5, cy - h * 0.45, cy - h * 0.05, cy + h * 0.4)
  )
  ck <- data.frame(
    x = c(cx - 8 * s, cx - 2 * s, cx + 10 * s),
    y = c(cy, cy - 8 * s, cy + 10 * s)
  )
  list(
    ggplot2::geom_polygon(data = df, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = ck, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
}

# ── glyph_document: page with lines ───────────────────────────────────────
glyph_document <- function(cx, cy, s, col, bright) {
  w <- 30 * s; h <- 40 * s; fold <- 10 * s
  pg <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx + w / 2 - fold, cx + w / 2, cx + w / 2),
    y = c(cy - h / 2, cy + h / 2, cy + h / 2, cy + h / 2 - fold, cy - h / 2)
  )
  corner <- data.frame(
    x = c(cx + w / 2 - fold, cx + w / 2 - fold, cx + w / 2),
    y = c(cy + h / 2, cy + h / 2 - fold, cy + h / 2 - fold)
  )
  lines <- lapply(1:4, function(i) {
    ly <- cy + h * 0.25 - i * h * 0.15
    data.frame(x = c(cx - w * 0.35, cx + w * 0.25), y = c(ly, ly))
  })
  layers <- list(
    ggplot2::geom_polygon(data = pg, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = corner, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.2))
  )
  for (l in lines) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_footprints: trail of stepping dots ──────────────────────────────
glyph_footprints <- function(cx, cy, s, col, bright) {
  n <- 6
  xs <- cx + seq(-18, 18, length.out = n) * s
  ys <- cy + c(-12, -4, 4, 12, 4, -4) * s * 1.2
  szs <- c(4, 5, 5, 5, 4, 3.5) * s
  layers <- list()
  for (i in seq_len(n)) {
    dx <- if (i %% 2 == 1) -4 * s else 4 * s
    df <- data.frame(x0 = xs[i] + dx, y0 = ys[i], r = szs[i])
    layers[[i]] <- ggforce::geom_circle(data = df, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15 + 0.08 * i), color = bright, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_microscope: microscope silhouette ───────────────────────────────
glyph_microscope <- function(cx, cy, s, col, bright) {
  # eyepiece
  eye <- data.frame(x = c(cx - 4 * s, cx + 4 * s, cx + 3 * s, cx - 3 * s),
                    y = c(cy + 20 * s, cy + 20 * s, cy + 16 * s, cy + 16 * s))
  # tube
  tube <- data.frame(x = c(cx - 3 * s, cx + 3 * s, cx + 3 * s, cx - 3 * s),
                     y = c(cy + 16 * s, cy + 16 * s, cy - 2 * s, cy - 2 * s))
  # objective (angled)
  obj <- data.frame(x = c(cx - 3 * s, cx + 3 * s, cx + 8 * s, cx + 2 * s),
                    y = c(cy - 2 * s, cy - 2 * s, cy - 14 * s, cy - 14 * s))
  # stage
  stage <- data.frame(x = c(cx - 14 * s, cx + 14 * s, cx + 14 * s, cx - 14 * s),
                      y = c(cy - 12 * s, cy - 12 * s, cy - 15 * s, cy - 15 * s))
  # base
  base <- data.frame(x = c(cx - 16 * s, cx + 16 * s, cx + 16 * s, cx - 16 * s),
                     y = c(cy - 19 * s, cy - 19 * s, cy - 22 * s, cy - 22 * s))
  # arm
  arm <- data.frame(x = c(cx - 5 * s, cx - 3 * s, cx - 3 * s, cx - 5 * s),
                    y = c(cy + 12 * s, cy + 12 * s, cy - 15 * s, cy - 15 * s))
  list(
    ggplot2::geom_polygon(data = base, .aes(x, y), fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = stage, .aes(x, y), fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = arm, .aes(x, y), fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = tube, .aes(x, y), fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_polygon(data = obj, .aes(x, y), fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = eye, .aes(x, y), fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s))
  )
}

# ── glyph_clipboard: clipboard + checkmark ────────────────────────────────
glyph_clipboard <- function(cx, cy, s, col, bright) {
  w <- 28 * s; h <- 38 * s
  board <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx + w / 2, cx + w / 2),
    y = c(cy - h / 2, cy + h / 2 - 4 * s, cy + h / 2 - 4 * s, cy - h / 2)
  )
  clip <- data.frame(
    x = c(cx - 6 * s, cx - 6 * s, cx + 6 * s, cx + 6 * s),
    y = c(cy + h / 2 - 6 * s, cy + h / 2, cy + h / 2, cy + h / 2 - 6 * s)
  )
  ck <- data.frame(
    x = c(cx - 8 * s, cx - 2 * s, cx + 10 * s),
    y = c(cy - 4 * s, cy - 12 * s, cy + 8 * s)
  )
  list(
    ggplot2::geom_polygon(data = board, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = clip, .aes(x, y),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = ck, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
}

# ── glyph_barcode: vertical barcode lines ─────────────────────────────────
glyph_barcode <- function(cx, cy, s, col, bright) {
  set.seed(42)
  n <- 18
  widths <- sample(c(2, 3, 4), n, replace = TRUE, prob = c(0.5, 0.3, 0.2))
  gap <- 1.5
  total_w <- sum(widths) + (n - 1) * gap
  x_start <- cx - total_w * s / 2
  h <- 36 * s
  layers <- list()
  pos <- x_start
  for (i in seq_len(n)) {
    bw <- widths[i] * s
    df <- data.frame(xmin = pos, xmax = pos + bw, ymin = cy - h / 2, ymax = cy + h / 2)
    layers[[i]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(if (i %% 3 == 0) bright else col, 0.4 + 0.03 * i),
      color = NA)
    pos <- pos + bw + gap * s
  }
  # border
  border <- data.frame(xmin = cx - total_w * s / 2 - 2 * s, xmax = cx + total_w * s / 2 + 2 * s,
                       ymin = cy - h / 2 - 2 * s, ymax = cy + h / 2 + 2 * s)
  layers[[n + 1]] <- ggplot2::geom_rect(data = border,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = NA, color = bright, linewidth = .lw(s, 1.5))
  layers
}

# ── glyph_blueprint: architecture lines / floor plan ──────────────────────
glyph_blueprint <- function(cx, cy, s, col, bright) {
  r <- 34 * s
  # outer frame
  frame <- data.frame(xmin = cx - r, xmax = cx + r, ymin = cy - r, ymax = cy + r)
  # inner structure lines
  h1 <- data.frame(x = c(cx - r, cx + r), y = c(cy, cy))
  v1 <- data.frame(x = c(cx, cx), y = c(cy - r, cy + r))
  h2 <- data.frame(x = c(cx - r, cx), y = c(cy + r * 0.5, cy + r * 0.5))
  v2 <- data.frame(x = c(cx + r * 0.5, cx + r * 0.5), y = c(cy, cy + r))
  v3 <- data.frame(x = c(cx - r * 0.5, cx - r * 0.5), y = c(cy - r, cy))
  # door arc
  t <- seq(0, pi, length.out = 20)
  door <- data.frame(x = cx + 6 * s * cos(t), y = cy - r + 6 * s * sin(t))
  list(
    ggplot2::geom_rect(data = frame, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = h1, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = v1, .aes(x, y), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = h2, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = v2, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = v3, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = door, .aes(x, y), color = bright, linewidth = .lw(s, 2))
  )
}

# ── glyph_refresh_arrows: two curved arrows (change cycle) ───────────────
glyph_refresh_arrows <- function(cx, cy, s, col, bright) {
  r <- 22 * s
  # top arc
  t1 <- seq(pi * 0.15, pi * 0.85, length.out = 30)
  arc1 <- data.frame(x = cx + r * cos(t1), y = cy + r * sin(t1))
  # bottom arc
  t2 <- seq(pi * 1.15, pi * 1.85, length.out = 30)
  arc2 <- data.frame(x = cx + r * cos(t2), y = cy + r * sin(t2))
  # arrowheads
  ah1 <- data.frame(
    x = c(cx + r * cos(t1[30]) - 6 * s, cx + r * cos(t1[30]), cx + r * cos(t1[30]) + 2 * s),
    y = c(cy + r * sin(t1[30]) + 4 * s, cy + r * sin(t1[30]), cy + r * sin(t1[30]) + 6 * s)
  )
  ah2 <- data.frame(
    x = c(cx + r * cos(t2[30]) + 6 * s, cx + r * cos(t2[30]), cx + r * cos(t2[30]) - 2 * s),
    y = c(cy + r * sin(t2[30]) - 4 * s, cy + r * sin(t2[30]), cy + r * sin(t2[30]) - 6 * s)
  )
  list(
    ggplot2::geom_path(data = arc1, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = arc2, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = ah1, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = ah2, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

# ── glyph_fingerprint: concentric arcs ───────────────────────────────────
glyph_fingerprint <- function(cx, cy, s, col, bright) {
  layers <- list()
  radii <- seq(6, 28, by = 4.5) * s
  for (i in seq_along(radii)) {
    offset <- if (i %% 2 == 0) 0.2 else -0.1
    t <- seq(pi * (0.3 + offset), pi * (1.7 - offset * 0.5), length.out = 30)
    arc <- data.frame(x = cx + radii[i] * cos(t), y = cy + radii[i] * sin(t) * 1.3)
    layers[[i]] <- ggplot2::geom_path(data = arc, .aes(x, y),
      color = if (i %% 2 == 0) bright else col, linewidth = .lw(s, 2))
  }
  layers
}

# ── glyph_numbered_list: 1-2-3 step lines ────────────────────────────────
glyph_numbered_list <- function(cx, cy, s, col, bright) {
  layers <- list()
  for (i in 1:4) {
    y <- cy + (3 - i) * 12 * s - 6 * s
    # bullet circle
    df_c <- data.frame(x0 = cx - 16 * s, y0 = y, r = 4 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df_c,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.5))
    # number text approximation: just a dot
    layers[[length(layers) + 1]] <- ggplot2::geom_point(
      data = data.frame(x = cx - 16 * s, y = y), .aes(x, y),
      color = bright, size = 3 * s)
    # line
    line_df <- data.frame(x = c(cx - 8 * s, cx + 18 * s), y = c(y, y))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_df, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
  }
  layers
}

# ── glyph_database_shield: DB cylinder + shield ──────────────────────────
glyph_database_shield <- function(cx, cy, s, col, bright) {
  w <- 24 * s; h <- 30 * s; ell <- 6 * s
  # cylinder body
  body <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx + w / 2, cx + w / 2),
    y = c(cy + h / 2 - ell, cy - h / 2 + ell, cy - h / 2 + ell, cy + h / 2 - ell)
  )
  # top ellipse
  t <- seq(0, 2 * pi, length.out = 40)
  top_ell <- data.frame(x = cx + w / 2 * cos(t), y = cy + h / 2 - ell + ell * sin(t))
  # bottom ellipse
  bot_ell <- data.frame(x = cx + w / 2 * cos(t), y = cy - h / 2 + ell + ell * sin(t))
  # mini shield overlay
  sw <- 14 * s; sh <- 16 * s
  shield <- data.frame(
    x = c(cx - sw / 2, cx - sw / 2, cx, cx + sw / 2, cx + sw / 2),
    y = c(cy + sh * 0.3, cy - sh * 0.1, cy - sh * 0.4, cy - sh * 0.1, cy + sh * 0.3)
  )
  list(
    ggplot2::geom_polygon(data = body, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = top_ell, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = bot_ell, .aes(x, y), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2))
  )
}

# ── glyph_graduation_cap: mortarboard hat ────────────────────────────────
glyph_graduation_cap <- function(cx, cy, s, col, bright) {
  # diamond top
  top <- data.frame(
    x = c(cx - 28 * s, cx, cx + 28 * s, cx),
    y = c(cy + 4 * s, cy + 16 * s, cy + 4 * s, cy - 4 * s)
  )
  # band
  band <- data.frame(
    x = c(cx - 18 * s, cx - 18 * s, cx + 18 * s, cx + 18 * s),
    y = c(cy + 2 * s, cy - 10 * s, cy - 10 * s, cy + 2 * s)
  )
  # tassel line
  tassel <- data.frame(x = c(cx + 20 * s, cx + 20 * s, cx + 14 * s),
                       y = c(cy + 6 * s, cy - 14 * s, cy - 18 * s))
  # tassel end
  tassel_end <- data.frame(x0 = cx + 14 * s, y0 = cy - 18 * s, r = 3 * s)
  list(
    ggplot2::geom_polygon(data = top, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = band, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = tassel, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = tassel_end, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

# ── glyph_power_off: power button ────────────────────────────────────────
glyph_power_off <- function(cx, cy, s, col, bright) {
  r <- 26 * s
  # circle arc (gap at top)
  t <- seq(pi * 0.2, pi * 1.8, length.out = 40)
  arc <- data.frame(x = cx + r * cos(t + pi / 2), y = cy + r * sin(t + pi / 2))
  # vertical line (top)
  line <- data.frame(x = c(cx, cx), y = c(cy + 8 * s, cy + r + 4 * s))
  list(
    ggplot2::geom_path(data = arc, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = line, .aes(x, y), color = bright, linewidth = .lw(s, 3))
  )
}

# ── glyph_checklist: clipboard with multiple checks ──────────────────────
glyph_checklist <- function(cx, cy, s, col, bright) {
  w <- 28 * s; h <- 38 * s
  board <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx + w / 2, cx + w / 2),
    y = c(cy - h / 2, cy + h / 2 - 4 * s, cy + h / 2 - 4 * s, cy - h / 2)
  )
  clip <- data.frame(
    x = c(cx - 6 * s, cx - 6 * s, cx + 6 * s, cx + 6 * s),
    y = c(cy + h / 2 - 6 * s, cy + h / 2, cy + h / 2, cy + h / 2 - 6 * s)
  )
  layers <- list(
    ggplot2::geom_polygon(data = board, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = clip, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5))
  )
  for (i in 1:3) {
    y <- cy + (2 - i) * 10 * s - 2 * s
    # checkbox
    box <- data.frame(xmin = cx - 12 * s, xmax = cx - 6 * s, ymin = y - 3 * s, ymax = y + 3 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = box,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1))
    # checkmark inside
    ck <- data.frame(x = c(cx - 11 * s, cx - 9 * s, cx - 6.5 * s), y = c(y, y - 2.5 * s, y + 2.5 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ck, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
    # line
    line <- data.frame(x = c(cx - 2 * s, cx + 12 * s), y = c(y, y))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_fishbone: fishbone/Ishikawa diagram ────────────────────────────
glyph_fishbone <- function(cx, cy, s, col, bright) {
  # spine
  spine <- data.frame(x = c(cx - 28 * s, cx + 28 * s), y = c(cy, cy))
  # head (triangle)
  head <- data.frame(
    x = c(cx + 24 * s, cx + 32 * s, cx + 24 * s),
    y = c(cy + 6 * s, cy, cy - 6 * s)
  )
  layers <- list(
    ggplot2::geom_path(data = spine, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_polygon(data = head, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  )
  # ribs
  offsets <- c(-18, -8, 2, 12) * s
  for (i in seq_along(offsets)) {
    sign <- if (i %% 2 == 1) 1 else -1
    rib <- data.frame(
      x = c(cx + offsets[i], cx + offsets[i] - 10 * s),
      y = c(cy, cy + sign * 14 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = rib, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
    # sub-rib
    sub <- data.frame(
      x = c(cx + offsets[i] - 5 * s, cx + offsets[i] - 10 * s),
      y = c(cy + sign * 7 * s, cy + sign * 12 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sub, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  layers
}

# ── glyph_badge_star: badge/medal with star ──────────────────────────────
glyph_badge_star <- function(cx, cy, s, col, bright) {
  # outer circle
  outer <- data.frame(x0 = cx, y0 = cy + 2 * s, r = 22 * s)
  # star
  pts <- data.frame(x = numeric(0), y = numeric(0))
  for (i in 1:5) {
    a_out <- (i - 1) * 2 * pi / 5 - pi / 2
    a_in <- a_out + pi / 5
    pts <- rbind(pts,
      data.frame(x = cx + 16 * s * cos(a_out), y = cy + 2 * s + 16 * s * sin(a_out)),
      data.frame(x = cx + 7 * s * cos(a_in), y = cy + 2 * s + 7 * s * sin(a_in))
    )
  }
  # ribbon tails
  r1 <- data.frame(x = c(cx - 12 * s, cx - 16 * s, cx - 10 * s),
                   y = c(cy - 18 * s, cy - 30 * s, cy - 26 * s))
  r2 <- data.frame(x = c(cx + 12 * s, cx + 16 * s, cx + 10 * s),
                   y = c(cy - 18 * s, cy - 30 * s, cy - 26 * s))
  list(
    ggforce::geom_circle(data = outer, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = pts, .aes(x, y),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = r1, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = r2, .aes(x, y),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_docker_box: stacked container rectangles ───────────────────────
glyph_docker_box <- function(cx, cy, s, col, bright) {
  layers <- list()
  for (i in 1:3) {
    y_off <- (i - 2) * 14 * s
    df <- data.frame(
      xmin = cx - 22 * s, xmax = cx + 22 * s,
      ymin = cy + y_off - 5 * s, ymax = cy + y_off + 5 * s
    )
    layers[[i]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1 + 0.08 * i), color = bright, linewidth = .lw(s, 1.8))
    # handle dots
    for (dx in c(-14, -8, -2, 4, 10) * s) {
      dot <- data.frame(x = cx + dx, y = cy + y_off)
      layers[[length(layers) + 1]] <- ggplot2::geom_point(data = dot, .aes(x, y),
        color = col, size = 2 * s)
    }
  }
  layers
}

# ── glyph_compose_stack: 3 connected containers ─────────────────────────
glyph_compose_stack <- function(cx, cy, s, col, bright) {
  layers <- list()
  positions <- list(c(cx - 14 * s, cy + 12 * s), c(cx + 14 * s, cy + 12 * s), c(cx, cy - 14 * s))
  for (i in seq_along(positions)) {
    px <- positions[[i]][1]; py <- positions[[i]][2]
    df <- data.frame(xmin = px - 10 * s, xmax = px + 10 * s, ymin = py - 8 * s, ymax = py + 8 * s)
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = df,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15 + 0.05 * i), color = bright, linewidth = .lw(s, 1.8))
  }
  # connections
  conns <- list(c(1, 2), c(1, 3), c(2, 3))
  for (cn in conns) {
    line <- data.frame(
      x = c(positions[[cn[1]]][1], positions[[cn[2]]][1]),
      y = c(positions[[cn[1]]][2], positions[[cn[2]]][2])
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_box_plug: box with plug/cable ──────────────────────────────────
glyph_box_plug <- function(cx, cy, s, col, bright) {
  box <- data.frame(xmin = cx - 18 * s, xmax = cx + 18 * s, ymin = cy - 14 * s, ymax = cy + 14 * s)
  # plug prongs
  p1 <- data.frame(x = c(cx - 6 * s, cx - 6 * s), y = c(cy + 14 * s, cy + 24 * s))
  p2 <- data.frame(x = c(cx + 6 * s, cx + 6 * s), y = c(cy + 14 * s, cy + 24 * s))
  # cable down
  cable <- data.frame(x = c(cx, cx), y = c(cy - 14 * s, cy - 28 * s))
  list(
    ggplot2::geom_rect(data = box, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = p1, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = p2, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = cable, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_point(data = data.frame(x = cx, y = cy), .aes(x, y), color = bright, size = 5 * s)
  )
}

# ── glyph_layers_arrow: stacked layers + speed arrow ────────────────────
glyph_layers_arrow <- function(cx, cy, s, col, bright) {
  layers <- list()
  for (i in 1:4) {
    y_off <- (i - 1) * 8 * s - 12 * s
    w <- (28 - i * 2) * s
    df <- data.frame(
      x = c(cx - w, cx, cx + w, cx),
      y = c(cy + y_off, cy + y_off + 5 * s, cy + y_off, cy + y_off - 5 * s)
    )
    layers[[i]] <- ggplot2::geom_polygon(data = df, .aes(x, y),
      fill = hex_with_alpha(col, 0.1 + 0.07 * i), color = bright, linewidth = .lw(s, 1.5))
  }
  # speed arrow
  arrow_df <- data.frame(x = cx + 20 * s, xend = cx + 20 * s, y = cy - 18 * s, yend = cy + 18 * s)
  layers[[length(layers) + 1]] <- ggplot2::geom_segment(data = arrow_df,
    .aes(x = x, xend = xend, y = y, yend = yend), color = bright, linewidth = .lw(s, 2.5),
    arrow = ggplot2::arrow(length = ggplot2::unit(0.2, "inches")))
  layers
}

# ── glyph_brackets_stream: { } with data flowing through ────────────────
glyph_brackets_stream <- function(cx, cy, s, col, bright) {
  h <- 36 * s
  # left brace
  lb <- data.frame(
    x = c(cx - 14 * s, cx - 20 * s, cx - 20 * s, cx - 26 * s, cx - 20 * s, cx - 20 * s, cx - 14 * s),
    y = c(cy + h / 2, cy + h / 2 - 4 * s, cy + 4 * s, cy, cy - 4 * s, cy - h / 2 + 4 * s, cy - h / 2)
  )
  # right brace
  rb <- data.frame(
    x = c(cx + 14 * s, cx + 20 * s, cx + 20 * s, cx + 26 * s, cx + 20 * s, cx + 20 * s, cx + 14 * s),
    y = c(cy + h / 2, cy + h / 2 - 4 * s, cy + 4 * s, cy, cy - 4 * s, cy - h / 2 + 4 * s, cy - h / 2)
  )
  # data stream dots
  dots <- data.frame(
    x = cx + c(-6, 0, 6, -3, 3) * s,
    y = cy + c(10, 4, -2, -8, -14) * s
  )
  list(
    ggplot2::geom_path(data = lb, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = rb, .aes(x, y), color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_point(data = dots, .aes(x, y), color = col, size = 4 * s)
  )
}

# ── glyph_schema_tree: tree structure with typed nodes ───────────────────
glyph_schema_tree <- function(cx, cy, s, col, bright) {
  # root
  root <- data.frame(x0 = cx, y0 = cy + 16 * s, r = 5 * s)
  # children
  c1 <- data.frame(x0 = cx - 18 * s, y0 = cy - 4 * s, r = 4 * s)
  c2 <- data.frame(x0 = cx + 18 * s, y0 = cy - 4 * s, r = 4 * s)
  c3 <- data.frame(x0 = cx, y0 = cy - 4 * s, r = 4 * s)
  # grandchildren
  gc1 <- data.frame(x0 = cx - 24 * s, y0 = cy - 22 * s, r = 3 * s)
  gc2 <- data.frame(x0 = cx - 12 * s, y0 = cy - 22 * s, r = 3 * s)
  gc3 <- data.frame(x0 = cx + 12 * s, y0 = cy - 22 * s, r = 3 * s)
  gc4 <- data.frame(x0 = cx + 24 * s, y0 = cy - 22 * s, r = 3 * s)
  # lines
  lines <- list(
    data.frame(x = c(cx, cx - 18 * s), y = c(cy + 16 * s, cy - 4 * s)),
    data.frame(x = c(cx, cx), y = c(cy + 16 * s, cy - 4 * s)),
    data.frame(x = c(cx, cx + 18 * s), y = c(cy + 16 * s, cy - 4 * s)),
    data.frame(x = c(cx - 18 * s, cx - 24 * s), y = c(cy - 4 * s, cy - 22 * s)),
    data.frame(x = c(cx - 18 * s, cx - 12 * s), y = c(cy - 4 * s, cy - 22 * s)),
    data.frame(x = c(cx + 18 * s, cx + 12 * s), y = c(cy - 4 * s, cy - 22 * s)),
    data.frame(x = c(cx + 18 * s, cx + 24 * s), y = c(cy - 4 * s, cy - 22 * s))
  )
  layers <- list()
  for (l in lines) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  for (df in list(root, c1, c2, c3)) {
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2))
  }
  for (df in list(gc1, gc2, gc3, gc4)) {
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = df, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_yin_yang: yin-yang symbol ──────────────────────────────────────
glyph_yin_yang <- function(cx, cy, s, col, bright) {
  r <- 28 * s
  t <- seq(0, 2 * pi, length.out = 80)
  outer <- data.frame(x = cx + r * cos(t), y = cy + r * sin(t))
  # S-curve divider
  t_top <- seq(pi / 2, -pi / 2, length.out = 30)
  t_bot <- seq(pi / 2, 3 * pi / 2, length.out = 30)
  s_curve <- data.frame(
    x = c(cx + r / 2 * cos(t_top), cx + r / 2 * cos(t_bot) + 0 * s),
    y = c(cy + r / 2 + r / 2 * sin(t_top), cy - r / 2 + r / 2 * sin(t_bot))
  )
  # dots
  dot1 <- data.frame(x0 = cx, y0 = cy + r / 2, r = 3.5 * s)
  dot2 <- data.frame(x0 = cx, y0 = cy - r / 2, r = 3.5 * s)
  list(
    ggplot2::geom_polygon(data = outer, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = s_curve, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = dot1, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = dot2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.3), color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_spiral_arrow: aikido redirect spiral ──────────────────────────
glyph_spiral_arrow <- function(cx, cy, s, col, bright) {
  n <- 100
  t <- seq(0, 3 * pi, length.out = n)
  r <- 4 * s + t * 7 * s / (3 * pi)
  sp <- data.frame(x = cx + r * cos(t), y = cy + r * sin(t))
  # arrowhead at end
  end_x <- sp$x[n]; end_y <- sp$y[n]
  dx <- sp$x[n] - sp$x[n - 1]; dy <- sp$y[n] - sp$y[n - 1]
  len <- sqrt(dx^2 + dy^2)
  ux <- dx / len; uy <- dy / len
  ah <- data.frame(
    x = c(end_x + (-ux * 6 + uy * 4) * s, end_x, end_x + (-ux * 6 - uy * 4) * s),
    y = c(end_y + (-uy * 6 - ux * 4) * s, end_y, end_y + (-uy * 6 + ux * 4) * s)
  )
  list(
    ggplot2::geom_path(data = sp, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_polygon(data = ah, .aes(x, y), fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

# ── glyph_lotus: lotus flower ───────────────────────────────────────────
glyph_lotus <- function(cx, cy, s, col, bright) {
  layers <- list()
  # petals
  n_petals <- 7
  for (i in seq_len(n_petals)) {
    angle <- (i - 1) * pi / (n_petals - 1) - pi / 2 + pi / 6
    t <- seq(-0.5, 0.5, length.out = 20)
    px <- cx + (20 * s) * cos(angle) + 12 * s * cos(angle + pi / 2) * t
    py <- cy + (20 * s) * sin(angle) + 12 * s * sin(angle + pi / 2) * t
    # petal shape: ellipse
    t2 <- seq(0, 2 * pi, length.out = 30)
    petal_x <- cx + (22 * s * cos(angle)) / 2 + 10 * s * cos(t2) * abs(cos(angle + pi / 4)) + 6 * s * cos(angle) * cos(t2)
    petal_y <- cy - 4 * s + (22 * s * sin(angle)) / 2 + 14 * s * sin(t2) * 0.4 + 6 * s * sin(angle) * cos(t2)
    petal_df <- data.frame(x = petal_x, y = petal_y)
    layers[[i]] <- ggplot2::geom_polygon(data = petal_df, .aes(x, y),
      fill = hex_with_alpha(col, 0.1 + 0.03 * i), color = bright, linewidth = .lw(s, 1.2))
  }
  # center
  center <- data.frame(x0 = cx, y0 = cy - 4 * s, r = 6 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center, .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  layers
}
