// ── PARTY TYPES ──────────────────────────────────────────
// This is the primary way events are differentiated now —
// not music genre. Music is still stored as a detail field.
export type PartyType = 'CLUB' | 'HOUSE PARTY' | 'CLASSY' | 'ROOFTOP' | 'POOL PARTY';

export const PARTY_TYPES: PartyType[] = ['CLUB', 'HOUSE PARTY', 'CLASSY', 'ROOFTOP', 'POOL PARTY'];

// ── HOSTS ────────────────────────────────────────────────
// Venues and event promoters are followable accounts, like
// an Instagram page. isFollowing is the SEED value — the
// live, toggleable state lives in AppContext.
export type Host = {
  id: string;
  name: string;
  initial: string;
  color: string;
  followers: number;
  isFollowing: boolean;
};

export const hosts: Host[] = [
  { id: 'h1', name: 'FOMO Events',   initial: 'F', color: '#CC2929', followers: 1204, isFollowing: true },
  { id: 'h2', name: 'Slexstreet',    initial: 'S', color: '#2A3A4A', followers: 890,  isFollowing: false },
  { id: 'h3', name: 'The Penthouse', initial: 'P', color: '#3A2A4A', followers: 512,  isFollowing: false },
  { id: 'h4', name: 'Club Voltage',  initial: 'V', color: '#2A4A3A', followers: 340,  isFollowing: false },
  { id: 'h5', name: 'Sky Lounge',    initial: 'L', color: '#4A3A2A', followers: 670,  isFollowing: true  },
];

// ── PEOPLE ───────────────────────────────────────────────
// Real users on the platform you can follow/add and chat
// with. isFollowing is the SEED value — live state in
// AppContext.
export type Person = {
  id: string;
  name: string;
  initial: string;
  color: string;
  isFollowing: boolean;
};

export const people: Person[] = [
  { id: 'p1', name: 'Tunde Adesanya', initial: 'T', color: '#3A2A1A', isFollowing: true },
  { id: 'p2', name: 'Shade Williams', initial: 'S', color: '#1A3A2A', isFollowing: true },
  { id: 'p3', name: 'Kelechi Obi',    initial: 'K', color: '#2A1A3A', isFollowing: true },
  { id: 'p4', name: 'Dayo Adewale',   initial: 'D', color: '#2A2A2A', isFollowing: false },
  { id: 'p5', name: 'Amaka Nnamdi',   initial: 'A', color: '#3A1A2A', isFollowing: false },
  { id: 'p6', name: 'Chidi Eze',      initial: 'C', color: '#1A2A3A', isFollowing: false },
];

// ── EVENTS ───────────────────────────────────────────────
export type Event = {
  id: string;
  name: string;
  venue: string;
  hostId: string;
  partyType: PartyType;
  score: number;
  crowd: string;
  crowdLevel: 'quiet' | 'filling' | 'packed';
  distance: string;
  entry: string;
  avgSpend: string;
  music: string;
  time: string;
  dressCode: string;
  people: number;
  isHot: boolean;
  isAfterParty?: boolean;
  friendsGoingIds: string[];
  conversationId?: string;
};

