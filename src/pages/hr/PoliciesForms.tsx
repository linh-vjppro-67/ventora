import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FileText, FolderOpen, Upload, Download, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type DocType = 'Policy' | 'Form' | 'Template';

interface DocItem {
  id: string;
  name: string;
  type: DocType;
  updatedAt: string;
  owner: string;
}

const seed: DocItem[] = [
  { id: 'd-001', name: 'Nội quy công ty (v1.2)', type: 'Policy', updatedAt: '2025-11-02', owner: 'HC' },
  { id: 'd-002', name: 'Mẫu đơn xin nghỉ phép', type: 'Form', updatedAt: '2025-09-18', owner: 'HR' },
  { id: 'd-003', name: 'Mẫu hợp đồng lao động (mock)', type: 'Template', updatedAt: '2025-12-20', owner: 'Pháp chế' },
];

export default function PoliciesForms() {
  const [docs, setDocs] = useState<DocItem[]>(seed);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return docs;
    return docs.filter((d) => [d.name, d.type, d.owner].some((x) => x.toLowerCase().includes(query)));
  }, [docs, q]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Policies &amp; Forms (DMS)</h1>
          <p className="text-muted-foreground">Kho tài liệu nhân sự/hành chính (UI demo).</p>
        </div>
        <Button
          onClick={() => {
            setDocs((prev) => [
              {
                id: `d-${Math.random().toString(16).slice(2, 6)}`,
                name: 'File mới upload (mock).pdf',
                type: 'Form',
                updatedAt: new Date().toISOString().slice(0, 10),
                owner: 'HR',
              },
              ...prev,
            ]);
            toast.success('Đã upload tài liệu (mock)');
          }}
        >
          <Upload className="h-4 w-4 mr-2" /> Upload (mock)
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Document list</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên / loại / owner" className="pl-10" />
            </div>
            <Badge variant="secondary">{filtered.length} files</Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {d.type === 'Policy' ? (
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        {d.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{d.type}</Badge>
                    </TableCell>
                    <TableCell>{d.owner}</TableCell>
                    <TableCell className="font-mono text-xs">{d.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => toast.info('Open file (mock)')}>Open</Button>
                      <Button
                        size="sm"
                        className="ml-2"
                        variant="secondary"
                        onClick={() => toast.success('Đã download (mock)')}
                      >
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                      Không có tài liệu
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
