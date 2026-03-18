# glyphs.R - Skill-to-glyph mapping
# Maps each of 328 skillIds to a specific glyph drawing function.
#
# put id:"glyph_mapping", label:"SKILL_GLYPHS lookup table (skill ID to glyph function)", node_type:"input", output:"glyph_fn"
#
# Each entry: skillId = "glyph_function_name"
# The glyph function must accept (cx, cy, s, col, bright) and return
# a list of ggplot2 layers.

SKILL_GLYPHS <- list(
  # ── alchemy (4) ────────────────────────────────────────────────────────
  "athanor"                        = "glyph_athanor",
  "transmute"                      = "glyph_transmute",
  "chrysopoeia"                    = "glyph_chrysopoeia",
  "metal"                          = "glyph_metal_ingot",

  # ── bushcraft (4) ──────────────────────────────────────────────────────
  "make-fire"                      = "glyph_flame",
  "purify-water"                   = "glyph_droplet",
  "forage-plants"                  = "glyph_leaf",
  "sharpen-knife"                  = "glyph_whetstone_blade",

  # ── compliance (17) ────────────────────────────────────────────────────
  "setup-gxp-r-project"            = "glyph_shield_check",
  "write-validation-documentation" = "glyph_document",
  "implement-audit-trail"          = "glyph_footprints",
  "validate-statistical-output"    = "glyph_shield_check",
  "perform-csv-assessment"         = "glyph_microscope",
  "conduct-gxp-audit"              = "glyph_clipboard",
  "implement-pharma-serialisation" = "glyph_barcode",
  "design-compliance-architecture" = "glyph_blueprint",
  "manage-change-control"          = "glyph_refresh_arrows",
  "implement-electronic-signatures"= "glyph_fingerprint",
  "write-standard-operating-procedure" = "glyph_numbered_list",
  "monitor-data-integrity"         = "glyph_database_shield",
  "design-training-program"        = "glyph_graduation_cap",
  "decommission-validated-system"  = "glyph_power_off",
  "prepare-inspection-readiness"   = "glyph_checklist",
  "investigate-capa-root-cause"    = "glyph_fishbone",
  "qualify-vendor"                 = "glyph_badge_star",

  # ── containerization (10) ──────────────────────────────────────────────
  "create-r-dockerfile"            = "glyph_docker_box",
  "setup-docker-compose"           = "glyph_compose_stack",
  "containerize-mcp-server"        = "glyph_box_plug",
  "optimize-docker-build-cache"    = "glyph_layers_arrow",
  "create-dockerfile"              = "glyph_dockerfile",
  "create-multistage-dockerfile"   = "glyph_multistage_build",
  "setup-compose-stack"            = "glyph_compose_services",
  "configure-nginx"                = "glyph_nginx_shield",
  "configure-reverse-proxy"        = "glyph_proxy_routes",
  "deploy-searxng"                 = "glyph_search_lens_shield",

  # ── data-serialization (2) ────────────────────────────────────────────
  "serialize-data-formats"         = "glyph_brackets_stream",
  "design-serialization-schema"    = "glyph_schema_tree",

  # ── defensive (6) ─────────────────────────────────────────────────────
  "tai-chi"                        = "glyph_yin_yang",
  "aikido"                         = "glyph_spiral_arrow",
  "mindfulness"                    = "glyph_lotus",
  "center"                         = "glyph_center_balance",
  "redirect"                       = "glyph_redirect_spiral",
  "awareness"                      = "glyph_awareness_eye",

  # ── design (3) ─────────────────────────────────────────────────────────
  "ornament-style-mono"            = "glyph_palette",
  "ornament-style-color"           = "glyph_palette_color",
  "ornament-style-modern"          = "glyph_compass_drafting",

  # ── devops (13) ────────────────────────────────────────────────────────
  "build-ci-cd-pipeline"           = "glyph_pipeline",
  "provision-infrastructure-terraform" = "glyph_terraform_blocks",
  "deploy-to-kubernetes"           = "glyph_ship_wheel",
  "manage-kubernetes-secrets"      = "glyph_key_lock",
  "setup-container-registry"       = "glyph_registry_box",
  "implement-gitops-workflow"      = "glyph_git_sync",
  "configure-ingress-networking"   = "glyph_gateway",
  "setup-service-mesh"             = "glyph_mesh_grid",
  "configure-api-gateway"          = "glyph_gateway",
  "enforce-policy-as-code"         = "glyph_policy_shield",
  "optimize-cloud-costs"           = "glyph_cost_down",
  "setup-local-kubernetes"         = "glyph_cluster_local",
  "write-helm-chart"               = "glyph_anchor",

  # ── esoteric (29) ─────────────────────────────────────────────────────
  "heal"                           = "glyph_healing_hands",
  "heal-guidance"                  = "glyph_healing_hands_guide",
  "meditate"                       = "glyph_lotus_seated",
  "meditate-guidance"              = "glyph_lotus_seated_guide",
  "remote-viewing"                 = "glyph_third_eye",
  "remote-viewing-guidance"        = "glyph_third_eye_guide",
  "learn"                          = "glyph_open_book",
  "learn-guidance"                 = "glyph_open_book_guide",
  "teach"                          = "glyph_dialogue_bubbles",
  "teach-guidance"                 = "glyph_dialogue_bubbles_guide",
  "listen"                         = "glyph_listening_ear",
  "listen-guidance"                = "glyph_listening_ear_guide",
  "observe"                        = "glyph_telescope_stars",
  "observe-guidance"               = "glyph_telescope_stars_guide",
  "intrinsic"                      = "glyph_flame_spiral",
  "shiva-bhaga"                    = "glyph_trident_flame",
  "vishnu-bhaga"                   = "glyph_conch_wheel",
  "brahma-bhaga"                   = "glyph_lotus_create",
  "conscientiousness"              = "glyph_checklist_thorough",
  "honesty-humility"               = "glyph_mirror_truth",
  "shine"                          = "glyph_radiant_star",
  "read-tree-of-life"              = "glyph_tree_of_life",
  "apply-gematria"                 = "glyph_gematria",
  "study-hebrew-letters"           = "glyph_hebrew_letters",
  "breathe"                        = "glyph_breath_pause",
  "rest"                           = "glyph_rest_stillness",
  "attune"                         = "glyph_tuning_fork",
  "dream"                          = "glyph_dream_cloud",
  "gratitude"                      = "glyph_gratitude_sun",

  # ── gardening (5) ─────────────────────────────────────────────────────
  "cultivate-bonsai"                   = "glyph_bonsai_tree",
  "maintain-hand-tools"                = "glyph_pruning_shears",
  "plan-garden-calendar"               = "glyph_moon_calendar",
  "prepare-soil"                       = "glyph_soil_layers",
  "read-garden"                        = "glyph_garden_eye",

  # ── general (18) ───────────────────────────────────────────────────────
  "setup-wsl-dev-environment"      = "glyph_terminal",
  "write-claude-md"                = "glyph_robot_doc",
  "security-audit-codebase"        = "glyph_shield_scan",
  "create-skill"                   = "glyph_spark_create",
  "evolve-skill"                   = "glyph_evolution_arrow",
  "manage-memory"                  = "glyph_memory_file",
  "create-agent"                   = "glyph_agent_create",
  "create-team"                    = "glyph_team_create",
  "evolve-agent"                   = "glyph_agent_evolve",
  "evolve-team"                    = "glyph_team_evolve",
  "fail-early-pattern"             = "glyph_fail_early",
  "argumentation"                  = "glyph_argument_scale",
  "manage-token-budget"            = "glyph_token_gauge",
  "prune-agent-memory"             = "glyph_memory_prune",
  "circuit-breaker-pattern"        = "glyph_circuit_breaker",
  "verify-agent-output"            = "glyph_verify_checkmark",
  "continue-here"                  = "glyph_continue_here",
  "install-almanac-content"        = "glyph_almanac_install",

  # ── git (7) ────────────────────────────────────────────────────────────
  "configure-git-repository"       = "glyph_git_config",
  "commit-changes"                 = "glyph_commit_diamond",
  "manage-git-branches"            = "glyph_branch_fork",
  "create-pull-request"            = "glyph_merge_arrows",
  "resolve-git-conflicts"          = "glyph_conflict_cross",
  "create-github-release"          = "glyph_tag_release",
  "create-github-issues"           = "glyph_issue_create",

  # ── intellectual-property (5) ──────────────────────────────────────────
  "assess-ip-landscape"            = "glyph_patent_landscape",
  "search-prior-art"               = "glyph_prior_art_search",
  "screen-trademark"               = "glyph_trademark_screen",
  "file-trademark"                 = "glyph_trademark_file",
  "headless-web-scraping"          = "glyph_headless_scraper",

  # ── library-science (3) ──────────────────────────────────────────────
  "catalog-collection"         = "glyph_card_catalog",
  "preserve-materials"         = "glyph_book_repair",
  "curate-collection"          = "glyph_bookshelf",

  # ── jigsawr (5) ──────────────────────────────────────────────────────
  "generate-puzzle"            = "glyph_jigsaw_code",
  "add-puzzle-type"            = "glyph_jigsaw_plus",
  "render-puzzle-docs"         = "glyph_jigsaw_book",
  "run-puzzle-tests"           = "glyph_jigsaw_check",
  "validate-piles-notation"    = "glyph_jigsaw_stack",

  # ── mcp-integration (5) ───────────────────────────────────────────────
  "configure-mcp-server"           = "glyph_server_plug",
  "build-custom-mcp-server"        = "glyph_wrench_server",
  "troubleshoot-mcp-connection"    = "glyph_debug_cable",
  "analyze-codebase-for-mcp"       = "glyph_mcp_analyze",
  "scaffold-mcp-server"            = "glyph_mcp_scaffold",

  # ── mlops (12) ─────────────────────────────────────────────────────────
  "track-ml-experiments"           = "glyph_experiment_flask",
  "register-ml-model"              = "glyph_model_registry",
  "deploy-ml-model-serving"        = "glyph_serve_endpoint",
  "build-feature-store"            = "glyph_table_store",
  "version-ml-data"                = "glyph_version_branch",
  "orchestrate-ml-pipeline"        = "glyph_dag_pipeline",
  "monitor-model-drift"            = "glyph_drift_curve",
  "run-ab-test-models"             = "glyph_split_ab",
  "setup-automl-pipeline"          = "glyph_auto_tune",
  "detect-anomalies-aiops"         = "glyph_anomaly_spike",
  "forecast-operational-metrics"   = "glyph_forecast_line",
  "label-training-data"            = "glyph_label_tag",

  # ── observability (13) ─────────────────────────────────────────────────
  "setup-prometheus-monitoring"    = "glyph_prometheus_fire",
  "build-grafana-dashboards"       = "glyph_dashboard_grid",
  "configure-log-aggregation"      = "glyph_log_funnel",
  "instrument-distributed-tracing" = "glyph_trace_spans",
  "define-slo-sli-sla"             = "glyph_gauge_slo",
  "configure-alerting-rules"       = "glyph_bell_alert",
  "write-incident-runbook"         = "glyph_runbook",
  "conduct-post-mortem"            = "glyph_timeline",
  "plan-capacity"                  = "glyph_capacity_chart",
  "design-on-call-rotation"        = "glyph_rotation_clock",
  "run-chaos-experiment"           = "glyph_chaos_monkey",
  "setup-uptime-checks"            = "glyph_heartbeat",
  "correlate-observability-signals"= "glyph_signals_unified",

  # ── project-management (6) ────────────────────────────────────────────
  "draft-project-charter"          = "glyph_charter_scroll",
  "create-work-breakdown-structure"= "glyph_wbs_tree",
  "plan-sprint"                    = "glyph_sprint_board",
  "manage-backlog"                 = "glyph_backlog_stack",
  "generate-status-report"         = "glyph_status_gauge",
  "conduct-retrospective"          = "glyph_retro_mirror",

  # ── r-packages (10) ───────────────────────────────────────────────────
  "create-r-package"               = "glyph_hexagon_r",
  "submit-to-cran"                 = "glyph_upload_check",
  "write-roxygen-docs"             = "glyph_doc_pen",
  "write-testthat-tests"           = "glyph_test_tube",
  "setup-github-actions-ci"        = "glyph_github_actions",
  "build-pkgdown-site"             = "glyph_book_web",
  "manage-renv-dependencies"       = "glyph_lock_tree",
  "add-rcpp-integration"           = "glyph_bridge_cpp",
  "write-vignette"                 = "glyph_scroll_tutorial",
  "release-package-version"        = "glyph_rocket_tag",

  # ── reporting (4) ──────────────────────────────────────────────────────
  "create-quarto-report"           = "glyph_quarto_diamond",
  "format-apa-report"              = "glyph_academic_paper",
  "build-parameterized-report"     = "glyph_template_params",
  "generate-statistical-tables"    = "glyph_table_stats",

  # ── review (11) ────────────────────────────────────────────────────────
  "review-research"                = "glyph_magnifier_paper",
  "review-data-analysis"           = "glyph_magnifier_chart",
  "review-software-architecture"   = "glyph_magnifier_arch",
  "review-web-design"              = "glyph_magnifier_layout",
  "review-ux-ui"                   = "glyph_magnifier_user",
  "review-pull-request"            = "glyph_pr_review",
  "review-skill-format"            = "glyph_magnifier_skill",
  "update-skill-content"           = "glyph_skill_update",
  "refactor-skill-structure"       = "glyph_skill_refactor",
  "review-codebase"                = "glyph_magnifier_checklist",
  "test-team-coordination"         = "glyph_test_team_nodes",

  # ── web-dev (4) ────────────────────────────────────────────────────────
  "scaffold-nextjs-app"            = "glyph_nextjs_scaffold",
  "setup-tailwind-typescript"      = "glyph_tailwind_ts",
  "deploy-to-vercel"               = "glyph_rocket_deploy",
  "use-graphql-api"                = "glyph_graphql_query",

  # ── swarm (8) ──────────────────────────────────────────────────────────
  "coordinate-swarm"               = "glyph_swarm_nodes",
  "forage-resources"               = "glyph_ant_trail",
  "build-consensus"                = "glyph_vote_circles",
  "defend-colony"                  = "glyph_shield_wall",
  "scale-colony"                   = "glyph_budding",
  "forage-solutions"               = "glyph_forage_circuit",
  "build-coherence"                = "glyph_coherence_converge",
  "coordinate-reasoning"           = "glyph_coordinate_web",

  # ── morphic (7) ────────────────────────────────────────────────────────
  "assess-form"                    = "glyph_scan_outline",
  "adapt-architecture"             = "glyph_morph_arrow",
  "dissolve-form"                  = "glyph_dissolve",
  "repair-damage"                  = "glyph_regenerate",
  "shift-camouflage"               = "glyph_camo_grid",
  "assess-context"                 = "glyph_assess_context_lens",
  "bootstrap-agent-identity"       = "glyph_identity_boot",

  # ── synoptic (4) ────────────────────────────────────────────────────────
  "expand-awareness"               = "glyph_expand_awareness",
  "integrate-gestalt"              = "glyph_integrate_gestalt",
  "express-insight"                = "glyph_express_insight",
  "adaptic"                        = "glyph_adaptic",

  # ── tcg (3) ────────────────────────────────────────────────────────────
  "grade-tcg-card"                 = "glyph_card_grade",
  "build-tcg-deck"                 = "glyph_deck_build",
  "manage-tcg-collection"          = "glyph_collection_grid",

  # ── shiny (7) ──────────────────────────────────────────────────────────
  "deploy-shinyproxy"              = "glyph_shinyproxy_grid",
  "scaffold-shiny-app"             = "glyph_shiny_scaffold",
  "build-shiny-module"             = "glyph_shiny_module",
  "test-shiny-app"                 = "glyph_shiny_test",
  "deploy-shiny-app"               = "glyph_shiny_deploy",
  "optimize-shiny-performance"     = "glyph_shiny_optimize",
  "design-shiny-ui"                = "glyph_shiny_ui",

  # ── workflow-visualization (6) ────────────────────────────────────────
  "install-putior"                 = "glyph_putior_install",
  "analyze-codebase-workflow"      = "glyph_workflow_scan",
  "annotate-source-files"          = "glyph_annotation_tag",
  "generate-workflow-diagram"      = "glyph_mermaid_diagram",
  "setup-putior-ci"                = "glyph_ci_diagram",
  "configure-putior-mcp"           = "glyph_putior_mcp",

  # ── animal-training (2) ──────────────────────────────────────────────
  "basic-obedience"                = "glyph_dog_sit",
  "behavioral-modification"        = "glyph_behavior_curve",

  # ── mycology (2) ─────────────────────────────────────────────────────
  "fungi-identification"           = "glyph_mushroom_cap",
  "mushroom-cultivation"           = "glyph_mycelium_net",

  # ── prospecting (2) ──────────────────────────────────────────────────
  "mineral-identification"         = "glyph_crystal_facets",
  "gold-washing"                   = "glyph_pan_nugget",

  # ── crafting (1) ─────────────────────────────────────────────────────
  "paper-making"                   = "glyph_fibre_sheet",

  # ── lapidary (4) ───────────────────────────────────────────────────
  "identify-gemstone"              = "glyph_gem_loupe",
  "cut-gemstone"                   = "glyph_gem_facet",
  "polish-gemstone"                = "glyph_gem_polish",
  "appraise-gemstone"              = "glyph_gem_scale",

  # ── number-theory (3) ──────────────────────────────────────────────
  "analyze-prime-numbers"          = "glyph_prime_sieve",
  "solve-modular-arithmetic"       = "glyph_modular_clock",
  "explore-diophantine-equations"  = "glyph_diophantine_grid",

  # ── versioning (4) ─────────────────────────────────────────────────
  "apply-semantic-versioning"      = "glyph_semver_tag",
  "manage-changelog"               = "glyph_changelog_scroll",
  "plan-release-cycle"             = "glyph_release_calendar",
  "audit-dependency-versions"      = "glyph_dependency_tree",

  # ── travel (6) ───────────────────────────────────────────────────
  "plan-tour-route"                = "glyph_tour_route",
  "create-spatial-visualization"   = "glyph_spatial_map",
  "generate-tour-report"           = "glyph_tour_report",
  "plan-hiking-tour"               = "glyph_hiking_trail",
  "check-hiking-gear"              = "glyph_gear_checklist",
  "assess-trail-conditions"        = "glyph_trail_assess",

  # ── relocation (3) ──────────────────────────────────────────────
  "plan-eu-relocation"             = "glyph_relocation_plan",
  "check-relocation-documents"     = "glyph_document_check",
  "navigate-dach-bureaucracy"      = "glyph_bureaucracy",

  # ── a2a-protocol (3) ────────────────────────────────────────────
  "design-a2a-agent-card"          = "glyph_agent_card",
  "implement-a2a-server"           = "glyph_a2a_server",
  "test-a2a-interop"               = "glyph_a2a_test",

  # ── geometry (3) ────────────────────────────────────────────────
  "construct-geometric-figure"     = "glyph_compass_ruler",
  "solve-trigonometric-problem"    = "glyph_trig_circle",
  "prove-geometric-theorem"        = "glyph_proof_triangle",

  # ── stochastic-processes (3) ────────────────────────────────────
  "model-markov-chain"             = "glyph_markov_nodes",
  "fit-hidden-markov-model"        = "glyph_hmm_states",
  "simulate-stochastic-process"    = "glyph_random_walk",

  # ── theoretical-science (3) ─────────────────────────────────────
  "formulate-quantum-problem"      = "glyph_wave_function",
  "derive-theoretical-result"      = "glyph_derivation",
  "survey-theoretical-literature"  = "glyph_literature_survey",

  # ── diffusion (4) ──────────────────────────────────────────────
  "fit-drift-diffusion-model"      = "glyph_drift_diffusion",
  "implement-diffusion-network"    = "glyph_diffusion_network",
  "analyze-diffusion-dynamics"     = "glyph_diffusion_sde",
  "analyze-generative-diffusion-model" = "glyph_gen_diffusion",

  # ── hildegard (5) ──────────────────────────────────────────────
  "formulate-herbal-remedy"        = "glyph_herbal_mortar",
  "assess-holistic-health"         = "glyph_humoral_balance",
  "compose-sacred-music"           = "glyph_neume_notes",
  "practice-viriditas"             = "glyph_viriditas_spiral",
  "consult-natural-history"        = "glyph_physica_book",

  # ── maintenance (5) ─────────────────────────────────────────────
  "clean-codebase"                 = "glyph_broom_clean",
  "tidy-project-structure"         = "glyph_tidy_folders",
  "repair-broken-references"       = "glyph_repair_link",
  "escalate-issues"                = "glyph_escalation_arrow",
  "audit-discovery-symlinks"       = "glyph_symlink_audit",

  # ── blender (3) ─────────────────────────────────────────────────
  "create-3d-scene"                = "glyph_3d_cube",
  "script-blender-automation"      = "glyph_blender_script",
  "render-blender-output"          = "glyph_render_camera",

  # ── visualization (6) ──────────────────────────────────────────
  "create-2d-composition"          = "glyph_2d_canvas",
  "render-publication-graphic"     = "glyph_pub_chart",
  "create-glyph"                   = "glyph_paintbrush_code",
  "enhance-glyph"                  = "glyph_paintbrush_enhance",
  "audit-icon-pipeline"            = "glyph_audit_pipeline",
  "render-icon-pipeline"           = "glyph_render_pipeline",

  # ── 3d-printing (3) ────────────────────────────────────────────
  "prepare-print-model"            = "glyph_3d_model_prep",
  "select-print-material"          = "glyph_material_spool",
  "troubleshoot-print-issues"      = "glyph_print_debug",

  # ── citations (3) ────────────────────────────────────────────
  "format-citations"               = "glyph_citation_format",
  "manage-bibliography"            = "glyph_bibliography",
  "validate-references"            = "glyph_ref_validate",

  # ── linguistics (1) ──────────────────────────────────────────
  "research-word-etymology"        = "glyph_etymology_tree",

  # ── entomology (5) ─────────────────────────────────────────
  "document-insect-sighting"       = "glyph_insect_camera",
  "identify-insect"                = "glyph_insect_key",
  "observe-insect-behavior"        = "glyph_insect_watch",
  "collect-preserve-specimens"     = "glyph_insect_pin",
  "survey-insect-population"       = "glyph_insect_survey",

  # ── spectroscopy (6) ────────────────────────────────────────
  "interpret-nmr-spectrum"          = "glyph_nmr_spectrum",
  "interpret-ir-spectrum"           = "glyph_ir_spectrum",
  "interpret-mass-spectrum"         = "glyph_mass_spectrum",
  "interpret-uv-vis-spectrum"       = "glyph_uv_vis_spectrum",
  "interpret-raman-spectrum"        = "glyph_raman_spectrum",
  "plan-spectroscopic-analysis"     = "glyph_spectroscopic_plan",

  # ── chromatography (5) ─────────────────────────────────────
  "develop-gc-method"               = "glyph_gc_column",
  "develop-hplc-method"             = "glyph_hplc_system",
  "interpret-chromatogram"          = "glyph_chromatogram",
  "troubleshoot-separation"         = "glyph_separation_fix",
  "validate-analytical-method"      = "glyph_method_validation",

  # ── digital-logic (4) ────────────────────────────────────────────────
  "evaluate-boolean-expression"     = "glyph_boolean_table",
  "design-logic-circuit"            = "glyph_logic_gates",
  "build-sequential-circuit"        = "glyph_flip_flop",
  "simulate-cpu-architecture"       = "glyph_cpu_chip",

  # ── i18n (1) ────────────────────────────────────────────────────────
  "translate-content"              = "glyph_translate",

  # ── electromagnetism (4) ─────────────────────────────────────────────
  "analyze-magnetic-field"          = "glyph_magnetic_field",
  "solve-electromagnetic-induction" = "glyph_faraday_coil",
  "formulate-maxwell-equations"     = "glyph_maxwell_wave",
  "design-electromagnetic-device"   = "glyph_motor_coil",

  # ── levitation (3) ───────────────────────────────────────────────────
  "analyze-magnetic-levitation"     = "glyph_maglev_float",
  "design-acoustic-levitation"      = "glyph_acoustic_node",
  "evaluate-levitation-mechanism"   = "glyph_levitation_compare",

  # ── tensegrity (1) ─────────────────────────────────────────────────────
  "analyze-tensegrity-system"      = "glyph_tensegrity",

  # ── cli (4) ──────────────────────────────────────────────────────────
  "scaffold-cli-command"           = "glyph_cli_scaffold",
  "build-cli-plugin"               = "glyph_cli_plugin",
  "test-cli-application"           = "glyph_cli_test",
  "design-cli-output"              = "glyph_cli_output"
)
