# primitives_10.R - Glyph library part 10: Personality, obedience, and natural resources (13)
# Sourced by build-icons.R

# ══════════════════════════════════════════════════════════════════════════════
# Personality and psychology glyphs (5)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_trident_flame: three-pronged trident with flame at center ──────
glyph_trident_flame <- function(cx, cy, s, col, bright) {
  # Central shaft
  shaft <- data.frame(
    x = c(cx, cx),
    y = c(cy - 22 * s, cy + 18 * s)
  )
  # Three prongs (left, center, right)
  prong_l <- data.frame(
    x = c(cx - 8 * s, cx - 8 * s),
    y = c(cy + 10 * s, cy + 22 * s)
  )
  prong_c <- data.frame(
    x = c(cx, cx),
    y = c(cy + 14 * s, cy + 26 * s)
  )
  prong_r <- data.frame(
    x = c(cx + 8 * s, cx + 8 * s),
    y = c(cy + 10 * s, cy + 22 * s)
  )
  # Connecting crossbar
  crossbar <- data.frame(
    x = c(cx - 8 * s, cx + 8 * s),
    y = c(cy + 10 * s, cy + 10 * s)
  )
  # Flame at center (teardrop shape)
  t <- seq(0, 1, length.out = 30)
  fw <- 10 * s
  fh <- 20 * s
  flame_x <- cx - fw * sin(t * pi) * (1 - t^0.6)
  flame_y <- cy - fh / 2 + fh * t
  flame <- data.frame(
    x = c(flame_x, rev(cx + fw * sin(rev(t) * pi) * (1 - rev(t)^0.6))),
    y = c(flame_y, rev(flame_y))
  )
  list(
    # Trident
    ggplot2::geom_path(data = shaft, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = prong_l, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = prong_c, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = prong_r, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = crossbar, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    # Flame
    ggplot2::geom_polygon(data = flame, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = col, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_conch_wheel: spiral conch shell with disc/wheel ────────────────
glyph_conch_wheel <- function(cx, cy, s, col, bright) {
  # Conch spiral (logarithmic spiral)
  t <- seq(0, 3 * pi, length.out = 60)
  r <- 3 * s + 8 * s * exp(t / (3 * pi))
  spiral <- data.frame(
    x = cx - 10 * s + r * cos(t),
    y = cy + 8 * s + r * sin(t)
  )
  # Wheel/disc (circle with spokes)
  wheel <- data.frame(x0 = cx + 6 * s, y0 = cy - 10 * s, r = 16 * s)
  # Eight spokes radiating from center
  spoke_angles <- seq(0, 2 * pi, length.out = 9)[-9]
  spoke_layers <- lapply(spoke_angles, function(a) {
    spoke <- data.frame(
      x = c(cx + 6 * s, cx + 6 * s + 14 * s * cos(a)),
      y = c(cy - 10 * s, cy - 10 * s + 14 * s * sin(a))
    )
    ggplot2::geom_path(data = spoke, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  })
  c(
    list(
      # Conch spiral
      ggplot2::geom_path(data = spiral, .aes(x, y),
        color = bright, linewidth = .lw(s, 2)),
      # Wheel outer circle
      ggforce::geom_circle(data = wheel, .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2)),
      # Inner hub
      ggforce::geom_circle(data = data.frame(x0 = cx + 6 * s, y0 = cy - 10 * s, r = 4 * s),
        .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
    ),
    spoke_layers
  )
}

# ── glyph_lotus_create: opening lotus flower with creation spark ─────────
glyph_lotus_create <- function(cx, cy, s, col, bright) {
  # Lotus petals (four layers)
  petal_angles <- seq(0, 2 * pi, length.out = 9)[-9]
  petals_outer <- lapply(petal_angles, function(a) {
    petal <- data.frame(
      x = cx + c(0, 14 * s * cos(a), 18 * s * cos(a)),
      y = cy + c(0, 14 * s * sin(a), 18 * s * sin(a))
    )
    ggplot2::geom_path(data = petal, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.8))
  })
  petals_inner <- lapply(petal_angles + pi / 8, function(a) {
    petal <- data.frame(
      x = cx + c(0, 10 * s * cos(a), 14 * s * cos(a)),
      y = cy + c(0, 10 * s * sin(a), 14 * s * sin(a))
    )
    ggplot2::geom_path(data = petal, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5))
  })
  # Creation spark (starburst at center)
  spark_angles <- seq(0, 2 * pi, length.out = 5)[-5]
  spark_rays <- lapply(spark_angles, function(a) {
    ray <- data.frame(
      x = c(cx, cx + 6 * s * cos(a)),
      y = c(cy, cy + 6 * s * sin(a))
    )
    ggplot2::geom_path(data = ray, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  })
  c(
    petals_outer,
    petals_inner,
    spark_rays,
    list(
      ggforce::geom_circle(data = data.frame(x0 = cx, y0 = cy, r = 4 * s),
        .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 2))
    )
  )
}

# ── glyph_checklist_thorough: detailed checklist with all items checked ──
glyph_checklist_thorough <- function(cx, cy, s, col, bright) {
  # Clipboard background
  board <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 24 * s, ymax = cy + 24 * s
  )
  # Clip at top
  clip <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 6 * s,
    ymin = cy + 22 * s, ymax = cy + 26 * s
  )
  # Five checklist items with checkboxes
  y_positions <- cy + c(14, 6, -2, -10, -18) * s
  checkbox_layers <- lapply(1:5, function(i) {
    box <- data.frame(
      xmin = cx - 14 * s, xmax = cx - 6 * s,
      ymin = y_positions[i] - 3 * s, ymax = y_positions[i] + 3 * s
    )
    check <- data.frame(
      x = c(cx - 12 * s, cx - 10 * s, cx - 7 * s),
      y = c(y_positions[i], y_positions[i] - 2 * s, y_positions[i] + 3 * s)
    )
    line <- data.frame(
      x = c(cx - 3 * s, cx + 14 * s),
      y = c(y_positions[i], y_positions[i])
    )
    list(
      ggplot2::geom_rect(data = box,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1)),
      ggplot2::geom_path(data = check, .aes(x, y),
        color = bright, linewidth = .lw(s, 2)),
      ggplot2::geom_path(data = line, .aes(x, y),
        color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2))
    )
  })
  c(
    list(
      ggplot2::geom_rect(data = board,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.06), color = bright, linewidth = .lw(s, 2)),
      ggplot2::geom_rect(data = clip,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5))
    ),
    unlist(checkbox_layers, recursive = FALSE)
  )
}

