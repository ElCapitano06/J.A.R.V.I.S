import { 
  User, 
  OperationalRequest, 
  Task, 
  TaskComment, 
  InAppNotification, 
  ActivityLog, 
  AutomationRule, 
  DashboardMetrics, 
  ImpactMetrics, 
  EmployeeWorkload,
  TaskPriority,
  TaskStatus,
  TaskCategory 
} from './types';

let currentUserId: string = localStorage.getItem('lala_ops_user_id') || 'usr_alex';

export function getActiveUserId(): string {
  return currentUserId;
}

export function setActiveUserId(id: string): void {
  currentUserId = id;
  localStorage.setItem('lala_ops_user_id', id);
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-id', currentUserId);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const body = await response.json();
      if (body.error) errorMsg = body.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async getMe(): Promise<{ user: User; allUsers: User[]; organization: { id: string; name: string } }> {
    return request('/api/auth/me');
  },

  async login(email: string): Promise<{ user: User; organization: { id: string; name: string } }> {
    const res = await request<{ user: User; organization: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    setActiveUserId(res.user.id);
    return res;
  },

  async signup(data: { name: string; email: string; role: 'manager' | 'employee'; department?: string }): Promise<{ user: User; organization: any }> {
    const res = await request<{ user: User; organization: any }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setActiveUserId(res.user.id);
    return res;
  },

  // Employees
  async getEmployees(): Promise<EmployeeWorkload[]> {
    return request('/api/employees');
  },

  async addEmployee(data: { name: string; email: string; role: 'manager' | 'employee'; department?: string; skills?: string[] }): Promise<User> {
    return request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Requests
  async getRequests(): Promise<OperationalRequest[]> {
    return request('/api/requests');
  },

  async createRequest(data: { originalMessage: string; source: string; customer?: string | null }): Promise<OperationalRequest> {
    return request('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async extractRequest(id: string): Promise<OperationalRequest> {
    return request(`/api/requests/${id}/extract`, {
      method: 'POST',
    });
  },

  async convertRequestToTask(id: string, data: {
    title: string;
    description: string;
    customer?: string | null;
    category: TaskCategory;
    priority: TaskPriority;
    deadline?: string | null;
    assigneeId?: string | null;
    isAiAssisted?: boolean;
  }): Promise<{ task: Task; request: OperationalRequest }> {
    return request(`/api/requests/${id}/convert-to-task`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteRequest(id: string): Promise<{ success: boolean }> {
    return request(`/api/requests/${id}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  async getTasks(params: {
    myWork?: boolean;
    all?: boolean;
    status?: string;
    priority?: string;
    category?: string;
    assigneeId?: string;
    search?: string;
    deadlineState?: string;
  } = {}): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params.myWork) query.set('myWork', 'true');
    if (params.all) query.set('all', 'true');
    if (params.status) query.set('status', params.status);
    if (params.priority) query.set('priority', params.priority);
    if (params.category) query.set('category', params.category);
    if (params.assigneeId) query.set('assigneeId', params.assigneeId);
    if (params.search) query.set('search', params.search);
    if (params.deadlineState) query.set('deadlineState', params.deadlineState);

    const qs = query.toString();
    return request(`/api/tasks${qs ? `?${qs}` : ''}`);
  },

  async getTask(id: string): Promise<{ task: Task; comments: TaskComment[]; relatedRequest: OperationalRequest | null }> {
    return request(`/api/tasks/${id}`);
  },

  async createTask(data: {
    title: string;
    description?: string;
    customer?: string | null;
    category?: TaskCategory;
    priority?: TaskPriority;
    deadline?: string | null;
    assigneeId?: string | null;
  }): Promise<Task> {
    return request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return request(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Comments
  async getComments(taskId: string): Promise<TaskComment[]> {
    return request(`/api/tasks/${taskId}/comments`);
  },

  async addComment(taskId: string, data: { content: string; isInternalNote?: boolean }): Promise<TaskComment> {
    return request(`/api/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Notifications
  async getNotifications(): Promise<InAppNotification[]> {
    return request('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/api/notifications/${id}/read`, {
      method: 'POST',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/api/notifications/read-all', {
      method: 'POST',
    });
  },

  // Activity Logs
  async getActivityLogs(params: { taskId?: string; eventType?: string } = {}): Promise<ActivityLog[]> {
    const query = new URLSearchParams();
    if (params.taskId) query.set('taskId', params.taskId);
    if (params.eventType) query.set('eventType', params.eventType);
    const qs = query.toString();
    return request(`/api/activity-logs${qs ? `?${qs}` : ''}`);
  },

  // Automations
  async getAutomations(): Promise<AutomationRule[]> {
    return request('/api/automations');
  },

  async updateAutomation(id: string, updates: Partial<AutomationRule>): Promise<AutomationRule> {
    return request(`/api/automations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async runAutomationChecks(): Promise<{ success: boolean; checkedCount: number }> {
    return request('/api/automations/run-checks', {
      method: 'POST',
    });
  },

  // Metrics
  async getDashboardMetrics(filters: {
    employeeId?: string;
    priority?: string;
    category?: string;
    status?: string;
  } = {}): Promise<DashboardMetrics> {
    const query = new URLSearchParams();
    if (filters.employeeId) query.set('employeeId', filters.employeeId);
    if (filters.priority) query.set('priority', filters.priority);
    if (filters.category) query.set('category', filters.category);
    if (filters.status) query.set('status', filters.status);
    const qs = query.toString();
    return request(`/api/metrics/dashboard${qs ? `?${qs}` : ''}`);
  },

  async getImpactMetrics(): Promise<ImpactMetrics> {
    return request('/api/metrics/impact');
  },

  // Reset Seed
  async resetSeed(): Promise<{ success: boolean; message: string }> {
    return request('/api/seed/reset', {
      method: 'POST',
    });
  }
};
