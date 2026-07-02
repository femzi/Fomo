import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Modal, TextInput, Alert, Image,
  KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import { getStatusTier } from '../../utils/social';

const { width: SCREEN_W } = Dimensions.get('window');
const GRID_GAP = 6;
const COL_W = (SCREEN_W - 32 - GRID_GAP) / 2;

export default function ProfileScreen() {
  const router = useRouter();
  const {
    profile, people, hosts, events, myGoingEventIds, photos,
    userRole, myFomoScore, becomeAttendee, becomePromoter,
    logOut, resetAllData, addPhoto, removePhoto, privacyPrefs,
  } = useApp();

  const followingCount = people.filter(p => p.isFollowing).length + hosts.filter(h => h.isFollowing).length;
  const goingEvents = events.filter(e => myGoingEventIds.includes(e.id));
  const myPhotos = photos.filter(p => p.authorId === 'me');
  const myTier = getStatusTier(myFomoScore);

  const [venueModal, setVenueModal] = useState(false);
  const [venueName, setVenueName] = useState('');

  function handleRoleSwitch() {
    if (userRole === 'promoter') becomeAttendee();
    else setVenueModal(true);
  }

  function confirmPromoter() {
    if (!venueName.trim()) return;
    becomePromoter(venueName.trim());
    setVenueModal(false);
    setVenueName('');
  }

  async function pickAndAddPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      addPhoto(result.assets[0].uri);
    }
  }

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile header */}
        <View style={styles.profileHeader}>
          <View style={styles.av}>
            {profile.photoUri
              ? <Image source={{ uri: profile.photoUri }} style={styles.avImg} />
              : <Text style={styles.avTxt}>{profile.name.charAt(0).toUpperCase()}</Text>
            }
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.name.toUpperCase()}</Text>
            <Text style={styles.profileHandle}>@{profile.username}</Text>
            <Text style={styles.privacyLabel}>
              {privacyPrefs.publicProfile ? '🌐 PUBLIC' : '🔒 PRIVATE'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editTxt}>EDIT</Text>
          </TouchableOpacity>
        </View>

        {/* FOMO Status */}
        <View style={styles.statusBanner}>
          <Text style={styles.statusIcon}>{myTier.icon}</Text>
          <View>
            <Text style={styles.statusTitle}>{myTier.title}</Text>
            <Text style={styles.statusSub}>YOUR FOMO STATUS · {myFomoScore} pts</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { n: String(goingEvents.length), l: 'Going' },
            { n: String(followingCount), l: 'Following' },
            { n: String(myPhotos.length), l: 'Photos' },
          ].map((s, i) => (
            <React.Fragment key={s.l}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statBox}>
                <Text style={styles.statN}>{s.n}</Text>
                <Text style={styles.statL}>{s.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        {/* Role banner */}
        <View style={styles.roleBanner}>
          <Text style={styles.roleBannerTxt}>
            {userRole === 'promoter' ? '📋 EVENT OWNER MODE' : '🔥 ATTENDEE MODE'}
          </Text>
        </View>

        {/* Going To */}
        {goingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOU'RE GOING TO</Text>
            {goingEvents.map(event => (
              <TouchableOpacity key={event.id} style={styles.nextCard} onPress={() => router.push(`/event/${event.id}`)}>
                <View>
                  <Text style={styles.nextName}>{event.name}</Text>
                  <Text style={styles.nextSub}>{event.venue}</Text>
                </View>
                <Text style={styles.nextArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pinterest-style photo grid (attendee only) */}
        {userRole !== 'promoter' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>YOUR PHOTOS</Text>
              <TouchableOpacity onPress={pickAndAddPhoto}>
                <Text style={styles.addPhotoBtn}>+ ADD</Text>
              </TouchableOpacity>
            </View>
            {myPhotos.length === 0 && (
              <Text style={styles.emptyTxt}>No photos yet. Add some to your profile.</Text>
            )}
            <View style={styles.photoGrid}>
              {myPhotos.map(photo => (
                <TouchableOpacity
                  key={photo.id}
                  style={styles.photoCell}
                  onLongPress={() => Alert.alert('Remove photo?', '', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removePhoto(photo.id) },
                  ])}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photoImg} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={async () => {
              await AsyncStorage.removeItem('fomo_seen_intro_v1');
              Alert.alert('Onboarding reset', 'Restart the app to see the intro screens again.');
            }}
          >
            <Text style={styles.settingTxt}>How FOMO Works</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={handleRoleSwitch}>
            <Text style={[styles.settingTxt, { color: Colors.red, fontFamily: Fonts.bodyBold }]}>
              {userRole === 'promoter' ? 'Switch to Attendee Mode' : 'Switch to Event Owner Mode'}
            </Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/notifications')}>
            <Text style={styles.settingTxt}>Notifications</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/privacy')}>
            <Text style={styles.settingTxt}>Privacy</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/help')}>
            <Text style={styles.settingTxt}>Help</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/notification-center')}>
            <Text style={styles.settingTxt}>Notification Centre</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={() => Alert.alert('Reset all app data?', 'This clears everything saved on this device. Cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Reset', style: 'destructive', onPress: resetAllData }])}>
            <Text style={[styles.settingTxt, { color: Colors.red }]}>Reset App Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow} onPress={logOut}>
            <Text style={[styles.settingTxt, { color: Colors.red }]}>Log out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <Modal visible={venueModal} animationType="slide" transparent onRequestClose={() => setVenueModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>BECOME AN EVENT OWNER</Text>
            <TextInput style={styles.modalInput} value={venueName} onChangeText={setVenueName} placeholder="Your venue or brand name" placeholderTextColor={Colors.dim} autoFocus />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setVenueModal(false)}>
                <Text style={styles.cancelTxt}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, !venueName.trim() && styles.confirmBtnOff]} onPress={confirmPromoter} disabled={!venueName.trim()}>
                <Text style={styles.confirmTxt}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  profileHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  av:             { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: Colors.redDim },
  avImg:          { width: '100%', height: '100%' },
  avTxt:          { fontSize: 26, fontFamily: Fonts.display, color: '#fff' },
  profileInfo:    { flex: 1, gap: 2 },
  profileName:    { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.5 },
  profileHandle:  { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim },
  privacyLabel:   { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1, marginTop: 2 },
  editBtn:        { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  editTxt:        { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  statusBanner:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statusIcon:     { fontSize: 28 },
  statusTitle:    { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.5 },
  statusSub:      { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1.5, marginTop: 2 },
  statsRow:       { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  statBox:        { flex: 1, alignItems: 'center' },
  statN:          { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream },
  statL:          { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  statDivider:    { width: 1, backgroundColor: Colors.border },
  roleBanner:     { backgroundColor: Colors.surface2, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
  roleBannerTxt:  { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1.5 },
  section:        { padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 10 },
  sectionHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel:   { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim },
  addPhotoBtn:    { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  emptyTxt:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim },
  nextCard:       { backgroundColor: Colors.surface, borderRadius: 5, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 2, borderLeftColor: Colors.red },
  nextName:       { fontSize: 17, fontFamily: Fonts.display, color: Colors.cream },
  nextSub:        { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 3 },
  nextArrow:      { fontSize: 16, color: Colors.dim },
  photoGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  photoCell:      { width: COL_W, height: COL_W * 1.3, borderRadius: 6, overflow: 'hidden', backgroundColor: Colors.surface2 },
  photoImg:       { width: '100%', height: '100%' },
  settingRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  settingTxt:     { fontSize: 14, fontFamily: Fonts.bodyMedium, color: Colors.mid },
  settingArrow:   { fontSize: 18, color: Colors.dim },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  modalTitle:     { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  modalInput:     { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  modalActions:   { flexDirection: 'row', gap: 10 },
  cancelBtn:      { flex: 1, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  cancelTxt:      { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  confirmBtn:     { flex: 1, paddingVertical: 14, borderRadius: 5, backgroundColor: Colors.red, alignItems: 'center' },
  confirmBtnOff:  { backgroundColor: Colors.surface2 },
  confirmTxt:     { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