# ── glyph_mirror_truth: mirror/reflection with truth beam ────────────────
glyph_mirror_truth <- function(cx, cy, s, col, bright) {
  # Mirror frame (oval)
  mirror <- data.frame(x0 = cx, y0 = cy + 4 * s, r = 20 * s)
  # Handle below
  handle <- data.frame(
    xmin = cx - 3 * s, xmax = cx + 3 * s,
    ymin = cy - 24 * s, ymax = cy - 12 * s
  )
  # Truth beam (rays emanating from mirror)
  ray_angles <- seq(-pi / 3, -2 * pi / 3, length.out = 5)
  ray_layers <- lapply(ray_angles, function(a) {
    ray <- data.frame(
      x = c(cx, cx + 18 * s * cos(a)),
      y = c(cy + 4 * s, cy + 4 * s + 18 * s * sin(a))
    )
    ggplot2::geom_path(data = ray, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  })
  # Reflection hint (smaller oval inside)
  inner <- data.frame(x0 = cx, y0 = cy + 4 * s, r = 12 * s)
  c(
    list(
      # Mirror frame
      ggforce::geom_circle(data = mirror, .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2.5)),
      # Inner reflection
      ggforce::geom_circle(data = inner, .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, 0.2), color = col, linewidth = .lw(s, 1)),
      # Handle
      ggplot2::geom_rect(data = handle,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5))
    ),
    ray_layers
  )
}

