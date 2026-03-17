# team_glyphs.R - Team-to-glyph mapping
# Maps each team ID to a specific glyph drawing function.
#
# Each entry: teamId = "glyph_function_name"
# The glyph function must accept (cx, cy, s, col, bright) and return
# a list of ggplot2 layers.

TEAM_GLYPHS <- list(
  "agentskills-alignment"       = "glyph_team_agentskills_alignment",
  "dyad"                        = "glyph_team_dyad",
  "tending"                     = "glyph_team_tending",
  "devops-platform-engineering" = "glyph_team_devops_platform",
  "fullstack-web-dev"           = "glyph_team_fullstack_web",
  "gxp-compliance-validation"   = "glyph_team_gxp_compliance",
  "ml-data-science-review"      = "glyph_team_ml_data_science",
  "r-package-review"            = "glyph_team_r_package_review",
  "scrum-team"                  = "glyph_team_scrum",
  "opaque-team"                 = "glyph_team_opaque",
  "entomology"                  = "glyph_team_entomology",
  "analytical-chemistry"        = "glyph_team_analytical_chemistry",
  "physical-computing"          = "glyph_team_physical_computing",
  "synoptic-mind"               = "glyph_team_synoptic_mind",
  "translation-campaign"        = "glyph_team_translation_campaign"
)
