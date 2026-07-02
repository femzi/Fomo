import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, ScrollView, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

const ABUJA_CENTER = { lat: 9.0765, lng: 7.3986 };
const PX_PER_KM = 30;
type Mode = 'friends' | 'events';

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

function projectKm(dxKm: number, dyKm: number, w: number, h: number) {
  let pxX = dxKm * PX_PER_KM, pxY = -dyKm * PX_PER_KM;
  const maxR = Math.min(w, h) / 2 - 36;
  const dist = Math.sqrt(pxX * pxX + pxY * pxY);
  if (dist > maxR && dist > 0) { pxX *= maxR / dist; pxY *= maxR / dist; }
  return { x: w / 2 + pxX, y: h / 2 + pxY };
}

export default function MapScreen() {
  const router = useRouter();
  const { people, events } = useApp();
  const followed = people.filter(p => p.isFollowing);
  const locatedEvents = events.filter(e => e.latitude !== undefined && e.longitude !== undefined && !e.isAfterParty);
  const [mode, setMode] = useState<Mode>('friends');
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [mapSize, setMapSize] = useState({ w: 0, h: 0 });
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const pos = await Location.getCurrentPositionAsync({});
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      } catch {}
    })();
  }, []);

  useEffect(() => {
    Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: true })).start();
  }, []);

  useEffect(() => { setSelectedId(null); }, [mode]);

  const center = userLoc ?? ABUJA_CENTER;

  function friendInfo(personId: string) {
    return events.find(e => e.friendsGoingIds.includes(personId));
  }

  function friendPosition(personId: string, w: number, h: number) {
    const event = friendInfo(personId);
    if (event && event.latitude !== undefined && event.longitude !== undefined) {
      const dxKm = (event.longitude - center.lng) * 111.32 * Math.cos((center.lat * Math.PI) / 180);
      const dyKm = (event.latitude - center.lat) * 110.54;
      return projectKm(dxKm, dyKm, w, h);
    }
    const hash = hashId(personId);
    const angle = (hash % 360) * (Math.PI / 180);
    const dist = 0.5 + ((hash % 1000) / 1000) * 2;
    return projectKm(dist * Math.sin(angle), dist * Math.cos(angle), w, h);
  }

  function eventPosition(lat: number, lng: number, w: number, h: number) {
    const dxKm = (lng - center.lng) * 111.32 * Math.cos((center.lat * Math.PI) / 180);
    const dyKm = (lat - center.lat) * 110.54;
    return projectKm(dxKm, dyKm, w, h);
  }

  const q = search.toLowerCase();
  const filteredFriends = q ? followed.filter(p => p.name.toLowerCase().includes(q)) : followed;
  const filteredEvents = q ? locatedEvents.filter(e => e.name.toLowerCase().includes(q)) : locatedEvents;
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.modeRow}>
        <TouchableOpacity style={[styles.modeBtn, mode === 'friends' && styles.modeBtnOn]} onPress={() => setMode('friends')}>
          <Text style={[styles.modeTxt, mode === 'friends' && styles.modeTxtOn]}>👥 FRIENDS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.modeBtn, mode === 'events' && styles.modeBtnOn]} onPress={() => setMode('events')}>
          <Text style={[styles.modeTxt, mode === 'events' && styles.modeTxtOn]}>📍 EVENTS</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder={mode === 'friends' ? 'Search friends...' : 'Search events...'} placeholderTextColor="rgba(255,255,255,0.5)" />
      </View>
      <View style={styles.mapArea} onLayout={e => setMapSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <View style={[styles.road, { top: '30%', transform: [{ rotate: '8deg' }] }]} />
        <View style={[styles.road, { top: '55%', transform: [{ rotate: '-5deg' }] }]} />
        <View style={[styles.roadVert, { left: '35%', transform: [{ rotate: '6deg' }] }]} />
        {[60, 120, 180].map(r => <View key={r} style={[styles.ring, { width: r*2, height: r*2, left: mapSize.w/2-r, top: mapSize.h/2-r }]} />)}

        {mode === 'friends' && mapSize.w > 0 && filteredFriends.map(p => {
          const pos = friendPosition(p.id, mapSize.w, mapSize.h);
          const event = friendInfo(p.id);
          const isSel = selectedId === p.id;
          return (
            <TouchableOpacity key={p.id} style={[styles.pin, { left: pos.x - 18, top: pos.y - 18 }]} onPress={() => setSelectedId(isSel ? null : p.id)}>
              <View style={[styles.pinAv, { backgroundColor: p.color }, isSel && styles.pinAvSel]}>
                <Text style={styles.pinAvTxt}>{p.initial}</Text>
              </View>
              {event && <View style={styles.liveDot} />}
              {isSel && (
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{p.name}</Text>
                  <Text style={styles.calloutSub}>{event ? `📍 At ${event.name}` : 'Around Abuja'}</Text>
                  {event && <TouchableOpacity onPress={() => router.push(`/event/${event.id}`)}><Text style={styles.calloutLink}>View event →</Text></TouchableOpacity>}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {mode === 'events' && mapSize.w > 0 && filteredEvents.map(e => {
          const pos = eventPosition(e.latitude!, e.longitude!, mapSize.w, mapSize.h);
          const isSel = selectedId === e.id;
          return (
            <TouchableOpacity key={e.id} style={[styles.pin, { left: pos.x - 18, top: pos.y - 18 }]} onPress={() => setSelectedId(isSel ? null : e.id)}>
              <View style={[styles.eventPin, isSel && styles.pinAvSel]}>
                <Text style={styles.eventPinTxt}>{e.score}</Text>
              </View>
              {isSel && (
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{e.name}</Text>
                  <Text style={styles.calloutSub}>{e.venue} · {e.time}</Text>
                  <TouchableOpacity onPress={() => router.push(`/event/${e.id}`)}><Text style={styles.calloutLink}>View event →</Text></TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {mapSize.w > 0 && (
          <View style={[styles.youWrap, { left: mapSize.w/2-24, top: mapSize.h/2-24 }]}>
            <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
            <View style={styles.youAv}><Text style={styles.youAvTxt}>YOU</Text></View>
          </View>
        )}
        <View style={styles.locBadge}>
          <Text style={styles.locBadgeTxt}>{userLoc ? '📍 LIVE LOCATION' : '📍 ABUJA (APPROX)'}</Text>
        </View>
      </View>
      <View style={styles.carousel}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
          {mode === 'friends' ? followed.map(p => {
            const event = friendInfo(p.id);
            return (
              <TouchableOpacity key={p.id} style={[styles.carouselItem, selectedId === p.id && styles.carouselItemOn]} onPress={() => setSelectedId(p.id)}>
                <View style={[styles.carouselAv, { backgroundColor: p.color }]}><Text style={styles.carouselAvTxt}>{p.initial}</Text></View>
                <Text style={styles.carouselName} numberOfLines={1}>{p.name.split(' ')[0]}</Text>
                <Text style={styles.carouselStatus}>{event ? 'LIVE NOW' : 'AROUND'}</Text>
              </TouchableOpacity>
            );
          }) : locatedEvents.map(e => (
            <TouchableOpacity key={e.id} style={[styles.carouselItem, selectedId === e.id && styles.carouselItemOn]} onPress={() => setSelectedId(e.id)}>
              <View style={[styles.carouselAv, { backgroundColor: Colors.red }]}><Text style={styles.carouselAvTxt}>{e.score}</Text></View>
              <Text style={styles.carouselName} numberOfLines={1}>{e.name}</Text>
              <Text style={styles.carouselStatus}>{e.partyType}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:          { flex: 1, backgroundColor: '#0B1A16' },
  modeRow:       { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingTop: 14 },
  modeBtn:       { flex: 1, paddingVertical: 9, borderRadius: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  modeBtnOn:     { backgroundColor: Colors.red },
  modeTxt:       { fontSize: 10, fontFamily: Fonts.bodyBold, color: 'rgba(255,255,255,0.6)', letterSpacing: 1 },
  modeTxtOn:     { color: '#fff' },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', margin: 14, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 24, paddingHorizontal: 14, height: 42 },
  searchIcon:    { fontSize: 13, marginRight: 8 },
  searchInput:   { flex: 1, fontSize: 13, fontFamily: Fonts.body, color: '#fff' },
  mapArea:       { flex: 1, backgroundColor: '#0B1A16', overflow: 'hidden', position: 'relative' },
  road:          { position: 'absolute', left: -40, right: -40, height: 2, backgroundColor: 'rgba(237,232,221,0.10)' },
  roadVert:      { position: 'absolute', top: -40, bottom: -40, width: 2, backgroundColor: 'rgba(237,232,221,0.07)' },
  ring:          { position: 'absolute', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  pin:           { position: 'absolute', width: 36, height: 36, alignItems: 'center' },
  pinAv:         { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0B1A16' },
  pinAvSel:      { borderColor: '#fff', borderWidth: 3 },
  pinAvTxt:      { fontSize: 13, fontFamily: Fonts.display, color: '#fff' },
  eventPin:      { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0B1A16', backgroundColor: Colors.red },
  eventPinTxt:   { fontSize: 12, fontFamily: Fonts.display, color: '#fff' },
  liveDot:       { position: 'absolute', top: -2, right: -2, width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.red, borderWidth: 1.5, borderColor: '#0B1A16' },
  callout:       { position: 'absolute', top: 42, left: -50, width: 140, backgroundColor: Colors.surface, borderRadius: 8, padding: 10, gap: 3, borderWidth: 1, borderColor: Colors.border, zIndex: 50 },
  calloutName:   { fontSize: 11, fontFamily: Fonts.bodyBold, color: Colors.cream },
  calloutSub:    { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim },
  calloutLink:   { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, marginTop: 4 },
  youWrap:       { position: 'absolute', width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  pulseRing:     { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.red },
  youAv:         { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  youAvTxt:      { fontSize: 8, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 0.5 },
  locBadge:      { position: 'absolute', bottom: 12, left: 14, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14 },
  locBadgeTxt:   { fontSize: 9, fontFamily: Fonts.bodyBold, color: 'rgba(255,255,255,0.85)', letterSpacing: 0.5 },
  carousel:      { height: 92, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  carouselItem:  { width: 68, alignItems: 'center', gap: 4, opacity: 0.75 },
  carouselItemOn:{ opacity: 1 },
  carouselAv:    { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  carouselAvTxt: { fontSize: 15, fontFamily: Fonts.display, color: '#fff' },
  carouselName:  { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff' },
  carouselStatus:{ fontSize: 7, fontFamily: Fonts.bodyBold, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
});
