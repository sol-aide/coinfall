import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { Icon, type IconName } from '../art/Icons';
import { TOUCH, colors, font, fonts, radius } from '../theme';

/** App text in the bundled rounded face; picks the font file that matches fontWeight. */
export function Txt({ style, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const w = String(flat.fontWeight ?? '500');
  const family = w === 'bold' || Number(w) >= 700 ? fonts.bold : Number(w) >= 600 ? fonts.semibold : fonts.regular;
  return <Text maxFontSizeMultiplier={1.35} {...rest} style={[styles.txt, style, { fontFamily: family, fontWeight: 'normal' }]} />;
}

export function tap(enabled = true) {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function thud(enabled = true) {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** A dashed "sewn-on" line inset from a shape's edge. Place inside a View with the same radius. */
export function Stitch({ color = colors.stitch, inset = 5, r = radius.md, opacity = 0.75 }: { color?: string; inset?: number; r?: number; opacity?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: inset,
        right: inset,
        top: inset,
        bottom: inset,
        borderRadius: Math.max(2, r - inset),
        borderWidth: 1.8,
        borderStyle: 'dashed',
        borderColor: color,
        opacity,
      }}
    />
  );
}

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  icon?: IconName;
  sub?: string;
  style?: StyleProp<ViewStyle>;
  big?: boolean;
  a11yHint?: string;
  a11yLabel?: string;
  testID?: string;
}

/** Stitched card-stock buttons sitting on a dark backing tab that compresses when pressed. */
const variants: Record<Variant, { bg: string; fg: string; stitch: string }> = {
  primary: { bg: colors.paper, fg: colors.ink, stitch: colors.paperStitch },
  gold: { bg: colors.gold, fg: colors.ink, stitch: '#8A5208' },
  secondary: { bg: colors.panelLight, fg: colors.text, stitch: colors.stitch },
  ghost: { bg: 'rgba(255,255,255,0.06)', fg: colors.textDim, stitch: colors.stitch },
  danger: { bg: colors.danger, fg: '#FFFFFF', stitch: '#FFD7DB' },
};

export function Button({ label, onPress, variant = 'primary', disabled, icon, sub, style, big, a11yHint, a11yLabel, testID }: ButtonProps) {
  const v = variants[variant];
  const r = big ? radius.lg : radius.md;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel ?? (sub ? `${label}, ${sub}` : label)}
      accessibilityHint={a11yHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.btn,
        big && styles.btnBig,
        { backgroundColor: v.bg, borderRadius: r },
        variant === 'ghost' && styles.btnGhost,
        pressed && !disabled && styles.btnPressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Stitch color={v.stitch} r={r} inset={big ? 6 : 5} opacity={variant === 'ghost' ? 0.5 : 0.9} />
      <View style={styles.btnRow}>
        {icon && <Icon name={icon} size={big ? 26 : 20} color={v.fg} />}
        <Txt style={[styles.btnLabel, big && styles.btnLabelBig, { color: v.fg }]} numberOfLines={1}>
          {label}
        </Txt>
      </View>
      {sub ? (
        <Txt style={[styles.btnSub, { color: v.fg }]} numberOfLines={1}>
          {sub}
        </Txt>
      ) : null}
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, badge, size = 26 }: { icon: IconName; label: string; onPress: () => void; badge?: string | number; size?: number }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge !== undefined ? `${label}, ${badge}` : label}
      onPress={() => {
        tap();
        onPress();
      }}
      hitSlop={6}
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.92 }] }]}
    >
      <Icon name={icon} size={size} />
      {badge !== undefined && (
        <View style={styles.badge}>
          <Txt style={styles.badgeTxt}>{badge}</Txt>
        </View>
      )}
    </Pressable>
  );
}

/** Dark rounded panel with a pale stitch line (lists, plaques, sheets). */
export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.panel, style]}>
      <Stitch r={radius.lg} inset={6} opacity={0.45} />
      {children}
    </View>
  );
}

export function Pill({ icon, value, label, color }: { icon: IconName; value: string | number; label: string; color?: string }) {
  return (
    <View style={styles.pill} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={20} />
      <Txt style={[styles.pillTxt, color ? { color } : null]}>{value}</Txt>
    </View>
  );
}

