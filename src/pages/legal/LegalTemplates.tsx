import { useMemo, useState } from 'react';
import { FileText, Folder, FolderOpen, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type DocItem = {
  id: string;
  name: string;
  category: 'Tender' | 'Contract' | 'Legal' | 'Policy';
  updatedAt: string;
  owner: string;
};

const folders = [
  { id: 'all', label: 'Tất cả' },
  { id: 'tender', label: 'Mẫu thầu' },
  { id: 'contract', label: 'Mẫu hợp đồng' },
  { id: 'legal', label: 'Biểu mẫu pháp chế' },
  { id: 'policy', label: 'Chính sách / Quy định' },
];

const docsSeed: DocItem[] = [
  { id: 'd1', name: '01_Tender_Cover_Letter.docx', category: 'Tender', updatedAt: '2025-12-10', owner: 'P. Pháp chế' },
  { id: 'd2', name: '02_Bid_Bond_Template.docx', category: 'Tender', updatedAt: '2025-11-30', owner: 'P. Pháp chế' },
  { id: 'd3', name: '03_Main_Contract_Template.docx', category: 'Contract', updatedAt: '2025-12-28', owner: 'P. Pháp chế' },
  { id: 'd4', name: '04_Subcontract_Template.docx', category: 'Contract', updatedAt: '2025-10-05', owner: 'P. Pháp chế' },
  { id: 'd5', name: '05_Legal_Memo_Template.docx', category: 'Legal', updatedAt: '2025-09-12', owner: 'P. Pháp chế' },
  { id: 'd6', name: '06_Approval_Checklist.pdf', category: 'Policy', updatedAt: '2025-12-01', owner: 'BOD' },
];

export default function LegalTemplates() {
  const { toast } = useToast();
  const [folder, setFolder] = useState<(typeof folders)[number]['id']>('all');
  const [q, setQ] = useState('');
  const [docs, setDocs] = useState<DocItem[]>(docsSeed);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return docs
      .filter((d) => {
        if (folder === 'all') return true;
        if (folder === 'tender') return d.category === 'Tender';
        if (folder === 'contract') return d.category === 'Contract';
        if (folder === 'legal') return d.category === 'Legal';
        if (folder === 'policy') return d.category === 'Policy';
        return true;
      })
      .filter((d) => (query === '' ? true : d.name.toLowerCase().includes(query)))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [docs, folder, q]);

  const uploadMock = () => {
    const next = {
      id: `d${docs.length + 1}`,
      name: `NEW_Template_${docs.length + 1}.docx`,
      category: 'Legal' as const,
      updatedAt: new Date().toISOString().slice(0, 10),
      owner: 'Bạn',
    };
    setDocs((prev) => [next, ...prev]);
    toast({ title: 'Upload', description: `Mock: đã thêm ${next.name}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Templates</h1>
          <p className="text-muted-foreground">Kho tài liệu (DMS) cho Pháp chế & Đấu thầu</p>
        </div>
        <Button className="gap-2" onClick={uploadMock}>
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Folder */}
        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-2">
              Thư mục
            </div>
            {folders.map((f) => {
              const active = folder === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFolder(f.id)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
                    active ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50 text-foreground'
                  )}
                >
                  {active ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
                  <span className="flex-1 text-left">{f.label}</span>
                  <Badge variant="secondary" className="h-5">
                    {f.id === 'all'
                      ? docs.length
                      : filtered.filter((d) => {
                          if (f.id === 'tender') return d.category === 'Tender';
                          if (f.id === 'contract') return d.category === 'Contract';
                          if (f.id === 'legal') return d.category === 'Legal';
                          if (f.id === 'policy') return d.category === 'Policy';
                          return true;
                        }).length}
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Tìm tài liệu..."
                  className="pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left font-semibold p-3">Tên tài liệu</th>
                    <th className="text-left font-semibold p-3">Nhóm</th>
                    <th className="text-left font-semibold p-3">Cập nhật</th>
                    <th className="text-left font-semibold p-3">Owner</th>
                    <th className="text-right font-semibold p-3">&nbsp;</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.id} className="border-b hover:bg-muted/40">
                      <td className="p-3 min-w-[360px]">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{d.name}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{d.category}</Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">{new Date(d.updatedAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-3 whitespace-nowrap">{d.owner}</td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast({ title: 'Open', description: `Mock: mở ${d.name}` })}
                        >
                          Mở
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">Không có tài liệu.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
