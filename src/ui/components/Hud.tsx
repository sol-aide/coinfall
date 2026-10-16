import React, { useEffect, useRef } from 'react';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { PHASES, ROUNDS_PER_PHASE, computeMods, currentDues, duesFor, type RunState } from '../../engine';
import { colors, font } from '../theme';
import { IconButton, Pill, Txt } from './ui';

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
        <GoldPill gold={gold} />
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
  hud: { paddingHorizontal: 12, paddingTop: 4, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  row2: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'space-between' },
  phase: { fontSize: font.h2, fontWeight: '900' },
  phaseOf: { fontSize: font.small, color: colors.textMuted, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 5, marginTop: 3 },
  dot: { width: 16, height: 9, borderRadius: 5, backgroundColor: colors.panelLight, borderWidth: 2, borderColor: colors.ink },
  dotDone: { backgroundColor: colors.gold },
  dotNow: { backgroundColor: colors.accent },
  dues: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    backgroundColor: colors.bgDeep,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 1,
  },
  duesLabel: { fontSize: font.tiny, color: colors.textDim, fontWeight: '700' },
  duesValue: { fontSize: font.body, fontWeight: '900' },
  duesNeed: { fontSize: font.tiny, fontWeight: '700' },
});

/** Gold counter that pops whenever the amount changes. */
function GoldPill({ gold }: { gold: number }) {
  const s = useSharedValue(1);
  const last = useRef(gold);
  useEffect(() => {
    if (gold === last.current) return;
    const up = gold > last.current;
    last.current = gold;
    s.value = withSequence(withTiming(up ? 1.25 : 0.88, { duration: 90, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 180, easing: Easing.out(Easing.back(3)) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gold]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View style={style}>
      <Pill icon="gold" value={gold} label="Gold" color={colors.gold} />
    </Animated.View>
  );
}
