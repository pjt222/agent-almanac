# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

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

[Unreleased]: https://github.com/pjt222/agent-almanac/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/pjt222/agent-almanac/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/pjt222/agent-almanac/releases/tag/v1.1.0
