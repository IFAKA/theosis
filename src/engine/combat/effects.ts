export type EffectType = 'defense_down' | 'attack_down' | 'regen' | 'weakness_revealed' | 'shield' | 'attack_up';

export type ActiveEffect = {
  type: EffectType;
  turnsRemaining: number;
  magnitude: number;
};

export function tickEffects(effects: ActiveEffect[]): ActiveEffect[] {
  return effects
    .map(e => ({ ...e, turnsRemaining: e.turnsRemaining - 1 }))
    .filter(e => e.turnsRemaining > 0);
}

export function applyEffect(effects: ActiveEffect[], newEffect: ActiveEffect): ActiveEffect[] {
  return [...effects, newEffect];
}

export function hasEffect(effects: ActiveEffect[], type: EffectType): boolean {
  return effects.some(e => e.type === type);
}
