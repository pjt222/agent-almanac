---
name: setup-tailwind-typescript
description: >
  Tailwind CSS und TypeScript in einem bestehenden Next.js- oder
  Node.js-Projekt konfigurieren. Behandelt Installation, PostCSS-Setup,
  TypeScript-Strenge-Einstellungen, Pfad-Aliase und IDE-Integration.
  Verwenden, wenn Tailwind/TypeScript zu einem vorhandenen Projekt
  hinzugefügt werden soll oder wenn die Konfiguration nach einem
  Framework-Upgrade neu eingerichtet werden muss.
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
  complexity: basic
  language: TypeScript
  tags: tailwind, typescript, nextjs, postcss, configuration
---

# Tailwind CSS + TypeScript einrichten

Tailwind CSS und TypeScript in einem bestehenden Webprojekt konfigurieren, mit korrektem PostCSS-Setup und IDE-Integration.

## Wann verwenden

- Tailwind CSS zu einem vorhandenen Next.js- oder React-Projekt hinzufügen
- TypeScript-Konfiguration in einem bestehenden JavaScript-Projekt einrichten
- Beides nach einem Framework-Upgrade neu konfigurieren
- Pfad-Aliase und IDE-Unterstützung für ein Projekt einrichten

## Eingaben

- **Erforderlich**: Vorhandenes Node.js-Projekt mit `package.json`
- **Optional**: Framework (Next.js, Vite, Create React App — beeinflusst Konfigurationsdetails)
- **Optional**: TypeScript-Strenge-Level (strict, empfohlen, minimal)
- **Optional**: Ob Pfad-Aliase eingerichtet werden sollen (Standard: ja)

## Vorgehensweise

### Schritt 1: Tailwind CSS installieren

Tailwind und seine Peer-Dependencies installieren.

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Dies erstellt:
- `tailwind.config.js` (oder `.ts` für TypeScript-Projekte)
- `postcss.config.js`

Für TypeScript-Projekte den Konfigurationstyp aktualisieren:

```bash
# tailwind.config.js in tailwind.config.ts umbenennen
mv tailwind.config.js tailwind.config.ts
```

**Erwartet:** `tailwind.config.ts` und `postcss.config.js` in Projektroot erstellt.

**Bei Fehler:** Wenn `npx tailwindcss` fehlschlägt, mit `npm install -D tailwindcss@latest` die neueste Version sicherstellen.

### Schritt 2: Tailwind konfigurieren

`tailwind.config.ts` bearbeiten, um alle Template-Dateien einzuschließen.

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Eigene Design-Tokens hier hinzufügen
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}

export default config
```

**Erwartet:** `content`-Array enthält alle Quell-Dateipfade. TypeScript erkennt Konfigurationstypen ohne Fehler.

**Bei Fehler:** Wenn Klassen nicht angewendet werden, überprüfen, dass `content`-Pfade mit der tatsächlichen Dateistruktur übereinstimmen. `npx tailwindcss --content './src/**/*.tsx' --output /dev/null` zum Testen verwenden.

### Schritt 3: Tailwind-Direktiven zu CSS hinzufügen

Die Tailwind-Schicht-Direktiven in die globale CSS-Datei einfügen.

```css
/* src/app/globals.css oder src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Eigene Basis-Styles darunter */
@layer base {
  h1 {
    @apply text-2xl font-bold;
  }
}

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
  }
}
```

**Erwartet:** CSS-Datei hat alle drei `@tailwind`-Direktiven. Benutzerdefinierte Layer-Definitionen kompilieren ohne Fehler.

**Bei Fehler:** Wenn `@tailwind`-Direktiven nicht erkannt werden, sicherstellen, dass PostCSS korrekt konfiguriert ist und `tailwindcss` im `plugins`-Array in `postcss.config.js` steht.

### Schritt 4: TypeScript konfigurieren

`tsconfig.json` mit geeigneten Strenge-Einstellungen und Pfad-Aliasen einrichten.

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Erwartet:** `tsconfig.json` wird von TypeScript ohne Fehler geladen. Pfad-Aliase lösen korrekt auf.

**Bei Fehler:** Wenn `moduleResolution: "bundler"` Fehler verursacht (benötigt TypeScript 5.0+), auf `"node16"` oder `"node"` zurückfallen.

### Schritt 5: VS Code-Integration einrichten

`.vscode/settings.json` für Tailwind CSS IntelliSense und TypeScript-Unterstützung konfigurieren.

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

Empfohlene VS Code-Erweiterungen (`.vscode/extensions.json`):

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

**Erwartet:** Tailwind IntelliSense zeigt Klassen-Vervollständigung in TypeScript-Dateien. TypeScript-Fehler erscheinen inline.

**Bei Fehler:** Wenn IntelliSense fehlt, sicherstellen, dass die Tailwind CSS IntelliSense-Erweiterung installiert ist und `tailwindCSS.experimental.classRegex` korrekt konfiguriert ist.

### Schritt 6: Konfiguration verifizieren

Prüfen, ob Tailwind und TypeScript korrekt zusammenarbeiten.

```bash
# TypeScript-Kompilierung ohne Ausgabe prüfen
npx tsc --noEmit

