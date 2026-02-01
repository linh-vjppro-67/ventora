import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  UserPlus,
  Upload,
  ClipboardCheck,
  Search,
  Filter,
  FolderTree,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

type WorkPackageStatus = 'not-started' | 'in-progress' | 'pending-inspection' | 'accepted' | 'closed';

type WBSNode = {
  id: string;
  code: string;
  name: string;
  owner: string;
  planned: string;
  actual: string;
  status: WorkPackageStatus;
  children?: WBSNode[];
};

const statusMeta: Record<WorkPackageStatus, { label: string; variant: 'secondary' | 'default' | 'outline' }>
  = {
    'not-started': { label: 'Not started', variant: 'secondary' },
    'in-progress': { label: 'In progress', variant: 'default' },
    'pending-inspection': { label: 'Pending inspection', variant: 'outline' },
    accepted: { label: 'Accepted', variant: 'default' },
    closed: { label: 'Closed', variant: 'secondary' },
  };

function StatusChip({ status }: { status: WorkPackageStatus }) {
  const m = statusMeta[status];
  return <Badge variant={m.variant}>{m.label}</Badge>;
}

function flatten(nodes: WBSNode[], expanded: Record<string, boolean>, depth = 0): Array<{ node: WBSNode; depth: number }>
{
  const out: Array<{ node: WBSNode; depth: number }> = [];
  for (const n of nodes) {
    out.push({ node: n, depth });
    if (n.children?.length && expanded[n.id]) {
      out.push(...flatten(n.children, expanded, depth + 1));
    }
  }
  return out;
}

