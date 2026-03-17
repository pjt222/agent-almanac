---
name: review-pull-request
description: >
  Revisar una pull request de principio a fin usando GitHub CLI. Cubre el
  análisis del diff, la revisión del historial de commits, la verificación de
  comprobaciones CI/CD, la retroalimentación con niveles de gravedad
  (bloqueante/sugerencia/detalle/elogio) y el envío con gh pr review. Usar
  cuando se asigne una pull request para revisión, al realizar una
  autorrevisión antes de pedir la opinión de otros, al realizar una segunda
  revisión tras abordar la retroalimentación, o al auditar una PR fusionada
  para una evaluación de calidad posterior a la fusión.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Grep Glob Bash WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: review
  complexity: intermediate
  language: multi
  tags: review, pull-request, github, code-review, gh-cli, feedback, pr
---

# Revisar Pull Request

Revisar una pull request de GitHub de principio a fin — desde comprender el cambio hasta enviar retroalimentación estructurada. Usa el CLI `gh` para todas las interacciones con GitHub y produce comentarios de revisión con niveles de gravedad.

## Cuándo Usar

- Una pull request está lista para revisión y se le ha asignado
- Realizar una segunda revisión después de que el autor aborda la retroalimentación
- Revisar su propia PR antes de solicitar la revisión de otros (autorrevisión)
- Auditar una PR fusionada para una evaluación de calidad posterior a la fusión
- Cuando desea un proceso de revisión estructurado en lugar de un escaneo ad-hoc

## Entradas

- **Obligatorio**: Identificador de PR (número, URL o `owner/repo#number`)
- **Opcional**: Enfoque de revisión (seguridad, rendimiento, corrección, estilo)
- **Opcional**: Nivel de familiaridad con la base de código (familiar, algo, desconocido)
- **Opcional**: Presupuesto de tiempo para la revisión (escaneo rápido, estándar, exhaustivo)

## Procedimiento

### Paso 1: Comprender el Contexto

Leer la descripción de la PR y entender qué trata de lograr el cambio.

1. Obtener los metadatos de la PR:
   ```bash
   gh pr view <number> --json title,body,author,baseRefName,headRefName,labels,additions,deletions,changedFiles,reviewDecision
   ```
2. Leer el título y la descripción de la PR:
   - ¿Qué problema resuelve esta PR?
   - ¿Qué enfoque adoptó el autor?
   - ¿Hay áreas específicas que el autor quiere que se revisen?
3. Verificar el tamaño de la PR y evaluar el tiempo requerido:

```
Guía de Tamaño de PR:
+----------+-----------+---------+---------------------------------------+
| Tamaño   | Archivos  | Líneas  | Enfoque de Revisión                   |
+----------+-----------+---------+---------------------------------------+
| Pequeño  | 1-5       | <100    | Leer cada línea, revisión rápida      |
| Mediano  | 5-15      | 100-500 | Enfocarse en cambios lógicos, revisar |
|          |           |         | superficialmente la configuración     |
| Grande   | 15-30     | 500-    | Revisar por commit, centrarse en      |
|          |           | 1000    | archivos críticos, señalar si debe   |
|          |           |         | dividirse                             |
| XL       | 30+       | 1000+   | Señalar para división. Revisar solo  |
|          |           |         | los archivos más críticos.            |
+----------+-----------+---------+---------------------------------------+
```

4. Revisar el historial de commits:
   ```bash
   gh pr view <number> --json commits --jq '.commits[].messageHeadline'
   ```
   - ¿Son los commits lógicos y bien estructurados?
   - ¿Cuenta el historial una historia (cada commit un paso coherente)?
5. Verificar el estado de CI/CD:
   ```bash
   gh pr checks <number>
   ```
   - ¿Están pasando todas las comprobaciones?
   - Si las comprobaciones fallan, anote cuáles — esto afecta la revisión

**Esperado:** Una comprensión clara de qué hace la PR, por qué existe, qué tamaño tiene y si CI está en verde. Este contexto da forma al enfoque de revisión.

**En caso de fallo:** Si la descripción de la PR está vacía o es poco clara, anote esto como la primera retroalimentación. Una PR sin contexto es un antipatrón de revisión. Si los comandos `gh` fallan, verifique que está autenticado (`gh auth status`) y tiene acceso al repositorio.

### Paso 2: Analizar el Diff

Leer los cambios de código reales de manera sistemática.

1. Obtener el diff completo:
   ```bash
   gh pr diff <number>
   ```
