import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, Tag } from '../components';

const DEMO_IMAGE = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80';
const { height } = Dimensions.get('window');

export default function IntroScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={[styles.card, SHADOW.cardStrong]}>
        <ImageBackground
          source={{ uri: DEMO_IMAGE }}
          style={styles.image}
          resizeMode="cover"
        >
          <View style={styles.gradient} />
          <View style={styles.tagWrap}>
            <Tag>PICK</Tag>
          </View>
          <View style={styles.bottom}>
            <Text style={styles.headline}>Feel better about{'\n'}what you post.</Text>
            <Text style={styles.sub}>
              A calm second opinion for the moment before you share.
            </Text>
            <View style={styles.pillRow}>
              <View style={styles.pill}>
                <Text style={styles.pillText}>5 free picks to start</Text>
              </View>
            </View>
            <View style={styles.btnRow}>
              <PrimaryButton
                label="Open Pick"
                dark={false}
                onPress={() => navigation.replace('Onboarding')}
                style={styles.openBtn}
              />
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.creamMid,
    paddingHorizontal: SPACING.xl,
  },
  card: {
    flex: 1,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // LinearGradient would go here — using opacity overlay as fallback
    background: 'linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.72) 70%)',
  },
  tagWrap: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
    backgroundColor: 'rgba(0,0,0,0.54)',
  },
  headline: {
    fontSize: 38,
    fontWeight: '700',
    color: COLORS.textOnDark,
    lineHeight: 42,
    letterSpacing: -1.2,
  },
  sub: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.textOnDarkSoft,
    maxWidth: 280,
  },
  pillRow: {
    marginTop: 16,
    flexDirection: 'row',
  },
  pill: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(251,244,230,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: {
    color: 'rgba(251,244,230,0.72)',
    fontSize: 11,
    letterSpacing: 0.4,
  },
  btnRow: {
    marginTop: 20,
    flexDirection: 'row',
  },
  openBtn: {
    backgroundColor: COLORS.cream,
    paddingHorizontal: 28,
  },
});
