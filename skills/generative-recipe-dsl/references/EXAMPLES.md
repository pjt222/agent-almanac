# Generative Recipe DSL — Extended Examples

A complete worked example in a non-icon domain: **service status badges** for an
engineering fleet. Each service gets one badge pictogram recipe under
`badges/recipes/<service>.json`. The same JSON renders in two styles:

- `mono` — ink on paper with scanline hatching (printed runbooks)
- `dashboard` — flat color ramp on a dark ground (web dashboard)

All code below was run and verified end-to-end (R 4.6.0, ggplot2 + jsonlite + ragg):
both seed recipes PASS the full gate in both styles, a deliberately broken recipe
FAILs with exit 1, and the rendered PNGs read correctly in both styles.

## The interpreter — `badge_dsl.R`

One audited code path. Note the two hard errors (unknown shape, unknown role): a
recipe using vocabulary outside the schema must fail the gate, never render as a
silent default.

```r
# badge_dsl.R — the badge recipe interpreter: agents write JSON, this draws it.
#
# A recipe is data, not code:
#   {"_intent": "one-line human note",
#    "symmetry": "bilateral"|"none",
#    "layers": [{"shape": ..., "role": ..., "mirror": true?, ...params}]}
#
# Shapes: polygon {points} . ngon {cx,cy,r,n,rot?} . circle {cx,cy,r}
#         rect {x0,y0,x1,y1} . arc {cx,cy,r,from,to} . zigzag {x0,y0,x1,y1,amp,n}
# Roles are STYLE SLOTS so one recipe renders in both badge styles unchanged:
#   ground  mono: paper fill + ink outline + hatch   dashboard: base fill + frame outline
#   mass    mono: solid ink                          dashboard: body fill + frame outline
#   accent  mono: paper + ink outline + tight hatch  dashboard: highlight fill + frame outline
#   spark   mono: solid ink (small marks)            dashboard: signal fill, no outline
#   detail  mono: solid paper (cutouts on a mass)    dashboard: signal fill, no outline
#   line    mono: soft ink path (no fill)            dashboard: highlight path
# Local coordinates within +-36 by convention; hard validator limit +-45. +y is up.

BADGE_ROLES <- c("ground", "mass", "accent", "spark", "detail", "line")

deg2rad <- function(deg) deg * pi / 180

poly_regular <- function(cx, cy, r, n, rot = 90) {
  theta <- deg2rad(rot) + seq(0, 2 * pi, length.out = n + 1)[-(n + 1)]
  data.frame(x = cx + r * cos(theta), y = cy + r * sin(theta))
}

arc_points <- function(cx, cy, r, from, to, n = 32) {
  theta <- seq(deg2rad(from), deg2rad(to), length.out = n)
  data.frame(x = cx + r * cos(theta), y = cy + r * sin(theta))
}

# Horizontal scanline hatch clipped to the polygon (even-odd rule).
hatch_polygon <- function(geometry, spacing = 2.4) {
  ys <- seq(min(geometry$y) + spacing / 2, max(geometry$y), by = spacing)
  n <- nrow(geometry)
  segments <- list()
  for (scan_y in ys) {
    crossings <- c()
    for (i in seq_len(n)) {
      j <- if (i == n) 1 else i + 1
      y1 <- geometry$y[i]; y2 <- geometry$y[j]
      if ((y1 <= scan_y) != (y2 <= scan_y)) {
        t <- (scan_y - y1) / (y2 - y1)
        crossings <- c(crossings, geometry$x[i] + t * (geometry$x[j] - geometry$x[i]))
      }
    }
    crossings <- sort(crossings)
    for (k in seq_len(length(crossings) %/% 2)) {
      segments[[length(segments) + 1]] <- data.frame(
        x = crossings[2 * k - 1], xend = crossings[2 * k], y = scan_y, yend = scan_y)
    }
  }
  do.call(rbind, segments)
}

layer_polygon <- function(geometry, fill, colour, linewidth = 0.45) {
  ggplot2::annotate("polygon", x = geometry$x, y = geometry$y,
                    fill = fill, colour = colour, linewidth = linewidth)
}
layer_path <- function(geometry, colour, linewidth) {
  ggplot2::annotate("path", x = geometry$x, y = geometry$y,
                    colour = colour, linewidth = linewidth)
}
layer_segments <- function(segs, colour, linewidth) {
  ggplot2::annotate("segment", x = segs$x, xend = segs$xend, y = segs$y, yend = segs$yend,
                    colour = colour, linewidth = linewidth)
}

# The styles' concrete slot mappings — adding a third style touches ONLY this file.
MONO_STYLE <- list(mode = "mono", paper = "#f4ead8", ink = "#2b2119", ink_soft = "#4a3b2a")
DASHBOARD_STYLE <- list(mode = "dashboard", base = "#1d2733", body = "#3a86c8",
                        highlight = "#7fd0f7", signal = "#ffd166", frame = "#0c1118")

badge_layer_geometry <- function(layer) {
  shape <- layer$shape
  if (shape == "polygon") {
    pts <- do.call(rbind, lapply(layer$points, function(p) c(p[[1]], p[[2]])))
    return(data.frame(x = pts[, 1], y = pts[, 2]))
  }
  if (shape == "ngon" || shape == "circle") {
    sides_n <- if (shape == "circle") 48 else layer$n
    rot <- if (!is.null(layer$rot)) layer$rot else 90
    return(poly_regular(layer$cx, layer$cy, layer$r, sides_n, rot))
  }
  if (shape == "rect") {
    return(data.frame(x = c(layer$x0, layer$x1, layer$x1, layer$x0),
                      y = c(layer$y0, layer$y0, layer$y1, layer$y1)))
  }
  if (shape == "arc") {
    return(arc_points(layer$cx, layer$cy, layer$r, layer$from, layer$to))
  }
  if (shape == "zigzag") {
    t_seq <- seq(0, 1, length.out = 2 * layer$n + 1)
    dx <- layer$x1 - layer$x0; dy <- layer$y1 - layer$y0
    seg_len <- sqrt(dx^2 + dy^2)
    perp_x <- -dy / seg_len; perp_y <- dx / seg_len
    offset <- rep(c(0, layer$amp), length.out = length(t_seq)) *
      rep(c(1, -1), length.out = length(t_seq))
    return(data.frame(x = layer$x0 + t_seq * dx + offset * perp_x,
                      y = layer$y0 + t_seq * dy + offset * perp_y))
  }
  stop("badge_dsl: unknown shape '", shape, "'", call. = FALSE)  # hard error, never skip
}

badge_role_layers <- function(geometry, layer, style) {
  role <- layer$role
  if (!role %in% BADGE_ROLES) {
    stop("badge_dsl: unknown role '", role, "'", call. = FALSE)  # hard error, never skip
  }
  lw <- if (!is.null(layer$lw)) layer$lw else 0.5
  is_path <- layer$shape %in% c("arc", "zigzag")
  if (style$mode == "mono") {
    if (is_path || role == "line") return(list(layer_path(geometry, style$ink_soft, lw)))
    if (role == "mass") return(list(layer_polygon(geometry, style$ink, style$ink, 0.4)))
    if (role == "spark") return(list(layer_polygon(geometry, style$ink, NA)))
    if (role == "detail") return(list(layer_polygon(geometry, style$paper, NA)))
    # ground / accent: outlined paper with hatching (accent hatches tighter)
    spacing <- if (role == "accent") 1.6 else 2.4
    list(layer_polygon(geometry, style$paper, style$ink, 0.6),
         layer_segments(hatch_polygon(geometry, spacing), style$ink, 0.25))
  } else {
    if (is_path || role == "line") return(list(layer_path(geometry, style$highlight, lw)))
    fill_color <- switch(role, ground = style$base, mass = style$body,
                         accent = style$highlight, spark = style$signal, detail = style$signal)
    outline <- if (role %in% c("spark", "detail")) NA else style$frame
    list(layer_polygon(geometry, fill_color, outline, 0.45))
  }
}

# Compile a recipe (parsed JSON list) into a badge function(cx, cy, s, style).
badge_from_spec <- function(recipe) {
  layers_spec <- recipe$layers
  bilateral <- identical(recipe$symmetry, "bilateral")
  function(cx, cy, s, style) {
    out <- list()
    for (layer in layers_spec) {
      geometry <- badge_layer_geometry(layer)
      variants <- list(geometry)
      if (bilateral && isTRUE(layer$mirror)) {
        variants[[2]] <- transform(geometry, x = -x)
      }
      for (geom in variants) {
        placed <- transform(geom, x = cx + x * s, y = cy + y * s)
        out <- c(out, badge_role_layers(placed, layer, style))
      }
    }
    out
  }
}

# Load every recipe under recipes/*.json into name -> badge function entries.
load_badge_recipes <- function(recipes_dir) {
  recipe_paths <- Sys.glob(file.path(recipes_dir, "*.json"))
  recipes <- list()
  for (path in recipe_paths) {
    badge_name <- sub("\\.json$", "", basename(path))
    recipes[[badge_name]] <- badge_from_spec(
      jsonlite::fromJSON(path, simplifyVector = FALSE))
  }
  recipes
}
```

