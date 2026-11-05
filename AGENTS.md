# AGENTS.md

## Project
Smart Campus room availability checker. One page, fictional sample data. React 18 + TypeScript + Vite +
Tailwind, tests with vitest 2.1.9. A student picks a room and an interval and the page answers Available or
Unavailable with reasons. Nothing is saved.

## Structure
- src/App.tsx - page layout, form state, validation wiring, verdict display
- src/components/RoomCard.tsx - one room card
- src/components/Timeline.tsx - 24-hour bars for the bookings and the candidate interval
- src/lib/types.ts - Room, Booking, Interval, CheckResult, MINUTES_PER_DAY, MAX_BOOKING_MINUTES
- src/lib/data.ts - rooms and sampleBookings, fictional
- src/lib/availability.ts - intervalsOverlap, checkAvailability, formatTime, parseTimeToMinutes
- src/lib/booking.test.ts - the acceptance-criteria tests, AC1-AC6

## Accepted rules, behaviour that must not change
- AC1: accept only 0 <= start < end <= 1440, and start after the current time
- AC2: reject a duration longer than 120 minutes
- AC3: reject a blocked room
- AC4: reject overlaps; intervals that only touch at an endpoint are allowed
- AC5: never mutate the booking data
- AC6: give clear feedback at desktop and at narrow mobile width

## Commands
- npm install
- npm run dev
- npm test
- npm run test:booking
- npm run typecheck
- npm run lint
- npm run build

## Forbidden scope changes
No login, no backend, no database, no Supabase calls, no booking creation or persistence, no new rooms and
no new features, no UI redesign, no dependency upgrades, no new styling system. Data stays fictional.

## Engineering rules
Prefer pure functions and the smallest change that fixes the named problem. Use at most two design patterns
and only after a concrete problem is shown. Do not mutate the fixtures. Keep the responsive feedback
working. Do not weaken or delete an existing assertion, add tests instead. Report the changed files, the
reason for each change and the test command output.
