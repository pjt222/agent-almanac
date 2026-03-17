---
name: configure-mcp-server
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Configurar servidores MCP (Model Context Protocol) para Claude Code y Claude Desktop,
  incluyendo r-mcptools para integración con R y servidores remotos como Hugging Face.
  Cubrir la configuración específica de cada plataforma (WSL vs Windows). Usar cuando
  se configure un servidor MCP por primera vez, se agregue un nuevo servidor, o se
  necesite integrar herramientas externas con Claude.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: basic
  language: multi
  tags: mcp, configuration, claude-code, claude-desktop, r-mcptools
---

# Configurar Servidor MCP

Configurar servidores MCP para integrar herramientas externas con Claude Code y Claude Desktop.

## Cuándo Usar

- Configurando un servidor MCP por primera vez
- Agregando un nuevo servidor MCP (R, Hugging Face, personalizado)
- Configurando MCP en una nueva máquina
- Necesitando integrar herramientas externas con Claude Code o Claude Desktop

## Entradas

- **Requerido**: Cliente MCP objetivo (Claude Code, Claude Desktop, o ambos)
- **Requerido**: Servidor MCP a configurar (mcptools, hf-mcp-server, personalizado)
- **Opcional**: Credenciales de autenticación (tokens API)
- **Opcional**: Configuración de transporte (stdio, HTTP/SSE)

## Procedimiento

### Paso 1: Identificar el Cliente y Archivo de Configuración

**Claude Code** (WSL):
```bash
# Configuración almacenada en
cat ~/.claude.json
```

**Claude Desktop** (Windows):
```bash
# Archivo de configuración
cat "/mnt/c/Users/$USER/AppData/Roaming/Claude/claude_desktop_config.json"
```

**Esperado:** Se identifica el archivo de configuración correcto para el cliente objetivo.

**En caso de fallo:** Crear el archivo si no existe, verificar permisos de lectura/escritura.

### Paso 2: Configurar r-mcptools (Integración R)

**Claude Code (WSL)**:
```bash
claude mcp add r-mcptools stdio \
  "/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" \
  -- -e "mcptools::mcp_server()"
```

**Claude Desktop (Windows)**:
```json
{
  "mcpServers": {
    "r-mcptools": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "mcptools::mcp_server()"]
    }
  }
}
```

Requisitos previos:
```r
# En RStudio (Windows)
install.packages("remotes")
remotes::install_github("posit-dev/mcptools")
```

**Esperado:** El servidor r-mcptools aparece en `claude mcp list` y las herramientas R están disponibles.

**En caso de fallo:** Verificar la ruta de R (`ls "/mnt/c/Program Files/R/"`), confirmar que mcptools está instalado.

### Paso 3: Configurar Hugging Face MCP

```bash
# Instalar mcp-remote globalmente
npm install -g mcp-remote

# Claude Code
claude mcp add hf-mcp-server \
  -e HF_TOKEN=tu_token_aqui \
  -- mcp-remote https://huggingface.co/mcp
```

```json
// Claude Desktop
{
  "mcpServers": {
    "hf-mcp-server": {
      "command": "mcp-remote",
      "args": ["https://huggingface.co/mcp"],
      "env": {
        "HF_TOKEN": "tu_token_aqui"
      }
    }
  }
}
```

**Esperado:** El servidor Hugging Face conecta exitosamente, las herramientas de HF están disponibles.

**En caso de fallo:** Verificar conectividad (`curl -I https://huggingface.co/mcp`), validar el token, usar variables de entorno en lugar de argumentos de línea de comandos.

### Paso 4: Verificar la Configuración

```bash
# Listar servidores configurados
claude mcp list

# Obtener detalles de un servidor
claude mcp get r-mcptools

# Probar el servidor independientemente
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

**Esperado:** Los servidores aparecen en la lista, las herramientas están disponibles en la sesión de Claude.

**En caso de fallo:** Reiniciar Claude Desktop después de cambios de configuración, iniciar nueva sesión en Claude Code.

## Validación

- [ ] El servidor MCP aparece en `claude mcp list`
- [ ] Las herramientas del servidor están disponibles en la sesión
- [ ] La configuración JSON es sintácticamente válida
- [ ] Las credenciales están almacenadas de forma segura
- [ ] El servidor se conecta sin errores

## Errores Comunes

- **Archivo de configuración incorrecto**: Claude Code usa `~/.claude.json`, Claude Desktop usa `%APPDATA%\Claude\claude_desktop_config.json`.
- **No reiniciar después de cambios**: Claude Desktop requiere reinicio; Claude Code usa nueva sesión.
- **npx en entornos restringidos**: npx descarga paquetes en runtime. Instalar globalmente en su lugar.
- **Espacios en paths de Windows**: Usar paths cortos 8.3 (`C:\PROGRA~1`) o comillas.
- **Argumentos de línea de comandos en Windows**: Usar variables de entorno (`env`) en lugar de flags `--header`.

## Habilidades Relacionadas

- `troubleshoot-mcp-connection` - Diagnosticar fallos de conexión MCP
- `build-custom-mcp-server` - Construir servidores MCP personalizados
- `scaffold-mcp-server` - Crear nuevos servidores MCP desde plantillas
- `analyze-codebase-for-mcp` - Analizar código para exposición vía MCP
