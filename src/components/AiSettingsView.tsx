import React, { useState } from 'react';
import { Sparkles, Sliders, Shield, Zap, Bell, Check } from 'lucide-react';

export const AiSettingsView: React.FC = () => {
  const [autoTriage, setAutoTriage] = useState(true);
  const [proactiveAlerts, setProactiveAlerts] = useState(true);
  const [energyOptimization, setEnergyOptimization] = useState(true);
  const [sensorPollInterval, setSensorPollInterval] = useState('15');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#FF2E88]" />
          Autonomous AI & Copilot Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure Gemini AI reasoning parameters, automatic ticket routing, sensor triggers, and campus safety rules.
        </p>
      </div>

      <div className="space-y-4">
        {/* Model Spec */}
        <div className="p-5 rounded-2xl bg-[#121318] border border-[#252630]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Active Gemini Intelligence Engine</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Powered by Google Gemini 2.5/3.8 Flash model with native multimodal reasoning and structured function calling.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#FF2E88]/15 text-[#FF2E88] border border-[#FF2E88]/30">
              gemini-3.8-flash
            </span>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="p-5 rounded-2xl bg-[#121318] border border-[#252630] space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#007BA7]" />
            Automated Operations Policies
          </h3>

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-semibold text-white block">Autonomous Maintenance Triage</span>
              <span className="text-[11px] text-slate-400">
                Automatically parse user complaints, classify category and severity, and assign the best available on-duty technician.
              </span>
            </div>
            <button
              onClick={() => setAutoTriage(!autoTriage)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoTriage ? 'bg-[#FF2E88]' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${autoTriage ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-[#252630] pt-4">
            <div>
              <span className="text-xs font-semibold text-white block">Proactive Facilities Health Alerts</span>
              <span className="text-[11px] text-slate-400">
                Generate early warnings when HVAC power consumption or room temperature deviates by more than 15%.
              </span>
            </div>
            <button
              onClick={() => setProactiveAlerts(!proactiveAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                proactiveAlerts ? 'bg-[#007BA7]' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${proactiveAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-[#252630] pt-4">
            <div>
              <span className="text-xs font-semibold text-white block">Eco-Smart Energy Regulation</span>
              <span className="text-[11px] text-slate-400">
                Dim classroom lighting and decrease HVAC load automatically when zero occupancy is detected for 20+ minutes.
              </span>
            </div>
            <button
              onClick={() => setEnergyOptimization(!energyOptimization)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                energyOptimization ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${energyOptimization ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="border-t border-[#252630] pt-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">IoT Sensor Telemetry Refresh Rate</span>
              <span className="text-[11px] text-slate-400">Frequency of simulated sensor reading sync from campus hubs</span>
            </div>
            <select
              value={sensorPollInterval}
              onChange={(e) => setSensorPollInterval(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#0d0e14] border border-[#252630] text-xs text-white"
            >
              <option value="5">Every 5 seconds</option>
              <option value="15">Every 15 seconds</option>
              <option value="30">Every 30 seconds</option>
              <option value="60">Every 1 minute</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E88] to-[#d8196e] text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,46,136,0.3)] cursor-pointer"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            <span>{saved ? 'Preferences Saved' : 'Save Configurations'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
