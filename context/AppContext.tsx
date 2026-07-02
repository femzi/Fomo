import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  hosts as seedHosts,
  people as seedPeople,
  initialConversations,
  events as seedEvents,
  initialClips,
  initialPhotos,
  initialNotifications,
} from '../constants/Data';
import type {
  Host, Person, Conversation, Event, PartyType, Clip, Message, Photo, AppNotification,
} from '../constants/Data';
import { RATING_TIERS, clampScore } from '../utils/social';
import * as Notifications from 'expo-notifications';

// Configure how notifications look when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Bump this version number any time the shape of persisted data
// changes (new required fields, renamed fields, etc). Old data under
// the previous key gets ignored automatically instead of crashing the
// app trying to read fields that don't exist on it.
const STORAGE_KEY = 'fomo_state_v4';
const RESERVED_USERNAMES = ['fomo', 'admin', 'support', 'fomoevents'];

export type UserRole = 'attendee' | 'promoter' | null;

export type Profile = {
  contactMethod: 'email' | 'phone';
  contact: string;
  password: string; // NOT secure — see note in profile-setup.tsx. No backend exists to hash/verify this yet.
  name: string;
  username: string;
  birthDay: number;
  birthMonth: number;
  birthYear: number;
  photoUri?: string;
};

export type NotificationPrefs = {
  friendActivity: boolean;
  eventAlerts: boolean;
  chatMessages: boolean;
  promoterUpdates: boolean;
};

export type PrivacyPrefs = {
  shareLocationWithFriends: boolean;
  publicProfile: boolean;
};

type NewEventInput = {
  name: string;
  venue: string;
  partyType: PartyType;
  time: string;
  entry: string;
  dressCode: string;
  ticketsTotal: number;
  latitude?: number;
  longitude?: number;
};

export type PurchasedTicket = {
  id: string;
  eventId: string;
  quantity: number;
  reference: string;
  purchasedAt: number;
};

export type ActiveTimer = {
  eventId: string;
  targetTime: number;
};

type PersistedState = {
  profile: Profile | null;
  isLoggedIn: boolean;
  userRole: UserRole;
  myHostId: string | null;
  hosts: Host[];
  people: Person[];
  conversations: Conversation[];
  events: Event[];
  clips: Clip[];
  photos: Photo[];
  myTickets: PurchasedTicket[];
  myGoingEventIds: string[];
  myFomoScore: number;
  notifications: AppNotification[];
  notificationPrefs: NotificationPrefs;
  privacyPrefs: PrivacyPrefs;
  activeTimer: ActiveTimer | null;
};

const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  friendActivity: true,
  eventAlerts: true,
  chatMessages: true,
  promoterUpdates: false,
};

const DEFAULT_PRIVACY_PREFS: PrivacyPrefs = {
  shareLocationWithFriends: true,
  publicProfile: true,
};

const SCORE_TICK_MS = 20000; // how often live event scores drift
const MAX_HISTORY_LEN = 24;

