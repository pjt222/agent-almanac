---
name: deploy-to-vercel
description: >
  Desplegar una aplicación Next.js en Vercel. Cubre la vinculación del proyecto,
  variables de entorno, despliegues de vista previa, dominios personalizados y
  configuración del despliegue en producción. Úsalo al desplegar una aplicación
  Next.js por primera vez, al configurar despliegues de vista previa para pull
  requests, al configurar dominios personalizados, o al gestionar variables de
  entorno en un despliegue de Vercel en producción.
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
  tags: vercel, deployment, nextjs, hosting, ci-cd
---

# Deploy to Vercel

Desplegar una aplicación Next.js en Vercel con configuración de producción.

## Cuándo Usar

- Al desplegar una aplicación Next.js por primera vez
- Al configurar despliegues de vista previa para pull requests
- Al configurar dominios personalizados
- Al gestionar variables de entorno en producción

## Entradas

- **Requerido**: Aplicación Next.js que compila exitosamente en local
- **Requerido**: Repositorio de GitHub (recomendado) o proyecto local
- **Opcional**: Dominio personalizado
- **Opcional**: Variables de entorno para producción

## Procedimiento

### Paso 1: Verificar la Compilación Local

```bash
npm run build
```

**Esperado:** La compilación tiene éxito sin errores.

**En caso de fallo:** Corrige los errores de compilación antes de desplegar. Problemas comunes: errores de TypeScript, dependencias faltantes, importaciones inválidas.

### Paso 2: Instalar la CLI de Vercel

```bash
npm install -g vercel
```

**Esperado:** El comando `vercel` está disponible globalmente y `vercel --version` imprime la versión instalada.

**En caso de fallo:** Si ocurren errores de permisos, usa `sudo npm install -g vercel` o configura npm para usar un prefijo local al usuario. Verifica que Node.js esté instalado con `node --version`.

### Paso 3: Vincular y Desplegar

```bash
# Iniciar sesión en Vercel
vercel login

# Desplegar (la primera vez: crea el proyecto)
vercel

# Sigue las indicaciones:
# - Set up and deploy? Y
# - Which scope? (selecciona tu cuenta)
# - Link to existing project? N (para proyectos nuevos)
# - Project name: my-app
# - Directory: ./
# - Override settings? N
```

**Esperado:** URL de vista previa proporcionada (p.ej., `https://my-app-xxx.vercel.app`).

**En caso de fallo:** Si `vercel login` falla, verifica la conectividad a internet e intenta la autenticación por navegador. Si el despliegue falla, revisa la salida de la compilación — Vercel usa un entorno limpio, por lo que todas las dependencias deben estar en `package.json`.

### Paso 4: Configurar Variables de Entorno

```bash
# Añadir variables de entorno
vercel env add DATABASE_URL production
vercel env add API_KEY production preview

# Listar variables de entorno
vercel env ls
```

O configura a través del panel de Vercel: Project Settings > Environment Variables.

**Esperado:** `vercel env ls` muestra todas las variables de entorno requeridas configuradas para los entornos correctos (production, preview, development).

**En caso de fallo:** Si las variables no aparecen en tiempo de ejecución, verifica que el entorno objetivo coincida (production vs preview). Vuelve a desplegar después de añadir variables — los despliegues existentes no recogen nuevas variables automáticamente.

### Paso 5: Desplegar a Producción

```bash
vercel --prod
```

**Esperado:** URL de producción disponible (p.ej., `https://my-app.vercel.app`).

**En caso de fallo:** Revisa los registros de despliegue con `vercel logs` o en el panel de Vercel. Los problemas comunes incluyen variables de entorno faltantes en el entorno de producción y comandos de compilación que difieren del entorno local.

### Paso 6: Conectar GitHub para Auto-Despliegue (Recomendado)

1. Ve a https://vercel.com/new
2. Importa tu repositorio de GitHub
3. Vercel despliega automáticamente en:
   - Push a main → Despliegue de producción
   - Pull request → Despliegue de vista previa

**Esperado:** El panel de Vercel muestra el repositorio de GitHub conectado, y los pushes posteriores a main activan despliegues de producción automáticamente.

**En caso de fallo:** Si el repositorio no aparece en la lista de importación, verifica que la aplicación GitHub de Vercel tenga acceso al repositorio. Ve a GitHub Settings > Applications > Vercel y concede acceso.

### Paso 7: Configurar Dominio Personalizado

```bash
vercel domains add my-domain.com
```

O a través del panel: Project Settings > Domains.

Actualiza los registros DNS según las instrucciones de Vercel (típicamente registro CNAME o A).

**Esperado:** `vercel domains ls` muestra el dominio personalizado como configurado, y después de la propagación del DNS (hasta 48 horas), el dominio resuelve al despliegue de Vercel.

**En caso de fallo:** Si el dominio muestra "Invalid Configuration", verifica que los registros DNS coincidan exactamente con las instrucciones de Vercel. Usa `dig my-domain.com` o un verificador de DNS en línea para confirmar la propagación.

### Paso 8: Optimizar la Configuración

Crea `vercel.json` para configuración avanzada:

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

**Esperado:** `vercel.json` guardado en la raíz del proyecto y el siguiente despliegue recoge la configuración (visible en los registros de compilación del panel de Vercel).

**En caso de fallo:** Si la configuración es ignorada, verifica que `vercel.json` sea JSON válido con `jq . vercel.json`. Consulta la documentación de Vercel para tu versión del framework, ya que algunas configuraciones pueden haberse movido a `next.config.ts`.

## Validación

- [ ] `npm run build` tiene éxito en local
- [ ] El despliegue de vista previa funciona y es accesible
- [ ] El despliegue de producción sirve la aplicación correctamente
- [ ] Las variables de entorno están disponibles en producción
- [ ] El dominio personalizado resuelve (si está configurado)
- [ ] La integración con GitHub activa despliegues al hacer push

## Errores Comunes

- **Compilación que falla en Vercel pero no en local**: Vercel usa un entorno limpio. Asegúrate de que todas las dependencias estén en `package.json`, no solo instaladas globalmente.
- **Variables de entorno faltantes**: Las variables deben añadirse a Vercel, no solo a `.env.local`. Los distintos entornos (production, preview, development) tienen conjuntos de variables separados.
- **Incompatibilidad de versión de Node.js**: Configura la versión de Node.js en Project Settings o en el campo `engines` de `package.json`.
- **Despliegues grandes**: Vercel tiene límites de tamaño. Usa `.vercelignore` para excluir archivos innecesarios.
- **Tiempos de espera de rutas de API**: Las funciones serverless de Vercel tienen un tiempo de espera de 10s en el plan Hobby. Optimiza o actualiza el plan.

## Habilidades Relacionadas

- `scaffold-nextjs-app` — crear la aplicación a desplegar
- `setup-tailwind-typescript` — configurar estilos antes del despliegue
- `configure-git-repository` — configuración de Git para integración de auto-despliegue
