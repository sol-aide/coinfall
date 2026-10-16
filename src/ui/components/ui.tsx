import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { Icon, type IconName } from '../art/Icons';
import { TOUCH, colors, font, radius } from '../theme';

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
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        disabled && styles.disabled,
        style,
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
    </Pressable>
  );
}

const variants: Record<Variant, { bg: string; fg: string; border: string }> = {
  primary: { bg: '#FF9F43', fg: '#2A1300', border: '#FFC48A' },
  gold: { bg: colors.gold, fg: '#3A2500', border: '#FFE49A' },
  secondary: { bg: colors.panelLight, fg: colors.text, border: colors.border },
  ghost: { bg: 'transparent', fg: colors.textDim, border: colors.border },
  danger: { bg: '#C0392B', fg: '#FFFFFF', border: '#E57368' },
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
  txt: { color: colors.text, fontSize: font.body },
  btn: {
    minHeight: TOUCH + 4,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBig: { minHeight: 62, borderRadius: radius.lg },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnLabel: { fontSize: font.body, fontWeight: '800' },
  btnLabelBig: { fontSize: 22 },
  btnSub: { fontSize: font.tiny, fontWeight: '600', opacity: 0.85, marginTop: 1 },
  disabled: { opacity: 0.4 },
  iconBtn: { width: TOUCH, height: TOUCH, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 0,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 12, fontWeight: '800', color: '#2A1300' },
  panel: { backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgDeep,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillTxt: { fontWeight: '800', fontSize: font.body },
  overlay: { backgroundColor: colors.overlay, justifyContent: 'center', padding: 16, zIndex: 50 },
  overlayCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    maxHeight: '92%',
  },
  overlayBottom: { marginBottom: 0 },
  overlayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minHeight: TOUCH },
  overlayTitle: { fontSize: font.h2, fontWeight: '800', flex: 1 },
});
