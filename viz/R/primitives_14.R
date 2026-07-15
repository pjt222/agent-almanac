# primitives_14.R - Glyph library part 14: entomology skill glyphs (5)
# Sourced by build-icons.R and profile-render.R

# ══════════════════════════════════════════════════════════════════════════════
# Entomology skills (5)
# ══════════════════════════════════════════════════════════════════════════════

glyph_insect_camera <- function(cx, cy, s, col, bright) {
  # Camera lens with insect silhouette inside — for document-insect-sighting
  # Camera body
  body <- data.frame(
    xmin = cx - 20 * s, xmax = cx + 20 * s,
    ymin = cy - 14 * s, ymax = cy + 10 * s
  )
  # Lens circle
  lens <- data.frame(x0 = cx, y0 = cy - 2 * s, r = 10 * s)
  # Flash bump on top
  flash <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 6 * s,
    ymin = cy + 10 * s, ymax = cy + 16 * s
  )
  # Simplified insect in lens (6 legs radiating from body dot)
  bug <- data.frame(x0 = cx, y0 = cy - 2 * s, r = 2 * s)
  legs <- list()
  angles <- c(pi/6, pi/2, 5*pi/6, 7*pi/6, 3*pi/2, 11*pi/6)
  for (a in angles) {
    legs[[length(legs) + 1]] <- data.frame(
      x = c(cx + 2 * s * cos(a), cx + 7 * s * cos(a)),
      y = c(cy - 2 * s + 2 * s * sin(a), cy - 2 * s + 7 * s * sin(a))
    )
  }
  layers <- list(
    ggplot2::geom_rect(data = body, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = flash, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = lens, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.08), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = bug, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1))
  )
  for (leg in legs) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = leg, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.2))
  }
  layers
}

glyph_insect_key <- function(cx, cy, s, col, bright) {
  # Dichotomous key branching tree with insect at top — for identify-insect
  # Insect body at top (oval + head + antennae)
  thorax <- data.frame(x0 = cx, y0 = cy + 16 * s, r = 5 * s)
  head_c <- data.frame(x0 = cx, y0 = cy + 22 * s, r = 3 * s)
  ant_l <- data.frame(x = c(cx - 2 * s, cx - 8 * s), y = c(cy + 24 * s, cy + 28 * s))
  ant_r <- data.frame(x = c(cx + 2 * s, cx + 8 * s), y = c(cy + 24 * s, cy + 28 * s))
  # Key branching lines (binary tree)
  stem <- data.frame(x = c(cx, cx), y = c(cy + 11 * s, cy + 4 * s))
  br_l <- data.frame(x = c(cx, cx - 14 * s), y = c(cy + 4 * s, cy - 4 * s))
  br_r <- data.frame(x = c(cx, cx + 14 * s), y = c(cy + 4 * s, cy - 4 * s))
  # Second level branches
  br_ll <- data.frame(x = c(cx - 14 * s, cx - 22 * s), y = c(cy - 4 * s, cy - 12 * s))
  br_lr <- data.frame(x = c(cx - 14 * s, cx - 6 * s), y = c(cy - 4 * s, cy - 12 * s))
  br_rl <- data.frame(x = c(cx + 14 * s, cx + 6 * s), y = c(cy - 4 * s, cy - 12 * s))
  br_rr <- data.frame(x = c(cx + 14 * s, cx + 22 * s), y = c(cy - 4 * s, cy - 12 * s))
  # Terminal nodes
  nodes <- data.frame(
    x0 = cx + c(-22, -6, 6, 22) * s,
    y0 = rep(cy - 12 * s, 4),
    r = rep(3 * s, 4)
  )
  list(
    ggforce::geom_circle(data = thorax, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = head_c, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = ant_l, .aes(x, y), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = ant_r, .aes(x, y), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_path(data = stem, .aes(x, y), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = br_l, .aes(x, y), color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = br_r, .aes(x, y), color = col, linewidth = .lw(s, 1.8)),
    ggplot2::geom_path(data = br_ll, .aes(x, y), color = hex_with_alpha(col, 0.7), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = br_lr, .aes(x, y), color = hex_with_alpha(col, 0.7), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = br_rl, .aes(x, y), color = hex_with_alpha(col, 0.7), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = br_rr, .aes(x, y), color = hex_with_alpha(col, 0.7), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = nodes, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.2))
  )
}

