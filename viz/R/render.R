# render.R - Shared icon rendering pipeline
# Canvas setup -> glyph layers -> glow -> PNG -> WebP
#
# put id:"resolve_glyph", label:"Resolve glyph function from SKILL_GLYPHS mapping", node_type:"input", output:"glyph_fn"
# put id:"draw_layers", label:"Draw glyph layers on 100x100 canvas (ggplot2)", input:"glyph_fn", output:"ggplot_obj"
# put id:"apply_glow", label:"Apply neon glow effect (ggfx::with_outer_glow)", input:"ggplot_obj", output:"glowing_plot"
# put id:"rasterize_png", label:"Rasterize to temp PNG (ragg::agg_png)", input:"glowing_plot", output:"temp_png"
# put id:"convert_webp", label:"Convert PNG to WebP (magick::image_write)", node_type:"output", input:"temp_png", output:"icon.webp"
#
# Optimization notes (Issue #25):
# - Default 512px (was 1024): frontend max display is 160px (320px retina)
# - Default glow_sigma 4 (was 8): scaled with resolution
# - WebP quality 80 (was 90): indistinguishable at display size
# - Batched glow: single with_outer_glow() call instead of per-layer
# - Template + recolor: render white template once, recolor per palette

#' Core rendering engine shared by skill and agent pipelines
#'
#' @param color Hex color for the glyph and glow
#' @param glyph_fn_name Name of the glyph drawing function
#' @param entity_id Identifier for error messages
#' @param out_path Output file path (WebP)
#' @param glow_sigma Glow blur radius (default 4)
#' @param size_px Output dimension in pixels (default 512)
#' @param webp_quality WebP compression quality 0-100 (default 80)
#' @return Invisible TRUE on success
render_glyph <- function(color, glyph_fn_name, entity_id, out_path,
                         glow_sigma = 4, size_px = 512, glyph_fn = NULL,
                         webp_quality = 80, dpi = 150, expand = 3,
                         canvas_size = 100) {
  bright_color <- brighten_hex(color, 1.4)

  # Resolve glyph function (use pre-resolved function if provided)
  if (is.null(glyph_fn)) {
    glyph_fn <- tryCatch(
      match.fun(glyph_fn_name),
      error = function(e) {
        stop("Cannot resolve glyph function '", glyph_fn_name,
             "' for: ", entity_id, call. = FALSE)
      }
    )
  }

  # Draw the glyph centered on canvas
  half <- canvas_size / 2
  glyph_layers <- glyph_fn(cx = half, cy = half, s = 1.0,
                            col = color, bright = bright_color)

  # Build the ggplot
  p <- ggplot2::ggplot() +
    ggplot2::coord_fixed(xlim = c(0, canvas_size), ylim = c(0, canvas_size),
                         expand = FALSE) +
    ggplot2::theme_void() +
    ggplot2::theme(
      plot.background = ggplot2::element_rect(fill = "transparent",
                                               color = NA),
      panel.background = ggplot2::element_rect(fill = "transparent",
                                                color = NA),
      plot.margin = ggplot2::margin(0, 0, 0, 0)
    )

  # Flatten all glyph layers and apply a single batched glow
  flat_layers <- list()
  for (layer in glyph_layers) {
    if (inherits(layer, "list")) {
      for (sub_layer in layer) {
        flat_layers[[length(flat_layers) + 1]] <- sub_layer
      }
    } else {
      flat_layers[[length(flat_layers) + 1]] <- layer
    }
  }
  for (layer in flat_layers) {
    p <- p + layer
  }
  p <- ggfx::with_outer_glow(p, colour = color, sigma = glow_sigma,
                             expand = expand)

  # Render to temp PNG
  tmp_png <- tempfile(fileext = ".png")
  on.exit(unlink(tmp_png), add = TRUE)

  ragg::agg_png(tmp_png, width = size_px, height = size_px,
                background = "transparent", res = dpi)
  print(p)
  grDevices::dev.off()

  # Ensure output directory exists
  dir.create(dirname(out_path), recursive = TRUE, showWarnings = FALSE)

  # Convert PNG to WebP via magick
  tryCatch({
    img <- magick::image_read(tmp_png)
    magick::image_write(img, path = out_path, format = "webp",
                        quality = webp_quality)
  }, error = function(e) {
    stop("Image conversion failed for ", entity_id, ": ",
         conditionMessage(e), call. = FALSE)
  })

  invisible(TRUE)
}

