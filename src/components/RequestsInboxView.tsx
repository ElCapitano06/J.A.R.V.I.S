import React, { useState } from 'react';
import { 
  Inbox, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  MessageSquare, 
  Mail, 
  MessageCircle, 
  FileText, 
  ArrowRight, 
  Tag, 
  AlertCircle,
  RotateCw,
  Plus
} from 'lucide-react';
import { OperationalRequest, User } from '../types';
import { api } from '../api';
import { AiExtractionModal } from './AiExtractionModal';

interface RequestsInboxViewProps {
  requests: OperationalRequest[];
  employees: User[];
  userRole: string;
  onRefresh: () => void;
  onSelectTask: (taskId: string) => void;
  onOpenCaptureModal: () => void;
}

export const RequestsInboxView: React.FC<RequestsInboxViewProps> = ({
  requests,
  employees,
  userRole,
  onRefresh,
  onSelectTask,
  onOpenCaptureModal,
}) => {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [extractingId, setExtractingId] = useState<string | null>(null);
  const [reviewingRequest, setReviewingRequest] = useState<OperationalRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter requests
  const filtered = requests.filter((r) => {
    if (sourceFilter !== 'all' && r.source !== sourceFilter) return false;
    if (statusFilter === 'pending' && r.conversionStatus !== 'pending') return false;
    if (statusFilter === 'converted' && r.conversionStatus !== 'converted') return false;
    return true;
  });

  const handleExtract = async (reqId: string) => {
    setExtractingId(reqId);
    setError(null);
    try {
      const updated = await api.extractRequest(reqId);
      onRefresh();
      // Immediately open the review modal so user can inspect
      setReviewingRequest(updated);
    } catch (err: any) {
      setError(err.message || 'AI extraction failed');
    } finally {
      setExtractingId(null);
    }
  };

  const handleDelete = async (reqId: string) => {
    if (!window.confirm('Are you sure you want to dismiss this request?')) return;
    try {
      await api.deleteRequest(reqId);
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to delete request');
    }
  };

  const handleConfirmTask = async (data: any) => {
    if (!reviewingRequest) return;
    await api.convertRequestToTask(reviewingRequest.id, data);
    setReviewingRequest(null);
    onRefresh();
  };

  const getSourceIcon = (src: string) => {
    switch (src) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'chat':
        return <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Requests Inbox</h2>
              <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
                {requests.filter(r => r.conversionStatus === 'pending').length} Pending Action
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingest messy WhatsApp chats, emails, and notes. Convert them to structured tasks via Gemini AI extraction.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onOpenCaptureModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture New Request</span>
            </button>
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh requests"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Channels & Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-slate-500 font-medium mr-1">Source:</span>
            {['all', 'whatsapp', 'email', 'chat', 'manual'].map((s) => (
              <button
                key={s}
                onClick={() => setSourceFilter(s)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                  sourceFilter === s
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium mr-1">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending Review' },
              { id: 'converted', label: 'Converted' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center shadow-xs">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-900">No requests in this view</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Capture an incoming request from WhatsApp, email, or client chat to start the Lala Ops workflow.
            </p>
            <button
              onClick={onOpenCaptureModal}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Capture First Request</span>
            </button>
          </div>
        ) : (
          filtered.map((req) => {
            const isExtracting = extractingId === req.id;
            const isConverted = req.conversionStatus === 'converted';
            const hasExtraction = req.extractedInfo !== null;

            return (
              <div
                key={req.id}
                id={`request-item-${req.id}`}
                className={`bg-white rounded-xl border transition-all shadow-xs ${
                  isConverted
                    ? 'border-slate-200 opacity-80'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Request Header */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">{req.id}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase border border-slate-200">
                      {getSourceIcon(req.source)}
                      <span>{req.source}</span>
                    </span>
                    {req.customer && (
                      <span className="text-xs font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        Customer: <strong>{req.customer}</strong>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(req.receivedTimestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isConverted ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Converted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Pending Task
                      </span>
                    )}
                  </div>
                </div>

                {/* Verbatim Message Body */}
                <div className="p-4 sm:p-5">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Original Message (Verbatim)
                  </span>
                  <div className="p-3 rounded-lg bg-slate-50 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-200">
                    {req.originalMessage}
                  </div>

                  {/* AI Extracted Preview Card (if already extracted) */}
                  {hasExtraction && (
                    <div className="mt-4 p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          <span>Gemini AI Extracted Metadata</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                          Confidence: {req.extractedInfo?.confidenceLevel || 'High'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Extracted Title:</span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {req.extractedInfo?.taskTitle}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Category:</span>
                          <span className="font-semibold text-slate-800">{req.extractedInfo?.category}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Detected Priority:</span>
                          <span className={`font-bold ${
                            req.extractedInfo?.priority === 'Critical' ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {req.extractedInfo?.priority}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Suggested Assignee:</span>
                          <span className="font-semibold text-slate-800">
                            {req.extractedInfo?.suggestedAssigneeName || 'Auto match'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions Row */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-slate-500">
                      Submitted by: <strong className="text-slate-700">{req.submittedBy}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConverted && req.relatedTaskId ? (
                        <button
                          onClick={() => onSelectTask(req.relatedTaskId!)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer border border-emerald-200"
                        >
                          <span>Open Task {req.relatedTaskId}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <>
                          {userRole === 'manager' && (
                            <button
                              onClick={() => handleDelete(req.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Dismiss request"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Trigger Gemini AI Extraction */}
                          <button
                            id={`extract-ai-btn-${req.id}`}
                            onClick={() => handleExtract(req.id)}
                            disabled={isExtracting}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer border border-indigo-200 disabled:opacity-50"
                          >
                            <Sparkles className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin' : 'text-indigo-600'}`} />
                            <span>{isExtracting ? 'Extracting via Gemini...' : hasExtraction ? 'Re-extract with AI' : 'Extract with AI'}</span>
                          </button>

                          {/* Review & Convert button */}
                          <button
                            id={`review-convert-btn-${req.id}`}
                            onClick={() => setReviewingRequest(req)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                          >
                            <span>Review & Convert to Task</span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* AI Extraction Modal */}
      {reviewingRequest && (
        <AiExtractionModal
          request={reviewingRequest}
          availableEmployees={employees}
          onClose={() => setReviewingRequest(null)}
          onConfirmTask={handleConfirmTask}
        />
      )}
    </div>
  );
};
