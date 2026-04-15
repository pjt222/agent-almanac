# primitives_22.R - Glyph library part 22: investigation domain (4)
# Sourced by build-icons.R via source_all_primitives()
# Domains: investigation (4)

# ══════════════════════════════════════════════════════════════════════════════
# Investigation skills (4) — reverse-engineering a CLI harness across 5 phases
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_version_baseline: stacked version bars with dashed baseline ─────────
glyph_version_baseline <- function(cx, cy, s, col, bright) {
  layers <- list()

  bar_specs <- list(
    list(y =  12, len = 18, alpha = 0.35),
    list(y =   0, len = 24, alpha = 0.55),
    list(y = -12, len = 14, alpha = 0.75)
  )

  for (spec in bar_specs) {
    bar_left <- -22
    bar <- data.frame(
      xmin = cx + bar_left * s,
      xmax = cx + (bar_left + spec$len) * s,
      ymin = cy + (spec$y - 2.2) * s,
      ymax = cy + (spec$y + 2.2) * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, spec$alpha), color = bright,
      linewidth = .lw(s, 1.4))
  }

  for (i in seq_along(bar_specs)) {
    spec <- bar_specs[[i]]
    tag <- data.frame(
      xmin = cx + (-26) * s,
      xmax = cx + (-22.5) * s,
      ymin = cy + (spec$y - 2.2) * s,
      ymax = cy + (spec$y + 2.2) * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = tag,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = bright, color = "transparent", linewidth = 0)
  }

  marker_positions <- list(
    list(y =  12, xs = c(-14,  -4)),
    list(y =   0, xs = c(-16,  -6,   6)),
    list(y = -12, xs = c(-18))
  )
  for (mp in marker_positions) {
    for (mx in mp$xs) {
      dot <- data.frame(x0 = cx + mx * s, y0 = cy + mp$y * s, r = 1.6 * s)
      layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
        .aes(x0 = x0, y0 = y0, r = r),
        fill = bright, color = bright, linewidth = .lw(s, 0.8))
    }
  }

  for (ydash in seq(-20, 20, by = 4)) {
    seg <- data.frame(
      x = c(cx + 10 * s, cx + 10 * s),
      y = c(cy + ydash * s, cy + (ydash + 2.2) * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = seg, .aes(x, y),
      color = hex_with_alpha(bright, 0.65), linewidth = .lw(s, 1.6))
  }

  layers
}

# ── glyph_flag_probe: flag on pole with probe antenna + binary state ──────────
glyph_flag_probe <- function(cx, cy, s, col, bright) {
  layers <- list()

  pole_x <- cx - 4 * s
  pole <- data.frame(
    x = c(pole_x, pole_x),
    y = c(cy - 20 * s, cy + 22 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pole, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.2))

  base <- data.frame(x0 = pole_x, y0 = cy - 20 * s, r = 2 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = base,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = bright, color = bright, linewidth = .lw(s, 0.8))

  flag <- data.frame(
    x = pole_x + c(0, 16, 16, 0) * s,
    y = cy + c(22, 22, 10, 10) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = flag, .aes(x, y),
    fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.8))

  divide <- data.frame(
    x = c(pole_x + 8 * s, pole_x + 8 * s),
    y = c(cy + 10 * s, cy + 22 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = divide, .aes(x, y),
    color = hex_with_alpha(bright, 0.55), linewidth = .lw(s, 1.2))

  lit <- data.frame(
    xmin = pole_x + 2 * s, xmax = pole_x + 6 * s,
    ymin = cy + 14 * s,    ymax = cy + 18 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = lit,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = bright, color = "transparent", linewidth = 0)

  dark <- data.frame(x0 = pole_x + 12 * s, y0 = cy + 16 * s, r = 2 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dark,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = "transparent", color = bright, linewidth = .lw(s, 1.5))

  probe <- data.frame(
    x = c(cx + 22 * s, cx + 14 * s),
    y = c(cy - 14 * s, cy +  6 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = probe, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  tip <- data.frame(x0 = cx + 14 * s, y0 = cy + 6 * s, r = 2.4 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = tip,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.6))

  handle <- data.frame(
    xmin = cx + 20 * s, xmax = cx + 24 * s,
    ymin = cy - 18 * s, ymax = cy - 12 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = handle,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.4))

  layers
}

