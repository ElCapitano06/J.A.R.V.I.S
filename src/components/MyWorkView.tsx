import React, { useState } from 'react';
import { 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  ArrowRight, 
  Sparkles,
  User as UserIcon,
  MessageSquare,
  Plus
} from 'lucide-react';
import { Task, User, TaskStatus } from '../types';
import { api } from '../api';

interface MyWorkViewProps {
  currentUser: User;
  allTasks: Task[];
  onSelectTask: (taskId: string) => void;
  onRefresh: () => void;
}

export const MyWorkView: React.FC<MyWorkViewProps> = ({
  currentUser,
  allTasks,
  onSelectTask,
  onRefresh,
}) => {
  const [blockModalTaskId, setBlockModalTaskId] = useState<string | null>(null);
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter tasks assigned to current user
  const myTasks = allTasks.filter((t) => t.assigneeId === currentUser.id);

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = myTasks.filter((t) => t.deadline && t.deadline < todayStr && t.status !== 'Completed');
  const dueTodayTasks = myTasks.filter((t) => t.deadline === todayStr && t.status !== 'Completed');
  const inProgressTasks = myTasks.filter((t) => t.status === 'In Progress');
  const blockedTasks = myTasks.filter((t) => t.status === 'Blocked');
  const assignedTasks = myTasks.filter((t) => t.status === 'Assigned');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed');

  const handleQuickStatus = async (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'Blocked') {
      setBlockModalTaskId(taskId);
      return;
    }
    setUpdatingId(taskId);
    try {
      await api.updateTask(taskId, { status: newStatus });
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmBlock = async () => {
    if (!blockModalTaskId || !blockReasonInput.trim()) return;
    setUpdatingId(blockModalTaskId);
    try {
      await api.updateTask(blockModalTaskId, {
        status: 'Blocked',
        blockReason: blockReasonInput.trim(),
      });
      setBlockModalTaskId(null);
      setBlockReasonInput('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {currentUser.name}'s Workspace
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                {currentUser.department || 'Operations'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal execution queue. Pick up assigned work, log roadblocks, and mark completed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
            {myTasks.filter(t => t.status !== 'Completed').length} Active Deliverables
          </div>
          {overdueTasks.length > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700">
              {overdueTasks.length} Overdue
            </div>
          )}
        </div>
      </div>

      {/* Overdue Warning Section if any */}
      {overdueTasks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wide mb-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Overdue SLA Alert ({overdueTasks.length})</span>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                className="p-3 rounded-lg bg-white border border-rose-200 hover:border-rose-300 transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-rose-900">{t.title}</span>
                  <span className="text-slate-400 block text-[11px]">Due on {t.deadline}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickStatus(t.id, 'In Progress');
                  }}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] cursor-pointer"
                >
                  Work on this
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. In Progress */}
        <div className="bg-white rounded-xl border border-indigo-200 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-indigo-50">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-indigo-100 text-indigo-700">
                <Play className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">In Progress ({inProgressTasks.length})</h3>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {inProgressTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No tasks currently in progress</p>
            ) : (
              inProgressTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                      {t.priority}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{t.title}</h4>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatus(t.id, 'Blocked');
                      }}
                      className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      Report Blocker
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatus(t.id, 'Completed');
                      }}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold transition-colors cursor-pointer"
                    >
                      Complete Task
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. Assigned / Pending Pickup */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-100 text-blue-700">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Assigned / Queue ({assignedTasks.length})</h3>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {assignedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">Queue is currently clear</p>
            ) : (
              assignedTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {t.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{t.title}</h4>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Due: {t.deadline || 'No date'}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatus(t.id, 'In Progress');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold cursor-pointer"
                    >
                      <Play className="w-2.5 h-2.5" />
                      <span>Start Working</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Blocked */}
        <div className="bg-white rounded-xl border border-rose-200 shadow-xs p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-rose-50">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-rose-100 text-rose-700">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Blocked ({blockedTasks.length})</h3>
            </div>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {blockedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No blocked tasks</p>
            ) : (
              blockedTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className="p-3 rounded-lg bg-rose-50/50 border border-rose-200 hover:border-rose-300 transition-all cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400">{t.id}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                      Blocked
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{t.title}</h4>
                  <div className="p-1.5 rounded bg-white border border-rose-200 text-[11px] text-rose-700">
                    <strong>Reason:</strong> {t.blockReason || 'Pending resolution'}
                  </div>
                  <div className="pt-2 border-t border-rose-200/60 flex items-center justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickStatus(t.id, 'In Progress');
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold cursor-pointer"
                    >
                      Unblock & Resume
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Completed Archive Accordion */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recently Completed ({completedTasks.length})
            </h3>
          </div>
        </div>

        {completedTasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No completed tasks recorded yet in this cycle.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {completedTasks.slice(0, 5).map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                className="py-2.5 hover:bg-slate-50 flex items-center justify-between text-xs cursor-pointer"
              >
                <div>
                  <span className="font-mono text-[10px] text-slate-400 mr-2">{t.id}</span>
                  <span className="font-semibold text-slate-800 line-through text-slate-500">{t.title}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString() : 'Done'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blocker Modal */}
      {blockModalTaskId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-sm">Document Blocker</h3>
            </div>
            <p className="text-xs text-slate-600">
              Explain why this task cannot proceed. Managers and team members will be notified to unblock you.
            </p>
            <textarea
              rows={3}
              value={blockReasonInput}
              onChange={(e) => setBlockReasonInput(e.target.value)}
              placeholder="e.g. Waiting for client to send bank receipt statement..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-hidden"
              required
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBlockModalTaskId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlock}
                disabled={!blockReasonInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
              >
                Submit Blocker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
