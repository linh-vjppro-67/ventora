import { useState, useCallback } from 'react';
import type { Project, Tender, Contract, PaymentRequest, Employee, DesignRequest, WorkPackage, Approval } from '@/types';
import { 
  mockProjects, 
  mockTenders, 
  mockContracts, 
  mockPaymentRequests, 
  mockEmployees,
  mockDesignRequests,
  mockWorkPackages,
  mockApprovals
} from '@/data/mockData';

// Generic store hook for CRUD operations
function useStore<T extends { id: string }>(initialData: T[]) {
  const [items, setItems] = useState<T[]>(initialData);

  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const update = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const getById = useCallback((id: string) => {
    return items.find(item => item.id === id);
  }, [items]);

  return { items, add, update, remove, getById, setItems };
}

// Projects Store
export function useProjectsStore() {
  return useStore<Project>(mockProjects);
}

// Tenders Store
export function useTendersStore() {
  const store = useStore<Tender>(mockTenders);

  const moveToStage = useCallback((id: string, newStatus: Tender['status']) => {
    store.update(id, { status: newStatus });
  }, [store]);

  const getByStatus = useCallback((status: Tender['status']) => {
    return store.items.filter(item => item.status === status);
  }, [store.items]);

  return { ...store, moveToStage, getByStatus };
}

// Contracts Store
export function useContractsStore() {
  return useStore<Contract>(mockContracts);
}

// Payment Requests Store
export function usePaymentRequestsStore() {
  const store = useStore<PaymentRequest>(mockPaymentRequests);

  const approve = useCallback((id: string) => {
    store.update(id, { status: 'approved' });
  }, [store]);

  const reject = useCallback((id: string) => {
    store.update(id, { status: 'rejected' });
  }, [store]);

  return { ...store, approve, reject };
}

// Employees Store
export function useEmployeesStore() {
  return useStore<Employee>(mockEmployees);
}

// Design Requests Store
export function useDesignRequestsStore() {
  return useStore<DesignRequest>(mockDesignRequests);
}

// Work Packages Store
export function useWorkPackagesStore() {
  return useStore<WorkPackage>(mockWorkPackages);
}

// Approvals Store
export function useApprovalsStore() {
  const store = useStore<Approval>(mockApprovals);

  const approve = useCallback((id: string, comment?: string) => {
    store.update(id, { status: 'approved', comment });
  }, [store]);

  const reject = useCallback((id: string, comment?: string) => {
    store.update(id, { status: 'rejected', comment });
  }, [store]);

  const getPending = useCallback(() => {
    return store.items.filter(item => item.status === 'pending');
  }, [store.items]);

  return { ...store, approve, reject, getPending };
}
