import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  abilityText,
  coinDef,
  computeMods,
  displayValue,
  engravingDef,
  headsChance,
  type CoinInstance,
  type RunState,
} from '../../engine';
import { CoinArt, RaceBadge } from '../art/CoinArt';
import { TOUCH, colors, font, raceColors, radius, rarityColors } from '../theme';
import { Overlay, Txt } from './ui';

export function levelNote(level: number) {
  return level > 1 ? `Level ${level}: base value and ability numbers ×${level} (shown above).` : '';
}

/** Compact row: coin art, name, race and ability. Used by rewards, shop and the bag. */
export function CoinRow({
  defId,
  inst,
  run,
  onPress,
  right,
  selected,
  a11yHint,
  testID,
}: {
  defId: string;
  inst?: CoinInstance;
  run?: RunState;
  onPress?: () => void;
  right?: React.ReactNode;
  selected?: boolean;
  a11yHint?: string;
  testID?: string;
}) {
  const def = coinDef(defId);
  const rc = raceColors[def.race];
  const mods = computeMods(run?.charms ?? []);
  const value = inst ? displayValue(inst, mods) : def.value;
  const level = inst?.level ?? 1;
  const eng = inst?.engraving ? engravingDef(inst.engraving) : undefined;
  const body = (
    <>
      <CoinArt defId={defId} size={54} level={level} engraved={!!eng} />
      <View style={styles.rowText}>
        <View style={styles.rowTitle}>
          <Txt style={styles.name} numberOfLines={1}>
            {def.name}
          </Txt>
          <Txt style={[styles.race, { color: rc.light }]}>{rc.label}</Txt>
          {def.rarity === 'rare' && <Txt style={[styles.race, { color: rarityColors.rare }]}>Rare</Txt>}
        </View>
        <Txt style={styles.ability}>{abilityText(def, level)}</Txt>
        {eng && <Txt style={styles.eng}>◆ {eng.name}: {eng.text}</Txt>}
        {level > 1 && <Txt style={styles.eng}>{levelNote(level)}</Txt>}
      </View>
      <View style={styles.rowRight}>
        <View style={styles.valueChip}>
          <Txt style={styles.valueTxt}>{value}</Txt>
          <Txt style={styles.valueCap}>value</Txt>
        </View>
        {right}
      </View>
    </>
  );
  const label = `${def.name}, ${rc.label}${level > 1 ? `, level ${level}` : ''}, value ${value}. ${abilityText(def, level)}${eng ? ` Engraved ${eng.name}.` : ''}`;
  if (!onPress)
    return (
      <View style={styles.row} accessible accessibilityLabel={label}>
        {body}
      </View>
    );
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={a11yHint}
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => [styles.row, selected && styles.rowSelected, pressed && { opacity: 0.85 }]}
    >
      {body}
    </Pressable>
  );
}

export function CoinDetail({ run, uid, defId, onClose }: { run: RunState; uid?: string; defId?: string; onClose: () => void }) {
  const inst = uid ? run.bag.find((c) => c.uid === uid) : undefined;
  const id = inst?.defId ?? defId ?? run.lastRound?.table.find((c) => c.uid === uid)?.defId;
  if (!id) return null;
  const def = coinDef(id);
  const rc = raceColors[def.race];
  const mods = computeMods(run.charms);
  const probe: CoinInstance = inst ?? { uid: 'probe', defId: id, level: 1, bonus: 0, streak: 0, streakBonus: 0 };
  const eng = inst?.engraving ? engravingDef(inst.engraving) : undefined;
  const destroyedNow = uid && !inst;
  return (
    <Overlay onClose={onClose} title={def.name}>
      <View style={styles.detailArt}>
        <CoinArt defId={id} face="heads" size={112} level={probe.level} engraved={!!eng} />
        <CoinArt defId={id} face="tails" size={84} level={probe.level} />
      </View>
      <View style={styles.detailMeta}>
        <RaceBadge race={def.race} size={24} />
        <Txt style={[styles.detailRace, { color: rc.light }]}>{rc.label}</Txt>
        <Txt style={[styles.detailRace, { color: rarityColors[def.rarity] }]}>{def.rarity === 'starter' ? 'Starter' : def.rarity[0].toUpperCase() + def.rarity.slice(1)}</Txt>
      </View>
      <Txt style={styles.detailText}>{abilityText(def, probe.level)}</Txt>
      {probe.level > 1 && <Txt style={styles.detailSub}>{levelNote(probe.level)}</Txt>}
      {eng && (
        <Txt style={styles.detailSub}>
          ◆ Engraving — {eng.name}: {eng.text}
        </Txt>
      )}
      <View style={styles.statRow}>
        <Stat label="Value" value={String(displayValue(probe, mods))} />
        <Stat label="Heads chance" value={`${Math.round(headsChance(probe, mods) * 100)}%`} />
        {inst && inst.bonus !== 0 && <Stat label="Grown" value={`${inst.bonus > 0 ? '+' : ''}${inst.bonus}`} />}
        {inst && inst.streak > 0 && <Stat label="Streak" value={String(inst.streak)} />}
      </View>
      {destroyedNow && <Txt style={[styles.detailSub, { color: colors.danger }]}>This coin was destroyed and has left your bag.</Txt>}
    </Overlay>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Txt style={styles.statValue}>{value}</Txt>
      <Txt style={styles.statLabel}>{label}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.panelLight,
    borderRadius: radius.md,
    padding: 10,
    minHeight: TOUCH + 20,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: colors.ink,
  },
  rowSelected: { borderColor: colors.gold, backgroundColor: '#6D5AD8' },
  rowText: { flex: 1 },
  rowTitle: { flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: font.body, fontWeight: '800' },
  race: { fontSize: font.tiny, fontWeight: '700' },
  ability: { fontSize: font.small, color: colors.textDim, marginTop: 2 },
  eng: { fontSize: font.tiny, color: '#9FE8FF', marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 6 },
  valueChip: {
    minWidth: 40,
    borderRadius: 10,
    backgroundColor: colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  valueTxt: { color: colors.text, fontWeight: '900', fontSize: 17, lineHeight: 19 },
  valueCap: { color: colors.textMuted, fontSize: 11, fontWeight: '700', lineHeight: 13 },
  detailArt: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginVertical: 6 },
  detailMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  detailRace: { fontWeight: '800', fontSize: font.small },
  detailText: { fontSize: font.h2, textAlign: 'center', lineHeight: 27, fontWeight: '600' },
  detailSub: { fontSize: font.small, color: '#9FE8FF', textAlign: 'center', marginTop: 8 },
  statRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap' },
  stat: { backgroundColor: colors.bgDeep, borderRadius: radius.md, paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center' },
  statValue: { fontSize: font.h2, fontWeight: '900', color: colors.gold },
  statLabel: { fontSize: font.tiny, color: colors.textDim },
});
