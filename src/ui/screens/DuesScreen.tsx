import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PHASES, canPayDues, charmDef, coinDef, currentDues, payDues, type GameEvent, type RunState } from '../../engine';
import { Icon } from '../art/Icons';
import { Button, Panel, Ribbon, Txt, thud } from '../components/ui';
import { useGame } from '../state/GameContext';
import { colors, font } from '../theme';

function describe(e: GameEvent, run: RunState): string | null {
  const nameOf = (uid?: string) => {
    const c = uid ? run.bag.find((b) => b.uid === uid) : undefined;
    return c ? coinDef(c.defId).name : 'A coin';
  };
  switch (e.t) {
    case 'gold':
      return `${e.label}: +${e.amount} gold`;
    case 'token':
      return `${e.uid ? `${nameOf(e.uid)}: ` : e.charmId ? `${charmDef(e.charmId).name}: ` : 'Guild stipend: '}+${e.amount} ${e.token === 'melt' ? 'Melt' : 'Reroll'} token${e.amount > 1 ? 's' : ''}`;
    case 'value':
      return `${nameOf(e.uid)} grows ${e.delta > 0 ? '+' : ''}${e.delta}`;
    default:
      return null;
  }
}

export function DuesScreen() {
  const { run, act, settings } = useGame();
  const r = run as RunState;
  const insets = useSafeAreaInsets();
  const dues = currentDues(r);
  const ok = canPayDues(r);
  const lines = (r.phaseReport?.events ?? []).map((e) => describe(e, r)).filter(Boolean) as string[];
  const final = r.phase >= PHASES;
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 12 }}>
        <View style={styles.head}>
          <Ribbon title={`Phase ${r.phase} complete`} width={230} />
          <Txt style={styles.sub}>The Lenders' Guild collects its dues{final ? ' for the last time' : ''}.</Txt>
        </View>
        {lines.length > 0 && (
          <Panel>
            <Txt style={styles.section}>Phase end</Txt>
            {lines.map((l, i) => (
              <Txt key={i} style={styles.line}>
                {l}
              </Txt>
            ))}
          </Panel>
        )}
        <Panel style={styles.bill}>
          <Row label="Your gold" value={r.gold} color={colors.gold} />
          <Row label="Guild dues" value={-dues} color={colors.text} />
          <View style={styles.rule} />
          <Row label={ok ? 'Left to spend' : 'Short by'} value={ok ? r.gold - dues : dues - r.gold} color={ok ? colors.success : colors.danger} />
        </Panel>
        {!ok && (
          <Txt style={[styles.sub, { color: colors.danger }]}>
            You can't cover the dues. The Guild takes your stall, and this run ends.
          </Txt>
        )}
      </ScrollView>
      {ok ? (
        <Button
          big
          variant="gold"
          label={`Pay ${dues} gold`}
          onPress={() => {
            thud(settings.haptics);
            act(payDues);
          }}
          testID="pay"
        />
      ) : (
        <Button big variant="danger" label="Hand over the stall" onPress={() => act(payDues)} testID="pay" />
      )}
    </View>
  );
}

function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label}: ${Math.abs(value)} gold`}>
      <Txt style={styles.rowLabel}>{label}</Txt>
      <Txt style={[styles.rowValue, { color }]}>{value}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: 16 },
  head: { alignItems: 'center', gap: 6 },
  title: { fontSize: font.h1, fontWeight: '900' },
  sub: { fontSize: font.body, color: colors.textDim, textAlign: 'center', textShadowColor: 'rgba(10,6,12,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  section: { fontSize: font.small, color: colors.textMuted, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  line: { fontSize: font.body, color: colors.text, marginVertical: 2 },
  bill: { gap: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  rowLabel: { fontSize: font.body, color: colors.textDim },
  rowValue: { fontSize: font.h1, fontWeight: '900' },
  rule: { height: 2, backgroundColor: colors.border, marginVertical: 2 },
});
