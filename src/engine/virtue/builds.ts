import type { VirtueStats } from '../player.js';
import { VIRTUE_NAMES } from './stats.js';
import type { VirtueName } from '../enemies/types.js';

export type BuildArchetype = {
  name: string;
  dominantVirtue: string;
  description: string;
};

const ARCHETYPE_MAP: Record<VirtueName, BuildArchetype> = {
  humility:   { name: 'Hesychast',  dominantVirtue: 'humility',   description: 'The one who practices inner stillness' },
  courage:    { name: 'Martyr',     dominantVirtue: 'courage',    description: 'Witness through sacrifice' },
  temperance: { name: 'Ascetic',    dominantVirtue: 'temperance', description: 'Master of the passions' },
  wisdom:     { name: 'Theologian', dominantVirtue: 'wisdom',     description: 'Knower of God through reason' },
  love:       { name: 'Philokalos', dominantVirtue: 'love',       description: 'Lover of the Beautiful' },
};

export function detectBuild(virtues: VirtueStats): BuildArchetype {
  const max = Math.max(...VIRTUE_NAMES.map(v => virtues[v]));
  const dominant = VIRTUE_NAMES.filter(v => virtues[v] === max);

  if (dominant.length === 1) {
    return ARCHETYPE_MAP[dominant[0]];
  }

  // 3+ way tie: show Balanced
  if (dominant.length >= 3) {
    return {
      name: 'Balanced',
      dominantVirtue: dominant.join('/'),
      description: 'Equal in all virtues',
    };
  }

  // 2-way tie: combine archetype names
  const names = dominant.map(v => ARCHETYPE_MAP[v].name).join('-');
  return {
    name: names,
    dominantVirtue: dominant.join('/'),
    description: dominant.map(v => ARCHETYPE_MAP[v].description).join(' & '),
  };
}
