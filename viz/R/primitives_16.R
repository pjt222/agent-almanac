# primitives_16.R - Glyph library part 16: analytical chemistry skills (11)
# Sourced by build-icons.R
# Domains: spectroscopy (6), chromatography (5)

# ══════════════════════════════════════════════════════════════════════════════
# Spectroscopy skills (6)
# ══════════════════════════════════════════════════════════════════════════════

glyph_nmr_spectrum <- function(cx, cy, s, col, bright) {
  # NMR splitting pattern: triplet peaks with TMS reference
  # Horizontal baseline
  baseline <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy - 16 * s, cy - 16 * s)
  )
  # Triplet peaks in center region (three peaks with splitting)
  peak_positions <- c(-6, 0, 6)
  peak_heights   <- c(18, 24, 18)
  layers <- list(
    ggplot2::geom_path(data = baseline, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
  )
  for (i in seq_along(peak_positions)) {
    t_peak <- seq(-1, 1, length.out = 30)
    pk <- data.frame(
      x = cx + (peak_positions[i] + t_peak * 2.5) * s,
      y = cy - 16 * s + peak_heights[i] * s * exp(-4 * t_peak^2)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pk, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  }
  # TMS reference peak (small, far right)
  t_tms <- seq(-1, 1, length.out = 20)
  tms <- data.frame(
    x = cx + (18 + t_tms * 1.5) * s,
    y = cy - 16 * s + 8 * s * exp(-5 * t_tms^2)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = tms, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5))
  # Faint outer frame circle to tie composition together
  frame <- data.frame(x0 = cx, y0 = cy, r = 26 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = frame,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.04), color = hex_with_alpha(col, 0.15),
    linewidth = .lw(s, 0.8))
  layers
}

glyph_ir_spectrum <- function(cx, cy, s, col, bright) {
  # IR absorption spectrum: inverted peaks (dips) with fingerprint region
  # Top baseline (transmittance = 100%)
  baseline <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy + 14 * s, cy + 14 * s)
  )
  # Broad absorption dip (left region, e.g. O-H stretch)
  t_broad <- seq(-1, 1, length.out = 40)
  broad_dip <- data.frame(
    x = cx + (-12 + t_broad * 8) * s,
    y = cy + 14 * s - 22 * s * exp(-2.5 * t_broad^2)
  )
  # Fingerprint region: several sharp narrow dips (right region)
  fp_positions <- c(6, 10, 13, 16, 19)
  fp_depths    <- c(10, 14, 8, 12, 6)
  layers <- list(
    ggplot2::geom_path(data = baseline, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = broad_dip, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.2))
  )
  for (i in seq_along(fp_positions)) {
    t_fp <- seq(-1, 1, length.out = 20)
    dip <- data.frame(
      x = cx + (fp_positions[i] + t_fp * 1.2) * s,
      y = cy + 14 * s - fp_depths[i] * s * exp(-4 * t_fp^2)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = dip, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.5))
  }
  # Faint background fill under baseline
  bg <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 24 * s,
    ymin = cy - 14 * s, ymax = cy + 14 * s
  )
  layers <- c(
    list(ggplot2::geom_rect(data = bg,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.04), color = NA)),
    layers
  )
  layers
}

glyph_mass_spectrum <- function(cx, cy, s, col, bright) {
  # Mass spectrum: vertical bars of varying height (m/z fragments)
  # Horizontal baseline at bottom
  baseline <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy - 16 * s, cy - 16 * s)
  )
  # Fragment bars: x positions, heights
  bar_x       <- c(-16, -10, -4, 2, 8, 14, 20)
  bar_heights <- c(12, 20, 8, 30, 16, 6, 10)
  layers <- list(
    ggplot2::geom_path(data = baseline, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
  )
  for (i in seq_along(bar_x)) {
    bar <- data.frame(
      x = c(cx + bar_x[i] * s, cx + bar_x[i] * s),
      y = c(cy - 16 * s, cy - 16 * s + bar_heights[i] * s)
    )
    is_base <- bar_heights[i] == max(bar_heights)
    lw_val <- if (is_base) 3 else 2
    clr <- if (is_base) bright else hex_with_alpha(bright, 0.7)
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bar, .aes(x, y),
      color = clr, linewidth = .lw(s, lw_val))
  }
  # Molecular ion peak marker (small dot at top of rightmost bar)
  mol_ion <- data.frame(x0 = cx + 20 * s, y0 = cy - 16 * s + 10 * s, r = 2 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = mol_ion,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.5), color = bright, linewidth = .lw(s, 1))
  # Axis label arrow (horizontal, indicating m/z)
  arrow_line <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy - 20 * s, cy - 20 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = arrow_line, .aes(x, y),
    color = hex_with_alpha(col, 0.5), linewidth = .lw(s, 1),
    arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed"))
  layers
}

