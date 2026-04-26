---
name: render-puzzle-docs
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Render jigsawR Quarto documentation site for GitHub Pages. Supports
  fresh renders (clearing cache), cached renders (faster), single-page
  renders. Uses bundled render script or direct quarto.exe invocation
  from WSL. Use when build full site after content changes, render
  single page during iterative editing, prepare documentation for
  release or PR, or debug render errors in Quarto .qmd files.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: jigsawr
  complexity: basic
  language: R
  tags: jigsawr, quarto, documentation, github-pages, rendering
---

# Render Puzzle Docs

Render jigsawR Quarto documentation site.

## When Use

- Build full documentation site after content changes
- Render single page during iterative editing
- Prepare documentation for release or PR
- Debug render errors in Quarto .qmd files

## Inputs

- **Required**: Render mode (`fresh`, `cached`, or `single`)
- **Optional**: Specific .qmd file path (for single-page mode)
- **Optional**: Whether to open result in browser

## Steps

### Step 1: Choose Render Mode

| Mode | Command | Duration | Use when |
|------|---------|----------|----------|
| Fresh | `bash inst/scripts/render_quarto.sh` | ~5-7 min | Content changed, cache stale |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 min | Minor edits, cache valid |
| Single | Direct quarto.exe | ~30s | Iterating on one page |

**Got:** Render mode selected based on current situation: fresh for content changes or stale cache, cached for minor edits, single for iterating on one page.

**If fail:** Unsure whether cache is stale? Default to fresh render. Takes longer but guarantees correct output.

### Step 2: Execute Render

**Fresh render** (clears `_freeze` and `_site`, re-executes all R code):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Cached render** (uses existing `_freeze` files):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**Single page** (render one .qmd file directly):

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

**Got:** Render completes without errors. Output in `quarto/_site/`.

**If fail:**
- Check for R code errors in .qmd chunks (look for `#| label:` markers)
- Verify pandoc available via `RSTUDIO_PANDOC` env var
- Try clear cache: `rm -rf quarto/_freeze quarto/_site`
- Check that all R packages used in .qmd files are installed

### Step 3: Verify Output

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

Confirm site structure:
- `quarto/_site/index.html` exists
- Navigation links resolve correctly
- Images and SVG files render properly

**Got:** `index.html` exists and non-empty. Navigation links resolve. Images/SVGs render correctly in browser.

**If fail:** `index.html` missing? Render likely failed silently. Re-run with verbose output. Check for R code errors in `.qmd` chunks. Only some pages missing? Verify those `.qmd` files listed in `_quarto.yml`.

### Step 4: Preview (Optional)

Open in Windows browser:

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**Got:** Documentation site opens in Windows default browser for visual inspection.

**If fail:** `cmd.exe /c start` command fails from WSL? Try `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"` instead. Or navigate to file manually in browser.

## Checks

- [ ] `quarto/_site/index.html` exists and non-empty
- [ ] No render errors in console output
- [ ] All R code chunks executed successfully (check for error messages)
- [ ] Navigation between pages works
- [ ] All .qmd files have `#| label:` on code chunks for clean output

## Pitfalls

- **Stale freeze cache**: R code changed? Use fresh render to regenerate `_freeze` files
- **Missing R packages**: Quarto .qmd files may use packages not in renv; install them first
- **Pandoc not found**: Ensure `RSTUDIO_PANDOC` set in `.Renviron`
- **Long render times**: Fresh render takes 5-7 minutes (14 pages with R execution); use cached mode during iteration
- **Code chunk labels**: All R code chunks should have `#| label:` for clean rendering

## See Also

- `generate-puzzle` — generate puzzle output referenced in documentation
- `run-puzzle-tests` — ensure code examples in docs are correct
- `create-quarto-report` — general Quarto document creation
