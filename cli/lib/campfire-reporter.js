/**
 * campfire-reporter.js — Warm ceremony output for campfire commands.
 *
 * Provides arrival sequences, departure farewells, health checks, and fire
 * browsing with warm terminal colors and campfire vocabulary.
 *
 * Voice rules:
 *   1. Present tense, active voice
 *   2. No exclamation marks
 *   3. Metaphor replaces jargon
 *   4. Failures are honest, not catastrophic
 *   5. Closing line is always the fire's state
 *   6. No emoji in default mode (Unicode: ✦ ◉ ◎ ○ ✗ ◌)
 *   7. If a word doesn't carry information, remove it
 */

import { chalk } from './reporter.js';
import { canRenderPixelArt } from './pixel-renderer.js';
import { buildFireScene } from './scene.js';

// ── Warm color palette ──────────────────────────────────────────────

const C = {
  flame:   chalk.hex('#FF6B35'),   // fire elements, active teams
  amber:   chalk.hex('#FFB347'),   // arriving agents
  spark:   chalk.hex('#FFF4E0'),   // skill names (sparks)
  ember:   chalk.hex('#8B4513'),   // cold fires, embers
  warm:    chalk.hex('#D4A574'),   // warm neutral text
  dim:     chalk.dim,              // darkness beyond the firelight
  fail:    chalk.red,              // errors stay red (honest)
};

// ── Unicode glyphs ──────────────────────────────────────────────────

const GLYPH = {
  spark:     '✦',  // skill/practice
  burning:   '◉',  // gathered, burning
  embers:    '◎',  // gathered, embers
  cold:      '○',  // gathered, cold
  fail:      '✗',  // failed
  available: '◌',  // available, not gathered
};

// ── Fire size names ─────────────────────────────────────────────────

const FIRE_SIZES = {
  2: 'candle',
  3: 'campfire',
  4: 'bonfire',
};

/**
 * Get fire size name based on member count and coordination pattern.
 * @param {number} memberCount
 * @param {string} coordination
 * @returns {string}
 */
function fireSizeName(memberCount, coordination) {
  if (coordination === 'adaptive') return 'wildfire';
  if (coordination === 'synoptic') return 'hearth';
  if (coordination === 'timeboxed') return 'forge';
  return FIRE_SIZES[memberCount] || (memberCount > 4 ? 'bonfire' : 'campfire');
}

/**
 * Get fire state glyph.
 * @param {'burning'|'embers'|'cold'|null} state
 * @returns {string}
 */
function stateGlyph(state) {
  if (state === 'burning') return C.flame(GLYPH.burning);
  if (state === 'embers') return C.ember(GLYPH.embers);
  if (state === 'cold') return C.dim(GLYPH.cold);
  return C.dim(GLYPH.available);
}

/**
 * Get fire state label.
 * @param {'burning'|'embers'|'cold'} state
 * @param {string} [lastWarmed] - ISO timestamp
 * @returns {string}
 */
function stateLabel(state, lastWarmed) {
  const ago = lastWarmed ? timeSince(lastWarmed) : '';
  if (state === 'burning') return C.flame(`burning${ago ? ` (last warmed: ${ago})` : ''}`);
  if (state === 'embers') return C.ember(`embers${ago ? ` (last warmed: ${ago})` : ''}`);
  return C.dim(`cold${ago ? ` (last warmed: ${ago})` : ''}`);
}

/**
 * Human-readable time since a date.
 * @param {string} isoDate
 * @returns {string}
 */
function timeSince(isoDate) {
  const ms = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}

// ── Fire closing lines ──────────────────────────────────────────────

