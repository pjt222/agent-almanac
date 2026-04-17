---
name: redact-for-public-disclosure
description: >
  Redacte hallazgos de ingeniería inversa para divulgación pública preservando
  la metodología, los patrones generalizables y el valor didáctico. Cubre la
  separación entre repo privado y público, el mantenimiento del patrón de
  deny-list, el patrón de publicación mediante commit huérfano que previene
  filtraciones por `git log`, la calibración de redacción basada en categorías
  (metodología/patrón/hallazgo-de-versión/interno), y la compuerta de CI
  estilo `check-redaction.sh` que bloquea merges cuando aparece un patrón en
  deny-list. Úselo al publicar hallazgos sobre un arnés CLI que no posee, al
  preparar propuestas upstream para un proyecto no relacionado, o al archivar
  un repo privado de investigación como referencia pública.
license: MIT
allowed-tools: Read Write Edit Bash Grep
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: investigation
  complexity: intermediate
  language: multi
  tags: redaction, disclosure, deny-list, orphan-commit, ci-gate, research-publishing
  locale: es
  source_locale: en
  source_commit: f74b59bd
  translator: claude-sonnet-4-6
  translation_date: "2026-04-17"
---

# Redactar para Divulgación Pública

Divida un repo de investigación de ingeniería inversa en una fuente de verdad privada y un subconjunto de divulgación pública usando un verificador de redacción, deny-lists de patrones y un patrón de publicación mediante commit huérfano. La metodología viaja; los hallazgos específicos se quedan en privado.

## Cuándo usar

- Publicar hallazgos de metodología sobre un arnés CLI de código cerrado con el que se integra
- Preparar una propuesta upstream o informe de bug para un proyecto que no posee
- Archivar un repo privado de investigación como referencia pública
- Promover notas de investigación (artefactos de Fase 1-4) a una guía pública
- Establecer un pipeline de publicación antes de que los hallazgos se acumulen de modo que el riesgo de fuga no se atasque
- Limpiar tras un casi-accidente en el que un borrador casi envió un identificador sensible

## Entradas

- **Requerido**: Un repo privado de investigación con contenido de sensibilidad mixta (la fuente de verdad)
- **Requerido**: Un mirror público de destino (repo separado, o un worktree `public/`) donde se publicará el contenido redactado
- **Opcional**: Un borrador existente agendado para publicación
- **Opcional**: Una política de retraso de versión (por defecto "actual + 1 anterior se mantienen privadas")
- **Opcional**: Una lista de identificadores del proveedor, prefijos de flag o namespaces ya conocidos como sensibles

## Procedimiento

### Paso 1: Categorice cada hecho candidato

Antes de escribir o promover cualquier contenido, clasifique cada hecho en una de cuatro categorías. La categoría determina si y cuándo puede enviarse.

| Categoría | Definición | ¿Compartible? |
|---|---|---|
| **metodología** | El *cómo* de la investigación, independiente de cualquier hallazgo específico | Siempre |
| **patrón genérico** | Observaciones a nivel de clase (p. ej., "los arneses suelen usar un namespace de flag con un solo prefijo") | Sí |
| **hallazgo específico de versión** | Observación concreta ligada a un lanzamiento específico (p. ej., "en vN.M, el gate está off por defecto") | Solo tras el enfriamiento del retraso de versión |
| **interno en vivo** | Nombres minificados, offsets de bytes, nombres de flags dark, lógica de gate de la versión actual, constantes de PRNG/sal, nombres en clave internos | Nunca |

Anote cada sección de borrador, log de captura o nota con su categoría antes de revisar para publicación. Una sección que mezcla categorías se divide — la metodología se extrae limpia, el resto se queda en privado.

**Expected:** Cada hecho candidato tiene una etiqueta de categoría. Los borradores destinados al mirror público contienen solo entradas de metodología y patrón-genérico (más hallazgos específicos de versión más antiguos que el enfriamiento).

**On failure:** Si un hecho resiste la categorización, trátelo como interno en vivo por defecto. Recategorice solo tras revisión explícita contra la política de retraso de versión.

