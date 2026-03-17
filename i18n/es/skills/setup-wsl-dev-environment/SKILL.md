---
name: setup-wsl-dev-environment
description: >
  Configura un entorno de desarrollo WSL2 en Windows, incluyendo
  configuración de shell, herramientas esenciales, Git, claves SSH, Node.js,
  Python y gestión de rutas multiplataforma. Usar al configurar una nueva
  máquina Windows para desarrollo, al configurar WSL2 por primera vez, al
  añadir herramientas de desarrollo a una instalación WSL existente, o al
  establecer flujos de trabajo multiplataforma que combinen WSL y herramientas
  de Windows.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: intermediate
  language: multi
  tags: wsl, windows, linux, development, setup
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Configurar el Entorno de Desarrollo WSL

Configura un entorno de desarrollo WSL2 completo para trabajo multiplataforma.

## Cuándo Usar

- Al configurar una nueva máquina Windows para desarrollo
- Al configurar WSL2 por primera vez
- Al añadir herramientas de desarrollo a una instalación WSL existente
- Al establecer flujos de trabajo multiplataforma (WSL + herramientas de Windows)

## Entradas

- **Requerido**: Windows 10/11 con soporte para WSL2
- **Opcional**: Distribución de Linux preferida (por defecto: Ubuntu)
- **Opcional**: Lenguajes a configurar (Node.js, Python, R)
- **Opcional**: Herramientas adicionales (Docker, tmux, fzf)

## Procedimiento

### Paso 1: Instalar WSL2

En PowerShell (Administrador):

```powershell
wsl --install
wsl --set-default-version 2
```

Reiniciar si se solicita. Ubuntu se instala por defecto.

**Esperado:** Tras el reinicio, `wsl --list --verbose` muestra la distribución ejecutándose bajo la versión 2 de WSL. El comando `wsl` abre una shell de Linux.

**En caso de fallo:** Si la instalación de WSL2 falla, habilita manualmente las características de Windows "Virtual Machine Platform" y "Windows Subsystem for Linux" mediante `optionalfeatures.exe`. En versiones antiguas de Windows 10, puede ser necesaria una actualización del kernel de Microsoft.

### Paso 2: Configurar los Límites de Recursos de WSL

Crear `~/.wslconfig` en el directorio home de Windows:

```ini
[wsl2]
memory=8GB
processors=4
localhostForwarding=true
```

**Esperado:** El archivo `.wslconfig` existe en el directorio home del usuario de Windows (p.ej., `C:\Users\Nombre\.wslconfig`). Tras ejecutar `wsl --shutdown` y reiniciar WSL, los límites de recursos se aplican.

**En caso de fallo:** Si la configuración no tiene efecto, verifica que el archivo está en la ubicación correcta (home de Windows, no home de WSL). Ejecuta `wsl --shutdown` y vuelve a abrir WSL para que los cambios surtan efecto.

### Paso 3: Actualizar e Instalar Esenciales

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

Crear alias útiles:

```bash
echo 'alias fd="fdfind"' >> ~/.bashrc
```

**Esperado:** Todos los paquetes se instalan sin errores. Comandos como `git --version`, `jq --version`, `rg --version` y `tree` se ejecutan correctamente.

**En caso de fallo:** Si `apt install` falla, ejecuta primero `sudo apt update` para actualizar las listas de paquetes. Para paquetes no encontrados, verifica que la versión de Ubuntu los soporte o instálalos desde fuentes alternativas (p.ej., snap, cargo, o descarga manual).

### Paso 4: Configurar Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input
git config --global color.ui auto
git config --global core.editor vim
```

**Esperado:** `git config --list` muestra el nombre de usuario, correo, rama por defecto (`main`), autocrlf (`input`) y configuración del editor correctos.

**En caso de fallo:** Si los ajustes no se aplican, verifica que usaste `--global` (no `--local`, que solo aplica al repositorio actual). Comprueba que `~/.gitconfig` contiene las entradas esperadas.

### Paso 5: Configurar Claves SSH

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
# Añadir a GitHub: Settings > SSH and GPG keys
```

Prueba: `ssh -T git@github.com`

**Esperado:** `ssh -T git@github.com` devuelve "Hi username! You've successfully authenticated." El par de claves SSH existe en `~/.ssh/id_ed25519` y `~/.ssh/id_ed25519.pub`.

**En caso de fallo:** Si la autenticación falla, verifica que la clave pública fue añadida a GitHub (Settings > SSH and GPG keys). Comprueba que `ssh-agent` está en ejecución y la clave está cargada con `ssh-add -l`. Si el agente no está en ejecución, añade `eval "$(ssh-agent -s)"` a `~/.bashrc`.

### Paso 6: Instalar Node.js (vía nvm)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

**Esperado:** `node --version` y `npm --version` devuelven las versiones LTS actuales. `nvm ls` muestra la versión instalada marcada como predeterminada.

