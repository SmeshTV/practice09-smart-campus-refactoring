import { useMemo, useState } from 'react';
import { rooms, sampleBookings } from '@/lib/data';
import { checkAvailability, formatTime, isValidInterval, parseTimeToMinutes } from '@/lib/availability';
import type { CheckResult } from '@/lib/types';
import { MINUTES_PER_DAY } from '@/lib/types';
import RoomCard from '@/components/RoomCard';
import Timeline from '@/components/Timeline';
import { CheckCircle2, XCircle, Clock, DoorClosed } from 'lucide-react';

function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export default function App() {
  const [bookings] = useState(sampleBookings); // AC5: never mutates
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0].id);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [untilMidnight, setUntilMidnight] = useState(false);
  const [currentTimeOverride, setCurrentTimeOverride] = useState('09:00');
  const [useOverride, setUseOverride] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [validated, setValidated] = useState(false);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const roomBookings = useMemo(
    () => bookings.filter((b) => b.roomId === selectedRoomId),
    [bookings, selectedRoomId]
  );

  const currentTimeMinutes = useOverride ? (parseTimeToMinutes(currentTimeOverride) ?? 0) : getCurrentMinutes();

  // Raw candidate from inputs (may be structurally invalid)
  const rawCandidate = (() => {
    const s = parseTimeToMinutes(startTime);
    if (s === null) return null;
    const e = untilMidnight ? MINUTES_PER_DAY : parseTimeToMinutes(endTime);
    if (e === null) return null;
    return { start: s, end: e };
  })();

  // FIX 1 / Practice #09 refactor: the structural interval rule is no longer duplicated here.
  // It is the one exported pure predicate in src/lib/availability.ts, used by both this component
  // and checkAvailability, so the UI guard and the booking rule cannot disagree.
  const handleCheck = () => {
    setValidated(true);
    if (!rawCandidate) {
      setResult({ available: false, reasons: ['Please enter valid times in HH:MM format.'] });
      return;
    }
    setResult(checkAvailability(rawCandidate, selectedRoom, bookings, currentTimeMinutes));
  };

  const handleReset = () => {
    setResult(null);
    setValidated(false);
    setStartTime('');
    setEndTime('');
    setUntilMidnight(false);
  };

  // FIX 2 (UI defect found during the AC6 check): editing one field must not wipe the other one.
  // The three input handlers below used to call handleReset(), which also clears startTime/endTime,
  // so a typed time was erased on the very first keystroke and no request could ever be checked.
  // Only the previous verdict is cleared here; the user's input stays.
  const clearResult = () => {
    setResult(null);
    setValidated(false);
  };

  // FIX 1: only pass candidate to timeline when structurally valid
  const timelineCandidate = validated && isValidInterval(rawCandidate) ? rawCandidate : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center">
            <DoorClosed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800">Smart Campus Room Checker</h1>
            <p className="text-xs text-slate-500">Check room availability — no booking is confirmed</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Current time banner */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
            <Clock className="w-4 h-4 text-sky-600" />
            <span>Current time: <strong>{formatTime(currentTimeMinutes)}</strong></span>
            <label className="flex items-center gap-2 ml-auto text-xs">
              <input
                type="checkbox"
                checked={useOverride}
                onChange={(e) => setUseOverride(e.target.checked)}
                className="accent-sky-600"
              />
              Override
              <input
                type="time"
                value={currentTimeOverride}
                onChange={(e) => setCurrentTimeOverride(e.target.value)}
                disabled={!useOverride}
                className="border border-slate-300 rounded px-2 py-1 text-xs disabled:bg-slate-100 disabled:text-slate-400"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-slate-400 italic">
            Tip: sample bookings are daytime. If you are testing in the evening, enable Override and set e.g. 09:00 so daytime requests are not rejected as &lsquo;in the past&rsquo;.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room selection */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Select a room</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  selected={room.id === selectedRoomId}
                  onClick={() => {
                    setSelectedRoomId(room.id);
                    handleReset();
                  }}
                />
              ))}
            </div>
          </section>

          {/* Time inputs */}
          <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
            <h2 className="font-semibold text-slate-800 mb-3">Request interval</h2>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-600">Start time</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    clearResult();
                  }}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-500 outline-none"
                />
              </label>
              <div className="block">
                <span className="text-sm text-slate-600">End time</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    clearResult();
                  }}
                  disabled={untilMidnight}
                  className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-200 focus:border-sky-500 outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
                <label className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={untilMidnight}
                    onChange={(e) => {
                      setUntilMidnight(e.target.checked);
                      clearResult();
                    }}
                    className="accent-sky-600"
                  />
                  Until midnight (24:00)
                </label>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleCheck}
                className="px-5 py-2.5 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 active:scale-[.98] transition"
              >
                Check Availability
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Clear
              </button>
            </div>

            {validated && result && (
              <div
                className={`mt-4 rounded-lg p-4 border ${
                  result.available
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {result.available ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`font-bold ${
                      result.available ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {result.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                {result.reasons.length > 0 && (
                  <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">
                    {result.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
                {result.available && (
                  <p className="mt-2 text-xs text-emerald-600">
                    This is a preview only — no booking has been created.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Timeline */}
        <section className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-semibold text-slate-800">
              Today's schedule — {selectedRoom?.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-400 inline-block" /> Existing
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-500 inline-block" /> Your request
              </span>
            </div>
          </div>
          <Timeline
            bookings={roomBookings}
            candidate={timelineCandidate}
            candidateAvailable={result?.available ?? false}
          />
          {validated && !timelineCandidate && (
            <p className="mt-2 text-xs text-slate-400 italic">
              The requested interval is invalid, so it is not shown on the timeline.
            </p>
          )}

          {/* FIX 5: mobile bookings list */}
          <div className="mt-4 sm:hidden">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Bookings list</h3>
            {roomBookings.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings for this room today.</p>
            ) : (
              <ul className="space-y-1.5">
                {roomBookings.map((b) => (
                  <li key={b.id} className="flex items-center justify-between text-sm text-slate-600 border-b border-slate-100 pb-1.5">
                    <span className="truncate pr-2">{b.title}</span>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{formatTime(b.start)}–{formatTime(b.end)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 text-center text-xs text-slate-400">
        Prototype — fictional sample data only.
      </footer>
    </div>
  );
}
