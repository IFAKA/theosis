export type VirtueStats = {
  humility: number;
  courage: number;
  temperance: number;
  wisdom: number;
  love: number;
};

export type RunStats = {
  runNumber: number;
  floorsCleared: number;
  enemiesDefeated: number;
  killedBy: string | null;
  peakVirtues: VirtueStats;
  encountersSeen: string[];
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
  currentRunStats: RunStats;
};

function initialRunStats(runNumber: number, virtues: VirtueStats): RunStats {
  return {
    runNumber,
    floorsCleared: 0,
    enemiesDefeated: 0,
    killedBy: null,
    peakVirtues: { ...virtues },
    encountersSeen: [],
  };
}

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
    currentRunStats: initialRunStats(1, virtues),
  };
}

export function resetForNewRun(state: PlayerState): PlayerState {
  const nextRun = state.runCount + 1;
  return {
    ...state,
    hp: state.maxHp,
    virtues: { ...state.baseline },
    floor: 1,
    isDead: false,
    currentRunStats: initialRunStats(nextRun, state.baseline),
  };
}
