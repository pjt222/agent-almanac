# Skills Library for Agentic Systems

<!-- AUTO:START:skills-intro -->
A collection of 333 task-level skills following the [Agent Skills open standard](https://agentskills.io) (`SKILL.md` format). These skills provide structured, executable procedures that agentic systems (Claude Code, Codex, Cursor, Gemini CLI, etc.) can consume to perform specific development tasks.
<!-- AUTO:END:skills-intro -->

## How Skills Differ from Guides and Agents

| Concept | Purpose | Example |
|---------|---------|---------|
| **Guides** (parent directory) | Human-readable reference docs | "R Package Development Best Practices" |
| **Agents** (`agents/` directory) | Personas with broad capabilities | "R Developer" agent |
| **Skills** (this directory) | Executable procedures for specific tasks | "Submit to CRAN" step-by-step |

Skills complement agents. An agent defines *who* (persona, tools, style); a skill defines *how* (procedure, validation, recovery).

## Quick Start

Browse by domain:

<!-- AUTO:START:skills-table -->
| Domain | Skills | Description |
|--------|--------|-------------|
| [R Packages](r-packages/) | 10 | R package development lifecycle skills |
| [Jigsawr](jigsawr/) | 5 | jigsawR puzzle package development skills |
| [Containerization](containerization/) | 10 | Docker and container workflow skills |
| [Reporting](reporting/) | 4 | Quarto, R Markdown, and publication-ready report skills |
| [Compliance](compliance/) | 17 | GxP regulatory and validation skills |
| [Mcp Integration](mcp-integration/) | 5 | MCP server setup and troubleshooting skills |
| [Web Dev](web-dev/) | 4 | Web development skills for Next.js and modern frontend |
| [Git](git/) | 7 | Git version control and GitHub workflow skills |
| [General](general/) | 18 | Cross-cutting development environment and workflow skills |
| [Citations](citations/) | 3 | Academic and software citation management with R and BibTeX |
| [Data Serialization](data-serialization/) | 2 | Data serialization formats, schemas, and evolution strategies |
| [Review](review/) | 11 | Senior-level review skills for research, data, architecture, and design |
| [Bushcraft](bushcraft/) | 4 | Wilderness survival and primitive skills |
| [Esoteric](esoteric/) | 29 | Esoteric practices — AI self-directed variants and human-guidance variants |
| [Design](design/) | 5 | Ornamental design and AI-assisted image generation skills |
| [Defensive](defensive/) | 6 | Martial arts and applied defensive awareness skills |
| [Project Management](project-management/) | 6 | Agile and classic project management skills |
| [Devops](devops/) | 13 | CI/CD, Kubernetes, GitOps, and infrastructure automation skills |
| [Observability](observability/) | 13 | Monitoring, logging, tracing, alerting, and reliability engineering skills |
| [Mlops](mlops/) | 12 | ML experiment tracking, model serving, feature stores, pipelines, and AIOps skills |
| [Workflow Visualization](workflow-visualization/) | 6 | Workflow annotation and Mermaid diagram generation with putior |
| [Swarm](swarm/) | 8 | Collective intelligence, emergent coordination, and distributed decision-making strategies |
| [Morphic](morphic/) | 7 | Adaptive transformation, structural metamorphosis, and reconfiguration strategies |
| [Alchemy](alchemy/) | 4 | Code and data transmutation through systematic decomposition, purification, and synthesis |
| [Tcg](tcg/) | 3 | Trading card game grading, deck building, and collection management |
| [Intellectual Property](intellectual-property/) | 5 | Patent landscape analysis, prior art search, and IP strategy |
| [Gardening](gardening/) | 5 | Plant cultivation, soil preparation, garden observation, and hand tool care |
| [Shiny](shiny/) | 7 | Shiny web application development, modules, testing, and deployment |
| [Animal Training](animal-training/) | 2 | Canine behavior and obedience training skills |
| [Mycology](mycology/) | 2 | Fungi identification, cultivation, and mycelial ecology |
| [Prospecting](prospecting/) | 2 | Mineral identification and precious metal recovery |
| [Crafting](crafting/) | 1 | Traditional handcraft and artisan skills |
| [Library Science](library-science/) | 3 | Library cataloging, collection management, and material preservation |
| [Linguistics](linguistics/) | 1 | Historical and computational linguistics — etymology, philology, and NLP |
| [Travel](travel/) | 6 | Tour planning, hiking, route visualization, and outdoor trip logistics |
| [Relocation](relocation/) | 3 | Cross-border EU/DACH relocation planning, documents, and bureaucracy |
| [A2a Protocol](a2a-protocol/) | 3 | Google A2A agent-to-agent protocol implementation and interoperability |
| [Geometry](geometry/) | 3 | Classical and computational geometry, trigonometry, and proofs |
| [Number Theory](number-theory/) | 3 | Prime analysis, modular arithmetic, and Diophantine equations |
| [Stochastic Processes](stochastic-processes/) | 3 | Markov chains, HMMs, MCMC, and stochastic simulation |
| [Theoretical Science](theoretical-science/) | 3 | Quantum physics, quantum chemistry, and theoretical mathematics |
| [Diffusion](diffusion/) | 4 | Cognitive drift-diffusion models and generative AI diffusion models |
| [Hildegard](hildegard/) | 5 | Hildegard von Bingen medieval polymath knowledge — herbal medicine, holistic health, sacred music, viriditas, and natural history |
| [Maintenance](maintenance/) | 5 | Codebase cleanup, project tidying, broken reference repair, and issue triage |
| [Blender](blender/) | 3 | Blender Python API scripting for 3D modeling, scene creation, and rendering |
| [Visualization](visualization/) | 4 | 2D visualization, image composition, and publication-ready graphics |
| [3d Printing](3d-printing/) | 3 | Additive manufacturing from model preparation through troubleshooting |
| [Lapidary](lapidary/) | 4 | Gemstone identification, cutting, polishing, and appraisal |
| [Entomology](entomology/) | 5 | Insect identification, behavior observation, population surveys, specimen preservation, and citizen science |
| [Versioning](versioning/) | 4 | Semantic versioning, changelog management, release planning, and dependency auditing |
| [Spectroscopy](spectroscopy/) | 6 | Spectroscopic technique interpretation and analytical planning for NMR, IR, MS, UV-Vis, and Raman |
| [Chromatography](chromatography/) | 5 | Chromatographic method development, interpretation, troubleshooting, and ICH Q2 validation |
| [Digital Logic](digital-logic/) | 4 | Boolean algebra, logic gates, combinational and sequential circuits, and CPU architecture simulation |
| [Electromagnetism](electromagnetism/) | 4 | Electric and magnetic fields, Maxwell's equations, electromagnetic induction, and practical electromagnetic devices |
| [Levitation](levitation/) | 3 | Physical levitation mechanisms including magnetic, acoustic, aerodynamic, and electrostatic |
| [I18n](i18n/) | 1 | Internationalization and translation workflow skills |
| [Synoptic](synoptic/) | 4 | Panoramic awareness, cross-domain integration, and simultaneous multi-perspective cognition |
| [Tensegrity](tensegrity/) | 1 | Tensional integrity systems — force balance, prestress stability, and cross-scale structural analysis from cytoskeleton to architecture |
| [Cli](cli/) | 4 | CLI tool development — command scaffolding, plugin architecture, terminal output design, and integration testing |
<!-- AUTO:END:skills-table -->

## SKILL.md Format

Each skill lives in its own directory with a `SKILL.md` file:

```
skills/skill-name/
├── SKILL.md          # Required: skill definition
├── references/       # Optional: reference materials
├── scripts/          # Optional: automation scripts
└── assets/           # Optional: templates, configs
```

Every `SKILL.md` includes YAML frontmatter with metadata (`name`, `description`, `allowed-tools`, `complexity`, etc.) followed by structured sections: When to Use, Inputs, Procedure, Validation, Common Pitfalls, and Related Skills.

## Consuming Skills from Different Systems

### Claude Code

Reference skills directly in your `CLAUDE.md`:

```markdown
## Skills
@agent-almanac/skills/submit-to-cran/SKILL.md
```

Or symlink the entire skills directory:

```bash
ln -s /path/to/agent-almanac/skills ~/.claude/skills
```

### Codex (OpenAI)

Symlink into the agents directory:

```bash
ln -s /path/to/agent-almanac/skills .agents/skills
```

Reference in your `AGENTS.md`:

```markdown
## Available Skills
See `.agents/skills/_registry.yml` for the full skill catalog.
```

### Cursor

Map skills to rule files. In `.cursor/rules/`:

```bash
# Symlink specific skills as .mdc files
ln -s /path/to/skills/submit-to-cran/SKILL.md .cursor/rules/submit-to-cran.mdc
```

Or reference the skills directory in your `.cursorrules`:

```
When performing R package tasks, consult skills in agent-almanac/skills/
```

### Other Tools (Gemini CLI, Aider, etc.)

Clone the repo and point your tool's context to the relevant `SKILL.md` file. The standard format is designed for universal consumption — any tool that reads markdown can use these skills.

### Programmatic Discovery

Use `_registry.yml` for machine-readable skill lookup:

```python
import yaml
with open("skills/_registry.yml") as f:
    registry = yaml.safe_load(f)
    for domain, info in registry["domains"].items():
        for skill in info["skills"]:
            print(f"{domain}/{skill['id']} [{skill['complexity']}]")
```

## Agent Integration

Existing agents in `agents/` can reference skills:

```markdown
# In r-developer.md agent definition
## Available Skills
When performing package development tasks, follow procedures from:
- `skills/create-r-package/SKILL.md` for new packages
- `skills/submit-to-cran/SKILL.md` for CRAN submission
- `skills/write-testthat-tests/SKILL.md` for testing patterns
```

## Contributing a New Skill

1. Create a directory: `skills/<skill-name>/`
2. Write `SKILL.md` following the template (see any existing skill)
3. Add the skill to `_registry.yml`
4. Ensure frontmatter includes required fields: `name`, `description`, `allowed-tools`
5. Include at minimum: When to Use, Procedure, and Validation sections

## See Also

- [Understanding the System](../guides/understanding-the-system.md) -- how skills, agents, and teams compose
- [Creating Skills](../guides/creating-skills.md) -- authoring, evolving, and reviewing skills
- [Agents Library](../agents/README.md) -- specialist personas that execute skills
- [Teams Library](../teams/README.md) -- multi-agent compositions
- [Root README](../README.md) -- project overview

## License

MIT License. See parent project for details.