glyph_uv_vis_spectrum <- function(cx, cy, s, col, bright) {
  # UV-Vis absorption: smooth gaussian curve with lambda-max indicator
  # Gaussian absorption curve
  t_curve <- seq(-2.5, 2.5, length.out = 50)
  curve_df <- data.frame(
    x = cx + t_curve * 9 * s,
    y = cy - 14 * s + 28 * s * exp(-0.8 * t_curve^2)
  )
  # Lambda-max vertical indicator at peak
  lmax_line <- data.frame(
    x = c(cx, cx),
    y = c(cy + 16 * s, cy + 20 * s)
  )
  # Small downward arrow at peak
  lmax_arrow <- data.frame(
    x = cx + c(-3, 0, 3) * s,
    y = cy + c(20, 16, 20) * s
  )
  # Baseline extending both sides
  baseline_l <- data.frame(
    x = c(cx - 24 * s, cx - 22 * s),
    y = c(cy - 14 * s, cy - 14 * s)
  )
  baseline_r <- data.frame(
    x = c(cx + 22 * s, cx + 24 * s),
    y = c(cy - 14 * s, cy - 14 * s)
  )
  # Gentle fill under curve
  fill_pts <- rbind(
    data.frame(x = cx - 22.5 * s, y = cy - 14 * s),
    curve_df,
    data.frame(x = cx + 22.5 * s, y = cy - 14 * s)
  )
  list(
    ggplot2::geom_polygon(data = fill_pts, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = NA),
    ggplot2::geom_path(data = curve_df, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = baseline_l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = baseline_r, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = lmax_line, .aes(x, y),
      color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = lmax_arrow, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  )
}

glyph_raman_spectrum <- function(cx, cy, s, col, bright) {
  # Raman scattering: central sample with incident and scattered rays
  # Central sample circle
  sample_c <- data.frame(x0 = cx, y0 = cy, r = 5 * s)
  sample_glow <- data.frame(x0 = cx, y0 = cy, r = 8 * s)
  # Incident light ray from left
  incident <- data.frame(
    x = c(cx - 24 * s, cx - 6 * s),
    y = c(cy, cy)
  )
  # Scattered rays at various angles with differing alpha (Stokes/anti-Stokes)
  scatter_angles <- c(pi/6, pi/3, pi/2, 2*pi/3, 5*pi/6,
                      -pi/6, -pi/3, -pi/2)
  scatter_alphas <- c(0.8, 0.6, 0.9, 0.5, 0.3,
                      0.4, 0.3, 0.5)
  scatter_lens   <- c(18, 16, 20, 15, 14,
                      14, 12, 16)
  layers <- list(
    ggforce::geom_circle(data = sample_glow, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.06), color = hex_with_alpha(col, 0.2),
      linewidth = .lw(s, 1)),
    ggforce::geom_circle(data = sample_c, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.2), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = incident, .aes(x, y),
      color = col, linewidth = .lw(s, 2),
      arrow = ggplot2::arrow(length = ggplot2::unit(4 * s, "pt"), type = "closed"))
  )
  for (i in seq_along(scatter_angles)) {
    ang <- scatter_angles[i]
    ray_len <- scatter_lens[i] * s
    ray <- data.frame(
      x = c(cx + 6 * s * cos(ang), cx + ray_len * cos(ang)),
      y = c(cy + 6 * s * sin(ang), cy + ray_len * sin(ang))
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = ray, .aes(x, y),
      color = hex_with_alpha(bright, scatter_alphas[i]),
      linewidth = .lw(s, 1.2 + scatter_alphas[i] * 0.8))
  }
  layers
}

glyph_spectroscopic_plan <- function(cx, cy, s, col, bright) {
  # Clipboard with technique checklist
  # Clipboard body (rectangle)
  board <- data.frame(
    xmin = cx - 16 * s, xmax = cx + 16 * s,
    ymin = cy - 22 * s, ymax = cy + 16 * s
  )
  # Clip at top center (arc + small rectangle)
  clip_rect <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 6 * s,
    ymin = cy + 14 * s, ymax = cy + 22 * s
  )
  clip_circle <- data.frame(x0 = cx, y0 = cy + 22 * s, r = 5 * s)
  # Checklist lines (4 items)
  check_y <- c(8, 0, -8, -16)
  layers <- list(
    ggplot2::geom_rect(data = board,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.06), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = clip_rect,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 1.5)),
    ggforce::geom_circle(data = clip_circle, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.1), color = col, linewidth = .lw(s, 1.5))
  )
  for (i in seq_along(check_y)) {
    # Checkmark (small V shape)
    chk <- data.frame(
      x = cx + c(-12, -10, -7) * s,
      y = cy + (check_y[i] + c(1, -1, 2)) * s
    )
    # Horizontal line (technique name placeholder)
    line <- data.frame(
      x = c(cx - 4 * s, cx + 12 * s),
      y = c(cy + check_y[i] * s, cy + check_y[i] * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = chk, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.8))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.5))
  }
  layers
}

