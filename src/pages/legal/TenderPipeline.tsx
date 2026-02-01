import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Users,
  Upload,
  Gavel,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockTenders, formatCurrency } from '@/data/mockData';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import type { Tender, TenderStatus } from '@/types';

const columns: { id: TenderStatus; title: string; color: string }[] = [
  { id: 'lead', title: 'Lead', color: 'kanban-lead' },
  { id: 'preparation', title: 'Chuẩn bị', color: 'kanban-prep' },
  { id: 'submitted', title: 'Nộp', color: 'kanban-submitted' },
  { id: 'negotiating', title: 'Thương thảo', color: 'kanban-negotiating' },
  { id: 'won', title: 'Trúng', color: 'kanban-won' },
  { id: 'lost', title: 'Trượt', color: 'kanban-lost' },
];

function statusLabel(status: TenderStatus) {
  switch (status) {
    case 'lead':
      return 'Draft';
    case 'preparation':
      return 'In Review';
    case 'submitted':
      return 'Submitted';
    case 'negotiating':
      return 'Negotiating';
    case 'won':
      return 'Won';
    case 'lost':
      return 'Lost';
  }
}

interface TenderCardProps {
  tender: Tender;
  onMove: (id: string, newStatus: TenderStatus) => void;
  onOpen: (t: Tender) => void;
}

