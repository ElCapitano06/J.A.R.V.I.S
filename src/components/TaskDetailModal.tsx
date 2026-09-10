import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Sparkles, 
  Send, 
  Lock, 
  History, 
  MessageSquare,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Task, TaskComment, OperationalRequest, ActivityLog, User, TaskStatus, TaskPriority, TaskCategory } from '../types';
import { api } from '../api';

interface TaskDetailModalProps {
  taskId: string;
  currentUser: User;
  allUsers: User[];
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  currentUser,
  allUsers,
  onClose,
  onTaskUpdated,
}) => {
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [relatedRequest, setRelatedRequest] = useState<OperationalRequest | null>(null);
  const [taskLogs, setTaskLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Status & Blocker modal state
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const fetchTaskDetails = async () => {
    try {
      const data = await api.getTask(taskId);
      setTask(data.task);
      setComments(data.comments);
      setRelatedRequest(data.relatedRequest);
      const logs = await api.getActivityLogs({ taskId });
      setTaskLogs(logs);
    } catch (err: any) {
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const isManager = currentUser.role === 'manager';
  const isAssignee = task?.assigneeId === currentUser.id;
  const canModify = isManager || isAssignee;

  const handleUpdateStatus = async (newStatus: TaskStatus) => {
    if (!task) return;
    if (newStatus === 'Blocked') {
      setShowBlockerModal(true);
      return;
    }
    try {
      await api.updateTask(task.id, { status: newStatus });
      await fetchTaskDetails();
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Status update failed');
    }
  };

  const handleConfirmBlock = async () => {
    if (!task || !blockReason.trim()) return;
    try {
      await api.updateTask(task.id, {
        status: 'Blocked',
        blockReason: blockReason.trim(),
      });
      setShowBlockerModal(false);
      setBlockReason('');
      await fetchTaskDetails();
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to block task');
    }
  };

  const handleReassign = async (newAssigneeId: string) => {
    if (!task || !isManager) return;
    try {
      await api.updateTask(task.id, { assigneeId: newAssigneeId || null });
      await fetchTaskDetails();
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Reassignment failed');
    }
  };

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    if (!task || !isManager) return;
    try {
      await api.updateTask(task.id, { priority: newPriority });
      await fetchTaskDetails();
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Priority update failed');
    }
  };

  const handleDeadlineChange = async (newDeadline: string) => {
    if (!task || !isManager) return;
    try {
      await api.updateTask(task.id, { deadline: newDeadline || null });
      await fetchTaskDetails();
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Deadline update failed');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.addComment(task.id, {
        content: newComment.trim(),
        isInternalNote,
      });
      setNewComment('');
      setIsInternalNote(false);
      await fetchTaskDetails();
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-xl flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900" />
          <span className="text-xs font-medium text-slate-600">Loading task record...</span>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
          <p className="text-sm text-slate-800 font-semibold mb-4">Task not found</p>
          <button onClick={onClose} className="px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.deadline && task.deadline < todayStr && task.status !== 'Completed';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="font-mono text-xs font-bold text-slate-300 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {task.id}
            </span>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold truncate">{task.title}</h3>
              <p className="text-xs text-slate-400">Created by {task.creatorName} • {new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Core Task Details & Comments */}
          <div className="lg:col-span-2 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Blocked Notice */}
            {task.status === 'Blocked' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wide">Work Blocked</h4>
                  <p className="text-xs text-rose-700 mt-0.5">{task.blockReason || 'Blocked awaiting dependencies or client information.'}</p>
                </div>
              </div>
            )}

            {/* Overdue Alert */}
            {isOverdue && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">SLA Deadline Overdue</h4>
                  <p className="text-xs text-amber-700 mt-0.5">
                    This task was scheduled for completion by <strong>{task.deadline}</strong> and requires immediate priority.
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Description & Scope
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {task.description || 'No additional description provided.'}
              </div>
            </div>

            {/* Related Ingress Request (Auditability) */}
            {relatedRequest && (
              <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    Ingress Source: {relatedRequest.source.toUpperCase()} ({relatedRequest.id})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Received: {new Date(relatedRequest.receivedTimestamp).toLocaleString()}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-white border border-slate-200 text-[11px] font-mono text-slate-700 max-h-24 overflow-y-auto">
                  {relatedRequest.originalMessage}
                </div>
              </div>
            )}

            {/* Quick Status Advancement */}
            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Update Status
              </span>
              <div className="flex flex-wrap gap-2">
                {(['Inbox', 'Assigned', 'In Progress', 'Blocked', 'Completed'] as TaskStatus[]).map((st) => {
                  const isActive = task.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={!canModify}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        isActive
                          ? st === 'Completed'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : st === 'Blocked'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : st === 'In Progress'
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
              {!canModify && (
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Only the assigned employee ({task.assigneeName || 'Unassigned'}) or a manager can modify this task.
                </p>
              )}
            </div>

            {/* Comments & Collaboration Stream */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Discussion & Operational Notes ({comments.length})
                </h4>
              </div>

              {/* List */}
              <div className="space-y-2.5 mb-4 max-h-48 overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No comments or notes yet.</p>
                ) : (
                  comments.map((cmt) => (
                    <div
                      key={cmt.id}
                      className={`p-3 rounded-xl text-xs border ${
                        cmt.isInternalNote
                          ? 'bg-amber-50/60 border-amber-200'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          <span>{cmt.authorName}</span>
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                              cmt.authorRole === 'manager'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {cmt.authorRole}
                          </span>
                          {cmt.isInternalNote && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">
                              Internal Note
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{cmt.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment form */}
              <form onSubmit={handleAddComment} className="space-y-2">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Type an update, clarification, or note..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-hidden"
                />
                <div className="flex items-center justify-between">
                  {isManager ? (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      <span>Internal Manager Note</span>
                    </label>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post Update</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column (1 col): Metadata Sidebar & Audit Log */}
          <div className="space-y-5 lg:border-l lg:border-slate-100 lg:pl-6">
            {/* Meta Attributes Panel */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5 text-xs">
              {/* Assignee */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Assignee
                </label>
                {isManager ? (
                  <select
                    value={task.assigneeId || ''}
                    onChange={(e) => handleReassign(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
                  >
                    <option value="">Unassigned (Inbox)</option>
                    {allUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.department || u.role})
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    {task.assigneeName || 'Unassigned'}
                  </span>
                )}
              </div>

              {/* Priority */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Priority
                </label>
                {isManager ? (
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                ) : (
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] inline-block ${
                      task.priority === 'Critical'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'High'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Deadline SLA
                </label>
                {isManager ? (
                  <input
                    type="date"
                    value={task.deadline || ''}
                    onChange={(e) => handleDeadlineChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
                  />
                ) : (
                  <span className={`font-semibold flex items-center gap-1 ${isOverdue ? 'text-rose-600' : 'text-slate-800'}`}>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {task.deadline || 'No deadline specified'}
                  </span>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Category
                </label>
                <span className="font-semibold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 inline-block">
                  {task.category}
                </span>
              </div>

              {/* Customer */}
              {task.customer && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Customer
                  </label>
                  <span className="font-bold text-slate-900">{task.customer}</span>
                </div>
              )}

              {/* AI Assistance Badge */}
              {task.aiAssisted && (
                <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 text-indigo-700 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>AI Extracted & Structured</span>
                </div>
              )}
            </div>

            {/* Task Audit Trail (Section 22) */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Audit History ({taskLogs.length})
                </h4>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto text-[11px]">
                {taskLogs.length === 0 ? (
                  <p className="text-slate-400 italic">No historical log entries.</p>
                ) : (
                  taskLogs.map((l) => (
                    <div key={l.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="font-medium text-slate-800 leading-snug">{l.summary}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>{l.actorName}</span>
                        <span>{new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Blocker Modal */}
        {showBlockerModal && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-5 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">State Blocker Reason</h3>
              </div>
              <p className="text-xs text-slate-600">
                Please document why this task is blocked (missing client documents, technical dependency, awaiting approval) so managers can intervene:
              </p>
              <textarea
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Awaiting client authorization signature on invoice #442..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-hidden"
                required
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlockerModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  disabled={!blockReason.trim()}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-40"
                >
                  Confirm Blocker
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
