import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, Line, LinearGradient, Rect, Stop } from 'react-native-svg';
import { COIN_R, TABLE_H, type CoinInstance } from '../../engine';
import { colors } from '../theme';
import { FxLayer, type Fx } from './fx';
import type { DisplayCoin } from './playback';
import { TableCoinView } from './TableCoinView';

interface Props {
  width: number;
  coins: DisplayCoin[];
  fx: Fx[];
  shake: { n: number; power: number };
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

const BOLTS = [
  [0.045, 0.045],
  [0.955, 0.045],
  [0.045, 0.955],
  [0.955, 0.955],
];

/** The moneylender's toy table: a chunky wooden tray. Coordinates: x in [0,1], y in [0,1.2], scaled by width. */
export function Table({ width, coins, fx, shake, adjacency, speed, reduceMotion, bag, onCoinPress, children }: Props) {
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

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  useEffect(() => {
    if (!shake.n || reduceMotion) return;
    const p = shake.power >= 2 ? 9 : 5;
    const step = Math.max(25, 45 / Math.sqrt(speed));
    tx.value = withSequence(
      withTiming(p, { duration: step }),
      withTiming(-p, { duration: step }),
      withTiming(p * 0.6, { duration: step }),
      withTiming(-p * 0.4, { duration: step }),
      withTiming(0, { duration: step }),
    );
    ty.value = withSequence(withTiming(-p * 0.5, { duration: step }), withTiming(p * 0.4, { duration: step }), withTiming(0, { duration: step * 2 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shake.n]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }, { translateY: ty.value }] }));

  const plank = height / 7;
  return (
    <Animated.View style={[{ width, height }, shakeStyle]} accessibilityLabel="Table">
      <Svg width={width} height={height + 8} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="tray" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.woodLight} />
            <Stop offset="1" stopColor={colors.wood} />
          </LinearGradient>
        </Defs>
        {/* hard drop shadow, then the outlined tray */}
        <Rect x={2} y={8} width={width - 4} height={height - 4} rx={26} fill={colors.ink} />
        <Rect x={2} y={2} width={width - 4} height={height - 4} rx={26} fill={colors.woodDark} stroke={colors.ink} strokeWidth={4} />
        <Rect x={14} y={14} width={width - 28} height={height - 28} rx={16} fill="url(#tray)" stroke={colors.ink} strokeWidth={3.5} />
        {Array.from({ length: 6 }).map((_, i) => (
          <Line
            key={i}
            x1={18}
            x2={width - 18}
            y1={14 + plank * (i + 1)}
            y2={14 + plank * (i + 1)}
            stroke={colors.woodDark}
            strokeWidth={2.5}
            opacity={0.55}
          />
        ))}
        <Rect x={22} y={20} width={width * 0.32} height={7} rx={3.5} fill="#FFFFFF" opacity={0.35} />
        {BOLTS.map(([bx, by], i) => (
          <Circle key={i} cx={bx * width} cy={by * height} r={6} fill="#FFD23F" stroke={colors.ink} strokeWidth={2.5} />
        ))}
        {lines.map(({ a, b }) => (
          <Line
            key={`o-${a.uid}-${b.uid}`}
            x1={a.x * width}
            y1={a.y * width}
            x2={b.x * width}
            y2={b.y * width}
            stroke={colors.ink}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray="2 14"
          />
        ))}
        {lines.map(({ a, b }) => (
          <Line
            key={`i-${a.uid}-${b.uid}`}
            x1={a.x * width}
            y1={a.y * width}
            x2={b.x * width}
            y2={b.y * width}
            stroke="#FFFFFF"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="2 14"
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
      <FxLayer items={fx} width={width} speed={speed} reduceMotion={reduceMotion} />
    </Animated.View>
  );
}
