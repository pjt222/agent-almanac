---
name: analyze-codebase-for-mcp
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-sonnet-4-6
translation_date: 2026-03-16
description: >
  Analizar un repositorio de código existente para identificar funcionalidad que puede
  exponerse como herramientas MCP. Evaluar APIs, funciones, y servicios para determinar
  candidatos de integración MCP, incluyendo diseño de esquemas y patrones de acceso.
  Usar cuando se quiera conectar una base de código existente con Claude vía MCP, cuando
  se necesite identificar qué funcionalidad exponer, o cuando se planifique una
  estrategia de integración MCP.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: intermediate
  language: multi
  tags: mcp, analysis, codebase, tools, integration
---

# Analizar Base de Código para MCP

Analizar un repositorio existente para identificar funcionalidad exponer como herramientas MCP.

## Cuándo Usar

- Planificando integración MCP para una base de código existente
- Identificando qué funciones o APIs exponer como herramientas MCP
- Evaluando la viabilidad de integración MCP
- Diseñando la estrategia de herramientas MCP para un proyecto
- Priorizando funcionalidad para exposición vía MCP

## Entradas

- **Requerido**: Repositorio de código a analizar
- **Requerido**: Lenguaje(s) de programación del proyecto
- **Opcional**: Documentación existente de la API
- **Opcional**: Casos de uso previstos para la integración MCP
- **Opcional**: Restricciones de seguridad o acceso

## Procedimiento

### Paso 1: Catalogar la Funcionalidad del Proyecto

Escanear el repositorio para identificar funciones, APIs, y servicios exportados.

```bash
# Encontrar funciones exportadas (JavaScript/TypeScript)
grep -rn "export function\|export const\|export class" src/ --include="*.ts" --include="*.js"

# Encontrar funciones públicas (Python)
grep -rn "^def \|^class " src/ --include="*.py" | grep -v "^.*:.*_"

# Encontrar funciones exportadas (R)
grep -rn "#' @export" R/ --include="*.R"

# Encontrar endpoints de API
grep -rn "app\.get\|app\.post\|app\.put\|app\.delete\|@app\.route" --include="*.py" --include="*.ts" --include="*.js"
```

**Esperado:** Lista de funciones, clases, y endpoints candidatos para exposición MCP.

**En caso de fallo:** Revisar la documentación del proyecto, examinar los archivos de entrada principales (main, index, app).

### Paso 2: Clasificar Candidatos por Tipo MCP

Categorizar la funcionalidad identificada:

| Tipo MCP | Candidatos |
|----------|-----------|
| **Herramientas** | Funciones que realizan acciones (CRUD, cálculos, transformaciones) |
| **Recursos** | Datos que se pueden leer (configuración, estado, catálogos) |
| **Prompts** | Plantillas de interacción reutilizables |

Criterios de selección:
- **Incluir**: Funciones bien definidas con entradas/salidas claras
- **Incluir**: Operaciones que se benefician del contexto de lenguaje natural
- **Excluir**: Funciones internas de infraestructura
- **Excluir**: Operaciones que requieren interacción visual
- **Excluir**: Funciones con efectos secundarios peligrosos sin confirmación

**Esperado:** Funcionalidad clasificada en herramientas, recursos, y prompts con justificación.

**En caso de fallo:** Comenzar con las funciones más simples y de menor riesgo, agregar más iterativamente.

### Paso 3: Diseñar Esquemas de Herramientas

Para cada herramienta candidata, diseñar el esquema de entrada/salida:

```typescript
// Ejemplo: convertir una función existente
// Original: function buscarProductos(query: string, categoria?: string, limite?: number)
// Esquema MCP:
{
  name: "buscar-productos",
  description: "Buscar productos en el catálogo por nombre o categoría",
  inputSchema: {
    query: z.string().describe("Término de búsqueda"),
    categoria: z.string().optional().describe("Filtrar por categoría"),
    limite: z.number().optional().default(10).describe("Resultados máximos"),
  }
}
```

**Esperado:** Esquemas diseñados con descripciones claras, validación de tipos, y valores predeterminados.

**En caso de fallo:** Simplificar esquemas complejos, dividir herramientas grandes en operaciones más pequeñas.

### Paso 4: Evaluar Consideraciones de Seguridad

Revisar cada herramienta candidata por riesgos de seguridad:
- ¿La herramienta modifica datos? -> Requiere confirmación
- ¿Accede a datos sensibles? -> Requiere autorización
- ¿Ejecuta código arbitrario? -> Requiere sandboxing
- ¿Tiene efectos secundarios irreversibles? -> Requiere protección

**Esperado:** Cada herramienta evaluada con controles de seguridad apropiados identificados.

**En caso de fallo:** Errar del lado de la precaución. Comenzar con herramientas de solo lectura.

## Validación

- [ ] Todas las funciones principales del proyecto identificadas y catalogadas
- [ ] Candidatos clasificados como herramientas, recursos, o prompts
- [ ] Esquemas de entrada/salida diseñados con descripciones claras
- [ ] Consideraciones de seguridad evaluadas para cada candidato
- [ ] Priorización basada en valor y riesgo documentada
- [ ] Plan de implementación con fases definido

## Errores Comunes

- **Exponer demasiada funcionalidad**: Comenzar con un conjunto pequeño de herramientas de alto valor.
- **Descripciones vagas**: Los clientes MCP dependen de las descripciones para decidir cuándo usar herramientas.
- **Ignorar seguridad**: Las herramientas MCP son accesibles por el modelo. Evaluar riesgos cuidadosamente.
- **Esquemas demasiado complejos**: Simplificar entradas. El modelo trabaja mejor con parámetros simples.
- **No considerar idempotencia**: Las herramientas pueden ser invocadas múltiples veces. Diseñar para idempotencia cuando sea posible.

## Habilidades Relacionadas

- `build-custom-mcp-server` - Implementar el servidor MCP después del análisis
- `scaffold-mcp-server` - Generar estructura del proyecto MCP
- `configure-mcp-server` - Configurar el servidor resultante
- `review-software-architecture` - Revisión de arquitectura complementaria
