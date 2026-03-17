---
name: use-graphql-api
description: >
  Interactuar con APIs GraphQL desde la línea de comandos: descubrir esquemas
  mediante introspección, construir consultas y mutaciones, ejecutarlas con
  gh api graphql o curl, analizar respuestas con jq, y encadenar operaciones
  pasando IDs entre llamadas. Úsalo al automatizar Discussions, Issues o
  Projects de GitHub via GraphQL, al integrarse con cualquier endpoint GraphQL
  desde scripts, o al construir flujos de trabajo CLI que necesiten datos
  estructurados de la API.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob WebFetch
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: intermediate
  language: multi
  tags: graphql, api, github, query, mutation, introspection
---

# Use GraphQL API

Descubrir, construir, ejecutar y encadenar operaciones GraphQL desde la línea de comandos.

## Cuándo Usar

- Al consultar o mutar datos vía un endpoint GraphQL (GitHub, Hasura, Apollo, etc.)
- Al automatizar operaciones de GitHub que requieren GraphQL (Discussions, Projects v2)
- Al construir scripts de shell que recuperan datos estructurados de APIs GraphQL
- Al encadenar múltiples llamadas GraphQL donde la salida de una alimenta la siguiente

## Entradas

- **Requerido**: URL del endpoint GraphQL o nombre del servicio (p.ej., `github`)
- **Requerido**: Intención de la operación (qué datos leer o escribir)
- **Opcional**: Token o método de autenticación (predeterminado: auth de `gh` CLI para GitHub)
- **Opcional**: Preferencia de formato de salida (JSON en bruto, filtrado con jq, asignación de variable)

## Procedimiento

### Paso 1. Descubrir el Esquema

Determinar los tipos, campos, consultas y mutaciones disponibles.

**Para GitHub:**

```bash
# Listar campos de consulta disponibles
gh api graphql -f query='{ __schema { queryType { fields { name description } } } }' \
  | jq '.data.__schema.queryType.fields[] | {name, description}'

# Listar campos de mutación disponibles
gh api graphql -f query='{ __schema { mutationType { fields { name description } } } }' \
  | jq '.data.__schema.mutationType.fields[] | {name, description}'

# Inspeccionar un tipo específico
gh api graphql -f query='{
  __type(name: "Repository") {
    fields { name type { name kind ofType { name } } }
  }
}' | jq '.data.__type.fields[] | {name, type: .type.name // .type.ofType.name}'
```

**Para endpoints genéricos:**

```bash
# Consulta de introspección completa via curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"query":"{ __schema { types { name kind fields { name } } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | {name, fields: [.fields[].name]}'
```

**Esperado:** Salida JSON que lista los tipos, campos o mutaciones disponibles. La respuesta del esquema confirma que el endpoint es accesible y el token de autenticación es válido.

**En caso de fallo:**
- `401 Unauthorized` — verifica el token; para GitHub, ejecuta `gh auth status`
- `Cannot query field` — el endpoint puede deshabilitar la introspección; consulta su documentación en su lugar
- Conexión rechazada — verifica la URL del endpoint y el acceso a la red

### Paso 2. Identificar el Tipo de Operación

Determinar si tu tarea requiere una consulta (lectura), mutación (escritura) o suscripción (flujo).

| Intención | Operación | Ejemplo |
|-----------|-----------|---------|
| Recuperar datos | `query` | Obtener detalles del repositorio, listar discussions |
| Crear/actualizar/eliminar | `mutation` | Crear una discussion, añadir un comentario |
| Actualizaciones en tiempo real | `subscription` | Observar nuevos issues (raro en CLI) |

