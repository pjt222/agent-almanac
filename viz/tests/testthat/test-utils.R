# Navigate from tests/testthat/ up to viz/ then into R/utils.R
viz_root <- normalizePath(file.path(testthat::test_path(), "..", ".."), mustWork = TRUE)
source(file.path(viz_root, "R", "utils.R"))

# ── parse_cli_args ───────────────────────────────────────────────────────────

test_that("parse_cli_args returns defaults with no arguments", {
  opts <- parse_cli_args(character(0))
  expect_null(opts$only)
  expect_equal(opts$palette, "all")
  expect_false(opts$skip_existing)
  expect_false(opts$dry_run)
  expect_false(opts$hd)
  expect_false(opts$help)
  expect_false(opts$no_cache)
})

test_that("parse_cli_args handles --palette flag", {
  opts <- parse_cli_args(c("--palette", "cyberpunk"))
  expect_equal(opts$palette, "cyberpunk")
})

test_that("parse_cli_args handles --skip-existing flag", {
  opts <- parse_cli_args(c("--skip-existing"))
  expect_true(opts$skip_existing)
})

test_that("parse_cli_args handles --hd flag", {
  opts <- parse_cli_args(c("--hd"))
  expect_true(opts$hd)
})

test_that("parse_cli_args handles --dry-run flag", {
  opts <- parse_cli_args(c("--dry-run"))
  expect_true(opts$dry_run)
})

test_that("parse_cli_args handles --only flag", {
  opts <- parse_cli_args(c("--only", "r-packages"))
  expect_equal(opts$only, "r-packages")
})

test_that("parse_cli_args handles --no-cache flag", {
  opts <- parse_cli_args(c("--no-cache"))
  expect_true(opts$no_cache)
})

test_that("parse_cli_args handles --size flag", {
  opts <- parse_cli_args(c("--size", "1024"))
  expect_equal(opts$size_px, 1024L)
})

test_that("parse_cli_args handles multiple flags", {
  opts <- parse_cli_args(c("--palette", "magma", "--hd", "--skip-existing"))
  expect_equal(opts$palette, "magma")
  expect_true(opts$hd)
  expect_true(opts$skip_existing)
})

# ── hex_to_rgb ───────────────────────────────────────────────────────────────

test_that("hex_to_rgb converts white correctly", {
  rgb <- hex_to_rgb("#ffffff")
  expect_equal(rgb[["r"]], 255)
  expect_equal(rgb[["g"]], 255)
  expect_equal(rgb[["b"]], 255)
})

test_that("hex_to_rgb converts black correctly", {
  rgb <- hex_to_rgb("#000000")
  expect_equal(rgb[["r"]], 0)
  expect_equal(rgb[["g"]], 0)
  expect_equal(rgb[["b"]], 0)
})

test_that("hex_to_rgb converts red correctly", {
  rgb <- hex_to_rgb("#ff0000")
  expect_equal(rgb[["r"]], 255)
  expect_equal(rgb[["g"]], 0)
  expect_equal(rgb[["b"]], 0)
})

test_that("hex_to_rgb handles uppercase hex", {
  rgb <- hex_to_rgb("#FF00FF")
  expect_equal(rgb[["r"]], 255)
  expect_equal(rgb[["g"]], 0)
  expect_equal(rgb[["b"]], 255)
})