### Paso 2: Fije la política de enfriamiento por retraso de versión

Decida por adelantado cuántas versiones median entre "actual" y "compartible". Dos es típico: la actual + 1 anterior permanecen privadas, los patrones más antiguos pueden discutirse. Escriba la política en el repo privado (p. ej., `REDACTION_POLICY.md`) para que su yo-futuro no tenga que rederivarla.

```markdown
# Redaction Policy

Version-lag cool-off: **2 releases**.
- Current release (vN): all version-specific findings PRIVATE.
- Previous release (vN-1): all version-specific findings PRIVATE.
- Releases vN-2 and earlier: version-specific findings may move to public draft after Step 5 review.

Source of truth for "current": output of `monitor-binary-version-baselines`.
Owner: <name>. Reviewed quarterly.
```

La versión "actual" debe ser empírica (leída del binario instalado), no administrativa. Ligue la política a la salida del escáner de línea base en lugar de a un calendario.

**Expected:** Un `REDACTION_POLICY.md` commiteado en el repo privado con un enfriamiento explícito y un responsable.

**On failure:** Si los stakeholders no se ponen de acuerdo en el enfriamiento, adopte la propuesta más conservadora. Los enfriamientos se pueden acortar después; recuperar una fuga no se puede.

### Paso 3: Construya el escáner de deny-list

Mantenga los patrones en un único script ejecutable que es la fuente de verdad para la política de redacción. El script vive en el repo privado (`tools/check-redaction.sh`) y se ejecuta contra el mirror público.

```bash
#!/usr/bin/env bash
set -u
PUBLIC_REPO="${1:-./public}"
LEAKS=0

PATTERNS=(
  "minified identifier shape|<regex matching short bundle-style identifiers>"
  "vendor-prefixed flag|<regex matching the vendor's flag prefix>"
  "PRNG/salt constant|<regex matching the specific constants>"
)

for entry in "${PATTERNS[@]}"; do
  desc="${entry%%|*}"
  pattern="${entry##*|}"
  if rg -q "$pattern" "$PUBLIC_REPO"; then
    echo "LEAK: $desc"; LEAKS=$((LEAKS+1))
  fi
done
exit $LEAKS
```

Cada entrada tiene una etiqueta legible por humanos y una regex. Una entrada por *forma* de identificador sensible (no por cadena literal — las formas sobreviven al churn de versiones). El código de salida es igual al número de fugas; una ejecución limpia sale con 0.

**Expected:** `tools/check-redaction.sh ./public-mirror` se ejecuta en menos de un segundo sobre un repo pequeño y sale con 0 cuando no hay coincidencias.

**On failure:** Si `rg` no está disponible, recurra a `grep -rqE`. Si los patrones son demasiado amplios (cada ejecución reporta fugas), estréchelos en la fuente en lugar de añadir supresiones.

### Paso 4: Mantenga la deny-list antes de redactar

Cuando un hallazgo de Fase 1-4 pudiera filtrarse a través de un borrador, extienda el escáner *antes* de escribir el borrador. Los borradores son baratos; enseñarle al escáner patrones nuevos es duradero.

Flujo de trabajo:

1. Un hallazgo nuevo aterriza en el repo privado (p. ej., un prefijo de flag recién descubierto).
2. Pregunte: "Si esto se filtrara, ¿qué querría que el escáner detectara?"
3. Añada una entrada de patrón a `tools/check-redaction.sh` (etiqueta + regex).
4. Ejecute el escáner contra el mirror público completo para confirmar que el patrón nuevo no queda ya activado por contenido legítimo.
5. Solo entonces, redacte cualquier contenido público que toque el área.

Esto invierte el orden habitual: el escáner se actualiza primero, el borrador después. El escáner se convierte en la especificación ejecutable de "qué es demasiado sensible para publicar", y el borrador no puede adelantarse accidentalmente.

**Expected:** Las entradas de patrón en `tools/check-redaction.sh` preceden a cualquier contenido del mirror público que pudiera coincidir con ellas. `git log tools/check-redaction.sh` muestra actualizaciones del escáner aterrizando antes que los commits de borrador relacionados.

