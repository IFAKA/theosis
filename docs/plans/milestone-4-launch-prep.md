# Milestone 4: Launch Prep Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Game ready to ship. No known bugs. Launch materials ready.

**Architecture:** No new features. Balance tuning, QA, platform testing, and launch materials only.

**Tech Stack:** TypeScript · Ink.js · rot-js · esbuild · GitHub · itch.io

---

## Resume Context (read this after /clear)

Project: THEOSIS — terminal roguelike at `/Users/faka/code/projects/theosis`
- M0: scaffold · M1: engine · M2: 50 encounters + 10 enemies + 50 abilities · M3: all 7 screens polished
- **Current milestone: M4** — balance, QA, and launch
- `npm run dev` → hot reload · `npm run build` → dist/theosis.mjs
- GitHub: IFAKA (gh auth active)
- Target: itch.io + GitHub release + HackerNews + 3 subreddits

**Launch channels (in priority order):**
1. HackerNews (Show HN) — technical audience, highest reach
2. r/roguelikes — mechanical angle, core audience
3. r/IndieGaming — indie angle, broader reach
4. r/OrthodoxChristianity — mission angle, most engaged

**Success metrics:** 2-5k downloads · 300-500 Discord members · 40-50% probability

---

## Week 13: Balance Pass

### Task 13.1: Internal playtesting (5 full runs)

**Not automated — manual playtesting.**

Run the game 5 times, tracking:
- Which enemies killed you on which floor?
- Which encounters did you see? Did any feel preachy?
- Did the theosis condition feel achievable (too easy or too hard)?
- Did combat feel fun vs tedious?
- Did virtue bars move in meaningful ways?

**Tracking sheet** — create `docs/playtest-log.md`:
```markdown
## Run 1
- Died on: Floor 2, killed by: Demon of Anger
- Virtues at death: H:2 C:1 T:1 W:1 L:1
- Felt: too hard — enemies too strong on floor 2
- Encounters seen: df-001, dm-003
- Notes: ...

## Run 2
...
```

**Commit:** `docs: add playtest log — runs 1-5`

---

### Task 13.2: Tune virtue scaling

After playtesting, adjust these formulas based on what felt wrong:

**In `src/engine/enemies/registry.ts`:**
```typescript
// Current: 15% HP increase per floor
const hpMultiplier = 1 + (floor - 1) * 0.15;

// If dying too fast on early floors: reduce to 0.10
// If floors feel trivial later: increase to 0.20
```

**In `src/engine/combat/damage.ts`:**
```typescript
// Current: base = virtue × multiplier
// If combat too fast: reduce multipliers by 20%
// If combat too slow: increase by 20%
```

**Target feel:** Floor 1-2 should be learnable. Floor 3-4 should be challenging. Floor 5+ should require virtue investment.

**Steps:**
1. Adjust multipliers based on playtest notes
2. Run 2 more test runs with new values
3. Commit: `balance: tune enemy scaling and damage formulas`

---

### Task 13.3: Tune encounter virtue consequences

**Target:** No virtue should reach 10 in fewer than 30 runs. No virtue should feel stuck below 5 after 20 runs.

**In `src/data/encounters/*.json`:**
- Most encounters: ±1 to one virtue
- Strong encounters: +2 to one virtue, -1 to another (tradeoffs)
- No encounter should give +3 or more (too fast)

**Steps:**
1. Audit all 50 encounters for virtue consequence values
2. Check: any encounter giving +2 or more? Justify or reduce.
3. Check: any virtue systematically underserved (few encounters reward it)? Add 1-2 encounters.
4. Commit: `balance: tune encounter virtue consequences — no runaway stacking`

---

### Task 13.4: Tune theosis difficulty

**Target:** ~40-60 runs required. Not 10. Not 200.

Analysis:
- Baseline rises by 1 per death (raises the lowest virtue)
- Theosis requires all virtues at 10
- Starting at baseline=1 all virtues: need 9 baseline rises per virtue = ~45 deaths minimum if perfectly balanced
- But perfect balance is rare → expect 60-80 deaths in practice