2. Para PRs **pequeñas/medianas**, leer el diff completo secuencialmente
3. Para PRs **grandes**, revisar por commit:
   ```bash
   gh pr diff <number> --patch  # formato de parche completo
   ```
4. Para cada archivo modificado, evaluar:
   - **Corrección**: ¿Hace el código lo que dice la PR que hace?
   - **Casos extremos**: ¿Se manejan las condiciones de borde?
   - **Manejo de errores**: ¿Los errores se capturan y gestionan apropiadamente?
   - **Seguridad**: ¿Hay riesgos de inyección, autenticación o exposición de datos?
   - **Rendimiento**: ¿Hay bucles O(n²) obvios, índices faltantes o problemas de memoria?
   - **Nomenclatura**: ¿Las nuevas variables/funciones/clases tienen nombres claros?
   - **Pruebas**: ¿Los nuevos comportamientos están cubiertos por pruebas?
5. Tomar notas mientras lee, clasificando cada observación por gravedad

**Esperado:** Un conjunto de observaciones que cubra la corrección, seguridad, rendimiento y calidad para cada cambio significativo en el diff. Cada observación tiene un nivel de gravedad.

**En caso de fallo:** Si el diff es demasiado grande para revisarlo eficazmente, señálelo: "Esta PR modifica {N} archivos y {M} líneas. Recomiendo dividirla en PRs más pequeñas para una revisión más efectiva." De todos modos, revise los archivos de mayor riesgo.

### Paso 3: Clasificar la Retroalimentación

Organizar las observaciones en niveles de gravedad.

1. Clasificar cada observación:

```
Niveles de Gravedad de Retroalimentación:
+-----------+------+----------------------------------------------------+
| Nivel     | Icono| Descripción                                        |
+-----------+------+----------------------------------------------------+
| Bloqueante| [B]  | Debe corregirse antes de fusionar. Errores,        |
|           |      | problemas de seguridad, riesgos de pérdida de      |
|           |      | datos, funcionalidad rota.                         |
| Sugerencia| [S]  | Debería corregirse, pero no bloqueará la fusión.   |
|           |      | Mejores enfoques, casos extremos faltantes,        |
|           |      | problemas de estilo que afectan la mantenibilidad. |
| Detalle   | [N]  | Mejora opcional. Preferencias de estilo,           |
|           |      | sugerencias menores de nomenclatura, formato.      |
| Elogio    | [P]  | Buen trabajo que merece mención. Soluciones        |
|           |      | inteligentes, pruebas exhaustivas, abstracciones   |
|           |      | limpias.                                           |
+-----------+------+----------------------------------------------------+
```

2. Para cada elemento Bloqueante, explicar:
   - Qué está mal (el problema específico)
   - Por qué importa (el impacto)
   - Cómo corregirlo (una sugerencia concreta)
3. Para cada elemento Sugerencia, explicar la alternativa y por qué es mejor
4. Mantener los Detalles breves — una oración es suficiente
5. Incluir al menos un Elogio si algo positivo destaca

**Esperado:** Una lista ordenada de elementos de retroalimentación con niveles de gravedad claros. Los elementos Bloqueantes tienen sugerencias de corrección. La proporción debería ser generalmente: pocos Bloqueantes, algunos Sugerencia, mínimos Detalles, al menos un Elogio.

**En caso de fallo:** Si todo parece bloqueante, puede que la PR necesite rehacerse en lugar de parchearse. Considere solicitar cambios a nivel de PR en lugar de comentarios línea por línea. Si nada parece incorrecto, dígalo — "LGTM" es una retroalimentación válida cuando el código es bueno.

### Paso 4: Redactar los Comentarios de Revisión

Componer la revisión con retroalimentación estructurada y accionable.

1. Redactar el **resumen de la revisión** (comentario de nivel superior):
   - Una oración: qué hace la PR (confirmar la comprensión)
   - Evaluación general: aprobar, solicitar cambios o comentar
   - Elementos clave: listar los problemas Bloqueantes (si los hay) y los principales Sugerencia
   - Elogio: destacar el buen trabajo
2. Redactar **comentarios en línea** para ubicaciones específicas del código:
   ```bash
   # Publicar comentarios en línea mediante la API de gh
   gh api repos/{owner}/{repo}/pulls/{number}/comments \
     -f body="[B] Esta consulta SQL es vulnerable a inyección. Use consultas parametrizadas en su lugar.\n\n\`\`\`suggestion\ndb.query('SELECT * FROM users WHERE id = $1', [userId])\n\`\`\`" \
     -f commit_id="<sha>" \
     -f path="src/users.js" \
     -F line=42 \
     -f side="RIGHT"
   ```
