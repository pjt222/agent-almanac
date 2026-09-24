---
title: "WSL Maintenance & Claude Code Reference"
description: "WSL2 vhdx disk reclamation, Claude Code permission modes, and periodic security-scan greps for a WSL-based dev environment"
category: infrastructure
agents: []
teams: []
skills: [setup-wsl-dev-environment]
---

# WSL Maintenance & Claude Code Reference

On-demand reference for maintaining a WSL2-based Claude Code development environment: reclaiming virtual-disk space, choosing a permission mode, and periodically scanning a projects directory for leaked secrets or hardcoded personal paths. Kept out of always-loaded instructions so it does not consume session context.

## When to Use This Guide

- A WSL2 `.vhdx` has grown large and you want to reclaim space Windows still holds after files were deleted inside Linux
- `df` inside WSL reports far more free space than the Windows drive actually has
- You need the precise meaning of each Claude Code permission mode before choosing one
- You want a periodic security sweep of your projects directory for keys, tokens, real emails, or hardcoded personal paths

## Prerequisites

- A WSL2 distro (e.g. Ubuntu) on Windows, optionally with Docker Desktop
- An elevated (Administrator) PowerShell for disk compaction
- First-time setup lives in [Setting Up Your Environment](setting-up-your-environment.md) (`setup-wsl-dev-environment` skill)

## WSL Disk Management

WSL2 stores each distro as a sparse `.vhdx` virtual disk. Default max 1 TB. **Grows on demand, never auto-shrinks** when files are deleted inside Linux — Windows still sees the larger allocation.

**Typical vhdx locations** (via `%LOCALAPPDATA%`, i.e. `C:\Users\<you>\AppData\Local`; `<distro-guid>` is the per-distro folder). Keep these on the system drive, not a data drive:

- `%LOCALAPPDATA%\wsl\<distro-guid>\ext4.vhdx` — the Linux distro
- `%LOCALAPPDATA%\Docker\wsl\disk\docker_data.vhdx` — Docker Desktop data
- `%LOCALAPPDATA%\Docker\wsl\main\ext4.vhdx` — Docker Desktop bootstrap

**`df` inside the distro reports the vhdx, not the Windows drive.** The root filesystem is ext4 on that sparse vhdx, so `df /`, and `df /tmp` when `/tmp` is on the root filesystem, show the virtual size (default 1 TB) minus what Linux uses. Measured on one machine: `df /` showed 720 GiB available while the Windows drive holding the vhdx had 179 GiB free. A write that needs the vhdx to grow fails once the *host* drive is full, whatever `df` says. For any path on the Linux root, real free space is the smaller of `df`'s figure and the host drive's free space. `/mnt/<letter>` mounts report the Windows drive correctly.

