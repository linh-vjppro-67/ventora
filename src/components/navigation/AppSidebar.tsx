import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Scale, 
  Wallet, 
  Users, 
  PenTool, 
  HardHat,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  ChevronDown,
  Gavel,
  FileCheck,
  Inbox,
  BadgeDollarSign,
  BarChart3,
  HandCoins,
  Receipt,
  PiggyBank,
  UserCog,
  CalendarClock,
  ClipboardCheck,
  FileSpreadsheet,
  Brush,
  GitPullRequest,
  FolderOpen,
  Kanban,
  ClipboardList,
  BookOpen,
  AlertTriangle,
  ShoppingCart
} from 'lucide-react';
import { AppNavLink } from './AppNavLink';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLocation } from 'react-router-dom';

interface NavGroupProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  collapsed?: boolean;
  defaultOpen?: boolean;
}

function NavGroup({ title, icon: Icon, children, collapsed, defaultOpen = false }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (collapsed) {
    return <>{children}</>;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors">
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-2 space-y-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Check if current path is in a group
  const isInGroup = (paths: string[]) => paths.some(p => location.pathname.startsWith(p));

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-sidebar border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold text-sidebar-foreground whitespace-nowrap">
                  ConstructionERP
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {/* Dashboard */}
        <AppNavLink to="/bod/dashboard" icon={LayoutDashboard} collapsed={collapsed}>
          Dashboard (BOD)
        </AppNavLink>

        {/* Pháp chế & Đấu thầu */}
        <NavGroup 
          title="Pháp chế & Đấu thầu" 
          icon={Scale} 
          collapsed={collapsed}
          defaultOpen={isInGroup(['/legal', '/tenders', '/contracts'])}
        >
          <AppNavLink to="/legal/tenders/pipeline" icon={Kanban} collapsed={collapsed}>
            Tender Pipeline
          </AppNavLink>
          <AppNavLink to="/legal/tenders" icon={Gavel} collapsed={collapsed}>
            Hồ sơ thầu
          </AppNavLink>
          <AppNavLink to="/legal/contracts" icon={FileCheck} collapsed={collapsed}>
            Hợp đồng
          </AppNavLink>
          <AppNavLink to="/legal/templates" icon={FolderOpen} collapsed={collapsed}>
            Legal Templates (DMS)
          </AppNavLink>
          <AppNavLink to="/legal/approvals" icon={Inbox} collapsed={collapsed}>
            Approval Inbox
          </AppNavLink>
        </NavGroup>

        {/* Tài chính - Kế toán */}
        <NavGroup 
          title="Tài chính - Kế toán" 
          icon={Wallet} 
          collapsed={collapsed}
          defaultOpen={isInGroup(['/finance'])}
        >
          <AppNavLink to="/finance/ar-ap" icon={BarChart3} collapsed={collapsed}>
            AR/AP Overview
          </AppNavLink>
          <AppNavLink to="/finance/payment-requests" icon={BadgeDollarSign} collapsed={collapsed}>
            Đề nghị thanh toán
          </AppNavLink>
          <AppNavLink to="/finance/advances" icon={HandCoins} collapsed={collapsed}>
            Tạm ứng / Hoàn ứng
          </AppNavLink>
          <AppNavLink to="/finance/invoices" icon={Receipt} collapsed={collapsed}>
            Hóa đơn - Chứng từ
          </AppNavLink>
          <AppNavLink to="/finance/budget" icon={PiggyBank} collapsed={collapsed}>
            Ngân sách dự án
          </AppNavLink>
          <AppNavLink to="/finance/approvals" icon={Inbox} collapsed={collapsed}>
            Approval Inbox
          </AppNavLink>
        </NavGroup>

        {/* Nhân sự - Hành chính */}
        <NavGroup 
          title="Nhân sự - HC" 
          icon={Users} 
          collapsed={collapsed}
          defaultOpen={isInGroup(['/hr'])}
        >
          <AppNavLink to="/hr/employees" icon={UserCog} collapsed={collapsed}>
            Employee Directory
          </AppNavLink>
          <AppNavLink to="/hr/timesheet" icon={CalendarClock} collapsed={collapsed}>
            Timesheet / Chấm công
          </AppNavLink>
          <AppNavLink to="/hr/allocation" icon={FileSpreadsheet} collapsed={collapsed}>
            Resource Allocation
          </AppNavLink>
          <AppNavLink to="/hr/onboarding" icon={ClipboardCheck} collapsed={collapsed}>
            Onboarding/Offboarding checklist
          </AppNavLink>
          <AppNavLink to="/hr/policies" icon={FolderOpen} collapsed={collapsed}>
            Policies & Forms (DMS)
          </AppNavLink>
          <AppNavLink to="/hr/approvals" icon={Inbox} collapsed={collapsed}>
            Approval Inbox
          </AppNavLink>
        </NavGroup>

        {/* Thiết kế - Kỹ thuật */}
        <NavGroup 
          title="Thiết kế - Kỹ thuật" 
          icon={PenTool} 
          collapsed={collapsed}
          defaultOpen={isInGroup(['/engineering'])}
        >
          <AppNavLink to="/engineering/design-requests" icon={Brush} collapsed={collapsed}>
            Design Requests
          </AppNavLink>
          <AppNavLink to="/engineering/drawings" icon={FolderOpen} collapsed={collapsed}>
            Drawing Repository
          </AppNavLink>
          <AppNavLink to="/engineering/submittals" icon={FileText} collapsed={collapsed}>
            Technical Submittals
          </AppNavLink>
          <AppNavLink to="/engineering/rfi" icon={GitPullRequest} collapsed={collapsed}>
            RFI / Change Requests
          </AppNavLink>
          <AppNavLink to="/engineering/approvals" icon={Inbox} collapsed={collapsed}>
            Approval Inbox
          </AppNavLink>
        </NavGroup>

        {/* QLDA - Thi công */}
        <NavGroup 
          title="QLDA - Thi công" 
          icon={HardHat} 
          collapsed={collapsed}
          defaultOpen={isInGroup(['/projects', '/construction'])}
        >
          <AppNavLink to="/projects" icon={Kanban} collapsed={collapsed}>
            Project Portfolio
          </AppNavLink>
          <AppNavLink to="/construction/schedule" icon={CalendarClock} collapsed={collapsed}>
            Schedule (Gantt)
          </AppNavLink>
          <AppNavLink to="/construction/wbs" icon={ClipboardList} collapsed={collapsed}>
            WBS / Work Packages
          </AppNavLink>
          <AppNavLink to="/construction/diary" icon={BookOpen} collapsed={collapsed}>
            Site Diary / Nhật ký
          </AppNavLink>
          <AppNavLink to="/construction/qaqc" icon={ClipboardCheck} collapsed={collapsed}>
            QA/QC & Inspections
          </AppNavLink>
          <AppNavLink to="/construction/issues" icon={AlertTriangle} collapsed={collapsed}>
            Issues / Risks
          </AppNavLink>
          <AppNavLink to="/construction/procurement" icon={ShoppingCart} collapsed={collapsed}>
            Procurement Requests
          </AppNavLink>
          <AppNavLink to="/construction/approvals" icon={Inbox} collapsed={collapsed}>
            Approval Inbox
          </AppNavLink>
        </NavGroup>

        {/* Tài liệu */}
        <AppNavLink to="/dms" icon={FileText} collapsed={collapsed}>
          Tài liệu (DMS)
        </AppNavLink>

        {/* Hệ thống */}
        <AppNavLink to="/settings" icon={Settings} collapsed={collapsed}>
          Hệ thống
        </AppNavLink>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
