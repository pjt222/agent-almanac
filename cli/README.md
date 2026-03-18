# CLI — Universal Installer

Universal skill/agent/team installer for 12+ agentic CLI frameworks. Detects which AI tools are present in a project and installs content into the correct paths using pluggable adapters.

**Status:** Phase 1 (core library + adapters). See [GitHub issues #142-#146](https://github.com/pjt222/agent-almanac/issues/142) for the roadmap.

## Supported Frameworks

| Framework | Adapter | Install Path |
|-----------|---------|-------------|
| Claude Code | `claude-code.js` | `.claude/skills/`, `.claude/agents/` |
| Codex (OpenAI) | `codex.js` | `.agents/skills/` |
| Cursor | `cursor.js` | `.cursor/rules/` |
| Copilot | `copilot.js` | `.github/copilot-instructions/` |
| Gemini CLI | `gemini.js` | `.gemini/` |
| Aider | `aider.js` | `.aider/` |
| OpenCode | `opencode.js` | `.opencode/` |
| Windsurf | `windsurf.js` | `.windsurf/` |
| Vibe | `vibe.js` | `.vibe/` |
| Hermes | `hermes.js` | `.hermes/` |
| OpenClaw | `openclaw.js` | `.openclaw/` |
| Universal | `universal.js` | `.agents/skills/` |

## Usage

```bash
agent-almanac install <names...>     # Install skills by name
agent-almanac list                   # List available content
agent-almanac search <query>         # Search skills, agents, teams
agent-almanac detect                 # Show detected frameworks
agent-almanac audit                  # Health check installed content
agent-almanac uninstall <names...>   # Remove installed content
```

## Architecture

```
cli/
  index.js             # CLI entry point (commander.js)
  lib/
    registry.js        # Registry loading and skill resolution
    resolver.js        # Almanac root and target directory resolution
    detector.js        # Framework auto-detection
    installer.js       # Install/uninstall/audit orchestrator
    manifest.js        # Installed content manifest management
    reporter.js        # Console output formatting
    transformer.js     # Content transformation for target frameworks
  adapters/
    base.js            # Base adapter class
    claude-code.js     # Claude Code adapter (full support)
    codex.js           # Codex adapter
    cursor.js          # Cursor adapter
    ...                # 12 framework adapters total
  test/
    cli.test.js        # CLI integration tests
```

## See Also

- [Root README](../README.md) -- project overview
- [Symlink Architecture](../guides/symlink-architecture.md) -- how discovery works across tools
- [skills/README.md](../skills/README.md#consuming-skills-from-different-systems) -- per-tool integration details
