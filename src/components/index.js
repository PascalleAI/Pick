import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS, SPACING, SHADOW } from '../constants/theme';

// ─── MediaThumb ───────────────────────────────────────────────────────────────

export function MediaThumb({ item, style, overlay = false }) {
  const [failed, setFailed] = React.useState(false);

  if (!item?.uri || failed) {
    return (
      <View style={[styles.thumbFallback, style]}>
        <Text style={styles.thumbFallbackLabel}>{item?.title || 'Photo'}</Text>
      </View>
    );
  }

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <Image
        source={{ uri: item.uri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        onError={() => setFailed(true)}
      />
      {overlay && <View style={styles.thumbOverlay} />}
    </View>
  );
}

// ─── Tag ──────────────────────────────────────────────────────────────────────

export function Tag({ children, tone = 'default' }) {
  const isWarning = tone === 'warning';
  return (
    <View style={[styles.tag, isWarning && styles.tagWarning]}>
      <Text style={[styles.tagText, isWarning && styles.tagTextWarning]}>
        {children?.toUpperCase()}
      </Text>
    </View>
  );
}

// ─── PrimaryButton ────────────────────────────────────────────────────────────

export function PrimaryButton({ label, onPress, disabled, loading, dark = true, style }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        dark ? styles.primaryBtnDark : styles.primaryBtnLight,
        (disabled || loading) && styles.primaryBtnDisabled,
        pressed && { opacity: 0.82 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={dark ? COLORS.cream : COLORS.black} size="small" />
      ) : (
        <Text style={[styles.primaryBtnText, !dark && styles.primaryBtnTextLight]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

// ─── SecondaryButton ──────────────────────────────────────────────────────────

export function SecondaryButton({ label, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }, style]}
    >
      <Text style={styles.secondaryBtnText}>{label}</Text>
    </Pressable>
  );
}

// ─── GhostButton ─────────────────────────────────────────────────────────────

export function GhostButton({ label, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.6 }, style]}
    >
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

// ─── RowButton ────────────────────────────────────────────────────────────────

export function RowButton({ children, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.rowBtn, pressed && { opacity: 0.75 }]}
    >
      {children}
    </Pressable>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header({ onBack, onSettings }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerSide}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.headerBackArrow}>←</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.brandTop}>PICK</Text>
        <Text style={styles.brandSub}>by Pascalle</Text>
      </View>

      <View style={styles.headerSide}>
        {onSettings ? (
          <Pressable
            onPress={onSettings}
            hitSlop={12}
            style={({ pressed }) => [styles.headerIconBtn, pressed && { opacity: 0.6 }]}
          >
            <Text style={styles.headerSettingsIcon}>⚙</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

// ─── ScreenShell ─────────────────────────────────────────────────────────────

export function ScreenShell({ children, style }) {
  return (
    <View style={[styles.screen, style]}>
      {children}
    </View>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // MediaThumb
  thumbFallback: {
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFallbackLabel: {
    color: COLORS.textDim,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.32)',
  },

  // Tag
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceRaised,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagWarning: {
    backgroundColor: COLORS.warningBg,
  },
  tagText: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.8,
  },
  tagTextWarning: {
    color: COLORS.warning,
  },

  // PrimaryButton
  primaryBtn: {
    height: 48,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  primaryBtnDark: {
    backgroundColor: COLORS.green,
  },
  primaryBtnLight: {
    backgroundColor: COLORS.cream,
  },
  primaryBtnDisabled: {
    opacity: 0.42,
  },
  primaryBtnText: {
    color: COLORS.cream,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryBtnTextLight: {
    color: COLORS.black,
  },

  // SecondaryButton
  secondaryBtn: {
    height: 48,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  secondaryBtnText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },

  // GhostButton
  ghostBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // RowButton
  rowBtn: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    ...SHADOW.card,
  },

  // Header
  header: {
    backgroundColor: 'rgba(251,244,230,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerSide: {
    width: 40,
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  brandTop: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBackArrow: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  headerSettingsIcon: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  // ScreenShell
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
});
