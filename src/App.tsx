import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  OperationalRequest, 
  Task, 
  InAppNotification, 
  ActivityLog, 
  AutomationRule, 
  DashboardMetrics, 
  EmployeeWorkload 
} from './types';
import { api, getActiveUserId, setActiveUserId } from './api';

import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { RequestsInboxView } from './components/RequestsInboxView';
import { TasksView } from './components/TasksView';
import { MyWorkView } from './components/MyWorkView';
import { EmployeesView } from './components/EmployeesView';
import { AutomationsView } from './components/AutomationsView';
import { ActivityLogView } from './components/ActivityLogView';
import { BeforeAfterDemoView } from './components/BeforeAfterDemoView';

import { CaptureRequestModal } from './components/CaptureRequestModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ImpactModal } from './components/ImpactModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Data states
  const [requests, setRequests] = useState<OperationalRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [workloads, setWorkloads] = useState<EmployeeWorkload[]>([]);
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCaptureModalOpen, setIsCaptureModalOpen] = useState(false);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Dashboard filter state
  const [dashboardFilters, setDashboardFilters] = useState<{
    employeeId?: string;
    priority?: string;
    category?: string;
    status?: string;
  }>({});

  const loadAllData = useCallback(async () => {
    try {
      // 1. Me & Users
      const authData = await api.getMe();
      setCurrentUser(authData.user);
      setAllUsers(authData.allUsers);

      // 2. Core Collections in parallel
      const [
        requestsData,
        tasksData,
        notifsData,
        workloadsData,
        rulesData,
        logsData,
        metricsData
      ] = await Promise.all([
        api.getRequests(),
        api.getTasks({ all: true }),
        api.getNotifications(),
        api.getEmployees(),
        api.getAutomations(),
        api.getActivityLogs(),
        api.getDashboardMetrics(dashboardFilters),
      ]);

      setRequests(requestsData);
      setTasks(tasksData);
      setNotifications(notifsData);
      setWorkloads(workloadsData);
      setRules(rulesData);
      setActivityLogs(logsData);
      setMetrics(metricsData);
      setError(null);
    } catch (err: any) {
      console.error('Data load error:', err);
      setError(err.message || 'Failed to connect to Lala Ops server');
    } finally {
      setLoading(false);
    }
  }, [dashboardFilters]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleUserSwitched = async (newUser: User) => {
    setCurrentUser(newUser);
    setActiveUserId(newUser.id);
    // If switching to employee and currently on manager-only tab (employees or automations), switch to my_work or dashboard
    if (newUser.role === 'employee' && (activeTab === 'employees' || activeTab === 'automations')) {
      setActiveTab('my_work');
    }
    await loadAllData();
  };

  const handleCreateRequest = async (data: any) => {
    await api.createRequest(data);
    await loadAllData();
  };

  const handleFilterEmployeeTasks = (employeeId: string) => {
    setActiveTab('tasks');
  };

  if (loading && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center mx-auto shadow-md text-xl">
            L
          </div>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Starting Lala Ops Engine...</p>
        </div>
      </div>
    );
  }

  if (error && !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-md max-w-md w-full text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            ✕
          </div>
          <h2 className="text-base font-bold text-slate-900">Unable to connect</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={() => loadAllData()}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const pendingRequestsCount = requests.filter(r => r.conversionStatus === 'pending').length;
  const myWorkCount = tasks.filter(t => t.assigneeId === currentUser?.id && t.status !== 'Completed').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      {currentUser && (
        <Header
          currentUser={currentUser}
          allUsers={allUsers}
          notifications={notifications}
          onUserChanged={handleUserSwitched}
          onOpenCaptureModal={() => setIsCaptureModalOpen(true)}
          onOpenImpactModal={() => setIsImpactModalOpen(true)}
          onRefreshData={loadAllData}
          onSelectTask={(id) => setSelectedTaskId(id)}
        />
      )}

      {/* Role Context Bar */}
      {currentUser && (
        <div className="bg-slate-100/80 border-b border-slate-200 py-1 px-4 sm:px-8 text-[11px] flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">Current Role Mode:</span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded uppercase ${
                currentUser.role === 'manager'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {currentUser.role}
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="hidden sm:inline">
              {currentUser.role === 'manager'
                ? 'Full oversight: Triage, AI conversion review, team workload assignment & automations.'
                : 'Execution view: Assigned deliverables, roadblock logging, and completion.'}
            </span>
          </div>

          <span className="text-slate-400 font-mono text-[10px]">Lala Tech LLC</span>
        </div>
      )}

      {/* Navigation Tab Bar */}
      {currentUser && (
        <Navigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingRequestsCount={pendingRequestsCount}
          myWorkCount={myWorkCount}
          userRole={currentUser.role}
        />
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            employees={allUsers}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onFilterChange={(filters) => setDashboardFilters(filters)}
            onRefresh={loadAllData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsInboxView
            requests={requests}
            employees={allUsers}
            userRole={currentUser?.role || 'manager'}
            onRefresh={loadAllData}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onOpenCaptureModal={() => setIsCaptureModalOpen(true)}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            employees={allUsers}
            userRole={currentUser?.role || 'manager'}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'my_work' && currentUser && (
          <MyWorkView
            currentUser={currentUser}
            allTasks={tasks}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesView
            workloads={workloads}
            userRole={currentUser?.role || 'manager'}
            onRefresh={loadAllData}
            onFilterEmployeeTasks={handleFilterEmployeeTasks}
          />
        )}

        {activeTab === 'automations' && (
          <AutomationsView
            rules={rules}
            userRole={currentUser?.role || 'manager'}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'activity' && (
          <ActivityLogView
            logs={activityLogs}
            onRefresh={loadAllData}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {activeTab === 'demo' && (
          <BeforeAfterDemoView
            onNavigateTab={setActiveTab}
            onOpenCaptureModal={() => setIsCaptureModalOpen(true)}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onRefresh={loadAllData}
          />
        )}
      </main>

      {/* Capture Request Modal */}
      <CaptureRequestModal
        isOpen={isCaptureModalOpen}
        onClose={() => setIsCaptureModalOpen(false)}
        onSubmit={handleCreateRequest}
      />

      {/* Task Detail Modal */}
      {selectedTaskId && currentUser && (
        <TaskDetailModal
          taskId={selectedTaskId}
          currentUser={currentUser}
          allUsers={allUsers}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={loadAllData}
        />
      )}

      {/* Impact & ROI Modal */}
      <ImpactModal
        isOpen={isImpactModalOpen}
        onClose={() => setIsImpactModalOpen(false)}
      />
    </div>
  );
}