3. Formatear la retroalimentación consistentemente:
   - Comenzar cada comentario con la etiqueta de gravedad: `[B]`, `[S]`, `[N]` o `[P]`
   - Usar bloques de sugerencia de GitHub para correcciones concretas
   - Enlazar a documentación para sugerencias de estilo/patrón
4. Enviar la revisión:
   ```bash
   # Aprobar
   gh pr review <number> --approve --body "Resumen de revisión aquí"

   # Solicitar cambios (cuando existen problemas bloqueantes)
   gh pr review <number> --request-changes --body "Resumen de revisión aquí"

   # Solo comentar (cuando no está seguro o proporciona retroalimentación informativa)
   gh pr review <number> --comment --body "Resumen de revisión aquí"
   ```

**Esperado:** Una revisión enviada con retroalimentación clara y accionable. El autor sabe exactamente qué corregir (Bloqueante), qué considerar (Sugerencia) y qué salió bien (Elogio).

**En caso de fallo:** Si `gh pr review` falla, verifique los permisos. Necesita acceso de escritura al repositorio o ser un revisor solicitado. Si los comentarios en línea fallan, ponga toda la retroalimentación en el cuerpo de la revisión con referencias a archivo:línea.

### Paso 5: Seguimiento

Rastrear la resolución de la revisión.

1. Después de que el autor responda o empuje actualizaciones:
   ```bash
   gh pr view <number> --json reviewDecision,reviews
   ```
2. Revisar solo los cambios que abordan su retroalimentación:
   ```bash
   gh pr diff <number>  # verificar nuevos commits
   ```
3. Verificar que los elementos Bloqueantes están resueltos antes de aprobar
4. Resolver hilos de comentarios a medida que se abordan los problemas
5. Aprobar cuando todos los elementos Bloqueantes están corregidos:
   ```bash
   gh pr review <number> --approve --body "Todos los problemas bloqueantes resueltos. LGTM."
   ```

**Esperado:** Los problemas Bloqueantes verificados como corregidos. Conversación de revisión resuelta. PR aprobada o se solicitan más cambios con elementos restantes específicos.

**En caso de fallo:** Si el autor no está de acuerdo con la retroalimentación, discuta en el hilo de la PR. Enfóquese en el impacto (por qué importa) en lugar de la autoridad. Si el desacuerdo persiste en elementos no bloqueantes, ceda con gracia — el autor es dueño del código.

## Validación

- [ ] Contexto de la PR comprendido (propósito, tamaño, estado de CI)
- [ ] Todos los archivos modificados revisados (o los de mayor riesgo para PRs XL)
- [ ] Retroalimentación clasificada por gravedad (Bloqueante/Sugerencia/Detalle/Elogio)
- [ ] Los elementos Bloqueantes tienen sugerencias de corrección específicas
- [ ] Al menos un Elogio incluido para aspectos positivos
- [ ] La decisión de revisión coincide con la retroalimentación (aprobar solo si no hay elementos Bloqueantes)
- [ ] Los comentarios en línea hacen referencia a líneas específicas con etiquetas de gravedad
- [ ] Comprobaciones CI/CD verificadas (en verde antes de aprobar)
- [ ] Seguimiento completado después de las revisiones del autor

## Errores Comunes

- **Aprobar sin revisar**: Aprobar sin leer realmente el diff. Cada aprobación es una afirmación de calidad
- **Avalancha de detalles**: Abrumar al autor con preferencias de estilo. Reserve los detalles para situaciones de tutoría; omítalos en revisiones con tiempo limitado
- **Perder el bosque**: Revisar línea por línea sin entender el diseño general. Leer la descripción de la PR y el historial de commits primero
- **Bloquear por estilo**: El formato y la nomenclatura casi nunca son bloqueantes. Reserve Bloqueante para errores, seguridad e integridad de datos
- **Sin elogio**: Señalar solo problemas es desmoralizante. El buen código merece reconocimiento
- **Expansión del alcance de la revisión**: Comentar sobre código que no se modificó en la PR. Si los problemas preexistentes le molestan, abra un issue separado

## Habilidades Relacionadas

- `review-software-architecture` — revisión de arquitectura a nivel de sistema (complementaria a la revisión a nivel de PR)
- `security-audit-codebase` — análisis de seguridad profundo para PRs con cambios sensibles a la seguridad
- `create-pull-request` — el otro lado del proceso: crear PRs fáciles de revisar
- `commit-changes` — un historial de commits limpio facilita significativamente la revisión de PRs
