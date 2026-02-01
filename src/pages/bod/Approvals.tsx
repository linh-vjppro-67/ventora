import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Wallet, 
  Building2,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/common/StatusBadge';
import { mockApprovals, formatCurrency } from '@/data/mockData';
import type { Approval, ApprovalType, ApprovalStatus } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const typeLabels: Record<ApprovalType, string> = {
  'tender': 'Hồ sơ thầu',
  'contract': 'Hợp đồng',
  'payment': 'Thanh toán',
  'change-request': 'Thay đổi',
  'design': 'Thiết kế',
};

const typeColors: Record<ApprovalType, string> = {
  'tender': 'bg-violet-100 text-violet-600',
  'contract': 'bg-blue-100 text-blue-600',
  'payment': 'bg-amber-100 text-amber-600',
  'change-request': 'bg-orange-100 text-orange-600',
  'design': 'bg-emerald-100 text-emerald-600',
};

const typeIcons: Record<ApprovalType, React.ElementType> = {
  'tender': Building2,
  'contract': FileText,
  'payment': Wallet,
  'change-request': FileText,
  'design': FileText,
};

export default function BODApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>(mockApprovals);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | ApprovalType>('all');
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  const handleAction = (approval: Approval, action: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setActionType(action);
    setComment('');
  };

  const confirmAction = () => {
    if (!selectedApproval || !actionType) return;

    setApprovals(prev => prev.map(a => 
      a.id === selectedApproval.id 
        ? { ...a, status: actionType === 'approve' ? 'approved' as ApprovalStatus : 'rejected' as ApprovalStatus, comment }
        : a
    ));

    toast({
      title: actionType === 'approve' ? 'Đã phê duyệt' : 'Đã từ chối',
      description: `${selectedApproval.itemCode} - ${selectedApproval.itemName}`,
    });

    setSelectedApproval(null);
    setActionType(null);
  };

  const filteredApprovals = approvals
    .filter(a => a.status === 'pending')
    .filter(a => activeTab === 'all' || a.type === activeTab)
    .filter(a => 
      searchQuery === '' || 
      a.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const pendingCounts = {
    all: approvals.filter(a => a.status === 'pending').length,
    tender: approvals.filter(a => a.status === 'pending' && a.type === 'tender').length,
    contract: approvals.filter(a => a.status === 'pending' && a.type === 'contract').length,
    payment: approvals.filter(a => a.status === 'pending' && a.type === 'payment').length,
    design: approvals.filter(a => a.status === 'pending' && a.type === 'design').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phê duyệt</h1>
        <p className="text-muted-foreground">Xem xét và phê duyệt các yêu cầu từ các phòng ban</p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            Tất cả
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
              {pendingCounts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            Thanh toán
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
              {pendingCounts.payment}
            </span>
          </TabsTrigger>
          <TabsTrigger value="contract" className="gap-2">
            Hợp đồng
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
              {pendingCounts.contract}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tender" className="gap-2">
            Hồ sơ thầu
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
              {pendingCounts.tender}
            </span>
          </TabsTrigger>
          <TabsTrigger value="design" className="gap-2">
            Thiết kế
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold">
              {pendingCounts.design}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredApprovals.length === 0 ? (
            <Card className="py-12">
              <CardContent className="text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold text-lg">Không có yêu cầu chờ duyệt</h3>
                <p className="text-muted-foreground mt-1">Tất cả các yêu cầu đã được xử lý</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredApprovals.map((approval, index) => {
                const Icon = typeIcons[approval.type];
                return (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="card-hover">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${typeColors[approval.type]}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">{approval.itemName}</h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${typeColors[approval.type]}`}>
                                  {typeLabels[approval.type]}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                <span>{approval.itemCode}</span>
                                <span>•</span>
                                <span>Yêu cầu bởi: {approval.requestedBy}</span>
                                <span>•</span>
                                <span>{new Date(approval.requestedAt).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 flex-shrink-0">
                            {approval.amount && (
                              <div className="text-right">
                                <div className="text-lg font-bold">{formatCurrency(approval.amount)}</div>
                                <div className="text-xs text-muted-foreground">Giá trị</div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleAction(approval, 'reject')}
                              >
                                <XCircle className="h-4 w-4" />
                                Từ chối
                              </Button>
                              <Button 
                                size="sm"
                                className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => handleAction(approval, 'approve')}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Phê duyệt
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

      {/* Approval Dialog */}
      <Dialog open={!!selectedApproval && !!actionType} onOpenChange={() => { setSelectedApproval(null); setActionType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval?.itemCode} - {selectedApproval?.itemName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Ghi chú (không bắt buộc)</label>
              <Textarea
                placeholder="Nhập ghi chú..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedApproval(null); setActionType(null); }}>
              Hủy
            </Button>
            <Button 
              onClick={confirmAction}
              className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionType === 'approve' ? 'Xác nhận phê duyệt' : 'Xác nhận từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
