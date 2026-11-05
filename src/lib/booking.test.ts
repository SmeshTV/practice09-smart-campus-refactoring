import { describe, it, expect } from 'vitest';
import { checkAvailability, intervalsOverlap } from '@/lib/availability';
import { rooms, sampleBookings } from '@/lib/data';

const now = 540; // 09:00 fixed time for deterministic tests

// Deep snapshot taken at module load, before any test can run, so every test rebuilds the
// same unsorted fixture. Lesson #07 version passed the shared module-level array directly,
// which let one mutation leak into later tests (see defect log, BUG-B notes).
const BOOKINGS_TEMPLATE = sampleBookings.map((b) => ({ ...b }));
const freshBookings = () => BOOKINGS_TEMPLATE.map((b) => ({ ...b }));

function room(id: string) {
  return rooms.find((r) => r.id === id);
}

describe('intervalsOverlap (AC4 — touching endpoints allowed)', () => {
  it('returns true for overlapping intervals', () => {
    expect(intervalsOverlap({ start: 600, end: 700 }, { start: 650, end: 750 })).toBe(true);
  });

  it('returns false for touching endpoints (no overlap)', () => {
    expect(intervalsOverlap({ start: 600, end: 660 }, { start: 660, end: 720 })).toBe(false);
    expect(intervalsOverlap({ start: 660, end: 720 }, { start: 600, end: 660 })).toBe(false);
  });

  it('returns false for disjoint intervals', () => {
    expect(intervalsOverlap({ start: 600, end: 660 }, { start: 700, end: 760 })).toBe(false);
  });

  it('returns true when one interval contains another', () => {
    expect(intervalsOverlap({ start: 600, end: 800 }, { start: 650, end: 700 })).toBe(true);
  });
});

describe('checkAvailability — AC1 (reject start >= end and past)', () => {
  it('rejects start >= end', () => {
    const res = checkAvailability({ start: 700, end: 600 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('0 ≤ start < end'))).toBe(true);
  });

  it('rejects start in the past', () => {
    const res = checkAvailability({ start: 400, end: 500 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('after the current time'))).toBe(true);
  });

  it('accepts start after current time', () => {
    const res = checkAvailability({ start: 600, end: 660 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(true);
  });

  it('rejects start < 0', () => {
    const res = checkAvailability({ start: -60, end: 60 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
  });

  it('rejects end > 1440', () => {
    const res = checkAvailability({ start: 1380, end: 1500 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
  });
});

describe('checkAvailability — AC2 (max 120 minutes)', () => {
  it('rejects booking longer than 120 minutes', () => {
    const res = checkAvailability({ start: 600, end: 750 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('120 minutes'))).toBe(true);
  });

  it('accepts booking exactly 120 minutes', () => {
    const res = checkAvailability({ start: 600, end: 720 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(true);
  });

  it('accepts booking shorter than 120 minutes', () => {
    const res = checkAvailability({ start: 600, end: 660 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(true);
  });
});

describe('checkAvailability — AC3 (reject blocked room)', () => {
  it('rejects booking in blocked room', () => {
    const res = checkAvailability({ start: 600, end: 660 }, room('r2'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('blocked'))).toBe(true);
  });

  it('accepts booking in unblocked room', () => {
    const res = checkAvailability({ start: 600, end: 660 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(true);
  });
});

describe('checkAvailability — AC4 (reject overlaps, allow touching endpoints)', () => {
  // T-11 Real overlap: existing b1 in r1 is 540–600, so candidate 570–630 overlaps it by 30 minutes.
  // The Lesson #07 version used {630, 700}, which does not overlap any r1 booking (b1 540–600,
  // b2 720–780); the expectation was wrong, not the code. Fixed fixture, expectation kept.
  it('rejects overlapping booking', () => {
    const res = checkAvailability({ start: 570, end: 630 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.some((r) => r.includes('Overlaps'))).toBe(true);
  });

  it('allows booking touching at endpoint (start = existing end)', () => {
    // Existing b1: 540–600 (09:00–10:00). Candidate starts exactly at 600.
    const res = checkAvailability({ start: 600, end: 660 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(true);
  });

  it('allows booking touching at endpoint (end = existing start)', () => {
    // Existing b2: 720–780 (12:00–13:00). Candidate ends exactly at 720.
    const res = checkAvailability({ start: 660, end: 720 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(true);
  });

  it('accepts non-overlapping booking in same room', () => {
    const res = checkAvailability({ start: 800, end: 860 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(true);
  });
});

describe('checkAvailability — AC5 (no mutation of booking data)', () => {
  // Fixture is rebuilt inside the test: the earlier version reused the shared module-level
  // sampleBookings, so its verdict depended on test order (an in-place sort performed by a
  // previous test made this case pass even when the implementation mutated the array).
  it('does not modify the original bookings array', () => {
    const bookings = freshBookings();
    const expected = bookings.map((b) => ({ ...b }));
    const originalLength = bookings.length;
    const originalFirst = { ...bookings[0] };

    checkAvailability({ start: 600, end: 660 }, room('r1'), bookings, now);

    expect(bookings.length).toBe(originalLength);
    expect(bookings[0]).toEqual(originalFirst);
    expect(bookings).toEqual(expected);
  });

  it('returns Available / Unavailable without side effects', () => {
    const res1 = checkAvailability({ start: 600, end: 660 }, room('r1'), freshBookings(), now);
    const res2 = checkAvailability({ start: 600, end: 660 }, room('r1'), freshBookings(), now);
    expect(res1).toEqual(res2);
    expect(typeof res1.available).toBe('boolean');
    expect(Array.isArray(res1.reasons)).toBe(true);
  });
});

describe('checkAvailability — AC6 (UI feedback structure)', () => {
  it('returns CheckResult with available boolean and reasons array', () => {
    const res = checkAvailability({ start: 600, end: 660 }, room('r1'), freshBookings(), now);
    expect(res).toHaveProperty('available');
    expect(res).toHaveProperty('reasons');
  });

  it('reasons is empty when available', () => {
    const res = checkAvailability({ start: 800, end: 860 }, room('r4'), freshBookings(), now);
    expect(res.available).toBe(true);
    expect(res.reasons).toHaveLength(0);
  });

  it('reasons is non-empty when unavailable', () => {
    const res = checkAvailability({ start: 400, end: 500 }, room('r1'), freshBookings(), now);
    expect(res.available).toBe(false);
    expect(res.reasons.length).toBeGreaterThan(0);
  });
});
