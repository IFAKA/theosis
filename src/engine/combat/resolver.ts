import type { PlayerState } from '../player.js';
import type { EnemyOnFloor } from '../dungeon/floor.js';
import type { CombatAction } from './actions.js';
import type { ActiveEffect } from './effects.js';
import type { EnemyIntent } from './ai.js';
import { calculateDamage } from './damage.js';
import { getEnemyIntent, executeEnemyIntent } from './ai.js';
import { tickEffects } from './effects.js';
import { applyVirtueChange } from '../virtue/progression.js';
import type { EnemyTemplate } from '../enemies/types.js';

export type CombatResult =
  | { outcome: 'enemy_defeated'; xpGained: number }
  | { outcome: 'player_acted' }
  | { outcome: 'player_died' }
  | { outcome: 'floor_cleared' };

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
  const newEnemyHp = Math.max(0, target.hp - damage);
  const enemies = state.enemies.map(e =>
    e.id === targetId ? { ...e, hp: newEnemyHp } : e
  );

  let newVirtues = state.player.virtues;
  if (newEnemyHp <= 0 && action.virtueGain) {
    newVirtues = applyVirtueChange(state.player.virtues, state.player.baseline, action.virtueGain);
  }

  // Agape: heal 2 HP
  const hpBonus = action.id === 'agape' ? 2 : 0;

  const player: PlayerState = {
    ...state.player,
    virtues: newVirtues,
    hp: Math.min(state.player.maxHp, state.player.hp + hpBonus),
  };

  const playerEffects = tickEffects(state.playerEffects);
  const log = [...state.log, `You use ${action.name} on ${template.name} for ${damage} damage.`];

  return { ...state, player, enemies, playerEffects, log };
}

export function enemyTurn(state: CombatState, enemyId: string): CombatState {
  const template = state.enemyTemplates.get(enemyId);
  if (!template) return state;

  const intent = getEnemyIntent(template, state.player.floor);
  const newHp = executeEnemyIntent(intent, state.player.hp);
  const player: PlayerState = { ...state.player, hp: newHp };

  const prevEffects = state.enemyEffects.get(enemyId) ?? [];
  const newEnemyEffects = new Map(state.enemyEffects);
  newEnemyEffects.set(enemyId, tickEffects(prevEffects));

  const log = [...state.log, `${template.name} ${intent.description}.`];
  return { ...state, player, enemyEffects: newEnemyEffects, currentIntent: intent, log };
}

export function checkCombatEnd(state: CombatState): CombatResult | null {
  if (state.player.hp <= 0) return { outcome: 'player_died' };
  if (state.enemies.every(e => e.hp <= 0)) return { outcome: 'floor_cleared' };
  return null;
}
