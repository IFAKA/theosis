import type { VirtueName } from '../enemies/types.js';

export type EncounterCategory = 'desert-fathers' | 'demonic' | 'icons' | 'monastic' | 'martyrdom';

export type VirtueEffect = Partial<Record<VirtueName, number>>;

export type Choice = {
  id: string;
  text: string;
  hoverHint: string;
  virtueEffects: VirtueEffect;
  combatModifier?: {
    damageBonus?: number;
    hpBonus?: number;
  };
};

export type Encounter = {
  id: string;
  category: EncounterCategory;
  title: string;
  narrative: string;
  orthodoxConcept: string;
  choices: [Choice, Choice, Choice];
};
