import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Download, Upload, Plus, Trash2, Pencil, RefreshCcw, ShieldCheck, Link2, Unlink, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type UserStatus = 'Active' | 'On leave' | 'Offboarded';
type RoleKey = 'BOD' | 'Legal' | 'Finance' | 'HR' | 'Engineering' | 'PMO' | 'DMS' | 'System';

interface UserRow {
  id: string;
  name: string;
  email: string;
  department: string;
  role: RoleKey;
  status: UserStatus;
  lastLogin: string;
}

interface RoleDef {
  key: RoleKey;
  name: string;
  description: string;
}

type PermissionKey =
  | 'read'
  | 'create'
  | 'update'
  | 'approve'
  | 'export';

type ModuleKey =
  | 'BOD'
  | 'Legal & Bidding'
  | 'Finance'
  | 'HR-Admin'
  | 'Engineering'
  | 'PMO/Construction'
  | 'DMS'
  | 'System';

interface PermissionMatrix {
  [role: string]: {
    [module: string]: Record<PermissionKey, boolean>;
  };
}

interface ApprovalStep {
  id: string;
  title: string;
  approverRole: RoleKey;
  slaHours: number;
}

interface ApprovalFlow {
  id: string;
  name: string;
  appliesTo: string; // e.g. Payment Requests
  steps: ApprovalStep[];
  isEnabled: boolean;
}

