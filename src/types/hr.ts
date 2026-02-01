import type { Employee, Project } from '@/types';

export type AllocationState = 'proposed' | 'approved' | 'locked';

export interface AllocationItem {
  id: string;
  employeeId: string;
  projectId: string;
  weekStart: string; // YYYY-MM-DD (Mon)
  percent: number; // 0..100
  state: AllocationState;
}

export type HRApprovalType = 'allocation' | 'employee-role' | 'timesheet';

export interface HRApproval {
  id: string;
  type: HRApprovalType;
  title: string;
  requestedBy: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  refId?: string; // e.g. allocationId
}

export interface HRContextState {
  employees: (Employee & { contractMockAttached?: boolean })[];
  projects: Project[];
  allocations: AllocationItem[];
  approvals: HRApproval[];
}
