import React, { useState } from 'react';
import { 
  Zap, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RotateCw, 
  Sliders, 
  ShieldCheck,
  Power
} from 'lucide-react';
import { AutomationRule } from '../types';
import { api } from '../api';

interface AutomationsViewProps {
  rules: AutomationRule[];
  userRole: string;
  onRefresh: () => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  rules,
  userRole,
  onRefresh,
}) => {
  const [runningChecks, setRunningChecks] = useState(false);
  const [checkResult, setCheckResult] = useState<string | null>(null);

  const handleToggleRule = async (rule: AutomationRule) => {
    try {
      await api.updateAutomation(rule.id, { enabled: !rule.enabled });
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunChecks = async () => {
    setRunningChecks(true);
    setCheckResult(null);
    try {
      const res = await api.runAutomationChecks();
      setCheckResult(`Audited ${res.checkedCount} tasks. Automations evaluated successfully.`);
      onRefresh();
    } catch (err: any) {
      setCheckResult(`Check failed: ${err.message}`);
    } finally {
      setRunningChecks(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Automation Rules</h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {rules.filter(r => r.enabled).length} Active Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Event-driven operational triggers enforcing SLAs, priority escalation, auto-routing, and telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="run-automation-checks-btn"
            onClick={handleRunChecks}
            disabled={runningChecks}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 ${runningChecks ? 'animate-spin' : ''}`} />
            <span>{runningChecks ? 'Evaluating...' : 'Run SLA Check Now'}</span>
          </button>
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh rules"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {checkResult && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{checkResult}</span>
          </div>
          <button onClick={() => setCheckResult(null)} className="text-indigo-400 hover:text-indigo-700 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => {
          return (
            <div
              key={rule.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                rule.enabled ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold text-slate-400">{rule.id}</span>
                    <h3 className="text-sm font-bold text-slate-900">{rule.title}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider ${
                        rule.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>

                  {/* Logic visualizer: IF -> THEN */}
                  <div className="pt-2 flex items-center gap-2 text-xs flex-wrap">
                    <div className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-mono text-[11px]">
                      <strong className="text-slate-900 font-sans">IF:</strong> {rule.trigger}
                    </div>
                    <span className="text-slate-400 text-xs font-bold">→</span>
                    <div className="px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 font-mono text-[11px] border border-indigo-100">
                      <strong className="text-indigo-950 font-sans">THEN:</strong> {rule.action}
                    </div>
                  </div>
                </div>

                {/* Right Side: Toggle & Stats */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      rule.enabled
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{rule.enabled ? 'Disable' : 'Enable'}</span>
                  </button>

                  <div className="text-right text-xs text-slate-500">
                    <span className="block font-semibold text-slate-800">
                      Triggered: <strong className="text-indigo-600">{rule.timesTriggered} times</strong>
                    </span>
                    {rule.lastTriggered && (
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Last run: {new Date(rule.lastTriggered).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
