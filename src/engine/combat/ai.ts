import { RNG } from 'rot-js';
import type { EnemyTemplate } from '../enemies/types.js';

export type EnemyIntent = {
  action: 'attack' | 'defend' | 'debuff';
  description: string;
  damage?: number;
};

export function getEnemyIntent(enemy: EnemyTemplate, floorNumber: number): EnemyIntent {
  const description = RNG.getItem(enemy.intent) ?? enemy.intent[0];
  const scaledDamage = Math.round(enemy.baseDamage * (1 + (floorNumber - 1) * 0.15));

  // Map description keywords to action types
  const isDebuff = description.includes('whisper') || description.includes('cloud') || description.includes('bait');
  const isDefend = description.includes('weight') || description.includes('drain');

  if (isDebuff) return { action: 'debuff', description };
  if (isDefend) return { action: 'defend', description };
  return { action: 'attack', description, damage: scaledDamage };
}

export function executeEnemyIntent(intent: EnemyIntent, playerHp: number): number {
  if (intent.action === 'attack' && intent.damage !== undefined) {
    return Math.max(0, playerHp - intent.damage);
  }
  return playerHp;
}
