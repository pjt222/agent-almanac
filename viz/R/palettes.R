# palettes.R - Multi-palette color generation using viridisLite
# Generates domain and agent colors for 9 palettes: cyberpunk + 8 viridis variants.
# Single source of truth for palette colors shared by R rendering and JS themes.

# ── Palette names ─────────────────────────────────────────────────────────
PALETTE_NAMES <- c(
  "cyberpunk", "viridis", "magma", "inferno",
  "plasma", "cividis", "mako", "rocket", "turbo"
)

# ── Domain order (alphabetical, 56 domains) ──────────────────────────────
PALETTE_DOMAIN_ORDER <- c(
  "3d-printing", "a2a-protocol", "alchemy", "animal-training", "blender",
  "bushcraft", "chromatography", "citations", "compliance", "containerization", "crafting",
  "data-serialization", "defensive", "design", "devops", "diffusion", "digital-logic",
  "electromagnetism", "entomology",
  "esoteric", "gardening", "general", "geometry", "git", "hildegard", "i18n",
  "intellectual-property",
  "jigsawr", "lapidary", "levitation", "library-science", "linguistics", "maintenance",
  "mcp-integration", "mlops", "morphic", "mycology", "number-theory",
  "observability", "project-management", "prospecting", "r-packages", "relocation",
  "reporting", "review", "shiny", "spectroscopy", "stochastic-processes", "swarm", "tcg",
  "theoretical-science", "travel", "versioning", "visualization", "web-dev",
  "workflow-visualization"
)

# ── Agent order (alphabetical, 64 agents) ─────────────────────────────────
PALETTE_AGENT_ORDER <- c(
  "acp-developer", "advocatus-diaboli", "alchemist", "apa-specialist",
  "auditor", "blender-artist", "chromatographer", "citizen-entomologist", "code-reviewer",
  "contemplative", "conservation-entomologist", "designer", "devops-engineer",
  "diffusion-specialist", "dog-trainer", "etymologist", "fabricator",
  "gardener", "geometrist", "gxp-validator", "hiking-guide", "hildegard",
  "ip-analyst", "janitor", "jigsawr-developer", "kabalist", "lapidary",
  "librarian", "logician", "markovian", "martial-artist", "mcp-developer", "mlops-engineer",
  "mycologist", "mystic", "nlp-specialist", "number-theorist", "physicist", "polymath",
  "project-manager", "prospector", "putior-integrator", "quarto-developer",
  "r-developer", "relocation-expert", "security-analyst",
  "senior-data-scientist", "senior-researcher", "senior-software-developer",
  "senior-ux-ui-specialist", "senior-web-designer", "shaman", "shapeshifter",
  "shiny-developer", "skill-reviewer", "spectroscopist", "survivalist", "swarm-strategist",
  "taxonomic-entomologist", "tcg-specialist", "theoretical-researcher",
  "tour-planner", "version-manager", "web-developer"
)

# ── Team order (alphabetical, 13 teams) ───────────────────────────────────
PALETTE_TEAM_ORDER <- c(
  "analytical-chemistry", "agentskills-alignment", "devops-platform-engineering", "dyad",
  "entomology", "fullstack-web-dev", "gxp-compliance-validation",
  "ml-data-science-review", "opaque-team", "physical-computing",
  "r-package-review", "scrum-team",
  "tending"
)

# ── viridisLite option mapping ────────────────────────────────────────────
VIRIDIS_OPTIONS <- list(
  viridis = "D",
  magma   = "A",
  inferno = "B",
  plasma  = "C",
  cividis = "E",
  mako    = "F",
  rocket  = "G",
  turbo   = "H"
)

#' Get palette colors for a given palette name
#'
#' @param name Palette name (one of PALETTE_NAMES)
#' @return List with $domains, $agents, and $teams (named lists of id->hex)
get_palette_colors <- function(name) {
  if (!name %in% PALETTE_NAMES) {
    stop("Unknown palette: ", name, ". Must be one of: ",
         paste(PALETTE_NAMES, collapse = ", "), call. = FALSE)
  }

  if (name == "cyberpunk") {
    return(get_cyberpunk_colors())
  }

  get_viridis_colors(name)
}

