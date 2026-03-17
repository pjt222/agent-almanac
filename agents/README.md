# Agents Library for Claude Code

<!-- AUTO:START:agents-intro -->
A collection of 66 specialized agent definitions for [Claude Code](https://docs.anthropic.com/en/docs/claude-code). Each agent defines a persona with specific capabilities, tools, and domain expertise that Claude Code uses when spawned as a subagent.

All agents inherit **default skills**: meditate, heal.
<!-- AUTO:END:agents-intro -->

## How Agents Differ from Skills and Guides

| Concept | Purpose | Example |
|---------|---------|---------|
| **Guides** (parent directory) | Human-readable reference docs | "R Package Development Best Practices" |
| **Agents** (this directory) | Personas with broad capabilities | "R Developer" agent |
| **Skills** (`skills/` directory) | Executable procedures for specific tasks | "Submit to CRAN" step-by-step |

Agents define *who* (persona, tools, style); skills define *how* (procedure, validation, recovery). They complement each other — an agent can reference skills to execute specific tasks.

## Available Agents

<!-- AUTO:START:agents-table -->
| Agent | Priority | Description |
|-------|----------|-------------|
| [security-analyst](security-analyst.md) | critical | Specialized agent for security auditing, vulnerability assessment, and defensive security practices |
| [adaptic](adaptic.md) | high | Panoramic synthesis through simultaneous multi-domain awareness — perceives the whole field before acting on any part |
| [auditor](auditor.md) | high | GxP audit and investigation specialist for audit planning, execution, finding classification, CAPA root cause analysis, inspection readiness, data integrity monitoring, and vendor qualification |
| [code-reviewer](code-reviewer.md) | high | Reviews code changes, pull requests, and provides detailed feedback on code quality, security, and best practices |
| [devops-engineer](devops-engineer.md) | high | Infrastructure and platform engineering agent for CI/CD, Kubernetes, GitOps, service mesh, observability, and chaos engineering |
| [gxp-validator](gxp-validator.md) | high | Computer Systems Validation and compliance lifecycle specialist covering 21 CFR Part 11, EU Annex 11, GAMP 5, compliance architecture, change control, electronic signatures, SOPs, data integrity monitoring, training programmes, and system decommissioning |
| [ip-analyst](ip-analyst.md) | high | Patent landscape mapping, prior art search, trademark screening, FTO analysis |
| [jigsawr-developer](jigsawr-developer.md) | high | Specialized agent for jigsawR package development covering puzzle generation, pipeline integration, PILES notation, ggpuzzle layers, Quarto docs, and Shiny app |
| [mlops-engineer](mlops-engineer.md) | high | ML operations agent for experiment tracking, model registry, feature stores, ML pipelines, model serving, drift monitoring, and AIOps |
| [polymath](polymath.md) | high | Cross-disciplinary synthesis; spawns domain-specific subagents, synthesizes findings across domains, and produces integrated insights |
| [r-developer](r-developer.md) | high | Specialized agent for R package development, data analysis, and statistical computing with MCP integration |
| [senior-data-scientist](senior-data-scientist.md) | high | Reviews statistical analyses, ML pipelines, data quality, model validation, and data serialization practices |
| [senior-researcher](senior-researcher.md) | high | Expert peer reviewer of research methodology, experimental design, statistical analysis, and scientific writing |
| [senior-software-developer](senior-software-developer.md) | high | Architecture reviewer evaluating system design, SOLID principles, scalability, API design, and technical debt |
| [senior-ux-ui-specialist](senior-ux-ui-specialist.md) | high | Usability and accessibility reviewer applying Nielsen heuristics, WCAG 2.1, keyboard/screen reader audits, and user flow analysis |
| [senior-web-designer](senior-web-designer.md) | high | Visual design reviewer evaluating layout, typography, colour, spacing, responsive behaviour, and brand consistency |
| [shiny-developer](shiny-developer.md) | high | Shiny application specialist for reactive web apps in R, covering scaffolding (golem/rhino/vanilla), modules, bslib theming, testing with shinytest2, performance optimization, and deployment |
| [acp-developer](acp-developer.md) | normal | Agent-to-Agent (A2A) protocol developer for building interoperable agent systems using Google's open A2A standard with JSON-RPC, task lifecycle, and streaming |
| [advocatus-diaboli](advocatus-diaboli.md) | normal | Constructive contrarian for rigorous assumption-testing, counterargument generation, Socratic questioning, and logical fallacy detection |
| [alchemist](alchemist.md) | normal | Code/data transmutation via four-stage alchemical process (nigredo/albedo/citrinitas/rubedo) with meditate/heal checkpoints |
| [apa-specialist](apa-specialist.md) | normal | APA 7th edition specialist for academic table formatting, writing guidance, Quarto/papaja implementation, and citation auditing |
| [blender-artist](blender-artist.md) | normal | 3D and 2D visualization specialist using Blender Python API for scene creation, procedural modeling, animation, rendering, and 2D composition |
| [chromatographer](chromatographer.md) | normal | Chromatographic method development and validation specialist for GC and HPLC with ICH Q2 compliance |
| [citizen-entomologist](citizen-entomologist.md) | normal | Curiosity-driven entomologist for accessible insect identification, citizen science participation, nature education, and community engagement |
| [conservation-entomologist](conservation-entomologist.md) | normal | Conservation-first entomologist for ecological assessment, pollinator surveys, habitat preservation, and non-destructive insect observation |
| [contemplative](contemplative.md) | normal | Meta-cognitive practice specialist embodying the foundational tending skills — meditation, healing, centering, attunement, and creative stillness |
| [designer](designer.md) | normal | Ornamental design specialist for historical style analysis and AI-assisted image generation using Z-Image, grounded in Alexander Speltz's classical ornament taxonomy |
| [diffusion-specialist](diffusion-specialist.md) | normal | Diffusion process specialist bridging cognitive drift-diffusion models and generative AI diffusion models for parameter estimation and implementation |
| [dog-trainer](dog-trainer.md) | normal | Canine behavior specialist for obedience training, socialization, and behavioral modification using positive reinforcement and force-free methods |
| [etymologist](etymologist.md) | normal | Historical linguistics specialist for etymology research, proto-language root tracing, cognate comparison, semantic drift documentation, and folk etymology identification |
| [fabricator](fabricator.md) | normal | 3D printing and additive manufacturing specialist covering FDM, SLA, and SLS processes from model preparation through troubleshooting |
| [gardener](gardener.md) | normal | Plant cultivation guide for bonsai, soil preparation, biodynamic calendar planning, garden observation, and hand tool maintenance with contemplative checkpoints |
| [geometrist](geometrist.md) | normal | Classical and computational geometry specialist for ruler-and-compass constructions, Euclidean proofs, trigonometric problem solving, and geometric transformations |
| [hiking-guide](hiking-guide.md) | normal | Outdoor trip planning guide for hiking tours covering trail selection, difficulty grading, gear checklists, route duration estimation, and safety protocols |
| [hildegard](hildegard.md) | normal | Medieval polymath persona channeling Hildegard von Bingen — herbal medicine from Physica, holistic health from Causae et Curae, sacred music composition, viriditas philosophy, and natural history consultation |
| [janitor](janitor.md) | normal | Triple-scope maintenance agent for codebase cleanup, project-level tidying, and physical space janitorial knowledge with triage-and-escalate pattern |
| [kabalist](kabalist.md) | normal | Kabbalistic studies guide for Tree of Life navigation, gematria computation, and Hebrew letter mysticism with scholarly and contemplative approaches |
| [lapidary](lapidary.md) | normal | Gemstone specialist for identification, cutting techniques, polishing methods, and value appraisal with safety-first approach |
| [librarian](librarian.md) | normal | Knowledge organization and library management specialist for cataloging, classification, collection curation, material preservation, and information retrieval |
| [logician](logician.md) | normal | Digital logic specialist for Boolean algebra, gate-level circuit design, sequential logic, and CPU architecture simulation |
| [markovian](markovian.md) | normal | Stochastic process specialist covering Markov chains, hidden Markov models, MDPs, MCMC, and convergence diagnostics |
| [martial-artist](martial-artist.md) | normal | Defensive martial arts instructor for tai chi, aikido, and situational awareness with de-escalation and grounding techniques |
| [mcp-developer](mcp-developer.md) | normal | MCP server development specialist that analyzes codebases to identify tool-exposure opportunities and scaffolds Model Context Protocol servers |
| [mycologist](mycologist.md) | normal | Fungi specialist for field identification, cultivation guidance, mycelial ecology, and mushroom safety with absolute safety-first approach |
| [mystic](mystic.md) | normal | Esoteric practices guide for energy healing, meditation facilitation, and coordinate remote viewing with structured protocols |
| [nlp-specialist](nlp-specialist.md) | normal | Computational natural language processing specialist for text preprocessing, transformer fine-tuning, named entity recognition, sentiment analysis, and NLP evaluation metrics |
| [number-theorist](number-theorist.md) | normal | Number theory specialist for prime analysis, modular arithmetic, and Diophantine equations with computational and proof-based approaches |
| [physicist](physicist.md) | normal | Classical and applied physics specialist covering electromagnetism, levitation mechanisms, and physical device design |
| [project-manager](project-manager.md) | normal | Project management agent for agile and classic methodologies covering charters, WBS, sprints, backlogs, status reports, and retrospectives |
| [prospector](prospector.md) | normal | Mineral and precious metal finder for geological reading, field identification, alluvial gold recovery, and responsible site assessment |
| [putior-integrator](putior-integrator.md) | normal | Workflow visualization specialist that integrates putior into arbitrary codebases for Mermaid diagram generation |
| [quarto-developer](quarto-developer.md) | normal | Quarto CLI specialist for multilingual QMD files, technical documentation, books, websites, presentations, dashboards, and manuscript publishing |
| [relocation-expert](relocation-expert.md) | normal | Cross-border relocation specialist for EU/DACH region covering residence registration, work permits, tax, health insurance, and social security coordination |
| [shaman](shaman.md) | normal | Shamanic practitioner for journeying, ceremonial guidance, soul retrieval, and integration of plant medicine traditions with safety-first approach |
| [shapeshifter](shapeshifter.md) | normal | Metamorphic transformation guide for architectural adaptation, structural dissolution, regenerative repair, and adaptive surface control |
| [skill-reviewer](skill-reviewer.md) | normal | Skill quality reviewer for SKILL.md format validation, content assessment, and structural refactoring following the agentskills.io standard |
| [spectroscopist](spectroscopist.md) | normal | Spectroscopic analysis specialist for NMR, IR, MS, UV-Vis, and Raman interpretation with multi-technique structure elucidation |
| [survivalist](survivalist.md) | normal | Wilderness survival instructor agent for fire craft, water purification, and plant foraging with safety-first guidance |
| [swarm-strategist](swarm-strategist.md) | normal | Collective intelligence advisor for distributed coordination, foraging optimization, consensus building, colony defense, and scaling strategies |
| [taxonomic-entomologist](taxonomic-entomologist.md) | normal | Scientific systematist for insect identification using dichotomous keys, morphological analysis, museum-grade specimen preservation, and formal taxonomic nomenclature |
| [tcg-specialist](tcg-specialist.md) | normal | Trading card game grading (PSA/BGS/CGC), deck building, collection management for Pokemon/MTG/FaB/Kayou |
| [theoretical-researcher](theoretical-researcher.md) | normal | Theoretical science researcher spanning quantum physics, quantum chemistry, and theoretical mathematics focused on derivation, proof, and literature synthesis |
| [tour-planner](tour-planner.md) | normal | Spatial and temporal tour planning specialist using open-source maps, R geospatial packages, and interactive visualization for route optimization and cartographic output |
| [translator](translator.md) | normal | LLM-assisted translation specialist for localizing skills, agents, teams, and guides while preserving code blocks, IDs, and technical accuracy |
| [version-manager](version-manager.md) | normal | Software versioning specialist for semantic versioning, changelog management, release planning, and dependency version auditing |
| [web-developer](web-developer.md) | normal | Full-stack web development agent for Next.js, TypeScript, and Tailwind CSS projects with deployment and environment setup |
<!-- AUTO:END:agents-table -->

Each agent lists the skills it can execute in its `skills` frontmatter field and `## Available Skills` section. The devops-engineer agent covers the most ground (35 skills across 5 domains). Together, the 29 agents cover 161 of the 177 skills in the library. The sixteen uncovered skills are the two meta-skills (`create-skill` and `evolve-skill`), the two visualization utilities (`create-skill-glyph`, `glyph-enhance`), the four AI meta-cognitive skills (`learn`, `teach`, `listen`, `observe`), the seven human-guidance skills (`heal-guidance`, `meditate-guidance`, `remote-viewing-guidance`, `learn-guidance`, `teach-guidance`, `listen-guidance`, `observe-guidance`), and the memory utility (`manage-memory`).

## Using Agents in Claude Code

### Automatic Discovery

Place agent files in `.claude/agents/` (project-level) or `~/.claude/agents/` (global). Claude Code discovers them automatically and makes them available as subagent types via the `Task` tool.

This repository's `.claude/agents/` symlinks to this directory, so agents are available when working in the agent-almanac project.

### Manual Reference

Reference agents in your `CLAUDE.md`:

```markdown
## Agents
@agent-almanac/agents/r-developer.md
@agent-almanac/agents/code-reviewer.md
@agent-almanac/agents/security-analyst.md
```

### Spawning an Agent

In Claude Code, agents are invoked via the Task tool with `subagent_type`:

```
Task(subagent_type="r-developer", prompt="Create a new R package for time series analysis")
Task(subagent_type="code-reviewer", prompt="Review this pull request for security issues")
Task(subagent_type="security-analyst", prompt="Audit this codebase for OWASP Top 10 vulnerabilities")
Task(subagent_type="web-developer", prompt="Scaffold a Next.js app with Tailwind and deploy to Vercel")
Task(subagent_type="gxp-validator", prompt="Perform a CSV assessment for our new LIMS system")
Task(subagent_type="auditor", prompt="Conduct an internal audit of our validated R environment")
Task(subagent_type="senior-researcher", prompt="Review this manuscript's methodology and statistical analysis")
Task(subagent_type="senior-data-scientist", prompt="Review our ML pipeline for data leakage")
Task(subagent_type="senior-software-developer", prompt="Review the architecture of this microservices system")
Task(subagent_type="senior-web-designer", prompt="Review the typography and colour consistency of our site")
Task(subagent_type="senior-ux-ui-specialist", prompt="Audit this app for WCAG 2.1 AA compliance")
Task(subagent_type="survivalist", prompt="Teach me how to purify water from a stream")
Task(subagent_type="mystic", prompt="Guide me through a 15-minute meditation session")
Task(subagent_type="martial-artist", prompt="Teach me the opening movements of Yang 24 tai chi")
Task(subagent_type="designer", prompt="Create an Islamic geometric star pattern in turquoise and gold")
Task(subagent_type="project-manager", prompt="Set up agile PM for our new API service project")
Task(subagent_type="devops-engineer", prompt="Deploy our API to Kubernetes with CI/CD and monitoring")
Task(subagent_type="mlops-engineer", prompt="Set up MLflow tracking and model registry for our ML project")
Task(subagent_type="swarm-strategist", prompt="Design stigmergic coordination for our microservices fleet")
Task(subagent_type="shapeshifter", prompt="Assess our monolith for strangler fig migration readiness")
Task(subagent_type="alchemist", prompt="Transform this legacy PHP module into clean TypeScript")
Task(subagent_type="polymath", prompt="Assess feasibility of an AI medical imaging tool across engineering, compliance, IP, and UX")
Task(subagent_type="tcg-specialist", prompt="Grade this 1st Edition Charizard and advise on PSA submission")
Task(subagent_type="ip-analyst", prompt="Map the patent landscape for federated learning before we start R&D")
Task(subagent_type="gardener", prompt="Help me plan spring planting using the lunar calendar")
Task(subagent_type="quarto-developer", prompt="Create a multilingual technical book with R and Python chapters")
Task(subagent_type="shiny-developer", prompt="Build a golem Shiny app with filter modules and deploy to shinyapps.io")
```

## Agent File Format

Each agent is a markdown file with YAML frontmatter:

```yaml
---
name: agent-name           # kebab-case identifier
description: Brief purpose  # 1-2 sentences
tools: [Read, Write, ...]  # Required Claude Code tools
model: claude-3-5-sonnet-20241022
version: "1.0"
author: Author Name
tags: [domain, capability]
priority: normal            # low | normal | high | critical
skills: [skill-id, ...]    # Skills from skills/ this agent can execute
---
```

See [agent-configuration-schema.md](../guides/agent-configuration-schema.md) for the full schema and [_template.md](_template.md) for a starter template.

## Creating a New Agent

1. Copy `_template.md` to `<agent-name>.md`
2. Fill in the YAML frontmatter (all required fields)
3. Write the Purpose, Capabilities, Usage Scenarios, and Examples sections
4. Add the agent to `_registry.yml`
5. Update the table in this README

See [agent-best-practices.md](../guides/agent-best-practices.md) for detailed guidance on writing effective agents.

## Registry

`_registry.yml` provides machine-readable metadata for all agents. Keep it in sync when adding or removing agents.

## License

MIT License. See parent project for details.
