import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';
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

const PLANK_TONES = ['#C2814A', '#B5743E', '#C88A52', '#B87A43', '#C07E47', '#B2713B'];

/**
 * The moneylender's table, built like a cut-paper diorama: separate plank
 * strips with a lit top edge and a shaded bottom edge, a frame strip, nail
 * heads and a white die-cut border. Coordinates: x in [0,1], y in [0,1.2],
 * scaled by width.
 */
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

  // Table nudge on hard hits: a quick, decaying side-to-side jolt.
  const jx = useSharedValue(0);
  const jy = useSharedValue(0);
  useEffect(() => {
    if (!shake.n || reduceMotion) return;
    const a = 2.5 * shake.power;
    const t = (ms: number) => ({ duration: ms, easing: Easing.out(Easing.quad) });
    jx.value = withSequence(withTiming(a, t(40)), withTiming(-a * 0.7, t(60)), withTiming(a * 0.35, t(60)), withTiming(0, t(70)));
    jy.value = withSequence(withTiming(a * 0.6, t(40)), withTiming(0, t(120)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shake.n]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: jx.value }, { translateY: jy.value }] }));

  return (
    <Animated.View style={[{ width, height }, shakeStyle]} accessibilityLabel="Table">
      <TableTop width={width} height={height} />
      <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
        {lines.map(({ a, b }) => (
          <G key={`${a.uid}-${b.uid}`}>
            <Line x1={a.x * width} y1={a.y * width} x2={b.x * width} y2={b.y * width} stroke="#FFF4DD" strokeWidth={3} strokeDasharray="6 6" strokeLinecap="round" />
          </G>
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
      <FxLayer items={fx} width={width} coinSize={size} speed={speed} reduceMotion={reduceMotion} />
    </Animated.View>
  );
}

/** Static table art, memoised: it only changes with the table size. */
const TableTop = React.memo(function TableTop({ width, height }: { width: number; height: number }) {
  const planks = useMemo(() => {
    const frame = 16;
    const inner = height - 5 - frame * 2;
    const n = 6;
    const out: { y: number; h: number; tone: string; grain: string[]; nails: number[] }[] = [];
    let y = frame;
    for (let i = 0; i < n; i++) {
      const h = i === n - 1 ? frame + inner - y : (inner / n) * (0.9 + ((i * 37) % 5) * 0.05);
      const grain = [0, 1].map((k) => {
        const gy = y + h * (0.35 + k * 0.3);
        const x0 = width * (0.08 + ((i * 13 + k * 29) % 40) / 100);
        const len = width * 0.28;
        return `M${x0} ${gy} q${len * 0.25} ${-4 + k * 3} ${len * 0.5} 0 t${len * 0.5} 0`;
      });
      out.push({ y, h, tone: PLANK_TONES[i % PLANK_TONES.length], grain, nails: [frame + 10, width - frame - 10] });
      y += h;
    }
    return out;
  }, [width, height]);

  // Leave room inside the SVG for the hard shadow under the bottom edge.
  const h = height - 5;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* hard paper shadow, then the white die-cut edge */}
      <Rect x={3} y={5} width={width - 3} height={h} rx={22} fill="#54341A" opacity={0.25} />
      <Rect x={0} y={0} width={width} height={h} rx={22} fill={colors.sticker} />
      {/* frame strip */}
      <Rect x={5} y={5} width={width - 10} height={h - 10} rx={18} fill={colors.woodDark} />
      <Rect x={5} y={5} width={width - 10} height={h - 13} rx={18} fill="#9C6232" />
      {/* planks: each its own strip of paper */}
      {planks.map((p, i) => (
        <G key={i}>
          <Rect x={16} y={p.y} width={width - 32} height={p.h - 1.5} rx={4} fill={p.tone} />
          <Rect x={16} y={p.y} width={width - 32} height={2} rx={1} fill="#E3A86B" opacity={0.9} />
          <Rect x={16} y={p.y + p.h - 4.5} width={width - 32} height={3} rx={1.5} fill={colors.woodDark} opacity={0.55} />
          {p.grain.map((d, k) => (
            <Path key={k} d={d} stroke={colors.woodDark} strokeWidth={1.4} strokeLinecap="round" fill="none" opacity={0.3} />
          ))}
          {p.nails.map((nx) => (
            <G key={nx}>
              <Circle cx={nx} cy={p.y + p.h / 2} r={2.6} fill={colors.woodDark} />
              <Circle cx={nx - 0.7} cy={p.y + p.h / 2 - 0.7} r={1} fill="#E8C49A" />
            </G>
          ))}
        </G>
      ))}
      <Rect x={5} y={5} width={width - 10} height={h - 10} rx={18} fill="none" stroke={colors.ink} strokeWidth={2} />
      <Rect x={15} y={15} width={width - 30} height={h - 30} rx={6} fill="none" stroke={colors.ink} strokeWidth={1.2} opacity={0.5} />
    </Svg>
  );
});