#' Render a white template PNG for cross-palette recoloring
#'
#' Renders the glyph in white (#FFFFFF) with white glow on a transparent
#' background. The result can be recolored per palette via recolor_template().
#'
#' @param glyph_fn_name Name of the glyph drawing function
#' @param entity_id Identifier for error messages
#' @param out_png Output PNG file path (not WebP — intermediate template)
#' @param glow_sigma Glow blur radius (default 4)
#' @param size_px Output dimension in pixels (default 512)
#' @param glyph_fn Optional pre-resolved glyph function
#' @return Invisible TRUE on success
render_glyph_template <- function(glyph_fn_name, entity_id, out_png,
                                  glow_sigma = 4, size_px = 512,
                                  glyph_fn = NULL, dpi = 150, expand = 3,
                                  canvas_size = 100) {
  template_color <- "#FFFFFF"

  if (is.null(glyph_fn)) {
    glyph_fn <- tryCatch(
      match.fun(glyph_fn_name),
      error = function(e) {
        stop("Cannot resolve glyph function '", glyph_fn_name,
             "' for: ", entity_id, call. = FALSE)
      }
    )
  }

  half <- canvas_size / 2
  glyph_layers <- glyph_fn(cx = half, cy = half, s = 1.0,
                            col = template_color, bright = template_color)

  p <- ggplot2::ggplot() +
    ggplot2::coord_fixed(xlim = c(0, canvas_size), ylim = c(0, canvas_size),
                         expand = FALSE) +
    ggplot2::theme_void() +
    ggplot2::theme(
      plot.background = ggplot2::element_rect(fill = "transparent",
                                               color = NA),
      panel.background = ggplot2::element_rect(fill = "transparent",
                                                color = NA),
      plot.margin = ggplot2::margin(0, 0, 0, 0)
    )

  flat_layers <- list()
  for (layer in glyph_layers) {
    if (inherits(layer, "list")) {
      for (sub_layer in layer) {
        flat_layers[[length(flat_layers) + 1]] <- sub_layer
      }
    } else {
      flat_layers[[length(flat_layers) + 1]] <- layer
    }
  }
  for (layer in flat_layers) {
    p <- p + layer
  }
  p <- ggfx::with_outer_glow(p, colour = template_color,
                              sigma = glow_sigma, expand = expand)

  dir.create(dirname(out_png), recursive = TRUE, showWarnings = FALSE)

  ragg::agg_png(out_png, width = size_px, height = size_px,
                background = "transparent", res = dpi)
  print(p)
  grDevices::dev.off()

  invisible(TRUE)
}

#' Recolor a white template PNG to a target color and write WebP
#'
#' Uses magick::image_colorize() at 100% opacity to replace all RGB channels
#' with the target color while preserving the alpha channel (glow falloff).
#'
#' @param template_png Path to the white template PNG
#' @param color Target hex color
#' @param out_path Output WebP file path
#' @param webp_quality WebP compression quality (default 80)
#' @return Invisible TRUE on success
recolor_template <- function(template_png, color, out_path,
                             webp_quality = 80) {
  dir.create(dirname(out_path), recursive = TRUE, showWarnings = FALSE)

  img <- magick::image_read(template_png)
  img <- magick::image_colorize(img, opacity = 100, color = color)
  magick::image_write(img, path = out_path, format = "webp",
                      quality = webp_quality)

  invisible(TRUE)
}

#' Render a single skill icon to WebP
#'
#' @param domain Domain name (determines color palette unless color is provided)
#' @param skill_id Skill identifier (determines glyph shape)
#' @param out_path Output file path (WebP)
#' @param glow_sigma Glow blur radius (default 4)
#' @param size_px Output dimension in pixels (default 512)
#' @param color Optional explicit hex color (overrides domain lookup)
#' @return Invisible TRUE on success
render_icon <- function(domain, skill_id = NULL, out_path,
                        glow_sigma = 4, size_px = 512, color = NULL,
                        glyph_fn = NULL) {
  if (is.null(color)) {
    color <- get_palette_colors("cyberpunk")$domains[[domain]]
    if (is.null(color)) {
      stop("Unknown domain: ", domain, call. = FALSE)
    }
  }

  if (is.null(skill_id)) {
    stop("skill_id is required", call. = FALSE)
  }

  glyph_fn_name <- SKILL_GLYPHS[[skill_id]]
  if (is.null(glyph_fn_name)) {
    warning("No glyph mapping for '", skill_id, "' -- using default", call. = FALSE)
    glyph_fn_name <- "unknown"
  }

  render_glyph(color = color, glyph_fn_name = glyph_fn_name,
               entity_id = skill_id, out_path = out_path,
               glow_sigma = glow_sigma, size_px = size_px,
               glyph_fn = glyph_fn)
}
