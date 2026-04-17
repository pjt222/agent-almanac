#!/usr/bin/env Rscript
# build-agent-icons.R - Generate WebP icons for agents across palettes
#
# Parallel to build-icons.R (skills) but renders agent persona glyphs.
# Each agent gets a unique color per palette + glyph.
# Output: icons/<palette>/agents/<agentId>.webp
#
# Optimizations (Issue #25):
#   - Renders white template once per glyph, recolors per palette via magick
#   - Content-hash cache skips unchanged glyphs on incremental runs
#   - Default 512px + sigma 4 (was 1024 + sigma 8)
#
# Usage:
#   Rscript build-agent-icons.R                          # All palettes, all agents
#   Rscript build-agent-icons.R --palette cyberpunk      # Single palette
#   Rscript build-agent-icons.R --only mystic            # Single agent (all palettes)
#   Rscript build-agent-icons.R --skip-existing          # Skip existing WebP files
#   Rscript build-agent-icons.R --dry-run                # List what would be generated
#   Rscript build-agent-icons.R --palette-list           # List palette names
#   Rscript build-agent-icons.R --size 1024              # Override output size
#   Rscript build-agent-icons.R --glow-sigma 10          # Adjust glow intensity
#   Rscript build-agent-icons.R --workers 4              # Use 4 parallel workers
#   Rscript build-agent-icons.R --no-cache               # Ignore content-hash cache

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
source_all_primitives(script_dir)
source(file.path(script_dir, "R", "render.R"))
source(file.path(script_dir, "R", "palettes.R"))
source(file.path(script_dir, "R", "agent_primitives.R"))
source(file.path(script_dir, "R", "agent_glyphs.R"))
source(file.path(script_dir, "R", "agent_render.R"))

# ── Check dependencies ──────────────────────────────────────────────────
check_dependencies()

# ── Parse CLI args ───────────────────────────────────────────────────────
opts <- parse_cli_args()

if (opts$help) {
  print_usage(script_name = "build-agent-icons.R",
              filter_label = "<agent-id>",
              filter_desc = "Only generate icon for this agent")
  quit(status = 0)
}

if (opts$palette_list) {
  cat("Available palettes:\n")
  cat(paste(" ", PALETTE_NAMES, collapse = "\n"), "\n")
  quit(status = 0)
}

# ── Resolve palette list ────────────────────────────────────────────────
if (opts$palette == "all") {
  palettes_to_render <- PALETTE_NAMES
} else {
  if (!opts$palette %in% PALETTE_NAMES) {
    stop("Unknown palette: ", opts$palette,
         ". Use --palette-list to see options.", call. = FALSE)
  }
  palettes_to_render <- opts$palette
}

# ── Resolve output directory (icons vs icons-hd) ─────────────────────────
icon_output_dir <- if (opts$hd) "icons-hd" else "icons"

# ── Load manifest ────────────────────────────────────────────────────────
manifest_path <- file.path(script_dir, "public", "data", "agent-icon-manifest.json")
if (!file.exists(manifest_path)) {
  stop("Agent manifest not found: ", manifest_path, call. = FALSE)
}
manifest <- read_manifest(manifest_path)
icons <- manifest$icons

log_msg(sprintf("Loaded agent manifest: %d icons", length(icons)))

# ── Filter queue ─────────────────────────────────────────────────────────
queue <- icons
if (!is.null(opts$only)) {
  queue <- Filter(function(ic) ic$agentId == opts$only, queue)
  log_msg(sprintf("Filtered to agent: %s (%d icons)", opts$only, length(queue)))
}

# ── Dry run ──────────────────────────────────────────────────────────────
if (opts$dry_run) {
  log_msg("DRY RUN - would generate:")
  for (pal in palettes_to_render) {
    for (ic in queue) {
      out <- sprintf("%s/%s/agents/%s.webp", icon_output_dir, pal, ic$agentId)
      log_msg(sprintf("  [%s] %s -> %s", pal, ic$agentId, out))
    }
  }
  log_msg(sprintf("Total: %d agents x %d palettes = %d files",
                  length(queue), length(palettes_to_render),
                  length(queue) * length(palettes_to_render)))
  quit(status = 0)
}

