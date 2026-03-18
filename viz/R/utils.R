# utils.R - CLI parsing, manifest I/O, color utilities
# Part of the R-based icon generation pipeline

# ── Hex color utilities ──────────────────────────────────────────────────
hex_to_rgb <- function(hex) {
  hex <- sub("^#", "", hex)
  r <- strtoi(substr(hex, 1, 2), 16L)
  g <- strtoi(substr(hex, 3, 4), 16L)
  b <- strtoi(substr(hex, 5, 6), 16L)
  c(r = r, g = g, b = b)
}

hex_with_alpha <- function(hex, alpha = 1) {
  rgb_vals <- hex_to_rgb(hex)
  grDevices::rgb(rgb_vals["r"], rgb_vals["g"], rgb_vals["b"],
                 alpha = alpha * 255, maxColorValue = 255)
}

brighten_hex <- function(hex, factor = 1.3) {
  rgb_vals <- hex_to_rgb(hex)
  r <- min(255, round(rgb_vals["r"] * factor))
  g <- min(255, round(rgb_vals["g"] * factor))
  b <- min(255, round(rgb_vals["b"] * factor))
  grDevices::rgb(r, g, b, maxColorValue = 255)
}

dim_hex <- function(hex, factor = 0.4) {
  brighten_hex(hex, factor)
}

blend_hex <- function(hexes) {
  rgbs <- lapply(hexes, hex_to_rgb)
  avg_r <- round(mean(vapply(rgbs, `[`, numeric(1), "r")))
  avg_g <- round(mean(vapply(rgbs, `[`, numeric(1), "g")))
  avg_b <- round(mean(vapply(rgbs, `[`, numeric(1), "b")))
  grDevices::rgb(avg_r, avg_g, avg_b, maxColorValue = 255)
}

# ── CLI argument parsing ─────────────────────────────────────────────────
parse_cli_args <- function(args = commandArgs(trailingOnly = TRUE)) {
  opts <- list(
    only          = NULL,
    palette       = "all",
    palette_list  = FALSE,
    skip_existing = FALSE,
    dry_run       = FALSE,
    glow_sigma    = 4,
    size_px       = 512,
    workers       = max(1, parallel::detectCores() - 1),
    no_cache      = FALSE,
    hd            = TRUE,
    help          = FALSE
  )

  i <- 1
  while (i <= length(args)) {
    arg <- args[i]
    if (arg == "--only" && i < length(args)) {
      i <- i + 1
      opts$only <- args[i]
    } else if (arg == "--palette" && i < length(args)) {
      i <- i + 1
      opts$palette <- args[i]
    } else if (arg == "--palette-list") {
      opts$palette_list <- TRUE
    } else if (arg == "--skip-existing") {
      opts$skip_existing <- TRUE
    } else if (arg == "--dry-run") {
      opts$dry_run <- TRUE
    } else if (arg == "--glow-sigma" && i < length(args)) {
      i <- i + 1
      opts$glow_sigma <- as.numeric(args[i])
    } else if (arg == "--size" && i < length(args)) {
      i <- i + 1
      opts$size_px <- as.integer(args[i])
    } else if (arg == "--workers" && i < length(args)) {
      i <- i + 1
      opts$workers <- as.integer(args[i])
    } else if (arg == "--no-cache") {
      opts$no_cache <- TRUE
    } else if (arg == "--hd") {
      opts$hd <- TRUE
    } else if (arg == "--no-hd") {
      opts$hd <- FALSE
    } else if (arg %in% c("--help", "-h")) {
      opts$help <- TRUE
    }
    i <- i + 1
  }
  opts
}

print_usage <- function(script_name = "build-icons.R",
                        filter_label = "<domain>",
                        filter_desc = "Only generate icons for this domain") {
  cat(sprintf("Usage: Rscript %s [OPTIONS]\n\n", script_name))
  cat("Options:\n")
  cat(sprintf("  --only %-12s %s\n", filter_label, filter_desc))
  cat("  --palette <name>    Palette to render (default: all). One of: cyberpunk,\n")
  cat("                      viridis, magma, inferno, plasma, cividis, mako, rocket, turbo\n")
  cat("  --palette-list      List available palette names and exit\n")
  cat("  --skip-existing     Skip icons marked 'done' with existing WebP files\n")
  cat("  --dry-run           List what would be generated without rendering\n")
  cat("  --size <n>          Output dimension in pixels (default: 512)\n")
  cat("  --glow-sigma <n>    Glow blur radius (default: 4)\n")
  cat(sprintf("  --workers <n>       Parallel workers (default: %d = detectCores()-1)\n",
              max(1, parallel::detectCores() - 1)))
  cat("  --no-cache          Ignore content-hash cache, re-render everything\n")
  cat("  --hd                Output to icons-hd/ directory (default: enabled)\n")
  cat("  --no-hd             Skip HD variant (output standard size only)\n")
  cat("  --help, -h          Show this help message\n")
}

# ── Manifest I/O ─────────────────────────────────────────────────────────
read_manifest <- function(path) {
  jsonlite::fromJSON(path, simplifyVector = FALSE)
}

write_manifest <- function(manifest, path) {
  jsonlite::write_json(manifest, path, pretty = TRUE, auto_unbox = TRUE)
}

