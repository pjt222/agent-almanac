# primitives_23.R — memex domain glyphs (5)
#
# Visual family: an associative memory trail — glowing nodes strung on a
# thread (Vannevar Bush's "memex" associative trails / the pgvector graph).
# Each ritual is a distinct mark on the thread:
#   memex          constellation of connected memory nodes (the whole graph)
#   memex-init     first node igniting on the thread (load the bias-log)
#   memex-verify   a gate + check on the thread (pre-commit gate)
#   memex-observe  an eye (vipassana — watching one's own reasoning)
#   memex-wrap     a spiral rolling the slice closed (handoff)
#
# Signature: glyph_*(cx, cy, s, col, bright) -> list() of ggplot2 layers.
# Glow is applied by the renderer; do not add glow here.

# ── memex — knowledge-graph constellation ──────────────────────────────────
glyph_memex <- function(cx, cy, s, col, bright) {
  sat <- data.frame(
    x0 = cx + c(24, -23, 8, -12) * s,
    y0 = cy + c(16, 11, -25, 27) * s,
    r  = c(4.5, 4.0, 4.5, 3.5) * s
  )
  # associative trails: center -> each satellite, gently bowed
  mk_trail <- function(i) {
    ex <- sat$x0[i]; ey <- sat$y0[i]
    mx <- (cx + ex) / 2 + (ey - cy) * 0.18
    my <- (cy + ey) / 2 - (ex - cx) * 0.18
    data.frame(x = c(cx, mx, ex), y = c(cy, my, ey), g = i)
  }
  trails <- do.call(rbind, lapply(seq_len(nrow(sat)), mk_trail))
  list(
    ggplot2::geom_path(data = trails, .aes(x, y, group = g),
      color = hex_with_alpha(bright, 0.55), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = sat, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.30), color = bright, linewidth = .lw(s, 1.2)),
    ggforce::geom_circle(data = data.frame(x0 = cx, y0 = cy, r = 9 * s),
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.20), color = bright, linewidth = .lw(s, 1.7)),
    ggforce::geom_circle(data = data.frame(x0 = cx, y0 = cy, r = 3.2 * s),
      .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = "transparent", linewidth = 0)
  )
}

# ── memex-init — first node igniting on the thread ─────────────────────────
glyph_memex_init <- function(cx, cy, s, col, bright) {
  # the thread, rising gently left -> right (dawn)
  thread <- data.frame(
    x = cx + c(-30, -9, 13, 30) * s,
    y = cy + c(-9, -3, 3, 9) * s
  )
  # beads along the thread; first (leftmost) is lit, the rest dim
  bx <- cx + c(-30, -9, 13) * s
  by <- cy + c(-9, -3, 3) * s
  dim_beads <- data.frame(x0 = bx[2:3], y0 = by[2:3], r = c(3.2, 3.2) * s)
  lit <- data.frame(x0 = bx[1], y0 = by[1], r = 5.5 * s)
  # ignite rays around the lit bead
  ang <- seq(0, 2 * pi, length.out = 7)[-7]
  rays <- data.frame(
    x = bx[1] + 7 * s * cos(ang), xend = bx[1] + 11.5 * s * cos(ang),
    y = by[1] + 7 * s * sin(ang), yend = by[1] + 11.5 * s * sin(ang)
  )
  list(
    ggplot2::geom_path(data = thread, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.1)),
    ggforce::geom_circle(data = dim_beads, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = hex_with_alpha(bright, 0.6),
      linewidth = .lw(s, 1)),
    ggplot2::geom_segment(data = rays, .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(bright, 0.85), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = lit, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.6))
  )
}

# ── memex-verify — gate + checkmark on the thread ──────────────────────────
glyph_memex_verify <- function(cx, cy, s, col, bright) {
  # thread passing through, behind
  thread <- data.frame(x = cx + c(-32, 32) * s, y = cy + c(0, 0) * s)
  # gate arch: two posts + a top lintel (an upside-down U)
  gate <- data.frame(
    x = cx + c(-16, -16, 16, 16) * s,
    y = cy + c(-20, 18, 18, -20) * s
  )
  # checkmark, sitting on the thread
  check <- data.frame(
    x = cx + c(-9, -2, 12) * s,
    y = cy + c(0, -9, 14) * s
  )
  list(
    ggplot2::geom_path(data = thread, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = gate, .aes(x, y),
      color = hex_with_alpha(col, 0.85), linewidth = .lw(s, 1.6)),
    ggplot2::geom_path(data = check, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.6), lineend = "round", linejoin = "round")
  )
}

# ── memex-observe — an eye (vipassana, self-watching) ──────────────────────
glyph_memex_observe <- function(cx, cy, s, col, bright) {
  t <- seq(0, 1, length.out = 40)
  ew <- 27 * s   # half-width
  eh <- 15 * s   # lid height
  upper <- data.frame(x = cx - ew + 2 * ew * t, y = cy + eh * sin(pi * t))
  lower <- data.frame(x = cx + ew - 2 * ew * t, y = cy - eh * sin(pi * t))
  almond <- rbind(upper, lower)
  list(
    ggplot2::geom_polygon(data = almond, .aes(x, y),
      fill = hex_with_alpha(col, 0.10), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = data.frame(x0 = cx, y0 = cy, r = 8.5 * s),
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.22), color = bright, linewidth = .lw(s, 1.3)),
    ggforce::geom_circle(data = data.frame(x0 = cx, y0 = cy, r = 3.4 * s),
      .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = "transparent", linewidth = 0)
  )
}

# ── memex-wrap — spiral rolling the slice closed ───────────────────────────
glyph_memex_wrap <- function(cx, cy, s, col, bright) {
  th <- seq(0, 3.5 * pi, length.out = 110)
  rr <- (3 + 19 * th / (3.5 * pi)) * s   # radius grows outward, ~22*s at the tail
  spiral <- data.frame(x = cx + rr * cos(th), y = cy + rr * sin(th))
  core <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  tip  <- data.frame(x0 = spiral$x[nrow(spiral)], y0 = spiral$y[nrow(spiral)], r = 4.4 * s)
  list(
    ggplot2::geom_path(data = spiral, .aes(x, y),
      color = bright, linewidth = .lw(s, 2), lineend = "round"),
    ggforce::geom_circle(data = core, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = "transparent", linewidth = 0),
    ggforce::geom_circle(data = tip, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.3))
  )
}
