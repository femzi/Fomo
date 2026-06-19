import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { conversations, sendMessage } = useApp();
  const [text, setText] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const conversation = conversations.find(c => c.id === id);

  if (!conversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backTxt}>← BACK</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.emptyTxt}>Conversation not found.</Text>
      </SafeAreaView>
    );
  }

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(conversation.id, text.trim());
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Header */}
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
              {conversation.type === 'group' && (
                <Text style={styles.headerSub}>{conversation.memberIds.length} members</Text>
              )}
            </View>
          </View>
          <View style={{ width: 50 }} />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.msgArea}
          contentContainerStyle={{ padding: 14, gap: 10 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {conversation.messages.length === 0 && (
            <Text style={styles.emptyTxt}>No messages yet. Say something to get it started.</Text>
          )}
          {conversation.messages.map(m => (
            m.isSystem ? (
              <View key={m.id} style={styles.sysMsg}>
                <Text style={styles.sysMsgTxt}>{m.text}</Text>
              </View>
            ) : m.senderId === 'me' ? (
              <View key={m.id} style={styles.msgOut}>
                <Text style={styles.msgOutTxt}>{m.text}</Text>
              </View>
            ) : (
              <View key={m.id} style={styles.msgInWrap}>
                {conversation.type === 'group' && (
                  <Text style={styles.msgSender}>{m.senderName}</Text>
                )}
                <View style={styles.msgIn}>
                  <Text style={styles.msgInTxt}>{m.text}</Text>
                </View>
              </View>
            )
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            value={text}
            onChangeText={setText}
            placeholder="Type a message..."
            placeholderTextColor={Colors.dim}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendTxt}>→</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  topBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn:       { width: 50 },
  backTxt:       { fontSize: 11, fontFamily: Fonts.bodySemiBold, color: Colors.dim, letterSpacing: 1 },
  headerCenter:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  av:            { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  avTxt:         { fontSize: 14, fontFamily: Fonts.display, color: '#fff' },
  headerName:    { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream },
  headerSub:     { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim, marginTop: 1 },
  msgArea:       { flex: 1 },
  emptyTxt:      { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center', marginTop: 30 },
  sysMsg:        { alignSelf: 'center', backgroundColor: Colors.surface2, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 4, borderWidth: 1, borderColor: Colors.border },
  sysMsgTxt:     { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, textAlign: 'center' },
  msgOut:        { alignSelf: 'flex-end', backgroundColor: Colors.red, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, borderBottomRightRadius: 3, maxWidth: '78%' },
  msgOutTxt:     { fontSize: 13, fontFamily: Fonts.body, color: '#fff' },
  msgInWrap:     { alignSelf: 'flex-start', maxWidth: '78%' },
  msgSender:     { fontSize: 9, fontFamily: Fonts.bodyMedium, color: Colors.dim, marginBottom: 3, marginLeft: 2 },
  msgIn:         { backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 14, borderBottomLeftRadius: 3 },
  msgInTxt:      { fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  inputRow:      { flexDirection: 'row', gap: 8, alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  chatInput:     { flex: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  sendBtn:       { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.red, justifyContent: 'center', alignItems: 'center' },
  sendTxt:       { fontSize: 16, color: '#fff' },
});
