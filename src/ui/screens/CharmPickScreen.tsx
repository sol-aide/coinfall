import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { STARTING_BAG, charmDef, chooseStarter, coinDef, type Race, type RunState } from '../../engine';
import { CoinArt, RaceBadge } from '../art/CoinArt';
import { Button, Ribbon, Stitch, Txt } from '../components/ui';
import { useGame } from '../state/GameContext';
import { colors, font, raceColors, radius } from '../theme';

const RACE_BLURB: Record<string, string> = {
  human: 'Economy and teamwork. Humans earn extra gold and get stronger together.',
  orc: 'Big values and chaos. Orcs smash, ram and flip the table.',
  elf: 'Precision and control. Elves force heads, re-flip tails and build streaks.',
};

export function CharmPickScreen({ onBack }: { onBack: () => void }) {
  const { run, act } = useGame();
  const r = run as RunState;
  const insets = useSafeAreaInsets();
  const [chosen, setChosen] = useState<string | null>(null);
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 12, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 12 }}>
        <View style={{ alignItems: 'center' }}>
          <Ribbon title="Choose your patron" width={230} />
        </View>
        <Txt style={styles.sub}>Your starting Charm lasts the whole run. Every run starts with this bag:</Txt>
        <View style={styles.bag} accessible accessibilityLabel={`Starting bag: ${STARTING_BAG.map((d) => coinDef(d).name).join(', ')}`}>
          {STARTING_BAG.map((d, i) => (
            <CoinArt key={i} defId={d} size={36} />
          ))}
        </View>
        {r.starterChoices.map((id) => {
          const c = charmDef(id);
          const race = c.race as Race;
          const rc = raceColors[race];
          const sel = chosen === id;
          return (
            <Pressable
              key={id}
              testID={`starter-${id}`}
              onPress={() => setChosen(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={`${c.name}, ${rc.label} charm. ${c.text} ${RACE_BLURB[race]}`}
              style={({ pressed }) => [styles.card, sel && { backgroundColor: '#463F5C' }, pressed && { opacity: 0.9 }]}
            >
              <Stitch r={radius.lg} inset={6} opacity={sel ? 1 : 0.4} color={sel ? colors.gold : colors.stitch} />
              <RaceBadge race={race} size={56} />
              <View style={{ flex: 1 }}>
                <Txt style={[styles.race, { color: rc.light }]}>{rc.plural}</Txt>
                <Txt style={styles.name}>{c.name}</Txt>
                <Txt style={styles.text}>{c.text}</Txt>
                <Txt style={styles.blurb}>{RACE_BLURB[race]}</Txt>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={styles.row}>
        <Button label="Back" variant="secondary" onPress={onBack} style={{ flex: 1 }} />
        <Button
          label="Begin run"
          variant="gold"
          disabled={!chosen}
          onPress={() => chosen && act((s) => chooseStarter(s, chosen))}
          style={{ flex: 2 }}
          testID="begin"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent', paddingHorizontal: 16 },
  title: { fontSize: font.h1, fontWeight: '900', textAlign: 'center' },
  sub: { fontSize: font.small, color: colors.textDim, textAlign: 'center', textShadowColor: 'rgba(10,6,12,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  bag: { flexDirection: 'row', justifyContent: 'center', gap: 4, flexWrap: 'wrap' },
  card: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(10,6,12,0.45)',
    padding: 16,
  },
  race: { fontSize: font.tiny, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: font.h2, fontWeight: '900' },
  text: { fontSize: font.body, color: colors.text, marginTop: 2 },
  blurb: { fontSize: font.small, color: colors.textDim, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, paddingTop: 8 },
});
