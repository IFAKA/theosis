import type { VirtueStats } from '../player.js';
import type { CombatAction } from './actions.js';
import type { EnemyTemplate } from '../enemies/types.js';

export function isWeaknessExploited(action: CombatAction, enemy: EnemyTemplate): boolean {
  return action.virtue === enemy.weakness;
}

export function isWeaknessRevealed(wisdomLevel: number): boolean {
  return wisdomLevel >= 3;
}

export function calculateDamage(
  action: CombatAction,
  virtues: VirtueStats,
  enemy: EnemyTemplate,
  floor: number
): number {
  let base = virtues[action.virtue] * action.damageMultiplier + 3;
  if (isWeaknessExploited(action, enemy)) base *= 2.0;
  base += action.level * 0.5 + Math.min(Math.floor(floor / 2), 3);
  return Math.max(1, Math.round(base));
}
