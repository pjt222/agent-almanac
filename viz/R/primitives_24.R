# primitives_24.R — 2026-07 content batch glyphs (6)
#
# Five skills from the July content batch plus one gap-closure:
#   benchmark-htr-engines        one handwritten line, three ranked machine
#                                readings, a tick on the winner (ocr)
#   verify-web-app-runtime       dark viewport, lit pixels tracing a check —
#                                proof of rendering (web-dev)
#   run-copilot-review-loop      review cycle arrow with a speech-bubble
#                                thread resolving to a tick (git)
#   generative-recipe-dsl        JSON braces entering a prism, one rendered
#                                artifact leaving — data, not code (design)
#   stale-proof-rendered-numbers a numeral with roots into its source block —
#                                sever the root, fail the build (reporting)
#   create-workflow              script scroll fanning out to phase nodes
#                                (general; closes a pre-existing glyph gap)
#
# Signature: glyph_*(cx, cy, s, col, bright) -> list() of ggplot2 layers.
# Glow is applied by the renderer; do not add glow here.

# ── benchmark-htr-engines — squiggle vs ranked readings ────────────────────
glyph_htr_benchmark <- function(cx, cy, s, col, bright) {
  # the handwritten line: a loopy cursive stroke across the top
  t <- seq(0, 4 * pi, length.out = 60)
  hand <- data.frame(
    x = cx + (-26 + 52 * (t / (4 * pi))) * s,
    y = cy + (21 + 4.2 * sin(t) + 1.8 * sin(2.3 * t)) * s
  )
  # three candidate readings, ranked by score (longest bar wins)
  bars <- data.frame(
    xmin = cx + c(-26, -26, -26) * s,
    xmax = cx + c(16, 5, -5) * s,
    ymin = cy + c(2, -10, -22) * s,
    ymax = cy + c(9, -3, -15) * s
  )
  # tick on the winning candidate
  tick <- data.frame(
    x = cx + c(20, 23.5, 29) * s,
    y = cy + c(5.5, 2, 11) * s
  )
  list(
    ggplot2::geom_path(data = hand, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.3)),
    ggplot2::geom_rect(data = bars,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.18), color = hex_with_alpha(bright, 0.75),
      linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = tick, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.8))
  )
}

# ── verify-web-app-runtime — lit pixels proving a dark canvas ───────────────
glyph_pixel_proof <- function(cx, cy, s, col, bright) {
  # the viewport: a dark canvas that could be lying
  frame <- data.frame(
    xmin = cx - 30 * s, xmax = cx + 30 * s,
    ymin = cy - 22 * s, ymax = cy + 22 * s
  )
  # lit pixels tracing a checkmark (the >1% luminance assertion)
  ck <- data.frame(
    x0 = cx + c(-15, -11, -7, -3, 2, 7, 12, 17) * s,
    y0 = cy + c(1, -4, -9, -13, -7, -1, 6, 13) * s,
    r  = 2.0 * s
  )
  # a few ambient pixels — the rest of the render
  amb <- data.frame(
    x0 = cx + c(-23, 21, -19, 24, 4) * s,
    y0 = cy + c(13, -15, -15, 17, 17) * s,
    r  = 1.1 * s
  )
  list(
    ggplot2::geom_rect(data = frame,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = amb, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.35), color = "transparent", linewidth = 0),
    ggforce::geom_circle(data = ck, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.85), color = "transparent", linewidth = 0)
  )
}

# ── run-copilot-review-loop — the cycle that resolves the thread ────────────
glyph_review_loop <- function(cx, cy, s, col, bright) {
  # open review cycle: fix -> reply -> resolve -> re-request -> poll
  ang <- seq(0.38 * pi, 2.02 * pi, length.out = 50)
  R <- 23 * s
  loop <- data.frame(x = cx + R * cos(ang), y = cy + R * sin(ang))
  # arrowhead where the cycle closes
  th <- 2.02 * pi
  tx <- cx + R * cos(th); ty <- cy + R * sin(th)
  dx <- -sin(th); dy <- cos(th)
  nx <- cos(th); ny <- sin(th)
  head <- data.frame(
    x = c(tx + 6.5 * s * dx, tx - 3 * s * dx + 4 * s * nx, tx - 3 * s * dx - 4 * s * nx),
    y = c(ty + 6.5 * s * dy, ty - 3 * s * dy + 4 * s * ny, ty - 3 * s * dy - 4 * s * ny)
  )
  # the review thread: a speech bubble riding the loop, resolved with a tick
  bub <- data.frame(x0 = cx, y0 = cy + R, r = 9 * s)
  tick <- data.frame(
    x = cx + c(-4, -1, 5) * s,
    y = cy + R + c(0, -3.2, 3.8) * s
  )
  list(
    ggplot2::geom_path(data = loop, .aes(x, y),
      color = hex_with_alpha(bright, 0.8), linewidth = .lw(s, 1.4)),
    ggplot2::geom_polygon(data = head, .aes(x, y),
      fill = bright, color = "transparent", linewidth = 0),
    ggforce::geom_circle(data = bub, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.3)),
    ggplot2::geom_path(data = tick, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.7))
  )
}

