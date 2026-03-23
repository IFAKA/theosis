# Milestone 2: Content Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 50 real encounters, all enemies, all abilities. Orthodox theology visible throughout.

**Architecture:** All content is JSON data files. Engine remains unchanged. Theology is hand-crafted — never AI-generated.

**Tech Stack:** TypeScript · JSON data files · rot-js (already integrated)

---

## Resume Context (read this after /clear)

Project: THEOSIS — terminal roguelike at `/Users/faka/code/projects/theosis`
- M0 commit: `6fbd01d` — scaffold
- M1 complete: engine layer done — player state, dungeon gen, combat loop, encounter system, virtue progression
- **Current milestone: M2** — filling content: 50 encounters, 10 enemies, 50 abilities
- `npm run dev` → hot reload · `npm run build` → dist/theosis.mjs

**Encounter schema:**
```json
{
  "id": "df-001",
  "category": "desert-fathers",
  "title": "string",
  "narrative": "string (2-4 sentences, poetic, not preachy)",
  "orthodoxConcept": "string (e.g. Hesychasm, Kenosis)",
  "choices": [
    { "id": "c1", "text": "string", "hoverHint": "string", "virtueEffects": { "humility": 1 } },
    { "id": "c2", ... },
    { "id": "c3", ... }
  ]
}
```

**Five enemy demons (base):**
- Prelest (Pride) → weakness: humility
- Acedia (Despair) → weakness: love
- Kenodoxia (Vainglory) → weakness: wisdom
- Thymos (Anger) → weakness: temperance
- Porneia (Lust) → weakness: courage

**Five virtues:** humility · courage · temperance · wisdom · love

---

## Week 5: Desert Fathers + Demonic Encounters (20 encounters)

### Task 5.1: Desert Fathers encounters (`src/data/encounters/desert-fathers.json`)

10 encounters. Themes: hesychasm, inner stillness, prayer, askesis, the Jesus Prayer, spiritual fathers, silence, nepsis (watchfulness), logismoi (thoughts), neptic tradition.

**Writing rules:**
- Narrative: 2-4 sentences. Poetic, concrete, not abstract.
- No explicit preaching. Let the encounter speak.
- Choices: 3 always. Each maps to a different virtue. No "right" answer visually.
- `hoverHint`: just "+VirtueName" — subtle, not explanatory.
- Use Orthodox Greek terms naturally in narrative (nepsis, hesychia, logismoi, nous, philokalia).

**Encounter list to write:**
1. `df-001` — The Hesychast elder in silence (hesychasm)
2. `df-002` — The Jesus Prayer — warrior monks at Sinai (prayer, nepsis)
3. `df-003` — Logismoi — a wandering thought that won't leave (neptic battle)
4. `df-004` — The Philokalia — a text found in the dust (wisdom, theoria)
5. `df-005` — Apatheia — the elder who does not react to insults (temperance)
6. `df-006` — The abba who washes feet of enemies (love, humility)
7. `df-007` — Fasting in the desert, 40 days (temperance, courage)
8. `df-008` — The elder who refuses disciples (humility)
9. `df-009` — Night vigil in the cold chapel (courage, love)
10. `df-010` — "My thought told me to rest" — the demon of acedia disguised (wisdom)

**Steps:**
1. Write all 10 in `src/data/encounters/desert-fathers.json`
2. Verify JSON valid: `node -e "JSON.parse(require('fs').readFileSync('src/data/encounters/desert-fathers.json','utf8'))"`
3. Verify exactly 3 choices per encounter
4. Commit: `content: add 10 desert fathers encounters`

---

### Task 5.2: Demonic encounters (`src/data/encounters/demonic.json`)

10 encounters. Each encounter is a manifestation of an Orthodox demon. Player must discern and resist.

**Theological grounding:**
- Each demon has a specific mode of attack (logismos = demonic thought)
- Demons don't announce themselves — they appear as reasonable thoughts
- Orthodox demonology: demons test through comfort, not obvious evil