function fireClosing(settled, total, failed) {
  if (settled === 0) return C.fail('The fire could not be lit.');
  if (failed > 0 && settled < total) return C.amber(`${settled} of ${total} practices settled. The fire burns, but a spark was lost.`);
  if (settled < total) return C.amber('The fire burns, but dimly.');
  return C.flame('The fire burns.');
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Print the first-time welcome message.
 */
export function printWelcome(totalTeams) {
  console.log();
  if (canRenderPixelArt()) {
    const scene = buildFireScene({ state: 'burning', maxWidth: process.stdout.columns || 80 });
    for (const line of scene) console.log(line);
    console.log();
  }
  console.log(C.warm('Welcome to the campfire.'));
  console.log();
  console.log(C.dim(`The almanac holds ${totalTeams} circles of practice:`));
  console.log(C.dim('development, compliance, operations, contemplation, and more.'));
  console.log();
  console.log(C.dim(`Type '${C.warm('agent-almanac campfire --all')}' to see them.`));
  console.log(C.dim(`Type '${C.warm('agent-almanac gather <name>')}' to light a fire.`));
  console.log();
}

/**
 * Print arrival sequence for gathering a team.
 * @param {object} options
 * @param {string} options.teamId - Team name
 * @param {object[]} options.agents - Array of { id, skills: string[], lead: boolean }
 * @param {object} options.results - { installed: string[], skipped: string[], failed: { id, error }[] }
 * @param {boolean} [options.ceremonial] - Show individual skills
 * @param {Set<string>} [options.alreadyBurning] - Skill IDs already installed from other fires
 */
export function printArrival({ teamId, agents, results, ceremonial = false, alreadyBurning = new Set() }) {
  console.log();
  if (canRenderPixelArt()) {
    const agentIds = agents.map(a => a.id);
    const leadId = agents.find(a => a.lead)?.id;
    const scene = buildFireScene({
      state: 'burning',
      agentIds,
      teamId,
      leadId,
      maxWidth: process.stdout.columns || 80,
    });
    for (const line of scene) console.log(line);
    console.log();
  }
  console.log(C.warm(`Gathering the ${C.flame(teamId)} circle...`));
  console.log();

  let totalSkills = 0;
  let settledSkills = 0;
  let failedSkills = 0;

  for (const agent of agents) {
    const isLead = agent.lead;
    const label = isLead ? `${agent.id} ${C.dim('(fire keeper)')}` : agent.id;
    const skillCount = (agent.skills || []).length;
    totalSkills += skillCount;

    if (ceremonial) {
      console.log(`  ${C.amber(agent.id)} arrives${isLead ? C.dim(' (fire keeper)') : ''}`);
      for (const skillId of agent.skills || []) {
        const isFailed = results.failed.some(f => f.id === skillId);
        const isBurning = alreadyBurning.has(skillId);
        if (isFailed) {
          const err = results.failed.find(f => f.id === skillId);
          console.log(`     ${C.fail(GLYPH.fail)} ${skillId} ${C.fail('— ' + (err?.error || 'failed'))}`);
          failedSkills++;
        } else if (isBurning) {
          console.log(`     ${C.spark(GLYPH.spark)} ${C.dim(skillId)} ${C.dim('(already burning)')}`);
          settledSkills++;
        } else {
          console.log(`     ${C.spark(GLYPH.spark)} ${skillId}`);
          settledSkills++;
        }
      }
      console.log();
    } else {
      // Default: concise
      const agentFailed = (agent.skills || []).filter(s => results.failed.some(f => f.id === s));
      const agentSettled = skillCount - agentFailed.length;
      settledSkills += agentSettled;
      failedSkills += agentFailed.length;
      const suffix = agentFailed.length > 0
        ? `${C.dim('—')} ${C.amber(agentSettled + ' practices')}${agentFailed.length ? ', ' + C.fail(agentFailed.length + ' lost') : ''}`
        : `${C.dim('—')} ${C.amber(skillCount + ' practices')}`;
      console.log(`  ${C.amber(label)}  ${suffix}`);
    }
  }

  console.log();

  // Deduplication note
  const burningCount = [...alreadyBurning].filter(s =>
    agents.some(a => (a.skills || []).includes(s)),
  ).length;
  if (burningCount > 0) {
    console.log(C.dim(`  ${totalSkills} practices total, ${burningCount} already burning. `) + fireClosing(settledSkills, totalSkills, failedSkills));
  } else {
    console.log(`  ${C.dim(settledSkills + ' practices settled.')} ${fireClosing(settledSkills, totalSkills, failedSkills)}`);
  }
  console.log();
}

/**
 * Print scatter (departure) sequence.
 * @param {object} options
 * @param {string} options.teamId
 * @param {object[]} options.agents - Reverse order (fire keeper last)
 * @param {object} options.results - { removed: string[], kept: { id, reason }[] }
 * @param {boolean} [options.ceremonial]
 */
export function printScatter({ teamId, agents, results, ceremonial = false }) {
  console.log();
  console.log(C.warm(`Scattering the ${C.flame(teamId)} circle...`));
  console.log();

  let remainCount = 0;

  // Reverse: fire keeper departs last
  const ordered = [...agents].reverse();

  for (const agent of ordered) {
    const isLead = agent.lead;
    const keptSkills = (agent.skills || []).filter(s =>
      results.kept.some(k => k.id === s),
    );
    const removedSkills = (agent.skills || []).filter(s =>
      !keptSkills.includes(s),
    );

    // Check if agent stays (at other fires)
    const agentKept = results.keptAgents?.find(k => k.id === agent.id);
    if (agentKept) {
      console.log(`  ${C.amber(agent.id)} remains ${C.dim(`— still at the ${agentKept.reason} fire.`)}`);
      remainCount++;
      continue;
    }

    const label = isLead ? `${agent.id} ${C.dim('(fire keeper)')}` : agent.id;
    console.log(`  ${C.amber(label)} departs`);

    if (ceremonial) {
      for (const skillId of removedSkills) {
        console.log(`     ${C.spark(GLYPH.spark)} ${skillId} scatters`);
      }
      for (const skillId of keptSkills) {
        const reason = results.kept.find(k => k.id === skillId);
        console.log(`     ${C.spark(GLYPH.spark)} ${skillId} remains ${C.dim(`— still needed by ${reason?.reason || 'other fires'}`)}`);
      }
    }
  }

  console.log();
  const walkOn = remainCount > 0 ? ` ${remainCount} agent${remainCount !== 1 ? 's' : ''} walk${remainCount === 1 ? 's' : ''} on.` : '';
  console.log(`  ${C.warm('The fire goes out.')}${walkOn ? C.dim(walkOn) : ''}`);
  if (canRenderPixelArt()) {
    console.log();
    const scene = buildFireScene({ state: 'cold', maxWidth: process.stdout.columns || 80 });
    for (const line of scene) console.log(line);
  }
  console.log();
}

/**
 * Print tend (health check) output.
 * @param {object[]} fires - Array of { id, state, skillCount, failedSkills, lastWarmed, agents, staleSkills? }
 */
export function printTend(fires) {
  console.log();
  console.log(C.warm('Tending your campfires...'));
  console.log();

  let burningCount = 0;
  let embersCount = 0;
  let coldCount = 0;

  for (const fire of fires) {
    const glyph = stateGlyph(fire.state);
    const label = stateLabel(fire.state, fire.lastWarmed);

    console.log(`  ${glyph} ${C.flame(fire.id)} ${C.dim('—')} ${label}`);

    if (fire.state === 'burning' && fire.failedSkills.length === 0 && !fire.staleSkills?.length) {
      console.log(C.dim(`    All ${fire.skillCount} practices present. The fire is strong.`));
    } else {
      if (fire.failedSkills.length > 0) {
        console.log(C.fail(`    ${fire.failedSkills.length} practice(s) failed to install.`));
      }
      if (fire.staleSkills?.length > 0) {
        const staleCount = fire.staleSkills.length;
        console.log(C.amber(`    ${fire.skillCount - staleCount} of ${fire.skillCount} practices present. ${staleCount} updated upstream.`));
        console.log(C.dim(`    → Run '${C.warm(`agent-almanac gather ${fire.id}`)}' to refresh.`));
      }
      if (fire.state === 'cold') {
        console.log(C.dim(`    All practices present, but the fire has gone cold.`));
        console.log(C.dim(`    → Scatter with '${C.warm(`agent-almanac scatter ${fire.id}`)}' or relight.`));
      }
    }

    console.log();
    if (fire.state === 'burning') burningCount++;
    else if (fire.state === 'embers') embersCount++;
    else coldCount++;
  }

  // Summary
  const parts = [];
  if (burningCount) parts.push(C.flame(`${burningCount} strong`));
  if (embersCount) parts.push(C.ember(`${embersCount} cooling`));
  if (coldCount) parts.push(C.dim(`${coldCount} cold`));

  console.log(`  ${fires.length} campfire${fires.length !== 1 ? 's' : ''}. ${parts.join(', ')}.`);
  console.log();
}

/**
 * Print the campfire list (--all view).
 * @param {object} options
 * @param {object[]} options.teams - All teams from registry
 * @param {object} options.state - Current campfire state
 * @param {object} options.reg - Registry for skill counting
 */
export function printCampfireList({ teams, state, reg }) {
  console.log();
  console.log(C.warm("The almanac's campfires:"));
  console.log();

  // Categorize teams
  const categories = categorizeTeams(teams);

  for (const [category, categoryTeams] of Object.entries(categories)) {
    if (categoryTeams.length === 0) continue;
    console.log(`  ${C.warm(category)}`);

    for (const team of categoryTeams) {
      const fireData = state.fires[team.id];
      const fireState = fireData ? computeState(fireData.lastWarmed) : null;
      const glyph = fireState ? stateGlyph(fireState) : C.dim(GLYPH.available);

      const memberCount = (team.members || []).length;
      const memberLabel = team.coordination === 'adaptive'
        ? 'N keepers'
        : `${memberCount} keepers`;
      const skillCount = countTeamSkills(team, reg);

      if (fireState) {
        // Gathered — show state
        const stateTxt = fireState === 'burning' ? C.flame('burning')
          : fireState === 'embers' ? C.ember('embers')
          : C.dim('cold');
        console.log(`    ${glyph} ${C.flame(team.id.padEnd(24))} ${C.dim(memberLabel)}, ${C.dim(skillCount + ' practices')} ${C.dim('—')} ${stateTxt}`);
      } else {
        // Available
        const desc = C.dim(team.description || '');
        const skillInfo = skillCount > 0 ? `, ${skillCount} practices` : '';
        console.log(`    ${glyph} ${C.amber(team.id.padEnd(24))} ${C.dim(memberLabel + skillInfo)} ${C.dim('—')} ${desc}`);
      }
    }
    console.log();
  }

  console.log(C.dim(`  ${GLYPH.available} = available    ${GLYPH.burning} = gathered (burning)    ${GLYPH.embers} = gathered (embers)`));
  console.log();
}

/**
 * Print a single fire's detail view.
 * @param {object} options
 * @param {object} options.team - Team from registry
 * @param {object|null} options.fireData - Fire state data (null if not gathered)
 * @param {object} options.reg - Registry
 */
export function printFireSummary({ team, fireData, reg }) {
  console.log();
  const fireState = fireData ? computeState(fireData.lastWarmed) : null;

  if (canRenderPixelArt()) {
    const memberIds = (team.members || []);
    const scene = buildFireScene({
      state: fireState || 'cold',
      agentIds: memberIds,
      teamId: team.id,
      leadId: team.lead,
      maxWidth: process.stdout.columns || 80,
    });
    for (const line of scene) console.log(line);
    console.log();
  }

  const glyph = fireState ? stateGlyph(fireState) : '';

  console.log(`  ${glyph} ${C.flame(team.id)} ${C.dim('—')} ${team.description || ''}`);
  console.log(`  Fire keeper: ${C.amber(team.lead)}`);
  console.log(`  Pattern: ${C.dim(team.coordination)} ${C.dim(`(${patternDescription(team.coordination)})`)}`);
  if (fireState) {
    console.log(`  State: ${stateLabel(fireState, fireData.lastWarmed)}`);
  }
  console.log();
  console.log(`  Circle:`);

  const members = team.members || [];
  for (const memberId of members) {
    const agent = reg.agents.find(a => a.id === memberId);
    const skillCount = agent ? (agent.skills || []).length : 0;
    const isLead = memberId === team.lead;
    const label = isLead ? `${memberId} ${C.dim('(fire keeper)')}` : memberId;
    console.log(`    ${C.amber(label.padEnd(36))} ${C.dim('→')} ${C.dim(skillCount + ' practices')}`);
  }

  const totalSkills = countTeamSkills(team, reg);
  console.log();
  console.log(`  ${C.dim(totalSkills + ' practices total')}`);

  if (!fireState) {
    console.log();
    console.log(`  ${C.warm('Gather this circle?')} ${C.dim(`agent-almanac gather ${team.id}`)}`);
  }
  console.log();
}

/**
 * Print the campfire map (shared agents view).
 * @param {object[]} teams - All teams from registry
 * @param {object} state - Campfire state
 */
export function printCampfireMap(teams, state) {
  console.log();
  console.log(C.warm('Campfire connections:'));
  console.log();

  // Find agents shared between teams
  const agentTeams = new Map();
  for (const team of teams) {
    for (const memberId of team.members || []) {
      if (!agentTeams.has(memberId)) agentTeams.set(memberId, []);
      agentTeams.get(memberId).push(team.id);
    }
  }

  const bridges = [];
  for (const [agentId, teamIds] of agentTeams) {
    if (teamIds.length > 1) {
      bridges.push({ agent: agentId, fires: teamIds });
    }
  }

  if (bridges.length === 0) {
    console.log(C.dim('  No shared agents between campfires.'));
    console.log();
    return;
  }

  // Sort by number of fires (most connected first)
  bridges.sort((a, b) => b.fires.length - a.fires.length);

  for (const bridge of bridges) {
    const fireList = bridge.fires.map(f => {
      const isGathered = state.fires[f];
      return isGathered ? C.flame(f) : C.dim(f);
    }).join(C.dim(' ←→ '));
    console.log(`  ${C.amber(bridge.agent.padEnd(30))} ${fireList}`);
  }

  console.log();
  console.log(C.dim(`  ${bridges.length} hearth-keeper${bridges.length !== 1 ? 's' : ''} bridge the campfires.`));
  console.log();
}

/**
 * Print scatter confirmation prompt text.
 * @param {object} team
 * @param {number} skillCount
 */
export function printScatterConfirm(team, skillCount) {
  const memberCount = (team.members || []).length;
  console.log();
  console.log(`  The ${C.flame(team.id)} fire has ${skillCount} practices, ${memberCount} keepers.`);
  console.log(`  ${C.warm('Scatter this circle?')} ${C.dim('[y/n]')}`);
}

/**
 * Print JSON output for --json mode.
 * @param {object} data
 */
export function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

// ── Helpers ─────────────────────────────────────────────────────────

function computeState(lastWarmed) {
  const ms = Date.now() - new Date(lastWarmed).getTime();
  if (ms < 7 * 24 * 60 * 60 * 1000) return 'burning';
  if (ms < 30 * 24 * 60 * 60 * 1000) return 'embers';
  return 'cold';
}

/**
 * Count total unique skills for a team.
 */
function countTeamSkills(team, reg) {
  const skillIds = new Set();
  for (const memberId of team.members || []) {
    const agent = reg.agents.find(a => a.id === memberId);
    if (!agent) continue;
    for (const s of agent.skills || []) skillIds.add(s);
  }
  // Add default skills
  for (const s of reg.defaultSkills || []) skillIds.add(s);
  return skillIds.size;
}

/**
 * Categorize teams into display groups.
 */
function categorizeTeams(teams) {
  const categories = {
    'Development': [],
    'Operations': [],
    'Compliance': [],
    'Contemplation': [],
    'Specialty': [],
    'Adaptive': [],
  };

  for (const team of teams) {
    const id = team.id;
    if (['r-package-review', 'fullstack-web-dev', 'scrum-team'].includes(id)) {
      categories['Development'].push(team);
    } else if (['devops-platform-engineering', 'ml-data-science-review'].includes(id)) {
      categories['Operations'].push(team);
    } else if (['gxp-compliance-validation'].includes(id)) {
      categories['Compliance'].push(team);
    } else if (['tending', 'synoptic-mind', 'dyad'].includes(id)) {
      categories['Contemplation'].push(team);
    } else if (['opaque-team'].includes(id)) {
      categories['Adaptive'].push(team);
    } else {
      categories['Specialty'].push(team);
    }
  }

  return categories;
}

/**
 * Human-readable coordination pattern description.
 */
function patternDescription(pattern) {
  const descriptions = {
    'hub-and-spoke': 'lead distributes, members report back',
    'sequential': 'each lights the next',
    'parallel': 'all work simultaneously',
    'reciprocal': 'two agents alternate focus',
    'timeboxed': 'work in fixed-length sprints',
    'adaptive': 'self-organizing based on task',
    'wave-parallel': 'waves of parallel work',
    'synoptic': 'everyone stares into the fire together',
  };
  return descriptions[pattern] || pattern;
}

export { C, GLYPH, fireSizeName, countTeamSkills };