## The validator gate — `validate_badges.R`

Compile + bounds + real render in BOTH styles; `--fast` skips only the render. Exit
1 on any failure so agents and CI can gate on it.

```r
#!/usr/bin/env Rscript
# validate_badges.R — compile + bounds + render given badge recipes in BOTH styles;
# exit 1 on any failure. The gate every generated recipe must pass to count as done.
#
# Usage:
#   Rscript validate_badges.R                              # all recipes, full gate
#   Rscript validate_badges.R message-queue auth-gateway   # named recipes
#   Rscript validate_badges.R --fast                       # compile + bounds only

script_dir <- (function() {
  args <- commandArgs(trailingOnly = FALSE)
  file_arg <- grep("^--file=", args, value = TRUE)
  if (length(file_arg)) dirname(normalizePath(sub("^--file=", "", file_arg[1]))) else getwd()
})()
source(file.path(script_dir, "badge_dsl.R"))

requested <- commandArgs(trailingOnly = TRUE)
# --fast skips the PNG render (the slow O(N) step) — compile + bounds only. A recipe
# that compiles to >=2 layers within bounds will render; use --fast for whole-corpus
# sweeps, full mode for per-batch gating.
fast_mode <- "--fast" %in% requested
requested <- setdiff(requested, "--fast")
recipe_paths <- if (length(requested)) {
  file.path(script_dir, "recipes", paste0(requested, ".json"))
} else {
  Sys.glob(file.path(script_dir, "recipes", "*.json"))
}

failures <- 0
for (path in recipe_paths) {
  badge_name <- sub("\\.json$", "", basename(path))
  verdict <- tryCatch({
    recipe <- jsonlite::fromJSON(path, simplifyVector = FALSE)   # 1. parses
    stopifnot(length(recipe$layers) >= 2)                        # 2. structural floor
    badge_fn <- badge_from_spec(recipe)                          # 3. compiles
    for (style in list(MONO_STYLE, DASHBOARD_STYLE)) {           # ... in EVERY style
      layers <- badge_fn(0, 0, 1.0, style)
      stopifnot(length(layers) >= 2)
      for (layer_spec in recipe$layers) {                        # 4. bounds check
        geometry <- badge_layer_geometry(layer_spec)
        stopifnot(all(abs(geometry$x) <= 45), all(abs(geometry$y) <= 45))
      }
      if (!fast_mode) {                                          # 5. real render
        plot_obj <- ggplot2::ggplot()
        for (layer in layers) if (!is.null(layer)) plot_obj <- plot_obj + layer
        plot_obj <- plot_obj +
          ggplot2::coord_fixed(xlim = c(-45, 45), ylim = c(-45, 45)) + ggplot2::theme_void()
        tmp_png <- tempfile(fileext = ".png")
        ggplot2::ggsave(tmp_png, plot_obj, device = ragg::agg_png,
                        width = 300, height = 300, units = "px", dpi = 100)
        stopifnot(file.info(tmp_png)$size > 1000)
        unlink(tmp_png)
      }
    }
    "PASS"
  }, error = function(e) paste("FAIL:", conditionMessage(e)))
  if (!identical(verdict, "PASS")) failures <- failures + 1
  if (!identical(verdict, "PASS") || !fast_mode) {
    cat(sprintf("%-28s %s\n", badge_name, verdict))
  }
}
cat(sprintf("%d/%d recipes pass%s\n", length(recipe_paths) - failures, length(recipe_paths),
            if (fast_mode) " (fast: compile+bounds, no render)" else ""))
if (failures > 0) quit(status = 1)
```

