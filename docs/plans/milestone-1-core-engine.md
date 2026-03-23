# Milestone 1: Core Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Playable game loop — mechanics only, no content, no UI polish.

**Architecture:** Pure TypeScript engine layer with no UI dependencies. All state lives in `PlayerState`. rot-js handles map gen, FOV, and turn scheduling. Engine files are ≤200 lines each.

**Tech Stack:** TypeScript · rot-js · Ink.js (minimal, just for test output) · tsx watch

---

## Resume Context (read this after /clear)

Project: THEOSIS — terminal roguelike at `/Users/faka/code/projects/theosis`
- M0 complete: `6fbd01d` — scaffold, THEOSIS title renders, esbuild works
- `npm run dev` → hot reload · `npm run build` → dist/theosis.mjs
- **Current milestone: M1** — building the engine, no UI yet
- All source files exist as empty stubs in `src/`
- Color palette: bg `#0a0a0a` · text `#e8e8e8` · gold `#d4af37` · virtue `#6b4ba0`

**Five virtues (stats):** Humility · Courage · Temperance · Wisdom · Love
**Five base enemies:** Demon of Pride (Prelest) · Demon of Despair (Acedia) · Demon of Vainglory (Kenodoxia) · Demon of Anger (Thymos) · Demon of Lust (Porneia)
**Win condition:** All 5 virtues ≥ 10 simultaneously (Theosis)
**Death mechanic:** Virtues reset to baseline; baseline permanently rises by 1 after each death

---

## Week 1: Dungeon + Player State

### Task 1.1: PlayerState type (`src/engine/player.ts`)

**File:** `src/engine/player.ts`

Define the single source of truth for all player data.

```typescript
export type VirtueStats = {
  humility: number;
  courage: number;
  temperance: number;
  wisdom: number;
  love: number;
};

export type PlayerState = {
  hp: number;
  maxHp: number;
  virtues: VirtueStats;
  baseline: VirtueStats;      // permanent floor — never goes below this
  floor: number;
  runCount: number;
  floorCount: number;
  isDead: boolean;
  hasAchievedTheosis: boolean;
};

export function createInitialPlayer(): PlayerState { ... }
export function resetForNewRun(state: PlayerState): PlayerState { ... }
```

**Steps:**
1. Write `src/engine/player.ts` with the types and two factory functions
2. `createInitialPlayer()` → all virtues at 1, baseline at 1, HP 20, floor 1
3. `resetForNewRun(state)` → virtues reset to baseline, HP restored, floor = 1, isDead = false
4. Run `npx tsx -e "import('./src/engine/player.ts').then(m => console.log(m.createInitialPlayer()))"`
5. Confirm output shows correct initial state
6. Commit: `feat: add PlayerState type and factory functions`

---

### Task 1.2: Virtue types (`src/engine/virtue/stats.ts`)

**File:** `src/engine/virtue/stats.ts`

```typescript
export const VIRTUE_NAMES = ['humility', 'courage', 'temperance', 'wisdom', 'love'] as const;
export type VirtueName = typeof VIRTUE_NAMES[number];

export const VIRTUE_DISPLAY: Record<VirtueName, { label: string; color: string }> = {
  humility:    { label: 'Humility',    color: '#a78bfa' },
  courage:     { label: 'Courage',     color: '#f87171' },
  temperance:  { label: 'Temperance',  color: '#34d399' },
  wisdom:      { label: 'Wisdom',      color: '#60a5fa' },
  love:        { label: 'Love',        color: '#f472b6' },
};

export const MAX_VIRTUE = 10;
export const THEOSIS_THRESHOLD = 10;
```

**Steps:**
1. Write the file with above exports
2. Run `npx tsx -e "import('./src/engine/virtue/stats.ts').then(m => console.log(m.VIRTUE_NAMES))"`
3. Confirm `['humility', 'courage', 'temperance', 'wisdom', 'love']`
4. Commit: `feat: add virtue type definitions and display config`

---

### Task 1.3: Virtue progression (`src/engine/virtue/progression.ts`)

**File:** `src/engine/virtue/progression.ts`

```typescript
import type { PlayerState, VirtueStats } from '../player.js';
import { VIRTUE_NAMES, THEOSIS_THRESHOLD } from './stats.js';

// After death: raise baseline by 1 for the lowest virtue only
export function raiseBaseline(baseline: VirtueStats): VirtueStats { ... }

// Check if all virtues meet theosis condition
export function checkTheosis(virtues: VirtueStats): boolean {
  return VIRTUE_NAMES.every(v => virtues[v] >= THEOSIS_THRESHOLD);
}

// Apply virtue change, clamped to [baseline, MAX_VIRTUE]
export function applyVirtueChange(
  virtues: VirtueStats,
  baseline: VirtueStats,
  changes: Partial<VirtueStats>
): VirtueStats { ... }
```

