import { useState, useEffect } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import type { EnemyOnFloor } from '../../engine/dungeon/floor.js';
import type { EnemyTemplate } from '../../engine/enemies/types.js';
import type { EnemyIntent } from '../../engine/combat/ai.js';
import type { CombatAction } from '../../engine/combat/actions.js';
import type { PlayerState } from '../../engine/player.js';
import { EnemyCard } from '../components/EnemyCard.js';
import { ChoiceMenu } from '../components/ChoiceMenu.js';
import { VIRTUE_NAMES, VIRTUE_DISPLAY } from '../../engine/virtue/stats.js';
import { calculateDamage, isWeaknessExploited } from '../../engine/combat/damage.js';

type CombatLogEntry = { text: string; color: string };

type CombatProps = {
  enemy: EnemyOnFloor & { template: EnemyTemplate };
  intent: EnemyIntent | null;
  actions: CombatAction[];
  player: PlayerState;
  combatLog: CombatLogEntry[];
  weaknessRevealed: boolean;
  onPlayerAction: (actionId: string) => void;
  onEndTurn: () => void;
  playerAp: number;
  virtueGainFlash?: { label: string; virtue: string; amount: number } | null;
};

export function Combat({
  enemy,
  intent,
  actions,
  player,
  combatLog,
  weaknessRevealed,
  onPlayerAction,
  onEndTurn,
  playerAp,
  virtueGainFlash,
}: CombatProps) {
  const { stdout } = useStdout();
  const cols = stdout?.columns ?? 80;

  const lastLogEntry = combatLog[combatLog.length - 1] ?? null;
  const [bannerVisible, setBannerVisible] = useState(true);
  useEffect(() => {
    if (lastLogEntry?.color !== '#00d9ff') return;
    let count = 0;
    setBannerVisible(true);
    const interval = setInterval(() => {
      setBannerVisible(v => !v);
      if (++count >= 3) { clearInterval(interval); setBannerVisible(true); }
    }, 120);
    return () => clearInterval(interval);
  }, [lastLogEntry]);

  const [gainVisible, setGainVisible] = useState(true);
  useEffect(() => {
    if (!virtueGainFlash) return;
    let count = 0;
    setGainVisible(true);
    const interval = setInterval(() => {
      setGainVisible(v => !v);
      if (++count >= 7) { clearInterval(interval); setGainVisible(true); }
    }, 120);
    return () => clearInterval(interval);
  }, [virtueGainFlash]);

  useInput((input) => {
    if (input === 'e' || input === 'E') onEndTurn();
  });

  const barWidth = Math.min(40, Math.max(8, cols - 20));
  const hpFilled = Math.round((player.hp / player.maxHp) * barWidth);
  const hpEmpty = barWidth - hpFilled;

  const EFFECT_TAG: Record<string, string> = { heal: '+HEAL', shield: '+SHIELD', debuff: '+DEBUFF', reveal: '+REVEAL' };
  const choices = actions.slice(0, 5).map(a => {
    const dmg = calculateDamage(a, player.virtues, enemy.template, player.floor);
    const isWeak = weaknessRevealed && isWeaknessExploited(a, enemy.template);
    const disabled = a.cost > playerAp;
    return {
      id: a.id,
      text: a.name,
      hoverHint: `[${a.cost}AP] ${a.virtue} · ${dmg} dmg${isWeak ? ' ⚡' : ''}${a.effect ? ' ' + EFFECT_TAG[a.effect] : ''}`,
      disabled,
      disabledHint: disabled ? `need ${a.cost} AP` : undefined,
    };
  });

  const recentLog = combatLog.slice(-3);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color="#d4af37" bold>COMBAT — Floor {player.floor}</Text>
      <Box marginTop={1}>
        <EnemyCard enemy={enemy} intent={intent} weaknessRevealed={weaknessRevealed} />
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text color="#e8e8e8">Your actions:</Text>
        <ChoiceMenu choices={choices} onSelect={onPlayerAction} />
      </Box>
      {playerAp > 0 && (
        <Box marginTop={1}>
          <Text color="#555555">[E] End turn</Text>
        </Box>
      )}
      {virtueGainFlash && (
        <Box marginTop={1}>
          {gainVisible
            ? <Text color="#6b4ba0" bold>+{virtueGainFlash.amount} {virtueGainFlash.label}</Text>
            : <Text> </Text>
          }
        </Box>
      )}
      <Box marginTop={1} flexDirection="column">
        {recentLog.map((entry, i) => {
          const isWeaknessBanner = entry.color === '#00d9ff' && i === recentLog.length - 1;
          if (isWeaknessBanner && !bannerVisible) return <Text key={i}> </Text>;
          return <Text key={i} color={entry.color}>{entry.text}</Text>;
        })}
      </Box>
      <Box marginTop={1}>
        <Text color="#888888">AP  </Text>
        <Text color="#d4af37">{'●'.repeat(Math.max(0, playerAp))}</Text>
        <Text color="#333333">{'○'.repeat(Math.max(0, 3 - playerAp))}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color="#e8e8e8">HP: </Text>
        <Text color="#ef4444">{'█'.repeat(Math.max(0, hpFilled))}</Text>
        <Text color="#333333">{'░'.repeat(Math.max(0, hpEmpty))}</Text>
        <Text color="#888888"> {player.hp}/{player.maxHp}</Text>
      </Box>
      <Box marginTop={1}>
        {VIRTUE_NAMES.map((v, i) => (
          <Box key={v} marginRight={i < VIRTUE_NAMES.length - 1 ? 2 : 0}>
            <Text color={VIRTUE_DISPLAY[v].color}>{VIRTUE_DISPLAY[v].label.slice(0, 3)}</Text>
            <Text color="#888888">:{player.virtues[v]}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
