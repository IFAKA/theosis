# THEOSIS — Project Orchestrator

Auto-loaded every session. Keep this updated as milestones complete.

## Project

Terminal roguelike. Virtue stats = combat stats. Gen Alpha optimizes virtue because it wins fights.
Conversion path: Fun roguelike → "Kenosis build OP" → google Orthodox theology → Discord.

- **Repo:** `/Users/faka/code/projects/theosis`
- **GitHub:** IFAKA (`gh auth` active)
- **Main plan:** `/Users/faka/.claude/plans/atomic-beaming-allen.md`

## Current Status

**Active milestone: M1 — Core Engine**
**Current week: Week 1 — Dungeon + Player State**
**Last commit:** `12eaf92` — per-milestone implementation plans added

## Milestone Progress

| Milestone | Status | Commit | Plan |
|---|---|---|---|
| M0: Pre-Production | ✅ COMPLETE | `6fbd01d` | `docs/plans/milestone-0-preproduction.md` |
| M1: Core Engine | 🔄 IN PROGRESS | — | `docs/plans/milestone-1-core-engine.md` |
| M2: Content Layer | ⬜ NOT STARTED | — | `docs/plans/milestone-2-content-layer.md` |
| M3: UI Layer | ⬜ NOT STARTED | — | `docs/plans/milestone-3-ui-layer.md` |
| M4: Launch Prep | ⬜ NOT STARTED | — | `docs/plans/milestone-4-launch-prep.md` |

## M1 Task Tracker

### Week 1: Dungeon + Player State
- [ ] `src/engine/player.ts` — PlayerState type + factory functions
- [ ] `src/engine/virtue/stats.ts` — VirtueName, VIRTUE_DISPLAY, MAX_VIRTUE
- [ ] `src/engine/virtue/progression.ts` — baseline tracking, theosis check
- [ ] `src/engine/dungeon/generator.ts` — rot-js Digger map generation
- [ ] `src/engine/dungeon/floor.ts` — FloorState, createFloor, isExitReached
- [ ] `src/engine/dungeon/fov.ts` — FOV wrapper, VisibleTiles

### Week 2: Enemy System
- [ ] `src/engine/enemies/types.ts` — EnemyTemplate, 5 base enemies
- [ ] `src/engine/enemies/registry.ts` — spawn by floor, difficulty scaling
- [ ] `src/engine/combat/ai.ts` — EnemyIntent, telegraph logic
- [ ] `src/engine/combat/actions.ts` — 5 L1 virtue actions
- [ ] `src/engine/combat/damage.ts` — damage calc, weakness exploitation

### Week 3: Combat Loop
- [ ] `src/engine/scheduler.ts` — TurnScheduler wrapping rot-js
- [ ] `src/engine/combat/effects.ts` — ActiveEffect, tick, apply
- [ ] `src/engine/combat/resolver.ts` — playerTurn, enemyTurn, checkCombatEnd
- [ ] `src/data/abilities.json` — L1-L10 per virtue (50 total)
- [ ] Death → baseline rise → new run flow (extend progression.ts)

### Week 4: Encounter System
- [ ] `src/engine/encounter/types.ts` — Encounter, Choice, Effect types
- [ ] `src/engine/encounter/resolver.ts` — applyChoice, selectEncounters
- [ ] 5 placeholder encounters (1 per category)
- [ ] `src/engine/virtue/builds.ts` — archetype detection
- [ ] End-to-end loop test: spawn → encounter → combat → death → resurrection

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
