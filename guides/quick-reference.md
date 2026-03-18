---
title: "Quick Reference"
description: "Command cheat sheet for agents, skills, teams, Git, R, and shell operations"
category: reference
agents: []
teams: []
skills: []
---

# Quick Reference

Command cheat sheet for invoking agents, skills, and teams through Claude Code, plus essential Git, R, shell, and WSL commands.

## Agents, Skills, and Teams

### Invoking Skills (Slash Commands)

Skills are invoked as slash commands in Claude Code when symlinked into `.claude/skills/`:

```bash
# Make a skill available as a slash command
ln -s ../../skills/submit-to-cran .claude/skills/submit-to-cran

# In Claude Code, invoke with:
/submit-to-cran

# Other examples
/commit-changes
/security-audit-codebase
/review-skill-format
```

Skills can also be referenced in conversation: "Use the create-r-package skill to scaffold this."

### Spawning Agents

Agents are spawned as subagents via Claude Code's Task tool. Ask Claude Code directly:

```
"Use the r-developer agent to add Rcpp integration"
"Spawn the security-analyst to audit this codebase"
"Have the code-reviewer check this PR"
```

Agents are discovered from `.claude/agents/` (symlinked to `agents/` in this project).

### Creating Teams

Teams are created with TeamCreate and managed via task lists:

```
"Create the r-package-review team to review this package"
"Spin up the scrum-team for this sprint"
"Launch the tending team for a meditation session"
```

Available teams: r-package-review, gxp-compliance-validation, fullstack-web-dev, ml-data-science-review, devops-platform-engineering, tending, dyad, scrum-team, opaque-team, agentskills-alignment, entomology, analytical-chemistry, physical-computing, translation-campaign, synoptic-mind.

### Registry Lookups

```bash
# Count skills, agents, teams
grep "total_skills" skills/_registry.yml
grep "total_agents" agents/_registry.yml
grep "total_teams" teams/_registry.yml

# List all domains
grep "^  [a-z]" skills/_registry.yml | head -50

# List all agents
grep "^  - id:" agents/_registry.yml

# List all teams
grep "^  - id:" teams/_registry.yml
```

### README Automation

```bash
# Regenerate all READMEs from registries
npm run update-readmes

# Check if READMEs are up to date (CI dry-run)
npm run check-readmes
```

## WSL-Windows Integration

### Path Conversion

```bash
# Windows to WSL
C:\Users\Name\Documents  ->  /mnt/c/Users/Name/Documents
D:\dev\projects          ->  /mnt/d/dev/projects

# Access Windows R from WSL (adjust version)
"/mnt/c/Program Files/R/R-4.5.0/bin/R.exe"
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe"

# Open current directory in Windows Explorer
explorer.exe .
```

## R Package Development

### Development Cycle

```r
devtools::load_all()        # Load package for development
devtools::document()        # Update documentation
devtools::test()            # Run tests
devtools::check()           # Full package check
devtools::install()         # Install package
```

### Quick Checks

```r
devtools::test_file("tests/testthat/test-feature.R")
devtools::run_examples()
devtools::spell_check()
urlchecker::url_check()
```

### CRAN Submission

```r
devtools::check_win_devel()     # Windows builder
devtools::check_win_release()   # Windows builder
rhub::rhub_check()              # R-hub multi-platform
devtools::release()             # Interactive CRAN submission
```

### Scaffolding

```r
usethis::use_r("function_name")           # New R file
usethis::use_test("function_name")        # New test file
usethis::use_vignette("guide_name")       # New vignette
usethis::use_mit_license()                # Add MIT license
usethis::use_github_action_check_standard() # CI/CD
```

## Git Commands

### Daily Operations

```bash
git status                 # Show working tree status
git diff                   # Show unstaged changes
git diff --staged          # Show staged changes
git log --oneline -10      # Recent commits

git add filename           # Stage specific file
git commit -m "message"    # Commit with message
git commit --amend         # Amend last commit

git checkout -b new-branch # Create and switch to branch
git merge feature-branch   # Merge branch
```

