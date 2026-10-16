import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PHASES } from '../../engine';
import { CoinArt, RaceBadge } from '../art/CoinArt';
import { Logo } from '../art/Logo';
import { Button, Txt } from '../components/ui';
import { useGame } from '../state/GameContext';
import { colors, font, raceColors, radius } from '../theme';

const RACES = [
  { race: 'human' as const, text: 'Economy and teamwork' },
  { race: 'orc' as const, text: 'Big values and chaos' },
  { race: 'elf' as const, text: 'Precision and control' },
];

export function TitleScreen({ onHowTo, onSettings, onPrivacy, onPlay }: { onHowTo: () => void; onSettings: () => void; onPrivacy: () => void; onPlay: () => void }) {
  const { run, startNewRun, records, reduceMotion } = useGame();
  const insets = useSafeAreaInsets();
  const canContinue = run && run.screen !== 'won' && run.screen !== 'lost';
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
      <View style={styles.hero}>
        <View style={styles.coins}>
          <FallingCoin defId="squire" delay={0} x={-90} still={reduceMotion} />
          <FallingCoin defId="grunt" delay={500} x={0} still={reduceMotion} />
          <FallingCoin defId="archer" delay={1000} x={90} still={reduceMotion} />
        </View>
        <Logo still={reduceMotion} />
        <Txt style={styles.tag}>Toss coins. Pay the Guild. Survive {PHASES} phases.</Txt>
      </View>
      <View style={styles.races} accessible accessibilityLabel="Humans: economy and teamwork. Orcs: big values and chaos. Elves: precision and control.">
        {RACES.map((r) => (
          <View key={r.race} style={styles.raceRow}>
            <RaceBadge race={r.race} size={34} />
            <Txt style={[styles.raceName, { color: raceColors[r.race].light }]}>{raceColors[r.race].plural}</Txt>
            <Txt style={styles.raceText}>{r.text}</Txt>
          </View>
        ))}
      </View>
      <View style={styles.buttons}>
        {canContinue && <Button big label="Continue run" icon="play" variant="gold" onPress={onPlay} testID="continue" />}
        <Button
          big={!canContinue}
          label="New run"
          variant={canContinue ? 'secondary' : 'gold'}
          icon={canContinue ? undefined : 'play'}
          onPress={() => {
            startNewRun();
            onPlay();
          }}
          testID="new-run"
          a11yHint={canContinue ? 'Abandons the current run and starts a new one' : undefined}
        />
        <View style={styles.row}>
          <Button label="How to play" variant="secondary" onPress={onHowTo} style={{ flex: 1 }} testID="howto" />
          <Button label="Settings" variant="secondary" onPress={onSettings} style={{ flex: 1 }} testID="settings" />
        </View>
        <Button label="Privacy" variant="ghost" onPress={onPrivacy} testID="privacy" />
        {records.runs > 0 && (
          <Txt style={styles.records}>
            Runs {records.runs} · Wins {records.wins} · Best phase {records.bestPhase}
          </Txt>
        )}
      </View>
    </View>
  );
}

function FallingCoin({ defId, delay, x, still }: { defId: string; delay: number; x: number; still: boolean }) {
  const y = useSharedValue(still ? 0 : -30);
  const rot = useSharedValue(1);
  useEffect(() => {
    if (still) return;
    y.value = withDelay(delay, withRepeat(withTiming(18, { duration: 1600, easing: Easing.inOut(Easing.sin) }), -1, true));
    rot.value = withDelay(delay, withRepeat(withTiming(0.2, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x }, { translateY: y.value }, { scaleX: rot.value }] }));
  return (
    <Animated.View style={[styles.coin, style]}>
      <CoinArt defId={defId} size={84} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: 20, justifyContent: 'space-between' },
  hero: { alignItems: 'center', marginTop: 0 },
  coins: { height: 130, width: '100%', alignItems: 'center', justifyContent: 'center' },
  coin: { position: 'absolute' },
  title: {
    fontSize: 58,
    fontWeight: '900',
    color: colors.gold,
    letterSpacing: 1,
    textShadowColor: '#7A4E00',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 0,
  },
  tag: { fontSize: font.body, color: colors.textDim, textAlign: 'center', marginTop: 6 },
  races: { backgroundColor: colors.panel, borderRadius: radius.lg, padding: 14, gap: 10, borderWidth: 3, borderBottomWidth: 7, borderColor: colors.ink },
  raceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  raceName: { fontSize: font.body, fontWeight: '900', minWidth: 78 },
  raceText: { fontSize: font.body, color: colors.textDim, flex: 1 },
  buttons: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  records: { textAlign: 'center', color: colors.textMuted, fontSize: font.small },
});
