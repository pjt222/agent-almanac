---
name: configure-putior-mcp
description: >
  Configurar el servidor MCP de putior para exponer 16 herramientas de
  visualización de flujo de trabajo a asistentes de IA. Cubre la configuración
  de Claude Code y Claude Desktop, instalación de dependencias (mcptools,
  ellmer), verificación de herramientas y configuración opcional del servidor
  ACP para comunicación agente-a-agente. Usar al habilitar asistentes de IA
  para anotar y visualizar flujos de trabajo interactivamente, al configurar
  un nuevo entorno de desarrollo con integración MCP de putior, o al configurar
  comunicación agente-a-agente vía ACP para pipelines automatizados.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: workflow-visualization
  complexity: intermediate
  language: R
  tags: putior, mcp, acp, ai-assistant, claude, tools, integration
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude
  translation_date: "2026-03-17"
---

# Configure putior MCP Server

Configurar el servidor MCP de putior para que los asistentes de IA (Claude Code, Claude Desktop) puedan llamar directamente a las herramientas de anotación de flujo de trabajo y generación de diagramas.

## Cuándo Usar

- Habilitar asistentes de IA para anotar y visualizar flujos de trabajo interactivamente
- Configurar un nuevo entorno de desarrollo con integración MCP de putior
- Después de instalar putior y querer documentación de flujo de trabajo asistida por IA
- Configurar comunicación agente-a-agente vía ACP para pipelines automatizados

## Entradas

- **Requerido**: putior instalado (ver `install-putior`)
- **Requerido**: Cliente objetivo: Claude Code, Claude Desktop, o ambos
- **Opcional**: Si también configurar el servidor ACP (por defecto: no)
- **Opcional**: Host/puerto personalizado para el servidor ACP (por defecto: localhost:8080)

## Procedimiento

### Paso 1: Instalar Dependencias MCP

Instalar los paquetes requeridos para la funcionalidad del servidor MCP.

```r
# Required: MCP framework
remotes::install_github("posit-dev/mcptools")

# Required: Tool definition framework
install.packages("ellmer")

# Verify both load
library(mcptools)
library(ellmer)
```

**Esperado:** Ambos paquetes se instalan y cargan sin errores.

**En caso de fallo:** `mcptools` requiere el paquete `remotes`. Instalarlo primero: `install.packages("remotes")`. Si GitHub limita la tasa, configurar un `GITHUB_PAT` en `~/.Renviron` (agregar la línea `GITHUB_PAT=your_token_here` y reiniciar R). **No** pegar tokens en comandos de shell ni incluirlos en control de versiones.

### Paso 2: Configurar Claude Code (WSL/Linux/macOS)

Agregar el servidor MCP de putior a la configuración de Claude Code.

```bash
# One-line setup
claude mcp add putior -- Rscript -e "putior::putior_mcp_server()"
```

Para WSL con R de Windows:
```bash
claude mcp add putior -- "/mnt/c/Program Files/R/R-4.5.2/bin/Rscript.exe" -e "putior::putior_mcp_server()"
```

Verificar la configuración:
```bash
claude mcp list
claude mcp get putior
```

**Esperado:** `putior` aparece en la lista de servidores MCP con estado "configured".

**En caso de fallo:** Si Claude Code no está en PATH, agregarlo: `export PATH="$HOME/.claude/local/node_modules/.bin:$PATH"`. Si la ruta de Rscript es incorrecta, localizar R con `which Rscript` o `ls "/mnt/c/Program Files/R/"`.

### Paso 3: Configurar Claude Desktop (Windows)

Agregar putior al archivo de configuración MCP de Claude Desktop.

Editar `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

O con la ruta completa:
```json
{
  "mcpServers": {
    "putior": {
      "command": "C:\\Program Files\\R\\R-4.5.2\\bin\\x64\\Rscript.exe",
      "args": ["-e", "putior::putior_mcp_server()"]
    }
  }
}
```

Reiniciar Claude Desktop después de editar la configuración.

**Esperado:** Claude Desktop muestra putior en su lista de servidores MCP. Las herramientas se vuelven disponibles en la conversación.

**En caso de fallo:** Validar la sintaxis JSON con un linter JSON. Verificar que la ruta de R exista. Usar nombres cortos 8.3 (`PROGRA~1`, `R-45~1.0`) si los espacios en las rutas causan problemas.

### Paso 4: Verificar las 16 Herramientas

Probar que todas las herramientas MCP sean accesibles y funcionales.

```r
# Get tool definitions
tools <- putior::putior_mcp_tools()
cat(sprintf("Total tools: %d\n", length(tools)))

