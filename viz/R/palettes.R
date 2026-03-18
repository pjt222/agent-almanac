# palettes.R - Multi-palette color generation using viridisLite
# Generates domain and agent colors for 9 palettes: cyberpunk + 8 viridis variants.
# Single source of truth for palette colors shared by R rendering and JS themes.
#
# Domain/agent/team order is derived from YAML registries at runtime.
# Hand-tuned cyberpunk colors are defined here; new entities get auto-fallback colors.

# ── Palette names ─────────────────────────────────────────────────────────
PALETTE_NAMES <- c(
  "cyberpunk", "viridis", "magma", "inferno",
  "plasma", "cividis", "mako", "rocket", "turbo"
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

# ── Registry-derived entity orders ────────────────────────────────────────
# Reads domain/agent/team IDs from YAML registries, sorted alphabetically.
# Cached after first load to avoid repeated I/O within a session.

.palette_env <- new.env(parent = emptyenv())

#' Resolve the project root directory (parent of viz/)
#' @return Absolute path to the project root
resolve_project_root <- function() {
  # Try script_dir first (set by sourcing scripts)
  if (exists("script_dir", envir = globalenv())) {
    root <- normalizePath(file.path(get("script_dir", envir = globalenv()), ".."),
                          mustWork = FALSE)
    if (file.exists(file.path(root, "skills", "_registry.yml"))) return(root)
  }
  # Try common relative paths
  candidates <- c(
    "..",                               # running from viz/
    ".",                                # running from project root
    file.path(getwd(), ".."),           # absolute fallback
    normalizePath("../..", mustWork = FALSE)  # running from viz/R/
  )
  for (path in candidates) {
    if (file.exists(file.path(path, "skills", "_registry.yml"))) {
      return(normalizePath(path))
    }
  }
  NULL
}

#' Load entity orders from YAML registries
#' @return List with $domains, $agents, $teams (character vectors, sorted)
load_registry_orders <- function() {
  if (!is.null(.palette_env$orders)) return(.palette_env$orders)

  root <- resolve_project_root()
  if (is.null(root)) {
    warning("Cannot find project root with registries. ",
            "Using empty entity orders — palette generation will be incomplete.",
            call. = FALSE)
    .palette_env$orders <- list(domains = character(0),
                                 agents = character(0),
                                 teams = character(0))
    return(.palette_env$orders)
  }

  skills_reg <- yaml::yaml.load_file(file.path(root, "skills", "_registry.yml"))
  agents_reg <- yaml::yaml.load_file(file.path(root, "agents", "_registry.yml"))
  teams_reg  <- yaml::yaml.load_file(file.path(root, "teams", "_registry.yml"))

  # Extract sorted domain names from skills registry
  domain_names <- sort(names(skills_reg$domains))

  # Extract sorted agent IDs
  agent_ids <- sort(vapply(agents_reg$agents, function(a) a$id, character(1)))

  # Extract sorted team IDs
  team_ids <- sort(vapply(teams_reg$teams, function(t) t$id, character(1)))

  .palette_env$orders <- list(domains = domain_names,
                               agents = agent_ids,
                               teams = team_ids)
  .palette_env$orders
}

#' Get the palette order vectors (convenience accessors)
get_domain_order <- function() load_registry_orders()$domains
get_agent_order  <- function() load_registry_orders()$agents
get_team_order   <- function() load_registry_orders()$teams

#' Generate a deterministic fallback color for an entity not in the hand-tuned map
#' Uses HCL color space for perceptually uniform, vibrant neon-ish colors.
#' @param id Entity identifier string
#' @return Hex color string
auto_fallback_color <- function(id) {
  hue <- (digest::digest2int(id) %% 360)
  grDevices::hcl(h = hue, c = 80, l = 70)
}

# ── Palette color generation ──────────────────────────────────────────────

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

#' Get cyberpunk palette (hand-tuned neon colors with auto-fallback)
#'
#' Hand-tuned hex values are the primary source. Any entity in the registry
#' but missing from the hand-tuned map gets an auto-generated fallback color.
get_cyberpunk_colors <- function() {
  # ── Hand-tuned domain colors ──
  hand_domains <- list(
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
    "synoptic"               = "#44ffcc",   # panoramic teal-green
    "tcg"                    = "#ff5577",
    "tensegrity"             = "#6699cc",   # steel-blue -- structural metal
    "theoretical-science"    = "#ddbb55",
    "travel"                 = "#66cc99",
    "versioning"             = "#44ddaa",
    "visualization"          = "#ee77cc",
    "web-dev"                = "#ff6633",
    "workflow-visualization" = "#66dd88"
  )

  # ── Hand-tuned agent colors ──
  hand_agents <- list(
    "acp-developer"             = "#55ddbb",
    "adaptic"                   = "#44ffcc",   # matches synoptic domain
    "advocatus-diaboli"         = "#ff4433",
    "alchemist"                 = "#ffaa33",
    "apa-specialist"            = "#77aadd",
    "auditor"                   = "#ff7744",
    "blender-artist"            = "#ff8833",
    "citizen-entomologist"      = "#88dd55",
    "chromatographer"           = "#44ccdd",   # matches chromatography domain
    "code-reviewer"             = "#ff66aa",
    "contemplative"             = "#c4b5fd",
    "conservation-entomologist" = "#66cc33",
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
    "translator"                = "#55bbcc",   # teal -- matches i18n domain
    "version-manager"           = "#44ddaa",
    "web-developer"             = "#ff6633"
  )

  # ── Hand-tuned team colors ──
  hand_teams <- list(
    "analytical-chemistry"       = "#55bbdd",   # analytical blue-teal
    "agentskills-alignment"      = "#ff66bb",   # review pink
    "dyad"                       = "#b794f4",   # wisteria purple
    "tending"                    = "#da70d6",   # orchid purple
    "devops-platform-engineering" = "#ff4500",  # orange-red
    "entomology"                 = "#77dd44",   # leaf green
    "fullstack-web-dev"          = "#ffcc00",   # golden yellow
    "gxp-compliance-validation"  = "#ff6ec7",   # hot pink
    "ml-data-science-review"     = "#7b68ee",   # medium slate blue
    "opaque-team"                = "#bb88ff",   # lavender (shapeshifter)
    "physical-computing"         = "#44ccff",   # cool blue
    "r-package-review"           = "#00ccff",   # bright cyan
    "scrum-team"                 = "#ff8844",   # warm orange (PM)
    "synoptic-mind"              = "#44ffcc",   # panoramic teal-green
    "translation-campaign"       = "#55bbcc"    # teal (i18n)
  )

  # ── Merge hand-tuned colors with auto-fallback for registry entities ──
  domains <- fill_with_fallback(hand_domains, get_domain_order())
  agents  <- fill_with_fallback(hand_agents,  get_agent_order())
  teams   <- fill_with_fallback(hand_teams,   get_team_order())

  list(domains = domains, agents = agents, teams = teams)
}

#' Merge a hand-tuned color map with auto-fallback for missing entities
#' @param hand_map Named list of id -> hex (hand-tuned)
#' @param order Character vector of all entity IDs from registry
#' @return Named list with all IDs in order, hand-tuned where available, fallback otherwise
fill_with_fallback <- function(hand_map, order) {
  result <- vector("list", length(order))
  names(result) <- order
  for (id in order) {
    if (!is.null(hand_map[[id]])) {
      result[[id]] <- hand_map[[id]]
    } else {
      result[[id]] <- auto_fallback_color(id)
    }
  }
  result
}

#' Get viridis-family palette colors
#' @param name Palette name (viridis, magma, inferno, plasma, cividis, mako, rocket, turbo)
get_viridis_colors <- function(name) {
  opt <- VIRIDIS_OPTIONS[[name]]
  if (is.null(opt)) stop("Not a viridis palette: ", name, call. = FALSE)

  domain_order <- get_domain_order()
  agent_order  <- get_agent_order()
  team_order   <- get_team_order()

  n_domains <- length(domain_order)
  n_agents  <- length(agent_order)
  n_teams   <- length(team_order)

  # Generate domain colors evenly spaced across the colormap
  domain_hexes <- viridisLite::viridis(n_domains, option = opt)

  # Generate agent colors with an offset to distinguish from domain colors
  agent_hexes <- viridisLite::viridis(n_agents, option = opt,
                                       begin = 0.1, end = 0.9)

  # Generate team colors from a distinct range to stand out
  team_hexes <- viridisLite::viridis(max(n_teams, 3), option = opt,
                                      begin = 0.3, end = 0.7)

  domains <- setNames(as.list(substr(domain_hexes, 1, 7)), domain_order)
  agents  <- setNames(as.list(substr(agent_hexes, 1, 7)),  agent_order)
  teams   <- setNames(as.list(substr(team_hexes[seq_len(n_teams)], 1, 7)),
                      team_order)

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
      domain_count = length(get_domain_order()),
      agent_count = length(get_agent_order()),
      team_count = length(get_team_order()),
      palettes = PALETTE_NAMES,
      domains = get_domain_order(),
      agents = get_agent_order(),
      teams = get_team_order()
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
  domain_order <- get_domain_order()
  agent_order  <- get_agent_order()
  team_order   <- get_team_order()

  lines <- character()
  add <- function(...) lines <<- c(lines, paste0(...))
  timestamp <- format(Sys.time(), "%Y-%m-%dT%H:%M:%S")

  add("// Auto-generated by Rscript generate-palette-colors.R")
  add("// Source of truth: YAML registries + viz/R/palettes.R — DO NOT EDIT BY HAND")
  add("// Generated: ", timestamp)
  add("")

  # ── DOMAIN_ORDER ──
  add("export const DOMAIN_ORDER = [")
  for (d in domain_order) {
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

  emit_palette_block("PALETTES", domain_order, "domains")
  emit_palette_block("AGENT_PALETTE_COLORS", agent_order, "agents")
  emit_palette_block("TEAM_PALETTE_COLORS", team_order, "teams")

  dir.create(dirname(out_path), recursive = TRUE, showWarnings = FALSE)
  writeLines(lines, out_path)
  log_msg(sprintf("Exported JS module (%d lines) to %s", length(lines), out_path))
  invisible(out_path)
}
