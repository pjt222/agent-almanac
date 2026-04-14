# primitives_19.R - Glyph library part 19: synoptic skills (4) + web-scraping (1) + IP (2)
# Sourced by build-icons.R
# Domains: synoptic (4), web-dev (1), intellectual-property (2)

# ══════════════════════════════════════════════════════════════════════════════
# Synoptic skills (4)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_expand_awareness: concentric expanding rings with center dot ────────
glyph_expand_awareness <- function(cx, cy, s, col, bright) {
  # Three concentric rings expanding outward with decreasing alpha,
  # plus a solid center dot — panoramic awareness radiating outward.
  layers <- list()

  # Center dot (anchor of awareness)
  center <- data.frame(x0 = cx, y0 = cy, r = 3.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = center,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.6), color = bright, linewidth = .lw(s, 1.5))

  # Three expanding rings
  ring_radii <- c(10, 17, 24)
  ring_alphas <- c(0.6, 0.4, 0.2)
  ring_lws <- c(2.2, 1.8, 1.4)
  for (i in seq_along(ring_radii)) {
    ring <- data.frame(x0 = cx, y0 = cy, r = ring_radii[i] * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = ring,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = "transparent", color = hex_with_alpha(bright, ring_alphas[i]),
      linewidth = .lw(s, ring_lws[i]))
  }

  # Small directional dots on the outermost ring (8 cardinal/ordinal points)
  for (angle in seq(0, 2 * pi * 7 / 8, length.out = 8)) {
    dot <- data.frame(
      x0 = cx + 24 * s * cos(angle),
      y0 = cy + 24 * s * sin(angle),
      r = 1.5 * s
    )
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = "transparent", linewidth = 0)
  }

  layers
}

# ── glyph_integrate_gestalt: shapes converging to unified center ──────────────
glyph_integrate_gestalt <- function(cx, cy, s, col, bright) {
  # Three distinct shapes (triangle, square, circle) at the periphery with
  # converging lines meeting at a unified central hexagon — the whole is
  # more than the sum of parts.
  layers <- list()

  # Peripheral shape 1: triangle (top)
  tri <- data.frame(
    x = cx + c(-6, 0, 6) * s,
    y = cy + c(16, 24, 16) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = tri, .aes(x, y),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5))

  # Peripheral shape 2: square (bottom-left)
  sq <- data.frame(
    x = cx + c(-22, -14, -14, -22) * s,
    y = cy + c(-14, -14, -22, -22) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = sq, .aes(x, y),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5))

  # Peripheral shape 3: circle (bottom-right)
  circ <- data.frame(x0 = cx + 18 * s, y0 = cy - 18 * s, r = 5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = circ,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5))

  # Converging lines from each shape to center
  sources <- list(
    c(cx, cy + 16 * s),           # from triangle bottom
    c(cx - 14 * s, cy - 14 * s),  # from square inner corner
    c(cx + 14 * s, cy - 14 * s)   # from circle inner edge
  )
  for (src in sources) {
    line <- data.frame(x = c(src[1], cx), y = c(src[2], cy))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(bright, 0.35), linewidth = .lw(s, 1.5),
      linetype = "dashed")
  }

  # Central unified hexagon
  hex_t <- seq(0, 2 * pi, length.out = 7)
  hex_r <- 8 * s
  hex_df <- data.frame(
    x = cx + hex_r * cos(hex_t + pi / 6),
    y = cy + hex_r * sin(hex_t + pi / 6)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = hex_df, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.2))

  # Bright core dot inside hexagon
  core <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = core,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.2))

  layers
}

