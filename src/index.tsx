import { useState } from 'react';
import { render, useInput, useApp, Box, Text } from 'ink';
import { createInitialPlayer, resetForNewRun } from './engine/player.js';
import { createFloor } from './engine/dungeon/floor.js';
import { spawnEnemiesForFloor, scaleEnemy } from './engine/enemies/registry.js';
import { getAvailableActions } from './engine/combat/actions.js';
import { getEnemyIntent } from './engine/combat/ai.js';
import allEnemiesData from './data/enemies.json' assert { type: 'json' };
import type { EnemyMechanic } from './engine/enemies/types.js';
const ALL_ENEMY_TEMPLATES = allEnemiesData as import('./engine/enemies/types.js').EnemyTemplate[];
import { applyDeath, checkTheosis, applyVirtueChange } from './engine/virtue/progression.js';
import { calculateDamage, isWeaknessExploited } from './engine/combat/damage.js';
import { VIRTUE_NAMES, VIRTUE_DISPLAY } from './engine/virtue/stats.js';
import { applyChoice, selectEncounters } from './engine/encounter/resolver.js';
import type { PlayerState } from './engine/player.js';
import type { FloorState, EnemyOnFloor } from './engine/dungeon/floor.js';
import type { EnemyTemplate } from './engine/enemies/types.js';
import type { EnemyIntent } from './engine/combat/ai.js';
import type { CombatAction } from './engine/combat/actions.js';
import type { Encounter } from './engine/encounter/types.js';
import { MainMenu } from './ui/screens/MainMenu.js';
import { FocusPick } from './ui/screens/FocusPick.js';
import { DungeonMap } from './ui/screens/DungeonMap.js';
import { Combat } from './ui/screens/Combat.js';
import { EncounterScreen } from './ui/screens/Encounter.js';
import { StatsScreen } from './ui/screens/Stats.js';
import { DeathScreen } from './ui/screens/Death.js';
import { TheosisScreen } from './ui/screens/Theosis.js';
import { BuildReveal } from './ui/screens/BuildReveal.js';
import { VirtueMilestone } from './ui/screens/VirtueMilestone.js';
import { HelpOverlay } from './ui/components/HelpOverlay.js';
import { detectBuild } from './engine/virtue/builds.js';
import type { VirtueName } from './engine/virtue/stats.js';

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

type Screen = 'menu' | 'focus_pick' | 'dungeon' | 'combat' | 'encounter' | 'stats' | 'death' | 'theosis' | 'build_reveal' | 'virtue_milestone';

type CombatLogEntry = { text: string; color: string };

type CombatInfo = {
  enemy: EnemyOnFloor & { template: EnemyTemplate };
  intent: EnemyIntent | null;
  actions: CombatAction[];
  log: CombatLogEntry[];
  weaknessRevealed: boolean;
  playerShield: boolean;
  enemyDebuffed: boolean;
  playerAp: number;
  enrageDmgBonus: number;
};

type DeathInfo = {
  killedBy: string;
  killedByOrthodoxName: string;
  floorReached: number;
  baselineRise: { virtue: string; from: number; to: number } | null;
};