# ══════════════════════════════════════════════════════════════════════════════
# Specialized skills glyphs (8)
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_radiant_star: radiant star emitting light rays ─────────────────
glyph_radiant_star <- function(cx, cy, s, col, bright) {
  # Five-pointed star
  star_angles <- seq(0, 2 * pi, length.out = 11)[-11]
  star_r <- ifelse(seq_along(star_angles) %% 2 == 1, 18 * s, 8 * s)
  star <- data.frame(
    x = cx + star_r * cos(star_angles - pi / 2),
    y = cy + star_r * sin(star_angles - pi / 2)
  )
  # Long rays between star points
  ray_angles <- seq(0, 2 * pi, length.out = 9)[-9]
  ray_layers <- lapply(ray_angles, function(a) {
    ray <- data.frame(
      x = c(cx + 20 * s * cos(a), cx + 32 * s * cos(a)),
      y = c(cy + 20 * s * sin(a), cy + 32 * s * sin(a))
    )
    ggplot2::geom_path(data = ray, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  })
  c(
    list(
      # Star
      ggplot2::geom_polygon(data = star, .aes(x, y),
        fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2.5)),
      # Center glow
      ggforce::geom_circle(data = data.frame(x0 = cx, y0 = cy, r = 6 * s),
        .aes(x0 = x0, y0 = y0, r = r),
        fill = hex_with_alpha(bright, 0.4), color = NA)
    ),
    ray_layers
  )
}

