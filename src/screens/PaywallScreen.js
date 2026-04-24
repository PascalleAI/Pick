import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, GhostButton, Tag } from '../components';
import { FREE_PICKS_LIMIT } from '../constants/theme';
import { getFreePicksUsed } from '../utils/storage';

const DEMO_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=70';

export default function PaywallScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [freePicksUsed, setFreePicksUsed] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { getFreePicksUsed().then(setFreePicksUsed); }, []);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      Alert.alert('Subscriptions coming soon', 'Connect your RevenueCat product ID to activate.');
    } catch (err) {
      if (!err.userCancelled) Alert.alert('Purchase failed', err.message);
    } finally { setLoading(false); }
  };

  const freeLeft = Math.max(0, FREE_PICKS_LIMIT - freePicksUsed);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, SHADOW.card]}>
        <Image source={{ uri: DEMO_IMAGE }} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay} />

        <View style={styles.body}>
          <Tag>Starter</Tag>
          <Text style={styles.title}>Keep a trusted second opinion close.</Text>
          <Text style={styles.sub}>
            {freeLeft > 0
              ? `You have ${freeLeft} free pick${freeLeft !== 1 ? 's' : ''} left. Upgrade for ongoing access.`
              : "You've used your free picks. Upgrade to keep going."}
          </Text>

          {/* Product tile — fixed layout */}
          <View style={styles.productTile}>
            <View style={styles.productLeft}>
              <Text style={styles.productTitle}>Starter</Text>
              <Text style={styles.productDesc}>75 photo checks per month</Text>
              <Text style={styles.productDesc}>Cancel anytime</Text>
            </View>
            <View style={styles.productRight}>
              <Text style={styles.productPrice}>$5.99</Text>
              <Text style={styles.productPeriod}>/ month</Text>
            </View>
          </View>

          <Text style={styles.finePrint}>
            Billed monthly. Cancel anytime in your Apple ID settings.
            Subscription renews automatically until cancelled.
          </Text>

          <View style={styles.actions}>
            <PrimaryButton label="Continue" onPress={handlePurchase} loading={loading} />
            <GhostButton label="Restore purchases" onPress={() => Alert.alert('Restore', 'Connect RevenueCat to enable.')} style={styles.restore} />
            <GhostButton label="Not now" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  card: { borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, overflow: 'hidden' },
  image: { width: '100%', height: 220 },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 220, backgroundColor: 'rgba(0,0,0,0.18)' },
  body: { padding: SPACING.xl },
  title: { marginTop: 14, fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.6, lineHeight: 28, maxWidth: 280 },
  sub: { marginTop: 10, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
  productTile: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productLeft: { flex: 1 },
  productTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  productDesc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  productRight: { alignItems: 'flex-end', marginLeft: 12 },
  productPrice: { fontSize: 22, fontWeight: '700', color: COLORS.green },
  productPeriod: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },
  finePrint: { marginTop: SPACING.md, fontSize: 11, lineHeight: 17, color: COLORS.textDim },
  actions: { marginTop: SPACING.xl, gap: 10 },
  restore: { marginTop: 4 },
});
