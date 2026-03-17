---
name: use-graphql-api
description: >
  GraphQL-APIs über die Kommandozeile und in TypeScript-Anwendungen abfragen
  und Mutations durchführen. Behandelt Introspection, Query-Komposition,
  Variablen, Authentifizierung und Fehlerbehandlung. Verwenden, wenn eine
  GraphQL-API integriert, eine bestehende REST-Integration migriert oder
  GraphQL-Operationen debuggt werden sollen.
license: MIT
locale: de
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: intermediate
  language: TypeScript
  tags: graphql, api, typescript, queries, mutations
---

# GraphQL-API verwenden

GraphQL-APIs abfragen und Mutations durchführen, sowohl über die Kommandozeile als auch in TypeScript-Anwendungen.

## Wann verwenden

- Integration einer GraphQL-API in eine Anwendung
- Migration einer bestehenden REST-Integration auf GraphQL
- Debugging von GraphQL-Operationen und Schema-Problemen
- Erkunden einer unbekannten GraphQL-API über Introspection

## Eingaben

- **Erforderlich**: GraphQL-Endpunkt-URL (z. B. `https://api.example.com/graphql`)
- **Optional**: Authentifizierungs-Token oder API-Key
- **Optional**: Spezifische Query- oder Mutation-Operationen
- **Optional**: TypeScript-Client-Library-Präferenz (fetch, urql, Apollo)

## Vorgehensweise

### Schritt 1: API über Introspection erkunden

Das Schema der GraphQL-API entdecken, ohne Dokumentation.

```bash
# Einfache Introspection-Query mit curl
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { types { name kind } } }"}' \
  | jq '.data.__schema.types[] | select(.kind == "OBJECT") | .name'

# Mit Authentifizierung
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "{ __schema { queryType { fields { name description } } } }"}' \
  | jq '.data.__schema.queryType.fields[]'
```

Für eine vollständigere Schema-Erkundung:

```bash
# Vollständige Introspection-Query speichern
cat > /tmp/introspection.json << 'EOF'
{
  "query": "{ __schema { types { name kind fields { name type { name kind ofType { name kind } } } } } }"
}
EOF

curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -d @/tmp/introspection.json | jq '.' > /tmp/schema.json
```

**Erwartet:** Schema-Typen und verfügbare Query-Felder werden aufgelistet.

**Bei Fehler:** Wenn Introspection disabled ist (häufig in Produktions-APIs), die offizielle Dokumentation konsultieren oder den API-Anbieter für ein Schema-Dokument kontaktieren.

### Schritt 2: Queries mit curl testen

Queries manuell testen, bevor Code geschrieben wird.

```bash
# Einfache Query
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetUser($id: ID!) { user(id: $id) { id name email } }",
    "variables": {"id": "123"}
  }' | jq '.'

# Query mit verschachtelten Feldern
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ users(first: 10) { edges { node { id name posts { title } } } pageInfo { hasNextPage endCursor } } }"
  }' | jq '.data.users.edges[].node'
```

**Erwartet:** JSON-Antwort mit `data`-Schlüssel, der die angeforderten Felder enthält. Keine `errors`-Schlüssel.

**Bei Fehler:** Wenn `errors` erscheint, den Meldungstext prüfen. Häufige Ursachen: falsche Feldnamen (Schema-Introspection auf korrekte Namen prüfen), fehlende erforderliche Variablen, Berechtigungsfehler.

### Schritt 3: TypeScript-GraphQL-Client einrichten

Eine typisierte GraphQL-Client-Integration in TypeScript einrichten.

```bash
# Option 1: Nativer Fetch (kein Client erforderlich)
# Keine Installation nötig

# Option 2: graphql-request (leichtgewichtig)
npm install graphql-request graphql

# Option 3: urql (React-fokussiert)
npm install urql graphql

# Option 4: Apollo Client (vollständig)
npm install @apollo/client graphql
```

Typisierter Client mit `graphql-request`:

```typescript
// src/lib/graphql-client.ts
import { GraphQLClient, gql } from 'graphql-request'

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL!

export const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.API_TOKEN}`,
  },
})

// Typen definieren
interface User {
  id: string
  name: string
  email: string
}

interface GetUserQuery {
  user: User
}

interface GetUserVariables {
  id: string
}

// Typisierte Query-Funktion
const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`

export async function getUser(id: string): Promise<User> {
  const data = await client.request<GetUserQuery, GetUserVariables>(
    GET_USER,
    { id }
  )
  return data.user
}
```

**Erwartet:** Client initialisiert ohne Fehler. `getUser()`-Funktion gibt typisierte `User`-Daten zurück.

**Bei Fehler:** Wenn TypeScript Typfehler meldet, sicherstellen, dass GraphQL-Response-Typen mit den tatsächlichen Schema-Feldern übereinstimmen.

### Schritt 4: Mutations implementieren

Daten-schreibende Operationen implementieren.

```typescript
// src/lib/mutations.ts
import { client, gql } from './graphql-client'

interface CreatePostInput {
  title: string
  content: string
  authorId: string
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
}

interface CreatePostMutation {
  createPost: Post
}

const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      id
      title
      content
      createdAt
    }
  }
`