Para operaciones específicas de GitHub, consulta la [documentación de la API GraphQL de GitHub](https://docs.github.com/en/graphql).

```bash
# Verificación rápida: ¿existe la mutación?
gh api graphql -f query='{ __schema { mutationType { fields { name } } } }' \
  | jq '.data.__schema.mutationType.fields[].name' | grep -i "discussion"
```

**Esperado:** Identificación clara de si se necesita una consulta o mutación, más el nombre exacto de la operación (p.ej., `createDiscussion`, `repository`).

**En caso de fallo:**
- Operación no encontrada — busca con términos más amplios o verifica la versión de la API
- Incertidumbre entre consulta o mutación — si la acción cambia el estado, es una mutación

### Paso 3. Construir la Operación

Construir la consulta o mutación GraphQL con campos, argumentos y variables.

**Ejemplo de consulta — recuperar las categorías de discussion de un repositorio:**

```bash
gh api graphql -f query='
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 10) {
        nodes { id name }
      }
    }
  }
' -f owner="OWNER" -f repo="REPO" | jq '.data.repository.discussionCategories.nodes'
```

**Ejemplo de mutación — crear una Discussion de GitHub:**

```bash
gh api graphql -f query='
  mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: {
      repositoryId: $repoId,
      categoryId: $categoryId,
      title: $title,
      body: $body
    }) {
      discussion { url number }
    }
  }
' -f repoId="$REPO_ID" -f categoryId="$CAT_ID" \
  -f title="My Discussion" -f body="Discussion body here"
```

**Reglas clave de construcción:**

1. Siempre usa variables (`$var: Type!`) en lugar de valores en línea para mayor reutilización
2. Solicita solo los campos que necesitas para minimizar el tamaño de la respuesta
3. Usa `first: N` con `nodes` para conexiones paginadas
4. Añade `id` a cada selección de objeto — lo necesitarás para el encadenamiento

**Esperado:** Una operación GraphQL sintácticamente válida con variables apropiadas, selecciones de campos y parámetros de paginación.

**En caso de fallo:**
- Errores de sintaxis — verifica el emparejamiento de corchetes y las comas finales (GraphQL no tiene comas finales)
- Incompatibilidad de tipos — verifica los tipos de variables contra el esquema (p.ej., `ID!` vs `String!`)
- Campos requeridos faltantes — añade los campos de entrada requeridos según el esquema

### Paso 4. Ejecutar via CLI

Ejecutar la operación y capturar la respuesta.

**GitHub — usando `gh api graphql`:**

```bash
# Consulta simple
gh api graphql -f query='{ viewer { login } }'

# Con variables
gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id name }
  }' \
  -f owner="octocat" -f repo="Hello-World"

# Con post-procesamiento con jq
REPO_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id }
  }' \
  -f owner="OWNER" -f repo="REPO" \
  --jq '.data.repository.id')
```

**Endpoint genérico — usando curl:**

```bash
curl -s -X POST "$GRAPHQL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$(jq -n \
    --arg query 'query { users { id name } }' \
    '{query: $query}'
  )"
```

**Esperado:** Una respuesta JSON con una clave `data` que contiene los campos solicitados, o un array `errors` si la operación falló.

**En caso de fallo:**
- Array `errors` en la respuesta — lee el mensaje; las causas comunes son permisos faltantes, IDs inválidos o límites de tasa
- `data` vacío — la consulta no coincidió con ningún registro; verifica los valores de entrada
- HTTP 403 — el token carece del alcance requerido; para GitHub, verifica `gh auth status` y añade alcances con `gh auth refresh -s scope`

### Paso 5. Analizar la Respuesta

Extraer los datos que necesitas de la respuesta JSON.

```bash
# Extraer un solo valor
gh api graphql -f query='{ viewer { login } }' --jq '.data.viewer.login'

# Extraer de una lista
gh api graphql -f query='
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      issues(first: 5, states: OPEN) {
        nodes { number title }
      }
    }
  }
' -f owner="OWNER" -f repo="REPO" \
  --jq '.data.repository.issues.nodes[] | "\(.number): \(.title)"'

# Asignar a una variable para uso posterior
CATEGORY_ID=$(gh api graphql -f query='
  query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 20) {
        nodes { id name }
      }
    }
  }
' -f owner="OWNER" -f repo="REPO" \
  --jq '.data.repository.discussionCategories.nodes[] | select(.name == "Show and Tell") | .id')
```

**Esperado:** Valores limpios y extraídos listos para mostrar o asignar a variables de shell.

**En caso de fallo:**
- `jq` devuelve null — la ruta del campo es incorrecta; envía el JSON en bruto a `jq .` primero para inspeccionar la estructura
- Múltiples valores cuando se espera uno — añade un filtro `select()` o `| first`
- Problemas con Unicode — añade `-r` a jq para salida de cadena en bruto

### Paso 6. Encadenar Operaciones

Usar la salida de una operación como entrada de la siguiente.

```bash
# Paso A: Obtener el ID del repositorio
REPO_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) { id }
  }' \
  -f owner="$OWNER" -f repo="$REPO" \
  --jq '.data.repository.id')

# Paso B: Obtener el ID de la categoría de discussion
CAT_ID=$(gh api graphql \
  -f query='query($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      discussionCategories(first: 20) {
        nodes { id name }
      }
    }
  }' \
  -f owner="$OWNER" -f repo="$REPO" \
  --jq '.data.repository.discussionCategories.nodes[]
    | select(.name == "Show and Tell") | .id')

# Paso C: Crear la discussion usando ambos IDs
RESULT=$(gh api graphql \
  -f query='mutation($repoId: ID!, $catId: ID!, $title: String!, $body: String!) {
    createDiscussion(input: {
      repositoryId: $repoId,
      categoryId: $catId,
      title: $title,
      body: $body
    }) {
      discussion { url number }
    }
  }' \
  -f repoId="$REPO_ID" -f catId="$CAT_ID" \
  -f title="$TITLE" -f body="$BODY" \
  --jq '.data.createDiscussion.discussion')

echo "Created: $(echo "$RESULT" | jq -r '.url')"
```

**Patrón:** Siempre extrae campos `id` en consultas anteriores para que puedan pasarse como variables `ID!` a mutaciones posteriores.

**Esperado:** Un flujo de trabajo de múltiples pasos donde cada llamada tiene éxito y los IDs fluyen correctamente entre operaciones.

**En caso de fallo:**
- La variable está vacía — un paso anterior falló silenciosamente; añade `set -e` y verifica cada valor intermedio
- Formato de ID incorrecto — los IDs de nodo de GitHub son cadenas opacas (p.ej., `R_kgDO...`); nunca los construyas manualmente
- Límite de tasa alcanzado — añade `sleep 1` entre llamadas o agrupa consultas usando aliases

## Validación

1. La consulta de introspección devuelve datos del esquema (Paso 1 exitoso)
2. Las consultas construidas son sintácticamente válidas (sin errores del parser de GraphQL)
3. Las respuestas contienen claves `data` sin `errors`
4. Los valores extraídos coinciden con los tipos esperados (los IDs son cadenas no vacías, los conteos son números)
5. Las operaciones encadenadas completan de extremo a extremo (la mutación usa IDs de consultas previas)

## Errores Comunes

| Error | Prevención |
|-------|------------|
| Olvidar `!` en tipos de variables requeridas | Siempre verifica el esquema para la anulabilidad; la mayoría de los campos de entrada son no nulos (`!`) |
| Usar IDs REST en GraphQL | GraphQL usa IDs de nodo opacos; recupéralos via GraphQL, no REST |
| No paginar conjuntos de resultados grandes | Usa `first`/`after` con `pageInfo { hasNextPage endCursor }` |
| Hardcodear IDs en lugar de consultarlos | Los IDs difieren entre entornos; siempre consulta dinámicamente |
| Ignorar el array `errors` | Verifica errores incluso cuando `data` está presente — los errores parciales son posibles |
| Problemas de comillas de shell con JSON anidado | Usa el flag `--jq` con `gh` o envía a través de `jq` por separado |

## Habilidades Relacionadas

- [scaffold-nextjs-app](../scaffold-nextjs-app/SKILL.md) — crear aplicaciones web que consumen APIs GraphQL
- [create-pull-request](../create-pull-request/SKILL.md) — automatización de flujos de trabajo de GitHub (equivalente REST)
- [manage-git-branches](../manage-git-branches/SKILL.md) — operaciones Git frecuentemente emparejadas con automatización de API
- [serialize-data-formats](../serialize-data-formats/SKILL.md) — patrones de análisis JSON usados en el manejo de respuestas