interface AuditLogRow {
  id: string;
  at: string;
  actor: string;
  action: string;
  resource: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

const LS_KEY = 'ventora.settings.v1';

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function downloadTextFile(filename: string, contents: string) {
  const blob = new Blob([contents], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function badgeForStatus(s: UserStatus) {
  switch (s) {
    case 'Active':
      return <Badge>Active</Badge>;
    case 'On leave':
      return <Badge variant="secondary">On leave</Badge>;
    case 'Offboarded':
      return <Badge variant="outline">Offboarded</Badge>;
  }
}

function badgeForSeverity(s: AuditLogRow['severity']) {
  switch (s) {
    case 'Info':
      return <Badge variant="secondary">Info</Badge>;
    case 'Warning':
      return <Badge variant="outline">Warning</Badge>;
    case 'Critical':
      return <Badge variant="destructive">Critical</Badge>;
  }
}

const MODULES: ModuleKey[] = [
  'BOD',
  'Legal & Bidding',
  'Finance',
  'HR-Admin',
  'Engineering',
  'PMO/Construction',
  'DMS',
  'System',
];

const PERMS: PermissionKey[] = ['read', 'create', 'update', 'approve', 'export'];

const ROLES: RoleDef[] = [
  { key: 'BOD', name: 'BOD', description: 'Xem dashboard & approvals ở mức tổng quan.' },
  { key: 'Legal', name: 'Legal & Bidding', description: 'Hồ sơ thầu, hợp đồng, mẫu biểu pháp lý.' },
  { key: 'Finance', name: 'Finance', description: 'Payment requests, ngân sách, chứng từ.' },
  { key: 'HR', name: 'HR-Admin', description: 'Nhân sự, chấm công, onboarding, chính sách.' },
  { key: 'Engineering', name: 'Engineering', description: 'Design requests, drawings, submittals, RFI.' },
  { key: 'PMO', name: 'PMO/Construction', description: 'Projects, WBS, QAQC, nhật ký công trình.' },
  { key: 'DMS', name: 'DMS', description: 'Thư viện tài liệu, versioning, metadata.' },
  { key: 'System', name: 'System Admin', description: 'Quản trị hệ thống, phân quyền, tích hợp, audit log.' },
];

function defaultState() {
  const users: UserRow[] = [
    {
      id: uid('usr'),
      name: 'Nguyễn Minh An',
      email: 'an.nguyen@ventora.vn',
      department: 'Finance',
      role: 'Finance',
      status: 'Active',
      lastLogin: '2026-02-01 09:12',
    },
    {
      id: uid('usr'),
      name: 'Trần Thảo Vy',
      email: 'vy.tran@ventora.vn',
      department: 'HR-Admin',
      role: 'HR',
      status: 'Active',
      lastLogin: '2026-01-31 17:40',
    },
    {
      id: uid('usr'),
      name: 'Lê Quốc Huy',
      email: 'huy.le@ventora.vn',
      department: 'Engineering',
      role: 'Engineering',
      status: 'On leave',
      lastLogin: '2026-01-25 08:33',
    },
    {
      id: uid('usr'),
      name: 'Phạm Gia Bảo',
      email: 'bao.pham@ventora.vn',
      department: 'Legal & Bidding',
      role: 'Legal',
      status: 'Active',
      lastLogin: '2026-02-01 10:05',
    },
    {
      id: uid('usr'),
      name: 'BOD Demo',
      email: 'bod@ventora.vn',
      department: 'BOD',
      role: 'BOD',
      status: 'Active',
      lastLogin: '2026-02-01 07:01',
    },
  ];

  const matrix: PermissionMatrix = {};
  for (const r of ROLES) {
    matrix[r.key] = {};
    for (const m of MODULES) {
      // Reasonable defaults
      const isSys = r.key === 'System';
      const isBod = r.key === 'BOD';
      const baseRead = isSys || isBod || m === 'DMS' ? true : true;
      const canApprove = isSys || isBod || ['Legal', 'Finance', 'HR', 'Engineering', 'PMO'].includes(r.key);
      matrix[r.key][m] = {
        read: baseRead,
        create: isSys || (!isBod && m !== 'System'),
        update: isSys || (!isBod && m !== 'System'),
        approve: isSys || (canApprove && (m !== 'System')),
        export: isSys || isBod || m === 'Finance',
      };
    }
    // Tighten BOD
    matrix['BOD']['System'] = { read: true, create: false, update: false, approve: true, export: true };
    matrix['BOD']['Finance'] = { read: true, create: false, update: false, approve: true, export: true };
  }

  const flows: ApprovalFlow[] = [
    {
      id: uid('flow'),
      name: 'Finance / Payment Request',
      appliesTo: 'Payment Requests',
      isEnabled: true,
      steps: [
        { id: uid('step'), title: 'Kiểm tra chứng từ', approverRole: 'Finance', slaHours: 8 },
        { id: uid('step'), title: 'Phê duyệt trưởng phòng', approverRole: 'Finance', slaHours: 12 },
        { id: uid('step'), title: 'BOD phê duyệt cuối', approverRole: 'BOD', slaHours: 24 },
      ],
    },
    {
      id: uid('flow'),
      name: 'Legal / Contract Approval',
      appliesTo: 'Contracts',
      isEnabled: true,
      steps: [
        { id: uid('step'), title: 'Soát xét pháp lý', approverRole: 'Legal', slaHours: 12 },
        { id: uid('step'), title: 'BOD phê duyệt', approverRole: 'BOD', slaHours: 24 },
      ],
    },
  ];

  const audit: AuditLogRow[] = [
    { id: uid('log'), at: '2026-02-01 10:15', actor: 'bao.pham@ventora.vn', action: 'APPROVE', resource: 'PaymentRequest PR-00041', severity: 'Info' },
    { id: uid('log'), at: '2026-02-01 09:02', actor: 'system', action: 'ROLE_UPDATE', resource: 'Role Finance permissions', severity: 'Warning' },
    { id: uid('log'), at: '2026-01-31 16:44', actor: 'vy.tran@ventora.vn', action: 'CREATE', resource: 'Employee E-00291', severity: 'Info' },
    { id: uid('log'), at: '2026-01-30 11:21', actor: 'system', action: 'LOGIN_FAIL', resource: 'an.nguyen@ventora.vn', severity: 'Critical' },
  ];

  return {
    general: {
      companyName: 'Ventora Construction',
      brandColor: 'Blue',
      timeZone: 'Asia/Ho_Chi_Minh',
      strictApproval: true,
      maintenanceMode: false,
      supportEmail: 'support@ventora.vn',
      announcement: 'Bảo trì định kỳ: Chủ nhật 02:00–03:00.',
    },
    integrations: {
      emailEnabled: true,
      storageEnabled: true,
      ssoEnabled: false,
      emailProvider: 'SMTP',
      storageProvider: 'S3 Compatible',
      ssoProvider: 'OIDC',
      connected: {
        email: true,
        storage: false,
        sso: false,
      },
    },
    users,
    roles: ROLES,
    matrix,
    flows,
    audit,
  };
}

export default function SettingsHome() {
  const { toast } = useToast();

  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultState();
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const [activeTab, setActiveTab] = useState('general');

  // ============ General ============
  const general = state.general;

  const onSaveGeneral = () => {
    toast({ title: 'Đã lưu cấu hình hệ thống', description: 'Thiết lập chung đã được lưu (mock/localStorage).' });
    setState((s: any) => ({
      ...s,
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'SETTINGS_SAVE', resource: 'General Settings', severity: 'Info' },
        ...s.audit,
      ],
    }));
  };

  // ============ Users ============
  const [userQuery, setUserQuery] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return state.users as UserRow[];
    return (state.users as UserRow[]).filter((u) =>
      [u.name, u.email, u.department, u.role, u.status].some((x) => String(x).toLowerCase().includes(q))
    );
  }, [state.users, userQuery]);

  const openAddUser = () => {
    setEditingUser({
      id: uid('usr'),
      name: '',
      email: '',
      department: 'PMO/Construction',
      role: 'PMO',
      status: 'Active',
      lastLogin: '—',
    });
    setUserDialogOpen(true);
  };

  const openEditUser = (u: UserRow) => {
    setEditingUser({ ...u });
    setUserDialogOpen(true);
  };

  const saveUser = () => {
    if (!editingUser) return;
    if (!editingUser.name.trim() || !editingUser.email.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập Tên và Email.', variant: 'destructive' });
      return;
    }
    setState((s: any) => {
      const exists = (s.users as UserRow[]).some((x) => x.id === editingUser.id);
      const nextUsers = exists
        ? (s.users as UserRow[]).map((x) => (x.id === editingUser.id ? editingUser : x))
        : [editingUser, ...(s.users as UserRow[])];

      return {
        ...s,
        users: nextUsers,
        audit: [
          { id: uid('log'), at: nowStr(), actor: 'system', action: exists ? 'UPDATE' : 'CREATE', resource: `User ${editingUser.email}`, severity: 'Info' },
          ...s.audit,
        ],
      };
    });
    toast({ title: 'Đã lưu người dùng', description: 'Danh sách người dùng đã được cập nhật.' });
    setUserDialogOpen(false);
    setEditingUser(null);
  };

  const toggleUserStatus = (u: UserRow) => {
    const next: UserStatus = u.status === 'Active' ? 'Offboarded' : 'Active';
    setState((s: any) => ({
      ...s,
      users: (s.users as UserRow[]).map((x) => (x.id === u.id ? { ...x, status: next } : x)),
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'STATUS_CHANGE', resource: `User ${u.email} -> ${next}`, severity: 'Warning' },
        ...s.audit,
      ],
    }));
    toast({ title: 'Đã cập nhật trạng thái', description: `${u.email} → ${next}` });
  };

  const resetPassword = (u: UserRow) => {
    toast({ title: 'Reset password (mock)', description: `Đã gửi link đặt lại mật khẩu đến ${u.email}.` });
    setState((s: any) => ({
      ...s,
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'RESET_PASSWORD', resource: `User ${u.email}`, severity: 'Info' },
        ...s.audit,
      ],
    }));
  };

  // ============ Roles & Permissions ============
  const matrix: PermissionMatrix = state.matrix;

  const updatePermission = (role: RoleKey, module: ModuleKey, perm: PermissionKey, value: boolean) => {
    setState((s: any) => ({
      ...s,
      matrix: {
        ...s.matrix,
        [role]: {
          ...s.matrix[role],
          [module]: {
            ...s.matrix[role][module],
            [perm]: value,
          },
        },
      },
    }));
  };

  const savePermissions = () => {
    toast({ title: 'Đã lưu phân quyền', description: 'Permission matrix đã được lưu (mock).' });
    setState((s: any) => ({
      ...s,
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'ROLE_UPDATE', resource: 'Permissions matrix', severity: 'Warning' },
        ...s.audit,
      ],
    }));
  };

  // ============ Approvals / Workflow ============
  const flows: ApprovalFlow[] = state.flows;

  const toggleFlow = (id: string, value: boolean) => {
    setState((s: any) => ({
      ...s,
      flows: (s.flows as ApprovalFlow[]).map((f) => (f.id === id ? { ...f, isEnabled: value } : f)),
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'FLOW_TOGGLE', resource: `Flow ${id} -> ${value}`, severity: 'Info' },
        ...s.audit,
      ],
    }));
  };

  const addFlowStep = (flowId: string) => {
    setState((s: any) => ({
      ...s,
      flows: (s.flows as ApprovalFlow[]).map((f) =>
        f.id === flowId
          ? {
              ...f,
              steps: [
                ...f.steps,
                { id: uid('step'), title: 'Bước mới', approverRole: 'Finance', slaHours: 8 },
              ],
            }
          : f
      ),
    }));
  };

  const removeFlowStep = (flowId: string, stepId: string) => {
    setState((s: any) => ({
      ...s,
      flows: (s.flows as ApprovalFlow[]).map((f) =>
        f.id === flowId
          ? { ...f, steps: f.steps.filter((x) => x.id !== stepId) }
          : f
      ),
    }));
  };

  const updateFlowStep = (flowId: string, stepId: string, patch: Partial<ApprovalStep>) => {
    setState((s: any) => ({
      ...s,
      flows: (s.flows as ApprovalFlow[]).map((f) =>
        f.id === flowId
          ? {
              ...f,
              steps: f.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)),
            }
          : f
      ),
    }));
  };

  const saveFlows = () => {
    toast({ title: 'Đã lưu workflow', description: 'Luồng phê duyệt đã được cập nhật (mock).' });
    setState((s: any) => ({
      ...s,
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'FLOW_SAVE', resource: 'Approval flows', severity: 'Info' },
        ...s.audit,
      ],
    }));
  };

  // ============ Integrations ============
  const integrations = state.integrations;

  const connect = (key: 'email' | 'storage' | 'sso') => {
    setState((s: any) => ({
      ...s,
      integrations: {
        ...s.integrations,
        connected: {
          ...s.integrations.connected,
          [key]: true,
        },
      },
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'INTEGRATION_CONNECT', resource: `Integration ${key}`, severity: 'Info' },
        ...s.audit,
      ],
    }));
    toast({ title: 'Connected (mock)', description: `Đã kết nối ${key.toUpperCase()} (mock).` });
  };

  const disconnect = (key: 'email' | 'storage' | 'sso') => {
    setState((s: any) => ({
      ...s,
      integrations: {
        ...s.integrations,
        connected: {
          ...s.integrations.connected,
          [key]: false,
        },
      },
      audit: [
        { id: uid('log'), at: nowStr(), actor: 'system', action: 'INTEGRATION_DISCONNECT', resource: `Integration ${key}`, severity: 'Warning' },
        ...s.audit,
      ],
    }));
    toast({ title: 'Disconnected (mock)', description: `Đã ngắt kết nối ${key.toUpperCase()} (mock).` });
  };

  // ============ Audit ============
  const [auditQuery, setAuditQuery] = useState('');
  const auditFiltered = useMemo(() => {
    const q = auditQuery.trim().toLowerCase();
    if (!q) return state.audit as AuditLogRow[];
    return (state.audit as AuditLogRow[]).filter((r) =>
      [r.at, r.actor, r.action, r.resource, r.severity].some((x) => String(x).toLowerCase().includes(q))
    );
  }, [state.audit, auditQuery]);

  const exportSettings = () => {
    downloadTextFile(`ventora-settings-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2));
    toast({ title: 'Đã export', description: 'Đã tải file cấu hình (mock) xuống máy.' });
  };

  const importSettings = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setState(parsed);
      toast({ title: 'Đã import', description: 'Đã nạp cấu hình từ file (mock).' });
    } catch (e) {
      toast({ title: 'Import lỗi', description: 'File không hợp lệ hoặc không đúng định dạng JSON.', variant: 'destructive' });
    }
  };

  const resetToDefault = () => {
    setState(defaultState());
    toast({ title: 'Đã reset', description: 'Đã đưa cấu hình về mặc định (mock).' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hệ thống</h1>
          <p className="text-muted-foreground">
            Quản trị cấu hình, người dùng, phân quyền, workflow, tích hợp và audit log (mock UI).
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importSettings(f);
                e.currentTarget.value = '';
              }}
            />
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import JSON
              </span>
            </Button>
          </label>
          <Button variant="destructive" onClick={resetToDefault}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="workflow">Approval Workflow</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình chung</CardTitle>
              <CardDescription>
                Thiết lập cấp hệ thống (lưu localStorage). Các nút đều có phản hồi/toast.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Tên công ty</Label>
                  <Input
                    value={general.companyName}
                    onChange={(e) => setState((s: any) => ({ ...s, general: { ...s.general, companyName: e.target.value } }))}
                    placeholder="VD: Ventora Construction"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email hỗ trợ</Label>
                  <Input
                    value={general.supportEmail}
                    onChange={(e) => setState((s: any) => ({ ...s, general: { ...s.general, supportEmail: e.target.value } }))}
                    placeholder="support@..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Màu thương hiệu</Label>
                  <Select
                    value={general.brandColor}
                    onValueChange={(v) => setState((s: any) => ({ ...s, general: { ...s.general, brandColor: v } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn màu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Blue">Blue</SelectItem>
                      <SelectItem value="Black/White">Black / White</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Múi giờ</Label>
                  <Select
                    value={general.timeZone}
                    onValueChange={(v) => setState((s: any) => ({ ...s, general: { ...s.general, timeZone: v } }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Chính sách phê duyệt
                    </CardTitle>
                    <CardDescription>
                      Bật “Strict approval” sẽ chặn thao tác update khi chưa qua inbox phê duyệt (mock).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Strict approval</div>
                      <div className="text-sm text-muted-foreground">Áp dụng cho PR/Contracts/Submittals…</div>
                    </div>
                    <Switch
                      checked={general.strictApproval}
                      onCheckedChange={(v) => setState((s: any) => ({ ...s, general: { ...s.general, strictApproval: v } }))}
                    />
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-base">Maintenance mode</CardTitle>
                    <CardDescription>
                      Khi bật, hệ thống hiển thị banner bảo trì (mock) và hạn chế thao tác.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="font-medium">Bảo trì</div>
                      <div className="text-sm text-muted-foreground">Chỉ admin được thao tác.</div>
                    </div>
                    <Switch
                      checked={general.maintenanceMode}
                      onCheckedChange={(v) => setState((s: any) => ({ ...s, general: { ...s.general, maintenanceMode: v } }))}
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Thông báo toàn hệ thống</Label>
                <Textarea
                  value={general.announcement}
                  onChange={(e) => setState((s: any) => ({ ...s, general: { ...s.general, announcement: e.target.value } }))}
                  placeholder="VD: Bảo trì định kỳ..."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={onSaveGeneral}>Lưu cấu hình</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Người dùng</CardTitle>
                <CardDescription>
                  Quản lý danh sách user, trạng thái, role (mock). Lưu localStorage.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Tìm tên/email/role..."
                    className="pl-10"
                  />
                </div>
                <Button onClick={openAddUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add user
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.department}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{u.role}</Badge>
                      </TableCell>
                      <TableCell>{badgeForStatus(u.status)}</TableCell>
                      <TableCell className="text-muted-foreground">{u.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditUser(u)}>
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => resetPassword(u)}>
                            <RefreshCcw className="h-4 w-4 mr-1" /> Reset PW
                          </Button>
                          <Button variant={u.status === 'Active' ? 'secondary' : 'outline'} size="sm" onClick={() => toggleUserStatus(u)}>
                            {u.status === 'Active' ? 'Offboard' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        Không có dữ liệu phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
            <DialogContent className="sm:max-w-[620px]">
              <DialogHeader>
                <DialogTitle>{editingUser?.name ? 'Edit user' : 'Add user'}</DialogTitle>
                <DialogDescription>
                  Đây là form mock — lưu localStorage, không gọi backend.
                </DialogDescription>
              </DialogHeader>

              {editingUser && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tên</Label>
                    <Input
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      placeholder="a@ventora.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Phòng ban</Label>
                    <Select
                      value={editingUser.department}
                      onValueChange={(v) => setEditingUser({ ...editingUser, department: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BOD">BOD</SelectItem>
                        <SelectItem value="Legal & Bidding">Legal & Bidding</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="HR-Admin">HR-Admin</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="PMO/Construction">PMO/Construction</SelectItem>
                        <SelectItem value="DMS">DMS</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(v) => setEditingUser({ ...editingUser, role: v as RoleKey })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((r) => (
                          <SelectItem key={r.key} value={r.key}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={editingUser.status}
                      onValueChange={(v) => setEditingUser({ ...editingUser, status: v as UserStatus })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="On leave">On leave</SelectItem>
                        <SelectItem value="Offboarded">Offboarded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Last login</Label>
                    <Input
                      value={editingUser.lastLogin}
                      onChange={(e) => setEditingUser({ ...editingUser, lastLogin: e.target.value })}
                      placeholder="YYYY-MM-DD HH:mm"
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveUser}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Roles */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles</CardTitle>
              <CardDescription>Danh sách role và mô tả (mock).</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ROLES.map((r) => (
                <div key={r.key} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-sm text-muted-foreground">{r.description}</div>
                    </div>
                    <Badge variant={r.key === 'System' ? 'destructive' : 'secondary'}>{r.key}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>
                  Kéo ngang để xem đầy đủ modules. Checkbox có thể click, lưu sẽ ghi log (mock).
                </CardDescription>
              </div>
              <Button onClick={savePermissions}>Save permissions</Button>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Horizontal scroll wrapper */}
              <div className="rounded-lg border bg-background">
                <div className="overflow-x-auto">
                  <table className="min-w-max w-full border-separate border-spacing-0 text-sm">
                    <thead>
                      <tr>
                        {/* Sticky first column */}
                        <th
                          className={cn(
                            'sticky left-0 z-20 bg-background',
                            'border-b p-3 text-left font-semibold',
                            'min-w-[220px]',
                            'shadow-[2px_0_0_0_rgba(0,0,0,0.06)]'
                          )}
                        >
                          Role \ Module
                        </th>

                        {MODULES.map((m) => (
                          <th
                            key={m}
                            className="border-b p-3 text-left font-semibold min-w-[220px]"
                          >
                            {m}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {ROLES.map((r) => (
                        <tr key={r.key} className="align-top">
                          {/* Sticky role cell */}
                          <td
                            className={cn(
                              'sticky left-0 z-10 bg-background',
                              'border-b p-3',
                              'min-w-[220px]',
                              'shadow-[2px_0_0_0_rgba(0,0,0,0.06)]'
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="font-semibold">{r.key}</div>
                                <div className="text-xs text-muted-foreground">{r.name}</div>
                              </div>
                              <Badge variant={r.key === 'System' ? 'destructive' : 'secondary'}>
                                {r.key}
                              </Badge>
                            </div>
                          </td>

                          {MODULES.map((m) => (
                            <td key={m} className="border-b p-3 min-w-[220px]">
                              <div className="grid grid-cols-2 gap-2">
                                {PERMS.map((p) => (
                                  <label
                                    key={p}
                                    className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-muted/50"
                                  >
                                    <Checkbox
                                      checked={!!matrix?.[r.key]?.[m]?.[p]}
                                      onCheckedChange={(v) =>
                                        updatePermission(r.key, m, p, Boolean(v))
                                      }
                                    />
                                    <span
                                      className={cn(
                                        'text-xs uppercase',
                                        matrix?.[r.key]?.[m]?.[p]
                                          ? 'text-foreground'
                                          : 'text-muted-foreground'
                                      )}
                                    >
                                      {p}
                                    </span>
                                  </label>
                                ))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Hint row */}
              <div className="text-xs text-muted-foreground">
                Tip: trackpad/mouse wheel + Shift để kéo ngang nhanh.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Approval Workflow</CardTitle>
                <CardDescription>
                  Chỉnh bước phê duyệt theo từng module (mock). Có thể add/remove step.
                </CardDescription>
              </div>
              <Button onClick={saveFlows}>Save workflow</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {flows.map((f) => (
                <Card key={f.id} className="border-dashed">
                  <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-base">{f.name}</CardTitle>
                      <CardDescription>Applies to: {f.appliesTo}</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-muted-foreground">Enabled</div>
                      <Switch checked={f.isEnabled} onCheckedChange={(v) => toggleFlow(f.id, v)} />
                      <Button variant="outline" size="sm" onClick={() => addFlowStep(f.id)}>
                        <Plus className="h-4 w-4 mr-1" /> Add step
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {f.steps.map((st, idx) => (
                      <div key={st.id} className="rounded-lg border p-3">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Step {idx + 1}</Badge>
                            <Input
                              value={st.title}
                              onChange={(e) => updateFlowStep(f.id, st.id, { title: e.target.value })}
                              className="w-[320px] max-w-full"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <div className="text-xs text-muted-foreground">Approver</div>
                            <Select
                              value={st.approverRole}
                              onValueChange={(v) => updateFlowStep(f.id, st.id, { approverRole: v as RoleKey })}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ROLES.map((r) => (
                                  <SelectItem key={r.key} value={r.key}>
                                    {r.key}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="text-xs text-muted-foreground">SLA (hours)</div>
                            <Input
                              type="number"
                              value={st.slaHours}
                              onChange={(e) => updateFlowStep(f.id, st.id, { slaHours: Number(e.target.value || 0) })}
                              className="w-[120px]"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeFlowStep(f.id, st.id)} title="Remove step">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {f.steps.length === 0 && (
                      <div className="text-sm text-muted-foreground py-4">Chưa có bước nào.</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Toggle & connect/disconnect (mock). Phù hợp demo UI/UX cho “Hệ thống”.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <IntegrationCard
                title="Email"
                description="Thông báo approval, reset password, alerts."
                enabled={integrations.emailEnabled}
                connected={integrations.connected.email}
                provider={integrations.emailProvider}
                onEnabledChange={(v) => setState((s: any) => ({ ...s, integrations: { ...s.integrations, emailEnabled: v } }))}
                onProviderChange={(v) => setState((s: any) => ({ ...s, integrations: { ...s.integrations, emailProvider: v } }))}
                onConnect={() => connect('email')}
                onDisconnect={() => disconnect('email')}
                providers={['SMTP', 'Google Workspace', 'Microsoft 365']}
              />

              <IntegrationCard
                title="Storage"
                description="Lưu file DMS, versioning, evidence."
                enabled={integrations.storageEnabled}
                connected={integrations.connected.storage}
                provider={integrations.storageProvider}
                onEnabledChange={(v) => setState((s: any) => ({ ...s, integrations: { ...s.integrations, storageEnabled: v } }))}
                onProviderChange={(v) => setState((s: any) => ({ ...s, integrations: { ...s.integrations, storageProvider: v } }))}
                onConnect={() => connect('storage')}
                onDisconnect={() => disconnect('storage')}
                providers={['S3 Compatible', 'Azure Blob', 'Google Cloud Storage']}
              />

              <IntegrationCard
                title="SSO"
                description="Đăng nhập một lần, quản trị tài khoản tập trung."
                enabled={integrations.ssoEnabled}
                connected={integrations.connected.sso}
                provider={integrations.ssoProvider}
                onEnabledChange={(v) => setState((s: any) => ({ ...s, integrations: { ...s.integrations, ssoEnabled: v } }))}
                onProviderChange={(v) => setState((s: any) => ({ ...s, integrations: { ...s.integrations, ssoProvider: v } }))}
                onConnect={() => connect('sso')}
                onDisconnect={() => disconnect('sso')}
                providers={['OIDC', 'SAML 2.0', 'Azure AD']}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit */}
        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Audit Log</CardTitle>
                <CardDescription>
                  Nhật ký hành động: approvals, thay đổi role, login fail… (mock, lưu localStorage).
                </CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={auditQuery}
                  onChange={(e) => setAuditQuery(e.target.value)}
                  placeholder="Filter: actor/action/resource..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Severity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditFiltered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="text-muted-foreground">{r.at}</TableCell>
                      <TableCell className="font-medium">{r.actor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.action}</Badge>
                      </TableCell>
                      <TableCell>{r.resource}</TableCell>
                      <TableCell>{badgeForSeverity(r.severity)}</TableCell>
                    </TableRow>
                  ))}
                  {auditFiltered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                        Không có log phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntegrationCard(props: {
  title: string;
  description: string;
  enabled: boolean;
  connected: boolean;
  provider: string;
  providers: string[];
  onEnabledChange: (v: boolean) => void;
  onProviderChange: (v: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  const { title, description, enabled, connected, provider, providers, onEnabledChange, onProviderChange, onConnect, onDisconnect } = props;
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{title}</span>
          <Badge variant={connected ? 'secondary' : 'outline'} className={cn(connected ? 'border-transparent' : '')}>
            {connected ? 'Connected' : 'Not connected'}
          </Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Enabled</div>
            <div className="text-sm text-muted-foreground">Bật/tắt tính năng</div>
          </div>
          <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        </div>

        <div className="space-y-2">
          <Label>Provider</Label>
          <Select value={provider} onValueChange={onProviderChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {connected ? (
            <Button variant="outline" className="w-full" onClick={onDisconnect}>
              <Unlink className="h-4 w-4 mr-2" />
              Disconnect
            </Button>
          ) : (
            <Button className="w-full" onClick={onConnect} disabled={!enabled}>
              <Link2 className="h-4 w-4 mr-2" />
              Connect
            </Button>
          )}
        </div>

        {!enabled && (
          <div className="text-xs text-muted-foreground">
            Bật “Enabled” để kết nối.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function nowStr() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
