import React from 'react';
import { Building, Classroom, MaintenanceTicket, RoomBooking } from '../types/campus';
import { BarChart3, TrendingUp, Zap, DoorOpen, Wrench, Clock, CheckCircle } from 'lucide-react';

interface AnalyticsViewProps {
  buildings: Building[];
  classrooms: Classroom[];
  tickets: MaintenanceTicket[];
  bookings: RoomBooking[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  buildings,
  classrooms,
  tickets,
  bookings
}) => {
  // Compute analytics
  const totalClassrooms = classrooms.length;
  const bookedRooms = classrooms.filter(r => r.status === 'booked').length;
  const maintenanceRooms = classrooms.filter(r => r.status === 'maintenance').length;
  const availableRooms = classrooms.filter(r => r.status === 'available').length;

  const utilizationRate = Math.round(((bookedRooms + maintenanceRooms) / (totalClassrooms || 1)) * 100);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#007BA7]" />
          Operations & Spatial Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical space utilization, live electrical telemetry, maintenance MTTR, and classroom efficiency index.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-xs text-slate-400 block mb-1">Campus Space Utilization</span>
          <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-2">
            <span>{utilizationRate}%</span>
            <span className="text-xs text-emerald-400 font-sans font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4.2% this week
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 mt-3 overflow-hidden">
            <div className="h-full bg-[#007BA7] rounded-full" style={{ width: `${utilizationRate}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-xs text-slate-400 block mb-1">Total Power Demand</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {buildings.reduce((sum, b) => sum + (b.currentEnergyKw || 0), 0).toFixed(1)} kW
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">Target peak: 350.0 kW</span>
        </div>

        <div className="p-4 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-xs text-slate-400 block mb-1">Mean Time to Resolve (MTTR)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            2.4 <span className="text-sm font-sans font-normal text-slate-400">hrs</span>
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">18% faster than SLA</span>
        </div>

        <div className="p-4 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-xs text-slate-400 block mb-1">Active Booking Density</span>
          <div className="text-2xl font-bold font-mono text-white">
            {bookings.length} reservations
          </div>
          <span className="text-[11px] text-slate-500 block mt-2">Across 3 academic blocks</span>
        </div>
      </div>

      {/* Buildings Energy & Utilization Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-[#121318] border border-[#252630]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Live Power Consumption by Facility
          </h3>

          <div className="space-y-4">
            {buildings.map(b => {
              const maxKw = 160;
              const percent = Math.min(100, Math.round(((b.currentEnergyKw || 0) / maxKw) * 100));
              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{b.name}</span>
                    <span className="font-mono text-amber-400 font-bold">{b.currentEnergyKw} kW</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#1e202c] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#121318] border border-[#252630]">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <DoorOpen className="w-4 h-4 text-[#007BA7]" />
            Classroom Availability Breakdown
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-medium">Available Classrooms</span>
                <span className="font-mono text-white font-bold">{availableRooms} ({Math.round((availableRooms/totalClassrooms)*100)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1e202c] overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(availableRooms/totalClassrooms)*100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#007BA7] font-medium">Reserved / Booked</span>
                <span className="font-mono text-white font-bold">{bookedRooms} ({Math.round((bookedRooms/totalClassrooms)*100)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1e202c] overflow-hidden">
                <div className="h-full rounded-full bg-[#007BA7]" style={{ width: `${(bookedRooms/totalClassrooms)*100}%` }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#FF2E88] font-medium">Under Maintenance / Issue</span>
                <span className="font-mono text-white font-bold">{maintenanceRooms} ({Math.round((maintenanceRooms/totalClassrooms)*100)}%)</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#1e202c] overflow-hidden">
                <div className="h-full rounded-full bg-[#FF2E88]" style={{ width: `${(maintenanceRooms/totalClassrooms)*100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