export async function createPost(input: CreatePostInput): Promise<Post> {
  const data = await client.request<CreatePostMutation>(CREATE_POST, {
    input,
  })
  return data.createPost
}
```

```bash
# Mutation mit curl testen
curl -s -X POST https://api.example.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "mutation CreatePost($input: CreatePostInput!) { createPost(input: $input) { id title } }",
    "variables": {"input": {"title": "Test Post", "content": "Hello", "authorId": "123"}}
  }' | jq '.'
```

**Erwartet:** Mutation gibt das erstellte Objekt mit ID zurück.

**Bei Fehler:** Wenn Mutation schlägt mit "Not authorized" fehl, sicherstellen, dass das Auth-Token korrekt formatiert ist (Bearer-Präfix, gültiger Token).

### Schritt 5: Fehlerbehandlung implementieren

Robuste Fehlerbehandlung für GraphQL-Antworten.

```typescript
// src/lib/graphql-client.ts (erweitert)
import { ClientError } from 'graphql-request'

export interface GraphQLError {
  message: string
  locations?: Array<{ line: number; column: number }>
  path?: string[]
  extensions?: Record<string, unknown>
}

export class GraphQLRequestError extends Error {
  constructor(
    message: string,
    public readonly errors: GraphQLError[],
    public readonly status: number
  ) {
    super(message)
    this.name = 'GraphQLRequestError'
  }
}

export async function safeRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    return await client.request<T>(query, variables)
  } catch (error) {
    if (error instanceof ClientError) {
      const graphqlErrors = error.response.errors ?? []
      throw new GraphQLRequestError(
        graphqlErrors[0]?.message ?? 'GraphQL request failed',
        graphqlErrors,
        error.response.status
      )
    }
    throw error
  }
}
```

**Erwartet:** `safeRequest()` gibt typisierte Daten zurück oder wirft `GraphQLRequestError` mit strukturierten Fehlerinformationen.

**Bei Fehler:** Wenn Fehler-Typen nicht übereinstimmen, GraphQL-Error-Response-Struktur durch Logging von `error.response` aus `ClientError` überprüfen.

### Schritt 6: In Next.js-API-Route integrieren

GraphQL-Queries in Next.js Server-Komponenten oder API-Routen verwenden.

```typescript
// src/app/users/[id]/page.tsx (Server Component)
import { getUser } from '@/lib/graphql-client'

interface Props {
  params: { id: string }
}

export default async function UserPage({ params }: Props) {
  const user = await getUser(params.id)

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}

// src/app/api/posts/route.ts (API Route)
import { NextRequest, NextResponse } from 'next/server'
import { createPost } from '@/lib/mutations'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const post = await createPost({
    title: body.title,
    content: body.content,
    authorId: body.authorId,
  })

  return NextResponse.json(post)
}
```

**Erwartet:** Server-Komponente rendert User-Daten. API-Route erstellt Post und gibt JSON zurück.

**Bei Fehler:** Wenn Daten nicht auf der Client-Seite erscheinen, sicherstellen, dass die Komponente als Server-Komponente deklariert ist (keine `'use client'`-Direktive) und die GraphQL-Antwort korrekt gemappt wird.

## Validierung

- [ ] Schema-Introspection gibt verfügbare Typen und Felder zurück
- [ ] Test-Query über curl gibt erwartete Daten zurück
- [ ] TypeScript-Client kompiliert ohne Fehler
- [ ] Mutations erstellen/aktualisieren Daten erfolgreich
- [ ] Fehlerbehandlung fängt GraphQL-Fehler und gibt strukturierte Informationen zurück
- [ ] Next.js-Integration rendert GraphQL-Daten korrekt

## Haeufige Stolperfallen

- **GraphQL vs REST-Fehlerstatuscodes**: GraphQL gibt immer HTTP 200 zurück — Fehler stehen in `errors`-Array im Response-Body, nicht im HTTP-Status.
- **N+1-Query-Problem**: Das Abrufen von einer Liste und dann für jedes Element einer Unterabfrage führt zu N+1 Datenbankabfragen. `DataLoader` oder Batching auf API-Seite verwenden.
- **Introspection in Produktion deaktiviert**: Viele APIs deaktivieren Introspection aus Sicherheitsgründen. Lokale Entwicklung oder Staging-Endpunkte zum Erkunden verwenden.
- **Cursor-basierte Pagination**: GraphQL-APIs verwenden oft Cursor-Pagination (`edges`/`node`/`pageInfo`) statt Offset-Pagination. `endCursor` korrekt für die nächste Seite weitergeben.
- **Variablen-Typen müssen übereinstimmen**: GraphQL ist stark typisiert. `"123"` vs `123` (String vs Int) führt zu Validierungsfehlern.
- **Auth-Token-Aktualisierung**: Wenn Tokens ablaufen, Client-Instanz neu initialisieren oder Header-Funktion anstelle eines statischen Strings verwenden.

## Verwandte Skills

- `scaffold-nextjs-app` — Next.js-App für GraphQL-Integration vorbereiten
- `deploy-to-vercel` — GraphQL-integrierte App deployen
