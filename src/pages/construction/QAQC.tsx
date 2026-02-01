import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, Filter, Search, ShieldCheck, Upload } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type InspectionStatus = 'draft' | 'requested' | 'scheduled' | 'passed' | 'failed';

type Inspection = {
  id: string;
  workPackage: string;
  inspector: string;
  date: string;
  status: InspectionStatus;
};

const meta: Record<InspectionStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Draft', variant: 'secondary' },
  requested: { label: 'Requested', variant: 'outline' },
  scheduled: { label: 'Scheduled', variant: 'default' },
  passed: { label: 'Passed', variant: 'default' },
  failed: { label: 'Failed', variant: 'secondary' },
};

export default function ConstructionQAQC() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<InspectionStatus | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ workPackage: '1.2 Dầm + Sàn tầng 3', inspector: 'QA/QC', note: '' });

  const inspections = useMemo<Inspection[]>(
    () => [
      { id: 'INS-101', workPackage: '1.2 Dầm + Sàn tầng 3', inspector: 'QA/QC', date: '02/02/2026', status: 'requested' },
      { id: 'INS-099', workPackage: '1.1 Cọc + Móng', inspector: 'Client', date: '01/29/2026', status: 'passed' },
    ],
    []
  );

  const filtered = inspections
    .filter((i) => filter === 'all' || i.status === filter)
    .filter((i) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return i.id.toLowerCase().includes(q) || i.workPackage.toLowerCase().includes(q) || i.inspector.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">QA/QC & Inspections</h1>
          <p className="text-muted-foreground">Danh sách nghiệm thu/kiểm tra (mock) + request inspection + upload evidence (mock)</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <ClipboardCheck className="h-4 w-4" />
          Request inspection
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Inspections</CardTitle>
              <CardDescription>Filters + actions (mock)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-72 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inspection..." className="pl-10" />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="requested">Requested</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.map((i, idx) => (
            <motion.div
              key={i.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className="rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">{i.id}</Badge>
                    <Badge variant={meta[i.status].variant}>{meta[i.status].label}</Badge>
                    <span className="text-xs text-muted-foreground">{i.date}</span>
                  </div>
                  <div className="font-semibold mt-2 truncate">{i.workPackage}</div>
                  <div className="text-sm text-muted-foreground">Inspector: {i.inspector}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast({ title: 'Upload evidence (mock)', description: `${i.id} → attached mock` })}
                  >
                    <Upload className="h-4 w-4" />
                    Evidence
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => toast({ title: 'Mark passed (mock)', description: `${i.id} → Passed` })}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="text-xs text-muted-foreground">Checklist (mock): rebar, formwork, concrete slump, photo evidence…</div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">No inspections.</div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request inspection (mock)</DialogTitle>
            <DialogDescription>Gửi yêu cầu nghiệm thu/kiểm tra, tạo record mock.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={draft.workPackage} onValueChange={(v) => setDraft((p) => ({ ...p, workPackage: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Work package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1.2 Dầm + Sàn tầng 3">1.2 Dầm + Sàn tầng 3</SelectItem>
                <SelectItem value="2.1 Điện (Electrical)">2.1 Điện (Electrical)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={draft.inspector} onValueChange={(v) => setDraft((p) => ({ ...p, inspector: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Inspector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QA/QC">QA/QC</SelectItem>
                <SelectItem value="Client">Client/Consultant</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} placeholder="Note (mock)" />
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium flex items-center gap-2"><Upload className="h-4 w-4" />Evidence</div>
              <div className="text-xs text-muted-foreground">Chọn file để demo UI, nhưng hệ thống sẽ gắn asset mock.</div>
              <Separator className="my-3" />
              <Input type="file" multiple />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: 'Inspection requested (mock)', description: `${draft.workPackage} → ${draft.inspector}` });
                setDraft({ workPackage: '1.2 Dầm + Sàn tầng 3', inspector: 'QA/QC', note: '' });
                setOpen(false);
              }}
            >
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
