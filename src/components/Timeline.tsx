import type { Booking, Interval } from '@/lib/types';
import { formatTime } from '@/lib/availability';
import { MINUTES_PER_DAY } from '@/lib/types';

interface TimelineProps {
  bookings: Booking[];
  candidate: Interval | null;
  candidateAvailable: boolean;
}

export default function Timeline({ bookings, candidate, candidateAvailable }: TimelineProps) {
  const hours = Array.from({ length: 25 }, (_, i) => i); // 0..24

  return (
    <div className="w-full">
      <div className="relative h-16 w-full rounded-lg bg-slate-100 border border-slate-200 overflow-hidden">
        {/* hour gridlines */}
        {hours.map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: `${(h * 60 / MINUTES_PER_DAY) * 100}%` }}
          />
        ))}

        {/* existing bookings */}
        {bookings.map((b) => (
          <div
            key={b.id}
            className="absolute top-1 bottom-1 rounded bg-slate-400/80 text-white text-[10px] flex items-center justify-center px-1 truncate"
            style={{
              left: `${(b.start / MINUTES_PER_DAY) * 100}%`,
              width: `${((b.end - b.start) / MINUTES_PER_DAY) * 100}%`,
            }}
            title={`${b.title} (${formatTime(b.start)}–${formatTime(b.end)})`}
          >
            <span className="truncate">{b.title}</span>
          </div>
        ))}

        {/* candidate interval */}
        {candidate && (
          <div
            className={`absolute top-1 bottom-1 rounded border-2 text-[10px] flex items-center justify-center font-semibold ${
              candidateAvailable
                ? 'bg-emerald-200 border-emerald-500 text-emerald-700'
                : 'bg-red-200 border-red-500 text-red-700'
            }`}
            style={{
              left: `${(candidate.start / MINUTES_PER_DAY) * 100}%`,
              width: `${((candidate.end - candidate.start) / MINUTES_PER_DAY) * 100}%`,
            }}
          >
            <span className="truncate">Your request</span>
          </div>
        )}
      </div>

      {/* hour labels */}
      <div className="relative h-5 w-full mt-1">
        {hours.filter((h) => h % 2 === 0).map((h) => (
          <span
            key={h}
            className="absolute text-[10px] text-slate-500 -translate-x-1/2"
            style={{ left: `${(h * 60 / MINUTES_PER_DAY) * 100}%` }}
          >
            {String(h).padStart(2, '0')}:00
          </span>
        ))}
      </div>
    </div>
  );
}