# ── glyph_dog_sit: dog in sit position with hand signal above ────────────
glyph_dog_sit <- function(cx, cy, s, col, bright) {
  # Dog body (sitting position, simple geometric shapes)
  # Head (circle)
  head <- data.frame(x0 = cx, y0 = cy + 8 * s, r = 8 * s)
  # Ears (triangles)
  ear_l <- data.frame(
    x = c(cx - 8 * s, cx - 4 * s, cx - 6 * s),
    y = c(cy + 16 * s, cy + 14 * s, cy + 10 * s)
  )
  ear_r <- data.frame(
    x = c(cx + 8 * s, cx + 4 * s, cx + 6 * s),
    y = c(cy + 16 * s, cy + 14 * s, cy + 10 * s)
  )
  # Body (rounded rectangle)
  body <- data.frame(
    xmin = cx - 10 * s, xmax = cx + 10 * s,
    ymin = cy - 16 * s, ymax = cy + 2 * s
  )
  # Front legs
  leg_l <- data.frame(
    xmin = cx - 8 * s, xmax = cx - 4 * s,
    ymin = cy - 22 * s, ymax = cy - 16 * s
  )
  leg_r <- data.frame(
    xmin = cx + 4 * s, xmax = cx + 8 * s,
    ymin = cy - 22 * s, ymax = cy - 16 * s
  )
  # Hand signal above (palm with fingers up)
  hand <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 6 * s,
    ymin = cy + 18 * s, ymax = cy + 24 * s
  )
  # Fingers (three lines)
  f1 <- data.frame(x = c(cx - 3 * s, cx - 3 * s), y = c(cy + 24 * s, cy + 28 * s))
  f2 <- data.frame(x = c(cx, cx), y = c(cy + 24 * s, cy + 30 * s))
  f3 <- data.frame(x = c(cx + 3 * s, cx + 3 * s), y = c(cy + 24 * s, cy + 28 * s))
  list(
    # Dog
    ggforce::geom_circle(data = head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_polygon(data = ear_l, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = ear_r, .aes(x, y),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = body,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.18), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = leg_l,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.22), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = leg_r,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.22), color = bright, linewidth = .lw(s, 1.5)),
    # Hand signal
    ggplot2::geom_rect(data = hand,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = f1, .aes(x, y), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = f2, .aes(x, y), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = f3, .aes(x, y), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_behavior_curve: bell curve transforming negative to positive ───
glyph_behavior_curve <- function(cx, cy, s, col, bright) {
  # Before curve (left side, skewed negative)
  t1 <- seq(-2, 2, length.out = 40)
  curve_before <- data.frame(
    x = cx - 20 * s + t1 * 4 * s,
    y = cy + 8 * s * exp(-((t1 + 0.8)^2) / 0.8)
  )
  # After curve (right side, centered positive)
  t2 <- seq(-2, 2, length.out = 40)
  curve_after <- data.frame(
    x = cx + 4 * s + t2 * 4 * s,
    y = cy + 14 * s * exp(-(t2^2) / 0.6)
  )
  # Arrow connecting transformation
  arrow <- data.frame(
    x = c(cx - 8 * s, cx + 2 * s),
    y = c(cy + 8 * s, cy + 12 * s)
  )
  arrow_head <- data.frame(
    x = c(cx - 2 * s, cx + 2 * s, cx),
    y = c(cy + 10 * s, cy + 12 * s, cy + 14 * s)
  )
  # Baseline
  baseline <- data.frame(
    x = c(cx - 28 * s, cx + 24 * s),
    y = c(cy - 10 * s, cy - 10 * s)
  )
  list(
    # Baseline
    ggplot2::geom_path(data = baseline, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    # Before curve (negative skew)
    ggplot2::geom_path(data = curve_before, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    # After curve (positive, centered)
    ggplot2::geom_path(data = curve_after, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    # Transformation arrow
    ggplot2::geom_path(data = arrow, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
}

# ── glyph_mushroom_cap: mushroom cap with gill lines underneath ──────────
glyph_mushroom_cap <- function(cx, cy, s, col, bright) {
  # Cap (dome/half-ellipse)
  t <- seq(0, pi, length.out = 40)
  cap <- data.frame(
    x = cx + 24 * s * cos(t),
    y = cy + 8 * s + 14 * s * sin(t)
  )
  # Stem
  stem <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 6 * s,
    ymin = cy - 24 * s, ymax = cy + 8 * s
  )
  # Gills under cap (radial lines)
  gill_x <- seq(cx - 20 * s, cx + 20 * s, length.out = 9)
  gill_layers <- lapply(gill_x, function(gx) {
    gill <- data.frame(
      x = c(gx, gx),
      y = c(cy + 8 * s, cy + 2 * s)
    )
    ggplot2::geom_path(data = gill, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  })
  c(
    list(
      # Stem
      ggplot2::geom_rect(data = stem,
        .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
        fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 1.5)),
      # Cap
      ggplot2::geom_polygon(data = cap, .aes(x, y),
        fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2))
    ),
    gill_layers
  )
}

# ── glyph_mycelium_net: network of mycelial threads with fruiting body ───
glyph_mycelium_net <- function(cx, cy, s, col, bright) {
  # Mycelial network (branching threads)
  # Main horizontal thread
  main <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy - 8 * s, cy - 8 * s)
  )
  # Branching threads
  b1 <- data.frame(
    x = c(cx - 16 * s, cx - 10 * s, cx - 14 * s),
    y = c(cy - 8 * s, cy - 2 * s, cy + 4 * s)
  )
  b2 <- data.frame(
    x = c(cx - 4 * s, cx + 2 * s, cx),
    y = c(cy - 8 * s, cy - 14 * s, cy - 20 * s)
  )
  b3 <- data.frame(
    x = c(cx + 8 * s, cx + 14 * s, cx + 18 * s),
    y = c(cy - 8 * s, cy - 2 * s, cy + 2 * s)
  )
  b4 <- data.frame(
    x = c(cx + 16 * s, cx + 20 * s),
    y = c(cy - 8 * s, cy - 16 * s)
  )
  # Fruiting body (small mushroom)
  fruit_cap <- data.frame(x0 = cx, y0 = cy + 16 * s, r = 10 * s)
  fruit_stem <- data.frame(
    xmin = cx - 2 * s, xmax = cx + 2 * s,
    ymin = cy + 6 * s, ymax = cy + 16 * s
  )
  list(
    # Mycelial threads
    ggplot2::geom_path(data = main, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = b1, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = b2, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = b3, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = b4, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    # Fruiting body
    ggplot2::geom_rect(data = fruit_stem,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = fruit_cap, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 2))
  )
}

# ── glyph_crystal_facets: crystal with geometric facets ───────────────────
glyph_crystal_facets <- function(cx, cy, s, col, bright) {
  # Hexagonal crystal with internal facet lines
  # Outer hexagon
  hex_angles <- seq(0, 2 * pi, length.out = 7)[-7]
  hex <- data.frame(
    x = cx + 22 * s * cos(hex_angles),
    y = cy + 22 * s * sin(hex_angles)
  )
  # Internal facet lines (from center to vertices)
  facet_layers <- lapply(hex_angles, function(a) {
    facet <- data.frame(
      x = c(cx, cx + 22 * s * cos(a)),
      y = c(cy, cy + 22 * s * sin(a))
    )
    ggplot2::geom_path(data = facet, .aes(x, y),
      color = col, linewidth = .lw(s, 1))
  })
  # Inner hexagon (smaller facet)
  inner_hex <- data.frame(
    x = cx + 10 * s * cos(hex_angles),
    y = cy + 10 * s * sin(hex_angles)
  )
  c(
    list(
      # Outer hexagon
      ggplot2::geom_polygon(data = hex, .aes(x, y),
        fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2.5)),
      # Inner hexagon
      ggplot2::geom_polygon(data = inner_hex, .aes(x, y),
        fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
    ),
    facet_layers
  )
}

# ── glyph_pan_nugget: gold pan with water ripples and nugget ─────────────
glyph_pan_nugget <- function(cx, cy, s, col, bright) {
  # Pan (shallow bowl, side view)
  t <- seq(0, pi, length.out = 40)
  pan <- data.frame(
    x = cx + 24 * s * cos(t),
    y = cy - 8 * s + 6 * s * sin(t)
  )
  # Pan rim (top edge)
  rim <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy - 8 * s, cy - 8 * s)
  )
  # Water ripples inside pan
  w1 <- data.frame(
    x = cx + seq(-18, 18, length.out = 20) * s,
    y = cy - 6 * s + 2 * s * sin(seq(0, 2 * pi, length.out = 20))
  )
  w2 <- data.frame(
    x = cx + seq(-14, 14, length.out = 20) * s,
    y = cy - 10 * s + 1.5 * s * sin(seq(0, 2 * pi, length.out = 20))
  )
  # Gold nugget at bottom (irregular shape)
  nugget <- data.frame(
    x = cx + c(-3, -1, 2, 4, 3, 0, -2) * s,
    y = cy + c(-14, -12, -11, -13, -15, -16, -15) * s
  )
  list(
    # Pan
    ggplot2::geom_polygon(data = pan, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = rim, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    # Water ripples
    ggplot2::geom_path(data = w1, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = w2, .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1)),
    # Gold nugget
    ggplot2::geom_polygon(data = nugget, .aes(x, y),
      fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.8))
  )
}

