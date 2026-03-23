# Milestone 3: UI Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** All 5 screens polished. Gen Alpha UX. No rough edges.

**Architecture:** React components via Ink.js. Each screen is ≤200 lines. Shared state passed as props — no global state manager. Screen routing via a single `currentScreen` string in root App state.

**Tech Stack:** TypeScript · Ink.js 6.8 · React 19 · rot-js (engine already built)

---

## Resume Context (read this after /clear)

Project: THEOSIS — terminal roguelike at `/Users/faka/code/projects/theosis`
- M0: scaffold · M1: engine · M2: content (50 encounters, 10 enemies, 50 abilities)
- **Current milestone: M3** — building all UI screens
- `npm run dev` → tsx watch · `npm run build` → esbuild ESM bundle
- Entry point: `src/index.tsx`

**Color palette:**
- Background: `#0a0a0a` · Text: `#e8e8e8` · Gold: `#d4af37` · Virtue purple: `#6b4ba0` · Critical cyan: `#00d9ff`

**Screen list:** DungeonMap · Combat · Encounter · Stats · Death · Theosis · (MainMenu)

**Ink.js key APIs:**
- `useInput(handler)` → keyboard input
- `useApp()` → `{ exit }` for quit
- `useStdout()` → terminal size
- `<Box>`, `<Text>` → layout and text
- `<Static>` → non-re-rendering content

**Control scheme:**
- Arrow/WASD → dungeon movement
- 1/2/3/4 → choices and combat actions
- Tab → cycle screens
- ? → help overlay
- ESC/Q → quit

---

## Week 9: Core Screens (Grid + Combat)

### Task 9.1: Grid component (`src/ui/components/Grid.tsx`)

Renders the dungeon map. Symbols: `@` = player, `ε` = enemy, `#` = wall, `.` = floor, ` ` = unknown/fog.

```tsx
type GridProps = {
  map: DungeonMap;
  playerX: number;
  playerY: number;
  enemies: EnemyOnFloor[];
  visibleTiles: VisibleTiles;
  width: number;
  height: number;
};
```

