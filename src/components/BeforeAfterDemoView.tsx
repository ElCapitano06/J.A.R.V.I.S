import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  MessageSquare, 
  FileSpreadsheet, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  BarChart3, 
  Layers, 
  ShieldAlert,
  Play,
  Check,
  RotateCcw
} from 'lucide-react';
import { api } from '../api';

interface BeforeAfterDemoViewProps {
  onNavigateTab: (tab: any) => void;
  onOpenCaptureModal: () => void;
  onSelectTask: (taskId: string) => void;
  onRefresh: () => void;
}

export const BeforeAfterDemoView: React.FC<BeforeAfterDemoViewProps> = ({
  onNavigateTab,
  onOpenCaptureModal,
  onSelectTask,
  onRefresh,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [isRunningDemo, setIsRunningDemo] = useState(false);
  const [demoProgressNote, setDemoProgressNote] = useState<string | null>(null);

  const steps = [
    {
      num: 1,
      title: 'Ingest Unstructured Work Request',
      description: 'Incoming messy WhatsApp message, email, or chat pasted verbatim into the centralized Inbox.',
      actionLabel: 'Go to Requests Inbox',
      action: () => onNavigateTab('requests'),
    },
    {
      num: 2,
      title: 'Gemini AI Understanding & Extraction',
      description: 'AI model extracts category, priority, client name, deadline, and suggests best-matched employee.',
      actionLabel: 'Open Requests to Extract',
      action: () => onNavigateTab('requests'),
    },
    {
      num: 3,
      title: 'Human-in-the-Loop Review',
      description: 'Manager reviews the editable AI proposal before creating a task. No hallucinated auto-commits.',
      actionLabel: 'Review AI Proposal',
      action: () => onNavigateTab('requests'),
    },
    {
      num: 4,
      title: 'Structured Task Instantiation',
      description: 'A formal operational task with ID, SLA deadline, and immutable creation audit log is born.',
      actionLabel: 'View Tasks Board',
      action: () => onNavigateTab('tasks'),
    },
    {
      num: 5,
      title: 'Capacity-Aware Assignment',
      description: 'Task routed to employee with matching skills and available bandwidth score.',
      actionLabel: 'Check Employees Workload',
      action: () => onNavigateTab('employees'),
    },
    {
      num: 6,
      title: 'Employee Execution in "My Work"',
      description: 'Employee logs in, sees task in personal queue, and starts work with 1-click status change.',
      actionLabel: 'Go to My Work',
      action: () => onNavigateTab('my_work'),
    },
    {
      num: 7,
      title: 'Roadblock & Blocker Alerting',
      description: 'If work is stalled, employee submits blocker reason. Automation immediately alerts manager.',
      actionLabel: 'Inspect Blocked Tasks',
      action: () => onNavigateTab('dashboard'),
    },
    {
      num: 8,
      title: 'Manager Real-Time Telemetry',
      description: 'Manager views bottlenecks, overdue risks, and active pipelines live on Operations Dashboard.',
      actionLabel: 'Open Dashboard',
      action: () => onNavigateTab('dashboard'),
    },
    {
      num: 9,
      title: 'Completion & Immutable Audit',
      description: 'Task marked completed. Final timestamps logged and recorded to the audit history ledger.',
      actionLabel: 'View Activity Log',
      action: () => onNavigateTab('activity'),
    },
    {
      num: 10,
      title: 'Operational Impact & ROI',
      description: 'Manual effort avoided and efficiency metrics update automatically.',
      actionLabel: 'View Impact Metrics',
      action: () => onNavigateTab('dashboard'),
    },
  ];

  const handleRunLiveWorkflow = async () => {
    setIsRunningDemo(true);
    setDemoProgressNote('Step 1: Capturing incoming WhatsApp request from ABC Corp...');
    try {
      // 1. Capture request
      const req = await api.createRequest({
        originalMessage: 'URGENT: ABC Corp payment of $12,500 for invoice #INV-9901 cleared. Need confirmation receipt and system unblock by 3 PM today.',
        source: 'whatsapp',
        customer: 'ABC Corp',
      });
      
      setDemoProgressNote('Step 2: Triggering Gemini AI extraction...');
      await new Promise(r => setTimeout(r, 600));
      const extractedReq = await api.extractRequest(req.id);

      setDemoProgressNote('Step 3 & 4: Converting extracted proposal into formal Task...');
      await new Promise(r => setTimeout(r, 600));
      const converted = await api.convertRequestToTask(req.id, {
        title: extractedReq.extractedInfo?.taskTitle || 'Confirm payment and unblock account for ABC Corp',
        description: extractedReq.extractedInfo?.taskDescription || req.originalMessage,
        customer: 'ABC Corp',
        category: 'Billing',
        priority: 'High',
        deadline: new Date().toISOString().split('T')[0],
        assigneeId: 'usr_priya', // Priya Patel in Billing
      });

      setDemoProgressNote('Step 5 & 6: Advancing task state to "In Progress"...');
      await new Promise(r => setTimeout(r, 600));
      await api.updateTask(converted.task.id, { status: 'In Progress' });

      setDemoProgressNote('Step 7 & 8: Simulating work completion...');
      await new Promise(r => setTimeout(r, 700));
      await api.updateTask(converted.task.id, { status: 'Completed' });

      setDemoProgressNote('Demo Complete! Task processed through all 10 stages in seconds.');
      onRefresh();
      setTimeout(() => {
        onSelectTask(converted.task.id);
      }, 800);
    } catch (err: any) {
      setDemoProgressNote(`Simulation error: ${err.message}`);
    } finally {
      setIsRunningDemo(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Hero Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Workflow Demonstration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Operational Transformation: Before vs. After Lala Ops
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Witness how Lala Ops eliminates chaotic WhatsApp group chats, forgotten emails, and brittle spreadsheets by transforming raw incoming requests into traceable, capacity-assigned operational deliverables.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleRunLiveWorkflow}
              disabled={isRunningDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 fill-current ${isRunningDemo ? 'animate-spin' : ''}`} />
              <span>{isRunningDemo ? 'Simulating Live Pipeline...' : 'Run 1-Click Live Workflow Simulation'}</span>
            </button>
          </div>

          {demoProgressNote && (
            <div className="p-3 rounded-lg bg-slate-800/90 border border-slate-700 text-xs text-emerald-300 font-mono flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{demoProgressNote}</span>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparison: Before vs After */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* The Old Way (Chaotic) */}
        <div className="bg-white rounded-2xl border border-rose-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-700 pb-3 border-b border-rose-100">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200">
              <XCircle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">The Old Way (Before Lala Ops)</h3>
              <p className="text-xs text-rose-600 font-medium">Scattered, Untracked, Reactive</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>Scattered Requests:</strong> Clients send urgent requests across 15+ WhatsApp groups, personal emails, and DMs with no single record.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>No Accountability:</strong> Messages sit unread; no clear owner assigned. Everyone assumes someone else is handling it.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>Forgotten Tasks:</strong> High-priority billing or technical fixes get pushed down chat threads and missed entirely.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>Manager Blindness:</strong> Operations managers have zero visibility into who is overloaded, who is blocked, or whether SLAs are breached.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <span><strong>Manual Spreadsheet Overhead:</strong> Hours wasted weekly manually copy-pasting notes into static spreadsheets that are instantly out of date.</span>
            </li>
          </ul>
        </div>

        {/* The Lala Ops Way (Systematic) */}
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-emerald-700 pb-3 border-b border-emerald-100">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">The Lala Ops Way (After)</h3>
              <p className="text-xs text-emerald-700 font-medium">Capture → Understand → Assign → Track → Complete</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Single Ingress Inbox:</strong> Every channel (WhatsApp, Email, Chat, Notes) flows into one centralized intake queue.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Intelligent AI Parsing:</strong> Gemini extracts urgency, client entity, category, and identifies the best-suited employee.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Human-in-the-Loop Review:</strong> Managers verify extracted details before tasks are officially created.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Workload & SLA Routing:</strong> Tasks are assigned based on actual capacity; deadlines are monitored automatically.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span><strong>Automations & Live Telemetry:</strong> Overdue alerts, blocker notifications, and immutable audit logs run without manual overhead.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 10-Step Interactive Workflow Roadmap */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">The 10-Step Lala Ops Operational Lifecycle</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any step to inspect how each phase functions within the platform:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {steps.map((s) => {
            const isCurrent = activeStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isCurrent
                    ? 'border-indigo-400 bg-indigo-50/40 ring-1 ring-indigo-400 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      isCurrent
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s.num}
                  </span>
                  <div className="space-y-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{s.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{s.description}</p>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    s.action();
                  }}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-semibold shrink-0 cursor-pointer"
                >
                  {s.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
