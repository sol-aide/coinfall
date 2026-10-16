import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';
import { COIN_R, TABLE_H, type CoinInstance } from '../../engine';
import { Txt } from '../components/ui';
import { colors } from '../theme';
import type { DisplayCoin, Popup } from './playback';
import { TableCoinView } from './TableCoinView';

interface Props {
  width: number;
  coins: DisplayCoin[];
  popups: Popup[];
  adjacency: number;
  speed: number;
  reduceMotion: boolean;
  bag: CoinInstance[];
  onCoinPress: (uid: string) => void;
  children?: React.ReactNode;
}

export function tableHeightFor(width: number) {
  return width * TABLE_H;
}

/** The wooden moneylender's table. Coordinates: x in [0,1], y in [0,1.2], scaled by width. */
export function Table({ width, coins, popups, adjacency, speed, reduceMotion, bag, onCoinPress, children }: Props) {
  const height = tableHeightFor(width);
  const size = Math.round(COIN_R * 2 * width);
  const live = coins.filter((c) => c.landed && !c.destroyed);
  const lines: { a: DisplayCoin; b: DisplayCoin }[] = [];
  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i];
      const b = live[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) <= adjacency) lines.push({ a, b });
    }
  const engraved = new Set(bag.filter((c) => c.engraving).map((c) => c.uid));

  return (
    <View style={[styles.table, { width, height }]} accessibilityLabel="Table">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={width} height={height} rx={18} fill={colors.wood} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Rect
            key={i}
            x={0}
            y={(i * height) / 6}
            width={width}
            height={height / 6 - 2}
            fill={i % 2 ? colors.woodLight : colors.wood}
            opacity={0.55}
          />
        ))}
        <Rect x={6} y={6} width={width - 12} height={height - 12} rx={14} fill="none" stroke={colors.woodDark} strokeWidth={4} />
        {lines.map(({ a, b }) => (
          <Line
            key={`${a.uid}-${b.uid}`}
            x1={a.x * width}
            y1={a.y * width}
            x2={b.x * width}
            y2={b.y * width}
            stroke="rgba(255, 236, 170, 0.45)"
            strokeWidth={3}
            strokeDasharray="6 6"
          />
        ))}
      </Svg>
      {children}
      {coins.map((c) => (
        <TableCoinView
          key={c.uid}
          coin={c}
          size={size}
          tableW={width}
          tableH={height}
          speed={speed}
          reduceMotion={reduceMotion}
          engraved={engraved.has(c.uid)}
          onPress={onCoinPress}
        />
      ))}
      {popups.map((p) => (
        <PopupText key={p.id} popup={p} width={width} speed={speed} reduceMotion={reduceMotion} />
      ))}
    </View>
  );
}

function PopupText({ popup, width, speed, reduceMotion }: { popup: Popup; width: number; speed: number; reduceMotion: boolean }) {
  const rise = useSharedValue(0);
  const opacity = useSharedValue(1);
  useEffect(() => {
    const d = Math.max(400, 1000 / Math.sqrt(speed));
    if (!reduceMotion) rise.value = withTiming(-46, { duration: d, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: d, easing: Easing.in(Easing.quad) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: rise.value }] }));
  const color = popup.kind === 'gold' ? colors.gold : popup.kind === 'loss' ? colors.danger : '#9FE8FF';
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.popup, { left: popup.x * width - 40, top: popup.y * width - 46 }, style]}
    >
      <Txt style={[styles.popupTxt, { color }]}>{popup.text}</Txt>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  table: { borderRadius: 18, overflow: 'visible' },
  popup: { position: 'absolute', width: 80, alignItems: 'center' },
  popupTxt: {
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },
});