**On failure:** Si las actualizaciones del escáner van por detrás de los borradores, audite el mirror público contra el nuevo patrón inmediatamente. Redacte, luego commitee la actualización del escáner con una nota explicando el patrón descubierto.

### Paso 5: Establezca la división de archivos privados/públicos

Defina una allow-list explícita de archivos que se sincronizan al mirror público. Los archivos nuevos son privados por defecto; la promoción requiere clearance del chequeo de redacción.

```bash
# tools/public-allowlist.txt
README.md
LICENSE
guides/methodology-overview.md
guides/category-classification.md
docs/contributing.md
```

Un `tools/sync-to-public.sh` lee la allow-list, copia solo esos archivos al mirror público y sale distinto de cero si la allow-list referencia un archivo que no existe (captura typos).

```bash
#!/usr/bin/env bash
set -eu
PRIVATE_ROOT="${1:?private repo path required}"
PUBLIC_ROOT="${2:?public mirror path required}"
ALLOWLIST="$PRIVATE_ROOT/tools/public-allowlist.txt"

while IFS= read -r path; do
  [ -z "$path" ] && continue
  case "$path" in \#*) continue ;; esac
  src="$PRIVATE_ROOT/$path"
  dst="$PUBLIC_ROOT/$path"
  if [ ! -e "$src" ]; then
    echo "MISSING: $path"; exit 2
  fi
  mkdir -p "$(dirname "$dst")"
  cp -a "$src" "$dst"
done < "$ALLOWLIST"
```

La promoción requiere tres cosas en orden: el archivo se añade a la allow-list, el archivo pasa el chequeo de redacción, y un revisor confirma las etiquetas de categoría del Paso 1.

**Expected:** El mirror público contiene exactamente los archivos listados en `tools/public-allowlist.txt`. Ningún archivo aparece en el mirror público que no esté en la allow-list.

**On failure:** Si un archivo aparece en el mirror público pero falta de la allow-list, trátelo como un evento de fuga — investigue cómo llegó, luego elimínelo o promuévalo formalmente tras revisión de redacción.

### Paso 6: Publique mediante commit huérfano

El mirror público es un único commit enraizado con `git commit --orphan` que se recrea en cada publicación. Esto evita que `git log` sobre el repo público exponga borradores pre-redacción.

```bash
# In the public mirror (separate repo or worktree)
cd /path/to/public-mirror
git checkout --orphan publish-tmp
git rm -rf .                                    # Clear the index
# Sync from private using the allow-list
bash /path/to/private/tools/sync-to-public.sh /path/to/private .
git add -A
git commit -m "Publish: <date>"
git branch -D main 2>/dev/null || true
git branch -m main
git push --force origin main
```

El `git log` del repo público muestra exactamente un commit. Los borradores previos y cualquier iteración de redacción permanecen en el historial del repo privado. Ningún `git log -p`, `git reflog` o listado de ramas en el repo público puede recuperar contenido pre-redacción porque nunca se commiteó allí.

**Expected:** `git log --oneline` en el mirror público muestra un único commit por publicación. No aparecen referencias al historial del repo privado (sin SHAs padre, sin commits de merge, sin tags del repo privado).

**On failure:** Si `git push --force` es rechazado (protección de rama), abra un pull request de un solo commit desde una rama huérfana limpia en su lugar. Nunca resuelva un rechazo empujando el historial privado.

### Paso 7: Cablee la compuerta de CI

Ejecute `tools/check-redaction.sh` en cada commit a la rama de sincronización pública. Un chequeo fallido bloquea la publicación, no solo advierte.

