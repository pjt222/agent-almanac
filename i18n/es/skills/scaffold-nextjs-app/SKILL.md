---
name: scaffold-nextjs-app
description: >
  Crear una nueva aplicación Next.js con App Router, TypeScript y valores
  predeterminados modernos. Cubre la creación del proyecto, estructura de
  directorios, configuración de enrutamiento y configuración inicial. Úsalo al
  iniciar un nuevo proyecto de aplicación web, al crear un frontend basado en
  React con renderizado del lado del servidor, al construir una aplicación
  full-stack con rutas de API, o al configurar un proyecto web TypeScript desde
  cero.
locale: es
source_locale: en
source_commit: 6f65f316
translator: claude-opus-4-6
translation_date: 2026-03-16
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: web-dev
  complexity: basic
  language: TypeScript
  tags: nextjs, react, typescript, app-router, scaffold
---

# Scaffold Next.js App

Crear una nueva aplicación Next.js con App Router, TypeScript y valores predeterminados listos para producción.

## Cuándo Usar

- Al iniciar un nuevo proyecto de aplicación web
- Al crear un frontend basado en React con renderizado del lado del servidor
- Al construir una aplicación full-stack con rutas de API
- Al configurar un proyecto web TypeScript

## Entradas

- **Requerido**: Nombre de la aplicación
- **Requerido**: Preferencia de gestor de paquetes (npm, yarn, pnpm)
- **Opcional**: Si incluir Tailwind CSS (predeterminado: sí)
- **Opcional**: Si incluir ESLint (predeterminado: sí)
- **Opcional**: Estructura de directorio src/ (predeterminado: sí)

## Procedimiento

### Paso 1: Crear el Proyecto

```bash
npx create-next-app@latest my-app \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

Responde las preguntas o usa los flags para configurar todas las opciones sin interacción.

**Esperado:** Directorio del proyecto creado con todas las dependencias instaladas.

**En caso de fallo:** Verifica la versión de Node.js (`node --version`, debe ser >= 18.17). Asegúrate de que `npx` esté disponible. Si el comando se detiene en las preguntas, añade el flag `--use-npm` (o `--use-pnpm`/`--use-yarn`) para omitir la pregunta del gestor de paquetes.

### Paso 2: Verificar la Estructura del Proyecto

```
my-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Layout raíz
│   │   ├── page.tsx          # Página de inicio
│   │   ├── globals.css       # Estilos globales
│   │   └── favicon.ico
│   └── lib/                  # Utilidades compartidas (crear manualmente)
├── public/                   # Recursos estáticos
├── next.config.ts            # Configuración de Next.js
├── tailwind.config.ts        # Configuración de Tailwind
├── tsconfig.json             # Configuración de TypeScript
├── package.json
└── .eslintrc.json
```

**Esperado:** Todos los directorios y archivos listados están presentes.

**En caso de fallo:** Si falta el directorio `src/`, no se pasó el flag `--src-dir`. Vuelve a ejecutar `create-next-app` con el flag, o mueve los archivos manualmente a `src/app/`.

### Paso 3: Configurar Next.js

Edita `next.config.ts` según las necesidades del proyecto:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilitar modo estricto de React
  reactStrictMode: true,

  // Dominios de optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
```

**Esperado:** `next.config.ts` guardado sin errores de TypeScript.

**En caso de fallo:** Si el archivo usa la extensión `.js` en lugar de `.ts`, renómbralo. Asegúrate de que el tipo `NextConfig` esté importado desde `"next"`.

### Paso 4: Configurar las Convenciones de Directorios

Crea los directorios comunes:

```bash
mkdir -p src/app/api
mkdir -p src/components
mkdir -p src/lib
mkdir -p src/types
```

**Esperado:** Los cuatro directorios creados bajo `src/`.

**En caso de fallo:** Si `src/` no existe, créalo primero o ajusta las rutas para que coincidan con la estructura del proyecto (el diseño sin src usa `app/` en la raíz).

### Paso 5: Crear el Layout Base

Edita `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Application",
  description: "Application description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

**Esperado:** El layout se renderiza con la fuente Inter y envuelve todas las páginas.

**En caso de fallo:** Si la fuente no carga, verifica el acceso a la red. Reemplaza `Inter` con una fuente del sistema como solución temporal.

### Paso 6: Añadir una Ruta de API de Ejemplo

Crea `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

**Esperado:** Archivo creado en `src/app/api/health/route.ts`.

**En caso de fallo:** Asegúrate de que el directorio `api/health/` existe. El archivo debe exportar manejadores HTTP con nombre (`GET`, `POST`, etc.), no una exportación predeterminada.

### Paso 7: Ejecutar el Servidor de Desarrollo

```bash
cd my-app
npm run dev
```

**Esperado:** Aplicación ejecutándose en http://localhost:3000.

**En caso de fallo:** Verifica la versión de Node.js (>= 18.17). Ejecuta `npm install` si faltan dependencias.

## Validación

- [ ] `npm run dev` arranca sin errores
- [ ] La página de inicio carga en localhost:3000
- [ ] La compilación de TypeScript es exitosa
- [ ] Las clases de Tailwind CSS se aplican
- [ ] La ruta de API responde en /api/health
- [ ] ESLint se ejecuta sin errores (`npm run lint`)

## Errores Comunes

- **Versión de Node.js**: Next.js requiere Node.js >= 18.17. Verifica con `node --version`.
- **Conflictos de puerto**: El puerto predeterminado 3000 puede estar en uso. Usa `npm run dev -- -p 3001`.
- **Confusión con el alias de importación**: `@/*` mapea a `src/*`. No lo confundas con las importaciones de node_modules.
- **Pages Router vs App Router**: Asegúrate de usar App Router (`src/app/`) no Pages Router (`src/pages/`).

## Habilidades Relacionadas

- `setup-tailwind-typescript` — configuración detallada de Tailwind y TypeScript
- `deploy-to-vercel` — desplegar la aplicación creada
- `configure-git-repository` — configuración de control de versiones
