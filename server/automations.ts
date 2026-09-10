import { db } from './db.js';
import { Task, InAppNotification, ActivityLog } from '../src/types.js';

export interface AutomationEventPayload {
  eventType: 'task_created' | 'task_updated' | 'status_changed' | 'overdue_check';
  task: Task;
  previousTask?: Task;
  orgId: string;
}

export function evaluateAutomations(payload: AutomationEventPayload) {
  const { eventType, task, previousTask, orgId } = payload;
  const rules = db.getAutomationRules(orgId).filter(r => r.enabled);
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  for (const rule of rules) {
    let triggered = false;
    let description = '';

    // Rule 1: Task Overdue
    if (rule.trigger === 'task_overdue') {
      const isOverdue = task.deadline && task.deadline < todayStr && task.status !== 'Completed';
      if (isOverdue) {
        triggered = true;
        description = `Overdue task detected: "${task.title}" (Due: ${task.deadline})`;
        
        // Notify managers
        const notif: InAppNotification = {
          id: `NOTIF-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          organizationId: orgId,
          userId: 'all_managers',
          event: 'task_overdue',
          title: `Overdue Task Alert: ${task.title}`,
          message: `Task is past its deadline (${task.deadline}). Assigned to ${task.assigneeName || 'Unassigned'}.`,
          relatedTaskId: task.id,
          read: false,
          createdAt: now.toISOString(),
        };
        db.createNotification(notif);
      }
    }

    // Rule 2: Critical Priority Flag
    if (rule.trigger === 'priority_critical') {
      if (task.priority === 'Critical') {
        const wasCritical = previousTask && previousTask.priority === 'Critical';
        if (!wasCritical) {
          triggered = true;
          description = `Task marked Critical: "${task.title}" flagged for manager priority attention`;
          
          if (!task.isFlagged) {
            db.updateTask(task.id, { isFlagged: true });
          }

          const notif: InAppNotification = {
            id: `NOTIF-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            organizationId: orgId,
            userId: 'all_managers',
            event: 'automation_trigger',
            title: `Critical Task Flagged: ${task.title}`,
            message: `Priority is Critical. Immediate attention required. Customer: ${task.customer || 'N/A'}.`,
            relatedTaskId: task.id,
            read: false,
            createdAt: now.toISOString(),
          };
          db.createNotification(notif);
        }
      }
    }

    // Rule 3: Category Billing Auto-Assign
    if (rule.trigger === 'category_billing') {
      if (task.category === 'Billing' && (!task.assigneeId || rule.action === 'auto_assign')) {
        const billingUser = db.getUsers().find(u => u.organizationId === orgId && (u.department?.toLowerCase().includes('billing') || u.skills?.some(s => s.toLowerCase().includes('invoic'))));
        if (billingUser && task.assigneeId !== billingUser.id) {
          triggered = true;
          description = `Auto-assigned billing task to ${billingUser.name}`;
          
          db.updateTask(task.id, {
            assigneeId: billingUser.id,
            assigneeName: billingUser.name,
            status: task.status === 'Inbox' ? 'Assigned' : task.status,
          });

          const notif: InAppNotification = {
            id: `NOTIF-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            organizationId: orgId,
            userId: billingUser.id,
            event: 'task_assigned',
            title: `Auto-Assigned Billing Task: ${task.title}`,
            message: `Automated rule assigned this billing task to you.`,
            relatedTaskId: task.id,
            read: false,
            createdAt: now.toISOString(),
          };
          db.createNotification(notif);
        }
      }
    }

    // Rule 4: Task Completed
    if (rule.trigger === 'task_completed') {
      if (task.status === 'Completed') {
        const wasCompleted = previousTask && previousTask.status === 'Completed';
        if (!wasCompleted) {
          triggered = true;
          description = `Task completed: "${task.title}". Recorded completion timestamp and updated performance metrics.`;
          
          if (!task.completedAt) {
            db.updateTask(task.id, { completedAt: now.toISOString() });
          }

          const notif: InAppNotification = {
            id: `NOTIF-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            organizationId: orgId,
            userId: 'all_managers',
            event: 'task_completed',
            title: `Task Completed: ${task.title}`,
            message: `Completed by ${task.assigneeName || 'team'}. Operational metrics updated.`,
            relatedTaskId: task.id,
            read: false,
            createdAt: now.toISOString(),
          };
          db.createNotification(notif);
        }
      }
    }

    // Rule 5: Task Blocked
    if (rule.trigger === 'task_blocked') {
      if (task.status === 'Blocked') {
        const wasBlocked = previousTask && previousTask.status === 'Blocked';
        if (!wasBlocked) {
          triggered = true;
          description = `Task blocked: "${task.title}". Reason: ${task.blockReason || 'Unspecified blocker'}`;
          
          const notif: InAppNotification = {
            id: `NOTIF-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            organizationId: orgId,
            userId: 'all_managers',
            event: 'task_blocked',
            title: `Task Blocked Alert: ${task.title}`,
            message: `Blocked: ${task.blockReason || 'Requires manager intervention'}.`,
            relatedTaskId: task.id,
            read: false,
            createdAt: now.toISOString(),
          };
          db.createNotification(notif);
        }
      }
    }

    if (triggered) {
      db.recordAutomationFired(rule.id);
      
      const log: ActivityLog = {
        id: `ACT-AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        organizationId: orgId,
        actorId: 'system',
        actorName: 'Automation Engine',
        actorRole: 'system',
        eventType: 'automation_executed',
        relatedObjectId: task.id,
        relatedObjectType: 'task',
        summary: `Rule "${rule.title}" triggered: ${description}`,
        newValue: rule.title,
        timestamp: now.toISOString(),
      };
      db.addActivityLog(log);
    }
  }
}
