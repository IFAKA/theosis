import { Box, Text, useStdout } from 'ink';
import type { EnemyOnFloor } from '../../engine/dungeon/floor.js';
import type { EnemyTemplate } from '../../engine/enemies/types.js';
import type { EnemyIntent } from '../../engine/combat/ai.js';
import type { CombatAction } from '../../engine/combat/actions.js';
import type { PlayerState } from '../../engine/player.js';
import { EnemyCard } from '../components/EnemyCard.js';
import { ChoiceMenu } from '../components/ChoiceMenu.js';

type CombatLogEntry = { text: string; color: string };

type CombatProps = {
  enemy: EnemyOnFloor & { template: EnemyTemplate };
  intent: EnemyIntent | null;
  actions: CombatAction[];
  player: PlayerState;
  combatLog: CombatLogEntry[];
  weaknessRevealed: boolean;
  onPlayerAction: (actionId: string) => void;
};

export function Combat({
  enemy,
  intent,
  actions,
  player,
  combatLog,
  weaknessRevealed,
  onPlayerAction,
}: CombatProps) {
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 80;

  const barWidth = Math.min(40, Math.max(8, cols - 20));
  const hpFilled = Math.round((player.hp / player.maxHp) * barWidth);
  const hpEmpty = barWidth - hpFilled;

  const choices = actions.slice(0, 4).map(a => ({
    id: a.id,
    text: a.name,
    hoverHint: `${a.virtue} · ×${a.damageMultiplier} dmg`,
  }));

  const recentLog = combatLog.slice(-3);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color="#d4af37" bold>COMBAT — Floor {enemy.template.floorMinimum}</Text>
      <Box marginTop={1}>
        <EnemyCard enemy={enemy} intent={intent} weaknessRevealed={weaknessRevealed} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="#e8e8e8">Your actions:</Text>
        <ChoiceMenu choices={choices} onSelect={onPlayerAction} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        {recentLog.map((entry, i) => (
          <Text key={i} color={entry.color}>{entry.text}</Text>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color="#e8e8e8">HP: </Text>
        <Text color="#ef4444">{'█'.repeat(Math.max(0, hpFilled))}</Text>
        <Text color="#333333">{'░'.repeat(Math.max(0, hpEmpty))}</Text>
        <Text color="#888888"> {player.hp}/{player.maxHp}</Text>
      </Box>
    </Box>
  );
}
