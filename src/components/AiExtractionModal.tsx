import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  User as UserIcon, 
  Tag, 
  AlertCircle, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { OperationalRequest, ExtractedInfo, TaskCategory, TaskPriority, User } from '../types';

interface AiExtractionModalProps {
  request: OperationalRequest;
  availableEmployees: User[];
  onClose: () => void;
  onConfirmTask: (data: {
    title: string;
    description: string;
    customer?: string | null;
    category: TaskCategory;
    priority: TaskPriority;
    deadline?: string | null;
    assigneeId?: string | null;
    isAiAssisted?: boolean;
  }) => Promise<void>;
}

export const AiExtractionModal: React.FC<AiExtractionModalProps> = ({
  request,
  availableEmployees,
  onClose,
  onConfirmTask,
}) => {
  const extracted = request.extractedInfo;

  const [title, setTitle] = useState(extracted?.taskTitle || '');
  const [description, setDescription] = useState(extracted?.taskDescription || request.originalMessage);
  const [customer, setCustomer] = useState(extracted?.customer || request.customer || '');
  const [category, setCategory] = useState<TaskCategory>(extracted?.category || 'Operations');
  const [priority, setPriority] = useState<TaskPriority>(extracted?.priority || 'Medium');
  const [deadline, setDeadline] = useState(extracted?.deadline || '');
  const [assigneeId, setAssigneeId] = useState(extracted?.suggestedAssigneeId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (extracted) {
      setTitle(extracted.taskTitle || '');
      setDescription(extracted.taskDescription || request.originalMessage);
      setCustomer(extracted.customer || request.customer || '');
      setCategory(extracted.category || 'Operations');
      setPriority(extracted.priority || 'Medium');
      setDeadline(extracted.deadline || '');
      setAssigneeId(extracted.suggestedAssigneeId || '');
    }
  }, [extracted, request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onConfirmTask({
        title,
        description,
        customer: customer.trim() || null,
        category,
        priority,
        deadline: deadline || null,
        assigneeId: assigneeId || null,
        isAiAssisted: !!extracted,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
      setIsSubmitting(false);
    }
  };

  const categories: TaskCategory[] = [
    'Billing', 'Customer Support', 'Sales', 'Operations', 'Technical', 'Administrative', 'HR', 'Other'
  ];

  const priorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight">AI Extraction Review & Verification</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {extracted?.confidenceLevel || 'High'} Confidence
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Review, edit, and confirm before formal task instantiation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Original Message Quote */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-400" />
              Original Source: <strong className="text-slate-700 uppercase">{request.source}</strong> ({request.id})
            </span>
            <span>{new Date(request.receivedTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed shadow-xs">
            {request.originalMessage}
          </div>
          {extracted?.priorityReasoning && (
            <div className="mt-2 text-[11px] text-indigo-700 bg-indigo-50/70 p-2 rounded border border-indigo-100 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>AI Reasoning:</strong> {extracted.priorityReasoning}</span>
            </div>
          )}
        </div>

        {/* Editable Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
              placeholder="Crisp actionable title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Scope & Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-normal focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
              placeholder="Operational details and instructions"
            />
          </div>

          {/* Customer & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer / Client
              </label>
              <input
                type="text"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-hidden"
                placeholder="e.g. ABC Corp, Delta Global (Optional)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-hidden cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-hidden cursor-pointer"
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-hidden cursor-pointer"
              />
            </div>
          </div>

          {/* Assignee Assignment */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Assign Work to Employee
              </label>
              {extracted?.suggestedAssigneeReason && (
                <span className="text-[11px] text-indigo-600 font-medium truncate max-w-[280px]">
                  Suggested: {extracted.suggestedAssigneeName}
                </span>
              )}
            </div>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-hidden cursor-pointer"
            >
              <option value="">Unassigned (Send to Inbox)</option>
              {availableEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.department || emp.role}
                </option>
              ))}
            </select>
            {extracted?.suggestedAssigneeReason && (
              <p className="text-[11px] text-slate-500 mt-1 italic">
                AI Suggestion note: {extracted.suggestedAssigneeReason}
              </p>
            )}
          </div>

          {/* Extracted Entities */}
          {extracted?.importantEntities && extracted.importantEntities.length > 0 && (
            <div>
              <span className="block text-[11px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Extracted Entities & Tokens
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extracted.importantEntities.map((ent, i) => (
                  <span key={i} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {ent}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-create-task-btn"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Instantiating Task...' : 'Confirm & Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
