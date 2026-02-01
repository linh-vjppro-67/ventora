import React, { createContext, useContext, useMemo, useReducer } from "react";

export type PRStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "Paid"
  | "Reconciled"
  | "Rejected";

export interface FinanceProject {
  id: string;
  name: string;
}

export interface PaymentRequest {
  id: string;
  prNo: string;
  projectId: string;
  vendor: string;
  amount: number;
  status: PRStatus;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO
  attachments: {
    kind: "invoice";
    name: string;
    url: string;
    uploadedAt: string;
  }[];
}

export interface BudgetCostItem {
  code: string;
  name: string;
  budget: number;
  committed: number;
  actual: number;
}

export interface ProjectBudget {
  projectId: string;
  budget: number;
  committed: number;
  actual: number;
  costItems: BudgetCostItem[];
}

type State = {
  projects: FinanceProject[];
  paymentRequests: PaymentRequest[];
  budgets: ProjectBudget[];
  prCounter: number;
};

type Action =
  | {
      type: "pr.create";
      payload: {
        projectId: string;
        vendor: string;
        amount: number;
        dueDate: string;
      };
    }
  | { type: "pr.attachInvoice"; payload: { id: string } }
  | { type: "pr.submit"; payload: { id: string } }
  | { type: "pr.approve"; payload: { id: string } }
  | { type: "pr.reject"; payload: { id: string } }
  | { type: "pr.markPaid"; payload: { id: string } }
  | { type: "pr.reconcile"; payload: { id: string } };

function formatCounter(n: number) {
  return String(n).padStart(4, "0");
}

function makePRNo(counter: number) {
  // stable mock format
  return `PR-2026-${formatCounter(counter)}`;
}

function todayISO() {
  return new Date().toISOString();
}

const MOCK_INVOICE_URL = "/mock-invoice.svg";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "pr.create": {
      const nextCounter = state.prCounter + 1;
      const pr: PaymentRequest = {
        id: crypto.randomUUID(),
        prNo: makePRNo(nextCounter),
        projectId: action.payload.projectId,
        vendor: action.payload.vendor,
        amount: action.payload.amount,
        status: "Draft",
        dueDate: action.payload.dueDate,
        createdAt: todayISO(),
        attachments: [],
      };
      return {
        ...state,
        prCounter: nextCounter,
        paymentRequests: [pr, ...state.paymentRequests],
      };
    }
    case "pr.attachInvoice": {
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((pr) => {
          if (pr.id !== action.payload.id) return pr;
          const already = pr.attachments.some((a) => a.kind === "invoice");
          if (already) return pr;
          return {
            ...pr,
            attachments: [
              {
                kind: "invoice",
                name: "invoice_mock.pdf",
                url: MOCK_INVOICE_URL,
                uploadedAt: todayISO(),
              },
              ...pr.attachments,
            ],
          };
        }),
      };
    }
    case "pr.submit": {
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((pr) =>
          pr.id === action.payload.id && pr.status === "Draft"
            ? { ...pr, status: "Submitted" }
            : pr
        ),
      };
    }
    case "pr.approve": {
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((pr) =>
          pr.id === action.payload.id && pr.status === "Submitted"
            ? { ...pr, status: "Approved" }
            : pr
        ),
      };
    }
    case "pr.reject": {
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((pr) =>
          pr.id === action.payload.id && pr.status === "Submitted"
            ? { ...pr, status: "Rejected" }
            : pr
        ),
      };
    }
    case "pr.markPaid": {
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((pr) =>
          pr.id === action.payload.id && pr.status === "Approved"
            ? { ...pr, status: "Paid" }
            : pr
        ),
      };
    }
    case "pr.reconcile": {
      return {
        ...state,
        paymentRequests: state.paymentRequests.map((pr) =>
          pr.id === action.payload.id && pr.status === "Paid"
            ? { ...pr, status: "Reconciled" }
            : pr
        ),
      };
    }
    default:
      return state;
  }
}

const FinanceContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function useFinanceCtx() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("FinanceContext missing");
  return ctx;
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo<State>(() => {
    const projects: FinanceProject[] = [
      { id: "p1", name: "Dự án Riverside" },
      { id: "p2", name: "Dự án Green Tower" },
      { id: "p3", name: "Dự án KCN Long Hậu" },
    ];

    const paymentRequests: PaymentRequest[] = [
      {
        id: crypto.randomUUID(),
        prNo: "PR-2026-0003",
        projectId: "p2",
        vendor: "Công ty VLXD An Phát",
        amount: 185_000_000,
        status: "Submitted",
        dueDate: "2026-02-05",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        attachments: [],
      },
      {
        id: crypto.randomUUID(),
        prNo: "PR-2026-0002",
        projectId: "p1",
        vendor: "Nhà thầu phụ Minh Long",
        amount: 92_500_000,
        status: "Approved",
        dueDate: "2026-02-03",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        attachments: [
          {
            kind: "invoice",
            name: "invoice_mock.pdf",
            url: MOCK_INVOICE_URL,
            uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        prNo: "PR-2026-0001",
        projectId: "p3",
        vendor: "Điện nước Thành Tín",
        amount: 37_800_000,
        status: "Draft",
        dueDate: "2026-02-10",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        attachments: [],
      },
    ];

    const budgets: ProjectBudget[] = [
      {
        projectId: "p1",
        budget: 12_000_000_000,
        committed: 7_500_000_000,
        actual: 6_820_000_000,
        costItems: [
          { code: "C01", name: "Vật liệu", budget: 4_800_000_000, committed: 3_200_000_000, actual: 2_950_000_000 },
          { code: "C02", name: "Nhân công", budget: 2_600_000_000, committed: 1_800_000_000, actual: 1_720_000_000 },
          { code: "C03", name: "Thiết bị", budget: 1_900_000_000, committed: 1_150_000_000, actual: 980_000_000 },
          { code: "C04", name: "Thầu phụ", budget: 1_700_000_000, committed: 1_050_000_000, actual: 1_020_000_000 },
          { code: "C05", name: "Khác", budget: 1_000_000_000, committed: 300_000_000, actual: 150_000_000 },
        ],
      },
      {
        projectId: "p2",
        budget: 18_500_000_000,
        committed: 10_200_000_000,
        actual: 9_340_000_000,
        costItems: [
          { code: "C01", name: "Vật liệu", budget: 7_200_000_000, committed: 4_500_000_000, actual: 4_250_000_000 },
          { code: "C02", name: "Nhân công", budget: 3_600_000_000, committed: 2_300_000_000, actual: 2_080_000_000 },
          { code: "C03", name: "Thiết bị", budget: 3_000_000_000, committed: 1_850_000_000, actual: 1_640_000_000 },
          { code: "C04", name: "Thầu phụ", budget: 3_400_000_000, committed: 1_100_000_000, actual: 1_220_000_000 },
          { code: "C05", name: "Khác", budget: 1_300_000_000, committed: 450_000_000, actual: 150_000_000 },
        ],
      },
      {
        projectId: "p3",
        budget: 9_800_000_000,
        committed: 4_100_000_000,
        actual: 3_750_000_000,
        costItems: [
          { code: "C01", name: "Vật liệu", budget: 3_600_000_000, committed: 1_850_000_000, actual: 1_720_000_000 },
          { code: "C02", name: "Nhân công", budget: 2_200_000_000, committed: 1_050_000_000, actual: 980_000_000 },
          { code: "C03", name: "Thiết bị", budget: 1_650_000_000, committed: 650_000_000, actual: 580_000_000 },
          { code: "C04", name: "Thầu phụ", budget: 1_450_000_000, committed: 450_000_000, actual: 420_000_000 },
          { code: "C05", name: "Khác", budget: 900_000_000, committed: 100_000_000, actual: 50_000_000 },
        ],
      },
    ];

    return {
      projects,
      paymentRequests,
      budgets,
      prCounter: 3,
    };
  }, []);

  const [state, dispatch] = useReducer(reducer, initial);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  return useFinanceCtx();
}

export function useFinanceProjects() {
  const { state } = useFinanceCtx();
  return state.projects;
}

export function useFinanceBudgets() {
  const { state } = useFinanceCtx();
  return state.budgets;
}

export function usePaymentRequests() {
  const { state } = useFinanceCtx();
  return state.paymentRequests;
}

export function financeProjectName(projects: FinanceProject[], projectId: string) {
  return projects.find((p) => p.id === projectId)?.name ?? "(Unknown project)";
}
