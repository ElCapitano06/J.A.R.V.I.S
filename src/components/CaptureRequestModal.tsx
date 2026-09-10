import React, { useState } from 'react';
import { X, MessageSquare, Mail, MessageCircle, FileText, Sparkles, Send } from 'lucide-react';
import { RequestSource } from '../types';

interface CaptureRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { originalMessage: string; source: RequestSource; customer?: string }) => Promise<void>;
}

export const CaptureRequestModal: React.FC<CaptureRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [source, setSource] = useState<RequestSource>('whatsapp');
  const [originalMessage, setOriginalMessage] = useState('');
  const [customer, setCustomer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      label: 'WhatsApp: Urgent GST Invoice',
      source: 'whatsapp' as RequestSource,
      customer: 'ABC Corp',
      text: 'Urgent: ABC Corp needs revised GST invoice for order #9823 with updated GSTIN 27AAAPL1234C1ZV by today 4 PM. Tax audit tomorrow morning!',
    },
    {
      label: 'Email: Checkout 502 Error',
      source: 'email' as RequestSource,
      customer: 'RetailCo',
      text: 'Subject: CRITICAL - Payment gateway 502 Bad Gateway\nHi team, our checkout page has been throwing 502 errors since 10:15 AM. Over 40 customers failed to transact. Please resolve and deploy fix immediately.',
    },
    {
      label: 'Chat: Wire Verification',
      source: 'chat' as RequestSource,
      customer: 'Acme International',
      text: 'Wire transfer of $18,500 for Acme invoice #INV-8821 was submitted via Swift. Please confirm clearance and release the export license hold today.',
    },
    {
      label: 'Manual: SLA Addendum',
      source: 'manual' as RequestSource,
      customer: 'Zenith Tech',
      text: 'Draft custom SLA addendum for Zenith Tech Enterprise contract renewal by Friday. Must include 99.95% uptime clause and 1-hour P1 response guarantee.',
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setSource(preset.source);
    setCustomer(preset.customer);
    setOriginalMessage(preset.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalMessage.trim()) {
      setError('Message content cannot be empty');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        originalMessage: originalMessage.trim(),
        source,
        customer: customer.trim() || undefined,
      });
      setOriginalMessage('');
      setCustomer('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to capture request');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Capture Incoming Work Request</h3>
              <p className="text-xs text-slate-300">Centralize messy chats, emails, and client notes into Lala Ops</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Quick Operational Presets (1-Click Test)
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Capture Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Source Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Request Ingress Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setSource('whatsapp')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  source === 'whatsapp'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-1 ring-emerald-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => setSource('email')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  source === 'email'
                    ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => setSource('chat')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  source === 'chat'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-800 ring-1 ring-indigo-300'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Chat/Slack</span>
              </button>

              <button
                type="button"
                onClick={() => setSource('manual')}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  source === 'manual'
                    ? 'bg-slate-100 border-slate-400 text-slate-900 ring-1 ring-slate-400'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Manual Note</span>
              </button>
            </div>
          </div>

          {/* Customer / Client */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Customer / Client Name (Optional)
            </label>
            <input
              type="text"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. ABC Corp, RetailCo (or leave blank for AI to detect)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-slate-900 outline-hidden"
            />
          </div>

          {/* Message Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unstructured Message Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={originalMessage}
              onChange={(e) => setOriginalMessage(e.target.value)}
              placeholder="Paste raw WhatsApp chat, email body, or client notes verbatim here..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-slate-900 outline-hidden"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Preserved verbatim. AI will extract structured task fields while maintaining audit traceability.
            </p>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-captured-request-btn"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Capturing...' : 'Capture into Inbox'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
