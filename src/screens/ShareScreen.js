import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Linking, Alert, ScrollView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, SecondaryButton, GhostButton, Tag } from '../components';
import { markHistoryEntryPosted } from '../utils/storage';

export default function ShareScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { item } = route.params || {};
  const [saving, setSaving] = useState(false);

  const saveToLibrary = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to share.');
      return false;
    }
    await MediaLibrary.saveToLibraryAsync(item.uri);
    return true;
  };

  const postToFeed = async () => {
    if (!item?.uri) return;
    setSaving(true);
    try {
      await saveToLibrary();
      await markHistoryEntryPosted(item?.historyId);
      const can = await Linking.canOpenURL('instagram://app');
      await Linking.openURL(can ? 'instagram://library' : 'https://www.instagram.com');
    } catch (err) {
      Alert.alert('Saved to camera roll', 'Open Instagram to post it.');
    } finally { setSaving(false); }
  };

  const shareToStory = async () => {
    if (!item?.uri) return;
    setSaving(true);
    try {
      await saveToLibrary();
      await markHistoryEntryPosted(item?.historyId);
      const can = await Linking.canOpenURL('instagram://app');
      await Linking.openURL(can ? 'instagram://camera' : 'https://www.instagram.com');
    } catch (err) {
      Alert.alert('Saved to camera roll', 'Open Instagram Stories to post it.');
    } finally { setSaving(false); }
  };

  const saveToCameraRoll = async () => {
    if (!item?.uri) return;
    setSaving(true);
    try {
      await saveToLibrary();
      Alert.alert('Saved', 'Photo saved to your camera roll.');
    } catch (err) {
      Alert.alert('Could not save', err.message);
    } finally { setSaving(false); }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, SHADOW.card]}>
        {item?.uri
          ? <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
          : <View style={styles.imagePlaceholder} />}
        <View style={styles.body}>
          <Tag>{item?.label || 'Best pick'}</Tag>
          <Text style={styles.title}>{item?.title || 'Your pick'}</Text>
          <Text style={styles.reason}>{item?.reason || ''}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label={saving ? 'Opening...' : 'Post to feed'} onPress={postToFeed} loading={saving} />
        <SecondaryButton label="Share to story" onPress={shareToStory} />
        <SecondaryButton label="Save to camera roll" onPress={saveToCameraRoll} />
        <GhostButton label="Back to results" onPress={() => navigation.goBack()} style={{ marginTop: 4 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  card: { borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, overflow: 'hidden' },
  image: { width: '100%', height: 300 },
  imagePlaceholder: { width: '100%', height: 300, backgroundColor: COLORS.surfaceRaised },
  body: { padding: SPACING.xl },
  title: { marginTop: 10, fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.5 },
  reason: { marginTop: 8, fontSize: 14, lineHeight: 21, color: COLORS.textSecondary },
  actions: { marginTop: SPACING.lg, gap: 10 },
});
