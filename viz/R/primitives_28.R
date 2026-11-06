# primitives_28.R — pointer-unit decomposition glyph (1)
#
# One general-domain skill:
#   decompose-into-pointer-units  a source sheet whose ruled lines each fan
#                                 out along a pointer arrow into its own small
#                                 unit card: the work list is read off the
#                                 source, and each unit carries a pointer, not
#                                 prose. Three cards carry a verified tick; one
#                                 is dim and holds a pause mark, the unit that
#                                 was stopped and waits for its owner (general)
#
# Signature: glyph_*(cx, cy, s, col, bright) -> list() of ggplot2 layers.
# Glow is applied by the renderer; do not add glow here.

# ── decompose-into-pointer-units — source lines fan out into unit cards ─────
glyph_pointer_units <- function(cx, cy, s, col, bright) {
  # the source sheet on the left, and its four ruled lines (close together)
  sheet <- data.frame(
    xmin = cx - 38 * s, xmax = cx - 14 * s,
    ymin = cy - 22 * s, ymax = cy + 22 * s
  )
  line_y <- cy + c(12, 4, -4, -12) * s
  rules <- data.frame(
    x = rep(cx - 33 * s, 4), xend = rep(cx - 19 * s, 4),
    y = line_y, yend = line_y
  )

  # the unit cards on the right, spread apart: decomposition is a fan-out
  card_y <- cy + c(26, 9, -9, -26) * s
  held <- 3
  cards <- data.frame(
    xmin = cx + 14 * s, xmax = cx + 38 * s,
    ymin = card_y - 5.5 * s, ymax = card_y + 5.5 * s,
    lit = seq_along(card_y) != held
  )

  # one pointer per line: a shaft from the sheet edge to the card edge
  x0 <- cx - 10 * s
  x1 <- cx + 9 * s
  shafts <- data.frame(x = rep(x0, 4), xend = rep(x1, 4), y = line_y, yend = card_y)

  # arrowheads as polygons so they scale with s, aimed along each shaft
  head_len <- 4.5 * s
  head_half <- 2.6 * s
  heads <- do.call(rbind, lapply(seq_along(line_y), function(i) {
    dx <- x1 - x0
    dy <- card_y[i] - line_y[i]
    len <- sqrt(dx^2 + dy^2)
    ux <- dx / len
    uy <- dy / len
    tip_x <- x1 + head_len * ux
    tip_y <- card_y[i] + head_len * uy
    data.frame(
      x = c(tip_x, x1 - head_half * uy, x1 + head_half * uy),
      y = c(tip_y, card_y[i] + head_half * ux, card_y[i] - head_half * ux),
      grp = i
    )
  }))

  # a verified tick on each lit card; a pause mark on the held card
  tick_cards <- which(cards$lit)
  ticks <- do.call(rbind, lapply(tick_cards, function(i) {
    data.frame(
      x = cx + c(18, 21, 27) * s,
      y = card_y[i] + c(0, -2.8, 3) * s,
      grp = i
    )
  }))
  pause <- data.frame(
    x = cx + c(20, 24) * s, xend = cx + c(20, 24) * s,
    y = rep(card_y[held] - 3 * s, 2), yend = rep(card_y[held] + 3 * s, 2)
  )

  list(
    ggplot2::geom_rect(data = sheet,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_segment(data = rules,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = hex_with_alpha(bright, 0.8), linewidth = .lw(s, 1.6)),
    ggplot2::geom_segment(data = shafts,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = heads, .aes(x, y, group = grp),
      fill = bright, color = bright, linewidth = .lw(s, 0.8)),
    ggplot2::geom_rect(data = cards,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = ifelse(cards$lit, hex_with_alpha(col, 0.2), hex_with_alpha(col, 0.06)),
      color = ifelse(cards$lit, bright, hex_with_alpha(col, 0.5)),
      linewidth = .lw(s, 1.6)),
    ggplot2::geom_path(data = ticks, .aes(x, y, group = grp),
      color = bright, linewidth = .lw(s, 1.6)),
    ggplot2::geom_segment(data = pause,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = hex_with_alpha(col, 0.75), linewidth = .lw(s, 1.6))
  )
}