```yaml
# .github/workflows/redaction-check.yml (in the public mirror repo)
name: redaction-check
on:
  push:
    branches: [main, publish-*]
  pull_request:
    branches: [main]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install ripgrep
        run: sudo apt-get update && sudo apt-get install -y ripgrep
      - name: Fetch redaction scanner
        env:
          GH_TOKEN: ${{ secrets.PRIVATE_REPO_TOKEN }}
        run: |
          gh api repos/<org>/<private-repo>/contents/tools/check-redaction.sh \
            --jq .content | base64 -d > check-redaction.sh
          chmod +x check-redaction.sh
      - name: Run scanner
        run: ./check-redaction.sh .
```

Dos decisiones de diseño aquí:

- El escáner se trae del repo privado en tiempo de CI para que la propia deny-list nunca viva en el repo público (los patrones son en sí mismos sensibles — publicarlos diría al lector exactamente qué buscar).
- El job sale con el código de salida del escáner; distinto de cero bloquea el workflow.

**Expected:** Los pushes que introducen un patrón en deny-list fallan el CI; la publicación no aterriza. Los mantenedores ven la etiqueta de fallo (p. ej., `LEAK: vendor-prefixed flag`) sin ver la regex misma.

**On failure:** Si el token del repo privado no se puede otorgar al CI público, embeba solo una porción *de mínima fuga* del escáner en el repo público (patrones de forma amplios que no identifican al proveedor por sí mismos) y ejecute el escáner completo pre-push desde el repo privado.

### Paso 8: Maneje los falsos positivos con honestidad

Cuando el escáner se active sobre contenido legítimo, prefiera estrechar el patrón antes que añadir una línea ignorar. Las deny-lists amplias con supresiones locales se pudren rápido — seis meses después nadie recuerda por qué una línea concreta se suprimió, y la siguiente fuga pasa desapercibida.

Árbol de decisión:

1. **¿La coincidencia es realmente segura?** Recategorice usando el Paso 1. Si el contenido resulta ser un interno en vivo disfrazado, redáctelo; no suprima el escáner.
2. **¿El patrón es demasiado amplio?** Ajuste la regex para que el contenido seguro ya no coincida. Documente el ajuste con un comentario en `check-redaction.sh` enlazando al caso que lo motivó.
3. **Solo si 1 y 2 fallan ambas** — y el patrón está estructuralmente demasiado entrelazado con contenido legítimo para estrecharlo más — use una supresión de una sola línea con un comentario `# REASON:` que declare *por qué* la supresión es segura. Feche el comentario.

