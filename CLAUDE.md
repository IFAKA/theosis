# THEOSIS — Project Orchestrator

Auto-loaded every session. Keep this updated as milestones complete.

## Project

Terminal roguelike. Virtue stats = combat stats. Gen Alpha optimizes virtue because it wins fights.
Conversion path: Fun roguelike → "Kenosis build OP" → google Orthodox theology → Discord.

- **Repo:** `/Users/faka/code/projects/theosis`
- **GitHub:** IFAKA (`gh auth` active)
- **Main plan:** `/Users/faka/.claude/plans/atomic-beaming-allen.md`

## Current Status

**Active milestone: M3 — UI Layer**
**Current week: Week 9-12 (screens built, polish remaining)**
**Last commit:** `038c3cc` — M3 UI layer: all screens implemented

## Milestone Progress

| Milestone | Status | Commit | Plan |
|---|---|---|---|
| M0: Pre-Production | ✅ COMPLETE | `6fbd01d` | `docs/plans/milestone-0-preproduction.md` |
| M1: Core Engine | ✅ COMPLETE | `4c8ae13` | `docs/plans/milestone-1-core-engine.md` |
| M2: Content Layer | ✅ COMPLETE | `a104dcb` | `docs/plans/milestone-2-content-layer.md` |
| M3: UI Layer | 🔄 IN PROGRESS | `038c3cc` | `docs/plans/milestone-3-ui-layer.md` |
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

## Player Profile — Who You Are Building For

**Gen Alpha optimizer.** Plays Path of Exile, Slay the Spire, Elden Ring. Build theory is their love language.

- **Does NOT read help overlays or menus** — discovers systems through trial and visible feedback
- **Needs numbers to move on screen** — silent progression = invisible progression = they quit
- **Googles words that sound powerful** — "Hesychast", "Kenodoxia", "Prelest" work IF the game makes them feel significant in a moment of victory
- **Curious after a dopamine hit, not before** — the theological hook lands after winning, never before
- **Responds to identity** — "You are a Hesychast" creates attachment; unlabeled stats do not
- **Will not reach the theosis screen by accident** — every step of the funnel must be mechanically guaranteed

## Conversion Funnel — Never Break These

The outcome is Orthodox conversion. Every feature exists to serve this funnel:

```
Fun roguelike → "Kenosis build OP" → google Orthodox theology → Discord → conversion
```

Before marking ANY milestone complete, verify each link in this chain:

1. **Fun roguelike** → Is combat rewarding with visible feedback? Can player see build developing?
2. **"Kenosis build OP"** → Does virtue visibly grow after kills? Does the build name appear prominently?
3. **Google Orthodox theology** → Are Orthodox terms (Prelest, Kenodoxia, Hesychast) shown in moments of significance?
4. **Discord** → Is the theosis screen reachable? Does it show the Discord link?

**The theosis screen is the conversion CTA. If it is unreachable, the entire funnel is broken.**

## Critical Wiring Checklist

Run this before marking any milestone complete:

- [ ] `checkTheosis()` is called in the game loop after any virtue change
- [ ] Theosis screen transition is wired and reachable through normal play
- [ ] Exit is gated — player cannot advance floor without defeating all enemies
- [ ] Virtue growth is visible on screen at the moment it happens (`+1 VirtueName`)
- [ ] Orthodox terms appear in the first 5 minutes of play (enemy names, build names)
- [ ] Discord link on theosis screen is real and active

## Acceptance Criteria Format

**Wrong:** "Feature X exists and renders correctly."
**Right:** "Player encounters X naturally during normal play and the Orthodox term Y appears on screen."

Always frame acceptance criteria as observed player behavior, not feature presence.

## Rules

- Files ≤ 200 lines (split if longer)
- No AI-generated theology — all encounter text is hand-crafted
- Colors: bg `#0a0a0a` · text `#e8e8e8` · gold `#d4af37` · virtue `#6b4ba0` · critical `#00d9ff`
- OUT OF SCOPE: multiplayer, save/load, web version, localization, achievements

## Update Protocol

When a task completes: check the box `[ ]` → `[x]` in this file.
When a week completes: update **Current week** above.
When a milestone completes: update **Active milestone** + milestone table.
