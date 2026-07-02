import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import { getDistanceKm, formatDistance } from '../../utils/distance';
import { getEventIntensity, getStatusTier } from '../../utils/social';

const REMINDER_OPTIONS = [
  { label: '15 MIN', ms: 15 * 60 * 1000 },
  { label: '30 MIN', ms: 30 * 60 * 1000 },
  { label: '1 HR',   ms: 60 * 60 * 1000 },
  { label: '2 HR',   ms: 2 * 60 * 60 * 1000 },
];

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, hosts, toggleHostFollow, people, myGoingEventIds, toggleGoing, conversations, shareEventToConversation, setEventTimer } = useApp();
  const event = events.find(e => e.id === id);
  const [liveDistance, setLiveDistance] = useState<string | null>(null);
  const [shareModal, setShareModal] = useState(false);
  const [reminderModal, setReminderModal] = useState(false);
  const [customMins, setCustomMins] = useState('');

  useEffect(() => {
    if (!event?.latitude) return;
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        setLiveDistance(formatDistance(getDistanceKm(pos.coords.latitude, pos.coords.longitude, event.latitude!, event.longitude!)));
      } catch {}
    })();
  }, [event?.id]);

  if (!event) return <SafeAreaView style={styles.safe}><Text style={{ color: Colors.cream, padding: 20 }}>Event not found.</Text></SafeAreaView>;

  const host = hosts.find(h => h.id === event.hostId);
  const goingFriends = people.filter(p => event.friendsGoingIds.includes(p.id));
  const iAmGoing = myGoingEventIds.includes(event.id);
  const soldOut = event.ticketsSold >= event.ticketsTotal;
  const hasLocation = event.latitude !== undefined;
  const intensity = getEventIntensity(event.score);
  const intensityColor = intensity.color === 'red' ? Colors.red : intensity.color === 'mid' ? Colors.mid : Colors.dim;

  const details = [
    { label: 'TYPE',       value: event.partyType },
    { label: 'TIME',       value: event.time },
    { label: 'ENTRY',      value: event.entry },
    { label: 'AVG SPEND',  value: event.avgSpend },
    { label: 'DRESS CODE', value: event.dressCode },
    { label: 'DISTANCE',   value: hasLocation ? (liveDistance ?? event.distance) : 'Location not set yet' },
  ];

  function handleSetReminder(ms: number) {
    setEventTimer(event!.id, ms);
    setReminderModal(false);
    Alert.alert('⏰ Reminder set', 'Keep FOMO open — the alarm only fires while the app is running in the foreground.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
          <View style={styles.topRight}>
            {event.isHot && <View style={styles.hotBadge}><Text style={styles.hotTxt}>🔥 HOT</Text></View>}
            <TouchableOpacity style={styles.shareBtn} onPress={() => setShareModal(true)}>
              <Text style={styles.shareBtnTxt}>📤 SHARE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Score + Intensity header */}
        <View style={styles.scoreHeader}>
          <Text style={styles.bigScore}>{event.score}</Text>
          <View style={styles.scoreRight}>
            <Text style={[styles.intensityLabel, { color: intensityColor }]}>{intensity.label}</Text>
            <Text style={styles.scoreSub}>FOMO SCORE · LIVE</Text>
            {event.scoreHistory.length > 1 && (
              <Text style={styles.scoreHistory}>
                {event.scoreHistory.slice(-8).map(s => s > event.score ? '▲' : '▼').join(' ')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.venueTxt}>{event.venue} · Abuja</Text>

          {/* Host card */}
          {host && (
            <View style={styles.hostCard}>
              <View style={styles.hostLeft}>
                <View style={[styles.hostAv, { backgroundColor: host.color }]}><Text style={styles.hostAvTxt}>{host.initial}</Text></View>
                <View>
                  <Text style={styles.hostLabel}>HOSTED BY</Text>
                  <Text style={styles.hostName}>{host.name}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.followBtn, host.isFollowing && styles.followBtnOn]} onPress={() => toggleHostFollow(host.id)}>
                <Text style={[styles.followTxt, host.isFollowing && styles.followTxtOn]}>{host.isFollowing ? 'FOLLOWING' : 'FOLLOW'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Friends going */}
          {goingFriends.length > 0 && (
            <TouchableOpacity style={styles.friendsCard} onPress={() => event.conversationId ? router.push(`/chat/${event.conversationId}`) : Alert.alert('No group chat yet', 'Start one from the Chats tab.')}>
              <View style={styles.avStack}>
                {goingFriends.slice(0, 4).map((f, i) => (
                  <View key={f.id} style={[styles.stackAv, { backgroundColor: f.color, marginLeft: i === 0 ? 0 : -8 }]}>
                    <Text style={styles.stackAvTxt}>{f.initial}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.friendsTxt}>{goingFriends.length} friend{goingFriends.length > 1 ? 's' : ''} going · tap to chat</Text>
            </TouchableOpacity>
          )}

          {/* Detail rows */}
          <View style={styles.detailBox}>
            {details.map((row, i) => (
              <View key={row.label} style={[styles.detailRow, i < details.length - 1 && styles.detailRowBorder]}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Buy ticket */}
          <TouchableOpacity style={[styles.buyBtn, soldOut && styles.buyBtnOff]} onPress={() => !soldOut && router.push(`/checkout/${event.id}`)} disabled={soldOut}>
            <Text style={styles.buyTxt}>{soldOut ? 'SOLD OUT' : 'BUY TICKET'}</Text>
          </TouchableOpacity>

          {/* I'm Going + Remind Me */}
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={[styles.cta, styles.ctaHalf, iAmGoing && styles.ctaGoing]}
              onPress={() => { toggleGoing(event.id); if (!iAmGoing) Alert.alert('🔥 Added!', `Your squad can see you're going to ${event.name}`); }}
            >
              <Text style={styles.ctaTxt}>{iAmGoing ? '✓ GOING' : "I'M GOING"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cta, styles.ctaHalf, styles.ctaOutline]} onPress={() => setReminderModal(true)}>
              <Text style={[styles.ctaTxt, styles.ctaOutlineTxt]}>⏰ REMIND ME</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Share modal */}
      <Modal visible={shareModal} animationType="slide" transparent onRequestClose={() => setShareModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SHARE EVENT</Text>
            <Text style={styles.modalSub}>Send to a friend or group chat.</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {conversations.map(c => (
                <TouchableOpacity key={c.id} style={styles.shareRow} onPress={() => { shareEventToConversation(c.id, event.id); setShareModal(false); router.push(`/chat/${c.id}`); }}>
                  <View style={[styles.shareAv, { backgroundColor: c.avatarColor }]}><Text style={styles.shareAvTxt}>{c.avatarInitial}</Text></View>
                  <Text style={styles.shareName}>{c.name}</Text>
                  {c.type === 'group' && <Text style={styles.shareTag}>GROUP</Text>}
                </TouchableOpacity>
              ))}
              {conversations.length === 0 && <Text style={styles.emptyTxt}>Start a chat first from the Chats tab.</Text>}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShareModal(false)}>
              <Text style={styles.modalCloseTxt}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Reminder modal */}
      <Modal visible={reminderModal} animationType="slide" transparent onRequestClose={() => setReminderModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>SET A REMINDER</Text>
            <Text style={styles.modalSub}>Fires while FOMO is open in the foreground.</Text>
            <View style={styles.reminderGrid}>
              {REMINDER_OPTIONS.map(opt => (
                <TouchableOpacity key={opt.label} style={styles.reminderPill} onPress={() => handleSetReminder(opt.ms)}>
                  <Text style={styles.reminderPillTxt}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                value={customMins}
                onChangeText={setCustomMins}
                placeholder="Custom (mins)"
                placeholderTextColor={Colors.dim}
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity
                style={[styles.customBtn, !customMins.trim() && styles.customBtnOff]}
                disabled={!customMins.trim() || parseInt(customMins, 10) < 1}
                onPress={() => {
                  const mins = parseInt(customMins, 10);
                  if (mins > 0) { handleSetReminder(mins * 60 * 1000); setCustomMins(''); }
                }}
              >
                <Text style={styles.customBtnTxt}>SET</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setReminderModal(false)}>
              <Text style={styles.modalCloseTxt}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  topBar:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backTxt:        { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  topRight:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hotBadge:       { backgroundColor: Colors.redDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 3, borderWidth: 1, borderColor: Colors.redDim },
  hotTxt:         { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red },
  shareBtn:       { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  shareBtnTxt:    { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.mid },
  scoreHeader:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  bigScore:       { fontSize: 72, fontFamily: Fonts.display, color: Colors.red, lineHeight: 72 },
  scoreRight:     { flex: 1, gap: 3 },
  intensityLabel: { fontSize: 15, fontFamily: Fonts.display, letterSpacing: 1 },
  scoreSub:       { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 2 },
  scoreHistory:   { fontSize: 12, color: Colors.dim, marginTop: 4 },
  content:        { padding: 16, gap: 14 },
  eventName:      { fontSize: 32, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  venueTxt:       { fontSize: 11, fontFamily: Fonts.bodyMedium, color: Colors.dim, letterSpacing: 1, marginTop: 2 },
  hostCard:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 6, padding: 12 },
  hostLeft:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostAv:         { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  hostAvTxt:      { fontSize: 15, fontFamily: Fonts.display, color: '#fff' },
  hostLabel:      { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1.5 },
  hostName:       { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream, marginTop: 2 },
  followBtn:      { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 3 },
  followBtnOn:    { borderColor: Colors.border2 },
  followTxt:      { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  followTxtOn:    { color: Colors.dim },
  friendsCard:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surface, borderRadius: 6, padding: 12 },
  avStack:        { flexDirection: 'row' },
  stackAv:        { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surface },
  stackAvTxt:     { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff' },
  friendsTxt:     { fontSize: 11, fontFamily: Fonts.bodyMedium, color: Colors.mid, flex: 1 },
  detailBox:      { backgroundColor: Colors.surface, borderRadius: 6, overflow: 'hidden' },
  detailRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  detailRowBorder:{ borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  detailLabel:    { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim },
  detailValue:    { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.cream },
  buyBtn:         { backgroundColor: Colors.cream, borderRadius: 5, padding: 16, alignItems: 'center' },
  buyBtnOff:      { backgroundColor: Colors.surface2 },
  buyTxt:         { fontSize: 15, fontFamily: Fonts.display, color: Colors.bg, letterSpacing: 2 },
  ctaRow:         { flexDirection: 'row', gap: 10 },
  cta:            { backgroundColor: Colors.red, borderRadius: 5, padding: 18, alignItems: 'center' },
  ctaHalf:        { flex: 1 },
  ctaGoing:       { backgroundColor: Colors.green },
  ctaOutline:     { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.border2 },
  ctaTxt:         { fontSize: 14, fontFamily: Fonts.display, color: '#fff', letterSpacing: 1.5 },
  ctaOutlineTxt:  { color: Colors.mid },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 10 },
  modalTitle:     { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  modalSub:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 16 },
  shareRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  shareAv:        { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  shareAvTxt:     { fontSize: 13, fontFamily: Fonts.display, color: '#fff' },
  shareName:      { fontSize: 13, fontFamily: Fonts.bodyMedium, color: Colors.cream, flex: 1 },
  shareTag:       { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2 },
  emptyTxt:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, paddingVertical: 10 },
  modalCloseBtn:  { paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center', marginTop: 6 },
  modalCloseTxt:  { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  reminderGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reminderPill:   { flexGrow: 1, backgroundColor: Colors.surface2, borderRadius: 6, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  reminderPillTxt:{ fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream, letterSpacing: 1 },
  customRow:      { flexDirection: 'row', gap: 8, marginTop: 4 },
  customInput:    { flex: 1, backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: Fonts.body, color: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  customBtn:      { backgroundColor: Colors.red, borderRadius: 6, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  customBtnOff:   { backgroundColor: Colors.surface2 },
  customBtnTxt:   { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
