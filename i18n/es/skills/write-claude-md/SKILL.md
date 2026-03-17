---
name: write-claude-md
description: >
  Crea un archivo CLAUDE.md efectivo que proporcione instrucciones específicas
  del proyecto a los asistentes de codificación con IA. Cubre la estructura,
  secciones comunes, patrones de hacer/no hacer, e integración con servidores
  MCP y definiciones de agentes. Usar al iniciar un proyecto donde se
  utilizarán asistentes de IA, al mejorar el comportamiento de la IA en un
  proyecto existente, al documentar convenciones y restricciones del proyecto,
  o al integrar servidores MCP o definiciones de agentes en un flujo de trabajo.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: general
  complexity: basic
  language: multi
  tags: claude-md, ai-assistant, project-config, documentation
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-opus-4-6
  translation_date: 2026-03-16
---

# Escribir CLAUDE.md

Crea un archivo CLAUDE.md que proporcione a los asistentes de IA contexto efectivo específico del proyecto.

## Cuándo Usar

- Al iniciar un proyecto donde se utilizarán asistentes de IA
- Al mejorar el comportamiento del asistente de IA en un proyecto existente
- Al documentar convenciones, flujos de trabajo y restricciones del proyecto
- Al integrar servidores MCP o definiciones de agentes en un proyecto

## Entradas

- **Requerido**: Tipo de proyecto y stack tecnológico
- **Requerido**: Convenciones y restricciones clave
- **Opcional**: Configuraciones de servidores MCP
- **Opcional**: Información de autores y colaboradores
- **Opcional**: Requisitos de seguridad y confidencialidad

## Procedimiento

### Paso 1: Crear el CLAUDE.md Básico

Colocar `CLAUDE.md` en la raíz del proyecto:

```markdown
# Nombre del Proyecto

Breve descripción de qué es este proyecto y su propósito.

## Inicio Rápido

Comandos esenciales para trabajar en este proyecto:

```bash
# Instalar dependencias
npm install  # o renv::restore() para R

# Ejecutar pruebas
npm test     # o devtools::test() para R

# Compilar
npm run build  # o devtools::check() para R
```

## Arquitectura

Decisiones arquitectónicas clave y patrones utilizados en este proyecto.

## Convenciones

- Usar siempre nombres de variables descriptivos
- Seguir la [guía de estilo específica del lenguaje]
- Escribir pruebas para toda nueva funcionalidad
```

**Esperado:** Existe un archivo `CLAUDE.md` en la raíz del proyecto con al menos una descripción del proyecto, comandos de inicio rápido, resumen de arquitectura y sección de convenciones.

**En caso de fallo:** Si no sabes qué incluir, comienza solo con la sección de Inicio Rápido que contenga los tres comandos más importantes (instalar, probar, compilar). El archivo puede expandirse de forma incremental a medida que el proyecto evoluciona.

### Paso 2: Añadir Secciones Específicas de la Tecnología

**Para paquetes R**:

```markdown
## Flujo de Trabajo de Desarrollo

```r
devtools::load_all()    # Cargar para desarrollo
devtools::document()    # Regenerar documentación
devtools::test()        # Ejecutar pruebas
devtools::check()       # Verificación completa del paquete
```

## Estructura del Paquete

- `R/` - Código fuente (una función por archivo)
- `tests/testthat/` - Las pruebas reflejan la estructura de R/
- `vignettes/` - Documentación detallada
- `man/` - Generado por roxygen2 (no editar manualmente)

## Archivos Críticos (No Eliminar)

- `.Rprofile` - Configuración de sesión
- `.Renviron` - Variables de entorno (ignorado por git)
- `renv.lock` - Dependencias bloqueadas
```

**Para Node.js/TypeScript**:

```markdown
## Stack

- Next.js 15 con App Router
- TypeScript en modo estricto
- Tailwind CSS para estilos
- Vercel para despliegue

## Convenciones

- Usar el alias de importación `@/` para el directorio src/
- Server Components por defecto, `"use client"` solo cuando sea necesario
- Rutas API en `src/app/api/`
```

**Esperado:** Se añaden secciones específicas de tecnología que coinciden con el stack real del proyecto — estructura de paquete R para proyectos R, detalles del stack Node.js para proyectos web, etc. Los comandos y rutas hacen referencia al diseño real del proyecto.

**En caso de fallo:** Si el proyecto usa un stack desconocido, inspecciona `package.json`, `DESCRIPTION`, `Cargo.toml` o equivalente para identificar la tecnología y añadir la sección correspondiente.

### Paso 3: Añadir Información sobre Servidores MCP

