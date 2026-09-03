# Translations

This directory contains translations of agent-almanac content into multiple languages. Translations follow a parallel directory tree structure that mirrors the English source.

## Supported Locales

<!-- AUTO:START:i18n-locales -->
| Code | Language | Skills | Agents | Teams | Guides | Translated | Stale |
|---|---|---|---|---|---|---|---|
| de | Deutsch | 340/372 | 3/75 | 1/22 | 2/35 | 346/504 (68.7%) | 173 |
| zh-CN | 简体中文 | 343/372 | 3/75 | 1/22 | 2/35 | 349/504 (69.2%) | 171 |
| ja | 日本語 | 347/372 | 3/75 | 1/22 | 2/35 | 353/504 (70%) | 168 |
| es | Español | 334/372 | 3/75 | 1/22 | 2/35 | 340/504 (67.5%) | 170 |
| caveman-lite | Caveman Lite | 346/372 | 0/75 | 0/22 | 0/35 | 346/504 (68.7%) | 308 |
| caveman | Caveman | 346/372 | 0/75 | 0/22 | 0/35 | 346/504 (68.7%) | 308 |
| caveman-ultra | Caveman Ultra | 346/372 | 0/75 | 0/22 | 0/35 | 346/504 (68.7%) | 308 |
| wenyan-lite | 文言文輕 | 343/372 | 0/75 | 0/22 | 0/35 | 343/504 (68.1%) | 305 |
| wenyan | 文言文 | 343/372 | 0/75 | 0/22 | 0/35 | 343/504 (68.1%) | 305 |
| wenyan-ultra | 文言文極 | 345/372 | 0/75 | 0/22 | 0/35 | 345/504 (68.5%) | 304 |
<!-- AUTO:END:i18n-locales -->

