import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Layers, 
  Inbox, 
  TrendingUp, 
  Filter, 
  User as UserIcon, 
  ArrowRight,
  Flame,
  Activity,
  RotateCw
} from 'lucide-react';
import { DashboardMetrics, Task, User, TaskPriority, TaskStatus, TaskCategory } from '../types';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  employees: User[];
  onSelectTask: (taskId: string) => void;
  onFilterChange: (filters: { employeeId?: string; priority?: string; category?: string; status?: string }) => void;
  onRefresh: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  employees,
  onSelectTask,
  onFilterChange,
  onRefresh,
  onNavigateTab,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleApplyFilter = (newEmployee = selectedEmployee, newPriority = selectedPriority, newCategory = selectedCategory, newStatus = selectedStatus) => {
    onFilterChange({
      employeeId: newEmployee || undefined,
      priority: newPriority || undefined,
      category: newCategory || undefined,
      status: newStatus || undefined,
    });
  };

  const handleClearFilters = () => {
    setSelectedEmployee('');
    setSelectedPriority('');
    setSelectedCategory('');
    setSelectedStatus('');
    onFilterChange({});
  };

  const hasActiveFilters = selectedEmployee || selectedPriority || selectedCategory || selectedStatus;

  if (!metrics) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto" />
        <p className="text-xs text-slate-500 mt-2">Calculating operational metrics...</p>
      </div>
    );
  }

  const statCards = [
    {
      id: 'metric-active-tasks',
      label: 'Active Tasks',
      value: metrics.totalActiveTasks,
      subtext: `${metrics.tasksInProgress} currently in progress`,
      icon: Layers,
      textColor: 'text-slate-900',
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'metric-due-today',
      label: 'Due Today',
      value: metrics.tasksDueToday,
      subtext: 'Requires resolution by EOD',
      icon: Clock,
      textColor: 'text-amber-600',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'metric-overdue',
      label: 'Overdue Tasks',
      value: metrics.overdueTasks,
      subtext: 'Past agreed SLA deadline',
      icon: AlertTriangle,
      textColor: 'text-rose-600',
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'metric-blocked',
      label: 'Blocked Tasks',
      value: metrics.blockedTasks,
      subtext: 'Awaiting unblocking action',
      icon: ShieldAlert,
      textColor: 'text-orange-600',
      iconBg: 'bg-orange-50 text-orange-600',
    },
    {
      id: 'metric-unassigned-reqs',
      label: 'Unassigned Requests',
      value: metrics.unassignedRequests,
      subtext: 'Pending review in Inbox',
      icon: Inbox,
      textColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
    {
      id: 'metric-completion-rate',
      label: 'Completion Rate',
      value: `${metrics.completionRate}%`,
      subtext: `${metrics.completedTasks} total tasks resolved`,
      icon: CheckCircle2,
      textColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls: Title & Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Operations Dashboard</h2>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded border border-slate-200">
                Live State
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time telemetry across Lala Tech operational lifecycles, bottlenecks, and SLAs.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-medium shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by:</span>
          </div>

          <select
            value={selectedEmployee}
            onChange={(e) => {
              setSelectedEmployee(e.target.value);
              handleApplyFilter(e.target.value, selectedPriority, selectedCategory, selectedStatus);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All Employees</option>
            {employees.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.department || u.role})</option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              handleApplyFilter(selectedEmployee, e.target.value, selectedCategory, selectedStatus);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              handleApplyFilter(selectedEmployee, selectedPriority, e.target.value, selectedStatus);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Billing">Billing</option>
            <option value="Technical">Technical</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Operations">Operations</option>
            <option value="Administrative">Administrative</option>
            <option value="Sales">Sales</option>
            <option value="HR">HR</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleApplyFilter(selectedEmployee, selectedPriority, selectedCategory, e.target.value);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Inbox">Inbox</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="Completed">Completed</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              id={card.id}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-2xl font-bold tracking-tight ${card.textColor}`}>
                  {card.value}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{card.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Row: Pipeline Progress & Resolution Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Pipeline Distribution */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Task Lifecycle Pipeline</h3>
              <p className="text-xs text-slate-500">Distribution across active workflow stages</p>
            </div>
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
              Avg Resolution: {metrics.averageResolutionHours}h
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div
              style={{ width: `${Math.max(5, (metrics.statusBreakdown.Inbox / (metrics.totalActiveTasks + metrics.completedTasks || 1)) * 100)}%` }}
              className="bg-slate-400 hover:opacity-90 transition-all"
              title={`Inbox: ${metrics.statusBreakdown.Inbox}`}
            />
            <div
              style={{ width: `${Math.max(5, (metrics.statusBreakdown.Assigned / (metrics.totalActiveTasks + metrics.completedTasks || 1)) * 100)}%` }}
              className="bg-blue-400 hover:opacity-90 transition-all"
              title={`Assigned: ${metrics.statusBreakdown.Assigned}`}
            />
            <div
              style={{ width: `${Math.max(5, (metrics.statusBreakdown['In Progress'] / (metrics.totalActiveTasks + metrics.completedTasks || 1)) * 100)}%` }}
              className="bg-indigo-500 hover:opacity-90 transition-all"
              title={`In Progress: ${metrics.statusBreakdown['In Progress']}`}
            />
            <div
              style={{ width: `${Math.max(5, (metrics.statusBreakdown.Blocked / (metrics.totalActiveTasks + metrics.completedTasks || 1)) * 100)}%` }}
              className="bg-rose-500 hover:opacity-90 transition-all"
              title={`Blocked: ${metrics.statusBreakdown.Blocked}`}
            />
            <div
              style={{ width: `${Math.max(5, (metrics.statusBreakdown.Completed / (metrics.totalActiveTasks + metrics.completedTasks || 1)) * 100)}%` }}
              className="bg-emerald-500 hover:opacity-90 transition-all"
              title={`Completed: ${metrics.statusBreakdown.Completed}`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
              <span className="text-slate-600">Inbox ({metrics.statusBreakdown.Inbox})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
              <span className="text-slate-600">Assigned ({metrics.statusBreakdown.Assigned})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              <span className="text-slate-600 font-medium">In Progress ({metrics.statusBreakdown['In Progress']})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span className="text-rose-700 font-medium">Blocked ({metrics.statusBreakdown.Blocked})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-emerald-700 font-medium">Done ({metrics.statusBreakdown.Completed})</span>
            </div>
          </div>
        </div>

        {/* Priority Matrix */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Priority Load</h3>
          <p className="text-xs text-slate-500 mb-4">Urgency levels across open workload</p>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-rose-50/60 border border-rose-100">
              <div className="flex items-center gap-2 font-semibold text-rose-800">
                <Flame className="w-3.5 h-3.5 text-rose-600" />
                <span>Critical Priority</span>
              </div>
              <span className="font-bold text-rose-800 px-2 py-0.5 rounded bg-rose-100 text-[11px]">
                {metrics.priorityBreakdown.Critical}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
              <div className="flex items-center gap-2 font-semibold text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>High Priority</span>
              </div>
              <span className="font-bold text-amber-800 px-2 py-0.5 rounded bg-amber-100 text-[11px]">
                {metrics.priorityBreakdown.High}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 border border-blue-100">
              <div className="flex items-center gap-2 font-medium text-blue-800">
                <span>Medium Priority</span>
              </div>
              <span className="font-bold text-blue-800 px-2 py-0.5 rounded bg-blue-100 text-[11px]">
                {metrics.priorityBreakdown.Medium}
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 font-medium text-slate-700">
                <span>Low Priority</span>
              </div>
              <span className="font-bold text-slate-700 px-2 py-0.5 rounded bg-slate-200 text-[11px]">
                {metrics.priorityBreakdown.Low}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Tasks & Bottlenecks Panel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Urgent & High-Risk Tasks</h3>
              <p className="text-xs text-slate-500">Tasks requiring immediate managerial intervention</p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {metrics.recentUrgentTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No urgent or blocked tasks at this moment. Operations running smoothly.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {metrics.recentUrgentTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTask(t.id)}
                className="p-4 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono text-[11px] font-semibold text-slate-500">{t.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : t.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.status === 'Blocked'
                          ? 'bg-red-100 text-red-700'
                          : t.status === 'In Progress'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {t.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 truncate">{t.title}</h4>
                  {t.customer && (
                    <p className="text-xs text-slate-500 mt-0.5">Customer: <span className="font-medium text-slate-700">{t.customer}</span></p>
                  )}
                  {t.blockReason && (
                    <p className="text-xs text-rose-600 mt-1 font-medium bg-rose-50 p-1.5 rounded border border-rose-100">
                      Blocker: {t.blockReason}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-1 text-xs">
                  <span className="text-slate-600 flex items-center gap-1 font-medium">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    {t.assigneeName || 'Unassigned'}
                  </span>
                  {t.deadline && (
                    <span
                      className={`text-[11px] font-medium ${
                        t.deadline < new Date().toISOString().split('T')[0]
                          ? 'text-rose-600 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      Due: {t.deadline}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
