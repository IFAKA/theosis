import { RNG } from 'rot-js';
import type { EnemyTemplate } from './types.js';
import enemiesData from '../../data/enemies.json' assert { type: 'json' };

const ALL_ENEMIES = enemiesData as EnemyTemplate[];

export function spawnEnemiesForFloor(floorNumber: number): EnemyTemplate[] {
  const eligible = ALL_ENEMIES.filter(e => e.floorMinimum <= floorNumber);
  if (eligible.length === 0) return [ALL_ENEMIES[0]];

  const count = 1 + Math.floor(RNG.getUniform() * 3); // 1-3
  const shuffled = RNG.shuffle([...eligible]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function scaleEnemy(template: EnemyTemplate, floor: number): { hp: number; damage: number } {
  const scale = 1 + (floor - 1) * 0.15;
  return {
    hp: Math.round(template.baseHp * scale),
    damage: Math.round(template.baseDamage * scale),
  };
}
