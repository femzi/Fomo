import React, { useRef, useEffect, useState } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AppProvider, useApp } from '../context/AppContext';
import FomoBadge from '../components/FomoBadge';
import AlarmOverlay from '../components/AlarmOverlay';
import ProfileSetupScreen from './profile-setup';
import LoginScreen from './login';
import OnboardingIntroScreen from './onboarding-intro';

// Stored separately from app data so resetting the app doesn't re-show onboarding
const ONBOARDING_SEEN_KEY = 'fomo_seen_intro_v1';

// Set up how notifications appear when the app is already open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false, // suppress banner if app is open — overlay handles it
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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

// Gate ordering (each check is a render-time decision, not a navigated route):
// 1. Wait for fonts + storage to hydrate
// 2. If first launch ever → show animated intro onboarding
// 3. If no profile yet → show signup wizard
// 4. If profile exists but logged out → show login
// 5. Otherwise → show the real app
function AppGate() {
  const { hydrated, profile, isLoggedIn } = useApp();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [seenOnboarding, setSeenOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_SEEN_KEY).then(val => {
      setSeenOnboarding(!!val);
      setOnboardingChecked(true);
    });
  }, []);

  async function markOnboardingSeen() {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, '1');
    setSeenOnboarding(true);
  }

  if (!hydrated || !onboardingChecked) {
    return <LoadingScreen />;
  }

  if (!seenOnboarding) {
    return <OnboardingIntroScreen onDone={markOnboardingSeen} />;
  }

  if (!profile) {
    return <ProfileSetupScreen />;
  }

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="event/[id]"           options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="chat/[id]"            options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="checkout/[id]"        options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="person/[id]"          options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="event-clips/[id]"     options={{ animation: 'fade' }} />
        <Stack.Screen name="notification-center"  options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="notifications"        options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy"              options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="help"                 options={{ animation: 'slide_from_right' }} />
      </Stack>
      <AlarmOverlay />
    </>
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
