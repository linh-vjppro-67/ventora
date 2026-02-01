import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Filter, Plus, Search, UserPlus } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type IssueStatus = 'open' | 'mitigating' | 'closed';
type Severity = 'low' | 'medium' | 'high';

type Issue = {
  id: string;
  title: string;
  type: 'issue' | 'risk';
  severity: Severity;
  owner: string;
  status: IssueStatus;
};

const severityBadge: Record<Severity, { label: string; variant: 'secondary' | 'default' | 'outline' }> = {
  low: { label: 'Low', variant: 'secondary' },
  medium: { label: 'Medium', variant: 'outline' },
  high: { label: 'High', variant: 'default' },
};

export default function ConstructionIssues() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<IssueStatus | 'all'>('all');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: '', type: 'issue' as const, severity: 'medium' as Severity, owner: 'Minh', note: '' });

  const issues = useMemo<Issue[]>(
    () => [
      { id: 'IR-12', title: 'Chậm vật tư thép cho sàn tầng 3', type: 'risk', severity: 'high', owner: 'Huy', status: 'open' },
      { id: 'IR-14', title: 'Vướng mặt bằng khu vực kho vật tư', type: 'issue', severity: 'medium', owner: 'Minh', status: 'mitigating' },
      { id: 'IR-09', title: 'Thiếu biên bản nghiệm thu giai đoạn', type: 'issue', severity: 'low', owner: 'Trang', status: 'closed' },
    ],
    []
  );

  const filtered = issues
    .filter((i) => filter === 'all' || i.status === filter)
    .filter((i) => {
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return i.id.toLowerCase().includes(q) || i.title.toLowerCase().includes(q) || i.owner.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues / Risks</h1>
          <p className="text-muted-foreground">Theo dõi vấn đề & rủi ro (mock) + assign + update trạng thái</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Issue register</CardTitle>
              <CardDescription>Filters + actions (mock)</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-72 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search..." className="pl-10" />
              </div>
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="mitigating">Mitigating</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
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
                    <Badge variant={i.type === 'risk' ? 'outline' : 'default'}>{i.type === 'risk' ? 'Risk' : 'Issue'}</Badge>
                    <Badge variant={severityBadge[i.severity].variant}>{severityBadge[i.severity].label}</Badge>
                    <span className="text-xs text-muted-foreground">Owner: {i.owner}</span>
                  </div>
                  <div className="font-semibold mt-2 truncate">{i.title}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast({ title: 'Assign (mock)', description: `${i.id} → reassigned` })}
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => toast({ title: 'Update status (mock)', description: `${i.id} → updated` })}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Update
                  </Button>
                </div>
              </div>
              <Separator className="my-3" />
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>Status:</span>
                <Badge variant="outline">{i.status}</Badge>
                <span>• Next action: review mitigation plan (mock)</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">No items.</div>}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create issue/risk (mock)</DialogTitle>
            <DialogDescription>Không lưu DB, chỉ toast để demo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select value={draft.type} onValueChange={(v) => setDraft((p) => ({ ...p, type: v as any }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue">Issue</SelectItem>
                <SelectItem value="risk">Risk</SelectItem>
              </SelectContent>
            </Select>
            <Input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Title" />
            <Select value={draft.severity} onValueChange={(v) => setDraft((p) => ({ ...p, severity: v as Severity }))}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={draft.owner} onValueChange={(v) => setDraft((p) => ({ ...p, owner: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Minh">Minh</SelectItem>
                <SelectItem value="Huy">Huy</SelectItem>
                <SelectItem value="Trang">Trang</SelectItem>
              </SelectContent>
            </Select>
            <Textarea value={draft.note} onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))} placeholder="Notes (mock)" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: 'Created (mock)', description: `${draft.type.toUpperCase()} • ${draft.severity} • ${draft.owner}` });
                setDraft({ title: '', type: 'issue', severity: 'medium', owner: 'Minh', note: '' });
                setOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
