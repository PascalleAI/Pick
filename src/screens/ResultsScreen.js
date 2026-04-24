import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, Tag } from '../components';

export default function ResultsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { results = [], items = [] } = route.params || {};

  // Map URIs from original items onto results — this is the fix for blank photos
  const enriched = results.map(r => {
    const original = items.find(i => i.id === r.id);
    return { ...r, uri: original?.uri || r.uri || null };
  });

  const lead = enriched[0];
  const rest = enriched.slice(1, 4);
  const count = items.length;
  const headlineText = count === 1 ? 'Should you post this?' : count === 2 ? 'The stronger pick' : 'Your result';
  const subText = count === 1 ? 'A quick read on the photo you brought in.' : "Here's the one that stands out.";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>
      <Text style={styles.headline}>{headlineText}</Text>
      <Text style={styles.sub}>{subText}</Text>

      {lead ? (
        <View style={[styles.leadCard, SHADOW.cardStrong]}>
          {lead.uri
            ? <Image source={{ uri: lead.uri }} style={styles.leadImage} resizeMode="cover" />
            : <View style={styles.leadImagePlaceholder} />}
          <View style={styles.leadBody}>
            <Tag>{lead.label || 'Best pick'}</Tag>
            <Text style={styles.leadTitle}>{lead.title}</Text>
            <Text style={styles.leadReason}>{lead.reason}</Text>
            <View style={styles.leadBtns}>
              <PrimaryButton label="Share this" onPress={() => navigation.navigate('Share', { item: lead })} />
            </View>
          </View>
        </View>
      ) : null}

      {rest.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Other options</Text>
            <Pressable onPress={() => navigation.navigate('Queue')} hitSlop={8}>
              <Text style={styles.tryAgain}>Try different photos</Text>
            </Pressable>
          </View>
          {rest.map(item => (
            <View key={item.id} style={styles.otherCard}>
              {item.uri
                ? <Image source={{ uri: item.uri }} style={styles.otherThumb} resizeMode="cover" />
                : <View style={styles.otherThumbPlaceholder} />}
              <View style={styles.otherRight}>
                <Tag tone={item.label === 'Skip this one' ? 'warning' : 'default'}>{item.label}</Tag>
                <Text style={styles.otherTitle}>{item.title}</Text>
                <Text style={styles.otherReason} numberOfLines={2}>{item.reason}</Text>
                <Pressable onPress={() => navigation.navigate('Share', { item })} style={({ pressed }) => [styles.otherShareBtn, pressed && { opacity: 0.6 }]}>
                  <Text style={styles.otherShareBtnText}>Share this</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </>
      )}

      {count === 1 && (
        <Pressable onPress={() => navigation.navigate('Queue')} style={styles.tryAgainRow}>
          <Text style={styles.tryAgainFull}>Try different photos</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  headline: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.7 },
  sub: { marginTop: 8, fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, marginBottom: SPACING.xl },
  leadCard: { borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, overflow: 'hidden', marginBottom: SPACING.xxl },
  leadImage: { width: '100%', height: 340 },
  leadImagePlaceholder: { width: '100%', height: 340, backgroundColor: COLORS.surfaceRaised },
  leadBody: { padding: SPACING.xl },
  leadTitle: { marginTop: 12, fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  leadReason: { marginTop: 10, fontSize: 14, lineHeight: 22, color: COLORS.textSecondary },
  leadBtns: { marginTop: SPACING.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 2, color: COLORS.textDim, textTransform: 'uppercase' },
  tryAgain: { fontSize: 12, color: COLORS.textDim },
  otherCard: { flexDirection: 'row', backgroundColor: COLORS.surfaceSoft, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, gap: SPACING.md, marginBottom: SPACING.md },
  otherThumb: { width: 80, height: 100, borderRadius: RADIUS.md },
  otherThumbPlaceholder: { width: 80, height: 100, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceRaised },
  otherRight: { flex: 1, gap: 4 },
  otherTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginTop: 6 },
  otherReason: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
  otherShareBtn: { marginTop: 8, alignSelf: 'flex-start', borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.borderStrong, paddingHorizontal: 12, paddingVertical: 6 },
  otherShareBtnText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },
  tryAgainRow: { marginTop: SPACING.xl, alignItems: 'center' },
  tryAgainFull: { fontSize: 14, color: COLORS.textDim },
});
