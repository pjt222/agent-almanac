# primitives_25.R — GitHub repo security glyphs (2)
#
# Two git-domain skills, one read-only and one write-path:
#   assess-github-repo-security  read-only audit: a dominant shield holding a
#                                ticked PASS row and an unticked GAP row, a
#                                magnifier lens hovering over the gap —
#                                inspection, never modification (git)
#   harden-github-repo-security  tier-by-tier fortification: a shield gaining
#                                a bolted inner plate and a mounted padlock —
#                                protection being applied, not observed (git)
#
# Signature: glyph_*(cx, cy, s, col, bright) -> list() of ggplot2 layers.
# Glow is applied by the renderer; do not add glow here.

# ── assess-github-repo-security — shield under the audit lens ───────────────
glyph_repo_audit <- function(cx, cy, s, col, bright) {
  # the audited repo: a dominant shield, shifted up-left to make room for
  # the lens; the audit never touches it (read-only)
  sx <- cx - 4 * s
  sy <- cy + 4 * s
  w <- 34 * s
  h <- 42 * s
  shield <- data.frame(
    x = c(sx - w / 2, sx - w / 2, sx - w * 0.25, sx,
          sx + w * 0.25, sx + w / 2, sx + w / 2),
    y = c(sy + h * 0.4, sy - h * 0.05, sy - h * 0.42, sy - h * 0.48,
          sy - h * 0.42, sy - h * 0.05, sy + h * 0.4)
  )
  # checklist row 1 — PASS: tick plus entry line
  tick <- data.frame(
    x = c(sx - 11 * s, sx - 7.5 * s, sx - 2.5 * s),
    y = c(sy + 7.5 * s, sy + 4 * s, sy + 11.5 * s)
  )
  pass_line <- data.frame(
    x = c(sx + 1 * s, sx + 11 * s),
    y = c(sy + 7.5 * s, sy + 7.5 * s)
  )
  # checklist row 2 — GAP: entry present, no tick; it runs under the lens
  gap_line <- data.frame(
    x = c(sx - 9 * s, sx + 7 * s),
    y = c(sy - 5 * s, sy - 5 * s)
  )
  # the examining lens, centered over the gap row's end
  lens <- data.frame(x0 = cx + 9 * s, y0 = cy - 5 * s, r = 10 * s)
  handle <- data.frame(
    x = c(cx + 9 * s + 10 * s * cos(-pi / 4),
          cx + 9 * s + 23 * s * cos(-pi / 4)),
    y = c(cy - 5 * s + 10 * s * sin(-pi / 4),
          cy - 5 * s + 23 * s * sin(-pi / 4))
  )
  list(
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(col, 0.10), color = bright, linewidth = .lw(s)),
    ggplot2::geom_path(data = tick, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = pass_line, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = gap_line, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.08), color = bright,
      linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3.5))
  )
}

# ── harden-github-repo-security — the shield gaining a bolted plate ─────────
glyph_repo_harden <- function(cx, cy, s, col, bright) {
  # the repo's shield, symmetric and centered
  sy <- cy + 2 * s
  ow <- 38 * s
  oh <- 46 * s
  outer <- data.frame(
    x = c(cx - ow / 2, cx - ow / 2, cx - ow * 0.25, cx,
          cx + ow * 0.25, cx + ow / 2, cx + ow / 2),
    y = c(sy + oh * 0.4, sy - oh * 0.05, sy - oh * 0.42, sy - oh * 0.48,
          sy - oh * 0.42, sy - oh * 0.05, sy + oh * 0.4)
  )
  # the applied tier: an inner reinforcement plate, same profile
  iw <- 28 * s
  ih <- 34 * s
  inner <- data.frame(
    x = c(cx - iw / 2, cx - iw / 2, cx - iw * 0.25, cx,
          cx + iw * 0.25, cx + iw / 2, cx + iw / 2),
    y = c(sy + ih * 0.4, sy - ih * 0.05, sy - ih * 0.42, sy - ih * 0.48,
          sy - ih * 0.42, sy - ih * 0.05, sy + ih * 0.4)
  )
  # rivets fastening the plate along its top band
  rivets <- data.frame(x = cx + c(-8, 0, 8) * s, y = rep(sy + 16 * s, 3))
  # padlock mounted at the shield's heart
  shackle_t <- seq(0, pi, length.out = 25)
  shackle <- data.frame(
    x = cx + 5.5 * s * cos(shackle_t),
    y = cy + 2 * s + 7 * s * sin(shackle_t)
  )
  body <- data.frame(xmin = cx - 7.5 * s, xmax = cx + 7.5 * s,
                     ymin = cy - 9 * s, ymax = cy + 2 * s)
  keyhole <- data.frame(x = cx, y = cy - 3.5 * s)
  list(
    ggplot2::geom_polygon(data = outer, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s)),
    ggplot2::geom_polygon(data = inner, .aes(x, y),
      fill = hex_with_alpha(col, 0.16), color = col, linewidth = .lw(s, 1.6)),
    ggplot2::geom_point(data = rivets, .aes(x, y),
      color = bright, size = 2.6 * s),
    ggplot2::geom_path(data = shackle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_rect(data = body,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.28), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_point(data = keyhole, .aes(x, y),
      color = bright, size = 2.4 * s)
  )
}
