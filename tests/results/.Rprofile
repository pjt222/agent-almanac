# renv activation via source("renv/activate.R") hangs on drvfs mounts —
# both WSL-native R and Windows R/Rscript on /mnt/ paths.
# Workaround: set library paths directly instead of activating renv.
if (file.exists("renv/activate.R")) {
  lib_root <- file.path("renv", "library")
  if (dir.exists(lib_root)) {
    platform_dirs <- list.files(lib_root, full.names = TRUE)
    if (length(platform_dirs) > 0) {
      is_linux <- (.Platform$OS.type == "unix")
      pattern <- if (is_linux) "^linux" else "^windows"
      matched <- grep(pattern, basename(platform_dirs), value = TRUE)
      if (length(matched) > 0) {
        lib_dir <- file.path(lib_root, matched[1])
        r_dirs <- list.files(lib_dir, full.names = TRUE)
        if (length(r_dirs) > 0) {
          .libPaths(c(r_dirs[1], .libPaths()))
          message("Note: renv library loaded directly (activate.R bypassed)")
        }
      }
    }
  }
}
