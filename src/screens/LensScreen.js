import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { getHistory } from '../utils/storage';

// Rotating headlines — different every time you open
const HEADLINES = [
  "A read on what your eye keeps reaching for.",
  "What your picks say about how you see.",
  "The patterns behind what you choose.",
  "Your eye, over time.",
  "What you keep gravitating toward.",
  "A quiet record of your taste.",
];

// Rotating pattern summaries derived from pick behavior
const PATTERN_OPENERS = [
  "You tend to choose",
  "Your eye keeps landing on",
  "You keep reaching for",
  "What stands out to you is",
  "You're drawn to",
];

const PATTERN_BODIES = [
  "the clearest frame in the set — the one that holds fastest at feed size.",
  "photos where the shape reads immediately, before the detail does.",
  "images that feel effortless rather than composed.",
  "frames with a strong first impression and not much noise around it.",
  "the photo that would stop you mid-scroll, not the one you'd appreciate slowly.",
];

function getDerivedInsights(history) {
  if (history.length < 3) return null;

  const posted = history.filter(h => h.posted).length;
  const postRate = history.length > 0 ? Math.round((posted / history.length) * 100) : 0;

  // Average set size (stored in allIds)
  const avgSetSize = history.reduce((sum, h) => sum + (h.allIds?.length || 1), 0) / history.length;

  // Recent activity — picks in last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentPicks = history.filter(h => new Date(h.date) > weekAgo).length;

  // Solo picks (just 1 photo) vs set picks
  const soloPicks = history.filter(h => (h.allIds?.length || 1) === 1).length;
  const setPicks = history.length - soloPicks;

  return { posted, postRate, avgSetSize: Math.round(avgSetSize * 10) / 10, recentPicks, soloPicks, setPicks, total: history.length };
}

function buildInsightCards(insights) {
  const cards = [];

  if (insights.postRate >= 70) {
    cards.push({ title: "You trust your eye", body: `You've posted ${insights.postRate}% of what you've picked. That's not someone who second-guesses — that's someone who knows what they like.` });
  } else if (insights.postRate >= 40) {
    cards.push({ title: "You're selective", body: `You post about half of what you analyse. You're using Pick the right way — as a filter, not a rubber stamp.` });
  } else {
    cards.push({ title: "You take your time", body: `You hold back more than you post. That restraint usually shows up in the quality of what does make it through.` });
  }

  if (insights.avgSetSize >= 4) {
    cards.push({ title: "You think in sets", body: `You typically bring in ${insights.avgSetSize} photos at a time. You're not looking for permission to post — you're looking for the strongest option in a real set.` });
  } else if (insights.avgSetSize <= 2) {
    cards.push({ title: "You're decisive", body: `You usually come in with 1 or 2 photos. You've already done the editing before you get here — Pick is just the final call.` });
  }

  if (insights.recentPicks >= 3) {
    cards.push({ title: "On a roll this week", body: `${insights.recentPicks} picks in the last 7 days. You're in a posting rhythm — that consistency tends to show up in the feed.` });
  }

  if (insights.setPicks > insights.soloPicks) {
    cards.push({ title: "You compare before you commit", body: "Most of your picks come from sets, not solo shots. You like having options before you decide — which usually means a better final call." });
  }

  // Always add this one — it's universally true and feels personal
  cards.push({ title: "Your eye is getting sharper", body: `${insights.total} picks in. The more you use Pick, the clearer the pattern gets — and the faster you'll know which photo is right before you even run it.` });

  return cards.slice(0, 3);
}

function getUniqueThumbs(history) {
  const seen = new Set();
  return history.filter(h => {
    if (!h.thumbnailUri || seen.has(h.thumbnailUri)) return false;
    seen.add(h.thumbnailUri);
    return true;
  });
}