**Encounter list:**
1. `dm-001` — Prelest: "You have achieved much. Rest and enjoy it." (Pride, self-delusion)
2. `dm-002` — Acedia: "Nothing matters. Why continue?" (Despair, sloth of soul)
3. `dm-003` — Kenodoxia: "They will respect you if you do this." (Vainglory, performance)
4. `dm-004` — Thymos: "The injustice demands a response." (Anger at legitimate wrong)
5. `dm-005` — Porneia: "This is just comfort. You deserve it." (Lust disguised as comfort)
6. `dm-006` — Prelest variant: The demon appears as an angel of light (2 Cor 11:14)
7. `dm-007` — Acedia variant: "You've tried enough. Stop." (Spiritual exhaustion)
8. `dm-008` — Kenodoxia variant: The urge to be seen praying
9. `dm-009` — Thymos variant: Righteous anger that becomes consuming
10. `dm-010` — A demon offers a shortcut to theosis ("You can skip the cross")

**Steps:**
1. Write all 10 in `src/data/encounters/demonic.json`
2. Each encounter should have one "Orthodox" choice that costs virtue short-term but protects long-term
3. Verify JSON valid
4. Commit: `content: add 10 demonic encounters — Orthodox demonology`

---

### Task 5.3: Validate 20 encounters load

```bash
npx tsx -e "
Promise.all([
  import('./src/data/encounters/desert-fathers.json', {assert:{type:'json'}}),
  import('./src/data/encounters/demonic.json', {assert:{type:'json'}}),
]).then(([df, dm]) => {
  const all = [...df.default, ...dm.default];
  console.log('Total encounters:', all.length); // 20
  const valid = all.every(e => e.choices.length === 3);
  console.log('All have 3 choices:', valid);    // true
})"
```

**Commit:** `test: verify 20 encounters load and validate`

---

## Week 6: Icons + Monastic + Martyrdom Encounters (30 more = 50 total)

### Task 6.1: Icons encounters (`src/data/encounters/icons.json`)

10 encounters. Themes: sacred beauty, iconography, theoria (vision of God), apophatic theology, light of Tabor, icon veneration.

**Encounter list:**
1. `ic-001` — Standing before an icon of Christ in a dark corridor
2. `ic-002` — The Transfiguration — uncreated light glimpsed in battle
3. `ic-003` — An iconographer who paints in fasting and prayer
4. `ic-004` — A broken icon — what does the warrior do?
5. `ic-005` — The Theotokos icon — "She who is quicker to hear"
6. `ic-006` — Apophatic moment: what cannot be named
7. `ic-007` — The reverse perspective of icons — you are being looked at
8. `ic-008` — St. Andrei Rublev's Trinity — the three sit at the table with an empty chair
9. `ic-009` — The warrior finds beauty in ruins — the eye trained by icons
10. `ic-010` — Iconoclasm: the impulse to destroy what is beautiful

**Steps:**
1. Write all 10, commit: `content: add 10 icon encounters`

---

### Task 6.2: Monastic encounters (`src/data/encounters/monastic.json`)

10 encounters. Themes: asceticism, fasting, liturgy, community, obedience, the cell, prayer rule, typikon.

**Encounter list:**
1. `mn-001` — The great schema monk — beyond words
2. `mn-002` — Obedience: the elder gives an absurd command
3. `mn-003` — The cell: "Stay in your cell and your cell will teach you everything"
4. `mn-004` — All-night vigil — the body rebels
5. `mn-005` — The broken fast — what to do
6. `mn-006` — A young monk tempted to leave
7. `mn-007` — The abbot who never speaks of spiritual things (shows by doing)
8. `mn-008` — Liturgy in the dark — the meaning emerges in darkness
9. `mn-009` — Community conflict — two monks in dispute
10. `mn-010` — Poverty: owning nothing

**Steps:**
1. Write all 10, commit: `content: add 10 monastic encounters`

---

### Task 6.3: Martyrdom encounters (`src/data/encounters/martyrdom.json`)

10 encounters. Themes: sacrifice, witness (martys = witness), love unto death, courage in suffering, the blood of martyrs.

**Encounter list:**
1. `mt-001` — The choice to deny or confess
2. `mt-002` — Praying for your executioner
3. `mt-003` — The martyr who walked forward singing
4. `mt-004` — What you leave behind — martyrdom as gift
5. `mt-005` — Fear before the end — courage is not absence of fear
6. `mt-006` — The witness who was not killed but lived as if dead (confessor)
7. `mt-007` — The arena — the crowd expects entertainment, not witness
8. `mt-008` — Love your enemies: in extremis
9. `mt-009` — The martyr's last prayer — what do you ask for?
10. `mt-010` — After the martyrdom — the community that remains

