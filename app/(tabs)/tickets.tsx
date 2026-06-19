import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

export default function TicketsScreen() {
  const { myTickets, events } = useApp();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>TICKETS</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MY TICKETS</Text>
          {myTickets.length === 0 && (
            <Text style={styles.emptyTxt}>No tickets yet. Buy one from any event page.</Text>
          )}
          {myTickets.map(t => {
            const event = events.find(e => e.id === t.eventId);
            if (!event) return null;
            return (
              <View key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketTop}>
                  <View style={styles.validBadge}><Text style={styles.validTxt}>✓ VALID</Text></View>
                </View>
                <Text style={styles.ticketEvent}>{event.name}</Text>
                <Text style={styles.ticketVenue}>{event.venue}</Text>
                <Text style={styles.ticketDate}>{event.time} · QTY {t.quantity}</Text>
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
                    <Text style={styles.qrType}>Ref: {t.reference}</Text>
                    <Text style={styles.qrRef}>{new Date(t.purchasedAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  emptyTxt:      { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 17 },
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
});
