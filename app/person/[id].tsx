import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Image, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import { getMutualFriends, getStatusTier } from '../../utils/social';
import RateVibeModal from '../../components/RateVibeModal';

const COL_W = (Dimensions.get('window').width - 40) / 2;

export default function PersonProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { people, photos, startDM, ratePerson, privacyPrefs } = useApp();
  const [rateModal, setRateModal] = useState(false);
  const person = people.find(p => p.id === id);

  if (!person) return <SafeAreaView style={styles.safe}><Text style={{ color: Colors.cream, padding: 20 }}>Person not found.</Text></SafeAreaView>;

  const mutuals = getMutualFriends(person, people);
  const tier = getStatusTier(person.fomoScore);
  const theirPhotos = photos.filter(p => p.authorId === person.id);
  const canSeePhotos = privacyPrefs.publicProfile;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
        </View>
        <View style={styles.header}>
          <View style={[styles.av, { backgroundColor: person.color }]}><Text style={styles.avTxt}>{person.initial}</Text></View>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.username}>@{person.username}</Text>
          <View style={styles.statusCard}>
            <Text style={styles.statusIcon}>{tier.icon}</Text>
            <Text style={styles.statusTitle}>{tier.title}</Text>
            <Text style={styles.statusSub}>FOMO STATUS</Text>
          </View>
          {mutuals.length > 0 && <Text style={styles.mutualTxt}>👥 {mutuals.length} mutual friend{mutuals.length > 1 ? 's' : ''}</Text>}
          <View style={styles.actionRow}>
            {person.isFollowing && (
              <TouchableOpacity style={styles.actionBtn} onPress={() => { const cid = startDM(person.id); router.push(`/chat/${cid}`); }}>
                <Text style={styles.actionTxt}>💬 MESSAGE</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.actionBtn, styles.actionOutline]} onPress={() => setRateModal(true)}>
              <Text style={[styles.actionTxt, styles.actionOutlineTxt]}>⭐ RATE VIBE</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.gridSection}>
          <Text style={styles.gridLabel}>PHOTOS</Text>
          {!canSeePhotos ? <Text style={styles.emptyTxt}>🔒 This profile is private.</Text>
           : theirPhotos.length === 0 ? <Text style={styles.emptyTxt}>No photos yet.</Text>
           : <View style={styles.grid}>{theirPhotos.map(p => <Image key={p.id} source={{ uri: p.uri }} style={styles.gridImg} />)}</View>}
        </View>
      </ScrollView>
      <RateVibeModal visible={rateModal} personName={person.name} onClose={() => setRateModal(false)} onRate={delta => ratePerson(person.id, delta)} />
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  topBar:       { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backTxt:      { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  header:       { alignItems: 'center', padding: 20, gap: 6, borderBottomWidth: 1, borderBottomColor: Colors.border },
  av:           { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  avTxt:        { fontSize: 30, fontFamily: Fonts.display, color: '#fff' },
  name:         { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.5 },
  username:     { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim },
  statusCard:   { alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30, marginTop: 14 },
  statusIcon:   { fontSize: 30 },
  statusTitle:  { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, marginTop: 4 },
  statusSub:    { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 2, marginTop: 2 },
  mutualTxt:    { fontSize: 11, fontFamily: Fonts.bodyMedium, color: Colors.mid, marginTop: 10 },
  actionRow:    { flexDirection: 'row', gap: 10, marginTop: 16, width: '100%' },
  actionBtn:    { flex: 1, backgroundColor: Colors.red, paddingVertical: 13, borderRadius: 6, alignItems: 'center' },
  actionOutline:{ backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border2 },
  actionTxt:    { fontSize: 11, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 0.5 },
  actionOutlineTxt: { color: Colors.mid },
  gridSection:  { padding: 16 },
  gridLabel:    { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim, marginBottom: 10 },
  emptyTxt:     { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridImg:      { width: COL_W, height: COL_W * 1.3, borderRadius: 6, backgroundColor: Colors.surface2 },
});
