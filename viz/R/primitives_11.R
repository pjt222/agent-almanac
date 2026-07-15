# primitives_11.R - Glyph library part 11: Lapidary, number theory, versioning (11)
# Sourced by build-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# Lapidary glyphs (4)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_gem_loupe: gemstone under magnifying loupe ───────────────────────
glyph_gem_loupe <- function(cx, cy, s, col, bright) {
  # Gemstone (hexagonal crystal)
  t <- seq(0, 2 * pi, length.out = 7)
  gem <- data.frame(x = cx + 12 * s * cos(t - pi / 6) - 4 * s,
                    y = cy + 14 * s * sin(t - pi / 6) - 4 * s)
  # Loupe circle
  loupe <- data.frame(x0 = cx + 6 * s, y0 = cy + 6 * s, r = 14 * s)
  # Handle
  handle <- data.frame(x = c(cx + 16 * s, cx + 24 * s),
                       y = c(cy - 4 * s, cy - 14 * s))
  list(
    ggplot2::geom_polygon(data = gem, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = loupe, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.05), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = handle, .aes(x, y),
      color = bright, linewidth = .lw(s, 3))
  )
}

# ── glyph_gem_facet: faceted gemstone with cutting lines ───────────────────
glyph_gem_facet <- function(cx, cy, s, col, bright) {
  # Crown top (trapezoid table)
  table_d <- data.frame(
    x = c(cx - 8 * s, cx + 8 * s, cx + 12 * s, cx - 12 * s),
    y = c(cy + 8 * s, cy + 8 * s, cy + 2 * s, cy + 2 * s)
  )
  # Girdle outline
  girdle <- data.frame(
    x = c(cx - 20 * s, cx - 12 * s, cx - 8 * s, cx + 8 * s, cx + 12 * s, cx + 20 * s),
    y = c(cy - 4 * s, cy + 2 * s, cy + 8 * s, cy + 8 * s, cy + 2 * s, cy - 4 * s)
  )
  # Pavilion (V)
  pav <- data.frame(
    x = c(cx - 20 * s, cx, cx + 20 * s),
    y = c(cy - 4 * s, cy - 26 * s, cy - 4 * s)
  )
  # Facet lines
  fl <- data.frame(x = c(cx - 12 * s, cx), y = c(cy + 2 * s, cy - 26 * s))
  fr <- data.frame(x = c(cx + 12 * s, cx), y = c(cy + 2 * s, cy - 26 * s))
  # Cutting angle indicator
  angle_arc <- data.frame(
    x = cx + c(-28, -26, -24) * s,
    y = cy + c(-8, -2, 4) * s
  )
  list(
    ggplot2::geom_polygon(data = pav, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = girdle, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = table_d, .aes(x, y),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = fl, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = fr, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = angle_arc, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  )
}

# ── glyph_gem_polish: gemstone with circular polish motion arcs ────────────
glyph_gem_polish <- function(cx, cy, s, col, bright) {
  # Polished gem (oval)
  t <- seq(0, 2 * pi, length.out = 50)
  gem <- data.frame(x = cx + 16 * s * cos(t), y = cy + 12 * s * sin(t))
  # Polish motion arcs (3 curved strokes)
  layers <- list(
    ggplot2::geom_polygon(data = gem, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
  for (i in 1:3) {
    offset <- (i - 2) * 8 * s
    arc_t <- seq(-0.8, 0.8, length.out = 20)
    arc <- data.frame(
      x = cx + (20 + i * 4) * s * cos(arc_t) + offset,
      y = cy + (16 + i * 3) * s * sin(arc_t)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
      color = hex_with_alpha(bright, 0.2 + 0.1 * i), linewidth = .lw(s, 1.5))
  }
  # Sparkle dots
  sparkles <- data.frame(
    x0 = cx + c(-8, 6, -2, 10) * s,
    y0 = cy + c(6, -4, -8, 8) * s,
    r = rep(1.5 * s, 4)
  )
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = sparkles,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = bright, color = bright, linewidth = .lw(s, 0.5))
  layers
}

# ── glyph_gem_scale: balance scale with gemstone ──────────────────────────
glyph_gem_scale <- function(cx, cy, s, col, bright) {
  # Fulcrum (triangle base)
  fulcrum <- data.frame(
    x = c(cx - 6 * s, cx + 6 * s, cx),
    y = c(cy - 22 * s, cy - 22 * s, cy - 14 * s)
  )
  # Beam (horizontal bar)
  beam <- data.frame(x = c(cx - 22 * s, cx + 22 * s), y = c(cy - 10 * s, cy - 10 * s))
  # Vertical post
  post <- data.frame(x = c(cx, cx), y = c(cy - 14 * s, cy - 10 * s))
  # Left pan (arc)
  pan_l_t <- seq(pi + 0.3, 2 * pi - 0.3, length.out = 20)
  pan_l <- data.frame(x = cx - 18 * s + 8 * s * cos(pan_l_t),
                      y = cy - 10 * s + 8 * s * sin(pan_l_t))
  # Right pan
  pan_r <- data.frame(x = cx + 18 * s + 8 * s * cos(pan_l_t),
                      y = cy - 10 * s + 8 * s * sin(pan_l_t))
  # Chains
  chain_l <- data.frame(x = c(cx - 22 * s, cx - 18 * s), y = c(cy - 10 * s, cy - 16 * s))
  chain_r <- data.frame(x = c(cx + 22 * s, cx + 18 * s), y = c(cy - 10 * s, cy - 16 * s))
  # Gem on left pan (small diamond shape)
  gem <- data.frame(
    x = c(cx - 18 * s, cx - 14 * s, cx - 18 * s, cx - 22 * s),
    y = c(cy - 14 * s, cy - 18 * s, cy - 22 * s, cy - 18 * s)
  )
  list(
    ggplot2::geom_polygon(data = fulcrum, .aes(x, y),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = post, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = beam, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = chain_l, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = chain_r, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = pan_l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = pan_r, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = gem, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1))
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Number theory glyphs (3)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_prime_sieve: grid of dots with primes highlighted ───────────────
glyph_prime_sieve <- function(cx, cy, s, col, bright) {
  layers <- list()
  primes <- c(2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31)
  # 6x6 grid of numbers 1-36
  pts <- data.frame(x0 = numeric(0), y0 = numeric(0), r = numeric(0),
                    is_prime = logical(0))
  for (row in 1:6) {
    for (col_i in 1:6) {
      n <- (row - 1) * 6 + col_i
      px <- cx + (col_i - 3.5) * 8 * s
      py <- cy + (row - 3.5) * 8 * s
      pts <- rbind(pts, data.frame(x0 = px, y0 = py, r = 2.5 * s,
                                   is_prime = n %in% primes))
    }
  }
  # Composite dots (dim)
  composites <- pts[!pts$is_prime, ]
  if (nrow(composites) > 0) {
    layers[[1]] <- ggforce::geom_circle(data = composites,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = hex_with_alpha(col, 0.2),
      linewidth = .lw(s, 0.5))
  }
  # Prime dots (bright)
  prime_pts <- pts[pts$is_prime, ]
  if (nrow(prime_pts) > 0) {
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = prime_pts,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_modular_clock: clock face with modular arithmetic positions ─────
glyph_modular_clock <- function(cx, cy, s, col, bright) {
  # Outer circle
  ring <- data.frame(x0 = cx, y0 = cy, r = 26 * s)
  # 12 tick marks around the circle (mod 12)
  layers <- list(
    ggforce::geom_circle(data = ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.05), color = col, linewidth = .lw(s, 1.5))
  )
  for (i in 0:11) {
    angle <- i * pi / 6 - pi / 2
    x1 <- cx + 22 * s * cos(angle)
    y1 <- cy + 22 * s * sin(angle)
    x2 <- cx + 26 * s * cos(angle)
    y2 <- cy + 26 * s * sin(angle)
    tick <- data.frame(x = c(x1, x2), y = c(y1, y2))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = tick, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.5))
  }
  # Congruence arrow (curved path showing a mod operation)
  arc_t <- seq(0, 5 * pi / 6, length.out = 30)
  arc <- data.frame(
    x = cx + 16 * s * cos(arc_t - pi / 2),
    y = cy + 16 * s * sin(arc_t - pi / 2)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arc, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  # Arrowhead at end of arc
  ah <- data.frame(
    x = c(arc$x[30] - 3 * s, arc$x[30], arc$x[30] + 4 * s),
    y = c(arc$y[30] + 3 * s, arc$y[30], arc$y[30] + 4 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ah, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers
}

# ── glyph_diophantine_grid: integer lattice with solution points ──────────
glyph_diophantine_grid <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Grid lines
  for (i in -3:3) {
    hline <- data.frame(x = c(cx - 24 * s, cx + 24 * s),
                        y = c(cy + i * 8 * s, cy + i * 8 * s))
    vline <- data.frame(x = c(cx + i * 8 * s, cx + i * 8 * s),
                        y = c(cy - 24 * s, cy + 24 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = hline, .aes(x, y),
      color = hex_with_alpha(col, 0.12), linewidth = .lw(s, 0.5))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = vline, .aes(x, y),
      color = hex_with_alpha(col, 0.12), linewidth = .lw(s, 0.5))
  }
  # Diagonal line (representing ax + by = c)
  diag <- data.frame(x = c(cx - 24 * s, cx + 24 * s),
                     y = c(cy + 16 * s, cy - 16 * s))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = diag, .aes(x, y),
    color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.5))
  # Integer solution points on the line
  sols <- data.frame(
    x0 = cx + c(-16, -8, 0, 8, 16) * s,
    y0 = cy + c(10.67, 5.33, 0, -5.33, -10.67) * s,
    r = rep(3 * s, 5)
  )
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = sols,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Versioning glyphs (4)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_semver_tag: version tag badge with major.minor.patch dots ───────
glyph_semver_tag <- function(cx, cy, s, col, bright) {
  # Tag shape (rectangle with pointed left end)
  tag <- data.frame(
    x = c(cx - 20 * s, cx - 10 * s, cx + 22 * s, cx + 22 * s, cx - 10 * s, cx - 20 * s),
    y = c(cy, cy + 12 * s, cy + 12 * s, cy - 12 * s, cy - 12 * s, cy)
  )
  # Three version dots
  dots <- data.frame(
    x0 = c(cx - 2 * s, cx + 8 * s, cx + 18 * s),
    y0 = rep(cy, 3),
    r = c(4 * s, 3.5 * s, 3 * s)
  )
  # Ring at tag point
  ring <- data.frame(x0 = cx - 14 * s, y0 = cy, r = 3 * s)
  list(
    ggplot2::geom_polygon(data = tag, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = ring, .aes(x0 = x0, y0 = y0, r = r),
      fill = NA, color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = dots, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1))
  )
}

# ── glyph_changelog_scroll: scrolled document with timeline dots ──────────
glyph_changelog_scroll <- function(cx, cy, s, col, bright) {
  # Scroll body
  body <- data.frame(
    x = c(cx - 14 * s, cx + 14 * s, cx + 14 * s, cx - 14 * s),
    y = c(cy - 20 * s, cy - 20 * s, cy + 16 * s, cy + 16 * s)
  )
  # Top curl
  curl_t <- seq(0, pi, length.out = 20)
  curl <- data.frame(
    x = cx + 14 * s * cos(curl_t),
    y = cy + 16 * s + 6 * s * sin(curl_t)
  )
  # Timeline dots (left column)
  layers <- list(
    ggplot2::geom_polygon(data = body, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = curl, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  )
  ys <- seq(cy - 14 * s, cy + 10 * s, length.out = 5)
  for (i in seq_along(ys)) {
    dot <- data.frame(x0 = cx - 8 * s, y0 = ys[i], r = 2 * s)
    line_d <- data.frame(x = c(cx - 4 * s, cx + 10 * s), y = c(ys[i], ys[i]))
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2 + 0.15 * i), color = bright,
      linewidth = .lw(s, 1))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line_d, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1.5))
  }
  layers
}

