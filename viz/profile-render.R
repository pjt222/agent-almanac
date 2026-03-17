#!/usr/bin/env Rscript
# profile-render.R - Profile the icon render pipeline per-step
#
# Times each stage: ggplot construction, ggfx glow, ragg PNG write,
# magick WebP convert. Runs at both 1024x1024 and 512x512 to quantify
# the resolution-reduction benefit.
#
# Usage:
#   Rscript profile-render.R              # Profile 5 representative glyphs
#   Rscript profile-render.R --all-sizes  # Also test 256 and 768

# ── Determine script directory ───────────────────────────────────────────
get_script_dir <- function() {
  args <- commandArgs(trailingOnly = FALSE)
  file_arg <- grep("--file=", args, value = TRUE)
  if (length(file_arg) > 0) {
    return(normalizePath(dirname(sub("--file=", "", file_arg[1]))))
  }
  if (file.exists("R/utils.R")) return(normalizePath("."))
  if (file.exists("viz/R/utils.R")) return(normalizePath("viz"))
  stop("Cannot determine script directory. Run from viz/ or project root.",
       call. = FALSE)
}

script_dir <- get_script_dir()

# ── Source supporting files ──────────────────────────────────────────────
source(file.path(script_dir, "R", "utils.R"))
source(file.path(script_dir, "R", "primitives.R"))
source(file.path(script_dir, "R", "primitives_2.R"))
source(file.path(script_dir, "R", "primitives_3.R"))
source(file.path(script_dir, "R", "primitives_4.R"))
source(file.path(script_dir, "R", "primitives_5.R"))
source(file.path(script_dir, "R", "primitives_6.R"))
source(file.path(script_dir, "R", "primitives_7.R"))
source(file.path(script_dir, "R", "primitives_8.R"))
source(file.path(script_dir, "R", "primitives_9.R"))
source(file.path(script_dir, "R", "primitives_10.R"))
source(file.path(script_dir, "R", "primitives_11.R"))
source(file.path(script_dir, "R", "primitives_12.R"))
source(file.path(script_dir, "R", "primitives_13.R"))
source(file.path(script_dir, "R", "primitives_14.R"))
source(file.path(script_dir, "R", "primitives_15.R"))
source(file.path(script_dir, "R", "primitives_16.R"))
source(file.path(script_dir, "R", "primitives_17.R"))
source(file.path(script_dir, "R", "primitives_18.R"))
source(file.path(script_dir, "R", "primitives_19.R"))
source(file.path(script_dir, "R", "glyphs.R"))
source(file.path(script_dir, "R", "render.R"))
source(file.path(script_dir, "R", "palettes.R"))

check_dependencies()

suppressWarnings({
  library(ggplot2, quietly = TRUE, warn.conflicts = FALSE)
})

# ── Configuration ────────────────────────────────────────────────────────
test_glyphs <- list(
  list(id = "athanor",        fn = "glyph_athanor",       domain = "alchemy"),
  list(id = "make-fire",      fn = "glyph_flame",         domain = "bushcraft"),
  list(id = "setup-gxp-r-project", fn = "glyph_shield_check", domain = "compliance"),
  list(id = "serialize-data-formats", fn = "glyph_brackets_stream", domain = "data-serialization"),
  list(id = "tai-chi",        fn = "glyph_yin_yang",      domain = "defensive")
)

all_sizes <- "--all-sizes" %in% commandArgs(trailingOnly = TRUE)
sizes <- if (all_sizes) c(256, 512, 768, 1024) else c(512, 1024)
sigma_for_size <- function(sz) if (sz <= 512) 4 else 8

