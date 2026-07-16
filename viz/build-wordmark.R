#!/usr/bin/env Rscript
# build-wordmark.R - Generate Agent Almanac wordmark SVGs
#
# Reuses glyph_polychromatic_a() from the favicon pipeline for
# geometrically exact icon + text wordmarks. Text is rendered as
# triangulated polygon fills via string2path — no font dependency.
#
# Produces in docs/logos/wordmark/:
#   agent-almanac-dark.svg               (200px base)
#   agent-almanac-dark-{400..1000}.svg   (size variants)
#   agent-almanac-light.svg              (200px base)
#   agent-almanac-light-{400..1000}.svg  (size variants)
#
# Usage:
#   cd viz && Rscript build-wordmark.R

# ── Setup ────────────────────────────────────────────────────────────────
script_dir <- if (nzchar(Sys.getenv("RSCRIPT_DIR"))) {
  Sys.getenv("RSCRIPT_DIR")
} else {
  tryCatch(dirname(normalizePath(sys.frame(1)$ofile)), error = function(e) ".")
}

# Ensure renv is fully activated (not just library-loaded)
activate_path <- file.path(script_dir, "renv", "activate.R")
if (file.exists(activate_path)) source(activate_path)

source(file.path(script_dir, "R", "utils.R"))
source(file.path(script_dir, "R", "primitives.R"))
source(file.path(script_dir, "R", "palettes.R"))

library(string2path)
library(systemfonts)

# Resolve project root reliably (script_dir = viz/)
project_root <- normalizePath(file.path(script_dir, ".."))
out_dir <- file.path(project_root, "docs", "logos", "wordmark")
dir.create(out_dir, recursive = TRUE, showWarnings = FALSE)

# Canvas: 500x110 data units -> 4.55:1 aspect ratio -> 200x44px base output
CANVAS_W <- 500
CANVAS_H <- 110

# ── Text-to-path helper ─────────────────────────────────────────────────
# Converts a text string to triangulated fill polygons via string2path.
# Returns a data.frame with x, y, group columns ready for geom_polygon().
text_to_fill <- function(label, font_path, x, y, target_width,
                         tolerance = 0.01) {
  fill_data <- string2fill(label, font_path, tolerance = tolerance)

  raw_width  <- max(fill_data$x) - min(fill_data$x)
  raw_min_y  <- min(fill_data$y)
  raw_max_y  <- max(fill_data$y)
  raw_mid_y  <- (raw_min_y + raw_max_y) / 2
  scale_factor <- target_width / raw_width

  # Left-align at x, center vertically at y
  fill_data$x <- (fill_data$x - min(fill_data$x)) * scale_factor + x
  fill_data$y <- (fill_data$y - raw_mid_y) * scale_factor + y
  fill_data$group <- interaction(fill_data$glyph_id, fill_data$triangle_id)
  fill_data
}

# Resolve system fonts once
FONT_BOLD <- systemfonts::match_fonts("sans", weight = "bold")$path
FONT_REG  <- systemfonts::match_fonts("sans")$path

# Target widths in canvas units (from original SVG textLength * 2.5 scaling)
AGENT_WIDTH   <- 90.575   # "Agent"   textLength=36.23 SVG px * 2.5
ALMANAC_WIDTH <- 124.425  # "Almanac" textLength=49.77 SVG px * 2.5