**Steps:**
1. Implement `raiseBaseline` — finds the minimum virtue in baseline, raises it by 1
2. Implement `checkTheosis` — every virtue must be ≥ 10
3. Implement `applyVirtueChange` — clamps each virtue to [baseline[v], MAX_VIRTUE]
4. Test manually:
   ```
   npx tsx -e "
   import('./src/engine/virtue/progression.ts').then(m => {
     const b = { humility:1, courage:1, temperance:1, wisdom:1, love:1 };
     console.log(m.raiseBaseline(b)); // one virtue should be 2
     console.log(m.checkTheosis({ humility:10, courage:10, temperance:10, wisdom:10, love:10 })); // true
   })"
   ```
5. Commit: `feat: add virtue progression — baseline rise and theosis check`

---

### Task 1.4: Dungeon generator (`src/engine/dungeon/generator.ts`)

**File:** `src/engine/dungeon/generator.ts`

Uses rot-js Digger algorithm to generate a dungeon map.

```typescript
import { Map as ROTMap, RNG } from 'rot-js';

export type TileType = 'wall' | 'floor';
export type DungeonMap = Map<string, TileType>;   // key = "x,y"

export type GeneratorResult = {
  map: DungeonMap;
  width: number;
  height: number;
  rooms: Array<{ cx: number; cy: number }>;       // room centers
  playerStart: { x: number; y: number };
  exitPos: { x: number; y: number };
};

export function generateDungeon(width = 60, height = 25, seed?: number): GeneratorResult { ... }
```

**Steps:**
1. If `seed` provided, set `RNG.setSeed(seed)` for reproducibility
2. Create `new ROTMap.Digger(width, height)` and call `.create(callback)` to fill the map
3. Collect room centers from `digger.getRooms()`
4. `playerStart` = first room center, `exitPos` = last room center
5. Test:
   ```
   npx tsx -e "
   import('./src/engine/dungeon/generator.ts').then(m => {
     const r = m.generateDungeon(40, 20);
     console.log('Rooms:', r.rooms.length);
     console.log('Player start:', r.playerStart);
     console.log('Exit:', r.exitPos);
   })"
   ```
6. Confirm 3–8 rooms generated, player start ≠ exit
7. Commit: `feat: add rot-js Digger dungeon generator`

---

### Task 1.5: Floor state (`src/engine/dungeon/floor.ts`)

**File:** `src/engine/dungeon/floor.ts`

```typescript
import type { GeneratorResult } from './generator.js';

export type EnemyOnFloor = {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
};

export type FloorState = {
  map: GeneratorResult;
  enemies: EnemyOnFloor[];
  playerX: number;
  playerY: number;
  floorNumber: number;
  exitReached: boolean;
};

export function createFloor(floorNumber: number, seed?: number): FloorState { ... }
export function isExitReached(floor: FloorState): boolean { ... }
```

**Steps:**
1. `createFloor` generates dungeon, places player at `playerStart`, returns FloorState with empty enemies array
2. `isExitReached` returns true if player position equals exit position
3. Test: generate floor, confirm playerX/Y matches dungeon playerStart
4. Commit: `feat: add FloorState and floor factory`

---

### Task 1.6: FOV wrapper (`src/engine/dungeon/fov.ts`)

**File:** `src/engine/dungeon/fov.ts`

```typescript
import { FOV } from 'rot-js';
import type { DungeonMap } from './generator.js';

export type VisibleTiles = Set<string>;   // "x,y" keys

export function computeFOV(
  map: DungeonMap,
  originX: number,
  originY: number,
  radius = 8
): VisibleTiles { ... }
```

**Steps:**
1. Create `new FOV.PreciseShadowcasting(passableCallback)` where passable = tile is 'floor'
2. Call `fov.compute(originX, originY, radius, (x, y) => visible.add(\`\${x},\${y}\`))`
3. Return the Set of visible tile keys
4. Test: compute FOV from room center, verify >0 tiles visible
5. Commit: `feat: add rot-js FOV wrapper`