#' Get cyberpunk palette (hand-tuned neon colors)
get_cyberpunk_colors <- function() {
  domains <- list(
    "3d-printing"            = "#55aadd",
    "a2a-protocol"           = "#44bbaa",
    "alchemy"                = "#ffaa33",
    "animal-training"        = "#ff9944",
    "blender"                = "#ee8833",
    "bushcraft"              = "#88cc44",
    "chromatography"         = "#44ccdd",   # teal -- separation/flow
    "citations"              = "#66bbff",
    "compliance"             = "#ff3366",
    "containerization"       = "#44ddff",
    "crafting"               = "#cc8855",
    "data-serialization"     = "#44aaff",
    "defensive"              = "#ff4444",
    "design"                 = "#ff88dd",
    "devops"                 = "#00ff88",
    "diffusion"              = "#cc77ff",
    "digital-logic"          = "#33ddff",
    "electromagnetism"       = "#ff7744",
    "entomology"             = "#77dd44",
    "esoteric"               = "#dd44ff",
    "gardening"              = "#44bb66",
    "general"                = "#ccccff",
    "geometry"               = "#55ccdd",
    "git"                    = "#66ffcc",
    "hildegard"              = "#99bb44",
    "i18n"                   = "#55bbcc",   # teal -- translation/international
    "intellectual-property"  = "#33ccff",
    "jigsawr"                = "#22ddaa",
    "lapidary"               = "#88ccee",
    "levitation"             = "#77ddff",
    "library-science"        = "#8B7355",
    "linguistics"            = "#cc99ff",
    "maintenance"            = "#aabb88",
    "mcp-integration"        = "#00ccaa",
    "mlops"                  = "#aa66ff",
    "morphic"                = "#bb88ff",
    "mycology"               = "#aa77cc",
    "number-theory"          = "#bbaaff",
    "observability"          = "#ffaa00",
    "project-management"     = "#ff8844",
    "prospecting"            = "#ddaa33",
    "r-packages"             = "#00f0ff",
    "relocation"             = "#ff9977",
    "reporting"              = "#ffdd00",
    "review"                 = "#ff66aa",
    "shiny"                  = "#3399ff",
    "spectroscopy"           = "#dd88ff",   # violet -- electromagnetic spectrum
    "stochastic-processes"   = "#77aaff",
    "swarm"                  = "#aadd44",
    "tcg"                    = "#ff5577",
    "theoretical-science"    = "#ddbb55",
    "travel"                 = "#66cc99",
    "versioning"             = "#44ddaa",
    "visualization"          = "#ee77cc",
    "web-dev"                = "#ff6633",
    "workflow-visualization" = "#66dd88"
  )

  agents <- list(
    "acp-developer"             = "#55ddbb",
    "advocatus-diaboli"         = "#ff4433",
    "alchemist"                 = "#ffaa33",
    "apa-specialist"            = "#77aadd",
    "auditor"                   = "#ff7744",
    "blender-artist"            = "#ff8833",
    "citizen-entomologist"      = "#88dd55",
    "chromatographer"           = "#44ccdd",   # matches chromatography domain
    "code-reviewer"             = "#ff66aa",
    "contemplative"              = "#c4b5fd",
    "conservation-entomologist"  = "#66cc33",
    "designer"                  = "#ff88dd",
    "devops-engineer"           = "#00ff88",
    "diffusion-specialist"      = "#cc77ff",
    "dog-trainer"               = "#ff9944",
    "etymologist"               = "#ddbb66",
    "fabricator"                = "#55ccdd",
    "gardener"                  = "#44bb66",
    "geometrist"                = "#44ffaa",
    "gxp-validator"             = "#ff3399",
    "hiking-guide"              = "#77cc55",
    "hildegard"                 = "#88dd77",
    "ip-analyst"                = "#33ccff",
    "janitor"                   = "#99aacc",
    "jigsawr-developer"         = "#22ddaa",
    "kabalist"                  = "#9966dd",
    "lapidary"                  = "#88ccee",
    "librarian"                 = "#8B7355",
    "logician"                  = "#33ddff",
    "markovian"                 = "#7799ff",
    "martial-artist"            = "#ff4466",
    "mcp-developer"             = "#00ddbb",
    "mlops-engineer"            = "#bb77ff",
    "mycologist"                = "#aa77cc",
    "mystic"                    = "#dd44ff",
    "nlp-specialist"            = "#bb88ff",
    "number-theorist"           = "#bbaaff",
    "physicist"                 = "#ff7744",
    "polymath"                  = "#eedd44",
    "project-manager"           = "#ff8844",
    "prospector"                = "#ddaa33",
    "putior-integrator"         = "#66dd88",
    "quarto-developer"          = "#33ddcc",
    "r-developer"               = "#00f0ff",
    "relocation-expert"         = "#ffbb44",
    "security-analyst"          = "#ff3333",
    "senior-data-scientist"     = "#aa66ff",
    "senior-researcher"         = "#ffaa00",
    "senior-software-developer" = "#44ddff",
    "senior-ux-ui-specialist"   = "#66ffcc",
    "senior-web-designer"       = "#ffdd00",
    "shaman"                    = "#9944ff",
    "shapeshifter"              = "#bb88ff",
    "shiny-developer"           = "#3399ff",
    "skill-reviewer"            = "#ff66bb",
    "spectroscopist"            = "#dd88ff",   # matches spectroscopy domain
    "survivalist"               = "#88cc44",
    "swarm-strategist"          = "#aadd44",
    "taxonomic-entomologist"    = "#55bb22",
    "tcg-specialist"            = "#ff5577",
    "theoretical-researcher"    = "#aabbff",
    "tour-planner"              = "#ffaa55",
    "version-manager"           = "#44ddaa",
    "web-developer"             = "#ff6633"
  )

  teams <- list(
    "analytical-chemistry"       = "#55bbdd",   # analytical blue-teal
    "agentskills-alignment"       = "#ff66bb",   # review pink
    "dyad"                        = "#b794f4",   # wisteria purple
    "tending"                     = "#da70d6",   # orchid purple
    "devops-platform-engineering" = "#ff4500",   # orange-red
    "entomology"                  = "#77dd44",   # leaf green
    "fullstack-web-dev"           = "#ffcc00",   # golden yellow
    "gxp-compliance-validation"   = "#ff6ec7",   # hot pink
    "ml-data-science-review"      = "#7b68ee",   # medium slate blue
    "opaque-team"                 = "#bb88ff",   # lavender (shapeshifter)
    "physical-computing"          = "#44ccff",   # cool blue (computation meets physics)
    "r-package-review"            = "#00ccff",   # bright cyan
    "scrum-team"                  = "#ff8844"    # warm orange (PM)
  )

  list(domains = domains, agents = agents, teams = teams)
}

