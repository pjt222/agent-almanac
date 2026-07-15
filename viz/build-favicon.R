#!/usr/bin/env Rscript
# build-favicon.R - Generate polychromatic A favicon + logo suite
#
# The Polychromatic A: three strokes forming the letter A, each in a
# different color from the active palette. Shapeshifts across all 9 palettes.
#
# Produces per palette (in public/favicons/<palette>/):
#   favicon-512.png        (dark bg, glow)
#   favicon.svg            (dark bg, no glow, vector)
#   logo-1024.png          (dark bg, glow — profiles, README hero)
#   logo-transparent.png   (transparent bg, glow, 1024px — overlay on dark)
#   logo-print.png         (transparent bg, no glow, 1024px — print, any bg)
#   logo.svg               (transparent bg, no glow, vector — brand asset)
#
# Cyberpunk default also writes to public/ root:
#   favicon.ico, favicon.svg, apple-touch-icon.png, favicon-192/512.png
#   logo-1024.png, logo-2048.png, logo-transparent.png, logo-print.png, logo.svg
#
# Usage:
#   Rscript build-favicon.R                      # all palettes
#   Rscript build-favicon.R --palette cyberpunk   # single palette

# ── Setup ────────────────────────────────────────────────────────────────
script_dir <- if (nzchar(Sys.getenv("RSCRIPT_DIR"))) {
  Sys.getenv("RSCRIPT_DIR")
} else {
  tryCatch(dirname(normalizePath(sys.frame(1)$ofile)), error = function(e) ".")
}
source(file.path(script_dir, "R", "utils.R"))
source(file.path(script_dir, "R", "primitives.R"))
source(file.path(script_dir, "R", "palettes.R"))

BG_COLOR <- "#0a0a0f"
out_dir  <- file.path(script_dir, "public")

# ── CLI ──────────────────────────────────────────────────────────────────
args <- commandArgs(trailingOnly = TRUE)
palette_arg <- "all"
i <- 1
while (i <= length(args)) {
  if (args[i] == "--palette" && i < length(args)) {
    i <- i + 1
    palette_arg <- args[i]
  }
  i <- i + 1
}

if (palette_arg == "all") {
  target_palettes <- PALETTE_NAMES
} else if (palette_arg %in% PALETTE_NAMES) {
  target_palettes <- palette_arg
} else {
  stop("Unknown palette: ", palette_arg, ". Use one of: ",
       paste(PALETTE_NAMES, collapse = ", "), ", or 'all'", call. = FALSE)
}

# ── Render engine ────────────────────────────────────────────────────────

render_polychromatic_a <- function(palette_name) {
  colors <- get_favicon_colors(palette_name)
  glow_color <- blend_hex(c(colors$c1, colors$c2, colors$c3))

  glyph_layers <- glyph_polychromatic_a(
    cx = 50, cy = 50, s = 1.0, colors = colors
  )

  # Base plot: transparent background, no glow
  p_base <- ggplot2::ggplot() +
    ggplot2::coord_fixed(xlim = c(0, 100), ylim = c(0, 100), expand = FALSE) +
    ggplot2::theme_void() +
    ggplot2::theme(
      plot.background  = ggplot2::element_rect(fill = "transparent", color = NA),
      panel.background = ggplot2::element_rect(fill = "transparent", color = NA),
      plot.margin      = ggplot2::margin(0, 0, 0, 0)
    )
  for (layer in glyph_layers) p_base <- p_base + layer

  # Glow version (transparent bg)
  p_glow <- ggfx::with_outer_glow(p_base, colour = glow_color, sigma = 4, expand = 3)

  # Render PNG helper — res scales proportionally to keep visual weight constant
  render_png <- function(plot, size) {
    tmp <- tempfile(fileext = ".png")
    scaled_res <- 150 * size / 512
    ragg::agg_png(tmp, width = size, height = size,
                  background = "transparent", res = scaled_res)
    print(plot)
    grDevices::dev.off()
    img <- magick::image_read(tmp)
    unlink(tmp)
    img
  }

  # Master rasters
  master_glow   <- render_png(p_glow, 2048)
  master_noglow <- render_png(p_base, 2048)

  # SVG ggplots (rendered to file later)
  p_svg_dark <- ggplot2::ggplot() +
    ggplot2::coord_fixed(xlim = c(0, 100), ylim = c(0, 100), expand = FALSE) +
    ggplot2::theme_void() +
    ggplot2::theme(
      plot.background  = ggplot2::element_rect(fill = BG_COLOR, color = NA),
      panel.background = ggplot2::element_rect(fill = BG_COLOR, color = NA),
      plot.margin      = ggplot2::margin(0, 0, 0, 0)
    )
  for (layer in glyph_layers) p_svg_dark <- p_svg_dark + layer

  list(
    master_glow   = master_glow,    # 2048px, transparent bg, glow
    master_noglow = master_noglow,  # 2048px, transparent bg, no glow
    svg_dark      = p_svg_dark,     # ggplot for dark-bg SVG
    svg_clear     = p_base          # ggplot for transparent SVG (no glow)
  )
}

