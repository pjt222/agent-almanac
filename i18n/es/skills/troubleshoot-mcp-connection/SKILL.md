---
name: troubleshoot-mcp-connection
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Diagnosticar y corregir problemas de conexión de servidores MCP entre Claude Code,
  Claude Desktop y servidores MCP. Cubrir el análisis de argumentos en Windows,
  fallos de autenticación, problemas de transporte y depuración específica por
  plataforma. Usar cuando Claude Code o Claude Desktop falla al conectar con un
  servidor MCP, cuando las herramientas MCP no aparecen en las sesiones, ante
  errores de "cannot attach the server", cuando una conexión funcionando ha dejado
  de funcionar, o al configurar MCP en una máquina nueva.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, troubleshooting, debugging, connection, windows
---

# Solucionar Problemas de Conexión MCP

Diagnosticar y resolver fallos de conexión de servidores MCP.

## Cuándo Usar

- Claude Code o Claude Desktop falla al conectar con un servidor MCP
- Las herramientas MCP no aparecen en las sesiones
- Errores de "Cannot attach the server"
- Una conexión que funcionaba ha dejado de funcionar
- Configurando MCP en una máquina nueva

## Entradas

- **Requerido**: Mensaje de error o descripción del síntoma
- **Requerido**: Qué cliente se usa (Claude Code, Claude Desktop, o ambos)
- **Requerido**: Qué servidor MCP (mcptools, Hugging Face, personalizado)
- **Opcional**: Cambios recientes en configuración o entorno

## Procedimiento

### Paso 1: Identificar el Cliente y Configuración

**Claude Code** (WSL):
```bash
claude mcp list
claude mcp get nombre-servidor
cat ~/.claude.json | python3 -m json.tool
```

**Claude Desktop** (Windows):
```bash
cat "/mnt/c/Users/$USER/AppData/Roaming/Claude/claude_desktop_config.json"
```

**Esperado:** El archivo de configuración se localiza y es legible, mostrando las entradas del servidor MCP.

**En caso de fallo:** Si el archivo de configuración no existe o está vacío, el servidor nunca fue configurado. Seguir la habilidad `configure-mcp-server`.

### Paso 2: Probar el Servidor Independientemente

**r-mcptools**:
```bash
"/mnt/c/Program Files/R/R-4.5.0/bin/Rscript.exe" -e "mcptools::mcp_server()"
```

Si falla:
- Verificar que la ruta de R existe: `ls "/mnt/c/Program Files/R/"`
- Verificar que mcptools está instalado: `Rscript -e "library(mcptools)"`
- Verificar dependencia ellmer: `Rscript -e "library(ellmer)"`

**Hugging Face MCP**:
```bash
mcp-remote https://huggingface.co/mcp
which mcp-remote
npm list -g mcp-remote
```

**Esperado:** El proceso del servidor inicia y produce salida de inicialización sin errores.

**En caso de fallo:** Si r-mcptools falla, verificar la ruta de la versión de R y que mcptools está instalado. Si mcp-remote falla, reinstalar globalmente con `npm install -g mcp-remote`.

### Paso 3: Diagnosticar Patrones de Error Comunes

**"Cannot attach the server" (Claude Desktop)**

Causa raíz: Análisis de argumentos de comandos en Windows.

Solución: Usar variables de entorno en lugar de argumentos `--header`:
```json
{
  "hf-mcp-server": {
    "command": "mcp-remote",
    "args": ["https://huggingface.co/mcp"],
    "env": { "HF_TOKEN": "tu_token" }
  }
}
```

**"Connection refused"**
- El servidor no está ejecutándose o el puerto es incorrecto
- El firewall bloquea la conexión
- Tipo de transporte incorrecto (stdio vs HTTP)

**"Command not found"**
- Falta la ruta completa al ejecutable
- PATH no configurado en el contexto de ejecución
- En Windows: usar `C:\\PROGRA~1\\...` para paths con espacios

**Las herramientas MCP no aparecen pero sin error**
- El servidor inicia pero las herramientas no están registradas
- Verificar stdout del servidor para mensajes de inicialización
- Verificar que el servidor usa la versión correcta del protocolo MCP

**Esperado:** Patrón de error identificado en una de las categorías documentadas.

