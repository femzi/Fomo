import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';
import { getMutualFriends, getStatusTier } from '../../utils/social';

export default function ChatsScreen() {
  const { people, togglePersonFollow, conversations, startDM, createGroup } = useApp();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filteredPeople = search.length > 0
    ? people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : [...people].sort((a, b) => {
        if (a.isFollowing !== b.isFollowing) return a.isFollowing ? -1 : 1;
        return getMutualFriends(b, people).length - getMutualFriends(a, people).length;
      });

  function openDM(personId: string) {
    const id = startDM(personId);
    router.push(`/chat/${id}`);
  }

  function handleCreateGroup() {
    if (!groupName.trim() || selected.length === 0) return;
    const id = createGroup(groupName.trim(), selected);
    setGroupModal(false);
    setGroupName('');
    setSelected([]);
    router.push(`/chat/${id}`);
  }

  const followed = people.filter(p => p.isFollowing);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>CHATS</Text>
          <TouchableOpacity style={styles.newGroupBtn} onPress={() => setGroupModal(true)}>
            <Text style={styles.newGroupTxt}>+ GROUP</Text>
          </TouchableOpacity>
        </View>

        {/* People to follow / message */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PEOPLE</Text>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search people..."
              placeholderTextColor={Colors.dim}
            />
          </View>

          {filteredPeople.map(p => {
            const mutuals = getMutualFriends(p, people);
            const tier = getStatusTier(p.fomoScore);
            return (
              <View key={p.id} style={styles.personRow}>
                <TouchableOpacity
                  style={styles.personLeft}
                  onPress={() => p.isFollowing ? openDM(p.id) : router.push(`/person/${p.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.av, { backgroundColor: p.color }]}>
                    <Text style={styles.avTxt}>{p.initial}</Text>
                  </View>
                  <View style={styles.personInfo}>
                    <View style={styles.personNameRow}>
                      <Text style={styles.personName}>{p.name}</Text>
                      <Text style={styles.statusIcon}>{tier.icon}</Text>
                    </View>
                    <Text style={styles.personSub}>
                      {p.isFollowing
                        ? 'Tap to message'
                        : mutuals.length > 0
                          ? `👥 ${mutuals.length} mutual friend${mutuals.length > 1 ? 's' : ''}`
                          : `@${p.username}`}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.followBtn, p.isFollowing && styles.followBtnOn]}
                  onPress={() => togglePersonFollow(p.id)}
                >
                  <Text style={[styles.followTxt, p.isFollowing && styles.followTxtOn]}>
                    {p.isFollowing ? 'FOLLOWING' : 'ADD'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Conversations */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>CONVERSATIONS</Text>
          {conversations.length === 0 && (
            <Text style={styles.emptyTxt}>No conversations yet. Follow someone or start a group.</Text>
          )}
          {conversations.map(c => {
            const lastMsg = c.messages[c.messages.length - 1];
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.convoRow}
                onPress={() => router.push(`/chat/${c.id}`)}
              >
                <View style={[styles.convoAv, { backgroundColor: c.avatarColor }]}>
                  <Text style={styles.convoAvTxt}>{c.avatarInitial}</Text>
                </View>
                <View style={styles.convoInfo}>
                  <View style={styles.convoTop}>
                    <Text style={styles.convoName}>{c.name}</Text>
                    {c.type === 'group' && <Text style={styles.groupTag}>GROUP</Text>}
                  </View>
                  {lastMsg && (
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {lastMsg.senderId === 'me' ? 'You: ' : ''}{lastMsg.text}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      <Modal visible={groupModal} animationType="slide" transparent onRequestClose={() => setGroupModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>NEW GROUP</Text>
            <TextInput
              style={styles.modalInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name"
              placeholderTextColor={Colors.dim}
              autoFocus
            />
            <Text style={styles.fieldLabel}>SELECT MEMBERS</Text>
            <ScrollView style={{ maxHeight: 180 }}>
              {followed.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.memberRow, selected.includes(p.id) && styles.memberRowOn]}
                  onPress={() => setSelected(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])}
                >
                  <View style={[styles.memberAv, { backgroundColor: p.color }]}>
                    <Text style={styles.memberAvTxt}>{p.initial}</Text>
                  </View>
                  <Text style={styles.memberName}>{p.name}</Text>
                  {selected.includes(p.id) && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setGroupModal(false)}>
                <Text style={styles.cancelTxt}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, (!groupName.trim() || selected.length === 0) && styles.createBtnOff]}
                onPress={handleCreateGroup}
                disabled={!groupName.trim() || selected.length === 0}
              >
                <Text style={styles.createTxt}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:          { flex: 1, backgroundColor: Colors.bg },
  scroll:        { flex: 1 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:   { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  newGroupBtn:   { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 4 },
  newGroupTxt:   { fontSize: 10, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  section:       { padding: 16, gap: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sectionLabel:  { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim },
  searchWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  searchIcon:    { fontSize: 14, marginRight: 8 },
  searchInput:   { flex: 1, height: 40, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  personRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  personLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  av:            { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avTxt:         { fontSize: 16, fontFamily: Fonts.display, color: '#fff' },
  personInfo:    { flex: 1 },
  personNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  personName:    { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream },
  statusIcon:    { fontSize: 12 },
  personSub:     { fontSize: 10, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  followBtn:     { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 3 },
  followBtnOn:   { borderColor: Colors.border2 },
  followTxt:     { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  followTxtOn:   { color: Colors.dim },
  emptyTxt:      { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 17 },
  convoRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  convoAv:       { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  convoAvTxt:    { fontSize: 18, fontFamily: Fonts.display, color: '#fff' },
  convoInfo:     { flex: 1 },
  convoTop:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  convoName:     { fontSize: 14, fontFamily: Fonts.bodyBold, color: Colors.cream },
  groupTag:      { fontSize: 8, fontFamily: Fonts.bodyBold, color: Colors.dim, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2 },
  lastMsg:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },
  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:     { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, gap: 12 },
  modalTitle:    { fontSize: 20, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1 },
  modalInput:    { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, borderWidth: 1, borderColor: Colors.border },
  fieldLabel:    { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim },
  memberRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 6 },
  memberRowOn:   { backgroundColor: Colors.surface2 },
  memberAv:      { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  memberAvTxt:   { fontSize: 13, fontFamily: Fonts.display, color: '#fff' },
  memberName:    { fontSize: 13, fontFamily: Fonts.bodyMedium, color: Colors.cream, flex: 1 },
  checkmark:     { fontSize: 14, color: Colors.red },
  modalActions:  { flexDirection: 'row', gap: 10 },
  cancelBtn:     { flex: 1, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  cancelTxt:     { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  createBtn:     { flex: 1, paddingVertical: 14, borderRadius: 5, backgroundColor: Colors.red, alignItems: 'center' },
  createBtnOff:  { backgroundColor: Colors.surface2 },
  createTxt:     { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
