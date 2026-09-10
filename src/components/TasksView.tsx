import React, { useState } from 'react';
import { 
  Kanban, 
  List as ListIcon, 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  User as UserIcon, 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Task, User, TaskStatus, TaskPriority, TaskCategory } from '../types';
import { api } from '../api';

interface TasksViewProps {
  tasks: Task[];
  employees: User[];
  userRole: string;
  onSelectTask: (taskId: string) => void;
  onRefresh: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  employees,
  userRole,
  onSelectTask,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [deadlineFilter, setDeadlineFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Create Task Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCustomer, setNewCustomer] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Operations');
  const [newPriority, setNewPriority] = useState<TaskPriority>('Medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const match = 
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.customer && t.customer.toLowerCase().includes(q)) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (priorityFilter && t.priority !== priorityFilter) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (assigneeFilter && t.assigneeId !== assigneeFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;

    if (deadlineFilter === 'overdue') {
      if (!t.deadline || t.deadline >= todayStr || t.status === 'Completed') return false;
    } else if (deadlineFilter === 'due_today') {
      if (t.deadline !== todayStr || t.status === 'Completed') return false;
    }

    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      await api.createTask({
        title: newTitle.trim(),
        description: newDesc.trim(),
        customer: newCustomer.trim() || undefined,
        category: newCategory,
        priority: newPriority,
        deadline: newDeadline || undefined,
        assigneeId: newAssignee || undefined,
      });
      setShowCreateModal(false);
      setNewTitle('');
      setNewDesc('');
      setNewCustomer('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const columns: { id: TaskStatus; label: string; bg: string; border: string }[] = [
    { id: 'Inbox', label: 'Inbox / Triage', bg: 'bg-slate-50', border: 'border-slate-200' },
    { id: 'Assigned', label: 'Assigned', bg: 'bg-blue-50/50', border: 'border-blue-200' },
    { id: 'In Progress', label: 'In Progress', bg: 'bg-indigo-50/50', border: 'border-indigo-200' },
    { id: 'Blocked', label: 'Blocked', bg: 'bg-rose-50/50', border: 'border-rose-200' },
    { id: 'Completed', label: 'Completed', bg: 'bg-emerald-50/50', border: 'border-emerald-200' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Operations Tasks</h2>
              <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
                {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured operational units with SLA tracking, ownership, and real-time execution states.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            {userRole === 'manager' && (
              <button
                id="create-task-btn"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 text-xs pt-3 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, client, ID..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-slate-900 outline-hidden"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All Categories</option>
            <option value="Billing">Billing</option>
            <option value="Technical">Technical</option>
            <option value="Customer Support">Customer Support</option>
            <option value="Operations">Operations</option>
            <option value="Sales">Sales</option>
            <option value="Administrative">Administrative</option>
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All Assignees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>

          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs focus:ring-1 focus:ring-slate-900 outline-hidden cursor-pointer"
          >
            <option value="">All SLA Deadlines</option>
            <option value="overdue">Overdue</option>
            <option value="due_today">Due Today</option>
          </select>
        </div>
      </div>

      {/* Main View: Kanban vs List */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className={`rounded-xl border ${col.border} ${col.bg} p-3 min-h-[500px] flex flex-col`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 shrink-0">
                  <h3 className="text-xs font-bold text-slate-900">{col.label}</h3>
                  <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 italic">
                      Empty stage
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const isOverdue = task.deadline && task.deadline < todayStr && task.status !== 'Completed';
                      return (
                        <div
                          key={task.id}
                          id={`task-card-${task.id}`}
                          onClick={() => onSelectTask(task.id)}
                          className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer space-y-2"
                        >
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="font-mono text-[10px] font-semibold text-slate-400">{task.id}</span>
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  task.priority === 'Critical'
                                    ? 'bg-rose-100 text-rose-700'
                                    : task.priority === 'High'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {task.priority}
                              </span>
                              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                                {task.category}
                              </span>
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                            {task.title}
                          </h4>

                          {/* Customer */}
                          {task.customer && (
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                              Client: <strong className="text-slate-700">{task.customer}</strong>
                            </p>
                          )}

                          {/* Blocker alert if blocked */}
                          {task.status === 'Blocked' && task.blockReason && (
                            <div className="p-1.5 rounded bg-rose-50 border border-rose-100 text-[10px] text-rose-700 font-medium flex items-start gap-1">
                              <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{task.blockReason}</span>
                            </div>
                          )}

                          {/* Footer Info */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 truncate font-medium max-w-[110px]">
                              <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{task.assigneeName || 'Unassigned'}</span>
                            </span>

                            {task.deadline && (
                              <span
                                className={`font-semibold shrink-0 ${
                                  isOverdue ? 'text-rose-600 font-bold' : 'text-slate-500'
                                }`}
                              >
                                {task.deadline.slice(5)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Task ID & Title</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Deadline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching operational tasks found
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => {
                    const isOverdue = t.deadline && t.deadline < todayStr && t.status !== 'Completed';
                    return (
                      <tr
                        key={t.id}
                        onClick={() => onSelectTask(t.id)}
                        className="hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-[10px] text-slate-400 block">{t.id}</span>
                          <span className="font-semibold text-slate-900">{t.title}</span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{t.customer || '—'}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                            {t.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              t.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-700'
                                : t.priority === 'High'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              t.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : t.status === 'Blocked'
                                ? 'bg-rose-100 text-rose-700'
                                : t.status === 'In Progress'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {t.assigneeName || <span className="text-slate-400">Unassigned</span>}
                        </td>
                        <td className="py-3 px-4">
                          {t.deadline ? (
                            <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                              {t.deadline}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Create Operational Task</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                  placeholder="Task title"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  placeholder="Task requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer</label>
                  <input
                    type="text"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Operations">Operations</option>
                    <option value="Billing">Billing</option>
                    <option value="Technical">Technical</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Sales">Sales</option>
                    <option value="Administrative">Administrative</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deadline SLA</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign to Employee</label>
                <select
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Unassigned (Inbox)</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department || e.role})</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer disabled:opacity-40"
                >
                  {isCreating ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