**Week 1 acceptance check:**
```bash
npx tsx -e "
Promise.all([
  import('./src/engine/player.ts'),
  import('./src/engine/dungeon/generator.ts'),
  import('./src/engine/virtue/progression.ts'),
]).then(([p, d, v]) => {
  const player = p.createInitialPlayer();
  const dungeon = d.generateDungeon();
  console.log('Player virtues:', player.virtues);
  console.log('Dungeon rooms:', dungeon.rooms.length);
  console.log('Theosis check:', v.checkTheosis(player.virtues)); // false
})"
```

---

## Week 2: Enemy System

### Task 2.1: Enemy types (`src/engine/enemies/types.ts`)

**File:** `src/engine/enemies/types.ts`

```typescript
export type VirtueName = 'humility' | 'courage' | 'temperance' | 'wisdom' | 'love';

export type EnemyTemplate = {
  id: string;
  name: string;                    // "Demon of Pride"
  orthodoxName: string;            // "Prelest"
  symbol: string;                  // single char for grid display
  weakness: VirtueName;            // theologically fixed
  baseHp: number;
  baseDamage: number;
  floorMinimum: number;            // first floor this enemy can appear
  isElite: boolean;
  description: string;             // shown on hover in combat
  intent: string[];                // pool of intent messages
};
```

**Steps:**
1. Write the `EnemyTemplate` type
2. Export 5 base enemy templates inline (hardcoded — will be moved to JSON in M2):
   - `prelest` (Pride) → weakness: humility, floor 1, hp 12, dmg 3
   - `acedia` (Despair) → weakness: love, floor 1, hp 10, dmg 2
   - `kenodoxia` (Vainglory) → weakness: wisdom, floor 2, hp 14, dmg 3
   - `thymos` (Anger) → weakness: temperance, floor 3, hp 16, dmg 4
   - `porneia` (Lust) → weakness: courage, floor 3, hp 12, dmg 3
3. Commit: `feat: add enemy type definitions — 5 Orthodox demons`

---

### Task 2.2: Enemy registry (`src/engine/enemies/registry.ts`)

**File:** `src/engine/enemies/registry.ts`

```typescript
import { BASE_ENEMIES } from './types.js';
import { RNG } from 'rot-js';

// Returns 1-3 enemies appropriate for given floor
export function spawnEnemiesForFloor(floorNumber: number): EnemyTemplate[] { ... }

// Scale enemy HP/damage by floor depth
export function scaleEnemy(template: EnemyTemplate, floor: number): { hp: number; damage: number } { ... }
```

**Steps:**
1. `spawnEnemiesForFloor` filters by `floorMinimum`, picks 1–3 randomly via `RNG.getItem()`
2. `scaleEnemy` multiplies baseHp by `1 + (floor - 1) * 0.15` (15% per floor)
3. Test: floor 1 should only return prelest/acedia. Floor 5 can return any.
4. Commit: `feat: add enemy registry with floor-based spawning`

---

### Task 2.3: Enemy AI intent (`src/engine/combat/ai.ts`)

**File:** `src/engine/combat/ai.ts`

```typescript
import type { EnemyTemplate } from '../enemies/types.js';

export type EnemyIntent = {
  action: 'attack' | 'defend' | 'debuff';
  description: string;   // shown to player before their turn
  damage?: number;
};

export function getEnemyIntent(enemy: EnemyTemplate, floorNumber: number): EnemyIntent { ... }
export function executeEnemyIntent(intent: EnemyIntent, playerHp: number): number { ... }  // returns new HP
```

**Steps:**
1. `getEnemyIntent` picks randomly from enemy's `intent` pool, maps to action type
2. `executeEnemyIntent` applies damage to playerHp (for 'attack'), returns updated HP
3. Commit: `feat: add enemy AI intent telegraphing`

---

### Task 2.4: Combat actions (`src/engine/combat/actions.ts`)

**File:** `src/engine/combat/actions.ts`

One action per virtue at L1. Actions defined as data, not logic.

```typescript
import type { VirtueName } from '../enemies/types.js';

export type CombatAction = {
  id: string;
  virtue: VirtueName;
  name: string;
  description: string;
  level: number;               // 1-10
  damageMultiplier: number;    // applied to virtue stat value
  virtueGain?: Partial<Record<VirtueName, number>>;   // on-hit virtue change
  cost: number;                // AP cost (future — set to 0 for now)
};

// Returns actions available at given virtue levels
export function getAvailableActions(virtueLevel: number, virtue: VirtueName): CombatAction[] { ... }
```

