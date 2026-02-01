import type { 
  Project, 
  Tender, 
  Contract, 
  PaymentRequest, 
  Employee, 
  DesignRequest,
  WorkPackage,
  Approval,
  Activity,
  PaymentStatus
} from '@/types';

// Helper to ensure proper typing
const createPaymentRequest = (data: Omit<PaymentRequest, 'status'> & { status: PaymentStatus }): PaymentRequest => data;

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    code: 'DA-2024-001',
    name: 'Tòa nhà Văn phòng ABC Tower',
    client: 'Công ty CP Đầu tư ABC',
    location: 'Quận 1, TP.HCM',
    startDate: '2024-01-15',
    endDate: '2025-06-30',
    budget: 150000000000,
    actualCost: 85000000000,
    progress: 45,
    status: 'active',
    manager: 'Nguyễn Văn An',
    description: 'Xây dựng tòa nhà văn phòng 25 tầng'
  },
  {
    id: 'proj-002',
    code: 'DA-2024-002',
    name: 'Khu đô thị Green Valley',
    client: 'Tập đoàn BĐS XYZ',
    location: 'Bình Dương',
    startDate: '2024-03-01',
    endDate: '2026-12-31',
    budget: 500000000000,
    actualCost: 120000000000,
    progress: 22,
    status: 'active',
    manager: 'Trần Thị Bình',
    description: 'Phát triển khu đô thị sinh thái 50ha'
  },
  {
    id: 'proj-003',
    code: 'DA-2024-003',
    name: 'Nhà máy sản xuất DEF',
    client: 'DEF Manufacturing',
    location: 'KCN Long An',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    budget: 80000000000,
    actualCost: 65000000000,
    progress: 78,
    status: 'active',
    manager: 'Lê Minh Cường',
    description: 'Xây dựng nhà máy sản xuất linh kiện điện tử'
  },
  {
    id: 'proj-004',
    code: 'DA-2023-015',
    name: 'Trung tâm thương mại Mega Mall',
    client: 'Retail Corp Vietnam',
    location: 'Hà Nội',
    startDate: '2023-06-01',
    endDate: '2024-12-31',
    budget: 320000000000,
    actualCost: 295000000000,
    progress: 92,
    status: 'active',
    manager: 'Phạm Hoàng Dũng',
    description: 'Xây dựng TTTM 5 tầng nổi, 3 tầng hầm'
  },
  {
    id: 'proj-005',
    code: 'DA-2024-004',
    name: 'Cầu vượt Ngã tư Thủ Đức',
    client: 'Sở GTVT TP.HCM',
    location: 'TP. Thủ Đức',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    budget: 200000000000,
    actualCost: 45000000000,
    progress: 18,
    status: 'active',
    manager: 'Võ Thành Đạt',
    description: 'Xây dựng cầu vượt 4 nhánh'
  },
  {
    id: 'proj-006',
    code: 'DA-2024-005',
    name: 'Bệnh viện Đa khoa Quốc tế',
    client: 'Healthcare Group',
    location: 'Đà Nẵng',
    startDate: '2024-05-15',
    endDate: '2026-05-14',
    budget: 420000000000,
    actualCost: 35000000000,
    progress: 8,
    status: 'planning',
    manager: 'Nguyễn Thị Hương',
    description: 'Xây dựng bệnh viện 500 giường'
  }
];

