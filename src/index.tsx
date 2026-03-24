import { useState } from 'react';
import { render, useInput, useApp, Box, Text } from 'ink';
import { createInitialPlayer, resetForNewRun } from './engine/player.js';
import { createFloor } from './engine/dungeon/floor.js';
import { spawnEnemiesForFloor, scaleEnemy } from './engine/enemies/registry.js';
import { getAvailableActions } from './engine/combat/actions.js';
import { getEnemyIntent } from './engine/combat/ai.js';
import { BASE_ENEMIES } from './engine/enemies/types.js';
import { applyDeath } from './engine/virtue/progression.js';
import { VIRTUE_NAMES } from './engine/virtue/stats.js';
import { applyChoice, selectEncounters } from './engine/encounter/resolver.js';
import type { PlayerState } from './engine/player.js';
import type { FloorState, EnemyOnFloor } from './engine/dungeon/floor.js';
import type { EnemyTemplate } from './engine/enemies/types.js';
import type { EnemyIntent } from './engine/combat/ai.js';
import type { CombatAction } from './engine/combat/actions.js';
import type { Encounter } from './engine/encounter/types.js';
import { MainMenu } from './ui/screens/MainMenu.js';
import { DungeonMap } from './ui/screens/DungeonMap.js';
import { Combat } from './ui/screens/Combat.js';
import { EncounterScreen } from './ui/screens/Encounter.js';
import { StatsScreen } from './ui/screens/Stats.js';
import { DeathScreen } from './ui/screens/Death.js';
import { TheosisScreen } from './ui/screens/Theosis.js';

// All encounter pools
import desertFathersData from './data/encounters/desert-fathers.json' assert { type: 'json' };
import demonicData from './data/encounters/demonic.json' assert { type: 'json' };
import iconsData from './data/encounters/icons.json' assert { type: 'json' };
import monasticData from './data/encounters/monastic.json' assert { type: 'json' };
import martyrdomData from './data/encounters/martyrdom.json' assert { type: 'json' };

const ALL_ENCOUNTERS = [
  ...desertFathersData,
  ...demonicData,
  ...iconsData,
  ...monasticData,
  ...martyrdomData,
] as Encounter[];

type Screen = 'menu' | 'dungeon' | 'combat' | 'encounter' | 'stats' | 'death' | 'theosis';

type CombatLogEntry = { text: string; color: string };

type CombatInfo = {
  enemy: EnemyOnFloor & { template: EnemyTemplate };
  intent: EnemyIntent | null;
  actions: CombatAction[];
  log: CombatLogEntry[];
  weaknessRevealed: boolean;
};

type DeathInfo = {
  killedBy: string;
  floorReached: number;
  baselineRise: { virtue: string; from: number; to: number } | null;
};

function buildFloor(floorNumber: number, virtues: PlayerState['virtues']): FloorState {
  const floor = createFloor(floorNumber);
  const templates = spawnEnemiesForFloor(floorNumber);
  const enemies: EnemyOnFloor[] = templates.map((t, i) => {
    const scaled = scaleEnemy(t, floorNumber, virtues);
    // Place enemies in rooms (skip first room = player start)
    const room = floor.map.rooms[Math.min(i + 1, floor.map.rooms.length - 1)];
    return {
      id: `${t.id}_${i}`,
      type: t.id,
      x: room.cx,
      y: room.cy,
      hp: scaled.hp,
      maxHp: scaled.hp,
    };
  });
  return { ...floor, enemies };
}