# List tool names
vapply(tools, function(t) t$name, character(1))
```

Las 16 herramientas organizadas por categoría:

**Flujo de Trabajo Principal (5):**
- `put` -- Escanear archivos para anotaciones PUT (soporta parámetro `exclude` para filtrado de archivos basado en regex)
- `put_diagram` -- Generar diagramas Mermaid
- `put_auto` -- Auto-detectar flujo de trabajo desde código (soporta parámetro `exclude`)
- `put_generate` -- Generar sugerencias de anotación (soporta parámetro `exclude`)
- `put_merge` -- Fusionar anotaciones manuales + automáticas (soporta parámetro `exclude`)

**Referencia/Descubrimiento (7):**
- `get_comment_prefix` -- Obtener prefijo de comentario para extensión
- `get_supported_extensions` -- Listar extensiones soportadas
- `list_supported_languages` -- Listar lenguajes soportados
- `get_detection_patterns` -- Obtener patrones de auto-detección
- `get_diagram_themes` -- Listar temas disponibles
- `putior_skills` -- Documentación del asistente de IA
- `putior_help` -- Ayuda de referencia rápida

**Utilidades (3):**
- `is_valid_put_annotation` -- Validar sintaxis de anotación
- `split_file_list` -- Analizar listas de archivos
- `ext_to_language` -- Extensión a nombre de lenguaje

**Configuración (1):**
- `set_putior_log_level` -- Configurar verbosidad de registro

Probar herramientas principales desde Claude Code:
```
Use the putior_help tool to see available commands
Use the put tool to scan ./R/ for annotations
Use the put_diagram tool to generate a diagram
```

**Esperado:** Las 16 herramientas listadas. Las herramientas principales retornan resultados esperados cuando se llaman con entradas válidas.

**En caso de fallo:** Si faltan herramientas, verificar que la versión de putior sea actual: `packageVersion("putior")`. Las versiones anteriores pueden tener menos herramientas. Actualizar con `remotes::install_github("pjt222/putior")`.

### Paso 5: Configurar Servidor ACP (Opcional)

Configurar el servidor ACP (Agent Communication Protocol) para comunicación agente-a-agente.

```r
# Install ACP dependency
install.packages("plumber2")

# Start ACP server (blocks — run in a separate R session or background)
putior::putior_acp_server()

# Custom host/port
putior::putior_acp_server(host = "0.0.0.0", port = 9000)
```

Probar endpoints ACP:
```bash
# Discover agent
curl http://localhost:8080/agents

# Execute a scan
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "scan ./R/"}]}]}'

# Generate diagram
curl -X POST http://localhost:8080/runs \
  -H "Content-Type: application/json" \
  -d '{"input": [{"role": "user", "parts": [{"content": "generate diagram for ./R/"}]}]}'
```

**Esperado:** El servidor ACP inicia en el puerto configurado. `/agents` retorna el manifiesto del agente putior. `/runs` acepta solicitudes en lenguaje natural y retorna resultados de flujo de trabajo.

**En caso de fallo:** Si el puerto 8080 está en uso, especificar un puerto diferente. Si `plumber2` no está instalado, la función del servidor imprimirá un mensaje de error útil sugiriendo la instalación.

## Validación

- [ ] `putior::putior_mcp_tools()` expone las herramientas principales (`put`, `put_diagram`, `put_auto`, `put_generate`, `put_merge`) y retorna ~16 herramientas para la versión actual
- [ ] Claude Code: `claude mcp list` muestra `putior` configurado
- [ ] Claude Code: la herramienta `putior_help` retorna texto de ayuda cuando se invoca
- [ ] Claude Desktop: putior aparece en la lista de servidores MCP después de reiniciar
- [ ] Las herramientas principales (`put`, `put_diagram`, `put_auto`) se ejecutan sin errores
- [ ] (Opcional) El servidor ACP responde a `curl http://localhost:8080/agents`

## Errores Comunes

- **mcptools no instalado**: El servidor MCP requiere `mcptools` (de GitHub) y `ellmer` (de CRAN). Ambos deben estar instalados. putior verifica y proporciona mensajes útiles si faltan.
- **Ruta de R incorrecta en Claude Desktop**: Las rutas de Windows necesitan escape en JSON (`\\`). Usar nombres cortos 8.3 para evitar espacios: `C:\\PROGRA~1\\R\\R-45~1.0\\bin\\x64\\Rscript.exe`.
- **Olvidar reiniciar**: Claude Desktop debe reiniciarse después de editar el archivo de configuración. Claude Code recoge los cambios al iniciar la siguiente sesión.
- **Aislamiento de renv**: Si putior está instalado en una biblioteca renv pero Claude Code/Desktop lanza R sin renv, los paquetes no se encontrarán. Asegurar que `mcptools` y `ellmer` estén instalados en la biblioteca global o configurar la activación de renv en el comando del servidor MCP.
- **Conflictos de puerto para ACP**: El puerto ACP por defecto (8080) se usa comúnmente. Verificar con `lsof -i :8080` o `netstat -tlnp | grep 8080` antes de iniciar.
- **Incluir solo herramientas específicas**: Para exponer un subconjunto de herramientas, usar `putior_mcp_tools(include = c("put", "put_diagram"))` al construir wrappers de servidor MCP personalizados.
- **Paletas personalizadas vía MCP**: El parámetro `palette` en `put_diagram` requiere un objeto R `putior_theme` (creado por `put_theme()`), que no puede serializarse a través de la interfaz JSON de MCP. Usar el parámetro de cadena `theme` incorporado para llamadas MCP. Para paletas personalizadas, usar R directamente.

## Habilidades Relacionadas

- `install-putior` -- prerrequisito: putior y dependencias opcionales deben estar instalados
- `configure-mcp-server` -- configuración general de servidor MCP para Claude Code/Desktop
- `troubleshoot-mcp-connection` -- diagnosticar problemas de conexión si las herramientas no aparecen
- `build-custom-mcp-server` -- construir servidores MCP personalizados que envuelvan herramientas de putior
- `analyze-codebase-workflow` -- usar herramientas MCP interactivamente para análisis de base de código
