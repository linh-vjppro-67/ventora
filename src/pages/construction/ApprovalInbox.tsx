import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Inbox, Search, X } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

type Approval = {
  id: string;
  title: string;
  project: string;
  category: 'QAQC' | 'Change' | 'Procurement' | 'Payment';
  due: string;
  status: 'pending' | 'waiting' | 'done';
};

export default function ConstructionApprovalInbox() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  const approvals = useMemo<Approval[]>(
    () => [
      {
        id: 'APR-018',
        title: 'Phê duyệt biên bản nghiệm thu hạng mục MEP tầng 3',
        project: 'VT-001',
        category: 'QAQC',
        due: 'Hôm nay',
        status: 'pending',
      },
      {
        id: 'APR-021',
        title: 'Phê duyệt thay đổi vật liệu ốp mặt dựng',
        project: 'VT-001',
        category: 'Change',
        due: '2 ngày',
        status: 'waiting',
      },
      {
        id: 'APR-006',
        title: 'Duyệt procurement request PROC-18 để tạo PR',
        project: 'VT-001',
        category: 'Procurement',
        due: '3 ngày',
        status: 'pending',
      },
    ],
    []
  );

  const filtered = approvals.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return a.id.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) || a.project.toLowerCase().includes(q);
  });

  const badge = (s: Approval['status']) => {
    if (s === 'pending') return <Badge>Pending</Badge>;
    if (s === 'waiting') return <Badge variant="outline">Waiting</Badge>;
    return <Badge variant="secondary">Done</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Inbox</h1>
          <p className="text-muted-foreground">Approvals + quick actions (mock)</p>
        </div>
        <div className="relative w-80 max-w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search approvals..." className="pl-10" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <CardTitle className="text-base">Pending items</CardTitle>
          </div>
          <CardDescription>Right-panel style approvals list (mock)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((a, idx) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">{a.id}</Badge>
                    {badge(a.status)}
                    <Badge variant="outline">{a.category}</Badge>
                    <span className="text-xs text-muted-foreground">Project: {a.project}</span>
                  </div>
                  <div className="font-semibold mt-2 line-clamp-2">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">Due: {a.due}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => toast({ title: 'Approved (mock)', description: `${a.id} → approved` })}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast({ title: 'Rejected (mock)', description: `${a.id} → rejected` })}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">Mock: action sẽ cập nhật trạng thái ở backend sau này.</div>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">No approvals.</div>}
        </CardContent>
      </Card>
    </div>
  );
}
