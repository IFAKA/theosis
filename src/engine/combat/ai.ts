import { RNG } from 'rot-js';
import type { EnemyTemplate } from '../enemies/types.js';
import type { ActiveEffect } from './effects.js';

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
  const isDefend = description.includes('weigh') || description.includes('drain');

  if (isDebuff) return { action: 'debuff', description };
  if (isDefend) return { action: 'defend', description };
  return { action: 'attack', description, damage: scaledDamage };
}

export function executeEnemyIntent(
  intent: EnemyIntent,
  playerHp: number,
  playerEffects: ActiveEffect[],
  enemyEffects: ActiveEffect[]
): number {
  if (intent.action === 'attack' && intent.damage !== undefined) {
    let dmg = intent.damage;
    const enrage = enemyEffects.find(e => e.type === 'attack_up');
    if (enrage) dmg += enrage.magnitude;
    const debuff = enemyEffects.find(e => e.type === 'attack_down');
    if (debuff) dmg = Math.max(0, dmg - debuff.magnitude);
    const shield = playerEffects.find(e => e.type === 'shield');
    if (shield) dmg = Math.max(0, dmg - shield.magnitude);
    return Math.max(0, playerHp - dmg);
  }
  return playerHp;
}
