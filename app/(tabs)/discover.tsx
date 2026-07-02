import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, FlatList, KeyboardAvoidingView,
  Platform, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

export default function DiscoverScreen() {
  const { clips, events, toggleLikeClip, addClip, userRole, hosts, myHostId } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [postModal, setPostModal] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined);

  const isPromoter = userRole === 'promoter';
  const myEvents = events.filter(e => e.hostId === myHostId);

  async function pickVideo() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setVideoUri(result.assets[0].uri);
    }
  }

  function handlePost() {
    if (!videoUri) return;
    addClip(videoUri, caption, selectedEventId);
    setPostModal(false);
    setVideoUri(null);
    setCaption('');
    setSelectedEventId(undefined);
  }

  function resetModal() {
    setPostModal(false);
    setVideoUri(null);
    setCaption('');
    setSelectedEventId(undefined);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CLIPS</Text>
        {isPromoter && (
          <TouchableOpacity style={styles.postBtn} onPress={() => setPostModal(true)}>
            <Text style={styles.postBtnTxt}>+ POST</Text>
          </TouchableOpacity>
        )}
      </View>

      {clips.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>NO CLIPS YET</Text>
          <Text style={styles.emptyTxt}>
            {isPromoter
              ? 'Post your first clip to show what\'s happening at your event.'
              : 'Clips posted by event owners will appear here.'}
          </Text>
          {!isPromoter && (
            <Text style={styles.emptyNote}>
              As an attendee, you can view and like clips, and post photos to your own profile from the Me tab.
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={clips}
          keyExtractor={c => c.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
          }}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item: clip, index }) => {
            const host = hosts.find(h => h.id === clip.hostId);
            const event = events.find(e => e.id === clip.eventId);
            return (
              <View style={styles.clipWrap}>
                <Video
                  source={{ uri: clip.videoUri }}
                  style={StyleSheet.absoluteFill}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                  shouldPlay={index === activeIndex}
                  isMuted={false}
                />
                <View style={styles.clipOverlay}>
                  <View style={styles.clipInfo}>
                    {event && <Text style={styles.clipEvent}>{event.name}</Text>}
                    <Text style={styles.clipCaption}>{clip.caption}</Text>
                    <Text style={styles.clipHost}>{host?.name}</Text>
                  </View>
                  <View style={styles.clipActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLikeClip(clip.id)}>
                      <Text style={styles.actionIcon}>{clip.likedByMe ? '❤️' : '🤍'}</Text>
                      <Text style={styles.actionCount}>{clip.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={postModal} animationType="slide" transparent onRequestClose={resetModal}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>POST A CLIP</Text>

            <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
              <Text style={styles.videoPickerTxt}>{videoUri ? '✅ VIDEO SELECTED' : '🎥 SELECT A VIDEO'}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Add a caption..."
              placeholderTextColor={Colors.dim}
              multiline
            />

            <Text style={styles.fieldLabel}>TAG AN EVENT (OPTIONAL)</Text>
            <View style={styles.eventPills}>
              {myEvents.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.eventPill, selectedEventId === e.id && styles.eventPillOn]}
                  onPress={() => setSelectedEventId(selectedEventId === e.id ? undefined : e.id)}
                >
                  <Text style={[styles.eventPillTxt, selectedEventId === e.id && styles.eventPillTxtOn]}>{e.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetModal}>
                <Text style={styles.cancelTxt}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, !videoUri && styles.submitBtnOff]}
                disabled={!videoUri}
                onPress={handlePost}
              >
                <Text style={styles.submitTxt}>POST</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const { height: SCREEN_H } = require('react-native').Dimensions.get('window');

const S = StyleSheet.create;
const styles = S({
  safe:           { flex: 1, backgroundColor: Colors.bg },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:    { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  postBtn:        { backgroundColor: Colors.red, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 4 },
  postBtnTxt:     { fontSize: 11, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
  empty:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },
  emptyTitle:     { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  emptyTxt:       { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', lineHeight: 18 },
  emptyNote:      { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', lineHeight: 16, fontStyle: 'italic' },
  clipWrap:       { height: SCREEN_H, backgroundColor: '#000' },
  clipOverlay:    { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16, flexDirection: 'row', alignItems: 'flex-end' },
  clipInfo:       { flex: 1, gap: 4 },
  clipEvent:      { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  clipCaption:    { fontSize: 14, fontFamily: Fonts.bodyMedium, color: '#fff' },
  clipHost:       { fontSize: 11, fontFamily: Fonts.body, color: 'rgba(255,255,255,0.7)' },
  clipActions:    { gap: 16, alignItems: 'center' },
  actionBtn:      { alignItems: 'center', gap: 4 },
  actionIcon:     { fontSize: 28 },
  actionCount:    { fontSize: 11, fontFamily: Fonts.bodyBold, color: '#fff' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  modalTitle:     { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  videoPicker:    { borderWidth: 1, borderColor: Colors.border2, borderRadius: 6, paddingVertical: 14, alignItems: 'center' },
  videoPickerTxt: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  captionInput:   { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, minHeight: 70, borderWidth: 1, borderColor: Colors.border },
  fieldLabel:     { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim },
  eventPills:     { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  eventPill:      { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  eventPillOn:    { backgroundColor: Colors.red, borderColor: Colors.red },
  eventPillTxt:   { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.mid },
  eventPillTxtOn: { color: '#fff' },
  modalActions:   { flexDirection: 'row', gap: 10 },
  cancelBtn:      { flex: 1, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  cancelTxt:      { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  submitBtn:      { flex: 1, paddingVertical: 14, borderRadius: 5, backgroundColor: Colors.red, alignItems: 'center' },
  submitBtnOff:   { backgroundColor: Colors.surface2 },
  submitTxt:      { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
