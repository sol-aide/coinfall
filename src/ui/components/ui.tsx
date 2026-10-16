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
        { backgroundColor: v.bg },
        variant === 'ghost' && styles.btnFlat,
        pressed && !disabled && styles.btnPressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {variant !== 'ghost' && <View pointerEvents="none" style={styles.shine} />}
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

const variants: Record<Variant, { bg: string; fg: string }> = {
  primary: { bg: '#FF8A1F', fg: colors.ink },
  gold: { bg: colors.gold, fg: colors.ink },
  secondary: { bg: colors.panelLight, fg: colors.text },
  ghost: { bg: 'rgba(255,255,255,0.08)', fg: colors.textDim },
  danger: { bg: '#E0303E', fg: '#FFFFFF' },
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
  // Toy buttons: thick ink outline with a deep bottom edge that squashes when pressed.
  btn: {
    minHeight: TOUCH + 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 3,
    borderBottomWidth: 7,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  btnBig: { minHeight: 66, borderRadius: radius.lg },
  btnFlat: { borderBottomWidth: 3, marginTop: 4 },
  btnPressed: { borderBottomWidth: 3, marginTop: 4 },
  shine: { position: 'absolute', top: 3, left: 10, right: 10, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.32)' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnLabel: { fontSize: font.body, fontWeight: '900' },
  btnLabelBig: { fontSize: 23 },
  btnSub: { fontSize: font.tiny, fontWeight: '700', opacity: 0.9, marginTop: 1 },
  disabled: { opacity: 0.45 },
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
    borderWidth: 2,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 12, fontWeight: '900', color: colors.ink },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderBottomWidth: 7,
    borderColor: colors.ink,
    padding: 14,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgDeep,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillTxt: { fontWeight: '900', fontSize: font.body },
  overlay: { backgroundColor: colors.overlay, justifyContent: 'center', padding: 16, zIndex: 50 },
  overlayCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    borderWidth: 3,
    borderBottomWidth: 8,
    borderColor: colors.ink,
    padding: 16,
    maxHeight: '92%',
  },
  overlayBottom: { marginBottom: 0 },
  overlayHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, minHeight: TOUCH },
  overlayTitle: { fontSize: font.h2, fontWeight: '900', flex: 1 },
});
