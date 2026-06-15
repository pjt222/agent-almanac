# primitives_22.R - Glyph library part 22: investigation domain (9)
# Sourced by build-icons.R via source_all_primitives()
# Domains: investigation (9)

# ══════════════════════════════════════════════════════════════════════════════
# Investigation skills (9) — reverse-engineering a CLI harness + redaction discipline
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

# ══════════════════════════════════════════════════════════════════════════════
# Investigation skills (5 more) — empirical-investigator support skills
# Distinct visual language from glyph_redact_bar (document), glyph_wire_capture
# (waveform), glyph_flag_probe (single flag) — see notes per glyph.
# ══════════════════════════════════════════════════════════════════════════════

# ── glyph_redaction_gate: two gate posts + crossbar with a redaction bar that
#    PASSES THROUGH the opening (a pass/deny barrier). Distinct from the
#    glyph_redact_bar document: this is a checkpoint/gate, not a page. ─────────
glyph_redaction_gate <- function(cx, cy, s, col, bright) {
  layers <- list()

  post_top <- cy + 22 * s
  post_bot <- cy - 22 * s
  for (px in c(-20, 20)) {
    post <- data.frame(
      xmin = cx + (px - 3) * s, xmax = cx + (px + 3) * s,
      ymin = post_bot, ymax = post_top
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = post,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, 0.2), color = bright, linewidth = .lw(s, 1.8))
  }

  for (px in c(-20, 20)) {
    foot <- data.frame(
      xmin = cx + (px - 7) * s, xmax = cx + (px + 7) * s,
      ymin = post_bot - 4 * s, ymax = post_bot
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = foot,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = bright, color = bright, linewidth = .lw(s, 0.6))
  }

  cross <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 24 * s,
    ymin = post_top - 4 * s, ymax = post_top
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = cross,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.6))

  redact <- data.frame(
    xmin = cx - 30 * s, xmax = cx + 30 * s,
    ymin = cy - 5 * s,  ymax = cy + 5 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = redact,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = bright, color = bright, linewidth = .lw(s, 1))

  stop_mark <- data.frame(
    x = c(cx + 30 * s, cx + 30 * s),
    y = c(cy - 9 * s, cy + 9 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = stop_mark, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.4))

  layers
}

# ── glyph_redact_viz: a small bar chart (vertical bars) with a black redaction
#    bar struck across it — redacting a CHART before disclosure. Distinct from
#    glyph_redact_bar (text document): here the censored object is a graphic. ──
glyph_redact_viz <- function(cx, cy, s, col, bright) {
  layers <- list()

  axis_x0 <- cx - 22 * s; axis_y0 <- cy - 18 * s
  axes <- data.frame(
    x = c(axis_x0, axis_x0, cx + 22 * s),
    y = c(cy + 20 * s, axis_y0, axis_y0)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = axes, .aes(x, y),
    color = hex_with_alpha(bright, 0.7), linewidth = .lw(s, 1.6))

  bar_specs <- list(
    list(x = -16, h = 16, alpha = 0.30),
    list(x =  -6, h = 28, alpha = 0.45),
    list(x =   4, h = 22, alpha = 0.35),
    list(x =  14, h = 34, alpha = 0.50)
  )
  for (spec in bar_specs) {
    bar <- data.frame(
      xmin = cx + (spec$x - 3.5) * s, xmax = cx + (spec$x + 3.5) * s,
      ymin = axis_y0, ymax = axis_y0 + spec$h * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = bar,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(col, spec$alpha), color = bright, linewidth = .lw(s, 1.2))
  }

  redact <- data.frame(
    xmin = cx - 24 * s, xmax = cx + 22 * s,
    ymin = cy + 2 * s,  ymax = cy + 11 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = redact,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = bright, color = bright, linewidth = .lw(s, 0.6))

  layers
}

# ── glyph_redact_wire: a connection wire with packet dots and a vertical black
#    redaction bar covering one segment of the stream. Distinct from
#    glyph_wire_capture (waveform trace + tap point): here there is no waveform —
#    just a wire of packets, partly censored. ─────────────────────────────────
glyph_redact_wire <- function(cx, cy, s, col, bright) {
  layers <- list()

  wire_y <- cy
  wire <- data.frame(
    x = c(cx - 28 * s, cx + 28 * s),
    y = c(wire_y, wire_y)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = wire, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.4))

  for (ex in c(-28, 28)) {
    cap <- data.frame(x0 = cx + ex * s, y0 = wire_y, r = 3 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = cap,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.3), color = bright, linewidth = .lw(s, 1.4))
  }

  for (px in c(-18, -9, 0, 9, 18)) {
    pkt <- data.frame(x0 = cx + px * s, y0 = wire_y, r = 2 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = pkt,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(col, 0.6), color = bright, linewidth = .lw(s, 0.8))
  }

  redact <- data.frame(
    xmin = cx - 6 * s, xmax = cx + 12 * s,
    ymin = wire_y - 11 * s, ymax = wire_y + 11 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = redact,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = bright, color = bright, linewidth = .lw(s, 0.6))

  layers
}

