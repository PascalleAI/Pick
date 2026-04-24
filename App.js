import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './AppNavigator';
import { getOnboardingComplete, getPermissionStatus } from './src/utils/storage';
import { COLORS } from './src/constants/theme';

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null); // null = still loading

  useEffect(() => {
    async function resolveInitialRoute() {
      const onboarded = await getOnboardingComplete();
      if (!onboarded) {
        setInitialRoute('Intro');
        return;
      }
      const permission = await getPermissionStatus();
      if (!permission || permission === 'denied') {
        setInitialRoute('Permission');
        return;
      }
      setInitialRoute('MainTabs');
    }
    resolveInitialRoute();
  }, []);

  if (!initialRoute) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={COLORS.green} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" backgroundColor={COLORS.cream} />
        <AppNavigator initialRoute={initialRoute} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
