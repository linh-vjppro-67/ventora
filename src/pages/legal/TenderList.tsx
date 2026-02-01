import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Gavel, Search, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PriorityBadge } from '@/components/common/PriorityBadge';
import { mockTenders, formatCurrency } from '@/data/mockData';
import type { Tender, TenderStatus } from '@/types';

const statusPill: Record<TenderStatus, { label: string; cls: string }> = {
  lead: { label: 'Draft', cls: 'bg-slate-100 text-slate-700' },
  preparation: { label: 'In Review', cls: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'Submitted', cls: 'bg-indigo-100 text-indigo-700' },
  negotiating: { label: 'Negotiating', cls: 'bg-blue-100 text-blue-700' },
  won: { label: 'Won', cls: 'bg-emerald-100 text-emerald-700' },
  lost: { label: 'Lost', cls: 'bg-rose-100 text-rose-700' },
};

export default function TenderList() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return mockTenders
      .filter((t) =>
        query === ''
          ? true
          : `${t.code} ${t.name} ${t.client} ${t.owner}`.toLowerCase().includes(query)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [q]);

  const openInPipeline = (t: Tender) => {
    navigate(`/legal/tenders/pipeline?tender=${encodeURIComponent(t.id)}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hồ sơ thầu</h1>
          <p className="text-muted-foreground">Danh sách hồ sơ thầu (List)</p>
        </div>
        <Button className="gap-2">
          <Gavel className="h-4 w-4" />
          Tạo hồ sơ thầu
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã, tên, khách hàng, owner..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left font-semibold p-3">Mã</th>
                  <th className="text-left font-semibold p-3">Tên hồ sơ</th>
                  <th className="text-left font-semibold p-3">Khách hàng</th>
                  <th className="text-left font-semibold p-3">Giá trị</th>
                  <th className="text-left font-semibold p-3">Deadline</th>
                  <th className="text-left font-semibold p-3">Trạng thái</th>
                  <th className="text-left font-semibold p-3">Owner</th>
                  <th className="text-right font-semibold p-3">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b hover:bg-muted/40 cursor-pointer"
                    onClick={() => openInPipeline(t)}
                  >
                    <td className="p-3 whitespace-nowrap font-medium">{t.code}</td>
                    <td className="p-3 min-w-[320px]">
                      <div className="font-medium line-clamp-1">{t.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Docs: {t.documents} • Created: {new Date(t.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">{t.client}</td>
                    <td className="p-3 whitespace-nowrap font-semibold">{formatCurrency(t.value)}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(t.deadline).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill[t.status].cls}`}>
                        {statusPill[t.status].label}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                          {t.owner
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate">{t.owner}</div>
                          <div className="mt-0.5">
                            <PriorityBadge priority={t.priority} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={(e) => (e.stopPropagation(), openInPipeline(t))}>
                        Mở
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">
              Không tìm thấy hồ sơ phù hợp.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
