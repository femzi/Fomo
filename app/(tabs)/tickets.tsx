import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import { parseNaira, formatNaira } from '../../utils/money';

export default function TicketsScreen() {
  const { myTickets, events } = useApp();
  const ticketsWithEvents = myTickets.map(t => ({ ticket: t, event: events.find(e => e.id === t.eventId) })).filter(x => x.event);
  const totalSpent = ticketsWithEvents.reduce((sum, { ticket, event }) => sum + parseNaira(event!.entry) * ticket.quantity, 0);
  const totalBought = myTickets.reduce((sum, t) => sum + t.quantity, 0);
  const uniqueEvents = new Set(myTickets.map(t => t.eventId)).size;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}><Text style={styles.headerTitle}>TICKETS</Text></View>

        <View style={styles.summaryCard}>
          {[{ n: String(uniqueEvents), l: 'Events Attended' }, { n: String(totalBought), l: 'Tickets Bought' }].map((s, i) => (
            <React.Fragment key={s.l}>
              {i > 0 && <View style={styles.div} />}
              <View style={styles.statBox}>
                <Text style={styles.statN}>{s.n}</Text>
                <Text style={styles.statL}>{s.l}</Text>
              </View>
            </React.Fragment>
          ))}
          <View style={styles.div} />
          <View style={styles.statBox}>
            <Text style={[styles.statN, { fontSize: 16, color: Colors.red }]}>{formatNaira(totalSpent)}</Text>
            <Text style={styles.statL}>Total Spent</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TICKET HISTORY</Text>
          {ticketsWithEvents.length === 0 && <Text style={styles.emptyTxt}>No tickets yet. Buy one from any event page.</Text>}
          {ticketsWithEvents.map(({ ticket: t, event }) => {
            const spent = parseNaira(event!.entry) * t.quantity;
            return (
              <View key={t.id} style={styles.ticketCard}>
                <View style={styles.ticketTop}>
                  <Text style={styles.validTxt}>✓ VALID</Text>
                  <Text style={styles.spentTxt}>{spent === 0 ? 'FREE' : formatNaira(spent)}</Text>
                </View>
                <Text style={styles.ticketEvent}>{event!.name}</Text>
                <Text style={styles.ticketVenue}>{event!.venue}</Text>
                <Text style={styles.ticketMeta}>{event!.time} · QTY {t.quantity}</Text>
                <View style={styles.divLine}>
                  <View style={styles.cutL} /><View style={styles.dashed} /><View style={styles.cutR} />
                </View>
                <View style={styles.qrRow}>
                  <View style={styles.qrBox}><Text style={styles.qrTxt}>{'██  ██\nQR\n██  ██'}</Text></View>
                  <View>
                    <Text style={styles.refTxt}>Ref: {t.reference}</Text>
                    <Text style={styles.dateTxt}>{new Date(t.purchasedAt).toLocaleDateString()}</Text>
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
  safe:         { flex: 1, backgroundColor: Colors.bg },
  header:       { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:  { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  summaryCard:  { flexDirection: 'row', margin: 16, backgroundColor: Colors.surface, borderRadius: 8, paddingVertical: 16 },
  statBox:      { flex: 1, alignItems: 'center', gap: 4 },
  statN:        { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream },
  statL:        { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 0.5, textAlign: 'center' },
  div:          { width: 1, backgroundColor: Colors.border },
  section:      { padding: 16, gap: 10 },
  sectionLabel: { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim },
  emptyTxt:     { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim },
  ticketCard:   { backgroundColor: Colors.surface, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  ticketTop:    { backgroundColor: Colors.red, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' },
  validTxt:     { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
  spentTxt:     { fontSize: 10, fontFamily: Fonts.bodyBold, color: '#fff' },
  ticketEvent:  { fontSize: 24, fontFamily: Fonts.display, color: Colors.cream, paddingHorizontal: 14, paddingTop: 12, letterSpacing: 1 },
  ticketVenue:  { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, paddingHorizontal: 14, paddingTop: 3 },
  ticketMeta:   { fontSize: 10, fontFamily: Fonts.bodyMedium, color: Colors.mid, paddingHorizontal: 14, paddingTop: 2, paddingBottom: 12 },
  divLine:      { flexDirection: 'row', alignItems: 'center' },
  cutL:         { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.bg, marginLeft: -8 },
  dashed:       { flex: 1, height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: Colors.border2 },
  cutR:         { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.bg, marginRight: -8 },
  qrRow:        { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 14 },
  qrBox:        { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  qrTxt:        { fontSize: 10, color: '#000', textAlign: 'center', lineHeight: 18 },
  refTxt:       { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.cream },
  dateTxt:      { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 3 },
});