**Steps:**
1. Iterate rows 0→height, cols 0→width
2. For each tile: if not in `visibleTiles` → render as dark space
3. If player position → `@` in gold
4. If enemy position → `ε` in red
5. If wall → `#` in dim white
6. If floor → `.` in very dim (#333)
7. Use `<Box flexDirection="column">` wrapping rows of `<Text>` per row
8. Test: `npx tsx -e "import('./src/ui/components/Grid.tsx')"` — no errors
9. Commit: `feat: add Grid dungeon renderer component`

---

### Task 9.2: VirtueBar component (`src/ui/components/VirtueBar.tsx`)

Animated progress bar for each virtue. Width scales with terminal.

```tsx
type VirtueBarProps = {
  name: string;
  value: number;     // 1-10
  max: number;       // always 10
  color: string;
  width?: number;    // bar width in chars, default 20
};
```

**Steps:**
1. Filled chars: `█` × Math.round(value/max × width)
2. Empty chars: `░` × (width - filled)
3. Label: `{name.padEnd(12)} {filled}{empty} {value}/{max}`
4. Use virtue color for fill, dim color for empty
5. Test renders: value=5, max=10, width=20 → 10 filled, 10 empty
6. Commit: `feat: add VirtueBar component`

---

### Task 9.3: EnemyCard component (`src/ui/components/EnemyCard.tsx`)

Shows enemy name, HP bar, intent, and weakness (if revealed).

```tsx
type EnemyCardProps = {
  enemy: EnemyOnFloor & { template: EnemyTemplate };
  intent: EnemyIntent | null;
  weaknessRevealed: boolean;
};
```

**Steps:**
1. Enemy name in red, orthodox name in dim
2. HP bar using same bar pattern as VirtueBar (red fill)
3. Intent: `▶ {intent.description}` in yellow
4. If `weaknessRevealed`: show `⚠ Weak to {weakness}` in cyan
5. Commit: `feat: add EnemyCard component`

---

### Task 9.4: DungeonMap screen (`src/ui/screens/DungeonMap.tsx`)

Main dungeon exploration screen. Grid left, stats sidebar right.

```
┌─────────────────────────────────┬────────────────┐
│ Floor 3                         │ THEOSIS        │
│                                 │                │
│  . . . . # # # # # # . . .     │ HP: ████░░ 15/20│
│  . @ . . # . . . . # . . .     │                │
│  . . . . # . ε . . # . . .     │ Humility   ███░│
│  . . . . # # # # # # . . .     │ Courage    █░░░│
│                                 │ Temperance █░░░│
│                                 │ Wisdom     ██░░│
│                                 │ Love       ██░░│
│                                 │                │
│                                 │ Build:         │
│                                 │ Hesychast      │
└─────────────────────────────────┴────────────────┘
 WASD: Move  E: Encounter  ?: Help  Q: Quit
```

**Steps:**
1. `useStdout()` for terminal dimensions
2. Split horizontally: grid (70% width) + sidebar (30%)
3. Sidebar: HP bar, 5 VirtueBars, build name
4. Footer: control hints
5. `useInput` for WASD/arrow movement — update player position, recompute FOV
6. On player entering exit tile → call `onFloorComplete()` prop
7. On player entering enemy tile → call `onCombatStart(enemyId)` prop
8. Commit: `feat: add DungeonMap screen`

---

### Task 9.5: ChoiceMenu component (`src/ui/components/ChoiceMenu.tsx`)

Reusable numbered choice list with hover state.

```tsx
type ChoiceMenuProps = {
  choices: Array<{ id: string; text: string; hoverHint?: string }>;
  onSelect: (id: string) => void;
  selectedIndex?: number;
};
```

**Steps:**
1. Render as numbered list: `[1] Choice text`
2. Track `hoveredIndex` with useState (keyboard arrow navigation)
3. Hovered item: `▶ [1] Choice text  hint` (hint appears on right in dim gold)
4. `useInput`: 1/2/3/4 → select directly; Up/Down → change hover; Enter → confirm hovered
5. Commit: `feat: add ChoiceMenu component with hover states`

---

### Task 9.6: Combat screen (`src/ui/screens/Combat.tsx`)

Turn-based combat screen.

```
┌─────────────────────────────────────────────────────┐
│ COMBAT — Floor 3                                    │
│                                                     │
│  [Demon of Pride — Prelest]                         │
│  HP: ████████░░ 8/12    ▶ About to strike your ego  │
│                                                     │
│  Your actions:                                      │
│  ▶ [1] Prostration      Humility · dmg 2 · +shield  │
│    [2] Stand Firm        Courage  · dmg 5           │
│    [3] Fast              Temp.    · dmg 3 · -debuff  │
│    [4] Discernment       Wisdom   · dmg 3 · reveal   │
│                                                     │
│  HP: ████████████░░░ 15/20                          │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. Top: EnemyCard with current intent
2. Middle: ChoiceMenu of 4 combat actions (current virtue L1-L4 abilities)
3. Bottom: player HP bar
4. On action select → call `onPlayerAction(actionId)` prop
5. After player action → show enemy turn with animation delay (200ms)
6. Log last 3 combat events in a scrolling log at bottom
7. Commit: `feat: add Combat screen`

**Week 9 acceptance check:**
- Run `npm run dev`, manually verify Grid renders
- VirtueBar fills correctly at different values
- Combat screen shows all 4 actions, hover works

---

## Week 10: Narrative + Stats Screens

### Task 10.1: Encounter screen (`src/ui/screens/Encounter.tsx`)

```
┌─────────────────────────────────────────────────────┐
│ THE HESYCHAST              [Hesychasm]               │
│                                                     │
│ An elder sits in silence. He does not look up       │
│ when you enter. The stillness is not emptiness.     │
│ Something breathes here.                            │
│                                                     │
│  ▶ [1] Sit beside him in silence      +Humility     │
│    [2] Ask him to teach you           +Wisdom       │
│    [3] Leave him undisturbed          +Temperance   │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. Title (gold) + Orthodox concept (dim, right-aligned)
2. Narrative text (white, wrapped to terminal width)
3. ChoiceMenu with 3 choices
4. Hover shows `hoverHint` on right (dim gold, virtue name only — not numeric value)
5. On select → call `onChoiceSelected(choiceId)` prop
6. Commit: `feat: add Encounter screen`

---

### Task 10.2: Stats screen (`src/ui/screens/Stats.tsx`)

Virtue progression chart + build identity + run history.

```
┌─────────────────────────────────────────────────────┐
│ YOUR SOUL                          Run 7 · Floor 4  │
│                                                     │
│ Current Build: Hesychast                            │
│                                                     │
│ Humility    ████████░░ 8/10  baseline: 3            │
│ Courage     ███░░░░░░░ 3/10  baseline: 1            │
│ Temperance  █████░░░░░ 5/10  baseline: 2            │
│ Wisdom      ██████░░░░ 6/10  baseline: 2            │
│ Love        ████░░░░░░ 4/10  baseline: 2            │
│                                                     │
│ Progress to Theosis: 52%                            │
│ (all virtues must reach 10)                         │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. VirtueBars for current virtues + baseline indicators
2. Progress to theosis: `min(all virtues) / 10 * 100` (bottleneck metric)
3. Build identity name in gold
4. Run number + current floor
5. Commit: `feat: add Stats screen`

---

### Task 10.3: Transition component (`src/ui/components/Transition.tsx`)

200ms fade effect between screen changes.

```tsx
type TransitionProps = {
  show: boolean;
  children: React.ReactNode;
};
```

**Steps:**
1. Ink doesn't have CSS transitions — simulate with a brief clear + redraw cycle
2. On `show` change: render blank screen for 1 frame, then render children
3. Use `useEffect` with `setTimeout(fn, 200)` to delay child render
4. Commit: `feat: add Transition component — 200ms screen fade`

---

### Task 10.4: Screen router (update `src/index.tsx`)

Wire all screens together with keyboard routing.

```tsx
type Screen = 'menu' | 'dungeon' | 'combat' | 'encounter' | 'stats' | 'death' | 'theosis';
```

**Steps:**
1. Root App holds `currentScreen` state + all game state
2. Render correct screen based on `currentScreen`
3. Tab → cycle between dungeon/stats (other screens are triggered by events)
4. Each screen has `onComplete` / `onBack` / `onNext` callbacks that update `currentScreen`
5. Wrap each screen change in `<Transition>`
6. Commit: `feat: add screen router — all screens wired together`

**Week 10 acceptance check:**
- Tab cycles between dungeon and stats
- Encounter screen displays narrative + choices
- Selecting choice returns to dungeon

---

## Week 11: Death + Theosis Screens

### Task 11.1: Death screen (`src/ui/screens/Death.tsx`)

```
┌─────────────────────────────────────────────────────┐
│ YOU HAVE FALLEN                                     │
│                                                     │
│ Killed by: Demon of Pride (Prelest) — Floor 4       │
│                                                     │
│ What the run revealed:                              │
│ You built Humility to 8, but neglected Love (2).    │
│ The Demon of Pride attacked through isolation.      │
│ Humility without Love becomes its own pride.        │
│                                                     │
│ Baseline rises:  Courage 1 → 2                      │
│                                                     │
│ Run 8 begins.                [ENTER] Rise Again     │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. Display killer + floor
2. Generate virtue analysis text (2-3 sentences, static templates based on weakest virtue):
   - Lowest virtue < 3: "You neglected {virtue}. The {demon} exploited this."
   - Highest virtue > 7 but lowest < 3: "Your {highVirtue} was great, but imbalance became the wound."
3. Show which baseline virtue rose (from progression logic)
4. ENTER → call `onNewRun()` prop
5. Commit: `feat: add Death screen with virtue analysis`

---

### Task 11.2: Theosis screen (`src/ui/screens/Theosis.tsx`)

The revelation. Shown only when all virtues reach 10.

```
┌─────────────────────────────────────────────────────┐
│                    ΘΕΩΣΙΣ                           │
│                                                     │
│ "God became man so that man might become God."      │
│                          — St. Athanasius           │
│                                                     │
│ What you built in this dungeon:                     │
│  Kenosis → the "Kenosis Build" was self-emptying    │
│  Hesychia → stillness you fought to protect         │
│  Agape    → the love that wouldn't break            │
│                                                     │
│ These are not game mechanics.                       │
│ They are the path the Orthodox have walked          │
│ for two thousand years.                             │
│                                                     │
│ Want to go deeper?                                  │
│ discord.gg/theosis   |   philokalia.io              │
│                                                     │
│ [R] Play again   [Q] Quit                           │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. Display St. Athanasius quote in gold
2. Map player's dominant abilities to their theological meaning (3 lines)
3. Explicit revelation paragraph — direct, not preachy
4. Community links (Discord + reading link)
5. R → new run · Q → quit
6. Commit: `feat: add Theosis revelation screen`

---

### Task 11.3: Sound toggle

Optional bell on virtue gain. Toggle at startup.

**Steps:**
1. Add `soundEnabled: boolean` to app state, default `true`
2. On startup screen: `[S] Toggle sound (currently ON)`
3. When `soundEnabled` and virtue increases: `process.stdout.write('\x07')` (terminal bell)
4. Commit: `feat: add optional terminal bell on virtue gain`

---

### Task 11.4: Responsive layout

UI must not break at 80×24 (minimum) or 200×50 (wide).

**Steps:**
1. Use `useStdout()` to get `{ columns, rows }`
2. In Grid: if columns < 100, reduce map width to 40 cols
3. In sidebar: if columns < 80, collapse to abbreviated bar display
4. In all text: wrap at `Math.min(columns - 4, 80)` chars
5. Test at 80 cols: `COLUMNS=80 npm run dev`
6. Commit: `feat: responsive layout — adapts 80×24 to 200×50`

---

## Week 12: Controls + Polish

### Task 12.1: Main menu (`src/ui/screens/MainMenu.tsx`)

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ████████╗██╗  ██╗███████╗ ██████╗ ███████╗██╗...  │
│  (full THEOSIS ASCII art in gold)                   │
│                                                     │
│  The virtue that wins wars.                         │
│  The kenosis that breaks demons.                    │
│                                                     │
│  [ENTER]  Begin                                     │
│  [S]      Sound: ON                                 │
│  [?]      Controls                                  │
│  [Q]      Quit                                      │
│                                                     │
│  v0.1.0                                             │
└─────────────────────────────────────────────────────┘
```

**Steps:**
1. Same THEOSIS ASCII from initial index.tsx
2. Menu options: Enter/S/\?/Q with `useInput`
3. Enter → start new game (go to dungeon screen)
4. Commit: `feat: add main menu screen`

---

### Task 12.2: Help overlay

Context-sensitive `?` overlay over any screen.

**Steps:**
1. `showHelp: boolean` state in root App
2. `?` toggles it from any screen
3. Overlay renders over current screen (Box with absolute-like positioning)
4. Shows controls for current screen context
5. ESC or `?` again → close
6. Commit: `feat: add context-sensitive help overlay`

---

### Task 12.3: Full control pass

Verify all controls work end-to-end.

**Checklist:**
- [ ] WASD + Arrow keys: dungeon movement
- [ ] 1/2/3/4: combat actions and encounter choices
- [ ] Tab: cycle dungeon ↔ stats
- [ ] ?: toggle help overlay
- [ ] Mouse click: interactive elements (Ink `onClick` prop)
- [ ] ESC: close overlay / return to previous screen
- [ ] Q: quit from any screen (confirm prompt)

**Steps:**
1. Add mouse support: `<Text onClick={() => ...}>` on all interactive elements
2. Add ESC handler in `useInput` — context-sensitive (close overlay or quit-confirm)
3. Q → show "Quit? [Y/N]" confirm, Y → `exit()`
4. Manual test all controls
5. Commit: `feat: complete control scheme — keyboard and mouse`

---

## M3 Final Acceptance Criteria

- [ ] DungeonMap renders grid + sidebar + virtue bars
- [ ] Combat screen shows enemy intent + 4 actions + hover
- [ ] Encounter screen shows narrative + 3 choices + hover hints
- [ ] Stats screen shows virtue progression + build name
- [ ] Death screen shows killer + virtue analysis + baseline rise
- [ ] Theosis screen shows Orthodox revelation + community links
- [ ] All transitions are smooth (no flicker)
- [ ] All controls work: keyboard and mouse
- [ ] Tested at 80×24 terminal — no overflow or crash
- [ ] Tested at 200×50 terminal — uses extra space gracefully
- [ ] All screen files ≤ 200 lines

## Next: Milestone 4
See `docs/plans/milestone-4-launch-prep.md`