# ══════════════════════════════════════════════════════════════════════════════
# Chromatography skills (5)
# ══════════════════════════════════════════════════════════════════════════════

glyph_gc_column <- function(cx, cy, s, col, bright) {
  # Gas chromatography coiled column with FID flame
  # Coiled column (zigzag pattern viewed from side)
  coil_x_left  <- cx - 8 * s
  coil_x_right <- cx + 8 * s
  coil_pts <- list()
  n_coils <- 6
  for (i in seq_len(n_coils)) {
    y_pos <- cy + 20 * s - (i - 1) * 7 * s
    side <- if (i %% 2 == 1) coil_x_left else coil_x_right
    coil_pts[[i]] <- c(side, y_pos)
  }
  coil_df <- data.frame(
    x = sapply(coil_pts, `[`, 1),
    y = sapply(coil_pts, `[`, 2)
  )
  # Inlet at top
  inlet <- data.frame(
    x = c(coil_df$x[1], coil_df$x[1]),
    y = c(coil_df$y[1], coil_df$y[1] + 5 * s)
  )
  # Flow arrow along column
  flow_arrow <- data.frame(
    x = c(cx, cx),
    y = c(cy + 24 * s, cy + 18 * s)
  )
  # FID flame at detector end (bottom)
  flame_base_y <- coil_df$y[n_coils] - 3 * s
  flame <- data.frame(
    x = cx + c(-4, 0, 4) * s,
    y = flame_base_y + c(0, 8, 0) * s
  )
  flame_inner <- data.frame(
    x = cx + c(-2, 0, 2) * s,
    y = flame_base_y + c(0, 5, 0) * s
  )
  # Detector housing (small circle)
  detector <- data.frame(x0 = cx, y0 = flame_base_y - 2 * s, r = 5 * s)
  list(
    ggforce::geom_circle(data = detector, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.08), color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = coil_df, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = inlet, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = flow_arrow, .aes(x, y),
      color = hex_with_alpha(col, 0.6), linewidth = .lw(s, 1.5),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed")),
    ggplot2::geom_polygon(data = flame, .aes(x, y),
      fill = hex_with_alpha(bright, 0.3), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_polygon(data = flame_inner, .aes(x, y),
      fill = hex_with_alpha(bright, 0.6), color = NA)
  )
}

glyph_hplc_system <- function(cx, cy, s, col, bright) {
  # HPLC flow schematic: pump -> column -> detector
  # Pump (small rectangle, left)
  pump <- data.frame(
    xmin = cx - 24 * s, xmax = cx - 14 * s,
    ymin = cy - 6 * s, ymax = cy + 6 * s
  )
  # Column (taller rectangle, center)
  column <- data.frame(
    xmin = cx - 5 * s, xmax = cx + 5 * s,
    ymin = cy - 12 * s, ymax = cy + 12 * s
  )
  # Detector (circle, right)
  detector <- data.frame(x0 = cx + 18 * s, y0 = cy, r = 6 * s)
  # Connecting lines (flow path)
  line_pump_col <- data.frame(
    x = c(cx - 14 * s, cx - 5 * s),
    y = c(cy, cy)
  )
  line_col_det <- data.frame(
    x = c(cx + 5 * s, cx + 12 * s),
    y = c(cy, cy)
  )
  # Flow arrows
  flow_1 <- data.frame(
    x = c(cx - 14 * s, cx - 8 * s),
    y = c(cy + 10 * s, cy + 10 * s)
  )
  flow_2 <- data.frame(
    x = c(cx + 6 * s, cx + 12 * s),
    y = c(cy + 10 * s, cy + 10 * s)
  )
  # Column packing lines (horizontal stripes inside column)
  layers <- list(
    ggplot2::geom_rect(data = pump,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.12), color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_rect(data = column,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.08), color = bright, linewidth = .lw(s, 2)),
    ggforce::geom_circle(data = detector, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.12), color = bright, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = line_pump_col, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = line_col_det, .aes(x, y),
      color = col, linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = flow_1, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.2),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed")),
    ggplot2::geom_path(data = flow_2, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.2),
      arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed"))
  )
  # Packing detail inside column (3 horizontal lines)
  for (yoff in c(-6, 0, 6)) {
    pline <- data.frame(
      x = c(cx - 4 * s, cx + 4 * s),
      y = c(cy + yoff * s, cy + yoff * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pline, .aes(x, y),
      color = hex_with_alpha(bright, 0.3), linewidth = .lw(s, 0.8))
  }
  layers
}

