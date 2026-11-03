import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { abilityText, coinDef, type RunState } from '../../engine';
import { CoinArt } from '../art/CoinArt';
import { colors, font, radius } from '../theme';
import { Button, Stitch, Txt, tap } from './ui';

/**
 * The coins drawn for this round, before the toss. Tap one to select it, then
 * Swap puts it back and draws another from the bag: once free each round, then
 * one Reroll token per swap.
 */
export function HandStrip({ run, onSwap }: { run: RunState; onSwap: (uid: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const hand = run.hand ?? [];
  // Forget a selection that is no longer in the hand (after a swap or a melt).
  useEffect(() => {
    if (selected && !hand.includes(selected)) setSelected(null);
  }, [hand, selected]);

  const free = (run.freeSwaps ?? 0) > 0;
  const canSwap = (free || run.rerollTokens > 0) && run.bag.length > hand.length;
  const sel = selected ? run.bag.find((c) => c.uid === selected) : undefined;
  const selDef = sel ? coinDef(sel.defId) : undefined;
  const cost = free ? 'free' : `1 Reroll token (${run.rerollTokens} left)`;

  return (
    <View style={styles.wrap}>
      <Stitch r={radius.lg} inset={4} opacity={0.35} />
      <View style={styles.coins} accessibilityRole="radiogroup" accessibilityLabel="Your hand">
        {hand.map((uid, i) => {
          const inst = run.bag.find((c) => c.uid === uid);
          if (!inst) return null;
          const def = coinDef(inst.defId);
          const on = selected === uid;
          return (
            <Pressable
              key={uid}
              testID={`hand-${i}`}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${def.name}${inst.level > 1 ? `, level ${inst.level}` : ''}. ${abilityText(def, inst.level)}`}
              accessibilityHint="Selects this coin so you can swap it"
              onPress={() => {
                tap();
                setSelected(on ? null : uid);
              }}
              style={[styles.coin, on && styles.coinOn]}
            >
              <CoinArt defId={inst.defId} size={46} level={inst.level} engraved={!!inst.engraving} />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        <Txt style={styles.info} numberOfLines={2}>
          {selDef && sel ? (
            <>
              <Txt style={styles.name}>{selDef.name}: </Txt>
              {abilityText(selDef, sel.level)}
            </>
          ) : canSwap ? (
            `Tap a coin to swap it (${cost}).`
          ) : (
            'Your hand for this round.'
          )}
        </Txt>
        <Button
          label="Swap"
          sub={free ? 'free' : '1 token'}
          variant="secondary"
          disabled={!selected || !canSwap}
          onPress={() => selected && onSwap(selected)}
          a11yLabel={`Swap the selected coin, ${cost}`}
          testID="swap"
          style={styles.swap}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'rgba(20, 13, 22, 0.78)', borderRadius: radius.lg, padding: 8, gap: 6, marginBottom: 8 },
  coins: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  coin: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'transparent' },
  coinOn: { borderColor: colors.gold, backgroundColor: 'rgba(242, 180, 30, 0.18)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  info: { flex: 1, fontSize: font.tiny, color: colors.textDim },
  name: { fontSize: font.tiny, fontWeight: '800', color: colors.text },
  swap: { minWidth: 84 },
});
