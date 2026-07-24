# primitives_26.R — diagram legibility glyph (1)
#
# One visualization-domain skill:
#   restore-diagram-legibility  the width-reduction move: a wide, flat,
#                               outgrown canvas whose content is a dim row of
#                               sub-pixel ticks, folding (arrow) into a
#                               compact, taller canvas holding three bold,
#                               legible label rows — same content, delivered
#                               readable (visualization)
#
# Signature: glyph_*(cx, cy, s, col, bright) -> list() of ggplot2 layers.
# Glow is applied by the renderer; do not add glow here.

# ── restore-diagram-legibility — wide canvas refolds into legible rows ──────
glyph_canvas_refold <- function(cx, cy, s, col, bright) {
  # the outgrown canvas: very wide, very flat, pinned to the top
  wide <- data.frame(
    xmin = cx - 38 * s, xmax = cx + 38 * s,
    ymin = cy + 22 * s, ymax = cy + 34 * s
  )
  # its content: a single dim row of sub-pixel ticks spread across the width
  tick_x <- seq(cx - 32 * s, cx + 32 * s, length.out = 9)
  ticks <- data.frame(
    x = tick_x, xend = tick_x + 3 * s,
    y = rep(cy + 28 * s, 9), yend = rep(cy + 28 * s, 9)
  )
  # the fold: a straight drop from the wide canvas into the compact one
  shaft <- data.frame(
    x = c(cx, cx), y = c(cy + 18 * s, cy + 4 * s)
  )
  head_pts <- data.frame(
    x = c(cx - 4 * s, cx, cx + 4 * s),
    y = c(cy + 8 * s, cy + 2 * s, cy + 8 * s)
  )
  # the refolded canvas: narrow, taller than wide, comfortably inside frame
  compact <- data.frame(
    xmin = cx - 16 * s, xmax = cx + 16 * s,
    ymin = cy - 30 * s, ymax = cy - 2 * s
  )
  # its content: three short, bold, legible label rows
  row_y <- c(cy - 8 * s, cy - 16 * s, cy - 24 * s)
  rows <- data.frame(
    x = rep(cx - 10 * s, 3), xend = rep(cx + 10 * s, 3),
    y = row_y, yend = row_y
  )
  list(
    ggplot2::geom_rect(data = wide,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_segment(data = ticks,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = shaft, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = head_pts, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_rect(data = compact,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s)),
    ggplot2::geom_segment(data = rows,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = bright, linewidth = .lw(s, 2.5))
  )
}
