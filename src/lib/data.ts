import type { Room, Booking } from './types';

export const rooms: Room[] = [
  { id: 'r1', name: 'Room 101', building: 'Engineering Block', capacity: 30, blocked: false },
  { id: 'r2', name: 'Room 102', building: 'Engineering Block', capacity: 24, blocked: true },
  { id: 'r3', name: 'Room 201', building: 'Science Wing', capacity: 40, blocked: false },
  { id: 'r4', name: 'Room 202', building: 'Science Wing', capacity: 18, blocked: false },
  { id: 'r5', name: 'Auditorium A', building: 'Main Hall', capacity: 120, blocked: false },
];

export const sampleBookings: Booking[] = [
  { id: 'b1', roomId: 'r1', start: 540, end: 600, title: 'Calculus Lecture' },   // 09:00-10:00
  { id: 'b2', roomId: 'r1', start: 720, end: 780, title: 'Physics Lab' },        // 12:00-13:00
  { id: 'b3', roomId: 'r3', start: 600, end: 660, title: 'Chemistry Seminar' },  // 10:00-11:00
  { id: 'b4', roomId: 'r3', start: 900, end: 960, title: 'Faculty Meeting' },    // 15:00-16:00
  { id: 'b5', roomId: 'r4', start: 480, end: 540, title: 'Morning Tutorial' },   // 08:00-09:00
  { id: 'b6', roomId: 'r5', start: 660, end: 720, title: 'Guest Lecture' },      // 11:00-12:00
  { id: 'b7', roomId: 'r5', start: 840, end: 930, title: 'Symposium' },          // 14:00-15:30
];