**If theosis is too easy (< 30 runs):**
- Reduce baseline rise: only raise baseline every 2 deaths
- Or: require all virtues ≥ 12 instead of 10

**If theosis is too hard (> 100 runs):**
- Add mid-run virtue bonuses (rare encounters giving permanent +1)
- Or: lower threshold to 8

**Steps:**
1. Simulate 100 runs on paper (spreadsheet or script)
2. Adjust `THEOSIS_THRESHOLD` or baseline rise frequency
3. Commit: `balance: adjust theosis difficulty — target 40-60 runs`

---

### Task 13.5: Fix combat edge cases

From playtesting, expected edge cases to find and fix:

- [ ] Enemy dies and leaves stale intent on screen
- [ ] Player at 1 HP + Agape (Love) action heals — verify doesn't go negative
- [ ] All enemies defeated simultaneously (rare)
- [ ] Theosis triggers mid-floor (should still allow floor completion)
- [ ] Encounter after floor 5 that only spawns floor 1 enemies (registry filter bug)

**Steps:**
1. For each found edge case: write a tsx test invocation that reproduces it
2. Fix in the appropriate engine file
3. Commit each fix separately: `fix: {description}`

---

## Week 14: QA Pass

### Task 14.1: Encounter display QA

Manually verify all 50 encounters display correctly.

**Checklist per encounter:**
- [ ] Title renders without truncation
- [ ] Narrative wraps correctly at 80 and 120 char terminals
- [ ] All 3 choices display
- [ ] Orthodox concept label renders
- [ ] Hover hint appears correctly

**Steps:**
1. Create a dev mode that cycles through all encounters: `ENCOUNTER_DEBUG=1 npm run dev`
2. Add debug mode in `src/index.tsx`: if env var set, render encounters one-by-one with `n` to advance
3. Manually step through all 50
4. Commit: `test: add encounter debug mode for QA`

---

### Task 14.2: Enemy spawn QA

Verify all 10 enemies spawn correctly and combat resolves.

```bash
# Test script — run each enemy type through a simulated combat
npx tsx -e "
import('./src/engine/enemies/registry.ts').then(async ({spawnEnemiesForFloor}) => {
  for (let floor = 1; floor <= 7; floor++) {
    const enemies = spawnEnemiesForFloor(floor);
    console.log('Floor', floor, ':', enemies.map(e => e.name).join(', '));
  }
})"
```

**Expected:**
- Floor 1-2: only base demons
- Floor 3-4: all base demons possible
- Floor 5+: elite variants appear

**Commit:** `test: verify enemy spawning by floor — all 10 types`

---

### Task 14.3: Death → resurrection → baseline rise

Full cycle test:

```bash
npx tsx -e "
import('./src/engine/player.ts').then(async ({createInitialPlayer}) => {
  import('./src/engine/virtue/progression.ts').then(({applyDeath, checkTheosis}) => {
    let p = createInitialPlayer();
    for (let i = 0; i < 10; i++) {
      p = applyDeath(p);
      console.log('Run', p.runCount, '— baseline:', p.baseline);
    }
  });
})"
```

**Expected:** After 10 deaths, baseline should have spread across virtues (not just one rising).

**Commit:** `test: verify death cycle — baseline rises correctly`

---

### Task 14.4: Theosis condition test

```bash
npx tsx -e "
import('./src/engine/virtue/progression.ts').then(({checkTheosis}) => {
  // Should be false
  console.log(checkTheosis({ humility:9, courage:10, temperance:10, wisdom:10, love:10 })); // false
  // Should be true
  console.log(checkTheosis({ humility:10, courage:10, temperance:10, wisdom:10, love:10 })); // true
})"
```

**Commit:** `test: verify theosis condition — exact threshold`

---

### Task 14.5: Terminal resize crash test

```bash
# Run game, rapidly resize terminal, verify no crash
npm run dev
# Manually resize from 80×24 to 200×50 and back 5 times
# Expected: no crash, layout adapts
```

