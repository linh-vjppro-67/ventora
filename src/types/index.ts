// Core ERP Types

export type UserRole = 'bod' | 'legal' | 'finance' | 'hr' | 'engineering' | 'pmo' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  department: string;
}

// Project Types
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  location: string;
  startDate: string;
  endDate: string;
  budget: number;
  actualCost: number;
  progress: number;
  status: ProjectStatus;
  manager: string;
  description?: string;
}

// Tender Types
export type TenderStatus = 'lead' | 'preparation' | 'submitted' | 'negotiating' | 'won' | 'lost';

export interface Tender {
  id: string;
  code: string;
  name: string;
  projectId?: string;
  client: string;
  value: number;
  deadline: string;
  status: TenderStatus;
  owner: string;
  priority: 'low' | 'medium' | 'high';
  documents: number;
  createdAt: string;
}

// Contract Types
export type ContractStatus = 'draft' | 'legal-review' | 'approved' | 'signed' | 'active' | 'closed';
export type ContractType = 'main' | 'subcontract' | 'service' | 'supply';

export interface Contract {
  id: string;
  code: string;
  name: string;
  projectId: string;
  type: ContractType;
  value: number;
  signedDate?: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  client: string;
  paymentTerms: string;
}

// Payment Request Types
export type PaymentStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'paid' | 'reconciled' | 'rejected';

export interface PaymentRequest {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: PaymentStatus;
  description: string;
  createdBy: string;
  createdAt: string;
}

// Employee Types
export type EmployeeStatus = 'active' | 'on-leave' | 'offboarded';

export interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  status: EmployeeStatus;
  joinDate: string;
  avatar?: string;
}

// Design Request Types
export type DesignRequestStatus = 'new' | 'in-progress' | 'review' | 'approved' | 'released';

export interface DesignRequest {
  id: string;
  code: string;
  projectId: string;
  projectName: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: DesignRequestStatus;
  assignee: string;
  createdAt: string;
}

// Work Package Types
export type WorkPackageStatus = 'not-started' | 'in-progress' | 'pending-inspection' | 'accepted' | 'closed';

export interface WorkPackage {
  id: string;
  wbsCode: string;
  name: string;
  projectId: string;
  owner: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  progress: number;
  status: WorkPackageStatus;
  parentId?: string;
}

// Approval Types
export type ApprovalType = 'tender' | 'contract' | 'payment' | 'change-request' | 'design';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Approval {
  id: string;
  type: ApprovalType;
  itemId: string;
  itemCode: string;
  itemName: string;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  comment?: string;
  amount?: number;
}

// Activity Log
export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  targetType: string;
  timestamp: string;
}

// KPI Types
export interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  trend?: 'up' | 'down' | 'neutral';
}
