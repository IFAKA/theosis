import type { VirtueName } from '../enemies/types.js';

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

export const L1_ACTIONS: CombatAction[] = [
  {
    id: 'prostration',
    virtue: 'humility',
    name: 'Prostration',
    description: 'You bow before God — enemy attack reduced by 1 next turn.',
    level: 1,
    damageMultiplier: 0.8,
    cost: 0,
  },
  {
    id: 'stand_firm',
    virtue: 'courage',
    name: 'Stand Firm',
    description: 'You hold the line. Gain 1 Courage on kill.',
    level: 1,
    damageMultiplier: 1.2,
    virtueGain: { courage: 1 },
    cost: 0,
  },
  {
    id: 'fast',
    virtue: 'temperance',
    name: 'Fast',
    description: 'Abstinence as weapon — removes 1 debuff.',
    level: 1,
    damageMultiplier: 1.0,
    cost: 0,
  },
  {
    id: 'discernment',
    virtue: 'wisdom',
    name: 'Discernment',
    description: 'You see through the mask. Reveals weakness if Wisdom ≥ 3.',
    level: 1,
    damageMultiplier: 1.0,
    cost: 0,
  },
  {
    id: 'agape',
    virtue: 'love',
    name: 'Agape',
    description: 'Love without condition — heal 2 HP.',
    level: 1,
    damageMultiplier: 0.6,
    cost: 0,
  },
];

export function getAvailableActions(virtueLevel: number, virtue: VirtueName): CombatAction[] {
  return L1_ACTIONS.filter(a => a.virtue === virtue && a.level <= virtueLevel);
}
