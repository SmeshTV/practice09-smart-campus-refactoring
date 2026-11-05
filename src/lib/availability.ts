import type { Room, Booking, Interval, CheckResult } from './types';
import { MINUTES_PER_DAY, MAX_BOOKING_MINUTES } from './types';

// AC4: overlap test — touching endpoints allowed (so [a,b) and [b,c) don't overlap)
export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

export function checkAvailability(
  candidate: Interval,
  room: Room | undefined,
  bookings: Booking[],
  currentTimeMinutes: number
): CheckResult {
  const reasons: string[] = [];

  // AC1: 0 ≤ start < end ≤ 1440 and start after current time
  if (candidate.start < 0 || candidate.end > MINUTES_PER_DAY || candidate.start >= candidate.end) {
    reasons.push('Interval must satisfy 0 ≤ start < end ≤ 1440 minutes.');
  } else {
    if (candidate.start <= currentTimeMinutes) {
      reasons.push('Start time must be after the current time.');
    }
  }

  // AC2: booking longer than 120 minutes
  if (candidate.end - candidate.start > MAX_BOOKING_MINUTES) {
    reasons.push('Booking cannot be longer than 120 minutes.');
  }

  // AC3: room blocked
  if (room && room.blocked) {
    reasons.push('This room is currently blocked and cannot be booked.');
  }

  // AC4: overlap with existing bookings for this room
  if (room) {
    const roomBookings = bookings.filter((b) => b.roomId === room.id);
    for (const b of roomBookings) {
      if (intervalsOverlap(candidate, b)) {
        reasons.push(`Overlaps existing booking "${b.title}" (${formatTime(b.start)}–${formatTime(b.end)}).`);
      }
    }
  }

  return { available: reasons.length === 0, reasons };
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseTimeToMinutes(value: string): number | null {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  return h * 60 + m;
}