// Mock Tenders
export const mockTenders: Tender[] = [
  {
    id: 'tender-001',
    code: 'GT-2024-001',
    name: 'Gói thầu XD phần thân ABC Tower',
    projectId: 'proj-001',
    client: 'Công ty CP Đầu tư ABC',
    value: 85000000000,
    deadline: '2024-02-15',
    status: 'won',
    owner: 'Nguyễn Văn An',
    priority: 'high',
    documents: 15,
    createdAt: '2024-01-10'
  },
  {
    id: 'tender-002',
    code: 'GT-2024-002',
    name: 'Gói thầu Hạ tầng kỹ thuật Green Valley',
    projectId: 'proj-002',
    client: 'Tập đoàn BĐS XYZ',
    value: 120000000000,
    deadline: '2024-03-20',
    status: 'negotiating',
    owner: 'Trần Thị Bình',
    priority: 'high',
    documents: 22,
    createdAt: '2024-02-01'
  },
  {
    id: 'tender-003',
    code: 'GT-2024-003',
    name: 'Gói thầu MEP Nhà máy DEF',
    client: 'DEF Manufacturing',
    value: 25000000000,
    deadline: '2024-04-10',
    status: 'submitted',
    owner: 'Lê Minh Cường',
    priority: 'medium',
    documents: 18,
    createdAt: '2024-03-01'
  },
  {
    id: 'tender-004',
    code: 'GT-2024-004',
    name: 'Gói thầu Hoàn thiện Mega Mall',
    projectId: 'proj-004',
    client: 'Retail Corp Vietnam',
    value: 45000000000,
    deadline: '2024-05-01',
    status: 'preparation',
    owner: 'Phạm Hoàng Dũng',
    priority: 'high',
    documents: 8,
    createdAt: '2024-03-15'
  },
  {
    id: 'tender-005',
    code: 'GT-2024-005',
    name: 'Gói thầu XD Kết cấu cầu vượt',
    projectId: 'proj-005',
    client: 'Sở GTVT TP.HCM',
    value: 150000000000,
    deadline: '2024-06-30',
    status: 'lead',
    owner: 'Võ Thành Đạt',
    priority: 'medium',
    documents: 3,
    createdAt: '2024-04-01'
  },
  {
    id: 'tender-006',
    code: 'GT-2024-006',
    name: 'Gói thầu Thiết bị y tế Bệnh viện',
    projectId: 'proj-006',
    client: 'Healthcare Group',
    value: 80000000000,
    deadline: '2024-07-15',
    status: 'lead',
    owner: 'Nguyễn Thị Hương',
    priority: 'low',
    documents: 2,
    createdAt: '2024-04-10'
  },
  {
    id: 'tender-007',
    code: 'GT-2024-007',
    name: 'Gói thầu XD Nhà xưởng logistics',
    client: 'VN Logistics',
    value: 65000000000,
    deadline: '2024-03-30',
    status: 'lost',
    owner: 'Trần Văn Hùng',
    priority: 'medium',
    documents: 20,
    createdAt: '2024-02-15'
  }
];

// Mock Contracts
export const mockContracts: Contract[] = [
  {
    id: 'contract-001',
    code: 'HD-2024-001',
    name: 'Hợp đồng XD ABC Tower - Phần thân',
    projectId: 'proj-001',
    type: 'main',
    value: 85000000000,
    signedDate: '2024-02-20',
    startDate: '2024-02-25',
    endDate: '2025-02-24',
    status: 'active',
    client: 'Công ty CP Đầu tư ABC',
    paymentTerms: 'Thanh toán theo tiến độ, 30 ngày sau nghiệm thu'
  },
  {
    id: 'contract-002',
    code: 'HD-2024-002',
    name: 'Hợp đồng NTP Cung cấp thép ABC Tower',
    projectId: 'proj-001',
    type: 'supply',
    value: 15000000000,
    signedDate: '2024-02-28',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    status: 'active',
    client: 'Thép Việt Nhật',
    paymentTerms: 'Thanh toán 50% đặt cọc, 50% khi giao hàng'
  },
  {
    id: 'contract-003',
    code: 'HD-2024-003',
    name: 'Hợp đồng NTP Thi công MEP',
    projectId: 'proj-001',
    type: 'subcontract',
    value: 12000000000,
    signedDate: '2024-03-10',
    startDate: '2024-04-01',
    endDate: '2024-12-31',
    status: 'active',
    client: 'MEP Solutions',
    paymentTerms: 'Thanh toán theo tiến độ hàng tháng'
  },
  {
    id: 'contract-004',
    code: 'HD-2023-045',
    name: 'Hợp đồng XD Mega Mall - Phần hoàn thiện',
    projectId: 'proj-004',
    type: 'main',
    value: 75000000000,
    signedDate: '2023-08-15',
    startDate: '2023-09-01',
    endDate: '2024-12-31',
    status: 'active',
    client: 'Retail Corp Vietnam',
    paymentTerms: 'Thanh toán theo milestone'
  },
  {
    id: 'contract-005',
    code: 'HD-2024-004',
    name: 'Hợp đồng Tư vấn thiết kế Bệnh viện',
    projectId: 'proj-006',
    type: 'service',
    value: 8000000000,
    startDate: '2024-05-20',
    endDate: '2024-11-20',
    status: 'legal-review',
    client: 'Healthcare Group',
    paymentTerms: 'Thanh toán theo giai đoạn thiết kế'
  }
];