# ── Per-step profiling function ──────────────────────────────────────────
profile_one <- function(glyph_info, size_px) {
  color <- get_palette_colors("cyberpunk")$domains[[glyph_info$domain]]
  bright_color <- brighten_hex(color, 1.4)
  glyph_fn <- match.fun(glyph_info$fn)
  glow_sigma <- sigma_for_size(size_px)
  timings <- list()

  # Step 1: glyph function call
  t0 <- proc.time()
  glyph_layers <- glyph_fn(cx = 50, cy = 50, s = 1.0,
                             col = color, bright = bright_color)
  timings$glyph_fn <- (proc.time() - t0)["elapsed"]

  # Step 2: ggplot construction
  t0 <- proc.time()
  p <- ggplot2::ggplot() +
    ggplot2::coord_fixed(xlim = c(0, 100), ylim = c(0, 100), expand = FALSE) +
    ggplot2::theme_void() +
    ggplot2::theme(
      plot.background = ggplot2::element_rect(fill = "transparent", color = NA),
      panel.background = ggplot2::element_rect(fill = "transparent", color = NA),
      plot.margin = ggplot2::margin(0, 0, 0, 0)
    )
  timings$ggplot_build <- (proc.time() - t0)["elapsed"]

  # Step 3: ggfx glow wrapping
  t0 <- proc.time()
  for (layer in glyph_layers) {
    if (inherits(layer, "list")) {
      for (sub_layer in layer) {
        p <- p + ggfx::with_outer_glow(sub_layer, colour = color,
                                         sigma = glow_sigma, expand = 3)
      }
    } else {
      p <- p + ggfx::with_outer_glow(layer, colour = color,
                                       sigma = glow_sigma, expand = 3)
    }
  }
  timings$glow_wrap <- (proc.time() - t0)["elapsed"]

  # Step 4: ragg PNG render
  tmp_png <- tempfile(fileext = ".png")
  t0 <- proc.time()
  ragg::agg_png(tmp_png, width = size_px, height = size_px,
                background = "transparent", res = 150)
  print(p)
  grDevices::dev.off()
  timings$ragg_png <- (proc.time() - t0)["elapsed"]

  # Step 5: magick WebP conversion
  tmp_webp <- tempfile(fileext = ".webp")
  t0 <- proc.time()
  img <- magick::image_read(tmp_png)
  magick::image_write(img, path = tmp_webp, format = "webp", quality = 80)
  timings$magick_webp <- (proc.time() - t0)["elapsed"]

  # File sizes
  png_kb <- file.info(tmp_png)$size / 1024
  webp_kb <- file.info(tmp_webp)$size / 1024

  unlink(c(tmp_png, tmp_webp))

  timings$total <- Reduce(`+`, timings)
  list(timings = timings, png_kb = png_kb, webp_kb = webp_kb)
}

# ── Run profiling ────────────────────────────────────────────────────────
cat("\n== Icon Render Pipeline Profiler ==\n\n")

results <- list()
for (sz in sizes) {
  cat(sprintf("--- %dx%d (sigma=%d) ---\n", sz, sz, sigma_for_size(sz)))
  for (g in test_glyphs) {
    cat(sprintf("  %-30s ", g$id))
    res <- profile_one(g, sz)
    t <- res$timings
    cat(sprintf(
      "glyph=%.3fs  plot=%.3fs  glow=%.3fs  png=%.3fs  webp=%.3fs  TOTAL=%.3fs  (png=%.0fKB webp=%.0fKB)\n",
      t$glyph_fn, t$ggplot_build, t$glow_wrap, t$ragg_png, t$magick_webp,
      t$total, res$png_kb, res$webp_kb
    ))
    results[[paste(g$id, sz, sep = "@")]] <- list(
      glyph = g$id, size = sz, timings = t,
      png_kb = res$png_kb, webp_kb = res$webp_kb
    )
  }
  cat("\n")
}

# ── Summary comparison ───────────────────────────────────────────────────
if (length(sizes) >= 2) {
  cat("== Speedup Summary (comparing largest vs smallest) ==\n\n")
  big <- max(sizes)
  small <- min(sizes)
  cat(sprintf("  %-30s %6s %6s %8s\n", "Glyph", paste0(big, "px"), paste0(small, "px"), "Speedup"))
  cat(sprintf("  %-30s %6s %6s %8s\n", "-----", "------", "------", "-------"))
  for (g in test_glyphs) {
    t_big <- results[[paste(g$id, big, sep = "@")]]$timings$total
    t_small <- results[[paste(g$id, small, sep = "@")]]$timings$total
    speedup <- t_big / t_small
    cat(sprintf("  %-30s %5.2fs %5.2fs %6.1fx\n", g$id, t_big, t_small, speedup))
  }

  # Average breakdown by step
  cat("\n== Average time by step ==\n\n")
  steps <- c("glyph_fn", "ggplot_build", "glow_wrap", "ragg_png", "magick_webp")
  cat(sprintf("  %-15s", "Step"))
  for (sz in sizes) cat(sprintf(" %7s", paste0(sz, "px")))
  cat("\n")
  cat(sprintf("  %-15s", "----"))
  for (sz in sizes) cat(sprintf(" %7s", "-------"))
  cat("\n")
  for (step in steps) {
    cat(sprintf("  %-15s", step))
    for (sz in sizes) {
      vals <- vapply(test_glyphs, function(g) {
        results[[paste(g$id, sz, sep = "@")]]$timings[[step]]
      }, numeric(1))
      cat(sprintf(" %6.3fs", mean(vals)))
    }
    cat("\n")
  }

  cat("\n== File size comparison ==\n\n")
  cat(sprintf("  %-30s %10s %10s %10s %10s\n",
              "Glyph", paste0(big, " PNG"), paste0(big, " WebP"),
              paste0(small, " PNG"), paste0(small, " WebP")))
  for (g in test_glyphs) {
    r_big <- results[[paste(g$id, big, sep = "@")]]
    r_small <- results[[paste(g$id, small, sep = "@")]]
    cat(sprintf("  %-30s %8.0f KB %8.0f KB %8.0f KB %8.0f KB\n",
                g$id, r_big$png_kb, r_big$webp_kb, r_small$png_kb, r_small$webp_kb))
  }
}

cat("\nDone.\n")