# ── Build wordmark plot ──────────────────────────────────────────────────
build_wordmark <- function(variant = c("dark", "light")) {
  variant <- match.arg(variant)
  colors <- get_favicon_colors("cyberpunk")

  if (variant == "light") {
    colors$c1 <- "#0891B2"   # cyan-600 (Tailwind)
    colors$c2 <- "#9333EA"   # purple-600
    colors$c3 <- "#059669"   # emerald-600
    text_color <- "#1F2937"
    almanac_alpha <- 0.55
  } else {
    text_color <- "#F0F0F5"
    almanac_alpha <- 0.65
  }

  glyph_layers <- glyph_polychromatic_a(
    cx = 55, cy = 55, s = 0.65, colors = colors
  )

  p <- ggplot2::ggplot() +
    ggplot2::coord_fixed(
      xlim = c(0, CANVAS_W), ylim = c(0, CANVAS_H),
      expand = FALSE
    ) +
    ggplot2::theme_void() +
    ggplot2::theme(
      plot.background  = ggplot2::element_rect(fill = "transparent", color = NA),
      panel.background = ggplot2::element_rect(fill = "transparent", color = NA),
      plot.margin      = ggplot2::margin(0, 0, 0, 0)
    )

  for (layer in glyph_layers) p <- p + layer

  # Text as triangulated fill polygons (font-independent)
  agent_poly <- text_to_fill("Agent", FONT_BOLD,
    x = 120, y = 76, target_width = AGENT_WIDTH)
  almanac_poly <- text_to_fill("Almanac", FONT_REG,
    x = 120, y = 34, target_width = ALMANAC_WIDTH)

  p <- p +
    ggplot2::geom_polygon(
      data = agent_poly,
      ggplot2::aes(x = x, y = y, group = group),
      fill = text_color, color = NA
    ) +
    ggplot2::geom_polygon(
      data = almanac_poly,
      ggplot2::aes(x = x, y = y, group = group),
      fill = hex_with_alpha(text_color, almanac_alpha), color = NA
    )

  p
}

# ── Write SVG ────────────────────────────────────────────────────────────
BASE_W <- 200  # base output width in px
BASE_H <- BASE_W * CANVAS_H / CANVAS_W  # 44px

write_base_svg <- function(plot, path) {
  svglite::svglite(
    path,
    width  = BASE_W / 72,
    height = BASE_H / 72,
    bg = "transparent"
  )
  print(plot)
  grDevices::dev.off()

  # Post-process: replace pt units with px for web compatibility
  svg <- readLines(path)
  svg[2] <- gsub("pt'", "px'", svg[2])
  writeLines(svg, path)
}

# Size variants: same viewBox, different width/height attributes.
# SVG scales uniformly — polygons and strokes all scale together.
write_size_variant <- function(base_path, out_path, width_px) {
  height_px <- round(width_px * CANVAS_H / CANVAS_W, 2)
  svg <- readLines(base_path)
  svg[2] <- sub(
    "width='[0-9.]+px'",
    sprintf("width='%.2fpx'", width_px),
    svg[2]
  )
  svg[2] <- sub(
    "height='[0-9.]+px'",
    sprintf("height='%.2fpx'", height_px),
    svg[2]
  )
  writeLines(svg, out_path)
}

# ── Generate all variants ────────────────────────────────────────────────
extra_sizes <- c(400, 600, 800, 1000)

for (variant in c("dark", "light")) {
  log_msg(sprintf("Building %s wordmarks...", variant))
  p <- build_wordmark(variant)

  # Base SVG (200px)
  base_file <- sprintf("agent-almanac-%s.svg", variant)
  base_path <- file.path(out_dir, base_file)
  write_base_svg(p, base_path)
  sz_kb <- round(file.info(base_path)$size / 1024, 1)
  log_msg(sprintf("  %s (200px, %.1f KB)", base_file, sz_kb))

  # Size variants (rewrite width/height, keep viewBox)
  for (sz in extra_sizes) {
    filename <- sprintf("agent-almanac-%s-%d.svg", variant, sz)
    filepath <- file.path(out_dir, filename)
    write_size_variant(base_path, filepath, sz)
    sz_kb <- round(file.info(filepath)$size / 1024, 1)
    log_msg(sprintf("  %s (%dpx, %.1f KB)", filename, sz, sz_kb))
  }
}

log_msg(sprintf("Wordmark build complete. %d files in %s",
                (1 + length(extra_sizes)) * 2, out_dir))