**If crash:** Identify the component using `useStdout()` without null-checking, add defensive check.

**Commit:** `fix: handle terminal resize gracefully`

---

### Task 14.6: Cross-platform testing

**macOS (current):** Already tested via `npm run dev`

**Linux (bash):**
```bash
# In WSL or Linux VM
cd /path/to/theosis
npm install
npm run dev
# Verify: renders correctly, colors work, keyboard input works
```

**Windows (WSL):**
```bash
# Windows Terminal + WSL2
npm run dev
# Verify: Unicode symbols (█░ε@#.) render, gold color shows
```

**Known WSL gotchas:**
- Some Unicode chars may not render → fallback to ASCII: `█→#`, `░→-`, `ε→e`
- Add `FORCE_ASCII=1` env var check in Grid component for fallback

**Commit:** `fix: add ASCII fallback for WSL/Windows terminals`

---

## Week 15: Launch Materials

### Task 15.1: GitHub README (`README.md`)

**Structure:**
```markdown
# THEOSIS

> A terminal roguelike where virtue stats are combat stats.
> The Demon of Pride is always weak to Humility.

[screenshot — terminal capture of combat screen]

## Install

npm install -g theosis   (or: npx theosis)

## Play

theosis

## What is this?

[2 paragraphs — honest about mechanics, not preachy about theology]

## Controls

[table]

## Built with

TypeScript · Ink.js · rot.js
```

**Steps:**
1. Take terminal screenshots: `npm run dev`, then screenshot all 5 screens
2. Save as `docs/screenshots/*.png`
3. Write README.md
4. Commit: `docs: add README with screenshots`

---

### Task 15.2: npm publish setup

Players should be able to run `npx theosis`.

**Steps:**
1. Update `package.json`:
   ```json
   {
     "bin": { "theosis": "./dist/theosis.mjs" },
     "files": ["dist/"],
     "publishConfig": { "access": "public" }
   }
   ```
2. Run `npm run build` → verify `dist/theosis.mjs` exists and is executable
3. Test: `node dist/theosis.mjs` → game launches
4. `npm pack` → verify tarball only includes `dist/` and `README.md`
5. Commit: `chore: configure npm publish — bin and files`

---

### Task 15.3: itch.io page

**Steps (manual):**
1. Go to itch.io → Create game
2. Title: "THEOSIS"
3. Description (copy from below):
   ```
   A terminal roguelike where virtue stats are combat stats.

   Humility, Courage, Temperance, Wisdom, Love — these are not flavor.
   They are your attack power, your defense, your special abilities.

   The Demon of Pride is always weak to Humility.
   The Demon of Despair breaks against Love.

   Run after run, something rises. It takes 40-60 runs to understand what.

   Install: npm install -g theosis
   ```
4. Upload screenshots
5. Price: Free
6. Tags: roguelike, terminal, text-based, dark, philosophical
7. Save as draft — publish in Week 16

---

### Task 15.4: HackerNews draft (`docs/launch/hn-post.md`)

**Title:** "Show HN: I built a terminal roguelike where virtue stats are combat stats"

**Body:**
```
I built THEOSIS — a terminal roguelike in TypeScript + Ink.js.

The mechanic: Humility, Courage, Temperance, Wisdom, Love are your combat stats.
Not flavor. The Demon of Pride takes extra damage from Humility.
The Demon of Despair is weak to Love.

Players optimize virtue because it wins fights.
The theology is visible but never forced.

GitHub: [link]
Install: npm install -g theosis

Stack: TypeScript · Ink.js (React for terminal) · rot.js (map gen, FOV, scheduler) · esbuild

Happy to discuss the mechanics, the architecture, or why I chose terminal over web.
```

**Commit:** `docs: add HN launch post draft`

---

### Task 15.5: Reddit drafts (`docs/launch/reddit-posts.md`)

