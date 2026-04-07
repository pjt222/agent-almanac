---
title: "Edge Computing Deployment"
description: "Install agent-almanac skills on edge LLMs (Gemma 4 via AI Edge Gallery) with distilled content, token budgets, and offline bundles"
category: workflow
agents: [edge-ai-engineer, mlops-engineer]
teams: []
skills: [deploy-edge-ai-model, deploy-ml-model-serving, install-almanac-content]
---

# Edge Computing Deployment

This guide covers installing agent-almanac content on edge systems -- on-device LLMs like Gemma 4 running through Google AI Edge Gallery, where skills must be distilled to fit small context windows (2K-8K tokens), operate without tool-use capabilities, and work entirely offline.

The CLI includes an `ai-edge` framework adapter that aggressively transforms skills, agents, and teams into compact instruction fragments suitable for on-device models.

## When to Use This Guide

- You want almanac skills available on a phone or tablet running Gemma 4 locally
- You are building a mobile app that uses on-device LLM inference with structured procedures
- You need offline-capable agentic workflows on embedded or IoT devices
- You want to evaluate which skills are viable on small context-window models
- You are packaging a domain-specific skill bundle for edge deployment

## Prerequisites

- `agent-almanac` CLI installed and configured
- Google AI Edge Gallery or MediaPipe LLM Inference API set up on target device
- On-device model deployed (see `deploy-edge-ai-model` skill for model setup)
- Understanding of target model's context window size (Gemma 4 2B: ~8K tokens)

## Workflow Overview

```
1. Choose skills for edge          (human selects domain/skills)
2. Install with ai-edge adapter    (CLI distills content)
3. Generate token-budgeted bundle  (CLI creates bundle.md)
4. Embed bundle in mobile app      (developer integrates)
5. Test on-device skill execution  (edge-ai-engineer validates)
```

## Installing Skills for Edge

The `ai-edge` adapter is a new installation strategy alongside symlink and append-to-file. It **distills** each skill to ~20-40 lines by keeping only:

- Skill name and description
- Numbered procedure step headings
- Validation checklist items

Everything else is stripped: code blocks, failure handling, pitfalls, related skills, inputs, frontmatter details.

### Install individual skills

```bash
# Install specific skills, distilled for edge
agent-almanac install create-r-package deploy-edge-ai-model --framework ai-edge

# Install an entire domain
agent-almanac install --domain devops --framework ai-edge

# Preview without writing
agent-almanac install --domain mlops --framework ai-edge --dry-run
```

Output files land in `.ai-edge/skills/<id>.md`, each containing the distilled content.

### Example: full skill vs edge-distilled

A 300-line `deploy-ml-model-serving` SKILL.md distills to approximately:

```markdown
# deploy-ml-model-serving

Deploy machine learning models to production serving infrastructure using MLflow,
BentoML, or Seldon Core with REST/gRPC endpoints.

## Steps
1. Deploy with MLflow Models Serving
2. Deploy with BentoML for Production Scale
3. Implement Seldon Core for Advanced Features
4. Implement Monitoring and Observability
5. Implement Autoscaling
6. Implement Canary Deployment Strategy

## Verify
- Model server responds to prediction requests
- REST/gRPC endpoints functional and documented
- Docker containers build and run successfully
- Kubernetes deployment creates expected replicas
- Autoscaling triggers under load
- Canary deployment rolls out gradually
```

~20 lines instead of ~420. Fits comfortably in a Gemma 4 context window alongside a user prompt.

## Generating a Bundle

For on-device use, individual files are less practical than a single system prompt fragment. The `bundle` command combines all installed edge skills into one file with a token budget:

```bash
# Bundle all installed edge skills (default 4000 token budget)
agent-almanac bundle --framework ai-edge

# Custom token budget for larger models
agent-almanac bundle --framework ai-edge --max-tokens 6000

# Budget for Gemma 4 1B (smaller context)
agent-almanac bundle --framework ai-edge --max-tokens 2000
```

This generates `.ai-edge/bundle.md` -- a single file you embed as a system prompt or inject at inference time.

### Token budget guidelines

| Model | Context Window | Recommended Budget | Approx Skills |
|-------|---------------|-------------------|---------------|
| Gemma 4 1B IT | ~4K tokens | 2000 tokens | 5-8 skills |
| Gemma 4 2B IT | ~8K tokens | 4000 tokens | 12-18 skills |
| Gemma 4 4B IT | ~8K tokens | 4000 tokens | 12-18 skills |
| Phi-3 Mini | ~4K tokens | 2000 tokens | 5-8 skills |
| Llama 3.2 1B | ~8K tokens | 4000 tokens | 12-18 skills |

Skills are included in order until the budget is exhausted. Prioritize by installing your most important skills first.

## Embedding in a Mobile App

### Android with AI Edge Gallery / MediaPipe

```kotlin
// Load the bundled skills as system prompt
val bundle = context.assets.open("ai-edge/bundle.md").bufferedReader().readText()

val options = LlmInference.LlmInferenceOptions.builder()
    .setModelPath(modelPath)
    .setMaxTokens(1024)
    .build()

val engine = LlmInference.createFromOptions(context, options)

// Inject bundle as system context
val prompt = "$bundle\n\nUser: ${userQuery}"
val response = engine.generateResponse(prompt)
```

### Copy bundle to device for testing

```bash
# Push bundle to connected Android device
adb push .ai-edge/bundle.md /data/local/tmp/skills-bundle.md
```

## Edge vs Cloud Skill Execution

Not all skills work well on edge. Skills with complex multi-step procedures, heavy code generation, or tool dependencies are better suited to cloud models.

| Skill Characteristic | Edge Viable | Cloud Preferred |
|---------------------|-------------|-----------------|
| Short procedure (< 6 steps) | Yes | -- |
| No tool-use required | Yes | -- |
| Conversational / Q&A guidance | Yes | -- |
| Requires Read/Write/Bash tools | -- | Yes |
| Code generation > 20 lines | -- | Yes |
| Multi-agent coordination | -- | Yes |

Good edge candidates: checklists, decision guides, identification procedures, safety protocols, field guides (gardening, mycology, bushcraft, entomology).

## Updating Edge Content

When almanac skills are updated upstream:

```bash
# Reinstall with --force to refresh distilled content
agent-almanac install --domain bushcraft --framework ai-edge --force

# Regenerate the bundle
agent-almanac bundle --framework ai-edge
```

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Bundle exceeds token budget | Too many skills installed | Reduce installed skills or lower `--max-tokens` |
| Model ignores procedure steps | Bundle too long for context | Reduce to 5-8 highest-priority skills |
| Distilled skill too terse | Edge transformer strips too aggressively | Use full skill via cloud model for that task |
| `ai-edge` adapter not detected | No `.ai-edge/` directory or AI Edge Gallery markers | Use `--framework ai-edge` explicitly |
| Skills reference tools model can't use | Edge models lack tool-use | Choose skills that are guidance-only, not tool-dependent |

## Related Resources

- [Edge AI Engineer](../agents/edge-ai-engineer.md) -- Agent for edge deployment and skill validation
- [MLOps Engineer](../agents/mlops-engineer.md) -- Model registry and fleet monitoring
- [deploy-edge-ai-model](../skills/deploy-edge-ai-model/SKILL.md) -- Technical model deployment to devices
- [install-almanac-content](../skills/install-almanac-content/SKILL.md) -- General CLI installation guide
