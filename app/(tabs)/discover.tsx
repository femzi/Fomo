import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { events } from '../../constants/Data';

const VIBES = ['🔥 Turnt', '🎵 Chill', '💃 Dance', '🎸 Live', '🍺 Free Entry'];

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const results = query.length > 1
    ? events.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.venue.toLowerCase().includes(query.toLowerCase()) ||
        e.music.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const trending = [...events].sort((a, b) => b.score - a.score).slice(0, 2);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.headerTitle}>DISCOVER</Text>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search events, venues, music..."
            placeholderTextColor={Colors.dim}
          />
        </View>

        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RESULTS</Text>
            {results.map(event => (
              <TouchableOpacity key={event.id} style={styles.resultRow} onPress={() => router.push(`/event/${event.id}`)}>
                <View>
                  <Text style={styles.resultName}>{event.name}</Text>
                  <Text style={styles.resultSub}>{event.venue} · {event.time} · {event.entry}</Text>
                </View>
                <Text style={styles.resultScore}>{event.score}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {query.length === 0 && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TRENDING IN ABUJA</Text>
              {trending.map(event => (
                <TouchableOpacity key={event.id} style={[styles.trendCard, event.isHot && styles.trendCardHot]} onPress={() => router.push(`/event/${event.id}`)}>
                  <View style={styles.trendLeft}>
                    <Text style={styles.trendName}>{event.name}</Text>
                    <Text style={styles.trendSub}>{event.venue} · {event.distance}</Text>
                  </View>
                  <Text style={styles.trendScore}>{event.score}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>BROWSE BY VIBE</Text>
              <View style={styles.vibeRow}>
                {VIBES.map(v => (
                  <TouchableOpacity key={v} style={styles.vibePill}>
                    <Text style={styles.vibeTxt}>{v}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>NEAR YOU · &lt; 3KM</Text>
              {events.filter(e => parseFloat(e.distance) < 3).map(event => (
                <TouchableOpacity key={event.id} style={styles.nearRow} onPress={() => router.push(`/event/${event.id}`)}>
                  <View>
                    <Text style={styles.nearName}>{event.name}</Text>
                    <Text style={styles.nearSub}>{event.distance} · {event.entry}</Text>
                  </View>
                  <View style={styles.nearScore}>
                    <Text style={styles.nearScoreTxt}>{event.score}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scroll:        { flex: 1 },
  header:        { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:   { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', margin: 14, backgroundColor: Colors.surface, borderRadius: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  searchIcon:    { fontSize: 14, marginRight: 8 },
  searchInput:   { flex: 1, height: 44, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  section:       { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel:  { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim, marginBottom: 10 },
  resultRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  resultName:    { fontSize: 16, fontFamily: Fonts.display, color: Colors.cream },
  resultSub:     { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  resultScore:   { fontSize: 24, fontFamily: Fonts.display, color: Colors.red },
  trendCard:     { backgroundColor: Colors.surface, borderRadius: 5, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 2, borderLeftColor: 'transparent' },
  trendCardHot:  { borderLeftColor: Colors.red },
  trendLeft:     {},
  trendName:     { fontSize: 17, fontFamily: Fonts.display, color: Colors.cream },
  trendSub:      { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  trendScore:    { fontSize: 28, fontFamily: Fonts.display, color: Colors.red },
  vibeRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vibePill:      { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  vibeTxt:       { fontSize: 12, fontFamily: Fonts.bodyMedium, color: Colors.mid },
  nearRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  nearName:      { fontSize: 14, fontFamily: Fonts.display, color: Colors.cream },
  nearSub:       { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  nearScore:     { backgroundColor: Colors.surface, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  nearScoreTxt:  { fontSize: 15, fontFamily: Fonts.display, color: Colors.red },
});
