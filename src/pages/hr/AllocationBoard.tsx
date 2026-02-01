import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CalendarDays, Plus, Send, Lock, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHR } from '@/contexts/hr';
import type { AllocationItem, AllocationState } from '@/types/hr';

function stateBadge(s: AllocationState) {
  if (s === 'proposed') return <Badge variant="secondary">Proposed</Badge>;
  if (s === 'approved') return <Badge className="bg-emerald-600">Approved</Badge>;
  return <Badge variant="outline">Locked</Badge>;
}

function getWeekStartFromInput(yyyyMmDd: string) {
  const d = new Date(yyyyMmDd + 'T00:00:00');
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function AllocationBoard() {
  const { employees, projects, allocations, proposeAllocation, updateAllocation, requestApprovalForAllocation } = useHR();
  const [weekAnchor, setWeekAnchor] = useState(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const weekStart = useMemo(() => getWeekStartFromInput(weekAnchor), [weekAnchor]);

  const weekAllocations = useMemo(
    () => allocations.filter((a) => a.weekStart === weekStart),
    [allocations, weekStart]
  );

  const byEmployee = useMemo(() => {
    const map = new Map<string, AllocationItem[]>();
    for (const a of weekAllocations) {
      if (!map.has(a.employeeId)) map.set(a.employeeId, []);
      map.get(a.employeeId)!.push(a);
    }
    return map;
  }, [weekAllocations]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Resource Allocation</h1>
          <p className="text-muted-foreground">Grid theo tuần: người ↔ dự án ↔ % allocation</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <div className="text-xs text-muted-foreground">Week anchor</div>
            <Input type="date" className="h-8" value={weekAnchor} onChange={(e) => setWeekAnchor(e.target.value)} />
          </div>

          <AssignDialog
            onAssign={({ employeeId, projectId, percent }) =>
              proposeAllocation({ employeeId, projectId, percent, weekStart })
            }
            employees={employees}
            projects={projects}
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Allocation Board — tuần bắt đầu {weekStart}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nhân sự</TableHead>
                  <TableHead>Assignments</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((e) => {
                  const items = byEmployee.get(e.id) ?? [];
                  const total = items.reduce((s, x) => s + x.percent, 0);
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">{e.department} • {e.position}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={total > 100 ? 'destructive' : 'secondary'}>Total {total}%</Badge>
                          {total > 100 && <span className="text-xs text-destructive">Over-allocated</span>}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          {items.length === 0 && <div className="text-sm text-muted-foreground">Chưa phân bổ</div>}
                          {items.map((a) => {
                            const p = projects.find((x) => x.id === a.projectId);
                            return (
                              <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border p-2">
                                <div>
                                  <div className="font-medium">{p ? p.name : a.projectId}</div>
                                  <div className="text-xs text-muted-foreground">{a.percent}% • {stateBadge(a.state)}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (a.state === 'locked') {
                                        toast.error('Allocation đang Locked');
                                        return;
                                      }
                                      const next = a.state === 'proposed' ? 'approved' : 'locked';
                                      updateAllocation(a.id, { state: next });
                                      toast.success(`Đã chuyển state: ${next}`);
                                    }}
                                  >
                                    {a.state === 'locked' ? <Lock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => requestApprovalForAllocation(a.id)}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Request approval
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      if (a.state === 'locked') {
                                        toast.error('Không thể unassign khi Locked');
                                        return;
                                      }
                                      updateAllocation(a.id, { percent: 0 });
                                      toast.info('Unassign (mock): set percent = 0');
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <AssignDialog
                          compact
                          defaultEmployeeId={e.id}
                          onAssign={({ employeeId, projectId, percent }) =>
                            proposeAllocation({ employeeId, projectId, percent, weekStart })
                          }
                          employees={employees}
                          projects={projects}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-muted-foreground">
            State: Allocation = <span className="font-medium">Proposed → Approved → Locked</span>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AssignDialog({
  employees,
  projects,
  onAssign,
  compact,
  defaultEmployeeId,
}: {
  employees: any[];
  projects: any[];
  onAssign: (x: { employeeId: string; projectId: string; percent: number }) => void;
  compact?: boolean;
  defaultEmployeeId?: string;
}) {
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId ?? employees?.[0]?.id ?? '');
  const [projectId, setProjectId] = useState(projects?.[0]?.id ?? '');
  const [percent, setPercent] = useState('50');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={compact ? 'sm' : 'default'} variant={compact ? 'outline' : 'default'}>
          <Plus className="h-4 w-4 mr-2" />
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Assign / unassign (mock)</DialogTitle>
          <DialogDescription>Chỉ thao tác UI + state — không có data thật.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhân sự" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn dự án" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 col-span-2">
            <Label>% allocation</Label>
            <Input value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="0..100" />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={() => {
              const p = Math.max(0, Math.min(100, Number(percent || 0)));
              if (!employeeId || !projectId) {
                toast.error('Vui lòng chọn employee + project');
                return;
              }
              onAssign({ employeeId, projectId, percent: p });
            }}
          >
            Assign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