function TenderCard({ tender, onMove, onOpen }: TenderCardProps) {
  const daysUntilDeadline = Math.ceil(
    (new Date(tender.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDeadline < 0;
  const isUrgent = daysUntilDeadline >= 0 && daysUntilDeadline <= 7;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group"
    >
      <Card
        role="button"
        tabIndex={0}
        onClick={() => onOpen(tender)}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(tender)}
        className="shadow-kanban hover:shadow-elevated transition-shadow cursor-pointer"
      >
        <CardContent className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{tender.code}</p>
              <h4 className="font-medium text-sm mt-0.5 line-clamp-2">{tender.name}</h4>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onOpen(tender)}>Xem chi tiết</DropdownMenuItem>
                {tender.status !== 'won' && tender.status !== 'lost' && (
                  <>
                    <DropdownMenuItem onClick={() => onMove(tender.id, 'won')}>
                      Đánh dấu trúng
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMove(tender.id, 'lost')}>
                      Đánh dấu trượt
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Client */}
          <p className="text-xs text-muted-foreground truncate">{tender.client}</p>

          {/* Value & Priority */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{formatCurrency(tender.value)}</span>
            <PriorityBadge priority={tender.priority} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span
                className={cn(
                  isOverdue && 'text-red-600 font-medium',
                  isUrgent && !isOverdue && 'text-amber-600 font-medium'
                )}
              >
                {isOverdue
                  ? `Quá hạn ${Math.abs(daysUntilDeadline)} ngày`
                  : isUrgent
                    ? `Còn ${daysUntilDeadline} ngày`
                    : new Date(tender.deadline).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              <span>{tender.documents}</span>
            </div>
          </div>

          {/* Owner */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {tender.owner
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
            <span className="text-xs text-muted-foreground truncate">{tender.owner}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface KanbanColumnProps {
  column: (typeof columns)[0];
  tenders: Tender[];
  onMove: (id: string, newStatus: TenderStatus) => void;
  onOpen: (t: Tender) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TenderStatus) => void;
}

function KanbanColumn({ column, tenders, onMove, onOpen, onDragOver, onDrop }: KanbanColumnProps) {
  const totalValue = tenders.reduce((sum, t) => sum + t.value, 0);

  return (
    <div className="flex-shrink-0 w-80" onDragOver={onDragOver} onDrop={(e) => onDrop(e, column.id)}>
      <div className={cn('rounded-xl p-3', column.color)}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="secondary" className="h-5 text-xs font-semibold">
              {tenders.length}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-medium">{formatCurrency(totalValue)}</span>
        </div>

        {/* Cards */}
        <div className="space-y-3 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {tenders.map((tender) => (
              <div
                key={tender.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('tenderId', tender.id);
                }}
              >
                <TenderCard tender={tender} onMove={onMove} onOpen={onOpen} />
              </div>
            ))}
          </AnimatePresence>

          {tenders.length === 0 && (
            <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <p className="text-sm text-muted-foreground">Kéo thả hồ sơ vào đây</p>
            </div>
          )}
        </div>

        {/* Add Button */}
        {column.id !== 'won' && column.id !== 'lost' && (
          <Button
            variant="ghost"
            className="w-full mt-3 gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Thêm hồ sơ
          </Button>
        )}
      </div>
    </div>
  );
}

export default function LegalTenderPipeline() {
  const [tenders, setTenders] = useState<Tender[]>(mockTenders);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; tag: string }[]>>({});
  const [qaDraft, setQaDraft] = useState('');

  const openTender = useCallback(
    (t: Tender) => {
      setSelectedTenderId(t.id);
      const next = new URLSearchParams(searchParams);
      next.set('tender', t.id);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const closeTender = useCallback(() => {
    setSelectedTenderId(null);
    const next = new URLSearchParams(searchParams);
    next.delete('tender');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // Open drawer if URL has ?tender=
  useMemo(() => {
    const tId = searchParams.get('tender');
    if (tId && tId !== selectedTenderId) setSelectedTenderId(tId);
    if (!tId && selectedTenderId) setSelectedTenderId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const selectedTender = useMemo(
    () => tenders.find((t) => t.id === selectedTenderId) || null,
    [tenders, selectedTenderId]
  );

  const handleMove = useCallback((id: string, newStatus: TenderStatus) => {
    setTenders((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
    toast({ title: 'Đã chuyển trạng thái', description: `Tender → ${statusLabel(newStatus)}` });
  }, [toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, status: TenderStatus) => {
      e.preventDefault();
      const tenderId = e.dataTransfer.getData('tenderId');
      if (tenderId) handleMove(tenderId, status);
    },
    [handleMove]
  );

  const filteredTenders = tenders.filter(
    (t) =>
      searchQuery === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTendersByStatus = (status: TenderStatus) => filteredTenders.filter((t) => t.status === status);

  const pipelineValue = tenders
    .filter((t) => t.status !== 'lost')
    .reduce((sum, t) => sum + t.value, 0);

  const stats = {
    total: tenders.length,
    active: tenders.filter((t) => !['won', 'lost'].includes(t.status)).length,
    won: tenders.filter((t) => t.status === 'won').length,
    winRate: Math.round(
      (tenders.filter((t) => t.status === 'won').length /
        (tenders.filter((t) => ['won', 'lost'].includes(t.status)).length || 1)) *
        100
    ),
  };

  const docsForSelected = selectedTender
    ? uploadedDocs[selectedTender.id] || [
        { name: '01_Invitation.pdf', tag: 'Tender Doc' },
        { name: '02_BidForm.docx', tag: 'Template' },
        { name: '03_BankGuarantee.pdf', tag: 'Attachment' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Gavel className="h-6 w-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold tracking-tight">Tender Pipeline</h1>
          </div>
          <p className="text-muted-foreground">Lead → Chuẩn bị → Nộp → Thương thảo → Trúng/Trượt</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => toast({ title: 'Create tender', description: 'Mock: mở form tạo hồ sơ thầu' })}
        >
          <Plus className="h-4 w-4" />
          Create tender
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Tổng số hồ sơ</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-sm text-muted-foreground">Đang xử lý</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{formatCurrency(pipelineValue)}</div>
            <p className="text-sm text-muted-foreground">Giá trị pipeline</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-emerald-600">{stats.winRate}%</div>
            <p className="text-sm text-muted-foreground">Tỷ lệ trúng thầu</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm hồ sơ thầu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast({ title: 'Filter', description: 'Mock: mở bộ lọc' })}>
          <Filter className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-4 min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tenders={getTendersByStatus(column.id)}
              onMove={handleMove}
              onOpen={openTender}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Drawer: Tender Detail */}
      <Sheet open={!!selectedTender} onOpenChange={(open) => !open && closeTender()}>
        <SheetContent side="right" className="w-[520px] sm:w-[600px] p-0">
          {selectedTender && (
            <div className="flex h-full flex-col">
              <div className="p-6">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs text-muted-foreground font-medium">{selectedTender.code}</div>
                      <div className="text-base font-semibold truncate">{selectedTender.name}</div>
                    </div>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      {statusLabel(selectedTender.status)}
                    </Badge>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast({ title: 'Assign owner', description: 'Mock: mở chọn owner' })}
                  >
                    <Users className="h-4 w-4" />
                    Assign owner
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Move stage
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {columns.map((c) => (
                        <DropdownMenuItem
                          key={c.id}
                          onClick={() => handleMove(selectedTender.id, c.id)}
                        >
                          {c.title}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <label className="inline-flex">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        setUploadedDocs((prev) => {
                          const current = prev[selectedTender.id] || [];
                          return {
                            ...prev,
                            [selectedTender.id]: [{ name: f.name, tag: 'Uploaded' }, ...current],
                          };
                        });
                        toast({ title: 'Upload docs', description: `Mock: đã chọn file ${f.name}` });
                        e.currentTarget.value = '';
                      }}
                    />
                    <Button size="sm" className="gap-2" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Upload docs
                      </span>
                    </Button>
                  </label>
                </div>
              </div>

              <Separator />

              <div className="flex-1 overflow-y-auto p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="boq">BOQ Snapshot</TabsTrigger>
                  </TabsList>
                  <TabsList className="mt-2 grid w-full grid-cols-3">
                    <TabsTrigger value="qa">Q&amp;A</TabsTrigger>
                    <TabsTrigger value="approvals">Approvals</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Client</div>
                          <div className="font-medium">{selectedTender.client}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Value</div>
                          <div className="font-semibold">{formatCurrency(selectedTender.value)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Deadline</div>
                          <div className="font-medium">
                            {new Date(selectedTender.deadline).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Owner</div>
                          <div className="font-medium">{selectedTender.owner}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">Priority</div>
                          <PriorityBadge priority={selectedTender.priority} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="text-sm font-semibold">Key notes</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mock: tóm tắt yêu cầu hồ sơ thầu, điều kiện dự thầu, và các mốc cần bám.
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">Documents</div>
                        <div className="text-sm text-muted-foreground">Mock DMS cho tender</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => toast({ title: 'Open DMS', description: 'Mock: chuyển sang Legal Templates' })}
                      >
                        <FileText className="h-4 w-4" />
                        Browse
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {docsForSelected.map((d, idx) => (
                        <div
                          key={`${d.name}-${idx}`}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="min-w-0">
                            <div className="font-medium text-sm truncate">{d.name}</div>
                            <div className="text-xs text-muted-foreground">{d.tag}</div>
                          </div>
                          <Button size="sm" variant="ghost" className="gap-2">
                            <ArrowRight className="h-4 w-4" />
                            Open
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="boq" className="mt-6 space-y-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="font-semibold">BOQ Snapshot</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Mock: bảng BOQ rút gọn (Top 5 hạng mục) – dùng để demo UI.
                        </p>
                        <div className="mt-3 grid gap-2">
                          {[
                            { name: 'Kết cấu bê tông', v: 0.32 },
                            { name: 'Cốt thép', v: 0.21 },
                            { name: 'Cốp pha', v: 0.12 },
                            { name: 'MEP sơ bộ', v: 0.18 },
                            { name: 'Chi phí chung', v: 0.17 },
                          ].map((r) => (
                            <div key={r.name} className="flex items-center justify-between text-sm">
                              <div className="text-muted-foreground">{r.name}</div>
                              <div className="font-semibold">{Math.round(r.v * 100)}%</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="qa" className="mt-6 space-y-3">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="font-semibold">Q&amp;A</div>
                        <div className="space-y-2">
                          <div className="rounded-lg bg-muted/40 p-3">
                            <div className="text-sm font-medium">Q: Có yêu cầu bảo lãnh dự thầu không?</div>
                            <div className="text-sm text-muted-foreground mt-1">A: Có, theo mẫu đính kèm.</div>
                          </div>
                          <div className="rounded-lg bg-muted/40 p-3">
                            <div className="text-sm font-medium">Q: Điều kiện thanh toán?</div>
                            <div className="text-sm text-muted-foreground mt-1">A: Theo nghiệm thu giai đoạn.</div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Thêm câu hỏi</div>
                          <Textarea
                            value={qaDraft}
                            onChange={(e) => setQaDraft(e.target.value)}
                            placeholder="Nhập câu hỏi / ghi chú..."
                          />
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                              if (!qaDraft.trim()) return;
                              toast({ title: 'Đã lưu Q&A', description: 'Mock: append vào danh sách Q&A' });
                              setQaDraft('');
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="approvals" className="mt-6 space-y-3">
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <div className="font-semibold">Approvals</div>
                        <div className="rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">Submit tender for approval</div>
                            <Badge variant="secondary">Pending</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Mock: luồng duyệt hồ sơ thầu (Legal → BOD)
                          </div>
                        </div>
                        <Button
                          className="gap-2"
                          onClick={() => toast({ title: 'Submit for approval', description: 'Mock: tạo approval request' })}
                        >
                          <ArrowRight className="h-4 w-4" />
                          Submit for approval
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-6 space-y-3">
                    <Card>
                      <CardContent className="p-4 space-y-2">
                        <div className="font-semibold">Activity</div>
                        {[
                          { at: '10:12', text: 'Tạo hồ sơ thầu' },
                          { at: '11:40', text: 'Upload 02_BidForm.docx' },
                          { at: '13:05', text: 'Move stage → Chuẩn bị' },
                          { at: '15:20', text: 'Gán owner: Nguyễn Văn An' },
                        ].map((a) => (
                          <div key={a.at} className="flex items-center gap-3 text-sm">
                            <Badge variant="outline" className="w-14 justify-center">
                              {a.at}
                            </Badge>
                            <div className="text-muted-foreground">{a.text}</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
