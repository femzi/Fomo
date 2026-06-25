import React, { useRef, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { AppProvider, useApp } from '../context/AppContext';
import FomoBadge from '../components/FomoBadge';
import OnboardingScreen from './onboarding';

function LoadingScreen() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <View style={loadingStyles.safe}>
      <Animated.View style={{ transform: [{ scale }], opacity }}>
        <FomoBadge size={110} />
      </Animated.View>
      <Text style={loadingStyles.tagline}>THE NIGHT DOESN'T WAIT</Text>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', gap: 18 },
  tagline:  { fontSize: 11, fontWeight: '700', color: '#5C5A56', letterSpacing: 2 },
});

// Gate that decides what to show once fonts are ready and AppProvider
// is live: onboarding if no role chosen yet, otherwise the real app.
// This is a render-time decision, not a navigated route — that's what
// makes it work reliably on web, where the URL "/" would otherwise
// resolve straight to the tabs group and skip onboarding entirely.
function AppGate() {
  const { userRole } = useApp();

  if (!userRole) {
    return <OnboardingScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="event/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="checkout/[id]" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'BebasNeue': BebasNeue_400Regular,
    'SpaceGrotesk': SpaceGrotesk_400Regular,
    'SpaceGrotesk-Medium': SpaceGrotesk_500Medium,
    'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
    'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <AppProvider>
      <StatusBar style="light" />
      <AppGate />
    </AppProvider>
  );
}
