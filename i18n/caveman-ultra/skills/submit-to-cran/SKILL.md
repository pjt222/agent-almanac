---
name: submit-to-cran
locale: caveman-ultra
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Complete proc → submit R pkg to CRAN. Pre-sub checks (local, win-builder,
  R-hub), cran-comments.md prep, URL + spell checks, sub itself. Covers
  first sub + updates. Use → pkg ready for initial CRAN release, sub
  updated ver of existing CRAN pkg, re-sub after CRAN reviewer feedback.
license: MIT
allowed-tools: Read Write Edit Bash Grep Glob
metadata:
  author: Philipp Thoss
  version: "1.0"
  domain: r-packages
  complexity: advanced
  language: R
  tags: r, cran, submission, release, publishing
---

# Submit to CRAN

Full CRAN sub workflow: pre-flight checks → submission.

## Use When

- Pkg ready for initial CRAN release
- Sub updated ver of existing CRAN pkg
- Re-sub after CRAN reviewer feedback

## In

- **Required**: R pkg passing local `R CMD check` w/ 0 err + 0 warn
- **Required**: Updated ver # in DESCRIPTION
- **Required**: Updated NEWS.md w/ ver changes
- **Optional**: Prev CRAN reviewer comments (re-subs)

## Do

### Step 1: Ver + NEWS Check

Verify DESCRIPTION ver:

```r
desc::desc_get_version()
```

Verify NEWS.md has entry. Summarize user-facing changes.

**Got:** Ver follows semver. NEWS.md has matching entry.

**If err:** Update ver `usethis::use_version()` (major/minor/patch). Add NEWS.md entry.

### Step 2: Local R CMD Check

```r
devtools::check()
```

**Got:** 0 err, 0 warn, 0 notes (1 note OK new sub: "New submission").

**If err:** Fix all err+warn before. Read log `<pkg>.Rcheck/00check.log`. Notes → explain in cran-comments.md.

### Step 3: Spell Check

```r
devtools::spell_check()
```

Add legit words → `inst/WORDLIST` (one per line, sorted).

**Got:** No unexpected misspellings. All flagged corrected | added.

**If err:** Fix genuine misspellings. Tech terms → `inst/WORDLIST` sorted.

### Step 4: URL Check

```r
urlchecker::url_check()
```

**Got:** All URLs HTTP 200. No broken/redirected.

**If err:** Replace broken. `\doi{}` for DOI links not raw URLs. Remove dead links.

### Step 5: Win-Builder

```r
devtools::check_win_devel()
devtools::check_win_release()
```

Wait email (~15-30 min).

**Got:** 0 err + 0 warn on both release + devel. Email in 15-30 min.

**If err:** Address platform-specific. Common: diff compiler warns, missing sys deps, path sep diffs. Fix local + re-sub.

### Step 6: R-hub Check

```r
rhub::rhub_check()
```

Multi-platform (Ubuntu, Windows, macOS).

**Got:** All platforms pass 0 err + 0 warn.

**If err:** Specific platform fails → check R-hub log. Use `testthat::skip_on_os()` | conditional code for platform-dep behavior.

### Step 7: Prep cran-comments.md

Create | update in pkg root:

```markdown
## R CMD check results
0 errors | 0 warnings | 1 note

* This is a new release.

## Test environments
* local: Windows 11, R 4.5.0
* win-builder: R-release, R-devel
* R-hub: ubuntu-latest (R-release), windows-latest (R-release), macos-latest (R-release)

## Downstream dependencies
There are currently no downstream dependencies for this package.
```

Updates → include:
- What changed (brief)
- Response to prev reviewer feedback
- Reverse dep check results if applicable

**Got:** Accurate summary across all envs, explains notes.

**If err:** Results differ across platforms → doc all variations. CRAN reviewers check vs own tests.

### Step 8: Final Pre-flight

```r
# One last check
devtools::check()

# Verify the built tarball
devtools::build()
```

**Got:** Final check passes clean. `.tar.gz` built in parent dir.

**If err:** Last-min issue → fix + re-run all from Step 2. Don't sub w/ known fails.

### Step 9: Submit

```r
devtools::release()
```

Interactive checks + sub. Answer honest.

Alt: manual at https://cran.r-project.org/submit.html, upload tarball.

**Got:** Confirmation email from CRAN in min. Click link → finalize.

**If err:** Check email for rejection reasons. Common: examples too slow, missing `\value` tags, non-portable code. Fix + re-sub, note in cran-comments.md what changed.

### Step 10: Post-Submission

Post-acceptance:

```r
# Tag the release
usethis::use_github_release()

# Bump to development version
usethis::use_dev_version()
```

**Got:** GitHub release created w/ accepted ver tag. DESCRIPTION bumped to dev (`x.y.z.9000`).

**If err:** GH release fails → manual `gh release create`. CRAN acceptance delayed → wait email before tag.

## Check

- [ ] `R CMD check` 0 err + 0 warn local
- [ ] Win-builder passes (release + devel)
- [ ] R-hub passes all platforms
- [ ] `cran-comments.md` accurate
- [ ] All URLs valid
- [ ] No spelling errors
- [ ] Ver # correct + incremented
- [ ] NEWS.md current
- [ ] DESCRIPTION metadata complete + accurate

## Traps

- **Examples too slow**: Wrap expensive in `\donttest{}`. CRAN enforces time limits.
- **Non-std file/dir names**: Avoid files triggering CRAN notes (check `.Rbuildignore`)
- **Missing `\value` in docs**: All exported fns need `@return` tag
- **Vignette build fails**: Vignettes must build in clean env w/o your `.Renviron`
- **DESCRIPTION Title**: Title Case, no period at end, no "A Package for..."
- **Forget rev dep checks**: Updates → run `revdepcheck::revdep_check()`

## Examples

```r
# Full pre-submission workflow
devtools::spell_check()
urlchecker::url_check()
devtools::check()
devtools::check_win_devel()
rhub::rhub_check()
# Wait for results...
devtools::release()
```

## →

- `release-package-version` — ver bumping + git tagging
- `write-roxygen-docs` — docs meet CRAN standards
- `setup-github-actions-ci` — CI mirroring CRAN expectations
- `build-pkgdown-site` — docs site for accepted pkgs