# ── glyph_release_calendar: calendar with milestone marker ────────────────
glyph_release_calendar <- function(cx, cy, s, col, bright) {
  # Calendar body
  cal <- data.frame(
    x = c(cx - 20 * s, cx + 20 * s, cx + 20 * s, cx - 20 * s),
    y = c(cy - 20 * s, cy - 20 * s, cy + 14 * s, cy + 14 * s)
  )
  # Header bar
  header <- data.frame(
    xmin = cx - 20 * s, xmax = cx + 20 * s,
    ymin = cy + 10 * s, ymax = cy + 14 * s
  )
  # Calendar rings (top binding)
  ring_l <- data.frame(x = c(cx - 12 * s, cx - 12 * s), y = c(cy + 14 * s, cy + 20 * s))
  ring_r <- data.frame(x = c(cx + 12 * s, cx + 12 * s), y = c(cy + 14 * s, cy + 20 * s))
  # Grid cells (3x3)
  layers <- list(
    ggplot2::geom_polygon(data = cal, .aes(x, y),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = header,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = ring_l, .aes(x, y), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = ring_r, .aes(x, y), color = bright, linewidth = .lw(s, 2.5))
  )
  # Day dots
  for (row in 1:3) {
    for (c_i in 1:3) {
      dot <- data.frame(
        x0 = cx + (c_i - 2) * 12 * s,
        y0 = cy + (1 - row) * 10 * s,
        r = 2.5 * s
      )
      is_release <- (row == 2 && c_i == 2)
      layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
        .aes(x0 = x0, y0 = y0, r = r),
        fill = if (is_release) hex_with_alpha(bright, 0.4) else hex_with_alpha(col, 0.1),
        color = if (is_release) bright else hex_with_alpha(col, 0.3),
        linewidth = .lw(s, if (is_release) 1.5 else 0.8))
    }
  }
  layers
}

