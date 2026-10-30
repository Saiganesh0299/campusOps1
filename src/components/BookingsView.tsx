import React, { useState } from 'react';
import { RoomBooking, Classroom, Building } from '../types/campus';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Building2, 
  Plus, 
  Search, 
  Users, 
  Trash2, 
  CheckCircle,
  DoorOpen,
  Filter
} from 'lucide-react';

interface BookingsViewProps {
  bookings: RoomBooking[];
  classrooms: Classroom[];
  buildings: Building[];
  onOpenBookingModal: (room?: Classroom) => void;
  onCancelBooking: (bookingId: string) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  classrooms,
  buildings,
  onOpenBookingModal,
  onCancelBooking
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('2026-10-30');

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBuilding = buildingFilter === 'all' || b.buildingName === buildingFilter;
    const matchesDate = !dateFilter || b.date === dateFilter;

    return matchesSearch && matchesBuilding && matchesDate;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-[#007BA7]" />
            Room Bookings & Academic Scheduling
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reserve smart classrooms, lecture halls, and specialized laboratories across all campus buildings.
          </p>
        </div>

        <button
          onClick={() => onOpenBookingModal()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#007BA7] to-[#0284c7] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,123,167,0.3)] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Room Reservation</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event, organizer, department, or room number..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007BA7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={buildingFilter}
            onChange={(e) => setBuildingFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-slate-200 focus:outline-none focus:border-[#007BA7] cursor-pointer"
          >
            <option value="all">All Buildings</option>
            {buildings.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-slate-200 focus:outline-none focus:border-[#007BA7] cursor-pointer"
          />
        </div>
      </div>

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-[#121318] border border-[#252630]">
            <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No scheduled bookings found</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting another date or create a new booking reservation.</p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-[#121318] border border-[#252630] hover:border-[#007BA7] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#007BA7]/15 text-[#007BA7] text-[11px] font-mono font-semibold border border-[#007BA7]/30">
                    <Clock className="w-3 h-3" />
                    {b.startTime} - {b.endTime}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {b.date}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-1">
                  {b.title}
                </h3>
                <p className="text-xs text-[#00d2ff] font-medium flex items-center gap-1 mb-2">
                  <DoorOpen className="w-3.5 h-3.5" />
                  Room {b.roomNumber} ({b.roomName})
                </p>
                <p className="text-xs text-slate-400">
                  {b.buildingName}
                </p>

                <div className="mt-4 pt-3 border-t border-[#252630] flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    {b.attendeesCount} Attendees
                  </span>
                  <span className="text-slate-500 truncate max-w-[140px]">
                    {b.organizer}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {b.department}
                </span>
                <button
                  onClick={() => onCancelBooking(b.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Cancel Booking"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