**Steps:**
1. Write all 10, commit: `content: add 10 martyrdom encounters`

---

### Task 6.4: Validate all 50 encounters

```bash
npx tsx -e "
Promise.all([
  import('./src/data/encounters/desert-fathers.json', {assert:{type:'json'}}),
  import('./src/data/encounters/demonic.json', {assert:{type:'json'}}),
  import('./src/data/encounters/icons.json', {assert:{type:'json'}}),
  import('./src/data/encounters/monastic.json', {assert:{type:'json'}}),
  import('./src/data/encounters/martyrdom.json', {assert:{type:'json'}}),
]).then(arrays => {
  const all = arrays.flatMap(a => a.default);
  console.log('Total:', all.length); // 50
  const ids = all.map(e => e.id);
  const unique = new Set(ids);
  console.log('Unique IDs:', unique.size === 50); // true — no duplicates
  const valid = all.every(e => e.choices.length === 3 && e.narrative && e.orthodoxConcept);
  console.log('All valid:', valid); // true
})"
```

**Commit:** `content: all 50 encounters complete and validated`

---

## Week 7: Enemy Content + Abilities

### Task 7.1: Full enemies data (`src/data/enemies.json`)

10 enemies: 5 base + 5 elite variants (floor 5+).

```json
[
  {
    "id": "prelest",
    "name": "Demon of Pride",
    "orthodoxName": "Prelest",
    "symbol": "P",
    "weakness": "humility",
    "baseHp": 12,
    "baseDamage": 3,
    "floorMinimum": 1,
    "isElite": false,
    "description": "The demon of spiritual self-delusion. Mistakes itself for an angel.",
    "intent": [
      "Inflates your pride",
      "Whispers of your superiority",
      "Strikes at your humility"
    ]
  }
]
```

**Steps:**
1. Write all 10 enemies in `src/data/enemies.json`
2. Elite variants: same weakness, 2× HP, 1.5× damage, floor 5+
   - Elite Prelest: "Archon of Pride"
   - Elite Acedia: "Lord of Sloth"
   - Elite Kenodoxia: "Prince of Vanity"
   - Elite Thymos: "Duke of Wrath"
   - Elite Porneia: "Seraph of Corruption" (demonic mockery)
3. Update `enemies/registry.ts` to load from JSON instead of hardcoded types
4. Verify all 10 load: `npx tsx -e "import('./src/data/enemies.json', {assert:{type:'json'}}).then(m => console.log(m.default.length))"` → 10
5. Commit: `content: add full enemies.json — 10 Orthodox demons`

---

### Task 7.2: Weakness system integration

**File:** `src/engine/combat/damage.ts` (extend existing)

Wisdom at level ≥ 3 reveals enemy weakness in combat UI.

**Steps:**
1. Add `isWeaknessRevealed(wisdomLevel: number): boolean` → returns `wisdomLevel >= 3`
2. Pass through to combat UI (will be displayed in M3)
3. In damage calc: weakness exploitation always applies — Wisdom only affects whether player *knows* about it
4. Test: high-wisdom player vs Prelest → weakness revealed; low-wisdom → hidden
5. Commit: `feat: wisdom reveals enemy weakness at level 3+`

---

### Task 7.3: Full abilities data (`src/data/abilities.json`)

50 abilities: 10 per virtue, L1-L10. Each level should feel meaningfully different.

**Ability naming convention (Orthodox-themed per virtue):**
- **Humility**: Prostration → Kenosis → Self-Emptying → Humility of God → Theanthropy → ...
- **Courage**: Stand Firm → Witness → Confession → Martyrdom → Great Martyrdom → ...
- **Temperance**: Fast → Great Fast → Nepsis → Enkrateia → Apatheia → ...
- **Wisdom**: Discernment → Diakrisis → Theoria → Nous-Purification → Apophasis → ...
- **Love**: Agape → Philoxenia → Eros-Transformed → Kenotic-Love → Theotic-Love → ...

**Damage multiplier scale:** L1=0.8 → L10=2.5 (linear scale, each level +0.18)

