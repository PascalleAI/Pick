import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, RADIUS, SHADOW, SPACING } from './src/constants/theme';

import IntroScreen from './src/screens/IntroScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PermissionScreen from './src/screens/PermissionScreen';
import HomeScreen from './src/screens/HomeScreen';
import QueueScreen from './src/screens/QueueScreen';
import AnalyzingScreen from './src/screens/AnalyzingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ShareScreen from './src/screens/ShareScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import LensScreen from './src/screens/LensScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PaywallScreen from './src/screens/PaywallScreen';
import { Header } from './src/components';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Custom bottom tab bar ────────────────────────────────────────────────────

function PickTabBar({ state, descriptors, navigation, onPickPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.tabBarInner}>
        {/* Home tab */}
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.tabIcon, state.index === 0 && styles.tabIconActive]}>⌂</Text>
          <Text style={[styles.tabLabel, state.index === 0 && styles.tabLabelActive]}>Home</Text>
        </Pressable>

        {/* Pick button (center) */}
        <Pressable style={({ pressed }) => [styles.pickBtn, pressed && { opacity: 0.85 }]} onPress={onPickPress}>
          <Text style={styles.pickBtnPlus}>+</Text>
        </Pressable>

        {/* Style tab */}
        <Pressable style={styles.tabItem} onPress={() => navigation.navigate('Lens')}>
          <Text style={[styles.tabIcon, state.index === 1 && styles.tabIconActive]}>✦</Text>
          <Text style={[styles.tabLabel, state.index === 1 && styles.tabLabelActive]}>Lens</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── Main tabs ────────────────────────────────────────────────────────────────

function MainTabs({ navigation }) {
  const handlePickPress = () => {
    navigation.navigate('Queue');
  };

  return (
    <Tab.Navigator
      tabBar={(props) => <PickTabBar {...props} onPickPress={handlePickPress} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Lens" component={LensScreen} />
    </Tab.Navigator>
  );
}

// ─── Root stack ───────────────────────────────────────────────────────────────

function AppHeader({ navigation, route, options, back }) {
  const canGoBack = back !== undefined;
  const showSettings = ['Home', 'Queue', 'Results', 'History'].includes(route.name);
  return (
    <Header
      onBack={canGoBack ? () => navigation.goBack() : undefined}
      onSettings={showSettings ? () => navigation.navigate('Settings') : undefined}
    />
  );
}

export default function AppNavigator({ initialRoute = 'Intro' }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          header: (props) => <AppHeader {...props} />,
          contentStyle: { backgroundColor: COLORS.cream },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="Intro" component={IntroScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Permission" component={PermissionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Queue" component={QueueScreen} />
        <Stack.Screen name="Analyzing" component={AnalyzingScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Share" component={ShareScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(251,244,230,0.96)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
    paddingHorizontal: SPACING.xl,
    ...SHADOW.nav,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabItem: {
    alignItems: 'center',
    width: 64,
  },
  tabIcon: {
    fontSize: 20,
    color: COLORS.textDim,
  },
  tabIconActive: {
    color: COLORS.textPrimary,
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.textDim,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  pickBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
    marginBottom: 4,
  },
  pickBtnPlus: {
    fontSize: 28,
    color: COLORS.cream,
    lineHeight: 32,
    fontWeight: '300',
  },
});