## Seed recipes

Two hand-authored seeds that together exercise `rect`, `polygon`, `circle`, `arc`,
`zigzag` and all six roles, plus bilateral mirroring. These anchor the corpus style.

`recipes/message-queue.json` — asymmetric composition, substrate rule in action
(`detail` flap cut out of the solid `mass` envelope; `spark` dot on the hatched
`ground` plate):

```json
{"_intent": "message queue — an envelope on a hatched plate, throughput zigzag flowing out, health dot top-right.",
 "symmetry": "none",
 "layers": [
  {"shape": "rect", "x0": -30, "y0": -20, "x1": 30, "y1": 20, "role": "ground"},
  {"shape": "rect", "x0": -22, "y0": -10, "x1": 8, "y1": 12, "role": "mass"},
  {"shape": "polygon", "points": [[-20, 10], [-7, 0], [6, 10]], "role": "detail"},
  {"shape": "zigzag", "x0": 11, "y0": -4, "x1": 26, "y1": -4, "amp": 3, "n": 3, "role": "line", "lw": 0.7},
  {"shape": "circle", "cx": 22, "cy": 13, "r": 4, "role": "spark"}
 ]}
```

`recipes/auth-gateway.json` — bilateral symmetry: the single mirrored `arc` renders
as two radiant arcs; the shield polygon is drawn symmetric outright:

