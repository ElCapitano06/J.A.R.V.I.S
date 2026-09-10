import fs from 'fs';
import path from 'path';
import { 
  User, 
  OperationalRequest, 
  Task, 
  TaskComment, 
  InAppNotification, 
  ActivityLog, 
  AutomationRule 
} from '../src/types.js';

interface DatabaseSchema {
  organization: {
    id: string;
    name: string;
    createdAt: string;
  };
  users: User[];
  requests: OperationalRequest[];
  tasks: Task[];
  comments: TaskComment[];
  notifications: InAppNotification[];
  activityLogs: ActivityLog[];
  automationRules: AutomationRule[];
  stats: {
    manualTasksCreated: number;
    aiAssistedTasksCreated: number;
    automationsTriggered: number;
  };
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getInitialSeedData(): DatabaseSchema {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];

  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const inThreeDays = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const inThreeDaysStr = inThreeDays.toISOString().split('T')[0];

  const orgId = 'org_lalatech';

  const users: User[] = [
    {
      id: 'usr_alex',
      name: 'Alex Rivera',
      email: 'alex.rivera@lalatech.io',
      role: 'manager',
      organizationId: orgId,
      department: 'Operations & Strategy',
      skills: ['Operations', 'Team Leadership', 'Resource Allocation', 'Process Optimization'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      active: true,
      createdAt: twoDaysAgoStr,
    },
    {
      id: 'usr_rahul',
      name: 'Rahul Sharma',
      email: 'rahul.s@lalatech.io',
      role: 'employee',
      organizationId: orgId,
      department: 'Billing & Finance',
      skills: ['Invoicing', 'Tax/GST Compliance', 'Discrepancy Resolution', 'Vendor Accounts'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      active: true,
      createdAt: twoDaysAgoStr,
    },
    {
      id: 'usr_priya',
      name: 'Priya Patel',
      email: 'priya.p@lalatech.io',
      role: 'employee',
      organizationId: orgId,
      department: 'Customer Support & Success',
      skills: ['Client Relations', 'Complaint Escalation', 'Account Inquiries', 'SLA Management'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      active: true,
      createdAt: twoDaysAgoStr,
    },
    {
      id: 'usr_marcus',
      name: 'Marcus Chen',
      email: 'marcus.c@lalatech.io',
      role: 'employee',
      organizationId: orgId,
      department: 'Technical Operations',
      skills: ['Bug Triage', 'API Integrations', 'System Reliability', 'Database Fixes'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      active: true,
      createdAt: twoDaysAgoStr,
    },
    {
      id: 'usr_sarah',
      name: 'Sarah Jenkins',
      email: 'sarah.j@lalatech.io',
      role: 'employee',
      organizationId: orgId,
      department: 'Admin & Contracts',
      skills: ['Legal Amendments', 'Vendor Agreements', 'Client Paperwork', 'Compliance Check'],
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      active: true,
      createdAt: twoDaysAgoStr,
    },
  ];

  const requests: OperationalRequest[] = [
    {
      id: 'REQ-101',
      organizationId: orgId,
      originalMessage: "ABC Corp says their invoice #INV-2026-89 has the wrong GST number (listed as 27AAAAA0000A1Z5 instead of 27BBBBB1111B2Z6). Please correct the tax invoice and resend it before tomorrow noon so accounts can release payment.",
      source: 'whatsapp',
      customer: 'ABC Corp',
      submittedBy: 'WhatsApp Client Connect',
      receivedTimestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      aiProcessingStatus: 'extracted',
      extractedInfo: {
        taskTitle: 'Correct GST number on Invoice #INV-2026-89 for ABC Corp',
        taskDescription: 'Invoice #INV-2026-89 has an incorrect GST number (27AAAAA0000A1Z5). Must update to 27BBBBB1111B2Z6 and re-issue the revised tax invoice before tomorrow noon to unblock client payment.',
        customer: 'ABC Corp',
        category: 'Billing',
        priority: 'High',
        priorityReasoning: 'Directly impacts payment release and has an explicit tight deadline for tomorrow noon.',
        deadline: tomorrowStr,
        suggestedAssigneeId: 'usr_rahul',
        suggestedAssigneeName: 'Rahul Sharma',
        suggestedAssigneeReason: 'Rahul heads Billing & Tax compliance and specializes in invoice reconciliations.',
        requiredAction: 'Amend GST tax details on ERP, regenerate PDF invoice #INV-2026-89, and email directly to ABC Corp accounts team.',
        potentialDependencies: 'Finance ERP access, signed invoice authorization',
        importantEntities: ['ABC Corp', 'INV-2026-89', '27BBBBB1111B2Z6', 'Payment release'],
        confidenceLevel: 'High',
        extractedAt: new Date(now.getTime() - 110 * 60 * 1000).toISOString(),
      },
      conversionStatus: 'converted',
      relatedTaskId: 'TSK-1001',
    },
    {
      id: 'REQ-102',
      organizationId: orgId,
      originalMessage: "Hey Alex, forwarded email from Delta Global: 'Our team is unable to submit orders through the client portal since this morning. Getting a 502 Bad Gateway error when clicking checkout. This is blocking our end of month order cycle!' Can someone investigate urgently?",
      source: 'email',
      customer: 'Delta Global',
      submittedBy: 'Support Dispatch Email',
      receivedTimestamp: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
      aiProcessingStatus: 'extracted',
      extractedInfo: {
        taskTitle: 'Investigate 502 Gateway Error on Client Checkout for Delta Global',
        taskDescription: 'Delta Global users encounter 502 Bad Gateway error during checkout submission in client portal, blocking critical end-of-month order cycle.',
        customer: 'Delta Global',
        category: 'Technical',
        priority: 'Critical',
        priorityReasoning: 'Client portal checkout is completely down, directly impacting revenue and core business operations with escalation language.',
        deadline: todayStr,
        suggestedAssigneeId: 'usr_marcus',
        suggestedAssigneeName: 'Marcus Chen',
        suggestedAssigneeReason: 'Marcus is Technical Operations lead experienced in API gateway debugging and server errors.',
        requiredAction: 'Check gateway logs, restart stuck checkout microservice, test end-to-end cart checkout flow, and notify Delta Global.',
        potentialDependencies: 'Cloud production logging and cluster access',
        importantEntities: ['Delta Global', '502 Bad Gateway', 'Client Portal Checkout', 'End of month cycle'],
        confidenceLevel: 'High',
        extractedAt: new Date(now.getTime() - 230 * 60 * 1000).toISOString(),
      },
      conversionStatus: 'converted',
      relatedTaskId: 'TSK-1002',
    },
    {
      id: 'REQ-103',
      organizationId: orgId,
      originalMessage: "Message from Zenith Logistics: They want to renew the enterprise SLA agreement but requested an updated clause regarding 99.95% uptime guarantees and 1-hour response times before their legal committee meets on Thursday.",
      source: 'chat',
      customer: 'Zenith Logistics',
      submittedBy: 'Account Rep Chat',
      receivedTimestamp: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      aiProcessingStatus: 'extracted',
      extractedInfo: {
        taskTitle: 'Update enterprise SLA clause for Zenith Logistics contract',
        taskDescription: 'Add revised SLA clauses regarding 99.95% uptime guarantees and 1-hour response times for Zenith Logistics enterprise contract renewal before Thursday legal committee meeting.',
        customer: 'Zenith Logistics',
        category: 'Administrative',
        priority: 'Medium',
        priorityReasoning: 'Important enterprise contract renewal with scheduled legal meeting on Thursday.',
        deadline: inThreeDaysStr,
        suggestedAssigneeId: 'usr_sarah',
        suggestedAssigneeName: 'Sarah Jenkins',
        suggestedAssigneeReason: 'Sarah manages vendor agreements, contracts, and compliance paperwork.',
        requiredAction: 'Review legal terms with Operations, draft addendum clause, and provide redlined PDF to Zenith Logistics.',
        potentialDependencies: 'Executive approval on 99.95% uptime liability',
        importantEntities: ['Zenith Logistics', 'SLA 99.95%', '1-hour response SLA', 'Legal committee'],
        confidenceLevel: 'High',
        extractedAt: new Date(now.getTime() - 350 * 60 * 1000).toISOString(),
      },
      conversionStatus: 'pending',
      relatedTaskId: null,
    },
    {
      id: 'REQ-104',
      organizationId: orgId,
      originalMessage: "WhatsApp message from Apex Retail: We paid our annual maintenance invoice yesterday via wire transfer (ref #TXN-998124). Please verify credit on your end and send official receipt and tax clearance certificate.",
      source: 'whatsapp',
      customer: 'Apex Retail',
      submittedBy: 'WhatsApp Direct',
      receivedTimestamp: new Date(now.getTime() - 1 * 3600 * 1000).toISOString(),
      aiProcessingStatus: 'extracted',
      extractedInfo: {
        taskTitle: 'Verify wire payment #TXN-998124 and issue tax clearance for Apex Retail',
        taskDescription: 'Client wired annual maintenance fee with transaction ref #TXN-998124. Reconcile bank statement, generate payment receipt, and issue tax clearance certificate.',
        customer: 'Apex Retail',
        category: 'Billing',
        priority: 'Medium',
        priorityReasoning: 'Standard payment reconciliation and document fulfillment.',
        deadline: tomorrowStr,
        suggestedAssigneeId: 'usr_rahul',
        suggestedAssigneeName: 'Rahul Sharma',
        suggestedAssigneeReason: 'Rahul is assigned to Billing and accounts reconciliations.',
        requiredAction: 'Check bank statement for #TXN-998124 credit, issue official receipt in billing system, email tax certificate.',
        potentialDependencies: 'Bank portal statement access',
        importantEntities: ['Apex Retail', 'TXN-998124', 'Annual Maintenance', 'Tax Clearance'],
        confidenceLevel: 'High',
        extractedAt: new Date(now.getTime() - 50 * 60 * 1000).toISOString(),
      },
      conversionStatus: 'pending',
      relatedTaskId: null,
    },
    {
      id: 'REQ-105',
      organizationId: orgId,
      originalMessage: "Email snippet from HR: New operations associate onboarding starts on Monday. We need IT setup, email provisioning, Google Workspace account, and Lala Ops manager role permissions prepared by Friday 5 PM.",
      source: 'email',
      customer: 'Internal HR',
      submittedBy: 'HR Operations',
      receivedTimestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      aiProcessingStatus: 'pending',
      extractedInfo: null,
      conversionStatus: 'pending',
      relatedTaskId: null,
    }
  ];

  const tasks: Task[] = [
    {
      id: 'TSK-1001',
      organizationId: orgId,
      title: 'Correct GST number on Invoice #INV-2026-89 for ABC Corp',
      description: 'Invoice #INV-2026-89 has an incorrect GST number (27AAAAA0000A1Z5). Must update to 27BBBBB1111B2Z6 and re-issue the revised tax invoice before tomorrow noon to unblock client payment.',
      customer: 'ABC Corp',
      category: 'Billing',
      priority: 'High',
      status: 'In Progress',
      blockReason: null,
      assigneeId: 'usr_rahul',
      assigneeName: 'Rahul Sharma',
      creatorId: 'usr_alex',
      creatorName: 'Alex Rivera',
      deadline: tomorrowStr,
      sourceRequestId: 'REQ-101',
      isFlagged: false,
      createdAt: new Date(now.getTime() - 105 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
      completedAt: null,
      aiAssisted: true,
    },
    {
      id: 'TSK-1002',
      organizationId: orgId,
      title: 'Investigate 502 Gateway Error on Client Checkout for Delta Global',
      description: 'Delta Global users encounter 502 Bad Gateway error during checkout submission in client portal, blocking critical end-of-month order cycle.',
      customer: 'Delta Global',
      category: 'Technical',
      priority: 'Critical',
      status: 'Blocked',
      blockReason: 'Awaiting deployment credentials and root AWS cluster access from infrastructure lead to restart checkout service.',
      assigneeId: 'usr_marcus',
      assigneeName: 'Marcus Chen',
      creatorId: 'usr_alex',
      creatorName: 'Alex Rivera',
      deadline: todayStr,
      sourceRequestId: 'REQ-102',
      isFlagged: true,
      createdAt: new Date(now.getTime() - 220 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      completedAt: null,
      aiAssisted: true,
    },
    {
      id: 'TSK-1003',
      organizationId: orgId,
      title: 'Q3 Enterprise Client Satisfaction Survey & Follow-up calls',
      description: 'Conduct structured check-in calls with top 10 key enterprise accounts regarding support SLAs and upcoming platform features.',
      customer: 'Enterprise Clients',
      category: 'Customer Support',
      priority: 'Medium',
      status: 'Assigned',
      blockReason: null,
      assigneeId: 'usr_priya',
      assigneeName: 'Priya Patel',
      creatorId: 'usr_alex',
      creatorName: 'Alex Rivera',
      deadline: todayStr,
      sourceRequestId: null,
      isFlagged: false,
      createdAt: yesterdayStr,
      updatedAt: yesterdayStr,
      completedAt: null,
      aiAssisted: false,
    },
    {
      id: 'TSK-1004',
      organizationId: orgId,
      title: 'Resolve disputed discount code applied to Helios Inc contract',
      description: 'Helios applied promo code #SUMMER25 which expired prior to agreement execution. Reconcile terms and draft customer clarification memo.',
      customer: 'Helios Inc',
      category: 'Billing',
      priority: 'High',
      status: 'In Progress',
      blockReason: null,
      assigneeId: 'usr_rahul',
      assigneeName: 'Rahul Sharma',
      creatorId: 'usr_alex',
      creatorName: 'Alex Rivera',
      deadline: yesterdayStr, // OVERDUE for demonstration!
      sourceRequestId: null,
      isFlagged: true,
      createdAt: twoDaysAgoStr,
      updatedAt: yesterdayStr,
      completedAt: null,
      aiAssisted: false,
    },
    {
      id: 'TSK-1005',
      organizationId: orgId,
      title: 'Audit vendor NDAs and data processing agreements for 2026',
      description: 'Review compliance checklist across all active vendor agreements and ensure signed DPA addendums are archived in secure drive.',
      customer: 'Internal Compliance',
      category: 'Administrative',
      priority: 'Low',
      status: 'Completed',
      blockReason: null,
      assigneeId: 'usr_sarah',
      assigneeName: 'Sarah Jenkins',
      creatorId: 'usr_alex',
      creatorName: 'Alex Rivera',
      deadline: yesterdayStr,
      sourceRequestId: null,
      isFlagged: false,
      createdAt: twoDaysAgoStr,
      updatedAt: yesterdayStr,
      completedAt: new Date(now.getTime() - 14 * 3600 * 1000).toISOString(),
      aiAssisted: false,
    },
    {
      id: 'TSK-1006',
      organizationId: orgId,
      title: 'Onboard Beta testers for Lala Ops mobile progressive client',
      description: 'Send test flight invites and guide first cohort of 5 users through task capture and status transitions.',
      customer: 'Beta Cohort',
      category: 'Operations',
      priority: 'Medium',
      status: 'Completed',
      blockReason: null,
      assigneeId: 'usr_priya',
      assigneeName: 'Priya Patel',
      creatorId: 'usr_alex',
      creatorName: 'Alex Rivera',
      deadline: twoDaysAgoStr,
      sourceRequestId: null,
      isFlagged: false,
      createdAt: twoDaysAgoStr,
      updatedAt: yesterdayStr,
      completedAt: new Date(now.getTime() - 20 * 3600 * 1000).toISOString(),
      aiAssisted: true,
    }
  ];

  const comments: TaskComment[] = [
    {
      id: 'CMT-1',
      organizationId: orgId,
      taskId: 'TSK-1001',
      authorId: 'usr_alex',
      authorName: 'Alex Rivera',
      authorRole: 'manager',
      content: 'Rahul, make sure you double-check their state code in the GST portal before issuing.',
      isInternalNote: false,
      createdAt: new Date(now.getTime() - 95 * 60 * 1000).toISOString(),
    },
    {
      id: 'CMT-2',
      organizationId: orgId,
      taskId: 'TSK-1001',
      authorId: 'usr_rahul',
      authorName: 'Rahul Sharma',
      authorRole: 'employee',
      content: 'Understood. I pulled the master certificate and verified 27BBBBB1111B2Z6. Regenerating invoice in ERP now.',
      isInternalNote: false,
      createdAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
    },
    {
      id: 'CMT-3',
      organizationId: orgId,
      taskId: 'TSK-1002',
      authorId: 'usr_marcus',
      authorName: 'Marcus Chen',
      authorRole: 'employee',
      content: 'I traced the 502 error to a timeout in the inventory lock worker. I need elevated IAM keys to apply the worker hotfix.',
      isInternalNote: false,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    }
  ];

  const notifications: InAppNotification[] = [
    {
      id: 'NOTIF-1',
      organizationId: orgId,
      userId: 'usr_rahul',
      event: 'task_assigned',
      title: 'New Task Assigned: GST Invoice Correction',
      message: 'Alex Rivera assigned you task TSK-1001 for ABC Corp.',
      relatedTaskId: 'TSK-1001',
      read: false,
      createdAt: new Date(now.getTime() - 100 * 60 * 1000).toISOString(),
    },
    {
      id: 'NOTIF-2',
      organizationId: orgId,
      userId: 'usr_alex',
      event: 'task_blocked',
      title: 'Task Blocked: Delta Global Checkout Bug',
      message: 'Marcus Chen marked TSK-1002 as Blocked: Awaiting deployment credentials.',
      relatedTaskId: 'TSK-1002',
      read: false,
      createdAt: new Date(now.getTime() - 28 * 60 * 1000).toISOString(),
    },
    {
      id: 'NOTIF-3',
      organizationId: orgId,
      userId: 'usr_alex',
      event: 'task_overdue',
      title: 'Task Overdue Alert: Helios Inc Discount Dispute',
      message: 'TSK-1004 assigned to Rahul Sharma has passed its deadline.',
      relatedTaskId: 'TSK-1004',
      read: false,
      createdAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
    }
  ];

  const activityLogs: ActivityLog[] = [
    {
      id: 'ACT-1',
      organizationId: orgId,
      actorId: 'usr_alex',
      actorName: 'Alex Rivera',
      actorRole: 'manager',
      eventType: 'request_created',
      relatedObjectId: 'REQ-101',
      relatedObjectType: 'request',
      summary: 'Captured incoming WhatsApp request from ABC Corp',
      timestamp: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
    },
    {
      id: 'ACT-2',
      organizationId: orgId,
      actorId: 'system',
      actorName: 'Gemini AI Engine',
      actorRole: 'system',
      eventType: 'ai_processed',
      relatedObjectId: 'REQ-101',
      relatedObjectType: 'request',
      summary: 'Extracted structured fields: Category: Billing, Priority: High, Suggested: Rahul Sharma',
      timestamp: new Date(now.getTime() - 110 * 60 * 1000).toISOString(),
    },
    {
      id: 'ACT-3',
      organizationId: orgId,
      actorId: 'usr_alex',
      actorName: 'Alex Rivera',
      actorRole: 'manager',
      eventType: 'task_created',
      relatedObjectId: 'TSK-1001',
      relatedObjectType: 'task',
      summary: 'Reviewed extraction and converted REQ-101 to Task TSK-1001',
      timestamp: new Date(now.getTime() - 105 * 60 * 1000).toISOString(),
    },
    {
      id: 'ACT-4',
      organizationId: orgId,
      actorId: 'usr_alex',
      actorName: 'Alex Rivera',
      actorRole: 'manager',
      eventType: 'task_assigned',
      relatedObjectId: 'TSK-1001',
      relatedObjectType: 'task',
      summary: 'Assigned task to Rahul Sharma (Billing & Finance)',
      newValue: 'Rahul Sharma',
      timestamp: new Date(now.getTime() - 104 * 60 * 1000).toISOString(),
    },
    {
      id: 'ACT-5',
      organizationId: orgId,
      actorId: 'usr_marcus',
      actorName: 'Marcus Chen',
      actorRole: 'employee',
      eventType: 'status_changed',
      relatedObjectId: 'TSK-1002',
      relatedObjectType: 'task',
      summary: 'Changed status from In Progress to Blocked',
      previousValue: 'In Progress',
      newValue: 'Blocked',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
    }
  ];

  const automationRules: AutomationRule[] = [
    {
      id: 'RULE-1',
      organizationId: orgId,
      title: 'Overdue Task Escalation',
      trigger: 'task_overdue',
      conditionText: 'IF task deadline has elapsed AND status != Completed',
      action: 'notify_manager',
      actionTarget: 'Operations Managers',
      enabled: true,
      timesTriggered: 3,
      lastTriggeredAt: new Date(now.getTime() - 12 * 3600 * 1000).toISOString(),
    },
    {
      id: 'RULE-2',
      organizationId: orgId,
      title: 'Critical Priority Attention Flag',
      trigger: 'priority_critical',
      conditionText: 'IF task priority is set to Critical',
      action: 'flag_task',
      actionTarget: 'Priority Queue & Notification',
      enabled: true,
      timesTriggered: 5,
      lastTriggeredAt: new Date(now.getTime() - 4 * 3600 * 1000).toISOString(),
    },
    {
      id: 'RULE-3',
      organizationId: orgId,
      title: 'Auto-Assign Billing Requests to Finance Lead',
      trigger: 'category_billing',
      conditionText: 'IF incoming request is classified as Category: Billing',
      action: 'auto_assign',
      actionTarget: 'Rahul Sharma (usr_rahul)',
      enabled: true,
      timesTriggered: 8,
      lastTriggeredAt: new Date(now.getTime() - 105 * 60 * 1000).toISOString(),
    },
    {
      id: 'RULE-4',
      organizationId: orgId,
      title: 'Record Completion Timestamp & Update Performance',
      trigger: 'task_completed',
      conditionText: 'IF task status changes to Completed',
      action: 'record_metric',
      actionTarget: 'Operational Metrics Engine',
      enabled: true,
      timesTriggered: 14,
      lastTriggeredAt: new Date(now.getTime() - 14 * 3600 * 1000).toISOString(),
    },
  ];

  return {
    organization: {
      id: orgId,
      name: 'Lala Tech LLC',
      createdAt: twoDaysAgoStr,
    },
    users,
    requests,
    tasks,
    comments,
    notifications,
    activityLogs,
    automationRules,
    stats: {
      manualTasksCreated: 3,
      aiAssistedTasksCreated: 7,
      automationsTriggered: 30,
    }
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error('Failed reading existing db.json, re-initializing with seed data:', err);
        this.data = getInitialSeedData();
        this.save();
      }
    } else {
      this.data = getInitialSeedData();
      this.save();
    }
  }

  private save() {
    try {
      ensureDataDir();
      const tempPath = DB_FILE + '.tmp';
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save db.json:', err);
    }
  }

  public resetToSeed(): DatabaseSchema {
    this.data = getInitialSeedData();
    this.save();
    return this.data;
  }

  // Organization
  public getOrganization() {
    return this.data.organization;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  // Requests
  public getRequests(orgId: string): OperationalRequest[] {
    return this.data.requests.filter(r => r.organizationId === orgId);
  }

  public getRequestById(id: string): OperationalRequest | undefined {
    return this.data.requests.find(r => r.id === id);
  }

  public createRequest(req: OperationalRequest): OperationalRequest {
    this.data.requests.unshift(req);
    this.save();
    return req;
  }

  public updateRequest(id: string, updates: Partial<OperationalRequest>): OperationalRequest | null {
    const idx = this.data.requests.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.requests[idx] = { ...this.data.requests[idx], ...updates };
    this.save();
    return this.data.requests[idx];
  }

  public deleteRequest(id: string): boolean {
    const lenBefore = this.data.requests.length;
    this.data.requests = this.data.requests.filter(r => r.id !== id);
    if (this.data.requests.length !== lenBefore) {
      this.save();
      return true;
    }
    return false;
  }

  // Tasks
  public getTasks(orgId: string): Task[] {
    return this.data.tasks.filter(t => t.organizationId === orgId);
  }

  public getTaskById(id: string): Task | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  public createTask(task: Task): Task {
    this.data.tasks.unshift(task);
    if (task.aiAssisted) {
      this.data.stats.aiAssistedTasksCreated += 1;
    } else {
      this.data.stats.manualTasksCreated += 1;
    }
    this.save();
    return task;
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.tasks[idx] = { 
      ...this.data.tasks[idx], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.save();
    return this.data.tasks[idx];
  }

  // Comments
  public getCommentsByTask(taskId: string): TaskComment[] {
    return this.data.comments
      .filter(c => c.taskId === taskId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public addComment(comment: TaskComment): TaskComment {
    this.data.comments.push(comment);
    this.save();
    return comment;
  }

  // Notifications
  public getNotifications(userId: string, orgId: string): InAppNotification[] {
    return this.data.notifications
      .filter(n => n.organizationId === orgId && (n.userId === userId || n.userId === 'all_managers'))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(notif: InAppNotification): InAppNotification {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }

  public markAllNotificationsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.userId === userId || n.userId === 'all_managers') {
        n.read = true;
      }
    });
    this.save();
  }

  // Activity Logs
  public getActivityLogs(orgId: string): ActivityLog[] {
    return this.data.activityLogs
      .filter(l => l.organizationId === orgId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addActivityLog(log: ActivityLog): ActivityLog {
    this.data.activityLogs.unshift(log);
    // Keep max 500 logs
    if (this.data.activityLogs.length > 500) {
      this.data.activityLogs = this.data.activityLogs.slice(0, 500);
    }
    this.save();
    return log;
  }

  // Automation Rules
  public getAutomationRules(orgId: string): AutomationRule[] {
    return this.data.automationRules.filter(r => r.organizationId === orgId);
  }

  public updateAutomationRule(id: string, updates: Partial<AutomationRule>): AutomationRule | null {
    const idx = this.data.automationRules.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.automationRules[idx] = { ...this.data.automationRules[idx], ...updates };
    this.save();
    return this.data.automationRules[idx];
  }

  public createAutomationRule(rule: AutomationRule): AutomationRule {
    this.data.automationRules.push(rule);
    this.save();
    return rule;
  }

  public recordAutomationFired(id: string): void {
    const rule = this.data.automationRules.find(r => r.id === id);
    if (rule) {
      rule.timesTriggered += 1;
      rule.lastTriggeredAt = new Date().toISOString();
      this.data.stats.automationsTriggered += 1;
      this.save();
    }
  }

  // Stats
  public getStats() {
    return this.data.stats;
  }
}

export const db = new Database();
