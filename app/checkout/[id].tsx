import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  StyleSheet, SafeAreaView, Alert, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import { PAYSTACK_PUBLIC_KEY } from '../../constants/Payments';

function parseNaira(str: string): number {
  if (str.toLowerCase().includes('free')) return 0;
  const digits = str.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { events, recordTicketPurchase } = useApp();
  const event = events.find(e => e.id === id);

  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [scriptReady, setScriptReady] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (typeof document === 'undefined') return;
    if ((window as any).PaystackPop) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
  }, []);

  if (!event) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: Colors.cream, padding: 20 }}>Event not found.</Text>
      </SafeAreaView>
    );
  }

  const unitPrice = parseNaira(event.entry);
  const total = unitPrice * quantity;
  const ticketsLeft = event.ticketsTotal - event.ticketsSold;

  function handlePay() {
    if (unitPrice === 0) {
      const ref = 'FOMO_FREE_' + Date.now();
      recordTicketPurchase(event!.id, quantity, ref);
      Alert.alert('🎉 You\'re in!', 'Your free ticket is in the Tickets tab.');
      router.replace('/(tabs)/tickets');
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Mobile checkout coming soon',
        'Payments are currently wired up for web testing only. Switch to the web preview to test this flow.'
      );
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Email needed', 'Enter a valid email to continue — Paystack uses it for the receipt.');
      return;
    }

    if (!scriptReady || !(window as any).PaystackPop) {
      Alert.alert('Still loading', 'Payment system is loading — try again in a second.');
      return;
    }

    setPaying(true);
    const reference = 'FOMO_' + Date.now();

    (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: total * 100, // kobo
      currency: 'NGN',
      ref: reference,
      callback: (response: any) => {
        setPaying(false);
        recordTicketPurchase(event!.id, quantity, response.reference ?? reference);
        Alert.alert('🎉 Payment successful', 'Your ticket is ready in the Tickets tab.');
        router.replace('/(tabs)/tickets');
      },
      onClose: () => {
        setPaying(false);
      },
    }).openIframe();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backTxt}>← BACK</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>CHECKOUT</Text>
        <Text style={styles.eventName}>{event.name}</Text>
        <Text style={styles.eventSub}>{event.venue} · {event.time}</Text>

        {PAYSTACK_PUBLIC_KEY.includes('REPLACE') && unitPrice > 0 && (
          <View style={styles.warnBox}>
            <Text style={styles.warnTxt}>
              ⚠️ No Paystack test key set yet. Add your public test key in constants/Payments.ts to make payment actually work.
            </Text>
          </View>
        )}

        <View style={styles.qtyCard}>
          <Text style={styles.qtyLabel}>QUANTITY</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(q => Math.max(1, q - 1))}>
              <Text style={styles.qtyBtnTxt}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyNum}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(q => Math.min(ticketsLeft, q + 1))}
            >
              <Text style={styles.qtyBtnTxt}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.qtyNote}>{ticketsLeft} tickets left</Text>
        </View>

        {unitPrice > 0 && (
          <View style={styles.emailCard}>
            <Text style={styles.qtyLabel}>EMAIL FOR RECEIPT</Text>
            <TextInput
              style={styles.emailInput}
              value={email}
              onChangeText={setEmail}
              placeholder="you@email.com"
              placeholderTextColor={Colors.dim}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        )}

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{event.entry} × {quantity}</Text>
            <Text style={styles.summaryValue}>₦{total.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>{unitPrice === 0 ? 'FREE' : `₦${total.toLocaleString()}`}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={paying}>
          <Text style={styles.payTxt}>
            {paying ? 'OPENING PAYSTACK...' : unitPrice === 0 ? 'GET FREE TICKET' : 'PAY WITH PAYSTACK'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.smallNote}>
          {unitPrice === 0
            ? 'No payment needed for free entry events.'
            : 'Test mode — use Paystack test card 4084 0840 8408 4081 with any future date and CVV.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  topBar:        { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  backTxt:       { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  content:       { padding: 16, gap: 16 },
  title:         { fontSize: 26, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  eventName:     { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, marginTop: 4 },
  eventSub:      { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  warnBox:       { backgroundColor: 'rgba(204,41,41,0.12)', borderWidth: 1, borderColor: Colors.redDim, borderRadius: 6, padding: 12 },
  warnTxt:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.red, lineHeight: 16 },
  qtyCard:       { backgroundColor: Colors.surface, borderRadius: 6, padding: 16, alignItems: 'center', gap: 10 },
  qtyLabel:      { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim },
  qtyRow:        { flexDirection: 'row', alignItems: 'center', gap: 24 },
  qtyBtn:        { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: Colors.border2, justifyContent: 'center', alignItems: 'center' },
  qtyBtnTxt:     { fontSize: 18, color: Colors.cream, fontFamily: Fonts.bodyBold },
  qtyNum:        { fontSize: 28, fontFamily: Fonts.display, color: Colors.cream, width: 40, textAlign: 'center' },
  qtyNote:       { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim },
  emailCard:     { backgroundColor: Colors.surface, borderRadius: 6, padding: 16, gap: 10 },
  emailInput:    { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  summaryCard:   { backgroundColor: Colors.surface, borderRadius: 6, overflow: 'hidden' },
  summaryRow:    { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  summaryLabel:  { fontSize: 12, fontFamily: Fonts.body, color: Colors.mid },
  summaryValue:  { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream },
  summaryTotal:  { backgroundColor: Colors.red },
  totalLabel:    { fontSize: 13, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
  totalValue:    { fontSize: 17, fontFamily: Fonts.display, color: '#fff' },
  payBtn:        { backgroundColor: Colors.cream, borderRadius: 5, padding: 18, alignItems: 'center' },
  payTxt:        { fontSize: 15, fontFamily: Fonts.display, color: Colors.bg, letterSpacing: 2 },
  smallNote:     { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', lineHeight: 15 },
});
