---
name: render-puzzle-docs
description: >
  Renderizar el sitio de documentacion Quarto de jigsawR para GitHub Pages.
  Soporta renderizados frescos (limpiando cache), renderizados en cache
  (mas rapidos) y renderizados de pagina unica. Usa el script de renderizado
  incluido o la invocacion directa de quarto.exe desde WSL. Usar al construir
  el sitio completo despues de cambios de contenido, renderizar una sola
  pagina durante edicion iterativa, preparar documentacion para un release
  o PR, o depurar errores de renderizado en archivos Quarto .qmd.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, quarto, documentation, github-pages, rendering
  locale: es
  source_locale: en
  source_commit: 6f65f316
  translator: claude-sonnet-4-6
  translation_date: 2026-03-16
---

# Renderizar Documentacion de Rompecabezas

Renderizar el sitio de documentacion Quarto de jigsawR.

## Cuando Usar

- Construir el sitio de documentacion completo despues de cambios de contenido
- Renderizar una sola pagina durante edicion iterativa
- Preparar documentacion para un release o PR
- Depurar errores de renderizado en archivos Quarto .qmd

## Entradas

- **Requerido**: Modo de renderizado (`fresh`, `cached` o `single`)
- **Opcional**: Ruta especifica del archivo .qmd (para modo de pagina unica)
- **Opcional**: Si abrir el resultado en un navegador

## Procedimiento

### Paso 1: Elegir Modo de Renderizado

| Modo | Comando | Duracion | Usar cuando |
|------|---------|----------|-------------|
| Fresh | `bash inst/scripts/render_quarto.sh` | ~5-7 min | Contenido cambio, cache obsoleto |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 min | Ediciones menores, cache valido |
| Single | quarto.exe directo | ~30s | Iterando en una pagina |

**Esperado:** Modo de renderizado seleccionado segun la situacion actual: fresh para cambios de contenido o cache obsoleto, cached para ediciones menores, single para iterar en una pagina.

**En caso de fallo:** Si no esta seguro de si el cache esta obsoleto, usar renderizado fresh por defecto. Toma mas tiempo pero garantiza salida correcta.

### Paso 2: Ejecutar Renderizado

**Renderizado fresh** (limpia `_freeze` y `_site`, re-ejecuta todo el codigo R):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Renderizado cached** (usa archivos `_freeze` existentes):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**Pagina unica** (renderizar un archivo .qmd directamente):

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

**Esperado:** El renderizado se completa sin errores. Salida en `quarto/_site/`.

**En caso de fallo:**
- Verificar errores de codigo R en chunks .qmd (buscar marcadores `#| label:`)
- Verificar que pandoc esta disponible via la variable de entorno `RSTUDIO_PANDOC`
- Intentar limpiar cache: `rm -rf quarto/_freeze quarto/_site`
- Verificar que todos los paquetes R usados en archivos .qmd estan instalados

### Paso 3: Verificar Salida

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

Confirmar la estructura del sitio:
- `quarto/_site/index.html` existe
- Los enlaces de navegacion se resuelven correctamente
- Las imagenes y archivos SVG se renderizan correctamente

**Esperado:** `index.html` existe y no esta vacio. Los enlaces de navegacion se resuelven y las imagenes/SVGs se renderizan correctamente en el navegador.

**En caso de fallo:** Si `index.html` falta, el renderizado probablemente fallo silenciosamente. Re-ejecutar con salida detallada y verificar errores de codigo R en chunks `.qmd`. Si solo faltan algunas paginas, verificar que esos archivos `.qmd` estan listados en `_quarto.yml`.

### Paso 4: Vista Previa (Opcional)

Abrir en el navegador de Windows:

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**Esperado:** El sitio de documentacion se abre en el navegador predeterminado de Windows para inspeccion visual.

**En caso de fallo:** Si el comando `cmd.exe /c start` falla desde WSL, intentar `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"` en su lugar. Alternativamente, navegar al archivo manualmente en el navegador.

## Validacion

- [ ] `quarto/_site/index.html` existe y no esta vacio
- [ ] Sin errores de renderizado en la salida de consola
- [ ] Todos los chunks de codigo R se ejecutaron exitosamente (verificar mensajes de error)
- [ ] La navegacion entre paginas funciona
- [ ] Todos los archivos .qmd tienen `#| label:` en los chunks de codigo para salida limpia

## Errores Comunes

- **Cache freeze obsoleto**: Si el codigo R cambio, usar renderizado fresh para regenerar archivos `_freeze`
- **Paquetes R faltantes**: Los archivos Quarto .qmd pueden usar paquetes que no estan en renv; instalarlos primero
- **Pandoc no encontrado**: Asegurar que `RSTUDIO_PANDOC` esta configurado en `.Renviron`
- **Tiempos de renderizado largos**: El renderizado fresh toma 5-7 minutos (14 paginas con ejecucion R); usar modo cached durante la iteracion
- **Etiquetas de chunks de codigo**: Todos los chunks de codigo R deben tener `#| label:` para renderizado limpio

## Habilidades Relacionadas

- `generate-puzzle` -- generar salida de rompecabezas referenciada en la documentacion
- `run-puzzle-tests` -- asegurar que los ejemplos de codigo en la documentacion son correctos
- `create-quarto-report` -- creacion general de documentos Quarto
