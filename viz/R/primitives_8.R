# primitives_8.R - Glyph library part 8: Shiny domain (6)
# Sourced by build-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# Shiny domain glyphs (6)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_shiny_scaffold: app window with three framework tabs ────────────
glyph_shiny_scaffold <- function(cx, cy, s, col, bright) {
  # Browser/app window outline
  win <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 24 * s,
    ymin = cy - 22 * s, ymax = cy + 22 * s
  )
  # Title bar
  bar <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 24 * s,
    ymin = cy + 16 * s, ymax = cy + 22 * s
  )
  # Three dots (window controls)
  dots <- data.frame(
    x = cx + c(-20, -16, -12) * s,
    y = rep(cy + 19 * s, 3)
  )
  # Three framework tabs (golem / rhino / vanilla)
  tab1 <- data.frame(
    xmin = cx - 22 * s, xmax = cx - 8 * s,
    ymin = cy + 10 * s, ymax = cy + 15 * s
  )
  tab2 <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 8 * s,
    ymin = cy + 10 * s, ymax = cy + 15 * s
  )
  tab3 <- data.frame(
    xmin = cx + 10 * s, xmax = cx + 22 * s,
    ymin = cy + 10 * s, ymax = cy + 15 * s
  )
  # Scaffolding lines inside app body
  sidebar_box <- data.frame(
    xmin = cx - 20 * s, xmax = cx - 6 * s,
    ymin = cy - 18 * s, ymax = cy + 6 * s
  )
  main_box <- data.frame(
    xmin = cx - 2 * s, xmax = cx + 20 * s,
    ymin = cy - 18 * s, ymax = cy + 6 * s
  )
  # Wrench icon hint in sidebar
  wrench <- data.frame(
    x = c(cx - 16 * s, cx - 10 * s),
    y = c(cy - 2 * s, cy - 8 * s)
  )
  list(
    # Window frame
    ggplot2::geom_rect(data = win,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2)),
    # Title bar
    ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = NA),
    # Window dots
    ggplot2::geom_point(data = dots, .aes(x, y),
      color = bright, size = 2.5 * s),
    # Three tabs (middle highlighted)
    ggplot2::geom_rect(data = tab1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = tab2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = tab3,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1)),
    # Sidebar + main content
    ggplot2::geom_rect(data = sidebar_box,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = main_box,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.06), color = col, linewidth = .lw(s, 1.2)),
    # Wrench hint
    ggplot2::geom_path(data = wrench, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

# ── glyph_shiny_module: two NS-isolated boxes with reactive connection ───
glyph_shiny_module <- function(cx, cy, s, col, bright) {
  # Module A box (left, UI)
  mod_a <- data.frame(
    xmin = cx - 24 * s, xmax = cx - 2 * s,
    ymin = cy - 6 * s, ymax = cy + 20 * s
  )
  # Module B box (right, Server)
  mod_b <- data.frame(
    xmin = cx + 2 * s, xmax = cx + 24 * s,
    ymin = cy - 6 * s, ymax = cy + 20 * s
  )
  # NS() label bar on each module (top stripe)
  ns_a <- data.frame(
    xmin = cx - 24 * s, xmax = cx - 2 * s,
    ymin = cy + 16 * s, ymax = cy + 20 * s
  )
  ns_b <- data.frame(
    xmin = cx + 2 * s, xmax = cx + 24 * s,
    ymin = cy + 16 * s, ymax = cy + 20 * s
  )
  # Content lines in each module
  la1 <- data.frame(
    x = c(cx - 21 * s, cx - 8 * s), y = c(cy + 10 * s, cy + 10 * s)
  )
  la2 <- data.frame(
    x = c(cx - 21 * s, cx - 12 * s), y = c(cy + 4 * s, cy + 4 * s)
  )
  lb1 <- data.frame(
    x = c(cx + 5 * s, cx + 18 * s), y = c(cy + 10 * s, cy + 10 * s)
  )
  lb2 <- data.frame(
    x = c(cx + 5 * s, cx + 14 * s), y = c(cy + 4 * s, cy + 4 * s)
  )
  # Reactive connection arrow (from mod_a output to mod_b input)
  arrow_shaft <- data.frame(
    x = c(cx - 13 * s, cx - 13 * s, cx + 13 * s, cx + 13 * s),
    y = c(cy - 6 * s, cy - 16 * s, cy - 16 * s, cy - 6 * s)
  )
  # Arrowhead
  arrow_head <- data.frame(
    x = c(cx + 10 * s, cx + 13 * s, cx + 16 * s),
    y = c(cy - 9 * s, cy - 6 * s, cy - 9 * s)
  )
  # Reactive diamond on the connection
  diamond <- data.frame(
    x = cx + c(0, 4, 0, -4) * s,
    y = cy + c(-12, -16, -20, -16) * s
  )
  list(
    # Module boxes
    ggplot2::geom_rect(data = mod_a,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = mod_b,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
    # NS bars
    ggplot2::geom_rect(data = ns_a,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = NA),
    ggplot2::geom_rect(data = ns_b,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = NA),
    # Content lines
    ggplot2::geom_path(data = la1, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = la2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = lb1, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = lb2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5)),
    # Reactive connection
    ggplot2::geom_path(data = arrow_shaft, .aes(x, y),
      color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 0.5)),
    # Reactive diamond
    ggplot2::geom_polygon(data = diamond, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_shiny_test: browser with checkmark and test indicators ─────────
glyph_shiny_test <- function(cx, cy, s, col, bright) {
  # Browser window
  win <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 22 * s,
    ymin = cy - 20 * s, ymax = cy + 20 * s
  )
  # Title bar
  bar <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 22 * s,
    ymin = cy + 14 * s, ymax = cy + 20 * s
  )
  # Large checkmark in center
  check <- data.frame(
    x = c(cx - 10 * s, cx - 3 * s, cx + 12 * s),
    y = c(cy - 2 * s, cy - 10 * s, cy + 8 * s)
  )
  # Test result bars (pass indicators, bottom)
  bar1 <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 12 * s,
    ymin = cy - 17 * s, ymax = cy - 14 * s
  )
  bar2 <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 6 * s,
    ymin = cy - 12.5 * s, ymax = cy - 9.5 * s  # moved up a bit to avoid overlap
  )
  # Small dots at end of bars (status)
  dot1 <- data.frame(x = cx + 15 * s, y = cy - 15.5 * s)
  dot2 <- data.frame(x = cx + 9 * s, y = cy - 11 * s)
  # Test tube hint (top right)
  tube <- data.frame(
    xmin = cx + 12 * s, xmax = cx + 16 * s,
    ymin = cy + 2 * s, ymax = cy + 12 * s
  )
  tube_cap <- data.frame(
    xmin = cx + 11 * s, xmax = cx + 17 * s,
    ymin = cy + 10 * s, ymax = cy + 13 * s
  )
  list(
    # Window
    ggplot2::geom_rect(data = win,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2)),
    # Title bar
    ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = NA),
    # Checkmark
    ggplot2::geom_path(data = check, .aes(x, y),
      color = bright, linewidth = .lw(s, 4)),
    # Result bars
    ggplot2::geom_rect(data = bar1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = NA),
    ggplot2::geom_rect(data = bar2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = NA),
    # Status dots
    ggplot2::geom_point(data = dot1, .aes(x, y), color = bright, size = 3 * s),
    ggplot2::geom_point(data = dot2, .aes(x, y), color = bright, size = 3 * s),
    # Test tube
    ggplot2::geom_rect(data = tube,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1)),
    ggplot2::geom_rect(data = tube_cap,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = col, linewidth = .lw(s, 1))
  )
}