// Mock Payment Requests
export const mockPaymentRequests: PaymentRequest[] = [
  {
    id: 'pr-001',
    code: 'DNTT-2024-001',
    projectId: 'proj-001',
    projectName: 'ABC Tower',
    vendor: 'Thép Việt Nhật',
    amount: 5000000000,
    dueDate: '2024-04-15',
    status: 'approved' as const,
    description: 'Thanh toán đợt 2 - Cung cấp thép cột tầng 5-10',
    createdBy: 'Nguyễn Văn An',
    createdAt: '2024-04-01'
  },
  {
    id: 'pr-002',
    code: 'DNTT-2024-002',
    projectId: 'proj-001',
    projectName: 'ABC Tower',
    vendor: 'Bê tông Hòa Bình',
    amount: 2500000000,
    dueDate: '2024-04-20',
    status: 'pending' as const,
    description: 'Thanh toán bê tông tháng 3/2024',
    createdBy: 'Nguyễn Văn An',
    createdAt: '2024-04-05'
  },
  {
    id: 'pr-003',
    code: 'DNTT-2024-003',
    projectId: 'proj-004',
    projectName: 'Mega Mall',
    vendor: 'Nội thất ABC',
    amount: 8500000000,
    dueDate: '2024-04-25',
    status: 'submitted' as const,
    description: 'Thanh toán đợt 1 - Cung cấp nội thất khu Food Court',
    createdBy: 'Phạm Hoàng Dũng',
    createdAt: '2024-04-08'
  },
  {
    id: 'pr-004',
    code: 'DNTT-2024-004',
    projectId: 'proj-003',
    projectName: 'Nhà máy DEF',
    vendor: 'MEP Solutions',
    amount: 3200000000,
    dueDate: '2024-04-30',
    status: 'draft' as const,
    description: 'Tạm ứng thi công hệ thống PCCC',
    createdBy: 'Lê Minh Cường',
    createdAt: '2024-04-10'
  },
  {
    id: 'pr-005',
    code: 'DNTT-2024-005',
    projectId: 'proj-002',
    projectName: 'Green Valley',
    vendor: 'Công ty San lấp ABC',
    amount: 12000000000,
    dueDate: '2024-05-05',
    status: 'pending' as const,
    description: 'Nghiệm thu đợt 1 - San lấp mặt bằng khu A',
    createdBy: 'Trần Thị Bình',
    createdAt: '2024-04-12'
  }
];

// Mock Employees
export const mockEmployees: Employee[] = [
  {
    id: 'emp-001',
    code: 'NV-001',
    name: 'Nguyễn Văn An',
    email: 'an.nguyen@company.vn',
    department: 'QLDA',
    position: 'Giám đốc dự án',
    phone: '0901234567',
    status: 'active',
    joinDate: '2018-03-15'
  },
  {
    id: 'emp-002',
    code: 'NV-002',
    name: 'Trần Thị Bình',
    email: 'binh.tran@company.vn',
    department: 'QLDA',
    position: 'Phó Giám đốc dự án',
    phone: '0902345678',
    status: 'active',
    joinDate: '2019-06-01'
  },
  {
    id: 'emp-003',
    code: 'NV-003',
    name: 'Lê Minh Cường',
    email: 'cuong.le@company.vn',
    department: 'Kỹ thuật',
    position: 'Kỹ sư trưởng',
    phone: '0903456789',
    status: 'active',
    joinDate: '2017-01-10'
  },
  {
    id: 'emp-004',
    code: 'NV-004',
    name: 'Phạm Hoàng Dũng',
    email: 'dung.pham@company.vn',
    department: 'QLDA',
    position: 'Giám đốc dự án',
    phone: '0904567890',
    status: 'active',
    joinDate: '2016-08-20'
  },
  {
    id: 'emp-005',
    code: 'NV-005',
    name: 'Võ Thành Đạt',
    email: 'dat.vo@company.vn',
    department: 'Thi công',
    position: 'Chỉ huy trưởng công trường',
    phone: '0905678901',
    status: 'active',
    joinDate: '2015-11-05'
  },
  {
    id: 'emp-006',
    code: 'NV-006',
    name: 'Nguyễn Thị Hương',
    email: 'huong.nguyen@company.vn',
    department: 'Pháp chế',
    position: 'Trưởng phòng Pháp chế',
    phone: '0906789012',
    status: 'active',
    joinDate: '2018-09-12'
  },
  {
    id: 'emp-007',
    code: 'NV-007',
    name: 'Trần Văn Hùng',
    email: 'hung.tran@company.vn',
    department: 'Đấu thầu',
    position: 'Chuyên viên đấu thầu',
    phone: '0907890123',
    status: 'on-leave',
    joinDate: '2020-02-01'
  },
  {
    id: 'emp-008',
    code: 'NV-008',
    name: 'Lê Thị Mai',
    email: 'mai.le@company.vn',
    department: 'Tài chính',
    position: 'Kế toán trưởng',
    phone: '0908901234',
    status: 'active',
    joinDate: '2014-04-18'
  }
];