**r/roguelikes post:**
```
Title: THEOSIS — terminal roguelike where virtue stats are combat stats [playable]

Your five stats are Humility, Courage, Temperance, Wisdom, Love.
These are your combat stats. The Demon of Pride takes 1.5x damage from Humility.
Death raises your permanent baseline — permadeath with meaningful progress.

Stack: TypeScript + Ink.js + rot.js
[link]
```

**r/IndieGaming post:**
```
Title: I made a terminal roguelike with Orthodox demonology as the enemy roster

Different from what you're thinking. The Demon of Despair isn't just a name.
It attacks your willingness to fight back. Weak to Love specifically.

[screenshot]
[link]
```

**r/OrthodoxChristianity post:**
```
Title: I made a game about theosis for people who don't know what theosis is

The mechanic is that virtue stats are combat stats.
By the time they understand the Kenosis Build, they've already googled hesychasm.

Free to play. No manipulation, no bait-and-switch. The theology is just there.
[link]
```

**Commit:** `docs: add Reddit launch post drafts`

---

### Task 15.6: Discord server setup (manual)

**Steps:**
1. Create Discord server: "THEOSIS"
2. Channels:
   - `#general` — main chat
   - `#builds` — build sharing (Kenosis Tank, Hesychast, etc.)
   - `#theology` — for those who want to go deeper
   - `#feedback` — bugs and suggestions
3. Server description: "Terminal roguelike. Virtue stats = combat stats."
4. Invite link → add to README and Theosis screen in game

---

## Week 16: Launch

### Task 16.1: GitHub release

**Steps:**
1. Tag: `git tag v0.1.0`
2. Push: `git push origin main --tags`
3. Create GitHub release via `gh`:
   ```bash
   gh release create v0.1.0 \
     --title "THEOSIS v0.1.0" \
     --notes "Initial release. Virtue stats = combat stats. 50 encounters." \
     dist/theosis.mjs
   ```
4. Verify release page has download link

---

### Task 16.2: npm publish

```bash
npm run build
npm publish
```

Verify: `npx theosis` works from any machine.

---

### Task 16.3: itch.io publish

Publish the draft page. Verify download link works.

---

### Task 16.4: HackerNews post

Post at 8-10am Pacific time (peak HN traffic).
Copy from `docs/launch/hn-post.md`.

---

### Task 16.5: Reddit posts

Post in order:
1. r/roguelikes (most engaged audience)
2. r/IndieGaming (4 hours later — avoid same-time spam)
3. r/OrthodoxChristianity (next day)

---

### Task 16.6: First 48h monitoring

**What to watch:**
- GitHub Issues → bug reports
- Discord → first members joining
- HN comments → respond to all within 2 hours of posting
- Reddit comments → respond to all questions same day

**Critical bug threshold:** If 3+ reports of same crash → hotfix release same day.

**Hotfix flow:**
```bash
git add src/...
git commit -m "fix: {description}"
git tag v0.1.1
git push origin main --tags
gh release create v0.1.1 --notes "Hotfix: {description}" dist/theosis.mjs
npm publish
```

---

## M4 Final Acceptance Criteria

- [ ] 5 internal playtests completed, notes logged
- [ ] Balance feels: learnable floor 1-2, challenging floor 3+
- [ ] No encounter displays as broken or preachy
- [ ] All 10 enemies spawn correctly
- [ ] Death → resurrection → baseline rise: no edge case breaks
- [ ] Theosis condition: exact threshold, no early trigger
- [ ] Works on macOS, Linux, WSL without crash
- [ ] README with screenshots live on GitHub
- [ ] `npx theosis` works
- [ ] itch.io page published
- [ ] HackerNews posted
- [ ] r/roguelikes, r/IndieGaming, r/OrthodoxChristianity posted
- [ ] Discord live with 4 channels

---

## Post-Launch (Month 5+)

See main plan at `/Users/faka/.claude/plans/atomic-beaming-allen.md` → POST-LAUNCH section.

**Summary:**
- Streamer outreach (10 small streamers, personalized)
- Respond to all Discord feedback
- Bug fix release from launch feedback
- Month 6: new encounter pack (10 more, player-suggested)
