import React from 'react';
import { 
  Building, 
  Classroom, 
  MaintenanceTicket, 
  RoomBooking, 
  CampusIncident, 
  DashboardMetrics 
} from '../types/campus';
import { 
  Building2, 
  DoorOpen, 
  Wrench, 
  Calendar, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Compass, 
  Layers, 
  Clock, 
  Sparkles 
} from 'lucide-react';

interface DashboardViewProps {
  buildings: Building[];
  classrooms: Classroom[];
  tickets: MaintenanceTicket[];
  bookings: RoomBooking[];
  incidents: CampusIncident[];
  metrics: DashboardMetrics;
  onNavigateTo3D: (building?: Building) => void;
  onNavigateToFloorPlan: (building: Building) => void;
  onOpenReportModal: () => void;
  onOpenBookingModal: (room?: Classroom) => void;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  buildings,
  classrooms,
  tickets,
  bookings,
  incidents,
  metrics,
  onNavigateTo3D,
  onNavigateToFloorPlan,
  onOpenReportModal,
  onOpenBookingModal,
  onNavigateTab
}) => {
  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const recentTickets = tickets.slice(0, 5);
  const todayBookings = bookings.slice(0, 4);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome / Headline Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12131a] via-[#161724] to-[#0d1624] border border-[#252630] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="text-xs font-mono tracking-wider uppercase text-emerald-400 font-semibold">
                Campus Command Center • All Systems Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Campus Operations Hub
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Real-time spatial visualization, classroom automation, smart energy dispatch, and predictive maintenance management across the college campus.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTo3D()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#d8196e] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,46,136,0.3)] cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Launch 3D Campus</span>
            </button>
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#252630] hover:bg-slate-700 text-white text-xs font-semibold transition-all cursor-pointer border border-slate-700"
            >
              <Wrench className="w-4 h-4 text-[#FF2E88]" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>

        {/* Ambient background glowing accents */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#007BA7]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-[#FF2E88]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Active Incidents Banner (if any) */}
      {activeIncidents.length > 0 && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Active Priority Alert ({activeIncidents.length})
                </span>
                <button
                  onClick={() => onNavigateTab('incidents')}
                  className="text-xs text-amber-400 hover:text-amber-200 underline cursor-pointer"
                >
                  View Incident Log →
                </button>
              </div>
              <p className="text-sm font-semibold text-white mt-0.5">
                {activeIncidents[0].title}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {activeIncidents[0].actionTaken || activeIncidents[0].description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Primary KPI Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-[#121318] border border-[#252630] rounded-xl p-4 shadow-sm hover:border-[#007BA7]/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">System Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.operationalRate}%
          </div>
          <span className="text-[11px] text-slate-500">Fully operational</span>
        </div>

        <div className="bg-[#121318] border border-[#252630] rounded-xl p-4 shadow-sm hover:border-[#007BA7]/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Campus Space</span>
            <DoorOpen className="w-4 h-4 text-[#007BA7]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {classrooms.length}
          </div>
          <span className="text-[11px] text-slate-500">{buildings.length} Active Complexes</span>
        </div>

        <div className="bg-[#121318] border border-[#252630] rounded-xl p-4 shadow-sm hover:border-[#007BA7]/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Open Tickets</span>
            <Wrench className="w-4 h-4 text-[#FF2E88]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#FF2E88]">
            {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length}
          </div>
          <span className="text-[11px] text-slate-500">Dispatched to staff</span>
        </div>

        <div className="bg-[#121318] border border-[#252630] rounded-xl p-4 shadow-sm hover:border-[#007BA7]/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Room Bookings</span>
            <Calendar className="w-4 h-4 text-[#007BA7]" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {bookings.length}
          </div>
          <span className="text-[11px] text-slate-500">Scheduled events</span>
        </div>

        <div className="bg-[#121318] border border-[#252630] rounded-xl p-4 shadow-sm hover:border-[#007BA7]/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Energy Draw</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {buildings.reduce((sum, b) => sum + (b.currentEnergyKw || 0), 0).toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <span className="text-[11px] text-slate-500">Live smart meter</span>
        </div>

        <div className="bg-[#121318] border border-[#252630] rounded-xl p-4 shadow-sm hover:border-[#007BA7]/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Available Techs</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {metrics.availableStaffCount}
          </div>
          <span className="text-[11px] text-slate-500">Ready on campus</span>
        </div>
      </div>

      {/* Campus Buildings Visual Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#007BA7]" />
              Unified Campus Buildings
            </h2>
            <p className="text-xs text-slate-400">
              Select any building to view in the 3D scene or inspect architectural floor plans
            </p>
          </div>
          <button
            onClick={() => onNavigateTo3D()}
            className="text-xs text-[#007BA7] hover:text-[#00d2ff] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View 3D Campus</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="group bg-[#121318] border border-[#252630] hover:border-[#007BA7] rounded-2xl p-5 shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#007BA7]/15 text-[#007BA7] border border-[#007BA7]/30">
                    {b.code}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {b.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#00d2ff] transition-colors">
                  {b.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                  {b.description}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 py-2 border-y border-[#252630]/60 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Floors</span>
                    <span className="text-xs font-bold text-white font-mono">{b.floorsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Rooms</span>
                    <span className="text-xs font-bold text-white font-mono">{b.classroomsCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Energy</span>
                    <span className="text-xs font-bold text-amber-400 font-mono">{b.currentEnergyKw} kW</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-2">
                <button
                  onClick={() => onNavigateTo3D(b)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#1e202c] hover:bg-[#007BA7] hover:text-white text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#252630]"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>3D View</span>
                </button>
                <button
                  onClick={() => onNavigateToFloorPlan(b)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#FF2E88]/15 hover:bg-[#FF2E88] text-[#FF2E88] hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-[#FF2E88]/30"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Floor Plan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Live Maintenance Queue & Room Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Queue */}
        <div className="bg-[#121318] border border-[#252630] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#FF2E88]" />
              Active Maintenance Complaints
            </h3>
            <button
              onClick={() => onNavigateTab('maintenance')}
              className="text-xs text-[#007BA7] hover:underline cursor-pointer"
            >
              View All ({tickets.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTickets.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No open maintenance complaints.</p>
            ) : (
              recentTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-[#0d0e14] border border-[#252630] hover:border-slate-600 transition-colors flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                        t.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                      }`}>
                        {t.severity}
                      </span>
                      <span className="text-xs font-semibold text-white truncate">
                        {t.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{t.buildingName}</span>
                      {t.roomNumber && <span>• Room {t.roomNumber}</span>}
                      <span>•</span>
                      <span className="text-slate-500">{t.category}</span>
                    </div>
                  </div>

                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    t.status === 'in_progress' ? 'bg-amber-500/10 text-amber-400' :
                    t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Room Bookings Timeline */}
        <div className="bg-[#121318] border border-[#252630] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#007BA7]" />
              Scheduled Room Bookings
            </h3>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs text-[#007BA7] hover:underline cursor-pointer"
            >
              View Schedule ({bookings.length}) →
            </button>
          </div>

          <div className="space-y-2.5">
            {todayBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No upcoming bookings scheduled today.</p>
            ) : (
              todayBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-[#0d0e14] border border-[#252630] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#1e202c] border border-slate-700 flex flex-col items-center justify-center shrink-0 text-center">
                      <Clock className="w-3.5 h-3.5 text-[#007BA7] mb-0.5" />
                      <span className="text-[10px] font-mono text-slate-300">{b.startTime}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
                        {b.title}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {b.buildingName} • Room {b.roomNumber}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {b.organizer} ({b.department})
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#161720] text-slate-400 border border-[#252630] shrink-0">
                    {b.startTime} - {b.endTime}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