export const events: Event[] = [
  {
    id: '1',
    name: 'FOMO VOL. 1',
    venue: 'Muse Events Space',
    hostId: 'h1',
    partyType: 'CLUB',
    score: 87,
    crowd: '🔴 Ramping Up',
    crowdLevel: 'filling',
    distance: '1.8km away',
    entry: '₦5,000',
    avgSpend: '~₦15,000',
    music: 'Afrobeats / Drill',
    time: '10PM',
    dressCode: 'Smart Casual',
    people: 247,
    isHot: true,
    friendsGoingIds: ['p1', 'p2', 'p3'],
    conversationId: 'c1',
  },
  {
    id: '2',
    name: 'AQUA NIGHT',
    venue: 'Slexstreet',
    hostId: 'h2',
    partyType: 'POOL PARTY',
    score: 72,
    crowd: '🟡 Filling Up',
    crowdLevel: 'filling',
    distance: '2.3km away',
    entry: '₦3,000',
    avgSpend: '~₦10,000',
    music: 'House',
    time: '9PM',
    dressCode: 'Casual',
    people: 134,
    isHot: false,
    friendsGoingIds: ['p2', 'p3'],
    conversationId: 'c2',
  },
  {
    id: '3',
    name: 'AFTER DARK',
    venue: 'The Penthouse',
    hostId: 'h3',
    partyType: 'CLASSY',
    score: 61,
    crowd: '🟢 Just Starting',
    crowdLevel: 'quiet',
    distance: '0.9km away',
    entry: 'Free',
    avgSpend: '~₦8,000',
    music: 'Amapiano',
    time: '11PM',
    dressCode: 'Smart Casual',
    people: 58,
    isHot: false,
    friendsGoingIds: [],
  },
  {
    id: '4',
    name: 'GRIND SESSIONS',
    venue: 'Club Voltage',
    hostId: 'h4',
    partyType: 'HOUSE PARTY',
    score: 54,
    crowd: '🟢 Just Starting',
    crowdLevel: 'quiet',
    distance: '4.1km away',
    entry: '₦2,000',
    avgSpend: '~₦8,000',
    music: 'Afrobeats',
    time: '9PM',
    dressCode: 'Casual',
    people: 42,
    isHot: false,
    friendsGoingIds: [],
  },
  {
    id: '5',
    name: 'LATE NIGHT RAVE',
    venue: 'Sky Lounge',
    hostId: 'h5',
    partyType: 'ROOFTOP',
    score: 79,
    crowd: '🔴 Packed',
    crowdLevel: 'packed',
    distance: '3.2km away',
    entry: '₦3,000',
    avgSpend: '~₦12,000',
    music: 'House / Amapiano',
    time: '2AM',
    dressCode: 'Casual',
    people: 312,
    isHot: true,
    isAfterParty: true,
    friendsGoingIds: ['p1'],
  },
];

// ── MESSAGING ────────────────────────────────────────────
export type Message = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  isSystem?: boolean;
};

export type Conversation = {
  id: string;
  type: 'dm' | 'group';
  name: string;
  avatarInitial: string;
  avatarColor: string;
  memberIds: string[];
  messages: Message[];
};

// SEED conversations — live state lives in AppContext.
export const initialConversations: Conversation[] = [
  {
    id: 'c1',
    type: 'group',
    name: 'FOMO VOL. 1',
    avatarInitial: 'F',
    avatarColor: '#CC2929',
    memberIds: ['p1', 'p2', 'p3'],
    messages: [
      { id: 'm1', senderId: 'p1', senderName: 'Tunde',   text: "y'all ready for tonight? 🔥" },
      { id: 'm2', senderId: 'me', senderName: 'You',     text: 'almost done getting ready' },
      { id: 'm3', senderId: 'p2', senderName: 'Shade',   text: 'see you there! 🙌' },
      { id: 'm4', senderId: 'sys', senderName: 'System', text: 'Cost split created: ₦15,000 each', isSystem: true },
      { id: 'm5', senderId: 'p3', senderName: 'Kelechi', text: "I'm already here it's 🔥🔥" },
    ],
  },
  {
    id: 'c2',
    type: 'group',
    name: 'Aqua Night Squad',
    avatarInitial: 'A',
    avatarColor: '#1A4A5A',
    memberIds: ['p2', 'p3'],
    messages: [
      { id: 'm1', senderId: 'p2', senderName: 'Shade', text: 'pulling up around 9:30' },
    ],
  },
  {
    id: 'c3',
    type: 'dm',
    name: 'Tunde Adesanya',
    avatarInitial: 'T',
    avatarColor: '#3A2A1A',
    memberIds: ['p1'],
    messages: [
      { id: 'm1', senderId: 'p1', senderName: 'Tunde', text: 'bro you seeing FOMO vol 1?' },
      { id: 'm2', senderId: 'me', senderName: 'You',   text: 'yeah already got my ticket' },
    ],
  },
];
