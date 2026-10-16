import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MIN_BAG, charmDef, coinDef, type RunState } from '../../engine';
import { Icon } from '../art/Icons';
import { CoinDetail, CoinRow } from '../components/CoinInfo';
import { Button, Overlay, Stitch, Txt } from '../components/ui';
import { colors, font, radius, raceColors } from '../theme';

const RACE_ORDER = { human: 0, orc: 1, elf: 2, neutral: 3 } as const;

export function sortedBag(run: RunState) {
  return run.bag
    .slice()
    .sort(
      (a, b) =>
        RACE_ORDER[coinDef(a.defId).race] - RACE_ORDER[coinDef(b.defId).race] ||
        coinDef(a.defId).name.localeCompare(coinDef(b.defId).name) ||
        b.level - a.level,
    );
}

/**
 * Lists the bag. In `pick` mode, tapping a coin calls onPick instead of showing details
 * (used for melting and engraving).
 */
export function BagOverlay({
  run,
  onClose,
  title,
  prompt,
  onPick,
  pickLabel,
  filter,
}: {
  run: RunState;
  onClose: () => void;
  title?: string;
  prompt?: string;
  onPick?: (uid: string) => void;
  pickLabel?: string;
  filter?: (uid: string) => boolean;
}) {
  const [detail, setDetail] = useState<string | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const counts = { human: 0, orc: 0, elf: 0, neutral: 0 };
  for (const c of run.bag) counts[coinDef(c.defId).race]++;
  const coins = sortedBag(run).filter((c) => !filter || filter(c.uid));
  return (
    <Overlay onClose={onClose} title={title ?? `Your bag (${run.bag.length})`}>
      {prompt && <Txt style={styles.prompt}>{prompt}</Txt>}
      {!onPick && (
        <View style={styles.counts}>
          {(['human', 'orc', 'elf', 'neutral'] as const).map((r) => (
            <Txt key={r} style={[styles.count, { color: raceColors[r].light }]}>
              {raceColors[r].label}: {counts[r]}
            </Txt>
          ))}
        </View>
      )}
      <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 6 }}>
        {coins.map((c) => (
          <CoinRow
            key={c.uid}
            defId={c.defId}
            inst={c}
            run={run}
            selected={chosen === c.uid}
            onPress={() => (onPick ? setChosen(c.uid) : setDetail(c.uid))}
            a11yHint={onPick ? 'Selects this coin' : 'Shows details'}
            testID={`bag-${c.uid}`}
          />
        ))}
      </ScrollView>
      {onPick && (
        <View style={styles.pickRow}>
          <Button label="Cancel" variant="secondary" onPress={onClose} style={{ flex: 1 }} />
          <Button
            label={pickLabel ?? 'Choose'}
            variant="gold"
            disabled={!chosen}
            onPress={() => chosen && onPick(chosen)}
            style={{ flex: 1.4 }}
            testID="bag-confirm"
          />
        </View>
      )}
      {!onPick && run.bag.length <= MIN_BAG && <Txt style={styles.prompt}>Your bag can't shrink below {MIN_BAG} coins.</Txt>}
      {detail && <CoinDetail run={run} uid={detail} onClose={() => setDetail(null)} />}
    </Overlay>
  );
}

export function CharmsOverlay({ run, onClose }: { run: RunState; onClose: () => void }) {
  return (
    <Overlay onClose={onClose} title={`Your charms (${run.charms.length})`}>
      <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 8 }}>
        {run.charms.length === 0 && <Txt style={styles.prompt}>No charms yet. Buy them in the shop after paying dues.</Txt>}
        {run.charms.map((id) => {
          const c = charmDef(id);
          return (
            <View key={id} style={styles.charm} accessible accessibilityLabel={`${c.name}. ${c.text}`}>
              <Stitch r={radius.md} inset={4} opacity={0.35} />
              <Icon name="charm" size={34} />
              <View style={{ flex: 1 }}>
                <Txt style={styles.charmName}>{c.name}</Txt>
                <Txt style={styles.charmText}>{c.text}</Txt>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  prompt: { fontSize: font.small, color: colors.textDim, marginBottom: 8 },
  counts: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 8 },
  count: { fontSize: font.small, fontWeight: '800' },
  pickRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  charm: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.panelLight, borderRadius: radius.md, padding: 10 },
  charmName: { fontWeight: '800', fontSize: font.body },
  charmText: { color: colors.textDim, fontSize: font.small },
});
