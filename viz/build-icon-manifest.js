#!/usr/bin/env node
/**
 * build-icon-manifest.js
 *
 * Generates icon manifests for skills, agents, and teams.
 * Reads viz/data/skills.json + YAML style configs and produces:
 *   - viz/data/icon-manifest.json (skills)
 *   - viz/data/agent-icon-manifest.json (agents)
 *   - viz/data/team-icon-manifest.json (teams)
 *
 * Usage:
 *   node build-icon-manifest.js              # skills only (default)
 *   node build-icon-manifest.js --type all   # skills + agents + teams
 *   node build-icon-manifest.js --type agent # agents only
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_PATH = resolve(__dirname, 'public', 'data', 'skills.json');
const ICONS_DIR = resolve(__dirname, 'public', 'icons');

// ── Parse CLI args ──────────────────────────────────────────────────
const args = process.argv.slice(2);
const typeIdx = args.indexOf('--type');
const buildTypes = typeIdx >= 0
  ? args[typeIdx + 1].split(',').map(s => s.trim())
  : ['skill'];

// ── Generation config ───────────────────────────────────────────────
const META = {
  model: 'mcp-tools/Z-Image-Turbo',
  resolution: '1024x1024 ( 1:1 )',
  steps: 12,
  shift: 4,
};

const SHARED_SUFFIX = 'dark background, vector art, clean edges, single centered icon, no text';

// ── Load YAML configs ───────────────────────────────────────────────
function loadYaml(path) {
  if (!existsSync(path)) return {};
  return YAML.load(readFileSync(path, 'utf8')) || {};
}

const DOMAIN_STYLES = loadYaml(resolve(__dirname, 'domain-styles.yml'));
const AGENT_STYLES  = loadYaml(resolve(__dirname, 'agent-styles.yml'));
const TEAM_STYLES   = loadYaml(resolve(__dirname, 'team-styles.yml'));

// ── Per-skill keyword extraction ────────────────────────────────────
// Extract 2-3 descriptive keywords from the skill title/id
function skillKeywords(id, title) {
  // Map well-known skill IDs to specific visual keywords
  const overrides = {
    'create-r-package':              'scaffolding, package box',
    'submit-to-cran':                'upload arrow, checkmark stamp',
    'write-roxygen-docs':            'documentation scroll, pen nib',
    'write-testthat-tests':          'test tubes, assertion checkmark',
    'setup-github-actions-ci':       'GitHub octocat, workflow arrows',
    'manage-renv-dependencies':      'dependency tree, lock icon',
    'build-pkgdown-site':            'website wireframe, book pages',
    'release-package-version':       'version tag, rocket launch',
    'add-rcpp-integration':          'C++ gears, bridge connector',
    'write-vignette':                'long document, tutorial scroll',
    'create-r-dockerfile':           'Docker whale, R hexagon inside',
    'setup-docker-compose':          'interconnected containers, orchestration',
    'containerize-mcp-server':       'server in a box, glowing connection',
    'optimize-docker-build-cache':   'layered cache, speed arrows',
    'create-quarto-report':          'Quarto diamond, rendered document',
    'build-parameterized-report':    'template with parameters, gears',
    'format-apa-report':             'academic paper, formatted citation',
    'generate-status-report':        'dashboard gauge, progress bar',
    'conduct-gxp-audit':             'audit clipboard, magnifying glass',
    'implement-audit-trail':         'footprint trail, timestamp log',
    'write-validation-documentation':'validation stamp, protocol document',
    'setup-gxp-r-project':           'R hexagon with shield, regulated folder',
    'perform-csv-assessment':        'risk matrix, assessment checklist',
    'write-standard-operating-procedure': 'SOP document, numbered steps',
    'design-training-program':       'curriculum tree, graduation cap',
    'investigate-capa-root-cause':   'fishbone diagram, root cause arrow',
    'implement-electronic-signatures':'digital signature, fingerprint scan',
    'manage-change-control':         'change request form, approval flow',
    'monitor-data-integrity':        'data shield, integrity checkmark',
    'qualify-vendor':                'vendor badge, qualification star',
    'implement-pharma-serialisation':'pharma barcode, track-and-trace',
    'design-compliance-architecture':'architecture blueprint, regulation map',
    'prepare-inspection-readiness':  'inspection checklist, readiness meter',
    'decommission-validated-system': 'system power-down, archive box',
    'validate-statistical-output':   'statistics validation, reference comparison',
    'configure-mcp-server':          'MCP config panel, server settings',
    'build-custom-mcp-server':       'custom server build, tool palette',
    'troubleshoot-mcp-connection':   'debug probe, broken connection repair',
    'scaffold-nextjs-app':           'Next.js logo, app scaffold',
    'setup-tailwind-typescript':     'Tailwind wind, TypeScript logo',
    'deploy-to-vercel':              'Vercel triangle, deployment rocket',
    'commit-changes':                'commit diamond, staged files',
    'create-pull-request':           'pull request merge, branch arrow',
    'manage-git-branches':           'branch tree, switch arrows',
    'configure-git-repository':      'git config gear, repository folder',
    'create-github-release':         'release tag, download package',
    'resolve-git-conflicts':         'conflict merge, resolution handshake',
    'write-claude-md':               'Claude AI icon, instruction document',
    'security-audit-codebase':       'security scan, vulnerability shield',
    'setup-wsl-dev-environment':     'WSL penguin, terminal window',
    'create-skill':                  'skill blueprint, creation spark',
    'evolve-skill':                  'evolution spiral, skill upgrade arrow',
    'review-research':               'research paper, peer review lens',
    'review-data-analysis':          'data chart, analysis magnifier',
    'review-software-architecture':  'architecture diagram, review eye',
    'review-web-design':             'web layout, design review palette',
    'review-ux-ui':                  'user interface, usability heuristic',
    'make-fire':                     'sparks, flint and steel',
    'purify-water':                  'water droplet, filtration funnel',
    'forage-plants':                 'leaf identification, plant specimen',
    'meditate':                      'lotus position, calm waves',
    'heal':                          'healing hands, energy aura',
    'remote-viewing':                'third eye open, coordinate grid',
    'tai-chi':                       'tai chi flow, yin-yang balance',
    'aikido':                        'aikido spiral, redirect arrow',
    'mindfulness':                   'awareness ripple, centered mind',
    'ornament-style-mono':           'monochrome pattern, ornament motif',
    'ornament-style-color':          'polychrome ornament, color palette',
    'ornament-style-modern':         'modern pattern, futuristic ornament',
    'design-serialization-schema':   'schema blueprint, data types',
    'serialize-data-formats':        'format conversion, data stream',
    'draft-project-charter':         'charter scroll, project scope',
    'plan-sprint':                   'sprint board, velocity chart',
    'manage-backlog':                'backlog list, priority stack',
    'create-work-breakdown-structure':'WBS tree, hierarchical boxes',
    'conduct-retrospective':         'retro board, team reflection mirror',
    'conduct-post-mortem':           'timeline reconstruction, incident analysis',
    'build-ci-cd-pipeline':          'pipeline stages, continuous flow',
    'implement-gitops-workflow':     'GitOps sync, Argo CD arrows',
    'provision-infrastructure-terraform':'Terraform blocks, infrastructure map',
    'write-helm-chart':              'Helm anchor, chart template',
    'deploy-to-kubernetes':          'Kubernetes wheel, pod deployment',
    'setup-local-kubernetes':        'local cluster, development pods',
    'manage-kubernetes-secrets':     'sealed secrets, encrypted key',
    'configure-ingress-networking':  'ingress gateway, traffic routing',
    'enforce-policy-as-code':        'policy shield, code constraint',
    'setup-container-registry':      'container registry, image tags',
    'configure-api-gateway':         'API gateway, traffic funnel',
    'optimize-cloud-costs':          'cost graph, optimization arrows',
    'run-chaos-experiment':          'chaos monkey, resilience test',
    'setup-service-mesh':            'service mesh grid, sidecar proxy',
    'setup-prometheus-monitoring':   'Prometheus fire, metrics scrape',
    'build-grafana-dashboards':      'Grafana panel, dashboard grid',
    'configure-log-aggregation':     'log funnel, Loki stack',
    'instrument-distributed-tracing':'trace spans, distributed path',
    'configure-alerting-rules':      'alert bell, routing tree',
    'write-incident-runbook':        'runbook steps, incident playbook',
    'define-slo-sli-sla':            'SLO gauge, error budget bar',
    'design-on-call-rotation':       'rotation schedule, pager icon',
    'setup-uptime-checks':           'uptime heartbeat, probe signal',
    'plan-capacity':                 'capacity forecast, growth curve',
    'correlate-observability-signals':'unified signals, metric-log-trace',
    'detect-anomalies-aiops':        'anomaly spike, AI detection',
    'forecast-operational-metrics':  'forecast curve, prediction line',
    'track-ml-experiments':          'MLflow logo, experiment log',
    'build-feature-store':           'feature table, feast icon',
    'label-training-data':           'labeling tool, annotation marker',
    'version-ml-data':               'DVC version, data snapshot',
    'deploy-ml-model-serving':       'model endpoint, serving container',
    'register-ml-model':             'model registry, stage transition',
    'orchestrate-ml-pipeline':       'pipeline DAG, task flow',
    'setup-automl-pipeline':         'AutoML optimizer, hyperparameter grid',
    'run-ab-test-models':            'A/B split, model comparison',
    'monitor-model-drift':           'drift curve, distribution shift',
    'analyze-codebase-for-mcp':      'code scan, MCP tool opportunity',
    'scaffold-mcp-server':           'scaffold frame, MCP server skeleton',
    'review-skill-format':           'skill document, format validation',
    'update-skill-content':          'skill file, content update arrow',
    'refactor-skill-structure':      'skill structure, refactor arrows',
    'read-tree-of-life':             'Tree of Life, sephiroth circles, paths',
    'apply-gematria':                'Hebrew letters, numerical values, computation',
    'study-hebrew-letters':          'aleph beth, Hebrew letter forms, mystical',
    'plan-tour-route':               'route path, waypoints, map optimization',
    'create-spatial-visualization':  'interactive map, elevation profile, spatial data',
    'generate-tour-report':          'tour document, map insert, itinerary',
    'plan-hiking-tour':              'mountain trail, hiking path, elevation',
    'check-hiking-gear':             'backpack, gear checklist, equipment',
    'assess-trail-conditions':       'trail weather, condition assessment, safety',
    'plan-eu-relocation':            'EU map, relocation timeline, dependency flow',
    'check-relocation-documents':    'passport, document verification, checkmark',
    'navigate-dach-bureaucracy':     'German forms, bureaucratic steps, stamp',
    'design-a2a-agent-card':         'agent card, capability manifest, JSON',
    'implement-a2a-server':          'server, JSON-RPC, task lifecycle',
    'test-a2a-interop':              'two agents, handshake test, conformance',
    'construct-geometric-figure':    'compass, ruler, geometric construction',
    'solve-trigonometric-problem':   'unit circle, sine wave, triangle',
    'prove-geometric-theorem':       'proof triangle, QED, axiomatic',
    'model-markov-chain':            'state graph, transition arrows, steady state',
    'fit-hidden-markov-model':       'hidden states, observation layer, Viterbi',
    'simulate-stochastic-process':   'random walk, simulation path, Monte Carlo',
    'formulate-quantum-problem':     'psi wave function, quantum bracket, Hamiltonian',
    'derive-theoretical-result':     'derivation steps, proof chain, first principles',
    'survey-theoretical-literature': 'papers stack, literature synthesis, survey',
    'fit-drift-diffusion-model':     'drift accumulator, decision boundary, RT',
    'implement-diffusion-network':   'noise-to-image, denoising steps, U-Net',
    'analyze-diffusion-dynamics':    'SDE curve, Fokker-Planck, diffusion equation',
    'formulate-herbal-remedy':       'mortar pestle, herb, medieval preparation',
    'assess-holistic-health':        'four humors, temperament wheel, balance',
    'compose-sacred-music':          'neume notation, antiphon, modal music',
    'practice-viriditas':            'green spiral, viriditas power, living green',
    'consult-natural-history':       'illustrated manuscript, plant, stone, Physica',
    'clean-codebase':                'broom, dead code sweep, lint cleanup',
    'tidy-project-structure':        'organized folders, tidy structure, convention',
    'repair-broken-references':      'broken link, repair chain, fix connection',
    'escalate-issues':               'priority arrow, severity triage, escalation',
    'create-3d-scene':               '3D cube, viewport grid, scene setup',
    'script-blender-automation':     'Python script, 3D automation, procedural',
    'render-blender-output':         'camera lens, render output, compositing',
    'create-2d-composition':         'SVG canvas, 2D layers, diagram layout',
    'render-publication-graphic':    'publication chart, DPI, typography',
    'document-insect-sighting':      'field notebook, camera, insect silhouette',
    'identify-insect':               'magnifying lens, dichotomous key, body plan',
    'observe-insect-behavior':       'ethogram chart, stopwatch, behavior tally',
    'collect-preserve-specimens':    'entomological pin, specimen box, label',
    'survey-insect-population':      'transect line, diversity index, population graph',
    'prepare-print-model':           'sliced model layers, support generation',
    'select-print-material':         'filament spool, material properties',
    'troubleshoot-print-issues':     'printer nozzle, wrench, adhesion fix',
    'evaluate-boolean-expression':   'truth table, Boolean algebra, logic gates',
    'design-logic-circuit':          'NAND gate, combinational logic, schematic',
    'build-sequential-circuit':      'flip-flop, state machine, clock edge',
    'simulate-cpu-architecture':     'CPU chip, ALU, instruction pipeline',
    'analyze-magnetic-field':        'bar magnet, field lines, N-S poles',
    'solve-electromagnetic-induction':'Faraday coil, induced current, solenoid',
    'formulate-maxwell-equations':   'Maxwell wave, E and B fields, sinusoid',
    'design-electromagnetic-device': 'motor coil, stator rotor, electromagnetic',
    'analyze-magnetic-levitation':   'maglev float, superconductor, magnetic gap',
    'design-acoustic-levitation':    'standing wave, acoustic node, trapped particle',
    'evaluate-levitation-mechanism': 'comparison table, levitation methods, tradeoff',
    'manage-token-budget':           'token gauge, budget meter, cost cap',
    'prune-agent-memory':            'memory cards, pruning shears, forget policy',
    'circuit-breaker-pattern':       'circuit switch, break gap, fault tolerance',
    'verify-agent-output':           'verification stamp, evidence chain, checkmark',
    'bootstrap-agent-identity':      'identity rings, cold start, loading anchor',
    'test-team-coordination':        'team test nodes, coordination check, validation',
    'metal':                         'ore ingot, essence extraction, refined metal',
    'create-glyph':                  'paintbrush, geometric output, glyph creation',
    'enhance-glyph':                 'loupe magnifier, shape refinement, glyph polish',
    'audit-icon-pipeline':           'pipeline gap, warning marker, audit check',
    'render-icon-pipeline':          'processing gear, icon output, render',
    'analyze-tensegrity-system':     'compression strut, tension cable, structural node',
  };

  if (overrides[id]) return overrides[id];

  // Fallback: extract from title
  const words = (title || id)
    .replace(/[-_]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['the', 'and', 'for', 'with'].includes(w.toLowerCase()));
  return words.slice(0, 3).join(', ');
}

// ── Seed strategy ───────────────────────────────────────────────────
function computeSeed(groupIndex, itemOffset) {
  return (groupIndex + 1) * 10000 + itemOffset;
}

// ── Load skills.json ────────────────────────────────────────────────
const skills = JSON.parse(readFileSync(SKILLS_PATH, 'utf8'));

// ── Build skill manifest ────────────────────────────────────────────
function buildSkillManifest() {
  const domainsSorted = Object.keys(skills.domains).sort();
  const domainIndexMap = {};
  domainsSorted.forEach((d, i) => { domainIndexMap[d] = i; });

  const domainNodes = {};
  for (const node of skills.nodes) {
    if (node.type && node.type !== 'skill') continue;
    if (!domainNodes[node.domain]) domainNodes[node.domain] = [];
    domainNodes[node.domain].push(node);
  }

  const icons = [];
  for (const domain of domainsSorted) {
    const nodes = domainNodes[domain] || [];
    const domainIdx = domainIndexMap[domain];
    const style = DOMAIN_STYLES[domain] || {
      basePrompt: skills.domains[domain]?.description || 'Glowing icon',
      glow: 'white'
    };

    mkdirSync(resolve(ICONS_DIR, domain), { recursive: true });

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const seed = computeSeed(domainIdx, i + 1);
      const keywords = skillKeywords(node.id, node.title);
      const prompt = `${style.basePrompt}, ${keywords}, ${SHARED_SUFFIX}`;

      icons.push({
        skillId: node.id,
        domain,
        prompt,
        seed,
        path: `public/icons/${domain}/${node.id}.webp`,
        status: 'pending',
      });
    }
  }

  const output = resolve(__dirname, 'public', 'data', 'icon-manifest.json');
  const manifest = { meta: META, domainStyles: DOMAIN_STYLES, icons };
  writeFileSync(output, JSON.stringify(manifest, null, 2));

  console.log(`Generated ${output}`);
  console.log(`  Icons: ${icons.length}`);
  console.log(`  Domains: ${domainsSorted.length}`);
  console.log(`  Icon directories created under ${ICONS_DIR}`);
}

// ── Build agent manifest ────────────────────────────────────────────
function buildAgentManifest() {
  const agentNodes = skills.nodes.filter(n => n.type === 'agent');
  const agentIds = agentNodes.map(n => n.id.replace('agent:', '')).sort();

  const PALETTES = [
    'cyberpunk', 'viridis', 'magma', 'inferno',
    'plasma', 'cividis', 'mako', 'rocket', 'turbo'
  ];

  const agentStyles = {};
  const icons = [];

  for (let i = 0; i < agentIds.length; i++) {
    const id = agentIds[i];
    const node = agentNodes.find(n => n.id === `agent:${id}`);

    // Style: hand-tuned from YAML, or default from registry description
    agentStyles[id] = AGENT_STYLES[id] || {
      description: node?.description || id,
      glow: 'white',
      concept: `${id} agent persona icon`
    };

    icons.push({
      agentId: id,
      path: `public/icons/cyberpunk/agents/${id}.webp`,
      status: 'pending',
    });
  }

  const output = resolve(__dirname, 'public', 'data', 'agent-icon-manifest.json');
  const manifest = {
    meta: {
      type: 'agent-icons',
      pipeline: 'R/ggplot2 + ggfx neon glow',
      resolution: '1024x1024',
      format: 'webp',
      total_agents: agentIds.length,
      palettes: PALETTES,
      path_format: 'icons/<palette>/agents/<agentId>.webp'
    },
    agentStyles,
    icons,
  };
  writeFileSync(output, JSON.stringify(manifest, null, 2));

  console.log(`Generated ${output}`);
  console.log(`  Agents: ${agentIds.length}`);
}

// ── Build team manifest ─────────────────────────────────────────────
function buildTeamManifest() {
  const teamNodes = skills.nodes.filter(n => n.type === 'team');
  const teamIds = teamNodes.map(n => n.id.replace('team:', '')).sort();

  const PALETTES = [
    'cyberpunk', 'viridis', 'magma', 'inferno',
    'plasma', 'cividis', 'mako', 'rocket', 'turbo'
  ];

  const teamStyles = {};
  const icons = [];

  for (let i = 0; i < teamIds.length; i++) {
    const id = teamIds[i];
    const node = teamNodes.find(n => n.id === `team:${id}`);

    teamStyles[id] = TEAM_STYLES[id] || {
      description: node?.description || id,
      glow: 'white',
      concept: `${id} team composition icon`
    };

    icons.push({
      teamId: id,
      path: `public/icons/cyberpunk/teams/${id}.webp`,
      status: 'pending',
    });
  }

  const output = resolve(__dirname, 'public', 'data', 'team-icon-manifest.json');
  const manifest = {
    meta: {
      type: 'team-icons',
      pipeline: 'R/ggplot2 + ggfx neon glow',
      resolution: '1024x1024',
      format: 'webp',
      total_teams: teamIds.length,
      palettes: PALETTES,
      path_format: 'icons/<palette>/teams/<teamId>.webp'
    },
    teamStyles,
    icons,
  };
  writeFileSync(output, JSON.stringify(manifest, null, 2));

  console.log(`Generated ${output}`);
  console.log(`  Teams: ${teamIds.length}`);
}

// ── Main ────────────────────────────────────────────────────────────
const shouldBuild = type => buildTypes.includes(type) || buildTypes.includes('all');

if (shouldBuild('skill'))  buildSkillManifest();
if (shouldBuild('agent'))  buildAgentManifest();
if (shouldBuild('team'))   buildTeamManifest();
