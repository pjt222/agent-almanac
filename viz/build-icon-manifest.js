#!/usr/bin/env node
/**
 * build-icon-manifest.js
 *
 * Reads viz/data/skills.json and generates viz/data/icon-manifest.json
 * with per-skill prompts, seeds, and paths for Z-Image icon generation.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SKILLS_PATH = resolve(__dirname, 'public', 'data', 'skills.json');
const OUTPUT_PATH = resolve(__dirname, 'public', 'data', 'icon-manifest.json');
const ICONS_DIR = resolve(__dirname, 'public', 'icons');

// ── Generation config ───────────────────────────────────────────────
const META = {
  model: 'mcp-tools/Z-Image-Turbo',
  resolution: '1024x1024 ( 1:1 )',
  steps: 12,
  shift: 4,
};

const SHARED_SUFFIX = 'dark background, vector art, clean edges, single centered icon, no text';

// ── Per-domain base motifs ──────────────────────────────────────────
const DOMAIN_STYLES = {
  'r-packages':         { basePrompt: 'Glowing hexagonal R logo, circuit board traces',          glow: 'cyan' },
  'git':                { basePrompt: 'Glowing branch tree, commit graph nodes',                 glow: 'mint' },
  'compliance':         { basePrompt: 'Neon shield seal, regulatory checkmark',                  glow: 'pink' },
  'project-management': { basePrompt: 'Glowing Gantt chart, milestone markers',                  glow: 'orange' },
  'devops':             { basePrompt: 'Neon pipeline, gear mechanism, infinity loop',             glow: 'green' },
  'general':            { basePrompt: 'Glowing terminal prompt, wrench tool',                    glow: 'lavender' },
  'observability':      { basePrompt: 'Neon radar eye, signal wave pulse',                       glow: 'amber' },
  'review':             { basePrompt: 'Glowing magnifying glass, code lens',                     glow: 'rose' },
  'mlops':              { basePrompt: 'Neural network nodes, brain circuit',                     glow: 'violet' },
  'containerization':   { basePrompt: 'Neon container box, whale silhouette',                    glow: 'sky' },
  'reporting':          { basePrompt: 'Glowing chart, document with data',                       glow: 'yellow' },
  'web-dev':            { basePrompt: 'Neon browser window, HTML angle brackets',                glow: 'coral' },
  'mcp-integration':    { basePrompt: 'Glowing server nodes, connection plug',                   glow: 'teal' },
  'bushcraft':          { basePrompt: 'Neon campfire flame, leaf, compass rose',                  glow: 'olive' },
  'esoteric':           { basePrompt: 'Glowing third eye, mandala spiral',                       glow: 'magenta' },
  'defensive':          { basePrompt: 'Neon flowing water circle, yin-yang shield',              glow: 'red' },
  'design':             { basePrompt: 'Glowing compass, golden spiral ornament',                 glow: 'rose-gold' },
  'data-serialization': { basePrompt: 'Neon binary stream, schema tree brackets',                glow: 'blue' },
  'travel':              { basePrompt: 'Neon compass rose, map route trail, wanderlust path',        glow: 'sand-gold' },
  'relocation':          { basePrompt: 'Glowing moving box, passport stamp, border crossing',        glow: 'slate-teal' },
  'a2a-protocol':        { basePrompt: 'Neon agent handshake, protocol arrows, JSON-RPC',            glow: 'electric-blue' },
  'geometry':            { basePrompt: 'Ruler and compass, Euclidean circle, geometric proof',        glow: 'golden' },
  'stochastic-processes':{ basePrompt: 'Random walk path, probability distribution, Markov chain',   glow: 'deep-purple' },
  'theoretical-science': { basePrompt: 'Quantum wave function, mathematical derivation, proof',      glow: 'astral-blue' },
  'diffusion':           { basePrompt: 'Diffusion gradient, noise-to-signal, spreading pattern',     glow: 'misty-pink' },
  'hildegard':           { basePrompt: 'Medieval manuscript, herbal illustration, sacred music',      glow: 'emerald' },
  'maintenance':         { basePrompt: 'Broom and mop, tidy workspace, cleanup tools',               glow: 'utility-gray' },
  'blender':             { basePrompt: '3D wireframe cube, Blender viewport, rendering light',        glow: 'blender-orange' },
  'visualization':       { basePrompt: 'Data chart, plot grid, color palette, graph axis',            glow: 'chart-green' },
  '3d-printing':         { basePrompt: 'Layer-by-layer print, FDM nozzle, 3D model',                 glow: 'filament-blue' },
  'entomology':          { basePrompt: 'Insect specimen, magnifying lens, field notebook, entomological pin', glow: 'leaf-green' },
  'digital-logic':       { basePrompt: 'Logic gate symbol, binary truth table, circuit diagram',            glow: 'electric-cyan' },
  'electromagnetism':    { basePrompt: 'Magnetic field lines, solenoid coil, electromagnetic wave',         glow: 'copper-orange' },
  'levitation':          { basePrompt: 'Floating object, standing wave, magnetic suspension',               glow: 'hover-blue' },
  'synoptic':            { basePrompt: 'Panoramic eye, expanding awareness circles, gestalt integration',    glow: 'teal-green' },
};

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
    'generate-status-report':        'progress dashboard, status gauge',
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
    // mcp-integration (2 missing)
    'analyze-codebase-for-mcp':      'code scan, MCP tool opportunity',
    'scaffold-mcp-server':           'scaffold frame, MCP server skeleton',
    // review (3 missing)
    'review-skill-format':           'skill document, format validation',
    'update-skill-content':          'skill file, content update arrow',
    'refactor-skill-structure':      'skill structure, refactor arrows',
    // esoteric (3 missing - Kabbalistic)
    'read-tree-of-life':             'Tree of Life, sephiroth circles, paths',
    'apply-gematria':                'Hebrew letters, numerical values, computation',
    'study-hebrew-letters':          'aleph beth, Hebrew letter forms, mystical',
    // travel (6)
    'plan-tour-route':               'route path, waypoints, map optimization',
    'create-spatial-visualization':  'interactive map, elevation profile, spatial data',
    'generate-tour-report':          'tour document, map insert, itinerary',
    'plan-hiking-tour':              'mountain trail, hiking path, elevation',
    'check-hiking-gear':             'backpack, gear checklist, equipment',
    'assess-trail-conditions':       'trail weather, condition assessment, safety',
    // relocation (3)
    'plan-eu-relocation':            'EU map, relocation timeline, dependency flow',
    'check-relocation-documents':    'passport, document verification, checkmark',
    'navigate-dach-bureaucracy':     'German forms, bureaucratic steps, stamp',
    // a2a-protocol (3)
    'design-a2a-agent-card':         'agent card, capability manifest, JSON',
    'implement-a2a-server':          'server, JSON-RPC, task lifecycle',
    'test-a2a-interop':              'two agents, handshake test, conformance',
    // geometry (3)
    'construct-geometric-figure':    'compass, ruler, geometric construction',
    'solve-trigonometric-problem':   'unit circle, sine wave, triangle',
    'prove-geometric-theorem':       'proof triangle, QED, axiomatic',
    // stochastic-processes (3)
    'model-markov-chain':            'state graph, transition arrows, steady state',
    'fit-hidden-markov-model':       'hidden states, observation layer, Viterbi',
    'simulate-stochastic-process':   'random walk, simulation path, Monte Carlo',
    // theoretical-science (3)
    'formulate-quantum-problem':     'psi wave function, quantum bracket, Hamiltonian',
    'derive-theoretical-result':     'derivation steps, proof chain, first principles',
    'survey-theoretical-literature': 'papers stack, literature synthesis, survey',
    // diffusion (3)
    'fit-drift-diffusion-model':     'drift accumulator, decision boundary, RT',
    'implement-diffusion-network':   'noise-to-image, denoising steps, U-Net',
    'analyze-diffusion-dynamics':    'SDE curve, Fokker-Planck, diffusion equation',
    // hildegard (5)
    'formulate-herbal-remedy':       'mortar pestle, herb, medieval preparation',
    'assess-holistic-health':        'four humors, temperament wheel, balance',
    'compose-sacred-music':          'neume notation, antiphon, modal music',
    'practice-viriditas':            'green spiral, viriditas power, living green',
    'consult-natural-history':       'illustrated manuscript, plant, stone, Physica',
    // maintenance (4)
    'clean-codebase':                'broom, dead code sweep, lint cleanup',
    'tidy-project-structure':        'organized folders, tidy structure, convention',
    'repair-broken-references':      'broken link, repair chain, fix connection',
    'escalate-issues':               'priority arrow, severity triage, escalation',
    // blender (3)
    'create-3d-scene':               '3D cube, viewport grid, scene setup',
    'script-blender-automation':     'Python script, 3D automation, procedural',
    'render-blender-output':         'camera lens, render output, compositing',
    // visualization (2)
    'create-2d-composition':         'SVG canvas, 2D layers, diagram layout',
    'render-publication-graphic':    'publication chart, DPI, typography',
    // entomology (5)
    'document-insect-sighting':      'field notebook, camera, insect silhouette',
    'identify-insect':               'magnifying lens, dichotomous key, body plan',
    'observe-insect-behavior':       'ethogram chart, stopwatch, behavior tally',
    'collect-preserve-specimens':    'entomological pin, specimen box, label',
    'survey-insect-population':      'transect line, diversity index, population graph',
    // 3d-printing (3)
    'prepare-print-model':           'sliced model layers, support generation',
    'select-print-material':         'filament spool, material properties',
    'troubleshoot-print-issues':     'printer nozzle, wrench, adhesion fix',
    // digital-logic (4)
    'evaluate-boolean-expression':   'truth table, Boolean algebra, logic gates',
    'design-logic-circuit':          'NAND gate, combinational logic, schematic',
    'build-sequential-circuit':      'flip-flop, state machine, clock edge',
    'simulate-cpu-architecture':     'CPU chip, ALU, instruction pipeline',
    // electromagnetism (4)
    'analyze-magnetic-field':        'bar magnet, field lines, N-S poles',
    'solve-electromagnetic-induction':'Faraday coil, induced current, solenoid',
    'formulate-maxwell-equations':   'Maxwell wave, E and B fields, sinusoid',
    'design-electromagnetic-device': 'motor coil, stator rotor, electromagnetic',
    // levitation (3)
    'analyze-magnetic-levitation':   'maglev float, superconductor, magnetic gap',
    'design-acoustic-levitation':    'standing wave, acoustic node, trapped particle',
    'evaluate-levitation-mechanism': 'comparison table, levitation methods, tradeoff',
    // community-discovered operational (5)
    'manage-token-budget':           'token gauge, budget meter, cost cap',
    'prune-agent-memory':            'memory cards, pruning shears, forget policy',
    'circuit-breaker-pattern':       'circuit switch, break gap, fault tolerance',
    'verify-agent-output':           'verification stamp, evidence chain, checkmark',
    'bootstrap-agent-identity':      'identity rings, cold start, loading anchor',
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
// Alphabetical domain index * 10000 + 1-based skill offset within domain
function computeSeed(domain, domainIndex, skillOffset) {
  return (domainIndex + 1) * 10000 + skillOffset;
}

// ── Main ────────────────────────────────────────────────────────────
const skills = JSON.parse(readFileSync(SKILLS_PATH, 'utf8'));

// Sort domains alphabetically for stable index assignment
const domainsSorted = Object.keys(skills.domains).sort();
const domainIndexMap = {};
domainsSorted.forEach((d, i) => { domainIndexMap[d] = i; });

// Group nodes by domain to compute per-domain offsets
const domainNodes = {};
for (const node of skills.nodes) {
  if (!domainNodes[node.domain]) domainNodes[node.domain] = [];
  domainNodes[node.domain].push(node);
}

const icons = [];
for (const domain of domainsSorted) {
  const nodes = domainNodes[domain] || [];
  const domainIdx = domainIndexMap[domain];
  const style = DOMAIN_STYLES[domain] || { basePrompt: 'Glowing icon', glow: 'white' };

  // Ensure domain icon directory exists
  mkdirSync(resolve(ICONS_DIR, domain), { recursive: true });

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const seed = computeSeed(domain, domainIdx, i + 1);
    const keywords = skillKeywords(node.id, node.title);
    const prompt = `${style.basePrompt}, ${keywords}, ${SHARED_SUFFIX}`;
    const path = `public/icons/${domain}/${node.id}.webp`;

    icons.push({
      skillId: node.id,
      domain,
      prompt,
      seed,
      path,
      status: 'pending',
    });
  }
}

const manifest = {
  meta: META,
  domainStyles: DOMAIN_STYLES,
  icons,
};

writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2));

console.log(`Generated ${OUTPUT_PATH}`);
console.log(`  Icons: ${icons.length}`);
console.log(`  Domains: ${domainsSorted.length}`);
console.log(`  Icon directories created under ${ICONS_DIR}`);
