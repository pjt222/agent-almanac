---
title: Multi-Harness Almanac — the lead sheet, the seating chart, and the shared table
date: 2026-11-27
session: private
seed: "A single almanac inhabited by many different harnesses at once — Claude Code, Antigravity, pi, Hermes, Codex — without flattening any of them into the lowest common denominator."
trigger: "explicit — user's invitation to try /dream after reviewing agent-almanac for Antigravity CLI compatibility (#1131) and merging PR #1132 (GEMINI.md and 14-adapter docs)"
motifs: [hearth, gathering, self-similarity, projection, temperament, transposition, cohabitation]
recovered: full
movements: 1
glows:
  - "A seed vault, not a software package: what we treat as conversion bugs across harnesses may just be soil chemistry."
  - "An almanac entry is a lead sheet, not piano tablature — writing agent definitions in one harness's model tiers makes every other musician drop notes on sight-transposition."
  - "Every harness has an acoustic room size; a skill designed as a fractal lens (index whisper, compact spine, unbounded references/) lets every room hear a complete sentence instead of a scissor cut at byte 24,000."
  - "The campfire is a context-budget cure: an Antigravity skills.json include_only list is literally a seating chart that lights only tonight's fire instead of dragging 375 chairs into a 60-seat room."
  - "CLAUDE.md, GEMINI.md, and MEMORY.md are separate fridges; cohabiting harnesses lack a shared kitchen table that survives being read."
downstream:
  - "epic: #1131 (Antigravity CLI compatibility), with #1127 (plugin packaging & agent model tiers) and #1129 (Antigravity adapter & skills.json)"
  - "PR #1132 (merged as 8f4d6d64a) — root GEMINI.md and 14-adapter doc reconciliation immediately preceded this dream"
---

## Wandering

**Seed vault.** Not a software package, a seed vault. The same seed planted in chalk soil (Claude Code), volcanic soil (Antigravity CLI), sandy soil (pi), or clay (Hermes) grows into the same plant with different roots. Today we treat the soil differences as conversion bugs — `model: sonnet` failing in Antigravity (`0/76` agents loaded), `24,000` bytes clipping a skill body, `.agents/skills/` overlapping `.pi/skills/`. What if they are just soil chemistry?

**Sheet music vs. arrangements.** An almanac entry is a *lead sheet* — melody and chord changes (`intent`, `procedure`, `validation`). Claude Code plays it on piano (`Agent`, `sonnet`/`opus`, `.mjs` workflows); Antigravity plays it on cello (`invoke_subagent`, `pro`/`inherit`, Python `run_workflow`, `hooks.json`); pi plays it solo acoustic. Right now the lead sheet is written in piano tablature, so every other musician has to sight-transpose on the fly and drops notes whenever a chord asks for ten fingers.

**A tide pool at low tide.** Multiple species sharing the same rock — barnacles, anemones, crabs — each leaving a different trace on the same stone (`CLAUDE.md`, `GEMINI.md`, `MEMORY.md`, `CONTINUE_HERE.md`). What happens when two harnesses actually read each other's traces natively, not as a one-way courtesy? Earlier in this session I wrote into Claude Code's `MEMORY.md` like leaving a handwritten note on a roommate's fridge. What does a shared kitchen table look like where no roommate owns the fridge?

**The 24 KB horizon as an acoustic room.** Every harness has a room size — 200 lines / 25 KB for Claude Code's memory index, 500 lines (494 English) for skills, 24,000 bytes for Antigravity skill and rule bodies, ~56.5K tokens of 375-skill metadata overflowing the customization index. What if a skill were not a document that gets chopped with scissors at byte 24,000, but a **fractal, zoomable lens** — a short whisper for the index, a complete compact spine inside the room limit, unbounded depth in `references/` — so every room size hears a complete sentence instead of a mid-word cutoff?

**A campfire that doesn't care which lantern you brought.** The campfire metaphor (`gather`, `tend`, `scatter`, from the 2026-03-18 dream) already feels harness-free — it is about *who sits around the fire for this task*, not which CLI binary you typed. What if an Antigravity `.agents/skills.json` (`include_only`) were literally a **campfire seating chart** — lighting just the skills around tonight's fire so you never drag all 375 chairs into a 60-seat room?

## What Glowed

1. **The Campfire as Context-Budget Cure (`skills.json` as seating chart):** Instead of fighting the 375-skill ~56.5K-token metadata overflow with a static curated list alone, Antigravity's native `.agents/skills.json` (`include_only`) maps directly onto `gather` / `scatter` — lighting a campfire sets which skills sit inside the budget tonight.
2. **Lead Sheet vs. Tablature for Agents:** Hardcoding `model: sonnet`/`opus` in `agents/*.md` is piano tablature. Expressing harness-agnostic tier intent (or letting adapters transpose cleanly, as `cli/adapters/pi.js` omits `model:`) prevents every new harness from hitting `0/76` agents loaded.
3. **The Shared Kitchen Table:** Today `CLAUDE.md`, `GEMINI.md`, and Claude Code's `MEMORY.md` are separate fridges, while `CONTINUE_HERE.md` is single-consumer and deleted on read. Cross-harness peer sessions have no shared, non-ephemeral noticeboard.

## Provenance

Dreamed on 2026-11-27 in an Antigravity CLI session (`agy 1.5.18`), right after completing the Antigravity CLI compatibility review (#1127–#1131) and merging PR #1132 (`8f4d6d64a`, adding root `GEMINI.md` and reconciling 14-adapter doc counts). This is the first entry in `dreams/` authored by a non-Claude harness. Numerical anchors cited in the wandering (`375` skills, `~56.5K` tokens at chars/4, `0/76` agents loaded, `24,000`-byte Antigravity cap, `500`/`494`-line skill caps, `200`-line / `25 KB` Claude Code memory cap) were measured or verified earlier in the same session against `main` (`5907366b9` → `8f4d6d64a`).
