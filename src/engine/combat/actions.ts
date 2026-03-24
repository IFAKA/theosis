import type { VirtueName } from '../enemies/types.js';
import abilitiesData from '../../data/abilities.json' assert { type: 'json' };

export type CombatAction = {
  id: string;
  virtue: VirtueName;
  name: string;
  description: string;
  level: number;
  damageMultiplier: number;
  virtueGain?: Partial<Record<VirtueName, number>>;
  cost: number;
};

type AbilityEntry = { level: number; name: string; damageMultiplier: number; description: string };

function buildActions(virtue: VirtueName, entries: AbilityEntry[]): CombatAction[] {
  return entries.map(e => ({
    id: e.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
    virtue,
    name: e.name,
    description: e.description,
    level: e.level,
    damageMultiplier: e.damageMultiplier,
    cost: 0,
  }));
}

export const ALL_ACTIONS: CombatAction[] = [
  ...buildActions('humility', abilitiesData.humility as AbilityEntry[]),
  ...buildActions('courage', abilitiesData.courage as AbilityEntry[]),
  ...buildActions('temperance', abilitiesData.temperance as AbilityEntry[]),
  ...buildActions('wisdom', abilitiesData.wisdom as AbilityEntry[]),
  ...buildActions('love', abilitiesData.love as AbilityEntry[]),
];

export function getAvailableActions(virtueLevel: number, virtue: VirtueName): CombatAction[] {
  return ALL_ACTIONS.filter(a => a.virtue === virtue && a.level <= virtueLevel);
}