Find the host drive from inside WSL, without PowerShell. The registry records each distro's `BasePath`. Docker Desktop's entry carries a `\\?\` prefix, which is stripped here:

```bash
base=$(reg.exe query 'HKCU\Software\Microsoft\Windows\CurrentVersion\Lxss' /s 2>/dev/null | tr -d '\r' |
  awk -v d="$WSL_DISTRO_NAME" '/^HKEY/ {hit = 0} /DistributionName/ {hit = ($3 == d)}
       hit && /BasePath/ {sub(/^.*REG_SZ +/, ""); sub(/^\\\\\?\\/, ""); print; exit}')
printf '%s\n' "$base"                         # e.g. C:\Users\<you>\AppData\Local\wsl\{<distro-guid>}
df -h "/mnt/$(printf '%s' "${base:0:1}" | tr 'A-Z' 'a-z')"   # the host drive's real free space
```

**Estimate what compaction would reclaim** as the vhdx's size on disk minus what Linux uses. Keep both figures in bytes: `ls -l` prints bytes (powers of 10) and `df -h` prints GiB (powers of 2), so mixing them overstates the headroom. For example, a 301 GB vhdx with 237 GiB used looks like 64 of headroom, but it is 43.7 GiB.

```bash
vhdx_bytes=$(stat -c %s "$(wslpath "$base")/ext4.vhdx")
used_bytes=$(df -B1 --output=used / | tail -1)
echo "reclaimable ~ $(( (vhdx_bytes - used_bytes) / 1024**3 )) GiB"
```

**Reclaim wasted vhdx space** (elevated PowerShell):

```powershell
wsl --shutdown
Optimize-VHD -Path "$env:LOCALAPPDATA\wsl\<distro-guid>\ext4.vhdx" -Mode Full
```

Fallback (Windows Home, no Hyper-V module): `diskpart` → `select vdisk file=...` → `attach vdisk readonly` → `compact vdisk` → `detach vdisk`.

Modern auto-shrink (WSL ≥ 2.0): `wsl --manage <distro> --set-sparse true`.

Pre-step inside the distro to make compaction effective:

```bash
sudo apt clean
sudo journalctl --vacuum-time=7d
docker system prune -af --volumes  # if Docker Desktop in use
npm cache clean --force
pip cache purge
```

**Diagnose disk usage with Windows-native PowerShell**, not `du` over `/mnt/<drive>` — the 9P protocol is much slower than native NTFS access. Use `-Force` to include hidden + system files.

```powershell
# Top-level dirs by size (point at the drive you want to inspect;
# an admin shell is required to traverse System Volume Information)
Get-ChildItem D:\ -Directory -Force -ErrorAction SilentlyContinue |
  ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File -Force -ErrorAction SilentlyContinue |
             Measure-Object Length -Sum).Sum
    [PSCustomObject]@{ SizeGB=[math]::Round($size/1GB,2); Path=$_.FullName }
  } | Sort-Object SizeGB -Descending | Format-Table -AutoSize
```

## Claude Code Permission Modes

Six modes valid for both `claude --permission-mode <X>` and `settings.json` `permissions.defaultMode`:

| Mode | Behavior |
|---|---|
| `default` | Prompt on first use of each tool |
| `acceptEdits` | Auto-approve edits + filesystem cmds in cwd |
| `plan` | Read-only; no edits, no execution |
| `auto` | Auto-approve with background safety checks (research preview) |
| `dontAsk` | Auto-deny unless pre-allowed via `/permissions` or rules |
| `bypassPermissions` | Skip all prompts except protected dirs (.git, .claude) |

Two related CLI flags still active:

- `--dangerously-skip-permissions` — equivalent to `--permission-mode bypassPermissions`
- `--allow-dangerously-skip-permissions` — adds bypass to the Shift+Tab cycle without starting in it

Sources: <https://code.claude.com/docs/en/permission-modes>, <https://code.claude.com/docs/en/cli-reference>

## Security-Scan Greps

Re-run periodically over your projects directory (replace `<your-projects-dir>` with its path):

```bash
# Sensitive patterns (keys, tokens, real emails)
grep -rn "sk-\|ghp_\|YOUR_.*_HERE\|your.*email" <your-projects-dir> --include="*.md" --exclude-dir=node_modules

# Hardcoded personal paths (a Windows user directory that is not a placeholder)
grep -rn "C:\\\\Users\\\\[^\\\\]*\\\\" <your-projects-dir> --include="*.md" --exclude-dir=node_modules
```

Best practices: keep `.Renviron` git-ignored; use placeholders (`your.email@example.com`, `YOUR_TOKEN_HERE`) in committed docs; treat only intentionally-public identifiers (your GitHub username, published app URLs) as safe to commit.

## Related Resources

- [Setting Up Your Environment](setting-up-your-environment.md) — first-time WSL2, shell, MCP, and Claude Code setup
- [Symlink Architecture](symlink-architecture.md) — how discovery symlinks work across projects
- `setup-wsl-dev-environment` skill — scripted WSL dev-environment bootstrap
