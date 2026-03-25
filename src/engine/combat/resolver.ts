import { RNG } from 'rot-js';
import type { PlayerState } from '../player.js';
import type { EnemyOnFloor } from '../dungeon/floor.js';
import type { CombatAction } from './actions.js';
import type { ActiveEffect } from './effects.js';
import type { EnemyIntent } from './ai.js';
import { calculateDamage, isWeaknessExploited } from './damage.js';
import { getEnemyIntent, executeEnemyIntent } from './ai.js';
import { tickEffects, applyEffect } from './effects.js';
import { applyVirtueChange, checkTheosis } from '../virtue/progression.js';
import type { EnemyTemplate } from '../enemies/types.js';
import { VIRTUE_NAMES } from '../virtue/stats.js';

export type CombatResult =
  | { outcome: 'enemy_defeated'; xpGained: number }
  | { outcome: 'player_acted' }
  | { outcome: 'player_died' }
  | { outcome: 'floor_cleared' }
  | { outcome: 'theosis_achieved' };

export type CombatState = {
  player: PlayerState;
  enemies: EnemyOnFloor[];
  enemyTemplates: Map<string, EnemyTemplate>;
  playerEffects: ActiveEffect[];
  enemyEffects: Map<string, ActiveEffect[]>;
  currentIntent: EnemyIntent | null;
  log: string[];
};

export function playerTurn(
  state: CombatState,
  action: CombatAction,
  targetId: string
): CombatState {
  const target = state.enemies.find(e => e.id === targetId);
  const template = state.enemyTemplates.get(targetId);
  if (!target || !template) return state;

  const damage = calculateDamage(action, state.player.virtues, template, state.player.floor);
  const isWeakness = isWeaknessExploited(action, template);

  let actualDamage = damage;
  let newPlayerHp = state.player.hp;
  let updatedEnemyEffects = new Map(state.enemyEffects);
  const mechLog: string[] = [];

  if (!isWeakness) {
    const m = template.mechanic;
    if (m.type === 'deflect' && RNG.getUniform() < m.chance) {
      newPlayerHp = Math.max(0, newPlayerHp - actualDamage);
      actualDamage = 0;
      mechLog.push(`[!] ${template.name} DEFLECTS — your strike reflects back! You take ${damage} damage.`);
    } else if (m.type === 'drain') {
      actualDamage = Math.max(1, Math.floor(actualDamage / 2));
      mechLog.push(`[!] ${template.name} DRAINS your strike — only ${actualDamage} damage gets through.`);
    } else if (m.type === 'mirror') {
      mechLog.push(`[!] ${template.name} MIRRORS your display — it heals 1 HP from your effort.`);
    } else if (m.type === 'enrage') {
      const prev = updatedEnemyEffects.get(targetId) ?? [];
      updatedEnemyEffects.set(targetId, applyEffect(prev, { type: 'attack_up', turnsRemaining: 1, magnitude: m.bonusDamage }));
      mechLog.push(`[!] ${template.name} ENRAGES — next attack deals +${m.bonusDamage} bonus damage!`);
    } else if (m.type === 'distract' && RNG.getUniform() < m.chance) {
      actualDamage = 0;
      mechLog.push(`[!] ${template.name} DISTRACTS you — the attack misses completely!`);
    }
  }

  let newEnemyHp = Math.max(0, target.hp - actualDamage);
  if (!isWeakness && template.mechanic.type === 'mirror' && actualDamage > 0) {
    newEnemyHp = Math.min(target.hp, newEnemyHp + 1);
  }

  const enemies = state.enemies.map(e =>
    e.id === targetId ? { ...e, hp: newEnemyHp } : e
  );

  let newVirtues = state.player.virtues;
  if (newEnemyHp <= 0 && action.virtueGain) {
    newVirtues = applyVirtueChange(state.player.virtues, state.player.baseline, action.virtueGain);
  }

  // Agape: heal 2 HP
  const hpBonus = action.id === 'agape' ? 2 : 0;

  // Track run stats on kill
  const stats = state.player.currentRunStats;
  const updatedStats = newEnemyHp <= 0
    ? {
        ...stats,
        enemiesDefeated: stats.enemiesDefeated + 1,
        peakVirtues: Object.fromEntries(
          VIRTUE_NAMES.map(v => [v, Math.max(stats.peakVirtues[v], newVirtues[v])])
        ) as typeof newVirtues,
      }
    : stats;

  // Apply shield and debuff effects from action
  let playerEffects = tickEffects(state.playerEffects);
  if (action.effect === 'shield') {
    playerEffects = applyEffect(playerEffects, { type: 'shield', turnsRemaining: 2, magnitude: 3 });
  }
  if (action.effect === 'debuff') {
    const prev = updatedEnemyEffects.get(targetId) ?? [];
    updatedEnemyEffects.set(targetId, applyEffect(prev, { type: 'attack_down', turnsRemaining: 2, magnitude: 2 }));
  }

  const player: PlayerState = {
    ...state.player,
    virtues: newVirtues,
    hp: Math.min(state.player.maxHp, newPlayerHp + hpBonus),
    currentRunStats: updatedStats,
  };

  const log = [...state.log, `You use ${action.name} on ${template.name} for ${actualDamage} damage.`, ...mechLog];

  return { ...state, player, enemies, playerEffects, enemyEffects: updatedEnemyEffects, log };
}

export function enemyTurn(state: CombatState, enemyId: string): CombatState {
  const template = state.enemyTemplates.get(enemyId);
  if (!template) return state;

  const intent = getEnemyIntent(template, state.player.floor);
  const enemyEffects = state.enemyEffects.get(enemyId) ?? [];
  const newHp = executeEnemyIntent(intent, state.player.hp, state.playerEffects, enemyEffects);
  const killedBy = newHp <= 0 ? template.name : state.player.currentRunStats.killedBy;
  const player: PlayerState = {
    ...state.player,
    hp: newHp,
    currentRunStats: { ...state.player.currentRunStats, killedBy },
  };

  const prevEffects = state.enemyEffects.get(enemyId) ?? [];
  const newEnemyEffects = new Map(state.enemyEffects);
  newEnemyEffects.set(enemyId, tickEffects(prevEffects));

  const log = [...state.log, `${template.name} ${intent.description}.`];
  return { ...state, player, enemyEffects: newEnemyEffects, currentIntent: intent, log };
}

export function checkCombatEnd(state: CombatState): CombatResult | null {
  if (state.player.hp <= 0) return { outcome: 'player_died' };
  if (state.enemies.every(e => e.hp <= 0)) {
    if (checkTheosis(state.player.virtues)) {
      console.log('THEOSIS ACHIEVED');
      return { outcome: 'theosis_achieved' };
    }
    return { outcome: 'floor_cleared' };
  }
  return null;
}
