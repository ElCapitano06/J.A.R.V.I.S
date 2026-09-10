import React from 'react';
import { 
  LayoutDashboard, 
  Inbox, 
  CheckSquare, 
  Briefcase, 
  Users, 
  Zap, 
  History, 
  Sparkles 
} from 'lucide-react';
import { UserRole } from '../types';

export type NavTab = 
  | 'dashboard' 
  | 'requests' 
  | 'tasks' 
  | 'my_work' 
  | 'employees' 
  | 'automations' 
  | 'activity' 
  | 'demo';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingRequestsCount: number;
  myWorkCount: number;
  userRole: UserRole;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  pendingRequestsCount,
  myWorkCount,
  userRole,
}) => {
  const tabs = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      visibleTo: ['manager', 'employee'],
    },
    {
      id: 'requests' as NavTab,
      label: 'Requests Inbox',
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      visibleTo: ['manager', 'employee'],
    },
    {
      id: 'tasks' as NavTab,
      label: 'Tasks',
      icon: CheckSquare,
      badge: null,
      visibleTo: ['manager', 'employee'],
    },
    {
      id: 'my_work' as NavTab,
      label: 'My Work',
      icon: Briefcase,
      badge: myWorkCount > 0 ? myWorkCount : null,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      visibleTo: ['manager', 'employee'],
    },
    {
      id: 'employees' as NavTab,
      label: 'Employees',
      icon: Users,
      badge: null,
      visibleTo: ['manager'],
    },
    {
      id: 'automations' as NavTab,
      label: 'Automations',
      icon: Zap,
      badge: null,
      visibleTo: ['manager'],
    },
    {
      id: 'activity' as NavTab,
      label: 'Activity Log',
      icon: History,
      badge: null,
      visibleTo: ['manager', 'employee'],
    },
    {
      id: 'demo' as NavTab,
      label: 'Before / After Demo',
      icon: Sparkles,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      visibleTo: ['manager', 'employee'],
    },
  ];

  const visibleTabs = tabs.filter(t => t.visibleTo.includes(userRole));

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none" aria-label="Tabs">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span
                    className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                      isActive
                        ? 'bg-slate-800 text-slate-200 border-slate-700'
                        : tab.badgeColor || 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