# ── Compositing helpers ──────────────────────────────────────────────────

compose_dark <- function(master, size) {
  bg <- magick::image_blank(size, size, color = BG_COLOR)
  fg <- magick::image_resize(master, paste0(size, "x", size))
  magick::image_composite(bg, fg, operator = "over")
}

resize_transparent <- function(master, size) {
  magick::image_resize(master, paste0(size, "x", size))
}

write_svg <- function(plot, path, bg = "transparent") {
  svglite::svglite(path, width = 1, height = 1, bg = bg)
  print(plot)
  grDevices::dev.off()
}

# ── Per-palette output ───────────────────────────────────────────────────

write_palette_assets <- function(palette_name, render, dest_dir) {
  dir.create(dest_dir, recursive = TRUE, showWarnings = FALSE)

  # Favicon: dark bg, glow, 512px
  magick::image_write(
    compose_dark(render$master_glow, 512),
    file.path(dest_dir, "favicon-512.png"), format = "png")

  # Favicon SVG: dark bg, no glow
  write_svg(render$svg_dark, file.path(dest_dir, "favicon.svg"), bg = BG_COLOR)

  # Logo 1024: dark bg, glow
  magick::image_write(
    compose_dark(render$master_glow, 1024),
    file.path(dest_dir, "logo-1024.png"), format = "png")

  # Logo transparent: transparent bg, glow, 1024px
  magick::image_write(
    resize_transparent(render$master_glow, 1024),
    file.path(dest_dir, "logo-transparent.png"), format = "png")

  # Logo print: transparent bg, no glow, 1024px
  magick::image_write(
    resize_transparent(render$master_noglow, 1024),
    file.path(dest_dir, "logo-print.png"), format = "png")

  # Logo SVG: transparent bg, no glow
  write_svg(render$svg_clear, file.path(dest_dir, "logo.svg"))

  log_msg(sprintf("  %s: 4 PNGs + 2 SVGs", palette_name))
}

# ── Main loop ────────────────────────────────────────────────────────────
log_msg(sprintf("Building polychromatic A assets for %d palette(s)...",
                length(target_palettes)))

for (pal in target_palettes) {
  log_msg(sprintf("Rendering palette: %s", pal))
  render <- render_polychromatic_a(pal)

  # Per-palette directory
  pal_dir <- file.path(out_dir, "favicons", pal)
  write_palette_assets(pal, render, pal_dir)

  # Cyberpunk is also the default — full suite to public/ root
  if (pal == "cyberpunk") {
    log_msg("Writing default (cyberpunk) suite to public/...")

    # Favicons
    magick::image_write(
      compose_dark(render$master_glow, 32),
      file.path(out_dir, "favicon.ico"), format = "ico")
    magick::image_write(
      compose_dark(render$master_glow, 180),
      file.path(out_dir, "apple-touch-icon.png"), format = "png")
    magick::image_write(
      compose_dark(render$master_glow, 192),
      file.path(out_dir, "favicon-192.png"), format = "png")
    magick::image_write(
      compose_dark(render$master_glow, 512),
      file.path(out_dir, "favicon-512.png"), format = "png")
    write_svg(render$svg_dark, file.path(out_dir, "favicon.svg"), bg = BG_COLOR)

    # Logo: dark bg, glow (1024 + 2048)
    magick::image_write(
      compose_dark(render$master_glow, 1024),
      file.path(out_dir, "logo-1024.png"), format = "png")
    magick::image_write(
      compose_dark(render$master_glow, 2048),
      file.path(out_dir, "logo-2048.png"), format = "png")

    # Logo: transparent bg, glow (1024)
    magick::image_write(
      resize_transparent(render$master_glow, 1024),
      file.path(out_dir, "logo-transparent.png"), format = "png")

    # Logo: transparent bg, no glow (1024) — print/any-bg
    magick::image_write(
      resize_transparent(render$master_noglow, 1024),
      file.path(out_dir, "logo-print.png"), format = "png")

    # Logo SVG: transparent bg, no glow — brand asset
    write_svg(render$svg_clear, file.path(out_dir, "logo.svg"))
  }
}

# ── Summary ──────────────────────────────────────────────────────────────
root_files <- c("favicon.ico", "favicon.svg", "apple-touch-icon.png",
                "favicon-192.png", "favicon-512.png",
                "logo-1024.png", "logo-2048.png",
                "logo-transparent.png", "logo-print.png", "logo.svg")
for (f in root_files) {
  fp <- file.path(out_dir, f)
  if (file.exists(fp)) {
    sz <- round(file.info(fp)$size / 1024, 1)
    log_msg(sprintf("  %s (%.1f KB)", f, sz))
  }
}

pal_dirs <- list.dirs(file.path(out_dir, "favicons"), recursive = FALSE)
log_msg(sprintf("Palette variants: %d directories in public/favicons/",
                length(pal_dirs)))
log_msg("Favicon + logo build complete.")
