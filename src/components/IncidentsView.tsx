import React, { useState } from 'react';
import { CampusIncident, Building } from '../types/campus';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Plus, 
  X, 
  Activity 
} from 'lucide-react';

interface IncidentsViewProps {
  incidents: CampusIncident[];
  buildings: Building[];
  onAddIncident: (incident: any) => void;
  onUpdateStatus: (incidentId: string, status: any) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  buildings,
  onAddIncident,
  onUpdateStatus
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Network' | 'Power' | 'HVAC' | 'Security' | 'Facility'>('Network');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [selectedBldg, setSelectedBldg] = useState(buildings[0]?.name || 'Orion Academic Block');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddIncident({
      title,
      description,
      category,
      severity,
      affectedBuildings: [selectedBldg],
      actionTaken: 'Initial triage team dispatched. Investigation underway.'
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Campus Incidents & Critical Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time incident response, network outages, power fluctuations, and facility remediation logs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report Campus Incident</span>
        </button>
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 rounded-2xl bg-[#121318] border border-[#252630] hover:border-slate-600 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  inc.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  inc.severity === 'high' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                }`}>
                  {inc.severity}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-[#1c1d28] text-slate-300 border border-[#252630]">
                  {inc.category}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(inc.reportedAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  inc.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  inc.status === 'mitigating' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                }`}>
                  Status: {inc.status}
                </span>

                {inc.status !== 'resolved' && (
                  <button
                    onClick={() => onUpdateStatus(inc.id, inc.status === 'investigating' ? 'mitigating' : 'resolved')}
                    className="px-3 py-1 rounded-lg bg-[#252630] hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    Advance Status
                  </button>
                )}
              </div>
            </div>

            <h3 className="text-base font-bold text-white">
              {inc.title}
            </h3>
            <p className="text-xs text-slate-400">
              {inc.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-[#252630]">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#007BA7]" />
                Affected: <strong className="text-slate-300 font-medium">{inc.affectedBuildings.join(', ')}</strong>
              </span>
              {inc.actionTaken && (
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Activity className="w-3.5 h-3.5" />
                  Action: {inc.actionTaken}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Report Incident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A0A0C] border border-[#252630] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Report Campus Incident
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Incident Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Main Loop Chilled Water Low Pressure Alert"
                  className="w-full p-2.5 rounded-lg bg-[#121318] border border-[#252630] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#121318] border border-[#252630] text-white focus:outline-none"
                  >
                    <option value="Network">Network</option>
                    <option value="Power">Power</option>
                    <option value="HVAC">HVAC</option>
                    <option value="Security">Security</option>
                    <option value="Facility">Facility</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Severity</label>
                  <select
                    value={severity}
                    onChange={(e: any) => setSeverity(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#121318] border border-[#252630] text-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Primary Affected Building</label>
                <select
                  value={selectedBldg}
                  onChange={(e) => setSelectedBldg(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-[#121318] border border-[#252630] text-white focus:outline-none"
                >
                  {buildings.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Incident Description & Impact</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide technical specifics, sensor anomalies, or affected areas..."
                  className="w-full p-2.5 rounded-lg bg-[#121318] border border-[#252630] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg cursor-pointer"
                >
                  Log Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