glyph_chromatogram <- function(cx, cy, s, col, bright) {
  # Resolved chromatographic peaks on baseline
  # Horizontal baseline
  baseline <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy - 14 * s, cy - 14 * s)
  )
  # Three well-resolved gaussian peaks
  peak_centers <- c(-12, 2, 16)
  peak_heights <- c(18, 26, 14)
  peak_widths  <- c(3.0, 2.5, 2.0)
  layers <- list(
    ggplot2::geom_path(data = baseline, .aes(x, y),
      color = col, linewidth = .lw(s, 2))
  )
  for (i in seq_along(peak_centers)) {
    t_pk <- seq(-3, 3, length.out = 40)
    pk <- data.frame(
      x = cx + (peak_centers[i] + t_pk * peak_widths[i]) * s,
      y = cy - 14 * s + peak_heights[i] * s * exp(-0.5 * t_pk^2)
    )
    # Filled area under peak
    fill_df <- rbind(
      data.frame(x = pk$x[1], y = cy - 14 * s),
      pk,
      data.frame(x = pk$x[nrow(pk)], y = cy - 14 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = fill_df,
      .aes(x, y),
      fill = hex_with_alpha(col, 0.06 + i * 0.02), color = NA)
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pk, .aes(x, y),
      color = bright, linewidth = .lw(s, 2))
  }
  # Time axis arrow
  time_arrow <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(cy - 18 * s, cy - 18 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = time_arrow, .aes(x, y),
    color = hex_with_alpha(col, 0.4), linewidth = .lw(s, 1),
    arrow = ggplot2::arrow(length = ggplot2::unit(3 * s, "pt"), type = "closed"))
  layers
}

glyph_separation_fix <- function(cx, cy, s, col, bright) {
  # Two overlapping peaks with wrench overlay (troubleshooting)
  # Baseline
  baseline <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy - 12 * s, cy - 12 * s)
  )
  # Two overlapping gaussian peaks (poor resolution)
  t_pk <- seq(-3, 3, length.out = 50)
  peak1 <- data.frame(
    x = cx + (-4 + t_pk * 3.5) * s,
    y = cy - 12 * s + 22 * s * exp(-0.5 * t_pk^2)
  )
  peak2 <- data.frame(
    x = cx + (5 + t_pk * 3.5) * s,
    y = cy - 12 * s + 18 * s * exp(-0.5 * t_pk^2)
  )
  # Wrench overlay (simplified outline)
  # Wrench handle (diagonal line)
  wrench_handle <- data.frame(
    x = c(cx + 6 * s, cx + 20 * s),
    y = c(cy + 4 * s, cy + 18 * s)
  )
  # Wrench jaw (open-end, two short lines at end)
  jaw_l <- data.frame(
    x = c(cx + 4 * s, cx + 2 * s),
    y = c(cy + 6 * s, cy + 2 * s)
  )
  jaw_r <- data.frame(
    x = c(cx + 8 * s, cx + 10 * s),
    y = c(cy + 2 * s, cy + 6 * s)
  )
  # Wrench head circle
  wrench_head <- data.frame(x0 = cx + 20 * s, y0 = cy + 18 * s, r = 4 * s)
  list(
    ggplot2::geom_path(data = baseline, .aes(x, y),
      color = col, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = peak1, .aes(x, y),
      color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = peak2, .aes(x, y),
      color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 2)),
    ggplot2::geom_path(data = wrench_handle, .aes(x, y),
      color = col, linewidth = .lw(s, 3)),
    ggplot2::geom_path(data = jaw_l, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = jaw_r, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggforce::geom_circle(data = wrench_head, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 1.5))
  )
}

