import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { incrementFreePicksUsed, saveHistoryEntry } from '../utils/storage';
import { analyzeImages } from '../utils/api';

function getLoadingLines(count) {
  if (count === 1) return ['Looking at your photo', 'Getting an honest read', 'Almost there'];
  if (count === 2) return ['Looking at both photos', 'Comparing the two', 'Finding the stronger one'];
  return ['Reviewing your photos', 'Comparing your picks', 'Sorting through the set', 'Finding the strongest one'];
}

export default function AnalyzingScreen({ navigation, route }) {
  const { items } = route.params;
  const [lineIndex, setLineIndex] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [error, setError] = useState(null);
  const LINES = getLoadingLines(items.length);

  useEffect(() => {
    const li = setInterval(() => setLineIndex((i) => (i + 1) % LINES.length), 1400);
    return () => clearInterval(li);
  }, []);

  useEffect(() => {
    if (items.length < 2) return;
    const fi = setInterval(() => setFrameIndex((i) => (i + 1) % items.length), 700);
    return () => clearInterval(fi);
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const results = await analyzeImages(items);
        if (cancelled) return;

        await incrementFreePicksUsed();

        const lead = results[0]; // best pick — ranked server-side

        await saveHistoryEntry({
          id: 'h_' + Date.now(),
          date: new Date().toISOString(),
          leadTitle: lead?.title || 'Pick',
          leadReason: lead?.reason || '',
          leadLabel: lead?.label || 'Best pick',
          thumbnailUri: lead?.uri || items[0]?.uri, // ← use the winner's URI, not always items[0]
          allIds: items.map((i) => i.id),
          posted: false,
        });

        navigation.replace('Results', { results, items });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Something went wrong. Please try again.');
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  const currentImage = items[frameIndex];

  if (error) {
    return (
      <View style={styles.errorScreen}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <Text style={styles.errorBtn} onPress={() => navigation.goBack()}>
          Go back
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        {currentImage?.uri ? (
          <Image
            source={{ uri: currentImage.uri }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder} />
        )}
        <View style={styles.overlay} />
        <View style={styles.stripWrap}>
          {items.length > 1 && (
            <View style={styles.strip}>
              {items.slice(0, 5).map((item, i) => (
                <Image
                  key={item.id}
                  source={{ uri: item.uri }}
                  style={[
                    styles.stripThumb,
                    i === frameIndex % Math.min(items.length, 5) && styles.stripThumbActive,
                  ]}
                  resizeMode="cover"
                />
              ))}
            </View>
          )}
          <Text style={styles.loadingLine}>{LINES[lineIndex]}</Text>
          <Text style={styles.loadingHint}>Just a second</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream, padding: SPACING.xl },
  card: {
    flex: 1,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceRaised,
  },
  mainImage: { ...StyleSheet.absoluteFillObject },
  imagePlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.surfaceRaised },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.52)' },
  stripWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
    paddingBottom: 36,
  },
  strip: { flexDirection: 'row', gap: 8, marginBottom: SPACING.xl },
  stripThumb: {
    width: 52,
    height: 66,
    borderRadius: 10,
    opacity: 0.5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  stripThumbActive: { opacity: 1, borderColor: 'rgba(255,255,255,0.5)' },
  loadingLine: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textOnDark,
    letterSpacing: -0.6,
    lineHeight: 34,
    maxWidth: 260,
  },
  loadingHint: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.textOnDarkSoft,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  errorScreen: {
    flex: 1,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  errorBody: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  errorBtn: { marginTop: 28, fontSize: 15, fontWeight: '600', color: COLORS.green },
});