# ── generative-recipe-dsl — braces through the prism ────────────────────────
glyph_recipe_dsl <- function(cx, cy, s, col, bright) {
  # incoming recipe: a small JSON brace pair on the left
  lb <- data.frame(
    x = cx + c(-19, -22, -22, -24.5, -22, -22, -19) * s,
    y = cy + c(9, 7, 2, 0, -2, -7, -9) * s
  )
  rb <- data.frame(
    x = cx + c(-13, -10, -10, -7.5, -10, -10, -13) * s,
    y = cy + c(9, 7, 2, 0, -2, -7, -9) * s
  )
  # the one audited interpreter: a prism
  prism <- data.frame(
    x = cx + c(3, -7, 13) * s,
    y = cy + c(13, -10, -10) * s
  )
  # emitted render rays
  rays <- data.frame(
    x = cx + c(11, 11) * s, xend = cx + c(22, 22) * s,
    y = cy + c(2, -4) * s, yend = cy + c(8, -10) * s
  )
  # the rendered artifact: a small diamond
  gem <- data.frame(
    x = cx + c(26, 30, 26, 22) * s,
    y = cy + c(4, -1, -6, -1) * s
  )
  list(
    ggplot2::geom_path(data = lb, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = rb, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.2)),
    ggplot2::geom_polygon(data = prism, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.4)),
    ggplot2::geom_segment(data = rays,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = gem, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.2))
  )
}

# ── stale-proof-rendered-numbers — the numeral with roots ───────────────────
glyph_rooted_number <- function(cx, cy, s, col, bright) {
  # the source block: where the number actually lives
  src <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 28 * s, ymax = cy - 13 * s
  )
  # data lines inside the source
  rows <- data.frame(
    x = cx + c(-13, -13) * s, xend = cx + c(9, 13) * s,
    y = cy + c(-18, -23) * s, yend = cy + c(-18, -23) * s
  )
  # the displayed numeral: a bold 7
  seven <- data.frame(
    x = cx + c(-11, 11, 1) * s,
    y = cy + c(26, 26, 0) * s
  )
  # roots: the render-time resolution from figure to source
  roots <- data.frame(
    x = cx + c(1, 1, 1) * s,
    xend = cx + c(-8, 1, 9) * s,
    y = cy + c(0, 0, 0) * s,
    yend = cy + c(-13, -13, -13) * s
  )
  list(
    ggplot2::geom_rect(data = src,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = hex_with_alpha(bright, 0.8),
      linewidth = .lw(s, 1.1)),
    ggplot2::geom_segment(data = rows,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(bright, 0.55), linewidth = .lw(s, 0.9)),
    ggplot2::geom_segment(data = roots,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(bright, 0.65), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = seven, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.2))
  )
}

# ── create-workflow — the script scroll fanning out ─────────────────────────
glyph_workflow_scroll <- function(cx, cy, s, col, bright) {
  # the workflow script
  doc <- data.frame(
    xmin = cx - 28 * s, xmax = cx - 4 * s,
    ymin = cy - 20 * s, ymax = cy + 20 * s
  )
  # sidecar frontmatter: short comment lines at the top
  fm <- data.frame(
    x = cx + c(-24, -24) * s, xend = cx + c(-9, -14) * s,
    y = cy + c(15, 11) * s, yend = cy + c(15, 11) * s
  )
  # deterministic fan-out to phase agents
  fan <- data.frame(
    x = cx + c(-4, -4, -4) * s,
    xend = cx + c(16, 18, 16) * s,
    y = cy + c(8, 0, -8) * s,
    yend = cy + c(15, 0, -15) * s
  )
  nodes <- data.frame(
    x0 = cx + c(22, 24, 22) * s,
    y0 = cy + c(17, 0, -17) * s,
    r  = c(4.4, 4.4, 4.4) * s
  )
  list(
    ggplot2::geom_rect(data = doc,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.3)),
    ggplot2::geom_segment(data = fm,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1)),
    ggplot2::geom_segment(data = fan,
      .aes(x = x, y = y, xend = xend, yend = yend),
      color = hex_with_alpha(bright, 0.55), linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = nodes, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.2))
  )
}
