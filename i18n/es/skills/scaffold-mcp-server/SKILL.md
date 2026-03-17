---
name: scaffold-mcp-server
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Generar la estructura de un nuevo servidor MCP desde plantillas, incluyendo
  configuración del proyecto, definición de herramientas, manejo de transporte,
  y configuración de testing. Soportar TypeScript, Python y R como lenguajes de
  implementación. Usar cuando se inicie un nuevo proyecto de servidor MCP, se
  necesite una estructura consistente, o se quiera acelerar el desarrollo inicial.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, scaffold, template, server, project-structure
---

# Crear Andamiaje de Servidor MCP

Generar la estructura de un nuevo proyecto de servidor MCP desde plantillas.

## Cuándo Usar

- Iniciando un nuevo proyecto de servidor MCP
- Necesitando una estructura de proyecto consistente y probada
- Acelerando el desarrollo inicial con plantillas pre-configuradas
- Estandarizando la creación de servidores MCP en un equipo
- Prototipando rápidamente integraciones MCP

## Entradas

- **Requerido**: Nombre del servidor MCP
- **Requerido**: Lenguaje de implementación (TypeScript, Python, R)
- **Requerido**: Lista de herramientas a implementar
- **Opcional**: Tipo de transporte (stdio, HTTP/SSE)
- **Opcional**: Servicios externos a integrar
- **Opcional**: Requisitos de autenticación

## Procedimiento

### Paso 1: Crear Estructura del Proyecto (TypeScript)

```bash
mkdir mi-mcp-server && cd mi-mcp-server

# Inicializar proyecto
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx vitest

# Configurar TypeScript
npx tsc --init --outDir dist --rootDir src --strict true \
  --module nodenext --moduleResolution nodenext --target es2022
```

Estructura generada:
```
mi-mcp-server/
├── src/
│   ├── index.ts          # Punto de entrada
│   ├── server.ts         # Configuración del servidor
│   ├── tools/            # Definiciones de herramientas
│   │   ├── index.ts
│   │   └── ejemplo.ts
│   ├── resources/        # Definiciones de recursos
│   │   └── index.ts
│   └── utils/            # Utilidades compartidas
│       └── logger.ts
├── tests/
│   └── tools.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

**Esperado:** Estructura del proyecto creada con todas las dependencias instaladas.

**En caso de fallo:** Verificar versión de Node.js (18+), comprobar acceso a npm.

### Paso 2: Implementar Servidor Base

```typescript
// src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registrarHerramientas } from "./tools/index.js";
import { registrarRecursos } from "./resources/index.js";

export async function iniciarServidor() {
  const server = new McpServer({
    name: "mi-mcp-server",
    version: "1.0.0",
  });

  // Registrar herramientas y recursos
  registrarHerramientas(server);
  registrarRecursos(server);

  // Conectar transporte
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Servidor MCP iniciado exitosamente");
}
```

```typescript
// src/index.ts
import { iniciarServidor } from "./server.js";
iniciarServidor().catch(console.error);
```

**Esperado:** Servidor base que inicia y acepta conexiones MCP.

**En caso de fallo:** Verificar importaciones de módulos, comprobar configuración de TypeScript.

### Paso 3: Definir Herramientas con Plantilla

```typescript
// src/tools/ejemplo.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registrarHerramientaEjemplo(server: McpServer) {
  server.tool(
    "ejemplo-saludo",
    "Genera un saludo personalizado",
    {
      nombre: z.string().describe("Nombre de la persona a saludar"),
      idioma: z.enum(["es", "en", "de"]).optional().default("es")
        .describe("Idioma del saludo"),
    },
    async ({ nombre, idioma }) => {
      const saludos: Record<string, string> = {
        es: `¡Hola, ${nombre}!`,
        en: `Hello, ${nombre}!`,
        de: `Hallo, ${nombre}!`,
      };

      return {
        content: [{
          type: "text",
          text: saludos[idioma] ?? saludos.es,
        }],
      };
    }
  );
}
```

```typescript
// src/tools/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registrarHerramientaEjemplo } from "./ejemplo.js";

export function registrarHerramientas(server: McpServer) {
  registrarHerramientaEjemplo(server);
  // Agregar más herramientas aquí
}
```

**Esperado:** Herramientas definidas con esquemas claros, descripciones, y manejo de errores.

**En caso de fallo:** Verificar que los esquemas zod son válidos, comprobar que las descripciones son informativas.

### Paso 4: Configurar Scripts y Testing

```json
// package.json (scripts)
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "test": "vitest",
    "lint": "tsc --noEmit"
  }
}
```

```typescript
// tests/tools.test.ts
import { describe, it, expect } from "vitest";

describe("Herramienta ejemplo-saludo", () => {
  it("genera saludo en español por defecto", async () => {
    // Implementar test de integración
  });
});
```

```bash
# Compilar y probar
npm run build
npm run start

# Agregar a Claude Code
claude mcp add mi-mcp-server stdio node -- dist/index.js
```

**Esperado:** El servidor se compila, pruebas pasan, y se registra exitosamente en Claude Code.

**En caso de fallo:** Revisar errores de compilación de TypeScript, verificar paths de importación.

### Paso 5: Crear Estructura Python (Alternativa)

```bash
mkdir mi-mcp-server && cd mi-mcp-server
python -m venv venv
source venv/bin/activate
pip install mcp pydantic pytest
```

```python
# src/server.py
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
import json

app = Server("mi-mcp-server")

@app.tool()
async def ejemplo_saludo(nombre: str, idioma: str = "es") -> list[TextContent]:
    """Genera un saludo personalizado."""
    saludos = {"es": f"¡Hola, {nombre}!", "en": f"Hello, {nombre}!"}
    return [TextContent(type="text", text=saludos.get(idioma, saludos["es"]))]

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

**Esperado:** Servidor Python funcionando con herramientas registradas.

**En caso de fallo:** Verificar versión de Python (3.10+), comprobar instalación de dependencias.

## Validación

- [ ] La estructura del proyecto sigue las convenciones del lenguaje
- [ ] El servidor compila/ejecuta sin errores
- [ ] Las herramientas están registradas y son accesibles
- [ ] Los tests están configurados y ejecutan
- [ ] El servidor se puede agregar a Claude Code exitosamente
- [ ] La documentación del proyecto está incluida (README)

## Errores Comunes

- **Estructura desorganizada**: Separar herramientas, recursos, y utilidades en directorios distintos.
- **Sin validación de entrada**: Siempre usar zod (TS) o pydantic (Python) para validar parámetros.
- **Sin manejo de errores global**: Envolver el punto de entrada en try/catch para errores fatales.
- **Descripción de herramientas faltante**: Cada herramienta necesita una descripción clara para que el modelo sepa cuándo usarla.
- **No documentar la instalación**: Incluir instrucciones claras de setup en el README.

## Habilidades Relacionadas

- `build-custom-mcp-server` - Implementación detallada de servidores MCP
- `configure-mcp-server` - Configurar el servidor en clientes MCP
- `analyze-codebase-for-mcp` - Analizar código para decidir qué exponer
- `containerize-mcp-server` - Contenerizar el servidor MCP resultante
