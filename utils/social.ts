import type { Person } from '../constants/Data';

// "Mutual friends with X" = people I already follow who X is also
// connected to. Gives a real, meaningful number instead of a guess.
export function getMutualFriends(target: Person, allPeople: Person[]): Person[] {
  return allPeople.filter(p => p.isFollowing && p.id !== target.id && target.friendIds.includes(p.id));
}

export function clampScore(n: number): number {
  return Math.max(0, Math.min(100, n));
}

// ── PEOPLE: status, not a raw number ─────────────────────
// A person's FOMO Score works differently from an event's. An event's
// score is a live percentage — clinical, immediate, made to be stared
// at while deciding where to go RIGHT NOW. A person's score is about
// reputation built over time, so it's shown as a STATUS title earned
// by crossing thresholds, not a bare number. The number still exists
// underneath (0-100) so it can go up or down, but the title is what's
// actually shown.
export const RATING_TIERS = [
  { label: '🔥 Major Vibe',   delta: 15 },
  { label: '✅ Good Energy',  delta: 8 },
  { label: '😐 It Was Okay',  delta: 2 },
  { label: '❌ Not It',       delta: -5 },
];

export type StatusTier = { title: string; icon: string; min: number };

export const STATUS_TIERS: StatusTier[] = [
  { title: 'NEWCOMER',    icon: '🌱', min: 0 },
  { title: 'REGULAR',     icon: '🙂', min: 10 },
  { title: 'KNOWN FACE',  icon: '😎', min: 30 },
  { title: 'VIBE SETTER', icon: '🔥', min: 60 },
  { title: 'FOMO ICON',   icon: '👑', min: 85 },
];

export function getStatusTier(score: number): StatusTier {
  let result = STATUS_TIERS[0];
  for (const tier of STATUS_TIERS) {
    if (score >= tier.min) result = tier;
  }
  return result;
}

// ── EVENTS: a live number with its own "specialness" ─────
// Different concept entirely — events get an intensity LABEL on top
// of the raw live number, since the number alone is what you compare
// across events, but the label is what makes a single event's score
// feel alive when you're looking at just that one.
export type EventIntensity = { label: string; color: 'dim' | 'mid' | 'red' };

export function getEventIntensity(score: number): EventIntensity {
  if (score >= 80) return { label: '🔥 ON FIRE', color: 'red' };
  if (score >= 50) return { label: '⚡ HEATING UP', color: 'red' };
  if (score >= 25) return { label: '📈 BUILDING', color: 'mid' };
  return { label: '🌙 QUIET SO FAR', color: 'dim' };
}
