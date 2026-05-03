---
name: cross-review-project
description: >
  Conduct a structured cross-project code review between two Claude Code
  instances via the cross-review-mcp broker. Each agent reads its own
  codebase, reviews the peer's code, and engages in evidence-backed
  dialogue — with QSG scaling laws enforcing review quality through
  minimum bandwidth constraints and phase-gated progression.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: mcp-integration
  complexity: advanced
  language: multi
  tags: mcp, cross-review, multi-agent, code-review, qsg, a2a
  locale: es
  source_locale: en
  source_commit: 11edabf5
  translator: "Claude + human review"
  translation_date: "2026-05-03"
---

# Cross-Review Project

Dos instancias de Claude Code revisan los proyectos de la otra a través del intercambio estructurado de artefactos vía el broker `cross-review-mcp`. El broker hace cumplir las leyes de escalado Quantized Simplex Gossip (QSG) — los bundles de revisión deben contener al menos 5 hallazgos para mantenerse en el régimen de selección (Γ_h ≈ 1.67), evitando que el consenso superficial pase como acuerdo.

## Cuándo Usar

- Dos proyectos comparten preocupaciones arquitectónicas y podrían aprender el uno del otro
- Quieres una revisión de código independiente que vaya más allá de lo que ve un solo revisor
- La polinización cruzada es el objetivo: encontrar patrones en un proyecto que faltan en el otro
- Necesitas una revisión estructurada respaldada por evidencia con veredictos accept/reject/discuss

## Entradas

- **Requerido**: Dos rutas de proyecto accesibles a dos instancias de Claude Code
- **Requerido**: Broker `cross-review-mcp` ejecutándose y configurado como servidor MCP en ambas instancias
- **Opcional**: Áreas de enfoque — directorios, patrones o preocupaciones específicas a priorizar
- **Opcional**: IDs de agente — identificadores para cada instancia (predeterminado: nombre del directorio del proyecto)

## Procedimiento

### Paso 1: Verificar Prerrequisitos

Confirmar que el broker está ejecutándose y ambas instancias pueden alcanzarlo.

1. Verificar que el broker está configurado como servidor MCP:
   ```bash
   claude mcp list | grep cross-review
   ```
2. Llamar `get_status` para verificar que el broker responde y no hay agentes obsoletos registrados
3. Leer el recurso de protocolo en `cross-review://protocol` — este es un documento markdown que describe las dimensiones de revisión y las restricciones QSG

**Esperado:** El broker responde a `get_status` con una lista de agentes vacía. El recurso de protocolo es legible como markdown.

**En caso de fallo:** Si el broker no está configurado, añadirlo: `claude mcp add cross-review-mcp -- npx cross-review-mcp`. Si existen agentes obsoletos de una sesión anterior, llamar `deregister` para cada uno antes de proceder.

### Paso 2: Registrar

Registrar este agente con el broker.

1. Llamar `register` con:
   - `agentId`: un identificador corto y único (p. ej., nombre del directorio del proyecto)
   - `project`: el nombre del proyecto
   - `capabilities`: `["review", "suggest"]`
2. Verificar el registro llamando `get_status` — tu agente debe aparecer con fase `"registered"`
3. Esperar a que el agente par se registre: llamar `wait_for_phase` con el ID del agente par y la fase `"registered"`

**Esperado:** Ambos agentes registrados con el broker. `get_status` muestra 2 agentes en fase `"registered"`.

**En caso de fallo:** Si `register` falla con "already registered", el ID de agente está tomado de una sesión anterior. Llamar `deregister` primero, luego re-registrar.

### Paso 3: Fase de Briefing

Leer tu propia base de código y enviar un briefing estructurado al par.

1. Leer sistemáticamente:
   - Puntos de entrada (archivos main, index, comandos CLI)
   - Grafo de dependencias (package.json, DESCRIPTION, go.mod)
   - Patrones arquitectónicos (estructura de directorios, límites de módulos)
   - Problemas conocidos (comentarios TODO, issues abiertos, deuda técnica)
   - Cobertura de pruebas (directorios de pruebas, configuración CI)
