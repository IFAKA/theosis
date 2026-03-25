import { Box, Text } from 'ink';
import type { EnemyOnFloor } from '../../engine/dungeon/floor.js';
import type { EnemyTemplate, EnemyMechanic } from '../../engine/enemies/types.js';
import type { EnemyIntent } from '../../engine/combat/ai.js';

type EnemyCardProps = {
  enemy: EnemyOnFloor & { template: EnemyTemplate };
  intent: EnemyIntent | null;
  weaknessRevealed: boolean;
};

function mechanicLabel(m: EnemyMechanic): string {
  switch (m.type) {
    case 'deflect':  return `↩ DEFLECT (${Math.round(m.chance * 100)}% reflect off-weakness)`;
    case 'drain':    return `▼ DRAIN (halves off-weakness hits)`;
    case 'mirror':   return `◈ MIRROR (heals 1 on off-weakness hits)`;
    case 'enrage':   return `▲ ENRAGE (+${m.bonusDamage} dmg on off-weakness)`;
    case 'distract': return `~ DISTRACT (${Math.round(m.chance * 100)}% miss off-weakness)`;
  }
}

export function EnemyCard({ enemy, intent, weaknessRevealed }: EnemyCardProps) {
  const { template } = enemy;
  const hpFilled = Math.round((enemy.hp / enemy.maxHp) * 16);
  const hpEmpty = 16 - hpFilled;

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="#f87171" paddingX={1}>
      <Box gap={1}>
        <Text color="#f87171" bold>{template.name}</Text>
        <Text color="#555555">— {template.orthodoxName}</Text>
      </Box>
      <Box>
        <Text color="#e8e8e8">HP: </Text>
        <Text color="#f87171">{'█'.repeat(hpFilled)}</Text>
        <Text color="#333333">{'░'.repeat(hpEmpty)}</Text>
        <Text color="#888888"> {enemy.hp}/{enemy.maxHp}</Text>
        {intent && (
          <Text color="#fbbf24">  ▶ {intent.description}</Text>
        )}
      </Box>
      {weaknessRevealed && (
        <Text color="#00d9ff">⚠ Weak to {template.weakness}</Text>
      )}
      <Text color="#d4af37">{mechanicLabel(template.mechanic)}</Text>
    </Box>
  );
}
