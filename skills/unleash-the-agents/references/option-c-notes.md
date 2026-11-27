# Option C: Prospector Swarm Measured Run & Contract Notes

Extended background for `unleash-the-agents` Step 3 (Option C: Workflow script). See [prospector-swarm.mjs](prospector-swarm.mjs) for the executable template and its header for all arguments.

## Measured Run Cost & Model Breakdown

The one measured run (`tests/results/2026-11-17-unleash-prospector-swarm/RESULT.md`) took about 4 hours with 84 agents. Its prospectors ran on `haiku`, which was also the template's first default. The default is now `sonnet`, and no run has measured it.

- Sonnet's per-token price is above Haiku's, so the prospectors' own tokens are expected to cost more in API price than in the measured run [estimated, requires measurement].
- Whether the whole run costs more depends on how often `sonnet` prospectors call the advisor, which is not measured: in the measured run the prospectors' advisor calls cost more than that increase [estimated from the run's token counts at November 2026 prices].
- The measured run involved three models, not two:
  - the 75 Haiku prospectors produced 66 % of the output tokens;
  - the 9 session-model agents produced 22 %;
  - the advisor, which 60 of the agents called on its own model (61 calls, 58 answered), produced 13 %.

The prospector model does not bound the cost. In a session with the advisor tool, the swarm's agents can call it, and nothing in the template controls that. In the measured run, 51 of the 75 prospectors and all 9 session-model agents called it. It ran on Fable and took 10.52 M uncached input tokens and 0.55 M output tokens, none of which `message.usage` counts.

## Why the Template Lives Under This Skill

The template lives at `references/prospector-swarm.mjs`, not in `workflows/`. The workflow contract check accepts any registered agent as a literal `agentType`, but it refuses three things this template does:

- computing the type per spawn;
- spawning `intent: implementing` agents such as `janitor` in a phase that does not declare them;
- prompting a shell-capable agent without the `REPO_SAFETY` and `WRITE_LOCATION` preamble.

A persona type per spawn is the point of an unleash, and it is also containment: a `mystic` carries no shell. `npm` also ships `skills/` but not `workflows/`.
