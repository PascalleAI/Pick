import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, SHADOW } from '../constants/theme';
import { PrimaryButton, Tag } from '../components';
import { setOnboardingComplete } from '../utils/storage';

const SLIDES = [
  {
    title: 'Add a few photos',
    text: 'Bring in a set you are actually choosing between — one, two, or up to nine.',
    image: 'https://images.unsplash.com/photo-1506629905607-c28d4d6929e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Get a quick read',
    text: 'PICK looks at what you brought and helps you find the strongest one without the overthinking.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Post or save',
    text: 'Take the lead pick straight to Instagram, or save it for later.',
    image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=800&q=80',
  },
];

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  const handleNext = async () => {
    if (!isLast) {
      setStep(step + 1);
    } else {
      await setOnboardingComplete();
      navigation.replace('Permission');
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.topRow}>
        <Tag>How it works</Tag>
        <Text style={styles.counter}>{step + 1}/{SLIDES.length}</Text>
      </View>

      <View style={[styles.card, SHADOW.card]}>
        <Image source={{ uri: slide.image }} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.text}</Text>
          <View style={styles.footer}>
            <View style={styles.dots}>
              {SLIDES.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === step && styles.dotActive]}
                />
              ))}
            </View>
            <PrimaryButton
              label={isLast ? 'Continue' : 'Next'}
              onPress={handleNext}
              style={styles.nextBtn}
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  counter: {
    fontSize: 11,
    color: COLORS.textDim,
    letterSpacing: 0.4,
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
    height: 300,
  },
  content: {
    padding: SPACING.xl,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 32,
  },
  body: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textSecondary,
  },
  footer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.borderStrong,
  },
  dotActive: {
    width: 20,
    backgroundColor: COLORS.green,
  },
  nextBtn: {
    paddingHorizontal: 20,
    height: 42,
  },
});
