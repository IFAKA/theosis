import type { VirtueStats } from '../player.js';
import type { CombatAction } from './actions.js';
import type { EnemyTemplate } from '../enemies/types.js';

export function isWeaknessExploited(action: CombatAction, enemy: EnemyTemplate): boolean {
  return action.virtue === enemy.weakness;
}

export function calculateDamage(
  action: CombatAction,
  virtues: VirtueStats,
  enemy: EnemyTemplate,
  floor: number
): number {
  let base = virtues[action.virtue] * action.damageMultiplier;
  if (isWeaknessExploited(action, enemy)) base *= 1.5;
  base += Math.floor(floor / 2);
  return Math.max(1, Math.round(base));
}
