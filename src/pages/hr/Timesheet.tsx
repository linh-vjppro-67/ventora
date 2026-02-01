import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Calendar, Clock, Plus, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHR } from '@/contexts/hr';

type TSStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface TimesheetRow {
  id: string;
  employeeId: string;
  date: string;
  projectId: string;
  hours: number;
  note?: string;
  status: TSStatus;
}

function statusBadge(s: TSStatus) {
  if (s === 'draft') return <Badge variant="secondary">Draft</Badge>;
  if (s === 'submitted') return <Badge>Submitted</Badge>;
  if (s === 'approved') return <Badge className="bg-emerald-600">Approved</Badge>;
  return <Badge variant="destructive">Rejected</Badge>;
}

export default function Timesheet() {
  const { employees, projects } = useHR();
  const [rows, setRows] = useState<TimesheetRow[]>(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const date = `${yyyy}-${mm}-${dd}`;
    return [
      {
        id: 'ts-001',
        employeeId: employees[0]?.id ?? 'emp-001',
        projectId: projects[0]?.id ?? 'proj-001',
        date,
        hours: 8,
        note: 'Công việc hiện trường (mock)',
        status: 'draft',
      },
    ];
  });

  const totalHours = useMemo(() => rows.reduce((s, r) => s + r.hours, 0), [rows]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Timesheet / Chấm công</h1>
          <p className="text-muted-foreground">Demo UI: nhập giờ theo ngày/dự án và submit duyệt.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth() + 1).padStart(2, '0');
              const dd = String(today.getDate()).padStart(2, '0');
              setRows((prev) => [
                {
                  id: `ts-${Math.random().toString(16).slice(2, 6)}`,
                  employeeId: employees[0]?.id ?? 'emp-001',
                  projectId: projects[0]?.id ?? 'proj-001',
                  date: `${yyyy}-${mm}-${dd}`,
                  hours: 8,
                  status: 'draft',
                },
                ...prev,
              ]);
              toast.success('Đã tạo dòng timesheet (Draft)');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add row
          </Button>

          <Button
            onClick={() => {
              setRows((prev) => prev.map((r) => (r.status === 'draft' ? { ...r, status: 'submitted' } : r)));
              toast.success('Đã submit timesheet vào Approval Inbox (mock)');
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            Submit approval
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Timesheet entries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary">
              <Clock className="h-3.5 w-3.5 mr-1" /> Total {totalHours}h
            </Badge>
            <Badge variant="outline">
              <Calendar className="h-3.5 w-3.5 mr-1" /> {rows.length} rows
            </Badge>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="w-[120px]">Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  const prj = projects.find((p) => p.id === r.projectId);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <Input
                          type="date"
                          value={r.date}
                          onChange={(e) => setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, date: e.target.value } : x)))}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.employeeId}
                          onValueChange={(v) => setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, employeeId: v } : x)))}
                        >
                          <SelectTrigger className="h-8">
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
                        <div className="text-xs text-muted-foreground mt-1">{emp?.department}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={r.projectId}
                          onValueChange={(v) => setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, projectId: v } : x)))}
                        >
                          <SelectTrigger className="h-8">
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
                        <div className="text-xs text-muted-foreground mt-1">{prj?.code}</div>
                      </TableCell>
                      <TableCell>
                        <Input
                          value={String(r.hours)}
                          onChange={(e) => {
                            const h = Math.max(0, Math.min(24, Number(e.target.value || 0)));
                            setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, hours: h } : x)));
                          }}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>{statusBadge(r.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
