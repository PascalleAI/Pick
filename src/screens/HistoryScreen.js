import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Tag } from '../components';
import { getHistory } from '../utils/storage';

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function HistoryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getHistory().then((h) => {
        setHistory(h);
        setLoading(false);
      });
    }, [])
  );

  if (!loading && history.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No picks yet</Text>
        <Text style={styles.emptyBody}>
          Your past picks will show up here so you can review what you chose.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>History</Text>
      <Text style={styles.sub}>Your past picks.</Text>

      <View style={styles.list}>
        {history.map((entry) => (
          <Pressable
            key={entry.id}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
            onPress={() => {
              // Could navigate to a detail view in future
            }}
          >
            <View style={styles.cardTop}>
              <Text style={styles.dateText}>{formatDate(entry.date)}</Text>
              <Tag>{entry.posted ? 'Posted' : 'Saved'}</Tag>
            </View>
            <View style={styles.cardBody}>
              {entry.thumbnailUri ? (
                <Image
                  source={{ uri: entry.thumbnailUri }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.thumbnailPlaceholder} />
              )}
              <View style={styles.cardText}>
                <Text style={styles.leadTitle}>{entry.leadTitle}</Text>
                <Text style={styles.leadLabel}>{entry.leadLabel}</Text>
                <Text style={styles.leadReason} numberOfLines={2}>
                  {entry.leadReason}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
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
  },
  sub: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  list: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dateText: {
    fontSize: 11,
    letterSpacing: 1.6,
    color: COLORS.textDim,
    textTransform: 'uppercase',
  },
  cardBody: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  thumbnail: {
    width: 80,
    height: 96,
    borderRadius: RADIUS.md,
  },
  thumbnailPlaceholder: {
    width: 80,
    height: 96,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceRaised,
  },
  cardText: {
    flex: 1,
  },
  leadTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  leadLabel: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 1.2,
    color: COLORS.textDim,
    textTransform: 'uppercase',
  },
  leadReason: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  empty: {
    flex: 1,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  emptyBody: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
