import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MIN_BAG,
  buyItem,
  canMelt,
  charmDef,
  computeMods,
  duesFor,
  engravingDef,
  leaveShop,
  meltCoin,
  rerollShop,
  shopRerollCost,
  type RunState,
  type ShopItem,
} from '../../engine';
import { Icon, type IconName } from '../art/Icons';
import { CoinRow } from '../components/CoinInfo';
import { Hud } from '../components/Hud';
import { Button, Txt } from '../components/ui';
import { useGame } from '../state/GameContext';
import { colors, font, radius, rarityColors } from '../theme';
import { BagOverlay, CharmsOverlay } from './Overlays';

export function ShopScreen({ onMenu }: { onMenu: () => void }) {
  const { run, act } = useGame();
  const r = run as RunState;
  const insets = useSafeAreaInsets();
  const [engraveIdx, setEngraveIdx] = useState<number | null>(null);
  const [melting, setMelting] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const [charmsOpen, setCharmsOpen] = useState(false);
  const mods = computeMods(r.charms);
  const nextDues = duesFor(r.phase + 1, mods);
  const rerollCost = shopRerollCost(r);

  const buy = (i: number) => {
    const item = r.shop[i];
    if (item.kind === 'engraving') setEngraveIdx(i);
    else act((s) => buyItem(s, i));
  };

  const priceButton = (item: ShopItem, i: number) => (
    <Button
      label={item.sold ? 'Sold' : `${item.price}`}
      icon={item.sold ? undefined : 'gold'}
      variant={item.sold ? 'ghost' : 'gold'}
      disabled={item.sold || r.gold < item.price}
      onPress={() => buy(i)}
      a11yLabel={item.sold ? 'Sold' : `Buy for ${item.price} gold`}
      testID={`buy-${i}`}
      style={styles.priceBtn}
    />
  );

  const section = (title: string, kind: ShopItem['kind'] | 'token') => {
    const entries = r.shop.map((item, i) => ({ item, i })).filter(({ item }) => item.kind === kind);
    if (!entries.length) return null;
    return (
      <View style={{ gap: 6 }}>
        <Txt style={styles.section} accessibilityRole="header">
          {title}
        </Txt>
        {entries.map(({ item, i }) => {
          if (item.kind === 'coin') return <CoinRow key={i} defId={item.defId} run={r} right={priceButton(item, i)} />;
          let icon: IconName = 'charm';
          let name = '';
          let text = '';
          let rarity: keyof typeof rarityColors = 'common';
          if (item.kind === 'charm') {
            const c = charmDef(item.charmId);
            name = c.name;
            text = c.text;
            rarity = c.rarity;
          } else if (item.kind === 'engraving') {
            const e = engravingDef(item.engravingId);
            icon = 'engraving';
            name = `${e.name} engraving`;
            text = `${e.text} Choose a coin to engrave.`;
            rarity = e.rarity;
          } else {
            icon = 'melt';
            name = 'Melt token';
            text = 'Remove any coin from your bag for good.';
          }
          return (
            <View key={i} style={[styles.item, item.sold && { opacity: 0.55 }]} accessible={false}>
              <Icon name={icon} size={40} />
              <View style={{ flex: 1 }} accessible accessibilityLabel={`${name}. ${text}`}>
                <Txt style={styles.itemName}>
                  {name}
                  {rarity !== 'common' && rarity !== 'starter' ? <Txt style={[styles.rarity, { color: rarityColors[rarity] }]}>  {rarity}</Txt> : null}
                </Txt>
                <Txt style={styles.itemText}>{text}</Txt>
              </View>
              {priceButton(item, i)}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 4 }]}>
      <Hud run={r} onBag={() => setBagOpen(true)} onCharms={() => setCharmsOpen(true)} onMenu={onMenu} showRound={false} nextPhase />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <Txt style={styles.title} accessibilityRole="header">
            Bazaar
          </Txt>
          <Txt style={styles.sub}>
            Dues paid. Next phase's dues: <Txt style={{ color: colors.gold, fontWeight: '900' }}>{nextDues}</Txt> gold.
          </Txt>
        </View>
        <View style={styles.tools}>
          <Button
            label="Reroll"
            sub={`${rerollCost} gold`}
            icon="reroll"
            variant="secondary"
            disabled={r.gold < rerollCost}
            onPress={() => act((s) => rerollShop(s))}
            style={{ flex: 1 }}
            testID="shop-reroll"
          />
          <Button
            label="Token"
            sub={`${r.rerollTokens} left`}
            icon="reroll"
            variant="secondary"
            disabled={r.rerollTokens < 1}
            onPress={() => act((s) => rerollShop(s, true))}
            a11yLabel={`Reroll the shop with a token, ${r.rerollTokens} left`}
            style={{ flex: 1 }}
            testID="shop-reroll-token"
          />
          <Button
            label="Melt"
            sub={`${r.meltTokens} left`}
            icon="melt"
            variant="secondary"
            disabled={!canMelt(r)}
            onPress={() => setMelting(true)}
            a11yLabel={`Melt a coin, ${r.meltTokens} tokens left`}
            style={{ flex: 1 }}
            testID="shop-melt"
          />
        </View>
        {section('Coins', 'coin')}
        {section('Charms — last the whole run', 'charm')}
        {section('Engravings — upgrade one coin', 'engraving')}
        {section('Supplies', 'token')}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button big variant="primary" label={`Start phase ${r.phase + 1}`} onPress={() => act(leaveShop)} testID="leave-shop" />
      </View>

      {engraveIdx !== null && (
        <BagOverlay
          run={r}
          title="Engrave a coin"
          prompt={`${engravingDef((r.shop[engraveIdx] as { engravingId: string }).engravingId).text} A coin holds one engraving; a new one replaces the old.`}
          pickLabel="Engrave"
          onClose={() => setEngraveIdx(null)}
          onPick={(uid) => {
            const idx = engraveIdx;
            setEngraveIdx(null);
            act((s) => buyItem(s, idx, uid));
          }}
        />
      )}
      {melting && (
        <BagOverlay
          run={r}
          title="Melt a coin"
          prompt={`Spend a Melt token to remove a coin for good. Fewer coins means your best ones come up more often. (Minimum ${MIN_BAG} coins.)`}
          pickLabel="Melt it"
          onClose={() => setMelting(false)}
          onPick={(uid) => {
            setMelting(false);
            act((s) => meltCoin(s, uid));
          }}
        />
      )}
      {bagOpen && <BagOverlay run={r} onClose={() => setBagOpen(false)} />}
      {charmsOpen && <CharmsOverlay run={r} onClose={() => setCharmsOpen(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: 'transparent' },
  scroll: { padding: 12, gap: 14, paddingBottom: 24 },
  banner: { alignItems: 'center', gap: 2 },
  title: { fontSize: font.h1, fontWeight: '900' },
  sub: { fontSize: font.small, color: colors.textDim, textAlign: 'center' },
  tools: { flexDirection: 'row', gap: 8 },
  section: { fontSize: font.small, color: colors.textMuted, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.panelLight,
    borderRadius: radius.md,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderColor: colors.ink,
    padding: 10,
  },
  itemName: { fontSize: font.body, fontWeight: '800' },
  rarity: { fontSize: font.tiny, fontWeight: '800', textTransform: 'capitalize' },
  itemText: { fontSize: font.small, color: colors.textDim, marginTop: 2 },
  priceBtn: { minWidth: 76, paddingHorizontal: 10 },
  footer: { paddingHorizontal: 12, paddingTop: 10, borderTopWidth: 3, borderTopColor: colors.ink, backgroundColor: colors.bgDeep },
});