2. Componer un artefacto `Briefing` — un resumen estructurado que el par puede usar para navegar tu base de código eficientemente
3. Llamar `send_task` con:
   - `from`: tu ID de agente
   - `to`: ID de agente par
   - `type`: `"briefing"`
   - `payload`: briefing codificado en JSON
4. Llamar `signal_phase` con fase `"briefing"`

**Esperado:** Briefing enviado y fase señalizada. El broker hace cumplir que debes enviar un briefing antes de avanzar a la revisión.

**En caso de fallo:** Si `send_task` rechaza el briefing, verificar que el campo `from` coincida con tu ID de agente registrado. Los auto-envíos son rechazados.

### Paso 4: Fase de Revisión

Esperar el briefing del par, luego revisar su código y enviar hallazgos.

1. Llamar `wait_for_phase` con el ID del par y fase `"briefing"`
2. Llamar `poll_tasks` para recuperar el briefing del par
3. Llamar `ack_tasks` con los IDs de tarea recibidos — esto es requerido (patrón peek-then-ack)
4. Leer el código fuente real del par, informado por su briefing
5. Producir hallazgos en 6 categorías:
   - `pattern_transfer` — un patrón en tu proyecto que el par podría adoptar
   - `missing_practice` — una práctica que le falta al par (testing, validación, manejo de errores)
   - `inconsistency` — contradicción interna dentro de la base de código del par
   - `simplification` — complejidad innecesaria que podría reducirse
   - `bug_risk` — fallo potencial en runtime o caso límite
   - `documentation_gap` — documentación faltante o engañosa
6. Cada hallazgo debe incluir:
   - `id`: identificador único (p. ej., `"F-001"`)
   - `category`: una de las 6 categorías de arriba
   - `targetFile`: ruta en el proyecto del par
   - `description`: lo que encontraste
   - `evidence`: por qué este es un hallazgo válido (referencias de código, patrones)
   - `sourceAnalog` (recomendado): el equivalente en tu propio proyecto que demuestra el patrón — este es el único mecanismo para una polinización cruzada genuina
7. Empaquetar al menos **5 hallazgos** (restricción QSG: m ≥ 5 mantiene Γ_h ≈ 1.67 en régimen de selección)
8. Llamar `send_task` con tipo `"review_bundle"` y el array de hallazgos codificado en JSON
9. Llamar `signal_phase` con fase `"review"`

**Esperado:** Bundle de revisión aceptado por el broker. Menos de 5 hallazgos serán rechazados.

**En caso de fallo:** Si el bundle es rechazado por hallazgos insuficientes, revisar más a fondo. La restricción existe para evitar que las revisiones superficiales dominen. Si genuinamente no puedes encontrar 5 problemas, reconsiderar si la cross-review es la herramienta correcta para este par de proyectos.

### Paso 5: Fase de Diálogo

Recibir hallazgos sobre tu propio proyecto y responder con veredictos respaldados por evidencia.

1. Llamar `wait_for_phase` con el ID del par y fase `"review"`
2. Llamar `poll_tasks` para recuperar hallazgos sobre tu proyecto
3. Llamar `ack_tasks` con los IDs de tarea recibidos
4. Para cada hallazgo, producir un `FindingResponse`:
   - `findingId`: coincide con el ID del hallazgo
   - `verdict`: `"accept"` (válido, actuarás sobre él), `"reject"` (inválido, con contra-evidencia), o `"discuss"` (necesita aclaración)
   - `evidence`: por qué aceptas o rechazas — debe ser no-vacío
   - `counterEvidence` (opcional): referencias de código específicas que contradicen el hallazgo
5. Enviar todas las respuestas vía `send_task` con tipo `"response"`
6. Llamar `signal_phase` con fase `"dialogue"`

Nota: el veredicto `"discuss"` no está controlado por el protocolo — tratarlo como una bandera para seguimiento manual, no un sub-intercambio automatizado.

**Esperado:** Todos los hallazgos respondidos con veredictos. Las respuestas vacías son rechazadas por el broker.

**En caso de fallo:** Si no puedes formar una opinión sobre un hallazgo, por defecto a `"discuss"` con evidencia explicando qué contexto adicional necesitas.

