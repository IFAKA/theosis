import type { PlayerState, VirtueStats, RunStats } from '../player.js';
import { VIRTUE_NAMES, MAX_VIRTUE, THEOSIS_THRESHOLD } from './stats.js';

export function raiseBaseline(baseline: VirtueStats): VirtueStats {
  const min = Math.min(...VIRTUE_NAMES.map(v => baseline[v]));
  const raised = { ...baseline };
  for (const v of VIRTUE_NAMES) {
    if (baseline[v] === min) {
      raised[v] = min + 1;
      break;
    }
  }
  return raised;
}

export function checkTheosis(virtues: VirtueStats): boolean {
  return VIRTUE_NAMES.every(v => virtues[v] >= THEOSIS_THRESHOLD);
}

export function applyVirtueChange(
  virtues: VirtueStats,
  baseline: VirtueStats,
  changes: Partial<VirtueStats>
): VirtueStats {
  const result = { ...virtues };
  for (const v of VIRTUE_NAMES) {
    if (changes[v] !== undefined) {
      result[v] = Math.max(baseline[v], Math.min(MAX_VIRTUE, virtues[v] + changes[v]!));
    }
  }
  return result;
}

export function applyDeath(state: PlayerState): PlayerState {
  const newBaseline = raiseBaseline(state.baseline);
  const newVirtues: VirtueStats = { ...newBaseline };
  const nextRun = state.runCount + 1;
  const freshStats: RunStats = {
    runNumber: nextRun,
    floorsCleared: 0,
    enemiesDefeated: 0,
    killedBy: null,
    peakVirtues: { ...newVirtues },
    encountersSeen: [],
  };
  return {
    ...state,
    baseline: newBaseline,
    virtues: newVirtues,
    hp: state.maxHp,
    floor: 1,
    isDead: false,
    runCount: nextRun,
    currentRunStats: freshStats,
  };
}