# CSS auf Tailwind-Klassen testen
echo '<div class="bg-blue-500 text-white p-4">Test</div>' > /tmp/test.html
npx tailwindcss -i ./src/app/globals.css -o /tmp/output.css --content '/tmp/test.html'
grep "bg-blue-500" /tmp/output.css
```

**Erwartet:** `tsc --noEmit` meldet 0 Fehler. Tailwind-Output-CSS enthält `bg-blue-500`-Klasse.

**Bei Fehler:** TypeScript-Fehler identifizieren, indem `tsc --noEmit 2>&1 | head -20` ausgeführt wird. Wenn Tailwind-Klassen fehlen, Pfade im `content`-Array von `tailwind.config.ts` überprüfen.

## Validierung

- [ ] `tailwind.config.ts` mit korrekten `content`-Pfaden vorhanden
- [ ] `postcss.config.js` mit Tailwind CSS-Plugin vorhanden
- [ ] Globale CSS-Datei hat alle drei `@tailwind`-Direktiven
- [ ] `tsconfig.json` mit `strict: true` und Pfad-Aliasen konfiguriert
- [ ] `tsc --noEmit` meldet keine Fehler
- [ ] Tailwind-Klassen erscheinen in kompiliertem CSS
- [ ] VS Code IntelliSense funktioniert für Tailwind-Klassen

## Haeufige Stolperfallen

- **Fehlende `content`-Pfade**: Wenn Tailwind-Klassen nicht in der Ausgabe erscheinen, liegt es fast immer daran, dass die Dateipfade nicht mit dem `content`-Array übereinstimmen. Alle Dateiextensionen und Verzeichnisse explizit auflisten.
- **PostCSS-Reihenfolge**: In `postcss.config.js` muss `tailwindcss` vor `autoprefixer` erscheinen.
- **TypeScript `paths` ohne baseUrl**: Bei Verwendung von `paths` entweder `baseUrl` setzen oder sicherstellen, dass das Bundler-Modul-Auflösung unterstützt.
- **`@tailwind`-Direktiven vs Imports**: `@import 'tailwindcss/...'` funktioniert auch, aber `@tailwind base/components/utilities` ist idiomatischer in Tailwind v3.
- **Klassen-Übersteuerung in `@layer`**: Benutzerdefinierte Klassen im `@layer components` können von Utilities mit demselben Namen nicht überschrieben werden — Utility-Klassen haben immer höhere Spezifität.
- **TypeScript `strict` nach der Einführung**: Das nachträgliche Aktivieren von `strict: true` erzeugt oft Hunderte von Fehlern. Schrittweise mit `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess` usw. aktivieren.

## Verwandte Skills

- `scaffold-nextjs-app` — neues Next.js-Projekt mit Tailwind + TypeScript erstellen
- `deploy-to-vercel` — Tailwind + TypeScript-App auf Vercel deployen
