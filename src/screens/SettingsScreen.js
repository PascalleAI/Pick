import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { resetAllData } from '../utils/storage';

function SettingRow({ label, value, onPress, destructive = false }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.65 }]}
    >
      <Text style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}>
        {label}
      </Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : <Text style={styles.rowArrow}>→</Text>}
    </Pressable>
  );
}

function SectionHeader({ children }) {
  return <Text style={styles.sectionHeader}>{children}</Text>;
}

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const handleRestorePurchases = async () => {
    try {
      // TODO: wire to RevenueCat
      // const customerInfo = await Purchases.restorePurchases();
      Alert.alert('Restore purchases', 'This will be connected to RevenueCat when subscriptions are configured.');
    } catch (err) {
      Alert.alert('Restore failed', err.message);
    }
  };

  const handleReplayOnboarding = () => {
    navigation.navigate('Onboarding');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear all data?',
      'This will reset your pick history and usage. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear data',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            navigation.navigate('Intro');
          },
        },
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://YOUR_PRIVACY_POLICY_URL');
  };

  const openTerms = () => {
    Linking.openURL('https://YOUR_TERMS_URL');
  };

  const openSupport = () => {
    Linking.openURL('mailto:hello@yourpickapp.com');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Settings</Text>

      <SectionHeader>Subscription</SectionHeader>
      <View style={styles.section}>
        <SettingRow label="Upgrade to Starter" onPress={() => navigation.navigate('Paywall')} />
        <SettingRow label="Restore purchases" onPress={handleRestorePurchases} />
      </View>

      <SectionHeader>App</SectionHeader>
      <View style={styles.section}>
        <SettingRow label="Replay introduction" onPress={handleReplayOnboarding} />
      </View>

      <SectionHeader>Support</SectionHeader>
      <View style={styles.section}>
        <SettingRow label="Privacy policy" onPress={openPrivacyPolicy} />
        <SettingRow label="Terms of service" onPress={openTerms} />
        <SettingRow label="Contact us" onPress={openSupport} />
      </View>

      <SectionHeader>Data</SectionHeader>
      <View style={styles.section}>
        <SettingRow label="Clear all data" onPress={handleClearData} destructive />
      </View>
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
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.7,
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    color: COLORS.textDim,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    marginTop: SPACING.xl,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowLabel: {
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  rowLabelDestructive: {
    color: '#C0392B',
  },
  rowValue: {
    fontSize: 14,
    color: COLORS.textDim,
  },
  rowArrow: {
    fontSize: 16,
    color: COLORS.textDim,
  },
});
