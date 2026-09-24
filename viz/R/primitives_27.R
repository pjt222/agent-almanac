# primitives_27.R — memory reachability glyph (1)
#
# One general-domain skill:
#   verify-memory-integrity  the shelf-read: a row of spines with a shelf
#                            marker beneath, where one spine carries no
#                            catalog tick — present on the shelf, absent from
#                            the catalog, which is what an orphaned topic file
#                            is. Reads as inventory, never as cleanup: the
#                            skill is read-only and neither adds nor removes
#                            anything (general)
#
# Signature: glyph_*(cx, cy, s, col, bright) -> list() of ggplot2 layers.
# Glow is applied by the renderer; do not add glow here.

# ── verify-memory-integrity — a shelf-read finds the uncatalogued spine ─────
glyph_shelf_read <- function(cx, cy, s, col, bright) {
  # six spines standing in a row; the fourth is the uncatalogued one
  n_spines <- 6
  gap <- 11 * s
  spine_x <- cx + (seq_len(n_spines) - (n_spines + 1) / 2) * gap
  uncatalogued <- 4

  # spine heights vary slightly so the row reads as books, not as a bar chart
  spine_h <- c(26, 30, 24, 28, 22, 30) * s
  spines <- data.frame(
    xmin = spine_x - 3.5 * s, xmax = spine_x + 3.5 * s,
    ymin = cy - 14 * s, ymax = cy - 14 * s + spine_h,
    lit  = seq_len(n_spines) != uncatalogued
  )

  # catalog ticks: one short mark on each spine that HAS an entry
  ticked <- spines[spines$lit, ]
  ticks <- data.frame(
    x = ticked$xmin + 1 * s, xend = ticked$xmax - 1 * s,
    y = ticked$ymax - 7 * s, yend = ticked$ymax - 7 * s
  )

  # the shelf itself
  shelf <- data.frame(
    x = c(cx - 38 * s, cx + 38 * s),
    y = c(cy - 14 * s, cy - 14 * s)
  )

  # shelf marker: the flag a shelf-reader leaves at the position being read,
  # planted under the spine whose catalog entry is missing
  marker_x <- spine_x[uncatalogued]
  marker <- data.frame(
    x = c(marker_x, marker_x, marker_x + 7 * s, marker_x),
    y = c(cy - 14 * s, cy - 30 * s, cy - 26 * s, cy - 22 * s)
  )

  # tally strip beneath the shelf: five counted, one open box
  tally_x <- cx + (seq_len(n_spines) - (n_spines + 1) / 2) * (7 * s) - 16 * s
  tally <- data.frame(
    xmin = tally_x - 2.2 * s, xmax = tally_x + 2.2 * s,
    ymin = cy - 36 * s, ymax = cy - 31.6 * s,
    counted = seq_len(n_spines) != uncatalogued
  )

  list(
    ggplot2::geom_rect(data = spines,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.14),
      color = ifelse(spines$lit, bright, hex_with_alpha(col, 0.45)),
      linewidth = .lw(s, 1.6)),
    ggplot2::geom_segment(data = ticks,
      .aes(x = x, xend = xend, y = y, yend = yend),
      color = hex_with_alpha(bright, 0.75), linewidth = .lw(s, 1.3)),
    ggplot2::geom_path(data = shelf, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.4)),
    ggplot2::geom_polygon(data = marker, .aes(x, y),
      fill = hex_with_alpha(bright, 0.85), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = tally,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = ifelse(tally$counted, hex_with_alpha(bright, 0.7), "transparent"),
      color = hex_with_alpha(col, 0.8), linewidth = .lw(s, 1))
  )
}
