import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  hosts as seedHosts,
  people as seedPeople,
  initialConversations,
} from '../constants/Data';
import type { Host, Person, Conversation } from '../constants/Data';

type AppContextType = {
  currentUserId: string;

  hosts: Host[];
  toggleHostFollow: (id: string) => void;

  people: Person[];
  togglePersonFollow: (id: string) => void;

  conversations: Conversation[];
  startDM: (personId: string) => string;
  createGroup: (name: string, memberIds: string[]) => string;
  sendMessage: (conversationId: string, text: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hosts, setHosts] = useState<Host[]>(seedHosts);
  const [people, setPeople] = useState<Person[]>(seedPeople);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);

  const toggleHostFollow = useCallback((id: string) => {
    setHosts(prev => prev.map(h => h.id === id ? { ...h, isFollowing: !h.isFollowing } : h));
  }, []);

  const togglePersonFollow = useCallback((id: string) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p));
  }, []);

  const startDM = useCallback((personId: string) => {
    let result = '';
    setConversations(prev => {
      const existing = prev.find(c => c.type === 'dm' && c.memberIds.length === 1 && c.memberIds[0] === personId);
      if (existing) {
        result = existing.id;
        return prev;
      }
      const person = people.find(p => p.id === personId);
      const id = 'c' + Date.now();
      result = id;
      const newConvo: Conversation = {
        id,
        type: 'dm',
        name: person?.name ?? 'New chat',
        avatarInitial: person?.initial ?? '?',
        avatarColor: person?.color ?? '#333',
        memberIds: [personId],
        messages: [],
      };
      return [newConvo, ...prev];
    });
    return result;
  }, [people]);

  const createGroup = useCallback((name: string, memberIds: string[]) => {
    const id = 'c' + Date.now();
    const newConvo: Conversation = {
      id,
      type: 'group',
      name,
      avatarInitial: name.charAt(0).toUpperCase() || 'G',
      avatarColor: '#CC2929',
      memberIds,
      messages: [],
    };
    setConversations(prev => [newConvo, ...prev]);
    return id;
  }, []);

  const sendMessage = useCallback((conversationId: string, text: string) => {
    if (!text.trim()) return;
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, { id: 'm' + Date.now(), senderId: 'me', senderName: 'You', text }] }
        : c
    ));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUserId: 'me',
        hosts, toggleHostFollow,
        people, togglePersonFollow,
        conversations, startDM, createGroup, sendMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}
