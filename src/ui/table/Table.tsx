import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Pattern, Rect, Stop } from 'react-native-svg';
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

/**
 * The moneylender's table: a lacquered wooden tray holding a teal cloth with a
 * printed coin pattern. Coordinates: x in [0,1], y in [0,1.2], scaled by width.
 */
export function Table({ width, coins, fx, shake, adjacency, speed, reduceMotion, bag, onCoinPress, children }: Props) {
  const height = tableHeightFor(width);
  const size = Math.round(COIN_R * 2 * width);
  const live = coins.filter((c) => c.landed && !c.destroyed);
  const links: { a: DisplayCoin; b: DisplayCoin }[] = [];
  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++) {
      const a = live[i];
      const b = live[j];
      if (Math.hypot(a.x - b.x, a.y - b.y) <= adjacency) links.push({ a, b });
    }
  const engraved = new Set(bag.filter((c) => c.engraving).map((c) => c.uid));

  // A short shake, only for destruction.
  const tx = useSharedValue(0);
  useEffect(() => {
    if (!shake.n || reduceMotion) return;
    const p = shake.power >= 2 ? 6 : 3;
    const step = Math.max(20, 40 / Math.sqrt(speed));
    tx.value = withSequence(
      withTiming(p, { duration: step }),
      withTiming(-p, { duration: step }),
      withTiming(p * 0.5, { duration: step }),
      withTiming(0, { duration: step }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shake.n]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const rim = 12;
  return (
    <Animated.View style={[{ width, height }, shakeStyle]} accessibilityLabel="Table">
      <Svg width={width} height={height + 10} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="lacquer" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.woodLight} />
            <Stop offset="0.5" stopColor={colors.wood} />
            <Stop offset="1" stopColor={colors.woodDark} />
          </LinearGradient>
          <LinearGradient id="clothShade" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#000000" stopOpacity={0.22} />
            <Stop offset="0.12" stopColor="#000000" stopOpacity={0} />
            <Stop offset="0.85" stopColor="#000000" stopOpacity={0} />
            <Stop offset="1" stopColor="#000000" stopOpacity={0.25} />
          </LinearGradient>
          <Pattern id="clothPrint" width={46} height={46} patternUnits="userSpaceOnUse">
            <Circle cx={11.5} cy={11.5} r={5.5} fill="none" stroke="#7FC1BA" strokeWidth={1.6} opacity={0.5} />
            <Circle cx={11.5} cy={11.5} r={1.6} fill="#7FC1BA" opacity={0.5} />
            <Path d="M34.5 28 L38 34.5 L34.5 41 L31 34.5 Z" fill="#E9C46A" opacity={0.35} />
          </Pattern>
        </Defs>
        {/* soft contact shadow, then the wooden tray */}
        <Rect x={4} y={10} width={width - 8} height={height - 4} rx={22} fill="rgba(10,6,12,0.45)" />
        <Rect x={1.5} y={1.5} width={width - 3} height={height - 3} rx={22} fill="url(#lacquer)" stroke={colors.ink} strokeWidth={3} />
        {/* glossy lacquer highlights */}
        <Path d={`M22 6 H${width * 0.55}`} stroke="#FFD9A8" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />
        <Path d={`M${width * 0.62} 6 H${width * 0.7}`} stroke="#FFD9A8" strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
        {/* cloth runner */}
        <Rect x={rim} y={rim} width={width - rim * 2} height={height - rim * 2} rx={14} fill={colors.cloth} stroke={colors.ink} strokeWidth={2.5} />
        <Rect x={rim} y={rim} width={width - rim * 2} height={height - rim * 2} rx={14} fill="url(#clothPrint)" />
        <Rect x={rim} y={rim} width={width - rim * 2} height={height - rim * 2} rx={14} fill="url(#clothShade)" />
        {/* stitched hem */}
        <Rect
          x={rim + 7}
          y={rim + 7}
          width={width - rim * 2 - 14}
          height={height - rim * 2 - 14}
          rx={9}
          fill="none"
          stroke="#E9DFC8"
          strokeOpacity={0.55}
          strokeWidth={1.8}
          strokeDasharray="7 6"
        />
        {/* glowing links between neighbouring coins */}
        <G>
          {links.map(({ a, b }) => (
            <Line
              key={`g-${a.uid}-${b.uid}`}
              x1={a.x * width}
              y1={a.y * width}
              x2={b.x * width}
              y2={b.y * width}
              stroke="#F7A04A"
              strokeOpacity={0.45}
              strokeWidth={10}
              strokeLinecap="round"
            />
          ))}
          {links.map(({ a, b }) => (
            <Line
              key={`c-${a.uid}-${b.uid}`}
              x1={a.x * width}
              y1={a.y * width}
              x2={b.x * width}
              y2={b.y * width}
              stroke="#FFF4DC"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          ))}
        </G>
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