# ── Generate icons ───────────────────────────────────────────────────────
if (length(queue) == 0) {
  log_msg("No agent icons to generate.")
  quit(status = 0)
}

suppressWarnings({
  library(ggplot2, quietly = TRUE, warn.conflicts = FALSE)
})

# ── Setup parallel workers ───────────────────────────────────────────────
setup_parallel(opts$workers)
on.exit(future::plan(future::sequential), add = TRUE)

# ── Pre-compute all palette colors ───────────────────────────────────────
all_pal_colors <- lapply(
  setNames(palettes_to_render, palettes_to_render),
  get_palette_colors
)

# ── Content-hash cache ───────────────────────────────────────────────────
cache_path <- file.path(script_dir, ".icon-cache.json")
icon_cache <- if (opts$no_cache) list() else read_icon_cache(cache_path)
new_cache <- icon_cache

# ── Phase 1: Render white templates (one per unique agent glyph) ─────────
template_dir <- file.path(tempdir(), "agent-icon-templates")
dir.create(template_dir, recursive = TRUE, showWarnings = FALSE)

unique_glyphs <- list()
for (ic in queue) {
  glyph_fn_name <- AGENT_GLYPHS[[ic$agentId]]
  if (is.null(glyph_fn_name)) glyph_fn_name <- "unknown"
  cache_key <- paste0("agent:", ic$agentId, if (opts$hd) "@hd" else "")

  # Include palette colors so a hex change in palettes.R invalidates this
  # agent's cache entry — fixes Issue #233
  agent_colors <- vapply(palettes_to_render, function(pal) {
    all_pal_colors[[pal]]$agents[[ic$agentId]] %||% ""
  }, character(1))
  current_hash <- compute_render_hash(glyph_fn_name, opts$glow_sigma,
                                       opts$size_px,
                                       palette_colors = agent_colors)

  if (!opts$no_cache && identical(icon_cache[[cache_key]], current_hash)) {
    all_exist <- all(vapply(palettes_to_render, function(pal) {
      out_path <- file.path(script_dir, "public", icon_output_dir, pal, "agents",
                            paste0(ic$agentId, ".webp"))
      file.exists(out_path)
    }, logical(1)))
    if (all_exist && !opts$skip_existing) next
  }

  new_cache[[cache_key]] <- current_hash

  if (is.null(unique_glyphs[[glyph_fn_name]])) {
    glyph_fn <- tryCatch(match.fun(glyph_fn_name), error = function(e) NULL)
    unique_glyphs[[glyph_fn_name]] <- list(
      fn_name = glyph_fn_name,
      fn      = glyph_fn,
      agents  = list()
    )
  }
  unique_glyphs[[glyph_fn_name]]$agents[[length(
    unique_glyphs[[glyph_fn_name]]$agents
  ) + 1]] <- ic
}

log_msg(sprintf("Rendering %d unique agent glyph templates", length(unique_glyphs)))

template_tasks <- lapply(names(unique_glyphs), function(fn_name) {
  list(
    fn_name      = fn_name,
    fn           = unique_glyphs[[fn_name]]$fn,
    template_png = file.path(template_dir, paste0(fn_name, ".png"))
  )
})

template_results <- furrr::future_map(template_tasks, function(task) {
  t0 <- proc.time()
  tryCatch({
    render_glyph_template(
      glyph_fn_name = task$fn_name,
      entity_id     = task$fn_name,
      out_png       = task$template_png,
      glow_sigma    = opts$glow_sigma,
      size_px       = opts$size_px,
      glyph_fn      = task$fn
    )
    elapsed <- (proc.time() - t0)["elapsed"]
    list(status = "ok", fn_name = task$fn_name, elapsed = elapsed)
  }, error = function(e) {
    elapsed <- (proc.time() - t0)["elapsed"]
    list(status = "error", fn_name = task$fn_name,
         message = conditionMessage(e), elapsed = elapsed)
  })
}, .options = furrr::furrr_options(seed = TRUE))

template_ok <- vapply(template_results, function(r) r$status == "ok",
                       logical(1))