glyph_insect_watch <- function(cx, cy, s, col, bright) {
  # Eye with clock overlay — for observe-insect-behavior
  # Eye shape (almond)
  t_top <- seq(0, pi, length.out = 30)
  t_bot <- seq(pi, 2 * pi, length.out = 30)
  eye_top <- data.frame(
    x = cx + 22 * s * cos(t_top),
    y = cy + 10 * s * sin(t_top)
  )
  eye_bot <- data.frame(
    x = cx + 22 * s * cos(t_bot),
    y = cy + 10 * s * sin(t_bot)
  )
  # Iris
  iris_c <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  # Pupil
  pupil <- data.frame(x0 = cx, y0 = cy, r = 4 * s)
  # Clock hands inside pupil
  hour_hand <- data.frame(x = c(cx, cx + 2 * s), y = c(cy, cy + 3 * s))
  min_hand <- data.frame(x = c(cx, cx - 1 * s), y = c(cy, cy - 3 * s))
  # Tick marks around iris (behavioral time markers)
  ticks <- list()
  for (a in seq(0, 2 * pi - pi/6, by = pi/3)) {
    ticks[[length(ticks) + 1]] <- data.frame(
      x = c(cx + 11 * s * cos(a), cx + 14 * s * cos(a)),
      y = c(cy + 11 * s * sin(a), cy + 14 * s * sin(a))
    )
  }
  layers <- list(
    ggplot2::geom_path(data = eye_top, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = eye_bot, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = iris_c, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = pupil, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.25), color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_path(data = hour_hand, .aes(x, y),
      color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = min_hand, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  )
  for (tick in ticks) {
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = tick, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1))
  }
  layers
}

glyph_insect_pin <- function(cx, cy, s, col, bright) {
  # Insect on mounting pin — for collect-preserve-specimens
  # Pin shaft (vertical)
  pin <- data.frame(x = c(cx, cx), y = c(cy - 22 * s, cy + 8 * s))
  # Pin head (small circle at top)
  pin_head <- data.frame(x0 = cx, y0 = cy + 10 * s, r = 3 * s)
  # Insect body (horizontal oval on pin)
  thorax <- data.frame(x0 = cx, y0 = cy, r0 = 8 * s, r1 = 4 * s, angle = 0)
  # Abdomen (below thorax)
  abdomen <- data.frame(x0 = cx, y0 = cy - 6 * s, r0 = 6 * s, r1 = 3 * s, angle = 0)
  # Head (above thorax)
  head_c <- data.frame(x0 = cx, y0 = cy + 5 * s, r = 3 * s)
  # Wings (two triangular shapes)
  wing_l <- data.frame(
    x = cx + c(-4, -20, -6) * s,
    y = cy + c(2, 6, -2) * s
  )
  wing_r <- data.frame(
    x = cx + c(4, 20, 6) * s,
    y = cy + c(2, 6, -2) * s
  )
  # Label below pin
  label <- data.frame(
    xmin = cx - 10 * s, xmax = cx + 10 * s,
    ymin = cy - 26 * s, ymax = cy - 20 * s
  )
  list(
    ggplot2::geom_path(data = pin, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = pin_head, .aes(x0 = x0, y0 = y0, r = r),
      fill = bright, color = bright, linewidth = .lw(s, 1)),
    ggplot2::geom_polygon(data = wing_l, .aes(x, y),
      fill = hex_with_alpha(bright, 0.12), color = bright, linewidth = .lw(s, 1.2)),
    ggplot2::geom_polygon(data = wing_r, .aes(x, y),
      fill = hex_with_alpha(bright, 0.12), color = bright, linewidth = .lw(s, 1.2)),
    ggforce::geom_ellipse(data = thorax, .aes(x0 = x0, y0 = y0, a = r0, b = r1, angle = angle),
      fill = hex_with_alpha(col, 0.2), color = col, linewidth = .lw(s, 1.8)),
    ggforce::geom_ellipse(data = abdomen, .aes(x0 = x0, y0 = y0, a = r0, b = r1, angle = angle),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = head_c, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.25), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_rect(data = label, .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.1), color = bright, linewidth = .lw(s, 1))
  )
}

glyph_insect_survey <- function(cx, cy, s, col, bright) {
  # Grid with dot-density pattern + chart line — for survey-insect-population
  # Survey grid (4x3 cells)
  layers <- list()
  for (i in 0:4) {
    vline <- data.frame(
      x = c(cx + (i * 10 - 20) * s, cx + (i * 10 - 20) * s),
      y = c(cy - 12 * s, cy + 18 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = vline, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 0.8))
  }
  for (j in 0:3) {
    hline <- data.frame(
      x = c(cx - 20 * s, cx + 20 * s),
      y = c(cy + (j * 10 - 12) * s, cy + (j * 10 - 12) * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = hline, .aes(x, y),
      color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 0.8))
  }
  # Dot-density insects in grid cells (varying densities)
  set.seed(57)
  dots <- data.frame(
    x = cx + runif(12, -18, 18) * s,
    y = cy + runif(12, -10, 16) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_point(data = dots, .aes(x, y),
    color = bright, size = 2.5 * s)
  # Diversity curve below grid
  t_curve <- seq(-1, 1, length.out = 20)
  curve_df <- data.frame(
    x = cx + t_curve * 18 * s,
    y = cy - 18 * s + 6 * s * exp(-2 * t_curve^2)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = curve_df, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))
  layers
}