# ── glyph_wire_capture: horizontal wire with tap point and packet trace ───────
glyph_wire_capture <- function(cx, cy, s, col, bright) {
  layers <- list()

  wire_y <- cy - 6 * s
  wire <- data.frame(
    x = c(cx - 26 * s, cx + 26 * s),
    y = c(wire_y, wire_y)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = wire, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.4))

  for (ex in c(-26, 26)) {
    cap <- data.frame(x0 = cx + ex * s, y0 = wire_y, r = 2.4 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = cap,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.35), color = bright, linewidth = .lw(s, 1.4))
  }

  tap <- data.frame(x0 = cx, y0 = wire_y, r = 4 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = tap,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = bright, color = bright, linewidth = .lw(s, 1))

  lead <- data.frame(
    x = c(cx, cx),
    y = c(wire_y + 4 * s, wire_y + 10 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = lead, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.4))

  trace_y <- wire_y + 18 * s
  trace_x <- cx + c(-22, -14, -14, -8, -8, -2, -2, 4, 4, 10, 10, 18, 18, 22) * s
  trace_yy <- trace_y + c(0, 0, 8, 8, 0, 0, 6, 6, 0, 0, 10, 10, 0, 0) * s
  trace_df <- data.frame(x = trace_x, y = trace_yy)
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = trace_df, .aes(x, y),
    color = bright, linewidth = .lw(s, 1.8))

  peak_xs <- c(-11, -5, 7, 14)
  for (px in peak_xs) {
    packet <- data.frame(x0 = cx + px * s, y0 = trace_y + 9 * s, r = 1.4 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = packet,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.65), color = bright, linewidth = .lw(s, 0.8))
  }

  baseline <- data.frame(
    x = c(cx - 24 * s, cx + 24 * s),
    y = c(trace_y, trace_y)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = baseline, .aes(x, y),
    color = hex_with_alpha(col, 0.3), linewidth = .lw(s, 0.8))

  layers
}

# ── glyph_redact_bar: document page with redaction bars over text ─────────────
glyph_redact_bar <- function(cx, cy, s, col, bright) {
  layers <- list()

  w <- 30 * s; h <- 40 * s; fold <- 10 * s
  pg <- data.frame(
    x = c(cx - w / 2, cx - w / 2, cx + w / 2 - fold, cx + w / 2, cx + w / 2),
    y = c(cy - h / 2, cy + h / 2, cy + h / 2, cy + h / 2 - fold, cy - h / 2)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = pg, .aes(x, y),
    fill = hex_with_alpha(col, 0.12), color = bright, linewidth = .lw(s))

  corner <- data.frame(
    x = c(cx + w / 2 - fold, cx + w / 2 - fold, cx + w / 2),
    y = c(cy + h / 2, cy + h / 2 - fold, cy + h / 2 - fold)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = corner, .aes(x, y),
    fill = hex_with_alpha(col, 0.25), color = bright, linewidth = .lw(s, 1.2))

  for (i in 1:5) {
    ly <- cy + h * 0.30 - i * h * 0.12
    len_frac <- c(0.60, 0.55, 0.62, 0.50, 0.45)[i]
    line <- data.frame(
      x = c(cx - w * 0.35, cx - w * 0.35 + w * len_frac),
      y = c(ly, ly)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(col, 0.55), linewidth = .lw(s, 1.2))
  }

  redaction_specs <- list(
    list(y =  0.18, x1 = -0.32, x2 =  0.22),
    list(y =  0.06, x1 = -0.32, x2 = -0.02),
    list(y = -0.06, x1 = -0.05, x2 =  0.25),
    list(y = -0.18, x1 = -0.32, x2 =  0.18)
  )
  for (rs in redaction_specs) {
    bar <- data.frame(
      xmin = cx + rs$x1 * w,
      xmax = cx + rs$x2 * w,
      ymin = cy + (rs$y - 0.045) * h,
      ymax = cy + (rs$y + 0.045) * h
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = bright, color = bright, linewidth = .lw(s, 0.6))
  }

  layers
}
