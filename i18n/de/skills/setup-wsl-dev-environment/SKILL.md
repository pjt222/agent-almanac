---
name: setup-wsl-dev-environment
description: >
  Richtet eine WSL2-Entwicklungsumgebung unter Windows ein, einschliesslich Shell-
  Konfiguration, wesentlicher Werkzeuge, Git, SSH-Schluessel, Node.js, Python
  und plattformuebergreifendem Pfadmanagement. Verwenden bei der Einrichtung eines
  neuen Windows-Rechners fuer die Entwicklung, der erstmaligen Konfiguration von WSL2,
  dem Hinzufuegen von Entwicklungswerkzeugen zu einer bestehenden WSL-Installation
  oder der Einrichtung plattformuebergreifender Arbeitsablaeufe mit WSL und Windows.
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: wsl, windows, linux, development, setup
---

# WSL-Entwicklungsumgebung einrichten

Vollstaendige WSL2-Entwicklungsumgebung fuer plattformuebergreifende Arbeit konfigurieren.

## Wann verwenden

- Einrichtung eines neuen Windows-Rechners fuer die Entwicklung
- Erstmalige Konfiguration von WSL2
- Hinzufuegen von Entwicklungswerkzeugen zu einer bestehenden WSL-Installation
- Einrichtung plattformuebergreifender Arbeitsablaeufe (WSL + Windows-Tools)

## Eingaben

- **Erforderlich**: Windows 10/11 mit WSL2-Unterstuetzung
- **Optional**: Bevorzugte Linux-Distribution (Standard: Ubuntu)
- **Optional**: Einzurichtende Sprachen (Node.js, Python, R)
- **Optional**: Zusaetzliche Werkzeuge (Docker, tmux, fzf)

## Vorgehensweise

### Schritt 1: WSL2 installieren

In PowerShell (Administrator):

```powershell
wsl --install
wsl --set-default-version 2
```

Wenn aufgefordert, neu starten. Ubuntu wird standardmaessig installiert.

**Erwartet:** Nach dem Neustart zeigt `wsl --list --verbose` die Distribution unter WSL Version 2 laufend. Der Befehl `wsl` oeffnet eine Linux-Shell.

**Bei Fehler:** Falls die WSL2-Installation fehlschlaegt, die Windows-Funktionen "Virtual Machine Platform" und "Windows-Subsystem fuer Linux" manuell ueber `optionalfeatures.exe` aktivieren. Bei aelteren Windows-10-Builds ist moeglicherweise ein Kernel-Update von Microsoft erforderlich.

### Schritt 2: WSL-Ressourcenlimits konfigurieren

`~/.wslconfig` im Windows-Home-Verzeichnis erstellen:

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**Erwartet:** Die Datei `.wslconfig` befindet sich im Windows-Benutzerverzeichnis (z.B. `C:\Users\Name\.wslconfig`). Nach Ausfuehren von `wsl --shutdown` und Neustart von WSL werden die Ressourcenlimits angewendet.

**Bei Fehler:** Falls die Konfiguration keine Wirkung hat, pruefen ob die Datei am richtigen Ort liegt (Windows-Home, nicht WSL-Home). `wsl --shutdown` ausfuehren und WSL neu starten, damit Aenderungen wirksam werden.

### Schritt 3: Aktualisieren und Grundlegendes installieren

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y \
  build-essential \
  curl \
  wget \
  git \
  git-lfs \
  vim \
  htop \
  tree \
  jq \
  ripgrep \
  fd-find \
  unzip \
  zip
```

Nuetzliche Aliase erstellen:

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

**Erwartet:** Alle Pakete werden fehlerfrei installiert. Befehle wie `git --version`, `jq --version`, `rg --version` und `tree` werden erfolgreich ausgefuehrt.

**Bei Fehler:** Falls `apt install` fehlschlaegt, zuerst `sudo apt update` ausfuehren, um die Paketlisten zu aktualisieren. Fuer nicht gefundene Pakete pruefen, ob die Ubuntu-Version diese unterstuetzt, oder aus alternativen Quellen installieren (z.B. snap, cargo oder manuelle Installation).

### Schritt 4: Git konfigurieren

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**Erwartet:** `git config --list` zeigt den korrekten Benutzernamen, die E-Mail, den Standard-Branch (`main`), autocrlf (`input`) und Editor-Einstellungen.

**Bei Fehler:** Falls Einstellungen nicht uebernommen werden, pruefen ob `--global` verwendet wurde (nicht `--local`, das nur fuer das aktuelle Repository gilt). Sicherstellen, dass `~/.gitconfig` die erwarteten Eintraege enthaelt.

### Schritt 5: SSH-Schluessel einrichten

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Zu GitHub hinzufuegen: Einstellungen > SSH und GPG-Schluessel
```

Test: `ssh -T git@github.com`

**Erwartet:** `ssh -T git@github.com` gibt "Hi username! You've successfully authenticated." zurueck. Das SSH-Schluesselpaar existiert unter `~/.ssh/id_ed25519` und `~/.ssh/id_ed25519.pub`.

**Bei Fehler:** Falls die Authentifizierung fehlschlaegt, pruefen ob der oeffentliche Schluessel zu GitHub hinzugefuegt wurde (Einstellungen > SSH und GPG-Schluessel). Pruefen ob `ssh-agent` laeuft und der Schluessel mit `ssh-add -l` geladen ist. Falls der Agent nicht laeuft, `eval "$(ssh-agent -s)"` zur `~/.bashrc` hinzufuegen.

