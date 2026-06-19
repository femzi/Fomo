import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { events, PARTY_TYPES } from '../../constants/Data';
import type { Event } from '../../constants/Data';
import { useApp } from '../../context/AppContext';

const FILTERS = ['ALL', ...PARTY_TYPES];

function EventPost({ event, onOpenEvent }: { event: Event; onOpenEvent: () => void }) {
  const { hosts, toggleHostFollow, people } = useApp();
  const router = useRouter();
  const host = hosts.find(h => h.id === event.hostId);
  const goingFriends = people.filter(p => event.friendsGoingIds.includes(p.id));

  return (
    <View style={[styles.post, event.isHot && styles.postHot]}>

      {/* Host header — like an IG post header */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.hostRow} activeOpacity={0.7}>
          <View style={[styles.hostAv, { backgroundColor: host?.color ?? Colors.surface2 }]}>
            <Text style={styles.hostAvTxt}>{host?.initial ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.hostName}>{host?.name ?? event.venue}</Text>
            <Text style={styles.hostMeta}>{event.distance} · {event.time}</Text>
          </View>
        </TouchableOpacity>
        {host && (
          <TouchableOpacity
            style={[styles.followBtn, host.isFollowing && styles.followBtnOn]}
            onPress={() => toggleHostFollow(host.id)}
          >
            <Text style={[styles.followBtnTxt, host.isFollowing && styles.followBtnTxtOn]}>
              {host.isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Video body */}
      <TouchableOpacity style={styles.thumb} onPress={onOpenEvent} activeOpacity={0.92}>
        <Text style={styles.thumbLive}>● LIVE</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeTxt}>{event.score}</Text>
        </View>
        <View style={styles.thumbBottom}>
          <Text style={styles.thumbPeople}>{event.people} people inside now</Text>
          <View style={styles.crowdPill}>
            <Text style={styles.crowdTxt}>{event.crowd}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Caption area */}
      <TouchableOpacity style={styles.cardBody} onPress={onOpenEvent} activeOpacity={0.92}>
        <Text style={styles.cardName}>{event.name}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagType}><Text style={styles.tagTypeTxt}>{event.partyType}</Text></View>
          <View style={styles.tag}><Text style={styles.tagTxt}>{event.entry}</Text></View>
          <View style={styles.tagDim}><Text style={styles.tagDimTxt}>{event.dressCode}</Text></View>
        </View>
      </TouchableOpacity>

      {/* Friends going row */}
      {goingFriends.length > 0 && (
        <TouchableOpacity
          style={styles.friendsRow}
          onPress={() => {
            if (event.conversationId) {
              router.push(`/chat/${event.conversationId}`);
            } else {
              Alert.alert('No group chat yet', 'Start one from the Chats tab.');
            }
          }}
        >
          <View style={styles.avStack}>
            {goingFriends.slice(0, 3).map((f, i) => (
              <View
                key={f.id}
                style={[styles.stackAv, { backgroundColor: f.color, marginLeft: i === 0 ? 0 : -8 }]}
              >
                <Text style={styles.stackAvTxt}>{f.initial}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.friendsTxt}>
            {goingFriends.length} friend{goingFriends.length > 1 ? 's' : ''} going · tap to chat
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const router = useRouter();

  const filtered = activeFilter === 'ALL'
    ? events.filter(e => !e.isAfterParty)
    : events.filter(e => !e.isAfterParty && e.partyType === activeFilter);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>TONIGHT</Text>
            <Text style={styles.headerSub}>ABUJA · FRI 24 OCT</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTxt}>LIVE</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabOn]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterTabTxt, activeFilter === f && styles.filterTabTxtOn]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.list}>
          {filtered.map(event => (
            <EventPost
              key={event.id}
              event={event}
              onOpenEvent={() => router.push(`/event/${event.id}`)}
            />
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:            { flex: 1, backgroundColor: Colors.bg },
  scroll:          { flex: 1 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:     { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  headerSub:       { fontSize: 10, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1, marginTop: 2 },
  liveBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.redDim, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  liveTxt:         { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 2 },
  filterRow:       { paddingVertical: 10 },
  filterTab:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 3, borderWidth: 1, borderColor: Colors.border },
  filterTabOn:     { backgroundColor: Colors.red, borderColor: Colors.red },
  filterTabTxt:    { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1 },
  filterTabTxtOn:  { color: '#fff' },
  list:            { paddingHorizontal: 14, paddingBottom: 28, gap: 16, paddingTop: 4 },

  post:            { backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden', borderLeftWidth: 2, borderLeftColor: 'transparent' },
  postHot:         { borderLeftColor: Colors.red },
  postHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  hostRow:         { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  hostAv:          { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  hostAvTxt:       { fontSize: 14, fontFamily: Fonts.display, color: '#fff' },
  hostName:        { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream },
  hostMeta:        { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim, marginTop: 1 },
  followBtn:       { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  followBtnOn:      { borderColor: Colors.border2, backgroundColor: 'transparent' },
  followBtnTxt:    { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  followBtnTxtOn:  { color: Colors.dim },

  thumb:           { height: 150, backgroundColor: Colors.surface2, justifyContent: 'flex-end', padding: 10 },
  thumbLive:       { position: 'absolute', top: 10, left: 10, fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  scoreBadge:      { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.red, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 4 },
  scoreBadgeTxt:   { color: '#fff', fontSize: 15, fontFamily: Fonts.display },
  thumbBottom:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  thumbPeople:     { color: Colors.mid, fontSize: 10, fontFamily: Fonts.body },
  crowdPill:       { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  crowdTxt:        { fontSize: 9, fontFamily: Fonts.bodyMedium, color: Colors.cream },

  cardBody:        { padding: 12, paddingBottom: 10 },
  cardName:        { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.8, marginBottom: 8 },
  tagRow:          { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  tagType:         { backgroundColor: Colors.redDim, borderWidth: 1, borderColor: Colors.redDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2 },
  tagTypeTxt:      { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  tag:             { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2 },
  tagTxt:          { fontSize: 9, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 0.3 },
  tagDim:          { paddingHorizontal: 4, justifyContent: 'center' },
  tagDimTxt:       { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim },

  friendsRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 2 },
  avStack:         { flexDirection: 'row' },
  stackAv:         { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surface },
  stackAvTxt:      { fontSize: 9, fontFamily: Fonts.bodyBold, color: '#fff' },
  friendsTxt:      { fontSize: 10, fontFamily: Fonts.bodyMedium, color: Colors.mid },
});
