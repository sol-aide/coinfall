import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  abilityText,
  coinDef,
  computeMods,
  displayValue,
  engravingDef,
  headsChance,
  runMods,
  type CoinInstance,
  type RunState,
} from '../../engine';
import { CoinArt, RaceBadge } from '../art/CoinArt';
import { bagFitNote, partnerNote, synergyTags, type SynergyTag, type TagId } from '../content/tags';
import { TOUCH, colors, font, raceColors, radius, rarityColors } from '../theme';
import { Overlay, Stitch, Txt } from './ui';

/** Tag colours: one hue per family so related coins are easy to spot. */
const TAG_COLOR: Record<TagId, string> = {
  set: '#F7B53A',
  mixed: '#F7B53A',
  counts: '#9CC6F5',
  mult: '#F28C28',
  echo: '#C9A6F2',
  boost: '#9EDDA9',
  flips: '#F5A096',
  tails: '#B7AEDB',
  heads: '#F2D06B',
  wreck: '#E8836F',
  grows: '#9EDDA9',
  gold: '#F2C14E',
  tokens: '#7CC4F2',
  swaps: '#F2B41E',
};

/** Small chips naming the synergies a coin plays into (derived from its rules). */
export function TagChips({ defId, tags: given }: { defId?: string; tags?: SynergyTag[] }) {
  const tags = given ?? (defId ? synergyTags(coinDef(defId)) : []);
  if (!tags.length) return null;
  return (
    <View style={styles.tags} accessible accessibilityLabel={`Synergies: ${tags.map((t) => t.label).join(', ')}`}>
      {tags.map((t) => (
        <View key={t.id} style={[styles.tag, { borderColor: TAG_COLOR[t.id] }]}>
          <Txt style={[styles.tagTxt, { color: TAG_COLOR[t.id] }]}>{t.label}</Txt>
        </View>
      ))}
    </View>
  );
}

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
  const mods = run ? runMods(run) : computeMods([]);
  const value = inst ? displayValue(inst, mods) : def.value;
  const level = inst?.level ?? 1;
  const eng = inst?.engraving ? engravingDef(inst.engraving) : undefined;
  // On offers (rewards, shop), say how well a set or mixed-table coin fits the bag.
  const fit = run && !inst ? bagFitNote(def, run) : undefined;
  const partners = run && !inst ? partnerNote(def, run) : undefined;
  const tagLabels = synergyTags(def).map((t) => t.label);
  const body = (
    <>
      <Stitch r={radius.md} inset={4} opacity={selected ? 0.9 : 0.35} color={selected ? colors.gold : colors.stitch} />
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
        <TagChips defId={defId} />
        {fit && <Txt style={styles.fit}>{fit}</Txt>}
        {partners && <Txt style={styles.fit}>{partners}</Txt>}
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
  const label = `${def.name}, ${rc.label}${level > 1 ? `, level ${level}` : ''}, value ${value}. ${abilityText(def, level)}${tagLabels.length ? ` Synergies: ${tagLabels.join(', ')}.` : ''}${fit ? ` ${fit}.` : ''}${partners ? ` ${partners}.` : ''}${eng ? ` Engraved ${eng.name}.` : ''}`;
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
  const mods = runMods(run);
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
      <View style={styles.detailTags}>
        <TagChips defId={id} />
      </View>
      {bagFitNote(def, run) && <Txt style={styles.detailSub}>{bagFitNote(def, run)}</Txt>}
      {partnerNote(def, run, 4) && <Txt style={styles.detailSub}>{partnerNote(def, run, 4)}</Txt>}
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
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tag: { borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 },
  tagTxt: { fontSize: font.tiny, lineHeight: 17, fontWeight: '600' },
  fit: { fontSize: font.tiny, color: colors.gold, marginTop: 3 },
  detailTags: { alignItems: 'center', marginTop: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.panelLight,
    borderRadius: radius.md,
    padding: 10,
    minHeight: TOUCH + 20,
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(10,6,12,0.45)',
  },
  rowSelected: { backgroundColor: '#4E4766' },
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
