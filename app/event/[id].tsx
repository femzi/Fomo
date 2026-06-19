import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { events } from '../../constants/Data';
import { useApp } from '../../context/AppContext';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const event = events.find(e => e.id === id);
  const [going, setGoing] = useState(false);
  const { hosts, toggleHostFollow, people } = useApp();

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: Colors.cream, padding: 20 }}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const host = hosts.find(h => h.id === event.hostId);
  const goingFriends = people.filter(p => event.friendsGoingIds.includes(p.id));

  const rows = [
    { label: 'TYPE',       value: event.partyType },
    { label: 'CROWD',      value: event.crowd },
    { label: 'TIME',       value: event.time },
    { label: 'ENTRY',      value: event.entry },
    { label: 'AVG SPEND',  value: event.avgSpend },
    { label: 'DRESS CODE', value: event.dressCode },
    { label: 'DISTANCE',   value: event.distance },
    { label: 'MUSIC',      value: event.music },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← BACK</Text>
          </TouchableOpacity>
          {event.isHot && (
            <View style={styles.hotBadge}><Text style={styles.hotTxt}>🔥 HOT TONIGHT</Text></View>
          )}
        </View>

        <View style={styles.videoArea}>
          <View style={styles.playBtn}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
          <Text style={styles.videoLive}>● LIVE</Text>
          <Text style={styles.videoPeople}>{event.people} people here now</Text>
        </View>

        <View style={styles.content}>

          <View>
            <Text style={styles.eventName}>{event.name}</Text>
            <Text style={styles.venueTxt}>{event.venue} · Abuja</Text>
          </View>

          {/* Hosted by */}
          {host && (
            <View style={styles.hostCard}>
              <View style={styles.hostLeft}>
                <View style={[styles.hostAv, { backgroundColor: host.color }]}>
                  <Text style={styles.hostAvTxt}>{host.initial}</Text>
                </View>
                <View>
                  <Text style={styles.hostLabel}>HOSTED BY</Text>
                  <Text style={styles.hostName}>{host.name}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.followBtn, host.isFollowing && styles.followBtnOn]}
                onPress={() => toggleHostFollow(host.id)}
              >
                <Text style={[styles.followTxt, host.isFollowing && styles.followTxtOn]}>
                  {host.isFollowing ? 'FOLLOWING' : 'FOLLOW'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Friends going */}
          {goingFriends.length > 0 && (
            <TouchableOpacity
              style={styles.friendsCard}
              onPress={() => {
                if (event.conversationId) {
                  router.push(`/chat/${event.conversationId}`);
                } else {
                  Alert.alert('No group chat yet', 'Start one from the Chats tab.');
                }
              }}
            >
              <View style={styles.avStack}>
                {goingFriends.slice(0, 4).map((f, i) => (
                  <View key={f.id} style={[styles.stackAv, { backgroundColor: f.color, marginLeft: i === 0 ? 0 : -8 }]}>
                    <Text style={styles.stackAvTxt}>{f.initial}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.friendsTxt}>
                {goingFriends.length} friend{goingFriends.length > 1 ? 's' : ''} going · tap to open chat
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.scoreBox}>
            <Text style={styles.scoreNum}>{event.score}</Text>
            <Text style={styles.scoreLbl}>FOMO SCORE · LIVE</Text>
            <View style={styles.bars}>
              {[
                { label: 'Ticket velocity', w: '85%' },
                { label: 'Live check-ins',  w: '72%' },
                { label: 'User clips',      w: '60%' },
                { label: 'Past perf.',      w: '90%' },
              ].map(b => (
                <View key={b.label} style={styles.barRow}>
                  <Text style={styles.barLabel}>{b.label}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: b.w as any }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.detailBox}>
            {rows.map((row, i) => (
              <View key={row.label} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cta, going && styles.ctaGoing]}
            onPress={() => {
              setGoing(!going);
              if (!going) Alert.alert('🔥 Added!', "Your squad can see you're going to " + event.name);
            }}
          >
            <Text style={styles.ctaTxt}>{going ? "✓ YOU'RE GOING" : "I'M GOING"}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:        { flex: 1, backgroundColor: Colors.bg },
  topBar:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backBtn:     {},
  backTxt:     { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  hotBadge:    { backgroundColor: Colors.redDim, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 3, borderWidth: 1, borderColor: Colors.redDim },
  hotTxt:      { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red },
  videoArea:   { height: 190, backgroundColor: Colors.surface2, justifyContent: 'center', alignItems: 'center' },
  playBtn:     { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(204,41,41,0.85)', justifyContent: 'center', alignItems: 'center' },
  playIcon:    { fontSize: 20, color: '#fff', paddingLeft: 4 },
  videoLive:   { position: 'absolute', top: 12, left: 14, fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  videoPeople: { position: 'absolute', bottom: 12, left: 14, fontSize: 11, fontFamily: Fonts.body, color: Colors.mid },
  content:     { padding: 16, gap: 14 },
  eventName:   { fontSize: 32, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  venueTxt:    { fontSize: 11, fontFamily: Fonts.bodyMedium, color: Colors.dim, letterSpacing: 1, marginTop: 2 },

  hostCard:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 6, padding: 12 },
  hostLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hostAv:      { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  hostAvTxt:   { fontSize: 15, fontFamily: Fonts.display, color: '#fff' },
  hostLabel:   { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1.5 },
  hostName:    { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream, marginTop: 2 },
  followBtn:   { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 3 },
  followBtnOn: { borderColor: Colors.border2 },
  followTxt:   { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  followTxtOn: { color: Colors.dim },

  friendsCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.surface, borderRadius: 6, padding: 12 },
  avStack:     { flexDirection: 'row' },
  stackAv:     { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surface },
  stackAvTxt:  { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff' },
  friendsTxt:  { fontSize: 11, fontFamily: Fonts.bodyMedium, color: Colors.mid, flex: 1 },

  scoreBox:    { backgroundColor: Colors.surface, borderRadius: 6, padding: 16, alignItems: 'center', gap: 10 },
  scoreNum:    { fontSize: 84, fontFamily: Fonts.display, color: Colors.red, lineHeight: 84, letterSpacing: -2 },
  scoreLbl:    { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 3 },
  bars:        { width: '100%', gap: 8 },
  barRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel:    { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim, width: 90 },
  barTrack:    { flex: 1, height: 3, backgroundColor: Colors.border, borderRadius: 2, overflow: 'hidden' },
  barFill:     { height: '100%', backgroundColor: Colors.red, borderRadius: 2 },
  detailBox:   { backgroundColor: Colors.surface, borderRadius: 6, overflow: 'hidden' },
  row:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  rowLabel:    { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim },
  rowValue:    { fontSize: 12, fontFamily: Fonts.bodySemiBold, color: Colors.cream },
  cta:         { backgroundColor: Colors.red, borderRadius: 5, padding: 18, alignItems: 'center', marginTop: 4 },
  ctaGoing:    { backgroundColor: Colors.green },
  ctaTxt:      { fontSize: 18, fontFamily: Fonts.display, color: '#fff', letterSpacing: 3 },
});