**Steps:**
1. Write all 50 entries in `src/data/abilities.json`
2. Each: `{ "level": N, "name": "...", "damageMultiplier": X.X, "description": "...", "specialEffect": "..." }`
3. Update `combat/actions.ts` to load from JSON
4. Verify: `npx tsx -e "import('./src/data/abilities.json', {assert:{type:'json'}}).then(m => console.log(Object.keys(m.default).map(k => m.default[k].length)))"` → `[10,10,10,10,10]`
5. Commit: `content: add abilities.json — 50 Orthodox-named abilities L1-L10`

---

## Week 8: Theosis System + Difficulty Scaling

### Task 8.1: Theosis condition and win screen trigger

**File:** `src/engine/virtue/progression.ts` (extend)

```typescript
export function checkTheosis(virtues: VirtueStats): boolean {
  return VIRTUE_NAMES.every(v => virtues[v] >= THEOSIS_THRESHOLD);  // all ≥ 10
}
```

**Steps:**
1. Already written in M1 — verify it works
2. Add to game loop: after each combat win, check `checkTheosis(player.virtues)`
3. If true → route to Theosis screen (screen routing implemented in M3)
4. For now: log "THEOSIS ACHIEVED" to console
5. Commit: `feat: integrate theosis win condition check into game loop`

---

### Task 8.2: Difficulty scaling formula

**File:** `src/engine/enemies/registry.ts` (extend)

Enemy HP and damage scale with sum of player virtues.

```typescript
export function getDifficultyMultiplier(virtues: VirtueStats): number {
  const sum = Object.values(virtues).reduce((a, b) => a + b, 0);
  // Base = 5 virtues × 1 = 5. At theosis = 5 × 10 = 50.
  // Scale: 1.0 at sum=5, asymptotically approaching 3.0 at sum=50
  return 1 + (2 * (sum - 5)) / (sum - 5 + 20);
}
```

**Steps:**
1. Write and export `getDifficultyMultiplier`
2. Apply in `scaleEnemy`: multiply baseHp and baseDamage by difficulty multiplier
3. Test: sum=5 → multiplier≈1.0, sum=25 → multiplier≈1.5, sum=50 → multiplier≈2.33
4. Commit: `feat: add asymptotic difficulty scaling — harder as virtues rise`

---

### Task 8.3: Run stats tracking

**File:** `src/engine/player.ts` (extend PlayerState)

Add fields for stats tracking (used in death screen analysis).

```typescript
export type RunStats = {
  runNumber: number;
  floorsCleared: number;
  enemiesDefeated: number;
  killedBy: string | null;       // enemy name
  peakVirtues: VirtueStats;      // highest values reached in this run
  encountersSeen: string[];      // encounter IDs
};
```

**Steps:**
1. Add `RunStats` type and `currentRunStats: RunStats` field to `PlayerState`
2. Update `createInitialPlayer` to init `currentRunStats`
3. After each combat: increment `enemiesDefeated`, update `peakVirtues`
4. On death: capture `killedBy`, pass to death screen
5. Commit: `feat: add run stats tracking for death screen analysis`

---

### Task 8.4: Lore data (`src/data/lore.json`)

5 Orthodox concepts for deeper reading. Shown optionally on Theosis screen.

```json
[
  {
    "concept": "Theosis",
    "greek": "Θέωσις",
    "oneLine": "Union with God — becoming by grace what God is by nature.",
    "source": "St. Athanasius, On the Incarnation",
    "quote": "God became man so that man might become God.",
    "readingList": ["On the Incarnation — St. Athanasius", "The Ladder of Divine Ascent — St. John Climacus"]
  }
]
```

**Steps:**
1. Write 5 entries: Theosis, Kenosis, Nous, Metanoia, Askesis
2. Each: concept, greek, oneLine, source, quote, readingList (2-3 books)
3. Commit: `content: add lore.json — 5 Orthodox concepts with reading lists`

---

## M2 Final Acceptance Criteria

- [ ] 50 encounters load with no JSON errors
- [ ] No duplicate encounter IDs across all 5 files
- [ ] All encounters have exactly 3 choices
- [ ] All 10 enemies load from enemies.json with correct weaknesses
- [ ] All 50 abilities load from abilities.json
- [ ] Difficulty scaling: enemy HP higher with high virtue sum
- [ ] Theosis condition detected correctly
- [ ] Run stats populate during a run
- [ ] No encounter text feels preachy — test by reading aloud to a non-religious person

## Next: Milestone 3
See `docs/plans/milestone-3-ui-layer.md`
