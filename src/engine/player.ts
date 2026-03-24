export type VirtueStats = {
  humility: number;
  courage: number;
  temperance: number;
  wisdom: number;
  love: number;
};

export type PlayerState = {
  hp: number;
  maxHp: number;
  virtues: VirtueStats;
  baseline: VirtueStats;
  floor: number;
  runCount: number;
  floorCount: number;
  isDead: boolean;
  hasAchievedTheosis: boolean;
};

export function createInitialPlayer(): PlayerState {
  const virtues: VirtueStats = { humility: 1, courage: 1, temperance: 1, wisdom: 1, love: 1 };
  return {
    hp: 20,
    maxHp: 20,
    virtues: { ...virtues },
    baseline: { ...virtues },
    floor: 1,
    runCount: 1,
    floorCount: 0,
    isDead: false,
    hasAchievedTheosis: false,
  };
}

export function resetForNewRun(state: PlayerState): PlayerState {
  return {
    ...state,
    hp: state.maxHp,
    virtues: { ...state.baseline },
    floor: 1,
    isDead: false,
  };
}