function App() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('menu');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [player, setPlayer] = useState<PlayerState>(createInitialPlayer());
  const [floor, setFloor] = useState<FloorState>(() => buildFloor(1, createInitialPlayer().virtues));
  const [combatInfo, setCombatInfo] = useState<CombatInfo | null>(null);
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
  const [deathInfo, setDeathInfo] = useState<DeathInfo | null>(null);
  const [quitConfirm, setQuitConfirm] = useState(false);

  // Global Q handler (non-combat screens handle it themselves in some cases)
  useInput((input) => {
    if (quitConfirm) {
      if (input === 'y' || input === 'Y') exit();
      setQuitConfirm(false);
      return;
    }
    if ((input === 'q' || input === 'Q') && screen !== 'theosis') {
      setQuitConfirm(true);
    }
  });

  if (quitConfirm) {
    return (
      <Box flexDirection="column" padding={2}>
        <Text color="#d4af37">Quit? [Y/N]</Text>
      </Box>
    );
  }

  const handleStart = () => {
    const p = createInitialPlayer();
    const f = buildFloor(1, p.virtues);
    setPlayer(p);
    setFloor(f);
    setScreen('dungeon');
  };

  const handleFloorComplete = () => {
    const nextFloor = player.floor + 1;
    const newPlayer = { ...player, floor: nextFloor };
    const newFloor = buildFloor(nextFloor, newPlayer.virtues);
    setPlayer(newPlayer);
    setFloor(newFloor);

    // Chance to show encounter on floor entry
    const encountered = selectEncounters(ALL_ENCOUNTERS, 1);
    if (encountered.length > 0) {
      setCurrentEncounter(encountered[0]);
      setScreen('encounter');
    }
  };

  const handleCombatStart = (enemyId: string) => {
    const enemy = floor.enemies.find(e => e.id === enemyId);
    if (!enemy) return;

    const template = BASE_ENEMIES.find(t => t.id === enemy.type) ??
      { id: enemy.type, name: 'Unknown', orthodoxName: '?', symbol: '?', weakness: 'humility' as const,
        baseHp: 10, baseDamage: 2, floorMinimum: 1, isElite: false, description: '', intent: ['attacks'] };

    const dominantVirtue = VIRTUE_NAMES.reduce((best, v) =>
      player.virtues[v] > player.virtues[best] ? v : best
    );
    const actions = getAvailableActions(player.virtues[dominantVirtue], dominantVirtue);
    const intent = getEnemyIntent(template, player.floor);

    setCombatInfo({
      enemy: { ...enemy, template },
      intent,
      actions,
      log: [],
      weaknessRevealed: false,
    });
    setScreen('combat');
  };

  const handlePlayerAction = (actionId: string) => {
    if (!combatInfo) return;
    const action = combatInfo.actions.find(a => a.id === actionId);
    if (!action) return;

    const { enemy } = combatInfo;
    const virtueLevel = player.virtues[action.virtue];
    const damage = Math.round(action.damageMultiplier * virtueLevel);
    const newEnemyHp = Math.max(0, enemy.hp - damage);
    const log: CombatLogEntry[] = [
      ...combatInfo.log,
      { text: `You use ${action.name} → ${damage} damage`, color: '#d4af37' },
    ];

    if (newEnemyHp <= 0) {
      // Enemy defeated — go back to dungeon, remove from floor
      const newEnemies = floor.enemies.filter(e => e.id !== enemy.id);
      setFloor({ ...floor, enemies: newEnemies });
      setCombatInfo(null);
      setScreen('dungeon');
      if (soundEnabled) process.stdout.write('\x07');
      return;
    }

    // Enemy turn
    const intent = getEnemyIntent(enemy.template, player.floor);
    const damage2 = intent.action === 'attack' ? (intent.damage ?? 0) : 0;
    const newPlayerHp = Math.max(0, player.hp - damage2);
    const log2: CombatLogEntry[] = [
      ...log,
      { text: `${enemy.template.name} ${intent.description} → ${damage2} damage`, color: '#f87171' },
    ];

    const updatedEnemy = { ...enemy, hp: newEnemyHp };
    const weaknessRevealed = combatInfo.weaknessRevealed || action.virtue === 'wisdom';

    setCombatInfo({
      ...combatInfo,
      enemy: updatedEnemy,
      intent,
      log: log2,
      weaknessRevealed,
    });

    if (newPlayerHp <= 0) {
      // Player died
      const oldBaseline = { ...player.baseline };
      const newState = applyDeath({ ...player, hp: 0 });
      const raisedVirtue = VIRTUE_NAMES.find(v => newState.baseline[v] > oldBaseline[v]) ?? null;
      setPlayer(newState);
      setDeathInfo({
        killedBy: enemy.template.name,
        floorReached: player.floor,
        baselineRise: raisedVirtue
          ? { virtue: raisedVirtue, from: oldBaseline[raisedVirtue], to: newState.baseline[raisedVirtue] }
          : null,
      });
      setCombatInfo(null);
      setScreen('death');
    } else {
      setPlayer({ ...player, hp: newPlayerHp });
    }
  };

  const handleChoiceSelected = (choiceId: string) => {
    if (!currentEncounter) return;
    const choice = currentEncounter.choices.find(c => c.id === choiceId);
    if (!choice) return;
    const newPlayer = applyChoice(player, choice);
    setPlayer(newPlayer);
    setCurrentEncounter(null);
    setScreen('dungeon');
    if (soundEnabled) process.stdout.write('\x07');
  };

  const handleNewRun = () => {
    const newPlayer = resetForNewRun(player);
    const newFloor = buildFloor(1, newPlayer.virtues);
    setPlayer(newPlayer);
    setFloor(newFloor);
    setDeathInfo(null);
    setScreen('dungeon');
  };

  switch (screen) {
    case 'menu':
      return (
        <MainMenu
          soundEnabled={soundEnabled}
          onStart={handleStart}
          onToggleSound={() => setSoundEnabled(s => !s)}
        />
      );

    case 'dungeon':
      return (
        <DungeonMap
          floor={floor}
          player={player}
          onFloorComplete={handleFloorComplete}
          onCombatStart={handleCombatStart}
          onTabSwitch={() => setScreen('stats')}
        />
      );

    case 'combat':
      if (!combatInfo) return <Text>Loading...</Text>;
      return (
        <Combat
          enemy={combatInfo.enemy}
          intent={combatInfo.intent}
          actions={combatInfo.actions}
          player={player}
          combatLog={combatInfo.log}
          weaknessRevealed={combatInfo.weaknessRevealed}
          onPlayerAction={handlePlayerAction}
        />
      );

    case 'encounter':
      if (!currentEncounter) return <Text>Loading...</Text>;
      return (
        <EncounterScreen
          encounter={currentEncounter}
          onChoiceSelected={handleChoiceSelected}
        />
      );

    case 'stats':
      return (
        <StatsScreen
          player={player}
          onTabSwitch={() => setScreen('dungeon')}
        />
      );

    case 'death':
      return (
        <DeathScreen
          player={player}
          killedBy={deathInfo?.killedBy ?? 'Unknown'}
          floorReached={deathInfo?.floorReached ?? 1}
          baselineRise={deathInfo?.baselineRise ?? null}
          onNewRun={handleNewRun}
        />
      );

    case 'theosis':
      return (
        <TheosisScreen
          player={player}
          onNewRun={handleNewRun}
        />
      );
  }
}

render(<App />);
