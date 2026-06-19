import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, Dimensions, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

const { height: SCREEN_H } = Dimensions.get('window');
const CLIP_H = SCREEN_H - 124; // leaves room for tab bar + safe area

export default function ClipsScreen() {
  const router = useRouter();
  const { clips, hosts, events, addClip, toggleLikeClip } = useApp();

  const [composeOpen, setComposeOpen] = useState(false);
  const [pickedUri, setPickedUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [taggedEventId, setTaggedEventId] = useState<string | undefined>(undefined);

  async function pickAndCompose() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setPickedUri(result.assets[0].uri);
      setComposeOpen(true);
    }
  }

  function handlePost() {
    if (!pickedUri) return;
    addClip(pickedUri, caption.trim(), taggedEventId);
    setComposeOpen(false);
    setPickedUri(null);
    setCaption('');
    setTaggedEventId(undefined);
  }

  if (clips.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>NO CLIPS YET</Text>
          <Text style={styles.emptyTxt}>Be the first to post a clip from tonight.</Text>
          <TouchableOpacity style={styles.postFirstBtn} onPress={pickAndCompose}>
            <Text style={styles.postFirstTxt}>+ POST A CLIP</Text>
          </TouchableOpacity>
        </View>
        {renderComposeModal()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={CLIP_H}
        decelerationRate="fast"
      >
        {clips.map(clip => {
          const host = hosts.find(h => h.id === clip.hostId);
          const event = clip.eventId ? events.find(e => e.id === clip.eventId) : undefined;
          return (
            <View key={clip.id} style={[styles.clip, { height: CLIP_H }]}>
              <Video
                source={{ uri: clip.videoUri }}
                style={styles.video}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay
                isMuted={false}
              />

              <View style={styles.overlay}>
                <View style={styles.overlayLeft}>
                  <View style={styles.hostRow}>
                    <View style={[styles.hostAv, { backgroundColor: host?.color ?? Colors.surface2 }]}>
                      <Text style={styles.hostAvTxt}>{host?.initial ?? '?'}</Text>
                    </View>
                    <Text style={styles.hostName}>{host?.name ?? 'FOMO'}</Text>
                  </View>
                  {clip.caption && <Text style={styles.caption}>{clip.caption}</Text>}
                  {event && (
                    <TouchableOpacity style={styles.eventTag} onPress={() => router.push(`/event/${event.id}`)}>
                      <Text style={styles.eventTagTxt}>📍 {event.name}</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.overlayRight}>
                  <TouchableOpacity style={styles.likeBtn} onPress={() => toggleLikeClip(clip.id)}>
                    <Text style={styles.likeIcon}>{clip.likedByMe ? '🔥' : '🤍'}</Text>
                    <Text style={styles.likeCount}>{clip.likes}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={pickAndCompose}>
        <Text style={styles.fabTxt}>+</Text>
      </TouchableOpacity>

      {renderComposeModal()}
    </SafeAreaView>
  );

  function renderComposeModal() {
    return (
      <Modal visible={composeOpen} animationType="slide" transparent onRequestClose={() => setComposeOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>NEW CLIP</Text>
            <Text style={styles.modalSub}>{pickedUri ? '🎥 Video selected' : 'No video selected'}</Text>

            <TextInput
              style={styles.captionInput}
              value={caption}
              onChangeText={setCaption}
              placeholder="Write a caption..."
              placeholderTextColor={Colors.dim}
              multiline
            />

            <Text style={styles.fieldLabel}>TAG AN EVENT (OPTIONAL)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {events.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.tagPill, taggedEventId === e.id && styles.tagPillOn]}
                  onPress={() => setTaggedEventId(taggedEventId === e.id ? undefined : e.id)}
                >
                  <Text style={[styles.tagPillTxt, taggedEventId === e.id && styles.tagPillTxtOn]}>{e.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setComposeOpen(false); setPickedUri(null); }}>
                <Text style={styles.modalCancelTxt}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalPost} onPress={handlePost}>
                <Text style={styles.modalPostTxt}>POST CLIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const S = StyleSheet.create;
const styles = S({
  safe:           { flex: 1, backgroundColor: '#000' },
  empty:          { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, gap: 12 },
  emptyTitle:     { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  emptyTxt:       { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center' },
  postFirstBtn:   { backgroundColor: Colors.red, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 6, marginTop: 10 },
  postFirstTxt:   { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },

  clip:           { width: '100%', backgroundColor: '#000', justifyContent: 'flex-end' },
  video:          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  overlay:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', padding: 16, paddingBottom: 24 },
  overlayLeft:    { flex: 1, gap: 8 },
  hostRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hostAv:         { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  hostAvTxt:      { fontSize: 12, fontFamily: Fonts.display, color: '#fff' },
  hostName:       { fontSize: 13, fontFamily: Fonts.bodyBold, color: '#fff' },
  caption:        { fontSize: 13, fontFamily: Fonts.body, color: '#fff', lineHeight: 18 },
  eventTag:       { backgroundColor: 'rgba(204,41,41,0.85)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4 },
  eventTagTxt:    { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff' },
  overlayRight:   { alignItems: 'center', gap: 4 },
  likeBtn:        { alignItems: 'center' },
  likeIcon:       { fontSize: 28 },
  likeCount:      { fontSize: 11, fontFamily: Fonts.bodyBold, color: '#fff', marginTop: 2 },

  fab:            { position: 'absolute', bottom: 20, right: 18, width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8 },
  fabTxt:         { fontSize: 26, color: '#fff', marginTop: -2 },

  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:      { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 },
  modalTitle:     { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, marginBottom: 6 },
  modalSub:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, marginBottom: 14 },
  captionInput:   { backgroundColor: Colors.surface2, borderRadius: 6, padding: 14, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, minHeight: 70, textAlignVertical: 'top', marginBottom: 14, borderWidth: 1, borderColor: Colors.border },
  fieldLabel:     { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim, marginBottom: 10 },
  tagPill:        { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 6 },
  tagPillOn:      { backgroundColor: Colors.red, borderColor: Colors.red },
  tagPillTxt:     { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.mid },
  tagPillTxtOn:   { color: '#fff' },
  modalActions:   { flexDirection: 'row', gap: 10 },
  modalCancel:    { flex: 1, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  modalCancelTxt: { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  modalPost:      { flex: 1, paddingVertical: 14, borderRadius: 5, backgroundColor: Colors.red, alignItems: 'center' },
  modalPostTxt:   { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