function buildFloor(floorNumber: number, virtues: PlayerState['virtues']): FloorState {
  const floor = createFloor(floorNumber);
  const templates = spawnEnemiesForFloor(floorNumber);
  const enemies: EnemyOnFloor[] = templates.map((t, i) => {
    const scaled = scaleEnemy(t, floorNumber, virtues);
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
  const [playerPos, setPlayerPos] = useState(() => {
    const f = buildFloor(1, createInitialPlayer().virtues);
    return { x: f.playerX, y: f.playerY };
  });
  const [combatInfo, setCombatInfo] = useState<CombatInfo | null>(null);
  const [currentEncounter, setCurrentEncounter] = useState<Encounter | null>(null);
  const [deathInfo, setDeathInfo] = useState<DeathInfo | null>(null);
  const [quitConfirm, setQuitConfirm] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [virtueGainFlash, setVirtueGainFlash] = useState<{ label: string; virtue: string; amount: number } | null>(null);
  const [buildRevealed, setBuildRevealed] = useState(false);
  const [virtuesMilestoned, setVirtuesMilestoned] = useState<VirtueName[]>([]);
  const [milestonedVirtue, setMilestonedVirtue] = useState<VirtueName | null>(null);
  const [seenEncounterIds, setSeenEncounterIds] = useState<Set<string>>(new Set());
  const [pendingBasePlayer, setPendingBasePlayer] = useState<PlayerState | null>(null);

  // Global keyboard handler
  useInput((input, key) => {
    if (quitConfirm) {
      if (input === 'y' || input === 'Y') exit();
      setQuitConfirm(false);
      return;
    }
    if (input === '?') {
      setShowHelp(h => !h);
      return;
    }
    if (key.escape) {
      if (showHelp) { setShowHelp(false); return; }
      return;
    }
    if ((input === 'q' || input === 'Q') && screen !== 'theosis' && !showHelp) {
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

  if (showHelp) {
    return (
      <Box flexDirection="column" padding={1}>
        <HelpOverlay screen={screen} />
      </Box>
    );
  }

  const handleStart = () => {
    setPendingBasePlayer(createInitialPlayer());
    setBuildRevealed(false);
    setVirtuesMilestoned([]);
    setMilestonedVirtue(null);
    setSeenEncounterIds(new Set());
    setScreen('focus_pick');
  };

  const handleFocusPick = (virtue: VirtueName) => {
    const base = pendingBasePlayer ?? createInitialPlayer();
    const p = { ...base, virtues: { ...base.virtues, [virtue]: 3 } };
    const f = buildFloor(1, p.virtues);
    setPlayer(p);
    setFloor(f);
    setPlayerPos({ x: f.playerX, y: f.playerY });
    setPendingBasePlayer(null);
    setScreen('dungeon');
  };

  const handleFloorComplete = () => {
    const nextFloor = player.floor + 1;
    const newMaxHp = 20 + nextFloor * 2;
    const newPlayer = { ...player, floor: nextFloor, maxHp: newMaxHp };
    const newFloor = buildFloor(nextFloor, newPlayer.virtues);
    setPlayer(newPlayer);
    setFloor(newFloor);
    setPlayerPos({ x: newFloor.playerX, y: newFloor.playerY });

    const unseen = ALL_ENCOUNTERS.filter(e => !seenEncounterIds.has(e.id));
    const pool = unseen.length > 0 ? unseen : ALL_ENCOUNTERS;
    const encountered = selectEncounters(pool, 1);
    if (encountered.length > 0) {
      setSeenEncounterIds(prev => new Set([...prev, encountered[0].id]));
      setCurrentEncounter(encountered[0]);
      setScreen('encounter');
    }
  };

  const handleCombatStart = (enemyId: string) => {
    setVirtueGainFlash(null);
    const enemy = floor.enemies.find(e => e.id === enemyId);
    if (!enemy) return;

    const template = ALL_ENEMY_TEMPLATES.find(t => t.id === enemy.type) ??
      { id: enemy.type, name: 'Unknown', orthodoxName: '?', symbol: '?', weakness: 'humility' as const,
        baseHp: 10, baseDamage: 2, floorMinimum: 1, isElite: false, description: '', intent: ['attacks'],
        mechanic: { type: 'drain' } as EnemyMechanic };

    const actions = VIRTUE_NAMES.map(virtue => {
      const level = Math.max(player.virtues[virtue], 1);
      const all = getAvailableActions(level, virtue);
      return all[all.length - 1];
    });
    const intent = getEnemyIntent(template, player.floor);

    setCombatInfo({
      enemy: { ...enemy, template },
      intent,
      actions,
      log: [],
      weaknessRevealed: false,
      playerShield: false,
      enemyDebuffed: false,
      playerAp: 3,
      enrageDmgBonus: 0,
    });
    setScreen('combat');
  };

  // Extracted enemy turn logic — called when AP hits 0 or player ends turn early
  const triggerEnemyTurn = (
    log: CombatLogEntry[],
    enemy: CombatInfo['enemy'],
    shield: boolean,
    debuff: boolean,
    enrageBonus: number,
    currentPlayer: PlayerState,
  ) => {
    const intent = getEnemyIntent(enemy.template, currentPlayer.floor);
    const rawDmg = (intent.action === 'attack' ? (intent.damage ?? 0) : 0) + enrageBonus;
    const mitigated = (shield || debuff) ? Math.ceil(rawDmg / 2) : rawDmg;
    const newHp = Math.max(0, currentPlayer.hp - mitigated);
    const newLog: CombatLogEntry[] = [
      ...log,
      { text: `${enemy.template.name} ${intent.description} → ${mitigated} damage`, color: '#f87171' },
    ];

    setCombatInfo(prev => prev ? {
      ...prev,
      enemy,
      intent,
      log: newLog,
      playerShield: false,
      enemyDebuffed: false,
      playerAp: 3,
      enrageDmgBonus: 0,
    } : null);

    if (newHp <= 0) {
      const oldBaseline = { ...currentPlayer.baseline };
      const newState = applyDeath({ ...currentPlayer, hp: 0 });
      const raisedVirtue = VIRTUE_NAMES.find(v => newState.baseline[v] > oldBaseline[v]) ?? null;
      setPlayer(newState);
      setDeathInfo({
        killedBy: enemy.template.name,
        killedByOrthodoxName: enemy.template.orthodoxName,
        floorReached: currentPlayer.floor,
        baselineRise: raisedVirtue
          ? { virtue: raisedVirtue, from: oldBaseline[raisedVirtue], to: newState.baseline[raisedVirtue] }
          : null,
      });
      setCombatInfo(null);
      setScreen('death');
    } else {
      setPlayer({ ...currentPlayer, hp: newHp });
    }
  };

  const handleEndTurn = () => {
    if (!combatInfo || combatInfo.playerAp === 0) return;
    triggerEnemyTurn(
      combatInfo.log,
      combatInfo.enemy,
      combatInfo.playerShield,
      combatInfo.enemyDebuffed,
      combatInfo.enrageDmgBonus,
      player,
    );
  };

  const handlePlayerAction = (actionId: string) => {
    if (!combatInfo) return;
    const action = combatInfo.actions.find(a => a.id === actionId);
    if (!action) return;

    // AP gate
    if (combatInfo.playerAp < action.cost) return;

    const { enemy } = combatInfo;
    const isWeaknessHit = isWeaknessExploited(action, enemy.template);
    const damage = calculateDamage(action, player.virtues, enemy.template, player.floor);

    // Enemy mechanic: fires on off-weakness hits
    const mechLog: CombatLogEntry[] = [];
    let actualDamage = damage;
    let enrageDmgBonus = combatInfo.enrageDmgBonus;
    if (!isWeaknessHit) {
      const m = enemy.template.mechanic;
      if (m.type === 'deflect' && Math.random() < m.chance) {
        actualDamage = 0;
        mechLog.push({ text: `[!] ${enemy.template.name} DEFLECTS — your strike reflects!`, color: '#d4af37' });
        // Reflected damage applied immediately to player
        setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - damage) }));
      } else if (m.type === 'drain') {
        actualDamage = Math.max(1, Math.floor(actualDamage / 2));
        mechLog.push({ text: `[!] ${enemy.template.name} DRAINS — only ${actualDamage} gets through.`, color: '#d4af37' });
      } else if (m.type === 'mirror') {
        mechLog.push({ text: `[!] ${enemy.template.name} MIRRORS — it heals 1 HP.`, color: '#d4af37' });
      } else if (m.type === 'enrage') {
        enrageDmgBonus += m.bonusDamage;
        mechLog.push({ text: `[!] ${enemy.template.name} ENRAGES — +${m.bonusDamage} incoming damage!`, color: '#d4af37' });
      } else if (m.type === 'distract' && Math.random() < m.chance) {
        actualDamage = 0;
        mechLog.push({ text: `[!] ${enemy.template.name} DISTRACTS — the attack misses!`, color: '#d4af37' });
      }
    }
    let newEnemyHp = Math.max(0, enemy.hp - actualDamage);
    if (!isWeaknessHit && enemy.template.mechanic.type === 'mirror' && actualDamage > 0) {
      newEnemyHp = Math.min(enemy.maxHp, newEnemyHp + 1);
    }

    const log: CombatLogEntry[] = [
      ...combatInfo.log,
      { text: action.description, color: '#555555' },
      { text: `You use ${action.name} → ${actualDamage} damage`, color: '#d4af37' },
      ...mechLog,
    ];

    if (newEnemyHp <= 0) {
      const virtueAmount = isWeaknessHit ? 2 : 1;
      const virtueGain = { [action.virtue]: virtueAmount } as Partial<Record<typeof action.virtue, number>>;
      const newVirtues = applyVirtueChange(player.virtues, player.baseline, virtueGain);
      const virtueName = VIRTUE_DISPLAY[action.virtue].label;
      const victoryLog: CombatLogEntry[] = [
        ...log,
        isWeaknessHit
          ? { text: `⚡ WEAKNESS EXPLOITED — ${enemy.template.orthodoxName} falls to ${virtueName} (+2)`, color: '#00d9ff' }
          : { text: `${enemy.template.orthodoxName} falls. +${virtueAmount} ${virtueName}.`, color: '#6b4ba0' },
      ];

      const newPlayer = { ...player, virtues: newVirtues };
      setVirtueGainFlash({ label: virtueName, virtue: action.virtue, amount: virtueAmount });
      setTimeout(() => setVirtueGainFlash(null), 1500);

      if (checkTheosis(newVirtues)) {
        setPlayer(newPlayer);
        setFloor({ ...floor, enemies: floor.enemies.filter(e => e.id !== enemy.id) });
        setCombatInfo(null);
        if (soundEnabled) process.stdout.write('\x07\x07\x07\x07\x07');
        setScreen('theosis');
        return;
      }

      setPlayer(newPlayer);
      setFloor({ ...floor, enemies: floor.enemies.filter(e => e.id !== enemy.id) });
      setCombatInfo({ ...combatInfo, log: victoryLog });

      const newMilestone = VIRTUE_NAMES.find(
        v => newVirtues[v] >= 10 && !virtuesMilestoned.includes(v)
      ) ?? null;
      if (newMilestone) {
        setVirtuesMilestoned(prev => [...prev, newMilestone]);
        setMilestonedVirtue(newMilestone);
        if (soundEnabled) process.stdout.write('\x07\x07\x07\x07\x07');
        setTimeout(() => { setCombatInfo(null); setScreen('virtue_milestone'); }, 1500);
        return;
      }

      if (!buildRevealed) {
        const build = detectBuild(newVirtues);
        const dominantVal = newVirtues[build.dominantVirtue as VirtueName];
        if (!build.dominantVirtue.includes('/') && dominantVal >= 5) {
          setBuildRevealed(true);
          if (soundEnabled) process.stdout.write('\x07\x07');
          setTimeout(() => { setCombatInfo(null); setScreen('build_reveal'); }, 1500);
          return;
        }
      }

      setTimeout(() => {
        setCombatInfo(null);
        setScreen('dungeon');
      }, 1500);
      if (soundEnabled) process.stdout.write('\x07');
      return;
    }

    // Apply player-side effects before checking AP
    const applyHeal = action.effect === 'heal';
    const newPlayerShield = action.effect === 'shield';
    const newEnemyDebuffed = action.effect === 'debuff';
    const healedHp = applyHeal ? Math.min(player.maxHp, player.hp + 2) : player.hp;
    const effectLog: CombatLogEntry[] = action.effect === 'heal'
      ? [...log, { text: `Agape heals +2 HP.`, color: '#f472b6' }]
      : action.effect === 'shield'
        ? [...log, { text: `Shield raised — next hit reduced.`, color: '#a78bfa' }]
        : action.effect === 'debuff'
          ? [...log, { text: `${enemy.template.name} weakened — next attack -50%.`, color: '#34d399' }]
          : log;

    if (applyHeal) setPlayer(p => ({ ...p, hp: healedHp }));

    const weaknessRevealed = combatInfo.weaknessRevealed || action.virtue === 'wisdom' || action.effect === 'reveal';
    const updatedEnemy = { ...enemy, hp: newEnemyHp };
    const newAp = combatInfo.playerAp - action.cost;
    const shieldNow = newPlayerShield || combatInfo.playerShield;
    const debuffNow = newEnemyDebuffed || combatInfo.enemyDebuffed;

    if (newAp > 0) {
      // Player still has AP — wait for next action
      setCombatInfo({
        ...combatInfo,
        enemy: updatedEnemy,
        log: effectLog,
        weaknessRevealed,
        playerShield: shieldNow,
        enemyDebuffed: debuffNow,
        playerAp: newAp,
        enrageDmgBonus,
      });
      return;
    }

    // AP exhausted — trigger enemy turn
    const currentPlayer = applyHeal ? { ...player, hp: healedHp } : player;
    triggerEnemyTurn(effectLog, updatedEnemy, shieldNow, debuffNow, enrageDmgBonus, currentPlayer);
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

  const handleBuildRevealContinue = () => setScreen('dungeon');
  const handleVirtueMilestoneContinue = () => { setMilestonedVirtue(null); setScreen('dungeon'); };

  const handleNewRun = () => {
    const newBase = resetForNewRun(player);
    setPendingBasePlayer(newBase);
    setDeathInfo(null);
    setBuildRevealed(false);
    setVirtuesMilestoned([]);
    setMilestonedVirtue(null);
    setSeenEncounterIds(new Set());
    setScreen('focus_pick');
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

    case 'focus_pick':
      return <FocusPick onSelect={handleFocusPick} />;

    case 'dungeon':
      return (
        <DungeonMap
          floor={floor}
          player={player}
          playerX={playerPos.x}
          playerY={playerPos.y}
          onMove={(x, y) => setPlayerPos({ x, y })}
          onFloorComplete={handleFloorComplete}
          onCombatStart={handleCombatStart}
          onTabSwitch={() => setScreen('stats')}
          virtueGainFlash={virtueGainFlash}
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
          onEndTurn={handleEndTurn}
          playerAp={combatInfo.playerAp}
          virtueGainFlash={virtueGainFlash}
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
          killedByOrthodoxName={deathInfo?.killedByOrthodoxName ?? ''}
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

    case 'build_reveal': {
      const build = detectBuild(player.virtues);
      return <BuildReveal build={build} onContinue={handleBuildRevealContinue} />;
    }

    case 'virtue_milestone':
      if (!milestonedVirtue) return <Text>Loading...</Text>;
      return <VirtueMilestone virtue={milestonedVirtue} onContinue={handleVirtueMilestoneContinue} />;
  }
}

render(<App />);
