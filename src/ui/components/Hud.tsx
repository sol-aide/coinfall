import React from 'react';
import { StyleSheet, View } from 'react-native';
import { PHASES, ROUNDS_PER_PHASE, computeMods, currentDues, duesFor, type RunState } from '../../engine';
import { colors, font } from '../theme';
import { IconButton, Pill, Stitch, Txt } from './ui';

export function Hud({
  run,
  onBag,
  onCharms,
  onMenu,
  showRound = true,
  goldOverride,
  nextPhase,
}: {
  nextPhase?: boolean;
  run: RunState;
  goldOverride?: number;
  onBag: () => void;
  onCharms: () => void;
  onMenu: () => void;
  showRound?: boolean;
}) {
  const dues = nextPhase ? duesFor(Math.min(run.phase + 1, PHASES), computeMods(run.charms)) : currentDues(run);
  const gold = goldOverride ?? run.gold;
  const short = Math.max(0, dues - gold);
  return (
    <View style={styles.hud}>
      <Stitch r={16} inset={5} opacity={0.4} />
      <View style={styles.row}>
        <View style={{ flex: 1 }} accessible accessibilityRole="header" accessibilityLabel={`Phase ${run.phase} of ${PHASES}${showRound ? `, round ${run.round} of ${ROUNDS_PER_PHASE}` : ''}`}>
          <Txt style={styles.phase}>
            Phase {run.phase}
            <Txt style={styles.phaseOf}>/{PHASES}</Txt>
          </Txt>
          {showRound && (
            <View style={styles.dots}>
              {Array.from({ length: ROUNDS_PER_PHASE }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < run.round - 1 || (i === run.round - 1 && run.screen === 'reward') ? styles.dotDone : null,
                    i === run.round - 1 && run.screen === 'ready' ? styles.dotNow : null,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
        <IconButton icon="bag" label="Your bag" badge={run.bag.length} onPress={onBag} />
        <IconButton icon="charm" label="Your charms" badge={run.charms.length} onPress={onCharms} />
        <IconButton icon="gear" label="Menu and settings" onPress={onMenu} size={24} />
      </View>
      <View style={styles.row2}>
        <Pill icon="gold" value={gold} label="Gold" color={colors.gold} />
        <View style={styles.dues} accessible accessibilityLabel={`Guild dues at the end of ${nextPhase ? 'next' : 'this'} phase: ${dues} gold${short ? `, ${short} more needed` : ', covered'}`}>
          <Txt style={styles.duesLabel}>{nextPhase ? 'Next dues' : 'Dues'}</Txt>
          <Txt style={[styles.duesValue, { color: short ? colors.text : colors.success }]}>{dues}</Txt>
          {!nextPhase && <Txt style={[styles.duesNeed, { color: short ? colors.accent : colors.success }]}>{short ? `need ${short}` : 'covered ✓'}</Txt>}
        </View>
        <Pill icon="melt" value={run.meltTokens} label="Melt tokens" />
        <Pill icon="reroll" value={run.rerollTokens} label="Reroll tokens" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: colors.panel,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.wood,
    borderBottomWidth: 5,
    borderBottomColor: colors.woodDark,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'space-between' },
  phase: { fontSize: font.h2, fontWeight: '900' },
  phaseOf: { fontSize: font.small, color: colors.textMuted, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 5, marginTop: 3 },
  dot: { width: 14, height: 8, borderRadius: 4, backgroundColor: colors.panelLight },
  dotDone: { backgroundColor: colors.gold },
  dotNow: { backgroundColor: colors.accent },
  dues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    backgroundColor: colors.bgDeep,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(158,168,200,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 1,
  },
  duesLabel: { fontSize: font.tiny, color: colors.textDim, fontWeight: '700' },
  duesValue: { fontSize: font.body, fontWeight: '900' },
  duesNeed: { fontSize: font.tiny, fontWeight: '700' },
});
