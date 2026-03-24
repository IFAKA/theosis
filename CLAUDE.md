# THEOSIS — Project Orchestrator

Auto-loaded every session. Keep this updated as milestones complete.

## Project

Terminal roguelike. Virtue stats = combat stats. Gen Alpha optimizes virtue because it wins fights.
Conversion path: Fun roguelike → "Kenosis build OP" → google Orthodox theology → Discord.

- **Repo:** `/Users/faka/code/projects/theosis`
- **GitHub:** IFAKA (`gh auth` active)
- **Main plan:** `/Users/faka/.claude/plans/atomic-beaming-allen.md`

## Current Status

**Active milestone: M2 — Content Layer**
**Current week: —**
**Last commit:** `4c8ae13` — M1 complete, full engine loop verified

## Milestone Progress

| Milestone | Status | Commit | Plan |
|---|---|---|---|
| M0: Pre-Production | ✅ COMPLETE | `6fbd01d` | `docs/plans/milestone-0-preproduction.md` |
| M1: Core Engine | ✅ COMPLETE | `4c8ae13` | `docs/plans/milestone-1-core-engine.md` |
| M2: Content Layer | ⬜ NOT STARTED | — | `docs/plans/milestone-2-content-layer.md` |
| M3: UI Layer | ⬜ NOT STARTED | — | `docs/plans/milestone-3-ui-layer.md` |
| M4: Launch Prep | ⬜ NOT STARTED | — | `docs/plans/milestone-4-launch-prep.md` |

## M1 Task Tracker

### Week 1: Dungeon + Player State ✅
- [x] `src/engine/player.ts` — PlayerState type + factory functions
- [x] `src/engine/virtue/stats.ts` — VirtueName, VIRTUE_DISPLAY, MAX_VIRTUE
- [x] `src/engine/virtue/progression.ts` — baseline tracking, theosis check
- [x] `src/engine/dungeon/generator.ts` — rot-js Digger map generation
- [x] `src/engine/dungeon/floor.ts` — FloorState, createFloor, isExitReached
- [x] `src/engine/dungeon/fov.ts` — FOV wrapper, VisibleTiles

### Week 2: Enemy System ✅
- [x] `src/engine/enemies/types.ts` — EnemyTemplate, 5 base enemies
- [x] `src/engine/enemies/registry.ts` — spawn by floor, difficulty scaling
- [x] `src/engine/combat/ai.ts` — EnemyIntent, telegraph logic
- [x] `src/engine/combat/actions.ts` — 5 L1 virtue actions
- [x] `src/engine/combat/damage.ts` — damage calc, weakness exploitation

### Week 3: Combat Loop ✅
- [x] `src/engine/scheduler.ts` — TurnScheduler wrapping rot-js
- [x] `src/engine/combat/effects.ts` — ActiveEffect, tick, apply
- [x] `src/engine/combat/resolver.ts` — playerTurn, enemyTurn, checkCombatEnd
- [x] `src/data/abilities.json` — L1-L10 per virtue (50 total)
- [x] Death → baseline rise → new run flow (extend progression.ts)

### Week 4: Encounter System ✅
- [x] `src/engine/encounter/types.ts` — Encounter, Choice, Effect types
- [x] `src/engine/encounter/resolver.ts` — applyChoice, selectEncounters
- [x] 5 placeholder encounters (1 per category)
- [x] `src/engine/virtue/builds.ts` — archetype detection
- [x] End-to-end loop test: spawn → encounter → combat → death → resurrection

## How to Resume After /clear

1. Read this file — it tells you current milestone and task status
2. Read the active milestone plan (e.g., `docs/plans/milestone-1-core-engine.md`)
3. Find the first unchecked task in the tracker above
4. Continue executing

## Tech Stack

| Layer | Tool |
|---|---|
| Language | TypeScript (ESM, `moduleResolution: bundler`) |
| UI | Ink.js 6.8 (React for terminal) |
| Roguelike engine | rot-js 2.2 (map gen, FOV, scheduler) |
| Build | esbuild → `dist/theosis.mjs` |
| Dev | `tsx watch` — hot reload |

## Commands

```bash
npm run dev        # hot reload dev server
npm run build      # esbuild → dist/theosis.mjs
npm run typecheck  # tsc --noEmit
```

## Rules

- Files ≤ 200 lines (split if longer)
- No AI-generated theology — all encounter text is hand-crafted
- Colors: bg `#0a0a0a` · text `#e8e8e8` · gold `#d4af37` · virtue `#6b4ba0` · critical `#00d9ff`
- OUT OF SCOPE: multiplayer, save/load, web version, localization, achievements

## Update Protocol

When a task completes: check the box `[ ]` → `[x]` in this file.
When a week completes: update **Current week** above.
When a milestone completes: update **Active milestone** + milestone table.
