import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/navigation/AppLayout";

// Pages
import BODDashboard from "@/pages/bod/Dashboard";
import BODApprovals from "@/pages/bod/Approvals";
import ProjectsPortfolio from "@/pages/projects/Portfolio";
// Construction (PMO/Construction)
import ConstructionSchedule from "@/pages/construction/Schedule";
import ConstructionWBS from "@/pages/construction/WBS";
import ConstructionDiary from "@/pages/construction/Diary";
import ConstructionQAQC from "@/pages/construction/QAQC";
import ConstructionIssues from "@/pages/construction/Issues";
import ConstructionProcurement from "@/pages/construction/Procurement";
import ConstructionApprovalInbox from "@/pages/construction/ApprovalInbox";
import ProjectWorkspace from "@/pages/construction/ProjectWorkspace";
// Legal & Bidding
import LegalTenderPipeline from "@/pages/legal/TenderPipeline";
import TenderList from "@/pages/legal/TenderList";
import ContractList from "@/pages/legal/ContractList";
import ContractDetail from "@/pages/legal/ContractDetail";
import LegalTemplates from "@/pages/legal/LegalTemplates";
import ApprovalInbox from "@/pages/legal/ApprovalInbox";
// Finance
import FinanceARAPOverview from "@/pages/finance/ARAPOverview";
import FinancePaymentRequests from "@/pages/finance/PaymentRequests";
import FinanceAdvances from "@/pages/finance/Advances";
import FinanceInvoices from "@/pages/finance/Invoices";
import FinanceBudget from "@/pages/finance/Budget";
import FinanceApprovalInbox from "@/pages/finance/ApprovalInbox";
// HR - Admin
import EmployeeDirectory from "@/pages/hr/EmployeeDirectory";
import Timesheet from "@/pages/hr/Timesheet";
import AllocationBoard from "@/pages/hr/AllocationBoard";
import OnboardingOffboarding from "@/pages/hr/OnboardingOffboarding";
import PoliciesForms from "@/pages/hr/PoliciesForms";
import HRApprovalInbox from "@/pages/hr/ApprovalInbox";
// Engineering
import DesignRequestList from "@/pages/engineering/DesignRequestList";
import DrawingRepository from "@/pages/engineering/DrawingRepository";
import TechnicalSubmittals from "@/pages/engineering/TechnicalSubmittals";
import RFIChangeRequests from "@/pages/engineering/RFIChangeRequests";
import EngineeringApprovalInbox from "@/pages/engineering/ApprovalInbox";
// DMS
import DMSHome from "@/pages/dms/DMSHome";
import SettingsHome from "@/pages/settings/SettingsHome";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/bod/dashboard" replace />} />
          <Route element={<AppLayout />}>
            {/* BOD */}
            <Route path="/bod/dashboard" element={<BODDashboard />} />
            <Route path="/bod/approvals" element={<BODApprovals />} />
            
            {/* Projects */}
            <Route path="/projects" element={<ProjectsPortfolio />} />
            <Route path="/projects/:id" element={<ProjectWorkspace />} />

            {/* Pháp chế & Đấu thầu */}
            <Route path="/legal/tenders/pipeline" element={<LegalTenderPipeline />} />
            <Route path="/legal/tenders" element={<TenderList />} />
            <Route path="/legal/contracts" element={<ContractList />} />
            <Route path="/legal/contracts/:id" element={<ContractDetail />} />
            <Route path="/legal/templates" element={<LegalTemplates />} />
            <Route path="/legal/approvals" element={<ApprovalInbox />} />

            {/* Backward compatible routes */}
            <Route path="/tenders" element={<Navigate to="/legal/tenders/pipeline" replace />} />
            <Route path="/contracts" element={<Navigate to="/legal/contracts" replace />} />
            
            {/* Tài chính - Kế toán */}
            <Route path="/finance" element={<Navigate to="/finance/ar-ap" replace />} />
            <Route path="/finance/ar-ap" element={<FinanceARAPOverview />} />
            <Route path="/finance/payment-requests" element={<FinancePaymentRequests />} />
            <Route path="/finance/advances" element={<FinanceAdvances />} />
            <Route path="/finance/invoices" element={<FinanceInvoices />} />
            <Route path="/finance/budget" element={<FinanceBudget />} />
            <Route path="/finance/approvals" element={<FinanceApprovalInbox />} />

            {/* Nhân sự - Hành chính */}
            <Route path="/hr" element={<Navigate to="/hr/employees" replace />} />
            <Route path="/hr/employees" element={<EmployeeDirectory />} />
            <Route path="/hr/timesheet" element={<Timesheet />} />
            <Route path="/hr/allocation" element={<AllocationBoard />} />
            <Route path="/hr/onboarding" element={<OnboardingOffboarding />} />
            <Route path="/hr/policies" element={<PoliciesForms />} />
            <Route path="/hr/approvals" element={<HRApprovalInbox />} />

            {/* Thiết kế - Kỹ thuật */}
            <Route path="/engineering" element={<Navigate to="/engineering/design-requests" replace />} />
            <Route path="/engineering/design-requests" element={<DesignRequestList />} />
            <Route path="/engineering/drawings" element={<DrawingRepository />} />
            <Route path="/engineering/submittals" element={<TechnicalSubmittals />} />
            <Route path="/engineering/rfi" element={<RFIChangeRequests />} />
            <Route path="/engineering/approvals" element={<EngineeringApprovalInbox />} />

            {/* QLDA - Thi công (PMO/Construction) */}
            <Route path="/construction" element={<Navigate to="/projects" replace />} />
            <Route path="/construction/schedule" element={<ConstructionSchedule />} />
            <Route path="/construction/wbs" element={<ConstructionWBS />} />
            <Route path="/construction/diary" element={<ConstructionDiary />} />
            <Route path="/construction/qaqc" element={<ConstructionQAQC />} />
            <Route path="/construction/issues" element={<ConstructionIssues />} />
            <Route path="/construction/procurement" element={<ConstructionProcurement />} />
            <Route path="/construction/approvals" element={<ConstructionApprovalInbox />} />

            {/* Backward compatible */}
            <Route path="/construction/projects/:id" element={<ProjectWorkspace />} />
            <Route path="/dms" element={<DMSHome />} />
            <Route path="/settings" element={<SettingsHome />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
