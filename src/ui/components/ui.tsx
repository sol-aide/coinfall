import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { Icon, type IconName } from '../art/Icons';
import { TOUCH, colors, display, font, paperShadow, radius } from '../theme';

export function Txt({ style, ...rest }: TextProps) {
  return <Text maxFontSizeMultiplier={1.35} {...rest} style={[styles.txt, style]} />;
}

export function tap(enabled = true) {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}

export function thud(enabled = true) {
  if (!enabled || Platform.OS === 'web') return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
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

export function Button({ label, onPress, variant = 'primary', disabled, icon, sub, style, big, a11yHint, a11yLabel, testID }: ButtonProps) {
  const v = variants[variant];
  const flat = variant === 'ghost';
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
        styles.btnRim,
        big && styles.btnRimBig,
        flat ? styles.btnFlat : paperShadow(pressed ? 1 : 4),
        pressed && !flat && { transform: [{ translateY: 3 }] },
        pressed && flat && { opacity: 0.7 },
        disabled && styles.disabled,
        style,
      ]}
    >
      <View
        style={[
          styles.btn,
          big && styles.btnBig,
          { backgroundColor: v.bg, borderBottomColor: v.lip },
          flat && styles.btnGhost,
        ]}
      >
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
      </View>
    </Pressable>
  );
}

// Each button is a cut-paper sticker: white die-cut rim, flat fill, and a darker
// lip along the bottom edge for a single step of cel shading.
const variants: Record<Variant, { bg: string; fg: string; lip: string }> = {
  primary: { bg: colors.accentFill, fg: colors.ink, lip: '#C2611D' },
  gold: { bg: colors.gold, fg: colors.ink, lip: colors.goldDeep },
  secondary: { bg: colors.panel, fg: colors.ink, lip: '#DFC69C' },
  ghost: { bg: 'transparent', fg: colors.textDim, lip: 'transparent' },
  danger: { bg: colors.dangerFill, fg: '#FFFFFF', lip: '#9A2A20' },
};

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
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
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

export function Panel({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function Pill({ icon, value, label, color }: { icon: IconName; value: string | number; label: string; color?: string }) {
  return (
    <View style={styles.pill} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={20} />
      <Txt style={[styles.pillTxt, color ? { color } : null]}>{value}</Txt>
    </View>
  );
}

/** A full-screen dimmed overlay with a bottom or centred card. */
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
      {onClose && (
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      )}
      <View style={[styles.overlayCard, position === 'bottom' && styles.overlayBottom]}>
        {(title || onClose) && (
          <View style={styles.overlayHead}>
            <Txt style={styles.overlayTitle} accessibilityRole="header">
              {title}
            </Txt>
            {onClose && <IconButton icon="close" label="Close" onPress={onClose} size={18} />}
          </View>
        )}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  txt: { color: colors.text, fontSize: font.body, fontFamily: display },
  btnRim: {
    minHeight: TOUCH + 4,
    padding: 3,
    borderRadius: radius.md + 3,
    backgroundColor: colors.sticker,
  },
  btnRimBig: { minHeight: 64, borderRadius: radius.lg + 3 },
  btnFlat: { backgroundColor: 'transparent', padding: 0 },
  btn: {
    flexGrow: 1,
    minHeight: TOUCH - 2,
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 5,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 37, 22, 0.55)',
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBig: { minHeight: 58, borderRadius: radius.lg },
  btnGhost: { borderWidth: 2, borderBottomWidth: 2, borderStyle: 'dashed', borderColor: colors.border, minHeight: TOUCH + 4 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnLabel: { fontSize: font.body, fontWeight: '900' },
  btnLabelBig: { fontSize: 22 },
  btnSub: { fontSize: font.tiny, fontWeight: '700', opacity: 0.9, marginTop: 1 },
  disabled: { opacity: 0.45 },
  iconBtn: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -1,
    right: -3,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    backgroundColor: colors.accentFill,
    borderWidth: 2,
    borderColor: colors.sticker,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 12, fontWeight: '900', color: colors.ink },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    ...paperShadow(3),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.panel,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    ...paperShadow(2),
  },
  pillTxt: { fontWeight: '900', fontSize: font.body },
  overlay: { backgroundColor: colors.overlay, justifyContent: 'center', padding: 16, zIndex: 50 },
  overlayCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg + 2,
    borderWidth: 4,
    borderColor: colors.sticker,
    padding: 14,
    maxHeight: '92%',
    ...paperShadow(6),
  },
  overlayBottom: { marginBottom: 0 },
  overlayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minHeight: TOUCH },
  overlayTitle: { fontSize: font.h2, fontWeight: '900', flex: 1 },
});
