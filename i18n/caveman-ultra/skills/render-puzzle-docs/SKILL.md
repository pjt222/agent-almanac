---
name: render-puzzle-docs
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-04-26"
description: >
  Render jigsawR Quarto docs site for GH Pages. Supports fresh (clear cache),
  cached (faster), single-page renders. Uses bundled script or direct
  quarto.exe from WSL. Use → build full site after changes, render single
  page during iter, prep for release/PR, debug render errs in .qmd.
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

Render jigsawR Quarto docs site.

## Use When

- Build full docs site after content changes
- Render single page during iter editing
- Prep docs for release or PR
- Debug render errs in .qmd files

## In

- **Required**: Render mode (`fresh`, `cached`, `single`)
- **Optional**: Specific .qmd path (single-page mode)
- **Optional**: Open result in browser?

## Do

### Step 1: Choose Mode

| Mode | Command | Duration | Use when |
|------|---------|----------|----------|
| Fresh | `bash inst/scripts/render_quarto.sh` | ~5-7 min | Content changed, cache stale |
| Cached | `bash inst/scripts/render_quarto.sh --cached` | ~1-2 min | Minor edits, cache valid |
| Single | Direct quarto.exe | ~30s | Iterating on one page |

→ Mode selected by situation: fresh for content changes/stale cache, cached for minor edits, single for iter on one page.

If err: unsure if cache stale → default fresh. Longer but guarantees correct.

### Step 2: Execute

**Fresh** (clears `_freeze` + `_site`, re-exec all R):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh
```

**Cached** (uses existing `_freeze`):

```bash
cd /mnt/d/dev/p/jigsawR && bash inst/scripts/render_quarto.sh --cached
```

**Single page** (one .qmd direct):

```bash
QUARTO_EXE="/mnt/c/Program Files/RStudio/resources/app/bin/quarto/bin/quarto.exe"
"$QUARTO_EXE" render quarto/getting-started.qmd
```

→ Render completes w/o errs. Output in `quarto/_site/`.

If err:
- Check R code errs in .qmd chunks (look for `#| label:` markers)
- Verify pandoc available via `RSTUDIO_PANDOC` env var
- Try clear cache: `rm -rf quarto/_freeze quarto/_site`
- Check all R pkgs used in .qmd installed

### Step 3: Verify

```bash
ls -la /mnt/d/dev/p/jigsawR/quarto/_site/index.html
```

Confirm structure:
- `quarto/_site/index.html` exists
- Nav links resolve correctly
- Images + SVG files render properly

→ `index.html` exists + non-empty. Nav links resolve, images/SVGs render in browser.

If err: `index.html` missing → render failed silent. Re-run verbose + check R err in `.qmd` chunks. Only some pages missing → verify those `.qmd` listed in `_quarto.yml`.

### Step 4: Preview (Optional)

Open in Windows browser:

```bash
cmd.exe /c start "" "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"
```

→ Site opens in default browser for inspection.

If err: `cmd.exe /c start` fails from WSL → try `explorer.exe "D:\\dev\\p\\jigsawR\\quarto\\_site\\index.html"`. Or navigate manual in browser.

## Check

- [ ] `quarto/_site/index.html` exists + non-empty
- [ ] No render errs in console
- [ ] All R chunks exec OK (no err msgs)
- [ ] Nav between pages works
- [ ] All .qmd have `#| label:` on chunks for clean output

## Traps

- **Stale freeze cache**: R code changed → fresh render to regen `_freeze`
- **Missing R pkgs**: .qmd may use pkgs not in renv → install first
- **Pandoc not found**: Ensure `RSTUDIO_PANDOC` set in `.Renviron`
- **Long renders**: Fresh = 5-7 min (14 pages w/ R exec) → cached during iter
- **Code chunk labels**: All R chunks should have `#| label:` for clean render

## →

- `generate-puzzle` — generate puzzle output ref'd in docs
- `run-puzzle-tests` — ensure code examples correct
- `create-quarto-report` — general Quarto doc creation