export default function LensScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [headlineIndex] = useState(() => Math.floor(Math.random() * HEADLINES.length));
  const [patternIndex] = useState(() => Math.floor(Math.random() * PATTERN_OPENERS.length));

  useFocusEffect(useCallback(() => {
    getHistory().then(h => { setHistory(h); setLoading(false); });
  }, []));

  const insights = getDerivedInsights(history);
  const insightCards = insights ? buildInsightCards(insights) : [];
  const uniqueThumbs = getUniqueThumbs(history).slice(0, 10);

  if (!loading && !insights) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Your Lens</Text>
        <Text style={styles.emptyBody}>
          Make a few picks and this page will start reflecting what your eye keeps reaching for.
        </Text>
        <Pressable onPress={() => navigation.navigate('Queue')} style={styles.emptyBtn}>
          <Text style={styles.emptyBtnText}>Start picking</Text>
        </Pressable>
      </View>
    );
  }

  if (loading) return <View style={styles.screen} />;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <Text style={styles.title}>Your Lens</Text>
      <Text style={styles.sub}>{HEADLINES[headlineIndex]}</Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{insights.total}</Text>
          <Text style={styles.statLabel}>Picks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{insights.posted}</Text>
          <Text style={styles.statLabel}>Posted</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{insights.postRate}%</Text>
          <Text style={styles.statLabel}>Posted rate</Text>
        </View>
      </View>

      {/* Hero pattern — full bleed green card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroOpener}>{PATTERN_OPENERS[patternIndex]}</Text>
        <Text style={styles.heroBody}>{PATTERN_BODIES[patternIndex]}</Text>
      </View>

      {/* Photo strip — their actual picks */}
      {uniqueThumbs.length > 0 && (
        <View style={styles.stripSection}>
          <Text style={styles.sectionLabel}>What you've chosen</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.strip}>
            {uniqueThumbs.map((entry, i) => (
              <Image
                key={i}
                source={{ uri: entry.thumbnailUri }}
                style={[styles.stripThumb, i === 0 && styles.stripThumbFirst]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Insight cards */}
      <Text style={styles.sectionLabel}>What this tells us</Text>
      {insightCards.map(card => (
        <View key={card.title} style={styles.insightCard}>
          <Text style={styles.insightTitle}>{card.title}</Text>
          <Text style={styles.insightBody}>{card.body}</Text>
        </View>
      ))}

      {/* Recent activity if slow week */}
      {insights.recentPicks === 0 && (
        <View style={styles.nudgeCard}>
          <Text style={styles.nudgeText}>No picks this week. Your eye needs exercise — bring in a set.</Text>
          <Pressable onPress={() => navigation.navigate('Queue')} style={styles.nudgeBtn}>
            <Text style={styles.nudgeBtnText}>Pick now</Text>
          </Pressable>
        </View>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { paddingTop: SPACING.xl },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.7, paddingHorizontal: SPACING.xl },
  sub: { marginTop: 6, fontSize: 14, color: COLORS.textSecondary, lineHeight: 21, paddingHorizontal: SPACING.xl, marginBottom: SPACING.xl },

  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: SPACING.xl, marginBottom: SPACING.lg },
  stat: { flex: 1, backgroundColor: COLORS.surfaceSoft, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, paddingVertical: 14, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '700', color: COLORS.green },
  statLabel: { fontSize: 11, color: COLORS.textDim, marginTop: 3, letterSpacing: 0.2 },

  heroCard: {
    marginHorizontal: SPACING.xl,
    backgroundColor: COLORS.green,
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl,
    marginBottom: SPACING.xxl,
  },
  heroOpener: { fontSize: 13, fontWeight: '600', color: 'rgba(251,244,230,0.55)', letterSpacing: 0.3, marginBottom: 8 },
  heroBody: { fontSize: 20, fontWeight: '700', color: COLORS.cream, letterSpacing: -0.4, lineHeight: 28 },

  stripSection: { marginBottom: SPACING.xxl },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 2, color: COLORS.textDim, textTransform: 'uppercase', paddingHorizontal: SPACING.xl, marginBottom: SPACING.md },
  strip: { paddingLeft: SPACING.xl },
  stripThumb: { width: 100, height: 130, borderRadius: RADIUS.lg, marginRight: 10, backgroundColor: COLORS.surfaceRaised },
  stripThumbFirst: { borderWidth: 2, borderColor: COLORS.green },

  insightCard: { marginHorizontal: SPACING.xl, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginBottom: SPACING.md },
  insightTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.3 },
  insightBody: { marginTop: 6, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20 },

  nudgeCard: { marginHorizontal: SPACING.xl, backgroundColor: COLORS.surfaceSoft, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.lg, marginTop: SPACING.md, flexDirection: 'row', alignItems: 'center', gap: 12 },
  nudgeText: { flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  nudgeBtn: { backgroundColor: COLORS.green, borderRadius: RADIUS.full, paddingHorizontal: 14, paddingVertical: 8 },
  nudgeBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.cream },

  empty: { flex: 1, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyTitle: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, letterSpacing: -0.7, marginBottom: 10 },
  emptyBody: { fontSize: 14, lineHeight: 22, color: COLORS.textSecondary, textAlign: 'center' },
  emptyBtn: { marginTop: 24, backgroundColor: COLORS.green, borderRadius: RADIUS.full, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.cream },
});