#' Get viridis-family palette colors
#' @param name Palette name (viridis, magma, inferno, plasma, cividis, mako, rocket, turbo)
get_viridis_colors <- function(name) {
  opt <- VIRIDIS_OPTIONS[[name]]
  if (is.null(opt)) stop("Not a viridis palette: ", name, call. = FALSE)

  n_domains <- length(PALETTE_DOMAIN_ORDER)
  n_agents <- length(PALETTE_AGENT_ORDER)
  n_teams <- length(PALETTE_TEAM_ORDER)

  # Generate domain colors evenly spaced across the colormap

  domain_hexes <- viridisLite::viridis(n_domains, option = opt)

  # Generate agent colors with an offset to distinguish from domain colors
  # Use 80% of the range starting at 10% to avoid extremes
  agent_hexes <- viridisLite::viridis(n_agents, option = opt,
                                       begin = 0.1, end = 0.9)

  # Generate team colors from a distinct range to stand out
  team_hexes <- viridisLite::viridis(max(n_teams, 3), option = opt,
                                      begin = 0.3, end = 0.7)

  domains <- setNames(as.list(substr(domain_hexes, 1, 7)), PALETTE_DOMAIN_ORDER)
  agents <- setNames(as.list(substr(agent_hexes, 1, 7)), PALETTE_AGENT_ORDER)
  teams <- setNames(as.list(substr(team_hexes[seq_len(n_teams)], 1, 7)),
                    PALETTE_TEAM_ORDER)

  list(domains = domains, agents = agents, teams = teams)
}