glyph_method_validation <- function(cx, cy, s, col, bright) {
  # Shield with checkmark and ICH badge
  # Shield outline (pointed at bottom, curved shoulders at top)
  t_top <- seq(0, pi, length.out = 20)
  shield_top <- data.frame(
    x = cx + 20 * s * cos(t_top),
    y = cy + 12 * s + 6 * s * sin(t_top)
  )
  shield_sides <- data.frame(
    x = c(cx + 20 * s, cx + 16 * s, cx, cx - 16 * s, cx - 20 * s),
    y = c(cy + 12 * s, cy - 6 * s, cy - 22 * s, cy - 6 * s, cy + 12 * s)
  )
  # Full shield path (top arc + sides + point)
  shield_path <- rbind(shield_top, shield_sides[2:4, ])

  # Bold checkmark inside shield
  checkmark <- data.frame(
    x = cx + c(-8, -3, 10) * s,
    y = cy + c(2, -6, 10) * s
  )
  # ICH badge (small rectangle near bottom)
  badge <- data.frame(
    xmin = cx - 7 * s, xmax = cx + 7 * s,
    ymin = cy - 16 * s, ymax = cy - 10 * s
  )
  # Badge detail (horizontal line inside)
  badge_line <- data.frame(
    x = c(cx - 4 * s, cx + 4 * s),
    y = c(cy - 13 * s, cy - 13 * s)
  )
  # Shield fill (polygon from outline points)
  shield_fill <- rbind(shield_top, shield_sides[2:4, ])
  list(
    ggplot2::geom_polygon(data = shield_fill, .aes(x, y),
      fill = hex_with_alpha(col, 0.08), color = NA),
    ggplot2::geom_path(data = shield_path, .aes(x, y),
      color = col, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = checkmark, .aes(x, y),
      color = bright, linewidth = .lw(s, 3.5)),
    ggplot2::geom_rect(data = badge,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.15), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = badge_line, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.5))
  )
}

# ── glyph_magnifier_checklist: magnifier with checklist inside ────────
glyph_magnifier_checklist <- function(cx, cy, s, col, bright) {
  base <- .magnifier_base(cx, cy, s, col, bright)
  # checklist lines with checkmarks inside the lens
  for (i in 1:4) {
    ly <- cy + (3 - i) * 7 * s + 4 * s
    # checkbox
    cb <- data.frame(xmin = cx - 14 * s, xmax = cx - 10 * s,
                     ymin = ly - 2 * s, ymax = ly + 2 * s)
    base[[length(base) + 1]] <- ggplot2::geom_rect(data = cb,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.15), color = col, linewidth = .lw(s, 0.8))
    # check mark for top 2 items
    if (i <= 2) {
      chk <- data.frame(
        x = c(cx - 13.5 * s, cx - 12 * s, cx - 10.5 * s),
        y = c(ly, ly - 1.5 * s, ly + 1.5 * s)
      )
      base[[length(base) + 1]] <- ggplot2::geom_path(data = chk, .aes(x, y),
        color = bright, linewidth = .lw(s, 1.2))
    }
    # line after checkbox
    l <- data.frame(x = c(cx - 8 * s, cx + 8 * s), y = c(ly, ly))
    base[[length(base) + 1]] <- ggplot2::geom_path(data = l, .aes(x, y),
      color = col, linewidth = .lw(s, 1.2))
  }
  base
}

# ── glyph_issue_create: issue circle with plus sign ──────────────────
glyph_issue_create <- function(cx, cy, s, col, bright) {
  # circle (issue dot)
  r <- 22 * s
  t <- seq(0, 2 * pi, length.out = 50)
  circ <- data.frame(x = cx + r * cos(t), y = cy + r * sin(t))
  # exclamation mark inside (issue indicator)
  exc_line <- data.frame(x = c(cx, cx), y = c(cy + 12 * s, cy - 4 * s))
  exc_dot <- data.frame(x = cx, y = cy - 10 * s)
  # plus sign at bottom-right (create action)
  plus_cx <- cx + 16 * s
  plus_cy <- cy - 16 * s
  plus_h <- data.frame(x = c(plus_cx - 6 * s, plus_cx + 6 * s),
                       y = c(plus_cy, plus_cy))
  plus_v <- data.frame(x = c(plus_cx, plus_cx),
                       y = c(plus_cy - 6 * s, plus_cy + 6 * s))
  # plus background circle
  plus_bg <- data.frame(x0 = plus_cx, y0 = plus_cy, r = 9 * s)
  list(
    ggplot2::geom_polygon(data = circ, .aes(x, y),
      fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = exc_line, .aes(x, y),
      color = bright, linewidth = .lw(s, 3)),
    ggplot2::geom_point(data = exc_dot, .aes(x, y),
      color = bright, size = 4 * s),
    ggforce::geom_circle(data = plus_bg, .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.5)),
    ggplot2::geom_path(data = plus_h, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5)),
    ggplot2::geom_path(data = plus_v, .aes(x, y),
      color = bright, linewidth = .lw(s, 2.5))
  )
}
