import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, Image, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { PrimaryButton } from '../components';
import { getFreePicksUsed } from '../utils/storage';
import { FREE_PICKS_LIMIT } from '../constants/theme';

const { width } = Dimensions.get('window');
const THUMB_SIZE = (width - SPACING.xl * 2 - SPACING.md * 2) / 3;
const MAX_ITEMS = 9;

export default function QueueScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState([]);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // videos removed — manipulator can't handle them
      allowsMultipleSelection: true,
      selectionLimit: MAX_ITEMS,
      quality: 0.85,
      exif: false,
    });

    if (result.canceled) return;

    const newItems = result.assets.map((asset) => ({
      id: asset.assetId || `u_${Date.now()}_${Math.random()}`,
      uri: asset.uri,
      type: 'photo',
      width: asset.width,
      height: asset.height,
    }));

    const existingUris = new Set(selected.map((s) => s.uri));
    const fresh = newItems.filter((item) => !existingUris.has(item.uri));
    setSelected((prev) => [...prev, ...fresh].slice(0, MAX_ITEMS));
  };

  const removeItem = (id) => setSelected((prev) => prev.filter((item) => item.id !== id));

  const handleAnalyze = async () => {
    if (!selected.length) return;
    const used = await getFreePicksUsed();
    const isSubscribed = false; // TODO: RevenueCat
    if (!isSubscribed && used >= FREE_PICKS_LIMIT) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('Analyzing', { items: selected });
  };

  const count = selected.length;
  const atMax = count >= MAX_ITEMS;

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Choose your photos</Text>
            <Text style={styles.sub}>
              {count === 0
                ? 'Up to 9 photos. Pick finds the strongest.'
                : count === 1
                ? '1 selected — add more to compare, or analyse solo.'
                : `${count} selected · tap a photo to remove`}
            </Text>
          </View>
          {count > 0 && (
            <Pressable onPress={() => setSelected([])} hitSlop={8}>
              <Text style={styles.clearText}>Clear all</Text>
            </Pressable>
          )}
        </View>

        {/* Add button */}
        {!atMax && (
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]}
            onPress={pickMedia}
          >
            <Text style={styles.addBtnPlus}>+</Text>
            <Text style={styles.addBtnLabel}>
              {count === 0 ? 'Add photos' : 'Add more photos'}
            </Text>
          </Pressable>
        )}

        {atMax && (
          <View style={styles.maxBanner}>
            <Text style={styles.maxText}>Max 9 photos reached</Text>
          </View>
        )}

        {/* Grid */}
        {count > 0 && (
          <View style={styles.grid}>
            {selected.map((item, index) => (
              <Pressable
                key={item.id}
                style={styles.thumb}
                onPress={() => removeItem(item.id)}
              >
                <Image
                  source={{ uri: item.uri }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
                {index === 0 && (
                  <View style={styles.leadBadge}>
                    <Text style={styles.leadBadgeText}>LEAD</Text>
                  </View>
                )}
                <View style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>×</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty state hint */}
        {count === 0 && (
          <View style={styles.emptyHint}>
            <Text style={styles.emptyHintTitle}>How it works</Text>
            <View style={styles.hintRow}>
              <Text style={styles.hintNum}>1</Text>
              <Text style={styles.hintText}>Add the photos you're choosing between</Text>
            </View>
            <View style={styles.hintRow}>
              <Text style={styles.hintNum}>2</Text>
              <Text style={styles.hintText}>Pick analyses them and ranks the strongest</Text>
            </View>
            <View style={styles.hintRow}>
              <Text style={styles.hintNum}>3</Text>
              <Text style={styles.hintText}>Share straight to Instagram or save it</Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          label={
            count === 0
              ? 'Add photos to start'
              : count === 1
              ? 'Analyse this photo'
              : `Analyse ${count} photos`
          }
          onPress={handleAnalyze}
          disabled={count === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: SPACING.xl,
  },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.7 },
  sub: { marginTop: 6, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  clearText: { fontSize: 12, color: COLORS.textDim, paddingBottom: 2 },
  addBtn: {
    height: 80,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xl,
  },
  addBtnPlus: { fontSize: 24, color: COLORS.textSecondary, lineHeight: 28 },
  addBtnLabel: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  maxBanner: {
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  maxText: { fontSize: 13, color: COLORS.textDim, letterSpacing: 0.3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE * 1.3,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: { width: '100%', height: '100%' },
  leadBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  leadBadgeText: {
    color: COLORS.cream,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  removeBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.56)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 16, lineHeight: 20 },
  emptyHint: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.xl,
  },
  emptyHintTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: SPACING.md,
  },
  hintNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    color: COLORS.cream,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 24,
  },
  hintText: { flex: 1, fontSize: 14, color: COLORS.textSecondary, lineHeight: 20, paddingTop: 2 },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: 'rgba(251,244,230,0.96)',
  },
});