/** A folded ribbon banner with a cream band, used as a title plate. */
export function Ribbon({ title, width = 220 }: { title: string; width?: number }) {
  const h = 44;
  const tail = 18;
  const total = width + tail * 2;
  return (
    <View style={{ width: total, height: h + 8, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityRole="header" accessibilityLabel={title}>
      <Svg width={total} height={h + 8} style={StyleSheet.absoluteFill}>
        <Path d={`M0 14 H${tail + 10} V${h + 6} H0 L9 ${(h + 20) / 2} Z`} fill="#5E9E97" stroke={colors.ink} strokeWidth={2} strokeLinejoin="round" />
        <Path
          d={`M${total} 14 H${width + tail - 10} V${h + 6} H${total} L${total - 9} ${(h + 20) / 2} Z`}
          fill="#5E9E97"
          stroke={colors.ink}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <Path d={`M${tail} 4 H${width + tail} V${h} H${tail} Z`} fill={colors.ribbon} stroke={colors.ink} strokeWidth={2.2} strokeLinejoin="round" />
        <Path d={`M${tail + 8} 11 H${width + tail - 8} V${h - 7} H${tail + 8} Z`} fill={colors.paper} />
        <Path
          d={`M${tail + 4} 8 H${width + tail - 4} V${h - 4} H${tail + 4} Z`}
          fill="none"
          stroke="#3F7F79"
          strokeWidth={1.4}
          strokeDasharray="5 4"
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.ribbonTxtWrap]}>
        <Txt style={styles.ribbonTxt} numberOfLines={1}>
          {title}
        </Txt>
      </View>
    </View>
  );
}

/** Scales a child in from ~30% with a small overshoot (the "prompt pop"). */
export function PopIn({ children, style, still }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; still?: boolean }) {
  const s = useSharedValue(still ? 1 : 0.3);
  useEffect(() => {
    if (still) return;
    s.value = withSequence(withTiming(1.05, { duration: 150, easing: Easing.out(Easing.quad) }), withTiming(1, { duration: 90 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

/** A full-screen dimmed overlay with a stitched sheet, centred or at the bottom. */
export function Overlay({
  children,
  onClose,
  title,
  position = 'center',
}: {
  children: React.ReactNode;
  onClose?: () => void;
  title?: string;
  position?: 'center' | 'bottom';
}) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay, position === 'bottom' && { justifyContent: 'flex-end' }]} accessibilityViewIsModal>
      {onClose && <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />}
      <PopIn style={[styles.overlayCard, position === 'bottom' && styles.overlayBottom]}>
        <Stitch r={radius.lg} inset={7} opacity={0.45} />
        {(title || onClose) && (
          <View style={styles.overlayHead}>
            <Txt style={styles.overlayTitle} accessibilityRole="header">
              {title}
            </Txt>
            {onClose && (
              <Pressable onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" hitSlop={8} style={styles.closeBtn}>
                <Icon name="close" size={16} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        )}
        {children}
      </PopIn>
    </View>
  );
}

const styles = StyleSheet.create({
  txt: { color: colors.text, fontSize: font.body },
  btn: {
    minHeight: TOUCH + 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(15,8,15,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBig: { minHeight: 64 },
  btnGhost: { borderBottomWidth: 0, marginTop: 4 },
  btnPressed: { borderBottomWidth: 1, marginTop: 3 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnLabel: { fontSize: font.body + 1, fontWeight: '700' },
  btnLabelBig: { fontSize: 23 },
  btnSub: { fontSize: font.tiny, fontWeight: '600', opacity: 0.85 },
  disabled: { opacity: 0.45 },
  iconBtn: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 0,
    right: -2,
    minWidth: 21,
    height: 21,
    borderRadius: 11,
    paddingHorizontal: 4,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 12, fontWeight: '700', color: colors.ink },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 16,
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(10,6,12,0.45)',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.panel,
    borderRadius: 999,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(158,168,200,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillTxt: { fontWeight: '700', fontSize: font.body },
  ribbonTxtWrap: { alignItems: 'center', justifyContent: 'center', paddingBottom: 6 },
  ribbonTxt: { fontSize: font.h2, fontWeight: '700', color: colors.ink },
  overlay: { backgroundColor: colors.overlay, justifyContent: 'center', padding: 14, zIndex: 50 },
  overlayCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 18,
    maxHeight: '92%',
    borderBottomWidth: 5,
    borderBottomColor: 'rgba(10,6,12,0.5)',
  },
  overlayBottom: { marginBottom: 0 },
  overlayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minHeight: TOUCH },
  overlayTitle: { fontSize: font.h2, fontWeight: '700', flex: 1, color: colors.gold },
  closeBtn: {
    width: TOUCH - 4,
    height: TOUCH - 4,
    borderRadius: (TOUCH - 4) / 2,
    backgroundColor: colors.danger,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
