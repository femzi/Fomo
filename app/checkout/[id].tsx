import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import { PAYSTACK_PUBLIC_KEY } from '../../constants/Payments';
import { parseNaira, formatNaira } from '../../utils/money';

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, recordTicketPurchase } = useApp();
  const event = events.find(e => e.id === id);
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState('');
  const [paying, setPaying] = useState(false);

  if (!event) return <SafeAreaView style={styles.safe}><Text style={{ color: Colors.cream, padding: 20 }}>Event not found.</Text></SafeAreaView>;

  const unitPrice = parseNaira(event.entry);
  const total = unitPrice * qty;
  const soldOut = event.ticketsSold >= event.ticketsTotal;
  const maxQty = Math.min(10, event.ticketsTotal - event.ticketsSold);

  function handlePay() {
    if (unitPrice === 0) {
      const ref = 'FREE-' + Date.now();
      recordTicketPurchase(event.id, qty, ref);
      Alert.alert('🎉 Got it!', `Your free ticket for ${event.name} is confirmed.`, [{ text: 'View Tickets', onPress: () => router.replace('/(tabs)/tickets') }]);
      return;
    }
    if (!email.trim()) { Alert.alert('Email needed', 'Enter your email for the Paystack receipt.'); return; }
    if (PAYSTACK_PUBLIC_KEY.includes('REPLACE')) {
      Alert.alert('No Paystack key', 'Add your test public key in constants/Payments.ts to test payment.');
      return;
    }
    setPaying(true);
    // Real Paystack integration would open a webview/iframe here.
    // Simulating success after 2 seconds for testing.
    setTimeout(() => {
      const ref = 'PAY-' + Date.now();
      recordTicketPurchase(event.id, qty, ref);
      setPaying(false);
      Alert.alert('✅ Payment confirmed', `${qty} ticket${qty > 1 ? 's' : ''} for ${event.name}.`, [{ text: 'View Tickets', onPress: () => router.replace('/(tabs)/tickets') }]);
    }, 2000);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>CHECKOUT</Text>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={styles.eventSub}>{event.venue} · {event.time}</Text>

          {soldOut ? (
            <View style={styles.soldOutBox}><Text style={styles.soldOutTxt}>SOLD OUT</Text></View>
          ) : (
            <>
              {PAYSTACK_PUBLIC_KEY.includes('REPLACE') && unitPrice > 0 && (
                <View style={styles.warnBox}>
                  <Text style={styles.warnTxt}>⚠️ Add your Paystack test key in constants/Payments.ts to test payment flow.</Text>
                </View>
              )}

              <View style={styles.box}>
                <Text style={styles.boxLabel}>TICKET PRICE</Text>
                <Text style={styles.boxValue}>{unitPrice === 0 ? 'FREE' : formatNaira(unitPrice)} per ticket</Text>
              </View>

              <View style={styles.box}>
                <Text style={styles.boxLabel}>QUANTITY</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                    <Text style={styles.qtyBtnTxt}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyVal}>{qty}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(maxQty, q + 1))}>
                    <Text style={styles.qtyBtnTxt}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {unitPrice > 0 && (
                <View style={styles.box}>
                  <Text style={styles.boxLabel}>EMAIL FOR RECEIPT</Text>
                  <TextInput style={styles.emailInput} value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={Colors.dim} autoCapitalize="none" keyboardType="email-address" />
                </View>
              )}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL</Text>
                <Text style={styles.totalValue}>{unitPrice === 0 ? 'FREE' : formatNaira(total)}</Text>
              </View>

              <TouchableOpacity style={[styles.payBtn, paying && styles.payBtnOff]} onPress={handlePay} disabled={paying}>
                <Text style={styles.payTxt}>{paying ? 'PROCESSING...' : unitPrice === 0 ? 'GET FREE TICKET' : 'PAY WITH PAYSTACK'}</Text>
              </TouchableOpacity>

              <Text style={styles.note}>
                {unitPrice === 0 ? 'No payment needed.' : 'Test card: 4084 0840 8408 4081 · any future date · any CVV'}
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:         { flex: 1, backgroundColor: Colors.bg },
  topBar:       { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backTxt:      { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  content:      { padding: 16, gap: 14, paddingBottom: 40 },
  title:        { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  eventName:    { fontSize: 18, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 0.5 },
  eventSub:     { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: -8 },
  soldOutBox:   { backgroundColor: Colors.surface2, borderRadius: 6, padding: 20, alignItems: 'center' },
  soldOutTxt:   { fontSize: 18, fontFamily: Fonts.display, color: Colors.dim, letterSpacing: 2 },
  warnBox:      { backgroundColor: Colors.surface, borderRadius: 6, padding: 12, borderWidth: 1, borderColor: '#7a5500' },
  warnTxt:      { fontSize: 11, fontFamily: Fonts.body, color: '#c8940a', lineHeight: 16 },
  box:          { backgroundColor: Colors.surface, borderRadius: 6, padding: 14, gap: 8 },
  boxLabel:     { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 2 },
  boxValue:     { fontSize: 15, fontFamily: Fonts.bodySemiBold, color: Colors.cream },
  qtyRow:       { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyBtn:       { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface2, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border2 },
  qtyBtnTxt:    { fontSize: 18, color: Colors.cream, fontWeight: '700' },
  qtyVal:       { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream, minWidth: 30, textAlign: 'center' },
  emailInput:   { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  totalRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4 },
  totalLabel:   { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.dim, letterSpacing: 2 },
  totalValue:   { fontSize: 24, fontFamily: Fonts.display, color: Colors.cream },
  payBtn:       { backgroundColor: Colors.red, borderRadius: 5, padding: 16, alignItems: 'center' },
  payBtnOff:    { backgroundColor: Colors.surface2 },
  payTxt:       { fontSize: 15, fontFamily: Fonts.display, color: '#fff', letterSpacing: 2 },
  note:         { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', lineHeight: 15 },
});
