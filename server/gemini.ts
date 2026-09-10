import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedInfo, TaskCategory, TaskPriority, User } from '../src/types.js';

// Initialize Gemini client safely
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// Fallback intelligent heuristic extractor when API key is missing or fails
export function fallbackExtract(message: string, availableUsers: User[]): ExtractedInfo {
  const lower = message.toLowerCase();
  
  // Category heuristic
  let category: TaskCategory = 'Operations';
  if (lower.includes('invoice') || lower.includes('gst') || lower.includes('bill') || lower.includes('payment') || lower.includes('wire') || lower.includes('tax') || lower.includes('refund')) {
    category = 'Billing';
  } else if (lower.includes('bug') || lower.includes('error') || lower.includes('502') || lower.includes('500') || lower.includes('gateway') || lower.includes('crash') || lower.includes('api') || lower.includes('database') || lower.includes('server')) {
    category = 'Technical';
  } else if (lower.includes('support') || lower.includes('complaint') || lower.includes('customer') || lower.includes('client') || lower.includes('satisfaction') || lower.includes('inquiry')) {
    category = 'Customer Support';
  } else if (lower.includes('contract') || lower.includes('nda') || lower.includes('agreement') || lower.includes('legal') || lower.includes('sla') || lower.includes('clause')) {
    category = 'Administrative';
  } else if (lower.includes('hiring') || lower.includes('onboard') || lower.includes('associate') || lower.includes('leave') || lower.includes('employee')) {
    category = 'HR';
  } else if (lower.includes('lead') || lower.includes('quote') || lower.includes('deal') || lower.includes('proposal') || lower.includes('sales')) {
    category = 'Sales';
  }

  // Priority heuristic
  let priority: TaskPriority = 'Medium';
  let priorityReasoning = 'Standard operational request with normal turnaround expectation.';
  if (lower.includes('urgent') || lower.includes('blocking') || lower.includes('critical') || lower.includes('bad gateway') || lower.includes('down') || lower.includes('outage') || lower.includes('immediately')) {
    priority = 'Critical';
    priorityReasoning = 'Contains blocking language or system availability impact requiring immediate resolution.';
  } else if (lower.includes('before tomorrow') || lower.includes('asap') || lower.includes('today') || lower.includes('deadline') || lower.includes('high priority')) {
    priority = 'High';
    priorityReasoning = 'Explicit tight deadline or business impact indicated.';
  } else if (lower.includes('whenever') || lower.includes('low priority') || lower.includes('no rush') || lower.includes('routine')) {
    priority = 'Low';
    priorityReasoning = 'Routine administrative or non-time-sensitive request.';
  }

  // Customer heuristic
  let customer: string | null = null;
  const custMatch = message.match(/(?:from|customer|client|for)\s+([A-Z][a-zA-Z0-9&]+(?:\s+[A-Z][a-zA-Z0-9&]+)?)/);
  if (custMatch && custMatch[1]) {
    customer = custMatch[1];
  } else if (lower.includes('abc corp')) {
    customer = 'ABC Corp';
  } else if (lower.includes('delta global') || lower.includes('delta')) {
    customer = 'Delta Global';
  } else if (lower.includes('zenith logistics') || lower.includes('zenith')) {
    customer = 'Zenith Logistics';
  } else if (lower.includes('apex retail') || lower.includes('apex')) {
    customer = 'Apex Retail';
  }

  // Deadline heuristic
  let deadline: string | null = null;
  const now = new Date();
  if (lower.includes('today') || lower.includes('tonight')) {
    deadline = now.toISOString().split('T')[0];
  } else if (lower.includes('tomorrow')) {
    const d = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    deadline = d.toISOString().split('T')[0];
  } else if (lower.includes('friday')) {
    const d = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    deadline = d.toISOString().split('T')[0];
  } else if (lower.includes('thursday')) {
    const d = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    deadline = d.toISOString().split('T')[0];
  }

  // Suggested Assignee based on category match
  let suggestedAssigneeId: string | null = null;
  let suggestedAssigneeName: string | null = null;
  let suggestedAssigneeReason = '';

  const matchingEmployee = availableUsers.find(u => {
    if (category === 'Billing') return u.department?.toLowerCase().includes('billing') || u.skills?.some(s => s.toLowerCase().includes('invoic') || s.toLowerCase().includes('tax'));
    if (category === 'Technical') return u.department?.toLowerCase().includes('tech') || u.skills?.some(s => s.toLowerCase().includes('bug') || s.toLowerCase().includes('system'));
    if (category === 'Customer Support') return u.department?.toLowerCase().includes('support') || u.skills?.some(s => s.toLowerCase().includes('client'));
    if (category === 'Administrative') return u.department?.toLowerCase().includes('admin') || u.skills?.some(s => s.toLowerCase().includes('contract') || s.toLowerCase().includes('agreement'));
    if (category === 'HR') return u.department?.toLowerCase().includes('admin') || u.role === 'manager';
    return u.role === 'employee';
  });

  if (matchingEmployee) {
    suggestedAssigneeId = matchingEmployee.id;
    suggestedAssigneeName = matchingEmployee.name;
    suggestedAssigneeReason = `Assigned based on matching department (${matchingEmployee.department}) and relevant operational skillset.`;
  }

  // Title generation
  let taskTitle = message.slice(0, 70).trim();
  if (taskTitle.length >= 70) taskTitle += '...';
  if (customer && category) {
    taskTitle = `${category} request for ${customer}: ${message.slice(0, 45).trim()}...`;
  }

  // Entities
  const entities: string[] = [];
  if (customer) entities.push(customer);
  const codeMatches = message.match(/(?:#|ref\s*#?|INV-)[A-Za-z0-9-]+/gi);
  if (codeMatches) {
    entities.push(...codeMatches);
  }
  const gstMatch = message.match(/[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/g);
  if (gstMatch) {
    entities.push(...gstMatch);
  }

  return {
    taskTitle,
    taskDescription: message,
    customer,
    category,
    priority,
    priorityReasoning,
    deadline,
    suggestedAssigneeId,
    suggestedAssigneeName,
    suggestedAssigneeReason,
    requiredAction: 'Review details and execute required operational fix.',
    potentialDependencies: null,
    importantEntities: Array.from(new Set(entities)),
    confidenceLevel: 'Medium',
    extractedAt: new Date().toISOString(),
  };
}

export async function analyzeOperationalRequest(
  message: string,
  availableUsers: User[]
): Promise<ExtractedInfo> {
  const ai = getGeminiClient();

  if (!ai) {
    console.log('Gemini API key not found or inactive. Using intelligent deterministic fallback extraction.');
    return fallbackExtract(message, availableUsers);
  }

  const teamContext = availableUsers
    .filter(u => u.active)
    .map(u => `- Name: ${u.name} (ID: ${u.id}, Role: ${u.role}, Dept: ${u.department || 'General'}, Skills: ${u.skills?.join(', ') || 'General'})`)
    .join('\n');

  const systemInstruction = `You are the core AI Operations Engine for Lala Tech LLC ("Lala Ops").
Your mission is to parse messy, unstructured operational requests (from WhatsApp, emails, chats, or notes) and transform them into crystal-clear, structured operational tasks.

Strict Rules:
1. NEVER hallucinate information. If customer or deadline is not stated or cannot be reliably inferred, return null.
2. Category MUST be one of: "Billing", "Customer Support", "Sales", "Operations", "Technical", "Administrative", "HR", "Other".
3. Priority MUST be one of: "Low", "Medium", "High", "Critical".
   - Critical: Complete service outage, severe business blocker, direct revenue loss, immediate legal threat.
   - High: Urgent deadline (today/tomorrow), high-value client escalation, financial transaction blocker.
   - Medium: Standard business request with normal turnaround.
   - Low: Minor administrative, routine documentation, no tight timeline.
4. Deadline must be in YYYY-MM-DD format based on today's reference date (${new Date().toISOString().split('T')[0]}), or null.
5. Identify candidate entities (e.g. invoice numbers, GST numbers, error codes, amounts, client names).
6. Select the best suggested assignee from the team list based on skills and department. Provide a brief justification.
7. Return strictly conforming JSON according to the schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Operational Request message to analyze:\n"""\n${message}\n"""\n\nAvailable Team Members:\n${teamContext}`,
      config: {
        systemInstruction,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            taskTitle: {
              type: Type.STRING,
              description: 'A crisp, professional, actionable title (e.g. "Correct GST number on Invoice #INV-2026-89 for ABC Corp")',
            },
            taskDescription: {
              type: Type.STRING,
              description: 'Detailed operational summary of what happened and what must be executed',
            },
            customer: {
              type: Type.STRING,
              description: 'The client or customer company name, or null if internal/unspecified',
            },
            category: {
              type: Type.STRING,
              description: 'One of: Billing, Customer Support, Sales, Operations, Technical, Administrative, HR, Other',
            },
            priority: {
              type: Type.STRING,
              description: 'One of: Low, Medium, High, Critical',
            },
            priorityReasoning: {
              type: Type.STRING,
              description: 'Brief explanation why this priority was determined',
            },
            deadline: {
              type: Type.STRING,
              description: 'Target completion date in YYYY-MM-DD format, or null',
            },
            suggestedAssigneeId: {
              type: Type.STRING,
              description: 'User ID of the recommended team member, or null',
            },
            suggestedAssigneeName: {
              type: Type.STRING,
              description: 'Full name of the recommended team member, or null',
            },
            suggestedAssigneeReason: {
              type: Type.STRING,
              description: 'Why this employee was recommended',
            },
            requiredAction: {
              type: Type.STRING,
              description: 'The primary action item needed to resolve this task',
            },
            potentialDependencies: {
              type: Type.STRING,
              description: 'Access rights, approvals, or external resources needed, or null',
            },
            importantEntities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key identifiers such as invoice numbers, tax IDs, transaction references, error messages',
            },
            confidenceLevel: {
              type: Type.STRING,
              description: 'High, Medium, or Low',
            },
          },
          required: [
            'taskTitle',
            'taskDescription',
            'category',
            'priority',
            'requiredAction',
            'importantEntities',
            'confidenceLevel',
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('Empty response from Gemini');
    }

    const parsed = JSON.parse(text);

    // Validate and sanitize fields
    const validCategories: TaskCategory[] = [
      'Billing', 'Customer Support', 'Sales', 'Operations', 'Technical', 'Administrative', 'HR', 'Other'
    ];
    const category: TaskCategory = validCategories.includes(parsed.category) ? parsed.category : 'Operations';

    const validPriorities: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];
    const priority: TaskPriority = validPriorities.includes(parsed.priority) ? parsed.priority : 'Medium';

    const validConfidence: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];
    const confidenceLevel = validConfidence.includes(parsed.confidenceLevel) ? parsed.confidenceLevel : 'Medium';

    // Verify suggested assignee belongs to team
    let suggestedAssigneeId = parsed.suggestedAssigneeId || null;
    let suggestedAssigneeName = parsed.suggestedAssigneeName || null;
    if (suggestedAssigneeId) {
      const match = availableUsers.find(u => u.id === suggestedAssigneeId);
      if (match) {
        suggestedAssigneeName = match.name;
      } else {
        suggestedAssigneeId = null;
        suggestedAssigneeName = null;
      }
    }

    return {
      taskTitle: parsed.taskTitle || 'New Operational Task',
      taskDescription: parsed.taskDescription || message,
      customer: parsed.customer || null,
      category,
      priority,
      priorityReasoning: parsed.priorityReasoning || 'Assigned based on request analysis.',
      deadline: parsed.deadline && /^\d{4}-\d{2}-\d{2}$/.test(parsed.deadline) ? parsed.deadline : null,
      suggestedAssigneeId,
      suggestedAssigneeName,
      suggestedAssigneeReason: parsed.suggestedAssigneeReason || 'Matched relevant skills for this category.',
      requiredAction: parsed.requiredAction || 'Execute required task operations.',
      potentialDependencies: parsed.potentialDependencies || null,
      importantEntities: Array.isArray(parsed.importantEntities) ? parsed.importantEntities : [],
      confidenceLevel,
      extractedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.error('Gemini extraction failed, using fallback:', err);
    return fallbackExtract(message, availableUsers);
  }
}