# ── glyph_decode_minified: curly braces { } framing a logic-gate (AND) silhouette
#    with input/output stubs — decoding minified JS into recovered logic. ──────
glyph_decode_minified <- function(cx, cy, s, col, bright) {
  layers <- list()

  brace_lx <- cx - 20 * s
  brace_top <- cy + 22 * s; brace_bot <- cy - 22 * s
  lbrace <- data.frame(
    x = c(brace_lx + 6 * s, brace_lx + 2 * s, brace_lx + 2 * s,
          brace_lx - 3 * s, brace_lx + 2 * s, brace_lx + 2 * s, brace_lx + 6 * s),
    y = c(brace_top, brace_top - 6 * s, cy + 5 * s,
          cy, cy - 5 * s, brace_bot + 6 * s, brace_bot)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = lbrace, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.4))

  brace_rx <- cx + 20 * s
  rbrace <- data.frame(
    x = c(brace_rx - 6 * s, brace_rx - 2 * s, brace_rx - 2 * s,
          brace_rx + 3 * s, brace_rx - 2 * s, brace_rx - 2 * s, brace_rx - 6 * s),
    y = c(brace_top, brace_top - 6 * s, cy + 5 * s,
          cy, cy - 5 * s, brace_bot + 6 * s, brace_bot)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = rbrace, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.4))

  gate_left <- cx - 9 * s
  gate_flat_top <- cy + 11 * s
  gate_flat_bot <- cy - 11 * s
  arc_t <- seq(pi / 2, -pi / 2, length.out = 24)
  gate <- data.frame(
    x = c(gate_left, gate_left, cx + 2 * s + 9 * s * cos(arc_t)),
    y = c(gate_flat_bot, gate_flat_top, cy + 11 * s * sin(arc_t))
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = gate, .aes(x, y),
    fill = hex_with_alpha(col, 0.22), color = bright, linewidth = .lw(s, 1.8))

  in_lines <- data.frame(
    x = c(gate_left - 6 * s, gate_left, gate_left - 6 * s, gate_left),
    y = c(cy + 5 * s, cy + 5 * s, cy - 5 * s, cy - 5 * s),
    grp = c(1, 1, 2, 2)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = in_lines,
    .aes(x, y, group = grp), color = bright, linewidth = .lw(s, 1.4))
  out_line <- data.frame(x = c(cx + 11 * s, cx + 14 * s), y = c(cy, cy))
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = out_line, .aes(x, y),
    color = bright, linewidth = .lw(s, 1.4))

  layers
}

# ── glyph_sweep_flags: a row of small flags scanned by a sweep arc — sweeping a
#    namespace of feature flags. Distinct from glyph_flag_probe (single flag +
#    probe): here there are MANY flags and a radar-like scan arc passing over. ─
glyph_sweep_flags <- function(cx, cy, s, col, bright) {
  layers <- list()

  base_y <- cy - 16 * s
  base <- data.frame(
    x = c(cx - 26 * s, cx + 26 * s),
    y = c(base_y, base_y)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = base, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 1.4))

  flag_xs <- c(-20, -10, 0, 10, 20)
  flag_alpha <- c(0.45, 0.10, 0.45, 0.10, 0.45)
  for (i in seq_along(flag_xs)) {
    fx <- cx + flag_xs[i] * s
    pole <- data.frame(x = c(fx, fx), y = c(base_y, base_y + 22 * s))
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = pole, .aes(x, y),
      color = bright, linewidth = .lw(s, 1.6))
    flag <- data.frame(
      x = fx + c(0, 7, 7, 0) * s,
      y = base_y + c(22, 22, 15, 15) * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = flag, .aes(x, y),
      fill = hex_with_alpha(col, flag_alpha[i]), color = bright, linewidth = .lw(s, 1.2))
  }

  sweep_t <- seq(pi * 0.12, pi * 0.88, length.out = 40)
  sweep_r <- 30 * s
  sweep <- data.frame(
    x = cx + sweep_r * cos(sweep_t),
    y = base_y + 4 * s + sweep_r * 0.55 * sin(sweep_t)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sweep, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  head <- data.frame(
    x0 = cx + sweep_r * cos(sweep_t[length(sweep_t)]),
    y0 = base_y + 4 * s + sweep_r * 0.55 * sin(sweep_t[length(sweep_t)]),
    r = 2.6 * s)
  layers[[length(layers) + 1]] <- ggforce::geom_circle(data = head,
    .aes(x0 = x0, y0 = y0, r = r),
    fill = hex_with_alpha(bright, 0.4), color = bright, linewidth = .lw(s, 1.4))

  layers
}