# ── glyph_fibre_sheet: textured paper sheet with plant fibres ────────────
glyph_fibre_sheet <- function(cx, cy, s, col, bright) {
  # Paper sheet (rectangle with slight curve)
  sheet <- data.frame(
    xmin = cx - 20 * s, xmax = cx + 20 * s,
    ymin = cy - 24 * s, ymax = cy + 20 * s
  )
  # Wavy top edge (handmade paper)
  t <- seq(0, 1, length.out = 20)
  wavy_top <- data.frame(
    x = cx - 20 * s + 40 * s * t,
    y = cy + 20 * s + 2 * s * sin(t * 6 * pi)
  )
  # Plant fibres (irregular lines throughout)
  f1 <- data.frame(
    x = cx + c(-14, -8, -4, 2) * s,
    y = cy + c(12, 8, 10, 6) * s
  )
  f2 <- data.frame(
    x = cx + c(10, 14, 16) * s,
    y = cy + c(14, 8, 4) * s
  )
  f3 <- data.frame(
    x = cx + c(-16, -10, -6) * s,
    y = cy + c(-4, -8, -6) * s
  )
  f4 <- data.frame(
    x = cx + c(4, 8, 12, 16) * s,
    y = cy + c(-2, -6, -4, -8) * s
  )
  f5 <- data.frame(
    x = cx + c(-8, -2, 4) * s,
    y = cy + c(-14, -18, -16) * s
  )
  list(
    # Sheet base
    ggplot2::geom_rect(data = sheet,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    # Wavy top edge
    ggplot2::geom_path(data = wavy_top, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    # Plant fibres
    ggplot2::geom_path(data = f1, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = f2, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = f3, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = f4, .aes(x, y),
      color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = f5, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.2))
  )
}

# ── glyph_card_catalog: index card with tabbed dividers ────────────────
glyph_card_catalog <- function(cx, cy, s, col, bright) {
  # Main card (rectangle)
  card <- data.frame(
    xmin = cx - 18 * s, xmax = cx + 18 * s,
    ymin = cy - 22 * s, ymax = cy + 16 * s
  )
  # Horizontal rule lines on card
  lines <- lapply(c(8, 2, -4, -10, -16) * s, function(yoff) {
    data.frame(
      x = c(cx - 14 * s, cx + 14 * s),
      y = c(cy + yoff, cy + yoff)
    )
  })
  # Tab dividers along right edge (3 tabs sticking out)
  tab1 <- data.frame(
    xmin = cx + 18 * s, xmax = cx + 24 * s,
    ymin = cy + 10 * s, ymax = cy + 16 * s
  )
  tab2 <- data.frame(
    xmin = cx + 18 * s, xmax = cx + 24 * s,
    ymin = cy + 0 * s,  ymax = cy + 6 * s
  )
  tab3 <- data.frame(
    xmin = cx + 18 * s, xmax = cx + 24 * s,
    ymin = cy - 10 * s, ymax = cy - 4 * s
  )
  list(
    # Card base
    ggplot2::geom_rect(data = card,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2)),
    # Rule lines
    ggplot2::geom_path(data = lines[[1]], .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = lines[[2]], .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = lines[[3]], .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = lines[[4]], .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 0.8)),
    ggplot2::geom_path(data = lines[[5]], .aes(x, y),
      color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 0.8)),
    # Tabs
    ggplot2::geom_rect(data = tab1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = tab2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = tab3,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_book_repair: book with protective binding wrap ───────────────
glyph_book_repair <- function(cx, cy, s, col, bright) {
  # Book spine (left edge)
  spine <- data.frame(
    xmin = cx - 20 * s, xmax = cx - 14 * s,
    ymin = cy - 24 * s, ymax = cy + 24 * s
  )
  # Book cover (main rectangle)
  cover <- data.frame(
    xmin = cx - 14 * s, xmax = cx + 16 * s,
    ymin = cy - 24 * s, ymax = cy + 24 * s
  )
  # Protective wrap bands (horizontal stripes across book)
  band1 <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 18 * s,
    ymin = cy + 14 * s, ymax = cy + 18 * s
  )
  band2 <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 18 * s,
    ymin = cy - 2 * s,  ymax = cy + 2 * s
  )
  band3 <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 18 * s,
    ymin = cy - 18 * s, ymax = cy - 14 * s
  )
  # Small shield symbol on cover (preservation mark)
  shield <- data.frame(
    x = cx + 1 * s + c(-6, 0, 6, 6, 3, 0, -3, -6) * s,
    y = cy + c(6, 10, 6, 0, -6, -8, -6, 0) * s
  )
  list(
    # Book cover
    ggplot2::geom_rect(data = cover,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5)),
    # Spine
    ggplot2::geom_rect(data = spine,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 2)),
    # Protective bands
    ggplot2::geom_rect(data = band1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = band2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = band3,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 1.2)),
    # Preservation shield
    ggplot2::geom_polygon(data = shield, .aes(x, y),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_bookshelf: organized shelf with selection arrow ──────────────
glyph_bookshelf <- function(cx, cy, s, col, bright) {
  # Shelf base (horizontal line)
  shelf <- data.frame(
    xmin = cx - 26 * s, xmax = cx + 26 * s,
    ymin = cy - 24 * s, ymax = cy - 22 * s
  )
  # Books on shelf (varying heights and widths)
  b1 <- data.frame(xmin = cx - 24 * s, xmax = cx - 18 * s,
                    ymin = cy - 22 * s, ymax = cy + 10 * s)
  b2 <- data.frame(xmin = cx - 16 * s, xmax = cx - 12 * s,
                    ymin = cy - 22 * s, ymax = cy + 16 * s)
  b3 <- data.frame(xmin = cx - 10 * s, xmax = cx - 4 * s,
                    ymin = cy - 22 * s, ymax = cy + 6 * s)
  b4 <- data.frame(xmin = cx - 2 * s,  xmax = cx + 4 * s,
                    ymin = cy - 22 * s, ymax = cy + 14 * s)
  b5 <- data.frame(xmin = cx + 6 * s,  xmax = cx + 10 * s,
                    ymin = cy - 22 * s, ymax = cy + 8 * s)
  b6 <- data.frame(xmin = cx + 12 * s, xmax = cx + 18 * s,
                    ymin = cy - 22 * s, ymax = cy + 18 * s)
  # Selection arrow (pointing at one book, indicating curation)
  arrow <- data.frame(
    x = cx + c(22, 22, 26, 20, 14, 18, 18) * s,
    y = cy + c(20, 24, 18, 12, 18, 24, 20) * s
  )
  list(
    # Shelf
    ggplot2::geom_rect(data = shelf,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 2)),
    # Books (varying opacity for visual variety)
    ggplot2::geom_rect(data = b1,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = b2,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = b3,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = b4,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.8)),
    ggplot2::geom_rect(data = b5,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.2)),
    ggplot2::geom_rect(data = b6,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    # Selection arrow
    ggplot2::geom_polygon(data = arrow, .aes(x, y),
      fill = hex_with_alpha(bright, 0.35), color = bright, linewidth = .lw(s, 1.5))
  )
}