# ── glyph_express_insight: prism with radiating light rays ────────────────────
glyph_express_insight <- function(cx, cy, s, col, bright) {
  # Central diamond/prism with 6 light rays emanating outward — insight
  # radiating to different audiences/domains.
  layers <- list()

  # Central diamond (prism)
  diamond <- data.frame(
    x = cx + c(0, 10, 0, -10) * s,
    y = cy + c(12, 0, -12, 0) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = diamond, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.2))

  # Internal facet line (horizontal)
  facet <- data.frame(
    x = c(cx - 10 * s, cx + 10 * s),
    y = c(cy, cy)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = facet, .aes(x, y),
    color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1.2))

  # 6 light rays emanating outward
  ray_angles <- seq(0, 2 * pi * 5 / 6, length.out = 6)
  ray_inner <- 13 * s
  ray_outer <- 26 * s
  ray_alphas <- c(0.7, 0.5, 0.6, 0.7, 0.5, 0.6)
  for (i in seq_along(ray_angles)) {
    angle <- ray_angles[i]
    ray <- data.frame(
      x = c(cx + ray_inner * cos(angle), cx + ray_outer * cos(angle)),
      y = c(cy + ray_inner * sin(angle), cy + ray_outer * sin(angle))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ray, .aes(x, y),
      color = hex_with_alpha(bright, ray_alphas[i]), linewidth = .lw(s, 1.8))

    # Small dot at ray tip
    tip <- data.frame(
      x0 = cx + ray_outer * cos(angle),
      y0 = cy + ray_outer * sin(angle),
      r = 2 * s
    )
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = tip,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, ray_alphas[i] * 0.6),
      color = "transparent", linewidth = 0)
  }

  layers
}

# ── glyph_adaptic: pentagon cycle of 5 connected nodes ────────────────────────
glyph_adaptic <- function(cx, cy, s, col, bright) {
  # 5 small circles arranged in a pentagon, connected by arcs forming a
  # continuous cycle — the 5-step synoptic process (clear, open, perceive,
  # integrate, express).
  layers <- list()

  pent_r <- 18 * s
  node_r <- 4.5 * s
  # Pentagon vertices (start at top, clockwise)
  angles <- seq(pi / 2, pi / 2 - 2 * pi * 4 / 5, length.out = 5)
  px <- cx + pent_r * cos(angles)
  py <- cy + pent_r * sin(angles)

  # Connecting arcs between consecutive nodes
  for (i in 1:5) {
    j <- if (i == 5) 1 else i + 1
    # Curved path via a midpoint pulled toward center
    mid_x <- (px[i] + px[j]) / 2
    mid_y <- (py[i] + py[j]) / 2
    # Pull midpoint slightly inward
    pull <- 0.15
    arc_mid_x <- mid_x + (cx - mid_x) * pull
    arc_mid_y <- mid_y + (cy - mid_y) * pull
    arc_path <- data.frame(
      x = c(px[i], arc_mid_x, px[j]),
      y = c(py[i], arc_mid_y, py[j])
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc_path, .aes(x, y),
      color = hex_with_alpha(bright, 0.45), linewidth = .lw(s, 1.8))
  }

  # Direction arrows on arcs (small chevrons at midpoints)
  for (i in 1:5) {
    j <- if (i == 5) 1 else i + 1
    mid_x <- (px[i] + px[j]) / 2
    mid_y <- (py[i] + py[j]) / 2
    pull <- 0.15
    arr_x <- mid_x + (cx - mid_x) * pull
    arr_y <- mid_y + (cy - mid_y) * pull
    # Direction from node i to node j
    dx <- px[j] - px[i]
    dy <- py[j] - py[i]
    len <- sqrt(dx^2 + dy^2)
    ux <- dx / len
    uy <- dy / len
    # Perpendicular
    px2 <- -uy
    py2 <- ux
    chevron <- data.frame(
      x = c(arr_x - 2.5 * s * ux + 2 * s * px2,
            arr_x + 2.5 * s * ux,
            arr_x - 2.5 * s * ux - 2 * s * px2),
      y = c(arr_y - 2.5 * s * uy + 2 * s * py2,
            arr_y + 2.5 * s * uy,
            arr_y - 2.5 * s * uy - 2 * s * py2)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = chevron, .aes(x, y),
      color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1.2))
  }

  # 5 node circles
  node_alphas <- c(0.6, 0.5, 0.5, 0.5, 0.6)
  for (i in 1:5) {
    node <- data.frame(x0 = px[i], y0 = py[i], r = node_r)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = node,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.12), color = bright,
      linewidth = .lw(s, 1.8))
  }

  # Central convergence dot
  core <- data.frame(x0 = cx, y0 = cy, r = 3 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = core,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.2))

  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Web-scraping skills (2)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_headless_scraper: browser frame with robotic eye ────────────────────
