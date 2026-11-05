export interface Room {
  id: string;
  name: string;
  building: string;
  capacity: number;
  blocked: boolean;
}

export interface Booking {
  id: string;
  roomId: string;
  start: number; // minutes from 00:00
  end: number; // minutes from 00:00
  title: string;
}

export interface Interval {
  start: number;
  end: number;
}

export interface CheckResult {
  available: boolean;
  reasons: string[];
}

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_MINUTES = 120;