# ── Dependency check ─────────────────────────────────────────────────────
check_dependencies <- function() {
  required <- c("ggplot2", "ggforce", "ggfx", "ragg", "jsonlite", "magick",
                 "future", "furrr", "digest", "yaml")
  missing <- required[!vapply(required, requireNamespace, logical(1),
                              quietly = TRUE)]
  if (length(missing) > 0) {
    stop(
      "Missing required packages: ", paste(missing, collapse = ", "), "\n",
      "Install with: install.packages(c(",
      paste0('"', missing, '"', collapse = ", "), "))",
      call. = FALSE
    )
  }
  invisible(TRUE)
}

# ── Logging ──────────────────────────────────────────────────────────────
log_msg <- function(...) {
  msg <- paste0("[", format(Sys.time(), "%Y-%m-%d %H:%M:%S"), "] ", ...)
  message(msg)
}

# ── File utilities ─────────────────────────────────────────────────────
file_size_kb <- function(path) {
  info <- file.info(path)
  if (is.na(info$size)) return(0)
  info$size / 1024
}

log_ok <- function(domain, skill_id, seed, file_size_kb) {
  log_msg(sprintf("OK: %s/%s (seed=%d, %.1fKB)", domain, skill_id, seed,
                  file_size_kb))
}

log_error <- function(domain, skill_id, err_msg) {
  log_msg(sprintf("ERROR: %s/%s: %s", domain, skill_id, err_msg))
}

# ── Content-hash cache for incremental rendering ─────────────────────────
# Hash inputs per icon: glyph function body + glow_sigma + size_px
# Stored at viz/.icon-cache.json

#' Compute a render hash for a single icon configuration
#'
#' @param glyph_fn_name Name of the glyph function
#' @param glow_sigma Glow blur sigma
#' @param size_px Output size in pixels
#' @return Character string hash (MD5)
compute_render_hash <- function(glyph_fn_name, glow_sigma, size_px) {
  fn_body <- tryCatch(
    paste(deparse(match.fun(glyph_fn_name)), collapse = "\n"),
    error = function(e) glyph_fn_name
  )
  input_str <- paste(fn_body, glow_sigma, size_px, sep = "|")
  digest::digest(input_str, algo = "md5", serialize = FALSE)
}

#' Read the icon cache from disk
#'
#' @param cache_path Path to .icon-cache.json
#' @return Named list of entity_id -> hash
read_icon_cache <- function(cache_path) {
  if (!file.exists(cache_path)) return(list())
  tryCatch(
    jsonlite::fromJSON(cache_path, simplifyVector = FALSE),
    error = function(e) {
      warning("Corrupted icon cache at '", cache_path, "', rebuilding: ",
              conditionMessage(e), call. = FALSE)
      list()
    }
  )
}

#' Write the icon cache to disk
#'
#' @param cache Named list of entity_id -> hash
#' @param cache_path Path to .icon-cache.json
write_icon_cache <- function(cache, cache_path) {
  dir.create(dirname(cache_path), recursive = TRUE, showWarnings = FALSE)
  jsonlite::write_json(cache, cache_path, pretty = TRUE, auto_unbox = TRUE)
}

# ── Platform detection and configuration ──────────────────────────────
detect_platform <- function() {
  if (nzchar(Sys.getenv("DOCKER_CONTAINER"))) return("docker")
  if (.Platform$OS.type == "unix") {
    if (grepl("microsoft|WSL", Sys.info()["release"], ignore.case = TRUE)) {
      return("wsl")
    }
    return("wsl")  # default unix = wsl in this project
  }
  "windows"
}

get_config <- function(platform = detect_platform()) {
  config_path <- file.path(
    get_script_dir_cached(),
    "config.yml"
  )
  if (!file.exists(config_path) || !requireNamespace("config", quietly = TRUE)) {
    warning("config.yml or config package not available, using defaults",
            call. = FALSE)
    return(list(
      r_path = "Rscript",
      renv_platform = if (.Platform$OS.type == "unix") "linux" else "windows",
      parallel = list(
        strategy = if (.Platform$OS.type == "unix") "multicore" else "multisession",
        workers = max(1L, parallel::detectCores() - 1L)
      )
    ))
  }
  config::get(config = platform, file = config_path)
}

# Cached script dir for use in get_config (avoids re-parsing args)
get_script_dir_cached <- function() {
  if (exists("script_dir", envir = globalenv())) {
    return(get("script_dir", envir = globalenv()))
  }
  if (file.exists("R/utils.R")) return(normalizePath("."))
  if (file.exists("viz/R/utils.R")) return(normalizePath("viz"))
  "."
}

setup_parallel <- function(workers = NULL) {
  cfg <- get_config()
  if (is.null(workers)) {
    workers <- cfg$parallel$workers %||% max(1L, parallel::detectCores() - 1L)
  }
  strategy <- cfg$parallel$strategy %||%
    if (.Platform$OS.type == "unix") "multicore" else "multisession"

  plan_fn <- switch(strategy,
    multicore    = future::multicore,
    multisession = future::multisession,
    sequential   = future::sequential,
    future::multicore  # fallback
  )
  future::plan(plan_fn, workers = workers)
  log_msg(sprintf("Using %d parallel workers (%s)", workers, strategy))
  invisible(list(workers = workers, strategy = strategy))
}

# Null-coalescing operator (if not already available)
`%||%` <- function(a, b) if (is.null(a)) b else a