### Remote Operations

```bash
git remote -v              # List remotes
git fetch origin           # Fetch changes
git pull origin main       # Pull and merge
git push origin main       # Push to remote
git push -u origin branch  # Push new branch
```

### Useful Aliases

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.last 'log -1 HEAD'
```

## Claude Code and MCP

### Session Management

```bash
claude                     # Start Claude Code
claude mcp list            # List configured MCP servers
claude mcp get r-mcptools  # Get server details
```

### Configuration Files

```
Claude Code (CLI/WSL):      ~/.claude.json
Claude Desktop (GUI/Win):   %APPDATA%\Claude\claude_desktop_config.json
```

### MCP Servers

```bash
# R integration
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -e "mcptools::mcp_server()"

# Hugging Face
claude mcp add hf-mcp-server \
  -e HF_TOKEN=your_token_here \
  -- mcp-remote https://huggingface.co/mcp
```

## Shell Commands

### Navigation and Search

```bash
pwd                        # Print working directory
ls -la                     # List files with details
tree                       # Show directory tree
z project-name             # Jump to frequent directory

rg "pattern"               # Ripgrep search
rg -t r "pattern"          # Search only R files
fd "pattern"               # User-friendly find
fd -e R                    # Find by extension
```

### File Operations

```bash
mkdir -p path/to/dir       # Create nested directories
cp -r source/ dest/        # Copy directory recursively
tar -czf archive.tar.gz dir/  # Create compressed tar
tar -xzf archive.tar.gz      # Extract tar.gz
du -sh directory           # Directory size
df -h                      # Disk space usage
```

### Process Management

```bash
htop                       # Interactive process viewer
ps aux | grep process      # Find specific process
kill PID                   # Kill process by ID
```

## Keyboard Shortcuts

### Terminal (Bash)

```
Ctrl+A    Beginning of line       Ctrl+E    End of line
Ctrl+K    Delete to end           Ctrl+U    Delete to beginning
Ctrl+W    Delete previous word    Ctrl+R    Search history
Ctrl+L    Clear screen            Ctrl+C    Cancel command
```

### tmux

```
Ctrl+A |       Split vertically     Ctrl+A -      Split horizontally
Ctrl+A arrows  Navigate panes       Ctrl+A d      Detach session
```

### VS Code

```
Ctrl+`         Open terminal        Ctrl+P        Quick open file
Ctrl+Shift+P   Command palette      F1            Command palette
```

## Environment Variables

```bash
printenv              # All environment variables
echo $PATH            # PATH variable
export VAR=value      # Set for current session

# Set permanently
echo 'export VAR=value' >> ~/.bashrc
source ~/.bashrc
```

## Package Managers

```bash
# APT
sudo apt update && sudo apt install package

# npm
npm install -g package       # Install globally
npm list -g --depth=0        # List global packages

# R (renv)
renv::init()                 # Initialize renv
renv::install("package")     # Install package
renv::snapshot()             # Save lockfile
renv::restore()              # Restore from lockfile
```

## Troubleshooting

### R Package Issues

```bash
which R                               # R location
R --version                           # R version
Rscript -e ".libPaths()"             # Library paths
echo $RSTUDIO_PANDOC                  # Check pandoc path
```

### WSL Issues

```bash
wsl --list --verbose   # List WSL distributions
wsl --status           # WSL status
ip addr                # IP addresses
```

### Git Issues

```bash
git config --list          # Show all config
git remote show origin     # Show remote details
git status --porcelain     # Machine-readable status
```

## Related Resources

- [Setting Up Your Environment](setting-up-your-environment.md) -- full setup guide
- [R Package Development](r-package-development.md) -- complete R package workflow
- [Understanding the System](understanding-the-system.md) -- how agents, skills, teams work
- [Skills Library](../skills/) -- all 328 skills
- [Agents Library](../agents/) -- all 66 agents
- [Teams Library](../teams/) -- all 15 teams
