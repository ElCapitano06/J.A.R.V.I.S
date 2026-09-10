import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Flame, 
  ShieldCheck,
  RotateCw,
  Tag
} from 'lucide-react';
import { EmployeeWorkload, User } from '../types';
import { api } from '../api';

interface EmployeesViewProps {
  workloads: EmployeeWorkload[];
  userRole: string;
  onRefresh: () => void;
  onFilterEmployeeTasks: (employeeId: string) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  workloads,
  userRole,
  onRefresh,
  onFilterEmployeeTasks,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [skills, setSkills] = useState('Operations, Workflow');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setIsSubmitting(true);
    try {
      await api.addEmployee({
        name: name.trim(),
        email: email.trim(),
        role: 'employee',
        department: department.trim(),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      setShowAddModal(false);
      setName('');
      setEmail('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Team Workload & Capacity</h2>
            <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded border border-slate-200">
              {workloads.length} Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor live task loads, overdue risk, and prevent employee burnout through intelligent work allocation.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {userRole === 'manager' && (
            <button
              id="add-team-member-btn"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>Add Team Member</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh workloads"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {workloads.map(({ employee, activeCount, overdueCount, highPriorityCount, completedCount, dueTodayCount, capacityScore }) => {
          const isOverloaded = capacityScore >= 100;
          const isNearCapacity = capacityScore >= 75 && capacityScore < 100;

          return (
            <div
              key={employee.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Employee Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={employee.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={employee.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{employee.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{employee.department || 'Operations'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                      employee.role === 'manager'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {employee.role}
                  </span>
                </div>

                {/* Skills tags */}
                {employee.skills && employee.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {employee.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Capacity Bar */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-600">Bandwidth Utilization</span>
                    <span className={`font-bold ${isOverloaded ? 'text-rose-600' : isNearCapacity ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {capacityScore}% {isOverloaded ? '(Overloaded)' : ''}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, capacityScore)}%` }}
                      className={`h-full rounded-full transition-all ${
                        isOverloaded
                          ? 'bg-rose-500'
                          : isNearCapacity
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Workload Stats Grid */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="text-base font-bold text-slate-900 block">{activeCount}</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase">Active</span>
                  </div>
                  <div className={`p-2 rounded-lg ${overdueCount > 0 ? 'bg-rose-50' : 'bg-slate-50'}`}>
                    <span className={`text-base font-bold block ${overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      {overdueCount}
                    </span>
                    <span className={`text-[10px] font-medium uppercase ${overdueCount > 0 ? 'text-rose-700' : 'text-slate-500'}`}>
                      Overdue
                    </span>
                  </div>
                  <div className={`p-2 rounded-lg ${highPriorityCount > 0 ? 'bg-amber-50' : 'bg-slate-50'}`}>
                    <span className={`text-base font-bold block ${highPriorityCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                      {highPriorityCount}
                    </span>
                    <span className={`text-[10px] font-medium uppercase ${highPriorityCount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                      High Pri
                    </span>
                  </div>
                </div>
              </div>

              {/* View Tasks Action */}
              <button
                onClick={() => onFilterEmployeeTasks(employee.id)}
                className="mt-4 w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
              >
                View {employee.name}'s Tasks
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleAddEmployee} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Kim"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@lalatech.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="Operations">Operations</option>
                  <option value="Billing & Accounting">Billing & Accounting</option>
                  <option value="Customer Support">Customer Support</option>
                  <option value="Engineering / IT">Engineering / IT</option>
                  <option value="Legal & Compliance">Legal & Compliance</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Core Skills (Comma separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Invoicing, Escalations, SQL"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