export default function ConstructionWBS() {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkPackageStatus | 'all'>('all');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ '1': true, '1.1': true });

  const [createOpen, setCreateOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [inspectOpen, setInspectOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: 'Minh' });
  const [assignee, setAssignee] = useState('Trang');
  const [evidence, setEvidence] = useState<{ name: string; preview: string } | null>(null);

  const data = useMemo<WBSNode[]>(
    () => [
      {
        id: '1',
        code: '1',
        name: 'Kết cấu (Structure)',
        owner: 'Minh',
        planned: '02/2026',
        actual: '-',
        status: 'in-progress',
        children: [
          {
            id: '1.1',
            code: '1.1',
            name: 'Cọc + Móng',
            owner: 'Huy',
            planned: '02/2026',
            actual: '02/2026',
            status: 'accepted',
          },
          {
            id: '1.2',
            code: '1.2',
            name: 'Dầm + Sàn tầng 3',
            owner: 'Minh',
            planned: '02/2026',
            actual: '-',
            status: 'pending-inspection',
          },
        ],
      },
      {
        id: '2',
        code: '2',
        name: 'MEP',
        owner: 'Trang',
        planned: '03/2026',
        actual: '-',
        status: 'not-started',
        children: [
          {
            id: '2.1',
            code: '2.1',
            name: 'Điện (Electrical)',
            owner: 'Trang',
            planned: '03/2026',
            actual: '-',
            status: 'not-started',
          },
          {
            id: '2.2',
            code: '2.2',
            name: 'Nước (Plumbing)',
            owner: 'Trang',
            planned: '03/2026',
            actual: '-',
            status: 'not-started',
          },
        ],
      },
      {
        id: '3',
        code: '3',
        name: 'Hoàn thiện (Finishing)',
        owner: 'An',
        planned: '04/2026',
        actual: '-',
        status: 'not-started',
      },
    ],
    []
  );

  const rows = useMemo(() => {
    const flat = flatten(data, expanded);
    return flat
      .filter(({ node }) => {
        if (statusFilter === 'all') return true;
        return node.status === statusFilter;
      })
      .filter(({ node }) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
          node.code.toLowerCase().includes(q) ||
          node.name.toLowerCase().includes(q) ||
          node.owner.toLowerCase().includes(q)
        );
      });
  }, [data, expanded, query, statusFilter]);

  const openFor = (id: string, which: 'create' | 'assign' | 'upload' | 'inspect') => {
    setActiveId(id);
    if (which === 'create') setCreateOpen(true);
    if (which === 'assign') setAssignOpen(true);
    if (which === 'upload') setUploadOpen(true);
    if (which === 'inspect') setInspectOpen(true);
  };

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const mockUpload = () => {
    // intentionally use a fixed mock evidence asset, but still allow selecting a file name
    setEvidence({ name: evidence?.name || 'evidence.mock', preview: '/mock-invoice.svg' });
    toast({ title: 'Evidence uploaded (mock)', description: 'File được lưu mock (không dùng dữ liệu thật).' });
    setUploadOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WBS / Work Packages</h1>
          <p className="text-muted-foreground">Tree table (WBS code, name, owner, planned/actual, status) + actions (mock)</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          Create task
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Work Packages</CardTitle>
              <CardDescription>State: Not started → In progress → Pending inspection → Accepted → Closed</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-72 max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search WBS..." className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="not-started">Not started</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="pending-inspection">Pending inspection</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">WBS code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-[140px]">Owner</TableHead>
                <TableHead className="w-[160px]">Planned/Actual</TableHead>
                <TableHead className="w-[180px]">Status</TableHead>
                <TableHead className="w-[320px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(({ node, depth }, idx) => {
                const hasChildren = !!node.children?.length;
                return (
                  <motion.tr
                    key={node.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.01 }}
                    className="border-b"
                  >
                    <TableCell className="font-mono">{node.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2" style={{ paddingLeft: depth * 14 }}>
                        {hasChildren ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggle(node.id)}
                            aria-label="toggle"
                          >
                            {expanded[node.id] ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <span className="h-7 w-7 inline-flex items-center justify-center text-muted-foreground">
                            <FolderTree className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium truncate">{node.name}</div>
                          <div className="text-xs text-muted-foreground">{depth === 0 ? 'WBS level 1' : 'Work package'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{node.owner}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div><span className="text-muted-foreground">P:</span> {node.planned}</div>
                        <div><span className="text-muted-foreground">A:</span> {node.actual}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StatusChip status={node.status} />
                        <Select
                          value={node.status}
                          onValueChange={(v) => {
                            toast({ title: 'State updated (mock)', description: `${node.code}: ${statusMeta[node.status].label} → ${statusMeta[v as WorkPackageStatus].label}` });
                          }}
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="not-started">Not started</SelectItem>
                            <SelectItem value="in-progress">In progress</SelectItem>
                            <SelectItem value="pending-inspection">Pending inspection</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => openFor(node.id, 'create')}>
                          <Plus className="h-4 w-4" />
                          Task
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => openFor(node.id, 'assign')}>
                          <UserPlus className="h-4 w-4" />
                          Assign
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => openFor(node.id, 'upload')}>
                          <Upload className="h-4 w-4" />
                          Evidence
                        </Button>
                        <Button size="sm" className="gap-2" onClick={() => openFor(node.id, 'inspect')}>
                          <ClipboardCheck className="h-4 w-4" />
                          Request inspection
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                );
              })}
            </TableBody>
          </Table>

          {rows.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">No matching work packages.</div>
          )}
        </CardContent>
      </Card>

      {/* Create task */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create task (mock)</DialogTitle>
            <DialogDescription>
              {activeId ? `For: ${activeId}` : 'Tạo task nhanh (không lưu DB).'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input value={newTask.title} onChange={(e) => setNewTask((p) => ({ ...p, title: e.target.value }))} placeholder="Task title" />
            <Textarea value={newTask.description} onChange={(e) => setNewTask((p) => ({ ...p, description: e.target.value }))} placeholder="Description" />
            <Select value={newTask.assignee} onValueChange={(v) => setNewTask((p) => ({ ...p, assignee: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Minh">Minh (Site lead)</SelectItem>
                <SelectItem value="Huy">Huy (QS)</SelectItem>
                <SelectItem value="Trang">Trang (QAQC)</SelectItem>
                <SelectItem value="An">An (Subcontractor)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: 'Task created (mock)', description: `${newTask.title || 'Untitled'} → ${newTask.assignee}` });
                setNewTask({ title: '', description: '', assignee: 'Minh' });
                setCreateOpen(false);
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign owner (mock)</DialogTitle>
            <DialogDescription>{activeId ? `Work package: ${activeId}` : 'Chọn người phụ trách.'}</DialogDescription>
          </DialogHeader>
          <Select value={assignee} onValueChange={setAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Minh">Minh</SelectItem>
              <SelectItem value="Huy">Huy</SelectItem>
              <SelectItem value="Trang">Trang</SelectItem>
              <SelectItem value="An">An</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: 'Assigned (mock)', description: `${activeId || 'Item'} → ${assignee}` });
                setAssignOpen(false);
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload evidence */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload evidence (mock)</DialogTitle>
            <DialogDescription>
              Upload được để demo UI, nhưng hệ thống sẽ gắn ảnh mock cố định.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium">Selected file (optional)</div>
              <div className="text-xs text-muted-foreground">Tên file chỉ để hiển thị, không dùng dữ liệu thật.</div>
              <Separator className="my-3" />
              <Input type="file" onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setEvidence({ name: f.name, preview: '/mock-invoice.svg' });
              }} />
            </div>
            {evidence && (
              <div className="rounded-lg border p-3">
                <div className="text-sm font-medium">Preview (mock)</div>
                <div className="text-xs text-muted-foreground mb-2">{evidence.name}</div>
                <img
                  src={evidence.preview}
                  alt="mock evidence"
                  className="w-full h-44 object-cover rounded-md"
                  onError={(e) => {
                    // fallback if public asset is missing
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="text-xs text-muted-foreground mt-2">Nếu không có asset, preview sẽ ẩn. Vẫn upload mock bình thường.</div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button className="gap-2" onClick={mockUpload}>
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request inspection */}
      <Dialog open={inspectOpen} onOpenChange={setInspectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request inspection (mock)</DialogTitle>
            <DialogDescription>{activeId ? `Work package: ${activeId}` : 'Gửi yêu cầu nghiệm thu/kiểm tra.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Select defaultValue="QAQC">
              <SelectTrigger>
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QAQC">QA/QC team</SelectItem>
                <SelectItem value="Client">Client/Consultant</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Ghi chú (mock)" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInspectOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                toast({ title: 'Inspection requested (mock)', description: `${activeId || 'Work package'} → Pending inspection` });
                setInspectOpen(false);
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
