import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, Dimensions } from 'react-native';
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
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_ITEMS,
      quality: 0.85,
      exif: false,
    });
    if (result.canceled) return;
    const newItems = result.assets.map(asset => ({
      id: asset.assetId || `u_${Date.now()}_${Math.random()}`,
      uri: asset.uri,
      type: asset.type === 'video' ? 'video' : 'photo',
      width: asset.width,
      height: asset.height,
    }));
    const existingUris = new Set(selected.map(s => s.uri));
    const fresh = newItems.filter(item => !existingUris.has(item.uri));
    setSelected(prev => [...prev, ...fresh].slice(0, MAX_ITEMS));
  };

  const removeItem = (id) => setSelected(prev => prev.filter(item => item.id !== id));

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

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Choose your photos</Text>
            <Text style={styles.sub}>
              {selected.length === 0
                ? 'Photos or videos — up to 9. Pick finds the strongest.'
                : `${selected.length} selected · tap to remove`}
            </Text>
          </View>
          {selected.length > 0 && (
            <Pressable onPress={() => setSelected([])} hitSlop={8}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>

        <Pressable style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.75 }]} onPress={pickMedia}>
          <Text style={styles.addBtnPlus}>+</Text>
          <Text style={styles.addBtnLabel}>Add photos or videos</Text>
        </Pressable>

        {selected.length > 0 && (
          <View style={styles.grid}>
            {selected.map((item, index) => (
              <Pressable key={item.id} style={styles.thumb} onPress={() => removeItem(item.id)}>
                <Image source={{ uri: item.uri }} style={styles.thumbImage} resizeMode="cover" />
                {item.type === 'video' && (
                  <View style={styles.videoBadge}>
                    <Text style={styles.videoBadgeText}>▶</Text>
                  </View>
                )}
                {index === 0 && (
                  <View style={styles.leadBadge}>
                    <Text style={styles.leadBadgeText}>Lead</Text>
                  </View>
                )}
                <View style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>×</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        <View style={styles.bottomSpace} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <PrimaryButton
          label={selected.length === 0 ? 'Add photos to start' : `Analyse ${selected.length} ${selected.length === 1 ? 'photo' : 'photos'}`}
          onPress={handleAnalyze}
          disabled={selected.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: SPACING.xl },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.7 },
  sub: { marginTop: 6, fontSize: 14, color: COLORS.textSecondary },
  clearText: { fontSize: 12, color: COLORS.textDim },
  addBtn: { height: 80, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.borderStrong, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: SPACING.xl },
  addBtnPlus: { fontSize: 24, color: COLORS.textSecondary, lineHeight: 28 },
  addBtnLabel: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  thumb: { width: THUMB_SIZE, height: THUMB_SIZE * 1.3, borderRadius: RADIUS.md, overflow: 'hidden', position: 'relative' },
  thumbImage: { width: '100%', height: '100%' },
  videoBadge: { position: 'absolute', top: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.56)', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  videoBadgeText: { color: COLORS.cream, fontSize: 10 },
  leadBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: 'rgba(0,0,0,0.56)', borderRadius: RADIUS.full, paddingHorizontal: 8, paddingVertical: 3 },
  leadBadgeText: { color: COLORS.cream, fontSize: 10, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  removeBtn: { position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.54)', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { color: '#fff', fontSize: 16, lineHeight: 20 },
  bottomSpace: { height: 120 },
  footer: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: 'rgba(251,244,230,0.96)' },
});
