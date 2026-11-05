import type { Room } from '@/lib/types';
import { MapPin, Users, Lock } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  selected: boolean;
  onClick: () => void;
}

export default function RoomCard({ room, selected, onClick }: RoomCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        selected
          ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-200'
          : room.blocked
            ? 'border-slate-200 bg-slate-50 opacity-70 hover:opacity-100'
            : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-800">{room.name}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {room.building}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> {room.capacity}
            </span>
          </div>
        </div>
        {room.blocked && (
          <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">
            <Lock className="w-3 h-3" /> Blocked
          </span>
        )}
      </div>
    </button>
  );
}
