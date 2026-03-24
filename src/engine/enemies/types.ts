export type VirtueName = 'humility' | 'courage' | 'temperance' | 'wisdom' | 'love';

export type EnemyTemplate = {
  id: string;
  name: string;
  orthodoxName: string;
  symbol: string;
  weakness: VirtueName;
  baseHp: number;
  baseDamage: number;
  floorMinimum: number;
  isElite: boolean;
  description: string;
  intent: string[];
};

export const BASE_ENEMIES: EnemyTemplate[] = [
  {
    id: 'prelest',
    name: 'Demon of Pride',
    orthodoxName: 'Prelest',
    symbol: 'P',
    weakness: 'humility',
    baseHp: 12,
    baseDamage: 3,
    floorMinimum: 1,
    isElite: false,
    description: 'The spirit of spiritual delusion — it twists your strengths into vanity.',
    intent: ['strikes with contempt', 'whispers of your greatness', 'attacks your self-image'],
  },
  {
    id: 'acedia',
    name: 'Demon of Despair',
    orthodoxName: 'Acedia',
    symbol: 'A',
    weakness: 'love',
    baseHp: 10,
    baseDamage: 2,
    floorMinimum: 1,
    isElite: false,
    description: 'The noonday demon — it drains will and meaning from every act.',
    intent: ['drains your resolve', 'weighs on your spirit', 'whispers of futility'],
  },
  {
    id: 'kenodoxia',
    name: 'Demon of Vainglory',
    orthodoxName: 'Kenodoxia',
    symbol: 'K',
    weakness: 'wisdom',
    baseHp: 14,
    baseDamage: 3,
    floorMinimum: 2,
    isElite: false,
    description: 'The hunger for empty praise — it corrupts virtue into performance.',
    intent: ['baits you to show off', 'mocks your hidden worth', 'demands an audience'],
  },
  {
    id: 'thymos',
    name: 'Demon of Anger',
    orthodoxName: 'Thymos',
    symbol: 'T',
    weakness: 'temperance',
    baseHp: 16,
    baseDamage: 4,
    floorMinimum: 3,
    isElite: false,
    description: 'Righteous wrath unchecked — it burns everything, friend and foe alike.',
    intent: ['lashes out furiously', 'provokes without cause', 'escalates relentlessly'],
  },
  {
    id: 'porneia',
    name: 'Demon of Lust',
    orthodoxName: 'Porneia',
    symbol: 'L',
    weakness: 'courage',
    baseHp: 12,
    baseDamage: 3,
    floorMinimum: 3,
    isElite: false,
    description: 'Disordered desire — it confuses love with consumption.',
    intent: ['entices with illusions', 'weakens your resolve', 'clouds your vision'],
  },
];
