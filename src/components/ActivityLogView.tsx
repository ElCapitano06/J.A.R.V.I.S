import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  RotateCw, 
  ShieldCheck, 
  Sparkles, 
  Zap, 
  UserCheck, 
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ActivityLog, ActivityEventType } from '../types';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  onRefresh: () => void;
  onSelectTask: (taskId: string) => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  logs,
  onRefresh,
  onSelectTask,
}) => {
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = logs.filter((l) => {
    if (eventTypeFilter !== 'all' && l.eventType !== eventTypeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = 
        l.summary.toLowerCase().includes(q) ||
        l.actorName.toLowerCase().includes(q) ||
        l.relatedObjectId.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const getEventBadge = (type: ActivityEventType) => {
    switch (type) {
      case 'ai_processed':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]">AI Extraction</span>;
      case 'automation_executed':
        return <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold text-[10px]">Automation</span>;
      case 'task_completed':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">Completed</span>;
      case 'priority_changed':
        return <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">Priority Shift</span>;
      case 'status_changed':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">Status Shift</span>;
      case 'task_assigned':
      case 'task_reassigned':
        return <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-700 font-bold text-[10px]">Assignment</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Audit & Activity Log</h2>
              <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
                Immutable Ledger ({filtered.length})
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Full accountability for all operational modifications, AI inferences, assignments, and priority changes.
            </p>
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer self-start sm:self-auto"
            title="Refresh logs"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filter inputs */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor, task ID, summary..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-slate-900 outline-hidden"
            />
          </div>

          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="all">All Event Types</option>
            <option value="task_created">Task Created</option>
            <option value="task_assigned">Task Assigned</option>
            <option value="task_reassigned">Task Reassigned</option>
            <option value="status_changed">Status Changed</option>
            <option value="priority_changed">Priority Changed</option>
            <option value="deadline_changed">Deadline Changed</option>
            <option value="task_completed">Task Completed</option>
            <option value="ai_processed">AI Inferences</option>
            <option value="automation_executed">Automations Fired</option>
            <option value="comment_added">Comments Added</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No audit records matching your criteria.
          </div>
        ) : (
          filtered.map((log) => {
            const isTask = log.relatedObjectType === 'task';
            return (
              <div
                key={log.id}
                className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getEventBadge(log.eventType)}
                    <span className="font-mono text-[10px] text-slate-400">{log.id}</span>
                    <span className="font-semibold text-slate-900">{log.actorName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({log.actorRole})</span>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed">{log.summary}</p>

                  {(log.previousValue || log.newValue) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                      {log.previousValue && <span className="line-through text-slate-400">{log.previousValue}</span>}
                      {log.previousValue && log.newValue && <span>→</span>}
                      {log.newValue && <span className="font-bold text-slate-700">{log.newValue}</span>}
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 text-slate-400 text-[11px]">
                  <span>{new Date(log.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}</span>
                  {isTask && (
                    <button
                      onClick={() => onSelectTask(log.relatedObjectId)}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Task {log.relatedObjectId}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
