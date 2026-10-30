import React, { useState } from 'react';
import { Classroom, Building, TicketSeverity } from '../types/campus';
import { Wrench, AlertTriangle, X, Check, ShieldAlert } from 'lucide-react';

interface ReportIssueModalProps {
  room?: Classroom;
  building: Building;
  onClose: () => void;
  onSuccess: (ticket: any) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  room,
  building,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState(room ? `Malfunction in ${room.roomNumber}` : 'Campus Facility Issue');
  const [category, setCategory] = useState<'Electrical' | 'HVAC' | 'Plumbing' | 'Audio/Visual' | 'Furniture' | 'Structural' | 'Network'>('Audio/Visual');
  const [severity, setSeverity] = useState<TicketSeverity>('high');
  const [description, setDescription] = useState('');
  const [reportedBy, setReportedBy] = useState('Campus Faculty');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a ticket title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          buildingId: building.id,
          roomId: room?.id,
          category,
          severity,
          reportedBy
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint');
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error filing maintenance ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#12131A] border border-[#252630] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#181A24] border-b border-[#252630] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-[#FF2E88] font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              <span>Log Maintenance Ticket</span>
            </span>
            <h3 className="text-base font-bold text-[#F5F7FA]">
              {room ? `Report Issue: ${room.roomNumber} (${room.name})` : `Report Issue: ${building.name}`}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FF2E88]/15 border border-[#FF2E88]/40 text-[#FF2E88] text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Issue Summary / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Projector lamp flickering and overheating"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2E88]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
              >
                <option value="Audio/Visual">Audio / Visual</option>
                <option value="Electrical">Electrical</option>
                <option value="HVAC">HVAC / Climate</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Network">Network / Wi-Fi</option>
                <option value="Furniture">Furniture</option>
                <option value="Structural">Structural</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
                Urgency / Severity
              </label>
              <select
                value={severity}
                onChange={(e: any) => setSeverity(e.target.value)}
                className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
              >
                <option value="low">Low (Cosmetic / Routine)</option>
                <option value="medium">Medium (Impaired Function)</option>
                <option value="high">High (Classroom Blocked)</option>
                <option value="critical">Critical (Safety Hazard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Reported By
            </label>
            <input
              type="text"
              placeholder="Your name or faculty title"
              value={reportedBy}
              onChange={(e) => setReportedBy(e.target.value)}
              className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#FF2E88]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 uppercase mb-1.5">
              Detailed Description & Symptoms
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describe what happened, any warning lights, error codes, or safety risks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#181A24] border border-[#252630] rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF2E88]"
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
              className="px-5 py-2 rounded-xl bg-[#FF2E88] hover:bg-[#FF4598] text-white text-xs font-bold shadow-lg shadow-[#FF2E88]/20 flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Dispatch Maintenance Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
