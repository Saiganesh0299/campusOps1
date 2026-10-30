import React from 'react';
import { StaffTechnician } from '../types/campus';
import { Users, Phone, Mail, Clock, Star, Wrench, ShieldCheck, Check } from 'lucide-react';

interface StaffViewProps {
  technicians: StaffTechnician[];
  onDispatchTech?: (tech: StaffTechnician) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ technicians, onDispatchTech }) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-[#007BA7]" />
          Operations & Facilities Personnel
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Certified campus engineers, electrical tradesmen, network technicians, and HVAC specialists on duty.
        </p>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-[#121318] border border-[#252630] hover:border-[#007BA7] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#007BA7] to-[#0284c7] flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{t.name}</h3>
                    <p className="text-[11px] text-slate-400">{t.role}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  t.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  t.status === 'on_task' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-slate-800 text-slate-400'
                }`}>
                  {t.status.replace('_', ' ')}
                </span>
              </div>

              {/* Specialties badges */}
              <div className="flex flex-wrap gap-1 mb-4">
                {t.specialties.map(spec => (
                  <span
                    key={spec}
                    className="px-2 py-0.5 rounded text-[10px] bg-[#1a1c26] text-slate-300 border border-[#252630]"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 py-2 border-t border-[#252630]">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t.shift}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[11px]">{t.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] truncate">{t.email}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#252630] flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-mono font-semibold">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{t.rating.toFixed(2)}</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Active tasks: <strong className="text-white font-mono">{t.activeTicketsCount}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