**En caso de fallo:** Si el error no coincide con ningún patrón conocido, capturar la salida completa y buscar el mensaje exacto en los issues de GitHub del servidor.

### Paso 4: Verificar Red y Autenticación

```bash
curl -I "https://huggingface.co/mcp"
curl -H "Authorization: Bearer $HF_TOKEN" https://huggingface.co/api/whoami
```

**Esperado:** El endpoint HTTP devuelve estado 200 y la llamada whoami devuelve el nombre de usuario.

**En caso de fallo:** Si curl devuelve error de conexión, verificar resolución DNS y configuración de proxy. Si el token es rechazado (401), regenerar en huggingface.co/settings/tokens.

### Paso 5: Verificar Sintaxis JSON de Configuración

```bash
python3 -m json.tool /ruta/al/archivo/config.json
```

**Esperado:** El JSON se analiza sin errores.

**En caso de fallo:** Los problemas más comunes son comas finales, comillas faltantes y llaves desbalanceadas.

### Paso 6: Depuración Específica por Plataforma

**Windows (Claude Desktop)**:
- El análisis de argumentos difiere de Unix
- Los espacios en paths rompen la ejecución de comandos
- Usar paths cortos 8.3: `C:\PROGRA~1\R\R-45~1.0\bin\x64\Rscript.exe`
- Las variables de entorno funcionan más confiablemente que cabeceras de línea de comandos

**WSL (Claude Code)**:
- Las comillas estilo Unix funcionan correctamente
- Se pueden usar paths completos con espacios (entre comillas)
- npm/npx vía NVM: asegurar que NVM está cargado en el contexto de ejecución

**Esperado:** Problema específico de plataforma identificado.

**En caso de fallo:** Si el problema es de Windows, cambiar de argumentos de línea de comandos a variables de entorno. Si es de WSL, verificar que la ruta al ejecutable de Windows es accesible desde WSL.

### Paso 7: Reiniciar y Reconfigurar

Si todo lo demás falla:
```bash
claude mcp remove nombre-servidor
claude mcp add nombre-servidor stdio "/ruta/completa/al/ejecutable" -- args
```

**Esperado:** Después de eliminar y re-agregar, `claude mcp list` muestra el servidor correctamente.

**En caso de fallo:** Verificar que la ruta del ejecutable es correcta y el comando funciona directamente en la terminal.

### Paso 8: Revisar Logs

**Claude Code**: Buscar errores MCP en la salida de terminal al iniciar una sesión.

**Claude Desktop**: Revisar logs de la aplicación (ubicación varía por SO).

**Lado del servidor**: Agregar logging al servidor MCP para capturar solicitudes entrantes y errores.

**Esperado:** Las entradas de log revelan el punto específico de fallo.

**En caso de fallo:** Si no hay logs disponibles, agregar captura de stderr al comando del servidor y reproducir el fallo.

## Validación

- [ ] El servidor inicia independientemente sin errores
- [ ] El JSON de configuración es válido
- [ ] El cliente conecta exitosamente
- [ ] Las herramientas MCP aparecen en la sesión
- [ ] Las herramientas ejecutan correctamente cuando se invocan
- [ ] La conexión persiste a través de múltiples solicitudes

## Errores Comunes

- **Editando el archivo de configuración incorrecto**: Claude Code (`~/.claude.json`) vs Claude Desktop (`%APPDATA%\Claude\claude_desktop_config.json`).
- **No reiniciar después de cambios**: Claude Desktop requiere reinicio; Claude Code detecta cambios en nueva sesión.
- **npx en entornos restringidos**: npx descarga paquetes en runtime. Si la red o permisos están restringidos, instalar globalmente.
- **Expiración de token**: Los tokens de Hugging Face pueden expirar. Regenerar si aparecen fallos de autenticación repentinos.
- **Incompatibilidad de versiones**: Las versiones del protocolo MCP deben ser compatibles entre cliente y servidor.

## Habilidades Relacionadas

- `configure-mcp-server` - Configuración inicial de MCP
- `build-custom-mcp-server` - Contexto de depuración de servidores personalizados
- `setup-wsl-dev-environment` - Configuración de requisitos previos de WSL