### Schritt 6: Node.js installieren (ueber nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**Erwartet:** `node --version` und `npm --version` geben aktuelle LTS-Versionen zurueck. `nvm ls` zeigt die installierte Version als Standard markiert.

**Bei Fehler:** Falls `nvm` nach der Installation nicht gefunden wird, `~/.bashrc` laden oder ein neues Terminal oeffnen. Falls das Installationsskript fehlschlaegt, es manuell herunterladen und nach Pruefung des Skriptinhalts ausfuehren.

### Schritt 7: Python installieren (ueber pyenv)

```bash
# Build-Abhaengigkeiten installieren
sudo apt install -y make libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

curl https://pyenv.run | bash

# Zur ~/.bashrc hinzufuegen
echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.12
pyenv global 3.12
```

**Erwartet:** `python --version` gibt Python 3.12.x zurueck. `pyenv versions` zeigt die installierte Version als global gesetzt.

**Bei Fehler:** Falls `pyenv install` mit Build-Fehlern fehlschlaegt, sicherstellen dass alle Build-Abhaengigkeiten aus dem `apt install`-Befehl installiert wurden. Fehlende Bibliotheken (insbesondere `libssl-dev` oder `zlib1g-dev`) sind die haeufigste Ursache fuer Python-Build-Fehler.

### Schritt 8: Shell konfigurieren

Folgendes zur `~/.bashrc` hinzufuegen:

```bash
# Verlauf
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups:erasedups
shopt -s histappend

# Navigations-Aliase
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'

# Entwicklungspfade
export DEV_HOME="/mnt/d/dev/p"
alias dev='cd $DEV_HOME'

# Funktionen
mkcd() { mkdir -p "$1" && cd "$1"; }

# PATH-Erweiterungen
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"
```

**Erwartet:** Nach Ausfuehren von `source ~/.bashrc` funktionieren alle Aliase (`ll`, `la`, `..`, `dev`), die Funktion `mkcd` erstellt Verzeichnisse und wechselt hinein, und `$DEV_HOME` zeigt auf das Entwicklungsverzeichnis.

**Bei Fehler:** Falls Aliase nicht verfuegbar sind, pruefen ob die Ergaenzungen zu `~/.bashrc` hinzugefuegt wurden (nicht `~/.bash_profile` oder `~/.profile`). `source ~/.bashrc` ausfuehren, um ohne neues Terminal neu zu laden.

### Schritt 9: Claude Code CLI einrichten

```bash
# Claude CLI zum PATH hinzufuegen (nach der Installation)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Pruefen
which claude
```

**Erwartet:** `which claude` gibt den Pfad zur Claude Code CLI-Binaerdatei zurueck (z.B. `~/.claude/local/node_modules/.bin/claude`). `claude --version` gibt die installierte Version aus.

**Bei Fehler:** Falls `claude` nicht gefunden wird, pruefen ob der PATH-Export zu `~/.bashrc` hinzugefuegt und geladen wurde. Pruefen ob Claude Code tatsaechlich unter `~/.claude/local/` installiert ist. Falls nicht installiert, zuerst den Claude Code-Installationsanweisungen folgen.

### Schritt 10: Plattformuebergreifende Pfadreferenz

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

Windows Explorer aus WSL oeffnen: `explorer.exe .`

**Erwartet:** Die Pfadkonvertionstabelle ist verstanden und getestet: Zugriff auf einen Windows-Pfad aus WSL funktioniert (z.B. `ls /mnt/c/Users/`), und `explorer.exe .` oeffnet den Windows Explorer im aktuellen WSL-Verzeichnis.

**Bei Fehler:** Falls `/mnt/c/` nicht zugaenglich ist, pruefen ob WSL's Automount konfiguriert ist. `/etc/wsl.conf` auf `[automount]`-Einstellungen pruefen. `wsl --shutdown` ausfuehren und neu starten, falls Einhängepunkte veraltet sind.

## Validierung

- [ ] WSL2 laeuft mit der korrekten Distribution
- [ ] Git mit korrekter Identitaet konfiguriert
- [ ] SSH-Schluessel zu GitHub hinzugefuegt und Verbindung verifiziert
- [ ] Node.js installiert und funktionsfaehig
- [ ] Python installiert und funktionsfaehig
- [ ] Shell-Aliase und -Funktionen funktionieren
- [ ] Claude Code CLI zugaenglich

## Haeufige Stolperfallen

- **Langsamer Dateizugriff auf `/mnt/`**: Haeufig genutzte Projekte im WSL-Dateisystem (`~/`) fuer bessere Performance speichern. `/mnt/` fuer Projekte nutzen, die mit Windows-Tools geteilt werden.
- **Zeilenenden**: `core.autocrlf=input` verhindert CRLF-Probleme. Editoren auf LF-Zeilenenden konfigurieren.
- **Berechtigungsprobleme**: Dateien auf `/mnt/` zeigen moeglicherweise falsche Berechtigungen. Zur `/etc/wsl.conf` hinzufuegen: `[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**: WSL-Verzeichnisse vom Echtzeit-Scan ausschliessen fuer bessere Performance.

## Verwandte Skills

- `configure-git-repository` - ausfuehrliche Git-Repository-Einrichtung
- `configure-mcp-server` - MCP-Einrichtung benoetigt WSL-Umgebung
- `write-claude-md` - KI-Assistent fuer Projekte konfigurieren
