import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, Modal, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { PARTY_TYPES } from '../../constants/Data';
import type { PartyType } from '../../constants/Data';
import { useApp } from '../../context/AppContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { userRole, myHostId, hosts, events, addEvent, simulateSale } = useApp();
  const myHost = hosts.find(h => h.id === myHostId);
  const myEvents = events.filter(e => e.hostId === myHostId);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [partyType, setPartyType] = useState<PartyType>('CLUB');
  const [time, setTime] = useState('');
  const [entry, setEntry] = useState('');
  const [dressCode, setDressCode] = useState('Smart Casual');
  const [ticketsTotal, setTicketsTotal] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  if (userRole !== 'promoter') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>EVENT OWNER TOOLS</Text>
          <Text style={styles.emptyTxt}>Switch to Event Owner mode from your profile to access the dashboard.</Text>
        </View>
      </SafeAreaView>
    );
  }

  async function captureLocation() {
    setCapturing(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location needed', 'Allow location access so your venue shows up at the right spot.');
        setCapturing(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch {
      Alert.alert('Could not get location', 'Try again.');
    }
    setCapturing(false);
  }

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setVideoName(result.assets[0].fileName ?? 'video-clip.mp4');
    }
  }

  function resetForm() {
    setName(''); setVenue(''); setPartyType('CLUB'); setTime(''); setEntry('');
    setDressCode('Smart Casual'); setTicketsTotal(''); setCoords(null); setVideoName(null);
  }

  function handlePost() {
    if (!name.trim() || !venue.trim() || !ticketsTotal.trim() || !coords) return;
    const id = addEvent({
      name: name.trim(),
      venue: venue.trim(),
      partyType,
      time: time.trim() || 'TBD',
      entry: entry.trim() || 'Free',
      dressCode: dressCode.trim() || 'Casual',
      ticketsTotal: parseInt(ticketsTotal, 10) || 100,
      latitude: coords.lat,
      longitude: coords.lng,
    });
    resetForm();
    setModalOpen(false);
    router.push(`/event/${id}`);
  }

  const canPost = name.trim() && venue.trim() && ticketsTotal.trim() && coords;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>DASHBOARD</Text>
            <Text style={styles.headerSub}>{myHost?.name ?? 'Your venue'}</Text>
          </View>
          <TouchableOpacity style={styles.postBtn} onPress={() => setModalOpen(true)}>
            <Text style={styles.postBtnTxt}>+ POST EVENT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>YOUR EVENTS</Text>
          {myEvents.length === 0 && (
            <Text style={styles.emptyTxt}>You haven't posted any events yet. Tap "+ Post Event" to get started.</Text>
          )}
          {myEvents.map(e => {
            const pct = Math.round((e.ticketsSold / e.ticketsTotal) * 100);
            return (
              <View key={e.id} style={styles.eventCard}>
                <TouchableOpacity onPress={() => router.push(`/event/${e.id}`)}>
                  <Text style={styles.eventName}>{e.name}</Text>
                  <Text style={styles.eventSub}>{e.venue} · {e.time} · {e.partyType}</Text>
                </TouchableOpacity>
                <View style={styles.salesRow}>
                  <View style={styles.salesTrack}>
                    <View style={[styles.salesFill, { width: `${pct}%` }]} />
                  </View>
                  <Text style={styles.salesTxt}>{e.ticketsSold}/{e.ticketsTotal}</Text>
                </View>
                <TouchableOpacity style={styles.simulateBtn} onPress={() => simulateSale(e.id)}>
                  <Text style={styles.simulateTxt}>🎟️ SIMULATE A SALE</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          <Text style={styles.disclaimer}>
            Ticket sales here are simulated for testing. Real payments connect once Paystack checkout is live.
          </Text>
        </View>

      </ScrollView>

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard} contentContainerStyle={{ paddingBottom: 24 }}>
            <Text style={styles.modalTitle}>POST NEW EVENT</Text>

            <Text style={styles.fieldLabel}>EVENT NAME</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g. Saturday Heatwave" placeholderTextColor={Colors.dim} />

            <Text style={styles.fieldLabel}>VENUE</Text>
            <TextInput style={styles.input} value={venue} onChangeText={setVenue} placeholder="e.g. Muse Events Space" placeholderTextColor={Colors.dim} />

            <Text style={styles.fieldLabel}>PARTY TYPE</Text>
            <View style={styles.pillRow}>
              {PARTY_TYPES.map(pt => (
                <TouchableOpacity
                  key={pt}
                  style={[styles.pill, partyType === pt && styles.pillOn]}
                  onPress={() => setPartyType(pt)}
                >
                  <Text style={[styles.pillTxt, partyType === pt && styles.pillTxtOn]}>{pt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>TIME</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="e.g. 10PM" placeholderTextColor={Colors.dim} />

            <Text style={styles.fieldLabel}>ENTRY PRICE</Text>
            <TextInput style={styles.input} value={entry} onChangeText={setEntry} placeholder="e.g. ₦5,000 or Free" placeholderTextColor={Colors.dim} />

            <Text style={styles.fieldLabel}>DRESS CODE</Text>
            <TextInput style={styles.input} value={dressCode} onChangeText={setDressCode} placeholder="e.g. Smart Casual" placeholderTextColor={Colors.dim} />

            <Text style={styles.fieldLabel}>TOTAL TICKETS AVAILABLE</Text>
            <TextInput style={styles.input} value={ticketsTotal} onChangeText={setTicketsTotal} placeholder="e.g. 200" placeholderTextColor={Colors.dim} keyboardType="numeric" />

            <Text style={styles.fieldLabel}>LOCATION</Text>
            <TouchableOpacity style={styles.locBtn} onPress={captureLocation} disabled={capturing}>
              <Text style={styles.locBtnTxt}>
                {coords ? '📍 LOCATION CAPTURED' : capturing ? 'GETTING LOCATION...' : '📍 USE MY CURRENT LOCATION'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.fieldLabel}>PROMO VIDEO</Text>
            <TouchableOpacity style={styles.locBtn} onPress={pickVideo}>
              <Text style={styles.locBtnTxt}>{videoName ? `🎥 ${videoName}` : '🎥 ATTACH A VIDEO'}</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setModalOpen(false); resetForm(); }}>
                <Text style={styles.modalCancelTxt}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreate, !canPost && styles.modalCreateOff]}
                onPress={handlePost}
                disabled={!canPost}
              >
                <Text style={styles.modalCreateTxt}>POST EVENT</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  scroll:         { flex: 1 },
  emptyState:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTitle:     { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, marginBottom: 10 },
  emptyTxt:       { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', lineHeight: 18 },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:    { fontSize: 28, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  headerSub:      { fontSize: 10, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1, marginTop: 2 },
  postBtn:        { backgroundColor: Colors.red, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 4 },
  postBtnTxt:     { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
  section:        { padding: 16, gap: 12 },
  sectionLabel:   { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim },
  eventCard:      { backgroundColor: Colors.surface, borderRadius: 6, padding: 14, gap: 10 },
  eventName:      { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.5 },
  eventSub:       { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  salesRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  salesTrack:     { flex: 1, height: 6, backgroundColor: Colors.surface2, borderRadius: 3, overflow: 'hidden' },
  salesFill:      { height: '100%', backgroundColor: Colors.red },
  salesTxt:       { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.cream, width: 60, textAlign: 'right' },
  simulateBtn:    { borderWidth: 1, borderColor: Colors.border2, borderRadius: 4, paddingVertical: 9, alignItems: 'center' },
  simulateTxt:    { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  disclaimer:     { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 15, marginTop: 4 },

  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '88%' },
  modalTitle:     { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, marginBottom: 16 },
  fieldLabel:     { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim, marginBottom: 6, marginTop: 12 },
  input:          { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  pillRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill:           { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  pillOn:         { backgroundColor: Colors.red, borderColor: Colors.red },
  pillTxt:        { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.mid },
  pillTxtOn:      { color: '#fff' },
  locBtn:         { borderWidth: 1, borderColor: Colors.border2, borderRadius: 6, paddingVertical: 13, alignItems: 'center' },
  locBtnTxt:      { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 0.5 },
  modalActions:   { flexDirection: 'row', gap: 10, marginTop: 20 },
  modalCancel:    { flex: 1, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  modalCancelTxt: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  modalCreate:    { flex: 1, paddingVertical: 14, borderRadius: 5, backgroundColor: Colors.red, alignItems: 'center' },
  modalCreateOff: { backgroundColor: Colors.surface2 },
  modalCreateTxt: { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
