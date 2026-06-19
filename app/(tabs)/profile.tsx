import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { events } from '../../constants/Data';
import { useApp } from '../../context/AppContext';

const upcomingEvent = events[0];
const pastEvents    = events.slice(1, 4);

export default function ProfileScreen() {
  const router = useRouter();
  const { people, hosts } = useApp();
  const followingCount = people.filter(p => p.isFollowing).length + hosts.filter(h => h.isFollowing).length;
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

        <View style={styles.statsRow}>
          {[{ n: '23', l: 'Events' }, { n: String(followingCount), l: 'Following' }, { n: '8', l: 'Reviews' }].map((s, i) => (
            <React.Fragment key={s.l}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statBox}>
                <Text style={styles.statN}>{s.n}</Text>
                <Text style={styles.statL}>{s.l}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NEXT UP</Text>
          <TouchableOpacity style={styles.nextCard} onPress={() => router.push(`/event/${upcomingEvent.id}`)}>
            <View>
              <Text style={styles.nextName}>{upcomingEvent.name}</Text>
              <Text style={styles.nextSub}>{upcomingEvent.venue} · FRI 24 OCT</Text>
            </View>
            <View style={styles.goingBadge}><Text style={styles.goingTxt}>GOING →</Text></View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PAST EVENTS</Text>
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
          {['Notifications', 'Music preferences', 'Privacy', 'Help', 'Log out'].map(item => (
            <TouchableOpacity key={item} style={styles.settingRow}>
              <Text style={[styles.settingTxt, item === 'Log out' && { color: Colors.red }]}>{item}</Text>
              <Text style={styles.settingArrow}>{item !== 'Log out' ? '›' : ''}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
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
});
