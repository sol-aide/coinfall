import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { abilityText, coinDef, type RunState } from '../../engine';
import { CoinArt } from '../art/CoinArt';
import { handComboNotes } from '../content/tags';
import { colors, font, radius } from '../theme';
import { Button, Stitch, Txt, tap } from './ui';

/**
 * The coins drawn for this round, before the toss. Tap one to select it, then
 * Swap puts it back and draws another from the bag: once free each round, then
 * one Reroll token per swap.
 */
export function HandStrip({ run, onSwap, onFirst }: { run: RunState; onSwap: (uid: string) => void; onFirst: (uid: string) => void }) {
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
  const combos = handComboNotes(run);
  // Up to 10 coins: past 5 they wrap into two rows of 5, a little smaller.
  const big = hand.length > 5;
  // What a swap can bring in: the rest of the bag, grouped by kind.
  const restCounts = new Map<string, number>();
  for (const c of run.bag) if (!hand.includes(c.uid)) restCounts.set(coinDef(c.defId).name, (restCounts.get(coinDef(c.defId).name) ?? 0) + 1);
  const rest = [...restCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([n, k]) => (k > 1 ? `${n} ×${k}` : n));

  return (
    <View style={styles.wrap}>
      <Stitch r={radius.lg} inset={4} opacity={0.35} />
      <View style={[styles.coins, big && styles.coinsTwoRows]} accessibilityRole="radiogroup" accessibilityLabel={`Your hand, ${hand.length} coins`}>
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
              style={[styles.coin, big && styles.coinSmall, on && styles.coinOn]}
            >
              <CoinArt defId={inst.defId} size={big ? 38 : 46} level={inst.level} engraved={!!inst.engraving} />
            </Pressable>
          );
        })}
      </View>
      {combos.length > 0 && (
        <View style={styles.combos} accessible accessibilityLabel={`Combos in this hand: ${combos.map((c) => `${c.text}${c.ready ? ', ready' : ''}`).join('; ')}`}>
          {combos.map((c) => (
            <Txt key={c.text} style={[styles.combo, c.ready && styles.comboOn]}>
              {c.ready ? '✓ ' : ''}
              {c.text}
            </Txt>
          ))}
        </View>
      )}
      {canSwap && rest.length > 0 && (
        <Txt style={styles.rest} numberOfLines={1} accessibilityLabel={`Left in your bag: ${rest.join(', ')}`}>
          Left in your bag: {rest.join(', ')}
        </Txt>
      )}
      <View style={styles.row}>
        <Txt style={styles.info} numberOfLines={2}>
          {selDef && sel ? (
            <>
              <Txt style={styles.name}>{selDef.name}: </Txt>
              {abilityText(selDef, sel.level)}
            </>
          ) : canSwap ? (
            free ? 'Tap a coin to swap it for free.' : `Tap a coin to swap it for 1 Reroll token (${run.rerollTokens} left).`
          ) : (
            'Your hand for this round. Coins are tossed left to right.'
          )}
        </Txt>
        {selected && hand[0] !== selected && (
          <Button
            label="First"
            sub="toss order"
            variant="secondary"
            onPress={() => onFirst(selected)}
            a11yLabel="Toss the selected coin first"
            a11yHint="Coins are tossed left to right"
            testID="toss-first"
            style={styles.first}
          />
        )}
        <Button
          label="Swap"
          sub={free ? ((run.freeSwaps ?? 0) > 1 ? `${run.freeSwaps} free` : 'free') : '1 token'}
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
  coinSmall: { width: 46, height: 46, borderRadius: 23 },
  coinsTwoRows: { flexWrap: 'wrap', alignSelf: 'center', maxWidth: 5 * 46 + 4 * 6, rowGap: 4 },
  coinOn: { borderColor: colors.gold, backgroundColor: 'rgba(242, 180, 30, 0.18)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  info: { flex: 1, fontSize: font.tiny, color: colors.textDim },
  name: { fontSize: font.tiny, fontWeight: '800', color: colors.text },
  swap: { minWidth: 84 },
  first: { minWidth: 76 },
  rest: { fontSize: font.tiny, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 4 },
  combos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 10, rowGap: 2 },
  combo: { fontSize: font.tiny, color: colors.textMuted, fontWeight: '700' },
  comboOn: { color: colors.success },
});