// Mock Design Requests
export const mockDesignRequests: DesignRequest[] = [
  {
    id: 'dr-001',
    code: 'YCTK-2024-001',
    projectId: 'proj-001',
    projectName: 'ABC Tower',
    title: 'Thiết kế chi tiết sảnh lobby tầng 1',
    priority: 'high',
    dueDate: '2024-04-20',
    status: 'in-progress',
    assignee: 'Lê Minh Cường',
    createdAt: '2024-04-01'
  },
  {
    id: 'dr-002',
    code: 'YCTK-2024-002',
    projectId: 'proj-001',
    projectName: 'ABC Tower',
    title: 'Bản vẽ shop drawing kết cấu tầng 12-15',
    priority: 'urgent',
    dueDate: '2024-04-15',
    status: 'review',
    assignee: 'Nguyễn Văn An',
    createdAt: '2024-04-02'
  },
  {
    id: 'dr-003',
    code: 'YCTK-2024-003',
    projectId: 'proj-006',
    projectName: 'Bệnh viện Đa khoa',
    title: 'Thiết kế sơ bộ khu phòng mổ',
    priority: 'high',
    dueDate: '2024-05-01',
    status: 'new',
    assignee: 'Nguyễn Thị Hương',
    createdAt: '2024-04-10'
  },
  {
    id: 'dr-004',
    code: 'YCTK-2024-004',
    projectId: 'proj-004',
    projectName: 'Mega Mall',
    title: 'Bản vẽ hoàn công khu vực Food Court',
    priority: 'medium',
    dueDate: '2024-04-30',
    status: 'approved',
    assignee: 'Phạm Hoàng Dũng',
    createdAt: '2024-04-05'
  }
];

// Mock Work Packages
export const mockWorkPackages: WorkPackage[] = [
  {
    id: 'wp-001',
    wbsCode: '1.1',
    name: 'Công tác móng',
    projectId: 'proj-001',
    owner: 'Võ Thành Đạt',
    plannedStart: '2024-02-25',
    plannedEnd: '2024-04-30',
    actualStart: '2024-02-25',
    actualEnd: '2024-04-25',
    progress: 100,
    status: 'accepted'
  },
  {
    id: 'wp-002',
    wbsCode: '1.2',
    name: 'Công tác kết cấu thân',
    projectId: 'proj-001',
    owner: 'Võ Thành Đạt',
    plannedStart: '2024-04-01',
    plannedEnd: '2024-10-31',
    actualStart: '2024-04-01',
    progress: 55,
    status: 'in-progress',
    parentId: 'wp-001'
  },
  {
    id: 'wp-003',
    wbsCode: '1.2.1',
    name: 'Thi công cột tầng 1-10',
    projectId: 'proj-001',
    owner: 'Nguyễn Văn An',
    plannedStart: '2024-04-01',
    plannedEnd: '2024-06-30',
    actualStart: '2024-04-01',
    progress: 80,
    status: 'pending-inspection',
    parentId: 'wp-002'
  },
  {
    id: 'wp-004',
    wbsCode: '1.2.2',
    name: 'Thi công cột tầng 11-20',
    projectId: 'proj-001',
    owner: 'Nguyễn Văn An',
    plannedStart: '2024-06-01',
    plannedEnd: '2024-08-31',
    actualStart: '2024-06-05',
    progress: 30,
    status: 'in-progress',
    parentId: 'wp-002'
  },
  {
    id: 'wp-005',
    wbsCode: '1.3',
    name: 'Công tác hoàn thiện',
    projectId: 'proj-001',
    owner: 'Phạm Hoàng Dũng',
    plannedStart: '2024-08-01',
    plannedEnd: '2025-02-28',
    progress: 0,
    status: 'not-started',
    parentId: 'wp-001'
  }
];