#' Get favicon triad colors for a given palette
#'
#' Returns three distinct colors for the Polychromatic A favicon glyph.
#' Each color maps to one stroke: c1 = left leg, c2 = right leg, c3 = crossbar.
#'
#' @param name Palette name (one of PALETTE_NAMES)
#' @return Named list with c1, c2, c3 (hex strings)
get_favicon_colors <- function(name) {
  if (!name %in% PALETTE_NAMES) {
    stop("Unknown palette: ", name, ". Must be one of: ",
         paste(PALETTE_NAMES, collapse = ", "), call. = FALSE)
  }

  if (name == "cyberpunk") {
    return(list(c1 = "#00f0ff", c2 = "#dd44ff", c3 = "#00ff88"))
  }

  opt <- VIRIDIS_OPTIONS[[name]]
  hexes <- viridisLite::viridis(3, option = opt, begin = 0.15, end = 0.85)
  list(
    c1 = substr(hexes[1], 1, 7),
    c2 = substr(hexes[2], 1, 7),
    c3 = substr(hexes[3], 1, 7)
  )
}

#' Export all palette colors to JSON
#' @param out_path Output JSON file path
export_palette_json <- function(out_path) {
  palettes <- list()
  for (name in PALETTE_NAMES) {
    palettes[[name]] <- get_palette_colors(name)
  }

  result <- list(
    meta = list(
      generated = format(Sys.time(), "%Y-%m-%dT%H:%M:%S"),
      palette_count = length(PALETTE_NAMES),
      domain_count = length(PALETTE_DOMAIN_ORDER),
      agent_count = length(PALETTE_AGENT_ORDER),
      team_count = length(PALETTE_TEAM_ORDER),
      palettes = PALETTE_NAMES,
      domains = PALETTE_DOMAIN_ORDER,
      agents = PALETTE_AGENT_ORDER,
      teams = PALETTE_TEAM_ORDER
    ),
    palettes = palettes
  )

  dir.create(dirname(out_path), recursive = TRUE, showWarnings = FALSE)
  jsonlite::write_json(result, out_path, pretty = TRUE, auto_unbox = TRUE)
  log_msg(sprintf("Exported %d palettes to %s", length(PALETTE_NAMES), out_path))
  invisible(out_path)
}

#' Export all palette colors as an ES module (JS)
#'
#' Generates a colors-generated.js file with DOMAIN_ORDER, PALETTES,
#' AGENT_PALETTE_COLORS, and TEAM_PALETTE_COLORS as export const declarations.
#' This is the single-source pipeline: palettes.R -> JS, no manual sync needed.
#'
#' @param out_path Output JS file path
export_palette_js <- function(out_path) {
  lines <- character()
  add <- function(...) lines <<- c(lines, paste0(...))
  timestamp <- format(Sys.time(), "%Y-%m-%dT%H:%M:%S")

  add("// Auto-generated by Rscript generate-palette-colors.R")
  add("// Source of truth: viz/R/palettes.R — DO NOT EDIT BY HAND")
  add("// Generated: ", timestamp)
  add("")

  # ── DOMAIN_ORDER ──
  add("export const DOMAIN_ORDER = [")
  for (d in PALETTE_DOMAIN_ORDER) {
    add("  '", d, "',")
  }
  add("];")
  add("")

  # ── Helper: emit a named-list-of-hex as a JS object block ──
  emit_palette_block <- function(var_name, order_vec, slot_name) {
    add("export const ", var_name, " = {")
    for (pal_name in PALETTE_NAMES) {
      pal_data <- get_palette_colors(pal_name)[[slot_name]]
      add("  ", pal_name, ": {")
      for (id in order_vec) {
        hex <- pal_data[[id]]
        if (is.null(hex)) hex <- "#ffffff"
        pad <- paste(rep(" ", max(1, 30 - nchar(id))), collapse = "")
        add("    '", id, "':", pad, "'", hex, "',")
      }
      add("  },")
    }
    add("};")
    add("")
  }

  emit_palette_block("PALETTES", PALETTE_DOMAIN_ORDER, "domains")
  emit_palette_block("AGENT_PALETTE_COLORS", PALETTE_AGENT_ORDER, "agents")
  emit_palette_block("TEAM_PALETTE_COLORS", PALETTE_TEAM_ORDER, "teams")

  dir.create(dirname(out_path), recursive = TRUE, showWarnings = FALSE)
  writeLines(lines, out_path)
  log_msg(sprintf("Exported JS module (%d lines) to %s", length(lines), out_path))
  invisible(out_path)
}