glyph_headless_scraper <- function(cx, cy, s, col, bright) {
  # A simplified browser window (rectangle with tab at top) containing a
  # robotic/spider eye — headless browsing and web scraping.
  layers <- list()

  # Browser window frame
  win <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 22 * s,
    ymin = cy - 18 * s, ymax = cy + 14 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = win,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2))

  # Browser tab (small rectangle on top-left)
  tab <- data.frame(
    x = cx + c(-22, -22, -8, -8) * s,
    y = cy + c(14, 20, 20, 14) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = tab, .aes(x, y),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.8))

  # Top bar line (address bar area)
  bar <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy + 14 * s, cy + 14 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bar, .aes(x, y),
    color = bright, linewidth = .lw(s, 1.5))

  # Three dots in the tab bar (window controls)
  for (i in 1:3) {
    dot <- data.frame(x0 = cx + (-4 + i * 5) * s, y0 = cy + 17 * s, r = 1.2 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = "transparent", linewidth = 0)
  }

  # Robotic eye (outer ring + inner pupil + scan lines)
  eye_cy <- cy - 4 * s
  eye_outer <- data.frame(x0 = cx, y0 = eye_cy, r = 10 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = eye_outer,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Inner pupil
  pupil <- data.frame(x0 = cx, y0 = eye_cy, r = 4 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = pupil,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1.5))

  # Scan lines (horizontal lines across the eye, suggesting digital/robotic)
  for (offset in c(-6, -3, 3, 6)) {
    scan <- data.frame(
      x = c(cx - 9 * s, cx + 9 * s),
      y = c(eye_cy + offset * s, eye_cy + offset * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = scan, .aes(x, y),
      color = hex_with_alpha(col, 0.2), linewidth = .lw(s, 0.8))
  }

  layers
}

# ── glyph_proxy_rotation: origin node with four orbiting proxy nodes ──────────
glyph_proxy_rotation <- function(cx, cy, s, col, bright) {
  # A central origin (request source) connected to four proxy nodes arranged
  # at compass positions, with curved arcs suggesting rotational cycling
  # between them — provider-neutral proxy rotation for scraping.
  layers <- list()

  # Outer ring (the proxy pool boundary)
  ring <- data.frame(x0 = cx, y0 = cy, r = 20 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = ring,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = "transparent",
    color = hex_with_alpha(col, 0.25),
    linewidth = .lw(s, 1.2))

  # Four proxy nodes at N, E, S, W
  proxy_r <- 4 * s
  proxy_d <- 16 * s
  proxies <- data.frame(
    x0 = cx + c(0,  proxy_d, 0, -proxy_d),
    y0 = cy + c(proxy_d, 0, -proxy_d, 0),
    r  = rep(proxy_r, 4)
  )
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = proxies,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.18),
    color = bright, linewidth = .lw(s, 1.6))

  # Faint spokes from center to each proxy (request routing)
  for (i in seq_len(nrow(proxies))) {
    spoke <- data.frame(
      x = c(cx, proxies$x0[i]),
      y = c(cy, proxies$y0[i])
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = spoke, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 0.7))
  }

  # Origin node (request source) — solid central dot
  origin <- data.frame(x0 = cx, y0 = cy, r = 2.6 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = origin,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = bright, color = bright, linewidth = .lw(s, 1.2))

  # Clockwise rotation chevrons at the four diagonal gaps on the outer ring
  # (NE, SE, SW, NW) — short tangent arrows that imply cycling without
  # overlapping the proxy nodes themselves.
  ring_r <- 20 * s
  chevron_centers <- pi / 4 + (0:3) * (-pi / 2)  # 45°, -45°, -135°, 135°  (clockwise)
  for (theta in chevron_centers) {
    half_span <- pi / 18  # 10° arc
    angles <- seq(theta + half_span, theta - half_span, length.out = 8)
    chev <- data.frame(
      x = cx + ring_r * cos(angles),
      y = cy + ring_r * sin(angles)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = chev, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.6),
      arrow = grid::arrow(length = grid::unit(0.05, "inches"), type = "closed"))
  }

  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Intellectual-property skills (2)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_trademark_screen: magnifying glass with TM visible ──────────────────
