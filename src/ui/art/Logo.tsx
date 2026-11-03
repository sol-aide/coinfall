import React from 'react';
import { View } from 'react-native';
import Svg, { G, Text as SvgText } from 'react-native-svg';
import { colors, display } from '../theme';

// Each letter is its own little sticker: bobbed off the baseline and tilted a
// few degrees, as if cut out and stuck down by hand.
const WORD = 'Coinfall';
const DY = [0, 4, -3, 3, -4, 2, -2, 3];
const ROT = [-6, 4, -3, 5, -4, 3, -5, 6];
// Rough advance widths for a heavy rounded face, in em.
const ADV = [0.68, 0.62, 0.3, 0.62, 0.4, 0.6, 0.3, 0.3];

export function Logo({ width }: { width: number }) {
  const total = ADV.reduce((a, b) => a + b, 0);
  const size = Math.min(72, (width - 24) / total);
  const height = size * 1.35;
  const startX = (width - total * size) / 2;
  const base = size * 1.0;
  let x = startX;
  const letters = WORD.split('').map((ch, i) => {
    const cx = x + (ADV[i] * size) / 2;
    x += ADV[i] * size;
    return { ch, cx, cy: base + DY[i], rot: ROT[i] };
  });
  const layer = (fill: string, stroke: string, sw: number, dx = 0, dy = 0, opacity = 1) =>
    letters.map((l, i) => (
      <SvgText
        key={i}
        x={l.cx + dx}
        y={l.cy + dy}
        fontSize={size}
        fontWeight="900"
        fontFamily={display}
        textAnchor="middle"
        fill={fill}
        stroke={stroke}
        strokeWidth={sw}
        strokeLinejoin="round"
        opacity={opacity}
        transform={`rotate(${l.rot} ${l.cx} ${l.cy - size * 0.35})`}
      >
        {l.ch}
      </SvgText>
    ));
  return (
    // The role sits on a View: on the web an Svg given a role stops being an <svg>.
    <View accessible accessibilityRole="header" accessibilityLabel="Coinfall">
      <Svg width={width} height={height}>
        <G>{layer('#54341A', '#54341A', size * 0.26, 3, 6, 0.3)}</G>
        <G>{layer(colors.sticker, colors.sticker, size * 0.26)}</G>
        <G>{layer(colors.gold, colors.ink, Math.max(2, size * 0.045))}</G>
      </Svg>
    </View>
  );
}
