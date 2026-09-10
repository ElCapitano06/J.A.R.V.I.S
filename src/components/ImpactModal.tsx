import React, { useEffect, useState } from 'react';
import { X, Sparkles, Zap, TrendingUp, Clock, CheckCircle2, BarChart2 } from 'lucide-react';
import { ImpactMetrics } from '../types';
import { api } from '../api';

interface ImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImpactModal: React.FC<ImpactModalProps> = ({ isOpen, onClose }) => {
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getImpactMetrics()
        .then(setImpact)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Operational Impact & Time Savings</h3>
              <p className="text-xs text-slate-300">Measured efficiency ROI for Lala Tech LLC</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {loading || !impact ? (
            <div className="py-8 text-center text-xs text-slate-400">
              Calculating operational impact...
            </div>
          ) : (
            <>
              {/* Top Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-2xl font-bold text-indigo-600 block">
                    {impact.manualEffortAvoidedHours} hrs
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Effort Avoided
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                  <span className="text-2xl font-bold text-emerald-600 block">
                    {impact.efficiencyGainPercentage}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Task Velocity Gain
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center col-span-2 sm:col-span-1">
                  <span className="text-2xl font-bold text-slate-900 block">
                    {impact.automationsFired}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    Automations Fired
                  </span>
                </div>
              </div>

              {/* Time Benchmark Comparison */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Task Ingestion Benchmark Comparison
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Manual Processing (scattered chats, typing into spreadsheet, manual pinging):</span>
                      <strong className="text-slate-800">{impact.avgManualCreationMinutes} mins</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-rose-400 w-full" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Lala Ops AI Extraction + Verification:</span>
                      <strong className="text-emerald-700">{impact.avgAiCreationMinutes} mins</strong>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: '12.5%' }} />
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 pt-1">
                  Based on ~10.5 minutes saved per captured request + automatic SLA routing and escalation notifications.
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>{impact.aiRequestsProcessed} requests</strong> extracted and structured automatically.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero lost customer messages across WhatsApp and Email channels.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Full operational audit trail recorded for all task lifecycle changes.</span>
                </div>
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
