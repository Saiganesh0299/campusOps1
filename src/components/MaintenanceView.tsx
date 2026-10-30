import React, { useState } from 'react';
import { MaintenanceTicket, StaffTechnician } from '../types/campus';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Building2, 
  Check, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

interface MaintenanceViewProps {
  tickets: MaintenanceTicket[];
  technicians: StaffTechnician[];
  onOpenReportModal: () => void;
  onUpdateTicketStatus: (ticketId: string, newStatus: any, notes?: string) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  tickets,
  technicians,
  onOpenReportModal,
  onUpdateTicketStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buildingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.roomNumber && t.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || t.severity === severityFilter;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const criticalCount = tickets.filter(t => t.severity === 'critical' && t.status !== 'resolved').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#FF2E88]" />
            Maintenance & Facility Complaints
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch technicians, monitor campus repairs, and resolve classroom equipment tickets.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#d8196e] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,46,136,0.3)] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Complaint Ticket</span>
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-[11px] text-slate-400 block">Total Tickets</span>
          <span className="text-xl font-bold text-white font-mono">{tickets.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-[11px] text-slate-400 block">Critical Pending</span>
          <span className="text-xl font-bold text-red-400 font-mono">{criticalCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-[11px] text-slate-400 block">In Progress</span>
          <span className="text-xl font-bold text-amber-400 font-mono">{inProgressCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-[#121318] border border-[#252630]">
          <span className="text-[11px] text-slate-400 block">Resolved</span>
          <span className="text-xl font-bold text-emerald-400 font-mono">{resolvedCount}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tickets by title, building, room, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#007BA7]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-slate-200 focus:outline-none focus:border-[#007BA7] cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-[#121318] border border-[#252630] text-xs text-slate-200 focus:outline-none focus:border-[#007BA7] cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#121318] border border-[#252630]">
            <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No maintenance tickets found</p>
            <p className="text-xs text-slate-500 mt-1">Adjust filters or submit a new report</p>
          </div>
        ) : (
          filteredTickets.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl border transition-all ${
                selectedTicket?.id === t.id
                  ? 'bg-[#181924] border-[#FF2E88]'
                  : 'bg-[#121318] border-[#252630] hover:border-slate-600'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      t.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                      t.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}>
                      {t.severity}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#1e202c] text-slate-300 border border-slate-700 font-mono">
                      {t.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#007BA7]/15 text-[#007BA7] border border-[#007BA7]/30">
                      {t.category}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Reported: {new Date(t.reportedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {t.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-3">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#007BA7]" />
                      {t.buildingName} {t.roomNumber ? `• Room ${t.roomNumber}` : ''}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      Assigned: <strong className="text-slate-300 font-medium">{t.assignedTechnicianName || 'Unassigned'}</strong>
                    </span>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {t.status !== 'resolved' && (
                    <>
                      {t.status !== 'in_progress' && (
                        <button
                          onClick={() => onUpdateTicketStatus(t.id, 'in_progress')}
                          className="px-3 py-1.5 rounded-lg bg-[#252630] hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Mark In Progress
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setResolutionNotes('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-medium border border-emerald-500/40 transition-colors cursor-pointer"
                      >
                        Resolve Ticket
                      </button>
                    </>
                  )}

                  {t.status === 'resolved' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved
                    </span>
                  )}
                </div>
              </div>

              {/* Resolution Notes Modal Drawer when clicking Resolve Ticket */}
              {selectedTicket?.id === t.id && (
                <div className="mt-4 pt-4 border-t border-[#252630] space-y-3">
                  <label className="text-xs font-semibold text-slate-200 block">
                    Technician Resolution Summary
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Describe how the repair was completed (e.g., replaced fuse, calibrated projector HDMI switch)..."
                    className="w-full p-2.5 rounded-lg bg-[#0d0e14] border border-[#252630] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onUpdateTicketStatus(t.id, 'resolved', resolutionNotes || 'Repairs completed and verified operational.');
                        setSelectedTicket(null);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Confirm Resolution
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
