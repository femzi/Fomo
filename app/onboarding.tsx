import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';
import { useApp } from '../context/AppContext';

export default function OnboardingScreen() {
  const router = useRouter();
  const { becomeAttendee, becomePromoter } = useApp();
  const [showVenueInput, setShowVenueInput] = useState(false);
  const [venueName, setVenueName] = useState('');

  function chooseAttendee() {
    becomeAttendee();
    router.replace('/(tabs)');
  }

  function confirmPromoter() {
    if (!venueName.trim()) return;
    becomePromoter(venueName.trim());
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>

          <View style={styles.top}>
            <Text style={styles.logo}>FOMO</Text>
            <Text style={styles.tagline}>THE NIGHT DOESN'T WAIT.</Text>
          </View>

          {!showVenueInput ? (
            <View style={styles.choices}>
              <Text style={styles.question}>WHAT BRINGS YOU HERE?</Text>

              <TouchableOpacity style={styles.card} onPress={chooseAttendee} activeOpacity={0.85}>
                <Text style={styles.cardIcon}>🔥</Text>
                <Text style={styles.cardTitle}>I'M GOING OUT</Text>
                <Text style={styles.cardSub}>Find tonight's parties, see what's popping, link up with friends</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.card} onPress={() => setShowVenueInput(true)} activeOpacity={0.85}>
                <Text style={styles.cardIcon}>📋</Text>
                <Text style={styles.cardTitle}>I'M AN EVENT OWNER</Text>
                <Text style={styles.cardSub}>Post your events, sell tickets, track your crowd live</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.choices}>
              <Text style={styles.question}>WHAT'S YOUR VENUE OR BRAND CALLED?</Text>
              <TextInput
                style={styles.input}
                value={venueName}
                onChangeText={setVenueName}
                placeholder="e.g. FOMO Events"
                placeholderTextColor={Colors.dim}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.confirmBtn, !venueName.trim() && styles.confirmBtnOff]}
                onPress={confirmPromoter}
                disabled={!venueName.trim()}
              >
                <Text style={styles.confirmTxt}>CONTINUE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.backLink} onPress={() => setShowVenueInput(false)}>
                <Text style={styles.backLinkTxt}>← back</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  content:        { flex: 1, justifyContent: 'space-between', padding: 24, paddingTop: 60, paddingBottom: 40 },
  top:            { alignItems: 'center' },
  logo:           { fontSize: 54, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 4 },
  tagline:        { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 2, marginTop: 6 },
  choices:        { gap: 14 },
  question:       { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 2, textAlign: 'center', marginBottom: 6 },
  card:           { backgroundColor: Colors.surface, borderRadius: 10, padding: 22, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  cardIcon:       { fontSize: 26, marginBottom: 4 },
  cardTitle:      { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  cardSub:        { fontSize: 12, fontFamily: Fonts.body, color: Colors.mid, lineHeight: 17 },
  input:          { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 6, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: Fonts.body, color: Colors.cream },
  confirmBtn:     { backgroundColor: Colors.red, borderRadius: 5, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  confirmBtnOff:  { backgroundColor: Colors.surface2 },
  confirmTxt:     { fontSize: 14, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 2 },
  backLink:       { alignItems: 'center', marginTop: 8 },
  backLinkTxt:    { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim },
});