**Steps:**
1. Define 5 L1 actions (one per virtue):
   - Humility: "Prostration" — dmg × 0.8, enemy attack -1 next turn
   - Courage: "Stand Firm" — dmg × 1.2, gain 1 Courage on kill
   - Temperance: "Fast" — dmg × 1.0, remove 1 debuff
   - Wisdom: "Discernment" — dmg × 1.0, reveals enemy weakness if Wisdom ≥ 3
   - Love: "Agape" — dmg × 0.6, heal 2 HP
2. `getAvailableActions` returns actions for the given virtue level
3. Commit: `feat: add L1 combat actions — one per virtue`

---

### Task 2.5: Damage calculation (`src/engine/combat/damage.ts`)

**File:** `src/engine/combat/damage.ts`

```typescript
import type { VirtueStats } from '../player.js';
import type { CombatAction } from './actions.js';
import type { EnemyTemplate } from '../enemies/types.js';

export function calculateDamage(
  action: CombatAction,
  virtues: VirtueStats,
  enemy: EnemyTemplate,
  floor: number
): number { ... }

export function isWeaknessExploited(action: CombatAction, enemy: EnemyTemplate): boolean { ... }
```

**Steps:**
1. Base damage = `virtues[action.virtue] * action.damageMultiplier`
2. If `isWeaknessExploited(action, enemy)` → multiply by 1.5 (weakness bonus)
3. Floor scaling: base + `Math.floor(floor / 2)`
4. Round to integer, minimum 1
5. Test cases:
   - L1 Humility (value 1) vs Prelest (weak to humility): `1 * 0.8 * 1.5 = 1.2 → 1`
   - L5 Courage (value 5) vs non-weak: `5 * 1.2 = 6`
6. Commit: `feat: add damage calculation with weakness exploitation`

**Week 2 acceptance check:**
```bash
npx tsx -e "
import('./src/engine/enemies/registry.ts').then(m => {
  const f1 = m.spawnEnemiesForFloor(1);
  const f5 = m.spawnEnemiesForFloor(5);
  console.log('Floor 1 enemies:', f1.map(e => e.name));
  console.log('Floor 5 enemies:', f5.map(e => e.name));
})"
```

---

## Week 3: Combat Loop

### Task 3.1: Turn scheduler (`src/engine/scheduler.ts`)

**File:** `src/engine/scheduler.ts`

```typescript
import { Scheduler } from 'rot-js';

export type Actor = 'player' | string;   // string = enemy id

export class TurnScheduler {
  private scheduler: Scheduler.Simple;

  constructor() { ... }
  addActor(id: Actor, speed: number): void { ... }
  removeActor(id: Actor): void { ... }
  next(): Actor { ... }
  clear(): void { ... }
}
```

**Steps:**
1. Wrap `rot-js` `Scheduler.Simple` — add/remove actors, call `.next()`
2. Player speed = 100, enemy speed = 80 (player goes slightly more often)
3. Test: add player + 2 enemies, call `.next()` 6 times, verify player appears more
4. Commit: `feat: add turn scheduler wrapping rot-js Scheduler.Simple`

---

### Task 3.2: Combat effects (`src/engine/combat/effects.ts`)

**File:** `src/engine/combat/effects.ts`

```typescript
export type EffectType = 'defense_down' | 'attack_down' | 'regen' | 'weakness_revealed';

export type ActiveEffect = {
  type: EffectType;
  turnsRemaining: number;
  magnitude: number;
};

export function tickEffects(effects: ActiveEffect[]): ActiveEffect[] { ... }    // decrement turns, remove expired
export function applyEffect(effects: ActiveEffect[], newEffect: ActiveEffect): ActiveEffect[] { ... }
export function hasEffect(effects: ActiveEffect[], type: EffectType): boolean { ... }
```

**Steps:**
1. `tickEffects` → map effects, decrement `turnsRemaining`, filter out where ≤ 0
2. `applyEffect` → append new effect (allow stacking for now)
3. `hasEffect` → check if any active effect matches type
4. Commit: `feat: add combat effects system — buffs and debuffs`

---

### Task 3.3: Combat resolver (`src/engine/combat/resolver.ts`)

**File:** `src/engine/combat/resolver.ts`

This is the core turn loop. Ties everything together.