Generated from `i18n/_config.yml` and each locale's `translation_status.yml` — the same
source the root [README](../README.md#translations) table reads, so the two cannot disagree.
`stale` counts translated files whose English source moved on; see [Status
Reports](#status-reports) below for why a *falling* `stale` is not by itself progress.

## Directory Structure

```text
i18n/
  _config.yml                    # Locale configuration
  README.md                      # This file
  <locale>/
    skills/<skill-name>/SKILL.md # Translated skills
    agents/<agent-name>.md       # Translated agents
    teams/<team-name>.md         # Translated teams
    guides/<guide-name>.md       # Translated guides
    translation_status.yml       # Auto-generated coverage report
```

## What Gets Translated vs Stays English

| Content Type | Translate | Keep English |
|---|---|---|
| **Skills** | description, section headings, prose, pitfalls, validation text | name (=ID), allowed-tools, code blocks, tags, domain, language |
| **Agents** | description, Purpose, Capabilities, Usage Scenarios, Limitations | name (=ID), tools list, model, priority, skills list |
| **Teams** | description, Purpose, Coordination Pattern prose, Usage Scenarios | name (=ID), lead, members[].id, coordination type, CONFIG block |
| **Guides** | title, description, all prose sections, troubleshooting | code blocks, command examples, file paths, YAML config examples |

### Code fences: which are frozen

"Code blocks" above is enforced, not advisory (#472). A fenced block is **frozen**
unless its info-string tag is exactly `text`, `markdown`, or `md`. A frozen fence
body must be byte-identical to a fence body appearing in *some* revision of the
paired English file — any revision ever committed, so a faithful translation of an
older English source still passes and staleness stays
`check-translation-freshness.js`'s problem.

The exemption list is closed and **default-deny**. Untagged fences are frozen. Any
tag not named above — `logql`, `bibtex`, `powershell`, or one invented next year —
is frozen on arrival. Adding a tag requires a PR naming which machine consumes
that fence.

Frozen covers everything between the delimiters: comments, docstrings, string
literals, YAML values, placeholders. Translate the prose around the fence. When a
comment carries the only statement of an instruction, lift it into the prose
instead of translating it in place.

`text` and `markdown` stay localisable because they carry tables, decision flows
and report templates meant to be read or filled in by a person in their own
language.

```bash
npm run validate:i18n-fences                    # whole corpus
node scripts/check-i18n-fence-parity.js \
  --locale de --id create-r-package             # just the file you touched
npm run normalize:i18n-fences                   # PREVIEW the restore from source_commit
npm run normalize:i18n-fences -- --write        # apply it
npm run normalize:i18n-fences -- --tag yaml,json  # one #477 batch
```

The normalizer previews unless `--write` is passed, and refuses to write into a
dirty `i18n/` — `git checkout -- i18n/` is its only undo, and it would take your
uncommitted work with it (#486).

`--tag <list>` scopes a run to fences carrying those tags — the #477 batches. A
tag matching no divergent fence exits 2 rather than reporting zero, so a typo
cannot read as "this batch is already done".

`--tree <list>` scopes the same way across content trees. The normalizer covers
all four — `skills`, `agents`, `teams`, `guides` — so it repairs exactly what the
checker flags; it was skills-only until the mirror slice was cleared in #518. A
`--tree` naming a tree the selected `--locale` carries no translations for exits
2, for the same reason a `--tag` matching nothing does.

Runs **warn-only** in CI until the backlog clears (#477), then flips to blocking.

## Translation Frontmatter

Every translated file includes these fields in its YAML frontmatter, except that
`fence_basis_commit` is carried only by files that can prove it — 3,415 of 3,644 as of the #552
backfill. Its absence is meaningful rather than missing, as explained below:

```yaml
locale: de                              # Content locale (IETF BCP 47)
source_locale: en                       # Translated from
source_commit: abc1234                  # English revision a HUMAN translated against
fence_basis_commit: abc1234             # English revision the FENCES were verified against
translator: "(untranslated stub)"       # Attribution; this is the scaffold value
translation_date: "2026-03-15"          # ISO 8601
```

`translator` is stamped with the value shown in the example above at scaffold time, because a
scaffold is a copy of the English source: no translation and no review has happened, and the
field must not claim otherwise (#545). Replace it with a real attribution — a model id, a person,
or both — when the prose is translated. Stubs are *detected* by the verdicts of
`generate-translation-status.js --verdicts` (`no-novel-lines` for Latin-script locales,
`no-script` for CJK and wenyan ones), never by this field, so the value is a signal for humans,
not a gate; what it buys is that "which translations has a human actually reviewed?" becomes a
question the corpus can answer once the remaining scaffold defaults are replaced (#769).

### Why there are two commit fields

They answer different questions, and a mechanical repair pulls them apart (#552).

`source_commit` records **the English revision a human translated against**. Staleness is
measured from it: when the English source changes after that revision, the translation is
flagged stale. A tool must never move it — bumping it asserts a translation event that never
happened, which is precisely the lie `evolve-skill` was found telling in #405.

`fence_basis_commit` records **the English revision this file's frozen fence bodies were last
verified against**. `normalize-i18n-fences.js` moves it when it propagates English bytes into a
mirror, because otherwise the frontmatter would contradict the body it just rewrote.

With one field the two are irreconcilable: after a mechanical fence repair, bumping it makes the
first claim false and leaving it makes the second false. So there are two.

They are equal at birth — a scaffold is a byte copy, so its fences trivially mirror the revision
it copied — and they diverge from the first edit of either kind.

**Absence of `fence_basis_commit` is not a defect.** Present means "these bytes were checked
against that revision"; absent means "unverified". A commit is never stamped on an unverified
file, because writing a false claim into the corpus to be corrected later is the exact class of
problem this field exists to end.

After the #552 backfill, 229 files have no claim, and the split is worth knowing because only
one part of it is a defect:

| | files | what it means |
|---|---|---|
| fence count differs from its `source_commit` | 148 | English gained or lost a fence since |
| fence tag sequence differs | 45 | usually a retag |
| a gated fence body differs | 36 | usually a translated code block |

Only **31** of the 229 are genuinely divergent — fences matching *no* English revision, which is
the #477 backlog. The other **198** are clean files that simply do not mirror the commit they
name: `evolve-*` bumps `source_commit` without retranslating (#405, #616), so the recorded
revision no longer describes the bytes. Those regain a claim automatically once #616 lands and
the backfill is re-run; it is add-only and idempotent, so re-running is safe at any time.

```bash
npm run backfill:fence-basis                      # preview, writes nothing
npm run backfill:fence-basis -- --write
npm run backfill:fence-basis -- --verify --base <ref>   # audit a landed diff
```

**It never gates a comparison.** `check-i18n-fence-parity.js` compares fence bytes
unconditionally. The field is read for reporting, and to catch the one thing bytes alone cannot
say: a file that *claims* a verified basis while its fences diverge. That is reported as
`stale-basis-claim` and is deliberately ungated — the divergence underneath it is already
counted, so it can never change a verdict, only tell you a field is lying.

## Contributing a Translation

### Using the translation-campaign team

For large-scale translation work, use the [translation-campaign](../teams/translation-campaign.md) team with wave-parallel coordination. See [Running a Translation Campaign](../guides/running-a-translation-campaign.md) for the end-to-end guide.

### Using the translator agent

For individual translations, use the `translator` agent and `translate-content` skill:

```text
"Use the translator agent to translate create-r-package into German"
```

### Manual workflow

1. **Scaffold**: `npm run translate:scaffold -- <content-type> <id> <locale>`
   - Copies the English source to `i18n/<locale>/<type>/<id>/`
   - Pre-fills translation frontmatter fields

2. **Translate**: Edit the scaffolded file
   - Translate all prose sections
   - Keep code blocks, IDs, tags, and tool names in English
   - Use domain-appropriate terminology

3. **Review**: Spot-check for accuracy and idiomatic phrasing

4. **Update status**: `npm run translation:status` regenerates `translation_status.yml`

## Quality Guidelines

- **Terminology consistency**: Use established translations for technical terms within each locale
- **Code blocks**: Never translate code, commands, file paths, or configuration values
- **IDs are stable**: Skill names, agent names, team names, and tag values stay in English
- **Frontmatter fields**: `name` always matches the English source (it is the ID)
- **Line count**: Translated SKILL.md files must stay under 500 lines
- **Cross-references**: Skill/agent/team references use English IDs, not translated names

## Freshness Tracking

Translations are tracked against the English source via `source_commit`. When the source file changes:

```bash
# Check which translations are stale
node scripts/check-translation-freshness.js

# Warn-only mode (used in CI)
node scripts/check-translation-freshness.js --warn
```

## Status Reports

Per-locale status files are auto-generated:

```bash
# Regenerate all translation_status.yml files
npm run translation:status
```

Each `translation_status.yml` reports four numbers per content type, and they do not mean
what a quick read suggests:

| field | meaning |
|---|---|
| `total` | English sources of that type, from the registry |
| `translated` | files that show evidence of translation |
| `stubs` | files that show **none** — scaffolds, still word-for-word English |
| `stale` | translated files whose English source changed after their `source_commit` |
| `unjudged` | files whose fence structure matches no English revision — the frozen-region mask is wrong, so every count taken through it is void |

Three things follow, and all have misled readers before:

- **`stale` is measured only over `translated`.** A stub is never also stale, because the
  scaffold verdict is reached first. So recognising a scaffold *lowers* `stale` with nothing
  translated — a falling `stale` number is not by itself progress.
- **`translated + stubs` is not `total`.** A locale that has never scaffolded an item has
  neither, so the remainder is untouched content.
- **`unjudged` is neither `translated` nor `stubs`, deliberately.** Both alternatives are
  wrong in a way that costs something: counting such a file translated inflates coverage,
  and calling it a stub routes a possibly fully-translated file into a remedy that *deletes*
  it. The honest report is that it was not measured. `--verdicts` lists them.

A file becomes `unjudged` when a stray fence opener inverts the document's fence phase: an
added ```` ```bash ```` cannot close anything, but it opens, so the real opener is swallowed
into its body and the real closer closes the stray fence. Prose silently becomes fence body.
The fence *count* is unchanged, which is why the check compares the **shape** — the ordered
list of info-string tags, which are keep-in-English in every locale and so must match some
English revision. Fix the fence and the file is judged normally again.

The shape counts **terminated** fences only. An unterminated fence is not frozen, so it
describes nothing about the mask and must not perturb the shape. That is also why the check
does not ask whether the mask *hid* anything: a stray ```` ```text ```` opener is localisable
and hides nothing, yet it still flips the phase and **exposes** the real frozen body — whose
keep-in-English lines then read as newly-translated prose. Corruption runs both ways.

The root `README.md` coverage table renders these same numbers, and only these — it reads the
status files rather than counting what exists on disk (#560). Its cells use two markers:

| marker | meaning |
|---|---|
| `*` | file count, not a measurement — that locale has no `translation_status.yml` yet |
| `-` | not measured (the `Stubs` column of a locale with no status file). Never `0`, which would read as "no stubs found" |

`scripts/check-readme-translation-parity.js` (integrity check B13) fails if the two ever
disagree. It parses both committed files rather than regenerating the table, so it still sees
a generator that goes back to counting files.

A file counts as a stub when every substantive prose line in it appeared verbatim in English
at some point, or when its locale is written in a script the file contains none of. Frozen
code fences are excluded from that comparison — they are keep-in-English in every locale by
design, so counting them would make every genuine translation look like a scaffold.

```bash
# The per-file list behind the stub count -- read this before deleting anything
npm run translation:status -- --verdicts

# How close the closest genuine translations came to being called scaffolds
npm run translation:status -- --margins
```

Use `--verdicts` before any bulk re-scaffold. A stub verdict is remediated by deleting the
file, so a wrong one destroys real work, and an aggregate count cannot be reviewed.

## See Also

- [Running a Translation Campaign](../guides/running-a-translation-campaign.md) -- end-to-end guide for large-scale translation
- [translation-campaign](../teams/translation-campaign.md) -- wave-parallel team for systematic localization
- [translator](../agents/translator.md) -- agent for individual translations
- [translate-content](../skills/translate-content/SKILL.md) -- skill for content translation
- [Root README](../README.md) -- project overview
