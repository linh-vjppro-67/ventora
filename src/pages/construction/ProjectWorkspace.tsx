import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  HardHat,
  Users,
  CalendarClock,
  Wallet,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  Inbox,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/common/StatusBadge';
import DocumentLibrary from '@/components/dms/DocumentLibrary';
import { mockProjects, formatCurrency } from '@/data/mockData';
import type { Project } from '@/types';

type WorkspaceTab =
  | 'overview'
  | 'schedule'
  | 'wbs'
  | 'costs'
  | 'people'
  | 'docs'
  | 'diary'
  | 'qaqc';

function kpiCard(title: string, value: string, hint: string) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{hint}</div>
      </CardContent>
    </Card>
  );
}

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<WorkspaceTab>('overview');

  const project = useMemo<Project | undefined>(
    () => mockProjects.find((p) => String(p.id) === String(id)),
    [id]
  );

  const approvals = useMemo(
    () => [
      {
        id: 'APR-018',
        title: 'Phê duyệt biên bản nghiệm thu hạng mục MEP tầng 3',
        due: 'Hôm nay',
        status: 'pending',
      },
      {
        id: 'APR-021',
        title: 'Phê duyệt thay đổi vật liệu ốp mặt dựng',
        due: '2 ngày',
        status: 'waiting',
      },
    ],
    []
  );

  const alerts = useMemo(
    () => [
      { id: 'AL-01', text: '2 Work Packages đang ở trạng thái Pending inspection', tone: 'warn' as const },
      { id: 'AL-02', text: 'Có 1 rủi ro tiến độ: chậm vật tư thép', tone: 'risk' as const },
      { id: 'AL-03', text: '1 yêu cầu mua sắm mới cần liên kết PR', tone: 'info' as const },
    ],
    []
  );

  if (!project) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/projects')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
        <Card>
          <CardContent className="py-14 text-center">
            <HardHat className="h-10 w-10 mx-auto text-muted-foreground/60" />
            <div className="font-semibold mt-3">Không tìm thấy dự án</div>
            <div className="text-sm text-muted-foreground mt-1">Vui lòng quay lại danh mục dự án.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/projects')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Project Portfolio
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Badge variant="secondary" className="font-mono">{project.code}</Badge>
            <StatusBadge status={project.status} size="sm" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground text-sm">Project Workspace (Hub) • Quản lý tiến độ, WBS, QAQC, chi phí và tài liệu</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => navigate('/construction/approvals')}>
            <Inbox className="h-4 w-4" />
            Approvals
          </Button>
          <Button className="gap-2" onClick={() => navigate('/construction/wbs')}>
            <ClipboardList className="h-4 w-4" />
            Open WBS
          </Button>
        </div>
      </div>

      {/* Workspace layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left: Tabs */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="text-base">Workspace</CardTitle>
                <CardDescription className="text-xs">Tabs: Overview | Schedule | WBS | Costs | People | Docs | Diary | QAQC</CardDescription>
              </div>
              <div className="w-40">
                <div className="text-xs text-muted-foreground mb-1">Tiến độ</div>
                <div className="flex items-center gap-2">
                  <Progress value={project.progress} className="h-2" />
                  <span className="text-xs font-semibold w-10 text-right">{project.progress}%</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={tab} onValueChange={(v) => setTab(v as WorkspaceTab)}>
              <div className="p-4 pb-0">
                <TabsList className="w-full justify-start flex-wrap h-auto">
                  <TabsTrigger value="overview" className="gap-2"><HardHat className="h-4 w-4" />Overview</TabsTrigger>
                  <TabsTrigger value="schedule" className="gap-2"><CalendarClock className="h-4 w-4" />Schedule</TabsTrigger>
                  <TabsTrigger value="wbs" className="gap-2"><ClipboardList className="h-4 w-4" />WBS</TabsTrigger>
                  <TabsTrigger value="costs" className="gap-2"><Wallet className="h-4 w-4" />Costs</TabsTrigger>
                  <TabsTrigger value="people" className="gap-2"><Users className="h-4 w-4" />People</TabsTrigger>
                  <TabsTrigger value="docs" className="gap-2"><FileText className="h-4 w-4" />Docs</TabsTrigger>
                  <TabsTrigger value="diary" className="gap-2"><BookOpen className="h-4 w-4" />Diary</TabsTrigger>
                  <TabsTrigger value="qaqc" className="gap-2"><ShieldCheck className="h-4 w-4" />QAQC</TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 pt-3">
                <TabsContent value="overview" className="m-0">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      {kpiCard('Ngân sách', formatCurrency(project.budget), 'Budget tổng (mock)')}
                      {kpiCard('Committed', formatCurrency(Math.round(project.budget * 0.62)), 'Hợp đồng/PO đã cam kết (mock)')}
                      {kpiCard('Actual', formatCurrency(Math.round(project.budget * 0.41)), 'Chi phí thực tế (mock)')}
                    </div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Snapshot</CardTitle>
                        <CardDescription>Tóm tắt nhanh dự án cho điều phối thi công</CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Chủ đầu tư</span>
                          <span className="font-medium">{project.client}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">PM</span>
                          <span className="font-medium">{project.manager}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Địa điểm</span>
                          <span className="font-medium">{project.location}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>3 hạng mục đã nghiệm thu trong tuần (mock)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span>1 rủi ro tiến độ cần xử lý (mock)</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="schedule" className="m-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Bạn có thể mở màn hình Schedule (Gantt) để xem chi tiết.</div>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/construction/schedule')}>
                      <CalendarClock className="h-4 w-4" />
                      Go to Schedule (Gantt)
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="wbs" className="m-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">WBS / Work Packages dạng tree table, có actions (mock).</div>
                    <Button className="gap-2" onClick={() => navigate('/construction/wbs')}>
                      <ClipboardList className="h-4 w-4" />
                      Open WBS / Work Packages
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="costs" className="m-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Chi phí (mock) • Khi cần PR/Thanh toán sẽ liên kết sang Finance.</div>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/finance/payment-requests')}>
                      <Wallet className="h-4 w-4" />
                      Open Payment Requests
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="people" className="m-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Danh sách nhân sự dự án (mock) • sẽ tích hợp HR/Allocation.</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Chỉ huy trưởng: Minh</Badge>
                      <Badge variant="secondary">QS: Huy</Badge>
                      <Badge variant="secondary">QAQC: Trang</Badge>
                      <Badge variant="secondary">Thầu phụ: An Phát</Badge>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="m-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm text-muted-foreground">
                        Tài liệu dự án (mock) • Có folder tree, versioning, preview drawer.
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate('/dms')}>
                        Mở DMS
                      </Button>
                    </div>
                    <DocumentLibrary compact title="Docs" description="" />
                  </div>
                </TabsContent>

                <TabsContent value="diary" className="m-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Nhật ký công trình theo ngày (mock).</div>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/construction/diary')}>
                      <BookOpen className="h-4 w-4" />
                      Open Site Diary
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="qaqc" className="m-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">Danh sách kiểm tra, nghiệm thu (mock).</div>
                    <Button variant="outline" className="gap-2" onClick={() => navigate('/construction/qaqc')}>
                      <ShieldCheck className="h-4 w-4" />
                      Open QA/QC & Inspections
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right panel: KPIs + approvals + alerts */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">KPIs</CardTitle>
              <CardDescription>Right panel (mock)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
              <Separator />
              <div className="grid gap-3 grid-cols-2">
                {kpiCard('Open issues', '5', 'mock')}
                {kpiCard('Pending QA', '2', 'mock')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Approvals</CardTitle>
                  <CardDescription>Phê duyệt cần xử lý</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate('/construction/approvals')}>
                  Xem tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {approvals.map((a) => (
                <div key={a.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground font-mono">{a.id}</div>
                      <div className="text-sm font-medium line-clamp-2">{a.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">Due: {a.due}</div>
                    </div>
                    <Badge variant={a.status === 'pending' ? 'default' : 'secondary'}>
                      {a.status === 'pending' ? 'Pending' : 'Waiting'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <CardTitle className="text-base">Alerts</CardTitle>
              </div>
              <CardDescription>Nhắc việc & cảnh báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.map((a) => (
                <div key={a.id} className="flex items-start gap-2 text-sm">
                  <span
                    className={
                      a.tone === 'warn'
                        ? 'mt-0.5 h-2.5 w-2.5 rounded-full bg-amber-500'
                        : a.tone === 'risk'
                        ? 'mt-0.5 h-2.5 w-2.5 rounded-full bg-rose-500'
                        : 'mt-0.5 h-2.5 w-2.5 rounded-full bg-sky-500'
                    }
                  />
                  <span className="text-muted-foreground">{a.text}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
