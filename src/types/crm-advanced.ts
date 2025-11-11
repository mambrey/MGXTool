export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'follow-up' | 'meeting' | 'proposal' | 'contract' | 'research' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  dueDate: string;
  dueDateAlert?: boolean; // Add alert toggle for Power Automate integration
  assignedTo: string;
  relatedId?: string;
  relatedType?: 'account' | 'contact';
  relatedName?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: string;
  completedAt?: string;
  attachments?: Array<{
    id: string;
    name: string;
    size: number;
    type: string;
    uploadedAt: string;
  }>;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  type: 'contract' | 'proposal' | 'presentation' | 'report' | 'other';
  status: 'draft' | 'review' | 'approved' | 'archived';
  relatedId?: string;
  relatedType?: 'account' | 'contact' | 'task';
  relatedName?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  tags: string[];
  createdAt: string;
  lastModified: string;
  createdBy: string;
  version: number;
}

export interface ActivityLog {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'document';
  title: string;
  description?: string;
  relatedId?: string;
  relatedType?: 'account' | 'contact' | 'task' | 'document';
  relatedName?: string;
  createdAt: string;
  createdBy: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  createdAt: string;
  lastModified: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  probability: number;
  color: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  accountId: string;
  accountName: string;
  contactId?: string;
  contactName?: string;
  pipelineId: string;
  stageId: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate: string;
  actualCloseDate?: string;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  lostReason?: string;
  tags: string[];
  createdAt: string;
  lastModified: string;
  createdBy: string;
}

export interface ReportFilters {
  [key: string]: string | number | boolean | string[];
}

export interface ReportData {
  [key: string]: string | number | boolean | string[] | object;
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: 'sales' | 'activity' | 'pipeline' | 'custom';
  filters: ReportFilters;
  dateRange: {
    start: string;
    end: string;
  };
  createdAt: string;
  createdBy: string;
  data?: ReportData;
}

export interface Alert {
  id: string;
  type: 'birthday' | 'follow-up' | 'task-due' | 'contract-renewal' | 'meeting' | 'milestone';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  relatedId: string;
  relatedType: 'account' | 'contact' | 'task';
  relatedName: string;
  status: 'pending' | 'acknowledged' | 'completed' | 'dismissed';
  createdAt: string;
  actionRequired: boolean;
  contactOwner?: string;
  vicePresident?: string;
}