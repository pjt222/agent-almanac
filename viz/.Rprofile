# renv activation via source("renv/activate.R") hangs on this project —
# both WSL-native R (p9_client_rpc deadlock on drvfs) and Windows R/Rscript.
# See: https://github.com/pjt222/agent-almanac/issues/52
#
# Workaround: set library paths directly instead of activating renv.
if (file.exists("renv/activate.R")) {
  lib_root <- file.path("renv", "library")
  if (dir.exists(lib_root)) {
    platform_dirs <- list.files(lib_root, full.names = TRUE)
    if (length(platform_dirs) > 0) {
      # Pick the platform dir matching the current R (linux or windows)
      is_linux <- (.Platform$OS.type == "unix")
      pattern <- if (is_linux) "^linux" else "^windows"
      matched <- grep(pattern, basename(platform_dirs), value = TRUE)
      if (length(matched) > 0) {
        lib_dir <- file.path(lib_root, matched[1])
        # Walk down to the R-version/arch directory
        r_dirs <- list.files(lib_dir, full.names = TRUE)
        if (length(r_dirs) > 0) {
          # Walk into arch subdirectory (e.g. x86_64-pc-linux-gnu/)
          arch_dirs <- list.files(r_dirs[1], full.names = TRUE)
          if (length(arch_dirs) > 0) {
            .libPaths(c(arch_dirs[1], .libPaths()))
          } else {
            .libPaths(c(r_dirs[1], .libPaths()))
          }
          message("Note: renv library loaded directly (activate.R bypassed)")
        }
      }
    }
  }
}

if (requireNamespace("mcptools", quietly = TRUE)) {
  mcptools::mcp_session()
}
