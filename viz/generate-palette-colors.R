#!/usr/bin/env Rscript
# generate-palette-colors.R - Generate palette-colors.json from viridisLite
#
# Usage: Rscript generate-palette-colors.R
# Output: data/palette-colors.json

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

# ── Source dependencies ──────────────────────────────────────────────────
source(file.path(script_dir, "R", "utils.R"))
source(file.path(script_dir, "R", "palettes.R"))

# ── Check viridisLite ────────────────────────────────────────────────────
if (!requireNamespace("viridisLite", quietly = TRUE)) {
  stop("viridisLite package required. Install with: install.packages('viridisLite')",
       call. = FALSE)
}

if (!requireNamespace("jsonlite", quietly = TRUE)) {
  stop("jsonlite package required. Install with: install.packages('jsonlite')",
       call. = FALSE)
}

# ── Generate JSON ────────────────────────────────────────────────────────
out_path <- file.path(script_dir, "public", "data", "palette-colors.json")
export_palette_json(out_path)

# ── Generate JS module ───────────────────────────────────────────────────
js_path <- file.path(script_dir, "js", "colors-generated.js")
export_palette_js(js_path)

log_msg("Done.")
