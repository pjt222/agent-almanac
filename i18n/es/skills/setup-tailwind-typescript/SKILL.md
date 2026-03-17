---
name: setup-tailwind-typescript
description: >
  Configurar Tailwind CSS con TypeScript en un proyecto Next.js o React.
  Cubre la instalación, configuración, extensiones de tema personalizadas,
  patrones de componentes y utilidades de estilos con seguridad de tipos.
  Úsalo al añadir Tailwind CSS a un proyecto TypeScript existente, al
  personalizar el tema de Tailwind para el sistema de diseño de un proyecto,
  al configurar patrones de estilos de componentes con seguridad de tipos,
  o al configurar plugins y extensiones de Tailwind.
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
  tags: tailwind, typescript, css, styling, configuration
---

# Set Up Tailwind CSS with TypeScript

Configurar Tailwind CSS en un proyecto TypeScript con tema personalizado, utilidades y patrones con seguridad de tipos.

## Cuándo Usar

- Al añadir Tailwind CSS a un proyecto TypeScript existente
- Al personalizar el tema de Tailwind para el sistema de diseño de un proyecto
- Al configurar patrones de estilos de componentes con seguridad de tipos
- Al configurar plugins y extensiones de Tailwind

## Entradas

- **Requerido**: Proyecto TypeScript (Next.js, Vite o React independiente)
- **Opcional**: Tokens del sistema de diseño (colores, espaciado, fuentes)
- **Opcional**: Plugins de Tailwind a incluir

## Procedimiento

### Paso 1: Instalar Tailwind CSS

```bash
npm install -D tailwindcss @tailwindcss/postcss postcss
```

Para Next.js (si no está incluido ya):

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Esperado:** `tailwindcss`, `postcss` y `autoprefixer` instalados como dependencias de desarrollo. Para Next.js, `tailwind.config.ts` y `postcss.config.js` son generados por `npx tailwindcss init -p`.

**En caso de fallo:** Si `npx tailwindcss init` falla, instala Tailwind primero con `npm install -D tailwindcss` y vuelve a intentarlo. Si usas un monorepo, ejecuta el comando desde el directorio raíz de la aplicación, no desde la raíz del workspace.

### Paso 2: Configurar tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          900: "#1e3a5f",
        },
        secondary: {
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Esperado:** `tailwind.config.ts` tiene un array `content` que coincide con las ubicaciones de archivos del proyecto, colores y fuentes personalizados bajo `theme.extend`, y tipado TypeScript correcto con la importación de `Config`.

**En caso de fallo:** Si las clases personalizadas no se renderizan, verifica que las rutas de `content` coincidan con tu estructura de directorios real. Las rutas son patrones glob relativos a la raíz del proyecto. Las rutas faltantes significan que Tailwind no escaneará esos archivos para detectar el uso de clases.

### Paso 3: Configurar los Estilos Globales

Edita `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg
           hover:bg-primary-700 focus:outline-none focus:ring-2
           focus:ring-primary-500 focus:ring-offset-2
           transition-colors duration-200;
  }
}
```

**Esperado:** `globals.css` contiene las tres directivas de Tailwind (`@tailwind base`, `@tailwind components`, `@tailwind utilities`) más cualquier estilo personalizado de las capas base y de componentes. El archivo está importado en el layout raíz.

**En caso de fallo:** Si los estilos no se aplican, verifica que `globals.css` esté importado en `layout.tsx` (o `_app.tsx` para Pages Router). Comprueba que las directivas de Tailwind estén presentes y no estén comentadas.

### Paso 4: Crear Helpers de Utilidad con Seguridad de Tipos

Crea `src/lib/cn.ts`:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Instala las dependencias:

```bash
npm install clsx tailwind-merge
```

Uso en componentes:

```tsx
import { cn } from "@/lib/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
}

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        variant === "primary" && "bg-primary-600 text-white hover:bg-primary-700",
        variant === "secondary" && "bg-secondary-500 text-white hover:bg-secondary-600",
        variant === "outline" && "border border-gray-300 hover:bg-gray-50",
        className
      )}
      {...props}
    />
  );
}
```

**Esperado:** `src/lib/cn.ts` exporta una función `cn()`. `clsx` y `tailwind-merge` están instalados como dependencias. Los componentes usan `cn()` para combinar nombres de clases sin conflictos.

**En caso de fallo:** Si `clsx` o `tailwind-merge` no se encuentran, ejecuta `npm install clsx tailwind-merge`. Si TypeScript reporta errores de tipo en `cn.ts`, verifica que el tipo `ClassValue` esté importado desde `clsx`.

### Paso 5: Añadir Soporte para Modo Oscuro

Actualiza `tailwind.config.ts`:

```typescript
const config: Config = {
  darkMode: "class", // o "media" para la preferencia del sistema
  // ... resto de la configuración
};
```

Implementación del interruptor de tema:

```tsx
"use client";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)}>
      {dark ? "Light" : "Dark"} Mode
    </button>
  );
}
```

**Esperado:** El modo oscuro se activa correctamente entre temas claro y oscuro. La clase `dark` se aplica al elemento `<html>`, y las clases de utilidad con prefijo `dark:` responden de manera correspondiente.

**En caso de fallo:** Si el modo oscuro no se activa, verifica que `darkMode: "class"` esté configurado en `tailwind.config.ts`. Asegúrate de que la clase `dark` se alterna en el elemento `<html>` (no en `<body>`). Para el modo de preferencia del sistema, usa `darkMode: "media"` en su lugar.

### Paso 6: Añadir Plugins (Opcional)

```bash
npm install -D @tailwindcss/typography @tailwindcss/forms
```

```typescript
// tailwind.config.ts
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";

const config: Config = {
  // ...
  plugins: [typography, forms],
};
```

**Esperado:** Los plugins instalados como dependencias de desarrollo y registrados en el array `plugins` de `tailwind.config.ts`. Las clases proporcionadas por los plugins (p.ej., `prose` de typography, elementos de formulario estilizados de forms) están disponibles en los componentes.

**En caso de fallo:** Si las clases del plugin no se renderizan, verifica que el plugin esté instalado (`npm ls @tailwindcss/typography`) y añadido al array `plugins`. Reinicia el servidor de desarrollo después de cambios en la configuración.

## Validación

- [ ] Las clases de Tailwind se renderizan correctamente en el navegador
- [ ] Los valores de tema personalizados (colores, fuentes, espaciado) funcionan
- [ ] La utilidad `cn()` combina clases sin conflictos
- [ ] El modo oscuro se activa correctamente
- [ ] TypeScript no muestra errores en la configuración ni en los componentes
- [ ] La compilación de producción elimina los estilos no utilizados

## Errores Comunes

- **Rutas de contenido faltantes**: Si las clases no se renderizan, verifica que el array `content` de la configuración coincida con las ubicaciones de tus archivos
- **Conflictos de clases**: Usa `tailwind-merge` (a través de `cn()`) para prevenir clases de utilidad conflictivas
- **Valores personalizados que no funcionan**: Asegúrate de que los valores personalizados estén bajo `extend` (para añadir) y no en la raíz del tema (que reemplaza los valores predeterminados)
- **Modo oscuro sin activar**: Verifica la configuración de `darkMode` y que la clase `dark` esté en `<html>` y no en `<body>`

## Habilidades Relacionadas

- `scaffold-nextjs-app` — configuración del proyecto antes de la configuración de Tailwind
- `deploy-to-vercel` — desplegar la aplicación con estilos