**En caso de fallo:** Si `nvm` no se encuentra tras la instalación, ejecuta `source ~/.bashrc` o abre una nueva terminal. Si el script de instalación falla, descárgalo y ejecútalo manualmente tras revisar su contenido.

### Paso 7: Instalar Python (vía pyenv)

```bash
# Instalar dependencias de compilación
sudo apt install -y make libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev libncursesw5-dev xz-utils \
  tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev

curl https://pyenv.run | bash

# Añadir a ~/.bashrc
echo 'export PATH="$HOME/.pyenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(pyenv init -)"' >> ~/.bashrc
source ~/.bashrc

pyenv install 3.12
pyenv global 3.12
```

**Esperado:** `python --version` devuelve Python 3.12.x. `pyenv versions` muestra la versión instalada configurada como global.

**En caso de fallo:** Si `pyenv install` falla con errores de compilación, asegúrate de que todas las dependencias del comando `apt install` fueron instaladas. Las librerías faltantes (especialmente `libssl-dev` o `zlib1g-dev`) son la causa más común de errores en la compilación de Python.

### Paso 8: Configurar el Shell

Añadir a `~/.bashrc`:

```bash
# Historial
export HISTSIZE=10000
export HISTFILESIZE=20000
export HISTCONTROL=ignoredups:erasedups
shopt -s histappend

# Alias de navegación
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'

# Rutas de desarrollo
export DEV_HOME="/mnt/d/dev/p"
alias dev='cd $DEV_HOME'

# Funciones
mkcd() { mkdir -p "$1" && cd "$1"; }

# Adiciones al PATH
export PATH="$HOME/bin:$HOME/.local/bin:$PATH"
```

**Esperado:** Tras ejecutar `source ~/.bashrc`, todos los alias (`ll`, `la`, `..`, `dev`) funcionan, la función `mkcd` crea y entra en directorios, y `$DEV_HOME` apunta al directorio de desarrollo.

**En caso de fallo:** Si los alias no están disponibles, verifica que las adiciones fueron añadidas a `~/.bashrc` (no a `~/.bash_profile` o `~/.profile`). Ejecuta `source ~/.bashrc` para recargar sin abrir una nueva terminal.

### Paso 9: Configurar Claude Code CLI

```bash
# Añadir Claude CLI al PATH (tras la instalación)
echo 'export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verificar
which claude
```

**Esperado:** `which claude` devuelve la ruta al binario de Claude Code CLI (p.ej., `~/.claude/local/node_modules/.bin/claude`). Ejecutar `claude --version` imprime la versión instalada.

**En caso de fallo:** Si `claude` no se encuentra, verifica que la exportación del PATH fue añadida a `~/.bashrc` y recargada. Comprueba que Claude Code está realmente instalado en `~/.claude/local/`. Si no está instalado, sigue primero las instrucciones de instalación de Claude Code.

### Paso 10: Referencia de Rutas Multiplataforma

| Windows | WSL |
|---------|-----|
| `C:\Users\Name` | `/mnt/c/Users/Name` |
| `D:\dev\projects` | `/mnt/d/dev/projects` |
| `%APPDATA%` | `/mnt/c/Users/Name/AppData/Roaming` |

Abrir el Explorador de Windows desde WSL: `explorer.exe .`

**Esperado:** La tabla de conversión de rutas se entiende y se prueba: el acceso a rutas de Windows desde WSL funciona (p.ej., `ls /mnt/c/Users/`), y `explorer.exe .` abre el Explorador de Windows en el directorio WSL actual.

**En caso de fallo:** Si `/mnt/c/` no es accesible, verifica que el automontaje de WSL está configurado. Comprueba `/etc/wsl.conf` para los ajustes `[automount]`. Ejecuta `wsl --shutdown` y reinicia si los puntos de montaje están obsoletos.

## Validación

- [ ] WSL2 ejecutándose con la distribución correcta
- [ ] Git configurado con la identidad correcta
- [ ] Clave SSH añadida a GitHub y conexión verificada
- [ ] Node.js instalado y funcionando
- [ ] Python instalado y funcionando
- [ ] Alias y funciones del shell funcionan
- [ ] Claude Code CLI accesible

## Errores Comunes

- **Acceso lento a archivos en `/mnt/`**: Almacena los proyectos de acceso frecuente en el sistema de archivos de WSL (`~/`) para mejor rendimiento. Usa `/mnt/` para proyectos compartidos con herramientas de Windows.
- **Finales de línea**: `core.autocrlf=input` previene problemas con CRLF. Configura los editores para usar LF.
- **Problemas de permisos**: Los archivos en `/mnt/` pueden mostrar permisos incorrectos. Añadir a `/etc/wsl.conf`: `[automount]\noptions = "metadata,umask=22,fmask=11"`
- **Windows Defender**: Excluye los directorios de WSL del análisis en tiempo real para mejor rendimiento.

## Habilidades Relacionadas

- `configure-git-repository` - configuración detallada de repositorios Git
- `configure-mcp-server` - la configuración de MCP requiere el entorno WSL
- `write-claude-md` - configurar el asistente de IA para proyectos
