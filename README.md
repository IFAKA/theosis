# THEOSIS

A terminal roguelike where virtue stats are combat stats.

You optimize virtue because it wins fights. Then you google what "Kenosis" means.

## Concept

Orthodox Christian theology encoded as a build system. Humility, Stillness, Sacrifice, Vigilance, and Kenosis are your five stats. They scale your damage, defense, and special abilities. Min-max the virtues — find out what they mean.

```
Fun roguelike → "Kenosis build OP" → google Orthodox theology → Discord
```

## Builds

| Archetype | Primary Virtue | Playstyle |
|---|---|---|
| Hesychast | Stillness | Patience-based, high defense |
| Ascetic | Sacrifice | High damage, self-damage trade-offs |
| Watchman | Vigilance | Counter-heavy, interrupt-focused |
| Kenotic | Kenosis | Scales by emptying stats into allies/enemies |
| Humble Warrior | Humility | Underdog bonuses, comeback mechanics |

## Stack

| Layer | Tool |
|---|---|
| Language | TypeScript (ESM) |
| UI | Ink.js 6.8 (React for terminal) |
| Roguelike engine | rot-js 2.2 (map gen, FOV, scheduler) |
| Build | esbuild → `dist/theosis.mjs` |

## Run

```bash
npm install
npm run dev       # hot reload
npm run build     # compile to dist/theosis.mjs
node dist/theosis.mjs
```

## Controls

| Key | Action |
|---|---|
| `hjkl` / arrows | Move |
| `1–5` | Use ability |
| `?` | Help overlay |
| `q` | Quit |

## Status

Active development — M3 UI Layer in progress.

| Milestone | Status |
|---|---|
| M0: Pre-Production | ✅ |
| M1: Core Engine | ✅ |
| M2: Content Layer | ✅ |
| M3: UI Layer | 🔄 |
| M4: Launch Prep | ⬜ |
