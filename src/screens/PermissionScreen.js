import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, SecondaryButton, GhostButton, Tag } from '../components';
import { setPermissionStatus } from '../utils/storage';

const DEMO_IMAGE = 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=800&q=80';

export default function PermissionScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const requestPermission = async (type) => {
    setLoading(true);
    try {
      const { status, accessPrivileges } = await MediaLibrary.requestPermissionsAsync(
        type === 'full' // addOnly: false for full access
      );

      if (status === 'granted') {
        await setPermissionStatus('granted');
        navigation.replace('MainTabs');
      } else if (status === 'denied') {
        // Already denied — iOS won't show prompt again, need to send to Settings
        Alert.alert(
          'Photo access needed',
          'To use Pick, go to Settings and allow photo access.',
          [
            { text: 'Not now', style: 'cancel', onPress: () => skipPermission() },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
      } else {
        // limited or other
        await setPermissionStatus('limited');
        navigation.replace('MainTabs');
      }
    } catch (err) {
      console.error('Permission error:', err);
      skipPermission();
    } finally {
      setLoading(false);
    }
  };

  const skipPermission = async () => {
    await setPermissionStatus('denied');
    navigation.replace('MainTabs');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.card, SHADOW.card]}>
        <Image source={{ uri: DEMO_IMAGE }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <Tag>Photo access</Tag>
          <Text style={styles.title}>Let Pick look when you want a second opinion.</Text>
          <Text style={styles.body}>
            Choose which photos to share with Pick. You stay in control of what comes in.
          </Text>

          <View style={styles.buttons}>
            <PrimaryButton
              label="Allow Photo Access"
              onPress={() => requestPermission('selected')}
              loading={loading}
            />
            <SecondaryButton
              label="Allow Full Access"
              onPress={() => requestPermission('full')}
              style={styles.secondaryBtn}
            />
            <GhostButton
              label="Not now"
              onPress={skipPermission}
              style={styles.ghostBtn}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingHorizontal: SPACING.xl,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 260,
  },
  content: {
    padding: SPACING.xl,
    flex: 1,
  },
  title: {
    marginTop: 16,
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.7,
    lineHeight: 30,
    maxWidth: 280,
  },
  body: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },
  buttons: {
    marginTop: 28,
    gap: 10,
  },
  secondaryBtn: {
    // no overrides needed
  },
  ghostBtn: {
    marginTop: 4,
  },
});