```json
{"_intent": "auth gateway — a bilateral shield with a keyhole cutout, radiant arcs, and a crest dot.",
 "symmetry": "bilateral",
 "layers": [
  {"shape": "polygon", "points": [[0, 26], [-22, 16], [-20, -8], [0, -26], [20, -8], [22, 16]], "role": "mass"},
  {"shape": "circle", "cx": 0, "cy": 6, "r": 5, "role": "detail"},
  {"shape": "polygon", "points": [[-2, 3], [2, 3], [3, -8], [-3, -8]], "role": "detail"},
  {"shape": "arc", "cx": 0, "cy": 0, "r": 31, "from": 42, "to": 78, "role": "line", "mirror": true},
  {"shape": "circle", "cx": 0, "cy": 33, "r": 2, "role": "spark"}
 ]}
```

Verified gate output:

```text
$ Rscript validate_badges.R
auth-gateway                 PASS
message-queue                PASS
2/2 recipes pass
$ Rscript validate_badges.R --fast
2/2 recipes pass (fast: compile+bounds, no render)
```

And the hard-error path — a recipe with role `"banana"` and an out-of-bounds rect:

```text
$ Rscript validate_badges.R --fast
zz-broken                    FAIL: badge_dsl: unknown role 'banana'
2/3 recipes pass (fast: compile+bounds, no render)
$ echo $?
1
```

## Conventions document — `recipes/CONVENTIONS.md` (excerpt)

Started with the seeds; extended as conventions emerge across generation waves.
Included verbatim in every generator prompt.

```markdown
# Badge corpus conventions

- **Coordinate frame**: content within +-36, hard limit +-45, +y is UP. A badge
  built y-down validates but renders upside down — eyeball orientation, do not
  trust PASS alone.
- **Family motifs**: services in one family share ONE motif, elaborated:
  every queue-family badge builds on the envelope; every auth-family badge on
  the shield. Core services sit large and central; sidecars sit low and small.
- **Variant marks**: staging variants of a service carry a small hollow
  `detail` triangle at the top-right and dodge the production badge's gesture,
  so staging != production at a glance.
- **Substrate rule**: `spark` marks read on hatched bodies (`ground`/`accent`);
  `detail` cutouts read on solid bodies (`mass`). Pick the mark's role for the
  body under it.
- Derived from the service's NAME and its catalog metadata only.
```

## Generator agent prompt (skeleton)

```markdown
You generate badge recipes for the services assigned below.

1. Read `badges/README.md` (schema: shapes, roles, coordinate frame),
   `recipes/CONVENTIONS.md`, and the seed recipes `message-queue.json`,
   `auth-gateway.json`.
2. For each assigned service, write ONE recipe at `badges/recipes/<slug>.json`
   using the canonical slug provided in your assignment — do not invent slugs.
   Set `_intent` to one line stating what the badge depicts.
3. Recipes are DATA only. Never edit `badge_dsl.R` or `validate_badges.R`.
   If a shape you need does not exist, note it in your report instead.
4. Gate yourself: run `Rscript badges/validate_badges.R <slug>...` on your
   batch. Fix failures. Only recipes that PASS the full gate count as done.
```

## Scaling notes from the reference implementation

The originating corpus (trading-card glyphs, over a thousand recipes across
multiple generation waves) adds two practices worth copying at scale:

- **Wave durability**: recipes are written to disk before a wave returns, so an
  interrupted wave (credit exhaustion, API stall) loses nothing — validate and
  commit the survivors; the next scout pass skips them. This is the model the
  companion workflow [batch-generate-waves](../../../workflows/batch-generate-waves.mjs)
  implements.
- **Central primitive additions**: exactly one primitive (`spiral`) was added
  after launch, through normal code review, once it became the most-requested
  shape across waves — generators never extended the interpreter themselves.
