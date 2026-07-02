import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Vibration, Animated, Easing } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import FomoBadge from './FomoBadge';

// Checks every second whether the active reminder's target time has
// passed. If it has, this takes over the entire screen — logo, event
// name, and a vibration pattern as the "sound".
//
// Honest limitation: this only fires while the app is open and in the
// foreground. A reminder that fires even with the app closed or the
// phone locked needs real scheduled push notifications (expo-notifications)
// wired to a backend — that's a real next step, not something that
// works purely client-side like this.
export default function AlarmOverlay() {
  const { activeTimer, events, clearEventTimer } = useApp();
  const [fired, setFired] = useState(false);
  const firedOnceRef = useRef(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!activeTimer) {
      setFired(false);
      firedOnceRef.current = false;
      return;
    }
    const interval = setInterval(() => {
      if (Date.now() >= activeTimer.targetTime) {
        setFired(true);
      }
    }, 500);
    if (Date.now() >= activeTimer.targetTime) setFired(true);
    return () => clearInterval(interval);
  }, [activeTimer]);

  useEffect(() => {
    if (fired && !firedOnceRef.current) {
      firedOnceRef.current = true;
      Vibration.vibrate([0, 500, 200, 500, 200, 500], true);
    }
    if (!fired) {
      Vibration.cancel();
    }
  }, [fired]);

  useEffect(() => {
    if (!fired) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, [fired]);

  if (!activeTimer || !fired) return null;

  const event = events.find(e => e.id === activeTimer.eventId);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  function dismiss() {
    Vibration.cancel();
    clearEventTimer();
  }

  return (
    <View style={styles.overlay}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <FomoBadge size={130} />
      </Animated.View>
      <Text style={styles.itsTime}>IT'S TIME</Text>
      <Text style={styles.eventName}>{event?.name ?? 'Your event'}</Text>
      {event && <Text style={styles.venue}>{event.venue}</Text>}
      <TouchableOpacity style={styles.dismissBtn} onPress={dismiss}>
        <Text style={styles.dismissTxt}>I'M READY</Text>
      </TouchableOpacity>
    </View>
  );
}

const S = StyleSheet.create;
const styles = S({
  overlay:     {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center',
    gap: 14, zIndex: 9999, elevation: 9999,
  },
  itsTime:     { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 4, marginTop: 20 },
  eventName:   { fontSize: 34, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, textAlign: 'center', paddingHorizontal: 24 },
  venue:       { fontSize: 13, fontFamily: Fonts.body, color: Colors.dim },
  dismissBtn:  { backgroundColor: Colors.red, paddingHorizontal: 36, paddingVertical: 16, borderRadius: 6, marginTop: 30 },
  dismissTxt:  { fontSize: 14, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 2 },
});
