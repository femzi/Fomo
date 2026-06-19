import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  hosts as seedHosts,
  people as seedPeople,
  initialConversations,
  events as seedEvents,
  initialClips,
} from '../constants/Data';
import type { Host, Person, Conversation, Event, PartyType, Clip } from '../constants/Data';

export type UserRole = 'attendee' | 'promoter' | null;

type NewEventInput = {
  name: string;
  venue: string;
  partyType: PartyType;
  time: string;
  entry: string;
  dressCode: string;
  ticketsTotal: number;
  latitude: number;
  longitude: number;
};

export type PurchasedTicket = {
  id: string;
  eventId: string;
  quantity: number;
  reference: string;
  purchasedAt: number;
};

type AppContextType = {
  currentUserId: string;

  userRole: UserRole;
  myHostId: string | null;
  becomePromoter: (venueName: string) => void;
  becomeAttendee: () => void;

  hosts: Host[];
  toggleHostFollow: (id: string) => void;

  people: Person[];
  togglePersonFollow: (id: string) => void;

  conversations: Conversation[];
  startDM: (personId: string) => string;
  createGroup: (name: string, memberIds: string[]) => string;
  sendMessage: (conversationId: string, text: string) => void;

  events: Event[];
  addEvent: (input: NewEventInput) => string;
  simulateSale: (eventId: string) => void;

  clips: Clip[];
  addClip: (videoUri: string, caption: string, eventId?: string) => void;
  toggleLikeClip: (clipId: string) => void;

  myTickets: PurchasedTicket[];
  recordTicketPurchase: (eventId: string, quantity: number, reference: string) => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [myHostId, setMyHostId] = useState<string | null>(null);

  const [hosts, setHosts] = useState<Host[]>(seedHosts);
  const [people, setPeople] = useState<Person[]>(seedPeople);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [myTickets, setMyTickets] = useState<PurchasedTicket[]>([]);

  // ── ROLE ────────────────────────────────────────────────
  const becomePromoter = useCallback((venueName: string) => {
    const id = 'h' + Date.now();
    const newHost: Host = {
      id,
      name: venueName || 'My Venue',
      initial: (venueName || 'M').charAt(0).toUpperCase(),
      color: '#CC2929',
      followers: 0,
      isFollowing: false,
    };
    setHosts(prev => [newHost, ...prev]);
    setMyHostId(id);
    setUserRole('promoter');
  }, []);

  const becomeAttendee = useCallback(() => {
    setUserRole('attendee');
    setMyHostId(null);
  }, []);

  // ── FOLLOW ──────────────────────────────────────────────
  const toggleHostFollow = useCallback((id: string) => {
    setHosts(prev => prev.map(h => h.id === id ? { ...h, isFollowing: !h.isFollowing } : h));
  }, []);

  const togglePersonFollow = useCallback((id: string) => {
    setPeople(prev => prev.map(p => p.id === id ? { ...p, isFollowing: !p.isFollowing } : p));
  }, []);

  // ── CHAT ────────────────────────────────────────────────
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

  // ── EVENTS ──────────────────────────────────────────────
  const addEvent = useCallback((input: NewEventInput) => {
    const id = 'e' + Date.now();
    const newEvent: Event = {
      id,
      name: input.name,
      venue: input.venue,
      hostId: myHostId ?? 'h1',
      partyType: input.partyType,
      score: 50,
      crowd: '🟢 Just Starting',
      crowdLevel: 'quiet',
      distance: 'Distance pending',
      latitude: input.latitude,
      longitude: input.longitude,
      entry: input.entry,
      avgSpend: 'TBD',
      music: 'TBD',
      time: input.time,
      dressCode: input.dressCode,
      people: 0,
      isHot: false,
      friendsGoingIds: [],
      ticketsSold: 0,
      ticketsTotal: input.ticketsTotal,
    };
    setEvents(prev => [newEvent, ...prev]);
    return id;
  }, [myHostId]);

  const simulateSale = useCallback((eventId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const bump = Math.floor(Math.random() * 3) + 1;
      const newSold = Math.min(e.ticketsSold + bump, e.ticketsTotal);
      return { ...e, ticketsSold: newSold };
    }));
  }, []);

  // ── CLIPS ───────────────────────────────────────────────
  const addClip = useCallback((videoUri: string, caption: string, eventId?: string) => {
    const id = 'clip' + Date.now();
    const newClip: Clip = {
      id,
      hostId: myHostId ?? 'h1',
      videoUri,
      caption,
      eventId,
      likes: 0,
      likedByMe: false,
    };
    setClips(prev => [newClip, ...prev]);
  }, [myHostId]);

  const toggleLikeClip = useCallback((clipId: string) => {
    setClips(prev => prev.map(c =>
      c.id === clipId
        ? { ...c, likedByMe: !c.likedByMe, likes: c.likedByMe ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  }, []);

  // ── TICKETS ─────────────────────────────────────────────
  const recordTicketPurchase = useCallback((eventId: string, quantity: number, reference: string) => {
    const ticket: PurchasedTicket = {
      id: 't' + Date.now(),
      eventId,
      quantity,
      reference,
      purchasedAt: Date.now(),
    };
    setMyTickets(prev => [ticket, ...prev]);
    setEvents(prev => prev.map(e =>
      e.id === eventId
        ? { ...e, ticketsSold: Math.min(e.ticketsSold + quantity, e.ticketsTotal) }
        : e
    ));
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUserId: 'me',
        userRole, myHostId, becomePromoter, becomeAttendee,
        hosts, toggleHostFollow,
        people, togglePersonFollow,
        conversations, startDM, createGroup, sendMessage,
        events, addEvent, simulateSale,
        clips, addClip, toggleLikeClip,
        myTickets, recordTicketPurchase,
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
