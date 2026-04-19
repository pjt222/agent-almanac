# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.3.0] - 2026-04-19

### Added
- `empirical-investigator` agent (72nd agent) — dedicated persona for the `investigation` domain (wire capture, feature flag probing, version baseline monitoring, responsible disclosure)
- Caveman Spellbook: 6 compression locales — `caveman-lite`, `caveman`, `caveman-ultra`, `wenyan-lite`, `wenyan`, `wenyan-ultra` — a homage to JuliusBrussee/caveman
- 2,082 scaffolded translations extending caveman/wenyan coverage to all 350 skills (3-skill pilot already fully translated: `heal`, `commit-changes`, `make-fire`)
- `scripts/bulk-scaffold-caveman.sh` for fast bulk locale scaffolding (single git-hash call)
- Translation scaffolding step embedded in all 6 content creation/evolution meta-skills (`create-skill`, `create-agent`, `create-team`, `evolve-skill`, `evolve-agent`, `evolve-team`)

### Fixed
- i18n: structural quality pass — 28 translation files updated to match restructured sources (missing Step 14/11 in create-* skills, missing Step 4.5 in evolve-* skills, render-icon-pipeline rewritten 6-step→3-step)
- i18n: cleared 140 stale translations across de/zh-CN/ja/es (issue #243)
- i18n: normalized ~970 source_commit values to 8-char short hashes; resolved ~647 false-positive stale warnings
- i18n: fixed scaffold-before-creation source_commit race (source_commit now captured at scaffold time, not at source creation)

### Changed
- CI: GitHub Actions Node runtime bumped to Node 24 (5 workflows)
- i18n: `_config.yml` now documents 10 locales (was 4)

## [1.2.0] - 2026-04-16

### Added
- `investigation` domain: 4 reverse-engineering skills (`conduct-empirical-wire-capture`, `monitor-binary-version-baselines`, `probe-feature-flag-state`, `redact-for-public-disclosure`)
- `web-scraping` domain: `rotate-scraping-proxies` skill; `headless-web-scraping` re-homed here
- `choose-loop-wakeup-interval` skill (synoptic domain)
- 2 new guides: `reverse-engineering-a-cli-harness`, `self-continuation-loops-playbook` (new `investigation` category)
- Claude Code plugin manifest (`.claude-plugin/plugin.json`)
- AI edge CLI adapter for installing almanac on edge LLMs
- i18n translations for `rotate-scraping-proxies` (de, zh-CN, ja, es)
- Glyphs for 6 new entities + `glyph_loop_clock` icon

### Fixed
- TUI: wire g/s keys for kindle/scatter; correct tending status display
- Viz: restore full agent/team node set (was incorrectly filtered by locale)
- Viz: preload hive icons on mode switch; batch requests for mobile compatibility
- Plugin manifest: remove invalid `agents` field

## [1.1.0] - 2026-03-23

First published release.

[Unreleased]: https://github.com/pjt222/agent-almanac/compare/v1.3.0...HEAD
[1.3.0]: https://github.com/pjt222/agent-almanac/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/pjt222/agent-almanac/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/pjt222/agent-almanac/releases/tag/v1.1.0
