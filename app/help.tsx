import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const FAQS = [
  { q: 'What is the FOMO Score?', a: 'Events have a live score (0–100) that drifts as tickets sell and crowd levels change. People have a status tier earned by getting rated by others you meet out.' },
  { q: 'What are the status tiers?', a: 'Everyone starts as a NEWCOMER 🌱. As people rate your vibe, you move up through REGULAR → KNOWN FACE → VIBE SETTER → FOMO ICON 👑.' },
  { q: 'How do I buy a ticket?', a: "Open an event and tap Buy Ticket. You'll pay through Paystack. The app is running in test mode, so no real money moves yet." },
  { q: 'How do I become an event owner?', a: 'Go to your Profile and tap "Switch to Event Owner Mode." A Dashboard tab will appear where you can post events.' },
  { q: 'Why does the app reset when I reload?', a: "FOMO saves everything locally. If you're on web, reloading or clearing browser storage starts fresh. On native, it persists between opens." },
  { q: "What's the 🚨 button in group chats?", a: 'It sends a 10-second "In or Out" prompt to everyone in the chat. After 10 seconds it collapses to a tally of who said yes.' },
  { q: 'Can attendees post clips?', a: "No — clips are posted by event owners from the Clips tab. Attendees can post photos to their own profile from the Me tab, which shows as a Pinterest-style grid." },
];

export default function HelpScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>HELP</Text>
        <Text style={styles.intro}>Common questions while using FOMO.</Text>
        <View style={styles.list}>
          {FAQS.map((item, i) => (
            <View key={item.q} style={[styles.faqRow, i < FAQS.length - 1 && styles.rowBorder]}>
              <Text style={styles.q}>{item.q}</Text>
              <Text style={styles.a}>{item.a}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.sectionTitle}>STILL STUCK?</Text>
        <Text style={styles.para}>No live support inbox yet — this is a placeholder for when FOMO has a real backend and team behind it.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  topBar:       { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backTxt:      { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  content:      { padding: 16, gap: 16, paddingBottom: 40 },
  title:        { fontSize: 26, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  intro:        { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 18 },
  list:         { backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden' },
  faqRow:       { padding: 16, gap: 6 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  q:            { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream },
  a:            { fontSize: 12, fontFamily: Fonts.body, color: Colors.mid, lineHeight: 18 },
  sectionTitle: { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim, marginTop: 4 },
  para:         { fontSize: 12, fontFamily: Fonts.body, color: Colors.mid, lineHeight: 19 },
});
