import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Fonts } from '../../constants/Fonts';
import { useApp } from '../../context/AppContext';

export default function ChatsScreen() {
  const { people, togglePersonFollow, conversations, startDM, createGroup } = useApp();
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [groupModal, setGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filteredPeople = search.length > 0
    ? people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : people;

  const followedPeople = people.filter(p => p.isFollowing);

  function toggleSelected(id: string) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleCreateGroup() {
    if (!groupName.trim() || selected.length === 0) return;
    const id = createGroup(groupName.trim(), selected);
    setGroupModal(false);
    setGroupName('');
    setSelected([]);
    router.push(`/chat/${id}`);
  }

  function openDM(personId: string) {
    const id = startDM(personId);
    router.push(`/chat/${id}`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.headerTitle}>CHATS</Text>
          <TouchableOpacity style={styles.newGroupBtn} onPress={() => setGroupModal(true)}>
            <Text style={styles.newGroupTxt}>+ NEW GROUP</Text>
          </TouchableOpacity>
        </View>

        {/* Search / add people */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Find people to add..."
            placeholderTextColor={Colors.dim}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PEOPLE</Text>
          {filteredPeople.map(p => (
            <View key={p.id} style={styles.personRow}>
              <TouchableOpacity
                style={styles.personLeft}
                onPress={() => p.isFollowing ? openDM(p.id) : undefined}
                activeOpacity={p.isFollowing ? 0.6 : 1}
              >
                <View style={[styles.av, { backgroundColor: p.color }]}>
                  <Text style={styles.avTxt}>{p.initial}</Text>
                </View>
                <View>
                  <Text style={styles.personName}>{p.name}</Text>
                  {p.isFollowing && <Text style={styles.personSub}>Tap to message</Text>}
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
          ))}
        </View>

        {/* Conversations */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MESSAGES</Text>
          {conversations.length === 0 && (
            <Text style={styles.emptyTxt}>No conversations yet. Add people above to start chatting.</Text>
          )}
          {conversations.map(c => {
            const last = c.messages[c.messages.length - 1];
            return (
              <TouchableOpacity key={c.id} style={styles.convoRow} onPress={() => router.push(`/chat/${c.id}`)}>
                <View style={[styles.av, { backgroundColor: c.avatarColor }]}>
                  <Text style={styles.avTxt}>{c.avatarInitial}</Text>
                </View>
                <View style={styles.convoInfo}>
                  <View style={styles.convoTopRow}>
                    <Text style={styles.convoName}>{c.name}</Text>
                    {c.type === 'group' && <Text style={styles.groupTag}>GROUP</Text>}
                  </View>
                  <Text style={styles.convoLast} numberOfLines={1}>
                    {last ? last.text : 'No messages yet'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* New Group Modal */}
      <Modal visible={groupModal} animationType="slide" transparent onRequestClose={() => setGroupModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>NEW GROUP</Text>

            <TextInput
              style={styles.modalInput}
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name..."
              placeholderTextColor={Colors.dim}
            />

            <Text style={styles.modalSubLabel}>ADD FROM PEOPLE YOU FOLLOW</Text>
            <ScrollView style={styles.modalList}>
              {followedPeople.length === 0 && (
                <Text style={styles.emptyTxt}>Follow people first to add them to a group.</Text>
              )}
              {followedPeople.map(p => {
                const isSel = selected.includes(p.id);
                return (
                  <TouchableOpacity key={p.id} style={styles.modalPersonRow} onPress={() => toggleSelected(p.id)}>
                    <View style={[styles.av, { backgroundColor: p.color }]}>
                      <Text style={styles.avTxt}>{p.initial}</Text>
                    </View>
                    <Text style={styles.personName}>{p.name}</Text>
                    <View style={[styles.checkbox, isSel && styles.checkboxOn]}>
                      {isSel && <Text style={styles.checkboxTick}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setGroupModal(false)}>
                <Text style={styles.modalCancelTxt}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreate, (!groupName.trim() || selected.length === 0) && styles.modalCreateOff]}
                onPress={handleCreateGroup}
                disabled={!groupName.trim() || selected.length === 0}
              >
                <Text style={styles.modalCreateTxt}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const S = StyleSheet.create;
const styles = S({
  safe:            { flex: 1, backgroundColor: Colors.bg },
  scroll:          { flex: 1 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle:     { fontSize: 30, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 2 },
  newGroupBtn:     { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 3 },
  newGroupTxt:     { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 1 },
  searchWrap:      { flexDirection: 'row', alignItems: 'center', margin: 14, backgroundColor: Colors.surface, borderRadius: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.border },
  searchIcon:      { fontSize: 14, marginRight: 8 },
  searchInput:     { flex: 1, height: 44, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream },
  section:         { paddingHorizontal: 16, marginBottom: 22 },
  sectionLabel:    { fontSize: 10, fontFamily: Fonts.bodyBold, letterSpacing: 3, color: Colors.dim, marginBottom: 10 },
  personRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  personLeft:      { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  av:              { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avTxt:           { fontSize: 14, fontFamily: Fonts.display, color: '#fff' },
  personName:      { fontSize: 13, fontFamily: Fonts.bodyMedium, color: Colors.cream },
  personSub:       { fontSize: 9, fontFamily: Fonts.body, color: Colors.dim, marginTop: 1 },
  followBtn:       { borderWidth: 1, borderColor: Colors.red, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 3 },
  followBtnOn:     { borderColor: Colors.border2 },
  followTxt:       { fontSize: 9, fontFamily: Fonts.bodyBold, color: Colors.red, letterSpacing: 0.5 },
  followTxtOn:     { color: Colors.dim },
  emptyTxt:        { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, lineHeight: 17, paddingVertical: 6 },
  convoRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.surface2 },
  convoInfo:       { flex: 1 },
  convoTopRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  convoName:       { fontSize: 13, fontFamily: Fonts.bodyBold, color: Colors.cream },
  groupTag:        { fontSize: 7, fontFamily: Fonts.bodyBold, color: Colors.dim, borderWidth: 1, borderColor: Colors.border2, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 2 },
  convoLast:       { fontSize: 11, fontFamily: Fonts.body, color: Colors.dim, marginTop: 2 },

  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:       { backgroundColor: Colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle:      { fontSize: 22, fontFamily: Fonts.display, color: Colors.cream, letterSpacing: 1, marginBottom: 14 },
  modalInput:      { backgroundColor: Colors.surface2, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: Fonts.body, color: Colors.cream, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  modalSubLabel:   { fontSize: 9, fontFamily: Fonts.bodyBold, letterSpacing: 2, color: Colors.dim, marginBottom: 10 },
  modalList:       { maxHeight: 240, marginBottom: 14 },
  modalPersonRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9 },
  checkbox:        { width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: Colors.border2, marginLeft: 'auto', justifyContent: 'center', alignItems: 'center' },
  checkboxOn:      { backgroundColor: Colors.red, borderColor: Colors.red },
  checkboxTick:    { color: '#fff', fontSize: 12, fontFamily: Fonts.bodyBold },
  modalActions:    { flexDirection: 'row', gap: 10 },
  modalCancel:     { flex: 1, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: Colors.border2, alignItems: 'center' },
  modalCancelTxt:  { fontSize: 12, fontFamily: Fonts.bodyBold, color: Colors.mid, letterSpacing: 1 },
  modalCreate:     { flex: 1, paddingVertical: 14, borderRadius: 5, backgroundColor: Colors.red, alignItems: 'center' },
  modalCreateOff:  { backgroundColor: Colors.surface2 },
  modalCreateTxt:  { fontSize: 12, fontFamily: Fonts.bodyBold, color: '#fff', letterSpacing: 1 },
});