type AppContextType = {
  currentUserId: string;
  hydrated: boolean;

  profile: Profile | null;
  isLoggedIn: boolean;
  createProfile: (profile: Profile) => void;
  logOut: () => void;
  logIn: (password: string) => boolean;
  isUsernameTaken: (username: string) => boolean;

  userRole: UserRole;
  myHostId: string | null;
  becomePromoter: (venueName: string) => void;
  becomeAttendee: () => void;

  hosts: Host[];
  toggleHostFollow: (id: string) => void;

  people: Person[];
  togglePersonFollow: (id: string) => void;
  ratePerson: (personId: string, delta: number) => void;

  conversations: Conversation[];
  startDM: (personId: string) => string;
  createGroup: (name: string, memberIds: string[]) => string;
  sendMessage: (conversationId: string, text: string) => void;
  shareEventToConversation: (conversationId: string, eventId: string) => void;
  sendCheckIn: (conversationId: string) => void;
  respondToCheckIn: (conversationId: string, messageId: string, status: 'in' | 'out') => void;

  events: Event[];
  addEvent: (input: NewEventInput) => string;
  simulateSale: (eventId: string) => void;
  updateEventLocation: (eventId: string, latitude: number, longitude: number) => void;

  clips: Clip[];
  addClip: (videoUri: string, caption: string, eventId?: string) => void;
  toggleLikeClip: (clipId: string) => void;

  photos: Photo[];
  addPhoto: (uri: string, caption?: string) => void;
  removePhoto: (photoId: string) => void;

  myTickets: PurchasedTicket[];
  recordTicketPurchase: (eventId: string, quantity: number, reference: string) => void;

  myGoingEventIds: string[];
  toggleGoing: (eventId: string) => void;

  myFomoScore: number;

  notifications: AppNotification[];
  unreadNotifCount: number;
  addNotification: (text: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  notificationPrefs: NotificationPrefs;
  toggleNotificationPref: (key: keyof NotificationPrefs) => void;

  privacyPrefs: PrivacyPrefs;
  togglePrivacyPref: (key: keyof PrivacyPrefs) => void;

  activeTimer: ActiveTimer | null;
  setEventTimer: (eventId: string, durationMs: number) => void;
  clearEventTimer: () => void;

  resetAllData: () => void;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [myHostId, setMyHostId] = useState<string | null>(null);
  const [hosts, setHosts] = useState<Host[]>(seedHosts);
  const [people, setPeople] = useState<Person[]>(seedPeople);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [events, setEvents] = useState<Event[]>(seedEvents);
  const [clips, setClips] = useState<Clip[]>(initialClips);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [myTickets, setMyTickets] = useState<PurchasedTicket[]>([]);
  const [myGoingEventIds, setMyGoingEventIds] = useState<string[]>([]);
  const [myFomoScore, setMyFomoScore] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIF_PREFS);
  const [privacyPrefs, setPrivacyPrefs] = useState<PrivacyPrefs>(DEFAULT_PRIVACY_PREFS);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  // ── LOAD ON STARTUP ─────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved: Partial<PersistedState> = JSON.parse(raw);
          if (saved.profile !== undefined) setProfile(saved.profile);
          if (saved.isLoggedIn !== undefined) setIsLoggedIn(saved.isLoggedIn);
          if (saved.userRole !== undefined) setUserRole(saved.userRole);
          if (saved.myHostId !== undefined) setMyHostId(saved.myHostId);
          if (saved.hosts) setHosts(saved.hosts);
          if (saved.people) setPeople(saved.people);
          if (saved.conversations) setConversations(saved.conversations);
          if (saved.events) setEvents(saved.events);
          if (saved.clips) setClips(saved.clips);
          if (saved.photos) setPhotos(saved.photos);
          if (saved.myTickets) setMyTickets(saved.myTickets);
          if (saved.myGoingEventIds) setMyGoingEventIds(saved.myGoingEventIds);
          if (saved.myFomoScore !== undefined) setMyFomoScore(saved.myFomoScore);
          if (saved.notifications) setNotifications(saved.notifications);
          if (saved.notificationPrefs) setNotificationPrefs(saved.notificationPrefs);
          if (saved.privacyPrefs) setPrivacyPrefs(saved.privacyPrefs);
          if (saved.activeTimer !== undefined) setActiveTimer(saved.activeTimer);
        }
      } catch {
        // corrupted or missing — start fresh
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // ── SAVE ON EVERY CHANGE (after initial load completes) ─
  const skipFirstSave = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    const blob: PersistedState = {
      profile, isLoggedIn, userRole, myHostId, hosts, people, conversations,
      events, clips, photos, myTickets, myGoingEventIds, myFomoScore, notifications,
      notificationPrefs, privacyPrefs, activeTimer,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blob)).catch(() => {});
  }, [hydrated, profile, isLoggedIn, userRole, myHostId, hosts, people, conversations,
      events, clips, photos, myTickets, myGoingEventIds, myFomoScore, notifications,
      notificationPrefs, privacyPrefs, activeTimer]);

  // ── NOTIFICATIONS ───────────────────────────────────────
  const addNotification = useCallback((text: string) => {
    setNotifications(prev => [{ id: 'n' + Date.now() + Math.random(), text, ts: Date.now(), read: false }, ...prev].slice(0, 50));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── LIVE EVENT SCORE SIMULATION ──────────────────────────
  // Makes scores actually drift up/down over time instead of sitting
  // static, and escalates crowd level as the score climbs. When one
  // of YOUR OWN events (as the promoter) crosses into a new crowd
  // level, this nudges you to post a clip at exactly that moment.
  useEffect(() => {
    const tick = () => {
      setEvents(prev => prev.map(e => {
        const drift = Math.floor(Math.random() * 11) - 4; // -4 to +6, biased to climb
        const newScore = clampScore(e.score + drift);
        const newHistory = [...e.scoreHistory, newScore].slice(-MAX_HISTORY_LEN);

        let newLevel: Event['crowdLevel'] = e.crowdLevel;
        let newCrowdText = e.crowd;
        if (newScore >= 75) { newLevel = 'packed'; newCrowdText = '🔴 Packed'; }
        else if (newScore >= 40) { newLevel = 'filling'; newCrowdText = '🟡 Filling Up'; }
        else { newLevel = 'quiet'; newCrowdText = '🟢 Just Starting'; }

        if (newLevel !== e.crowdLevel && e.hostId === myHostId) {
          const label = newLevel === 'packed' ? 'Packed' : newLevel === 'filling' ? 'Filling Up' : 'Just Starting';
          addNotification(`📸 Time to post a clip — ${e.name} just hit "${label}"!`);
        }

        return { ...e, score: newScore, scoreHistory: newHistory, crowdLevel: newLevel, crowd: newCrowdText };
      }));
    };
    tick(); // seed history immediately instead of waiting for the first interval
    const interval = setInterval(tick, SCORE_TICK_MS);
    return () => clearInterval(interval);
  }, [myHostId, addNotification]);

  // ── PROFILE / SESSION ───────────────────────────────────
  const isUsernameTaken = useCallback((username: string) => {
    const u = username.trim().toLowerCase();
    if (!u) return true;
    if (RESERVED_USERNAMES.includes(u)) return true;
    return people.some(p => (p.username ?? '').toLowerCase() === u);
  }, [people]);

  const createProfile = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
    setIsLoggedIn(true);
  }, []);

  const logOut = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const logIn = useCallback((password: string) => {
    if (!profile) return false;
    if (profile.password !== password) return false;
    setIsLoggedIn(true);
    return true;
  }, [profile]);

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

  const ratePerson = useCallback((personId: string, delta: number) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, fomoScore: clampScore(p.fomoScore + delta) } : p));
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

  const shareEventToConversation = useCallback((conversationId: string, eventId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, {
            id: 'm' + Date.now(),
            senderId: 'me',
            senderName: 'You',
            text: '📍 Shared an event',
            sharedEventId: eventId,
          }] }
        : c
    ));
  }, []);

  // Posts a 10-second "are you in or out" prompt. Other (fake) members
  // respond at random times within the window — there's no backend yet
  // to deliver this to real other devices, so only your own response
  // is genuinely yours; theirs is simulated. Once the window closes,
  // the chat screen replaces this with a plain tally line.
  const sendCheckIn = useCallback((conversationId: string) => {
    const messageId = 'checkin' + Date.now();
    const deadline = Date.now() + 10000;

    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      const newMsg: Message = {
        id: messageId,
        senderId: 'me',
        senderName: 'You',
        text: '🚨 IN OR OUT? Tap within 10 seconds.',
        checkin: { deadline, responses: [] },
      };
      return { ...c, messages: [...c.messages, newMsg] };
    }));

    const convo = conversations.find(c => c.id === conversationId);
    const otherMembers = convo ? convo.memberIds : [];
    otherMembers.forEach(personId => {
      const delay = 1000 + Math.random() * 8000;
      setTimeout(() => {
        const status: 'in' | 'out' = Math.random() > 0.25 ? 'in' : 'out';
        setConversations(prev => prev.map(c => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: c.messages.map(m => {
              if (m.id !== messageId || !m.checkin) return m;
              if (Date.now() > m.checkin.deadline) return m;
              if (m.checkin.responses.some(r => r.personId === personId)) return m;
              return { ...m, checkin: { ...m.checkin, responses: [...m.checkin.responses, { personId, status }] } };
            }),
          };
        }));
      }, delay);
    });
  }, [conversations]);

  const respondToCheckIn = useCallback((conversationId: string, messageId: string, status: 'in' | 'out') => {
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return {
        ...c,
        messages: c.messages.map(m => {
          if (m.id !== messageId || !m.checkin) return m;
          if (Date.now() > m.checkin.deadline) return m;
          if (m.checkin.responses.some(r => r.personId === 'me')) return m;
          return { ...m, checkin: { ...m.checkin, responses: [...m.checkin.responses, { personId: 'me', status }] } };
        }),
      };
    }));
  }, []);

  // ── EVENTS ──────────────────────────────────────────────
  const addEvent = useCallback((input: NewEventInput) => {
    const id = 'e' + Date.now();
    const host = hosts.find(h => h.id === (myHostId ?? 'h1'));
    const newEvent: Event = {
      id,
      name: input.name,
      venue: input.venue,
      hostId: myHostId ?? 'h1',
      partyType: input.partyType,
      score: 30,
      crowd: '🟢 Just Starting',
      crowdLevel: 'quiet',
      distance: 'Location not set yet',
      latitude: input.latitude,
      longitude: input.longitude,
      entry: input.entry,
      avgSpend: 'TBD',
      time: input.time,
      dressCode: input.dressCode,
      people: 0,
      isHot: false,
      friendsGoingIds: [],
      ticketsSold: 0,
      ticketsTotal: input.ticketsTotal,
      scoreHistory: [30],
    };
    setEvents(prev => [newEvent, ...prev]);

    if (host?.isFollowing) {
      addNotification(`🔥 ${host.name} just posted a new event: ${newEvent.name}`);
    }

    return id;
  }, [myHostId, hosts, addNotification]);

  const simulateSale = useCallback((eventId: string) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const bump = Math.floor(Math.random() * 3) + 1;
      const newSold = Math.min(e.ticketsSold + bump, e.ticketsTotal);
      return { ...e, ticketsSold: newSold };
    }));
  }, []);

  const updateEventLocation = useCallback((eventId: string, latitude: number, longitude: number) => {
    setEvents(prev => prev.map(e =>
      e.id === eventId ? { ...e, latitude, longitude } : e
    ));
  }, []);

  // ── CLIPS (event owners only) ────────────────────────────
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

  // ── PHOTOS (attendee profile, Pinterest-style) ──────────
  const addPhoto = useCallback((uri: string, caption?: string) => {
    const id = 'photo' + Date.now();
    setPhotos(prev => [{ id, authorId: 'me', uri, caption }, ...prev]);
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
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

  // ── GOING ───────────────────────────────────────────────
  const toggleGoing = useCallback((eventId: string) => {
    setMyGoingEventIds(prev => {
      const isGoingNow = !prev.includes(eventId);
      if (isGoingNow) {
        const event = events.find(e => e.id === eventId);
        if (event) {
          addNotification(`✅ You're going to ${event.name} — your followers were notified.`);
          event.friendsGoingIds.forEach(() => {
            const delay = 5000 + Math.random() * 15000;
            setTimeout(() => {
              const tier = RATING_TIERS[Math.floor(Math.random() * RATING_TIERS.length)];
              setMyFomoScore(prevScore => clampScore(prevScore + tier.delta));
            }, delay);
          });
        }
        return [...prev, eventId];
      }
      return prev.filter(id => id !== eventId);
    });
  }, [events, addNotification]);

  // ── PREFS ───────────────────────────────────────────────
  const toggleNotificationPref = useCallback((key: keyof NotificationPrefs) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const togglePrivacyPref = useCallback((key: keyof PrivacyPrefs) => {
    setPrivacyPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // ── EVENT REMINDER TIMER ────────────────────────────────
  // Uses expo-notifications so the alarm fires even when the app is in the
  // background or fully closed — the OS delivers it as a system notification.
  // The in-app overlay (AlarmOverlay) also fires if the app is open.
  const setEventTimer = useCallback(async (eventId: string, durationMs: number) => {
    const targetTime = Date.now() + durationMs;
    setActiveTimer({ eventId, targetTime });

    try {
      // Cancel any previously scheduled reminder before scheduling a new one
      await Notifications.cancelAllScheduledNotificationsAsync();

      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return; // overlay still works, just no background push

      const event = events.find(e => e.id === eventId);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "⏰ IT'S TIME",
          body: event ? `Head to ${event.name}!` : "Your FOMO event reminder is here.",
          sound: true,
        },
        trigger: {
          seconds: Math.max(1, Math.floor(durationMs / 1000)),
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        },
      });
    } catch {
      // expo-notifications may not be available in all environments;
      // the in-app overlay still works as a fallback.
    }
  }, [events]);

  const clearEventTimer = useCallback(() => {
    setActiveTimer(null);
  }, []);

  // ── RESET ───────────────────────────────────────────────
  const resetAllData = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setProfile(null);
    setIsLoggedIn(false);
    setUserRole(null);
    setMyHostId(null);
    setHosts(seedHosts);
    setPeople(seedPeople);
    setConversations(initialConversations);
    setEvents(seedEvents);
    setClips(initialClips);
    setPhotos(initialPhotos);
    setMyTickets([]);
    setMyGoingEventIds([]);
    setMyFomoScore(0);
    setNotifications(initialNotifications);
    setNotificationPrefs(DEFAULT_NOTIF_PREFS);
    setPrivacyPrefs(DEFAULT_PRIVACY_PREFS);
    setActiveTimer(null);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUserId: 'me',
        hydrated,
        profile, isLoggedIn, createProfile, logOut, logIn, isUsernameTaken,
        userRole, myHostId, becomePromoter, becomeAttendee,
        hosts, toggleHostFollow,
        people, togglePersonFollow, ratePerson,
        conversations, startDM, createGroup, sendMessage,
        shareEventToConversation, sendCheckIn, respondToCheckIn,
        events, addEvent, simulateSale, updateEventLocation,
        clips, addClip, toggleLikeClip,
        photos, addPhoto, removePhoto,
        myTickets, recordTicketPurchase,
        myGoingEventIds, toggleGoing,
        myFomoScore,
        notifications, unreadNotifCount, addNotification, markAllNotificationsRead, clearNotifications,
        notificationPrefs, toggleNotificationPref,
        privacyPrefs, togglePrivacyPref,
        activeTimer, setEventTimer, clearEventTimer,
        resetAllData,
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