```markdown
## Servidores MCP Disponibles

### r-mcptools (Integración con R)
- **Propósito**: Conectar a sesiones R/RStudio
- **Estado**: Configurado
- **Configuración**: `claude mcp add r-mcptools stdio "Rscript.exe" -- -e "mcptools::mcp_server()"`

### hf-mcp-server (Hugging Face)
- **Propósito**: Acceso a modelos y conjuntos de datos de IA/ML
- **Estado**: Configurado
- **Configuración**: `claude mcp add hf-mcp-server -e HF_TOKEN=token -- mcp-remote https://huggingface.co/mcp`
```

**Esperado:** Cada servidor MCP configurado tiene una subsección que documenta su propósito, estado (configurado/disponible/no configurado) y el comando utilizado para añadirlo. No se incluyen tokens ni secretos reales.

**En caso de fallo:** Si los servidores MCP aún no están configurados, documéntalos como "Disponibles" con instrucciones de configuración en lugar de "Configurados". Usa valores de marcador como `your_token_here` para cualquier credencial.

### Paso 4: Añadir Información del Autor

```markdown
## Información del Autor

### Autoría Estándar del Paquete
- **Nombre**: Nombre del Autor
- **Correo**: autor@ejemplo.com
- **ORCID**: 0000-0000-0000-0000
- **GitHub**: nombre_usuario
```

**Esperado:** La sección de información del autor incluye nombre, correo, ORCID (para proyectos académicos/investigación) y nombre de usuario de GitHub. Para paquetes R, el formato coincide con los requisitos del archivo DESCRIPTION.

**En caso de fallo:** Si la información del autor es sensible o no debe ser pública, usa el nombre de la organización en lugar de datos personales, o omite la sección completamente para proyectos de uso interno.

### Paso 5: Añadir Directrices de Seguridad

```markdown
## Seguridad y Confidencialidad

- Nunca confirmar `.Renviron`, `.env` o archivos que contengan tokens
- Usar valores de marcador en la documentación: `YOUR_TOKEN_HERE`
- Variables de entorno para todos los secretos
- Ignorados por git: `.Renviron`, `.env`, `credentials.json`
```

**Esperado:** La sección de seguridad lista los archivos que nunca deben confirmarse, las convenciones de marcadores para la documentación, y confirma que `.gitignore` cubre todos los archivos sensibles.

**En caso de fallo:** Si no estás seguro de qué archivos son sensibles, ejecuta `grep -rn "sk-\|ghp_\|password" .` para buscar secretos expuestos. Cualquier archivo que contenga credenciales reales debe añadirse a `.gitignore` y mencionarse en esta sección.

### Paso 6: Referenciar Habilidades y Guías

```markdown
## Referencias de Mejores Prácticas de Desarrollo
@agent-almanac/skills/write-testthat-tests/SKILL.md
@agent-almanac/skills/submit-to-cran/SKILL.md
```

**Esperado:** Las habilidades y guías relevantes se referencian mediante rutas `@`, dando a los asistentes de IA acceso a procedimientos detallados para tareas comunes en el proyecto.

**En caso de fallo:** Si las habilidades o guías referenciadas no existen en las rutas especificadas, verifica las rutas o elimina las referencias. Las referencias `@` rotas no aportan valor y pueden confundir al asistente.

### Paso 7: Añadir Información de Calidad y Estado

```markdown
## Estado de Calidad

- R CMD check: 0 errores, 0 advertencias, 1 nota
- Cobertura de pruebas: 85%
- Pruebas: más de 200 pasando
- Viñetas: 3 (valoradas 9/10)
```

**Esperado:** La sección de métricas de calidad refleja el estado actual del proyecto con números precisos para los resultados de verificación, cobertura de pruebas, recuento de pruebas y estado de la documentación.

**En caso de fallo:** Si las métricas aún no están disponibles (proyecto nuevo), añade entradas de marcador con "TBD" y actualízalas a medida que el proyecto madura. No fabrique números.

## Validación

- [ ] CLAUDE.md está en la raíz del proyecto
- [ ] Los comandos de inicio rápido son precisos y funcionan
- [ ] La sección de arquitectura refleja la estructura real del proyecto
- [ ] Sin información sensible (tokens, contraseñas, rutas privadas)
- [ ] Las configuraciones de servidores MCP están actualizadas
- [ ] Los archivos y rutas referenciados existen

## Errores Comunes

- **Información desactualizada**: Actualizar CLAUDE.md cuando cambia la estructura del proyecto
- **Demasiado detalle**: Mantenerlo conciso. Enlazar a guías detalladas en lugar de duplicar contenido.
- **Datos sensibles**: Nunca incluir tokens o credenciales reales. Usar marcadores.
- **Instrucciones contradictorias**: Asegurarse de que CLAUDE.md no contradiga otros archivos de configuración
- **Falta en `.Rbuildignore`**: Para paquetes R, añadir `^CLAUDE\\.md$` a `.Rbuildignore`

## Ejemplos

Patrón observado en proyectos exitosos:

1. **putior** (829 líneas): CLAUDE.md completo con métricas de calidad, 20 logros, detalles de integración MCP y flujo de trabajo de desarrollo
2. **Proyecto simple** (20 líneas): Solo comandos de inicio rápido y convenciones clave

Ajustar el CLAUDE.md a la complejidad del proyecto.

## Habilidades Relacionadas

- `create-r-package` - CLAUDE.md como parte de la configuración del paquete
- `configure-mcp-server` - Configuración MCP referenciada en CLAUDE.md
- `security-audit-codebase` - verificar que no haya secretos en CLAUDE.md
