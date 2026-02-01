import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, FileText, Filter, Gavel, Search, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { mockApprovals, formatCurrency } from '@/data/mockData';
import type { Approval, ApprovalStatus, ApprovalType } from '@/types';

const typeMeta: Record<'tender' | 'contract', { label: string; icon: React.ElementType } > = {
  tender: { label: 'Hồ sơ thầu', icon: Gavel },
  contract: { label: 'Hợp đồng', icon: FileText },
};

export default function ApprovalInbox() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'tender' | 'contract'>('all');
  const [items, setItems] = useState<Approval[]>(mockApprovals);
  const [selected, setSelected] = useState<Approval | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items
      .filter((a) => a.status === 'pending')
      .filter((a) => a.type === 'tender' || a.type === 'contract')
      .filter((a) => (activeTab === 'all' ? true : a.type === (activeTab as ApprovalType)))
      .filter((a) => (q === '' ? true : `${a.itemCode} ${a.itemName}`.toLowerCase().includes(q)));
  }, [activeTab, items, searchQuery]);

  const counts = {
    all: items.filter((a) => a.status === 'pending' && (a.type === 'tender' || a.type === 'contract')).length,
    tender: items.filter((a) => a.status === 'pending' && a.type === 'tender').length,
    contract: items.filter((a) => a.status === 'pending' && a.type === 'contract').length,
  };

  const openAction = (approval: Approval, type: 'approve' | 'reject') => {
    setSelected(approval);
    setActionType(type);
    setComment('');
  };

  const confirmAction = () => {
    if (!selected || !actionType) return;
    setItems((prev) =>
      prev.map((a) =>
        a.id === selected.id
          ? {
              ...a,
              status: (actionType === 'approve' ? 'approved' : 'rejected') as ApprovalStatus,
              comment,
            }
          : a
      )
    );
    toast({
      title: actionType === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối',
      description: `${selected.itemCode} - ${selected.itemName}`,
    });
    setSelected(null);
    setActionType(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Approval Inbox</h1>
        <p className="text-muted-foreground">Hộp thư phê duyệt cho Pháp chế & Đấu thầu</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã hoặc tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            Tất cả
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">{counts.all}</span>
          </TabsTrigger>
          <TabsTrigger value="tender" className="gap-2">
            Hồ sơ thầu
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">{counts.tender}</span>
          </TabsTrigger>
          <TabsTrigger value="contract" className="gap-2">
            Hợp đồng
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">{counts.contract}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filtered.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg">Không có yêu cầu chờ duyệt</h3>
                <p className="text-muted-foreground mt-1">Tất cả đã được xử lý</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((a, index) => {
                const meta = typeMeta[a.type as 'tender' | 'contract'];
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <Card className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate">{a.itemName}</h3>
                                <Badge variant="outline">{meta.label}</Badge>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span>{a.itemCode}</span>
                                <span>•</span>
                                <span>Yêu cầu bởi: {a.requestedBy}</span>
                                <span>•</span>
                                <span>{new Date(a.requestedAt).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            {a.amount && (
                              <div className="text-right">
                                <div className="text-lg font-bold">{formatCurrency(a.amount)}</div>
                                <div className="text-xs text-muted-foreground">Giá trị</div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => openAction(a, 'reject')}
                              >
                                <XCircle className="h-4 w-4" />
                                Từ chối
                              </Button>
                              <Button size="sm" className="gap-1" onClick={() => openAction(a, 'approve')}>
                                <CheckCircle2 className="h-4 w-4" />
                                Duyệt
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(open) => !open && (setSelected(null), setActionType(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionType === 'approve' ? 'Phê duyệt' : 'Từ chối'}</DialogTitle>
            <DialogDescription>
              {selected?.itemCode} — {selected?.itemName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Ghi chú</div>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Nhập lý do / ghi chú..." />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => (setSelected(null), setActionType(null))}>
              Hủy
            </Button>
            <Button onClick={confirmAction}>{actionType === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