if (!all(template_ok)) {
  for (r in template_results[!template_ok]) {
    log_msg(sprintf("TEMPLATE ERROR: %s: %s", r$fn_name, r$message))
  }
}
log_msg(sprintf("Templates rendered: %d ok, %d errors",
                sum(template_ok), sum(!template_ok)))

# ── Phase 2: Recolor templates per palette ───────────────────────────────
recolor_tasks <- list()
skipped_color <- 0
for (pal in palettes_to_render) {
  pal_colors <- all_pal_colors[[pal]]
  for (fn_name in names(unique_glyphs)) {
    template_png <- file.path(template_dir, paste0(fn_name, ".png"))
    if (!file.exists(template_png)) next

    for (ic in unique_glyphs[[fn_name]]$agents) {
      out_path <- file.path(script_dir, "public", icon_output_dir, pal, "agents",
                            paste0(ic$agentId, ".webp"))

      if (opts$skip_existing && file.exists(out_path)) next

      agent_color <- pal_colors$agents[[ic$agentId]]
      if (is.null(agent_color)) {
        log_msg(sprintf("ERROR: %s: No color in palette %s", ic$agentId, pal))
        skipped_color <- skipped_color + 1
        next
      }

      recolor_tasks[[length(recolor_tasks) + 1]] <- list(
        palette      = pal,
        agent_id     = ic$agentId,
        out_path     = out_path,
        color        = agent_color,
        template_png = template_png
      )
    }
  }
}

log_msg(sprintf("Queued %d recolor tasks across %d palettes (%d skipped for missing color)",
                length(recolor_tasks), length(palettes_to_render), skipped_color))

# ── Parallel recolor ─────────────────────────────────────────────────────
start_time <- proc.time()

results <- furrr::future_map(recolor_tasks, function(task) {
  t0 <- proc.time()
  tryCatch({
    dir.create(dirname(task$out_path), recursive = TRUE, showWarnings = FALSE)

    recolor_template(
      template_png = task$template_png,
      color        = task$color,
      out_path     = task$out_path
    )

    kb <- file_size_kb(task$out_path)
    elapsed <- (proc.time() - t0)["elapsed"]
    list(status = "ok", palette = task$palette, agent_id = task$agent_id,
         kb = kb, elapsed = elapsed)

  }, error = function(e) {
    elapsed <- (proc.time() - t0)["elapsed"]
    list(status = "error", palette = task$palette, agent_id = task$agent_id,
         message = conditionMessage(e), elapsed = elapsed)
  })
}, .options = furrr::furrr_options(seed = TRUE))

# ── Aggregate results ────────────────────────────────────────────────────
total_rendered <- 0
total_errors <- 0
for (res in results) {
  if (res$status == "ok") {
    log_msg(sprintf("OK: [%s] %s (%.1fKB)", res$palette, res$agent_id, res$kb))
    total_rendered <- total_rendered + 1
  } else {
    log_msg(sprintf("ERROR: [%s] %s: %s", res$palette, res$agent_id, res$message))
    total_errors <- total_errors + 1
  }
}
total_errors <- total_errors + skipped_color

# Update manifest status and paths for cyberpunk palette (standard builds only)
if ("cyberpunk" %in% palettes_to_render && !opts$hd) {
  for (ic in queue) {
    out_path <- file.path(script_dir, "public", icon_output_dir, "cyberpunk", "agents",
                          paste0(ic$agentId, ".webp"))
    for (j in seq_along(manifest$icons)) {
      if (manifest$icons[[j]]$agentId == ic$agentId) {
        if (file.exists(out_path)) {
          manifest$icons[[j]]$status <- "done"
          manifest$icons[[j]]$lastError <- NULL
        }
        manifest$icons[[j]]$path <- sprintf("public/icons/cyberpunk/agents/%s.webp",
                                             ic$agentId)
        break
      }
    }
  }
  write_manifest(manifest, manifest_path)
}

# Write updated cache
write_icon_cache(new_cache, cache_path)

# Clean up templates
unlink(template_dir, recursive = TRUE)

elapsed <- (proc.time() - start_time)["elapsed"]
log_msg(sprintf("All done: %d rendered, %d errors across %d palettes in %.1fs",
                total_rendered, total_errors, length(palettes_to_render), elapsed))
