#!/usr/bin/env Rscript
# build-all-icons.R - Unified build orchestrator for all icon types
#
# Runs skill, agent, and team icon builds in a single R session to avoid
# repeated cold-start overhead (R startup + renv + package loading).
#
# Usage:
#   Rscript build-all-icons.R                         # Build all types, all palettes
#   Rscript build-all-icons.R --type skill             # Skills only
#   Rscript build-all-icons.R --type agent             # Agents only
#   Rscript build-all-icons.R --type team              # Teams only
#   Rscript build-all-icons.R --type skill,agent       # Skills + agents
#   Rscript build-all-icons.R --palette cyberpunk      # Single palette
#   Rscript build-all-icons.R --no-cache               # Ignore content-hash cache
#   Rscript build-all-icons.R --help                   # Show help
#
# All other flags (--only, --skip-existing, --dry-run, --size, --glow-sigma,
# --workers, --palette-list) are passed through to the individual build scripts.

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
setwd(script_dir)     # Ensure CWD is viz/ for child process stability

# ── Parse --type and --help from args ────────────────────────────────────
args <- commandArgs(trailingOnly = TRUE)

if ("--help" %in% args || "-h" %in% args) {
  cat("Usage: Rscript build-all-icons.R [--type TYPE] [OPTIONS]\n\n")
  cat("Orchestrates skill, agent, and team icon builds in one R session.\n\n")
  cat("Options:\n")
  cat("  --type <types>      Comma-separated types to build: all, skill, agent, team\n")
  cat("                      (default: all)\n")
  cat("  --hd                Build both standard (512px) and high-res (1024px) icons\n")
  cat("  --strict            Exit immediately if any sub-script fails (non-zero exit)\n")
  cat("  All other flags are passed through to individual build scripts.\n")
  cat("  Run Rscript build-icons.R --help for full option list.\n")
  quit(status = 0)
}

# Extract --type flag
build_types <- c("skill", "agent", "team")  # default: all
type_idx <- which(args == "--type")
if (length(type_idx) > 0 && type_idx[1] < length(args)) {
  type_val <- args[type_idx[1] + 1]
  if (type_val == "all") {
    build_types <- c("skill", "agent", "team")
  } else {
    build_types <- trimws(strsplit(type_val, ",")[[1]])
    invalid <- setdiff(build_types, c("skill", "agent", "team"))
    if (length(invalid) > 0) {
      stop("Invalid type(s): ", paste(invalid, collapse = ", "),
           ". Must be: skill, agent, team, or all", call. = FALSE)
    }
  }
  # Remove --type and its value from args before passing through
  args <- args[-c(type_idx[1], type_idx[1] + 1)]
}

# Extract --strict flag (exit on first sub-script failure)
strict_mode <- "--strict" %in% args
if (strict_mode) {
  args <- args[args != "--strict"]
}

# Extract --hd flag (dual-pass: standard + high-res)
hd_mode <- "--hd" %in% args
if (hd_mode) {
  args <- args[args != "--hd"]
}

# ── Build each type ──────────────────────────────────────────────────────
scripts <- list(
  skill = file.path(script_dir, "build-icons.R"),
  agent = file.path(script_dir, "build-agent-icons.R"),
  team  = file.path(script_dir, "build-team-icons.R")
)

# Define passes from config: standard always runs; HD pass added when --hd is set
# Read config for base values (fall back to defaults if config package unavailable)
cfg_size    <- tryCatch(get_config()$size_px,       error = function(e) 512)
cfg_sigma   <- tryCatch(get_config()$glow_sigma,    error = function(e) 4)
cfg_mult    <- tryCatch(get_config()$hd_multiplier, error = function(e) 2)

passes <- list(
  list(label = "standard", size = as.character(cfg_size),
       sigma = as.character(cfg_sigma), extra_args = character(0))
)
if (hd_mode) {
  passes[[2]] <- list(label = "high-res",
                      size = as.character(cfg_size * cfg_mult),
                      sigma = as.character(cfg_sigma * cfg_mult),
                      extra_args = c("--hd"))
}

# ── Manifest freshness check ──────────────────────────────────────────
manifest_path <- file.path(script_dir, "public", "data", "icon-manifest.json")
registry_path <- file.path(script_dir, "..", "skills", "_registry.yml")

if (file.exists(manifest_path) && file.exists(registry_path)) {
  manifest_data <- jsonlite::fromJSON(manifest_path)
  icons_data <- manifest_data$icons
  manifest_count <- if (is.data.frame(icons_data)) nrow(icons_data) else length(icons_data)

  registry_lines <- readLines(registry_path)
  registry_count <- as.integer(
    sub(".*:\\s*", "", grep("^total_skills:", registry_lines, value = TRUE)[1])
  )

  if (!is.na(registry_count) && manifest_count != registry_count) {
    message(sprintf(
      "\n[WARN] Manifest has %d icons but registry has %d skills.",
      manifest_count, registry_count))
    message("  The manifest may be stale. Run the data pipeline first:")
    message("    node build-data.js && node build-icon-manifest.js")
    message("  Or use: bash build.sh (runs the full pipeline)\n")
    if (strict_mode) {
      stop("Stale manifest detected in --strict mode. Aborting.", call. = FALSE)
    }
  }
} else if (!file.exists(manifest_path)) {
  stop("Manifest not found: ", manifest_path,
       "\n  Run: node build-data.js && node build-icon-manifest.js",
       call. = FALSE)
}

overall_start <- proc.time()

for (pass in passes) {
  if (length(passes) > 1) {
    message(sprintf("\n>>>>>>>>>> Pass: %s (%spx, sigma=%s) <<<<<<<<<<\n",
                    pass$label, pass$size, pass$sigma))
  }

  for (type in build_types) {
    script_path <- scripts[[type]]
    if (!file.exists(script_path)) {
      message(sprintf("[WARN] Script not found: %s, skipping %s icons", script_path, type))
      next
    }

    message(sprintf("\n========== Building %s icons (%s) ==========\n",
                    toupper(type), pass$label))

    # Build args: base args + size/sigma overrides + extra args (--hd)
    pass_args <- c(args, "--size", pass$size, "--glow-sigma", pass$sigma,
                   pass$extra_args)
    arg_str <- paste(shQuote(pass_args), collapse = " ")
    cmd <- sprintf("Rscript %s %s", shQuote(script_path), arg_str)
    message(sprintf("Running: %s", cmd))
    exit_code <- system(cmd)
    if (exit_code != 0) {
      message(sprintf("[ERROR] %s icon build (%s) exited with code %d",
                      type, pass$label, exit_code))
      if (strict_mode) {
        quit(status = exit_code, save = "no")
      }
    }
  }
}

overall_elapsed <- (proc.time() - overall_start)["elapsed"]
message(sprintf("\n========== All builds complete in %.1fs ==========", overall_elapsed))
