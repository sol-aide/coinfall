import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Defs, Ellipse, G, Line, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { COIN_R, type CoinInstance } from '../../engine';
import { colors } from '../theme';
import { FxLayer, type Fx } from './fx';
import type { DisplayCoin } from './playback';
import { makeProjection, type Projection } from './projection';
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

/** Pixel height of the table drawing for a given width. */
export function tableHeightFor(width: number) {
  return makeProjection(width).height;
}

function trapezoid(top: number, bottom: number, farHalf: number, nearHalf: number, cx: number, r = 14): string {
  const tl = [cx - farHalf, top];
  const tr = [cx + farHalf, top];
  const br = [cx + nearHalf, bottom];
  const bl = [cx - nearHalf, bottom];
  // Rounded corners using quadratic curves.
  const lerp = (a: number[], b: number[], d: number) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return [a[0] + ((b[0] - a[0]) * d) / len, a[1] + ((b[1] - a[1]) * d) / len];
  };
  const pts = [tl, tr, br, bl];
  let d = '';
  for (let i = 0; i < 4; i++) {
    const prev = pts[(i + 3) % 4];
    const cur = pts[i];
    const next = pts[(i + 1) % 4];
    const a = lerp(cur, prev, r);
    const b = lerp(cur, next, r);
    d += `${i === 0 ? 'M' : 'L'}${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${cur[0].toFixed(1)} ${cur[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)} `;
  }
  return d + 'Z';
}

/**
 * The moneylender's table, seen from above and in front: a lacquered wooden
 * tray with a visible front edge and a lamp-lit cloth. Coins, links and effects
 * are placed through the same projection so everything sits on one plane.
 */
export function Table({ width, coins, fx, shake, adjacency, speed, reduceMotion, bag, onCoinPress, children }: Props) {
  const proj: Projection = useMemo(() => makeProjection(width), [width]);
  const { plane, height } = proj;
  const cx = width / 2;
  const nearSize = Math.round(COIN_R * 2 * width * 1.14);
  const live = coins.filter((c) => c.landed && !c.destroyed);
  const links: { a: DisplayCoin; b: DisplayCoin }[] = [];
  for (let i = 0; i < live.length; i++)
    for (let j = i + 1; j < live.length; j++) {
      if (Math.hypot(live[i].x - live[j].x, live[i].y - live[j].y) <= adjacency) links.push({ a: live[i], b: live[j] });
    }
  const engraved = new Set(bag.filter((c) => c.engraving).map((c) => c.uid));
  // Draw far coins first so nearer coins overlap them.
  const ordered = coins.slice().sort((a, b) => (a.landed ? a.y : 9) - (b.landed ? b.y : 9));

  const tx = useSharedValue(0);
  useEffect(() => {
    if (!shake.n || reduceMotion) return;
    const p = shake.power >= 2 ? 5 : 3;
    const step = Math.max(20, 40 / Math.sqrt(speed));
    tx.value = withSequence(withTiming(p, { duration: step }), withTiming(-p, { duration: step }), withTiming(p * 0.5, { duration: step }), withTiming(0, { duration: step }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shake.n]);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));

  const rim = width * 0.045;
  const front = width * 0.1;
  const outerTop = plane.top - rim;
  const outerBottom = plane.bottom + rim;
  const outerFar = plane.farHalf + rim * 0.9;
  const outerNear = plane.nearHalf + rim;
  const p = (x: number, y: number) => proj.project(x, y);

  return (
    <Animated.View style={[{ width, height }, shakeStyle]} accessibilityLabel="Table">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="tblWoodTop" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.woodDark} />
            <Stop offset="0.25" stopColor={colors.wood} />
            <Stop offset="1" stopColor={colors.woodLight} />
          </LinearGradient>
          <LinearGradient id="tblWoodFront" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#7A3E1A" />
            <Stop offset="1" stopColor="#3E1E0C" />
          </LinearGradient>
          <RadialGradient id="tblLamp" cx="50%" cy="38%" r="70%">
            <Stop offset="0" stopColor="#2E8C96" />
            <Stop offset="0.6" stopColor={colors.cloth} />
            <Stop offset="1" stopColor="#103E45" />
          </RadialGradient>
        </Defs>
        {/* floor shadow */}
        <Ellipse cx={cx} cy={outerBottom + front * 0.9} rx={outerNear * 1.02} ry={front * 0.55} fill="rgba(5,2,6,0.55)" />
        {/* front face of the table */}
        <Path
          d={`M${cx - outerNear} ${outerBottom - 12} L${cx + outerNear} ${outerBottom - 12} L${cx + outerNear * 0.985} ${outerBottom + front - 8} Q${cx + outerNear * 0.985} ${outerBottom + front} ${cx + outerNear * 0.95} ${outerBottom + front} L${cx - outerNear * 0.95} ${outerBottom + front} Q${cx - outerNear * 0.985} ${outerBottom + front} ${cx - outerNear * 0.985} ${outerBottom + front - 8} Z`}
          fill="url(#tblWoodFront)"
          stroke={colors.ink}
          strokeWidth={2}
        />
        <Line x1={cx - outerNear * 0.9} y1={outerBottom + front * 0.45} x2={cx + outerNear * 0.9} y2={outerBottom + front * 0.45} stroke="#9A5226" strokeOpacity={0.5} strokeWidth={2} />
        {/* lacquered top */}
        <Path d={trapezoid(outerTop, outerBottom, outerFar, outerNear, cx, 18)} fill="url(#tblWoodTop)" stroke={colors.ink} strokeWidth={2.5} />
        <Path d={`M${cx - outerFar + 20} ${outerTop + 4} L${cx + outerFar - 60} ${outerTop + 4}`} stroke="#FFD9A8" strokeOpacity={0.45} strokeWidth={2.5} strokeLinecap="round" />
        <Path d={`M${cx - outerNear + 16} ${outerBottom - 5} L${cx + outerNear - 16} ${outerBottom - 5}`} stroke="#FFD9A8" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
        {/* lamp-lit cloth with a stitched hem */}
        <Path d={trapezoid(plane.top, plane.bottom, plane.farHalf, plane.nearHalf, cx, 12)} fill="url(#tblLamp)" stroke="rgba(10,30,34,0.9)" strokeWidth={2} />
        <Path
          d={trapezoid(plane.top + 9, plane.bottom - 9, plane.farHalf - 9 * 0.85, plane.nearHalf - 9, cx, 8)}
          fill="none"
          stroke="#E9DFC8"
          strokeOpacity={0.45}
          strokeWidth={1.6}
          strokeDasharray="7 6"
        />
        {/* links between neighbouring coins, on the cloth */}
        <G>
          {links.map(({ a, b }) => {
            const A = p(a.x, a.y);
            const B = p(b.x, b.y);
            return <Line key={`g-${a.uid}-${b.uid}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#F7A04A" strokeOpacity={0.4} strokeWidth={9} strokeLinecap="round" />;
          })}
          {links.map(({ a, b }) => {
            const A = p(a.x, a.y);
            const B = p(b.x, b.y);
            return <Line key={`c-${a.uid}-${b.uid}`} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="#FFF4DC" strokeWidth={2.2} strokeLinecap="round" />;
          })}
        </G>
      </Svg>
      {children}
      {ordered.map((c) => (
        <TableCoinView key={c.uid} coin={c} size={nearSize} proj={proj} speed={speed} reduceMotion={reduceMotion} engraved={engraved.has(c.uid)} onPress={onCoinPress} />
      ))}
      <FxLayer items={fx} proj={proj} speed={speed} reduceMotion={reduceMotion} />
    </Animated.View>
  );
}