# ── glyph_shiny_deploy: cloud with upload arrow ──────────────────────────
glyph_shiny_deploy <- function(cx, cy, s, col, bright) {
  # Cloud shape (three overlapping circles)
  cloud1 <- data.frame(x0 = cx - 10 * s, y0 = cy + 8 * s, r = 12 * s)
  cloud2 <- data.frame(x0 = cx + 6 * s, y0 = cy + 10 * s, r = 14 * s)
  cloud3 <- data.frame(x0 = cx + 18 * s, y0 = cy + 6 * s, r = 10 * s)
  # Cloud base (flat bottom masking rectangle)
  cloud_base <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 28 * s,
    ymin = cy - 2 * s, ymax = cy + 4 * s
  )
  # Upload arrow (vertical shaft + arrowhead)
  shaft <- data.frame(
    x = c(cx, cx),
    y = c(cy - 22 * s, cy - 4 * s)
  )
  head_left <- data.frame(
    x = c(cx - 8 * s, cx),
    y = c(cy - 10 * s, cy - 2 * s)
  )
  head_right <- data.frame(
    x = c(cx + 8 * s, cx),
    y = c(cy - 10 * s, cy - 2 * s)
  )
  # Platform line below arrow (server base)
  platform <- data.frame(
    x = c(cx - 14 * s, cx + 14 * s),
    y = c(cy - 24 * s, cy - 24 * s)
  )
  # Small container dots on platform
  dots <- data.frame(
    x = cx + c(-8, 0, 8) * s,
    y = rep(cy - 24 * s, 3)
  )
  list(
    # Cloud (filled circles)
    ggforce::geom_circle(data = cloud1, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = cloud2, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = cloud3, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    # Cloud base
    ggplot2::geom_rect(data = cloud_base,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = NA),
    # Upload arrow
    ggplot2::geom_path(data = shaft, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = head_left, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = head_right, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    # Platform
    ggplot2::geom_path(data = platform, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    # Container dots
    ggplot2::geom_point(data = dots, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), size = 3 * s)
  )
}

# ── glyph_shiny_optimize: speedometer gauge with lightning bolt ──────────
glyph_shiny_optimize <- function(cx, cy, s, col, bright) {
  # Gauge arc (semicircle, bottom half)
  t_arc <- seq(pi * 0.15, pi * 0.85, length.out = 40)
  r_arc <- 24 * s
  arc <- data.frame(
    x = cx + r_arc * cos(t_arc),
    y = cy - 4 * s + r_arc * sin(t_arc)
  )
  # Gauge ticks
  layers <- list(
    ggplot2::geom_path(data = arc, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
  tick_angles <- seq(pi * 0.2, pi * 0.8, length.out = 5)
  for (ta in tick_angles) {
    inner <- data.frame(
      x = c(cx + (r_arc - 4 * s) * cos(ta), cx + (r_arc + 2 * s) * cos(ta)),
      y = c(cy - 4 * s + (r_arc - 4 * s) * sin(ta),
            cy - 4 * s + (r_arc + 2 * s) * sin(ta))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = inner, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  }
  # Needle pointing to high (right side)
  needle_angle <- pi * 0.25
  needle <- data.frame(
    x = c(cx, cx + 18 * s * cos(needle_angle)),
    y = c(cy - 4 * s, cy - 4 * s + 18 * s * sin(needle_angle))
  )
  # Center pivot
  pivot <- data.frame(x0 = cx, y0 = cy - 4 * s, r = 3 * s)
  # Lightning bolt below gauge
  bolt <- data.frame(
    x = cx + c(-4, 2, -1, 5) * s,
    y = cy + c(-8, -14, -16, -22) * s
  )
  c(
    layers,
    list(
      # Needle
      ggplot2::geom_path(data = needle, .aes(x, y),
        color = bright, linewidth = .lw(s, 3)),
      # Pivot
      ggforce::geom_circle(data = pivot, .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2)),
      # Lightning bolt
      ggplot2::geom_path(data = bolt, .aes(x, y),
        color = bright, linewidth = .lw(s, 2.5))
    )
  )
}

# ── glyph_shiny_ui: layout grid with value box and card ──────────────────
glyph_shiny_ui <- function(cx, cy, s, col, bright) {
  # Outer page frame
  page <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 24 * s,
    ymin = cy - 24 * s, ymax = cy + 24 * s
  )
  # Three value boxes across top row
  vb1 <- data.frame(
    xmin = cx - 22 * s, xmax = cx - 8 * s,
    ymin = cy + 14 * s, ymax = cy + 22 * s
  )
  vb2 <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 8 * s,
    ymin = cy + 14 * s, ymax = cy + 22 * s
  )
  vb3 <- data.frame(
    xmin = cx + 10 * s, xmax = cx + 22 * s,
    ymin = cy + 14 * s, ymax = cy + 22 * s
  )
  # Card (main content, wide)
  card_main <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 10 * s,
    ymin = cy - 20 * s, ymax = cy + 10 * s
  )
  # Card header stripe
  card_hdr <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 10 * s,
    ymin = cy + 6 * s, ymax = cy + 10 * s
  )
  # Small sidebar card (right)
  card_side <- data.frame(
    xmin = cx + 14 * s, xmax = cx + 22 * s,
    ymin = cy - 20 * s, ymax = cy + 10 * s
  )
  # Chart hint inside main card (rising line)
  chart <- data.frame(
    x = cx + c(-18, -10, -2, 6) * s,
    y = cy + c(-14, -6, -10, -2) * s
  )
  # Sidebar lines
  sl1 <- data.frame(
    x = c(cx + 16 * s, cx + 20 * s), y = c(cy + 4 * s, cy + 4 * s)
  )
  sl2 <- data.frame(
    x = c(cx + 16 * s, cx + 20 * s), y = c(cy - 2 * s, cy - 2 * s)
  )
  sl3 <- data.frame(
    x = c(cx + 16 * s, cx + 20 * s), y = c(cy - 8 * s, cy - 8 * s)
  )
  # Theme palette swatch dots (bottom left)
  swatches <- data.frame(
    x = cx + c(-18, -14, -10, -6) * s,
    y = rep(cy - 22 * s, 4)
  )
  list(
    # Page
    ggplot2::geom_rect(data = page,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.06), color = bright, linewidth = .lw(s, 1.8)),
    # Value boxes
    ggplot2::geom_rect(data = vb1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = vb2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = vb3,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    # Main card
    ggplot2::geom_rect(data = card_main,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = card_hdr,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.18), color = NA),
    # Side card
    ggplot2::geom_rect(data = card_side,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.2)),
    # Chart line
    ggplot2::geom_path(data = chart, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    # Sidebar lines
    ggplot2::geom_path(data = sl1, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = sl2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = sl3, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.2)),
    # Theme swatches
    ggplot2::geom_point(data = swatches, .aes(x, y),
      color = bright, size = 3 * s)
  )
}