```bash
# Bad — mystery suppression
echo "API endpoint pattern" >> ignore.txt

# Good — narrowed pattern with rationale
# Pattern v2: tightened from `\bgate\(` to `\bgate\(['\"][a-z]+_phase` after
# legitimate `gate(true)` calls in our own SDK examples started matching. 2026-04-15.
PATTERNS+=("vendor flag predicate|\\bgate\\(['\"][a-z]+_phase")
```

**Expected:** Cada patrón del escáner tiene cero o un comentario en línea que explica un ajuste. Las supresiones, si existen, llevan fecha y razón.

**On failure:** Si las supresiones se acumulan (más de una por trimestre), la deny-list está mal dimensionada. Agende una revisión de política de redacción y reconstruya los patrones a partir del inventario de hechos categorizados.

### Paso 9: Barridos periódicos de redacción

No todo el trabajo de redacción es impulsado por incidentes. Ejecute un barrido periódico (mensual es lo típico) que recategorice las adiciones más recientes al repo privado y reejecute el escáner contra el mirror público. La deriva se detecta a sí misma antes de volverse de nivel de incidente.

Lista de comprobación del barrido:

- [ ] Relea la política de retraso de versión; confirme que la versión "actual" empírica no ha cambiado o actualice la política
- [ ] Audite el último mes de commits del repo privado en busca de hallazgos recién añadidos que no fueron categorizados (Paso 1)
- [ ] Ejecute `tools/check-redaction.sh` contra el mirror público (debería seguir saliendo con 0)
- [ ] Revise cualquier patrón del escáner añadido desde el último barrido — ¿alguno demasiado amplio? Ajústelo si es así
- [ ] Si alguna versión ha envejecido más allá del enfriamiento, identifique hallazgos ahora elegibles para promoción
- [ ] Confirme que `tools/public-allowlist.txt` coincide con el conjunto de archivos real del mirror público

**Expected:** Un log breve de barrido por mes en el repo privado (p. ej., `sweeps/2026-04.md`) con los resultados de la lista de comprobación y cualquier acción tomada.

**On failure:** Si el barrido se omite repetidamente, automatice un recordatorio de calendario. Si el barrido sigue encontrando la misma deriva, el workflow aguas arriba es el problema — investigue por qué se está omitiendo la categorización en el momento del borrador.

## Validación

- [ ] Cada archivo en el mirror público está en `tools/public-allowlist.txt`
- [ ] `tools/check-redaction.sh ./public-mirror` sale con 0
- [ ] `git log --oneline` en el mirror público muestra un único commit huérfano por publicación
- [ ] `REDACTION_POLICY.md` existe en el repo privado con un enfriamiento explícito de retraso de versión
- [ ] Cada hallazgo de Fase 1-4 tiene una etiqueta de categoría (metodología / patrón genérico / específico de versión / interno en vivo)
- [ ] El CI público ejecuta el escáner en cada push; un patrón de prueba deliberado hace fallar la build
- [ ] El propio escáner de deny-list no vive en el repo público
- [ ] El log del último barrido mensual está fechado dentro de los últimos 35 días

## Errores comunes

- **"Solo un ejemplo para hacerlo concreto."** La tentación de incluir un hallazgo específico "para aterrizar la metodología" es el camino de fuga más común. Use placeholders sintéticos (p. ej., `acme_widget_v3`, `widget_handler_42`) — claramente inventados, nunca rastreables a un producto real.
- **Usar `git rebase` o `git filter-branch` para borrar una fuga en sitio en el repo público.** El force-push de historia reescrita aún deja rastros en clones y forks. El patrón de publicación con commit huérfano es una solución estructural; la reescritura ad-hoc de historia no.
- **Supresiones en lugar de ajuste de patrones.** Un escáner con veinte supresiones es un escáner con cero cobertura significativa. Cada supresión es una fuga futura esperando a que el contexto se desvanezca.
- **CI público que advierte en lugar de fallar.** Las advertencias se ignoran. La compuerta de CI debe bloquear la publicación (salida distinta de cero, sin botón de merge).
- **Deriva de la allow-list.** Los archivos nuevos añadidos al repo privado no pertenecen automáticamente a la allow-list. Default-deny es la única postura segura.
- **Confundir cifrado con redacción.** Codificar, hashear o aplicar rot13 a un identificador sensible y publicar el resultado aún lo publica — el original es recuperable. Redactar significa "no aparece en absoluto".
- **Publicar la deny-list.** Los patrones mismos son un catálogo de hallazgos: un lector que vea la regex sabe exactamente qué buscar con grep en el binario. Mantenga el escáner privado; solo sus etiquetas (p. ej., `LEAK: vendor-prefixed flag`) deberían aparecer en los logs de CI público.
- **Tratar el repo privado como un montón de borradores.** Es la fuente de verdad para la investigación, no un espacio de pruebas. Aplique el mismo versionado, revisión y disciplina de backup que aplicaría a cualquier artefacto de producción.

## Skills relacionadas

- `monitor-binary-version-baselines` — Fase 1, las líneas base alimentan la política de retraso de versión: qué cuenta como "actual" es un hecho empírico, no un hecho de calendario
- `probe-feature-flag-state` — Fases 2-3, los hallazgos de clasificación de aquí entran al pipeline de redacción en el paso de categoría (Paso 1)
- `conduct-empirical-wire-capture` — Fase 4, los artefactos de captura (logs de tráfico, esquemas de payload) necesitan redacción antes de que cualquiera pueda referenciarse públicamente
- `security-audit-codebase` — ambos pipelines se benefician del escaneo estilo deny-list; esta skill se especializa para divulgación de investigación más que para fuga de secretos
- `manage-git-branches` — el patrón de publicación con commit huérfano es una operación de rama; la ejecución segura requiere las prácticas de higiene de rama documentadas allí
