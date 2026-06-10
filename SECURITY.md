# Security

## Disclaimer

This repository is provided under the [MIT License](LICENSE) — use it at your own risk. The authors make no guarantees about the security or safety of any content, including skills, agents, teams, guides, scripts, and the visualization pipeline.

## What This Repository Contains

- **Skills, agents, teams, guides**: Markdown and YAML documentation. ~60% of skills (177 of 297) include `Bash` in their allowed-tools, meaning they instruct AI agents to execute shell commands when followed. Review any skill before letting an agent execute it.
- **Visualization pipeline** (`viz/`): A containerized R + Node.js + Vite build system with a Dockerfile, shell scripts, and an icon rendering pipeline. The Docker entrypoint serves content via a Python HTTP server.
- **Scripts** (`scripts/`): A Node.js script for README generation from registries.
- **Claude Code configuration** (`.claude/`): Agent discovery symlinks and permission settings.

## Reporting Issues

If you find a security issue, open a [GitHub issue](https://github.com/pjt222/agent-almanac/issues). There is no private disclosure process or guaranteed response timeline.

## Automated Scanning

- CodeQL is configured to run on every push and on a daily schedule
- Dependabot is configured to monitor GitHub Actions and npm dependencies for known vulnerabilities