// Mock Approvals
export const mockApprovals: Approval[] = [
  {
    id: 'appr-001',
    type: 'payment',
    itemId: 'pr-002',
    itemCode: 'DNTT-2024-002',
    itemName: 'Thanh toán bê tông Hòa Bình',
    requestedBy: 'Nguyễn Văn An',
    requestedAt: '2024-04-05',
    status: 'pending',
    amount: 2500000000
  },
  {
    id: 'appr-002',
    type: 'payment',
    itemId: 'pr-005',
    itemCode: 'DNTT-2024-005',
    itemName: 'Nghiệm thu san lấp Green Valley',
    requestedBy: 'Trần Thị Bình',
    requestedAt: '2024-04-12',
    status: 'pending',
    amount: 12000000000
  },
  {
    id: 'appr-003',
    type: 'contract',
    itemId: 'contract-005',
    itemCode: 'HD-2024-004',
    itemName: 'HĐ Tư vấn thiết kế Bệnh viện',
    requestedBy: 'Nguyễn Thị Hương',
    requestedAt: '2024-04-10',
    status: 'pending',
    amount: 8000000000
  },
  {
    id: 'appr-004',
    type: 'tender',
    itemId: 'tender-004',
    itemCode: 'GT-2024-004',
    itemName: 'Gói thầu Hoàn thiện Mega Mall',
    requestedBy: 'Phạm Hoàng Dũng',
    requestedAt: '2024-03-15',
    status: 'pending',
    amount: 45000000000
  },
  {
    id: 'appr-005',
    type: 'design',
    itemId: 'dr-002',
    itemCode: 'YCTK-2024-002',
    itemName: 'Shop drawing kết cấu tầng 12-15',
    requestedBy: 'Lê Minh Cường',
    requestedAt: '2024-04-08',
    status: 'pending'
  }
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: 'act-001',
    userId: 'emp-001',
    userName: 'Nguyễn Văn An',
    action: 'đã tạo đề nghị thanh toán',
    target: 'DNTT-2024-002',
    targetType: 'payment-request',
    timestamp: '2024-04-05T09:30:00'
  },
  {
    id: 'act-002',
    userId: 'emp-006',
    userName: 'Nguyễn Thị Hương',
    action: 'đã cập nhật trạng thái',
    target: 'GT-2024-002',
    targetType: 'tender',
    timestamp: '2024-04-05T10:15:00'
  },
  {
    id: 'act-003',
    userId: 'emp-003',
    userName: 'Lê Minh Cường',
    action: 'đã upload bản vẽ v2',
    target: 'YCTK-2024-002',
    targetType: 'design-request',
    timestamp: '2024-04-05T11:00:00'
  },
  {
    id: 'act-004',
    userId: 'emp-004',
    userName: 'Phạm Hoàng Dũng',
    action: 'đã phê duyệt',
    target: 'DNTT-2024-001',
    targetType: 'payment-request',
    timestamp: '2024-04-05T14:20:00'
  },
  {
    id: 'act-005',
    userId: 'emp-005',
    userName: 'Võ Thành Đạt',
    action: 'đã yêu cầu nghiệm thu',
    target: 'WP-1.2.1',
    targetType: 'work-package',
    timestamp: '2024-04-05T15:45:00'
  }
];

// Format currency
export const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} tỷ`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)} triệu`;
  }
  return value.toLocaleString('vi-VN') + ' đ';
};

// Format currency full
export const formatCurrencyFull = (value: number): string => {
  return value.toLocaleString('vi-VN') + ' VNĐ';
};

// Get status label
export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    // Project
    'planning': 'Lập kế hoạch',
    'active': 'Đang thực hiện',
    'on-hold': 'Tạm dừng',
    'completed': 'Hoàn thành',
    'cancelled': 'Đã hủy',
    // Tender
    'lead': 'Tiềm năng',
    'preparation': 'Chuẩn bị',
    'submitted': 'Đã nộp',
    'negotiating': 'Thương thảo',
    'won': 'Trúng thầu',
    'lost': 'Trượt thầu',
    // Contract
    'draft': 'Bản thảo',
    'legal-review': 'Pháp chế duyệt',
    'approved': 'Đã duyệt',
    'signed': 'Đã ký',
    'closed': 'Đã đóng',
    // Payment
    'pending': 'Chờ duyệt',
    'paid': 'Đã thanh toán',
    'reconciled': 'Đã đối chiếu',
    'rejected': 'Từ chối',
    // Employee
    'on-leave': 'Nghỉ phép',
    'offboarded': 'Đã nghỉ việc',
    // Design
    'new': 'Mới',
    'in-progress': 'Đang thực hiện',
    'review': 'Đang xem xét',
    'released': 'Đã phát hành',
    // Work Package
    'not-started': 'Chưa bắt đầu',
    'pending-inspection': 'Chờ nghiệm thu',
    'accepted': 'Đã nghiệm thu'
  };
  return labels[status] || status;
};
