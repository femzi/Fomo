import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { people, hosts, events, userRole, becomeAttendee, becomePromoter } = useApp();
  const followingCount = people.filter(p => p.isFollowing).length + hosts.filter(h => h.isFollowing).length;

  const upcomingEvent = events[0];
  const pastEvents = events.slice(1, 4);

  const [venueModal, setVenueModal] = useState(false);
  const [venueName, setVenueName] = useState('');

  function handleRoleSwitch() {
    if (userRole === 'promoter') {
      becomeAttendee();
    } else {
      setVenueModal(true);
    }
  }

  function confirmPromoter() {
    if (!venueName.trim()) return;
    becomePromoter(venueName.trim());
    setVenueModal(false);
    setVenueName('');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.profileHeader}>
          <View style={styles.av}>
            <Text style={styles.avTxt}>O</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>OLUWAFEMI A.</Text>
            <Text style={styles.profileHandle}>@femi · Abuja</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editTxt}>EDIT</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roleBanner}>
          <Text style={styles.roleBannerTxt}>
            {userRole === 'promoter' ? '📋 EVENT OWNER MODE' : '🔥 ATTENDEE MODE'}
          </Text>
        </View>

        <View style={styles.statsRow}>
          {[{ n: String(events.length), l: 'Events' }, { n: String(followingCount), l: 'Following' }, { n: '8', l: 'Reviews' }].map((s, i) => (
            <React.Fragment key={s.l}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statBox}>
                <Text style={styles.statN}>{s.n}</Text>
                <Text style={styles.statL}>{s.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {upcomingEvent && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NEXT UP</Text>
            <TouchableOpacity style={styles.nextCard} onPress={() => router.push(`/event/${upcomingEvent.id}`)}>
              <View>
                <Text style={styles.nextName}>{upcomingEvent.name}</Text>
                <Text style={styles.nextSub}>{upcomingEvent.venue}</Text>
              </View>
              <View style={styles.goingBadge}><Text style={styles.goingTxt}>VIEW →</Text></View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RECENT EVENTS</Text>
          {pastEvents.map(event => (
            <View key={event.id} style={styles.pastRow}>
              <View>
                <Text style={styles.pastName}>{event.name}</Text>
                <Text style={styles.pastSub}>{event.venue}</Text>
              </View>
              <View style={styles.pastScore}>
                <Text style={styles.pastScoreTxt}>{event.score}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.settingRow} onPress={handleRoleSwitch}>
            <Text style={[styles.settingTxt, { color: Colors.red, fontFamily: Fonts.bodyBold }]}>
              {userRole === 'promoter' ? 'Switch to Attendee Mode' : 'Switch to Event Owner Mode'}
            </Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          {['Notifications', 'Music preferences', 'Privacy', 'Help', 'Log out'].map(item => (
            <TouchableOpacity key={item} style={styles.settingRow}>
              <Text style={[styles.settingTxt, item === 'Log out' && { color: Colors.red }]}>{item}</Text>
              <Text style={styles.settingArrow}>{item !== 'Log out' ? '›' : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      <Modal visible={venueModal} animationType="slide" transparent onRequestClose={() => setVenueModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>BECOME AN EVENT OWNER</Text>
            <Text style={styles.modalSub}>What's your venue or brand called?</Text>
            <TextInput
              style={styles.modalInput}
              value={venueName}
              onChangeText={setVenueName}
              placeholder="e.g. FOMO Events"
              placeholderTextColor={Colors.dim}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setVenueModal(false)}>
                <Text style={styles.modalCancelTxt}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, !venueName.trim() && styles.modalConfirmOff]}
                onPress={confirmPromoter}
                disabled={!venueName.trim()}
              >
                <Text style={styles.modalConfirmTxt}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scroll:        { flex: 1 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  av:            { width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.redDim },
  avTxt:         { fontSize: 24, fontFamily: Fonts.display, color: '#fff' },
  profileInfo:   { flex: 1 },
  profileName:   { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.5 },
  profileHandle: { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 3 },
  editBtn:       { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  editTxt:       { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  roleBanner:    { backgroundColor: Colors.surface, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
  roleBannerTxt: { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1.5 },
  statsRow:      { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statBox:       { flex: 1, alignItems: 'center' },
  statN:         { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream },
  statL:         { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 3 },
  statDivider:   { width: 1, backgroundColor: Colors.border },
  section:       { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 8 },
  sectionLabel:  { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim, marginBottom: 4 },
  nextCard:      { backgroundColor: Colors.surface, borderRadius: 5, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 2, borderLeftColor: Colors.red },
  nextName:      { fontSize: 17, fontFamily: Fonts.display, color: Colors.cream },
  nextSub:       { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 3 },
  goingBadge:    { backgroundColor: Colors.redDim, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  goingTxt:      { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  pastRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  pastName:      { fontSize: 15, fontFamily: Fonts.display, color: Colors.cream },
  pastSub:       { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  pastScore:     { backgroundColor: Colors.surface, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4 },
  pastScoreTxt:  { fontSize: 15, fontFamily: Fonts.display, color: Colors.mid },
  settingRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  settingTxt:    { fontSize: 14, fontFamily: Fonts.bodyMedium, color: Colors.mid },
  settingArrow:  { fontSize: 18, color: Colors.dim },

  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:       { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle:      { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, marginBottom: 6 },
  modalSub:        { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, marginBottom: 14 },
  modalInput:      { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  modalActions:    { flexDirection: 'row', gap: 10 },
  modalCancel:     { flex: 1, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  modalCancelTxt:  { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  modalConfirm:    { flex: 1, paddingVertical: 14, borderRadius: 5, backgroundColor: Colors.red, alignItems: 'center' },
  modalConfirmOff: { backgroundColor: Colors.surface2 },
  modalConfirmTxt: { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
