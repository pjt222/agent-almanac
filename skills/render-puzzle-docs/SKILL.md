---
name: render-puzzle-docs
description: >
  Render the jigsawR Quarto documentation site for GitHub Pages.
  Supports fresh renders (clearing cache), cached renders (faster),
  and single-page renders. Uses the bundled render script or direct
  quarto.exe invocation from WSL. Use when building the full site after
  content changes, rendering a single page during iterative editing,
  preparing documentation for a release or PR, or debugging render
  errors in Quarto .qmd files.
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

Render the jigsawR Quarto documentation site.

## When to Use

- Building the full documentation site after content changes
- Rendering a single page during iterative editing
- Preparing documentation for a release or PR
- Debugging render errors in Quarto .qmd files

## Inputs

- **Required**: Render mode (`fresh`, `cached`, or `single`)
- **Optional**: Specific .qmd file path (for single-page mode)
- **Optional**: Whether to open the result in a browser

## Procedure

### Step 1: Choose Render Mode

| Mode | Command | Duration | Use when |
|------|---------|----------|----------|
| Fresh | `bash inst/scripts/render_quarto.sh` | ~5-7 min | Content changed, cache stale |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 min | Minor edits, cache valid |
| Single | Direct quarto.exe | ~30s | Iterating on one page |

**Expected:** Render mode selected based on the current situation: fresh for content changes or stale cache, cached for minor edits, single for iterating on one page.

**On failure:** If unsure whether the cache is stale, default to fresh render. It takes longer but guarantees correct output.

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

**Expected:** Render completes without errors. Output in `quarto/_site/`.

**On failure:**
- Check for R code errors in .qmd chunks (look for `#| label:` markers)
- Verify pandoc is available via `RSTUDIO_PANDOC` env var
- Try clearing cache: `rm -rf quarto/_freeze quarto/_site`
- Check that all R packages used in .qmd files are installed

### Step 3: Verify Output

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

Confirm the site structure:
- `quarto/_site/index.html` exists
- Navigation links resolve correctly
- Images and SVG files render properly

**Expected:** `index.html` exists and is non-empty. Navigation links resolve, and images/SVGs render correctly in the browser.

**On failure:** If `index.html` is missing, the render likely failed silently. Re-run with verbose output and check for R code errors in `.qmd` chunks. If only some pages are missing, verify those `.qmd` files are listed in `_quarto.yml`.

### Step 4: Preview (Optional)

Open in Windows browser:

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

**Expected:** The documentation site opens in the Windows default browser for visual inspection.

**On failure:** If the `cmd.exe /c start` command fails from WSL, try `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"` instead. Alternatively, navigate to the file manually in the browser.

## Validation

- [ ] `quarto/_site/index.html` exists and is non-empty
- [ ] No render errors in console output
- [ ] All R code chunks executed successfully (check for error messages)
- [ ] Navigation between pages works
- [ ] All .qmd files have `#| label:` on code chunks for clean output

## Common Pitfalls

- **Stale freeze cache**: If R code changed, use fresh render to regenerate `_freeze` files
- **Missing R packages**: Quarto .qmd files may use packages not in renv; install them first
- **Pandoc not found**: Ensure `RSTUDIO_PANDOC` is set in `.Renviron`
- **Long render times**: Fresh render takes 5-7 minutes (14 pages with R execution); use cached mode during iteration
- **Code chunk labels**: All R code chunks should have `#| label:` for clean rendering

## Related Skills

- `generate-puzzle` — generate puzzle output referenced in documentation
- `run-puzzle-tests` — ensure code examples in docs are correct
- `create-quarto-report` — general Quarto document creation
