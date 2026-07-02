import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import type { Message } from '../../constants/Data';

function CheckInBubble({ message, onRespond }: { message: Message; onRespond: (status: 'in' | 'out') => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, []);

  if (!message.checkin) return null;
  const remaining = Math.max(0, Math.ceil((message.checkin.deadline - now) / 1000));
  const expired = remaining <= 0;
  const myResponse = message.checkin.responses.find(r => r.personId === 'me');
  const inCount = message.checkin.responses.filter(r => r.status === 'in').length;
  const outCount = message.checkin.responses.filter(r => r.status === 'out').length;

  // Once expired: collapse to a plain tally line, popup disappears
  if (expired) {
    return (
      <View style={styles.sysMsg}>
        <Text style={styles.sysMsgTxt}>✅ Check-in result: {inCount} IN · {outCount} OUT</Text>
      </View>
    );
  }

  return (
    <View style={styles.checkinBubble}>
      <Text style={styles.checkinTitle}>{message.text}</Text>
      {!myResponse ? (
        <>
          <Text style={styles.checkinTimer}>{remaining}s left</Text>
          <View style={styles.checkinBtnRow}>
            <TouchableOpacity style={styles.checkinInBtn} onPress={() => onRespond('in')}>
              <Text style={styles.checkinInTxt}>✅ I'M IN</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkinOutBtn} onPress={() => onRespond('out')}>
              <Text style={styles.checkinOutTxt}>❌ I'M OUT</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.checkinWaiting}>
          You said {myResponse.status === 'in' ? '✅ IN' : '❌ OUT'} · waiting on others ({remaining}s)
        </Text>
      )}
      {message.checkin.responses.length > 0 && (
        <View style={styles.checkinResponses}>
          {message.checkin.responses.map(r => (
            <View key={r.personId} style={styles.responseChip}>
              <Text style={styles.responseChipTxt}>
                {r.personId === 'me' ? 'You' : r.personId} {r.status === 'in' ? '✅' : '❌'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { conversations, sendMessage, sendCheckIn, respondToCheckIn, events } = useApp();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const conversation = conversations.find(c => c.id === id);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backTxt}>← BACK</Text></TouchableOpacity>
        </View>
        <Text style={styles.emptyTxt}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(conversation!.id, text.trim());
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backTxt}>← BACK</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={[styles.av, { backgroundColor: conversation.avatarColor }]}>
              <Text style={styles.avTxt}>{conversation.avatarInitial}</Text>
            </View>
            <View>
              <Text style={styles.headerName}>{conversation.name}</Text>
              {conversation.type === 'group' && <Text style={styles.headerSub}>{conversation.memberIds.length} members</Text>}
            </View>
          </View>
          {conversation.type === 'group' ? (
            <TouchableOpacity style={styles.alarmBtn} onPress={() => sendCheckIn(conversation.id)}>
              <Text style={styles.alarmTxt}>🚨</Text>
            </TouchableOpacity>
          ) : <View style={{ width: 44 }} />}
        </View>

        <ScrollView ref={scrollRef} style={styles.msgArea} contentContainerStyle={{ padding: 14, gap: 10 }} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
          {conversation.messages.length === 0 && (
            <Text style={styles.emptyTxt}>No messages yet.{conversation.type === 'group' ? " Tap 🚨 to check who's coming." : ''}</Text>
          )}
          {conversation.messages.map(m => {
            if (m.checkin) return <CheckInBubble key={m.id} message={m} onRespond={status => respondToCheckIn(conversation.id, m.id, status)} />;
            if (m.sharedEventId) {
              const ev = events.find(e => e.id === m.sharedEventId);
              return (
                <TouchableOpacity key={m.id} style={styles.sharedCard} onPress={() => ev && router.push(`/event/${ev.id}`)}>
                  <Text style={styles.sharedLabel}>📍 SHARED EVENT</Text>
                  <Text style={styles.sharedName}>{ev?.name ?? 'Event'}</Text>
                  {ev && <Text style={styles.sharedSub}>{ev.venue} · {ev.time}</Text>}
                  <Text style={styles.sharedLink}>Tap to view →</Text>
                </TouchableOpacity>
              );
            }
            if (m.isSystem) return <View key={m.id} style={styles.sysMsg}><Text style={styles.sysMsgTxt}>{m.text}</Text></View>;
            if (m.senderId === 'me') return <View key={m.id} style={styles.msgOut}><Text style={styles.msgOutTxt}>{m.text}</Text></View>;
            return (
              <View key={m.id} style={styles.msgInWrap}>
                {conversation.type === 'group' && <Text style={styles.msgSender}>{m.senderName}</Text>}
                <View style={styles.msgIn}><Text style={styles.msgInTxt}>{m.text}</Text></View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.inputRow}>
          <TextInput style={styles.chatInput} value={text} onChangeText={setText} placeholder="Type a message..." placeholderTextColor={Colors.dim} onSubmitEditing={handleSend} returnKeyType="send" />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}><Text style={styles.sendTxt}>→</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:             { flex: 1, backgroundColor: Colors.bg },
  topBar:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:          { width: 50 },
  backTxt:          { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  headerCenter:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  av:               { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  avTxt:            { fontSize: 14, fontFamily: Fonts.display, color: '#fff' },
  headerName:       { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream },
  headerSub:        { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim, marginTop: 1 },
  alarmBtn:         { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.redDim, justifyContent: 'center', alignItems: 'center' },
  alarmTxt:         { fontSize: 16 },
  msgArea:          { flex: 1 },
  emptyTxt:         { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', marginTop: 30, lineHeight: 17, paddingHorizontal: 20 },
  sysMsg:           { alignSelf: 'center', backgroundColor: Colors.surface2, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, borderWidth: 1, borderColor: Colors.border },
  sysMsgTxt:        { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center' },
  msgOut:           { alignSelf: 'flex-end', backgroundColor: Colors.red, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, borderBottomRightRadius: 3, maxWidth: '78%' },
  msgOutTxt:        { fontSize: 13, fontFamily: Fonts.body, color: '#fff' },
  msgInWrap:        { alignSelf: 'flex-start', maxWidth: '78%' },
  msgSender:        { fontSize: 9, fontFamily: Fonts.bodyMedium, color: Colors.dim, marginBottom: 3, marginLeft: 2 },
  msgIn:            { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, borderBottomLeftRadius: 3 },
  msgInTxt:         { fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  inputRow:         { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  chatInput:        { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  sendBtn:          { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center' },
  sendTxt:          { fontSize: 16, color: '#fff' },
  checkinBubble:    { alignSelf: 'center', backgroundColor: Colors.surface, borderRadius: 10, padding: 14, gap: 8, borderWidth: 1, borderColor: Colors.redDim, width: '92%' },
  checkinTitle:     { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream, textAlign: 'center' },
  checkinTimer:     { fontSize: 20, fontFamily: Fonts.display, color: Colors.red, textAlign: 'center' },
  checkinBtnRow:    { flexDirection: 'row', gap: 8 },
  checkinInBtn:     { flex: 1, backgroundColor: '#234d22', borderRadius: 6, paddingVertical: 12, alignItems: 'center' },
  checkinInTxt:     { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff' },
  checkinOutBtn:    { flex: 1, backgroundColor: Colors.surface2, borderRadius: 6, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border2 },
  checkinOutTxt:    { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid },
  checkinWaiting:   { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center' },
  checkinResponses: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  responseChip:     { backgroundColor: Colors.surface2, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
  responseChipTxt:  { fontSize: 9, fontFamily: Fonts.bodyMedium, color: Colors.mid },
  sharedCard:       { alignSelf: 'flex-start', backgroundColor: Colors.surface, borderRadius: 10, padding: 14, gap: 4, borderLeftWidth: 2, borderLeftColor: Colors.red, maxWidth: '85%' },
  sharedLabel:      { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1.5 },
  sharedName:       { fontSize: 16, fontFamily: Fonts.display, color: Colors.cream, marginTop: 2 },
  sharedSub:        { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim },
  sharedLink:       { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red, marginTop: 4 },
});