### Paso 6: Fase de Síntesis

Producir un artefacto de síntesis resumiendo los hallazgos aceptados y las acciones planificadas.

1. Llamar `wait_for_phase` con el ID del par y fase `"dialogue"`
2. Hacer poll de cualquier tarea restante y reconocerlas
3. Compilar un artefacto `Synthesis`:
   - Hallazgos aceptados con acciones planificadas (qué cambiarás y por qué)
   - Hallazgos rechazados con razones (preserva el razonamiento para futura revisión)
4. Llamar `send_task` con tipo `"synthesis"` y la síntesis codificada en JSON
5. Llamar `signal_phase` con fase `"synthesis"`
6. Opcionalmente crear issues de GitHub para hallazgos aceptados
7. Llamar `signal_phase` con fase `"complete"`
8. Llamar `deregister` para limpiar

**Esperado:** Ambos agentes alcanzan `"complete"`. El broker requiere al menos 2 agentes registrados para avanzar a complete.

**En caso de fallo:** Si el par ya se ha desregistrado, aún puedes completar localmente. Compilar tu síntesis a partir de los hallazgos que recibiste.

## Validación

- [ ] Ambos agentes registrados y alcanzaron la fase `"complete"`
- [ ] Briefings intercambiados antes de que comenzaran las revisiones (cumplimiento de fase)
- [ ] Los bundles de revisión contenían al menos 5 hallazgos cada uno
- [ ] Todos los hallazgos recibieron un veredicto (accept/reject/discuss) con evidencia
- [ ] `ack_tasks` llamado después de cada `poll_tasks`
- [ ] Síntesis producida con hallazgos aceptados mapeados a acciones
- [ ] Agentes desregistrados después de completar

## Errores Comunes

- **Menos de 5 hallazgos**: El broker rechaza bundles con m < 5. Esto no es arbitrario — con N=2 agentes y 6 categorías, m < 5 pone a Γ_h en o por debajo del límite crítico donde el consenso es indistinguible del ruido. Revisar más a fondo; si 5 hallazgos genuinamente no pueden encontrarse, los proyectos pueden no beneficiarse de cross-review.
- **Olvidar `ack_tasks`**: El broker usa entrega peek-then-ack. Las tareas permanecen en cola hasta ser reconocidas. Olvidar hacer ack causa procesamiento duplicado en el siguiente poll.
- **Olvidar el parámetro `from`**: `send_task` requiere un campo `from` explícito que coincida con tu ID de agente. Los auto-envíos son rechazados.
- **Correlación epistémica del mismo modelo**: Dos instancias de Claude comparten sesgos de entrenamiento. El ordenamiento temporal asegura que no leen la salida de la otra durante la revisión, pero sus priors están correlacionados. Para independencia epistémica genuina, usar diferentes familias de modelos entre instancias.
- **Saltar `sourceAnalog`**: El campo `sourceAnalog` es opcional pero es el único mecanismo para una polinización cruzada genuina — muestra *tu* implementación del patrón que estás recomendando. Siempre poblarlo cuando exista un análogo de origen.
- **Tratar `discuss` como bloqueante**: Nada en el protocolo controla `complete` en discusiones pendientes que estén resolviéndose. Tratar veredictos `discuss` como banderas para seguimiento manual después de la sesión.
- **No revisar la telemetría**: El broker registra todos los eventos a JSONL. Después de una sesión, revisar el log para validar las suposiciones QSG — estimar α empíricamente (`α ≈ 1 - reject_rate`) y verificar las tasas de aceptación por categoría.

## Habilidades Relacionadas

- `scaffold-mcp-server` — para construir o extender el broker mismo
- `implement-a2a-server` — patrones del protocolo A2A de los que el broker se nutre
- `review-codebase` — revisión de un solo agente (esta habilidad la extiende a intercambio estructurado entre agentes)
- `build-consensus` — patrones de consenso de enjambre (QSG es la base teórica)
- `configure-mcp-server` — configurar el broker como servidor MCP en Claude Code
- `unleash-the-agents` — puede usarse para analizar el broker mismo (probado en batalla: 40 agentes, 10 familias de hipótesis)
