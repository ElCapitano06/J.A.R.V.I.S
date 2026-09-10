export type UserRole = 'manager' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
  department?: string;
  skills?: string[];
  active: boolean;
  createdAt: string;
}

export type RequestSource = 'manual' | 'whatsapp' | 'email' | 'chat';
export type AIProcessingStatus = 'pending' | 'processing' | 'extracted' | 'failed';
export type ConversionStatus = 'pending' | 'converted' | 'dismissed';

export type TaskCategory = 
  | 'Billing' 
  | 'Customer Support' 
  | 'Sales' 
  | 'Operations' 
  | 'Technical' 
  | 'Administrative' 
  | 'HR' 
  | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TaskStatus = 'Inbox' | 'Assigned' | 'In Progress' | 'Blocked' | 'Completed';

export type DeadlineState = 'not_due' | 'due_today' | 'due_soon' | 'overdue';

export interface ExtractedInfo {
  taskTitle: string;
  taskDescription: string;
  customer: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  priorityReasoning?: string;
  deadline: string | null; // ISO string YYYY-MM-DD
  suggestedAssigneeId?: string | null;
  suggestedAssigneeName?: string | null;
  suggestedAssigneeReason?: string;
  requiredAction: string;
  potentialDependencies: string | null;
  importantEntities: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
  extractedAt: string;
}

export interface OperationalRequest {
  id: string;
  organizationId: string;
  originalMessage: string;
  source: RequestSource;
  customer: string | null;
  submittedBy: string;
  receivedTimestamp: string;
  aiProcessingStatus: AIProcessingStatus;
  extractedInfo: ExtractedInfo | null;
  conversionStatus: ConversionStatus;
  relatedTaskId: string | null;
}

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  customer: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  blockReason?: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  creatorId: string;
  creatorName: string;
  deadline: string | null; // ISO string YYYY-MM-DD
  sourceRequestId: string | null;
  isFlagged?: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  aiAssisted: boolean;
}

export interface TaskComment {
  id: string;
  organizationId: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternalNote: boolean;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  organizationId: string;
  userId: string; // Specific user or 'all_managers'
  event: 
    | 'task_assigned' 
    | 'task_reassigned' 
    | 'deadline_approaching' 
    | 'task_overdue' 
    | 'task_blocked' 
    | 'task_completed' 
    | 'comment_added' 
    | 'automation_trigger';
  title: string;
  message: string;
  relatedTaskId?: string | null;
  read: boolean;
  createdAt: string;
}

export type ActivityEventType = 
  | 'request_created' 
  | 'ai_processed' 
  | 'task_created' 
  | 'task_assigned' 
  | 'task_reassigned' 
  | 'priority_changed' 
  | 'deadline_changed' 
  | 'status_changed' 
  | 'comment_added' 
  | 'task_completed' 
  | 'automation_executed';

export interface ActivityLog {
  id: string;
  organizationId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system';
  eventType: ActivityEventType;
  relatedObjectId: string;
  relatedObjectType: 'request' | 'task' | 'automation';
  summary: string;
  previousValue?: string | null;
  newValue?: string | null;
  timestamp: string;
}

export interface AutomationRule {
  id: string;
  organizationId: string;
  title: string;
  trigger: 
    | 'task_overdue' 
    | 'priority_critical' 
    | 'category_billing' 
    | 'category_technical' 
    | 'task_completed' 
    | 'task_blocked';
  conditionText: string;
  action: 'notify_manager' | 'auto_assign' | 'record_metric' | 'flag_task';
  actionTarget?: string;
  enabled: boolean;
  timesTriggered: number;
  lastTriggeredAt?: string | null;
}

export interface EmployeeWorkload {
  employee: User;
  activeCount: number;
  overdueCount: number;
  highPriorityCount: number;
  completedCount: number;
  dueTodayCount: number;
  inProgressCount: number;
  blockedCount: number;
  capacityScore: number; // 0 to 100% capacity utilization
}

export interface DashboardMetrics {
  totalActiveTasks: number;
  tasksDueToday: number;
  overdueTasks: number;
  tasksInProgress: number;
  blockedTasks: number;
  completedTasks: number;
  unassignedRequests: number;
  completionRate: number; // percentage e.g. 78%
  averageResolutionHours: number; // in hours e.g. 4.2 hrs
  statusBreakdown: Record<TaskStatus, number>;
  categoryBreakdown: Record<string, number>;
  priorityBreakdown: Record<TaskPriority, number>;
  recentUrgentTasks: Task[];
}

export interface ImpactMetrics {
  manualEffortAvoidedHours: number;
  aiRequestsProcessed: number;
  automationsFired: number;
  avgManualCreationMinutes: number;
  avgAiCreationMinutes: number;
  timeSavedMinutes: number;
  efficiencyGainPercentage: number;
}
