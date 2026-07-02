import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useApp } from '../context/AppContext';

export default function PrivacyScreen() {
  const router = useRouter();
  const { privacyPrefs, togglePrivacyPref } = useApp();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>PRIVACY</Text>
        <View style={styles.list}>
          <View style={[styles.row, styles.rowBorder]}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Share location with friends</Text>
              <Text style={styles.rowDesc}>Lets followed friends see roughly where you are on the Map tab.</Text>
            </View>
            <Switch value={privacyPrefs.shareLocationWithFriends} onValueChange={() => togglePrivacyPref('shareLocationWithFriends')} trackColor={{ false: Colors.surface2, true: Colors.red }} thumbColor="#fff" />
          </View>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>Public profile</Text>
              <Text style={styles.rowDesc}>Anyone can find your profile and see your photos. Turn off to make them private.</Text>
            </View>
            <Switch value={privacyPrefs.publicProfile} onValueChange={() => togglePrivacyPref('publicProfile')} trackColor={{ false: Colors.surface2, true: Colors.red }} thumbColor="#fff" />
          </View>
        </View>
        <Text style={styles.sectionTitle}>WHAT WE COLLECT</Text>
        <Text style={styles.para}>FOMO uses your location to show event distances and place you on the Map. Profile info (name, username, birthday, contact) identifies you to others and enforces the 18+ requirement. Payments go through Paystack directly — FOMO doesn't store card details.</Text>
        <Text style={styles.sectionTitle}>WHERE THIS DATA LIVES</Text>
        <Text style={styles.para}>Everything is stored only on this device right now. No server exists yet, so no one else can see your data. It also isn't backed up — clearing device storage or using Reset App Data will erase it permanently.</Text>
        <Text style={styles.disclaimer}>This is a working draft for an app still in development. Before any public launch, review against Nigeria's Data Protection Act (NDPA).</Text>
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
  list:         { backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden' },
  row:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, gap: 12 },
  rowBorder:    { borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  rowText:      { flex: 1, gap: 4 },
  rowTitle:     { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream },
  rowDesc:      { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 16 },
  sectionTitle: { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim, marginTop: 4 },
  para:         { fontSize: 12, fontFamily: Fonts.body, color: Colors.mid, lineHeight: 19 },
  disclaimer:   { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 15, fontStyle: 'italic' },
});
