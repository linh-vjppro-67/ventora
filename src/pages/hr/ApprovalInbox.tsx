import { useMemo, useState } from 'react';
import { Check, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useHR } from '@/contexts/hr';

export default function HRApprovalInbox() {
  const { approvals, allocations, employees, projects, actOnApproval } = useHR();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const items = useMemo(() => {
    const list = statusFilter === 'all' ? approvals : approvals.filter((a) => a.status === statusFilter);
    return list;
  }, [approvals, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Approval Inbox</h1>
          <p className="text-muted-foreground">Tập trung các yêu cầu duyệt của HR — demo UI.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="h-8 w-[160px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Danh sách duyệt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Requested by</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((a) => {
                  const alloc = a.type === 'allocation' ? allocations.find((x) => x.id === a.refId) : undefined;
                  const emp = alloc ? employees.find((e) => e.id === alloc.employeeId) : undefined;
                  const prj = alloc ? projects.find((p) => p.id === alloc.projectId) : undefined;
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Badge variant="outline">{a.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{a.title}</TableCell>
                      <TableCell>
                        {alloc ? (
                          <div>
                            <div className="font-medium">{emp?.name} → {prj?.name}</div>
                            <div className="text-xs text-muted-foreground">{alloc.percent}% • Week {alloc.weekStart} • State {alloc.state}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{a.requestedBy}</div>
                        <div className="text-xs text-muted-foreground">{new Date(a.requestedAt).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        {a.status === 'pending' && <Badge>Pending</Badge>}
                        {a.status === 'approved' && <Badge className="bg-emerald-600">Approved</Badge>}
                        {a.status === 'rejected' && <Badge variant="destructive">Rejected</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="secondary" disabled={a.status !== 'pending'} onClick={() => actOnApproval(a.id, 'approve')}>
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" disabled={a.status !== 'pending'} onClick={() => actOnApproval(a.id, 'reject')}>
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      Không có items phù hợp filter
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
