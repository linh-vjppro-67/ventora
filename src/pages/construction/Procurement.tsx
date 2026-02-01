import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShoppingCart, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type ProcReq = {
  id: string;
  project: string;
  item: string;
  vendor: string;
  amount: number;
  status: 'draft' | 'submitted' | 'linked-pr' | 'done';
};

export default function ConstructionProcurement() {
  const navigate = useNavigate();

  const data = useMemo<ProcReq[]>(
    () => [
      { id: 'PROC-18', project: 'VT-001', item: 'Thép D16 - 2 tấn', vendor: 'Hòa Phát', amount: 84000000, status: 'submitted' },
      { id: 'PROC-19', project: 'VT-001', item: 'Ván khuôn phủ phim', vendor: 'An Phát', amount: 32000000, status: 'linked-pr' },
      { id: 'PROC-15', project: 'VT-002', item: 'Ống PPR + phụ kiện', vendor: 'Bình Minh', amount: 21000000, status: 'draft' },
    ],
    []
  );

  const badge = (s: ProcReq['status']) => {
    switch (s) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'submitted':
        return <Badge variant="default">Submitted</Badge>;
      case 'linked-pr':
        return <Badge variant="outline">Linked to PR</Badge>;
      case 'done':
        return <Badge variant="secondary">Done</Badge>;
    }
  };

  const fmt = (n: number) => n.toLocaleString('vi-VN') + ' ₫';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Procurement Requests</h1>
          <p className="text-muted-foreground">Liên kết Finance/Payment Requests (mock)</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/finance/payment-requests')}>
          <Wallet className="h-4 w-4" />
          Go to Payment Requests
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Requests</CardTitle>
          <CardDescription>Procurement Requests (liên kết finance) • click để tạo PR (mock)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.map((r, idx) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">{r.id}</Badge>
                    {badge(r.status)}
                    <span className="text-xs text-muted-foreground">Project: {r.project}</span>
                  </div>
                  <div className="font-semibold mt-2 truncate">{r.item}</div>
                  <div className="text-sm text-muted-foreground">Vendor: {r.vendor} • Amount: {fmt(r.amount)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate('/finance/payment-requests')}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Create PR
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    View
                  </Button>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">Mock flow: Procurement → Finance PR → Approval → Paid</div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
