# agent_glyphs.R - Agent-to-glyph mapping
# Maps each of 68 agent IDs to a specific glyph drawing function.
#
# Each entry: agentId = "glyph_function_name"
# The glyph function must accept (cx, cy, s, col, bright) and return
# a list of ggplot2 layers.

AGENT_GLYPHS <- list(
  # ── Development ─────────────────────────────────────────────────────────
  "r-developer"               = "glyph_agent_r_dev",
  "code-reviewer"             = "glyph_agent_code_review",
  "web-developer"             = "glyph_agent_web_dev",

  # ── Jigsawr ────────────────────────────────────────────────────────────
  "jigsawr-developer"         = "glyph_agent_jigsawr",

  # ── Security & Compliance ───────────────────────────────────────────────
  "security-analyst"          = "glyph_agent_security",
  "gxp-validator"             = "glyph_agent_gxp",
  "auditor"                   = "glyph_agent_auditor",

  # ── Senior Reviewers ────────────────────────────────────────────────────
  "senior-researcher"         = "glyph_agent_researcher",
  "senior-data-scientist"     = "glyph_agent_data_sci",
  "senior-software-developer" = "glyph_agent_architect",
  "senior-web-designer"       = "glyph_agent_web_design",
  "senior-ux-ui-specialist"   = "glyph_agent_ux",

  # ── Management & Infrastructure ─────────────────────────────────────────
  "project-manager"           = "glyph_agent_pm",
  "devops-engineer"           = "glyph_agent_devops",
  "mlops-engineer"            = "glyph_agent_mlops",

  # ── Alchemy, TCG & IP ──────────────────────────────────────────────────
  "alchemist"                 = "glyph_agent_alchemist",
  "polymath"                  = "glyph_agent_polymath",
  "tcg-specialist"            = "glyph_agent_tcg",
  "ip-analyst"                = "glyph_agent_ip",

  # ── Specialty ───────────────────────────────────────────────────────────
  "survivalist"               = "glyph_agent_survivalist",
  "mystic"                    = "glyph_agent_mystic",
  "martial-artist"            = "glyph_agent_martial",
  "designer"                  = "glyph_agent_designer",
  "gardener"                  = "glyph_agent_gardener",
  "putior-integrator"         = "glyph_agent_putior",
  "swarm-strategist"          = "glyph_agent_swarm",
  "shapeshifter"              = "glyph_agent_shifter",

  # ── Documentation & Shiny ──────────────────────────────────────────────
  "quarto-developer"          = "glyph_agent_quarto",
  "shiny-developer"           = "glyph_agent_shiny_dev",

  # ── Nature & Esoteric ─────────────────────────────────────────────────
  "contemplative"             = "glyph_agent_contemplative",
  "dog-trainer"               = "glyph_agent_dog_trainer",
  "librarian"                 = "glyph_agent_librarian",
  "mycologist"                = "glyph_agent_mycologist",
  "prospector"                = "glyph_agent_prospector",
  "shaman"                    = "glyph_agent_shaman",

  # ── Travel & Relocation ───────────────────────────────────────────────
  "tour-planner"              = "glyph_agent_tour_planner",
  "hiking-guide"              = "glyph_agent_hiking_guide",
  "relocation-expert"         = "glyph_agent_relocation",

  # ── Protocol & MCP ────────────────────────────────────────────────────
  "mcp-developer"             = "glyph_agent_mcp_dev",
  "acp-developer"             = "glyph_agent_acp_dev",

  # ── Mathematics & Science ─────────────────────────────────────────────
  "geometrist"                = "glyph_agent_geometrist",
  "markovian"                 = "glyph_agent_markovian",
  "theoretical-researcher"    = "glyph_agent_theorist",
  "diffusion-specialist"      = "glyph_agent_diffusion",

  # ── Medieval & Esoteric ─────────────────────────────────────────────
  "hildegard"                 = "glyph_agent_hildegard",

  # ── Maintenance ──────────────────────────────────────────────────────
  "janitor"                   = "glyph_agent_janitor",

  # ── 3D & Visualization ──────────────────────────────────────────────
  "blender-artist"            = "glyph_agent_blender",
  "fabricator"                = "glyph_agent_fabricator",

  # ── Esoteric & Knowledge ─────────────────────────────────────────────
  "kabalist"                  = "glyph_agent_kabalist",

  # ── Lapidary & Craft ─────────────────────────────────────────────────
  "lapidary"                  = "glyph_agent_lapidary",

  # ── Mathematics ──────────────────────────────────────────────────────
  "number-theorist"           = "glyph_agent_number_theorist",

  # ── Meta & Versioning ────────────────────────────────────────────────
  "skill-reviewer"            = "glyph_agent_skill_reviewer",
  "version-manager"           = "glyph_agent_version_manager",

  # ── Critical Thinking ──────────────────────────────────────────────
  "advocatus-diaboli"         = "glyph_agent_advocatus",

  # ── Academic ───────────────────────────────────────────────────────
  "apa-specialist"            = "glyph_agent_apa",

  # ── Linguistics ────────────────────────────────────────────────────
  "etymologist"               = "glyph_agent_etymologist",
  "nlp-specialist"            = "glyph_agent_nlp",

  # ── Entomology ───────────────────────────────────────────────────
  "conservation-entomologist" = "glyph_agent_conservation_ento",
  "taxonomic-entomologist"    = "glyph_agent_taxonomic_ento",
  "citizen-entomologist"      = "glyph_agent_citizen_ento",

  # ── Analytical Chemistry ─────────────────────────────────────
  "spectroscopist"              = "glyph_agent_spectroscopist",
  "chromatographer"             = "glyph_agent_chromatographer",

  # ── Physics & Logic ────────────────────────────────────────────────
  "logician"                    = "glyph_agent_logician",
  "physicist"                   = "glyph_agent_physicist",

  # ── Synoptic ──────────────────────────────────────────────────────
  "adaptic"                     = "glyph_agent_adaptic",

  # ── i18n ────────────────────────────────────────────────────────────
  "translator"                  = "glyph_agent_translator",

  # ── CLI ─────────────────────────────────────────────────────────────
  "cli-developer"               = "glyph_agent_cli_dev",

  # ── Open Source ────────────────────────────────────────────────────────
  "claw-polisher"               = "glyph_agent_claw_polisher",

  # ── GPU Optimization ──────────────────────────────────────────────────
  "kernel-optimizer"            = "glyph_agent_kernel_optimizer",

  # ── Default Skills (reuse skill glyphs) ───────────────────────────────
  "heal"                        = "glyph_healing_hands",
  "meditate"                    = "glyph_lotus_seated"
)