```typescript
import type { PlayerState } from '../player.js';
import type { EnemyOnFloor } from '../dungeon/floor.js';
import type { CombatAction } from './actions.js';
import { calculateDamage } from './damage.js';
import { getEnemyIntent, executeEnemyIntent } from './ai.js';
import { tickEffects, applyEffect } from './effects.js';

export type CombatResult =
  | { outcome: 'enemy_defeated'; xpGained: number }
  | { outcome: 'player_acted' }
  | { outcome: 'player_died' }
  | { outcome: 'floor_cleared' };

export type CombatState = {
  player: PlayerState;
  enemies: EnemyOnFloor[];
  playerEffects: ActiveEffect[];
  enemyEffects: Map<string, ActiveEffect[]>;
  currentIntent: EnemyIntent | null;
  log: string[];
};

export function playerTurn(state: CombatState, action: CombatAction, targetId: string): CombatState { ... }
export function enemyTurn(state: CombatState, enemyId: string): CombatState { ... }
export function checkCombatEnd(state: CombatState): CombatResult | null { ... }
```

**Steps:**
1. `playerTurn`: calculate damage, apply to enemy HP, apply action's virtueGain, tick player effects
2. `enemyTurn`: get intent, execute, apply to player HP, tick enemy effects
3. `checkCombatEnd`: player HP ≤ 0 → `player_died`; all enemies HP ≤ 0 → `floor_cleared`
4. Commit: `feat: add combat resolver — full turn loop`

---

### Task 3.4: Abilities data (`src/data/abilities.json`)

Define L1-L10 ability names and multipliers per virtue. This is data, not code.

```json
{
  "humility": [
    { "level": 1, "name": "Prostration", "damageMultiplier": 0.8, "description": "..." },
    { "level": 2, "name": "Kenosis", "damageMultiplier": 0.9, "description": "..." }
  ]
}
```

**Steps:**
1. Write 10 entries per virtue (50 total)
2. Each entry: level, name, damageMultiplier (increases with level), description
3. Orthodox-themed names: Kenosis, Hesychia, Apatheia, Theoria, Agape, etc.
4. Commit: `feat: add abilities.json — L1-L10 per virtue`

---

### Task 3.5: Death + resurrection flow

This is logic in `src/engine/virtue/progression.ts` (already created) + integration.

**Steps:**
1. In `progression.ts`, add `applyDeath(state: PlayerState): PlayerState`:
   - Calls `raiseBaseline(state.baseline)`
   - Resets `state.virtues` to new baseline
   - Resets HP, sets floor = 1, increments runCount
2. Test full death cycle:
   ```
   npx tsx -e "
   import('./src/engine/virtue/progression.ts').then(m => {
     const state = { virtues: {humility:3,courage:1,temperance:1,wisdom:1,love:1},
                     baseline: {humility:1,courage:1,temperance:1,wisdom:1,love:1} };
     const after = m.applyDeath(state);
     console.log('After death baseline:', after.baseline);  // one value = 2
     console.log('Virtues reset to:', after.virtues);        // should equal new baseline
   })"
   ```
3. Commit: `feat: add death and resurrection with baseline rise`

**Week 3 acceptance check:**
- Combat turn completes without error
- Death triggers baseline rise
- Player starts new run with raised floor

---

## Week 4: Encounter System

### Task 4.1: Encounter types (`src/engine/encounter/types.ts`)

**File:** `src/engine/encounter/types.ts`

```typescript
import type { VirtueName } from '../enemies/types.js';

export type EncounterCategory = 'desert-fathers' | 'demonic' | 'icons' | 'monastic' | 'martyrdom';

export type VirtueEffect = Partial<Record<VirtueName, number>>;

export type Choice = {
  id: string;
  text: string;
  hoverHint: string;        // shown on hover — subtle virtue hint
  virtueEffects: VirtueEffect;
  combatModifier?: {        // optional: affects next combat
    damageBonus?: number;
    hpBonus?: number;
  };
};

export type Encounter = {
  id: string;
  category: EncounterCategory;
  title: string;
  narrative: string;
  orthodoxConcept: string;  // e.g. "Hesychasm", "Kenosis"
  choices: [Choice, Choice, Choice];   // always exactly 3
};
```

**Steps:**
1. Write the type file
2. Commit: `feat: add encounter and choice type definitions`

---

### Task 4.2: Encounter resolver (`src/engine/encounter/resolver.ts`)

**File:** `src/engine/encounter/resolver.ts`

```typescript
import type { PlayerState } from '../player.js';
import type { Encounter, Choice } from './types.js';
import { applyVirtueChange } from '../virtue/progression.js';

export function applyChoice(player: PlayerState, choice: Choice): PlayerState { ... }
export function selectEncounters(pool: Encounter[], count: number): Encounter[] { ... }
```