glyph_trademark_screen <- function(cx, cy, s, col, bright) {
  # A magnifying glass with "TM" letters visible through the lens — trademark
  # screening and search.
  layers <- list()

  # Magnifying glass lens
  lens_cx <- cx - 2 * s
  lens_cy <- cy + 4 * s
  lens_r <- 16 * s
  lens <- data.frame(x0 = lens_cx, y0 = lens_cy, r = lens_r)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = lens,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2.2))

  # Handle (from lens edge, angled down-right)
  handle_start_x <- lens_cx + lens_r * cos(-pi / 4)
  handle_start_y <- lens_cy + lens_r * sin(-pi / 4)
  handle <- data.frame(
    x = c(handle_start_x, handle_start_x + 12 * s),
    y = c(handle_start_y, handle_start_y - 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = handle, .aes(x, y),
    color = bright, linewidth = .lw(s, 3))

  # "T" letter inside lens (left side)
  t_cx <- lens_cx - 5 * s
  t_cy <- lens_cy
  # T crossbar
  t_cross <- data.frame(
    x = c(t_cx - 4 * s, t_cx + 4 * s),
    y = c(t_cy + 5 * s, t_cy + 5 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = t_cross, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  # T stem
  t_stem <- data.frame(
    x = c(t_cx, t_cx),
    y = c(t_cy + 5 * s, t_cy - 6 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = t_stem, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # "M" letter inside lens (right side)
  m_cx <- lens_cx + 5 * s
  m_cy <- lens_cy
  m_letter <- data.frame(
    x = m_cx + c(-4, -4, 0, 4, 4) * s,
    y = m_cy + c(-6, 5, 0, 5, -6) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = m_letter, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Subtle search indicator: small sparkle dots around lens
  sparkle_angles <- c(pi / 3, pi * 2 / 3, pi)
  for (sa in sparkle_angles) {
    sp <- data.frame(
      x0 = lens_cx + (lens_r + 4 * s) * cos(sa),
      y0 = lens_cy + (lens_r + 4 * s) * sin(sa),
      r = 1.5 * s
    )
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = sp,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.35), color = "transparent", linewidth = 0)
  }

  layers
}

# ── glyph_trademark_file: document with seal stamp ────────────────────────────
glyph_trademark_file <- function(cx, cy, s, col, bright) {
  # A document rectangle with a fold corner and an official seal/stamp circle
  # at the bottom — trademark filing and registration.
  layers <- list()

  # Document body
  doc <- data.frame(
    xmin = cx - 14 * s, xmax = cx + 14 * s,
    ymin = cy - 22 * s, ymax = cy + 22 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = doc,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2))

  # Document fold corner (top-right)
  fold <- data.frame(
    x = cx + c(7, 14, 14) * s,
    y = cy + c(22, 22, 15) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = fold, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))

  # Content lines on document (3 lines)
  for (i in 1:3) {
    line_y <- cy + (14 - i * 8) * s
    line_w <- c(18, 14, 10)[i]
    content <- data.frame(
      x = c(cx - 10 * s, cx - 10 * s + line_w * s),
      y = c(line_y, line_y)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = content, .aes(x, y),
      color = hex_with_alpha(col, 0.35), linewidth = .lw(s, 1.2))
  }

  # Seal/stamp circle at bottom-right (official mark)
  seal_cx <- cx + 6 * s
  seal_cy <- cy - 14 * s
  seal_r <- 8 * s
  seal <- data.frame(x0 = seal_cx, y0 = seal_cy, r = seal_r)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = seal,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Inner ring of seal (double ring = official)
  seal_inner <- data.frame(x0 = seal_cx, y0 = seal_cy, r = 5.5 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = seal_inner,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = "transparent", color = hex_with_alpha(bright, 0.5),
    linewidth = .lw(s, 1.2))

  # Star/mark inside seal (4 small lines forming a cross)
  for (angle in c(0, pi / 2, pi, 3 * pi / 2)) {
    star_line <- data.frame(
      x = c(seal_cx + 1.5 * s * cos(angle), seal_cx + 4 * s * cos(angle)),
      y = c(seal_cy + 1.5 * s * sin(angle), seal_cy + 4 * s * sin(angle))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = star_line, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  }

  layers
}
