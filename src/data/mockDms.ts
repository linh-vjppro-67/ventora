export type DmsFileStatus = 'draft' | 'review' | 'approved' | 'issued';

export type DmsFolder = {
  id: string;
  name: string;
  parentId?: string;
};

export type DmsFile = {
  id: string;
  folderId: string;
  name: string;
  ext: 'PDF' | 'DWG' | 'XLSX' | 'DOCX' | 'JPG';
  version: string; // e.g. v1, v2
  status: DmsFileStatus;
  lastUpdated: string;
  reviewer: string;
  tags?: string[];
  description?: string;
  versions: Array<{
    version: string;
    status: DmsFileStatus;
    updatedAt: string;
    reviewer: string;
    note?: string;
  }>;
};

export const mockDmsFolders: DmsFolder[] = [
  { id: 'root', name: 'Tài liệu' },
  { id: 'proj', name: 'Dự án', parentId: 'root' },
  { id: 'contract', name: 'Hợp đồng & pháp lý', parentId: 'root' },
  { id: 'eng', name: 'Thiết kế / Shopdrawing', parentId: 'proj' },
  { id: 'method', name: 'Biện pháp thi công', parentId: 'proj' },
  { id: 'qaqc', name: 'QAQC / Nghiệm thu', parentId: 'proj' },
  { id: 'minutes', name: 'Biên bản / MoM', parentId: 'proj' },
  { id: 'misc', name: 'Khác', parentId: 'root' },
];

export const mockDmsFiles: DmsFile[] = [
  {
    id: 'F-001',
    folderId: 'method',
    name: 'Biện pháp thi công - Kết cấu tầng 3',
    ext: 'PDF',
    version: 'v2',
    status: 'approved',
    lastUpdated: '2026-01-28',
    reviewer: 'QAQC - Trang',
    tags: ['construction', 'method'],
    description: 'Tài liệu biện pháp thi công (mock).',
    versions: [
      { version: 'v1', status: 'review', updatedAt: '2026-01-20', reviewer: 'QAQC - Trang', note: 'Bổ sung biện pháp an toàn' },
      { version: 'v2', status: 'approved', updatedAt: '2026-01-28', reviewer: 'QAQC - Trang', note: 'OK phát hành nội bộ' },
    ],
  },
  {
    id: 'F-002',
    folderId: 'eng',
    name: 'Shopdrawing MEP - Tầng 3',
    ext: 'DWG',
    version: 'v3',
    status: 'review',
    lastUpdated: '2026-01-31',
    reviewer: 'Kỹ sư - Sơn',
    tags: ['mep', 'shopdrawing'],
    description: 'Bản vẽ shopdrawing MEP (mock).',
    versions: [
      { version: 'v1', status: 'draft', updatedAt: '2026-01-18', reviewer: 'Kỹ sư - Sơn' },
      { version: 'v2', status: 'review', updatedAt: '2026-01-24', reviewer: 'Kỹ sư - Sơn', note: 'Cập nhật tuyến ống' },
      { version: 'v3', status: 'review', updatedAt: '2026-01-31', reviewer: 'Kỹ sư - Sơn', note: 'Chờ phê duyệt' },
    ],
  },
  {
    id: 'F-003',
    folderId: 'qaqc',
    name: 'Checklist nghiệm thu MEP - Tầng 3',
    ext: 'XLSX',
    version: 'v1',
    status: 'issued',
    lastUpdated: '2026-01-25',
    reviewer: 'QAQC - Trang',
    tags: ['inspection'],
    description: 'Checklist nghiệm thu (mock).',
    versions: [{ version: 'v1', status: 'issued', updatedAt: '2026-01-25', reviewer: 'QAQC - Trang', note: 'Đã phát hành' }],
  },
  {
    id: 'F-004',
    folderId: 'minutes',
    name: 'MoM - Họp tiến độ tuần 05',
    ext: 'DOCX',
    version: 'v1',
    status: 'approved',
    lastUpdated: '2026-01-29',
    reviewer: 'PM - Minh',
    tags: ['mom'],
    description: 'Biên bản họp tiến độ (mock).',
    versions: [{ version: 'v1', status: 'approved', updatedAt: '2026-01-29', reviewer: 'PM - Minh', note: 'Đã chốt nội dung' }],
  },
  {
    id: 'F-005',
    folderId: 'contract',
    name: 'Hợp đồng thầu phụ - An Phát',
    ext: 'PDF',
    version: 'v1',
    status: 'approved',
    lastUpdated: '2026-01-15',
    reviewer: 'Legal - Huy',
    tags: ['contract'],
    description: 'Hợp đồng thầu phụ (mock).',
    versions: [{ version: 'v1', status: 'approved', updatedAt: '2026-01-15', reviewer: 'Legal - Huy', note: 'Đã ký' }],
  },
  {
    id: 'F-006',
    folderId: 'misc',
    name: 'Ảnh hiện trường - ngày 31/01',
    ext: 'JPG',
    version: 'v1',
    status: 'issued',
    lastUpdated: '2026-01-31',
    reviewer: 'Site - Tài',
    tags: ['site'],
    description: 'Ảnh hiện trường (mock).',
    versions: [{ version: 'v1', status: 'issued', updatedAt: '2026-01-31', reviewer: 'Site - Tài' }],
  },
];

export function statusLabel(s: DmsFileStatus) {
  switch (s) {
    case 'draft':
      return 'Draft';
    case 'review':
      return 'Review';
    case 'approved':
      return 'Approved';
    case 'issued':
      return 'Issued';
    default:
      return s;
  }
}
