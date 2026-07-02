import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

const { width: W, height: H } = Dimensions.get('window');

export default function EventClipsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, clips, hosts } = useApp();
  const event = events.find(e => e.id === id);
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  if (!event) return <SafeAreaView style={styles.safe}><Text style={{ color: Colors.cream, padding: 20 }}>Event not found.</Text></SafeAreaView>;

  // Oldest first — plays like a progression through the night
  const eventClips = clips.filter(c => c.eventId === event.id).slice().reverse();
  const host = hosts.find(h => h.id === event.hostId);

  if (eventClips.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTxt}>No clips posted for this event yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / W))}
      >
        {eventClips.map((clip, i) => (
          <View key={clip.id} style={{ width: W, height: H }}>
            <Video source={{ uri: clip.videoUri }} style={StyleSheet.absoluteFill} resizeMode={ResizeMode.COVER} isLooping shouldPlay={i === index} />
          </View>
        ))}
      </ScrollView>

      <SafeAreaView style={styles.overlayTop}>
        <View style={styles.progressRow}>
          {eventClips.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <View style={[styles.progressFill, i <= index && styles.progressFillOn]} />
            </View>
          ))}
        </View>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Text style={styles.closeBtnTxt}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.clipMeta}>{host?.name} · {index + 1} of {eventClips.length}</Text>
          </View>
        </View>
      </SafeAreaView>

      {eventClips[index]?.caption ? (
        <View style={styles.overlayBottom}>
          <Text style={styles.caption}>{eventClips[index].caption}</Text>
        </View>
      ) : null}
    </View>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:          { flex: 1, backgroundColor: '#000' },
  topBar:        { paddingHorizontal: 16, paddingTop: 14 },
  backTxt:       { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  empty:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyTxt:      { fontSize: 13, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center' },
  overlayTop:    { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 14 },
  progressRow:   { flexDirection: 'row', gap: 4, marginTop: 8 },
  progressTrack: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', backgroundColor: 'transparent' },
  progressFillOn:{ backgroundColor: '#fff' },
  headerRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  closeBtn:      { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  closeBtnTxt:   { color: '#fff', fontSize: 14 },
  headerInfo:    { flex: 1 },
  eventName:     { fontSize: 15, fontFamily: Fonts.display, color: '#fff', letterSpacing: 0.5 },
  clipMeta:      { fontSize: 10, fontFamily: Fonts.body, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  overlayBottom: { position: 'absolute', bottom: 30, left: 14, right: 14 },
  caption:       { fontSize: 13, fontFamily: Fonts.body, color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)', padding: 10, borderRadius: 6 },
});
