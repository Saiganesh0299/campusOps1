import React, { useState } from 'react';
import { Classroom } from '../types/campus';
import { Calendar, Clock, Users, X, Check, AlertCircle } from 'lucide-react';

interface BookRoomModalProps {
  room: Classroom;
  onClose: () => void;
  onSuccess: (bookingData: any) => void;
}

export const BookRoomModal: React.FC<BookRoomModalProps> = ({ room, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [date, setDate] = useState('2026-10-30');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('16:00');
  const [attendeesCount, setAttendeesCount] = useState<number>(Math.min(room.capacity, 30));
  const [purpose, setPurpose] = useState('');
  const [requiresAV, setRequiresAV] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide an event / booking title');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }
    if (attendeesCount > room.capacity) {
      setError(`Attendees (${attendeesCount}) exceed room capacity (${room.capacity})`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          title,
          organizer: organizer || 'Campus Faculty',
          department,
          date,
          startTime,
          endTime,
          attendeesCount,
          purpose,
          requiresAV
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#12131A] border border-[#252630] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#181A24] border-b border-[#252630] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#007BA7] font-semibold">Reserve Facility</span>
            <h3 className="text-base font-bold text-[#F5F7FA]">
              Book {room.roomNumber} ({room.name})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#252630] text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-[#FF2E88]/15 border border-[#FF2E88]/40 text-[#FF2E88] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Event / Session Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Systems Lab Practicum"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#007BA7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Organizer / Host Name
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Vance"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#007BA7]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#007BA7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#007BA7]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#007BA7]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#007BA7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Attendees (Max {room.capacity})
              </label>
              <input
                type="number"
                min="1"
                max={room.capacity}
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(parseInt(e.target.value) || 1)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#007BA7]"
              />
            </div>
            <div className="pt-5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={requiresAV}
                  onChange={(e) => setRequiresAV(e.target.checked)}
                  className="rounded border-[#252630] accent-[#007BA7] w-4 h-4"
                />
                <span>Requires Projector / AV Prep</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Purpose / Notes
            </label>
            <textarea
              rows={2}
              placeholder="Provide a brief summary of intended room usage..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#007BA7]"
            />
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-[#252630] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#181A24] hover:bg-[#202330] text-zinc-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#007BA7] hover:bg-[#0091C6] text-white text-xs font-bold shadow-lg shadow-[#007BA7]/20 flex items-center gap-2"
            >
              {loading ? 'Confirming...' : 'Confirm Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
