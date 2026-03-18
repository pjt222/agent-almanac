# primitives_21.R - Glyph library part 21: CLI domain (4) + general (1)
# Sourced by build-icons.R
# Domains: cli (4), general (1)

# ==============================================================================
# General skills (1)
# ==============================================================================

# -- glyph_almanac_install: downward arrow into open box -----------------------
glyph_almanac_install <- function(cx, cy, s, col, bright) {
  # A downward-pointing arrow dropping into an open box — installing
  # content (skills, agents, teams) into a target framework.
  layers <- list()

  # Open box (bottom half, U-shape)
  box <- data.frame(
    x = cx + c(-16, -16, 16, 16) * s,
    y = cy + c(2, -14, -14, 2) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = box, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.2))

  # Box flaps (angled lines at top)
  flap_l <- data.frame(
    x = cx + c(-16, -10) * s,
    y = cy + c(2, 8) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = flap_l, .aes(x, y),
    color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.8))

  flap_r <- data.frame(
    x = cx + c(16, 10) * s,
    y = cy + c(2, 8) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = flap_r, .aes(x, y),
    color = hex_with_alpha(bright, 0.5), linewidth = .lw(s, 1.8))

  # Downward arrow shaft
  shaft <- data.frame(
    x = c(cx, cx),
    y = c(cy + 22 * s, cy + 6 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = shaft, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Arrowhead
  arrow_head <- data.frame(
    x = cx + c(-5, 0, 5) * s,
    y = cy + c(10, 4, 10) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = arrow_head, .aes(x, y),
    fill = bright, color = "transparent", linewidth = 0)

  layers
}

# ==============================================================================
# CLI skills (4)
# ==============================================================================

# -- glyph_cli_scaffold: terminal prompt with branching command tree -----------
glyph_cli_scaffold <- function(cx, cy, s, col, bright) {
  # A > prompt character with three indented sub-lines branching out —
  # scaffolding a CLI command with options and subcommands.
  layers <- list()

  # Terminal frame
  frame <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 22 * s,
    ymin = cy - 18 * s, ymax = cy + 18 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = frame,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Title bar line
  title_bar <- data.frame(
    x = c(cx - 22 * s, cx + 22 * s),
    y = c(cy + 12 * s, cy + 12 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = title_bar, .aes(x, y),
    color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1))

  # Three dots in title bar
  for (i in 1:3) {
    dot <- data.frame(x0 = cx + (-16 + (i - 1) * 5) * s, y0 = cy + 15 * s, r = 1.5 * s)
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = dot,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = "transparent", linewidth = 0)
  }

  # Prompt chevron (>)
  chevron <- data.frame(
    x = cx + c(-16, -12, -16) * s,
    y = cy + c(6, 3, 0) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = chevron, .aes(x, y),
    color = bright, linewidth = .lw(s, 2))

  # Command text line (horizontal bar)
  cmd_line <- data.frame(
    x = c(cx - 8 * s, cx + 8 * s),
    y = c(cy + 3 * s, cy + 3 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = cmd_line, .aes(x, y),
    color = hex_with_alpha(bright, 0.6), linewidth = .lw(s, 2.5))

  # Three indented sub-option lines (branching structure)
  for (i in 1:3) {
    sub_y <- cy + (3 - i * 5) * s
    sub_line <- data.frame(
      x = c(cx - 4 * s, cx + (14 - i * 2) * s),
      y = c(sub_y, sub_y)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sub_line, .aes(x, y),
      color = hex_with_alpha(bright, 0.4 - i * 0.05), linewidth = .lw(s, 1.8))
  }

  layers
}

# -- glyph_cli_plugin: socket with insertable block ----------------------------
glyph_cli_plugin <- function(cx, cy, s, col, bright) {
  # A rectangular socket (base) with a block being inserted from above —
  # the plugin/adapter architecture pattern.
  layers <- list()

  # Socket base (U-shape with notch)
  socket <- data.frame(
    x = cx + c(-18, -18, -8, -8, 8, 8, 18, 18) * s,
    y = cy + c(4, -14, -14, -8, -8, -14, -14, 4) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = socket, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.2))

  # Inner socket fill
  socket_fill <- data.frame(
    x = cx + c(-18, -18, -8, -8, 8, 8, 18, 18) * s,
    y = cy + c(4, -14, -14, -8, -8, -14, -14, 4) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = socket_fill, .aes(x, y),
    fill = hex_with_alpha(col, 0.08), color = "transparent", linewidth = 0)

  # Plugin block (hovering above socket, with matching tab)
  block <- data.frame(
    x = cx + c(-14, -14, -6, -6, 6, 6, 14, 14) * s,
    y = cy + c(20, 8, 8, 2, 2, 8, 8, 20) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_polygon(data = block, .aes(x, y),
    fill = hex_with_alpha(col, 0.15), color = bright, linewidth = .lw(s, 2))

  # Downward motion lines (indicating insertion)
  for (offset in c(-10, 10)) {
    motion <- data.frame(
      x = c(cx + offset * s, cx + offset * s),
      y = c(cy + 22 * s, cy + 24 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = motion, .aes(x, y),
      color = hex_with_alpha(bright, 0.35), linewidth = .lw(s, 1.5))
  }

  layers
}

# -- glyph_cli_test: terminal with checkmark and subprocess arrows -------------
glyph_cli_test <- function(cx, cy, s, col, bright) {
  # A terminal window outline with a checkmark inside and two small
  # subprocess arrows on the side — testing CLI via exec/spawn.
  layers <- list()

  # Terminal frame
  frame <- data.frame(
    xmin = cx - 20 * s, xmax = cx + 14 * s,
    ymin = cy - 16 * s, ymax = cy + 16 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = frame,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.1), color = bright, linewidth = .lw(s, 2))

  # Title bar
  bar <- data.frame(
    x = c(cx - 20 * s, cx + 14 * s),
    y = c(cy + 10 * s, cy + 10 * s)
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = bar, .aes(x, y),
    color = hex_with_alpha(bright, 0.4), linewidth = .lw(s, 1))

  # Checkmark inside terminal
  check <- data.frame(
    x = cx + c(-10, -4, 6) * s,
    y = cy + c(-2, -8, 4) * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_path(data = check, .aes(x, y),
    color = bright, linewidth = .lw(s, 2.8))

  # Subprocess arrows (right side — two small curved arrows)
  for (i in c(-1, 1)) {
    arr_y <- cy + i * 6 * s
    sub_arrow <- data.frame(
      x = cx + c(16, 22, 22) * s,
      y = c(arr_y, arr_y, arr_y + i * 4 * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = sub_arrow, .aes(x, y),
      color = hex_with_alpha(bright, 0.45), linewidth = .lw(s, 1.5))

    # Arrow tip
    tip <- data.frame(
      x0 = cx + 22 * s, y0 = arr_y + i * 4 * s, r = 1.5 * s
    )
    layers[[length(layers) + 1]] <- ggforce::geom_circle(data = tip,
      .aes(x0 = x0, y0 = y0, r = r),
      fill = hex_with_alpha(bright, 0.4), color = "transparent", linewidth = 0)
  }

  layers
}

# -- glyph_cli_output: layered text lines with color bands ---------------------
glyph_cli_output <- function(cx, cy, s, col, bright) {
  # Stacked horizontal lines of varying lengths and intensities — formatted
  # terminal output with color/formatting, representing the multi-mode
  # output design (human, verbose, quiet, JSON).
  layers <- list()

  # Background panel
  panel <- data.frame(
    xmin = cx - 22 * s, xmax = cx + 22 * s,
    ymin = cy - 18 * s, ymax = cy + 18 * s
  )
  layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = panel,
    .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
    fill = hex_with_alpha(col, 0.08), color = bright, linewidth = .lw(s, 2))

  # Output lines with varying lengths and brightness (color formatting)
  line_specs <- list(
    list(x1 = -18, x2 = 6,   y = 12, alpha = 0.7, lw = 2.5),   # bright header
    list(x1 = -18, x2 = 14,  y = 6,  alpha = 0.5, lw = 2),     # info line
    list(x1 = -18, x2 = -2,  y = 0,  alpha = 0.4, lw = 2),     # label
    list(x1 = 2,   x2 = 18,  y = 0,  alpha = 0.6, lw = 2),     # value
    list(x1 = -18, x2 = 10,  y = -6, alpha = 0.35, lw = 1.8),  # dim line
    list(x1 = -18, x2 = 16,  y = -12, alpha = 0.3, lw = 1.5)   # faded
  )

  for (spec in line_specs) {
    line <- data.frame(
      x = c(cx + spec$x1 * s, cx + spec$x2 * s),
      y = c(cy + spec$y * s, cy + spec$y * s)
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_path(data = line, .aes(x, y),
      color = hex_with_alpha(bright, spec$alpha), linewidth = .lw(s, spec$lw))
  }

  # Small color accent squares (representing chalk color tokens)
  for (i in 1:3) {
    sq <- data.frame(
      xmin = cx + (-20 + (i - 1) * 4) * s,
      xmax = cx + (-18 + (i - 1) * 4) * s,
      ymin = cy + 11 * s, ymax = cy + 13 * s
    )
    layers[[length(layers) + 1]] <- ggplot2::geom_rect(data = sq,
      .aes(xmin = xmin, xmax = xmax, ymin = ymin, ymax = ymax),
      fill = hex_with_alpha(bright, 0.3 + i * 0.15),
      color = "transparent", linewidth = 0)
  }

  layers
}

# NOTE: Agent glyph glyph_agent_cli_dev lives in agent_primitives.R
# (agent renderer sources agent_primitives.R, not primitives_*.R files)
