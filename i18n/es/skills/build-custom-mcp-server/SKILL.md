---
name: build-custom-mcp-server
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Construir un servidor MCP (Model Context Protocol) personalizado que expone herramientas,
  recursos y prompts a clientes MCP como Claude Code. Cubrir la implementación del
  protocolo, definición de herramientas, manejo de errores, y patrones de testing. Usar
  cuando se necesite exponer funcionalidad personalizada a Claude, integrar APIs o
  servicios existentes vía MCP, o crear herramientas específicas del dominio.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, custom-server, tools, protocol, typescript, python
---

# Construir Servidor MCP Personalizado

Construir un servidor MCP personalizado para exponer herramientas y recursos a clientes como Claude Code.

## Cuándo Usar

- Necesitando exponer funcionalidad personalizada a Claude vía MCP
- Integrando APIs o servicios existentes como herramientas MCP
- Creando herramientas específicas del dominio para flujos de trabajo de equipo
- Automatizando operaciones repetitivas accesibles desde Claude
- Conectando fuentes de datos internas con el ecosistema MCP

## Entradas

- **Requerido**: Definición de las herramientas a exponer (nombre, parámetros, funcionalidad)
- **Requerido**: Lenguaje de implementación (TypeScript, Python, R)
- **Opcional**: APIs o servicios externos a integrar
- **Opcional**: Esquemas de datos para validación de entradas
- **Opcional**: Requisitos de autenticación

## Procedimiento

### Paso 1: Elegir SDK e Inicializar Proyecto

**TypeScript** (recomendado para nuevos proyectos):
```bash
mkdir mi-mcp-server && cd mi-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
npx tsc --init
```

**Python**:
```bash
mkdir mi-mcp-server && cd mi-mcp-server
python -m venv venv
source venv/bin/activate
pip install mcp pydantic
```

**Esperado:** Proyecto inicializado con dependencias MCP instaladas.

**En caso de fallo:** Verificar versiones de Node.js (18+) o Python (3.10+), comprobar acceso a npm/pip.

### Paso 2: Implementar el Servidor

**TypeScript**:
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "mi-servidor",
  version: "1.0.0",
});

// Definir una herramienta
server.tool(
  "buscar-documentos",
  "Buscar documentos en el repositorio interno",
  {
    consulta: z.string().describe("Término de búsqueda"),
    limite: z.number().optional().default(10).describe("Número máximo de resultados"),
  },
  async ({ consulta, limite }) => {
    // Implementación de la búsqueda
    const resultados = await buscarEnBase(consulta, limite);
    return {
      content: [{ type: "text", text: JSON.stringify(resultados, null, 2) }],
    };
  }
);

// Iniciar servidor
const transport = new StdioServerTransport();
await server.connect(transport);
```

**Esperado:** El servidor se ejecuta y expone herramientas vía el protocolo MCP.

**En caso de fallo:** Verificar que el esquema de herramientas es válido, comprobar que las dependencias están importadas correctamente.

### Paso 3: Agregar Recursos y Prompts

```typescript
// Recurso: exponer datos accesibles
server.resource(
  "configuracion-proyecto",
  "project://config",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify(config),
    }],
  })
);

// Prompt: plantilla reutilizable
server.prompt(
  "analizar-metricas",
  "Analizar métricas del proyecto",
  { periodo: z.string().describe("Periodo temporal (7d, 30d, 90d)") },
  async ({ periodo }) => ({
    messages: [{
      role: "user",
      content: { type: "text", text: `Analiza las métricas del proyecto para los últimos ${periodo}...` },
    }],
  })
);
```

**Esperado:** Recursos y prompts disponibles junto con las herramientas en el cliente MCP.

**En caso de fallo:** Verificar URIs de recursos son únicos, comprobar que los esquemas de prompts son válidos.

### Paso 4: Probar y Depurar

```bash
# Probar con stdio directo
echo '{"jsonrpc":"2.0","method":"initialize","params":{"capabilities":{}},"id":1}' | node dist/index.js

# Agregar a Claude Code
claude mcp add mi-servidor stdio node -- dist/index.js

# Verificar herramientas disponibles
claude mcp list
```

**Esperado:** El servidor responde al handshake JSON-RPC, las herramientas aparecen en Claude Code.

**En caso de fallo:** Habilitar logging detallado, verificar formato de mensajes JSON-RPC, comprobar que el proceso no termina prematuramente.

## Validación

- [ ] El servidor inicia sin errores
- [ ] Las herramientas aparecen en el cliente MCP
- [ ] Las herramientas ejecutan correctamente cuando se invocan
- [ ] Los errores se manejan apropiadamente (no crashean el servidor)
- [ ] Los recursos devuelven datos actualizados
- [ ] Los prompts generan mensajes bien formados

## Errores Comunes

- **Servidor termina prematuramente**: El transporte stdio requiere que el proceso permanezca activo. No usar `process.exit()`.
- **Esquemas de herramientas inválidos**: Validar esquemas con zod/pydantic antes de registrar herramientas.
- **Sin manejo de errores**: Los errores no capturados crashean el servidor. Envolver handlers en try/catch.
- **Herramientas sin descripción**: Los clientes MCP usan las descripciones para decidir cuándo invocar herramientas.
- **Respuestas demasiado grandes**: Limitar el tamaño de respuestas para evitar problemas de memoria en el cliente.

## Habilidades Relacionadas

- `configure-mcp-server` - Configurar servidores MCP en clientes
- `scaffold-mcp-server` - Generar estructura de proyecto MCP desde plantillas
- `troubleshoot-mcp-connection` - Depurar problemas de conexión MCP
- `analyze-codebase-for-mcp` - Identificar funcionalidad para exponer vía MCP
