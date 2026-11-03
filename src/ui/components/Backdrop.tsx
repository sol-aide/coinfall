import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Polygon, Rect } from 'react-native-svg';
import { colors, raceColors } from '../theme';

/** Cheap deterministic noise so the paper grain never shifts between renders. */
function hash(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Kraft-paper desk: flat colour, a few fibre flecks and a soft vignette band. */
export function Backdrop() {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const flecks = useMemo(() => {
    const out: { x: number; y: number; r: number; light: boolean; long: boolean; a: number }[] = [];
    for (let i = 0; i < 90; i++) {
      out.push({ x: hash(i), y: hash(i + 500), r: 0.6 + hash(i + 900) * 1.4, light: hash(i + 1300) > 0.55, long: hash(i + 1700) > 0.7, a: hash(i + 2100) * 180 });
    }
    return out;
  }, []);
  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {size.w > 0 && (
        <Svg width={size.w} height={size.h}>
          <Rect x={0} y={0} width={size.w} height={size.h} fill={colors.bg} />
          {flecks.map((f, i) =>
            f.long ? (
              <Rect
                key={i}
                x={f.x * size.w}
                y={f.y * size.h}
                width={f.r * 6}
                height={0.9}
                fill={f.light ? '#F6E6C6' : '#C9AD80'}
                opacity={0.8}
                transform={`rotate(${f.a} ${f.x * size.w} ${f.y * size.h})`}
              />
            ) : (
              <Circle key={i} cx={f.x * size.w} cy={f.y * size.h} r={f.r} fill={f.light ? '#F6E6C6' : '#C4A677'} opacity={0.75} />
            ),
          )}
          <Rect x={0} y={size.h - 120} width={size.w} height={120} fill="#C9A97C" opacity={0.12} />
        </Svg>
      )}
    </View>
  );
}

const FLAGS = [raceColors.human.main, colors.gold, raceColors.orc.main, '#FFF8EA', raceColors.elf.main];

/** A string of cut-paper pennants for the bazaar screens (title, results). */
export function Bunting({ width, height = 54 }: { width: number; height?: number }) {
  const n = Math.max(5, Math.round(width / 46));
  const step = width / n;
  const sag = 14;
  const yAt = (x: number) => 8 + sag * Math.sin((Math.PI * x) / width);
  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Path d={`M0 8 Q${width / 2} ${8 + sag * 2} ${width} 8`} stroke={colors.ink} strokeWidth={1.5} fill="none" opacity={0.6} />
      {Array.from({ length: n }).map((_, i) => {
        const x0 = i * step + 4;
        const x1 = (i + 1) * step - 4;
        const xm = (x0 + x1) / 2;
        const y0 = yAt(x0);
        const y1 = yAt(x1);
        const tip = (y0 + y1) / 2 + 30;
        const color = FLAGS[i % FLAGS.length];
        const pts = `${x0},${y0} ${x1},${y1} ${xm},${tip}`;
        return (
          <G key={i}>
            <Polygon points={pts} fill="#54341A" opacity={0.25} transform="translate(0 3)" />
            <Polygon points={pts} fill={colors.sticker} stroke={colors.sticker} strokeWidth={5} strokeLinejoin="round" />
            <Polygon points={pts} fill={color} />
            <Polygon points={`${xm},${(y0 + y1) / 2} ${x1},${y1} ${xm},${tip}`} fill="#000" opacity={0.08} />
          </G>
        );
      })}
    </Svg>
  );
}
