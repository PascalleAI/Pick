import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, SecondaryButton, Tag, RowButton } from '../components';
import { getFreePicksUsed, getHistory } from '../utils/storage';
import { FREE_PICKS_LIMIT } from '../constants/theme';

const DEMO_IMAGE = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80';

export default function HomeScreen({ navigation, route }) {
  const [freePicksUsed, setFreePicksUsed] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadState();
    }, [])
  );

  const loadState = async () => {
    const used = await getFreePicksUsed();
    const history = await getHistory();
    setFreePicksUsed(used);
    setHistoryCount(history.length);
    // TODO: check RevenueCat entitlement here
    // const customerInfo = await Purchases.getCustomerInfo();
    // setIsSubscribed(!!customerInfo.entitlements.active[RC_ENTITLEMENT]);
  };

  const freeLeft = Math.max(0, FREE_PICKS_LIMIT - freePicksUsed);
  const canPick = isSubscribed || freeLeft > 0;

  const handleStartPick = () => {
    if (!canPick) {
      navigation.navigate('Paywall');
      return;
    }
    navigation.navigate('Queue');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <Text style={styles.headline}>Pick with more confidence</Text>
        <Text style={styles.sub}>
          Bring in one photo, two options, or a full set. Pick helps you make the call.
        </Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {isSubscribed ? 'Starter active' : `${freeLeft} free pick${freeLeft !== 1 ? 's' : ''} left`}
          </Text>
        </View>
      </View>

      {/* Hero card */}
      <View style={[styles.heroCard, SHADOW.cardStrong]}>
        <Image source={{ uri: DEMO_IMAGE }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Ready when you are</Text>
          <Text style={styles.heroSub}>
            Choose your photos and let Pick help you find the strongest one.
          </Text>
          <View style={styles.heroBtns}>
            <Pressable
              onPress={handleStartPick}
              style={({ pressed }) => [styles.heroBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.heroBtnText}>Choose photos</Text>
            </Pressable>
            {historyCount > 0 && (
              <Pressable
                onPress={() => navigation.navigate('History')}
                style={({ pressed }) => [styles.heroSecondBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.heroSecondBtnText}>History</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* History row */}
      {historyCount > 0 && (
        <View style={styles.rowSection}>
          <RowButton onPress={() => navigation.navigate('History')}>
            <View>
              <Text style={styles.rowLabel}>History</Text>
              <Text style={styles.rowValue}>{historyCount} saved</Text>
            </View>
            <Text style={styles.rowArrow}>→</Text>
          </RowButton>
        </View>
      )}

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  intro: {
    marginBottom: SPACING.xl,
  },
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.7,
    lineHeight: 30,
  },
  sub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textSecondary,
  },
  pill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    fontSize: 11,
    color: COLORS.textDim,
    letterSpacing: 0.3,
  },
  heroCard: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 340,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.textOnDark,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  heroSub: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textOnDarkSoft,
  },
  heroBtns: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  heroBtn: {
    height: 44,
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.full,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '600',
  },
  heroSecondBtn: {
    height: 44,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(251,244,230,0.22)',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSecondBtnText: {
    color: COLORS.textOnDark,
    fontSize: 14,
    fontWeight: '500',
  },
  rowSection: {
    marginTop: SPACING.md,
  },
  rowLabel: {
    fontSize: 11,
    letterSpacing: 1.6,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  rowValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  rowArrow: {
    fontSize: 18,
    color: COLORS.textDim,
  },
  bottomSpace: {
    height: 120,
  },
});
