import { RNG } from 'rot-js';
import type { EnemyTemplate } from './types.js';
import type { VirtueStats } from '../player.js';
import enemiesData from '../../data/enemies.json' assert { type: 'json' };

const ALL_ENEMIES = enemiesData as EnemyTemplate[];

export function spawnEnemiesForFloor(floorNumber: number): EnemyTemplate[] {
  const eligible = ALL_ENEMIES.filter(e => e.floorMinimum <= floorNumber);
  if (eligible.length === 0) return [ALL_ENEMIES[0]];

  const count = 1 + Math.floor(RNG.getUniform() * 3); // 1-3
  const shuffled = RNG.shuffle([...eligible]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// sum=5 → 1.0, sum=25 → ~1.5, sum=50 → ~2.33
export function getDifficultyMultiplier(virtues: VirtueStats): number {
  const sum = Object.values(virtues).reduce((a, b) => a + b, 0);
  return 1 + (2 * (sum - 5)) / (sum - 5 + 20);
}

export function scaleEnemy(
  template: EnemyTemplate,
  floor: number,
  virtues?: VirtueStats
): { hp: number; damage: number } {
  const floorScale = 1 + (floor - 1) * 0.15;
  const difficultyScale = virtues ? getDifficultyMultiplier(virtues) : 1;
  return {
    hp: Math.round(template.baseHp * floorScale * difficultyScale),
    damage: Math.round(template.baseDamage * floorScale * difficultyScale),
  };
}
