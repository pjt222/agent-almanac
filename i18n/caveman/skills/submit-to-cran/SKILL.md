---
name: submit-to-cran
locale: caveman
source_locale: en
source_commit: 82c77053
translator: "Julius Brussee homage — caveman"
translation_date: "2026-05-03"
description: >
  Complete procedure for submitting an R package to CRAN, including
  pre-submission checks (local, win-builder, R-hub), cran-comments.md
  preparation, URL and spell checking, and the submission itself.
  Covers first submissions and updates. Use when a package is ready for
  initial CRAN release, when submitting an updated version of an existing
  CRAN package, or when re-submitting after receiving CRAN reviewer feedback.
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

Execute full CRAN submission workflow from pre-flight checks through submission.

## When Use

- Package ready for initial CRAN release
- Submitting updated version of existing CRAN package
- Re-submitting after CRAN reviewer feedback

## Inputs

- **Required**: R package passing local `R CMD check` with 0 errors and 0 warnings
- **Required**: Updated version number in DESCRIPTION
- **Required**: Updated NEWS.md with changes for this version
- **Optional**: Previous CRAN reviewer comments (for re-submissions)

## Steps

### Step 1: Version and NEWS Check

Verify DESCRIPTION has correct version:

```r
desc::desc_get_version()
```

Verify NEWS.md has entry for this version. Entry should summarize user-facing changes.

**Got:** Version follows semantic versioning. NEWS.md has matching entry for this version.

**If fail:** Update version with `usethis::use_version()` (choose "major", "minor", or "patch"). Add NEWS.md entry summarizing user-facing changes.

### Step 2: Local R CMD Check

```r
devtools::check()
```

**Got:** 0 errors, 0 warnings, 0 notes (1 note acceptable for new submissions: "New submission").

**If fail:** Fix all errors and warnings before proceeding. Read check log at `<pkg>.Rcheck/00check.log` for details. Notes should be explained in cran-comments.md.

### Step 3: Spell Check

```r
devtools::spell_check()
```

Add legitimate words to `inst/WORDLIST` (one word per line, sorted alphabetical).

**Got:** No unexpected misspellings. All flagged words either corrected or added to `inst/WORDLIST`.

**If fail:** Fix genuine misspellings. Legitimate technical terms? Add to `inst/WORDLIST` (one word per line, alphabetical sorted).

### Step 4: URL Check

```r
urlchecker::url_check()
```

**Got:** All URLs return HTTP 200. No broken or redirected links.

**If fail:** Replace broken URLs. Use `\doi{}` for DOI links instead of raw URLs. Remove links to resources no longer exist.

### Step 5: Win-Builder Checks

```r
devtools::check_win_devel()
devtools::check_win_release()
```

Wait for email results (usual 15-30 minutes).

**Got:** 0 errors, 0 warnings on both Win-builder release and devel. Results arrive by email within 15-30 minutes.

**If fail:** Address platform-specific issues. Common causes: different compiler warnings, missing system dependencies, path separator differences. Fix local, re-submit to Win-builder.

### Step 6: R-hub Check

```r
rhub::rhub_check()
```

Checks on multiple platforms (Ubuntu, Windows, macOS).

**Got:** All platforms pass with 0 errors and 0 warnings.

**If fail:** Specific platform fails? Check R-hub build log for platform-specific errors. Use `testthat::skip_on_os()` or conditional code for platform-dependent behavior.

### Step 7: Prepare cran-comments.md

Create or update `cran-comments.md` in package root:

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

Updates? Include:
- What changed (brief)
- Response to any previous reviewer feedback
- Reverse dependency check results if applicable

**Got:** `cran-comments.md` accurately summarizes check results across all test environments and explains any notes.

**If fail:** Check results differ across platforms? Document all variations. CRAN reviewers will check these claims against own tests.

### Step 8: Final Pre-flight

```r
# One last check
devtools::check()

# Verify the built tarball
devtools::build()
```

**Got:** Final `devtools::check()` passes clean. `.tar.gz` tarball built in parent directory.

**If fail:** Last-minute issue appears? Fix, re-run all checks from Step 2. Never submit with known failures.

### Step 9: Submit

```r
devtools::release()
```

Runs interactive checks and submits. Answer all questions honest.

Alternatively, submit manual at https://cran.r-project.org/submit.html by uploading tarball.

**Got:** Confirmation email from CRAN arrives within minutes. Click confirmation link to finalize submission.

**If fail:** Check email for rejection reasons. Common issues: examples too slow, missing `\value` tags, non-portable code. Fix issues, re-submit, note in cran-comments.md what changed.

### Step 10: Post-Submission

After acceptance:

```r
# Tag the release
usethis::use_github_release()

# Bump to development version
usethis::use_dev_version()
```

**Got:** GitHub release created with accepted version tag. DESCRIPTION bumped to development version (`x.y.z.9000`).

**If fail:** GitHub release fails? Create manual with `gh release create`. CRAN acceptance delayed? Wait for confirmation email before tagging.

## Checks

- [ ] `R CMD check` returns 0 errors, 0 warnings on local machine
- [ ] Win-builder passes (release + devel)
- [ ] R-hub passes on all tested platforms
- [ ] `cran-comments.md` accurate describes check results
- [ ] All URLs valid
- [ ] No spelling errors
- [ ] Version number correct and incremented
- [ ] NEWS.md current
- [ ] DESCRIPTION metadata complete and accurate

## Pitfalls

- **Examples too slow**: Wrap expensive examples in `\donttest{}`. CRAN enforces time limits.
- **Non-standard file/dir names**: Avoid files that trigger CRAN notes (check `.Rbuildignore`)
- **Missing `\value` in docs**: All exported functions need `@return` tag
- **Vignette build failures**: Ensure vignettes build in clean environment without your `.Renviron`
- **DESCRIPTION Title format**: Must be Title Case, no period at end, no "A Package for..."
- **Forget reverse dependency checks**: Updates? Run `revdepcheck::revdep_check()`

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

## See Also

- `release-package-version` - version bumping, git tagging
- `write-roxygen-docs` - ensure documentation meets CRAN standards
- `setup-github-actions-ci` - CI checks that mirror CRAN expectations
- `build-pkgdown-site` - documentation site for accepted packages
