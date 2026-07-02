import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { PARTY_TYPES } from '../../constants/Data';
import type { Event, Clip, Host, Person } from '../../constants/Data';
import { useApp } from '../../context/AppContext';
import { getDistanceKm, formatDistance } from '../../utils/distance';
import { getEventIntensity } from '../../utils/social';

const FILTERS = ['ALL', ...PARTY_TYPES];

// Props-based, no hooks inside — avoids rules-of-hooks violation
function EventPost({
  event,
  distanceLabel,
  clip,
  host,
  goingFriends,
  onOpenEvent,
  onOpenClips,
  onFollowHost,
  onOpenChat,
}: {
  event: Event;
  distanceLabel: string;
  clip?: Clip;
  host?: Host;
  goingFriends: Person[];
  onOpenEvent: () => void;
  onOpenClips: () => void;
  onFollowHost: () => void;
  onOpenChat: () => void;
}) {
  const intensity = getEventIntensity(event.score);
  const intensityColor = intensity.color === 'red' ? Colors.red : intensity.color === 'mid' ? Colors.mid : Colors.dim;

  return (
    <View style={[styles.post, event.isHot && styles.postHot]}>

      {/* Host row */}
      <View style={styles.postHeader}>
        <View style={styles.hostRow}>
          <View style={[styles.hostAv, { backgroundColor: host?.color ?? Colors.surface2 }]}>
            <Text style={styles.hostAvTxt}>{host?.initial ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.hostName}>{host?.name ?? event.venue}</Text>
            <Text style={styles.hostMeta}>{distanceLabel} · {event.time}</Text>
          </View>
        </View>
        {host && (
          <TouchableOpacity
            style={[styles.followBtn, host.isFollowing && styles.followBtnOn]}
            onPress={onFollowHost}
          >
            <Text style={[styles.followBtnTxt, host.isFollowing && styles.followBtnTxtOn]}>
              {host.isFollowing ? 'FOLLOWING' : 'FOLLOW'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Thumbnail / video — tap video to open clip sequence */}
      <View style={styles.thumbWrap}>
        {clip ? (
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onOpenClips} activeOpacity={0.9}>
            <Video
              source={{ uri: clip.videoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              isLooping
              shouldPlay
              isMuted
            />
            <View style={styles.playOverlay}>
              <Text style={styles.playOverlayTxt}>▶ TAP TO WATCH ALL CLIPS</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[StyleSheet.absoluteFill, styles.noClipBox]} onPress={onOpenEvent} activeOpacity={0.9}>
            <Text style={styles.noClipTxt}>No clip yet tonight</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.thumbLive}>● LIVE</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeTxt}>{event.score}</Text>
        </View>
        <View style={styles.thumbBottom}>
          <Text style={styles.thumbPeople}>{event.people} inside now</Text>
          <View style={styles.crowdPill}>
            <Text style={styles.crowdTxt}>{event.crowd}</Text>
          </View>
        </View>
      </View>

      {/* Card body */}
      <TouchableOpacity style={styles.cardBody} onPress={onOpenEvent} activeOpacity={0.92}>
        <Text style={styles.cardName}>{event.name}</Text>
        <View style={styles.tagRow}>
          <View style={styles.tagType}>
            <Text style={styles.tagTypeTxt}>{event.partyType}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagTxt}>{event.entry}</Text>
          </View>
          <Text style={[styles.intensityTxt, { color: intensityColor }]}>{intensity.label}</Text>
        </View>
      </TouchableOpacity>

      {/* Friends going */}
      {goingFriends.length > 0 && (
        <TouchableOpacity style={styles.friendsRow} onPress={onOpenChat}>
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
  const [search, setSearch] = useState('');
  const { events, hosts, clips, people, unreadNotifCount, toggleHostFollow } = useApp();
  const router = useRouter();

  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [locStatus, setLocStatus] = useState<'loading' | 'granted' | 'denied'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') { setLocStatus('denied'); return; }
        const pos = await Location.getCurrentPositionAsync({});
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocStatus('granted');
      } catch { setLocStatus('denied'); }
    })();
  }, []);

  function distanceFor(event: Event): string {
    if (userLoc && event.latitude !== undefined && event.longitude !== undefined) {
      return formatDistance(getDistanceKm(userLoc.lat, userLoc.lng, event.latitude, event.longitude));
    }
    if (event.latitude === undefined) return 'Location not set yet';
    return event.distance;
  }

  const q = search.trim().toLowerCase();
  const filtered = events.filter(e => {
    if (e.isAfterParty) return false;
    if (activeFilter !== 'ALL' && e.partyType !== activeFilter) return false;
    if (!q) return true;
    const host = hosts.find(h => h.id === e.hostId);
    return (
      e.name.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.partyType.toLowerCase().includes(q) ||
      (host?.name.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>TONIGHT</Text>
            <Text style={styles.headerSub}>
              {locStatus === 'loading' ? 'FINDING LOCATION...' :
               locStatus === 'granted' ? 'LIVE DISTANCE ON' : 'LOCATION OFF'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTxt}>LIVE</Text>
            </View>
            <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notification-center')}>
              <Text style={styles.bellIcon}>🔔</Text>
              {unreadNotifCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeTxt}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search events, venues, vibes..."
            placeholderTextColor={Colors.dim}
          />
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
        >
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

        {/* Event feed */}
        <View style={styles.list}>
          {filtered.length === 0 && (
            <Text style={styles.emptyTxt}>
              {q ? `No events match "${search}".` : 'No events tonight yet.'}
            </Text>
          )}
          {filtered.map(event => {
            const host = hosts.find(h => h.id === event.hostId);
            const clip = clips.find(c => c.eventId === event.id);
            const goingFriends = people.filter(p => event.friendsGoingIds.includes(p.id));
            return (
              <EventPost
                key={event.id}
                event={event}
                distanceLabel={distanceFor(event)}
                clip={clip}
                host={host}
                goingFriends={goingFriends}
                onOpenEvent={() => router.push(`/event/${event.id}`)}
                onOpenClips={() => router.push(`/event-clips/${event.id}`)}
                onFollowHost={() => host && toggleHostFollow(host.id)}
                onOpenChat={() => {
                  if (event.conversationId) router.push(`/chat/${event.conversationId}`);
                  else Alert.alert('No group chat yet', 'Start one from the Chats tab.');
                }}
              />
            );
          })}
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
  headerSub:       { fontSize: 9, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1, marginTop: 2 },
  headerRight:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.redDim, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  liveDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.red },
  liveTxt:         { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 2 },
  bellBtn:         { position: 'relative', padding: 4 },
  bellIcon:        { fontSize: 22 },
  bellBadge:       { position: 'absolute', top: 0, right: 0, backgroundColor: Colors.red, borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  bellBadgeTxt:    { fontSize: 8, fontWeight: '700', color: '#fff' },
  searchWrap:      { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, backgroundColor: Colors.surface, borderRadius: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  searchIcon:      { fontSize: 14, marginRight: 8 },
  searchInput:     { flex: 1, height: 42, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  filterRow:       { paddingVertical: 10 },
  filterTab:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 3, borderWidth: 1, borderColor: Colors.border },
  filterTabOn:     { backgroundColor: Colors.red, borderColor: Colors.red },
  filterTabTxt:    { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1 },
  filterTabTxtOn:  { color: '#fff' },
  list:            { paddingHorizontal: 14, paddingBottom: 28, gap: 16, paddingTop: 4 },
  emptyTxt:        { fontSize: 12, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 18, paddingVertical: 20, textAlign: 'center' },

  post:            { backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden', borderLeftWidth: 2, borderLeftColor: 'transparent' },
  postHot:         { borderLeftColor: Colors.red },
  postHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 10 },
  hostRow:         { flexDirection: 'row', alignItems: 'center', gap: 9, flex: 1 },
  hostAv:          { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  hostAvTxt:       { fontSize: 14, fontFamily: Fonts.display, color: '#fff' },
  hostName:        { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream },
  hostMeta:        { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim, marginTop: 1 },
  followBtn:       { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 3 },
  followBtnOn:     { borderColor: Colors.border2 },
  followBtnTxt:    { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  followBtnTxtOn:  { color: Colors.dim },
  thumbWrap:       { height: 160, backgroundColor: Colors.surface2, overflow: 'hidden', position: 'relative' },
  noClipBox:       { justifyContent: 'center', alignItems: 'center' },
  noClipTxt:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim },
  playOverlay:     { position: 'absolute', bottom: 10, left: 0, right: 0, alignItems: 'center' },
  playOverlayTxt:  { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff', backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, letterSpacing: 0.5 },
  thumbLive:       { position: 'absolute', top: 10, left: 10, fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  scoreBadge:      { position: 'absolute', top: 8, right: 8, backgroundColor: Colors.red, borderRadius: 20, paddingHorizontal: 11, paddingVertical: 4 },
  scoreBadgeTxt:   { color: '#fff', fontSize: 15, fontFamily: Fonts.display },
  thumbBottom:     { position: 'absolute', bottom: 8, left: 10, right: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  thumbPeople:     { color: Colors.mid, fontSize: 10, fontFamily: Fonts.body },
  crowdPill:       { backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10 },
  crowdTxt:        { fontSize: 9, fontFamily: Fonts.bodyMedium, color: Colors.cream },
  cardBody:        { padding: 12, paddingBottom: 10 },
  cardName:        { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.8, marginBottom: 8 },
  tagRow:          { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  tagType:         { backgroundColor: Colors.redDim, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2 },
  tagTypeTxt:      { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  tag:             { borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 2 },
  tagTxt:          { fontSize: 9, fontFamily: Fonts.bodySemiBold, color: Colors.dim },
  intensityTxt:    { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 0.3 },
  friendsRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingBottom: 12, paddingTop: 2 },
  avStack:         { flexDirection: 'row' },
  stackAv:         { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.surface },
  stackAvTxt:      { fontSize: 9, fontFamily: Fonts.bodyBold, color: '#fff' },
  friendsTxt:      { fontSize: 10, fontFamily: Fonts.bodyMedium, color: Colors.mid },
});
