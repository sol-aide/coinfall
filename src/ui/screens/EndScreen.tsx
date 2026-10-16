import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PHASES, charmDef, currentDues, type RunState } from '../../engine';
import { CoinArt } from '../art/CoinArt';
import { Icon } from '../art/Icons';
import { Button, Panel, Ribbon, Txt } from '../components/ui';
import { Logo } from '../art/Logo';
import { useGame } from '../state/GameContext';
import { colors, font } from '../theme';
import { sortedBag } from './Overlays';

export function EndScreen({ onTitle }: { onTitle: () => void }) {
  const { run, startNewRun, reduceMotion } = useGame();
  const r = run as RunState;
  const insets = useSafeAreaInsets();
  const won = r.screen === 'won';
  const stats: [string, string | number][] = [
    ['Phases survived', won ? PHASES : r.phase - 1],
    ['Rounds played', r.stats.roundsPlayed],
    ['Best round', `${r.stats.bestRound} gold`],
    ['Gold earned', r.stats.goldEarned],
    ['Coins destroyed', r.stats.coinsDestroyed],
    ['Fusions', r.stats.fusions],
  ];
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 12 }}>
        <View style={styles.head}>
          {won ? <Logo width={250} still={reduceMotion} /> : null}
          <Ribbon title={won ? 'Guild master!' : 'Run over'} width={200} />
          <Txt style={styles.sub}>
            {won
              ? `You paid all ${PHASES} Guild dues. The bazaar will tell stories about your table.`
              : `You couldn't pay ${currentDues(r)} gold in phase ${r.phase}. The Guild takes your stall, for now.`}
          </Txt>
        </View>
        <Panel style={styles.stats}>
          {stats.map(([k, v]) => (
            <View key={k} style={styles.stat} accessible accessibilityLabel={`${k}: ${v}`}>
              <Txt style={styles.statV}>{v}</Txt>
              <Txt style={styles.statK}>{k}</Txt>
            </View>
          ))}
        </Panel>
        <Panel style={{ gap: 8 }}>
          <Txt style={styles.section}>Final bag</Txt>
          <View style={styles.bag}>
            {sortedBag(r).map((c) => (
              <CoinArt key={c.uid} defId={c.defId} size={40} level={c.level} engraved={!!c.engraving} />
            ))}
          </View>
          <Txt style={styles.section}>Charms</Txt>
          <Txt style={styles.charms}>{r.charms.map((c) => charmDef(c).name).join(' · ')}</Txt>
        </Panel>
      </ScrollView>
      <View style={styles.row}>
        <Button label="Title" variant="secondary" onPress={onTitle} style={{ flex: 1 }} testID="end-title" />
        <Button label="New run" variant="gold" onPress={startNewRun} style={{ flex: 2 }} testID="end-new" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: 16 },
  head: { alignItems: 'center', gap: 6 },
  title: { fontSize: 36, fontWeight: '900' },
  sub: { fontSize: font.body, color: colors.textDim, textAlign: 'center', textShadowColor: 'rgba(10,6,12,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  stat: { width: '48%', alignItems: 'center' },
  statV: { fontSize: font.h1, fontWeight: '900', color: colors.gold },
  statK: { fontSize: font.small, color: colors.textDim },
  section: { fontSize: font.small, color: colors.textMuted, fontWeight: '800', textTransform: 'uppercase' },
  bag: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  charms: { fontSize: font.body },
  row: { flexDirection: 'row', gap: 10, paddingTop: 8 },
});
