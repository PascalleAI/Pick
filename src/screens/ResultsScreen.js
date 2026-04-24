import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, Tag } from '../components';

// Individual result card with staggered entrance animation
function ResultCard({ item, index, isLead, onShare }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (isLead) {
    return (
      <Animated.View
        style={[
          styles.leadCard,
          SHADOW.cardStrong,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {item.uri ? (
          <Image source={{ uri: item.uri }} style={styles.leadImage} resizeMode="cover" />
        ) : (
          <View style={styles.leadImagePlaceholder} />
        )}
        <View style={styles.leadBody}>
          <Tag>{item.label || 'Best pick'}</Tag>
          <Text style={styles.leadTitle}>{item.title}</Text>
          <Text style={styles.leadReason}>{item.reason}</Text>
          {item.summary ? (
            <Text style={styles.leadSummary}>{item.summary}</Text>
          ) : null}
          <View style={styles.leadBtns}>
            <PrimaryButton label="Share this" onPress={onShare} />
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.otherCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {item.uri ? (
        <Image source={{ uri: item.uri }} style={styles.otherThumb} resizeMode="cover" />
      ) : (
        <View style={styles.otherThumbPlaceholder} />
      )}
      <View style={styles.otherRight}>
        <Tag tone={item.label === 'Skip this one' ? 'warning' : 'default'}>
          {item.label}
        </Tag>
        <Text style={styles.otherTitle}>{item.title}</Text>
        <Text style={styles.otherReason} numberOfLines={2}>
          {item.reason}
        </Text>
        <Pressable
          onPress={onShare}
          style={({ pressed }) => [styles.otherShareBtn, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.otherShareBtnText}>Share this</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

export default function ResultsScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { results = [], items = [] } = route.params || {};

  // Map URIs from original items onto results using ID
  const enriched = results.map((r) => {
    const original = items.find((i) => i.id === r.id);
    return { ...r, uri: original?.uri || r.uri || null };
  });

  const lead = enriched[0];
  const rest = enriched.slice(1); // show ALL runners-up, not just 3
  const count = items.length;

  const headlineText =
    count === 1 ? 'Should you post this?' :
    count === 2 ? 'The stronger pick' :
    'Your ranking';

  const subText =
    count === 1
      ? 'An honest read on the photo you brought in.'
      : `Here's the one that stands out from the ${count}.`;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.headline}>{headlineText}</Text>
      <Text style={styles.sub}>{subText}</Text>

      {lead && (
        <ResultCard
          item={lead}
          index={0}
          isLead
          onShare={() => navigation.navigate('Share', { item: lead })}
        />
      )}

      {rest.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>
              {rest.length === 1 ? 'The other option' : `The other ${rest.length}`}
            </Text>
            <Pressable onPress={() => navigation.navigate('Queue')} hitSlop={8}>
              <Text style={styles.tryAgain}>Try different photos</Text>
            </Pressable>
          </View>
          {rest.map((item, i) => (
            <ResultCard
              key={item.id || i}
              item={item}
              index={i + 1}
              isLead={false}
              onShare={() => navigation.navigate('Share', { item })}
            />
          ))}
        </>
      )}

      {/* Pick again CTA */}
      <Pressable
        onPress={() => navigation.navigate('Queue')}
        style={({ pressed }) => [styles.pickAgainRow, pressed && { opacity: 0.6 }]}
      >
        <Text style={styles.pickAgainText}>Pick different photos</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.7,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: SPACING.xl,
  },

  // Lead card
  leadCard: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    marginBottom: SPACING.xxl,
  },
  leadImage: { width: '100%', height: 340 },
  leadImagePlaceholder: { width: '100%', height: 340, backgroundColor: COLORS.surfaceRaised },
  leadBody: { padding: SPACING.xl },
  leadTitle: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  leadReason: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  leadSummary: {
    marginTop: 8,
    fontSize: 11,
    letterSpacing: 1.8,
    color: COLORS.textDim,
    textTransform: 'uppercase',
  },
  leadBtns: { marginTop: SPACING.xl },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: COLORS.textDim,
    textTransform: 'uppercase',
  },
  tryAgain: { fontSize: 12, color: COLORS.textDim },

  // Other cards
  otherCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  otherThumb: { width: 80, height: 100, borderRadius: RADIUS.md },
  otherThumbPlaceholder: {
    width: 80,
    height: 100,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceRaised,
  },
  otherRight: { flex: 1, gap: 4 },
  otherTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 6,
  },
  otherReason: { fontSize: 13, lineHeight: 19, color: COLORS.textSecondary },
  otherShareBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  otherShareBtnText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },

  // Pick again
  pickAgainRow: { marginTop: SPACING.xl, alignItems: 'center', paddingVertical: 8 },
  pickAgainText: { fontSize: 14, color: COLORS.textDim },
});
