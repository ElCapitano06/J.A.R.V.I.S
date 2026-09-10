import React, { useState } from 'react';
import { 
  Bell, 
  PlusCircle, 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  ShieldAlert,
  Layers,
  BarChart3,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { User, InAppNotification } from '../types';
import { api, setActiveUserId } from '../api';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  notifications: InAppNotification[];
  onUserChanged: (newUser: User) => void;
  onOpenCaptureModal: () => void;
  onOpenImpactModal: () => void;
  onRefreshData: () => void;
  onSelectTask: (taskId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  notifications,
  onUserChanged,
  onOpenCaptureModal,
  onOpenImpactModal,
  onRefreshData,
  onSelectTask,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSwitchUser = (user: User) => {
    setActiveUserId(user.id);
    onUserChanged(user);
    setShowUserMenu(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetSeed = async () => {
    if (!window.confirm('Reset all operational data back to the original Lala Tech LLC demo state?')) {
      return;
    }
    setIsResetting(true);
    try {
      await api.resetSeed();
      onRefreshData();
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Org */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm font-bold text-lg tracking-tight">
              L
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 tracking-tight text-base">Lala Ops</span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  AI Ops Platform
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Lala Tech LLC</p>
            </div>
          </div>

          {/* Center / Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="capture-request-header-btn"
              onClick={onOpenCaptureModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Capture Request</span>
            </button>

            <button
              id="impact-metrics-header-btn"
              onClick={onOpenImpactModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              title="View Automated Effort Saved & AI Impact"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Operational Impact</span>
            </button>

            <button
              id="reset-seed-header-btn"
              onClick={handleResetSeed}
              disabled={isResetting}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
              title="Reset to fresh demo seed data"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span>Reset Data</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                      <p className="text-xs text-slate-500">{unreadCount} unread alerts</p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-slate-400">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (n.relatedTaskId) onSelectTask(n.relatedTaskId);
                            api.markNotificationRead(n.id).then(onRefreshData);
                            setShowNotifMenu(false);
                          }}
                          className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-indigo-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            {n.event === 'task_blocked' ? (
                              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            ) : n.event === 'task_overdue' ? (
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            ) : n.event === 'task_completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">{n.title}</p>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Active User Switcher */}
            <div className="relative">
              <button
                id="user-profile-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                />
                <div className="hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        currentUser.role === 'manager'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {currentUser.role.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                    {currentUser.department || 'Operations'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Switcher Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Switch Role & Identity
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verify manager vs employee permissions in real time
                    </p>
                  </div>

                  <div className="py-1 max-h-64 overflow-y-auto">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSwitchUser(u)}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-slate-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate flex items-center gap-1.5">
                                {u.name}
                                {isSelected && <span className="text-indigo-600 text-[10px]">(Active)</span>}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">{u.department || u.email}</p>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              u.role === 'manager'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
