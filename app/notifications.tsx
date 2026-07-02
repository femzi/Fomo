import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useApp } from '../context/AppContext';
import type { NotificationPrefs } from '../context/AppContext';

const ROWS: { key: keyof NotificationPrefs; title: string; desc: string }[] = [
  { key: 'friendActivity',  title: 'Friend activity',   desc: "When a followed friend says they're going somewhere, or starts a chat." },
  { key: 'eventAlerts',     title: 'Event alerts',      desc: 'Last-minute deals, events near you, and reminders you set.' },
  { key: 'chatMessages',    title: 'Chat messages',     desc: 'New messages in your DMs and group chats.' },
  { key: 'promoterUpdates', title: 'Promoter updates',  desc: 'New listings and updates from hosts you follow.' },
];

export default function NotificationsScreen() {
  const router = useRouter();
  const { notificationPrefs, toggleNotificationPref } = useApp();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>NOTIFICATIONS</Text>
        <Text style={styles.intro}>These preferences are saved for when a push notification server is connected. They don't fire real notifications yet.</Text>
        <View style={styles.list}>
          {ROWS.map((row, i) => (
            <View key={row.key} style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{row.title}</Text>
                <Text style={styles.rowDesc}>{row.desc}</Text>
              </View>
              <Switch value={notificationPrefs[row.key]} onValueChange={() => toggleNotificationPref(row.key)} trackColor={{ false: Colors.surface2, true: Colors.red }} thumbColor="#fff" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  topBar:    { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backTxt:   { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  content:   { padding: 16, gap: 16 },
  title:     { fontSize: 26, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  intro:     { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 18 },
  list:      { backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden' },
  row:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  rowText:   { flex: 1, gap: 4 },
  rowTitle:  { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream },
  rowDesc:   { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 16 },
});
