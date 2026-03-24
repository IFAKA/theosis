import { RNG } from 'rot-js';
import type { PlayerState } from '../player.js';
import type { Encounter, Choice } from './types.js';
import { applyVirtueChange } from '../virtue/progression.js';

export function applyChoice(player: PlayerState, choice: Choice): PlayerState {
  const newVirtues = applyVirtueChange(player.virtues, player.baseline, choice.virtueEffects);
  const hpBonus = choice.combatModifier?.hpBonus ?? 0;
  return {
    ...player,
    virtues: newVirtues,
    hp: Math.min(player.maxHp, player.hp + hpBonus),
  };
}

export function selectEncounters(pool: Encounter[], count: number): Encounter[] {
  return RNG.shuffle([...pool]).slice(0, count);
}
