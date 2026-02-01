import React, { createContext, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { mockEmployees, mockProjects } from '@/data/mockData';
import type { Employee, Project } from '@/types';
import type { AllocationItem, HRApproval, HRContextState } from '@/types/hr';

type HRContextValue = HRContextState & {
  addEmployee: (payload: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, patch: Partial<Employee & { contractMockAttached?: boolean }>) => void;
  attachContractMock: (employeeId: string) => void;
  proposeAllocation: (payload: Omit<AllocationItem, 'id' | 'state'> & { state?: AllocationItem['state'] }) => void;
  updateAllocation: (id: string, patch: Partial<AllocationItem>) => void;
  requestApprovalForAllocation: (allocationId: string) => void;
  actOnApproval: (approvalId: string, action: 'approve' | 'reject') => void;
};

const HRContext = createContext<HRContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 8)}-${Date.now().toString(16).slice(-4)}`;
}

function getWeekStart(d = new Date()) {
  // week starts Monday
  const date = new Date(d);
  const day = date.getDay(); // 0..6 (Sun..Sat)
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function HRProvider({ children }: { children: React.ReactNode }) {
  const [employees, setEmployees] = useState<(Employee & { contractMockAttached?: boolean })[]>(
    mockEmployees.map((e) => ({ ...e, contractMockAttached: e.id === 'emp-008' }))
  );
  const [projects] = useState<Project[]>(mockProjects);
  const [allocations, setAllocations] = useState<AllocationItem[]>(() => {
    const weekStart = getWeekStart();
    return [
      {
        id: 'alloc-001',
        employeeId: 'emp-001',
        projectId: 'proj-001',
        weekStart,
        percent: 60,
        state: 'approved',
      },
      {
        id: 'alloc-002',
        employeeId: 'emp-003',
        projectId: 'proj-004',
        weekStart,
        percent: 40,
        state: 'proposed',
      },
      {
        id: 'alloc-003',
        employeeId: 'emp-005',
        projectId: 'proj-002',
        weekStart,
        percent: 80,
        state: 'locked',
      },
    ];
  });
  const [approvals, setApprovals] = useState<HRApproval[]>(() => {
    const now = new Date();
    return [
      {
        id: 'hrappr-001',
        type: 'allocation',
        title: 'Yêu cầu duyệt phân bổ nguồn lực',
        requestedBy: 'PMO',
        requestedAt: now.toISOString(),
        status: 'pending',
        refId: 'alloc-002',
      },
    ];
  });

  const value = useMemo<HRContextValue>(() => {
    const addEmployee: HRContextValue['addEmployee'] = (payload) => {
      const id = uid('emp');
      setEmployees((prev) => [{ ...payload, id }, ...prev]);
      toast.success('Đã thêm nhân viên (mock)');
    };

    const updateEmployee: HRContextValue['updateEmployee'] = (id, patch) => {
      setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
    };

    const attachContractMock: HRContextValue['attachContractMock'] = (employeeId) => {
      setEmployees((prev) =>
        prev.map((e) => (e.id === employeeId ? { ...e, contractMockAttached: true } : e))
      );
      toast.success('Đã upload hợp đồng (mock)');
    };

    const proposeAllocation: HRContextValue['proposeAllocation'] = (payload) => {
      const id = uid('alloc');
      const state = payload.state ?? 'proposed';
      setAllocations((prev) => [{ ...payload, id, state }, ...prev]);
      toast.success('Đã tạo allocation (Proposed)');
    };

    const updateAllocation: HRContextValue['updateAllocation'] = (id, patch) => {
      setAllocations((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    };

    const requestApprovalForAllocation: HRContextValue['requestApprovalForAllocation'] = (allocationId) => {
      setApprovals((prev) => {
        const already = prev.some((a) => a.type === 'allocation' && a.refId === allocationId && a.status === 'pending');
        if (already) return prev;
        return [
          {
            id: uid('hrappr'),
            type: 'allocation',
            title: 'Yêu cầu duyệt phân bổ nguồn lực',
            requestedBy: 'HR',
            requestedAt: new Date().toISOString(),
            status: 'pending',
            refId: allocationId,
          },
          ...prev,
        ];
      });
      toast.info('Đã gửi yêu cầu duyệt (Approval Inbox)');
    };

    const actOnApproval: HRContextValue['actOnApproval'] = (approvalId, action) => {
      let ref: string | undefined;
      let type: string | undefined;

      setApprovals((prev) => {
        const current = prev.find((a) => a.id === approvalId);
        ref = current?.refId;
        type = current?.type;
        return prev.map((a) =>
          a.id === approvalId ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a
        );
      });

      if (type === 'allocation' && ref) {
        if (action === 'approve') {
          setAllocations((prev) => prev.map((al) => (al.id === ref ? { ...al, state: 'approved' } : al)));
          toast.success('Approved allocation');
        } else {
          toast.error('Rejected allocation');
        }
        return;
      }

      toast.success(action === 'approve' ? 'Approved' : 'Rejected');
    };

    return {
      employees,
      projects,
      allocations,
      approvals,
      addEmployee,
      updateEmployee,
      attachContractMock,
      proposeAllocation,
      updateAllocation,
      requestApprovalForAllocation,
      actOnApproval,
    };
  }, [employees, projects, allocations, approvals]);

  return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
}

export function useHR() {
  const ctx = useContext(HRContext);
  if (!ctx) throw new Error('useHR must be used within HRProvider');
  return ctx;
}