**Steps:**
1. `applyChoice` → calls `applyVirtueChange` with choice's virtueEffects, applies combatModifier to player state
2. `selectEncounters` → uses rot-js `RNG.shuffle(pool).slice(0, count)` for random selection without repeats
3. Test: apply a choice with `{ humility: 1 }`, verify player humility increases
4. Commit: `feat: add encounter resolver — apply choices to player state`

---

### Task 4.3: Placeholder encounters (5 test encounters)

**File:** `src/data/encounters/desert-fathers.json` (partial — 1 encounter to test pipeline)

```json
[
  {
    "id": "df-001",
    "category": "desert-fathers",
    "title": "The Hesychast",
    "narrative": "An elder sits in silence. He does not look up when you enter.",
    "orthodoxConcept": "Hesychasm",
    "choices": [
      { "id": "c1", "text": "Sit beside him in silence", "hoverHint": "+Humility", "virtueEffects": { "humility": 1 } },
      { "id": "c2", "text": "Ask him to teach you", "hoverHint": "+Wisdom", "virtueEffects": { "wisdom": 1 } },
      { "id": "c3", "text": "Leave him undisturbed", "hoverHint": "+Temperance", "virtueEffects": { "temperance": 1 } }
    ]
  }
]
```

**Steps:**
1. Write 1 encounter per category (5 total, placeholder quality)
2. Verify JSON parses correctly: `npx tsx -e "import('../data/encounters/desert-fathers.json', {assert: {type:'json'}}).then(console.log)"`
3. Commit: `feat: add 5 placeholder encounters — one per category`

---

### Task 4.4: Build archetype detection (`src/engine/virtue/builds.ts`)

**File:** `src/engine/virtue/builds.ts`

```typescript
import type { VirtueStats } from '../player.js';

export type BuildArchetype = {
  name: string;       // "Hesychast", "Martyr", "Philokalos"
  dominantVirtue: string;
  description: string;
};

export function detectBuild(virtues: VirtueStats): BuildArchetype { ... }
```

**Steps:**
1. Find the virtue with the highest value
2. Map to archetype name (Orthodox-themed):
   - Humility dominant → "Hesychast" ("The one who practices inner stillness")
   - Courage dominant → "Martyr" ("Witness through sacrifice")
   - Temperance dominant → "Ascetic" ("Master of the passions")
   - Wisdom dominant → "Theologian" ("Knower of God through reason")
   - Love dominant → "Philokalos" ("Lover of the Beautiful")
3. If two virtues tied → combine: "Martyr-Ascetic", etc.
4. Test: `{ humility: 5, courage: 1, ... }` → "Hesychast"
5. Commit: `feat: add build archetype detection — Orthodox-themed names`

---

### Task 4.5: End-to-end game loop test

Verify full run cycle without UI:

```bash
npx tsx -e "
Promise.all([
  import('./src/engine/player.ts'),
  import('./src/engine/dungeon/floor.ts'),
  import('./src/engine/enemies/registry.ts'),
  import('./src/engine/virtue/progression.ts'),
  import('./src/engine/virtue/builds.ts'),
]).then(([{createInitialPlayer}, {createFloor}, {spawnEnemiesForFloor}, {applyDeath, checkTheosis}, {detectBuild}]) => {
  let player = createInitialPlayer();
  const floor = createFloor(1);
  const enemies = spawnEnemiesForFloor(1);
  console.log('Run started. Player:', player.virtues);
  console.log('Floor enemies:', enemies.map(e => e.name));
  console.log('Build:', detectBuild(player.virtues).name);
  player = applyDeath(player);
  console.log('After death. Baseline:', player.baseline);
  console.log('Theosis:', checkTheosis(player.virtues));
})"
```

Expect: no errors, correct output for each step.

**Commit:** `feat: m1 complete — full engine loop verified end-to-end`

---

## M1 Final Acceptance Criteria

- [ ] Map generates via rot-js Digger
- [ ] Player has state with virtues + baseline
- [ ] Death resets virtues to baseline, baseline rises
- [ ] Enemy spawns by floor with correct scaling
- [ ] Combat turn resolves: player action → enemy intent → damage calc
- [ ] Encounter fires, choice applied, virtue changes
- [ ] Build name detected from dominant virtue
- [ ] All files ≤ 200 lines

## Next: Milestone 2
See `docs/plans/milestone-2-content-layer.md`