# ── glyph_dependency_tree: tree graph with version nodes ──────────────────
glyph_dependency_tree <- function(cx, cy, s, col, bright) {
  layers <- list()
  # Root node (top)
  root <- data.frame(x0 = cx, y0 = cy + 18 * s, r = 5 * s)
  # Level 1 children
  l1 <- data.frame(x0 = c(cx - 16 * s, cx + 16 * s),
                   y0 = c(cy + 2 * s, cy + 2 * s),
                   r = c(4 * s, 4 * s))
  # Level 2 children
  l2 <- data.frame(x0 = c(cx - 22 * s, cx - 10 * s, cx + 10 * s, cx + 22 * s),
                   y0 = rep(cy - 14 * s, 4),
                   r = rep(3.5 * s, 4))
  # Edges: root -> L1
  for (i in 1:2) {
    ed <- data.frame(x = c(cx, l1$x0[i]), y = c(cy + 18 * s, l1$y0[i]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ed, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1.5))
  }
  # Edges: L1 -> L2
  edges_l2 <- list(c(1, 1), c(1, 2), c(2, 3), c(2, 4))
  for (e in edges_l2) {
    ed <- data.frame(x = c(l1$x0[e[1]], l2$x0[e[2]]),
                     y = c(l1$y0[e[1]], l2$y0[e[2]]))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ed, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 1))
  }
  # Draw nodes
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = root,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = l1,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5))
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = l2,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1))
  layers
}
