import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useApp } from '../context/AppContext';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationCenterScreen() {
  const router = useRouter();
  const { notifications, markAllNotificationsRead, clearNotifications } = useApp();
  useEffect(() => { markAllNotificationsRead(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
        {notifications.length > 0 && <TouchableOpacity onPress={clearNotifications}><Text style={styles.clearTxt}>CLEAR ALL</Text></TouchableOpacity>}
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NOTIFICATIONS</Text>
        {notifications.length === 0 && (
          <Text style={styles.emptyTxt}>Nothing yet. You'll see things here like friends rating your vibe, hosts you follow posting new events, and reminders to post clips when your event picks up.</Text>
        )}
        {notifications.map(n => (
          <View key={n.id} style={styles.notifRow}>
            <Text style={styles.notifText}>{n.text}</Text>
            <Text style={styles.notifTime}>{timeAgo(n.ts)}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:       { flex: 1, backgroundColor: Colors.bg },
  topBar:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backTxt:    { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  clearTxt:   { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  content:    { padding: 16, gap: 12, paddingBottom: 40 },
  title:      { fontSize: 26, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2, marginBottom: 4 },
  emptyTxt:   { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 19, marginTop: 10 },
  notifRow:   { backgroundColor: Colors.surface, borderRadius: 8, padding: 14, gap: 4 },
  notifText:  { fontSize: 13, fontFamily: Fonts.bodyMedium, color: Colors.cream, lineHeight: 18 },
  notifTime:  { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim },
});
