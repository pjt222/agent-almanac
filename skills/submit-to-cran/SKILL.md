---
name: submit-to-cran
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

Execute the full CRAN submission workflow from pre-flight checks through submission.

## When to Use

- Package is ready for initial CRAN release
- Submitting an updated version of an existing CRAN package
- Re-submitting after CRAN reviewer feedback

## Inputs

- **Required**: R package passing local `R CMD check` with 0 errors and 0 warnings
- **Required**: Updated version number in DESCRIPTION
- **Required**: Updated NEWS.md with changes for this version
- **Optional**: Previous CRAN reviewer comments (for re-submissions)

## Procedure

### Step 1: Version and NEWS Check

Verify DESCRIPTION has the correct version:

```r
desc::desc_get_version()
```

Verify NEWS.md has an entry for this version. The entry should summarize user-facing changes.

**Expected:** Version follows semantic versioning. NEWS.md has a matching entry for this version.

**On failure:** Update version with `usethis::use_version()` (choose "major", "minor", or "patch"). Add a NEWS.md entry summarizing user-facing changes.

### Step 2: Local R CMD Check

```r
devtools::check()
```

**Expected:** 0 errors, 0 warnings, 0 notes (1 note acceptable for new submissions: "New submission").

**On failure:** Fix all errors and warnings before proceeding. Read the check log at `<pkg>.Rcheck/00check.log` for details. Notes should be explained in cran-comments.md.

### Step 3: Spell Check

```r
devtools::spell_check()
```

Add legitimate words to `inst/WORDLIST` (one word per line, sorted alphabetically).

**Expected:** No unexpected misspellings. All flagged words are either corrected or added to `inst/WORDLIST`.

**On failure:** Fix genuine misspellings. For legitimate technical terms, add them to `inst/WORDLIST` (one word per line, alphabetically sorted).

### Step 4: URL Check

```r
urlchecker::url_check()
```

**Expected:** All URLs return HTTP 200. No broken or redirected links.

**On failure:** Replace broken URLs. Use `\doi{}` for DOI links instead of raw URLs. Remove links to resources that no longer exist.

### Step 5: Win-Builder Checks

```r
devtools::check_win_devel()
devtools::check_win_release()
```

Wait for email results (usually 15-30 minutes).

**Expected:** 0 errors, 0 warnings on both Win-builder release and devel. Results arrive by email within 15-30 minutes.

**On failure:** Address platform-specific issues. Common causes: different compiler warnings, missing system dependencies, path separator differences. Fix locally and re-submit to Win-builder.

### Step 6: R-hub Check

```r
rhub::rhub_check()
```

This checks on multiple platforms (Ubuntu, Windows, macOS).

**Expected:** All platforms pass with 0 errors and 0 warnings.

**On failure:** If a specific platform fails, check the R-hub build log for platform-specific errors. Use `testthat::skip_on_os()` or conditional code for platform-dependent behavior.

### Step 7: Prepare cran-comments.md

Create or update `cran-comments.md` in the package root:

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

For updates, include:
- What changed (brief)
- Response to any previous reviewer feedback
- Reverse dependency check results if applicable

**Expected:** `cran-comments.md` accurately summarizes check results across all test environments and explains any notes.

**On failure:** If check results differ across platforms, document all variations. CRAN reviewers will check these claims against their own tests.

### Step 8: Final Pre-flight

```r
# One last check
devtools::check()

# Verify the built tarball
devtools::build()
```

**Expected:** Final `devtools::check()` passes cleanly. A `.tar.gz` tarball is built in the parent directory.

**On failure:** If a last-minute issue appears, fix it and re-run all checks from Step 2. Do not submit with known failures.

### Step 9: Submit

```r
devtools::release()
```

This runs interactive checks and submits. Answer all questions honestly.

Alternatively, submit manually at https://cran.r-project.org/submit.html by uploading the tarball.

**Expected:** Confirmation email from CRAN arrives within minutes. Click the confirmation link to finalize the submission.

**On failure:** Check email for rejection reasons. Common issues: examples too slow, missing `\value` tags, non-portable code. Fix the issues and re-submit, noting in cran-comments.md what changed.

### Step 10: Post-Submission

After acceptance:

```r
# Tag the release
usethis::use_github_release()

# Bump to development version
usethis::use_dev_version()
```

**Expected:** GitHub release is created with the accepted version tag. DESCRIPTION is bumped to the development version (`x.y.z.9000`).

**On failure:** If the GitHub release fails, create it manually with `gh release create`. If CRAN acceptance is delayed, wait for the confirmation email before tagging.

## Validation

- [ ] `R CMD check` returns 0 errors, 0 warnings on local machine
- [ ] Win-builder passes (release + devel)
- [ ] R-hub passes on all tested platforms
- [ ] `cran-comments.md` accurately describes check results
- [ ] All URLs valid
- [ ] No spelling errors
- [ ] Version number is correct and incremented
- [ ] NEWS.md is current
- [ ] DESCRIPTION metadata is complete and accurate

## Common Pitfalls

- **Examples too slow**: Wrap expensive examples in `\donttest{}`. CRAN enforces time limits.
- **Non-standard file/directory names**: Avoid files that trigger CRAN notes (check `.Rbuildignore`)
- **Missing `\value` in docs**: All exported functions need a `@return` tag
- **Vignette build failures**: Ensure vignettes build in a clean environment without your `.Renviron`
- **DESCRIPTION Title format**: Must be Title Case, no period at end, no "A Package for..."
- **Forgetting reverse dependency checks**: For updates, run `revdepcheck::revdep_check()`

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

## Related Skills

- `release-package-version` - version bumping and git tagging
- `write-roxygen-docs` - ensure documentation meets CRAN standards
- `setup-github-actions-ci` - CI checks that mirror CRAN expectations
- `build-pkgdown-site` - documentation site for accepted packages
