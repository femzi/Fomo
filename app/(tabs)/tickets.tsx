import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';

const myTickets = [
  { id: 't1', event: 'FOMO VOL. 1', venue: 'Muse Events Space', date: 'FRI 24 OCT · 10PM', type: 'Regular Admission', ref: '#FM-8847' },
];

const preOrders = [
  { id: 'p1', event: 'FOMO NETWORK LAUNCH', date: 'DATE TBC' },
];

export default function TicketsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>TICKETS</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MY TICKETS</Text>
          {myTickets.map(t => (
            <View key={t.id} style={styles.ticketCard}>
              <View style={styles.ticketTop}>
                <View style={styles.validBadge}><Text style={styles.validTxt}>✓ VALID</Text></View>
              </View>
              <Text style={styles.ticketEvent}>{t.event}</Text>
              <Text style={styles.ticketVenue}>{t.venue}</Text>
              <Text style={styles.ticketDate}>{t.date}</Text>
              <View style={styles.ticketDivider}>
                <View style={styles.cutoutL} />
                <View style={styles.dashedLine} />
                <View style={styles.cutoutR} />
              </View>
              <View style={styles.qrArea}>
                <View style={styles.qrBox}>
                  <Text style={styles.qrPlaceholder}>{'██  ██\nQR CODE\n██  ██'}</Text>
                </View>
                <View style={styles.qrInfo}>
                  <Text style={styles.qrName}>OLUWAFEMI A.</Text>
                  <Text style={styles.qrType}>{t.type}</Text>
                  <Text style={styles.qrRef}>{t.ref}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PRE-ORDERS</Text>
          {preOrders.map(p => (
            <View key={p.id} style={styles.preCard}>
              <View>
                <Text style={styles.preName}>{p.event}</Text>
                <Text style={styles.preDate}>{p.date}</Text>
              </View>
              <View style={styles.preBadge}><Text style={styles.preBadgeTxt}>WAITING</Text></View>
            </View>
          ))}
          <Text style={styles.preNote}>You'll be notified the moment a date is announced.</Text>
        </View>

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
  section:       { padding: 16, gap: 10, marginBottom: 4 },
  sectionLabel:  { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim, marginBottom: 6 },
  ticketCard:    { backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  ticketTop:     { backgroundColor: Colors.red, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'flex-end' },
  validBadge:    {},
  validTxt:      { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
  ticketEvent:   { fontSize: 24, fontFamily: Fonts.display, color: Colors.cream, paddingHorizontal: 14, paddingTop: 12, letterSpacing: 1 },
  ticketVenue:   { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, paddingHorizontal: 14, paddingTop: 3 },
  ticketDate:    { fontSize: 10, fontFamily: Fonts.bodyMedium, color: Colors.mid, paddingHorizontal: 14, paddingTop: 2, paddingBottom: 12 },
  ticketDivider: { flexDirection: 'row', alignItems: 'center' },
  cutoutL:       { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.bg, marginLeft: -8 },
  dashedLine:    { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border2 },
  cutoutR:       { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.bg, marginRight: -8 },
  qrArea:        { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  qrBox:         { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  qrPlaceholder: { fontSize: 11, color: '#000', textAlign: 'center', lineHeight: 18 },
  qrInfo:        { flex: 1 },
  qrName:        { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream },
  qrType:        { fontSize: 10, fontFamily: Fonts.body, color: Colors.mid, marginTop: 3 },
  qrRef:         { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  preCard:       { backgroundColor: Colors.surface, borderRadius: 5, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 2, borderLeftColor: Colors.dim },
  preName:       { fontSize: 16, fontFamily: Fonts.display, color: Colors.cream },
  preDate:       { fontSize: 10, fontFamily: Fonts.bodyMedium, color: Colors.dim, marginTop: 3 },
  preBadge:      { borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 3 },
  preBadgeTxt:   { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 1 },
  preNote:       { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 15 },
});
