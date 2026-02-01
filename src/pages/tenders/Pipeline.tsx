import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  FileText,
  Clock,
  ArrowRight,
  GripVertical
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { mockTenders, formatCurrency } from '@/data/mockData';
import type { Tender, TenderStatus } from '@/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const columns: { id: TenderStatus; title: string; color: string }[] = [
  { id: 'lead', title: 'Tiềm năng', color: 'kanban-lead' },
  { id: 'preparation', title: 'Chuẩn bị', color: 'kanban-prep' },
  { id: 'submitted', title: 'Đã nộp', color: 'kanban-submitted' },
  { id: 'negotiating', title: 'Thương thảo', color: 'kanban-negotiating' },
  { id: 'won', title: 'Trúng thầu', color: 'kanban-won' },
  { id: 'lost', title: 'Trượt thầu', color: 'kanban-lost' },
];

interface TenderCardProps {
  tender: Tender;
  onMove: (id: string, newStatus: TenderStatus) => void;
}

function TenderCard({ tender, onMove }: TenderCardProps) {
  const daysUntilDeadline = Math.ceil((new Date(tender.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
      <Card className="shadow-kanban hover:shadow-elevated transition-shadow cursor-pointer">
        <CardContent className="p-3 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{tender.code}</p>
              <h4 className="font-medium text-sm mt-0.5 line-clamp-2">{tender.name}</h4>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                {tender.status !== 'won' && tender.status !== 'lost' && (
                  <>
                    <DropdownMenuItem onClick={() => onMove(tender.id, 'won')}>
                      Đánh dấu trúng thầu
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onMove(tender.id, 'lost')}>
                      Đánh dấu trượt thầu
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
              <span className={cn(
                isOverdue && 'text-red-600 font-medium',
                isUrgent && !isOverdue && 'text-amber-600 font-medium'
              )}>
                {isOverdue ? `Quá hạn ${Math.abs(daysUntilDeadline)} ngày` : 
                 isUrgent ? `Còn ${daysUntilDeadline} ngày` :
                 new Date(tender.deadline).toLocaleDateString('vi-VN')}
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
              {tender.owner.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <span className="text-xs text-muted-foreground truncate">{tender.owner}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface KanbanColumnProps {
  column: typeof columns[0];
  tenders: Tender[];
  onMove: (id: string, newStatus: TenderStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: TenderStatus) => void;
}

function KanbanColumn({ column, tenders, onMove, onDragOver, onDrop }: KanbanColumnProps) {
  const totalValue = tenders.reduce((sum, t) => sum + t.value, 0);

  return (
    <div 
      className="flex-shrink-0 w-80"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className={cn('rounded-xl p-3', column.color)}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <Badge variant="secondary" className="h-5 text-xs font-semibold">
              {tenders.length}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {formatCurrency(totalValue)}
          </span>
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
                <TenderCard tender={tender} onMove={onMove} />
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
          <Button variant="ghost" className="w-full mt-3 gap-2 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
            Thêm hồ sơ
          </Button>
        )}
      </div>
    </div>
  );
}

export default function TenderPipeline() {
  const [tenders, setTenders] = useState<Tender[]>(mockTenders);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMove = useCallback((id: string, newStatus: TenderStatus) => {
    setTenders(prev => prev.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, status: TenderStatus) => {
    e.preventDefault();
    const tenderId = e.dataTransfer.getData('tenderId');
    if (tenderId) {
      handleMove(tenderId, status);
    }
  }, [handleMove]);

  const filteredTenders = tenders.filter(t => 
    searchQuery === '' || 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTendersByStatus = (status: TenderStatus) => 
    filteredTenders.filter(t => t.status === status);

  const pipelineValue = tenders
    .filter(t => t.status !== 'lost')
    .reduce((sum, t) => sum + t.value, 0);

  const stats = {
    total: tenders.length,
    active: tenders.filter(t => !['won', 'lost'].includes(t.status)).length,
    won: tenders.filter(t => t.status === 'won').length,
    winRate: Math.round((tenders.filter(t => t.status === 'won').length / 
      (tenders.filter(t => ['won', 'lost'].includes(t.status)).length || 1)) * 100),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline đấu thầu</h1>
          <p className="text-muted-foreground">Quản lý và theo dõi hồ sơ thầu</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo hồ sơ thầu
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
        <Button variant="outline" className="gap-2">
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
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
