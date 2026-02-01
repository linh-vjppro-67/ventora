import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, Search, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockContracts, formatCurrency } from '@/data/mockData';
import type { Contract, ContractStatus } from '@/types';

const statusPill: Record<ContractStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-slate-100 text-slate-700' },
  'legal-review': { label: 'Legal Review', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', cls: 'bg-blue-100 text-blue-700' },
  signed: { label: 'Signed', cls: 'bg-indigo-100 text-indigo-700' },
  active: { label: 'Active', cls: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', cls: 'bg-zinc-100 text-zinc-700' },
};

export default function ContractList() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return mockContracts
      .filter((c) =>
        query === '' ? true : `${c.code} ${c.name} ${c.client}`.toLowerCase().includes(query)
      )
      .sort((a, b) => (a.code < b.code ? 1 : -1));
  }, [q]);

  const open = (c: Contract) => navigate(`/legal/contracts/${c.id}`);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hợp đồng</h1>
          <p className="text-muted-foreground">Danh sách hợp đồng (List)</p>
        </div>
        <Button className="gap-2">
          <FileCheck className="h-4 w-4" />
          Tạo hợp đồng
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã, tên, đối tác..."
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
                  <th className="text-left font-semibold p-3">Tên hợp đồng</th>
                  <th className="text-left font-semibold p-3">Đối tác</th>
                  <th className="text-left font-semibold p-3">Giá trị</th>
                  <th className="text-left font-semibold p-3">Trạng thái</th>
                  <th className="text-left font-semibold p-3">Thời hạn</th>
                  <th className="text-right font-semibold p-3">&nbsp;</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b hover:bg-muted/40 cursor-pointer"
                    onClick={() => open(c)}
                  >
                    <td className="p-3 whitespace-nowrap font-medium">{c.code}</td>
                    <td className="p-3 min-w-[320px]">
                      <div className="font-medium line-clamp-1">{c.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Type: {c.type} • Project: {c.projectId}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">{c.client}</td>
                    <td className="p-3 whitespace-nowrap font-semibold">{formatCurrency(c.value)}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusPill[c.status].cls}`}
                      >
                        {statusPill[c.status].label}
                      </span>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {new Date(c.startDate).toLocaleDateString('vi-VN')} →{' '}
                      {new Date(c.endDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="sm" onClick={(e) => (e.stopPropagation(), open(c))}>
                        Mở
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">Không tìm thấy hợp đồng phù hợp.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
